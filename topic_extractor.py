# topic_extractor.py
from keybert import KeyBERT
import yake

# Improved model for better topic accuracy
kw_model = KeyBERT(model='paraphrase-MiniLM-L12-v2')

def extract_keybert_topics(text, top_n=10):
    keywords = kw_model.extract_keywords(
        text,
        keyphrase_ngram_range=(1, 3),
        stop_words='english',
        top_n=top_n
    )
    return [kw[0] for kw in keywords]

def extract_yake_topics(text, top_n=10):
    kw_extractor = yake.KeywordExtractor(n=3, top=top_n)
    keywords = kw_extractor.extract_keywords(text)
    return [kw for kw, _ in keywords]

