import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  /** Django `runserver` boshqa portda bo‘lsa (.env da VITE_DEV_PROXY_TARGET). 8000 band bo‘lsa — odatda boshqa API (FastAPI va hokazo) ishlayapti. */
  const proxyTarget = env.VITE_DEV_PROXY_TARGET?.trim() || "http://127.0.0.1:8000";
  const apiProxy = {
    "/api": {
      target: proxyTarget,
      changeOrigin: true,
      secure: false,
    },
  };

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
      proxy: apiProxy,
    },
    preview: {
      proxy: apiProxy,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
