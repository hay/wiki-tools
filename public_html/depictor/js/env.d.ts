/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $store: ReturnType<typeof import("./store").useDepictorStore>;
  }
}

export {};
