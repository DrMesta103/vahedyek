import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';
import { createDefaultProfileStore, normalizeProfileStore, type ProfileMeta } from '../../../(panel)/account/profile.types';

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

async function getProfileMeta(
  tenantId: string,
  fallbackUser: { fullName: string; mobile: string | null; email: string | null },
  store: ReturnType<typeof createDefaultProfileStore>,
): Promise<ProfileMeta> {
  const [ownerMembership, tenant] = await Promise.all([
    prisma.userTenantMembership.findFirst({
      where: { tenantId, role: 'owner' },
      include: {
        user: {
          select: {
            fullName: true,
            mobile: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        slug: true,
        brandCode: true,
        packageKey: true,
        billingCycle: true,
        createdAt: true,
        name: true,
      },
    }),
  ]);

  const businessName =
    tenant?.name?.trim() ||
    store.ownership.companyName.trim() ||
    store.ownership.brandName.trim() ||
    'دسترنج';

  return {
    tenantId,
    businessName,
    slug: tenant?.slug ?? '',
    brandCode: tenant?.brandCode ?? 'DS',
    packageKey: tenant?.packageKey ?? 'starter',
    billingCycle: tenant?.billingCycle ?? 'monthly',
    createdAt: tenant?.createdAt?.toISOString() ?? null,
    owner: {
      fullName: ownerMembership?.user.fullName ?? fallbackUser.fullName,
      mobile: ownerMembership?.user.mobile ?? fallbackUser.mobile,
      email: ownerMembership?.user.email ?? fallbackUser.email,
    },
  };
}

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    await ensureProfileSettingsTable();

    const rows = (await prisma.$queryRawUnsafe(
      `SELECT "profilePayload" FROM ${TABLE_NAME} WHERE "tenantId" = $1 LIMIT 1`,
      session.tenantId,
    )) as Array<{ profilePayload: unknown }>;

    const store = normalizeProfileStore(rows[0]?.profilePayload ?? {});
    const meta = await getProfileMeta(
      session.tenantId,
      { fullName: session.user.fullName, mobile: session.user.mobile, email: session.user.email },
      store,
    );

    return NextResponse.json({ store, meta });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const body = (await request.json()) as { store?: unknown };
    const store = normalizeProfileStore(body.store ?? createDefaultProfileStore());

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

    const meta = await getProfileMeta(
      session.tenantId,
      { fullName: session.user.fullName, mobile: session.user.mobile, email: session.user.email },
      store,
    );

    return NextResponse.json({ success: true, store, meta });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
