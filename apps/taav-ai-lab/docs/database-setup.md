# taav-ai-lab — PostgreSQL Setup

PostgreSQL is the **runtime source of truth** for `apps/taav-ai-lab`. The legacy JSON file at `.simulator/taav-ai-lab.json` is a dev backup / one-time import source only.

AI/OCR behavior is still **simulated in Next.js** — no Python, gRPC, SignalR, RabbitMQ, vector DB, or real LLM integration yet.

## Required environment variables

Create `apps/taav-ai-lab/.env` (never commit this file):

```env
DATABASE_URL="postgresql://postgres:123%40qwe123@localhost:5432/taaviAiLab?schema=public"
AUTH_JWT_SECRET="your-long-random-secret"
```

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Dedicated PostgreSQL database for taav-ai-lab |
| `AUTH_JWT_SECRET` | JWT signing secret for session cookies |

The app reads `DATABASE_URL` from `apps/taav-ai-lab/.env` first (`app/config/database.ts`). Prisma CLI loads the same file via `prisma.config.ts` (with override) so monorepo/shell `DATABASE_URL` values do not accidentally override the app database.

## Local PostgreSQL database

Database name: **`taaviAiLab`**

If using the shared Docker Postgres container (`dastranj-postgres` on port 5432):

```bash
docker exec dastranj-postgres psql -U postgres -c 'CREATE DATABASE "taaviAiLab";'
```

Skip if the database already exists.

## Commands (from monorepo root)

```bash
# Generate Prisma client
npm run prisma:generate:ai-lab

# Apply migrations (development)
npm run prisma:migrate:ai-lab

# Apply migrations (CI/production)
npm run prisma:deploy:ai-lab

# Seed global settings + credentials
npm run db:seed:ai-lab

# Optional: import legacy simulator JSON into PostgreSQL
npm run db:import-simulator --workspace @apps/taav-ai-lab

# Start dev server (port 3070)
npm run dev:ai-lab

# Typecheck
cd apps/taav-ai-lab && npx tsc --noEmit

# Verify DB-backed API flows (server must be running)
cd apps/taav-ai-lab && npx tsx scripts/verify-db-persistence.ts
```

## Seed credentials

After `npm run db:seed:ai-lab`:

| Use case | Identifier | Password |
|----------|------------|----------|
| **App login** (register/login pages) | `admin@local.dev` | `123456` |
| **Settings admin gate** (`/settings/*` write actions) | `admin` | `123456` |

App login requires an email or Iranian mobile number. The seeded app user uses email `admin@local.dev`.

## Schema overview

| Model | Purpose |
|-------|---------|
| `AppUser` | Registered users |
| `Tenant` | Businesses / workspaces |
| `UserTenantMembership` | User ↔ tenant access (owner role) |
| `TenantProduct` | Enabled products (`ocr`, `taavia`) |
| `OcrJob` | Simulated OCR jobs (persisted) |
| `TaaviaBrand` | Taavia brands per tenant |
| `TaaviaConversation` | Admin agent conversation per brand |
| `TaaviaMessage` | Chat messages |
| `PlatformUsdRate` | Global USD → Toman rate |
| `AiPricingModel` | Token pricing models |
| `AiProviderApiKey` | Provider API keys (masked in UI) |
| `PlatformAdminCredential` | Settings admin gate |

## Runtime data access

- Use `app/lib/data.ts` (repository facade) — **not** `simulator-store.ts`
- `simulator-store.ts` is deprecated; only `scripts/import-simulator-json.ts` may reference legacy JSON

## Troubleshooting

**Prisma `EPERM` on `query_engine-windows.dll.node`**

Stop the dev server (`npm run dev:ai-lab`) before `prisma generate` or production build — the running Node process locks the query engine binary on Windows.

**Wrong database / auth errors from Prisma CLI**

Ensure `apps/taav-ai-lab/.env` exists and `prisma.config.ts` loads it. A shell-level `DATABASE_URL` pointing at another app will otherwise be used.

**Lint script**

`npm run lint` in this app may fail with Next.js 16 CLI directory parsing; use `npx tsc --noEmit` for type verification.

## Next phase

With PostgreSQL verified, the app is ready for **Admin Agent flow** implementation (still simulated AI, persisted messages in `TaaviaMessage`).
