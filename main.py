from fastapi import FastAPI
from api.routes_ingest import router as ingest_router
from api.routes_chat import router as chat_router
from api.routes_jobs import router as jobs_router

app = FastAPI(title="RAG-based AI Teaching Assistant")

app.include_router(ingest_router)
app.include_router(chat_router)
app.include_router(jobs_router)


@app.get("/")
def root():
    return {"message": "RAG Teaching Assistant API is running"}