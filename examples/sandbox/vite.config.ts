import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { applyTokensPlugin } from "./plugins/applyTokensPlugin";

const dir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dir, "../..");

/** Changes each `vite` process start — session UI restores only while this matches. */
const sandboxBootId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default defineConfig({
  root: dir,
  plugins: [react(), applyTokensPlugin(repoRoot)],
  define: {
    __SANDBOX_BOOT_ID__: JSON.stringify(sandboxBootId),
  },
  resolve: {
    alias: {
      "@fynns/ui": path.resolve(dir, "../../src/index.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: 5174,
  },
});
