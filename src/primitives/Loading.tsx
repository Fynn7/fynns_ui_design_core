import type { ReactNode } from "react";

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
      <span className="fynns-loading-spinner-ring" aria-hidden />
      <span className="fynns-sr-only">{label}</span>
    </span>
  );
}

export function PanelSkeleton({ label, rows = 4 }: { label: string; rows?: number }) {
  return (
    <div className="fynns-loading-panel-skeleton" role="status" aria-label={label}>
      <span className="fynns-sr-only">{label}</span>
      <div className="fynns-loading-skeleton fynns-loading-skeleton--title" aria-hidden />
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className={`fynns-loading-skeleton ${idx === rows - 1 ? "fynns-loading-skeleton--short" : ""}`}
          aria-hidden
        />
      ))}
    </div>
  );
}

export function BlockingLoadingOverlay({
  active,
  label,
  className,
}: {
  active: boolean;
  label: string;
  className?: string;
}): ReactNode {
  if (!active) return null;
  const classes = ["fynns-loading-blocking-overlay", className].filter(Boolean).join(" ");
  return (
    <div className={classes} role="status" aria-live="assertive">
      <div className="fynns-loading-blocking-overlay-card">
        <Spinner label={label} size="lg" />
        <p className="fynns-loading-blocking-overlay-text">{label}</p>
      </div>
    </div>
  );
}
