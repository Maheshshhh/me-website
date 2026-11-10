/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly VITE_APP_ENV?: "development" | "uat" | "production";
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_LOCAL_AUTH_USERNAME?: string;
  readonly VITE_LOCAL_AUTH_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
