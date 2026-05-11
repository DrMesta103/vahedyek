import { NextResponse } from 'next/server';
import { getActorName, recordAuditLog } from '../../../lib/audit-log';
import { createSession, getSessionContext, setAuthCookie } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function POST(request: Request) {
  try {
    const session = await getSessionContext();
    if (!session) {
      return NextResponse.json({ message: 'احراز هویت نشده.' }, { status: 401 });
    }

    const body = (await request.json()) as { tenantId?: string };
    if (!body.tenantId) {
      return NextResponse.json({ message: 'tenantId الزامی است.' }, { status: 400 });
    }

    const membership = await prisma.userTenantMembership.findUnique({
      where: { userId_tenantId: { userId: session.userId, tenantId: body.tenantId } },
    });

    if (!membership) {
      return NextResponse.json({ message: 'دسترسی به این کسب‌وکار وجود ندارد.' }, { status: 403 });
    }

    const newSession = await createSession(session.userId, body.tenantId);
    const tenant = await prisma.tenant.findUnique({ where: { id: body.tenantId }, select: { name: true } });

    const response = NextResponse.json({ success: true });
    setAuthCookie(response, newSession);
    await recordAuditLog({
      tenantId: body.tenantId,
      actorUserId: session.userId,
      actorName: getActorName(session),
      action: 'auth.select_tenant',
      entityType: 'tenant',
      entityId: body.tenantId,
      entityLabel: tenant?.name ?? body.tenantId,
      summary: `${getActorName(session)} کسب‌وکار ${tenant?.name ?? body.tenantId} را انتخاب کرد.`,
      request,
    });

    return response;
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
