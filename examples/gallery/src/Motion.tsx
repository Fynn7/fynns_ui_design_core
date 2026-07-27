import { useState } from "react";
import { Button } from "@fynns/ui";
import { Row, Section } from "./galleryShared";

const EASING_DEMOS = [
  { label: "ease-out", token: "var(--fynns-ease-out)" },
  { label: "emphasized", token: "var(--fynns-ease-emphasized)" },
  { label: "spring", token: "var(--fynns-ease-spring)" },
  { label: "in-out", token: "var(--fynns-ease-in-out)" },
] as const;

function EasingBar({
  label,
  easing,
  replayLabel,
}: {
  label: string;
  easing: string;
  replayLabel: string;
}) {
  const [run, setRun] = useState(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--fynns-space-2xs)", flex: "1 1 10rem" }}>
      <span style={{ fontSize: "var(--fynns-font-size-caption)", color: "var(--fynns-color-text-muted)" }}>
        {label}
      </span>
      <div
        style={{
          position: "relative",
          height: "2rem",
          borderRadius: "var(--fynns-radius-sm)",
          border: "var(--fynns-border-hairline) solid var(--fynns-color-border)",
          background: "var(--fynns-color-surface-muted)",
          overflow: "hidden",
        }}
      >
        <div
          key={run}
          style={{
            position: "absolute",
            top: "0.35rem",
            left: "0.35rem",
            width: "1.25rem",
            height: "1.25rem",
            borderRadius: "var(--fynns-radius-round)",
            background: "var(--fynns-color-accent)",
            animation: `fynns-gallery-ease var(--fynns-duration-slow) ${easing} both`,
          }}
        />
      </div>
      <Button size="sm" onClick={() => setRun((n) => n + 1)}>
        {replayLabel}
      </Button>
    </div>
  );
}

export type MotionTitles = {
  easing?: string;
  flyout?: string;
  flyoutHelp?: string;
  replay?: string;
};

export function Motion({ titles }: { titles?: MotionTitles } = {}) {
  const replay = titles?.replay ?? "Replay";
  return (
    <>
      <style>{`
        @keyframes fynns-gallery-ease {
          from { transform: translateX(0); }
          to { transform: translateX(calc(100% + 6rem)); }
        }
      `}</style>
      <Section title={titles?.easing ?? "Easing curves"}>
        <Row>
          {EASING_DEMOS.map((demo) => (
            <EasingBar
              key={demo.label}
              label={demo.label}
              easing={demo.token}
              replayLabel={replay}
            />
          ))}
        </Row>
      </Section>
      <Section title={titles?.flyout ?? "Flyout & overlay motion"}>
        <p style={{ margin: 0, fontSize: "var(--fynns-font-size-form-label)", color: "var(--fynns-color-text-muted)" }}>
          {titles?.flyoutHelp ??
            "Open a dialog, select, split-button menu, or tooltip in the Components section to preview enter animations."}
        </p>
      </Section>
    </>
  );
}
