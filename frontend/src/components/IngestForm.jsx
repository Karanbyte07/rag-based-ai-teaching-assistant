import { useState, useEffect } from "react";
import { ingestVideo, ingestPlaylist, getJobStatus } from "../api";

function IngestForm({ onIngestComplete }) {
  const [url, setUrl] = useState("");
  const [type, setType] = useState("video"); // "video" or "playlist"
  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);

  // Form submission initiates ingestion
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setJob(null);

    try {
      const response =
        type === "video" ? await ingestVideo(url) : await ingestPlaylist(url);
      setJobId(response.job_id);
    } catch (err) {
      setError(err.message);
    }
  };

  // Start polling for status once job_id is set
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const data = await getJobStatus(jobId);
        setJob(data);

        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
          if (data.status === "completed") {
            onIngestComplete(data); // notify parent that it's ready
          }
        }
      } catch (err) {
        setError(err.message);
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval); // cleanup on component unmount
  }, [jobId]);

  return (
    <div className="ingest-form">
      <form onSubmit={handleSubmit}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="video">Single Video</option>
          <option value="playlist">Playlist</option>
        </select>

        <input
          type="text"
          placeholder="Paste YouTube URL here"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />

        <button type="submit" disabled={jobId && job?.status === "processing"}>
          Ingest
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {job && (
        <div className="job-status">
          <p>Status: {job.status}</p>
          {job.type === "playlist" && job.meta && (
            <p>
              Progress: {job.meta.completed || 0} / {job.meta.total_videos || "?"} videos
              {job.meta.failed > 0 && ` (${job.meta.failed} failed)`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default IngestForm;