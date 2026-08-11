# ── Base image ───────────────────────────────────────────────────────────────
FROM python:3.11-slim

# ── System dependencies ───────────────────────────────────────────────────────
# ffmpeg   → required by faster-whisper to decode audio files
# libgomp1 → required by faiss-cpu for OpenMP multi-threading
# --no-install-recommends keeps the image lean (no docs/man pages etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libgomp1 \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Why we removed Deno (was here before):
# Deno is a JavaScript runtime and is NOT needed for this Python backend.
# It added ~80MB to the image and ~30s to every Railway build for no reason.

# ── Working directory ─────────────────────────────────────────────────────────
WORKDIR /app

# ── Python dependencies ───────────────────────────────────────────────────────
# Copy requirements BEFORE source code so Docker caches this expensive
# layer — if only source files change, pip install is skipped on next build.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Application source code ───────────────────────────────────────────────────
COPY . .

# ── Port ──────────────────────────────────────────────────────────────────────
EXPOSE 8000

# ── Startup command ───────────────────────────────────────────────────────────
# ${PORT:-8000}: Railway injects $PORT at runtime.
# sh -c is required so the shell expands $PORT — direct exec form doesn't expand env vars.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
