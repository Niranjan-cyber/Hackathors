# main.py
from pdf_parser import extract_text_from_pdf, clean_text
from topic_extractor import extract_keybert_topics, extract_yake_topics

if __name__ == "__main__":
    pdf_path = "Ncert12_1_1.pdf"

    print("📄 Extracting and cleaning text...")
    raw_text = extract_text_from_pdf(pdf_path)
    cleaned_text = clean_text(raw_text)

    print("🧠 Extracting topics using KeyBERT...")
    topics = extract_keybert_topics(cleaned_text)

    if not topics or len(topics) < 3:
        print("⚠️ KeyBERT returned few/weak topics. Using YAKE fallback...")
        topics = extract_yake_topics(cleaned_text)

    print("\n✅ Final Extracted Topics:")
    for i, topic in enumerate(topics, 1):
        print(f"{i}. {topic}")
