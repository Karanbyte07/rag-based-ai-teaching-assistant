import { useEffect, useState } from "react";
import { listJobs } from "../lib/api";

/** Loads every job on the server; `refresh` triggers a re-fetch. */
export function useJobs() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const data = await listJobs(controller.signal);
        // Newest first. `created_at` is naive UTC, so sorting the raw strings works.
        setJobs([...data].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))));
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
    jobs,
    completed: jobs.filter((j) => j.status === "completed"),
    active: jobs.filter((j) => j.status === "processing"),
    error,
    loading,
    refresh: () => setReloadKey((k) => k + 1),
  };
}
