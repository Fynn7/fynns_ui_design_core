import { SPACE_TOKENS, SHADOW_TOKENS } from "@fynns/ui";
import { Row, Section, Swatch } from "./foundationsShared";

const SURFACE_SWATCHES = [
  { label: "app-bg", token: "--fynns-color-app-bg" },
  { label: "surface-1", token: "--fynns-color-surface-1" },
  { label: "surface-2", token: "--fynns-color-surface-2" },
  { label: "surface-3", token: "--fynns-color-surface-3" },
  { label: "surface-4", token: "--fynns-color-surface-4" },
  { label: "surface-5", token: "--fynns-color-surface-5" },
] as const;

const ACCENT_SWATCHES = [
  { label: "accent", token: "--fynns-color-accent" },
  { label: "accent-hover", token: "--fynns-color-accent-hover" },
  { label: "accent-active", token: "--fynns-color-accent-active" },
  { label: "accent-soft", token: "--fynns-color-accent-soft" },
  { label: "on-accent", token: "--fynns-color-on-accent" },
] as const;

const CONTAINER_SWATCHES = [
  { label: "accent-container", token: "--fynns-color-accent-container" },
  { label: "on-accent-container", token: "--fynns-color-on-accent-container" },
  { label: "secondary-container", token: "--fynns-color-secondary-container" },
  { label: "on-secondary-container", token: "--fynns-color-on-secondary-container" },
  { label: "tertiary-container", token: "--fynns-color-tertiary-container" },
  { label: "on-tertiary-container", token: "--fynns-color-on-tertiary-container" },
] as const;

const TEXT_BORDER_SWATCHES = [
  { label: "text", token: "--fynns-color-text" },
  { label: "text-muted", token: "--fynns-color-text-muted" },
  { label: "border", token: "--fynns-color-border" },
  { label: "border-strong", token: "--fynns-color-border-strong" },
  { label: "outline-subtle", token: "--fynns-color-outline-subtle" },
] as const;

const CONTROL_SWATCHES = [
  { label: "control-surface", token: "--fynns-color-control-surface" },
  { label: "control-surface-hover", token: "--fynns-color-control-surface-hover" },
  { label: "input-fill", token: "--fynns-color-input-fill" },
  { label: "flyout-item", token: "--fynns-color-flyout-item" },
  { label: "flyout-item-hover", token: "--fynns-color-flyout-item-hover" },
] as const;

/** Legacy aliases — visible only; prefer the elevation / toast roles above. */
const LEGACY_COLOR_SWATCHES = [
  { label: "surface (legacy)", token: "--fynns-color-surface" },
  { label: "surface-head (legacy)", token: "--fynns-color-surface-head" },
  { label: "toast-surface (legacy)", token: "--fynns-color-toast-surface" },
] as const;

const SEMANTIC_SWATCHES = [
  { label: "success", token: "--fynns-color-success" },
  { label: "warning", token: "--fynns-color-warning" },
  { label: "danger", token: "--fynns-color-danger" },
  { label: "info", token: "--fynns-color-info" },
] as const;

const SPACE_TSHIRT = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;

const SPACE_LEGACY_KEYS = (
  Object.keys(SPACE_TOKENS) as Array<keyof typeof SPACE_TOKENS>
).filter((k) => !(SPACE_TSHIRT as readonly string[]).includes(k));

const FONT_SIZE_KEYS = ["xs", "sm", "md", "lg", "title-large", "xl", "2xl"] as const;

const SIZE_ICON_ROWS = [
  {
    key: "icon",
    note: "Standard chrome glyph (16dp) — IconButton / nav / Banner",
  },
  {
    key: "icon-md",
    note: "Larger glyph (20dp) — Fab sm and denser presence",
  },
  {
    key: "icon-target",
    note: "Touch / IconButton target (40dp)",
  },
] as const;

const SHADOW_KEYS = Object.keys(SHADOW_TOKENS) as Array<keyof typeof SHADOW_TOKENS>;

const FONT_FAMILY_ROWS = [
  { key: "ui", sample: "UI — The quick brown fox" },
  { key: "mono", sample: "Mono — const x = 42;" },
  { key: "serif", sample: "Serif — The quick brown fox" },
] as const;

const FONT_WEIGHT_ROWS = [
  { key: "regular", label: "regular 400" },
  { key: "medium", label: "medium 500" },
  { key: "semibold", label: "semibold 600" },
  { key: "title", label: "title 650" },
  { key: "bold", label: "bold 700" },
] as const;

export type FoundationsTitles = {
  elevation?: string;
  accent?: string;
  containers?: string;
  textBorder?: string;
  controlSurfaces?: string;
  legacyColors?: string;
  semantic?: string;
  spacing?: string;
  spaceLegacy?: string;
  size?: string;
  type?: string;
  fontFamily?: string;
  fontWeight?: string;
  radiusShadow?: string;
  lightTheme?: string;
  lightThemeHelp?: string;
};

export function Foundations({ titles }: { titles?: FoundationsTitles } = {}) {
  return (
    <>
      <Section title={titles?.elevation ?? "Elevation (surface ladder)"}>
        <Row>
          {SURFACE_SWATCHES.map((s) => (
            <Swatch key={s.label} label={s.label} token={s.token} />
          ))}
        </Row>
      </Section>

      <Section title={titles?.accent ?? "Accent palette"}>
        <Row>
          {ACCENT_SWATCHES.map((s) => (
            <Swatch key={s.label} label={s.label} token={s.token} />
          ))}
        </Row>
      </Section>

      <Section title={titles?.containers ?? "M3 container pairs"}>
        <Row>
          {CONTAINER_SWATCHES.map((s) => (
            <Swatch key={s.label} label={s.label} token={s.token} />
          ))}
        </Row>
      </Section>

      <Section title={titles?.textBorder ?? "Text & border"}>
        <Row>
          {TEXT_BORDER_SWATCHES.map((s) => (
            <Swatch key={s.label} label={s.label} token={s.token} />
          ))}
        </Row>
      </Section>

      <Section title={titles?.controlSurfaces ?? "Control surfaces"}>
        <Row>
          {CONTROL_SWATCHES.map((s) => (
            <Swatch key={s.label} label={s.label} token={s.token} />
          ))}
        </Row>
      </Section>

      <Section title={titles?.legacyColors ?? "Legacy color aliases (read-only)"}>
        <p
          style={{
            margin: 0,
            fontSize: "var(--fynns-font-size-caption)",
            color: "var(--fynns-color-text-muted)",
          }}
        >
          Prefer elevation / snackbar roles; these aliases stay for compatibility.
        </p>
        <Row>
          {LEGACY_COLOR_SWATCHES.map((s) => (
            <Swatch key={s.label} label={s.label} token={s.token} />
          ))}
        </Row>
      </Section>

      <Section title={titles?.semantic ?? "Semantic colors"}>
        <Row>
          {SEMANTIC_SWATCHES.map((s) => (
            <Swatch key={s.label} label={s.label} token={s.token} />
          ))}
        </Row>
      </Section>

      <Section title={titles?.spacing ?? "Spacing scale (t-shirt)"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--fynns-space-xs)" }}>
          {SPACE_TSHIRT.map((key) => (
            <div
              key={key}
              style={{ display: "flex", alignItems: "center", gap: "var(--fynns-space-sm)" }}
            >
              <code style={{ fontSize: "var(--fynns-font-size-caption)", minWidth: "2.5rem" }}>
                {key}
              </code>
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

      <Section title={titles?.spaceLegacy ?? "Legacy space aliases (read-only)"}>
        <table className="sandbox-token-table">
          <thead>
            <tr>
              <th scope="col">key</th>
              <th scope="col">value</th>
            </tr>
          </thead>
          <tbody>
            {SPACE_LEGACY_KEYS.map((key) => (
              <tr key={key}>
                <td>
                  <code>space-{key}</code>
                </td>
                <td>
                  <code>{SPACE_TOKENS[key]}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title={titles?.size ?? "Size (icons & targets)"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--fynns-space-sm)" }}>
          {SIZE_ICON_ROWS.map(({ key, note }) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--fynns-space-md)",
                flexWrap: "wrap",
              }}
            >
              <div
                aria-hidden
                style={{
                  width: `var(--fynns-size-${key})`,
                  height: `var(--fynns-size-${key})`,
                  flexShrink: 0,
                  borderRadius: "var(--fynns-radius-sm)",
                  background: "var(--fynns-color-accent-soft)",
                  border: "var(--fynns-border-hairline) solid var(--fynns-color-border)",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                <code style={{ fontSize: "var(--fynns-font-size-caption)" }}>size-{key}</code>
                <span
                  style={{
                    fontSize: "var(--fynns-font-size-caption)",
                    color: "var(--fynns-color-text-muted)",
                  }}
                >
                  {note}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title={titles?.type ?? "Type scale"}>
        {FONT_SIZE_KEYS.map((key) => (
          <p
            key={key}
            style={{
              margin: "0.15rem 0",
              fontSize: `var(--fynns-font-size-${key})`,
              lineHeight:
                key === "title-large"
                  ? "var(--fynns-line-height-title-large)"
                  : undefined,
              color: "var(--fynns-color-text)",
            }}
          >
            <code>font-size-{key}</code> — The quick brown fox
          </p>
        ))}
      </Section>

      <Section title={titles?.fontFamily ?? "Font families"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--fynns-space-xs)" }}>
          {FONT_FAMILY_ROWS.map(({ key, sample }) => (
            <p
              key={key}
              style={{
                margin: 0,
                fontFamily: `var(--fynns-font-${key})`,
                color: "var(--fynns-color-text)",
              }}
            >
              <code style={{ fontFamily: "var(--fynns-font-mono)" }}>font-{key}</code> — {sample}
            </p>
          ))}
        </div>
      </Section>

      <Section title={titles?.fontWeight ?? "Font weights"}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--fynns-space-2xs)" }}>
          {FONT_WEIGHT_ROWS.map(({ key, label }) => (
            <p
              key={key}
              style={{
                margin: 0,
                fontWeight: `var(--fynns-font-weight-${key})`,
                color: "var(--fynns-color-text)",
              }}
            >
              <code>font-weight-{key}</code> — {label}
            </p>
          ))}
        </div>
      </Section>

      <Section title={titles?.radiusShadow ?? "Radius & shadow"}>
        <Row>
          {(["none", "xs", "sm", "md", "lg", "xl", "22", "3xl"] as const).map((r) => (
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
              <code>{r}</code>
            </div>
          ))}
          {SHADOW_KEYS.map((s) => (
            <div
              key={s}
              style={{
                width: "5.5rem",
                height: "3rem",
                borderRadius: "var(--fynns-radius-md)",
                border: "var(--fynns-border-hairline) solid var(--fynns-color-border)",
                background: "var(--fynns-color-surface-1)",
                boxShadow: `var(--fynns-shadow-${s})`,
                display: "grid",
                placeItems: "center",
                fontSize: "var(--fynns-font-size-caption)",
                color: "var(--fynns-color-text-muted)",
                textAlign: "center",
                paddingInline: "0.25rem",
              }}
            >
              <code>{s}</code>
            </div>
          ))}
        </Row>
      </Section>

      <Section title={titles?.lightTheme ?? "Light theme (Apply guardrail)"}>
        <p
          style={{
            margin: 0,
            fontSize: "var(--fynns-font-size-form-label)",
            color: "var(--fynns-color-text-muted)",
            maxWidth: "40rem",
          }}
        >
          {titles?.lightThemeHelp ??
            "Apply writes dark source tokens only (`COLOR_TOKENS` / … in tokens.ts). Light overrides live in `LIGHT_THEME_OVERRIDES` — edit by hand and run `npm run gen:theme`. The live draft can preview light via CSS injection, but Apply does not mirror into the light table."}
        </p>
      </Section>
    </>
  );
}
