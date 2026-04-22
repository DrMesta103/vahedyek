import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireSessionContext } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';

type PlateRow = {
  id: string;
  mainPlate: string;
  subPlates: unknown;
};

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
}

function isNumericText(value: string) {
  return /^\d+$/.test(normalizeDigits(value.trim()));
}

function mapPlate(row: PlateRow) {
  return {
    id: row.id,
    mainPlate: row.mainPlate,
    subPlates: Array.isArray(row.subPlates) ? row.subPlates.map(String) : [],
  };
}

async function getPlates(tenantId: string) {
  const rows = await prisma.$queryRaw<PlateRow[]>(Prisma.sql`
    SELECT "id", "mainPlate", "subPlates"
    FROM "ProjectPlate"
    WHERE "tenantId" = ${tenantId}
    ORDER BY "mainPlate" ASC
  `);
  return rows.map(mapPlate);
}

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    return NextResponse.json({ plates: await getPlates(session.tenantId) });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const body = (await request.json()) as { mainPlate?: string; subPlate?: string; subPlates?: string[] };
    const mainPlate = body.mainPlate?.trim() ?? '';
    const subPlates = (body.subPlates?.length ? body.subPlates : body.subPlate ? [body.subPlate] : []).map((item) => item.trim()).filter(Boolean);

    if (!mainPlate || subPlates.length === 0) return NextResponse.json({ message: 'پلاک اصلی و حداقل یک پلاک فرعی الزامی است.' }, { status: 400 });
    if (!isNumericText(mainPlate) || subPlates.some((item) => !isNumericText(item))) return NextResponse.json({ message: 'پلاک اصلی و فرعی باید عدد باشند.' }, { status: 400 });

    const uniqueSubPlates = Array.from(new Set(subPlates));
    const subPlateJson = JSON.stringify(uniqueSubPlates);
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "ProjectPlate" ("id", "tenantId", "mainPlate", "subPlates")
      VALUES (${crypto.randomUUID()}, ${session.tenantId}, ${mainPlate}, ${subPlateJson}::jsonb)
      ON CONFLICT ("tenantId", "mainPlate")
      DO UPDATE SET "subPlates" = (
        SELECT jsonb_agg(DISTINCT value)
        FROM jsonb_array_elements_text("ProjectPlate"."subPlates" || ${subPlateJson}::jsonb) AS value
      )
    `);

    return NextResponse.json({ plates: await getPlates(session.tenantId) }, { status: 201 });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
