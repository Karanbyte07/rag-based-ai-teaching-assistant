import { useEffect, useRef, useState } from "react";
import Icon from "../../components/ui/Icon";

const MAX_HEIGHT = 128;

/** Docked input. Enter sends, Shift+Enter adds a newline. */
export function Composer({ onSend, onStop, pending, scope, onClearScope, lectures = [], onSelectLecture }) {
  const [value, setValue] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const textareaRef = useRef(null);
  const pickerRef = useRef(null);

  // Grow with the content up to a cap, then scroll internally.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  // Close picker on outside click
  useEffect(() => {
    if (!showPicker) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showPicker]);

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

  const filteredLectures = lectures.filter((l) =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          {/* Lecture selector button */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => {
                setShowPicker(!showPicker);
                setSearchTerm("");
              }}
              title="Select a lecture to scope your question"
              aria-label="Select lecture"
              className={`p-2 rounded-lg mb-1 mr-1 shrink-0 flex items-center justify-center w-10 h-10
                transition-all border
                ${showPicker
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "text-on-surface-variant border-transparent hover:bg-surface-container-high hover:text-on-surface"
                }`}
            >
              <Icon name="video_library" size={20} />
            </button>

            {/* Lecture picker dropdown */}
            {showPicker && (
              <div className="absolute bottom-full left-0 mb-2 w-80 max-h-80 bg-surface-container-lowest
                border border-outline-variant/40 rounded-xl shadow-level-3 overflow-hidden flex flex-col z-50
                animate-in fade-in slide-in-from-bottom-2 duration-150">
                <div className="p-3 border-b border-outline-variant/20">
                  <div className="flex items-center gap-2 bg-surface-container-low rounded-lg px-3 py-2">
                    <Icon name="search" size={16} className="text-on-surface-variant/60 shrink-0" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search lectures..."
                      autoFocus
                      className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface
                        placeholder:text-on-surface-variant/50"
                    />
                  </div>
                </div>

                <div className="overflow-y-auto flex-1">
                  {/* "All lectures" option to clear scope */}
                  <button
                    onClick={() => {
                      onClearScope?.();
                      setShowPicker(false);
                      setSearchTerm("");
                    }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors
                      hover:bg-surface-container-high border-b border-outline-variant/10
                      ${!scope ? "bg-primary/5 text-primary" : "text-on-surface-variant"}`}
                  >
                    <Icon name="library_books" size={18} />
                    <span className="font-label-md text-label-md">All lectures</span>
                    {!scope && <Icon name="check" size={16} className="ml-auto text-primary" />}
                  </button>

                  {filteredLectures.length === 0 && (
                    <div className="px-4 py-6 text-center text-on-surface-variant/60 font-body-sm text-body-sm">
                      No lectures found.
                    </div>
                  )}

                  {filteredLectures.map((lecture) => {
                    const isActive = scope?.videoId === lecture.video_id;
                    return (
                      <button
                        key={lecture.video_id}
                        onClick={() => {
                          onSelectLecture?.(lecture);
                          setShowPicker(false);
                          setSearchTerm("");
                        }}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors
                          hover:bg-surface-container-high border-b border-outline-variant/10
                          ${isActive ? "bg-primary/5" : ""}`}
                      >
                        <img
                          src={`https://i.ytimg.com/vi/${lecture.video_id}/default.jpg`}
                          alt=""
                          className="w-10 h-7 rounded object-cover shrink-0 bg-surface-container-highest"
                        />
                        <div className="flex-1 min-w-0">
                          <span className={`block font-label-md text-label-md truncate
                            ${isActive ? "text-primary" : "text-on-surface"}`}>
                            {lecture.title}
                          </span>
                          <span className="block text-[11px] text-on-surface-variant/70 mt-0.5">
                            {lecture.num_chunks} chunks
                          </span>
                        </div>
                        {isActive && <Icon name="check" size={16} className="text-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

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
