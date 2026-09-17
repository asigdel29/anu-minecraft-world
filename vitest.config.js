import { defineConfig } from "vitest/config";

// Unit-test configuration for the app's pure logic and stores. Tests live
// beside the code they cover as `*.test.{js,jsx}`. The jsdom environment gives
// browser globals (window, localStorage, matchMedia) that the stores and
// control helpers touch; globals are imported explicitly per test file so the
// existing browser-scoped ESLint config needs no test-only override.
export default defineConfig({
  esbuild: {
    // Components use the automatic JSX runtime (@vitejs/plugin-react does this
    // for the app); tests transforming JSX need the same runtime.
    jsx: "automatic",
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{js,jsx}"],
  },
});
