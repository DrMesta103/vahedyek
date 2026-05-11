import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getActorName, recordAuditLog } from '../../../../lib/audit-log';
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
    const previous = await prisma.employee.findFirst({ where: { id, tenantId: session.tenantId } });

    const employee = await prisma.employee.update({
      where: {
        id,
        tenantId: session.tenantId,
      },
      data: { isActive },
    });
    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName: getActorName(session),
      action: 'employee.update',
      entityType: 'employee',
      entityId: employee.id,
      entityLabel: `${employee.firstName} ${employee.lastName}`.trim(),
      summary: `${getActorName(session)} وضعیت کارمند ${`${employee.firstName} ${employee.lastName}`.trim()} را تغییر داد.`,
      diff: [{ field: 'isActive', label: 'وضعیت فعال', before: previous?.isActive ? 'بله' : 'خیر', after: employee.isActive ? 'بله' : 'خیر' }],
      request,
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error toggling employee status:', error);
    return handlePrismaApiError(error);
  }
}
