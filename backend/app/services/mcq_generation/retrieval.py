# retrieval_pipeline.py

import pickle
import faiss
from sentence_transformers import SentenceTransformer

# -----------------------
# Config / Tunables
# -----------------------
EMBED_MODEL_NAME = "all-MiniLM-L6-v2"
INDEX_PATH = "../rag/vector_store/faiss_index.index"  # Path to FAISS index file
METADATA_PATH = "../rag/vector_store/chunk_metadata.pkl"  # Path to metadata file

# -----------------------
# Difficulty transformation
# -----------------------


def transform_difficulty(difficulty: str) -> str:
    """
    Map difficulty input to retrieval-friendly wording.
    This helps the query embedding reflect desired complexity.
    """
    mapping = {
        "easy": "Explain in simple, beginner-friendly terms",
        "medium": "Provide a moderately detailed explanation",
        "hard": "Provide an advanced, in-depth explanation with technical details"
    }
    return mapping.get(difficulty.lower(), difficulty)


# -----------------------
# Query generation
# -----------------------
def generate_query(topic: str, difficulty: str, topic_description: str = "") -> str:
    """
    Generate a retrieval query string from topic, description, and difficulty.
    """
    difficulty_phrase = transform_difficulty(difficulty)
    query = f"Topic: {topic}. {topic_description}. {difficulty_phrase}."
    return query.strip()


# -----------------------
# Load FAISS and metadata
# -----------------------
def load_faiss_index_and_metadata(index_path: str, metadata_path: str):
    """
    Load FAISS index and metadata list from disk.
    """
    index = faiss.read_index(index_path)
    with open(metadata_path, "rb") as f:
        metadata = pickle.load(f)
    return index, metadata


# -----------------------
# Retrieval
# -----------------------
def retrieve_top_k(query: str, index, metadata, k: int, model):
    """
    Retrieve top K chunks for a given query string.
    """
    query_embedding = model.encode([query])
    distances, indices = index.search(query_embedding, k)

    # Extract matching chunks from metadata
    results = []
    for idx in indices[0]:
        if idx < len(metadata):
            results.append(metadata[idx])
    return results


# -----------------------
# Group into paragraphs
# -----------------------
def group_into_paragraphs(chunks_metadata):
    """
    Combine retrieved chunks into one paragraph each.
    """
    paragraphs = []
    for chunk in chunks_metadata:
        text = chunk.get("text", "").strip()
        if text:
            paragraphs.append(text)
    return paragraphs


# -----------------------
# Main pipeline
# -----------------------
def main(topic: str, difficulty: str, k: int, topic_description: str = ""):
    # Step 1: Generate query
    query = generate_query(topic, difficulty, topic_description)

    # Step 2: Load FAISS index + metadata
    index, metadata = load_faiss_index_and_metadata(INDEX_PATH, METADATA_PATH)

    # Step 3: Load embedding model
    model = SentenceTransformer(EMBED_MODEL_NAME)

    # Step 4: Retrieve top K chunks
    top_chunks = retrieve_top_k(query, index, metadata, k, model)

    # Step 5: Group into paragraphs
    paragraphs = group_into_paragraphs(top_chunks)

    # Step 6: Return final context text
    final_context = "\n\n".join(paragraphs)
    return final_context


if __name__ == "__main__":
    # Example usage
    topic = "Photosynthesis"
    difficulty = "easy"
    k = 3
    topic_description = "The process by which green plants convert sunlight into chemical energy"

    context_text = main(topic, difficulty, k, topic_description)
    print("=== Retrieved Context ===")
    print(context_text)
