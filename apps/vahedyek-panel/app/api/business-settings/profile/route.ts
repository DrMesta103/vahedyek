import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

const TABLE_NAME = '"TenantBusinessProfileSettings"';
const INDEX_NAME = '"TenantBusinessProfileSettings_tenantId_idx"';

async function ensureProfileSettingsTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
      "id" TEXT PRIMARY KEY,
      "tenantId" TEXT NOT NULL UNIQUE,
      "profilePayload" JSONB NOT NULL DEFAULT '{}'::jsonb,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TenantBusinessProfileSettings_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE CASCADE
        ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS ${INDEX_NAME}
    ON ${TABLE_NAME} ("tenantId");
  `);
}

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    await ensureProfileSettingsTable();

    const rows = await prisma.$queryRawUnsafe<Array<{ profilePayload: unknown }>>(
      `SELECT "profilePayload" FROM ${TABLE_NAME} WHERE "tenantId" = $1 LIMIT 1`,
      session.tenantId,
    );

    return NextResponse.json({ store: rows[0]?.profilePayload ?? null });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const body = (await request.json()) as { store?: unknown };
    const store = body.store && typeof body.store === 'object' ? body.store : {};

    await ensureProfileSettingsTable();

    await prisma.$executeRawUnsafe(
      `
        INSERT INTO ${TABLE_NAME} ("id", "tenantId", "profilePayload")
        VALUES ($1, $2, $3::jsonb)
        ON CONFLICT ("tenantId")
        DO UPDATE SET
          "profilePayload" = EXCLUDED."profilePayload",
          "updatedAt" = CURRENT_TIMESTAMP
      `,
      crypto.randomUUID(),
      session.tenantId,
      JSON.stringify(store),
    );

    return NextResponse.json({ success: true, store });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
