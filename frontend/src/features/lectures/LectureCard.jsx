import { Link } from "react-router-dom";
import Icon from "../../components/ui/Icon";
import { formatRelativeTime, jobTitle, youtubeThumbnail } from "../../lib/format";

const STATUS_STYLES = {
  completed: { label: "Ready", className: "bg-tertiary/10 text-tertiary border-tertiary/20" },
  processing: { label: "Processing", className: "bg-primary/10 text-primary border-primary/20" },
  failed: { label: "Failed", className: "bg-error/10 text-error border-error/20" },
};

/** One ingested lecture (or playlist), rendered from a job record. */
export function LectureCard({ job }) {
  const videoId = job.result?.video_id;
  const status = STATUS_STYLES[job.status] ?? STATUS_STYLES.processing;
  const isPlaylist = job.type === "playlist";

  // Completed videos open scoped chat; anything else goes back to its progress view.
  const href = job.status === "completed" && videoId
    ? `/chat?video=${encodeURIComponent(videoId)}`
    : `/processing/${job.job_id}`;

  return (
    <Link
      to={href}
      className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden
        group hover:border-primary/50 transition-all shadow-level-1 flex flex-col no-underline"
    >
      <div className="h-40 w-full relative bg-surface-container-highest overflow-hidden">
        {videoId ? (
          <img
            src={youtubeThumbnail(videoId)}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name={isPlaylist ? "playlist_play" : "movie"} size={40} className="text-on-surface-variant/50" />
          </div>
        )}

        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Icon
            name="play_arrow"
            size={32}
            className="text-on-surface bg-surface/80 rounded-full p-sm backdrop-blur-md border border-outline-variant/20"
          />
        </span>

        {isPlaylist && job.meta?.total_videos > 0 && (
          <span className="absolute bottom-sm right-sm bg-on-background/80 backdrop-blur-md px-sm py-xs rounded
            font-label-sm text-label-sm text-surface-container-lowest">
            {job.meta.total_videos} videos
          </span>
        )}
      </div>

      <div className="p-lg flex flex-col flex-1">
        <div className="mb-sm">
          <span className={`px-sm py-xs rounded text-[10px] font-bold uppercase tracking-wider border ${status.className}`}>
            {status.label}
          </span>
        </div>

        <h3 className="font-bold text-[18px] text-on-background mb-sm leading-tight line-clamp-2">
          {jobTitle(job)}
        </h3>

        <p className="font-body-sm text-body-sm text-on-surface-variant mb-md line-clamp-2">
          {job.status === "failed"
            ? job.error || "Ingestion failed."
            : isPlaylist
              ? `${job.meta?.completed ?? 0} of ${job.meta?.total_videos ?? "?"} videos indexed.`
              : `${job.result?.num_chunks ?? 0} transcript chunks indexed and searchable.`}
        </p>

        <div className="flex items-center justify-between mt-auto pt-sm border-t border-outline-variant/20">
          <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
            <Icon name={isPlaylist ? "playlist_play" : "graphic_eq"} size={14} />
            {isPlaylist ? "Playlist" : "Video"}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {formatRelativeTime(job.created_at)}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default LectureCard;
