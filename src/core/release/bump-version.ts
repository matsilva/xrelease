import fs from 'fs/promises';
import semver from 'semver';

export type BumpType = 'patch' | 'minor' | 'major';

export async function bumpVersion(type: BumpType = 'patch'): Promise<string> {
  try {
    // Read package.json
    const pkgJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));

    if (!pkgJson.version) {
      throw new Error('No version field found in package.json');
    }

    // Calculate new version
    const newVersion = semver.inc(pkgJson.version, type);
    if (!newVersion) {
      throw new Error(`Failed to increment version ${pkgJson.version} with type ${type}`);
    }

    // Update package.json
    pkgJson.version = newVersion;
    await fs.writeFile('package.json', JSON.stringify(pkgJson, null, 2));

    return newVersion;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to bump version');
  }
}
