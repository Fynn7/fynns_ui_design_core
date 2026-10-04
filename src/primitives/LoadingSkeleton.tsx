import type { HTMLAttributes } from "react";

export type LoadingSkeletonProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Accessible loading status. Decorative skeletons use `aria-hidden`. */
  label?: string;
  /** Text rows, a preview block, or a compact control placeholder. */
  variant?: "text" | "block" | "compact";
  /** Number of text rows; clamped to 1–12. @default 3 */
  lines?: number;
  /** Text thickness / compact footprint. @default "md" */
  size?: "sm" | "md" | "lg";
};

/** Tokenized loading placeholders with the same soft sweep as ChatThinking. */
export function LoadingSkeleton({
  label = "Loading",
  variant = "text",
  lines = 3,
  size = "md",
  className,
  ...rest
}: LoadingSkeletonProps) {
  const decorative = rest["aria-hidden"] === true || rest["aria-hidden"] === "true";
  const count = variant === "block" ? 1 : variant === "compact" ? 3
    : Number.isFinite(lines) ? Math.max(1, Math.min(12, Math.trunc(lines))) : 3;
  return (
    <span
      {...rest}
      className={["fynns-loading-skeleton", `fynns-loading-skeleton--${variant}`,
        `fynns-loading-skeleton--${size}`, className].filter(Boolean).join(" ")}
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
