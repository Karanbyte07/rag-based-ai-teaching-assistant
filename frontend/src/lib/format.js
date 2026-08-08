// Display helpers shared across screens.

/** Seconds -> "M:SS", or "H:MM:SS" past an hour. */
export function formatTimestamp(seconds = 0) {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Deep-link into a YouTube video at the moment a source chunk starts. */
export const youtubeLinkAt = (videoId, startSeconds = 0) =>
  `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(startSeconds)}s`;

/** YouTube's auto-generated thumbnail for a video id. */
export const youtubeThumbnail = (videoId) =>
  `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

/** ISO timestamp -> "just now" / "5m ago" / "3d ago". */
export function formatRelativeTime(iso) {
  if (!iso) return "";
  // The backend sends naive UTC, so tag it as UTC before parsing.
  const ms = Date.parse(/[zZ]|[+-]\d{2}:\d{2}$/.test(iso) ? iso : `${iso}Z`);
  if (Number.isNaN(ms)) return "";

  const diff = Math.max(0, Date.now() - ms) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
}

/** Relevance score (cosine 0-1) -> percentage label. */
export const formatScore = (score) => `${Math.round((score ?? 0) * 100)}%`;

/** Accepts youtube.com/watch, youtube.com/playlist and youtu.be links. */
export const isValidYouTubeUrl = (url) =>
  /^https?:\/\/(www\.)?(m\.)?(youtube\.com\/(watch|playlist)\?|youtu\.be\/)/i.test(url.trim());

/** True when the URL points at a playlist rather than a single video. */
export const looksLikePlaylist = (url) => /[?&]list=/i.test(url);

/** Best-effort title for a job that may not have finished yet. */
export function jobTitle(job) {
  if (job?.result?.title) return job.result.title;
  if (job?.type === "playlist") return "YouTube playlist";
  return job?.meta?.url ?? "Untitled lecture";
}
