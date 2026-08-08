import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { EmptyState } from "../components/ui/Feedback";

export function NotFoundPage() {
  return (
    <div className="max-w-container-max mx-auto px-lg py-2xl">
      <EmptyState
        icon="explore_off"
        title="Page not found"
        description="That route doesn't exist in Lectra AI."
        action={
          <Button as={Link} to="/">
            Back to home
          </Button>
        }
      />
    </div>
  );
}

export default NotFoundPage;
