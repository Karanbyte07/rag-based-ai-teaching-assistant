import Icon from "./Icon";

/** Spinning ring used for inline loading states. */
export function Spinner({ size = 20, className = "" }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

const TONES = {
  error: "bg-error-container text-on-error-container border-error/20",
  warning: "bg-surface-container-high text-on-surface border-outline-variant",
  info: "bg-primary/10 text-primary border-primary/20",
};

/** Inline banner for errors and advisories. */
export function Alert({ tone = "error", icon = "error", title, children, action }) {
  return (
    <div className={`flex items-start gap-sm rounded-lg border p-md ${TONES[tone]}`}>
      <Icon name={icon} size={20} className="shrink-0 mt-px" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-label-md text-label-md font-semibold mb-xs">{title}</p>}
        <div className="font-body-sm text-body-sm opacity-90">{children}</div>
      </div>
      {action}
    </div>
  );
}

/** Placeholder for empty lists and zero states. */
export function EmptyState({ icon = "inbox", title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-2xl px-md">
      <span className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-md">
        <Icon name={icon} size={28} className="text-on-surface-variant" />
      </span>
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">{title}</h3>
      {description && (
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm mb-lg">{description}</p>
      )}
      {action}
    </div>
  );
}

/** Determinate bar, or an indeterminate sweep when `value` is null. */
export function ProgressBar({ value = null, className = "" }) {
  return (
    <div className={`relative w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden ${className}`}>
      {value === null ? (
        <div className="absolute top-0 h-full w-2/5 bg-primary rounded-full animate-indeterminate" />
      ) : (
        <div
          className="bg-primary h-full rounded-full transition-[width] duration-500 ease-in-out"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      )}
    </div>
  );
}
