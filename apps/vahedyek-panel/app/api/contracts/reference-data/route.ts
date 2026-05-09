import { NextResponse } from 'next/server';
import { DirectoryRole, PersonType, Prisma } from '@/lib/prisma-client';
import { requireSessionContext } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function GET() {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const [employees, formerEmployees, blocks, directory] = await Promise.all([
      prisma.employee.findMany({
        where: { tenantId: session.tenantId, isActive: true },
        orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      }),
      prisma.$queryRaw<Array<{ id: string; fullName: string }>>(Prisma.sql`
        SELECT "id", "fullName"
        FROM "FormerEmployee"
        WHERE "tenantId" = ${session.tenantId}
        ORDER BY "fullName" ASC
      `),
      prisma.block.findMany({
        where: { tenantId: session.tenantId },
        include: {
          units: {
            orderBy: { name: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.directoryPerson.findMany({
        where: { tenantId: session.tenantId },
        orderBy: { name: 'asc' },
      }),
    ]);

    const byRole = (role: DirectoryRole, personType: PersonType) =>
      directory
        .filter((item) => item.role === role && item.personType === personType)
        .map((item) => ({
          id: item.id,
          name: item.name,
        }));

    return NextResponse.json({
      employees,
      formerEmployees: formerEmployees.map((item) => ({
        id: item.id,
        fullName: item.fullName,
      })),
      blocks: blocks.map((block) => ({
        id: block.id,
        name: block.name,
        units: block.units.map((unit) => ({
          id: unit.id,
          floorName: unit.floorName,
          name: unit.name,
          title: `${unit.floorName} - ${unit.name}`,
          category: unit.category,
          area: unit.area,
          assignedToUnitId: unit.assignedToUnitId,
        })),
      })),
      directory: {
        partner: {
          natural: byRole(DirectoryRole.partner, PersonType.natural),
          legal: byRole(DirectoryRole.partner, PersonType.legal),
        },
        buyer: {
          natural: byRole(DirectoryRole.buyer, PersonType.natural),
          legal: byRole(DirectoryRole.buyer, PersonType.legal),
        },
      },
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const body = (await request.json()) as {
      role?: 'partner' | 'buyer';
      personType?: 'natural' | 'legal';
      name?: string;
    };

    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ message: 'نام شخص یا شرکت الزامی است.' }, { status: 400 });
    }

    if (body.role !== 'partner' && body.role !== 'buyer') {
      return NextResponse.json({ message: 'نوع طرف معتبر نیست.' }, { status: 400 });
    }

    if (body.personType !== 'natural' && body.personType !== 'legal') {
      return NextResponse.json({ message: 'نوع شخصیت معتبر نیست.' }, { status: 400 });
    }

    const created = await prisma.directoryPerson.create({
      data: {
        id: crypto.randomUUID(),
        tenantId: session.tenantId,
        name,
        role: body.role === 'partner' ? DirectoryRole.partner : DirectoryRole.buyer,
        personType: body.personType === 'legal' ? PersonType.legal : PersonType.natural,
      },
    });

    return NextResponse.json({
      id: created.id,
      name: created.name,
      role: created.role === DirectoryRole.partner ? 'partner' : 'buyer',
      personType: created.personType === PersonType.legal ? 'legal' : 'natural',
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
