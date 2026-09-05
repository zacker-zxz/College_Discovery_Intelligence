# 🚀 CampusLens — Vercel Deployment Guide

This document lists **every manual step, environment variable, and third-party integration** required to take CampusLens from this repository to a live production deployment on Vercel.

---

## Architecture Overview

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | React 19, RSC + client components |
| Database | PostgreSQL | Prisma ORM (v5) — **SQLite is not supported on Vercel**, hence the Postgres migration |
| Auth | JWT (HS256) via `jose` | HTTP-only, SameSite=Lax cookie sessions |
| Styling | Tailwind CSS 3 | Glassmorphism design system |
| Animation | Framer Motion | Hero spotlight, parallax, micro-interactions |

---

## Step 1 — Create the PostgreSQL Database

Vercel's serverless filesystem is read-only/ephemeral, so SQLite cannot be used. Choose one provider:

### Option A: Neon (Recommended — free tier is generous)

1. Go to <https://neon.tech> → sign up / log in.
2. Create a new project (e.g. `campuslens`), pick the region closest to your Vercel region (default `aws-us-east-1` / Washington D.C. is fine).
3. On the project dashboard, open **Connection Details**.
4. Copy the **Pooled connection string**. It looks like:
   ```
   postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require
   ```

### Option B: Vercel Postgres (Powered by Neon)

1. In your Vercel project → **Storage** tab → **Create Database** → Postgres (Neon).
2. It auto-injects `DATABASE_URL` into environment variables — you can skip Step 3's `DATABASE_URL` entry.

### Option C: Supabase / Railway / Render

Any Postgres 14+ provider works. Copy the connection string with `?sslmode=require` (or `?pgbouncer=true&connection_limit=1` for pooled Supabase).

> ⚠️ Use a **pooled** connection string (PgBouncer / Neon pooler) — serverless functions open many short-lived connections and can exhaust max_connections on a direct connection.

---

## Step 2 — Push the Repository to GitHub

```bash
git add -A
git commit -m "Production overhaul: security hardening, Postgres migration, animated hero, expanded dataset"
git push origin main
```

`.gitignore` already excludes `.env`, `node_modules`, `.next/`, `dev.db`, and `.vercel/` — verify with `git status` that **`.env` is not staged** before pushing.

---

## Step 3 — Import into Vercel

1. Go to <https://vercel.com> → **Add New → Project**.
2. Import your GitHub repository.
3. Framework preset auto-detects **Next.js**. Keep defaults:
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`
4. **Before clicking Deploy**, expand **Environment Variables** and add the variables from the table below (for the **Production**, **Preview**, and **Development** scopes as appropriate).

### Required Environment Variables

| Variable | Required | Value / How to Generate | Scope |
|---|---|---|---|
| `DATABASE_URL` | ✅ | Pooled Postgres connection string from Step 1 | Production + Preview |
| `AUTH_SECRET` | ✅ | Random 32+ char string. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` | Production + Preview. **Use a different value per environment.** |
| `NEXT_PUBLIC_APP_URL` | ✅ | `https://your-app.vercel.app` (or custom domain) | Production |
| `ENABLE_DEMO_ACCOUNTS` | Optional | `"true"` only on preview/demo deployments. Controls the 1-click demo login buttons; leave unset in production. | Preview only |

5. Click **Deploy**. The build runs `prisma generate && next build` automatically.

---

## Step 4 — Initialize the Database Schema, Seed & AISHE Import

The Vercel build does **not** push schema or seed data (keeping destructive operations out of CI). Run once from your local machine against the production database:

```powershell
# Point local CLI at production DB (temporary override)
$env:DATABASE_URL="postgresql://...your-neon-pooled-url..."

npx prisma db push          # Creates all tables from prisma/schema.prisma
npm run db:seed             # Imports 40 curated colleges, 72 cutoffs, demo users, reviews, discussions
npm run data:aishe          # Imports 52,000+ colleges from the two AISHE Excel sheets
```

> ⚠️ The AISHE import requires the two Excel files in `scripts/data/`:
> - `College-Affiliated College.xlsx`
> - `College-Constituent _ University College.xlsx`
>
> These are gitignored (34MB+). Download them from AISHE (https://aishe.gov.in/) or copy them from your machine into `scripts/data/` before running the import.

macOS/Linux:

```bash
export DATABASE_URL="postgresql://...your-neon-pooled-url..."
npx prisma db push
npm run db:seed
npm run data:aishe
```

> 💡 All import scripts are **idempotent** — colleges/cutoffs are upserted and deduplicated, so re-running is safe.

> ⚠️ After seeding, clear the temporary `DATABASE_URL` from your shell (`Remove-Item Env:DATABASE_URL` on PowerShell) so local dev uses your `.env` value.

---

## Step 5 — (Optional) Custom Domain

1. Vercel Project → **Settings → Domains** → add your domain.
2. Follow the DNS instructions (A record `76.76.21.21` or CNAME `cname.vercel-dns.com`).
3. SSL certificates are provisioned automatically.
4. Update `NEXT_PUBLIC_APP_URL` to the final domain.

---

## Step 6 — Verify the Deployment

Checklist after first deploy:

- [ ] Home page renders with the clean white hero (typewriter search hint, college marquee)
- [ ] `/api/colleges?limit=5` returns JSON with 5 colleges
- [ ] Search autocomplete handles typos (try "iit bombey") via `https://your-app.vercel.app/api/colleges/suggest?q=iit%20bombey`
- [ ] `/colleges` directory lists institutions and filters work (including AISHE type filters)
- [ ] Sign up → sign in → save a college → it appears under `/saved`
- [ ] Predictor returns Strong/Possible/Reach matches
- [ ] Response headers include `Strict-Transport-Security`, `X-Frame-Options: DENY`, and the CSP (verify in browser dev tools → Network → any document request → Headers)
- [ ] `https://your-app.vercel.app/api/auth/demo-login` returns `{"enabled":false}` unless demo mode is on

---

## Continuous Deployment

- Every push to `main` triggers a production deployment.
- Every pull request triggers a preview deployment with its own URL.
- **GitHub Actions CI** (`.github/workflows/ci.yml`) runs on every push/PR: installs dependencies, pushes the Prisma schema to an ephemeral Postgres service container, runs the Vitest suite, lints, and builds. The PR shows a green/red check.

---

## Manual Configuration Checklist (Summary)

| # | Task | Where |
|---|---|---|
| 1 | Create Neon Postgres project, copy pooled connection string | https://neon.tech |
| 2 | Generate `AUTH_SECRET` (32+ random chars) | Local terminal |
| 3 | Push repo to GitHub (Excel files are gitignored — not included) | `git push` |
| 4 | Import repo to Vercel + set env vars | Vercel dashboard |
| 5 | `prisma db push` + `db:seed` + `data:aishe` against the Neon DB | Local terminal |
| 6 | Add custom domain (optional) | Vercel settings |
| 7 | Update `NEXT_PUBLIC_APP_URL` (optional, if custom domain) | Vercel env vars |

---

## Security Notes for Production

- **`AUTH_SECRET` is mandatory.** The app throws at runtime if it's missing or shorter than 32 chars — by design, so a misconfigured deployment fails loudly instead of signing tokens with a guessable key.
- **Rate limiting** on login/register/demo-login is in-memory per serverless instance (best-effort). For strict global limits, add Upstash Redis (`@upstash/ratelimit`) and swap the implementation in `src/lib/rate-limit.ts`.
- **Demo accounts** (`student@campuslens.edu` / `admin@campuslens.edu` with password `Password123!`) are seeded for evaluation. Keep `ENABLE_DEMO_ACCOUNTS` unset in production and consider changing the seeded passwords before any public launch.
- Security headers (CSP, HSTS, X-Frame-Options, etc.) are applied globally via `next.config.ts`.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails at `prisma generate` | Ensure `DATABASE_URL` env var is set in Vercel (Prisma validates the datasource block) |
| Runtime "AUTH_SECRET environment variable must be set" | Add the env var and **redeploy** (env changes require a new deployment) |
| "Too many connections" DB errors | Switch to a pooled connection string (Neon `-pooler` host or PgBouncer) |
| Empty college list after deploy | You skipped Step 4 — run `prisma db push` + `db:seed` against the production DB |
| Preview deploys can't log in | Preview uses a different `AUTH_SECRET` (expected) — set it in the Preview scope too |
