import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ingestPlaylist, ingestVideo } from "../../lib/api";
import { isValidYouTubeUrl, looksLikePlaylist } from "../../lib/format";
import { useApp } from "../../hooks/useApp";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";
import { Alert, Spinner } from "../../components/ui/Feedback";

const HIGHLIGHTS = ["Save hours of watching", "Instant semantic search", "Accurate transcriptions"];

export function IngestHero() {
  const navigate = useNavigate();
  const { settings } = useApp();
  const [url, setUrl] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isPlaylist = looksLikePlaylist(url);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = url.trim();

    if (!isValidYouTubeUrl(trimmed)) {
      setError("That doesn't look like a YouTube video or playlist link.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = isPlaylist
        ? await ingestPlaylist(trimmed, settings.playlistWorkers)
        : await ingestVideo(trimmed);
      navigate(`/processing/${res.job_id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <section className="relative w-full max-w-container-max mx-auto px-lg py-2xl flex flex-col items-center justify-center text-center sparkle-bg mt-xl rounded-xl">
      <h1 className="font-display text-4xl md:text-5xl lg:text-display text-on-surface max-w-4xl mb-lg">
        Learn from your lecture
        <br className="hidden sm:block" /> videos using <span className="text-primary">AI.</span>
      </h1>

      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mb-xl">
        Paste any YouTube video or playlist link. We transcribe, analyze, and let you chat directly
        with the video content to answer your questions instantly.
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl flex flex-col sm:flex-row gap-sm items-center
          bg-surface-container-lowest p-xs rounded-lg border border-outline/20 shadow-level-1
          focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all"
      >
        <Icon name="link" className="text-outline-variant pl-sm hidden sm:block" />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={submitting}
          placeholder="Paste the video or playlist URL here..."
          aria-label="YouTube video or playlist URL"
          className="flex-grow bg-transparent border-none focus:ring-0 font-body-md text-body-md
            text-on-background placeholder:text-on-surface-variant/60 py-sm px-sm w-full h-12 outline-none"
        />
        <Button type="submit" size="lg" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? (
            <>
              <Spinner size={16} /> Starting…
            </>
          ) : (
            <>
              {isPlaylist ? "Process Playlist" : "Process Lecture"}
              <Icon name="arrow_forward" size={18} />
            </>
          )}
        </Button>
      </form>

      {error && (
        <div className="w-full max-w-2xl mt-md text-left">
          <Alert title="Couldn't start ingestion">{error}</Alert>
        </div>
      )}

      <div className="mt-lg flex flex-wrap justify-center items-center gap-md font-label-md text-label-md text-on-surface-variant opacity-90">
        {HIGHLIGHTS.map((text, i) => (
          <span key={text} className="flex items-center gap-xs">
            {i > 0 && <span className="h-4 w-px bg-outline-variant/30 hidden sm:block mr-md" />}
            <Icon name="check_circle" size={18} className="text-primary" />
            {text}
          </span>
        ))}
      </div>
    </section>
  );
}

export default IngestHero;
