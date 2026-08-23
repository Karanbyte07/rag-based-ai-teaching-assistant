# 🎓 RAG-based AI Teaching Assistant

> Turn any Hindi YouTube lecture into a searchable, timestamped knowledge base.

Paste a YouTube video or playlist URL — the system automatically downloads, transcribes, translates, chunks, and indexes it. Students can then ask natural-language questions and get answers grounded in the actual lecture, with clickable timestamps pointing to the exact moment it was taught.

**Built as an end-to-end RAG (Retrieval-Augmented Generation) system:**
`Audio Ingestion → Speech-to-Text → Semantic Chunking → Vector Search → LLM-Grounded Answers`

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔗 **Zero manual work** | Paste a YouTube URL — everything is automated |
| 🇮🇳 **Hindi → English pipeline** | Transcribes + translates lecture audio in a single step via `faster-whisper` |
| ⏱️ **Timestamp-cited answers** | Every answer links to the exact video and second it came from |
| 🧠 **Explain-first responses** | The model explains the concept in its own words, grounded in the transcript — not just a pointer |
| ⚡ **Async ingestion** | Background jobs with per-stage live progress (`download → transcribe → chunk → embed → index`) |
| 📂 **Playlist support** | Ingest an entire course in one request; per-video failure isolation (one bad video doesn't abort the batch) |
| 💾 **Persistent vector search** | FAISS-backed semantic retrieval with on-disk metadata — survives container restarts |
| 🔀 **Dual LLM support** | Switch between **Azure OpenAI** and **Google Gemini** via a single environment variable |
| 📋 **Lecture management** | List and delete ingested lectures via API |
| 🎨 **Full React frontend** | Multi-page SPA with chat, lecture library, processing status, and settings pages |


---

## 🎬 Demo

https://github.com/user-attachments/assets/6967dd85-a8e6-4444-8633-6fd23fcc0d5a

---

## 🏗️ Architecture


```
YouTube URL (video or playlist)
        │
        ▼
┌─────────────────────────────┐
│        FastAPI Backend       │
│  POST /ingest/video          │──► returns job_id immediately (non-blocking)
│  POST /ingest/playlist        │
└──────────┬──────────────────┘
           │  runs in BackgroundTask
           ▼
    download_audio()          → yt-dlp: pulls audio-only stream from YouTube
           ▼
    transcribe_audio()         → faster-whisper: Hindi audio → English text segments
           ▼
    chunk_segments()            → 45s overlapping sliding-window chunks (10s overlap)
           ▼
    embed_and_store()            → all-MiniLM-L6-v2 → FAISS IndexFlatIP (cosine via L2-norm)
           ▼
    Job status → "completed"
           │
           ▼
GET /jobs/{job_id}        ← poll for per-stage ingestion progress
GET /lectures              ← list every indexed lecture (persistent on disk)
           │
           ▼
POST /chat  { question, video_id?, top_k? }
           │
           ▼
    retrieve()   → FAISS similarity search → top-k relevant chunks
                    (video_id filter: search 4× then post-filter)
           ▼
    build_prompt() → explain-first structure → Azure OpenAI / Gemini
           ▼
    { answer, sources[] } → React frontend renders clickable timestamp cards
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Audio Download** | `yt-dlp` (android player client bypass), `ffmpeg` |
| **Speech-to-Text** | `faster-whisper` (CTranslate2, `base` model, `int8` quantized) |
| **Embeddings** | `sentence-transformers` — `all-MiniLM-L6-v2` (384-dim) |
| **Vector Store** | `faiss-cpu` — `IndexFlatIP` with L2-normalized vectors (= cosine similarity) |
| **LLM** | Azure OpenAI **or** Google Gemini (`gemini-2.0-flash`) — switchable via `LLM_PROVIDER` |
| **Backend** | FastAPI, `BackgroundTasks`, Pydantic v2 |
| **Frontend** | React 19, React Router v7, Tailwind CSS, `react-markdown` |
| **Containerization** | Docker (python:3.11-slim + ffmpeg + Deno) |
| **Deployment** | Railway (backend) + Netlify (frontend) |

---

## 📁 Project Structure

```
├── backend/
│   ├── api/
│   │   ├── job_store.py           # In-memory job tracking (status, stage, progress)
│   │   ├── routes_chat.py         # POST /chat — dual-provider LLM + retrieval
│   │   ├── routes_ingest.py       # POST /ingest/video, /ingest/playlist
│   │   ├── routes_jobs.py         # GET /jobs/{id} — async job status polling
│   │   └── routes_lectures.py     # GET /lectures, DELETE /lectures/{id}
│   ├── embeddings/
│   │   ├── embedding_utils.py     # all-MiniLM-L6-v2 embedding wrapper
│   │   └── faiss_store.py         # FAISS index + metadata.json persistence & deletion
│   ├── ingestion/
│   │   ├── ingest_video.py        # Orchestrates the full per-video pipeline
│   │   ├── transcribe.py          # faster-whisper: lazy-loaded, language=hi, task=translate
│   │   └── youtube_ingest.py      # yt-dlp download + playlist URL extraction
│   ├── legacy/                    # ← see "Legacy Code" section below
│   ├── preprocessing/
│   │   └── chunking.py            # Segment-respecting sliding-window chunking (45s / 10s overlap)
│   ├── rag/
│   │   └── retrieve.py            # FAISS similarity search + optional video_id post-filter
│   ├── ingest.py                  # CLI entrypoint: python ingest.py <url>
│   ├── main.py                    # FastAPI app entrypoint + CORS config
│   ├── Dockerfile                 # python:3.11-slim + ffmpeg + Deno + requirements
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── pages/                 # HomePage, ChatPage, LecturesPage, ProcessingPage, SettingsPage, NotFoundPage
│       ├── features/              # Feature-scoped components: chat/, home/, lectures/, processing/
│       ├── components/            # Shared layout (RootLayout) + UI primitives
│       ├── hooks/                 # useChat, useJob, useJobs, useLectures, useTheme
│       ├── context/               # AppContext — global app state
│       ├── lib/                   # api.js, storage.js, pipeline.js, format.js
│       └── styles/                # Global Tailwind styles
│
├── docker-compose.yml             # Local dev: backend + named volumes for data & HF cache
├── netlify.toml                   # Netlify build config + SPA fallback redirect
└── .env.example                   # All required environment variables with comments
```

### 🗂️ Legacy Code (`backend/legacy/`)

`backend/legacy/` contains the **original manual pipeline** this project evolved from, kept for reference and not imported anywhere in the active application:

| File | What it was | Replaced by |
|---|---|---|
| `extract_audio.py` | Scanned a local `data/videos/` folder and ran `ffmpeg` on each `.mkv` file manually | `ingestion/youtube_ingest.py` → `download_audio()` |
| `transcribe.py` | Original `openai-whisper` transcription script (synchronous, eager-loaded) | `ingestion/transcribe.py` → `faster-whisper` (lazy-loaded, `int8` quantized) |
| `chat.py` | CLI Q&A script — `input()` → `retrieve()` → Azure OpenAI → print to stdout + write to `data/response.txt` | `api/routes_chat.py` → full REST endpoint with dual LLM support |

### 🌿 Branches

| Branch | Description |
|---|---|
| **`main`** | Current, actively developed version (FastAPI + React + FAISS + async ingestion) |
| **`basic-v1`** | Original prototype — linear script-based pipeline: manual video files → Whisper → pickle-based cosine similarity → CLI chat. No FAISS, no FastAPI, no frontend. Kept as a snapshot of the project's starting point. |
| `frontend`, `v3`, `optimization`, `deployment*`, `bug-fix*` | Development branches from various build stages; progressively merged into `main` |

---

## 🚀 Getting Started

### Prerequisites

- Python **3.11+**
- Node.js **20+**
- `ffmpeg` installed and on your `PATH`
- An **Azure OpenAI** _or_ **Google Gemini** API key

### 1. Clone the repository

```bash
git clone https://github.com/Karanbyte07/rag-based-ai-teaching-assistant.git
cd rag-based-ai-teaching-assistant
```

### 2. Backend setup

```bash
cd backend
python -m venv .venv

# Linux/macOS
source .venv/bin/activate

# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

Copy and fill in the environment file:

```bash
cp ../.env.example .env
# Edit .env and add your API keys
```

Start the dev server:

```bash
uvicorn main:app --reload
```

API docs available at → `http://127.0.0.1:8000/docs`

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Create a `frontend/.env` file:

```bash
VITE_API_URL=http://127.0.0.1:8000
```

### 4. Environment Variables

See [`.env.example`](.env.example) for the full annotated list. Key variables:

```bash
# LLM provider — choose one: 'azure' | 'gemini'
LLM_PROVIDER=azure

# Hugging Face token (for downloading the MiniLM model)
HF_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── Azure OpenAI ──────────────────────────────────────────────────────────────
AZURE_OPENAI_API_KEY=<your-key>
AZURE_OPENAI_ENDPOINT=https://<resource>.openai.azure.com/openai/deployments/<deployment>/chat/completions?api-version=2025-04-01-preview
AZURE_OPENAI_DEPLOYMENT_NAME=<your-deployment>

# ── Google Gemini ──────────────────────────────────────────────────────────────
GEMINI_API_KEY=<your-key>
GEMINI_MODEL_NAME=gemini-2.0-flash
```

### 5. Local Docker (optional)

Run the backend in a container with persistent volumes for FAISS data and the Hugging Face model cache:

```bash
docker-compose up --build
```

---

## ☁️ Deployment

### Backend → Railway

1. Connect your GitHub repo to Railway and point it at the `backend/` directory (the `Dockerfile` is inside).
2. **Add a persistent Volume** mounted at `/app/data` — this is **critical**. The FAISS index (`data/faiss_index/`), audio files (`data/audios/`), and chunk metadata are stored on disk and would be wiped on every redeploy without it.
3. Set all required environment variables in the Railway dashboard.

### Frontend → Netlify

1. Connect your GitHub repo to Netlify. Build settings are pre-configured in [`netlify.toml`](netlify.toml):
   - **Base:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
2. Set `VITE_API_URL` in the Netlify environment variables to your deployed Railway backend URL.
3. The `netlify.toml` also includes a `/api/*` proxy redirect to avoid mixed-content HTTPS→HTTP issues.

---

## ⚠️ Known Issues

### YouTube Bot-Detection on Cloud-Hosted IPs (Unresolved)

YouTube applies stricter bot-detection to requests originating from **datacenter/cloud IP ranges** (Railway, AWS, GCP, etc.) compared to residential connections. In practice, ingestion that works reliably on a local machine can intermittently fail on the deployed backend with errors such as:

```
HTTP Error 403: Forbidden
Sign in to confirm you're not a bot
```

**Mitigations already attempted (in the current codebase):**

- Forcing `yt-dlp`'s **Android player client** (`player_client: ["android"]`) to bypass some web-client-specific JS challenges.
- Installing **Deno** inside the Docker image so `yt-dlp` can solve YouTube's JavaScript signature challenges natively.
- Passing **authenticated YouTube cookies** via an environment variable, written to disk at container startup.
- Trying **`pytubefix`** with the `ANDROID_VR` client as an alternative extraction path.

**Current status:** These mitigations reduce the failure rate but don't eliminate it. YouTube's detection changes frequently, and datacenter IPs (including Railway's) remain more likely to be challenged than a residential IP. This is a **well-documented, industry-wide limitation** of `yt-dlp`/`pytubefix` on cloud platforms, not a bug specific to this codebase.

> ✅ **Ingestion is generally reliable when run locally.**

**Possible future fixes:**
- Routing outbound YouTube requests through a **residential proxy**.
- Self-hosting the backend on a **VPS with a less-flagged IP range** (e.g., Hetzner, OVH).
- Exploring `yt-dlp`'s `--cookies-from-browser` in a persistent headless browser sidecar.

---

## 🗺️ Roadmap

- [ ] Hybrid search (BM25 + FAISS) with cross-encoder reranking
- [ ] Session-based data isolation without full authentication
- [ ] Persistent job history (currently in-memory, resets on backend restart)
- [ ] Resolve YouTube cloud-IP bot detection more reliably (see Known Issues)
- [ ] Support for non-Hindi / multilingual lecture audio
- [ ] User-configurable chunking parameters (chunk size, overlap)

---

## 🧩 How It Works — Deep Dive

### Stage 1 — Audio Download (`ingestion/youtube_ingest.py`)

`yt-dlp` downloads the best audio-only stream for a given video URL and post-processes it to MP3 via `ffmpeg`. The **Android player client** (`player_client: ["android"]`) is configured to reduce bot-detection friction on cloud IPs. For playlists, `extract_flat` mode extracts all video IDs without downloading, which are then dispatched to a `ThreadPoolExecutor` with configurable `max_workers`.

### Stage 2 — Transcription (`ingestion/transcribe.py`)

`faster-whisper` (CTranslate2 backend) is loaded **lazily at module import time** — once per process lifetime — using the `base` model with `int8` quantization for CPU efficiency. It is called with `language="hi"` and `task="translate"`, producing **English text segments** with precise `start`/`end` timestamps directly, without a separate translation step.

### Stage 3 — Chunking (`preprocessing/chunking.py`)

Raw Whisper segments are merged into **~45-second overlapping chunks** with a **10-second trailing overlap**, respecting segment boundaries (no mid-sentence cuts). Each chunk carries `video_id`, `title`, `start`, `end`, `duration`, and `text`. This ensures semantic coherence at retrieval time.

### Stage 4 — Embedding & Indexing (`embeddings/`)

Chunk texts are batched through `sentence-transformers` (`all-MiniLM-L6-v2`, 384-dim). Embeddings are **L2-normalized** before being added to a `faiss.IndexFlatIP` index — making inner product mathematically equivalent to cosine similarity. The index and a parallel `metadata.json` (same positional order) are persisted to `data/faiss_index/` on disk, surviving restarts. Deletion rebuilds the index in-place using `index.reconstruct()`.

### Stage 5 — Retrieval (`rag/retrieve.py`)

At query time, the question is embedded and L2-normalized identically. FAISS returns `top_k` nearest neighbors by inner product (= cosine similarity). If a `video_id` filter is requested (chat scoped to a specific lecture), the search retrieves `4 × top_k` candidates and post-filters to the target video — compensating for FAISS's lack of native metadata filtering.

### Stage 6 — Answer Generation (`api/routes_chat.py`)

Retrieved chunks are formatted as `[title | start - end]\ntext` context blocks and injected into a structured system prompt that instructs the LLM to **explain first, then cite**. The `LLM_PROVIDER` environment variable selects between **Azure OpenAI** (`openai.AzureOpenAI`) and **Google Gemini** (`google.genai.Client`), both initialized lazily at startup only for the active provider.

---


## 📄 License

This project is available for **educational and portfolio purposes**.
