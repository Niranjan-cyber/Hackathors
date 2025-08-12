import pickle
import faiss
import os
import re
from transformers import AutoTokenizer
from sentence_transformers import SentenceTransformer


EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
# mapping id -> chunk_text & other metadata (kept inside the same pickle we already save)


# CONFIGURATION (resolve to stable paths relative to this file)
_BASE_DIR = os.path.abspath(os.path.dirname(__file__))
OCR_FILE_PATH = os.path.join(_BASE_DIR, "..", "mcq_generation", "OCR_text.txt")  # Input OCR text file
DB_FAISS_PATH = os.path.join(_BASE_DIR, "vector_store")  # Output folder for FAISS index and metadata
MAX_TOKENS = 240  # safe buffer under 256 for all-MiniLM-L6-v2
OVERLAP_SENTENCES = 1  # number of sentences to overlap between chunks
SENTENCE_SPLIT_REGEX = r'(?<=[.!?])\s+'


def split_into_sentences(text: str):
    # Normalize whitespace/newlines first (do not lose sentence punctuation)
    text = text.replace("\r", " ").replace("\n", " ")
    # Basic sentence split. For very noisy OCR you may want a more robust splitter.
    raw_sentences = re.split(SENTENCE_SPLIT_REGEX, text)
    # Strip and remove empty items
    sentences = [s.strip() for s in raw_sentences if s and s.strip()]
    return sentences


def sentence_token_chunk(
    text: str,
    model_name: str = EMBED_MODEL_NAME,
    max_tokens: int = MAX_TOKENS,
    overlap_sentences: int = OVERLAP_SENTENCES,
):
    """
    Returns list of chunk texts. Each chunk's token length (according to model_name tokenizer)
    will be <= max_tokens (except pathological cases handled by internal splitting).
    """
    tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=True)
    sentences = split_into_sentences(text)
    if not sentences:
        return []

    # Pre-tokenize all sentences to ids once (fast enough for typical docs)
    sent_token_ids = [tokenizer.encode(
        s, add_special_tokens=False) for s in sentences]
    # lengths of sentences in tokens for each sentence is stored here.
    sent_token_lens = [len(ids) for ids in sent_token_ids]

    chunks = []
    n = len(sentences)
    i = 0

    while i < n:
        # Build a chunk starting at sentence i
        curr_sent_indices = []
        curr_len = 0
        j = i

        # Greedily add sentences until next would exceed max_tokens
        while (j < n) and (curr_len + sent_token_lens[j] <= max_tokens):
            curr_sent_indices.append(j)
            curr_len += sent_token_lens[j]
            j += 1

        if j == i:
            # Single sentence too long (> max_tokens). Split it into token slices.
            long_ids = sent_token_ids[i]
            start_idx = 0
            while start_idx < len(long_ids):
                slice_ids = long_ids[start_idx: start_idx + max_tokens]
                slice_text = tokenizer.decode(
                    slice_ids, clean_up_tokenization_spaces=True).strip()
                if slice_text:
                    chunks.append(slice_text)
                start_idx += max_tokens  # no overlap inside huge sentence
            # Move to next sentence (we consumed sentence i completely)
            i += 1
            # For overlap semantics: the next chunk will start from max(i+1, previous j-overlap) in normal flow
            continue

        # Compose chunk text from sentences i .. j-1
        chunk_text = " ".join(sentences[idx]
                              for idx in curr_sent_indices).strip()
        chunks.append(chunk_text)

        # Determine next start index with sentence-overlap
        if overlap_sentences <= 0:
            i = j
        else:
            # Attempt to back up overlap_sentences into the last chunk
            next_start = j - overlap_sentences
            # Ensure progress (at least advance by 1)
            if next_start <= i:  # Only happens when j==i case is executed.
                next_start = i + 1
            i = next_start

    return chunks


def preprocess_text(text: str) -> str:
    """
    Basic OCR cleaning for a fragment: merge hyphen-line-breaks, convert single newlines (soft wraps)
    to spaces, preserve double newlines as paragraph separators, normalize whitespace.
    """
    # Merge hyphenated line breaks: "exam-\nple" -> "example"
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)
    # Preserve paragraph breaks: temporarily marker
    text = re.sub(r"\n\s*\n", "<PARAGRAPH1234>", text)
    # Replace remaining single newlines with spaces (soft wraps)
    text = re.sub(r"\n", " ", text)
    # Restore paragraph marker to double newline
    text = text.replace("<PARAGRAPH1234>", "\n\n")
    # Normalize multiple spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def preprocess_text(text: str) -> str:
    """Basic text cleaning for OCR output."""
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)  # remove non-ASCII chars
    # Merge hyphenated line breaks: "exam-\nple" -> "example"
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)
    # Replace remaining single newlines with spaces (soft wraps)
    text = re.sub(r"\n", " ", text)
    # Normalize multiple spaces
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def save_faiss_index(index, embeddings, chunks):
    os.makedirs(DB_FAISS_PATH, exist_ok=True)
    faiss.write_index(index, os.path.join(DB_FAISS_PATH, "index.faiss"))
    with open(os.path.join(DB_FAISS_PATH, "metadata.pkl"), "wb") as f:
        pickle.dump({"chunks": chunks}, f)


def main():
    print("Starting the database generation process...")
    # Step 1: Read OCR text
    with open(OCR_FILE_PATH, "r", encoding="utf-8") as f:
        raw_text = f.read()
    print("Finished Reading file")

    # Step 2: Preprocess text
    cleaned_text = preprocess_text(raw_text)
    print("Finished Preprocessing the text")

    # Step 3: Hybrid chunking
    chunks = sentence_token_chunk(cleaned_text)
    print(f"Created {len(chunks)} chunks...")

    # Step 4: Create embeddings
    model = SentenceTransformer(EMBED_MODEL_NAME)
    embeddings = model.encode(chunks, show_progress_bar=True)
    print("Created embeddings, now creating FAISS index...")

    # Step 5: Build FAISS index
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)
    print("FAISS index created, now storing them in a database")

    # Step 6: Save index & metadata
    save_faiss_index(index, embeddings, chunks)
    print(f"Vector database saved to '{DB_FAISS_PATH}' with {len(chunks)} chunks.")


if __name__ == "__main__":
    main()
