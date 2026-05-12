import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getActorName, recordAuditLog } from '../../../lib/audit-log';
import { getSessionContext } from '../../../lib/auth';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionContext();
    if (!session?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Soft delete: just mark as inactive
    const employee = await prisma.employee.update({
      where: {
        id,
        tenantId: session.tenantId,
      },
      data: { isActive: false },
    });
    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName: getActorName(session),
      action: 'employee.delete',
      entityType: 'employee',
      entityId: employee.id,
      entityLabel: `${employee.firstName} ${employee.lastName}`.trim(),
      summary: `${getActorName(session)} کارمند ${`${employee.firstName} ${employee.lastName}`.trim()} را غیرفعال کرد.`,
      diff: [{ field: 'isActive', label: 'وضعیت فعال', before: 'بله', after: 'خیر' }],
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return handlePrismaApiError(error);
  }
}
