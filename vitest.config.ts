import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "coverage/**",
        "dist/**",
        "**/*.d.ts",
        "test{,s}/**",
        "**/*.test.ts",
        "**/__tests__/**",
      ],
    },
  },
});
