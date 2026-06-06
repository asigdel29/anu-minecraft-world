import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Split rarely-changing third-party code into its own long-lived,
    // content-hashed chunks. three.js is large but stable, so isolating it
    // keeps it cached across application deploys and speeds up repeat visits.
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
          r3f: ["@react-three/fiber", "@react-three/drei"],
        },
      },
    },
    // three.js alone exceeds the default 500 kB advisory; raise the threshold
    // so the build log only warns on genuinely unexpected bloat.
    chunkSizeWarningLimit: 1500,
    // Skip the per-chunk gzip-size pass to shave build time; bundle size is
    // tracked separately when needed.
    reportCompressedSize: false,
  },
});
