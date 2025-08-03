from prompt import prompt_func
import requests
import json

USER_INPUT = {
    "text": "...",
    "topics": [],
    "difficulty": "medium",
    "num_questions": 5,
}
TIMEOUT = 20
MAX_TRIES = 3
MODEL_NAME = "openhermes"
OLLAMA_URL = "http://localhost:11434/api/generate"


def log(text):
    print(f"{__name__} - {text}")


def ollama_prompt():
    log("Sending request to OLLAMA API...")
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt_func(
                    USER_INPUT["text"],
                    USER_INPUT["topics"],
                    USER_INPUT["difficulty"],
                    USER_INPUT["num_questions"],
                ),
                "stream": False,
            },
            timeout=TIMEOUT,
        )
        result = response.json()["response"]
    except requests.exceptions.HTTPError as http_err:
        log(f"HTTP error occurred: {http_err}")
    except requests.exceptions.ConnectionError:
        log("Connection error: Could not reach the Ollama server. Is it running?")
    except requests.exceptions.Timeout:
        log("Timeout error: The request to Ollama took too long.")
    except requests.exceptions.RequestException as err:
        log(f"Unexpected error occurred: {err}")
    except KeyError:
        log("Error: 'response' key not found in Ollama output.")
    return result


def get_json(response_text):
    try:
        parsed = json.loads(response_text)
        return parsed
    except json.JSONDecodeError:
        log("Validation failed: Response is not valid JSON.")


def validate_json(json_raw):
    try:
        if not isinstance(json_raw, list):
            log("Validation failed: Response is not a list of questions.")
            return False

        for idx, item in enumerate(json_raw):
            required_fields = {
                "question",
                "options",
                "correct_answer",
                "topics",
                "explanation",
            }
            if not all(field in item for field in required_fields):
                log(f"Validation failed: Missing fields in question {idx}.")
                return False

            if not isinstance(item["options"], dict):
                log(
                    f"Validation failed: 'options' is not a dictionary in question {
                        idx
                    }."
                )
                return False

            if item["correct_answer"] not in item["options"]:
                log(
                    f"Validation failed: 'correct_answer' not in 'options' in question {
                        idx
                    }."
                )
                return False

        log("Validation successful: Response is in correct JSON format.")
        return True

    except json.JSONDecodeError:
        log("Validation failed: Response is not valid JSON.")
        return False


def main():
    tries = 0
    while tries < MAX_TRIES:
        log(f"Attempt {tries + 1}/{MAX_TRIES}")
        llm_output = ollama_prompt()
        parsed_json = get_json(llm_output)
        if validate_json(parsed_json):
            log("Returning the JSON...")
            return parsed_json
        log(f"Reprompting...")
        tries += 1


if __name__ == "__main__":
    print(main())
