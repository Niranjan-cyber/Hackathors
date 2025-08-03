import asyncio
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
import json

# --- Import your actual MCQ generation function ---
try:
    from backend.app.models.mcq_generation.mcq_generator import main as generate_questions_from_model
except ImportError as e:
    print(f"CRITICAL: Could not import the model generation function: {e}")
    print("Using a dummy function. The API will run but generation will fail.")
    # This dummy function allows the server to start even if the import fails.
    def generate_questions_from_model(*args, **kwargs):
        return None

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
    file: UploadFile = File(...),
    topics: str = Form(...),         # JSON string or comma-separated
    difficulty: str = Form(...),
    num_questions: int = Form(...)
):
    """
    Generates and returns a list of questions by calling the local MCQ generation model.
    Accepts a file and other parameters as form data.

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
    # Read the file content
    file_content = await file.read()
    # TODO: Extract text from file_content (PDF, DOCX, etc.)
    # For now, use placeholder text
    extracted_text = CONTEXT_TEXT

    # Parse topics (try JSON, fallback to comma-separated)
    try:
        topics_list = json.loads(topics)
        if not isinstance(topics_list, list):
            raise ValueError
    except Exception:
        topics_list = [t.strip() for t in topics.split(',') if t.strip()]

    model_input = {
        "text": extracted_text,
        "topics": topics_list,
        "difficulty": difficulty,
        "num_questions": num_questions
    }

    for attempt in range(MAX_TRIES):
        log(f"Generation attempt {attempt + 1}/{MAX_TRIES}")
        try:
            generated_questions = generate_questions_from_model(model_input)
            if isinstance(generated_questions, list) and generated_questions:
                log("Successfully generated questions from the local model.")
                # Return the list of question objects directly
                return generated_questions
            else:
                log(f"Model returned an invalid or empty response: {generated_questions}. Retrying...")
        except Exception as e:
            log(f"An error occurred while calling the generation model: {e}")
        await asyncio.sleep(1)

    log("Failed to get a valid response from the model after multiple attempts.")
    raise HTTPException(
        status_code=500,
        detail="The question generation model failed to produce a valid response."
    )
