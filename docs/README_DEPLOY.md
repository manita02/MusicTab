# MusicTab — Deployment

Free-tier target: **Neon** (Postgres) + **Render** (API) + **Cloudflare Pages** or **Vercel** (frontend). **Pua** uses **Google Gemini** (`GEMINI_API_KEY`); **Sign In** uses **Cloudflare Turnstile**.

Do **not** commit `.env` files. Set secrets in each host dashboard.

Local setup (clone, Docker, tests) lives in the [main README](../README.md).

## 1. Neon

1. Create a Free project at [neon.tech](https://neon.tech).
2. Copy both connection strings:
   * **Pooled** → `DATABASE_URL`
   * **Direct** (no `-pooler`) → `DIRECT_URL`
3. Add `?sslmode=require` if the dashboard strings do not already include it.

## 2. Backend on Render

`render.yaml` at the repo root defines `musictab-api` (**Node 20**, health check `GET /`). You can **New → Blueprint** from this repo, or create a **Web Service** manually:

| Field | Value |
|--------|--------|
| Runtime | Node |
| Plan | Free |
| Build | `npm --prefix domain install && npm --prefix apps/backend install --include=dev && npm --prefix apps/backend run build` |
| Start | `npm --prefix apps/backend run start:prod` |
| Health check | `GET /` |

Environment variables:

| Key | Notes |
|--------|--------|
| `DATABASE_URL` | Neon **pooled** URL |
| `DIRECT_URL` | Neon **direct** URL (migrations) |
| `JWT_SECRET` | Long random string (required in production). Blueprint can auto-generate it. |
| `CORS_ORIGIN` | Frontend origin(s), comma-separated, e.g. `https://your-app.pages.dev` |
| `GEMINI_API_KEY` | Google AI Studio key (required for **Pua**) |
| `COPILOT_MODEL` | Optional. Default in `render.yaml`: `gemini-3.6-flash` |
| `SEED_ON_BOOT` | `true` on first deploy (idempotent admin + catalogs; removes tabs owned by the seed admin), then set `false` |
| `TURNSTILE_SECRET_KEY` | Production secret (not the `1x000000...` test key) |
| `TURNSTILE_VERIFY_URL` | Optional. Default: `https://challenges.cloudflare.com/turnstile/v0/siteverify` |

After the first successful boot, change the seeded admin password (`admin@gmail.com` / `admin`).

`start:prod` runs `prisma migrate deploy`, then seed if `SEED_ON_BOOT=true`, then `dist/main.js`.

## 3. Frontend on Cloudflare Pages (or Vercel)

Build from the **repository root** so Yarn workspaces resolve:

| Field | Cloudflare Pages | Vercel |
|--------|--------|--------|
| Build command | `corepack enable && yarn install && yarn workspace frontend build` | same, or Root Directory `apps/frontend` + `yarn build` |
| Output | `apps/frontend/dist` | `apps/frontend/dist` (see `apps/frontend/vercel.json` for SPA rewrites) |

Build-time variables (Vite inlines them):

| Key | Value |
|--------|--------|
| `VITE_API_URL` | Render API URL, e.g. `https://musictab-api.onrender.com` |
| `VITE_TURNSTILE_SITE_KEY` | Production Turnstile site key |

SPA fallback: `apps/frontend/public/_redirects` (Cloudflare) and `apps/frontend/vercel.json` (Vercel).

Register the production frontend hostname in Cloudflare Turnstile.

## 4. Order

1. Neon project
2. Render API (set `CORS_ORIGIN` after you know the frontend URL; you can redeploy)
3. Pages / Vercel with `VITE_API_URL` pointing at Render
4. Turnstile hostnames + real keys
5. Confirm `GEMINI_API_KEY` so Pua can call Gemini

The first request after idle time on Render Free may take ~1 minute (cold start). Neon data is **not** deleted after 30 days.
