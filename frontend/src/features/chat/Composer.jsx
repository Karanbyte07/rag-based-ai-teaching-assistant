import { useEffect, useRef, useState } from "react";
import Icon from "../../components/ui/Icon";

const MAX_HEIGHT = 128;

/** Docked input. Enter sends, Shift+Enter adds a newline. */
export function Composer({ onSend, onStop, pending, scope, onClearScope }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  // Grow with the content up to a cap, then scroll internally.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  const submit = () => {
    const text = value.trim();
    if (!text || pending) return;
    onSend(text);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-surface-bright via-surface-bright to-transparent pt-xl pb-lg px-md md:px-xl">
      <div className="max-w-3xl mx-auto">
        {scope && (
          <div className="flex justify-center mb-sm">
            <span className="inline-flex items-center gap-xs bg-primary/10 text-primary border border-primary/20
              rounded-full pl-md pr-xs py-xs font-label-sm text-label-sm max-w-full">
              <Icon name="filter_alt" size={14} />
              <span className="truncate">Scoped to {scope.title}</span>
              <button
                onClick={onClearScope}
                className="p-0.5 rounded-full hover:bg-primary/20 transition-colors shrink-0"
                aria-label="Search all lectures instead"
              >
                <Icon name="close" size={14} />
              </button>
            </span>
          </div>
        )}

        <div className="relative glass-panel rounded-xl shadow-level-1 border border-outline-variant p-2 flex items-end">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your lectures..."
            aria-label="Your question"
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-2
              font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/70
              min-h-[44px] outline-none"
            style={{ maxHeight: MAX_HEIGHT }}
          />

          <button
            onClick={pending ? onStop : submit}
            disabled={!pending && !value.trim()}
            aria-label={pending ? "Stop generating" : "Send question"}
            className="p-2 bg-primary text-on-primary rounded-lg shadow-sm mb-1 ml-2 shrink-0
              flex items-center justify-center w-10 h-10 group transition-all
              hover:bg-primary/90 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Icon
              name={pending ? "stop" : "send"}
              size={20}
              className={pending ? "" : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"}
            />
          </button>
        </div>

        <p className="text-center mt-2 font-label-sm text-[11px] text-on-surface-variant/60">
          Lectra AI can make mistakes. Consider verifying important academic information.
        </p>
      </div>
    </div>
  );
}

export default Composer;
