import asyncio
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
import json
import sys
import os

# --- Import your actual MCQ generation function ---
try:
    # Add the backend directory to Python path
    backend_path = os.path.join(os.path.dirname(__file__), '..', '..')
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)
    
    from app.models.mcq_generation import mcq_generator
    # Test if the module is properly imported
    if not hasattr(mcq_generator, 'main'):
        raise ImportError("mcq_generator module does not have main function")
except ImportError as e:
    print(f"CRITICAL: Could not import the model generation function: {e}")
    print("Using a dummy function. The API will run but generation will fail.")
    # This dummy function allows the server to start even if the import fails.
    def generate_questions_from_model(*args, **kwargs):
        return None
    mcq_generator = None

# --- Router Initialization ---
router = APIRouter(
    prefix="/questions",
    tags=["Question Generation"],
)

# --- Configuration ---
MAX_TRIES = 3
# TODO: Extract context text from the uploaded file. For now, this is a placeholder.
CONTEXT_TEXT = """
The Bias-Variance tradeoff is a fundamental concept in machine learning.
High bias (underfitting) occurs when a model is too simple to capture the underlying
pattern in the data. High variance (overfitting) occurs when a model is too complex
and captures noise instead of the underlying pattern. The goal is to find a balance.
Evaluation metrics are crucial for assessing model performance. For classification,
common metrics include accuracy, precision, recall, and F1-score. For regression,
mean squared error (MSE) and R-squared are often used.
"""

def log(text: str):
    """Simple logger to print messages to the console."""
    print(f"INFO: {__name__} - {text}")

# --- API Endpoint ---
@router.post("/generate_questions/")
async def generate_questions(
    topics: str = Form(...),         # JSON string or comma-separated
    difficulty: str = Form(...),
    num_questions: int = Form(...)
):
    """
    Generates and returns a list of questions by calling the local MCQ generation model.
    Uses the text previously extracted from the PDF and stored in OCR_text.txt.
    Accepts only topics, difficulty, and num_questions as form data.

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
    
    model_input = {
        "topics": topics_list,
        "difficulty": difficulty,
        "num_questions": num_questions
    }


    try:
        if mcq_generator is None:
            raise Exception("mcq_generator module not available")
        generated_questions = mcq_generator.main(model_input)
        if isinstance(generated_questions, list) and generated_questions:
            log("Successfully generated questions from the local model.")
            # Return the list of question objects directly
            return generated_questions
        else:
            log(f"Model returned an invalid or empty response: {generated_questions}")
            raise HTTPException(
                status_code=500,
                detail="The question generation model failed to produce a valid response."
            )
    except Exception as e:
        log(f"An error occurred while calling the generation model: {e}")
        raise HTTPException(
            status_code=500,
            detail="The question generation model failed to produce a valid response."
        )
