/** Internal busy glyph for Button / overlays — not part of the public barrel. */
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
