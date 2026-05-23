import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../lib/auth';
import { isReminderTargetUser, normalizePagePathForReminder, normalizePageTitleForReminder } from '../../../lib/reminder';
import { buildReminderDigest, markReminderShown } from '../../../lib/reminder-store';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function GET(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    if (!isReminderTargetUser(session.user)) {
      return NextResponse.json({ enabled: false });
    }

    const { searchParams } = new URL(request.url);
    const hadPageReload = searchParams.get('reload') === '1';
    const currentPath = normalizePagePathForReminder(searchParams.get('path'));
    const currentTitle = normalizePageTitleForReminder(searchParams.get('title'));
    const digest = await buildReminderDigest({
      tenantId: session.tenantId,
      userId: session.userId,
      hadPageReload,
      currentPath,
      currentTitle,
    });

    await markReminderShown({
      tenantId: session.tenantId,
      userId: session.userId,
      acknowledgedTour: false,
    });

    return NextResponse.json(digest);
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
