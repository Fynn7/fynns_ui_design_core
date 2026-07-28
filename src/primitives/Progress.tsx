import type { HTMLAttributes } from "react";

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export type LinearProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /**
   * Progress in `[0, 1]`. Omit for an indeterminate (unspecified wait) bar.
   */
  value?: number;
  /** Accessible name (`aria-label`). */
  label: string;
  /**
   * Determinate only: small stop mark at the track end (M3). Default `true`.
   * Hidden when `value` is `1` or indeterminate.
   */
  stopIndicator?: boolean;
};

/**
 * M3 linear progress — determinate bar with track gap + optional stop, or
 * indeterminate sliding segments. Prefer over `Spinner` for known % / long tasks.
 */
export function LinearProgress({
  value,
  label,
  stopIndicator = true,
  className,
  style,
  ...rest
}: LinearProgressProps) {
  const indeterminate = value == null;
  const ratio = indeterminate ? 0 : clamp01(value);
  const showStop = stopIndicator && !indeterminate && ratio < 1;
  const showGap = !indeterminate && ratio > 0 && ratio < 1;
  const rootClass = [
    "fynns-linear-progress",
    indeterminate ? "fynns-linear-progress--indeterminate" : "",
    showGap ? "fynns-linear-progress--active" : "",
    showStop ? "fynns-linear-progress--stop" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      {...rest}
      className={rootClass}
      style={
        indeterminate
          ? style
          : {
              ...style,
              ["--fynns-progress-value" as string]: String(ratio),
            }
      }
      role="progressbar"
      aria-label={label}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(ratio * 100)}
    >
      {indeterminate ? (
        <div className="fynns-linear-progress-indeterminate" aria-hidden>
          <span className="fynns-linear-progress-indeterminate-bar fynns-linear-progress-indeterminate-bar--1" />
          <span className="fynns-linear-progress-indeterminate-bar fynns-linear-progress-indeterminate-bar--2" />
        </div>
      ) : (
        <>
          {ratio > 0 ? <div className="fynns-linear-progress-active" aria-hidden /> : null}
          {ratio < 1 ? <div className="fynns-linear-progress-track" aria-hidden /> : null}
          {showStop ? <div className="fynns-linear-progress-stop" aria-hidden /> : null}
        </>
      )}
    </div>
  );
}

export type CircularProgressSize = "sm" | "md" | "lg";

export type CircularProgressProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  /** Progress in `[0, 1]`. Omit for indeterminate. */
  value?: number;
  label: string;
  /** Default `md` (48dp). */
  size?: CircularProgressSize;
};

/** ViewBox units; stroke stays 4 at 48×48 → scales with CSS size. */
const CIRCULAR_R = 20;
const CIRCULAR_C = 2 * Math.PI * CIRCULAR_R;
/** ~4dp gap at the default 48dp size. */
const CIRCULAR_GAP = (4 / 48) * CIRCULAR_C;

/**
 * M3 circular progress — SVG ring with rounded caps + track gap. Prefer
 * `Spinner` for compact inline/button busy states.
 */
export function CircularProgress({
  value,
  label,
  size = "md",
  className,
  ...rest
}: CircularProgressProps) {
  const indeterminate = value == null;
  const ratio = indeterminate ? 0 : clamp01(value);
  const rootClass = [
    "fynns-circular-progress",
    `fynns-circular-progress--${size}`,
    indeterminate ? "fynns-circular-progress--indeterminate" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const activeLen = Math.max(0, (CIRCULAR_C - CIRCULAR_GAP) * ratio);
  const trackLen = Math.max(0, CIRCULAR_C - CIRCULAR_GAP);

  return (
    <div
      {...rest}
      className={rootClass}
      role="progressbar"
      aria-label={label}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(ratio * 100)}
    >
      <svg className="fynns-circular-progress-svg" viewBox="0 0 48 48" aria-hidden>
        <g transform="rotate(-90 24 24)">
          {!indeterminate ? (
            <circle
              className="fynns-circular-progress-track"
              cx="24"
              cy="24"
              r={CIRCULAR_R}
              fill="none"
              strokeDasharray={`${trackLen} ${CIRCULAR_GAP}`}
              strokeDashoffset={-activeLen - CIRCULAR_GAP}
            />
          ) : null}
          <circle
            className="fynns-circular-progress-active"
            cx="24"
            cy="24"
            r={CIRCULAR_R}
            fill="none"
            strokeDasharray={
              indeterminate
                ? `${CIRCULAR_C * 0.2} ${CIRCULAR_C * 0.8}`
                : `${activeLen} ${CIRCULAR_C - activeLen}`
            }
          />
        </g>
      </svg>
    </div>
  );
}
