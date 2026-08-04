import { useState } from "react";
import IngestForm from "./components/IngestForm";
import ChatBox from "./components/ChatBox";
import "./App.css";

function App() {
  const [ingestedData, setIngestedData] = useState(null);

  return (
    <div className="app">
      <h1>AI Teaching Assistant</h1>

      <IngestForm onIngestComplete={(data) => setIngestedData(data)} />

      {ingestedData && (
        <div className="chat-section">
          <p className="success-message">
            Ingestion complete! You can now ask questions.
          </p>
          <ChatBox />
        </div>
      )}
    </div>
  );
}

export default App;