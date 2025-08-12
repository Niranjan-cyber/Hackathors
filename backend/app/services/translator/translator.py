import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
try:
    genai.configure(api_key=os.environ["GOOGLE_API_KEY"])
except KeyError:
    print("Error: The 'GOOGLE_API_KEY' environment variable is not set.")

def translate_text(text, target_language="en"):
    """Translate a single text using Gemini."""
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    prompt = f"""
    Translate the following text to {target_language}. 
    Only return the translated text, nothing else.
    
    Text to translate: {text}
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Translation error: {e}")
        return None

def batch_translate_texts(texts, target_language="hi"):
    """Translate a list of strings using Gemini."""
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Create a batch prompt for all texts
    texts_str = "\n".join([f"{i+1}. {text}" for i, text in enumerate(texts)])
    
    prompt = f"""
    Translate the following texts to {target_language}. 
    Return only the translated texts in the same order, one per line.
    Do not include numbers or any other formatting.
    
    Texts to translate:
    {texts_str}
    """
    
    try:
        response = model.generate_content(prompt)
        translated_lines = response.text.strip().split('\n')
        # Clean up any extra formatting and return the translations
        return [line.strip() for line in translated_lines if line.strip()]
    except Exception as e:
        print(f"Batch translation error: {e}")
        return None
