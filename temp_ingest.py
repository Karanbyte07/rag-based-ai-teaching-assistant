from ingestion.youtube_ingest import download_audio
from ingestion.transcribe import transcribe_audio
from preprocessing.chunking import chunk_segments
from embeddings.generate_embeddings import embed_and_store

def ingest_video(video_url: str) -> dict:
    print(f"Downloading: {video_url}")
    meta = download_audio(video_url)

    print(f"Transcribing: {meta['title']}")
    segments = transcribe_audio(meta["audio_path"])

    print(f"Chunking...")
    chunks = chunk_segments(segments, video_id=meta["video_id"], title=meta["title"])

    print(f"Embedding + storing...")
    embed_and_store(chunks)

    return {
        "video_id": meta["video_id"],
        "title": meta["title"],
        "num_chunks": len(chunks),
        "status": "completed",
        "segments": segments,
        "chunks": chunks,
    }


if __name__ == "__main__":
    url = input("Paste a short YouTube video URL to test: ")
    result = ingest_video(url)
    print(result)