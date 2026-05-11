import { NextResponse } from 'next/server';
import { getActorName, recordAuditLog } from '../../../lib/audit-log';
import { clearAuthCookie, getSessionContext } from '../../../lib/auth';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function POST(request: Request) {
  try {
    const session = await getSessionContext();
    const response = NextResponse.json({ success: true });
    clearAuthCookie(response);
    if (session?.tenantId) {
      await recordAuditLog({
        tenantId: session.tenantId,
        actorUserId: session.userId,
        actorName: getActorName(session),
        action: 'auth.logout',
        entityType: 'auth',
        entityId: session.userId,
        entityLabel: getActorName(session),
        summary: `${getActorName(session)} از سامانه خارج شد.`,
        request,
      });
    }
    return response;
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
