import Icon from "../../components/ui/Icon";
import { formatScore, formatTimestamp, youtubeLinkAt, youtubeThumbnail } from "../../lib/format";

/** One retrieved transcript chunk, linking straight to its moment in the video. */
export function SourceCard({ source }) {
  const { video_id: videoId, title, start, end, score } = source;

  return (
    <a
      href={youtubeLinkAt(videoId, start)}
      target="_blank"
      rel="noopener noreferrer"
      title={`${title} — ${formatTimestamp(start)} to ${formatTimestamp(end)}`}
      className="flex bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden
        w-64 hover:shadow-md hover:border-primary/50 transition-all group no-underline"
    >
      <div className="w-20 shrink-0 bg-surface-container relative">
        <img
          src={youtubeThumbnail(videoId)}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
        <span className="absolute inset-0 bg-black/25" />
        <Icon
          name="play_circle"
          size={24}
          className="absolute inset-0 m-auto w-fit h-fit text-white z-10"
        />
      </div>

      <div className="p-sm flex-1 min-w-0">
        <h6 className="font-label-md text-[13px] font-semibold text-on-surface line-clamp-1">{title}</h6>
        <p className="font-label-sm text-[11px] text-on-surface-variant mt-0.5">
          {formatTimestamp(start)} – {formatTimestamp(end)}
        </p>
        {typeof score === "number" && (
          <p className="font-label-sm text-[11px] text-primary mt-0.5">{formatScore(score)} match</p>
        )}
      </div>
    </a>
  );
}

export default SourceCard;
