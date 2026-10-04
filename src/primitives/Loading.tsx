/** Permanently archived ring geometry — not a public loading primitive. */
export type SpinnerSize = "sm" | "md" | "lg";

/** @deprecated Permanently archived. Prefer content-position skeletons, not a busy glyph. */
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
    <span className={classes} role="status" aria-label={label} data-loading-appearance="archived-ring">
      <span className="fynns-loading-spinner-ring" aria-hidden />
      <span className="fynns-sr-only">{label}</span>
    </span>
  );
}
