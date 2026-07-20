import { NextResponse } from 'next/server';
import { Prisma } from '@/lib/prisma-client';
import { requireSessionContext } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/prisma';
import { handlePrismaApiError } from '../../../../../../lib/prismaApiError';
import { getContractDraftRuleSettingsRow, upsertContractDraftRuleSettingsRow } from '../../../../../../lib/contractDraftRuleSettingsDb';

async function getDraft(draftId: string, tenantId: string) {
  return prisma.contractDraft.findFirst({ where: { id: draftId, tenantId }, select: { id: true, approvalInstance: { select: { status: true } } } });
}

export async function GET(_: Request, { params }: { params: Promise<{ draftId: string; ruleId: string }> }) {
  try {
    const { draftId, ruleId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;
    const draft = await getDraft(draftId, session.tenantId);
    if (!draft) return NextResponse.json({ message: 'پیش‌نویس موردنظر پیدا نشد.' }, { status: 404 });
    return NextResponse.json(await getContractDraftRuleSettingsRow(draftId, ruleId));
  } catch (error) {
    return handlePrismaApiError(error);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ draftId: string; ruleId: string }> }) {
  try {
    const { draftId, ruleId } = await params;
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;
    const draft = await getDraft(draftId, session.tenantId);
    if (!draft) return NextResponse.json({ message: 'پیش‌نویس موردنظر پیدا نشد.' }, { status: 404 });
    if (draft.approvalInstance?.status === 'IN_REVIEW') {
      return NextResponse.json({ message: 'این پیش‌نویس در فرایند تأیید است و امکان ویرایش ندارد.' }, { status: 409 });
    }
    const body = await request.json();
    await upsertContractDraftRuleSettingsRow(draftId, ruleId, body as Prisma.InputJsonValue);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
