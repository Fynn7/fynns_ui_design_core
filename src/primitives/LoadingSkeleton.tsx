import type { HTMLAttributes } from "react";

export type LoadingSkeletonProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Accessible loading status. Decorative skeletons use `aria-hidden`. */
  label?: string;
  /** Wide text rows by default; block is for images, iframes and similar media. @default "text" */
  variant?: "text" | "block";
  /** Number of upcoming text rows; clamped to 1–12. @default 6 */
  lines?: number;
  /** Text thickness; ignored for block placeholders. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Fill a height-resolved upcoming component's footprint. */
  fill?: boolean;
};

/** Tokenized loading placeholders with the same soft sweep as ChatThinking. */
export function LoadingSkeleton({
  label = "Loading",
  variant = "text",
  lines = 6,
  size = "md",
  fill = false,
  className,
  ...rest
}: LoadingSkeletonProps) {
  const decorative = rest["aria-hidden"] === true || rest["aria-hidden"] === "true";
  const count = variant === "block" ? 1
    : Number.isFinite(lines) ? Math.max(1, Math.min(12, Math.trunc(lines))) : 6;
  return (
    <span
      {...rest}
      className={["fynns-loading-skeleton", `fynns-loading-skeleton--${variant}`,
        variant === "text" && `fynns-loading-skeleton--${size}`,
        fill && "fynns-loading-skeleton--fill", className].filter(Boolean).join(" ")}
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : label}
    >
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className="fynns-loading-skeleton-bar" aria-hidden />
      ))}
      {!decorative ? <span className="fynns-sr-only">{label}</span> : null}
    </span>
  );
}
