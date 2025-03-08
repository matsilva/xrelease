import fs from 'fs/promises';
import yaml from 'yaml';
import path from 'path';

export interface VersionConfig {
  files?: Array<{
    path: string;
    pattern: string;
    template: string;
  }>;
}

export interface ChangelogConfig {
  enabled?: boolean;
  template?: 'conventional' | 'simple';
}

export interface Check {
  type: string;
  command?: string;
}

export interface Action {
  type: string;
  command?: string;
  name?: string;
  assets?: string | string[];
}

export interface ReleaseConfig {
  // Branch configuration
  branch?: string;
  branches?: string[];

  // Version configuration
  defaultBump?: 'major' | 'minor' | 'patch';
  version?: VersionConfig;

  // Changelog configuration
  changelog?: ChangelogConfig;

  // Pre-release checks
  checks?: Check[];

  // Release actions actions
  actions?: Action[];
}

export interface Config {
  version: number;
  release: ReleaseConfig;
}

const DEFAULT_CONFIG: Config = {
  version: 1,
  release: {
    branch: 'main',
    defaultBump: 'patch',
    changelog: {
      enabled: true,
      template: 'conventional',
    },
  },
};

const DEFAULT_CONFIG_PATH = '.xrelease.yml';

export async function readConfig(configPath?: string): Promise<Config> {
  try {
    // Resolve config path
    const resolvedPath = configPath ? path.resolve(configPath) : path.resolve(DEFAULT_CONFIG_PATH);

    const configFile = await fs.readFile(resolvedPath, 'utf-8');
    const config = yaml.parse(configFile) as Config;

    // Validate and merge with defaults
    return {
      version: config.version || DEFAULT_CONFIG.version,
      release: {
        ...DEFAULT_CONFIG.release,
        ...config.release,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('ENOENT')) {
      if (configPath) {
        // If a specific path was provided but not found, that's an error
        throw new Error(`Config file not found at: ${configPath}`);
      }
      // No config file at default path, use defaults
      return DEFAULT_CONFIG;
    }
    throw error;
  }
}
