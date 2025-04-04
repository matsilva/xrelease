import { execa } from 'execa';
import { readConfig } from '../config.js';

export async function runPreReleaseSteps(configPath?: string): Promise<void> {
  try {
    // Read config
    const config = await readConfig(configPath);

    if (!config.release.pre?.length) {
      return; // No pre steps configured
    }

    // Run each check in sequence
    for (const step of config.release.pre) {
      if (!step.command) {
        // Skip steps without commands (they might be handled elsewhere)
        continue;
      }

      try {
        await execa(step.command, { shell: true });
      } catch (error) {
        throw new Error(`${step.type} step failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      return; // No config file, skip steps
    }
    throw error;
  }
}
