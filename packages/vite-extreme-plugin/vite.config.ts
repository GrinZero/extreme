import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "RawMinifyPlugin",
      formats: ["es", "umd"],
    },
    outDir: "dist",
    rollupOptions: {
      external: ["html-minifier", "csso"],
      output: {
        globals: {
          "html-minifier": "HTMLMinifier",
          csso: "csso",
        },
      },
    },
  },
  plugins: [
    dts({
      outDir: "types",
    }),
  ],
});
