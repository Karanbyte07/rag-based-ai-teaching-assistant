import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { askQuestion } from "../lib/api";
import { createId, readStore, writeStore, STORAGE_KEYS } from "../lib/storage";

const newSession = () => ({
  id: createId(),
  title: "New research session",
  createdAt: new Date().toISOString(),
  messages: [],
});

/** Chat sessions with their transcripts, persisted to localStorage. */
export function useChat({ topK = 5, videoId = null } = {}) {
  const [sessions, setSessions] = useState(() => {
    const stored = readStore(STORAGE_KEYS.sessions, []);
    return stored.length ? stored : [newSession()];
  });
  const [activeId, setActiveId] = useState(() => sessions[0].id);
  const [pending, setPending] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    writeStore(STORAGE_KEYS.sessions, sessions);
  }, [sessions]);

  // Cancel any in-flight question when the component goes away.
  useEffect(() => () => abortRef.current?.abort(), []);

  const active = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? sessions[0],
    [sessions, activeId],
  );

  const patchSession = useCallback((id, updater) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? updater(s) : s)));
  }, []);

  const startSession = useCallback(() => {
    const session = newSession();
    setSessions((prev) => [session, ...prev]);
    setActiveId(session.id);
    return session.id;
  }, []);

  const deleteSession = useCallback((id) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      const remaining = next.length ? next : [newSession()];
      setActiveId((current) => (current === id ? remaining[0].id : current));
      return remaining;
    });
  }, []);

  const send = useCallback(
    async (question) => {
      const text = question.trim();
      if (!text || pending) return;

      const sessionId = active.id;
      const answerId = createId();

      // Optimistically render the question plus a placeholder for the answer.
      patchSession(sessionId, (s) => ({
        ...s,
        // First question doubles as the session's title in the sidebar.
        title: s.messages.length === 0 ? text.slice(0, 60) : s.title,
        messages: [
          ...s.messages,
          { id: createId(), role: "user", content: text, createdAt: new Date().toISOString() },
          { id: answerId, role: "assistant", content: "", sources: [], status: "pending" },
        ],
      }));

      setPending(true);
      abortRef.current = new AbortController();

      try {
        const res = await askQuestion({
          question: text,
          topK,
          videoId,
          signal: abortRef.current.signal,
        });
        patchSession(sessionId, (s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === answerId
              ? { ...m, content: res.answer, sources: res.sources ?? [], status: "done" }
              : m,
          ),
        }));
      } catch (err) {
        if (err.name === "AbortError") return;
        patchSession(sessionId, (s) => ({
          ...s,
          messages: s.messages.map((m) =>
            m.id === answerId ? { ...m, status: "error", error: err.message } : m,
          ),
        }));
      } finally {
        setPending(false);
        abortRef.current = null;
      }
    },
    [active, pending, patchSession, topK, videoId],
  );

  /** Drops the last answer and re-asks the question above it. */
  const regenerate = useCallback(() => {
    const messages = active.messages;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser || pending) return;

    patchSession(active.id, (s) => ({ ...s, messages: s.messages.slice(0, -2) }));
    send(lastUser.content);
  }, [active, pending, patchSession, send]);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  /** Thumbs up/down. Stored with the transcript — the API takes no feedback. */
  const rate = useCallback(
    (messageId, value) => {
      patchSession(active.id, (s) => ({
        ...s,
        messages: s.messages.map((m) => (m.id === messageId ? { ...m, rating: value } : m)),
      }));
    },
    [active, patchSession],
  );

  return {
    sessions,
    active,
    activeId: active.id,
    setActiveId,
    startSession,
    deleteSession,
    messages: active.messages,
    send,
    regenerate,
    rate,
    stop,
    pending,
  };
}
