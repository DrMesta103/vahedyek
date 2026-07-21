import { NextResponse } from 'next/server';
import { getActorName, recordAuditLog } from '../../../lib/audit-log';
import { requireSessionContext } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';
import { seedDraftFromTenantSettings } from '../../../lib/seedDraftFromTenantSettings';

export async function POST(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    let applySettings = false;
    try {
      const body = (await request.json()) as { applySettings?: unknown };
      applySettings = body?.applySettings === true;
    } catch {
      applySettings = false;
    }

    const draft = await prisma.contractDraft.create({
      data: {
        tenantId: session.tenantId,
      },
      select: { id: true },
    });

    if (applySettings) {
      try {
        await seedDraftFromTenantSettings(session.tenantId, draft.id);
      } catch (seedError) {
        await prisma.contractDraft.delete({ where: { id: draft.id } }).catch(() => undefined);
        throw seedError;
      }
    }

    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName: getActorName(session),
      action: 'contract.create',
      entityType: 'contract_draft',
      entityId: draft.id,
      entityLabel: `پیش‌نویس ${draft.id}`,
      summary: applySettings
        ? `${getActorName(session)} پیش‌نویس قرارداد را با قالب تنظیمات ساخت.`
        : `${getActorName(session)} پیش‌نویس قرارداد جدید ساخت.`,
      details: { applySettings },
      request,
    });

    return NextResponse.json({ id: draft.id, applySettings }, { status: 201 });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
