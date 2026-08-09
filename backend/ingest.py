import sys
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