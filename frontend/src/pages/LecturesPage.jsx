import { useState } from "react";
import { Link } from "react-router-dom";
import LectureCard from "../features/lectures/LectureCard";
import Button, { IconButton } from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import { Alert, EmptyState, Spinner } from "../components/ui/Feedback";
import { useJobs } from "../hooks/useJobs";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "completed", label: "Ready" },
  { id: "processing", label: "Processing" },
  { id: "failed", label: "Failed" },
];

export function LecturesPage() {
  const { jobs, error, loading, refresh } = useJobs();
  const [filter, setFilter] = useState("all");

  const visible = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);
  const countFor = (id) => (id === "all" ? jobs.length : jobs.filter((j) => j.status === id).length);

  return (
    <div className="w-full max-w-container-max mx-auto px-lg py-xl">
      <div className="flex flex-wrap justify-between items-end gap-md mb-xl">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">My Lectures</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Everything you've transcribed and indexed on this server.
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <IconButton onClick={refresh} aria-label="Refresh" title="Refresh">
            <Icon name="refresh" />
          </IconButton>
          <Button as={Link} to="/" variant="outline">
            <Icon name="add" size={18} /> Add lecture
          </Button>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-sm mb-lg">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-md py-sm rounded-full font-label-md text-label-md border transition-all ${
              filter === f.id
                ? "bg-primary text-on-primary border-primary"
                : "bg-surface-container-low text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high"
            }`}
          >
            {f.label} ({countFor(f.id)})
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-2xl text-primary">
          <Spinner size={28} />
        </div>
      )}

      {!loading && error && <Alert title="Couldn't load your lectures">{error}</Alert>}

      {!loading && !error && visible.length === 0 && (
        <EmptyState
          icon="video_library"
          title={filter === "all" ? "No lectures yet" : `Nothing ${filter}`}
          description={
            filter === "all"
              ? "Ingest a YouTube video or playlist to build your searchable lecture library."
              : "Try a different filter to see your other lectures."
          }
          action={
            filter === "all" ? (
              <Button as={Link} to="/">
                Add your first lecture
              </Button>
            ) : null
          }
        />
      )}

      {visible.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
          {visible.map((job) => (
            <LectureCard key={job.job_id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}

export default LecturesPage;
