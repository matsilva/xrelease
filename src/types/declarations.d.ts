declare module 'ora' {
  interface Ora {
    start(text?: string): Ora;
    stop(): Ora;
    succeed(text?: string): Ora;
    fail(text?: string): Ora;
    warn(text?: string): Ora;
    info(text?: string): Ora;
  }

  interface Options {
    text?: string;
    spinner?: string;
    color?: string;
    indent?: number;
    interval?: number;
    stream?: NodeJS.WriteStream;
    isEnabled?: boolean;
    isSilent?: boolean;
  }

  function ora(options?: Options | string): Ora;
  export = ora;
}

declare module '*.json' {
  const value: any;
  export default value;
} 