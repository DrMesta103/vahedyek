import { NextResponse } from 'next/server';
import { Prisma } from '@/lib/prisma-client';
import { getActorName, recordAuditLog } from '../../../../../lib/audit-log';
import { requireSessionContext } from '../../../../../lib/auth';
import { normalizeRuleState } from '../../../../../lib/businessContractRules';
import {
  getContractDraftRuleSettingsRow,
  upsertContractDraftRuleSettingsRow,
} from '../../../../../lib/contractDraftRuleSettingsDb';
import { prisma } from '../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../lib/prismaApiError';

const RULE_ID = 'forgiveness';

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

    const payload = await getContractDraftRuleSettingsRow(draftId, RULE_ID);
    return NextResponse.json(payload ? normalizeRuleState(RULE_ID, payload) : null);
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
    const normalized = normalizeRuleState(RULE_ID, body);

    await upsertContractDraftRuleSettingsRow(draftId, RULE_ID, normalized as unknown as Prisma.InputJsonValue);
    await recordAuditLog({
      tenantId: session.tenantId,
      actorUserId: session.userId,
      actorName: getActorName(session),
      action: 'contract.forgiveness.update',
      entityType: 'contract_draft',
      entityId: draftId,
      entityLabel: `پیش‌نویس ${draftId}`,
      summary: `${getActorName(session)} تنظیمات بخشودگی قرارداد را ویرایش کرد.`,
      details: { ruleId: RULE_ID, active: normalized.active },
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
