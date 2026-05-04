import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireSessionContext } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';
import {
  getTenantProjectSettings,
  normalizeProjectReport,
  updateTenantProjectSettings,
} from '../_lib/projectSettings';

type SummaryRow = {
  blockCount: number;
  floorCount: number;
  unitCount: number;
  parkingCount: number;
  storageCount: number;
  amenityCount: number;
};

async function getProjectSummary(tenantId: string) {
  const [blockRows, plateRows] = await Promise.all([
    prisma.$queryRaw<SummaryRow[]>(Prisma.sql`
      SELECT
        COUNT(DISTINCT b."id")::int AS "blockCount",
        COUNT(DISTINCT f."id")::int AS "floorCount",
        COUNT(DISTINCT u."id") FILTER (WHERE u."category" = 'unit')::int AS "unitCount",
        COUNT(DISTINCT u."id") FILTER (WHERE u."category" = 'parking')::int AS "parkingCount",
        COUNT(DISTINCT u."id") FILTER (WHERE u."category" = 'storage')::int AS "storageCount",
        COUNT(DISTINCT u."id") FILTER (WHERE u."category" = 'amenity')::int AS "amenityCount"
      FROM "Tenant" t
      LEFT JOIN "Block" b ON b."tenantId" = t."id"
      LEFT JOIN "BlockFloor" f ON f."tenantId" = t."id"
      LEFT JOIN "Unit" u ON u."tenantId" = t."id"
      WHERE t."id" = ${tenantId}
      GROUP BY t."id"
    `),
    prisma.$queryRaw<Array<{ plateCount: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS "plateCount"
      FROM "ProjectPlate"
      WHERE "tenantId" = ${tenantId}
    `),
  ]);

  const summary = blockRows[0] ?? {
    blockCount: 0,
    floorCount: 0,
    unitCount: 0,
    parkingCount: 0,
    storageCount: 0,
    amenityCount: 0,
  };

  return {
    ...summary,
    plateCount: Number(plateRows[0]?.plateCount ?? 0),
  };
}

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const [settings, summary] = await Promise.all([
      getTenantProjectSettings(session.tenantId),
      getProjectSummary(session.tenantId),
    ]);

    return NextResponse.json({
      report: normalizeProjectReport(settings.projectReportData),
      summary,
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const payload = normalizeProjectReport(await request.json());
    await updateTenantProjectSettings(session.tenantId, 'projectReportData', payload);

    return NextResponse.json({
      report: payload,
      summary: await getProjectSummary(session.tenantId),
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
