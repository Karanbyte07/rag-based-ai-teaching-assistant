import { Link } from "react-router-dom";

/** Brand lockup: the owl mark plus the wordmark. */
export function Logo({ size = 32, showWordmark = true, className = "" }) {
  return (
    <Link to="/" className={`flex items-center gap-sm shrink-0 ${className}`} aria-label="Lectra AI home">
      <img
        src="/favicon.png"
        alt=""
        width={size}
        height={size}
        className="object-contain rounded-full"
        style={{ width: size, height: size }}
      />
      {showWordmark && (
        <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
          Lectra AI
        </span>
      )}
    </Link>
  );
}

export default Logo;
