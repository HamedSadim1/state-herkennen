import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Keep the "@" alias in sync with vite.config.ts so tests resolve
      // imports exactly like the app does.
      "@": "/src",
    },
  },
  test: {
    // The utils under test are pure (no DOM); keep the default node
    // environment instead of pulling in jsdom.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
