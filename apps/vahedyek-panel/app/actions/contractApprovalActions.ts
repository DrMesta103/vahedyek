'use server';

import { revalidatePath } from 'next/cache';
import type { ContractApprovalDecisionType, ContractApprovalInstanceStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { getSessionContext } from '../lib/auth';
import { getMembershipAccess, hasPermission } from '../lib/access-control';
import { normalizeApprovalUsageKey, type ApprovalUsageKey } from '../lib/contractApprovalAccess';
import { normalizeWorkflowSteps, type WorkflowStepDefinition } from '../lib/workflowTypes';
import {
  findStepIndexById,
  isStepApproveComplete,
  type DecisionRow,
} from '../lib/workflowRuntime';
import { resolveApprovalCapabilities } from '../lib/contractApprovalAccess';
import { clearContractDraftApprovalReturnRaw, setContractDraftReturnForRevisionRaw } from '../lib/contractDraftApprovalRaw';
import { isDraftReadyForApprovalGate } from '../lib/draftReadiness';

const REASON_MAX = 4000;

async function requireActiveTenantSession() {
  const session = await getSessionContext();
  if (!session?.tenantId || session.state !== 'active') {
    return { ok: false as const, message: 'برای ادامه باید وارد شوید.' };
  }
  return { ok: true as const, tenantId: session.tenantId, userId: session.userId };
}

async function pickWorkflow(tenantId: string, usage: ApprovalUsageKey) {
  return prisma.approvalWorkflow.findFirst({
    where: { tenantId, active: true, usageTypes: { has: usage } },
    orderBy: { updatedAt: 'desc' },
  });
}

function snapshotSteps(json: unknown): WorkflowStepDefinition[] {
  return normalizeWorkflowSteps(json);
}

export async function getContractApprovalStateAction(draftId: string) {
  const s = await requireActiveTenantSession();
  if (!s.ok) return { ok: false, message: s.message, state: null };

  const draft = await prisma.contractDraft.findFirst({
    where: { id: draftId, tenantId: s.tenantId },
    include: { subject: { include: { unit: true } }, approvalInstance: { include: { decisions: true, workflow: true } } },
  });
  if (!draft) return { ok: false, message: 'قرارداد یافت نشد.', state: null };

  const usage = normalizeApprovalUsageKey(draft.subject?.unit?.usage ?? null);
  const inst = draft.approvalInstance;

  const access = await getMembershipAccess(s.userId, s.tenantId);
  const hasUpdate = hasPermission(access, 'contracts.update');

  if (!inst) {
    return {
      ok: true,
      state: {
        mode: 'no_instance' as const,
        usage,
        buyerShouldApprove: usage ? (await pickWorkflow(s.tenantId, usage))?.buyerShouldApprove ?? true : true,
        canSubmitWorkflow: Boolean(access?.isOwner || hasUpdate),
      },
    };
  }

  const steps = snapshotSteps(inst.stepsSnapshot);
  const decisions: DecisionRow[] = inst.decisions.map((d) => ({
    stepId: d.stepId,
    approverUserId: d.approverUserId,
    decision: d.decision,
  }));

  const currentStep = steps[inst.currentStepIndex] ?? null;
  const effectiveFinalApproverUserId = inst.finalApproverUserId ?? inst.workflow.finalApproverUserId ?? null;
  const isViewerWorkflowFinalApprover = Boolean(effectiveFinalApproverUserId) && effectiveFinalApproverUserId === s.userId;
  const isViewerCurrentStepApprover = Boolean(currentStep && currentStep.approvers.includes(s.userId));
  const currentStepFinalApproverUserId = currentStep?.finalApproverId ?? null;
  const isViewerCurrentStepFinalApprover = Boolean(currentStepFinalApproverUserId) && currentStepFinalApproverUserId === s.userId;
  const caps = resolveApprovalCapabilities({
    userId: s.userId,
    isOwner: Boolean(access?.isOwner),
    hasContractsUpdate: hasUpdate,
    instanceStatus: inst.status,
    currentStep,
    decisions,
    workflowFinalApproverUserId: effectiveFinalApproverUserId,
  });
  const viewerHasDecidedCurrentStep = Boolean(
    currentStep && decisions.some((d) => d.stepId === currentStep.id && d.approverUserId === s.userId),
  );

  const relatedUserIds = new Set<string>();
  for (const st of steps) {
    for (const uid of st.approvers) relatedUserIds.add(uid);
    if (st.finalApproverId) relatedUserIds.add(st.finalApproverId);
  }
  for (const d of inst.decisions) relatedUserIds.add(d.approverUserId);
  if (effectiveFinalApproverUserId) relatedUserIds.add(effectiveFinalApproverUserId);
  relatedUserIds.add(s.userId);

  const userRows = await prisma.userTenantMembership.findMany({
    where: { tenantId: s.tenantId, userId: { in: Array.from(relatedUserIds) } },
    include: { user: { select: { id: true, fullName: true, firstName: true, lastName: true, mobile: true } } },
  });
  const userMap = Object.fromEntries(
    userRows.map((m) => [
      m.user.id,
      m.user.fullName || `${m.user.firstName} ${m.user.lastName}`.trim() || m.user.mobile || m.user.id,
    ]),
  ) as Record<string, string>;

  return {
    ok: true,
    state: {
      mode: 'instance' as const,
      instanceId: inst.id,
      status: inst.status,
      workflowTitle: inst.workflow.title,
      currentStepIndex: inst.currentStepIndex,
      workflowFinalApproverUserId: effectiveFinalApproverUserId,
      isViewerWorkflowFinalApprover,
      isViewerCurrentStepApprover,
      currentStepFinalApproverUserId,
      isViewerCurrentStepFinalApprover,
      steps: steps.map((st) => ({
        id: st.id,
        title: st.title,
        type: st.type,
        approvers: st.approvers,
        logic: st.logic,
        isFinal: st.isFinal,
      })),
      decisions: inst.decisions.map((d) => ({
        id: d.id,
        stepId: d.stepId,
        approverUserId: d.approverUserId,
        decision: d.decision,
        reason: d.reason,
        createdAt: d.createdAt.toISOString(),
      })),
      currentStep: currentStep
        ? { id: currentStep.id, title: currentStep.title, type: currentStep.type, approvers: currentStep.approvers }
        : null,
      capabilities: caps,
      viewerHasDecidedCurrentStep,
      userMap,
      usage,
    },
  };
}

export async function submitContractApprovalWorkflowAction(draftId: string) {
  const s = await requireActiveTenantSession();
  if (!s.ok) return { ok: false, message: s.message };

  const access = await getMembershipAccess(s.userId, s.tenantId);
  if (!access?.isOwner && !hasPermission(access, 'contracts.update')) {
    return { ok: false, message: 'شما مجاز به ارسال قرارداد به فرایند تأیید نیستید.' };
  }

  const draft = await prisma.contractDraft.findFirst({
    where: { id: draftId, tenantId: s.tenantId },
    include: {
      subject: { include: { unit: true } },
      approvalInstance: true,
      parties: { include: { members: true } },
      financial: true,
      penalties: { include: { types: true, rules: true } },
      terminationRules: true,
      extraCosts: true,
      technicalSpecs: true,
      attachments: true,
    },
  });
  if (!draft) return { ok: false, message: 'قرارداد یافت نشد.' };

  const usageKey = normalizeApprovalUsageKey(draft.subject?.unit?.usage ?? null);
  if (!usageKey) return { ok: false, message: 'نوع کاربری واحد برای انتخاب فرایند تأیید نامعتبر است.' };

  const wf = await pickWorkflow(s.tenantId, usageKey);
  if (!wf) return { ok: false, message: 'برای این نوع کاربری هیچ فرایند تأیید فعالی تعریف نشده است.' };

  const steps = snapshotSteps(wf.steps);
  if (!steps.length) return { ok: false, message: 'فرایند تأیید انتخاب‌شده مرحله‌ای ندارد.' };
  for (const st of steps) {
    if (!st.approvers.length) {
      return {
        ok: false,
        message: `فرایند «${wf.title}» ناقص است؛ در تنظیمات فرایند تأیید برای هر مرحله حداقل یک تأییدکننده انتخاب کنید.`,
      };
    }
  }

  const existing = draft.approvalInstance;

  if (existing?.status === 'APPROVED') {
    return { ok: false, message: 'این قرارداد قبلاً تأیید نهایی شده است.' };
  }

  if (existing?.status === 'IN_REVIEW') {
    return { ok: true, message: 'قرارداد هم‌اکنون در فرایند تأیید است.' };
  }

  // بازگشت از اصلاح یا رد
  if (existing && (existing.status === 'REVISION_REQUESTED' || existing.status === 'REJECTED_TO_DRAFT')) {
    const resumeIdx = existing.revisionResumeStepIndex ?? 0;
    await prisma.$transaction(async (tx) => {
      await tx.contractApprovalDecision.deleteMany({ where: { instanceId: existing.id } });
      await tx.contractApprovalInstance.update({
        where: { id: existing.id },
        data: {
          status: 'IN_REVIEW',
          currentStepIndex: Math.min(resumeIdx, steps.length - 1),
          finalApproverUserId: wf.finalApproverUserId ?? null,
          stepsSnapshot: steps as unknown as object[],
          workflowId: wf.id,
          revisionResumeStepIndex: null,
        },
      });
      await tx.contractDraft.update({
        where: { id: draftId },
        data: { releasedFromApprovedForEdit: false },
      });
    });
    await clearContractDraftApprovalReturnRaw(draftId, s.tenantId);
    revalidatePath(`/contracts/${draftId}`);
    revalidatePath('/contracts');
    return { ok: true };
  }

  if (existing) {
    return { ok: false, message: 'وضعیت فرایند تأیید نامعتبر است.' };
  }

  if (!isDraftReadyForApprovalGate(draft)) {
    return { ok: false, message: 'پیش‌نویس هنوز برای ارسال به فرایند تأیید کامل نیست.' };
  }

  await prisma.$transaction(async (tx) => {
    await tx.contractApprovalInstance.create({
      data: {
        tenantId: s.tenantId,
        draftId,
        workflowId: wf.id,
        status: 'IN_REVIEW',
        currentStepIndex: 0,
        finalApproverUserId: wf.finalApproverUserId ?? null,
        stepsSnapshot: steps as unknown as object[],
      },
    });
    await tx.contractDraft.update({
      where: { id: draftId },
      data: { releasedFromApprovedForEdit: false },
    });
  });

  revalidatePath(`/contracts/${draftId}`);
  revalidatePath('/contracts');
  return { ok: true };
}

/** پس از تأیید نهایی: حذف نمونهٔ workflow تا قرارداد به‌عنوان پیش‌نویس قابل ویرایش شود و برای نهایی شدن دوباره باید به فرایند تأیید برود. */
export async function reopenApprovedContractForEditAction(draftId: string) {
  const s = await requireActiveTenantSession();
  if (!s.ok) return { ok: false as const, message: s.message };

  const access = await getMembershipAccess(s.userId, s.tenantId);
  if (!access?.isOwner && !hasPermission(access, 'contracts.update')) {
    return { ok: false as const, message: 'شما مجاز به ویرایش این قرارداد نیستید.' };
  }

  const draft = await prisma.contractDraft.findFirst({
    where: { id: draftId, tenantId: s.tenantId },
    select: {
      id: true,
      approvalInstance: { select: { id: true, status: true } },
    },
  });
  if (!draft) return { ok: false as const, message: 'قرارداد یافت نشد.' };
  if (draft.approvalInstance?.status !== 'APPROVED') {
    return { ok: false as const, message: 'فقط برای قراردادهای تأیید نهایی‌شده قابل انجام است.' };
  }

  const instanceId = draft.approvalInstance.id;

  await prisma.$transaction(async (tx) => {
    await tx.contractApprovalInstance.delete({ where: { id: instanceId } });
    await tx.contractDraft.update({
      where: { id: draftId },
      data: { releasedFromApprovedForEdit: true },
    });
  });

  revalidatePath(`/contracts/${draftId}`);
  revalidatePath('/contracts');
  return { ok: true as const };
}

export async function recordContractApprovalDecisionAction(
  draftId: string,
  body: {
    decision: ContractApprovalDecisionType;
    reason?: string;
  },
) {
  const s = await requireActiveTenantSession();
  if (!s.ok) return { ok: false, message: s.message };

  const access = await getMembershipAccess(s.userId, s.tenantId);
  const hasUpdate = hasPermission(access, 'contracts.update');

  const inst = await prisma.contractApprovalInstance.findFirst({
    where: { draftId, tenantId: s.tenantId },
    include: { decisions: true, workflow: true },
  });
  if (!inst) return { ok: false, message: 'فرایند تأییدی برای این قرارداد شروع نشده است.' };
  if (inst.status !== 'IN_REVIEW') return { ok: false, message: 'در این وضعیت امکان ثبت رأی نیست.' };

  const effectiveFinalApproverUserId = inst.finalApproverUserId ?? inst.workflow.finalApproverUserId ?? null;
  if (!inst.finalApproverUserId && effectiveFinalApproverUserId) {
    // Backfill snapshot on first interaction to keep behavior deterministic.
    await prisma.contractApprovalInstance.update({
      where: { id: inst.id },
      data: { finalApproverUserId: effectiveFinalApproverUserId },
    });
  }

  const steps = snapshotSteps(inst.stepsSnapshot);
  const currentStep = steps[inst.currentStepIndex];
  if (!currentStep) return { ok: false, message: 'مرحلهٔ جاری نامعتبر است.' };

  const decisions: DecisionRow[] = inst.decisions.map((d) => ({
    stepId: d.stepId,
    approverUserId: d.approverUserId,
    decision: d.decision,
  }));
  const alreadyDecidedThisStep = decisions.some((d) => d.stepId === currentStep.id && d.approverUserId === s.userId);
  if (alreadyDecidedThisStep) {
    return { ok: false, message: 'شما قبلاً در این مرحله رأی داده‌اید و امکان ثبت مجدد وجود ندارد.' };
  }

  const isWorkflowFinalApprover = Boolean(effectiveFinalApproverUserId) && effectiveFinalApproverUserId === s.userId;

  const caps = resolveApprovalCapabilities({
    userId: s.userId,
    isOwner: Boolean(access?.isOwner),
    hasContractsUpdate: hasUpdate,
    instanceStatus: inst.status,
    currentStep,
    decisions,
    workflowFinalApproverUserId: effectiveFinalApproverUserId,
  });

  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

  if (body.decision === 'APPROVE') {
    if (!caps.canApprove) return { ok: false, message: 'شما مجاز به تأیید این مرحله نیستید.' };
    await prisma.contractApprovalDecision.create({
      data: {
        instanceId: inst.id,
        stepId: currentStep.id,
        approverUserId: s.userId,
        decision: 'APPROVE',
      },
    });
    if (isWorkflowFinalApprover) {
      await prisma.contractApprovalInstance.update({
        where: { id: inst.id },
        data: { status: 'APPROVED' as ContractApprovalInstanceStatus },
      });
      revalidatePath(`/contracts/${draftId}`);
      revalidatePath('/contracts');
      return { ok: true };
    }
    const nextDecisions: DecisionRow[] = [
      ...decisions,
      { stepId: currentStep.id, approverUserId: s.userId, decision: 'APPROVE' },
    ];
    if (!isStepApproveComplete(currentStep, nextDecisions)) {
      revalidatePath(`/contracts/${draftId}`);
      return { ok: true };
    }

    const isLastIndex = inst.currentStepIndex >= steps.length - 1;
    const treatAsFinal = Boolean(currentStep.isFinal) || isLastIndex;

    if (treatAsFinal) {
      await prisma.contractApprovalInstance.update({
        where: { id: inst.id },
        data: { status: 'APPROVED' as ContractApprovalInstanceStatus },
      });
    } else {
      await prisma.contractApprovalInstance.update({
        where: { id: inst.id },
        data: { currentStepIndex: inst.currentStepIndex + 1 },
      });
    }
    revalidatePath(`/contracts/${draftId}`);
    revalidatePath('/contracts');
    return { ok: true };
  }

  if (body.decision === 'REQUEST_REVISION') {
    if (!caps.canRequestRevision) return { ok: false, message: 'شما مجاز به درخواست اصلاح نیستید.' };
    if (reason.length > REASON_MAX) return { ok: false, message: 'متن علت طولانی است.' };
    // Product rule: "اصلاحیه و رد" only records a decision.
    // It MUST NOT change the workflow/contract status or return the draft to edit mode.
    await prisma.contractApprovalDecision.create({
      data: {
        instanceId: inst.id,
        stepId: currentStep.id,
        approverUserId: s.userId,
        decision: 'REQUEST_REVISION',
        reason,
      },
    });
    revalidatePath(`/contracts/${draftId}`);
    revalidatePath('/contracts');
    return { ok: true };
  }

  if (body.decision === 'REJECT_TO_DRAFT') {
    if (!caps.canRejectToDraft) return { ok: false, message: 'شما مجاز به رد کامل نیستید.' };
    if (reason.length > REASON_MAX) return { ok: false, message: 'متن علت طولانی است.' };

    await prisma.$transaction(async (tx) => {
      await tx.contractApprovalDecision.create({
        data: {
          instanceId: inst.id,
          stepId: currentStep.id,
          approverUserId: s.userId,
          decision: 'REJECT_TO_DRAFT',
          reason,
        },
      });
      await tx.contractApprovalInstance.update({
        where: { id: inst.id },
        data: {
          status: 'REJECTED_TO_DRAFT',
          revisionResumeStepIndex: 0,
        },
      });
    });
    await setContractDraftReturnForRevisionRaw(draftId, s.tenantId, reason);
    revalidatePath(`/contracts/${draftId}`);
    revalidatePath('/contracts');
    return { ok: true };
  }

  return { ok: false, message: 'نوع تصمیم نامعتبر است.' };
}

export async function revokeContractApprovalDecisionAction(draftId: string) {
  const s = await requireActiveTenantSession();
  if (!s.ok) return { ok: false, message: s.message };

  const inst = await prisma.contractApprovalInstance.findFirst({
    where: { draftId, tenantId: s.tenantId },
    include: { decisions: true },
  });
  if (!inst) return { ok: false, message: 'فرایند تأییدی برای این قرارداد شروع نشده است.' };
  if (inst.status !== 'IN_REVIEW') return { ok: false, message: 'در این وضعیت امکان حذف رأی نیست.' };

  const steps = snapshotSteps(inst.stepsSnapshot);
  const currentStep = steps[inst.currentStepIndex];
  if (!currentStep) return { ok: false, message: 'مرحلهٔ جاری نامعتبر است.' };

  const decision = inst.decisions.find((d) => d.stepId === currentStep.id && d.approverUserId === s.userId);
  if (!decision) return { ok: false, message: 'برای حذف، رأیی از شما در مرحلهٔ جاری یافت نشد.' };

  await prisma.contractApprovalDecision.delete({ where: { id: decision.id } });

  revalidatePath(`/contracts/${draftId}`);
  revalidatePath('/contracts');
  return { ok: true };
}

/** همان رفتار legacy: پاک‌کردن پرچم بازگشت قبل از ارسال مجدد */
export async function clearContractApprovalReturnPendingAction(draftId: string) {
  const s = await requireActiveTenantSession();
  if (!s.ok) return { ok: false, message: s.message };

  const draft = await prisma.contractDraft.findFirst({
    where: { id: draftId, tenantId: s.tenantId },
    include: { subject: { include: { unit: true } } },
  });
  if (!draft) return { ok: false, message: 'قرارداد یافت نشد.' };

  const access = await getMembershipAccess(s.userId, s.tenantId);
  const usage = draft.subject?.unit?.usage ?? null;
  const inst = await prisma.contractApprovalInstance.findFirst({ where: { draftId, tenantId: s.tenantId } });
  const steps = inst ? snapshotSteps(inst.stepsSnapshot) : [];
  const currentStep = inst ? steps[inst.currentStepIndex] ?? null : null;
  const decisions: DecisionRow[] =
    inst?.id && inst.status === 'IN_REVIEW'
      ? (
          await prisma.contractApprovalDecision.findMany({ where: { instanceId: inst.id } })
        ).map((d) => ({
          stepId: d.stepId,
          approverUserId: d.approverUserId,
          decision: d.decision,
        }))
      : [];

  const allowed =
    access?.isOwner ||
    hasPermission(access, 'contracts.update') ||
    (currentStep?.approvers.includes(s.userId) ?? false);
  if (!allowed) return { ok: false, message: 'شما مجاز به این عمل نیستید.' };

  await clearContractDraftApprovalReturnRaw(draftId, s.tenantId);
  revalidatePath(`/contracts/${draftId}`);
  return { ok: true };
}
