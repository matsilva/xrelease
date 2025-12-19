import { execa } from "execa";
import { readConfig } from "../config.js";

export async function runPreReleaseChecks(configPath?: string): Promise<void> {
  try {
    // Read config
    const config = await readConfig(configPath);

    if (!config.release.checks?.length) {
      return; // No checks configured
    }

    // Run each check in sequence
    for (const check of config.release.checks) {
      if (!check.command) {
        // Skip checks without commands (they might be handled elsewhere)
        continue;
      }

      try {
        await execa(check.command, { shell: true });
      } catch (error) {
        throw new Error(
          `${check.type} check failed: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("ENOENT")) {
      return; // No config file, skip checks
    }
    throw error;
  }
}
