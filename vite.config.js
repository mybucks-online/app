import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true, // Polyfill the Buffer global
      },
    }),
  ],
  resolve: {
    alias: {
      "@mybucks": path.resolve(__dirname, "./src"),
    },
  },
});
