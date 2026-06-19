import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  // Allow Railway's generated *.up.railway.app host when serving the preview build.
  preview: { host: true, allowedHosts: true },
});
