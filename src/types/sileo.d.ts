declare module 'sileo' {
  interface SileoOptions {
    title?: string;
    description?: string;
    fill?: string;
    duration?: number;
    [key: string]: unknown;
  }

  interface SileoPromiseOptions {
    loading?: SileoOptions;
    success?: SileoOptions;
    error?: SileoOptions;
    [key: string]: unknown;
  }

  interface SileoActionOptions {
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    button?: Record<string, unknown> | Record<string, unknown>[];
    [key: string]: unknown;
  }

  interface Sileo {
    success(options: SileoOptions): void;
    error(options: SileoOptions): void;
    info(options: SileoOptions): void;
    warning(options: SileoOptions): void;
    promise<T>(promise: Promise<T>, options: SileoPromiseOptions): Promise<T>;
    action(options: SileoActionOptions): Promise<boolean>;
  }

  export const sileo: Sileo;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Toaster: (props?: any) => JSX.Element;
}
