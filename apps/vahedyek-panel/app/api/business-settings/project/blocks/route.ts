import { NextResponse } from 'next/server';
import { Prisma } from '@/lib/prisma-client';
import { requireSessionContext } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';

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
  mode?: 'single' | 'bulk';
  name?: string;
  prefix?: string;
  from?: string | number;
  to?: string | number;
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
  residentialCount: number;
  commercialCount: number;
  officeCount: number;
  parkingCount: number;
  storageCount: number;
  amenityCount: number;
  unitCount: number;
  floorCount: number;
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
      residential: Number(block.residentialCount ?? 0),
      commercial: Number(block.commercialCount ?? 0),
      office: Number(block.officeCount ?? 0),
      parking: Number(block.parkingCount ?? 0),
      storage: Number(block.storageCount ?? 0),
      amenity: Number(block.amenityCount ?? 0),
    },
    unitCount: Number(block.unitCount ?? 0),
    floorCount: Number(block.floorCount ?? 0),
  };
}

async function getBlocks(tenantId: string) {
  const rows = await prisma.$queryRaw<DbBlock[]>(Prisma.sql`
    SELECT
      b."id",
      b."name",
      b."mainPlate",
      b."subPlate",
      b."status",
      COUNT(DISTINCT u."id") FILTER (WHERE u."category" = 'unit' AND u."usage" = 'residential')::int AS "residentialCount",
      COUNT(DISTINCT u."id") FILTER (WHERE u."category" = 'unit' AND u."usage" = 'commercial')::int AS "commercialCount",
      COUNT(DISTINCT u."id") FILTER (WHERE u."category" = 'unit' AND u."usage" = 'office')::int AS "officeCount",
      COUNT(DISTINCT u."id") FILTER (WHERE u."category" = 'parking')::int AS "parkingCount",
      COUNT(DISTINCT u."id") FILTER (WHERE u."category" = 'storage')::int AS "storageCount",
      COUNT(DISTINCT u."id") FILTER (WHERE u."category" = 'amenity')::int AS "amenityCount",
      COUNT(DISTINCT u."id")::int AS "unitCount",
      COUNT(DISTINCT f."id")::int AS "floorCount"
    FROM "Block" b
    LEFT JOIN "Unit" u ON u."blockId" = b."id" AND u."tenantId" = b."tenantId"
    LEFT JOIN "BlockFloor" f ON f."blockId" = b."id" AND f."tenantId" = b."tenantId"
    WHERE b."tenantId" = ${tenantId}
    GROUP BY b."id", b."name", b."mainPlate", b."subPlate", b."status"
    ORDER BY b."name" ASC
  `);

  return rows.map(mapBlock);
}

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    return NextResponse.json({ blocks: await getBlocks(session.tenantId) });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const body = (await request.json()) as BlockPayload;
    const mode = body.mode === 'bulk' ? 'bulk' : 'single';
    const mainPlate = body.mainPlate?.trim() || null;
    const subPlate = body.subPlate?.trim() || null;
    const status = 'incomplete';
    const usageCounts = DEFAULT_USAGE_COUNTS;
    const usageJson = JSON.stringify(usageCounts);

    if (mode === 'single') {
      const name = body.name?.trim();
      if (!name) return NextResponse.json({ message: 'مشخصه بلوک الزامی است.' }, { status: 400 });

      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "Block" ("id", "tenantId", "name", "mainPlate", "subPlate", "status", "usageCounts")
        VALUES (${crypto.randomUUID()}, ${session.tenantId}, ${name}, ${mainPlate}, ${subPlate}, ${status}, ${usageJson}::jsonb)
      `);

      return NextResponse.json({ blocks: await getBlocks(session.tenantId) }, { status: 201 });
    }

    const prefix = body.prefix?.trim();
    const from = toInteger(body.from);
    const to = toInteger(body.to);

    if (!prefix) return NextResponse.json({ message: 'پیشوند نام‌گذاری الزامی است.' }, { status: 400 });
    if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) {
      return NextResponse.json({ message: 'بازه شماره‌گذاری معتبر نیست.' }, { status: 400 });
    }

    for (let index = from; index <= to; index += 1) {
      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "Block" ("id", "tenantId", "name", "mainPlate", "subPlate", "status", "usageCounts")
        VALUES (${crypto.randomUUID()}, ${session.tenantId}, ${`${prefix}-${index}`}, ${mainPlate}, ${subPlate}, ${status}, ${usageJson}::jsonb)
      `);
    }

    return NextResponse.json({ blocks: await getBlocks(session.tenantId) }, { status: 201 });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
