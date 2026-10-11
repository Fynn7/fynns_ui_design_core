import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "happy-dom",
    // Node CLI helpers keep a shebang; Vite transform treats `#!` as a syntax error.
    server: {
      deps: {
        external: [/scripts[/\\](ensure-sibling-ui-core|check-workspace-ui)\.mjs$/],
      },
    },
  },
});
