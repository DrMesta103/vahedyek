import { Prisma } from '@/lib/prisma-client';
import { prisma } from './prisma';

function toJsonbParam(value: Prisma.InputJsonValue) {
  return JSON.stringify(value ?? {});
}

async function ensureContractDraftRuleSettingsTable() {
  await prisma.$executeRaw(
    Prisma.sql`
      CREATE TABLE IF NOT EXISTS "ContractDraftRuleSettings" (
        "id" TEXT NOT NULL,
        "draftId" TEXT NOT NULL,
        "ruleId" TEXT NOT NULL,
        "payload" JSONB NOT NULL DEFAULT '{}',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ContractDraftRuleSettings_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "ContractDraftRuleSettings_draftId_fkey"
          FOREIGN KEY ("draftId") REFERENCES "ContractDraft"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `,
  );

  await prisma.$executeRaw(
    Prisma.sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "ContractDraftRuleSettings_draftId_ruleId_key"
      ON "ContractDraftRuleSettings"("draftId", "ruleId")
    `,
  );

  await prisma.$executeRaw(
    Prisma.sql`
      CREATE INDEX IF NOT EXISTS "ContractDraftRuleSettings_draftId_idx"
      ON "ContractDraftRuleSettings"("draftId")
    `,
  );
}

export async function getContractDraftRuleSettingsRow(draftId: string, ruleId: string): Promise<unknown | null> {
  await ensureContractDraftRuleSettingsTable();

  const rows = await prisma.$queryRaw<Array<{ payload: unknown }>>(
    Prisma.sql`
      SELECT "payload"
      FROM "ContractDraftRuleSettings"
      WHERE "draftId" = ${draftId} AND "ruleId" = ${ruleId}
      LIMIT 1
    `,
  );

  return rows[0]?.payload ?? null;
}

export async function upsertContractDraftRuleSettingsRow(
  draftId: string,
  ruleId: string,
  payload: Prisma.InputJsonValue,
) {
  await ensureContractDraftRuleSettingsTable();

  const jsonb = toJsonbParam(payload);

  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "ContractDraftRuleSettings" ("id", "draftId", "ruleId", "payload", "createdAt", "updatedAt")
      VALUES (${crypto.randomUUID()}, ${draftId}, ${ruleId}, ${jsonb}::jsonb, NOW(), NOW())
      ON CONFLICT ("draftId", "ruleId")
      DO UPDATE SET "payload" = EXCLUDED."payload", "updatedAt" = NOW()
    `,
  );
}
