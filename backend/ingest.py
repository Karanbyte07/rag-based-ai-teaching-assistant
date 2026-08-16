import sys
from ingestion.transcript_fetcher import fetch_youtube_transcript
from ingestion.youtube_ingest import download_audio
from ingestion.transcribe import transcribe_audio
from preprocessing.chunking import chunk_segments
from embeddings.faiss_store import embed_and_store
from api.job_store import jobs as _job_store


def ingest_video(video_url: str, job_id: str = None) -> dict:
    def _set_stage(stage: str):
        """Update meta.stage in-place so the frontend poll sees the current step."""
        if job_id and job_id in _job_store:
            _job_store[job_id]["meta"]["stage"] = stage

    segments = None
    video_id = None
    title = None

    print(f"\n{'='*60}")
    print(f"[ingest] Starting ingestion process for: {video_url}")
    if job_id:
        print(f"[ingest] Job ID: {job_id}")
    print(f"{'='*60}")

    # Step 1: Try direct YouTube Transcript API (Instant, No Bot Detection, No Audio Download)
    try:
        _set_stage("transcribe")
        print(f"[ingest] [Stage: transcribe] Checking YouTube direct transcript...")
        transcript_data = fetch_youtube_transcript(video_url)
        video_id = transcript_data["video_id"]
        title = transcript_data["title"]
        segments = transcript_data["segments"]
        print(f"[ingest] [Stage: transcribe] Direct transcript acquired: '{title}' ({len(segments)} segments)")
    except Exception as e:
        print(f"[ingest] [Stage: transcribe] Direct transcript unavailable ({e}). Switching to Whisper fallback...")

    # Step 2: Fallback to yt-dlp + Faster-Whisper if video has no captions
    if not segments:
        print(f"[ingest] [Stage: download] Downloading audio with yt-dlp: {video_url}")
        _set_stage("download")
        meta = download_audio(video_url)
        video_id = meta["video_id"]
        title = meta["title"]

        print(f"[ingest] [Stage: transcribe] Transcribing audio with Faster-Whisper: '{title}'...")
        _set_stage("transcribe")
        segments = transcribe_audio(meta["audio_path"])
        print(f"[ingest] [Stage: transcribe] Whisper generated {len(segments)} segments.")

    # Step 3: Chunking
    print(f"[ingest] [Stage: chunk] Chunking {len(segments)} segments...")
    _set_stage("chunk")
    chunks = chunk_segments(segments, video_id=video_id, title=title)
    print(f"[ingest] [Stage: chunk] Created {len(chunks)} semantic text chunks.")

    # Step 4: Embedding and Storing
    print(f"[ingest] [Stage: embed] Generating embeddings and storing {len(chunks)} chunks in FAISS...")
    _set_stage("embed")
    embed_and_store(chunks)
    print(f"[ingest] [Stage: index] FAISS indexing complete.")

    _set_stage("index")

    print(f"[ingest] [SUCCESS] Ingestion completed for '{title}' (ID: {video_id})")
    print(f"{'='*60}\n")

    return {
        "video_id": video_id,
        "title": title,
        "num_chunks": len(chunks),
        "status": "completed",
    }


if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = input("Paste a YouTube video URL: ")

    result = ingest_video(url)
    print(result)