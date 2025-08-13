import asyncio
import time
from fastapi import APIRouter, HTTPException, Form
import json
from app.services.mcq_generation import mcq_generator


# --- Router Initialization ---
router = APIRouter()

# --- Configuration ---
VALID_DIFFICULTIES = ["easy", "medium", "hard"]
MIN_QUESTIONS = 1
MAX_QUESTIONS = 50

def log(text: str):
    """Simple logger to print messages to the console."""
    print(f"INFO: {__name__} - {text}")

def validate_input(topics_list: list, difficulty: str, num_questions: int) -> tuple[bool, str]:
    """Validate input parameters and return (is_valid, error_message)."""
    if not topics_list:
        return False, "At least one topic must be provided"
    
    if difficulty.lower() not in VALID_DIFFICULTIES:
        return False, f"Difficulty must be one of: {', '.join(VALID_DIFFICULTIES)}"
    
    if not isinstance(num_questions, int) or num_questions < MIN_QUESTIONS or num_questions > MAX_QUESTIONS:
        return False, f"Number of questions must be between {MIN_QUESTIONS} and {MAX_QUESTIONS}"
    
    return True, ""

# --- API Endpoint ---
@router.post("/generate-questions/")
def generate_questions(
    topics: str = Form(...),         # JSON string or comma-separated
    difficulty: str = Form(...),
    num_questions: int = Form(...),
):
    """
    Generates and returns a list of questions by calling the local MCQ generation model.
    Uses the text previously extracted from the PDF and stored in OCR_text.txt.
    Accepts only topics, difficulty, and num_questions as form data. Translation is handled
    by a separate endpoint.

    Response: List of question objects, each with:
      - question: str
      - options: dict (e.g., {"A": "...", "B": "...", ...})
      - correct_answer: str (e.g., "A")
      - topics: list or str
      - explanation: str

    Example:
    [
      {
        "question": "What is the bias-variance tradeoff?",
        "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
        "correct_answer": "A",
        "topics": ["Bias Variance trade-off"],
        "explanation": "The bias-variance tradeoff is ..."
      },
      ...
    ]
    """
    # Parse topics (try JSON, fallback to comma-separated)
    try:
        topics_list = json.loads(topics)
        if not isinstance(topics_list, list):
            raise ValueError
    except Exception:
        topics_list = [t.strip() for t in topics.split(',') if t.strip()]
    
    # Validate input parameters
    is_valid, error_message = validate_input(topics_list, difficulty, num_questions)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_message)
    
    model_input = {
        "topics": topics_list,
        "difficulty": difficulty.lower(),
        "num_questions": num_questions
    }

    try:
        log(f"Generating {num_questions} questions for topics: {topics_list} with difficulty: {difficulty}")
        log(f"Starting MCQ generation at {time.time()}")
        
        generated_questions = mcq_generator.main(model_input)
        
        log(f"MCQ generation completed at {time.time()}")
        
        if isinstance(generated_questions, list) and generated_questions:
            log(f"Successfully generated {len(generated_questions)} questions from the local model.")
            return generated_questions
        else:
            log(f"Model returned an invalid or empty response: {generated_questions}")
            raise HTTPException(
                status_code=500,
                detail="The question generation model failed to produce a valid response."
            )
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        log(f"An error occurred while calling the generation model: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during question generation: {str(e)}"
        )
