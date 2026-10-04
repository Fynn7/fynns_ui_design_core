import { LoadingSkeleton } from "./LoadingSkeleton";

/** Internal compatibility name for the compact loading skeleton. */
export type SpinnerSize = "sm" | "md" | "lg";

export function Spinner({
  label,
  size = "md",
  className,
}: {
  label: string;
  size?: SpinnerSize;
  className?: string;
}) {
  const classes = ["fynns-loading-spinner", `fynns-loading-spinner--${size}`, className]
    .filter(Boolean)
    .join(" ");
  return (
    <span className={classes} role="status" aria-label={label}>
      {/* Preserve the legacy DOM hook while rendering a rectangular skeleton. */}
      <span className="fynns-loading-spinner-ring" aria-hidden>
        <LoadingSkeleton variant="compact" size={size} aria-hidden />
      </span>
      <span className="fynns-sr-only">{label}</span>
    </span>
  );
}
