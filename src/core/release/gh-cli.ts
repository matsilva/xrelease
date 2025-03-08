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
  const args = ['release', 'create', `v${version}`];

  // Add release notes if provided
  if (body) {
    args.push('--notes', body);
  }

  // Add assets if provided
  if (assets?.length) {
    for (const asset of assets) {
      args.push('--attach', asset);
    }
  }

  try {
    await execa('gh', args);
  } catch (error) {
    throw new Error(`Failed to create GitHub release: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
