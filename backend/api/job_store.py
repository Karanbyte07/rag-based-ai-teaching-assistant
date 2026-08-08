import uuid
from datetime import datetime

# In-memory job storage — resets on server restart, fine for this project's scale
jobs: dict = {}


def create_job(job_type: str, meta: dict = None) -> str:
    """
    Naya job entry banata hai, unique job_id return karta hai.
    job_type: "video" ya "playlist"
    """
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "job_id": job_id,
        "type": job_type,
        "status": "processing",   # processing | completed | failed
        "created_at": datetime.utcnow().isoformat(),
        "meta": meta or {},
        "result": None,
        "error": None,
    }
    return job_id


def update_job(job_id: str, **kwargs):
    """
    Job dictionary ke fields update karta hai.
    Usage: update_job(job_id, status="completed", result={...})
    """
    if job_id in jobs:
        jobs[job_id].update(kwargs)


def get_job(job_id: str) -> dict | None:
    return jobs.get(job_id)


def update_playlist_progress(job_id: str, completed: int = None, failed: int = None, total: int = None):
    """
    Playlist jobs ke liye progress counters update karta hai (meta ke andar).
    """
    if job_id not in jobs:
        return

    meta = jobs[job_id]["meta"]
    if total is not None:
        meta["total_videos"] = total
    if completed is not None:
        meta["completed"] = meta.get("completed", 0) + completed
    if failed is not None:
        meta["failed"] = meta.get("failed", 0) + failed