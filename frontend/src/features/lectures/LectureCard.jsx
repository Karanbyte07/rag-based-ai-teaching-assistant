import { Link } from "react-router-dom";
import Icon from "../../components/ui/Icon";
import { formatTimestamp, youtubeThumbnail } from "../../lib/format";

/** A single ingested lecture card, rendered from a FAISS lecture record. */
export function LectureCard({ lecture }) {
  const { video_id, title, num_chunks, total_duration } = lecture;

  return (
    <Link
      to={`/chat?video=${encodeURIComponent(video_id)}`}
      className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl overflow-hidden
        group hover:border-primary/50 transition-all shadow-level-1 flex flex-col no-underline"
    >
      <div className="h-40 w-full relative bg-surface-container-highest overflow-hidden">
        {video_id ? (
          <img
            src={youtubeThumbnail(video_id)}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="movie" size={40} className="text-on-surface-variant/50" />
          </div>
        )}

        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Icon
            name="chat"
            size={28}
            className="text-on-surface bg-surface/80 rounded-full p-sm backdrop-blur-md border border-outline-variant/20"
          />
        </span>

        {total_duration > 0 && (
          <span className="absolute bottom-sm right-sm bg-on-background/80 backdrop-blur-md px-sm py-xs rounded
            font-label-sm text-label-sm text-surface-container-lowest">
            {formatTimestamp(total_duration)}
          </span>
        )}
      </div>

      <div className="p-lg flex flex-col flex-1">
        <div className="mb-sm">
          <span className="px-sm py-xs rounded text-[10px] font-bold uppercase tracking-wider border bg-tertiary/10 text-tertiary border-tertiary/20">
            Ready
          </span>
        </div>

        <h3 className="font-bold text-[18px] text-on-background mb-sm leading-tight line-clamp-2">
          {title}
        </h3>

        <p className="font-body-sm text-body-sm text-on-surface-variant mb-md line-clamp-2">
          {num_chunks} transcript chunks indexed and searchable.
        </p>

        <div className="flex items-center justify-between mt-auto pt-sm border-t border-outline-variant/20">
          <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
            <Icon name="graphic_eq" size={14} />
            Video
          </span>
          <span className="font-label-sm text-label-sm text-primary flex items-center gap-xs">
            <Icon name="chat" size={14} />
            Chat
          </span>
        </div>
      </div>
    </Link>
  );
}

export default LectureCard;
