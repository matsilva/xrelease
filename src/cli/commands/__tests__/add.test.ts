import { describe, it, expect, vi, beforeEach } from "vitest";
import path from "path";
import { addCommand } from "../add.js";
import { setupGitHooks } from "../../../core/hooks.js";
import { setupTemplates, TEMPLATES } from "../../../core/template.js";
import { readConfig } from "../../../core/config.js";

// Mock dependencies
vi.mock("chalk", async () => {
  const actual = await vi.importActual("chalk");
  return {
    ...actual,
    default: {
      red: (str: string) => str,
      green: (str: string) => str,
    },
  };
});
vi.mock("../../../core/git.js");
vi.mock("../../../core/template.js");
vi.mock("../../../core/hooks.js");
vi.mock("../../../core/config.js");

const TEST_DIR = "test-output/add-tests";

describe("addCommand", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mock implementations
    vi.mocked(setupGitHooks).mockResolvedValue(undefined);
    vi.mocked(setupTemplates).mockResolvedValue(undefined);
    vi.mocked(readConfig).mockRejectedValue(new Error("config not found"));
  });

  it("should add workflow component", async () => {
    await addCommand("workflow", TEST_DIR);

    expect(setupTemplates).toHaveBeenCalledWith(
      {
        workflow: true,
        changelog: false,
        hooks: false,
      },
      TEMPLATES,
      TEST_DIR,
    );
  });

  it("should add changelog component", async () => {
    await addCommand("changelog", TEST_DIR);

    expect(setupTemplates).toHaveBeenCalledWith(
      {
        workflow: false,
        changelog: true,
        hooks: false,
      },
      TEMPLATES,
      TEST_DIR,
    );
  });

  it("should add hooks component", async () => {
    await addCommand("hooks", TEST_DIR);

    expect(readConfig).toHaveBeenCalledWith(
      path.join(TEST_DIR, ".xrelease.yml"),
    );
    expect(setupGitHooks).toHaveBeenCalledWith(TEST_DIR, "npm");
  });

  it("should use package manager from config when available", async () => {
    vi.mocked(readConfig).mockResolvedValue({
      version: 1,
      packageManager: "pnpm",
      release: {} as any,
    });

    await addCommand("hooks", TEST_DIR);

    expect(setupGitHooks).toHaveBeenCalledWith(TEST_DIR, "pnpm");
  });

  it("should use bun package manager from config when available", async () => {
    vi.mocked(readConfig).mockResolvedValue({
      version: 1,
      packageManager: "bun",
      release: {} as any,
    });

    await addCommand("hooks", TEST_DIR);

    expect(setupGitHooks).toHaveBeenCalledWith(TEST_DIR, "bun");
  });

  it("should show error for invalid component", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const processSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);

    await addCommand("invalid" as any, TEST_DIR);

    expect(consoleSpy).toHaveBeenCalledWith("Invalid component: invalid");
    expect(processSpy).toHaveBeenCalledWith(1);
  });

  it("should handle errors when adding workflow", async () => {
    const error = new Error("Failed to add workflow");
    vi.mocked(setupTemplates).mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const processSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);

    await addCommand("workflow", TEST_DIR);

    expect(consoleSpy).toHaveBeenCalledWith("\nError: Failed to add workflow");
    expect(processSpy).toHaveBeenCalledWith(1);
  });

  it("should handle errors when adding hooks", async () => {
    const error = new Error("Failed to add hooks");
    vi.mocked(setupGitHooks).mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const processSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);

    await addCommand("hooks", TEST_DIR);

    expect(consoleSpy).toHaveBeenCalledWith("\nError: Failed to add hooks");
    expect(processSpy).toHaveBeenCalledWith(1);
  });

  it("should handle non-Error objects in error handling", async () => {
    vi.mocked(setupTemplates).mockRejectedValue("String error");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const processSpy = vi
      .spyOn(process, "exit")
      .mockImplementation(() => undefined as never);

    await addCommand("workflow", TEST_DIR);

    expect(consoleSpy).toHaveBeenCalledWith("\nError: Unknown error occurred");
    expect(processSpy).toHaveBeenCalledWith(1);
  });
});
