import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { requireSessionContext } from '../../../../../../../lib/auth';
import { prisma } from '../../../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../../../lib/prismaApiError';

export async function GET(_: Request, { params }: { params: { blockId: string; floorId: string } }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const floors = await prisma.$queryRaw<Array<{ id: string; name: string; blockName: string; mainPlate: string | null; subPlate: string | null }>>(Prisma.sql`
      SELECT f."id", f."name", b."name" AS "blockName", b."mainPlate", b."subPlate"
      FROM "BlockFloor" f
      JOIN "Block" b ON b."id" = f."blockId" AND b."tenantId" = f."tenantId"
      WHERE f."tenantId" = ${session.tenantId} AND f."blockId" = ${params.blockId} AND f."id" = ${params.floorId}
      LIMIT 1
    `);

    const floor = floors[0];
    if (!floor) return NextResponse.json({ message: 'طبقه پیدا نشد.' }, { status: 404 });

    const units = await prisma.$queryRaw<Array<{ id: string; name: string; floorName: string }>>(Prisma.sql`
      SELECT "id", "name", "floorName", "category", "unitType", "usage", "saleEnabled", "deliveryStatus", "area", "balconyCount", "bedroomCount", "postalCode", "amenities", "baseInfo", "direction"
      FROM "Unit"
      WHERE "tenantId" = ${session.tenantId} AND "blockId" = ${params.blockId} AND "floorName" = ${floor.name}
      ORDER BY "name" ASC
    `);

    return NextResponse.json({ floor, units });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
