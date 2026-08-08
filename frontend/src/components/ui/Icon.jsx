/** Material Symbols glyph. `filled` switches the FILL axis on. */
export function Icon({ name, className = "", size, filled = false, ...rest }) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined ${filled ? "filled" : ""} ${className}`}
      style={size ? { fontSize: `${size}px` } : undefined}
      {...rest}
    >
      {name}
    </span>
  );
}

export default Icon;
