/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_INFURA_API_KEY: string;
  readonly VITE_ALCHEMY_API_KEY: string;
  readonly VITE_TRONGRID_API_KEY: string;
  readonly VITE_ENABLE_TOKEN_HISTORY: string;
  readonly VITE_COMMIT_HASH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
