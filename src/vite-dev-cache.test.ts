import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { createServer } from "vite";
import {
  ensureNoStoreDevHeader,
  hasNoStoreDevHeader,
} from "../scripts/vite-dev-cache.mjs";

const coreRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tmpDirs: string[] = [];

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
});

describe("Vite dev cache contract", () => {
  it("adds no-store without removing existing dev headers", () => {
    const source = `export default defineConfig({
  server: { port: 5173, headers: { "X-App": "test" } },
});`;
    const next = ensureNoStoreDevHeader(source);
    expect(next).toContain('"X-App": "test"');
    expect(hasNoStoreDevHeader(next!)).toBe(true);
    expect(ensureNoStoreDevHeader(next!)).toBe(next);
  });

  it("replaces an existing cache policy and handles a config without server", () => {
    const stale = `export default defineConfig({
  server: { headers: { "Cache-Control": "max-age=31536000" } },
});`;
    const next = ensureNoStoreDevHeader(stale);
    expect(hasNoStoreDevHeader(next!)).toBe(true);
    expect(next).not.toContain("max-age=31536000");
    expect(hasNoStoreDevHeader(ensureNoStoreDevHeader("export default defineConfig({ plugins: [] });")!)).toBe(true);
  });

  it("leaves computed headers for manual review", () => {
    const source = `export default defineConfig({
  server: { port: 5173, headers: sharedHeaders },
});`;
    expect(ensureNoStoreDevHeader(source)).toBeNull();
    expect(hasNoStoreDevHeader(source)).toBe(false);
    expect(ensureNoStoreDevHeader('export default { server: { headers: { "Cache-Control": cachePolicy } } };')).toBeNull();
  });

  it("blocks a stale browser policy before dev and passes after core installer migration", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "fynns-ui-cache-"));
    tmpDirs.push(root);
    const initialized = spawnSync("git", ["init", "--quiet", root], { encoding: "utf8" });
    expect(initialized.status).toBe(0);
    fs.mkdirSync(path.join(root, "src"));
    const barrel = path.join(root, "node_modules", "@fynn7", "ui-design-core", "src");
    fs.mkdirSync(barrel, { recursive: true });
    fs.writeFileSync(path.join(barrel, "index.ts"), 'export { ChatReveal } from "./ChatReveal";\n');
    fs.writeFileSync(path.join(barrel, "ChatReveal.tsx"), "export function ChatReveal() {}\n");
    fs.writeFileSync(path.join(root, "src", "App.tsx"), 'import { ChatReveal } from "@fynns/ui";\n');
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({
      name: "cache-fixture",
      dependencies: { "@fynn7/ui-design-core": "file:../fynns_ui_design_core" },
    }));
    const vite = path.join(root, "vite.config.ts");
    fs.writeFileSync(vite, `import path from "node:path";
import { defineConfig } from "vite";
export default defineConfig({
  resolve: {
    alias: { "@fynns/ui": path.resolve(__dirname, "node_modules/@fynn7/ui-design-core/src/index.ts") },
    dedupe: ["react", "react-dom"],
  },
  server: { port: 5173 },
});\n`);

    const gate = path.join(coreRoot, "scripts", "check-ui-exports.mjs");
    const before = spawnSync(process.execPath, [gate, "--target", root, "--json"], { encoding: "utf8" });
    expect(before.status).toBe(1);
    expect(JSON.parse(before.stdout).missing).toEqual([]);
    expect(JSON.parse(before.stdout).error).toContain("Cache-Control: no-store");

    const installer = path.join(coreRoot, "scripts", "install-as-npm.mjs");
    const installed = spawnSync(process.execPath, [installer, "--target", root, "--wire-only", "--json"], { encoding: "utf8" });
    expect(installed.status).toBe(0);
    expect(hasNoStoreDevHeader(fs.readFileSync(vite, "utf8"))).toBe(true);
    const after = spawnSync(process.execPath, [gate, "--target", root, "--json"], { encoding: "utf8" });
    expect(after.status).toBe(0);
  });

  it("serves native ESM with no-store through Vite", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "fynns-ui-vite-"));
    tmpDirs.push(root);
    fs.mkdirSync(path.join(root, "src"));
    fs.writeFileSync(path.join(root, "src", "index.ts"), "export const ChatReveal = true;\n");
    const server = await createServer({
      configFile: false,
      root,
      server: { headers: { "Cache-Control": "no-store" }, port: 0 },
    });
    try {
      await server.listen();
      const address = server.httpServer?.address();
      if (!address || typeof address === "string") throw new Error("Vite did not bind a TCP port");
      const response = await fetch(`http://localhost:${address.port}/src/index.ts`);
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
    } finally {
      await server.close();
    }
  });
});
