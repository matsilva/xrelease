import { execa } from "execa";

export async function checkGitHubCLI(): Promise<boolean> {
  try {
    await execa("gh", ["--version"]);
    return true;
  } catch {
    return false;
  }
}

export async function isGitHubCLIAuthenticated(): Promise<boolean> {
  try {
    await execa("gh", ["auth", "status"]);
    return true;
  } catch {
    return false;
  }
}

export async function createGitHubRelease({
  version,
  body,
  assets,
}: {
  version: string;
  body?: string;
  assets?: string[];
}): Promise<void> {
  const tagName = `v${version}`;

  try {
    // Check if release already exists
    try {
      await execa("gh", ["release", "view", tagName]);
      // Release exists, delete it first
      await execa("gh", ["release", "delete", tagName, "--yes"]);
    } catch {
      // Release doesn't exist, which is fine
    }

    // Create the release with assets
    const createArgs = ["release", "create", tagName];
    if (body) {
      createArgs.push("--notes", body);
    }
    // Add assets directly to the create command
    if (assets?.length) {
      createArgs.push(...assets);
    }

    await execa("gh", createArgs);
  } catch (error) {
    throw new Error(
      `Failed to create GitHub release: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
