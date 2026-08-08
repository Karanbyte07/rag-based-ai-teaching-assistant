import { useEffect, useState } from "react";
import { getJob } from "../lib/api";
import { isTerminal } from "../lib/pipeline";

const POLL_MS = 2500;

/** Polls one ingestion job until it completes or fails. */
export function useJob(jobId) {
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(jobId));

  useEffect(() => {
    if (!jobId) return;

    const controller = new AbortController();
    let timer;
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await getJob(jobId, controller.signal);
        if (cancelled) return;

        setJob(data);
        setError(null);
        setLoading(false);
        if (!isTerminal(data.status)) timer = setTimeout(poll, POLL_MS);
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;
        setError(err.message);
        setLoading(false);
        // A network blip shouldn't kill the loop — back off and retry.
        timer = setTimeout(poll, POLL_MS * 2);
      }
    };

    poll();
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [jobId]);

  return { job, error, loading };
}
