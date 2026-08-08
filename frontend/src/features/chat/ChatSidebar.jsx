import { Link } from "react-router-dom";
import Icon from "../../components/ui/Icon";
import { formatRelativeTime } from "../../lib/format";

/** Session list plus the workspace shortcuts from the design. */
export function ChatSidebar({ sessions, activeId, onSelect, onNew, onDelete }) {
  return (
    <aside className="hidden lg:flex flex-col h-full py-lg px-lg bg-surface-container-low
      border-r border-outline-variant w-64 shrink-0">
      <div className="mb-xl">
        <h2 className="font-headline-sm text-headline-sm font-extrabold text-primary">Assistant Workspace</h2>
        <p className="font-label-md text-label-md text-on-surface-variant mt-1">AI-Powered Learning</p>
      </div>

      <button
        onClick={onNew}
        className="w-full bg-primary text-on-primary font-label-md text-[13px] whitespace-nowrap
          rounded-lg py-sm px-md flex items-center justify-center gap-xs mb-xl h-11 shadow-sm
          transition-colors hover:bg-primary-container hover:text-on-primary-container active:scale-95"
      >
        <Icon name="add" size={18} />
        New Research Session
      </button>

      <div className="flex items-center gap-xs mb-sm px-1 text-on-surface-variant">
        <Icon name="history" size={18} filled />
        <span className="font-label-md text-label-md">Chat History</span>
      </div>

      <nav className="flex-1 overflow-y-auto -mx-1 px-1 space-y-1">
        {sessions.map((session) => {
          const isActive = session.id === activeId;
          const questions = session.messages.filter((m) => m.role === "user").length;
          return (
            <div
              key={session.id}
              className={`group flex items-center gap-xs rounded-lg px-3 py-2 transition-all ${
                isActive
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <button onClick={() => onSelect(session.id)} className="flex-1 min-w-0 text-left">
                <span className="block font-label-md text-label-md truncate">{session.title}</span>
                <span className={`block font-label-sm text-[11px] mt-1 ${isActive ? "opacity-80" : "opacity-70"}`}>
                  {questions} question{questions === 1 ? "" : "s"} · {formatRelativeTime(session.createdAt)}
                </span>
              </button>
              <button
                onClick={() => onDelete(session.id)}
                aria-label={`Delete ${session.title}`}
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded transition-opacity hover:text-error"
              >
                <Icon name="delete" size={16} />
              </button>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-outline-variant pt-lg space-y-1">
        <Link
          to="/lectures"
          className="flex items-center gap-sm text-on-surface-variant px-3 py-2 font-label-md text-label-md
            rounded-lg hover:bg-surface-container-high hover:text-on-surface transition-all no-underline"
        >
          <Icon name="video_library" size={18} />
          My Lectures
        </Link>
        <Link
          to="/settings"
          className="flex items-center gap-sm text-on-surface-variant px-3 py-2 font-label-md text-label-md
            rounded-lg hover:bg-surface-container-high hover:text-on-surface transition-all no-underline"
        >
          <Icon name="tune" size={18} />
          Settings
        </Link>
      </div>
    </aside>
  );
}

export default ChatSidebar;
