import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: dir,
  plugins: [react()],
  server: {
    port: 5174,
  },
  resolve: {
    alias: {
      "@fynns/ui": path.resolve(dir, "../../src/index.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
});
