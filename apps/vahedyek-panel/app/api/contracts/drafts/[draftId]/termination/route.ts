import { NextResponse } from 'next/server';
import type { Prisma } from '@/lib/prisma-client';
import { getActorName, recordAuditLog } from '../../../../../lib/audit-log';
import { requireSessionContext } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../lib/prismaApiError';
import { normalizePersistedBuyerRules } from '../../../../../lib/terminationBuyerRules';
import { getTerminationBuyerRulesRow, upsertTerminationBuyerRulesRow } from '../../../../../lib/terminationRulesDb';
import type { BuyerRulesPersisted } from '../../../../../types/contract';

function parseBuyerRulesBody(body: unknown): BuyerRulesPersisted | null {
  if (!body || typeof body !== 'object') return null;
  const o = body as Record<string, unknown>;
  const br = o.buyerRules ?? body;
  return normalizePersistedBuyerRules(br);
}

export async function GET(_: Request, { params }: { params: Promise<{ draftId: string }> }) {
  try {
    const { draftId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const draft = await prisma.contractDraft.findFirst({
      where: { id: draftId, tenantId: session.tenantId },
      select: { id: true },
    });

    if (!draft) {
      return NextResponse.json({ message: 'پیش‌نویس موردنظر در این کارپوشه پیدا نشد.' }, { status: 404 });
    }

    const buyerRules = await getTerminationBuyerRulesRow(draftId);
    return NextResponse.json({ buyerRules });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ draftId: string }> }) {
  try {
    const { draftId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const draft = await prisma.contractDraft.findFirst({
      where: { id: draftId, tenantId: session.tenantId },
      select: { id: true, approvalInstance: { select: { status: true } } },
    });

    if (!draft) {
      return NextResponse.json({ message: 'پیش‌نویس موردنظر در این کارپوشه پیدا نشد.' }, { status: 404 });
    }

    if (draft.approvalInstance?.status === 'IN_REVIEW') {
      return NextResponse.json({ message: 'این پیش‌نویس در فرایند تأیید است و امکان ویرایش ندارد.' }, { status: 409 });
    }

    const body = await request.json();
    const normalized = parseBuyerRulesBody(body);
    if (!normalized) {
      return NextResponse.json({ message: 'ساختار buyerRules معتبر نیست.' }, { status: 400 });
    }

    const buyerRules = normalized as unknown as Prisma.InputJsonValue;

    await upsertTerminationBuyerRulesRow(draftId, buyerRules);
    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName: getActorName(session),
      action: 'contract.termination.update',
      entityType: 'contract_draft',
      entityId: draftId,
      entityLabel: `پیش‌نویس ${draftId}`,
      summary: `${getActorName(session)} شرایط فسخ قرارداد را ویرایش کرد.`,
      details: { buyerRules: normalized as unknown as Prisma.InputJsonValue },
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
