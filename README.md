# Anavi Blog (Astro + CMSDocs)

Minimal Astro build with Tailwind, Vite PWA, and CMSDocs-driven blog routes.

## Quick start
1) Install deps: `npm install`
2) Run dev: `npm run dev`

## Environment variables
Create `.env` with:
```
PROJECT_ID=recsI0iT4KmGG0RZ3
CMSDOCS_WEBHOOK_SECRET=your_webhook_secret
VERCEL_DEPLOY_HOOK_URL=https://api.vercel.com/v1/integrations/deploy/...
```

## Routes
- `/` landing hero
- `/posts` listing (uses CMSDocs, with a fallback “hello-world”)
- `/posts/[slug]` prerendered from CMSDocs; fallback post included
- `/api/cmsdocs-webhook` verifies CMSDocs signature and triggers Vercel deploy hook

## Notes
- PWA manifest at `public/manifest.webmanifest` (add icons).
- Tailwind config in `tailwind.config.cjs`; global styles in `src/styles/global.css`.
- Content fetch helpers in `src/lib/cmsdocs.ts` with a safe offline fallback.
