/// <reference types="vitest" />
import { defineConfig } from "vite";
import { rawMinifyPlugin } from "@sourcebug/vite-extreme-plugin";
import { resolve } from "path";

export default defineConfig(({ mode }) => ({
  plugins: [rawMinifyPlugin()],
  base: mode === "production" ? "/extreme/" : "/",
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@sourcebug/extreme/dev":
        mode === "production" ? "@sourcebug/extreme" : "@sourcebug/extreme/dev",
    },
  },
  test: {
    environment: "jsdom",
  },
}));
