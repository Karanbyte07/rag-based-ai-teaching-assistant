import Icon from "../../components/ui/Icon";

const STEPS = [
  {
    icon: "cloud_download",
    tone: "text-primary",
    title: "Download & Process",
    body: "We extract the audio and generate a high-quality transcript with Whisper, readying the content for AI analysis.",
  },
  {
    icon: "psychology",
    tone: "text-tertiary",
    title: "AI Understanding",
    body: "Transcripts are chunked with timestamps and embedded into a FAISS index so meaning — not just keywords — is searchable.",
  },
  {
    icon: "schedule",
    tone: "text-secondary",
    title: "Timestamp Answers",
    body: "Ask any question and get answers linked to the exact moment in the video where the concept was explained.",
  },
];

export function HowItWorks() {
  return (
    <section className="w-full max-w-container-max mx-auto px-lg py-xl">
      <div className="mb-xl text-center">
        <h2 className="font-headline-lg text-headline-lg text-on-background mb-xs">How it works</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mx-auto">
          A seamless pipeline from video to knowledge, powered by advanced language models.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {STEPS.map((step) => (
          <article
            key={step.title}
            className="bg-surface-container-low rounded-xl p-lg flex flex-col h-full
              border border-outline-variant/20 hover:shadow-level-1 transition-all"
          >
            <div className={`mb-md ${step.tone}`}>
              <Icon name={step.icon} size={36} />
            </div>
            <h3 className="font-headline-md text-headline-md text-on-background mb-sm">{step.title}</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HowItWorks;
