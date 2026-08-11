# ── Base image ──────────────────────────────────────────────
FROM python:3.11-slim

# ── Install system dependencies ──────────────────────────────
# ffmpeg  → required by faster-whisper for audio processing
# libgomp → required by faiss-cpu (OpenMP)
# build tools
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libgomp1 \
    build-essential \
    curl \
    unzip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# install deno for the yt-dlp
RUN curl -fsSL https://deno.land/install.sh | sh
ENV DENO_INSTALL="/root/.deno"
ENV PATH="$DENO_INSTALL/bin:$PATH"

# ── Set working directory ─────────────────────────────────────
WORKDIR /app

# ── Copy and install Python dependencies ─────────────────────
# Copy requirements first so Docker can cache this layer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Copy the rest of the backend source code ─────────────────
COPY . .

# ── Expose port (Railway injects $PORT at runtime) ───────────
EXPOSE 8000

# ── Start the FastAPI server ──────────────────────────────────
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]