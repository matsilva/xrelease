import { execa } from 'execa';

export async function checkGitHubCLI(): Promise<boolean> {
  try {
    await execa('gh', ['--version']);
    return true;
  } catch {
    return false;
  }
}

export async function isGitHubCLIAuthenticated(): Promise<boolean> {
  try {
    await execa('gh', ['auth', 'status']);
    return true;
  } catch {
    return false;
  }
}

export async function createGitHubRelease({ version, body, assets }: { version: string; body?: string; assets?: string[] }): Promise<void> {
  const tagName = `v${version}`;

  // Create the release first
  const createArgs = ['release', 'create', tagName];
  if (body) {
    createArgs.push('--notes', body);
  }

  try {
    // Create the release
    await execa('gh', createArgs);

    // Upload assets if provided
    if (assets?.length) {
      // Use upload command with all assets at once for better performance
      const uploadArgs = ['release', 'upload', tagName, ...assets];
      await execa('gh', uploadArgs);
    }
  } catch (error) {
    throw new Error(`Failed to create GitHub release: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
