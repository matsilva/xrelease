import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { bumpVersion } from "../bump-version.js";

// Mock fs
vi.mock("fs/promises");

describe("bumpVersion", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should bump patch version correctly", async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify({ version: "1.0.0" })
    );
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    const newVersion = await bumpVersion("patch");
    expect(newVersion).toBe("1.0.1");
    expect(fs.writeFile).toHaveBeenCalledWith(
      "package.json",
      expect.stringContaining('"version": "1.0.1"')
    );
  });

  it("should bump minor version correctly", async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify({ version: "1.0.0" })
    );
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    const newVersion = await bumpVersion("minor");
    expect(newVersion).toBe("1.1.0");
    expect(fs.writeFile).toHaveBeenCalledWith(
      "package.json",
      expect.stringContaining('"version": "1.1.0"')
    );
  });

  it("should bump major version correctly", async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify({ version: "1.0.0" })
    );
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);

    const newVersion = await bumpVersion("major");
    expect(newVersion).toBe("2.0.0");
    expect(fs.writeFile).toHaveBeenCalledWith(
      "package.json",
      expect.stringContaining('"version": "2.0.0"')
    );
  });

  it("should throw if package.json has no version", async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({}));

    await expect(bumpVersion()).rejects.toThrow(
      "No version field found in package.json"
    );
  });

  it("should throw if package.json cannot be read", async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error("File not found"));

    await expect(bumpVersion()).rejects.toThrow("File not found");
  });
});
