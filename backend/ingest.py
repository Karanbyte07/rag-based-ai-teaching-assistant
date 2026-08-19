import sys
import os
from ingestion.youtube_ingest import download_audio
from ingestion.transcribe import transcribe_audio
from ingestion.youtube_transcript import fetch_transcript_segments
from preprocessing.chunking import chunk_segments
from embeddings.faiss_store import embed_and_store
from api.job_store import jobs as _job_store


def ingest_video(video_url: str, job_id: str = None) -> dict:
    def _set_stage(stage: str):
        """Update meta.stage in-place so the frontend poll sees the current step."""
        if job_id and job_id in _job_store:
            _job_store[job_id]["meta"]["stage"] = stage

    # New path: attempt transcript API first; fallback to the existing audio pipeline.
    use_transcript_api = os.getenv("USE_YOUTUBE_TRANSCRIPT_API", "true").lower() in {"1", "true", "yes"}

    if use_transcript_api:
        try:
            print(f"Trying YouTube Transcript API for: {video_url}")
            _set_stage("transcript")
            transcript_meta = fetch_transcript_segments(video_url)
            meta = {
                "video_id": transcript_meta["video_id"],
                "title": transcript_meta.get("title") or transcript_meta["video_id"],
                "duration": transcript_meta.get("duration", 0),
            }
            segments = transcript_meta["segments"]
            print("Transcript API succeeded; skipping audio download/transcribe")
        except Exception as e:
            print(f"Transcript API failed, falling back to yt-dlp + whisper: {e}")
            print(f"Downloading: {video_url}")
            _set_stage("download")
            meta = download_audio(video_url)

            print(f"Transcribing: {meta['title']}")
            _set_stage("transcribe")
            segments = transcribe_audio(meta["audio_path"])
    else:
        print(f"Downloading: {video_url}")
        _set_stage("download")
        meta = download_audio(video_url)

        print(f"Transcribing: {meta['title']}")
        _set_stage("transcribe")
        segments = transcribe_audio(meta["audio_path"])

    print(f"Chunking...")
    _set_stage("chunk")
    chunks = chunk_segments(segments, video_id=meta["video_id"], title=meta["title"])

    print(f"Embedding + storing...")
    _set_stage("embed")
    embed_and_store(chunks)

    _set_stage("index")

    return {
        "video_id": meta["video_id"],
        "title": meta["title"],
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