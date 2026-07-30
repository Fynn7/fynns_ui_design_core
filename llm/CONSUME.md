# LLM / agent: consume `@fynns/ui` via submodule

**Single source of truth for *installing* this design system into any app repo.**  
Design language & component catalog remain in [`AGENTS.md`](../AGENTS.md).  
Machine contract: [`consume.json`](consume.json).

**Short user prompts:** humans often say only “use `@fynns/ui` / build a Collapsible page”. Treat this file as mandatory before writing UI code — do **not** wait for a long task doc.

## Hard rules

1. **Git submodule + source alias** — not an npm package for day-to-day use.
2. **Never** add `@fynns/ui` or `@fynns/ui-design-core` to `package.json` `dependencies` / `devDependencies`.
3. Alias name is **`@fynns/ui`** → `packages/fynns_ui_design_core/src/index.ts`.
4. Vite must **`dedupe: ["react", "react-dom"]`**.
5. Do not edit submodule sources for consumer features; bump the pin instead.
6. **TypeScript:** set consumer `compilerOptions.target` and `lib` to **ES2022** (or later). `tsc` follows `@fynns/ui` into this repo’s `.ts` sources (e.g. `String.replaceAll`); `ES2020` alone will fail typecheck even when Vite builds fine.
7. **Toaster:** if the app calls `toast.*`, mount **`<Toaster />` once** near the app root (same tree as the page). Importing `toast` without `<Toaster />` builds but shows no notifications.
8. **Entry:** `main.tsx` (or equivalent) must `createRoot(...).render(<App />)` (or equivalent). Importing CSS alone produces an empty build that still “succeeds”.
9. **No fakes:** never hand-roll a disclosure/collapsible chrome; never define a local `Collapsible` that replaces `@fynns/ui`; never use `@radix-ui/*` / `sonner`.
10. **CSS modules for `tsc`:** if `package.json` build runs `tsc` (not Vite-only), add `src/vite-env.d.ts` with `/// <reference types="vite/client" />` (or equivalent `declare module "*.css"`). Otherwise `tsc` fails on this package’s `import "./theme/theme.css"` from the `@fynns/ui` barrel.
11. **Preview pages:** for a component playground/preview, mirror the matching sandbox `*PreviewCanvas` under `examples/sandbox/src/pages/` (anatomy + controlled props). Copy/strings may differ; chrome must come from `@fynns/ui`. Then skim the primitive in `src/primitives/` and [`AGENTS.md`](../AGENTS.md).

## Agent checklist (greenfield / short prompt)

1. Read this file + `consume.json`.
2. Run the one-shot installer (below) against the **consumer** root (use `--url` to a local checkout when offline).
3. Run `--check` until exit 0.
4. Scaffold React + Vite + TS only (no design-system npm dep); keep `lib`/`target` at ES2022+.
5. Implement the page from sandbox preview + AGENTS catalog; mount `Toaster` if using `toast`.
6. `npm install` → `npm run build` must exit 0.

## One-shot install (any consumer repo)

If this core repo is not yet available on disk, clone it to a temp folder first, then run the installer against the **consumer** root:

### Windows (PowerShell)

```powershell
$core = Join-Path $env:TEMP "fynns_ui_design_core"
if (-not (Test-Path "$core\scripts\install-as-submodule.mjs")) {
  git clone --depth 1 https://github.com/Fynn7/fynns_ui_design_core.git $core
}
node "$core\scripts\install-as-submodule.mjs" --target "<CONSUMER_ROOT>" --json
```

Or from a local checkout:

```powershell
powershell -ExecutionPolicy Bypass -File D:\path\to\fynns_ui_design_core\scripts\install-as-submodule.ps1 -Target <CONSUMER_ROOT>
```

### POSIX

```bash
git clone --depth 1 https://github.com/Fynn7/fynns_ui_design_core.git /tmp/fynns_ui_design_core
node /tmp/fynns_ui_design_core/scripts/install-as-submodule.mjs --target <CONSUMER_ROOT> --json
```

### From this repo

```bash
npm run consume:install -- --target ../my-app --json
```

## What the script does

1. Resolves the consumer **git root**.
2. `git submodule add` (default path `packages/fynns_ui_design_core`) or `submodule update --init` if already registered.
3. Wires the nearest `vite.config.*` (`@fynns/ui` alias + React dedupe) when possible.
4. Wires a nearby `tsconfig*.json` `compilerOptions.paths`.
5. Warns if a forbidden npm dependency on `@fynns/*` is present.
6. With `--json`, prints a structured result for agents.

Useful flags: `--check`, `--wire-only`, `--skip-wire`, `--dry-run`, `--vite <file>`, `--tsconfig <file>`, `--submodule-path <path>`, `--branch <name>`.

## After install

Ensure the consumer `tsconfig` (example):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "paths": { "@fynns/ui": ["./packages/fynns_ui_design_core/src/index.ts"] }
  }
}
```

And `src/vite-env.d.ts` (when `tsc` is part of build):

```ts
/// <reference types="vite/client" />
```

```tsx
import { Button, Collapsible, toast, Toaster } from "@fynns/ui";

// Once per app (e.g. in App / root layout):
<>
  <Toaster />
  {/* …page that may call toast.message(...) */}
</>
```

Then follow [`AGENTS.md`](../AGENTS.md) (tokens, primitives, a11y).

## Verify

```bash
node scripts/install-as-submodule.mjs --target <CONSUMER_ROOT> --check --json
```

Exit code `0` means submodule + alias look good and no forbidden npm deps were found.
