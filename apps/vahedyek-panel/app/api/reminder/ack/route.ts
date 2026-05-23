import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../lib/auth';
import { isReminderTargetUser } from '../../../lib/reminder';
import { acknowledgeReminderNotification, markReminderShown } from '../../../lib/reminder-store';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function POST(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    if (!isReminderTargetUser(session.user)) {
      return NextResponse.json({ enabled: false });
    }

    const body = (await request.json().catch(() => null)) as { noticeId?: unknown } | null;

    await markReminderShown({
      tenantId: session.tenantId,
      userId: session.userId,
      acknowledgedTour: true,
    });

    await acknowledgeReminderNotification({
      tenantId: session.tenantId,
      userId: session.userId,
      noticeId: typeof body?.noticeId === 'string' ? body.noticeId : null,
    });

    return NextResponse.json({ enabled: true, ok: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
