const BASE_URL = "http://127.0.0.1:8000";

export async function ingestVideo(url) {
  const res = await fetch(`${BASE_URL}/ingest/video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error("Failed to start video ingestion");
  return res.json();
}

export async function ingestPlaylist(url, maxWorkers = 2) {
  const res = await fetch(`${BASE_URL}/ingest/playlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, max_workers: maxWorkers }),
  });
  if (!res.ok) throw new Error("Failed to start playlist ingestion");
  return res.json();
}

export async function getJobStatus(jobId) {
  const res = await fetch(`${BASE_URL}/jobs/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch job status");
  return res.json();
}

export async function askQuestion(question, videoId = null, topK = 5) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, video_id: videoId, top_k: topK }),
  });
  if (!res.ok) throw new Error("Failed to get chat response");
  return res.json();
}