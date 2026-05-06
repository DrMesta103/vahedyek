import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSessionContext } from '../../../../lib/auth';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionContext();
    if (!session?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { isActive } = await request.json();

    const employee = await prisma.employee.update({
      where: {
        id,
        tenantId: session.tenantId,
      },
      data: { isActive },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error toggling employee status:', error);
    return handlePrismaApiError(error);
  }
}
