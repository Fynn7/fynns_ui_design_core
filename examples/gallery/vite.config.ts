import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const dir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: dir,
  plugins: [react()],
  resolve: {
    alias: {
      "@fynns/ui": path.resolve(dir, "../../src/index.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
});
