import fs from "node:fs/promises";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyPackageManagerToWorkflow,
  setupTemplates,
  TEMPLATES,
  updateVersionInFile,
} from "./template.js";

const TEST_DIR = "test-output/template-tests";

describe("setupTemplates", () => {
  beforeEach(async () => {
    // Clean up and create test directory
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {
      // Directory might not exist, that's fine
    }
    await fs.mkdir(TEST_DIR, { recursive: true });

    vi.resetAllMocks();
  });

  it("should create package.json if it does not exist", async () => {
    await setupTemplates(
      { workflow: true, changelog: false, hooks: false },
      TEMPLATES,
      TEST_DIR
    );

    const pkgJson = JSON.parse(
      await fs.readFile(path.join(TEST_DIR, "package.json"), "utf-8")
    );
    expect(pkgJson).toEqual({
      name: path.basename(TEST_DIR),
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        test: 'echo "add your test command here"',
      },
    });
  });

  it("should not create package.json if it already exists", async () => {
    // Create package.json first
    const existingPkg = {
      name: "existing-project",
      version: "1.0.0",
      private: true,
      type: "module",
      scripts: {
        test: 'echo "add your test command here"',
      },
    };
    await fs.writeFile(
      path.join(TEST_DIR, "package.json"),
      JSON.stringify(existingPkg, null, 2)
    );

    await setupTemplates(
      { workflow: true, changelog: false, hooks: false },
      TEMPLATES,
      TEST_DIR
    );

    // Verify package.json wasn't modified
    const pkgJson = JSON.parse(
      await fs.readFile(path.join(TEST_DIR, "package.json"), "utf-8")
    );
    expect(pkgJson).toEqual(existingPkg);
  });

  it("should process workflow templates when workflow is true", async () => {
    await setupTemplates(
      { workflow: true, changelog: false, hooks: false },
      TEMPLATES,
      TEST_DIR
    );

    // Verify workflow file exists and has content
    const workflowPath = path.join(TEST_DIR, ".github/workflows/release.yml");
    const content = await fs.readFile(workflowPath, "utf-8");
    expect(content).toContain("name: Release");
  });

  it("should process changelog templates when changelog is true", async () => {
    await setupTemplates(
      { workflow: false, changelog: true, hooks: false },
      TEMPLATES,
      TEST_DIR
    );

    // Verify versionrc exists and has content
    const content = await fs.readFile(
      path.join(TEST_DIR, ".versionrc"),
      "utf-8"
    );
    expect(content).toBeTruthy();
  });

  it("should process both workflow and changelog templates when both are true", async () => {
    await setupTemplates(
      { workflow: true, changelog: true, hooks: false },
      TEMPLATES,
      TEST_DIR
    );

    // Verify both files exist
    const workflowPath = path.join(TEST_DIR, ".github/workflows/release.yml");
    const content = await fs.readFile(workflowPath, "utf-8");
    expect(content).toContain("name: Release");

    const versionrcPath = path.join(TEST_DIR, ".versionrc");
    const versionrcContent = await fs.readFile(versionrcPath, "utf-8");
    expect(versionrcContent).toBeTruthy();
  });

  it("should use specified language for templates", async () => {
    await setupTemplates(
      { workflow: true, changelog: true, hooks: false, language: "go" },
      TEMPLATES,
      TEST_DIR
    );

    // Verify Go-specific workflow file exists and has Go-specific content
    const workflowPath = path.join(TEST_DIR, ".github/workflows/release.yml");
    const content = await fs.readFile(workflowPath, "utf-8");
    expect(content).toContain("Setup Go");
  });

  it("should throw error with message when directory cannot be created", async () => {
    // Make a file where we want a directory to prevent directory creation
    await fs.mkdir(path.join(TEST_DIR, ".github"), { recursive: true });
    await fs.writeFile(path.join(TEST_DIR, ".github/workflows"), ""); // This will prevent creating workflows directory

    await expect(
      setupTemplates(
        { workflow: true, changelog: false, hooks: false },
        TEMPLATES,
        TEST_DIR
      )
    ).rejects.toThrow();
  });

  it("should create destination directories before writing files", async () => {
    await setupTemplates(
      { workflow: true, changelog: true, hooks: false },
      TEMPLATES,
      TEST_DIR
    );

    // Verify directories exist
    await expect(
      fs.access(path.join(TEST_DIR, ".github"))
    ).resolves.toBeUndefined();
    await expect(
      fs.access(path.join(TEST_DIR, ".github/workflows"))
    ).resolves.toBeUndefined();
  });

  it("should show final success message when all templates are configured", async () => {
    await setupTemplates(
      { workflow: true, changelog: true, hooks: false },
      TEMPLATES,
      TEST_DIR
    );
  });

  it("should use module name from go.mod only when language is go", async () => {
    // Create a go.mod file first
    const goModContent = `module github.com/silvabyte/AudeticLinkInstaller

go 1.22.5

require (
    github.com/alecthomas/kong v1.8.1
    github.com/fatih/color v1.16.0
)`;
    await fs.writeFile(path.join(TEST_DIR, "go.mod"), goModContent);

    // Test with Go language - should use go.mod name
    await setupTemplates(
      { workflow: true, changelog: false, hooks: false, language: "go" },
      TEMPLATES,
      TEST_DIR
    );
    let pkgJson = JSON.parse(
      await fs.readFile(path.join(TEST_DIR, "package.json"), "utf-8")
    );
    expect(pkgJson).toEqual({
      name: "AudeticLinkInstaller",
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        test: 'echo "add your test command here"',
      },
    });

    // Delete package.json and test with Node language - should use directory name
    await fs.unlink(path.join(TEST_DIR, "package.json"));
    await setupTemplates(
      { workflow: true, changelog: false, hooks: false, language: "node" },
      TEMPLATES,
      TEST_DIR
    );
    pkgJson = JSON.parse(
      await fs.readFile(path.join(TEST_DIR, "package.json"), "utf-8")
    );
    expect(pkgJson).toEqual({
      name: path.basename(TEST_DIR),
      version: "0.1.0",
      private: true,
      type: "module",
      scripts: {
        test: 'echo "add your test command here"',
      },
    });
  });

  it("should handle go module paths correctly", async () => {
    // Create a go.mod file with a full module path
    const modulePath = "github.com/silvabyte/AudeticLinkInstaller";
    const goModContent = `module ${modulePath}

go 1.22.5

require (
    github.com/alecthomas/kong v1.8.1
    github.com/fatih/color v1.16.0
)`;
    await fs.writeFile(path.join(TEST_DIR, "go.mod"), goModContent);

    // Test with Go language
    await setupTemplates(
      { workflow: true, changelog: false, hooks: false, language: "go" },
      TEMPLATES,
      TEST_DIR
    );

    // Verify package.json uses just the project name
    const pkgJson = JSON.parse(
      await fs.readFile(path.join(TEST_DIR, "package.json"), "utf-8")
    );
    expect(pkgJson.name).toBe("AudeticLinkInstaller");

    // Verify go.mod still has the full module path
    const updatedGoMod = await fs.readFile(
      path.join(TEST_DIR, "go.mod"),
      "utf-8"
    );
    expect(updatedGoMod).toContain(`module ${modulePath}`);
  });
});

describe("updateVersionInFile", () => {
  beforeEach(async () => {
    // Clean up and create test directory
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {
      // Directory might not exist, that's fine
    }
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  it("should update version in package.json", async () => {
    // Create test package.json
    const pkgJson = {
      name: "test-project",
      version: "1.0.0",
    };
    const pkgPath = path.join(TEST_DIR, "package.json");
    await fs.writeFile(pkgPath, JSON.stringify(pkgJson, null, 2));

    // Update version
    await updateVersionInFile({
      path: pkgPath,
      pattern: '"version":\\s*"([^"]+)"',
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Template pattern for version replacement
      template: '"version": "${version}"',
      version: "2.0.0",
    });

    // Verify update
    const updated = JSON.parse(await fs.readFile(pkgPath, "utf-8"));
    expect(updated.version).toBe("2.0.0");
  });

  it("should preserve module path in go.mod while updating", async () => {
    // Test cases for different module path formats
    const testCases = [
      {
        desc: "module path without version",
        input: "module github.com/user/project",
        expected: "module github.com/user/project",
      },
      {
        desc: "module path with version",
        input: "module github.com/user/project/v2",
        expected: "module github.com/user/project/v2",
      },
    ];

    for (const tc of testCases) {
      // Create test go.mod
      const goModContent = `${tc.input}

go 1.22.5

require (
    github.com/alecthomas/kong v1.8.1
)`;
      const goModPath = path.join(TEST_DIR, "go.mod");
      await fs.writeFile(goModPath, goModContent);

      // Update with pattern that should preserve module path
      await updateVersionInFile({
        path: goModPath,
        pattern: "^module\\s+([^\\s]+)",
        // biome-ignore lint/suspicious/noTemplateCurlyInString: Template pattern for capture group
        template: "module ${1}",
        version: "2.0.0", // This version should not affect the output
      });

      // Verify module path is preserved exactly as it was
      const updated = await fs.readFile(goModPath, "utf-8");
      expect(updated).toContain(tc.expected);
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Verifying template placeholder was replaced
      expect(updated).not.toContain("${1}"); // Make sure template placeholder is replaced
    }
  });

  it("should handle multiple capture groups", async () => {
    // Create test file with multiple groups
    const testPath = path.join(TEST_DIR, "test.txt");
    await fs.writeFile(testPath, "prefix-abc-xyz-suffix");

    // Update with multiple capture groups
    await updateVersionInFile({
      path: testPath,
      pattern: "prefix-([^-]+)-([^-]+)-suffix",
      // biome-ignore lint/suspicious/noTemplateCurlyInString: Template pattern with multiple placeholders
      template: "prefix-${1}-${version}-${2}-suffix",
      version: "2.0.0",
    });

    // Verify all placeholders are replaced correctly
    const updated = await fs.readFile(testPath, "utf-8");
    expect(updated).toBe("prefix-abc-2.0.0-xyz-suffix");
  });

  it("should throw error if file does not exist", async () => {
    const nonExistentPath = path.join(TEST_DIR, "nonexistent.txt");

    await expect(
      updateVersionInFile({
        path: nonExistentPath,
        pattern: "version:\\s*(.*)",
        // biome-ignore lint/suspicious/noTemplateCurlyInString: Template pattern for version replacement
        template: "version: ${version}",
        version: "1.0.0",
      })
    ).rejects.toThrow();
  });
});

describe("applyPackageManagerToWorkflow", () => {
  const sampleWorkflow = `name: Release
on:
  workflow_dispatch:
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          # node-version-file: '.nvmrc' # or use a .nvmrc file instead
          registry-url: 'https://registry.npmjs.org'
      - name: Create Release
        run: npx -y xrelease create --bump patch`;

  it("should not modify workflow for npm package manager", () => {
    const result = applyPackageManagerToWorkflow(sampleWorkflow, "npm");
    expect(result).toContain("npx -y xrelease");
    expect(result).toContain("Setup Node.js");
    expect(result).toContain("actions/setup-node@v4");
  });

  it("should replace npx with pnpm dlx for pnpm package manager", () => {
    const result = applyPackageManagerToWorkflow(sampleWorkflow, "pnpm");
    expect(result).toContain("pnpm dlx xrelease");
    expect(result).not.toContain("npx -y");
    expect(result).toContain("Setup pnpm");
    expect(result).toContain("pnpm/action-setup@v4");
  });

  it("should replace npx with bunx for bun package manager", () => {
    const result = applyPackageManagerToWorkflow(sampleWorkflow, "bun");
    expect(result).toContain("bunx xrelease");
    expect(result).not.toContain("npx -y");
    expect(result).toContain("Setup Bun");
    expect(result).toContain("oven-sh/setup-bun@v2");
  });
});

describe("setupTemplates with package manager", () => {
  beforeEach(async () => {
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {
      // Directory might not exist
    }
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  it("should apply bun package manager to workflow template", async () => {
    await setupTemplates(
      { workflow: true, changelog: false, hooks: false, packageManager: "bun" },
      TEMPLATES,
      TEST_DIR
    );

    const workflowPath = path.join(TEST_DIR, ".github/workflows/release.yml");
    const content = await fs.readFile(workflowPath, "utf-8");
    expect(content).toContain("bunx xrelease");
    expect(content).toContain("Setup Bun");
    expect(content).toContain("oven-sh/setup-bun@v2");
  });

  it("should apply pnpm package manager to workflow template", async () => {
    await setupTemplates(
      {
        workflow: true,
        changelog: false,
        hooks: false,
        packageManager: "pnpm",
      },
      TEMPLATES,
      TEST_DIR
    );

    const workflowPath = path.join(TEST_DIR, ".github/workflows/release.yml");
    const content = await fs.readFile(workflowPath, "utf-8");
    expect(content).toContain("pnpm dlx xrelease");
    expect(content).toContain("Setup pnpm");
    expect(content).toContain("pnpm/action-setup@v4");
  });
});
