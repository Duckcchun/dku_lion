/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TURNSTILE_SITEKEY?: string;
  readonly VITE_ADMIN_TOKEN?: string;
  readonly VITE_SHOW_ADMIN_ENTRY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}