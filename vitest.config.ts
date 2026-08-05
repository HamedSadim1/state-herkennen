import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // The utils under test are pure (no DOM); keep the default node
    // environment instead of pulling in jsdom.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
