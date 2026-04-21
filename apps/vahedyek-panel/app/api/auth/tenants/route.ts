import { NextResponse } from 'next/server';
import { getSessionContext } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function GET() {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json({ message: 'احراز هویت نشده.' }, { status: 401 });
    }

    const memberships = await prisma.userTenantMembership.findMany({
      where: { userId: session.userId },
      include: { tenant: true },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      tenants: memberships.map((m) => ({
        id: m.tenant.id,
        name: m.tenant.name,
        slug: m.tenant.slug,
        brandCode: m.tenant.brandCode,
        role: m.role,
      })),
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
