import { useEffect, useState } from "react";
import { listLectures } from "../lib/api";

/**
 * Fetches the list of ingested lectures from FAISS metadata.
 * Returns { lectures, loading, error, refresh }.
 */
export function useLectures() {
  const [lectures, setLectures] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const data = await listLectures(controller.signal);
        setLectures(data);
        setError(null);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [reloadKey]);

  return {
    lectures,
    loading,
    error,
    refresh: () => setReloadKey((k) => k + 1),
  };
}
