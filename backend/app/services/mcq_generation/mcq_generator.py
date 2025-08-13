from .prompt import prompt_func
import requests
import json
import time
import random
from .retrieval import main as retrieve_context


# Input response format:
#    {
#         "topics": {topic: description} ,
#         "num_questions": ... ,
#         "difficulty": ...
#    }


# Constants
TIMEOUT = 200
MAX_TRIES = 3
MODEL_NAME = "llama3.1"
OLLAMA_URL = "http://localhost:11434/api/generate"
CHUNKS_PER_Q = {
    "easy": 2,
    "medium": 3,
    "hard": 4
}
TEMPERATURE = 0.3


# Logging
def log(text):
    print(f"{__name__} - {text}")


# LLM caller
def ollama_prompt(input_dict):
    log("Sending request to OLLAMA API...")
    start_time = time.time()
    try:
        response = requests.post(
            OLLAMA_URL,
            json=input_dict,
            timeout=TIMEOUT,
        )
        response.raise_for_status()
        result = response.json()["response"]
        log(f"Successfully received response in {time.time() - start_time} seconds...")
        return result
    except requests.exceptions.HTTPError as http_err:
        log(f"HTTP error occurred: {http_err}")
    except requests.exceptions.ConnectionError:
        log("Connection error: Could not reach Ollama server.")
    except requests.exceptions.Timeout:
        log("Timeout error: The request to Ollama took too long.")
    except requests.exceptions.RequestException as err:
        log(f"Unexpected error: {err}")
    except KeyError:
        log("Error: 'response' key not found in Ollama output.")
    return None


# Json helpers
def get_json(response_text: str):
    try:
        # Extract JSON array
        response_text = response_text[response_text.find(
            "["): response_text.rfind("]") + 1]
        parsed = json.loads(response_text)
        return parsed
    except json.JSONDecodeError:
        log("Validation failed: Not valid JSON. Response was:")
        log(response_text)
        return None

# Validation


def validate_json(json_raw):
    try:
        if not isinstance(json_raw, list):
            log("Validation failed: Response is not a list of questions.")
            return False
        for idx, item in enumerate(json_raw):
            required_fields = {
                "question", "options", "correct_answer", "topics", "explanation"
            }
            if not all(field in item for field in required_fields):
                log(f"Missing fields in question {idx}.")
                return False
            if not isinstance(item["options"], dict):
                log(f"'options' is not a dict in question {idx}.")
                return False
            if item["correct_answer"] not in item["options"]:
                log(f"'correct_answer' not in 'options' in question {idx}.")
                return False
        return True
    except Exception:
        log("Validation failed unexpectedly.")
        return False


# Main MCQ generation
def generate_mcqs(difficulty, num_questions, topic_dict):
    """
    difficulty: str ("easy", "medium", "hard")
    num_questions: int
    topic_dict: dict in format {topic: description}
    """
    # Distribute questions evenly
    # topics = list(topic_dict.keys())
    topics = topic_dict  # A very very very temporary change
    questions_per_topic = num_questions // len(topics)
    remainder = num_questions % len(topics)  # to handle uneven
    all_questions = []

    for i, topic in enumerate(topics):
        topic_qs = questions_per_topic + (1 if i < remainder else 0)

        # Calculate retrieval size
        chunks_needed = CHUNKS_PER_Q[difficulty.lower()] * topic_qs
        log(f"Retrieving {chunks_needed} chunks for topic '{topic}'")

        # Step 1: Retrieve context from FAISS DB
        context_text = retrieve_context(
            topic, difficulty, chunks_needed, f"Content in given text related to {topic}")

        # Step 2: Create prompt for MCQ generation
        prompt_text = prompt_func(
            context_text,  # now using RAG context
            [topic],
            difficulty,
            topic_qs
        )
        payload = {
            "model": MODEL_NAME,
            "prompt": prompt_text,
            "system": (
                "You are a careful and expert MCQ generator. You follow JSON schemas strictly and return a JSON array of questions where each question is a JSON object without any commentary or surrounding text."
            ),
            "stream": False,
            "temperature": TEMPERATURE,
        }

        # Step 3: Call LLM
        tries = 0
        while tries < MAX_TRIES:
            llm_output = ollama_prompt(payload)
            if llm_output is None:
                tries += 1
                continue
            parsed_json = get_json(llm_output)
            if parsed_json and validate_json(parsed_json):
                if len(parsed_json) > topic_qs:
                    parsed_json = parsed_json[:topic_qs]
                all_questions.extend(parsed_json)
                break
            else:
                log(f"Invalid JSON for topic '{topic}', retrying...")
                tries += 1

    # Step 4: Shuffle all questions and return
    random.shuffle(all_questions)
    return all_questions


def main(input_response):
    result = generate_mcqs(
        input_response["difficulty"], input_response["num_questions"], input_response["topics"])
    print(json.dumps(result, indent=2))
    return result


# ENTRY POINT
if __name__ == "__main__":
    main()
