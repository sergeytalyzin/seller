# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Analytics web app for an Ozon (Russian marketplace) seller: syncs products and finance operations from the Ozon Seller API and computes **net profit per SKU** (revenue minus commissions, logistics, returns, cost of goods, taxes, manual expenses). Full product spec is in `SPEC.md` (Russian); `api.md` is a distilled reference of the relevant Ozon Seller API endpoints (source: `swagger.json`). All UI text and user-facing error messages are in Russian.

## Commands

```bash
npm run dev          # dev server at localhost:3000
npm run build        # production build (also the de-facto type check)
npm run lint         # eslint
npm run db:generate  # prisma generate (after schema changes)
npm run db:migrate   # prisma migrate dev (uses DIRECT_URL)
npm run db:studio    # prisma studio

# Save Ozon API keys for the first store and run a full 90-day sync:
npx tsx scripts/dev-sync.ts <clientId> <apiKey>
```

There is no test framework configured.

## Stack notes

- **Next.js 16** App Router — this version has breaking changes vs. training data; check `node_modules/next/dist/docs/` before using unfamiliar APIs. Notably, the request interceptor is `src/proxy.ts` (exported `proxy` function), not `middleware.ts`.
- Prisma 6 + Supabase Postgres. `DATABASE_URL` is the transaction pooler (port 6543) for the app; `DIRECT_URL` (port 5432) is only for migrations. `src/lib/db.ts` exports the `db` PrismaClient singleton (hot-reload safe).
- Tailwind CSS 4 (PostCSS plugin, no tailwind.config), TanStack Query 5, Zod 4.

## Architecture

Request flow: **client hook → API route → service → DataStore / Ozon client → Prisma**.

- **Auth**: Supabase handles sessions. `src/proxy.ts` refreshes the session on every request, returns 401 for unauthenticated `/api/*` calls, and redirects unauthenticated users off protected pages (list in `PROTECTED_PAGES`). If Supabase env vars are absent, the proxy passes everything through (dev mode without auth). Every API route starts by calling `getUserStore()` (`src/server/auth.ts`), which upserts a Prisma `User` by the Supabase session email and auto-creates a default `Store` — all data is scoped by `store.id`.
- **API routes** (`src/app/api/`): validate query/body with Zod schemas from `src/schemas/`, call a service, return `{ error: "…" }` JSON with proper status on failure (Russian message for the user, technical details only to `console.error`).
- **Services** (`src/server/services/`): `sync-service` pulls from Ozon and upserts `Product` (unique per `[storeId, offerId]`) and `FinanceOperation` (unique per `[storeId, ozonOperationId]`); `analytics-service` / `dashboard-service` assemble per-product and dashboard analytics.
- **DataStore** (`src/server/data/`): the single data-access interface for store-scoped reads/writes; the Prisma implementation lives in `src/server/data/db/`. Services and analytics go through it rather than raw Prisma (sync-service is the exception — it writes via `db` directly).
- **Ozon client** (`src/server/ozon/`): every Seller API method is a POST through `ozonRequest()` with `Client-Id`/`Api-Key` headers. Keys are stored per-store in the `OzonSettings` table (entered via settings UI or `dev-sync.ts`) and must never reach the browser — all Ozon modules are server-only.
- **Analytics math** (`src/lib/analytics/`): pure functions (profit, margin, ROI) operating on aggregated finance operations + `ProductCost`; no I/O.
- **Client data layer**: pages under `src/app/(app)/` render view components from `src/components/`, which use TanStack Query hooks from `src/hooks/`. Hooks fetch through `fetchJson()` (`src/lib/api.ts`, throws `ApiError` with the server's Russian message) and use centralized query keys from `src/lib/query-keys.ts`. Period presets/resolution live in `src/lib/period.ts`.

`server-only` imports enforce the server/client boundary — keep it that way for anything touching Prisma, Supabase server client, or Ozon credentials.
# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
## API source of truth

Не выдумывай API-запросы, параметры, body, headers, response и типы данных.

Для всех задач по API используй только эти источники:

1. `api.md`
2. `swagger.json`
3. `new-swagger.json`

Правила:

- Сначала проверяй `api.md`.
- Затем проверяй `swagger.json`.
- Если нужный endpoint отсутствует в `swagger.json`, обязательно проверь `new-swagger.json`.
- `new-swagger.json` содержит актуальные методы Ozon API и может включать методы, которые были изменены, помечены как deprecated или отсутствуют в `swagger.json`.
- Если endpoint присутствует в `new-swagger.json`, его можно использовать, даже если он отсутствует или deprecated в `swagger.json`.
- Если endpoint отсутствует и в `swagger.json`, и в `new-swagger.json` — не используй его.
- Если поле, параметр, request или response не описаны ни в одном из доступных источников — не придумывай, а пиши `Нужно уточнить`.
- Если `api.md` противоречит Swagger-спецификациям — приоритет у `swagger.json` и `new-swagger.json`.
- Если `swagger.json` и `new-swagger.json` противоречат друг другу — приоритет у `new-swagger.json`, так как он содержит более актуальную спецификацию.
- При наличии deprecated-метода обязательно проверь `new-swagger.json` на наличие актуальной замены.
