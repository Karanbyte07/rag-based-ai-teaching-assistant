from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from concurrent.futures import ThreadPoolExecutor, as_completed

from ingest import ingest_video
from ingestion.youtube_ingest import extract_playlist_urls, BotDetectionError
from api.job_store import create_job, update_job, update_playlist_progress

router = APIRouter()


class VideoIngestRequest(BaseModel):
    url: str


class PlaylistIngestRequest(BaseModel):
    url: str
    max_workers: int = 2


def _run_video_ingestion(job_id: str, url: str):
    """Background mein chalne wala actual ingestion task — single video."""
    try:
        result = ingest_video(url, job_id=job_id)
        update_job(job_id, status="completed", result=result)
    except BotDetectionError as e:
        update_job(job_id, status="failed", error=str(e), error_code="BOT_DETECTION")
    except Exception as e:
        update_job(job_id, status="failed", error=str(e))


def _run_playlist_ingestion(job_id: str, playlist_url: str, max_workers: int):
    """Background mein chalne wala actual ingestion task — playlist, parallel."""
    try:
        video_urls = extract_playlist_urls(playlist_url)
        update_playlist_progress(job_id, total=len(video_urls))

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_url = {executor.submit(ingest_video, url): url for url in video_urls}

            for future in as_completed(future_to_url):
                url = future_to_url[future]
                try:
                    future.result()
                    update_playlist_progress(job_id, completed=1)
                except Exception as e:
                    print(f"Failed {url}: {e}")
                    update_playlist_progress(job_id, failed=1)

        update_job(job_id, status="completed")
    except Exception as e:
        update_job(job_id, status="failed", error=str(e))


@router.post("/ingest/video")
def ingest_video_endpoint(payload: VideoIngestRequest, background_tasks: BackgroundTasks):
    job_id = create_job(job_type="video", meta={"url": payload.url})
    background_tasks.add_task(_run_video_ingestion, job_id, payload.url)
    return {"job_id": job_id, "status": "processing"}


@router.post("/ingest/playlist")
def ingest_playlist_endpoint(payload: PlaylistIngestRequest, background_tasks: BackgroundTasks):
    job_id = create_job(job_type="playlist", meta={"url": payload.url, "completed": 0, "failed": 0})
    background_tasks.add_task(_run_playlist_ingestion, job_id, payload.url, payload.max_workers)
    return {"job_id": job_id, "status": "processing"}