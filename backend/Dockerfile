# ── Base image ───────────────────────────────────────────────────────────────
FROM python:3.11-slim

# ── System dependencies ───────────────────────────────────────────────────────
# ffmpeg   → required by faster-whisper to decode audio files
# libgomp1 → required by faiss-cpu for OpenMP multi-threading
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libgomp1 \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ── Working directory ─────────────────────────────────────────────────────────
WORKDIR /app

# ── Python dependencies ───────────────────────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Application source code ───────────────────────────────────────────────────
COPY . .

# ── Port ──────────────────────────────────────────────────────────────────────
EXPOSE 8000

# ── Startup command ───────────────────────────────────────────────────────────
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
