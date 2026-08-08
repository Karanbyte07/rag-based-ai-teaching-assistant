// The ingestion timeline shown on the Processing screen.
export const PIPELINE_STAGES = [
  { id: "download", label: "Downloading Audio", icon: "download" },
  { id: "transcribe", label: "Transcribing", icon: "graphic_eq" },
  { id: "chunk", label: "Chunking Content", icon: "content_cut" },
  { id: "embed", label: "Generating Embeddings", icon: "linear_scale" },
  { id: "index", label: "Building FAISS Index", icon: "database" },
];

/**
 * Maps a job onto stage states.
 *
 * The API exposes one status for the whole job, so per-stage detail only appears
 * if the backend writes `meta.stage`. Without it we report the pipeline as a
 * whole rather than inventing progress — see `stagesKnown`.
 */
export function deriveStages(job) {
  const status = job?.status;
  const current = job?.meta?.stage;
  const stagesKnown = Boolean(current) || status === "completed" || status === "failed";

  if (status === "completed") {
    return { stages: PIPELINE_STAGES.map((s) => ({ ...s, state: "done" })), stagesKnown };
  }

  if (status === "failed") {
    const failedAt = PIPELINE_STAGES.findIndex((s) => s.id === current);
    return {
      stages: PIPELINE_STAGES.map((s, i) => ({
        ...s,
        state: failedAt === -1 ? "failed" : i < failedAt ? "done" : i === failedAt ? "failed" : "pending",
      })),
      stagesKnown,
    };
  }

  const activeAt = PIPELINE_STAGES.findIndex((s) => s.id === current);
  return {
    stages: PIPELINE_STAGES.map((s, i) => ({
      ...s,
      // No stage info -> every step stays neutral and the header carries the spinner.
      state: activeAt === -1 ? "unknown" : i < activeAt ? "done" : i === activeAt ? "active" : "pending",
    })),
    stagesKnown,
  };
}

/** Real percentage for playlists (completed/total); null for single videos. */
export function playlistProgress(job) {
  if (job?.type !== "playlist") return null;
  const total = job?.meta?.total_videos;
  if (!total) return null;

  const completed = job.meta.completed ?? 0;
  const failed = job.meta.failed ?? 0;
  return {
    total,
    completed,
    failed,
    percent: Math.round(((completed + failed) / total) * 100),
  };
}

export const isTerminal = (status) => status === "completed" || status === "failed";
