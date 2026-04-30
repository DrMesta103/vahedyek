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

    const [memberships, suggestedBusinessNames] = await Promise.all([
      prisma.userTenantMembership.findMany({
        where: { userId: session.userId },
        include: { tenant: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.tenant.findMany({
        select: { name: true },
        orderBy: { createdAt: 'desc' },
        take: 18,
      }),
    ]);

    return NextResponse.json({
      tenants: memberships.map((m) => ({
        id: m.tenant.id,
        name: m.tenant.name,
        slug: m.tenant.slug,
        brandCode: m.tenant.brandCode,
        role: m.role,
      })),
      suggestedBusinessNames: Array.from(new Set(suggestedBusinessNames.map((item) => item.name))).slice(0, 12),
    });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
