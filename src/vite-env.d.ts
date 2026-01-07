/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TURNSTILE_SITEKEY?: string;
  readonly VITE_ADMIN_TOKEN?: string;
  readonly VITE_SHOW_ADMIN_ENTRY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Image modules
declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}