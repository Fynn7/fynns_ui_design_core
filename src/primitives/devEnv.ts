/**
 * Dev-only guard for console diagnostics.
 *
 * `import.meta.env.PROD` is the bundler-visible flag (Vite and Vitest define
 * it); `globalThis.process` is **not** statically replaced in a browser
 * bundle, so a `globalThis.process?.env?.NODE_ENV` probe silently reports
 * "not production" in a production app. The Node fallback keeps the helper
 * usable outside a bundler.
 */
export function isDevEnv(): boolean {
  const meta = (import.meta as { env?: { PROD?: boolean } }).env;
  if (meta?.PROD != null) return !meta.PROD;
  const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } })
    .process?.env?.NODE_ENV;
  return nodeEnv !== "production";
}
