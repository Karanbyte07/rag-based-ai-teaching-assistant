import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";

export function CtaBanner() {
  const navigate = useNavigate();

  return (
    <section className="py-xl px-lg w-full max-w-container-max mx-auto mb-xl">
      <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-xl
        flex flex-col md:flex-row items-center justify-between gap-lg">
        <div className="max-w-2xl">
          <h2 className="font-headline-md text-headline-md text-on-background mb-sm">
            Ready to learn faster?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Ask a question and get an answer grounded in the lecture, with the timestamp it came from.
          </p>
        </div>

        <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row gap-sm">
          <Button onClick={() => navigate("/chat")} className="w-full sm:w-auto">
            Open Assistant
          </Button>
          <Button variant="outline" onClick={() => navigate("/lectures")} className="w-full sm:w-auto">
            My Lectures
          </Button>
        </div>
      </div>
    </section>
  );
}

export default CtaBanner;
