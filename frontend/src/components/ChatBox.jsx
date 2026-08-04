import { useState } from "react";
import { askQuestion } from "../api";

function ChatBox() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setAnswer(null);
    setSources([]);

    try {
      const response = await askQuestion(question);
      setAnswer(response.answer);
      setSources(response.sources);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // it converts seconds into minutes and seconds format for the youtube link and display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="chat-box">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ask a question about the video..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {answer && (
        <div className="answer-block">
          <h3>Answer</h3>
          <p>{answer}</p>
        </div>
      )}

      {sources.length > 0 && (
        <div className="sources-block">
          <h3>Sources</h3>
          {sources.map((source, idx) => (
            <a
              key={idx}
              href={`https://youtube.com/watch?v=${source.video_id}&t=${Math.floor(source.start)}s`}
              target="_blank"
              rel="noopener noreferrer"
              className="source-card"
            >
              <strong>{source.title}</strong>
              <span>
                {formatTime(source.start)} - {formatTime(source.end)}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatBox;