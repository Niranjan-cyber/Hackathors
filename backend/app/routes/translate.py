import json
import sys
import os
from fastapi import APIRouter, HTTPException, Form

# Add the translator service to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services', 'translator'))
from translator import batch_translate_texts

# --- Router Initialization ---
router = APIRouter()

def log(text: str):
    """Simple logger to print messages to the console."""
    print(f"INFO: {__name__} - {text}")

@router.post("/translate-questions/")
def translate_questions(
    questions: str = Form(...),  # JSON string of questions
    target_language: str = Form(...)  # Language code (e.g., "hi", "es", "fr")
):
    """
    Translates a list of questions to the specified language using the existing translator service.
    
    Args:
        questions (str): JSON string containing list of question objects
        target_language (str): Target language code (e.g., "hi" for Hindi, "es" for Spanish)
        
    Returns:
        List of translated question objects
    """
    try:
        # Parse questions
        questions_list = json.loads(questions)
        if not isinstance(questions_list, list):
            raise ValueError("questions must be a JSON array")
        
        if not questions_list:
            raise HTTPException(status_code=400, detail="No questions provided")
        
        log(f"Translating {len(questions_list)} questions to {target_language}")
        
        translated_questions = []
        
        for question in questions_list:
            # Collect all texts that need translation
            texts_to_translate = []
            texts_to_translate.append(question.get("question", ""))
            
            # Add options (Gemini outputs dict format)
            options = question.get("options", {})
            for key in ["A", "B", "C", "D"]:
                if key in options:
                    texts_to_translate.append(options[key])
            
            # Add explanation if it exists
            if "explanation" in question:
                texts_to_translate.append(question["explanation"])
            
            # Translate all texts in batch using the existing translator
            translated_texts = batch_translate_texts(texts_to_translate, target_language)
            
            if translated_texts is None:
                raise HTTPException(status_code=500, detail="Translation service failed")
            
            # Rebuild the question structure
            translated_question = {
                "id": question.get("id", ""),
                "question": translated_texts[0],
                "topics": question.get("topics", []),
                "correct_answer": question.get("correct_answer", "")
            }
            
            # Handle options translation (Gemini outputs dict format)
            translated_question["options"] = {}
            idx = 1
            for key in ["A", "B", "C", "D"]:
                if key in options and idx < len(translated_texts):
                    translated_question["options"][key] = translated_texts[idx]
                    idx += 1
            
            # Add explanation if it was translated
            if "explanation" in question and len(translated_texts) > 5:  # question + 4 options + explanation
                translated_question["explanation"] = translated_texts[5]
            
            translated_questions.append(translated_question)
        
        log(f"Successfully translated {len(translated_questions)} questions to {target_language}")
        return translated_questions
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for questions")
    except HTTPException:
        raise
    except Exception as e:
        log(f"An error occurred while translating questions: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during translation: {str(e)}"
        )
