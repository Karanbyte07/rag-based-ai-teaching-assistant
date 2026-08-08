const VARIANTS = {
  primary: "bg-primary text-on-primary hover:bg-primary/90 shadow-level-1",
  secondary: "bg-primary-container text-on-primary-container hover:bg-primary-container/90",
  outline: "bg-transparent border border-outline-variant text-on-background hover:bg-surface-container-high",
  ghost: "bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
  danger: "bg-error text-on-error hover:bg-error/90",
};

const SIZES = {
  sm: "h-9 px-md text-label-sm",
  md: "h-11 px-lg text-label-md",
  lg: "h-12 px-lg text-label-md",
};

/** Shared button. `as` lets it render a Link or <a> while keeping the styling. */
export function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}) {
  return (
    <Tag
      className={`inline-flex items-center justify-center gap-xs rounded-lg font-label-md font-semibold
        whitespace-nowrap transition-all active:scale-95
        disabled:opacity-50 disabled:pointer-events-none
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Circular icon-only button used in the top bar and message actions. */
export function IconButton({ className = "", children, ...rest }) {
  return (
    <button
      className={`p-sm rounded-full text-on-surface-variant transition-all
        hover:bg-surface-container-high hover:text-on-surface active:scale-95
        disabled:opacity-50 disabled:pointer-events-none
        flex items-center justify-center ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
