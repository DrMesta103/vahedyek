import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

export async function getTerminationBuyerRulesRow(draftId: string): Promise<unknown | null> {
  const rows = await prisma.$queryRaw<Array<{ buyerRules: unknown }>>(
    Prisma.sql`SELECT "buyerRules" FROM "TerminationRules" WHERE "draftId" = ${draftId} LIMIT 1`,
  );
  return rows[0]?.buyerRules ?? null;
}

export async function upsertTerminationBuyerRulesRow(draftId: string, buyerRules: Prisma.InputJsonValue) {
  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "TerminationRules" ("id", "draftId", "buyerRules", "createdAt", "updatedAt")
      VALUES (${crypto.randomUUID()}, ${draftId}, ${buyerRules}, NOW(), NOW())
      ON CONFLICT ("draftId")
      DO UPDATE SET "buyerRules" = EXCLUDED."buyerRules", "updatedAt" = NOW()
    `,
  );
}

