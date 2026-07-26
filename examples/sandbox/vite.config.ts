import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { applyTokensPlugin } from "./plugins/applyTokensPlugin";

const dir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dir, "../..");

export default defineConfig({
  root: dir,
  plugins: [react(), applyTokensPlugin(repoRoot)],
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
