# LLM / agent: consume `@fynns/ui` via submodule

**Single source of truth for *installing* this design system into any app repo.**  
Design language & component catalog remain in [`AGENTS.md`](../AGENTS.md).  
Machine contract: [`consume.json`](consume.json).

## Hard rules

1. **Git submodule + source alias** — not an npm package for day-to-day use.
2. **Never** add `@fynns/ui` or `@fynns/ui-design-core` to `package.json` `dependencies` / `devDependencies`.
3. Alias name is **`@fynns/ui`** → `packages/fynns_ui_design_core/src/index.ts`.
4. Vite must **`dedupe: ["react", "react-dom"]`**.
5. Do not edit submodule sources for consumer features; bump the pin instead.

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

```tsx
import { Button, Collapsible, Toaster } from "@fynns/ui";
```

Then follow [`AGENTS.md`](../AGENTS.md) (tokens, primitives, a11y).

## Verify

```bash
node scripts/install-as-submodule.mjs --target <CONSUMER_ROOT> --check --json
```

Exit code `0` means submodule + alias look good and no forbidden npm deps were found.
