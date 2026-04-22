import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireSessionContext } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../lib/prismaApiError';

const USAGE_KEYS = ['residential', 'commercial', 'office', 'parking', 'storage', 'amenity'] as const;
const DEFAULT_USAGE_COUNTS = {
  residential: 0,
  commercial: 0,
  office: 0,
  parking: 0,
  storage: 0,
  amenity: 0,
};

type UsageKey = (typeof USAGE_KEYS)[number];

type BlockPayload = {
  name?: string;
  mainPlate?: string;
  subPlate?: string;
  status?: string;
  usageCounts?: Partial<Record<UsageKey, number | string>>;
};

type DbBlock = {
  id: string;
  name: string;
  mainPlate: string | null;
  subPlate: string | null;
  status: string;
  usageCounts: unknown;
};

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
}

function toInteger(value: string | number | undefined) {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : NaN;
  if (typeof value !== 'string') return NaN;
  return Number.parseInt(normalizeDigits(value.trim()), 10);
}

function normalizeUsageCounts(input: BlockPayload['usageCounts']) {
  return USAGE_KEYS.reduce<Record<UsageKey, number>>((acc, key) => {
    const raw = input?.[key];
    const value = typeof raw === 'number' ? raw : typeof raw === 'string' ? toInteger(raw) : 0;
    acc[key] = Number.isFinite(value) && value > 0 ? value : 0;
    return acc;
  }, { ...DEFAULT_USAGE_COUNTS });
}

function normalizeStatus(status: string | undefined) {
  return ['incomplete', 'complete', 'in_progress'].includes(status ?? '') ? status! : 'incomplete';
}

function mapBlock(block: DbBlock) {
  return {
    id: block.id,
    name: block.name,
    mainPlate: block.mainPlate ?? '',
    subPlate: block.subPlate ?? '',
    status: block.status,
    usageCounts: {
      ...DEFAULT_USAGE_COUNTS,
      ...(typeof block.usageCounts === 'object' && block.usageCounts ? block.usageCounts : {}),
    },
  };
}

async function getBlock(tenantId: string, blockId: string) {
  const rows = await prisma.$queryRaw<DbBlock[]>(Prisma.sql`
    SELECT "id", "name", "mainPlate", "subPlate", "status", "usageCounts"
    FROM "Block"
    WHERE "tenantId" = ${tenantId} AND "id" = ${blockId}
    LIMIT 1
  `);

  return rows[0] ? mapBlock(rows[0]) : null;
}

export async function GET(_: Request, { params }: { params: { blockId: string } }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const block = await getBlock(session.tenantId, params.blockId);
    if (!block) return NextResponse.json({ message: 'بلوک پیدا نشد.' }, { status: 404 });

    return NextResponse.json({ block });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: { blockId: string } }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const body = (await request.json()) as BlockPayload;
    const name = body.name?.trim();
    if (!name) return NextResponse.json({ message: 'مشخصه بلوک الزامی است.' }, { status: 400 });

    const mainPlate = body.mainPlate?.trim() || null;
    const subPlate = body.subPlate?.trim() || null;

    const existing = await getBlock(session.tenantId, params.blockId);
    if (!existing) return NextResponse.json({ message: 'بلوک پیدا نشد.' }, { status: 404 });
    const status = existing.status;
    const usageJson = JSON.stringify(existing.usageCounts);

    await prisma.$executeRaw(Prisma.sql`
      UPDATE "Block"
      SET
        "name" = ${name},
        "mainPlate" = ${mainPlate},
        "subPlate" = ${subPlate},
        "status" = ${status},
        "usageCounts" = ${usageJson}::jsonb
      WHERE "tenantId" = ${session.tenantId} AND "id" = ${params.blockId}
    `);

    return NextResponse.json({ block: await getBlock(session.tenantId, params.blockId) });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request, { params }: { params: { blockId: string } }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const body = (await request.json()) as { action?: string; name?: string };
    if (body.action !== 'copy') return NextResponse.json({ message: 'عملیات معتبر نیست.' }, { status: 400 });

    const source = await getBlock(session.tenantId, params.blockId);
    if (!source) return NextResponse.json({ message: 'بلوک پیدا نشد.' }, { status: 404 });

    const name = body.name?.trim();
    if (!name) return NextResponse.json({ message: 'مشخصه بلوک الزامی است.' }, { status: 400 });

    const usageJson = JSON.stringify(source.usageCounts);
    const newId = crypto.randomUUID();
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "Block" ("id", "tenantId", "name", "mainPlate", "subPlate", "status", "usageCounts")
      VALUES (${newId}, ${session.tenantId}, ${name}, ${source.mainPlate || null}, ${source.subPlate || null}, ${source.status}, ${usageJson}::jsonb)
    `);

    return NextResponse.json({ block: await getBlock(session.tenantId, newId) }, { status: 201 });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function DELETE(_: Request, { params }: { params: { blockId: string } }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const existing = await getBlock(session.tenantId, params.blockId);
    if (!existing) return NextResponse.json({ message: 'بلوک پیدا نشد.' }, { status: 404 });

    await prisma.$executeRaw(Prisma.sql`
      DELETE FROM "Block"
      WHERE "tenantId" = ${session.tenantId} AND "id" = ${params.blockId}
    `);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
