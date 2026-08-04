import faiss
import numpy as np
from embeddings.embedding_utils import create_embedding
from embeddings.faiss_store import _load_or_create_index

# embed the query using create_embedding function
# retrieve top_k similar chunks using faiss.search() and if the video id is not none then filter the chunks

def retrieve(incoming_query: str, top_k: int = 5, video_id: str = None):
    index, metadata = _load_or_create_index()

    if index.ntotal == 0:
        return []

    query_embedding = create_embedding([incoming_query])[0]
    query_array = np.array([query_embedding], dtype="float32")
    faiss.normalize_L2(query_array)

    # if video id is given, search for more chunks because 
    # 1. video id can't be used as faiss filter (vector-level filter)
    # 2. we want to ensure at least top_k chunks *from that specific video*
    search_k = top_k * 4 if video_id else top_k
    search_k = min(search_k, index.ntotal)

    scores, indices = index.search(query_array, search_k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx == -1:
            continue
        chunk = metadata[idx]

        if video_id and chunk.get("video_id") != video_id:
            continue

        chunk_with_score = {**chunk, "score": float(score)}
        results.append(chunk_with_score)

        if len(results) >= top_k:
            break

    return results


print("FAISS retrieval module loaded successfully")