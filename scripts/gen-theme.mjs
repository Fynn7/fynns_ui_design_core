/**
 * Regenerates `src/theme/theme.css` from the typed token tables in
 * `src/theme/tokens.ts` (+ `src/theme/motionTokens.ts`).
 *
 * `tokens.ts` is the single source of truth; `theme.css` is a committed
 * generated artifact so that consumers only need to import the CSS (no Vite
 * plugin required). Run after editing any token:  `npm run gen:theme`.
 *
 * Implementation: bundles `tokens.ts` with esbuild (a Vite transitive dep) into
 * an in-memory ESM module, imports it, then composes the `:root` block with the
 * static base layer (reset, scrollbar skin, reduced-motion, sr-only).
 *
 * Pure builders live on the token module itself (`buildRootCssVarsBlock`,
 * `buildLightThemeCssBlock`, `fynnsVarName`) so the aesthetic sandbox can reuse
 * the same naming rules when applying overrides back into `tokens.ts`.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const entry = path.join(root, "src/theme/tokens.ts");
const outFile = path.join(root, "src/theme/theme.css");

const bundled = await build({
  entryPoints: [entry],
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
});
const code = bundled.outputFiles[0].text;
const mod = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
);

const rootBlock = mod.buildRootCssVarsBlock();
const lightBlock = mod.buildLightThemeCssBlock();

const BASE_CSS = `
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#root {
  height: 100%;
  margin: 0;
}

body {
  font-family: var(--fynns-font-ui);
  background: var(--fynns-color-app-bg);
  color: var(--fynns-color-text);
  line-height: var(--fynns-line-height-root);
}

/* Code-like text: always the mono stack (Consolas first). */
code,
kbd,
samp,
pre {
  font-family: var(--fynns-font-mono);
}

button {
  font: inherit;
  cursor: pointer;
}

::selection {
  background: var(--fynns-color-accent-soft);
  color: var(--fynns-color-text);
}

/*
 * Scrollbars: visible by default (touch / coarse pointer — no reliable hover).
 * Fine pointer + hover: idle-transparent, reveal on host :hover / :focus-within.
 */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--fynns-scrollbar-thumb) var(--fynns-scrollbar-track);
}

*::-webkit-scrollbar {
  width: var(--fynns-scrollbar-size);
  height: var(--fynns-scrollbar-size);
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background-color: var(--fynns-scrollbar-thumb);
  border-radius: var(--fynns-radius-lg);
  border: var(--fynns-scrollbar-thumb-border) solid transparent;
  background-clip: padding-box;
  transition: background-color var(--fynns-duration-scrollbar) var(--fynns-ease-out);
}

*::-webkit-scrollbar-thumb:hover {
  background-color: var(--fynns-scrollbar-thumb-hover);
}

*::-webkit-scrollbar-thumb:active {
  background-color: var(--fynns-scrollbar-thumb-active);
}

@media (hover: hover) and (pointer: fine) {
  * {
    /* Idle: invisible. Reveal on host hover / focus-within (Firefox has no thumb ladder). */
    scrollbar-color: transparent transparent;
  }

  *:hover,
  *:focus-within {
    scrollbar-color: var(--fynns-scrollbar-thumb) var(--fynns-scrollbar-track);
  }

  *::-webkit-scrollbar-thumb {
    background-color: transparent;
  }

  *:hover::-webkit-scrollbar-thumb,
  *:focus-within::-webkit-scrollbar-thumb {
    background-color: var(--fynns-scrollbar-thumb);
  }
}

/*
 * Scroll surfaces: every overflow:auto/scroll host must carry .fynns-scroll.
 * Native classic bars are hidden — they must never steal content width (badges /
 * chevrons / Switch tracks). Overlay thumbs are painted by
 * src/theme/overlayScrollbar.ts (fixed portal rails; never inflate scrollWidth).
 * Portal is pointer-events:none; rails opt in so thumbs can drag / track-click.
 * Fine pointer: overlay thumb idle-hidden until host hover / focus-within.
 * Touch: overlay always tinted when overflowing. Do not use scrollbar-gutter
 * stable/both-edges. Carousel / SearchBar focused input hide bars in primitives.
 * Textarea / input: native bar also hidden; no overlay rail (replaced elements).
 * Horizontal overlay only when overflow-x is auto/scroll — clip/hidden hosts
 * stay vertical-only (no fake X bar).
 */
.fynns-scroll {
  scrollbar-width: none;
  scrollbar-gutter: unset;
}

.fynns-scroll::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  display: none;
}

/* Positioning context no longer required — rails live in a fixed portal. */
.fynns-scroll--overlay-host {
  position: relative;
}

.fynns-scroll-overlay-portal {
  position: fixed;
  inset: 0;
  /* Above modal (60) so Dialog / Drawer / Sheet scroll hosts keep visible thumbs;
   * below tooltip (8000). Portal ignores hits; rails re-enable for drag. */
  z-index: var(--fynns-z-toast);
  pointer-events: none;
  overflow: hidden;
}

.fynns-scroll-rail {
  position: fixed;
  z-index: 1;
  /* Idle-transparent rails must not steal edge clicks; enable when shown. */
  pointer-events: none;
  touch-action: none;
  box-sizing: border-box;
}

.fynns-scroll-rail[data-visible="true"]:not([hidden]),
.fynns-scroll-rail[data-dragging]:not([hidden]) {
  pointer-events: auto;
}

.fynns-scroll-thumb {
  position: absolute;
  inset-inline-start: 0;
  inset-block-start: 0;
  box-sizing: border-box;
  border-radius: var(--fynns-radius-lg);
  border: var(--fynns-scrollbar-thumb-border) solid transparent;
  background-clip: padding-box;
  background-color: var(--fynns-scrollbar-thumb);
  transition: background-color var(--fynns-duration-scrollbar) var(--fynns-ease-out);
  will-change: transform;
  cursor: default;
}

.fynns-scroll-rail:hover .fynns-scroll-thumb {
  background-color: var(--fynns-scrollbar-thumb-hover);
}

.fynns-scroll-rail[data-dragging] .fynns-scroll-thumb {
  background-color: var(--fynns-scrollbar-thumb-active);
}

@media (hover: hover) and (pointer: fine) {
  .fynns-scroll-rail[data-visible="false"] .fynns-scroll-thumb {
    background-color: transparent;
  }

  .fynns-scroll-rail[data-visible="true"] .fynns-scroll-thumb {
    background-color: var(--fynns-scrollbar-thumb);
  }

  .fynns-scroll-rail[data-visible="true"]:hover .fynns-scroll-thumb {
    background-color: var(--fynns-scrollbar-thumb-hover);
  }

  .fynns-scroll-rail[data-visible="true"][data-dragging] .fynns-scroll-thumb {
    background-color: var(--fynns-scrollbar-thumb-active);
  }
}

.fynns-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: var(--fynns-duration-instant) !important;
    animation-iteration-count: 1 !important;
    transition-duration: var(--fynns-duration-instant) !important;
    scroll-behavior: auto !important;
  }

  *::-webkit-scrollbar-thumb {
    transition-duration: var(--fynns-duration-instant) !important;
  }
}
`;

const header =
  "/*\n" +
  " * GENERATED FILE -- do not edit by hand.\n" +
  " * Source of truth: src/theme/tokens.ts + src/theme/motionTokens.ts\n" +
  " * Regenerate with: npm run gen:theme\n" +
  " */\n";

writeFileSync(outFile, `${header}${rootBlock}\n${lightBlock}\n${BASE_CSS}`, "utf8");
console.log(`Wrote ${path.relative(root, outFile)}`);
