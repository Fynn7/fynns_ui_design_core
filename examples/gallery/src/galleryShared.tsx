import type { ReactNode } from "react";

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--fynns-space-sm)" }}>
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--fynns-space-2xs)", minWidth: "5.5rem" }}>
      <div
        style={{
          height: "2.5rem",
          borderRadius: "var(--fynns-radius-sm)",
          border: "var(--fynns-border-hairline) solid var(--fynns-color-border)",
          background: `var(${token})`,
        }}
      />
      <span style={{ fontSize: "var(--fynns-font-size-caption)", color: "var(--fynns-color-text-muted)" }}>
        {label}
      </span>
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--fynns-space-sm)", alignItems: "center" }}>
      {children}
    </div>
  );
}
