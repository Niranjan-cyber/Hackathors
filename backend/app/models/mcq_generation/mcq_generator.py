from prompt import prompt_func
import requests
import json
import time

# @prathamesh This should be the format of response from frontend
USER_INPUT = {
    "topics": ["Bias Variance trade-off", "Evaluation metrics for machine learning"],
    "difficulty": "medium",
    "num_questions": 5,
}
TIMEOUT = 20
MAX_TRIES = 3
MODEL_NAME = "openhermes"
OLLAMA_URL = "http://localhost:11434/api/generate"
PATH_TO_TEXT = "../OCR_text.txt"


def log(text):
    print(f"{__name__} - {text}")


def generate_payload(userinput_response):
    payload = userinput_response.copy()
    with open(PATH_TO_TEXT, "r") as file:
        payload["text"] = file.read()
    payload["format"] = "json"
    return payload


def ollama_prompt(input_dict):
    log("Sending request to OLLAMA API...")
    start_time = time.time()
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt_func(
                    input_dict["text"],
                    input_dict["topics"],
                    input_dict["difficulty"],
                    input_dict["num_questions"],
                ),
                "stream": False,
            },
            timeout=TIMEOUT,
        )
        response.raise_for_status()
        result = response.json()["response"]
        log(
            f"Successfully recieved Response from LLM in {
                time.time() - start_time
            } seconds..."
        )
        return result
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
    return None


def get_json(response_text):
    try:
        parsed = json.loads(response_text)
        return parsed
    except json.JSONDecodeError:
        log("Validation failed: Response is not valid JSON.")
        return None


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
    # @prathamesh replace the below line with getting response from frontend.
    input_response = USER_INPUT.copy()
    input_response = generate_payload(input_response)
    tries = 0
    while tries < MAX_TRIES:
        log(f"Attempt {tries + 1}/{MAX_TRIES}")
        llm_output = ollama_prompt(input_response)
        if llm_output is None:
            log("No response from Ollama. Retrying...")
            tries += 1
            continue
        parsed_json = get_json(llm_output)
        if parsed_json and validate_json(parsed_json):
            log("Returning the JSON...")
            return parsed_json
        log(f"Reprompting...")
        tries += 1


if __name__ == "__main__":
    print(main())
