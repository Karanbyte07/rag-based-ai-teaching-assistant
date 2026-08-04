from ingestion.youtube_ingest import download_audio
from ingestion.transcribe import transcribe_audio
from preprocessing.chunking import chunk_segments  
from embeddings.faiss_store import embed_and_store

def ingest_video(video_url: str) -> dict:
    print(f"Downloading: {video_url}")
    meta = download_audio(video_url)

    print(f"Transcribing: {meta['title']}")
    segments = transcribe_audio(meta["audio_path"])

    print(f"Chunking...")
    chunks = chunk_segments(
        segments,
        video_id=meta["video_id"],
        title=meta["title"],
    )

    print(f"Embedding + storing in FAISS...")
    embed_and_store(chunks)

    return {
        "video_id": meta["video_id"],
        "title": meta["title"],
        "num_chunks": len(chunks),
        "status": "completed",
    }