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

button {
  font: inherit;
  cursor: pointer;
}

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
  border-radius: var(--fynns-scrollbar-thumb-radius);
  border: var(--fynns-scrollbar-thumb-border) solid transparent;
  background-clip: padding-box;
}

*::-webkit-scrollbar-thumb:hover {
  background-color: var(--fynns-scrollbar-thumb-hover);
}

*::-webkit-scrollbar-thumb:active {
  background-color: var(--fynns-scrollbar-thumb-active);
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
}
`;

const header =
  "/*\n" +
  " * GENERATED FILE -- do not edit by hand.\n" +
  " * Source of truth: src/theme/tokens.ts + src/theme/motionTokens.ts\n" +
  " * Regenerate with: npm run gen:theme\n" +
  " */\n";

writeFileSync(outFile, `${header}${rootBlock}\n${BASE_CSS}`, "utf8");
console.log(`Wrote ${path.relative(root, outFile)}`);
