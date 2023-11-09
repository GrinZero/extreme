import { defineConfig } from "vite";
import { rawMinifyPlugin } from "vite-raw-minify-plugin";
import { resolve } from "path";

export default defineConfig({
  plugins: [rawMinifyPlugin()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
