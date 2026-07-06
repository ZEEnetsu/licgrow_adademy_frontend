import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Intercepts any request starting with /api
      "/api": {
        target: "https://e366-2409-40d1-445-11e4-eba9-baad-250-8472.ngrok-free.app",
        changeOrigin: true,
        secure: false,
        // Optional: Adds terminal logging so you can track down 404s easily
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log(`[Proxy Request]: ${req.method} ${req.url}`);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(`[Proxy Response]: ${proxyRes.statusCode} ${req.url}`);
          });
        },
      },
    },
  },
});