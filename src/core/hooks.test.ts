import fs from "node:fs/promises";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setupGitHooks } from "./hooks.js";
import { setupTemplates, TEMPLATES } from "./template.js";

const TEST_DIR = "test-output/hooks-tests";

describe("setupGitHooks", { timeout: 20_000 }, () => {
  beforeEach(async () => {
    vi.resetAllMocks();

    // Clean up and create test directory
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {
      // Directory might not exist, that's fine
    }
    await fs.mkdir(TEST_DIR, { recursive: true });
    await setupTemplates(
      { workflow: true, changelog: true, hooks: true },
      TEMPLATES,
      TEST_DIR
    );
  });

  describe("setupGitHooks", () => {
    it("should setup git hooks successfully", async () => {
      await setupGitHooks(TEST_DIR);

      // Verify directories and files exist
      await expect(
        fs.access(path.join(TEST_DIR, ".husky"))
      ).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(TEST_DIR, ".husky/commit-msg"))
      ).resolves.toBeUndefined();
      await expect(
        fs.access(path.join(TEST_DIR, "commitlint.config.js"))
      ).resolves.toBeUndefined();

      // Verify hook content
      const commitMessageHook = await fs.readFile(
        path.join(TEST_DIR, ".husky/commit-msg"),
        "utf-8"
      );
      expect(commitMessageHook).toBe("npx --no -- commitlint --edit $1");

      // Verify commitlint config content
      const commitlintConfig = await fs.readFile(
        path.join(TEST_DIR, "commitlint.config.js"),
        "utf-8"
      );
      expect(commitlintConfig).toBe(
        "export default { extends: ['@commitlint/config-conventional'] };"
      );
    });
  });
});
