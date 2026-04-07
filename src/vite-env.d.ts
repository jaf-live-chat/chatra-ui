/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MODE?: string;
  readonly VITE_API_URL_LOCAL?: string;
  readonly VITE_API_PROD_URL?: string;
  readonly VITE_API_DEVELOPMENT_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
