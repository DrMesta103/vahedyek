import { NextResponse } from 'next/server';
import { requirePermission } from '../../../lib/access-control';
import { buildFieldDiffs, getActorName, recordAuditLog } from '../../../lib/audit-log';
import { getReminderRecipient, getReminderSettings, saveReminderSettings } from '../../../lib/reminder-store';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function GET() {
  try {
    const auth = await requirePermission('platform.settings.view');
    if (auth instanceof NextResponse) return auth;
    const { session } = auth;

    const [settings, targetUser] = await Promise.all([
      getReminderSettings(session.tenantId),
      getReminderRecipient(session.tenantId),
    ]);
    return NextResponse.json({ settings, targetUser });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requirePermission('platform.settings.manageAccess');
    if (auth instanceof NextResponse) return auth;
    const { session } = auth;

    const body = (await request.json().catch(() => null)) as { settings?: unknown } | null;
    const before = await getReminderSettings(session.tenantId);
    const settings = await saveReminderSettings(session.tenantId, body?.settings ?? body);

    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName: getActorName(session),
      action: 'settings.reminder.update',
      entityType: 'tenant_reminder_settings',
      entityId: session.tenantId,
      entityLabel: 'یادآور',
      summary: `${getActorName(session)} تنظیمات یادآور را ویرایش کرد.`,
      diff: buildFieldDiffs(before, settings, {
        includeLastVisitedPage: 'آخرین بخش کاربر',
        includeRecentlyDeveloped: 'بخش‌های تازه توسعه‌یافته',
        includeNeedsTesting: 'بخش‌های نیازمند تست',
        includeCompletedDiscussions: 'موارد انجام‌شده در گفتگوها',
        notificationEmail: 'ایمیل مقصد یادآور',
      }),
      request,
    });

    return NextResponse.json({ settings });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
