import Icon from "../../components/ui/Icon";

const STATE_LABELS = {
  done: "Completed",
  active: "Processing",
  pending: "Pending",
  failed: "Failed",
  unknown: "In pipeline",
};

/** The step marker: filled when done, spinning when active, hollow otherwise. */
function StepMarker({ state }) {
  if (state === "done") {
    return (
      <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center shrink-0 shadow-sm">
        <Icon name="check" size={18} className="text-on-tertiary" />
      </div>
    );
  }

  if (state === "active") {
    return (
      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0 shadow-sm relative">
        <Icon name="sync" size={18} className="text-on-primary-container animate-spin" />
        <span className="absolute inset-0 rounded-full border-2 border-primary-container animate-ping opacity-20" />
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div className="w-10 h-10 rounded-full bg-error flex items-center justify-center shrink-0 shadow-sm">
        <Icon name="priority_high" size={18} className="text-on-error" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-outline-variant/50 flex items-center justify-center shrink-0">
      <span className="w-2 h-2 rounded-full bg-outline-variant" />
    </div>
  );
}

export function PipelineTimeline({ stages }) {
  return (
    <ol className="flex flex-col mt-lg relative">
      {/* Connector behind the markers */}
      <span className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-outline-variant/30 z-0" aria-hidden="true" />

      {stages.map((stage) => (
        <li key={stage.id} className="flex items-start gap-md py-sm relative z-10">
          <StepMarker state={stage.state} />
          <div className={`flex flex-col pt-2 ${stage.state === "pending" ? "opacity-60" : ""}`}>
            <span className="font-label-md text-label-md text-on-surface">{stage.label}</span>
            <span
              className={`font-body-sm text-body-sm flex items-center gap-1 ${
                stage.state === "done"
                  ? "text-tertiary"
                  : stage.state === "active"
                    ? "text-primary"
                    : stage.state === "failed"
                      ? "text-error"
                      : "text-on-surface-variant"
              }`}
            >
              {STATE_LABELS[stage.state]}
              {stage.state === "active" && <span className="animate-pulse-subtle">…</span>}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default PipelineTimeline;
