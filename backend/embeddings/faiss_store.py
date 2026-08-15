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


def delete_video_data(video_id: str) -> dict:
    """
    Removes all data for a given video_id:
      1. Removes its vectors from the FAISS index (rebuild required).
      2. Removes matching entries from metadata.json.
      3. Deletes the audio file (data/audios/{video_id}.mp3).
      4. Deletes any chunk JSON files in data/chunks/ that belong to this video.
    Returns a summary dict.
    """
    global _index, _metadata

    index, metadata = _load_or_create_index()

    # --- 1. Identify which indices to keep (everything except this video_id) ---
    keep_indices = [i for i, m in enumerate(metadata) if m.get("video_id") != video_id]
    removed_count = len(metadata) - len(keep_indices)

    if removed_count == 0:
        return {"video_id": video_id, "removed_chunks": 0, "detail": "Video not found in index"}

    # --- 2. Rebuild FAISS index without the deleted vectors ---
    if keep_indices:
        # Reconstruct the vectors we want to keep
        kept_vectors = np.array(
            [index.reconstruct(int(i)) for i in keep_indices], dtype="float32"
        )
        new_index = faiss.IndexFlatIP(EMBEDDING_DIM)
        new_index.add(kept_vectors)
    else:
        new_index = faiss.IndexFlatIP(EMBEDDING_DIM)

    new_metadata = [metadata[i] for i in keep_indices]

    # Save to disk
    faiss.write_index(new_index, FAISS_INDEX_PATH)
    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(new_metadata, f, ensure_ascii=False, indent=2)

    # Invalidate in-memory cache so next retrieve() picks up the change
    _index = new_index
    _metadata = new_metadata

    # --- 3. Delete audio file ---
    deleted_files = []
    for ext in ("mp3", "webm", "m4a", "wav"):
        audio_path = os.path.join("data", "audios", f"{video_id}.{ext}")
        if os.path.exists(audio_path):
            os.remove(audio_path)
            deleted_files.append(audio_path)

    # --- 4. Delete chunk JSON files that contain this video_id ---
    chunks_dir = os.path.join("data", "chunks")
    if os.path.isdir(chunks_dir):
        for fname in os.listdir(chunks_dir):
            if not fname.endswith(".json"):
                continue
            fpath = os.path.join(chunks_dir, fname)
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    chunk_data = json.load(f)
                # Check if the file's chunks belong to this video
                items = chunk_data if isinstance(chunk_data, list) else chunk_data.get("chunks", [])
                if items and any(c.get("video_id") == video_id for c in items):
                    os.remove(fpath)
                    deleted_files.append(fpath)
            except Exception:
                pass

    print(f"Deleted {removed_count} chunks for video {video_id}. Files removed: {deleted_files}")

    return {
        "video_id": video_id,
        "removed_chunks": removed_count,
        "deleted_files": deleted_files,
        "remaining_total": new_index.ntotal,
    }