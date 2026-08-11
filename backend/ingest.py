import gc
import os
import sys

from ingestion.youtube_ingest import download_audio
from ingestion.transcribe import transcribe_audio
from preprocessing.chunking import chunk_segments
from embeddings.faiss_store import embed_and_store
from api.job_store import jobs as _job_store


def ingest_video(video_url: str, job_id: str = None) -> dict:
    def _set_stage(stage: str):
        if job_id and job_id in _job_store:
            _job_store[job_id]["meta"]["stage"] = stage

    print(f"Downloading: {video_url}")
    _set_stage("download")
    meta = download_audio(video_url)
    audio_path = meta["audio_path"]

    print(f"Transcribing: {meta['title']}")
    _set_stage("transcribe")
    segments = transcribe_audio(audio_path)

    gc.collect()

    if audio_path and os.path.exists(audio_path):
        os.remove(audio_path)

    print("Chunking...")
    _set_stage("chunk")
    chunks = chunk_segments(segments, video_id=meta["video_id"], title=meta["title"])

    print(f"Embedding + storing {len(chunks)} chunks...")
    _set_stage("embed")
    embed_and_store(chunks)

    gc.collect()
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