// CLI Options
export interface InitOptions {
  yes?: boolean;
  language?: string;
}

// Component Configuration
export interface ComponentConfig {
  workflow: boolean;
  changelog: boolean;
  hooks: boolean;
  language?: string;
}

// Git Hook Configuration
export interface GitHookConfig {
  name: string;
  command: string;
}

// Template Configuration
export interface TemplateConfig {
  source: string;
  destination: string;
  transform?: (content: string) => string;
}

// Error Types
export class ToolkitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToolkitError';
  }
}

export class ValidationError extends ToolkitError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ConfigurationError extends ToolkitError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export interface AddOptions {
  component: 'workflow' | 'changelog' | 'hooks';
}

export interface TemplateOptions {
  projectName?: string;
  owner?: string;
  registry?: string;
}
