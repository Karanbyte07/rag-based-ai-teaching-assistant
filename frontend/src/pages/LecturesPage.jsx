import { Link } from "react-router-dom";
import LectureCard from "../features/lectures/LectureCard";
import Button, { IconButton } from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import { Alert, EmptyState, Spinner } from "../components/ui/Feedback";
import { useLectures } from "../hooks/useLectures";

export function LecturesPage() {
  const { lectures, error, loading, refresh } = useLectures();

  return (
    <div className="w-full max-w-container-max mx-auto px-lg py-xl">
      <div className="flex flex-wrap justify-between items-end gap-md mb-xl">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">My Lectures</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            All videos you've ingested — transcribed, chunked, and ready to chat with.
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <IconButton onClick={refresh} aria-label="Refresh" title="Refresh">
            <Icon name="refresh" />
          </IconButton>
          <Button as={Link} to="/" variant="outline">
            <Icon name="add" size={18} /> Add lecture
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-2xl text-primary">
          <Spinner size={28} />
        </div>
      )}

      {!loading && error && <Alert title="Couldn't load your lectures">{error}</Alert>}

      {!loading && !error && lectures.length === 0 && (
        <EmptyState
          icon="video_library"
          title="No lectures yet"
          description="Ingest a YouTube video or playlist to build your searchable lecture library."
          action={
            <Button as={Link} to="/">
              Add your first lecture
            </Button>
          }
        />
      )}

      {lectures.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
          {lectures.map((lecture) => (
            <LectureCard key={lecture.video_id} lecture={lecture} />
          ))}
        </div>
      )}
    </div>
  );
}

export default LecturesPage;
