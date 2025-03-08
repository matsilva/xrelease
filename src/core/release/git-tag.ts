import { execa } from 'execa';

export async function createAndPushTag(version: string): Promise<void> {
  const tagName = `v${version}`;

  try {
    // Create tag
    await execa('git', ['tag', '-a', tagName, '-m', `Release ${tagName}`]);

    // Push tag
    await execa('git', ['push', 'origin', tagName]);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create or push git tag');
  }
}
