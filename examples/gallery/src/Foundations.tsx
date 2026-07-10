import { Row, Section, Swatch } from "./galleryShared";

const SURFACE_SWATCHES = [
  { label: "app-bg", token: "--fynns-color-app-bg" },
  { label: "surface-1", token: "--fynns-color-surface-1" },
  { label: "surface-2", token: "--fynns-color-surface-2" },
  { label: "surface-3", token: "--fynns-color-surface-3" },
] as const;

const ACCENT_SWATCHES = [
  { label: "accent", token: "--fynns-color-accent" },
  { label: "accent-hover", token: "--fynns-color-accent-hover" },
  { label: "accent-active", token: "--fynns-color-accent-active" },
  { label: "accent-soft", token: "--fynns-color-accent-soft" },
] as const;

const SEMANTIC_SWATCHES = [
  { label: "success", token: "--fynns-color-success" },
  { label: "warning", token: "--fynns-color-warning" },
  { label: "danger", token: "--fynns-color-danger" },
  { label: "info", token: "--fynns-color-info" },
] as const;

const SPACING_KEYS = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;
const FONT_SIZE_KEYS = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;

export function Foundations() {
  return (
    <>
      <Section title="Elevation (surface ladder)">
        <Row>
          {SURFACE_SWATCHES.map((s) => (
            <Swatch key={s.label} label={s.label} token={s.token} />
          ))}
        </Row>
      </Section>

      <Section title="Accent palette">
        <Row>
          {ACCENT_SWATCHES.map((s) => (
            <Swatch key={s.label} label={s.label} token={s.token} />
          ))}
        </Row>
      </Section>

      <Section title="Semantic colors">
        <Row>
          {SEMANTIC_SWATCHES.map((s) => (
            <Swatch key={s.label} label={s.label} token={s.token} />
          ))}
        </Row>
      </Section>

      <Section title="Spacing scale (t-shirt)">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--fynns-space-xs)" }}>
          {SPACING_KEYS.map((key) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "var(--fynns-space-sm)" }}>
              <code style={{ fontSize: "var(--fynns-font-size-caption)", minWidth: "2.5rem" }}>{key}</code>
              <div
                style={{
                  width: `var(--fynns-space-${key})`,
                  height: "1rem",
                  background: "var(--fynns-color-accent-24)",
                  borderRadius: "var(--fynns-radius-sm)",
                }}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type scale">
        {FONT_SIZE_KEYS.map((key) => (
          <p
            key={key}
            style={{
              margin: "0.15rem 0",
              fontSize: `var(--fynns-font-size-${key})`,
              color: "var(--fynns-color-text)",
            }}
          >
            font-size-{key} — The quick brown fox
          </p>
        ))}
      </Section>

      <Section title="Radius & shadow">
        <Row>
          {(["sm", "md", "lg"] as const).map((r) => (
            <div
              key={r}
              style={{
                width: "4rem",
                height: "3rem",
                borderRadius: `var(--fynns-radius-${r})`,
                border: "var(--fynns-border-hairline) solid var(--fynns-color-border)",
                background: "var(--fynns-color-surface-1)",
                boxShadow: "var(--fynns-shadow-sm)",
                display: "grid",
                placeItems: "center",
                fontSize: "var(--fynns-font-size-caption)",
                color: "var(--fynns-color-text-muted)",
              }}
            >
              {r}
            </div>
          ))}
          {(["sm", "md", "lg", "glow-accent"] as const).map((s) => (
            <div
              key={s}
              style={{
                width: "5rem",
                height: "3rem",
                borderRadius: "var(--fynns-radius-md)",
                border: "var(--fynns-border-hairline) solid var(--fynns-color-border)",
                background: "var(--fynns-color-surface-1)",
                boxShadow: `var(--fynns-shadow-${s})`,
                display: "grid",
                placeItems: "center",
                fontSize: "var(--fynns-font-size-caption)",
                color: "var(--fynns-color-text-muted)",
              }}
            >
              {s}
            </div>
          ))}
        </Row>
      </Section>
    </>
  );
}
