import fs from "node:fs/promises";
import { execa } from "execa";

export type ChangelogTemplate = "conventional" | "simple";

const CHANGELOG_HEADER_REGEX = /^(# Changelog\n\n)?/;
const COMMIT_HASH_REGEX = /^[a-f0-9]+ /;
const CONVENTIONAL_COMMIT_REGEX =
  /^[a-f0-9]+ (feat|fix|docs|style|refactor|test|chore)(\([^)]+\))?: (.+)$/;

export async function generateChangelog(
  version: string,
  template: ChangelogTemplate = "conventional"
): Promise<void> {
  try {
    // Try to get the last tag
    let commits: string;
    try {
      const { stdout: lastTag } = await execa("git", [
        "describe",
        "--tags",
        "--abbrev=0",
      ]);
      // Get commits since last tag
      const { stdout } = await execa("git", [
        "log",
        "--oneline",
        "--no-merges",
        `${lastTag}..HEAD`,
      ]);
      commits = stdout;
    } catch {
      // If no tags exist, get all commits
      const { stdout } = await execa("git", [
        "log",
        "--oneline",
        "--no-merges",
      ]);
      commits = stdout;
    }

    // Generate changelog content
    const date = new Date().toISOString().split("T")[0];
    const header = `## [${version}] - ${date}\n\n`;

    let content = "";
    if (!commits.trim()) {
      content = "* No changes\n\n";
    } else if (template === "conventional") {
      content = formatConventionalCommits(commits);
    } else {
      content = formatSimpleCommits(commits);
    }

    const changelogContent = header + content;

    try {
      // Try to read existing changelog
      const existingChangelog = await fs.readFile("CHANGELOG.md", "utf-8");
      const updatedChangelog = existingChangelog.replace(
        CHANGELOG_HEADER_REGEX,
        ""
      ); // Remove existing header if present
      await fs.writeFile(
        "CHANGELOG.md",
        `# Changelog\n\n${changelogContent}${updatedChangelog}`
      );
    } catch {
      // If file doesn't exist, create new one
      await fs.writeFile("CHANGELOG.md", `# Changelog\n\n${changelogContent}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("ENOENT")) {
      throw new Error("Failed to update changelog file");
    }
    throw error;
  }
}

function formatConventionalCommits(commits: string): string {
  const lines = commits.split("\n").filter(Boolean);
  const formatted = lines.map((line) => {
    const match = line.match(CONVENTIONAL_COMMIT_REGEX);
    if (match) {
      const [, type, , message] = match;
      return `* ${type}: ${message}`;
    }
    return `* ${line.replace(COMMIT_HASH_REGEX, "")}`;
  });
  return `${formatted.join("\n")}\n\n`;
}

function formatSimpleCommits(commits: string): string {
  return `${commits
    .split("\n")
    .filter(Boolean)
    .map((line) => `* ${line.replace(COMMIT_HASH_REGEX, "")}`)
    .join("\n")}\n\n`;
}
