/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module 'donot' {
  export function $(selector: string): HTMLElement | null;
  export function sample<T>(arr: T[]): T;
}

export {};

