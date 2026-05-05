import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

async function ensureTerminationRulesTable() {
  await prisma.$executeRaw(
    Prisma.sql`
      CREATE TABLE IF NOT EXISTS "TerminationRules" (
        "id" TEXT NOT NULL,
        "draftId" TEXT NOT NULL,
        "buyerRules" JSONB NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "TerminationRules_pkey" PRIMARY KEY ("id")
      )
    `,
  );

  await prisma.$executeRaw(
    Prisma.sql`CREATE UNIQUE INDEX IF NOT EXISTS "TerminationRules_draftId_key" ON "TerminationRules"("draftId")`,
  );
  await prisma.$executeRaw(
    Prisma.sql`CREATE INDEX IF NOT EXISTS "TerminationRules_draftId_idx" ON "TerminationRules"("draftId")`,
  );

  // Postgres doesn't support IF NOT EXISTS on ADD CONSTRAINT, so wrap.
  await prisma.$executeRaw(
    Prisma.sql`
      DO $$
      BEGIN
        ALTER TABLE "TerminationRules"
          ADD CONSTRAINT "TerminationRules_draftId_fkey"
          FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `,
  );
}

export async function getTerminationBuyerRulesRow(draftId: string): Promise<unknown | null> {
  await ensureTerminationRulesTable();
  const rows = await prisma.$queryRaw<Array<{ buyerRules: unknown }>>(
    Prisma.sql`SELECT "buyerRules" FROM "TerminationRules" WHERE "draftId" = ${draftId} LIMIT 1`,
  );
  return rows[0]?.buyerRules ?? null;
}

export async function upsertTerminationBuyerRulesRow(draftId: string, buyerRules: Prisma.InputJsonValue) {
  await ensureTerminationRulesTable();
  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "TerminationRules" ("id", "draftId", "buyerRules", "createdAt", "updatedAt")
      VALUES (${crypto.randomUUID()}, ${draftId}, ${buyerRules}, NOW(), NOW())
      ON CONFLICT ("draftId")
      DO UPDATE SET "buyerRules" = EXCLUDED."buyerRules", "updatedAt" = NOW()
    `,
  );
}

