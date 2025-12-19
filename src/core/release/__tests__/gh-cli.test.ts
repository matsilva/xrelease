import { execa } from "execa";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkGitHubCLI,
  createGitHubRelease,
  isGitHubCLIAuthenticated,
} from "../gh-cli.js";

vi.mock("execa");

describe("GitHub CLI utilities", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("checkGitHubCLI", () => {
    it("should return true if gh CLI is available", async () => {
      vi.mocked(execa).mockResolvedValueOnce({
        stdout: "gh version 2.0.0",
      } as any);
      expect(await checkGitHubCLI()).toBe(true);
    });

    it("should return false if gh CLI is not available", async () => {
      vi.mocked(execa).mockRejectedValueOnce(new Error("command not found"));
      expect(await checkGitHubCLI()).toBe(false);
    });
  });

  describe("isGitHubCLIAuthenticated", () => {
    it("should return true if gh CLI is authenticated", async () => {
      vi.mocked(execa).mockResolvedValueOnce({
        stdout: "Logged in to github.com",
      } as any);
      expect(await isGitHubCLIAuthenticated()).toBe(true);
    });

    it("should return false if gh CLI is not authenticated", async () => {
      vi.mocked(execa).mockRejectedValueOnce(new Error("not logged in"));
      expect(await isGitHubCLIAuthenticated()).toBe(false);
    });
  });

  describe("createGitHubRelease", () => {
    it("should create a release with version only", async () => {
      // First call checks if release exists (throws = doesn't exist)
      vi.mocked(execa).mockRejectedValueOnce(new Error("release not found"));
      // Second call creates the release
      vi.mocked(execa).mockResolvedValueOnce({ stdout: "" } as any);

      await createGitHubRelease({ version: "1.0.0" });

      // First call: check if release exists
      expect(execa).toHaveBeenNthCalledWith(1, "gh", [
        "release",
        "view",
        "v1.0.0",
      ]);
      // Second call: create the release
      expect(execa).toHaveBeenNthCalledWith(2, "gh", [
        "release",
        "create",
        "v1.0.0",
      ]);
      expect(execa).toHaveBeenCalledTimes(2);
    });

    it("should create a release with notes", async () => {
      // First call checks if release exists (throws = doesn't exist)
      vi.mocked(execa).mockRejectedValueOnce(new Error("release not found"));
      // Second call creates the release
      vi.mocked(execa).mockResolvedValueOnce({ stdout: "" } as any);

      await createGitHubRelease({ version: "1.0.0", body: "Release notes" });

      expect(execa).toHaveBeenNthCalledWith(2, "gh", [
        "release",
        "create",
        "v1.0.0",
        "--notes",
        "Release notes",
      ]);
      expect(execa).toHaveBeenCalledTimes(2);
    });

    it("should create a release with assets in one command", async () => {
      // First call checks if release exists (throws = doesn't exist)
      vi.mocked(execa).mockRejectedValueOnce(new Error("release not found"));
      // Second call creates the release with assets
      vi.mocked(execa).mockResolvedValueOnce({ stdout: "" } as any);

      await createGitHubRelease({
        version: "1.0.0",
        assets: ["dist/app.js", "dist/app.css"],
      });

      // Assets are now included in the create command, not uploaded separately
      expect(execa).toHaveBeenNthCalledWith(2, "gh", [
        "release",
        "create",
        "v1.0.0",
        "dist/app.js",
        "dist/app.css",
      ]);
      expect(execa).toHaveBeenCalledTimes(2);
    });

    it("should create a release with notes and assets", async () => {
      // First call checks if release exists (throws = doesn't exist)
      vi.mocked(execa).mockRejectedValueOnce(new Error("release not found"));
      // Second call creates the release
      vi.mocked(execa).mockResolvedValueOnce({ stdout: "" } as any);

      await createGitHubRelease({
        version: "1.0.0",
        body: "Release notes",
        assets: ["dist/app.js"],
      });

      expect(execa).toHaveBeenNthCalledWith(2, "gh", [
        "release",
        "create",
        "v1.0.0",
        "--notes",
        "Release notes",
        "dist/app.js",
      ]);
      expect(execa).toHaveBeenCalledTimes(2);
    });

    it("should delete existing release before creating new one", async () => {
      // First call: release exists
      vi.mocked(execa).mockResolvedValueOnce({ stdout: "release info" } as any);
      // Second call: delete release
      vi.mocked(execa).mockResolvedValueOnce({ stdout: "" } as any);
      // Third call: create release
      vi.mocked(execa).mockResolvedValueOnce({ stdout: "" } as any);

      await createGitHubRelease({ version: "1.0.0" });

      expect(execa).toHaveBeenNthCalledWith(1, "gh", [
        "release",
        "view",
        "v1.0.0",
      ]);
      expect(execa).toHaveBeenNthCalledWith(2, "gh", [
        "release",
        "delete",
        "v1.0.0",
        "--yes",
      ]);
      expect(execa).toHaveBeenNthCalledWith(3, "gh", [
        "release",
        "create",
        "v1.0.0",
      ]);
      expect(execa).toHaveBeenCalledTimes(3);
    });

    it("should handle release creation errors", async () => {
      // First call: release doesn't exist
      vi.mocked(execa).mockRejectedValueOnce(new Error("release not found"));
      // Second call: create fails
      vi.mocked(execa).mockRejectedValueOnce(
        new Error("Failed to create release")
      );

      await expect(createGitHubRelease({ version: "1.0.0" })).rejects.toThrow(
        "Failed to create GitHub release: Failed to create release"
      );
    });
  });
});
