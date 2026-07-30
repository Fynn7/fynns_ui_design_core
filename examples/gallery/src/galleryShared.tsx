import type { ReactNode } from "react";

/**
 * Gallery / sandbox demo chrome.
 * Gaps use `--sandbox-*` (draft + GUI). Fallbacks keep standalone gallery usable.
 * Agents: see `SANDBOX_LAYOUT_AGENT_CATALOG` in sandbox `state/baseline.ts`.
 */
export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--sandbox-section-gap, var(--fynns-space-sm))",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: "var(--fynns-font-size-settings-section)",
          textTransform: "uppercase",
          letterSpacing: "var(--fynns-letter-spacing-wide)",
          color: "var(--fynns-color-text-muted)",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Swatch({ label, token }: { label: string; token: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: "var(--sandbox-section-gap, var(--fynns-space-2xs))",
        width: "5.5rem",
      }}
    >
      <div
        style={{
          boxSizing: "border-box",
          width: "100%",
          height: "2.5rem",
          borderRadius: "var(--fynns-radius-md)",
          border: "var(--fynns-border-hairline) solid var(--fynns-color-border)",
          background: `var(${token})`,
        }}
      />
      <code
        style={{
          display: "block",
          boxSizing: "border-box",
          width: "100%",
          margin: 0,
          padding: 0,
          fontSize: "var(--fynns-font-size-caption)",
          lineHeight: 1.2,
          color: "var(--fynns-color-text-muted)",
          textAlign: "center",
          overflowWrap: "anywhere",
        }}
      >
        {label}
      </code>
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--sandbox-row-gap, var(--fynns-space-md))",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
}
