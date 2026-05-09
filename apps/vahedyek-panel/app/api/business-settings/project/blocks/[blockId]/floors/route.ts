import { NextResponse } from 'next/server';
import { Prisma } from '@/lib/prisma-client';
import { requireSessionContext } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../../lib/prismaApiError';

type FloorRow = {
  id: string;
  name: string;
  unitCount: number;
  residentialCount: number;
  commercialCount: number;
  officeCount: number;
  parkingCount: number;
  storageCount: number;
  amenityCount: number;
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

async function ensureBlock(tenantId: string, blockId: string) {
  const rows = await prisma.$queryRaw<Array<{ id: string; name: string }>>(Prisma.sql`
    SELECT "id", "name"
    FROM "Block"
    WHERE "tenantId" = ${tenantId} AND "id" = ${blockId}
    LIMIT 1
  `);
  return rows[0] ?? null;
}

async function getFloors(tenantId: string, blockId: string) {
  const rows = await prisma.$queryRaw<FloorRow[]>(Prisma.sql`
    SELECT
      f."id",
      f."name",
      COUNT(u."id")::int AS "unitCount",
      COUNT(u."id") FILTER (WHERE u."category" = 'unit' AND u."usage" = 'residential')::int AS "residentialCount",
      COUNT(u."id") FILTER (WHERE u."category" = 'unit' AND u."usage" = 'commercial')::int AS "commercialCount",
      COUNT(u."id") FILTER (WHERE u."category" = 'unit' AND u."usage" = 'office')::int AS "officeCount",
      COUNT(u."id") FILTER (WHERE u."category" = 'parking')::int AS "parkingCount",
      COUNT(u."id") FILTER (WHERE u."category" = 'storage')::int AS "storageCount",
      COUNT(u."id") FILTER (WHERE u."category" = 'amenity')::int AS "amenityCount"
    FROM "BlockFloor" f
    LEFT JOIN "Unit" u ON u."tenantId" = f."tenantId" AND u."blockId" = f."blockId" AND u."floorName" = f."name"
    WHERE f."tenantId" = ${tenantId} AND f."blockId" = ${blockId}
    GROUP BY f."id", f."name", f."createdAt"
    ORDER BY f."createdAt" ASC
  `);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    unitCount: Number(row.unitCount ?? 0),
    usageCounts: {
      residential: Number(row.residentialCount ?? 0),
      commercial: Number(row.commercialCount ?? 0),
      office: Number(row.officeCount ?? 0),
      parking: Number(row.parkingCount ?? 0),
      storage: Number(row.storageCount ?? 0),
      amenity: Number(row.amenityCount ?? 0),
    },
  }));
}

export async function GET(_: Request, { params }: { params: Promise<{ blockId: string }> }) {
  try {
    const { blockId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const block = await ensureBlock(session.tenantId, blockId);
    if (!block) return NextResponse.json({ message: 'بلوک پیدا نشد.' }, { status: 404 });

    return NextResponse.json({ block, floors: await getFloors(session.tenantId, blockId) });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ blockId: string }> }) {
  try {
    const { blockId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const block = await ensureBlock(session.tenantId, blockId);
    if (!block) return NextResponse.json({ message: 'بلوک پیدا نشد.' }, { status: 404 });

    const body = (await request.json()) as { mode?: 'single' | 'bulk'; name?: string; prefix?: string; from?: string | number; to?: string | number };

    if (body.mode === 'bulk') {
      const prefix = body.prefix?.trim();
      const from = toInteger(body.from);
      const to = toInteger(body.to);
      if (!prefix) return NextResponse.json({ message: 'پیشوند نام‌گذاری الزامی است.' }, { status: 400 });
      if (!Number.isFinite(from) || !Number.isFinite(to) || from > to) return NextResponse.json({ message: 'بازه شماره‌گذاری معتبر نیست.' }, { status: 400 });

      for (let index = from; index <= to; index += 1) {
        await prisma.$executeRaw(Prisma.sql`
          INSERT INTO "BlockFloor" ("id", "tenantId", "blockId", "name")
          VALUES (${crypto.randomUUID()}, ${session.tenantId}, ${blockId}, ${`${prefix}-${index}`})
          ON CONFLICT ("tenantId", "blockId", "name") DO NOTHING
        `);
      }
    } else {
      const name = body.name?.trim();
      if (!name) return NextResponse.json({ message: 'مشخصه طبقه الزامی است.' }, { status: 400 });

      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "BlockFloor" ("id", "tenantId", "blockId", "name")
        VALUES (${crypto.randomUUID()}, ${session.tenantId}, ${blockId}, ${name})
        ON CONFLICT ("tenantId", "blockId", "name") DO NOTHING
      `);
    }

    return NextResponse.json({ block, floors: await getFloors(session.tenantId, blockId) }, { status: 201 });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
