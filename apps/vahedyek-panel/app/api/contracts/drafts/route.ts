import { NextResponse } from 'next/server';
import { getActorName, recordAuditLog } from '../../../lib/audit-log';
import { requireSessionContext } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { handlePrismaApiError } from '../../../lib/prismaApiError';

export async function POST(request: Request) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const draft = await prisma.contractDraft.create({
      data: {
        tenantId: session.tenantId,
      },
      select: { id: true },
    });
    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName: getActorName(session),
      action: 'contract.create',
      entityType: 'contract_draft',
      entityId: draft.id,
      entityLabel: `پیش‌نویس ${draft.id}`,
      summary: `${getActorName(session)} پیش‌نویس قرارداد جدید ساخت.`,
      request,
    });

    return NextResponse.json(draft, { status: 201 });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
