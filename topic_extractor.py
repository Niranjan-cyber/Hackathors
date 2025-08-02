import fitz  # PyMuPDF
import subprocess
import re
import csv
import ollama

# ----------------------------
# Query LLM using Ollama
# ----------------------------
def query_ollama_chunk(chunk, model="phi3"):
    prompt = build_topic_prompt(chunk)
    response = ollama.chat(
        model=model,
        messages=[
            {"role": "system", "content": "You are an educational content summarizer."},
            {"role": "user", "content": prompt}
        ]
    )
    return response['message']['content']

# ----------------------------
# Prompt Engineering for Clean Topics
# ----------------------------
def build_topic_prompt(chunk):
    return f"""
You are an educational content summarizer.

Given the following text, extract at most 10 key *educational* topics or concepts. These should be meaningful, distinct, and helpful for organizing quiz questions.

- Do NOT include subpoints or overly general words like "Introduction", "Overview", or "Chapter".
- Prefer nouns or noun phrases (e.g., "Chemical Bonding", "Thermodynamic Laws").
- Do not repeat or rephrase similar concepts.
- Output a clean numbered list of just the topics, without any additional explanation.

Text:
\"\"\"{chunk}\"\"\"
"""

# ----------------------------
# Step 1: Extract PDF Text
# ----------------------------
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    full_text = ""
    for page in doc:
        full_text += page.get_text()
    return full_text

# ----------------------------
# Step 2: Chunk the Text
# ----------------------------
def split_into_chunks(text, max_words=500):
    words = text.split()
    chunks = [" ".join(words[i:i + max_words]) for i in range(0, len(words), max_words)]
    return chunks

# ----------------------------
# Step 3: Extract and Save Topics
# ----------------------------
def extract_topics_from_pdf_text(text, model="phi3", output_csv="topics.csv"):
    chunks = split_into_chunks(text)
    all_topics = set()

    for i, chunk in enumerate(chunks):
        print(f"[{i+1}/{len(chunks)}] Processing chunk...")
        response = query_ollama_chunk(chunk, model=model)

        topics = re.findall(r"\d+\.\s*(.+)", response)
        for topic in topics:
            cleaned = topic.strip()
            if cleaned and cleaned.lower() not in (t.lower() for t in all_topics):
                all_topics.add(cleaned)

    # Limit to top 10
    selected_topics = list(all_topics)[:10]

    # Save to CSV
    with open(output_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Topic"])
        for topic in selected_topics:
            writer.writerow([topic])
    
    print(f"\n✅ Extracted {len(selected_topics)} topics and saved to {output_csv}")

import spacy
nlp = spacy.load("en_core_web_sm")

def clean_and_extract_keywords(topic_text, max_keywords=10):
    doc = nlp(topic_text)
    noun_chunks = [chunk.text.strip() for chunk in doc.noun_chunks if len(chunk.text.strip()) > 3]

    # Remove duplicates and sort by length (shorter = better topic label)
    cleaned = sorted(set(noun_chunks), key=lambda x: len(x))
    
    return cleaned[:max_keywords]

# ----------------------------
# Entry Point
# ----------------------------
if __name__ == "__main__":
    pdf_path = "sample5.pdf"  # Change this
    text = extract_text_from_pdf(pdf_path)
    extract_topics_from_pdf_text(text, model="phi3", output_csv="topics.csv")
