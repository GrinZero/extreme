/// <reference types="vitest" />
import { defineConfig } from "vite";
import { rawMinifyPlugin } from "vite-raw-minify-plugin";
import { resolve } from "path";

export default defineConfig(({ mode }) => ({
  plugins: [rawMinifyPlugin()],
  // base: mode === "production" ? "/exterme/" : "/",
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
  },
}));
