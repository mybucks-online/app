import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    assetsInlineLimit: 0,
  },
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true, // Polyfill the Buffer global
      },
    }),
    VitePWA({
      registerType: "autoUpdate",
      manifestFilename: "site.webmanifest",
      includeAssets: [
        "favicon.ico",
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "logo-48x48.png",
        "logo-72x72.png",
        "android-chrome-192x192.png",
        "android-chrome-512x512.png",
        "pwa/screenshot-wide.png",
        "pwa/screenshot-narrow.png",
      ],
      manifest: {
        name: "Mybucks.online | Seedless, Disposable Crypto Wallet with 1-Click Gifting",
        short_name: "mybucks.online",
        description:
          "No servers, no database, no app installs. Fully decentralized. Send crypto by 1-click URL.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/pwa/screenshot-wide.png",
            sizes: "1090x696",
            type: "image/png",
            form_factor: "wide",
            label: "Sign in on desktop",
          },
          {
            src: "/pwa/screenshot-narrow.png",
            sizes: "390x844",
            type: "image/png",
            form_factor: "narrow",
            label: "Sign in on mobile",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      },
      // Set VITE_PWA_DEV=true to register SW + manifest locally (see package.json "dev:pwa")
      devOptions: {
        enabled: process.env.VITE_PWA_DEV === "true",
        // dev-dist has no production bundle; Workbox globs would warn. Plugin uses a minimal dev pattern instead.
        suppressWarnings: process.env.VITE_PWA_DEV === "true",
      },
    }),
  ],
  resolve: {
    alias: {
      "@mybucks": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["js-big-decimal"],
  },
});
