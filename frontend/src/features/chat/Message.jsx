import { useState } from "react";
import Icon from "../../components/ui/Icon";
import { Alert } from "../../components/ui/Feedback";
import Markdown from "./Markdown";
import SourceCard from "./SourceCard";

export function UserMessage({ content }) {
  return (
    <div className="flex justify-end mb-lg animate-slide-up">
      <div className="bg-surface text-on-surface rounded-xl rounded-tr-sm px-lg py-md max-w-[80%]
        shadow-level-1 border border-outline-variant">
        <p className="font-body-md text-body-md whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

/** Copy + regenerate hit the API; the rating is local to this browser. */
function MessageActions({ content, onRegenerate, rating, onRate, disabled }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard is unavailable outside secure contexts — fail quietly.
    }
  };

  const actionClass = (active) =>
    `p-1 rounded transition-colors hover:bg-surface-container-high ${
      active ? "text-primary" : "text-on-surface-variant hover:text-primary"
    }`;

  return (
    <div className="flex items-center gap-sm px-sm">
      <button onClick={copy} className={actionClass(copied)} title={copied ? "Copied" : "Copy response"}>
        <Icon name={copied ? "check" : "content_copy"} size={18} />
      </button>
      <button onClick={onRegenerate} disabled={disabled} className={actionClass(false)} title="Regenerate">
        <Icon name="refresh" size={18} />
      </button>
      <span className="h-4 w-px bg-outline-variant mx-1" />
      <button onClick={() => onRate(rating === "up" ? null : "up")} className={actionClass(rating === "up")} title="Good response">
        <Icon name="thumb_up" size={18} filled={rating === "up"} />
      </button>
      <button
        onClick={() => onRate(rating === "down" ? null : "down")}
        className={`p-1 rounded transition-colors hover:bg-surface-container-high ${
          rating === "down" ? "text-error" : "text-on-surface-variant hover:text-error"
        }`}
        title="Bad response"
      >
        <Icon name="thumb_down" size={18} filled={rating === "down"} />
      </button>
    </div>
  );
}

export function AssistantMessage({ message, onRegenerate, onRate, pending }) {
  const { content, sources = [], status, error, rating } = message;

  return (
    <div className="flex items-start gap-md animate-slide-up">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm mt-1">
        <Icon name="auto_awesome" size={18} className="text-on-primary" />
      </div>

      <div className="flex-1 min-w-0 space-y-md">
        <div className="bg-surface text-on-surface rounded-xl rounded-tl-sm px-lg py-md
          border border-outline-variant border-l-4 border-l-primary shadow-level-1
          bg-gradient-to-br from-surface to-surface-container-low">
          {status === "pending" && (
            <p className="flex items-center gap-sm font-body-md text-body-md text-on-surface-variant">
              <Icon name="auto_awesome" size={18} className="text-primary animate-pulse-subtle" />
              Searching the transcripts…
            </p>
          )}

          {status === "error" && <Alert title="Couldn't answer that">{error}</Alert>}

          {status === "done" && (
            <>
              <Markdown>{content}</Markdown>

              {sources.length > 0 && (
                <div className="mt-lg pt-md border-t border-outline-variant">
                  <h5 className="font-label-sm text-label-sm text-tertiary uppercase tracking-wider mb-sm flex items-center gap-xs">
                    <Icon name="format_quote" size={14} /> Sources Cited
                  </h5>
                  <div className="flex flex-wrap gap-md">
                    {sources.map((source, i) => (
                      <SourceCard key={`${source.video_id}-${source.start}-${i}`} source={source} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {status === "done" && (
          <MessageActions
            content={content}
            rating={rating}
            onRate={(value) => onRate(message.id, value)}
            onRegenerate={onRegenerate}
            disabled={pending}
          />
        )}
      </div>
    </div>
  );
}
