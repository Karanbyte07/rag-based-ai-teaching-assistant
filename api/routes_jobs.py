# api/routes_jobs.py

from fastapi import APIRouter, HTTPException
from api.job_store import get_job, jobs

router = APIRouter()


@router.get("/jobs/{job_id}")
def get_job_status(job_id: str):
    job = get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/jobs")
def list_all_jobs():
    return list(jobs.values())