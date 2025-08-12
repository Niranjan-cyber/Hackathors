import json
from fastapi import APIRouter, HTTPException, Form

# --- Router Initialization ---
router = APIRouter()

def log(text: str):
    """Simple logger to print messages to the console."""
    print(f"INFO: {__name__} - {text}")

@router.post("/translate-questions/")
def translate_questions(
    questions: str = Form(...),  # JSON string of questions
    target_language: str = Form(...),  # Language code (e.g., "hi", "es", "fr")
):
    """
    No-op translation endpoint. Validates payload and returns questions unchanged.
    Kept to preserve frontend contract while disabling translation logic.
    """
    try:
        questions_list = json.loads(questions)
        if not isinstance(questions_list, list):
            raise ValueError("questions must be a JSON array")
        if not questions_list:
            raise HTTPException(status_code=400, detail="No questions provided")
        log(f"Bypassing translation for {len(questions_list)} questions (target={target_language})")
        return questions_list
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for questions")
    except HTTPException:
        raise
    except Exception as e:
        log(f"Error in no-op translation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during translation")
