import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "happy-dom",
    // Node CLI helper keeps a shebang; Vite transform treats `#!` as a syntax error.
    server: {
      deps: {
        external: [/scripts[/\\]ensure-sibling-ui-core\.mjs$/],
      },
    },
  },
});
