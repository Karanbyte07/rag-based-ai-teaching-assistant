import Icon from "./Icon";

/** Label + helper text wrapper shared by every settings control. */
export function Field({ id, label, description, children, note }) {
  return (
    <div className="flex flex-col gap-xs">
      <label className="font-label-md text-label-md text-on-surface" htmlFor={id}>
        {label}
      </label>
      {description && (
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-sm">{description}</p>
      )}
      {children}
      {note && (
        <p className="font-label-sm text-label-sm text-on-surface-variant/80 mt-xs flex items-center gap-xs">
          <Icon name="lock" size={13} />
          {note}
        </p>
      )}
    </div>
  );
}

/** Native select with the chevron drawn on top. */
export function Select({ id, className = "", children, ...rest }) {
  return (
    <div className="relative">
      <select
        id={id}
        className={`w-full appearance-none bg-surface-dim border border-outline-variant rounded-lg
          px-md py-sm font-body-md text-body-md text-on-surface cursor-pointer transition-all
          focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
          disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        {...rest}
      >
        {children}
      </select>
      <Icon
        name="expand_more"
        className="absolute right-md top-1/2 -translate-y-1/2 pointer-events-none text-outline"
      />
    </div>
  );
}

/** Range slider paired with a number box; both edit the same value. */
export function RangeField({ id, label, description, value, onChange, min, max, step = 1, unit, disabled }) {
  const clamp = (n) => Math.min(max, Math.max(min, n));

  return (
    <div className="flex flex-col gap-sm">
      <div className="flex justify-between items-end gap-md">
        <div>
          <label className="font-label-md text-label-md text-on-surface" htmlFor={id}>
            {label}
          </label>
          {description && (
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            aria-label={`${label} value`}
            className="w-20 bg-surface-dim border border-outline-variant rounded-md px-sm py-xs
              font-body-md text-body-md text-center text-on-surface
              focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20
              disabled:opacity-60"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
          />
          {unit && <span className="font-label-sm text-label-sm text-on-surface-variant">{unit}</span>}
        </div>
      </div>
      <input
        id={id}
        type="range"
        className="range-input mt-sm disabled:opacity-60"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** Switch styled to match the mockup's peer-driven toggle. */
export function Toggle({ id, checked, onChange, label, disabled }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className="w-11 h-6 bg-outline-variant rounded-full transition-colors
          peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40
          peer-checked:bg-primary peer-disabled:opacity-50
          after:content-[''] after:absolute after:top-[2px] after:left-[2px]
          after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform
          peer-checked:after:translate-x-full"
      />
      {label && <span className="ml-3 font-label-md text-label-md text-on-surface">{label}</span>}
    </label>
  );
}
