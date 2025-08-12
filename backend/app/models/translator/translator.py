import json
from google.cloud import translate_v2 as translate

# Initialize Google Translate client
translate_client = translate.Client()

# Load MCQs JSON
with open("mcqs.json", "r", encoding="utf-8") as f:
    mcqs_data = json.load(f)

def batch_translate_texts(texts, target_language="hi"):
    """Translate a list of strings in one API call."""
    results = translate_client.translate(texts, target_language=target_language)
    return [r["translatedText"] for r in results]

translated_data = {}

for category, mcqs in mcqs_data.items():
    # Collect all texts in this category for batch translation
    texts_to_translate = [category]  # category name first
    for mcq in mcqs:
        texts_to_translate.append(mcq["question"])
        texts_to_translate.extend(mcq["options"])
        texts_to_translate.append(mcq["answer"])
    
    # Translate them in one batch
    translated_texts = batch_translate_texts(texts_to_translate, target_language="hi")
    
    # Rebuild the MCQ structure
    translated_category = translated_texts[0]
    idx = 1
    translated_mcqs = []
    for mcq in mcqs:
        translated_question = translated_texts[idx]; idx += 1
        translated_options = translated_texts[idx: idx + len(mcq["options"])]
        idx += len(mcq["options"])
        translated_answer = translated_texts[idx]; idx += 1
        
        translated_mcqs.append({
            "question": translated_question,
            "options": translated_options,
            "answer": translated_answer
        })
    
    translated_data[translated_category] = translated_mcqs

# Save to JSON
with open("translated_mcqs.json", "w", encoding="utf-8") as f:
    json.dump(translated_data, f, ensure_ascii=False, indent=4)

print("✅ Batched translation complete! Saved to translated_mcqs.json")
