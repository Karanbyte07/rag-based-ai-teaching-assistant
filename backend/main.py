import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes_chat import router as chat_router
from api.routes_ingest import router as ingest_router
from api.routes_jobs import router as jobs_router

app = FastAPI(title="RAG-based AI Teaching Assistant")

# railway environment for cookie.txt file
cookies_content = os.getenv("YT_COOKIES")
if cookies_content:
    os.makedirs("data", exist_ok=True)
    with open("data/cookies.txt", "w") as f:
        f.write(cookies_content)
    print("YouTube cookies file created from environment variable")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest_router)
app.include_router(chat_router)
app.include_router(jobs_router)


@app.get("/")
def root():
    return {"message": "RAG Teaching Assistant API is running"}