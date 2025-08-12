import os
import json
import csv
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# Configure the API key from environment variables
try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
except KeyError:
    print("Warning: The 'GOOGLE_API_KEY' environment variable is not set.")

def generate_mcqs(topic, num_questions=3):
    """
    Generates multiple-choice questions for a given topic using the Gemini Pro API.
    
    Args:
        topic (str): The subject or text for the questions.
        num_questions (int): The number of questions to generate.
        
    Returns:
        list: A list of dictionaries, where each dictionary represents a question.
    """
    
    prompt = f"""
    Generate {num_questions} multiple-choice questions about the topic: "{topic}".
    Each question should have four options and a single correct answer.
    The questions should be suitable for a general audience.
    
    Provide the output in a JSON array format. Each object in the array must have the following structure:
    {{
      "question": "The question text.",
      "options": {{"A": "Option A text", "B": "Option B text", "C": "Option C text", "D": "Option D text"}},
      "correct_answer": "A",
      "topics": ["{topic}"],
      "explanation": "Brief explanation of why this answer is correct."
    }}
    
    The output must be a valid JSON string, and nothing else.
    """
    
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        
        # The model returns a JSON string, so we parse it
        mcq_data = json.loads(response.text)
        return mcq_data
        
    except Exception as e:
        print(f"An error occurred for topic '{topic}': {e}")
        return None

def read_topics_from_csv(filepath):
    """
    Reads a list of topics from a CSV file.
    """
    topics = []
    try:
        with open(filepath, mode='r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # Assuming the CSV has a header named 'topic'
                topics.append(row['topic'])
    except FileNotFoundError:
        print(f"Error: The file '{filepath}' was not found.")
    except KeyError:
        print(f"Error: The CSV file must have a header named 'topic'.")
    return topics

if __name__ == '__main__':
    csv_filepath = 'topics.csv'
    all_topics = read_topics_from_csv(csv_filepath)
    
    if all_topics:
        all_generated_mcqs = {}
        for topic in all_topics:
            print(f"⏳ Generating MCQs for topic: '{topic}'...")
            questions = generate_mcqs(topic, num_questions=2)
            if questions:
                all_generated_mcqs[topic] = questions
        
        # Save all generated questions to a single JSON file
        output_filepath = 'generated_mcqs.json'
        with open(output_filepath, 'w', encoding='utf-8') as json_file:
            json.dump(all_generated_mcqs, json_file, indent=4)
        
        print(f"\n✅ All generated MCQs have been saved to '{output_filepath}'.")