import { useState } from "react";
import { Button, Surface } from "@fynns/ui";
import { DurationTokenTable, easingDemoList } from "../components/TokenList";
import { Row, Section } from "./foundationsShared";

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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--fynns-layout-control-cluster-gap)",
        flex: "1 1 10rem",
      }}
    >
      <span style={{ fontSize: "var(--fynns-font-size-caption)", color: "var(--fynns-color-text-muted)" }}>
        {label}
      </span>
      <Surface
        style={{
          position: "relative",
          height: "2rem",
          flexShrink: 0,
          boxShadow: "none",
          background: "var(--fynns-color-surface-muted)",
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
            animation: `fynns-sandbox-ease var(--fynns-duration-slow) ${easing} both`,
          }}
        />
      </Surface>
      <Button size="sm" onClick={() => setRun((n) => n + 1)}>
        {replayLabel}
      </Button>
    </div>
  );
}

/** Mini flyout enter/exit on the Motion page (not only an external-link tip). */
function FlyoutReplay({
  replayLabel,
  panelLabel,
}: {
  replayLabel: string;
  panelLabel: string;
}) {
  const [run, setRun] = useState(0);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--fynns-layout-control-cluster-gap)",
        maxWidth: "16rem",
      }}
    >
      <div className="sandbox-flyout-replay-stage">
        <div
          key={run}
          className="sandbox-flyout-replay-panel"
          role="presentation"
        >
          {panelLabel}
        </div>
      </div>
      <Button size="sm" onClick={() => setRun((n) => n + 1)}>
        {replayLabel}
      </Button>
    </div>
  );
}

export type MotionTitles = {
  easing?: string;
  duration?: string;
  flyout?: string;
  flyoutHelp?: string;
  flyoutPanel?: string;
  replay?: string;
};

export function Motion({ titles }: { titles?: MotionTitles } = {}) {
  const replay = titles?.replay ?? "Replay";
  return (
    <>
      <style>{`
        @keyframes fynns-sandbox-ease {
          from { transform: translateX(0); }
          to { transform: translateX(calc(100% + 6rem)); }
        }
        @keyframes fynns-sandbox-flyout {
          from {
            opacity: 0;
            transform: translateY(0.35rem) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
      <Section title={titles?.easing ?? "Easing curves"}>
        <Row>
          {easingDemoList().map((demo) => (
            <EasingBar
              key={demo.label}
              label={demo.label}
              easing={demo.token}
              replayLabel={replay}
            />
          ))}
        </Row>
      </Section>
      <Section title={titles?.duration ?? "Duration ladder"}>
        <DurationTokenTable />
      </Section>
      <Section title={titles?.flyout ?? "Flyout & overlay motion"}>
        <p
          style={{
            margin: "0 0 var(--fynns-space-sm)",
            fontSize: "var(--fynns-font-size-form-label)",
            color: "var(--fynns-color-text-muted)",
          }}
        >
          {titles?.flyoutHelp ??
            "Replay a compact flyout enter (ease-out × duration-flyout). Dialogs / menus / tooltips in Components use the same tokens."}
        </p>
        <FlyoutReplay
          replayLabel={replay}
          panelLabel={titles?.flyoutPanel ?? "Menu / flyout"}
        />
      </Section>
    </>
  );
}
