import { NextResponse } from 'next/server';
import { requirePermission } from '../../../../lib/access-control';
import { getActorName, recordAuditLog } from '../../../../lib/audit-log';
import { sendReminderEmail } from '../../../../lib/reminder-email';
import { createReminderNotification, updateReminderNotificationEmailStatus } from '../../../../lib/reminder-store';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';

export async function POST(request: Request) {
  try {
    const auth = await requirePermission('platform.settings.manageAccess');
    if (auth instanceof NextResponse) return auth;
    const { session } = auth;

    const body = (await request.json().catch(() => null)) as { title?: unknown; message?: unknown } | null;
    const actorName = getActorName(session);
    const notification = await createReminderNotification({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName,
      title: body?.title,
      message: body?.message,
    });
    const emailStatus = notification.targetEmail
      ? await sendReminderEmail({
          to: notification.targetEmail,
          subject: notification.title,
          message: notification.messageText,
        })
      : 'missing';

    await updateReminderNotificationEmailStatus({
      id: notification.id,
      emailStatus,
    });

    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName,
      action: 'settings.reminder.notify',
      entityType: 'tenant_reminder_notification',
      entityId: notification.id,
      entityLabel: notification.title,
      summary: `${actorName} یک یادآور جدید برای ${notification.recipient.fullName} ارسال کرد.`,
      details: {
        title: notification.title,
        message: notification.messageText,
        recipientName: notification.recipient.fullName,
        recipientEmail: notification.recipient.email,
        recipientMobile: notification.recipient.mobile,
        targetEmail: notification.targetEmail,
        emailStatus,
        pushStatus: notification.pushStatus,
      },
      request,
    });

    return NextResponse.json({
      ok: true,
      notification: {
        id: notification.id,
        title: notification.title,
        message: notification.messageText,
        recipient: notification.recipient,
        targetEmail: notification.targetEmail,
        emailStatus,
        pushStatus: notification.pushStatus,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return handlePrismaApiError(error);
  }
}
