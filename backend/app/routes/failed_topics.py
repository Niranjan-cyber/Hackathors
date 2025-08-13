import json
from fastapi import APIRouter, HTTPException, Form
from app.services.failed_topics.generate_additional import generate_mcqs

# --- Router Initialization ---
router = APIRouter()

def log(text: str):
    """Simple logger to print messages to the console."""
    print(f"INFO: {__name__} - {text}")

@router.post("/generate-failed-topics-questions/")
def generate_failed_topics_questions(
    failed_topics: str = Form(...),  # JSON string of failed topics
    num_questions_per_topic: int = Form(default=3)
):
    """
    Generates questions for failed topics using the existing generate_mcqs function.
    
    Args:
        failed_topics (str): JSON string containing list of failed topics
        num_questions_per_topic (int): Number of questions to generate per topic
        
    Returns:
        List of question objects
    """
    try:
        # Parse failed topics
        topics_list = json.loads(failed_topics)
        if not isinstance(topics_list, list):
            raise ValueError("failed_topics must be a JSON array")
        
        if not topics_list:
            raise HTTPException(status_code=400, detail="No failed topics provided")
        
        log(f"Generating questions for {len(topics_list)} failed topics")
        
        all_questions = []
        
        for topic in topics_list:
            log(f"Generating {num_questions_per_topic} questions for topic: {topic}")
            questions = generate_mcqs(topic, num_questions_per_topic)
            
            if questions:
                # Add unique IDs to questions
                for i, question in enumerate(questions):
                    question['id'] = f"failed_{topic}_{i}_{len(all_questions)}"
                
                all_questions.extend(questions)
            else:
                log(f"Failed to generate questions for topic: {topic}")
        
        if not all_questions:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate any questions for the provided topics"
            )
        
        log(f"Successfully generated {len(all_questions)} questions for failed topics")
        return all_questions
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for failed_topics")
    except HTTPException:
        raise
    except Exception as e:
        log(f"An error occurred while generating failed topics questions: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during question generation: {str(e)}"
        )
