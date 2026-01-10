/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PROJECT_ID: string;
  readonly CMSDOCS_WEBHOOK_SECRET: string;
  readonly VERCEL_DEPLOY_HOOK_URL: string;
  readonly VERCEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

