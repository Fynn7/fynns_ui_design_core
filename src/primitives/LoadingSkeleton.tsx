import { useLayoutEffect, useRef, useState, type HTMLAttributes } from "react";

export type LoadingSkeletonProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  /** Accessible loading status. Decorative skeletons use `aria-hidden`. */
  label?: string;
  /** Wide text rows by default; block is for images, iframes and similar media. @default "text" */
  variant?: "text" | "block";
  /** Explicit text rows, clamped to 1–12. Omit for six rows, or adaptive rows with fill. */
  lines?: number;
  /** Text thickness; ignored for block placeholders. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Fill a height-resolved footprint; omitted lines adapt to its available height. */
  fill?: boolean;
};

/** Tokenized loading placeholders with the same soft sweep as ChatThinking. */
export function LoadingSkeleton({
  label = "Loading",
  variant = "text",
  lines,
  size = "md",
  fill = false,
  className,
  ...rest
}: LoadingSkeletonProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [fillLines, setFillLines] = useState(6);
  useLayoutEffect(() => {
    if (!fill || variant !== "text" || lines != null) return;
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const bar = root.querySelector<HTMLElement>(".fynns-loading-skeleton-bar");
      if (!bar) return;
      const height = root.clientHeight;
      const rowHeight = parseFloat(getComputedStyle(bar).height);
      const gap = parseFloat(getComputedStyle(root).rowGap) || 0;
      if (height <= 0 || !Number.isFinite(rowHeight) || rowHeight <= 0) return;
      const fitted = Math.max(1, Math.floor((height + gap) / (rowHeight + gap)));
      setFillLines(current => current === fitted ? current : fitted);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    const bar = root.querySelector(".fynns-loading-skeleton-bar");
    if (bar) observer.observe(bar);
    return () => observer.disconnect();
  }, [fill, variant, lines, size]);
  const decorative = rest["aria-hidden"] === true || rest["aria-hidden"] === "true";
  const count = variant === "block" ? 1
    : lines == null ? (fill ? fillLines : 6)
    : Number.isFinite(lines) ? Math.max(1, Math.min(12, Math.trunc(lines))) : 6;
  return (
    <span
      {...rest}
      ref={rootRef}
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
