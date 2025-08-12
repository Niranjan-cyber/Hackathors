#!/usr/bin/env python3
"""
Streaming RAG + FAISS ingestion -> Llama (Ollama) MCQ generation.

Usage:
  - Put your OCR text in OCR_text.txt (or pass another path to main()).
  - Ensure `prompt_func` is importable from your prompt file.
  - Run: python streaming_rag_mcq.py
"""

# <-- change 'prompt_file' to your actual module
from prompt import prompt_func
import os
import re
import json
import time
import math
from pathlib import Path
from typing import List, Dict, Tuple, Optional

import faiss
import numpy as np
import requests
from sentence_transformers import SentenceTransformer
from langchain.text_splitter import RecursiveCharacterTextSplitter

# ---- Config ----
OCR_PATH = "OCR_text.txt"
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"  # fast & small; change if you prefer
# file to save FAISS index (will be overwritten)
FAISS_INDEX_PATH = "faiss_index.ivf"
# mapping id -> chunk_text & other metadata
METADATA_PATH = "faiss_metadata.json"
OLLAMA_URL = "http://localhost:11434/api/generate"  # Ollama HTTP endpoint
OLLAMA_MODEL = "llama3.1"
CHUNK_SIZE_CHARS = 1000         # approximate chunk target (characters)
CHUNK_OVERLAP = 150             # overlap characters between chunks
# size of the text buffer to accumulate before chunking
STREAM_BUFFER_CHARS = 6000
EMBED_BATCH_SIZE = 32
TOP_K_RETRIEVE = 5
# ----------------

# Import your prompt function here (adjust import path as needed).
# prompt_func must accept (context_text, topics_list, difficulty, num_questions) or similar.
# If your prompt_func signature is different adapt the call in `generate_mcqs_for_topic`.


# ---------------- Utilities ----------------
def log(msg: str):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}")


def clean_ocr_text_fragment(text: str) -> str:
    """
    Basic OCR cleaning for a fragment: merge hyphen-line-breaks, convert single newlines (soft wraps)
    to spaces, preserve double newlines as paragraph separators, normalize whitespace.
    """
    # Merge hyphenated line breaks: "exam-\nple" -> "example"
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)
    # Preserve paragraph breaks: temporarily marker
    text = re.sub(r"\n\s*\n", "<PARA>", text)
    # Replace remaining single newlines with spaces (soft wraps)
    text = re.sub(r"\n", " ", text)
    # Restore paragraph marker to double newline
    text = text.replace("<PARA>", "\n\n")
    # Normalize multiple spaces
    text = re.sub(r"\s+", " ", text).strip()
    return text


# ---------------- FAISS wrapper (streaming) ----------------
class FaissIndexWriter:
    """
    A simple incremental FAISS index writer using IndexFlatIP (cosine via normalization).
    We keep a metadata mapping of int id -> chunk text + optional metadata.
    """

    def __init__(self, dim: int, index_path: str = FAISS_INDEX_PATH, meta_path: str = METADATA_PATH):
        self.dim = dim
        self.index_path = index_path
        self.meta_path = meta_path

        # We'll use IndexFlatIP and normalize vectors to unit length to do cosine similarity via inner product
        self.index = faiss.IndexFlatIP(dim)
        # Keep an id mapping stored outside FAISS (so we can save chunk texts)
        self.next_id = 0
        self.meta = {}  # id (int) -> {"text": chunk_text, "offset": ..., ...}

    def add(self, vectors: np.ndarray, texts: List[str]):
        """
        vectors: (N, dim) numpy array (not necessarily normalized) -- we will normalize them
        texts: list of N chunk strings
        """
        # normalize vectors to unit length for inner product = cosine similarity
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        # prevent div by zero
        norms[norms == 0] = 1.0
        vectors = vectors / norms

        self.index.add(vectors.astype('float32'))
        # Save metadata
        for t in texts:
            self.meta[self.next_id] = {"text": t}
            self.next_id += 1

    def save(self):
        # write FAISS index
        faiss.write_index(self.index, self.index_path)
        # write meta
        with open(self.meta_path, "w", encoding="utf-8") as f:
            json.dump(self.meta, f, ensure_ascii=False, indent=2)

    def load(self):
        if os.path.exists(self.index_path) and os.path.exists(self.meta_path):
            self.index = faiss.read_index(self.index_path)
            with open(self.meta_path, "r", encoding="utf-8") as f:
                self.meta = json.load(f)
            # set next_id
            if self.meta:
                self.next_id = max(int(k) for k in self.meta.keys()) + 1
            else:
                self.next_id = 0
            return True
        return False

    def search(self, query_vector: np.ndarray, top_k: int = 5) -> List[Tuple[int, float]]:
        """
        query_vector: shape (dim,) or (1, dim), assumed normalized
        returns list of (id, score)
        """
        if query_vector.ndim == 1:
            q = query_vector.reshape(1, -1).astype('float32')
        else:
            q = query_vector.astype('float32')
        # ensure normalized
        q = q / (np.linalg.norm(q, axis=1, keepdims=True) + 1e-12)
        D, I = self.index.search(q, top_k)
        results = []
        for score, idx in zip(D[0], I[0]):
            if idx == -1:
                continue
            results.append((int(idx), float(score)))
        return results


# ---------------- Chunking helper ----------------
def make_text_splitter(chunk_size: int = CHUNK_SIZE_CHARS, chunk_overlap: int = CHUNK_OVERLAP):
    # OCR-friendly separators order
    separators = ["\n\n", ". ", "? ", "! ", "; ", "\n", " "]
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=separators
    )
    return splitter


# ---------------- Streaming ingestion ----------------
def stream_and_index(
    ocr_path: str,
    embed_model: SentenceTransformer,
    writer: FaissIndexWriter,
    buffer_chars: int = STREAM_BUFFER_CHARS,
):
    """
    Read the OCR file incrementally, preprocess, chunk each buffer, embed, and add to FAISS writer.
    """
    splitter = make_text_splitter()
    batch_texts = []
    buffer = ""
    total_chunks = 0
    start_time = time.time()

    # ensure writer index is empty (or loaded prior if you want to resume)
    log(f"Starting streaming ingestion from {ocr_path} ...")
    with open(ocr_path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            buffer += line
            # when buffer grows large enough, process it
            if len(buffer) >= buffer_chars:
                frag = clean_ocr_text_fragment(buffer)
                # split into chunks
                chunks = splitter.split_text(frag)
                if chunks:
                    # embed in batches
                    for i in range(0, len(chunks), EMBED_BATCH_SIZE):
                        batch = chunks[i: i + EMBED_BATCH_SIZE]
                        vectors = embed_model.encode(
                            batch, convert_to_numpy=True)
                        writer.add(vectors, batch)
                    total_chunks += len(chunks)
                buffer = ""  # reset buffer

    # process remaining buffer
    if buffer.strip():
        frag = clean_ocr_text_fragment(buffer)
        chunks = splitter.split_text(frag)
        if chunks:
            for i in range(0, len(chunks), EMBED_BATCH_SIZE):
                batch = chunks[i: i + EMBED_BATCH_SIZE]
                vectors = embed_model.encode(batch, convert_to_numpy=True)
                writer.add(vectors, batch)
            total_chunks += len(chunks)

    # save index and metadata
    writer.save()
    elapsed = time.time() - start_time
    log(f"Streaming ingestion complete. Indexed {
        total_chunks} chunks in {elapsed:.2f}s")
    return total_chunks


# ---------------- Retrieval & LLM generation ----------------
def retrieve_chunks_for_topic(topic: str, embed_model: SentenceTransformer, writer: FaissIndexWriter, top_k: int = TOP_K_RETRIEVE) -> List[str]:
    q_vec = embed_model.encode([topic], convert_to_numpy=True)[0]
    # normalize
    q_vec = q_vec / (np.linalg.norm(q_vec) + 1e-12)
    results = writer.search(q_vec, top_k=top_k)
    chunk_texts = []
    for idx, score in results:
        # metadata stored under string keys
        text = writer.meta.get(str(idx)) or writer.meta.get(idx)
        if text is None:
            # fallback: if metadata keys are ints
            text = writer.meta.get(str(idx))
        if isinstance(text, dict):
            chunk_texts.append(text.get("text", ""))
        elif isinstance(text, str):
            chunk_texts.append(text)
    return chunk_texts


def call_ollama(prompt: str, model: str = OLLAMA_MODEL, timeout: int = 120) -> Optional[str]:
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "temperature": 0.2,
    }
    try:
        r = requests.post(OLLAMA_URL, json=payload, timeout=timeout)
        r.raise_for_status()
        data = r.json()
        # Ollama returns {"response": "..."} in your setup — adjust if different
        return data.get("response") or data.get("output") or data.get("message") or None
    except Exception as e:
        log(f"OLLAMA call failed: {e}")
        return None


def parse_model_json_array(response_text: str) -> Optional[List[dict]]:
    """
    Try to extract the first JSON array substring and parse it.
    """
    if not response_text or not isinstance(response_text, str):
        return None
    start = response_text.find("[")
    end = response_text.rfind("]")
    if start == -1 or end == -1 or end <= start:
        return None
    sub = response_text[start: end + 1]
    try:
        parsed = json.loads(sub)
        if isinstance(parsed, list):
            return parsed
    except json.JSONDecodeError:
        # try small fixes (common culprit: trailing commas)
        try:
            cleaned = re.sub(r",\s*]", "]", sub) parsed = json.loads(cleaned) if isinstance(parsed, list):
            return parsed
        except Exception:
            return None
    return None


def generate_mcqs_for_topic(
    topic: str,
    difficulty: str,
    num_questions: int,
    embed_model: SentenceTransformer,
    writer: FaissIndexWriter,
) -> List[dict]:
    # Retrieve relevant chunks and combine them into context
    chunks = retrieve_chunks_for_topic(
        topic, embed_model, writer, top_k=TOP_K_RETRIEVE)
    context = "\n\n".join(chunks)
    # Build the prompt using your prompt_func (assumed signature: prompt_func(context, topics_list, difficulty, num_questions))
    prompt_text = prompt_func(context, [topic], difficulty, num_questions)
    raw = call_ollama(prompt_text)
    if raw is None:
        log(f"No response for topic {topic}")
        return []
    parsed = parse_model_json_array(raw)
    if parsed is None:
        log(f"Could not parse JSON from model for topic {
            topic}. Raw response (truncated): {raw[:1000]}")
        return []
    # Optionally, validate each question object here (fields present etc.)
    return parsed


# ---------------- Main orchestrator ----------------
def main(
    ocr_path: str = OCR_PATH,
    topics: List[str] = None,
    difficulty: str = "medium",
    total_questions: int = 10,
) -> Dict:
    if topics is None or len(topics) == 0:
        raise ValueError("Provide a non-empty list of topics.")

    # Load embed model
    log(f"Loading embedding model {EMBED_MODEL_NAME} ...")
    embed = SentenceTransformer(EMBED_MODEL_NAME)

    # Prepare FAISS writer (dimension from model)
    # get a sample embedding to determine dim
    sample_vec = embed.encode(["hello world"], convert_to_numpy=True)
    dim = sample_vec.shape[1]
    writer = FaissIndexWriter(
        dim=dim, index_path=FAISS_INDEX_PATH, meta_path=METADATA_PATH)

    # If you want to resume from existing index, you could call writer.load()
    # writer.load()

    # Build index by streaming file and embedding chunks
    stream_and_index(ocr_path, embed, writer, buffer_chars=STREAM_BUFFER_CHARS)

    # Distribute questions per topic fairly
    n_topics = len(topics)
    base = total_questions // n_topics
    remainder = total_questions % n_topics
    per_topic_list = [base + (1 if i < remainder else 0)
                      for i in range(n_topics)]
    log(f"Distributing questions per topic: {
        list(zip(topics, per_topic_list))}")

    # For each topic, retrieve chunks, call LLM and collect questions
    all_questions = []
    for topic, num_q in zip(topics, per_topic_list):
        if num_q <= 0:
            continue
        log(f"Generating {num_q} questions for topic: {topic} ...")
        qs = generate_mcqs_for_topic(topic, difficulty, num_q, embed, writer)
        # If the model returns more than needed, trim; if fewer, accept what's given
        if isinstance(qs, list):
            if len(qs) > num_q:
                qs = qs[:num_q]
            all_questions.extend(qs)
        else:
            log(f"Unexpected model output for topic {topic}. Skipping.")

    log(f"Total generated questions: {
        len(all_questions)} (requested {total_questions})")
    return {"questions": all_questions}


# ---------------- Run as script (example) ----------------
if __name__ == "__main__":
    # Example call: replace topics and numbers as you like
    result = main(
        ocr_path=OCR_PATH,
        topics=["Atomic Trends", "D block Elements", "F Block Elements"],
        difficulty="medium",
        total_questions=12,
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))
