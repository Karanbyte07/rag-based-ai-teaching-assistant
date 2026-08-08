// HTTP client for the FastAPI backend. Base URL is overridable via VITE_API_URL.
export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// Single wrapper so every endpoint shares the same JSON and error handling.
async function request(path, { method = "GET", body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("Can't reach the server. Is the backend running?", { cause: err });
  }

  if (!res.ok) {
    // FastAPI returns human-readable errors under `detail`.
    const payload = await res.json().catch(() => null);
    throw new Error(payload?.detail || `Request failed (${res.status})`);
  }

  return res.json();
}

/** Queue a single YouTube video. Returns { job_id, status }. */
export const ingestVideo = (url) =>
  request("/ingest/video", { method: "POST", body: { url } });

/** Queue a playlist. Returns { job_id, status }. */
export const ingestPlaylist = (url, maxWorkers = 2) =>
  request("/ingest/playlist", { method: "POST", body: { url, max_workers: maxWorkers } });

/** Fetch one ingestion job by id. */
export const getJob = (jobId, signal) => request(`/jobs/${jobId}`, { signal });

/** List every job currently held in the server's memory. */
export const listJobs = (signal) => request("/jobs", { signal });

/** Ask a question, optionally scoped to one video. Returns { answer, sources }. */
export const askQuestion = ({ question, videoId = null, topK = 5, signal }) =>
  request("/chat", {
    method: "POST",
    body: { question, video_id: videoId, top_k: topK },
    signal,
  });

/** Connectivity probe for the backend status indicator. */
export const ping = (signal) => request("/", { signal });
