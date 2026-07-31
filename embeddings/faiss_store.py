import os
import json
import faiss
import numpy as np
from embeddings.embedding_utils import create_embedding

FAISS_INDEX_PATH = "data/faiss_index/index.faiss"
METADATA_PATH = "data/faiss_index/metadata.json"
EMBEDDING_DIM = 384  # all-MiniLM-L6-v2 ka output dimension

_index = None
_metadata = []

# load the index and metadata from disk and create new if not exist
def _load_or_create_index():
    global _index, _metadata

    os.makedirs("data/faiss_index", exist_ok=True)

    if os.path.exists(FAISS_INDEX_PATH):
        _index = faiss.read_index(FAISS_INDEX_PATH)
        with open(METADATA_PATH, "r", encoding="utf-8") as f:
            _metadata = json.load(f)
    else:
        _index = faiss.IndexFlatIP(EMBEDDING_DIM)
        _metadata = []

    return _index, _metadata

#embed chunk and store in faiss index and metadata store
def embed_and_store(chunks: list[dict]):
    index, metadata = _load_or_create_index()

    texts = [chunk["text"] for chunk in chunks]
    embeddings = create_embedding(texts)

    embeddings_array = np.array(embeddings, dtype="float32")

    # normalize embeddings to unit vectors so that inner product = cosine similarity
    faiss.normalize_L2(embeddings_array)

    index.add(embeddings_array)
    metadata.extend(chunks) #same order to sync faiss and metadata

    # save on disk
    faiss.write_index(index, FAISS_INDEX_PATH)
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    print(f"Stored {len(chunks)} chunks. Total in index: {index.ntotal}")