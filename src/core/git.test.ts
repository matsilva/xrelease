import { execa } from "execa";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { commitAndPush, createAndPushTag } from "./git.js";

// Only mock execa since we don't want to run actual git commands
vi.mock("execa");

describe("Git operations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(execa).mockResolvedValue({ stdout: "", stderr: "" } as any);
  });

  describe("createAndPushTag", () => {
    it("should call git commands with correct arguments", async () => {
      await createAndPushTag("1.0.0");

      // Verify correct git commands are executed
      expect(execa).toHaveBeenCalledTimes(2);
      expect(execa).toHaveBeenNthCalledWith(1, "git", [
        "tag",
        "-a",
        "v1.0.0",
        "-m",
        "Release v1.0.0",
      ]);
      expect(execa).toHaveBeenNthCalledWith(2, "git", [
        "push",
        "origin",
        "v1.0.0",
      ]);
    });
  });

  describe("commitAndPush", () => {
    it("should call git commands with correct arguments", async () => {
      await commitAndPush("1.0.0");

      // Verify correct git commands are executed
      expect(execa).toHaveBeenCalledTimes(3);
      expect(execa).toHaveBeenNthCalledWith(1, "git", ["add", "."]);
      expect(execa).toHaveBeenNthCalledWith(2, "git", [
        "commit",
        "-m",
        "chore: release v1.0.0",
      ]);
      expect(execa).toHaveBeenNthCalledWith(3, "git", ["push"]);
    });
  });
});
