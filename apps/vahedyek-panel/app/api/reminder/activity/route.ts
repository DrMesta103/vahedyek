import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../lib/auth';
import { isReminderTargetUser } from '../../../lib/reminder';
import { recordReminderActivity } from '../../../lib/reminder-store';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function POST(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    if (!isReminderTargetUser(session.user)) {
      return NextResponse.json({ enabled: false });
    }

    const body = (await request.json().catch(() => null)) as {
      path?: unknown;
      pageTitle?: unknown;
      hasInput?: unknown;
      hasInteraction?: unknown;
      actionSummary?: unknown;
    } | null;
    await recordReminderActivity({
      tenantId: session.tenantId,
      userId: session.userId,
      path: body?.path,
      pageTitle: body?.pageTitle,
      actionSummary: body?.actionSummary,
      hasInput: Boolean(body?.hasInput),
      hasInteraction: Boolean(body?.hasInteraction),
    });

    return NextResponse.json({ enabled: true, ok: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
