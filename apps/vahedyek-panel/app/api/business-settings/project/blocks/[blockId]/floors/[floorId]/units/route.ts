import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireSessionContext } from '../../../../../../../../lib/auth';
import { prisma } from '../../../../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../../../../lib/prismaApiError';

type UnitPayload = {
  mode?: 'single' | 'bulk';
  category?: string;
  unitType?: string;
  usage?: string;
  name?: string;
  prefix?: string;
  from?: string;
  to?: string;
  saleEnabled?: boolean;
  deliveryStatus?: string;
  area?: string;
  balconyCount?: string;
  bedroomCount?: string;
  postalCode?: string;
  amenities?: Array<{ title: string; count: number }>;
  baseInfo?: string;
  direction?: string;
  areaPricingMode?: string;
  parkingIds?: string[];
  storageIds?: string[];
};

const unitTypes = ['تیپ A', 'تیپ B', 'تیپ C', 'بدون تیپ'];
const categories = new Set(['unit', 'storage', 'parking', 'amenity']);
const usages = new Set(['residential', 'commercial', 'office']);
const deliveryStatuses = new Set(['ready', 'presale']);
const directions = new Set(['unknown', 'north', 'south', 'east', 'west', 'north-east', 'north-west', 'south-east', 'south-west']);
const areaPricingModes = new Set(['unit-only', 'unit-plus-parking', 'unit-plus-storage', 'unit-plus-storage-parking']);

function cleanText(value: unknown, max = 80) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function parseNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCount(value: unknown) {
  const parsed = parseNumber(value);
  if (parsed === null || parsed < 0) return 0;
  return Math.floor(parsed);
}

async function getFloor(tenantId: string, blockId: string, floorId: string) {
  const floors = await prisma.$queryRaw<Array<{ id: string; name: string; blockName: string }>>(Prisma.sql`
    SELECT f."id", f."name", b."name" AS "blockName"
    FROM "BlockFloor" f
    JOIN "Block" b ON b."id" = f."blockId" AND b."tenantId" = f."tenantId"
    WHERE f."tenantId" = ${tenantId} AND f."blockId" = ${blockId} AND f."id" = ${floorId}
    LIMIT 1
  `);

  return floors[0] ?? null;
}

async function ensureAreaPricingModeColumn() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Unit"
    ADD COLUMN IF NOT EXISTS "areaPricingMode" TEXT NOT NULL DEFAULT 'unit-only'
  `);
}

export async function GET(_: Request, { params }: { params: Promise<{ blockId: string; floorId: string }> }) {
  try {
    const { blockId, floorId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    await ensureAreaPricingModeColumn();

    const floor = await getFloor(session.tenantId, blockId, floorId);
    if (!floor) return NextResponse.json({ message: 'طبقه پیدا نشد.' }, { status: 404 });

    const [units, parking, storage] = await Promise.all([
      prisma.$queryRaw(Prisma.sql`
        SELECT "id", "name", "floorName", "category", "unitType", "usage", "saleEnabled", "deliveryStatus", "area", "balconyCount", "bedroomCount", "postalCode", "amenities", "baseInfo", "direction", "areaPricingMode"
        FROM "Unit"
        WHERE "tenantId" = ${session.tenantId} AND "blockId" = ${blockId} AND "floorName" = ${floor.name} AND "category" = 'unit'
        ORDER BY "name" ASC
      `),
      prisma.$queryRaw(Prisma.sql`
        SELECT "id", "name", "assignedToUnitId"
        FROM "Unit"
        WHERE "tenantId" = ${session.tenantId} AND "blockId" = ${blockId} AND "category" = 'parking'
        ORDER BY "name" ASC
      `),
      prisma.$queryRaw(Prisma.sql`
        SELECT "id", "name", "assignedToUnitId"
        FROM "Unit"
        WHERE "tenantId" = ${session.tenantId} AND "blockId" = ${blockId} AND "category" = 'storage'
        ORDER BY "name" ASC
      `),
    ]);

    return NextResponse.json({ floor, units, options: { unitTypes, parking, storage } });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ blockId: string; floorId: string }> }) {
  try {
    const { blockId, floorId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    await ensureAreaPricingModeColumn();

    const floor = await getFloor(session.tenantId, blockId, floorId);
    if (!floor) return NextResponse.json({ message: 'طبقه پیدا نشد.' }, { status: 404 });

    const payload = (await request.json()) as UnitPayload;
    const mode = payload.mode === 'bulk' ? 'bulk' : 'single';
    const category = categories.has(cleanText(payload.category)) ? cleanText(payload.category) : 'unit';
    const unitType = category === 'unit' && unitTypes.includes(cleanText(payload.unitType)) ? cleanText(payload.unitType) : null;
    const usage = usages.has(cleanText(payload.usage)) ? cleanText(payload.usage) : 'residential';
    const deliveryStatus = deliveryStatuses.has(cleanText(payload.deliveryStatus)) ? cleanText(payload.deliveryStatus) : 'ready';
    const direction = directions.has(cleanText(payload.direction)) ? cleanText(payload.direction) : 'unknown';
    const areaPricingMode = areaPricingModes.has(cleanText(payload.areaPricingMode)) ? cleanText(payload.areaPricingMode) : 'unit-only';
    const area = parseNumber(payload.area);
    const balconyCount = parseCount(payload.balconyCount);
    const bedroomCount = parseCount(payload.bedroomCount);
    const postalCode = cleanText(payload.postalCode, 20) || null;
    const saleEnabled = payload.saleEnabled !== false;
    const baseInfo = category === 'amenity' ? cleanText(payload.baseInfo, 500) || null : null;
    const amenities = Array.isArray(payload.amenities)
      ? payload.amenities
          .map((item) => ({ title: cleanText(item.title, 40), count: parseCount(item.count) }))
          .filter((item) => item.title)
      : [];

    const names =
      mode === 'bulk'
        ? (() => {
            const prefix = cleanText(payload.prefix, 30);
            const from = parseCount(payload.from);
            const to = parseCount(payload.to);
            if (!prefix || from < 1 || to < from) return [];
            return Array.from({ length: to - from + 1 }, (_, index) => `${prefix}${from + index}`);
          })()
        : [cleanText(payload.name, 30)].filter(Boolean);

    if (names.length === 0) return NextResponse.json({ message: mode === 'bulk' ? 'بازه نام‌گذاری معتبر نیست.' : 'مشخصه الزامی است.' }, { status: 400 });
    if (category !== 'amenity' && (area === null || area <= 0)) return NextResponse.json({ message: 'متراژ الزامی است.' }, { status: 400 });

    const duplicate = await prisma.$queryRaw<Array<{ name: string }>>(Prisma.sql`
      SELECT "name"
      FROM "Unit"
      WHERE "tenantId" = ${session.tenantId}
        AND "blockId" = ${blockId}
        AND "floorName" = ${floor.name}
        AND "category" = ${category}
        AND "name" IN (${Prisma.join(names)})
      LIMIT 1
    `);
    if (duplicate.length) return NextResponse.json({ message: `واحد «${duplicate[0].name}» قبلا ثبت شده است.` }, { status: 409 });

    const canAssign = mode === 'single' && (category === 'unit' || category === 'amenity');
    const parkingIds = canAssign && Array.isArray(payload.parkingIds) ? payload.parkingIds.map((id) => cleanText(id, 80)).filter(Boolean) : [];
    const storageIds = canAssign && Array.isArray(payload.storageIds) ? payload.storageIds.map((id) => cleanText(id, 80)).filter(Boolean) : [];
    const createdIds: string[] = [];

    await prisma.$transaction(async (tx) => {
      for (const name of names) {
        const id = crypto.randomUUID();
        createdIds.push(id);
        await tx.$executeRaw(Prisma.sql`
          INSERT INTO "Unit" ("id", "tenantId", "blockId", "floorName", "name", "category", "unitType", "usage", "saleEnabled", "deliveryStatus", "area", "balconyCount", "bedroomCount", "postalCode", "amenities", "baseInfo", "direction", "areaPricingMode", "createdAt", "updatedAt")
          VALUES (${id}, ${session.tenantId}, ${blockId}, ${floor.name}, ${name}, ${category}, ${unitType}, ${usage}, ${saleEnabled}, ${deliveryStatus}, ${area}, ${category === 'unit' ? balconyCount : 0}, ${category === 'unit' ? bedroomCount : 0}, ${category === 'unit' ? postalCode : null}, ${JSON.stringify(category === 'unit' ? amenities : [])}::jsonb, ${baseInfo}, ${direction}, ${category === 'unit' ? areaPricingMode : 'unit-only'}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
      }

      const targetUnitId = createdIds[0];
      if (targetUnitId && parkingIds.length) {
        await tx.$executeRaw(Prisma.sql`
          UPDATE "Unit"
          SET "assignedToUnitId" = ${targetUnitId}, "updatedAt" = CURRENT_TIMESTAMP
          WHERE "tenantId" = ${session.tenantId} AND "blockId" = ${blockId} AND "category" = 'parking' AND "assignedToUnitId" IS NULL AND "id" IN (${Prisma.join(parkingIds)})
        `);
      }

      if (targetUnitId && storageIds.length) {
        await tx.$executeRaw(Prisma.sql`
          UPDATE "Unit"
          SET "assignedToUnitId" = ${targetUnitId}, "updatedAt" = CURRENT_TIMESTAMP
          WHERE "tenantId" = ${session.tenantId} AND "blockId" = ${blockId} AND "category" = 'storage' AND "assignedToUnitId" IS NULL AND "id" IN (${Prisma.join(storageIds)})
        `);
      }
    });

    return NextResponse.json({ created: createdIds.length }, { status: 201 });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
