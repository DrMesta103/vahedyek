import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../lib/auth';
import { prisma } from '../../lib/prisma';
import { handlePrismaApiError } from '../../lib/prismaApiError';

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const blocks = await prisma.block.findMany({
      where: { tenantId: session.tenantId },
      include: {
        floors: {
          orderBy: { createdAt: 'asc' },
        },
        units: {
          orderBy: [{ floorName: 'asc' }, { category: 'asc' }, { name: 'asc' }],
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      blocks: blocks.map((block) => ({
        id: block.id,
        name: block.name,
        mainPlate: block.mainPlate,
        subPlate: block.subPlate,
        status: block.status,
        usageCounts: block.usageCounts,
        floors: block.floors.map((floor) => ({
          id: floor.id,
          name: floor.name,
        })),
        units: block.units.map((unit) => ({
          id: unit.id,
          floorName: unit.floorName,
          name: unit.name,
          category: unit.category,
          unitType: unit.unitType,
          usage: unit.usage,
          saleEnabled: unit.saleEnabled,
          deliveryStatus: unit.deliveryStatus,
          area: unit.area,
          balconyCount: unit.balconyCount,
          bedroomCount: unit.bedroomCount,
          postalCode: unit.postalCode,
          amenities: unit.amenities,
          baseInfo: unit.baseInfo,
          direction: unit.direction,
          assignedToUnitId: unit.assignedToUnitId,
        })),
      })),
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
