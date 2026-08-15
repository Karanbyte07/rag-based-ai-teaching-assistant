import { useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import ChatSidebar from "../features/chat/ChatSidebar";
import Composer from "../features/chat/Composer";
import { AssistantMessage, UserMessage } from "../features/chat/Message";
import Icon from "../components/ui/Icon";
import { useApp } from "../hooks/useApp";
import { useChat } from "../hooks/useChat";
import { useLectures } from "../hooks/useLectures";

const SUGGESTIONS = [
  "Summarize everything covered in this lecture.",
  "Explain the main concept in simple terms.",
  "What examples were used, and at what timestamps?",
];

export function ChatPage() {
  const { settings } = useApp();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { lectures } = useLectures();

  const videoId = params.get("video");
  const scope = useMemo(() => {
    if (!videoId) return null;
    const lecture = lectures.find((l) => l.video_id === videoId);
    return { videoId, title: lecture ? lecture.title : videoId };
  }, [videoId, lectures]);

  const chat = useChat({ topK: settings.topK, videoId });
  const scrollRef = useRef(null);

  // Automatically start a new session if navigated here with startNewSession flag
  useEffect(() => {
    if (location.state?.startNewSession) {
      if (chat.messages.length > 0) {
        chat.startSession();
      }
      // Clear the state so refreshing doesn't keep triggering this
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }
  }, [location, chat, navigate]);

  // Keep the newest message in view as the transcript grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chat.messages]);

  const isEmpty = chat.messages.length === 0;

  const handleSelectLecture = (lecture) => {
    navigate(`/chat?video=${encodeURIComponent(lecture.video_id)}`, {
      replace: true,
      state: { startNewSession: true },
    });
  };

  const handleClearScope = () => {
    setParams({}, { replace: true });
  };

  return (
    <div className="flex flex-1 w-full min-h-0">
      <ChatSidebar
        sessions={chat.sessions}
        activeId={chat.activeId}
        onSelect={chat.setActiveId}
        onNew={chat.startSession}
        onDelete={chat.deleteSession}
      />

      <section className="flex-1 flex flex-col relative min-w-0 bg-surface-bright">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-md md:px-xl py-xl pb-40">
          <div className="max-w-3xl mx-auto space-y-xl">
            {isEmpty ? (
              <div className="flex flex-col items-center text-center pt-2xl">
                <span className="w-14 h-14 rounded-full bg-primary flex items-center justify-center mb-md shadow-sm">
                  <Icon name="auto_awesome" size={26} className="text-on-primary" />
                </span>
                <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
                  Ask your lectures anything
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-xl">
                  Answers are grounded in your transcripts and cite the exact moment each point was
                  explained.
                </p>

                <div className="flex flex-col gap-sm w-full max-w-md">
                  {SUGGESTIONS.map((text) => (
                    <button
                      key={text}
                      onClick={() => chat.send(text)}
                      className="text-left px-md py-sm rounded-lg border border-outline-variant/40
                        bg-surface-container-lowest font-body-sm text-body-sm text-on-surface-variant
                        hover:border-primary/50 hover:text-on-surface transition-all"
                    >
                      {text}
                    </button>
                  ))}
                </div>

                {lectures.length === 0 && (
                  <p className="mt-xl font-body-sm text-body-sm text-on-surface-variant">
                    No lectures indexed yet —{" "}
                    <Link to="/" className="text-primary">
                      add one first
                    </Link>
                    .
                  </p>
                )}
              </div>
            ) : (
              chat.messages.map((message) =>
                message.role === "user" ? (
                  <UserMessage key={message.id} content={message.content} />
                ) : (
                  <AssistantMessage
                    key={message.id}
                    message={message}
                    pending={chat.pending}
                    onRate={chat.rate}
                    onRegenerate={chat.regenerate}
                  />
                ),
              )
            )}
          </div>
        </div>

        <Composer
          onSend={chat.send}
          onStop={chat.stop}
          pending={chat.pending}
          scope={scope}
          onClearScope={handleClearScope}
          lectures={lectures}
          onSelectLecture={handleSelectLecture}
        />
      </section>
    </div>
  );
}

export default ChatPage;
