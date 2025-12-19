import { execa } from "execa";
import minimatch from "minimatch";
import { readConfig } from "../config.js";

export async function checkBranch(
  overrideBranch?: string,
  configPath?: string
): Promise<void> {
  try {
    // Get current branch
    const { stdout: currentBranch } = await execa("git", [
      "rev-parse",
      "--abbrev-ref",
      "HEAD",
    ]);

    // Get allowed branches from config
    const config = await readConfig(configPath);
    const allowedBranches = getAllowedBranches(config, overrideBranch);

    // Check if current branch matches any of the allowed patterns
    const isAllowed = allowedBranches.some((pattern) =>
      pattern.includes("*")
        ? minimatch(currentBranch, pattern)
        : currentBranch === pattern
    );

    if (!isAllowed) {
      throw new Error(
        `Release must be created from one of these branches: '${allowedBranches.join("', '")}'. Current branch is '${currentBranch}'`
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to check git branch");
  }
}

function getAllowedBranches(
  config: { release: { branch?: string; branches?: string[] } },
  overrideBranch?: string
): string[] {
  if (overrideBranch) {
    return [overrideBranch];
  }

  // Support both single branch and multiple branches in config
  if (config.release.branches?.length) {
    return config.release.branches;
  }

  return [config.release.branch || "main"];
}
