# AGENTS.md

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 + Prisma/SQLite. Spanish-language esoteric-services app ("Retornos y Amarres"): public landing page (`src/app/page.tsx`, `src/components/landing/`) + admin panel (`src/app/admin/`). All field names, enum values, UI text, and error messages are Spanish — keep it that way. `worklog.md` documents the task history.

## Commands

- `npm run dev` / `npm run start` — dev/prod server on port 3000
- `npm run lint` — ESLint (`eslint .`); config disables most rules
- `npm run build` — **does not typecheck** (see below)
- `npm run db:push` / `db:generate` / `db:migrate` / `db:reset` / `seed` — Prisma + seed (`tsx prisma/seed.ts`); `db:push` runs with `--accept-data-loss`
- No test framework. `tests/*.sh` are Linux bash harnesses for the `.zscripts/` deploy scripts — not app tests and not runnable on this Windows machine.

## Typechecking (critical)

`next.config.ts` sets `typescript.ignoreBuildErrors: true` and `reactStrictMode: false`. `npm run build` exits 0 even with type errors, so the only type gate is `npx tsc --noEmit` — run it after edits.

## Package manager: npm locally, bun for deploy

- No `bun` on this machine; use npm (`package-lock.json`). `bun.lock` exists only for the deploy pipeline.
- `.zscripts/*.sh` are Linux deployment scripts (Function Compute: Caddy on :81 reverse-proxying the standalone Next server, packaged SQLite db at `db/custom.db`). They are bun-only, hardcode the sandbox path `/home/z/my-project`, and must not be edited/run for local work. `next.config.ts` must keep `output: "standalone"` (build.sh auto-injects it if missing).

## Env / database

- `.env` (gitignored, currently absent) needs `DATABASE_URL` (SQLite) and `JWT_SECRET` or the app won't boot. Prisma/SQLite resolves relative `file:` URLs against `prisma/`, so point local dev at the repo-root DB with `file:../db/custom.db` (the `db/` dir must exist). Do not use the Linux sandbox path `file:/home/z/my-project/db/custom.db` locally — it resolves to `C:\home\z\...` on Windows.
- Schema: `prisma/schema.prisma` (SQLite) — models `AdminUser`, `Service`, `Inquiry`, `Testimonial`, `ContactMessage`. After schema edits run `db:push` + `db:generate`.
- Seed logins: `admin@retornosyamarres.com` / `Admin1234` (SUPERADMIN), `operador@retornosyamarres.com` / `Operador123`.
- **`npm run seed` is not idempotent**: only the admins use `upsert`; services, testimonials, inquiries, and contact messages are created unconditionally, so re-running it duplicates sample data (use `db:reset` first if needed).

## Auth & API conventions

- Custom JWT auth via `jose` (cookie `admin_session` for SSR, `Authorization: Bearer` for API). **Not** NextAuth, despite `next-auth` being in package.json. Helpers in `src/lib/auth.ts`: `requireAdmin`, `requireSuperAdmin`, `getAuthAdminFromRequest`, `apiResponse`, `apiError`.
- Every API route returns `{success: true, data}` or `{success: false, error}`.
- `src/middleware.ts` guards only `/admin/*` **pages** (except `/admin/login`) with a 307 redirect to login + `callbackUrl`. API routes live at `/api/*` — outside the middleware matcher — so each protected route enforces auth itself via `getAuthAdminFromRequest`; don't assume middleware protects `/api/*`.
- Public (no auth) endpoints: `POST /api/auth/login`, `POST /api/inquiries`, `POST /api/contact`, and `GET /api/services` + `GET /api/testimonials` (they return active/approved records; pass `?all=true` for the admin-only full view). All other routes require an admin.
- Public POSTs (inquiries, contact, login) are IP rate-limited via `src/lib/rate-limit.ts` (in-memory, resets on redeploy); inputs pass through `sanitizeInput`.
- Shared Zod v4 schemas in `src/lib/validations.ts` (import from `zod/v4`), used by both client forms and API routes.
- No Server Actions anywhere: the landing page and every admin CRUD page are `'use client'` components that fetch/mutate through the `/api/*` route handlers (react-query or plain `fetch`). Follow that pattern — don't introduce Server Actions.

## Styling

- Tailwind v4 is CSS-first: the active theme lives in `src/app/globals.css` (`@theme inline`; CSS vars, gold `#d4a853` / mystic violet `#2d1b4e` palette; `#7c3aed` appears only as a dashboard chart color). The legacy `tailwind.config.ts` content globs target nonexistent dirs (`./app/**`, `./components/**`) — edit `globals.css`, not that file.
- shadcn/ui (new-york style); `components.json` maps `@/*` → `src/*`; primitives in `src/components/ui/`. Add components with `npx shadcn@latest add`.
