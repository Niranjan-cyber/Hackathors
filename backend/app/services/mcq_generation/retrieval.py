import os
import pickle
import faiss
from sentence_transformers import SentenceTransformer

# Config (resolve paths relative to this file)
EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
_BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "rag"))
INDEX_PATH = os.path.join(_BASE_DIR, "vector_store", "index.faiss")
METADATA_PATH = os.path.join(_BASE_DIR, "vector_store", "metadata.pkl")

# Difficulty transformation


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


# Query generation
def generate_query(topic: str, difficulty: str, topic_description: str = "") -> str:
    """
    Generate a retrieval query string from topic, description, and difficulty.
    """
    difficulty_phrase = transform_difficulty(difficulty)
    query = f"Topic: {topic}. {topic_description}. {difficulty_phrase}."
    return query.strip()


# Load FAISS and metadata
def load_faiss_index_and_metadata(index_path: str, metadata_path: str):
    """
    Load FAISS index and metadata list from disk.
    """
    index = faiss.read_index(index_path)
    with open(metadata_path, "rb") as f:
        metadata = pickle.load(f)
    try:
        print(f"The metadata has been extracted: length = {len(metadata.get('chunks', []))}")
    except Exception:
        pass
    return index, metadata


# Retrieval
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


# Group into paragraphs
def group_into_string(chunks_list):
    """
    Combine retrieved chunks into one paragraph each.
    """
    i = 1
    paragraphs = []
    while i <= len(chunks_list):
        paragraphs.append(f"### TEXT EXTRACT {i}\n")
        paragraphs.append(chunks_list[i-1])
        paragraphs.append("\n\n")
        i += 1
    print(paragraphs)
    string_final = ''.join(paragraphs)
    return string_final


# Main pipeline
def main(topic: str, difficulty: str, k: int, topic_description: str = ""):
    print("RETRIEVAL: Generating query based on the given input")
    # Step 1: Generate query
    query = generate_query(topic, difficulty, topic_description)

    # Step 2: Load FAISS index + metadata
    print("Reading the index and metadata file...")
    index, metadata = load_faiss_index_and_metadata(INDEX_PATH, METADATA_PATH)

    # Step 3: Load embedding model
    print("Loading the embedding model...")
    model = SentenceTransformer(EMBED_MODEL_NAME)

    # Step 4: Retrieve top K chunks
    print(f"Retrieving top {k} chunks...")
    top_chunks = retrieve_top_k(query, index, metadata["chunks"], k, model)

    # Step 5: Group into paragraphs
    print("Grouping text...")
    text = group_into_string(top_chunks)

    return text


if __name__ == "__main__":
    # Example usage
    topic = "Atomic Size"
    difficulty = "medium"
    k = 2
    topic_description = "Trends in the different atomic sizes of transition elements"

    context_text = main(topic, difficulty, k, topic_description)
    print("=== Retrieved Context ===")
    print(context_text)
