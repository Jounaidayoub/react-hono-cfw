import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  server: {
    port: 5174,
  },
  plugins: [react(), cloudflare()],
});
