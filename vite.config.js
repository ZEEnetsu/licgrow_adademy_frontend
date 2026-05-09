import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target =
    env.VITE_API_TARGET?.replace(/\/$/, "") ||
    "http://127.0.0.1:8000";

  /**
   * Browser + RTK use `VITE_API_PATH_PREFIX` (default `/api/v1`) in dev.
   * By default the same path is forwarded to `target` (no rewrite) — typical for
   * FastAPI/Django routers mounted at `/api/v1`.
   *
   * If your backend serves `/auth/register` at the host root, set:
   *   VITE_API_PATH_PREFIX=/api
   *   VITE_PROXY_STRIP_PREFIX=true
   */
  const apiPathPrefix =
    (env.VITE_API_PATH_PREFIX || "/api/v1").replace(/\/$/, "") || "/api/v1";
  const stripPrefix = env.VITE_PROXY_STRIP_PREFIX === "true";

  const escapedBase = apiPathPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const stripLeadingPrefix = new RegExp(`^${escapedBase}`);

  const proxy = {
    target,
    changeOrigin: true,
    secure: false,
    configure(proxyServer) {
      proxyServer.on("proxyReq", (proxyReq) => {
        proxyReq.setHeader("ngrok-skip-browser-warning", "true");
      });
    },
  };
  if (stripPrefix) {
    proxy.rewrite = (path) =>
      path.replace(stripLeadingPrefix, "").replace(/^$/, "/");
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        [apiPathPrefix]: proxy,
      },
    },
  };
});
