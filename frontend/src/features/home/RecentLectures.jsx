import { Link } from "react-router-dom";
import LectureCard from "../lectures/LectureCard";
import Icon from "../../components/ui/Icon";
import { Alert, EmptyState, Spinner } from "../../components/ui/Feedback";
import { useLectures } from "../../hooks/useLectures";

const MAX_CARDS = 3;

export function RecentLectures() {
  const { lectures, error, loading } = useLectures();
  const recent = lectures.slice(0, MAX_CARDS);

  return (
    <section className="py-xl px-lg w-full max-w-container-max mx-auto border-t border-outline-variant/20">
      <div className="flex justify-between items-end mb-xl">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-background mb-xs">Recent Lectures</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Jump back into your processed videos
          </p>
        </div>
        {lectures.length > MAX_CARDS && (
          <Link
            to="/lectures"
            className="hidden sm:flex text-primary font-label-md text-label-md items-center gap-xs hover:text-primary/80 no-underline"
          >
            View all <Icon name="arrow_forward" size={18} />
          </Link>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-xl text-primary">
          <Spinner size={28} />
        </div>
      )}

      {!loading && error && (
        <Alert title="Couldn't load your lectures">
          {error} Recent lectures live in the backend's memory, so they reset when the server restarts.
        </Alert>
      )}

      {!loading && !error && recent.length === 0 && (
        <EmptyState
          icon="video_library"
          title="No lectures yet"
          description="Paste a YouTube link above to transcribe your first lecture and start asking questions."
        />
      )}

      {recent.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
          {recent.map((lecture) => (
            <LectureCard key={lecture.video_id} lecture={lecture} />
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentLectures;
