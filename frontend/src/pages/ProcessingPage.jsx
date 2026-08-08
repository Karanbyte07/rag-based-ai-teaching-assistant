import { Link, useNavigate, useParams } from "react-router-dom";
import PipelineTimeline from "../features/processing/PipelineTimeline";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import { Alert, ProgressBar, Spinner } from "../components/ui/Feedback";
import { useJob } from "../hooks/useJob";
import { deriveStages, playlistProgress } from "../lib/pipeline";
import { jobTitle } from "../lib/format";

const HEADINGS = {
  processing: { icon: "auto_awesome", title: "Processing Lecture", sub: "We're analyzing the audio and building the knowledge base." },
  completed: { icon: "task_alt", title: "Lecture Ready", sub: "The transcript is indexed. Ask it anything." },
  failed: { icon: "error", title: "Processing Failed", sub: "The pipeline stopped before the lecture could be indexed." },
};

export function ProcessingPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { job, error, loading } = useJob(jobId);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-lg text-primary">
        <Spinner size={32} />
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="w-full max-w-3xl mx-auto p-lg py-2xl">
        <Alert title="Couldn't load this job">
          {error} Jobs are kept in memory, so they disappear when the backend restarts.
        </Alert>
        <Button as={Link} to="/" className="mt-lg">
          Back to home
        </Button>
      </div>
    );
  }

  const { stages, stagesKnown } = deriveStages(job);
  const playlist = playlistProgress(job);
  const heading = HEADINGS[job.status] ?? HEADINGS.processing;
  const videoId = job.result?.video_id;

  return (
    <div className="flex items-center justify-center p-md md:p-lg w-full max-w-3xl mx-auto py-xl">
      <div className="bg-surface-container-lowest rounded-xl p-lg md:p-xl w-full shadow-level-1
        border border-outline-variant/30 flex flex-col gap-lg">
        <header className="flex flex-col items-center text-center gap-sm">
          <Icon
            name={heading.icon}
            size={36}
            className={`mb-sm ${job.status === "failed" ? "text-error" : job.status === "completed" ? "text-tertiary" : "text-primary"}`}
          />
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
            {heading.title}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">{heading.sub}</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant/80 break-all max-w-lg">
            {jobTitle(job)}
          </p>
        </header>

        {/* Playlists report real counts; single videos have no percentage to show. */}
        <ProgressBar
          value={job.status === "completed" ? 100 : job.status === "failed" ? null : (playlist?.percent ?? null)}
          className="mt-md"
        />

        <div className="flex justify-between items-center px-sm gap-md">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            Overall Progress
          </span>
          <span className="font-label-sm text-label-sm text-primary font-semibold">
            {playlist
              ? `${playlist.completed} of ${playlist.total} videos${playlist.failed ? ` · ${playlist.failed} failed` : ""}`
              : job.status === "completed"
                ? `${job.result?.num_chunks ?? 0} chunks indexed`
                : "Working…"}
          </span>
        </div>

        <PipelineTimeline stages={stages} />

        {/* Be explicit that the API reports one status rather than per-stage detail. */}
        {!stagesKnown && (
          <p className="font-label-sm text-label-sm text-on-surface-variant/70 text-center px-md">
            The API reports a single job status, so individual steps aren't tracked live. They light up
            automatically once the backend records <code className="font-mono">meta.stage</code>.
          </p>
        )}

        {job.status === "failed" && job.error && (
          <Alert title="Error from the server">{job.error}</Alert>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-sm mt-md">
          {job.status === "completed" ? (
            <>
              <Button onClick={() => navigate(videoId ? `/chat?video=${encodeURIComponent(videoId)}` : "/chat")}>
                <Icon name="chat" size={18} /> Ask about this lecture
              </Button>
              <Button variant="outline" as={Link} to="/lectures">
                My Lectures
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" as={Link} to="/">
                {job.status === "failed" ? "Try another link" : "Continue in background"}
              </Button>
              {job.status === "processing" && (
                <Button variant="outline" as={Link} to="/lectures">
                  View all jobs
                </Button>
              )}
            </>
          )}
        </div>

        {job.status === "processing" && (
          <p className="font-label-sm text-label-sm text-on-surface-variant/70 text-center">
            Safe to leave this page — ingestion runs on the server and keeps going.
          </p>
        )}
      </div>
    </div>
  );
}

export default ProcessingPage;
