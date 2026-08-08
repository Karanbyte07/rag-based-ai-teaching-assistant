import { useState } from "react";
import { useApp } from "../hooks/useApp";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";
import { Field, RangeField, Select, Toggle } from "../components/ui/Form";
import { Alert } from "../components/ui/Feedback";
import { BASE_URL } from "../lib/api";

/** Card wrapper matching the mockup's section styling. */
function Section({ icon, title, children }) {
  return (
    <section className="bg-surface-container-lowest border border-outline-variant/20 rounded-xl p-lg shadow-sm flex flex-col gap-lg">
      <header className="flex items-center gap-sm pb-sm border-b border-outline-variant/20">
        <Icon name={icon} className="text-primary" />
        <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
      </header>
      {children}
    </section>
  );
}

const SERVER_NOTE = "Set on the server — change it in the backend, not here.";

export function SettingsPage() {
  const { settings, updateSettings, isDark, setTheme } = useApp();
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);
  const patch = (change) => {
    setDraft((d) => ({ ...d, ...change }));
    setSaved(false);
  };

  const save = () => {
    updateSettings(draft);
    setSaved(true);
  };

  return (
    /* Extra bottom padding keeps the last control clear of the sticky action bar. */
    <div className="max-w-[800px] mx-auto px-md pt-2xl pb-[7rem] w-full flex flex-col gap-lg">
      <header className="mb-md">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Settings</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Configure retrieval parameters and interface preferences.
        </p>
      </header>

      <Section icon="memory" title="Model Architecture">
        <Field
          id="embedding-model"
          label="Embedding Model"
          description="Turns transcript chunks into vectors for semantic search."
          note={SERVER_NOTE}
        >
          <Select id="embedding-model" value="minilm" disabled onChange={() => {}}>
            <option value="minilm">sentence-transformers · all-MiniLM-L6-v2 (local)</option>
          </Select>
        </Field>

        <Field
          id="retriever-type"
          label="Retriever Mechanism"
          description="The index and search algorithm used to find relevant chunks."
          note={SERVER_NOTE}
        >
          <Select id="retriever-type" value="faiss" disabled onChange={() => {}}>
            <option value="faiss">FAISS · cosine similarity over normalized vectors</option>
          </Select>
        </Field>

        <Field
          id="transcriber"
          label="Transcription Model"
          description="Generates the timestamped transcript from the lecture audio."
          note={SERVER_NOTE}
        >
          <Select id="transcriber" value="whisper-base" disabled onChange={() => {}}>
            <option value="whisper-base">faster-whisper · base (CPU, int8)</option>
          </Select>
        </Field>
      </Section>

      <Section icon="view_timeline" title="Retrieval & Processing">
        <RangeField
          id="top-k"
          label="Retrieved Chunks (Top-K)"
          description="How many transcript chunks are sent to the model as context for each answer."
          value={draft.topK}
          onChange={(topK) => patch({ topK })}
          min={1}
          max={20}
          unit="chunks"
        />

        <RangeField
          id="playlist-workers"
          label="Playlist Concurrency"
          description="Videos transcribed in parallel when ingesting a playlist. Higher is faster but heavier on CPU."
          value={draft.playlistWorkers}
          onChange={(playlistWorkers) => patch({ playlistWorkers })}
          min={1}
          max={8}
          unit="workers"
        />

        {/* Chunking is time-based in this backend, and fixed at build time. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-sm border-t border-outline-variant/20">
          <Field id="chunk-size" label="Chunk Size" description="Transcript window per chunk." note={SERVER_NOTE}>
            <div id="chunk-size" className="bg-surface-dim border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface-variant">
              45 seconds
            </div>
          </Field>
          <Field id="chunk-overlap" label="Chunk Overlap" description="Carried into the next chunk for context." note={SERVER_NOTE}>
            <div id="chunk-overlap" className="bg-surface-dim border border-outline-variant rounded-lg px-md py-sm font-body-md text-body-md text-on-surface-variant">
              10 seconds
            </div>
          </Field>
        </div>
      </Section>

      <Section icon="palette" title="Interface Preferences">
        <div className="flex items-center justify-between gap-md">
          <div className="flex flex-col gap-xs">
            <span className="font-label-md text-label-md text-on-surface">Appearance Theme</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Switch between light and dark modes.
            </span>
          </div>
          <Toggle
            id="dark-mode"
            checked={isDark}
            onChange={(on) => setTheme(on ? "dark" : "light")}
            label="Dark Mode"
          />
        </div>

        <div className="flex items-center justify-between gap-md pt-sm border-t border-outline-variant/20">
          <div className="flex flex-col gap-xs min-w-0">
            <span className="font-label-md text-label-md text-on-surface">API Endpoint</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Set with <code className="font-mono text-[13px]">VITE_API_URL</code> at build time.
            </span>
          </div>
          <code className="font-mono text-[13px] text-on-surface-variant bg-surface-dim px-md py-sm rounded-lg truncate">
            {BASE_URL}
          </code>
        </div>
      </Section>

      {saved && (
        <Alert tone="info" icon="check_circle" title="Settings saved">
          They're stored in this browser and apply to your next question.
        </Alert>
      )}

      {/* Sticky, so it stays reachable on long forms — opaque to keep text behind it legible. */}
      <div className="flex justify-end items-center gap-md sticky bottom-lg mt-md px-md py-md
        bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-level-1">
        <Button variant="ghost" onClick={() => setDraft(settings)} disabled={!dirty}>
          Discard Changes
        </Button>
        <Button onClick={save} disabled={!dirty}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
}

export default SettingsPage;
