import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * The API target comes from `VITE_API_TARGET` in `.env.local` — it used to be
 * hardcoded here while a second, different URL sat in .env.local and a third
 * in src/hooks/request.js. One source now.
 *
 * When VITE_USE_MOCKS=true the proxy is bypassed entirely: src/mocks answers
 * /api/v1 in the browser before a request ever leaves the page.
 */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const target = env.VITE_API_TARGET;

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      proxy: target
        ? {
            "/api": {
              target,
              changeOrigin: true,
              secure: false,
              configure: (proxy) => {
                proxy.on("proxyReq", (_proxyReq, req) => {
                  console.log(`[proxy →] ${req.method} ${req.url}`);
                });
                proxy.on("proxyRes", (proxyRes, req) => {
                  console.log(`[proxy ←] ${proxyRes.statusCode} ${req.url}`);
                });
                proxy.on("error", (err, req) => {
                  console.warn(`[proxy ✗] ${req.url} — ${err.message}`);
                });
              },
            },
          }
        : undefined,
    },
  };
});
