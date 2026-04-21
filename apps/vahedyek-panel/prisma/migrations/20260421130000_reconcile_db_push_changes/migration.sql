-- Reconcile changes that already exist in the target database but were not
-- represented in migration history. This keeps migrate history aligned without
-- requiring a schema reset.

-- The current Prisma schema no longer contains the legacy Sale model.
DROP TABLE IF EXISTS "Sale";
DROP TYPE IF EXISTS "SaleStatus";

-- Session can exist before tenant selection, so tenantId is nullable.
ALTER TABLE "Session" ALTER COLUMN "tenantId" DROP NOT NULL;

-- Financial due items now carry a display title.
ALTER TABLE "FinancialDueItem" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL DEFAULT '';
