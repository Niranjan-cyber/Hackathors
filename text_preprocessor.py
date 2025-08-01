import fitz  # PyMuPDF
import pandas as pd
import json
import re
from collections import Counter
from bertopic import BERTopic
from sentence_transformers import SentenceTransformer

# ----------------------------
# Step 1: Extract PDF blocks with font sizes
# ----------------------------

def extract_pdf_structure(pdf_path):
    doc = fitz.open(pdf_path)
    blocks = []

    for page in doc:
        for block in page.get_text("dict")["blocks"]:
            if "lines" in block:
                font_sizes = []
                text = ""
                for line in block["lines"]:
                    for span in line["spans"]:
                        font_sizes.append(span["size"])
                        text += span["text"] + " "
                avg_size = sum(font_sizes) / len(font_sizes) if font_sizes else 0
                blocks.append((avg_size, text.strip()))
    return blocks

# ----------------------------
# Step 2: Remove duplicate words and section numbers
# ----------------------------

def remove_repetitions(text):
    text = re.sub(r"(\b\d+(\.\d+)?\b[\s]*)+", "", text)
    words = text.split()
    seen = set()
    output = []
    for w in words:
        lw = w.lower()
        if lw not in seen:
            seen.add(lw)
            output.append(w)
    return " ".join(output)

# ----------------------------
# Step 3: Extract clean headings based on font size
# ----------------------------

def extract_clean_headings(blocks):
    font_counts = Counter(size for size, _ in blocks)
    frequent_fonts = sorted([size for size, count in font_counts.items() if count > 1], reverse=True)[:3]

    excluded_starts = ("example", "intext", "objective", "reprint", "exercise", "question")
    headings = []

    for size, text in blocks:
        if size in frequent_fonts:
            cleaned = remove_repetitions(text.strip())
            if (
                len(cleaned.split()) >= 3
                and not cleaned.lower().startswith(excluded_starts)
                and re.search(r"[a-zA-Z]", cleaned)
                and len(set(cleaned.lower().split())) > 2
            ):
                headings.append(cleaned)

    return list(dict.fromkeys(headings))[:5]

# ----------------------------
# Step 4: Extract body paragraphs for semantic clustering
# ----------------------------

def extract_clean_paragraphs(blocks):
    paragraphs = []
    for size, text in blocks:
        if size < 12.0 and len(text.split()) >= 6:
            num_tokens = sum(1 for t in text.split() if any(c.isdigit() for c in t))
            if num_tokens / len(text.split()) < 0.4:
                paragraphs.append(text.strip())
    return paragraphs

# ----------------------------
# Step 5: Run BERTopic to generate topic keywords
# ----------------------------

def extract_bertopic_topics(paragraphs, n=5):
    model = SentenceTransformer("all-mpnet-base-v2")
    topic_model = BERTopic(embedding_model=model, verbose=False)
    topics, _ = topic_model.fit_transform(paragraphs)

    topic_ids = [t for t in set(topics) if t != -1][:n]
    labels = []

    for topic_id in topic_ids:
        keywords = topic_model.get_topic(topic_id)
        if not keywords:
            continue
        words = [w for w, _ in keywords[:5] if w.lower() not in {"the", "of", "and", "in", "kg", "mol", "1000", "bar"}]
        label = " ".join(words)
        if len(label.split()) >= 3 and re.search(r"[a-zA-Z]", label):
            labels.append(label.title())

    return labels

# ----------------------------
# Step 6: Clean final merged topics
# ----------------------------

def clean_final_topics(headings, semantic_topics):
    combined = headings + semantic_topics

    def cleanup(t):
        t = t.strip("- ").replace("–", "-")
        t = re.sub(r"\b(is|are|was|were|of|the|and|in|on|to|for|with|at|by)\b", "", t, flags=re.I)
        t = re.sub(r"\s{2,}", " ", t)
        return t.strip().title()

    cleaned = [cleanup(t) for t in combined]
    unique_cleaned = list(dict.fromkeys([t for t in cleaned if len(t.split()) >= 2]))[:8]
    return unique_cleaned

# ----------------------------
# Step 7: Save to CSV + JSON
# ----------------------------

def save_topics(topics):
    with open("topics_for_frontend.json", "w") as f:
        json.dump(topics, f, indent=2)
    pd.DataFrame({"Topic": topics}).to_csv("topics_output.csv", index=False)

# ----------------------------
# MAIN
# ----------------------------

pdf_path = "sample1.pdf"  # Change this to match your input

print("📄 Reading and analyzing PDF...")
blocks = extract_pdf_structure(pdf_path)

print("🏷️ Extracting headings from layout...")
headings = extract_clean_headings(blocks)

print("🤖 Running BERTopic on body paragraphs...")
paragraphs = extract_clean_paragraphs(blocks)
semantic_topics = extract_bertopic_topics(paragraphs, n=5)

print("\n✅ Final Hybrid Topics:")
final_topics = clean_final_topics(headings, semantic_topics)
for i, t in enumerate(final_topics, 1):
    print(f"Topic {i}: {t}")

save_topics(final_topics)

print("\n✅ Output saved:")
print(" - topics_for_frontend.json")
print(" - topics_output.csv")
