import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

function toJsonbParam(value: Prisma.InputJsonValue) {
  // Ensure Postgres treats it as JSONB, not an array parameter.
  return JSON.stringify(value ?? null);
}

export async function getExtraCostsRow(draftId: string): Promise<unknown | null> {
  const rows = await prisma.$queryRaw<Array<{ payload: unknown }>>(
    Prisma.sql`SELECT "payload" FROM "ContractExtraCosts" WHERE "draftId" = ${draftId} LIMIT 1`,
  );
  return rows[0]?.payload ?? null;
}

export async function upsertExtraCostsRow(draftId: string, payload: Prisma.InputJsonValue) {
  const jsonb = toJsonbParam(payload);
  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "ContractExtraCosts" ("id", "draftId", "payload", "createdAt", "updatedAt")
      VALUES (${crypto.randomUUID()}, ${draftId}, ${jsonb}::jsonb, NOW(), NOW())
      ON CONFLICT ("draftId")
      DO UPDATE SET "payload" = EXCLUDED."payload", "updatedAt" = NOW()
    `,
  );
}

export async function getTechnicalSpecsRow(draftId: string): Promise<unknown | null> {
  const rows = await prisma.$queryRaw<Array<{ specs: unknown }>>(
    Prisma.sql`SELECT "specs" FROM "ContractTechnicalSpecs" WHERE "draftId" = ${draftId} LIMIT 1`,
  );
  return rows[0]?.specs ?? null;
}

export async function upsertTechnicalSpecsRow(draftId: string, specs: Prisma.InputJsonValue) {
  const jsonb = toJsonbParam(specs);
  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "ContractTechnicalSpecs" ("id", "draftId", "specs", "createdAt", "updatedAt")
      VALUES (${crypto.randomUUID()}, ${draftId}, ${jsonb}::jsonb, NOW(), NOW())
      ON CONFLICT ("draftId")
      DO UPDATE SET "specs" = EXCLUDED."specs", "updatedAt" = NOW()
    `,
  );
}

export async function getAttachmentsRow(draftId: string): Promise<{ documents: unknown; notes: string | null } | null> {
  const rows = await prisma.$queryRaw<Array<{ documents: unknown; notes: string | null }>>(
    Prisma.sql`SELECT "documents", "notes" FROM "ContractAttachments" WHERE "draftId" = ${draftId} LIMIT 1`,
  );
  return rows[0] ? { documents: rows[0].documents, notes: rows[0].notes } : null;
}

export async function upsertAttachmentsRow(draftId: string, documents: Prisma.InputJsonValue, notes: string | null) {
  const jsonb = toJsonbParam(documents);
  await prisma.$executeRaw(
    Prisma.sql`
      INSERT INTO "ContractAttachments" ("id", "draftId", "documents", "notes", "createdAt", "updatedAt")
      VALUES (${crypto.randomUUID()}, ${draftId}, ${jsonb}::jsonb, ${notes}, NOW(), NOW())
      ON CONFLICT ("draftId")
      DO UPDATE SET "documents" = EXCLUDED."documents", "notes" = EXCLUDED."notes", "updatedAt" = NOW()
    `,
  );
}

