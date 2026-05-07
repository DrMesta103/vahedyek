import { NextResponse } from 'next/server';
import { requireSessionContext } from '../../../../lib/auth';
import { getMembershipAccess } from '../../../../lib/access-control';
import { userCanClearApprovalReturnPending, userCanDecideApprovalOnContract } from '../../../../lib/contractApprovalAccess';
import { prisma } from '../../../../lib/prisma';
import {
  clearContractDraftApprovalReturnRaw,
  setContractDraftReturnForRevisionRaw,
} from '../../../../lib/contractDraftApprovalRaw';
import { fetchTenantApprovalProcessConfigRaw } from '../../../../lib/tenantApprovalProcessDb';
import { handlePrismaApiError } from '../../../../lib/prismaApiError';

const REASON_MIN = 15;
const REASON_MAX = 4000;

export async function POST(request: Request, context: { params: Promise<{ contractId: string }> }) {
  try {
    const session = await requireSessionContext();
    if (session instanceof NextResponse) return session;

    const { contractId } = await context.params;
    const body = (await request.json()) as { action?: string; reason?: string };

    const draft = await prisma.contractDraft.findFirst({
      where: { id: contractId, tenantId: session.tenantId },
      select: {
        id: true,
        subject: { include: { unit: true } },
      },
    });

    if (!draft) {
      return NextResponse.json({ message: 'قرارداد یافت نشد.' }, { status: 404 });
    }

    const access = await getMembershipAccess(session.userId, session.tenantId);
    const usage = draft.subject?.unit?.usage ?? null;
    const tenantCfg = await fetchTenantApprovalProcessConfigRaw(session.tenantId);

    if (body.action === 'clearReturnPending') {
      const clearOk = userCanClearApprovalReturnPending(access, {
        userId: session.userId,
        unitUsage: usage,
        approvalProcessConfig: tenantCfg,
      });
      if (!clearOk) {
        return NextResponse.json({ message: 'شما مجاز به آماده‌سازی مجدد برای فرایند تأیید نیستید.' }, { status: 403 });
      }

      await clearContractDraftApprovalReturnRaw(contractId, session.tenantId);
      return NextResponse.json({ ok: true });
    }

    if (body.action === 'returnForRevision') {
      const decideOk = userCanDecideApprovalOnContract({
        userId: session.userId,
        access,
        unitUsage: usage,
        approvalProcessConfig: tenantCfg,
      });
      if (!decideOk) {
        return NextResponse.json({ message: 'ثبت تأیید یا عدم تأیید فقط برای مالک کسب‌وکار یا تأییدکنندگان تعریف‌شده مجاز است.' }, { status: 403 });
      }

      const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
      if (reason.length < REASON_MIN) {
        return NextResponse.json(
          { message: `حداقل ${REASON_MIN} نویسه برای بیان علت عدم تأیید لازم است.` },
          { status: 400 },
        );
      }
      if (reason.length > REASON_MAX) {
        return NextResponse.json({ message: 'متن علت از حد مجاز بلندتر است.' }, { status: 400 });
      }

      await setContractDraftReturnForRevisionRaw(contractId, session.tenantId, reason);

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ message: 'عمل نامعتبر است.' }, { status: 400 });
  } catch (error) {
    return handlePrismaApiError(error);
  }
}
