import { NextResponse } from 'next/server';
import { Prisma } from '@/lib/prisma-client';
import { requireSessionContext } from '../../../../../../../../../lib/auth';
import { prisma } from '../../../../../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../../../../../lib/prismaApiError';

type UnitPayload = {
  category?: string;
  unitType?: string;
  usage?: string;
  name?: string;
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
const amenitySpaceTypes = ['فضای سبز', 'سالن ورزشی', 'استخر', 'باشگاه', 'نگار خانه هنر', 'سوئیت مهمان', 'سینما', 'اتاق بازی', 'سالن اجتماعات', 'کارگاه هنری', 'سالن اسپا', 'کتاب خانه', 'کافی شاپ', 'سرویس بهداشتی عمومی'];
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

async function getUnit(tenantId: string, blockId: string, floorName: string, unitId: string) {
  const units = await prisma.$queryRaw<Array<{
    id: string;
    name: string;
    floorName: string;
    category: string;
    unitType: string | null;
    usage: string | null;
    saleEnabled: boolean | null;
    deliveryStatus: string | null;
    area: number | null;
    balconyCount: number | null;
    bedroomCount: number | null;
    postalCode: string | null;
    amenities: Array<{ title: string; count: number }> | null;
    baseInfo: string | null;
    direction: string | null;
    areaPricingMode: string | null;
  }>>(Prisma.sql`
    SELECT "id", "name", "floorName", "category", "unitType", "usage", "saleEnabled", "deliveryStatus", "area", "balconyCount", "bedroomCount", "postalCode", "amenities", "baseInfo", "direction", "areaPricingMode"
    FROM "Unit"
    WHERE "tenantId" = ${tenantId} AND "blockId" = ${blockId} AND "floorName" = ${floorName} AND "id" = ${unitId}
    LIMIT 1
  `);

  return units[0] ?? null;
}

export async function GET(_: Request, { params }: { params: Promise<{ blockId: string; floorId: string; unitId: string }> }) {
  try {
    const { blockId, floorId, unitId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    await ensureAreaPricingModeColumn();

    const floor = await getFloor(session.tenantId, blockId, floorId);
    if (!floor) return NextResponse.json({ message: 'طبقه پیدا نشد.' }, { status: 404 });

    const unit = await getUnit(session.tenantId, blockId, floor.name, unitId);
    if (!unit) return NextResponse.json({ message: 'واحد پیدا نشد.' }, { status: 404 });

    const [parking, storage] = await Promise.all([
      prisma.$queryRaw<Array<{ id: string; name: string; assignedToUnitId: string | null }>>(Prisma.sql`
        SELECT "id", "name", "assignedToUnitId"
        FROM "Unit"
        WHERE "tenantId" = ${session.tenantId} AND "blockId" = ${blockId} AND "category" = 'parking'
        ORDER BY "name" ASC
      `),
      prisma.$queryRaw<Array<{ id: string; name: string; assignedToUnitId: string | null }>>(Prisma.sql`
        SELECT "id", "name", "assignedToUnitId"
        FROM "Unit"
        WHERE "tenantId" = ${session.tenantId} AND "blockId" = ${blockId} AND "category" = 'storage'
        ORDER BY "name" ASC
      `),
    ]);

    return NextResponse.json({ unit, options: { unitTypes, amenitySpaceTypes, parking, storage } });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ blockId: string; floorId: string; unitId: string }> }) {
  try {
    const { blockId, floorId, unitId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    await ensureAreaPricingModeColumn();

    const floor = await getFloor(session.tenantId, blockId, floorId);
    if (!floor) return NextResponse.json({ message: 'طبقه پیدا نشد.' }, { status: 404 });

    const existingUnit = await getUnit(session.tenantId, blockId, floor.name, unitId);
    if (!existingUnit) return NextResponse.json({ message: 'واحد پیدا نشد.' }, { status: 404 });

    const payload = (await request.json()) as UnitPayload;
    const category = categories.has(cleanText(payload.category)) ? cleanText(payload.category) : existingUnit.category;
    const name = cleanText(payload.name, 30);
    const unitTypeValue = cleanText(payload.unitType);
    const unitType = category === 'unit'
      ? unitTypes.includes(unitTypeValue)
        ? unitTypeValue
        : null
      : category === 'amenity'
        ? amenitySpaceTypes.includes(unitTypeValue)
          ? unitTypeValue
          : null
        : null;
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

    if (!name) return NextResponse.json({ message: 'مشخصه الزامی است.' }, { status: 400 });
    if (category !== 'amenity' && (area === null || area <= 0)) return NextResponse.json({ message: 'متراژ الزامی است.' }, { status: 400 });

    if (category === 'amenity' && !unitType) return NextResponse.json({ message: 'نوع فضا الزامی است.' }, { status: 400 });

    const duplicate = await prisma.$queryRaw<Array<{ name: string }>>(Prisma.sql`
      SELECT "name"
      FROM "Unit"
      WHERE "tenantId" = ${session.tenantId}
        AND "blockId" = ${blockId}
        AND "floorName" = ${floor.name}
        AND "category" = ${category}
        AND "name" = ${name}
        AND "id" <> ${unitId}
      LIMIT 1
    `);
    if (duplicate.length) return NextResponse.json({ message: `واحد «${duplicate[0].name}» قبلا ثبت شده است.` }, { status: 409 });

    const canAssign = category === 'unit' || category === 'amenity';
    const parkingIds = canAssign && Array.isArray(payload.parkingIds) ? payload.parkingIds.map((id) => cleanText(id, 80)).filter(Boolean) : [];
    const storageIds = canAssign && Array.isArray(payload.storageIds) ? payload.storageIds.map((id) => cleanText(id, 80)).filter(Boolean) : [];

    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw(Prisma.sql`
        UPDATE "Unit"
        SET
          "name" = ${name},
          "category" = ${category},
          "unitType" = ${unitType},
          "usage" = ${usage},
          "saleEnabled" = ${saleEnabled},
          "deliveryStatus" = ${deliveryStatus},
          "area" = ${area},
          "balconyCount" = ${category === 'unit' ? balconyCount : 0},
          "bedroomCount" = ${category === 'unit' ? bedroomCount : 0},
          "postalCode" = ${category === 'unit' ? postalCode : null},
          "amenities" = ${JSON.stringify(category === 'unit' ? amenities : [])}::jsonb,
          "baseInfo" = ${baseInfo},
          "direction" = ${direction},
          "areaPricingMode" = ${category === 'unit' ? areaPricingMode : 'unit-only'},
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE "tenantId" = ${session.tenantId} AND "blockId" = ${blockId} AND "id" = ${unitId}
      `);

      await tx.$executeRaw(Prisma.sql`
        UPDATE "Unit"
        SET "assignedToUnitId" = NULL, "updatedAt" = CURRENT_TIMESTAMP
        WHERE "tenantId" = ${session.tenantId}
          AND "blockId" = ${blockId}
          AND "category" IN ('parking', 'storage')
          AND "assignedToUnitId" = ${unitId}
      `);

      if (parkingIds.length) {
        await tx.$executeRaw(Prisma.sql`
          UPDATE "Unit"
          SET "assignedToUnitId" = ${unitId}, "updatedAt" = CURRENT_TIMESTAMP
          WHERE "tenantId" = ${session.tenantId}
            AND "blockId" = ${blockId}
            AND "category" = 'parking'
            AND ("assignedToUnitId" IS NULL OR "assignedToUnitId" = ${unitId})
            AND "id" IN (${Prisma.join(parkingIds)})
        `);
      }

      if (storageIds.length) {
        await tx.$executeRaw(Prisma.sql`
          UPDATE "Unit"
          SET "assignedToUnitId" = ${unitId}, "updatedAt" = CURRENT_TIMESTAMP
          WHERE "tenantId" = ${session.tenantId}
            AND "blockId" = ${blockId}
            AND "category" = 'storage'
            AND ("assignedToUnitId" IS NULL OR "assignedToUnitId" = ${unitId})
            AND "id" IN (${Prisma.join(storageIds)})
        `);
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
