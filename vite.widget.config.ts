import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env": JSON.stringify({}),
  },
  build: {
    lib: {
      entry: "src/widgets/embed/widgetEntry.tsx",
      name: "LiveChatWidget",
      formats: ["iife"],
      fileName: () => "widget.js",
    },
    outDir: "dist",
    emptyOutDir: true,
    minify: "esbuild",
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      external: [],
    },
  },
});
