import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, Plugin, PreviewServer, ViteDevServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { applyTokensPlugin } from "./plugins/applyTokensPlugin";

const dir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dir, "../..");

/** Changes each `vite` process start — session UI restores only while this matches. */
const sandboxBootId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const WASM_REFUSE_BODY =
  "fynns sandbox does not serve /wasm (Raycaster). " +
  "GSC Live Preview's twin-host iframe (localhost ↔ 127.0.0.1 on the same port) " +
  "likely hit this server. Stop sandbox or free that twin binding, then reload GSC.";

/**
 * When sandbox and GSC both claim :5174 on Windows, `localhost` and `127.0.0.1`
 * can resolve to different Vite processes. GSC loads Raycaster via a twin-host
 * iframe (`…/wasm/preview-shell.html`); without this guard, Vite's SPA fallback
 * would serve the sandbox index into that iframe under "Loading Raycaster…".
 *
 * Does not change ports — only refuses Wasm paths and cross-origin framing.
 */
function sandboxRefuseGscTwinEmbedPlugin(): Plugin {
  const attach = (middlewares: Connect.Server) => {
    middlewares.use(
      (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
        const pathname = (req.url ?? "/").split("?")[0] ?? "/";
        if (pathname === "/wasm" || pathname.startsWith("/wasm/")) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          // Early `res.end` skips Vite's `server.headers` — set framing policy here too.
          res.setHeader("Content-Security-Policy", "frame-ancestors 'self'");
          res.setHeader("X-Frame-Options", "SAMEORIGIN");
          res.end(WASM_REFUSE_BODY);
          return;
        }
        next();
      },
    );
  };

  const headers = {
    // localhost vs 127.0.0.1 are different origins — blocks GSC twin iframes
    // without affecting top-level Cursor Simple Browser / normal tabs.
    "Content-Security-Policy": "frame-ancestors 'self'",
    "X-Frame-Options": "SAMEORIGIN",
  } as const;

  return {
    name: "sandbox-refuse-gsc-twin-embed",
    configureServer(server: ViteDevServer) {
      attach(server.middlewares);
    },
    configurePreviewServer(server: PreviewServer) {
      attach(server.middlewares);
    },
    config() {
      return {
        server: { headers: { ...headers } },
        preview: { headers: { ...headers } },
      };
    },
  };
}

export default defineConfig({
  root: dir,
  plugins: [react(), applyTokensPlugin(repoRoot), sandboxRefuseGscTwinEmbedPlugin()],
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
