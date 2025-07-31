from pdf_parser import extract_text_from_pdf
from topic_extractor import extract_topics

if __name__ == "__main__":
    pdf_path = "Ncert12_1_1.pdf"  # Replace with your actual PDF file name

    print("📄 Extracting text...")
    raw_text = extract_text_from_pdf(pdf_path)

    print("🧠 Extracting topics...")
    topics = extract_topics(raw_text, top_n=10)

    print("\n✅ Topics extracted:")
    for idx, topic in enumerate(topics, 1):
        print(f"{idx}. {topic}")
