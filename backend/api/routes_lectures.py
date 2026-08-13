import json
import os
from fastapi import APIRouter

router = APIRouter()

METADATA_PATH = "data/faiss_index/metadata.json"


def _read_lectures() -> list[dict]:
    """
    Reads the FAISS metadata file and groups chunks by video_id
    to produce a compact list of ingested lectures.
    """
    if not os.path.exists(METADATA_PATH):
        return []

    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    # Aggregate per-video stats from the flat chunk list.
    videos: dict[str, dict] = {}
    for chunk in metadata:
        vid = chunk.get("video_id")
        if not vid:
            continue

        if vid not in videos:
            videos[vid] = {
                "video_id": vid,
                "title": chunk.get("title", "Untitled"),
                "num_chunks": 0,
                "total_duration": 0.0,
            }

        videos[vid]["num_chunks"] += 1

        # The last chunk's `end` gives us the furthest timestamp.
        end = chunk.get("end", 0.0)
        if end > videos[vid]["total_duration"]:
            videos[vid]["total_duration"] = end

    return list(videos.values())


@router.get("/lectures")
def list_lectures():
    """Return every unique video that has been ingested and stored in FAISS."""
    return _read_lectures()
