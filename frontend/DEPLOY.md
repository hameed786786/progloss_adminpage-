# Deploying Progloss Super Admin

## Vercel (recommended)

A `vercel.json` is included.

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Framework Preset: **Other**. Build is already pinned in `vercel.json`:
   - Install: `bun install`
   - Build: `bun run build`
   - Output: `.output/public`
4. Deploy. SPA fallback is configured via `rewrites`, so deep links and
   page refreshes (e.g. `/billing/invoices/INV-2026-04812`) work.

> If you prefer Node/SSR on Vercel instead of static + client routing,
> swap the TanStack Start preset from `cloudflare` to `vercel` in
> `vite.config.ts` and remove `wrangler.jsonc`. The current setup ships
> the app as a fast static admin with client-side React Router-style
> navigation handled by TanStack Router.

## Cloudflare Workers

`wrangler.jsonc` is wired. `bun run deploy` (or `wrangler deploy`) ships
the SSR worker.
