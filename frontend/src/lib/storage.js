// Namespaced localStorage helpers. Every read is defensive — storage can be
// disabled, full, or hold data written by an older version of the app.
const PREFIX = "lectra:";

export function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStore(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage blocked — non-fatal, the app just won't persist.
  }
}

export const removeStore = (key) => {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    /* no-op */
  }
};

export const STORAGE_KEYS = {
  theme: "theme",
  settings: "settings",
  sessions: "sessions",
};

/** Only `topK` reaches the backend; the rest are UI-side preferences. */
export const DEFAULT_SETTINGS = {
  topK: 5,
  playlistWorkers: 2,
  scopeToVideo: null,
};

/** Short id for chat sessions — collision risk is irrelevant at this scale. */
export const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
