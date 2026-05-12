import { prisma } from './prisma';
import { getMembershipAccess, hasPermission } from './access-control';
import { normalizeApprovalUsageKey, resolveApprovalCapabilities, type ApprovalUsageKey } from './contractApprovalAccess';
import { normalizeWorkflowSteps, type WorkflowStepDefinition } from './workflowTypes';
import { recordAuditLog } from './audit-log';
import { findStepIndexById, isStepApproveComplete, type DecisionRow } from './workflowRuntime';

export async function pickApprovalWorkflowForAppendix(tenantId: string, usage: ApprovalUsageKey) {
  return prisma.approvalWorkflow.findFirst({
    where: { tenantId, active: true, usageTypes: { has: usage } },
    orderBy: { updatedAt: 'desc' },
  });
}

export function snapshotWorkflowSteps(json: unknown): WorkflowStepDefinition[] {
  return normalizeWorkflowSteps(json);
}

export async function loadAppendixApprovalContext(tenantId: string, appendixId: string) {
  return prisma.contractAppendix.findFirst({
    where: { id: appendixId, tenantId },
    include: {
      draft: { include: { subject: { include: { unit: true } } } },
      approvalInstance: { include: { decisions: true, workflow: true } },
    },
  });
}

export async function submitAppendixApprovalWorkflow(params: { tenantId: string; userId: string; actorName: string; appendixId: string }) {
  const access = await getMembershipAccess(params.userId, params.tenantId);
  if (!access?.isOwner && !hasPermission(access, 'contracts.update')) {
    return { ok: false as const, message: 'شما مجاز به ارسال متمم به فرایند تایید نیستید.' };
  }

  const appendix = await loadAppendixApprovalContext(params.tenantId, params.appendixId);
  if (!appendix) return { ok: false as const, message: 'متمم یافت نشد.' };
  if (appendix.status === 'APPROVED') return { ok: false as const, message: 'این متمم قبلاً تایید نهایی شده است.' };
  if (appendix.approvalInstance?.status === 'IN_REVIEW') return { ok: true as const, message: 'متمم هم‌اکنون در فرایند تایید است.' };

  const usageKey = normalizeApprovalUsageKey(appendix.draft.subject?.unit?.usage ?? null);
  if (!usageKey) return { ok: false as const, message: 'نوع کاربری واحد برای فرایند تایید نامعتبر است.' };

  const workflow = await pickApprovalWorkflowForAppendix(params.tenantId, usageKey);
  if (!workflow) return { ok: false as const, message: 'برای این نوع کاربری هیچ فرایند تایید فعالی تعریف نشده است.' };

  const steps = snapshotWorkflowSteps(workflow.steps);
  if (!steps.length) return { ok: false as const, message: 'فرایند تایید انتخاب‌شده مرحله‌ای ندارد.' };

  const existing = appendix.approvalInstance;
  if (existing && (existing.status === 'REVISION_REQUESTED' || existing.status === 'REJECTED_TO_DRAFT')) {
    const resumeIdx = existing.revisionResumeStepIndex ?? 0;
    await prisma.$transaction(async (tx) => {
      await tx.contractAppendixApprovalDecision.deleteMany({ where: { instanceId: existing.id } });
      await tx.contractAppendixApprovalInstance.update({
        where: { id: existing.id },
        data: {
          status: 'IN_REVIEW',
          currentStepIndex: Math.min(resumeIdx, steps.length - 1),
          finalApproverUserId: workflow.finalApproverUserId ?? null,
          stepsSnapshot: steps as unknown as object[],
          workflowId: workflow.id,
          revisionResumeStepIndex: null,
        },
      });
      await tx.contractAppendix.update({
        where: { id: appendix.id },
        data: {
          status: 'IN_REVIEW',
          approvalReturnedPending: false,
          approvalLastRejectedAt: null,
          approvalLastRejectionReason: null,
        },
      });
    });
  } else if (!existing) {
    await prisma.$transaction(async (tx) => {
      await tx.contractAppendixApprovalInstance.create({
        data: {
          tenantId: params.tenantId,
          appendixId: appendix.id,
          workflowId: workflow.id,
          status: 'IN_REVIEW',
          currentStepIndex: 0,
          finalApproverUserId: workflow.finalApproverUserId ?? null,
          stepsSnapshot: steps as unknown as object[],
        },
      });
      await tx.contractAppendix.update({
        where: { id: appendix.id },
        data: { status: 'IN_REVIEW', approvalReturnedPending: false, approvalLastRejectedAt: null, approvalLastRejectionReason: null },
      });
    });
  } else {
    return { ok: false as const, message: 'وضعیت فرایند تایید متمم نامعتبر است.' };
  }

  await recordAuditLog({
    tenantId: params.tenantId,
    actorUserId: params.userId,
    actorName: params.actorName,
    action: 'appendix.approval.submit',
    entityType: 'contract_appendix',
    entityId: appendix.id,
    entityLabel: `متمم ${appendix.appendixNumber}`,
    summary: 'ارسال متمم به فرایند تایید',
  });

  return { ok: true as const };
}

export async function getAppendixApprovalState(params: { tenantId: string; userId: string; appendixId: string }) {
  const appendix = await loadAppendixApprovalContext(params.tenantId, params.appendixId);
  if (!appendix) return { ok: false as const, message: 'متمم یافت نشد.', state: null };

  const usage = normalizeApprovalUsageKey(appendix.draft.subject?.unit?.usage ?? null);
  const inst = appendix.approvalInstance;
  const access = await getMembershipAccess(params.userId, params.tenantId);
  const hasUpdate = hasPermission(access, 'contracts.update');

  if (!inst) {
    return {
      ok: true as const,
      state: {
        mode: 'no_instance' as const,
        usage,
        canSubmitWorkflow: Boolean(access?.isOwner || hasUpdate),
      },
    };
  }

  const steps = snapshotWorkflowSteps(inst.stepsSnapshot);
  const decisions: DecisionRow[] = inst.decisions.map((d) => ({
    stepId: d.stepId,
    approverUserId: d.approverUserId,
    decision: d.decision,
  }));
  const currentStep = steps[inst.currentStepIndex] ?? null;
  const effectiveFinalApproverUserId = inst.finalApproverUserId ?? inst.workflow.finalApproverUserId ?? null;
  const caps = resolveApprovalCapabilities({
    userId: params.userId,
    isOwner: Boolean(access?.isOwner),
    hasContractsUpdate: hasUpdate,
    instanceStatus: inst.status,
    currentStep,
    decisions,
    workflowFinalApproverUserId: effectiveFinalApproverUserId,
  });

  const relatedUserIds = new Set<string>();
  for (const st of steps) {
    for (const uid of st.approvers) relatedUserIds.add(uid);
    if (st.finalApproverId) relatedUserIds.add(st.finalApproverId);
  }
  for (const d of inst.decisions) relatedUserIds.add(d.approverUserId);
  if (effectiveFinalApproverUserId) relatedUserIds.add(effectiveFinalApproverUserId);
  relatedUserIds.add(params.userId);

  const userRows = await prisma.userTenantMembership.findMany({
    where: { tenantId: params.tenantId, userId: { in: Array.from(relatedUserIds) } },
    include: { user: { select: { id: true, fullName: true, firstName: true, lastName: true, mobile: true } } },
  });
  const userMap = Object.fromEntries(
    userRows.map((m) => [m.user.id, m.user.fullName || `${m.user.firstName} ${m.user.lastName}`.trim() || m.user.mobile || m.user.id]),
  ) as Record<string, string>;

  return {
    ok: true as const,
    state: {
      mode: 'instance' as const,
      instanceId: inst.id,
      status: inst.status,
      workflowTitle: inst.workflow.title,
      currentStepIndex: inst.currentStepIndex,
      workflowFinalApproverUserId: effectiveFinalApproverUserId,
      isViewerWorkflowFinalApprover: Boolean(effectiveFinalApproverUserId) && effectiveFinalApproverUserId === params.userId,
      isViewerCurrentStepApprover: Boolean(currentStep && currentStep.approvers.includes(params.userId)),
      currentStepFinalApproverUserId: currentStep?.finalApproverId ?? null,
      isViewerCurrentStepFinalApprover: Boolean(currentStep?.finalApproverId) && currentStep?.finalApproverId === params.userId,
      steps: steps.map((st) => ({ id: st.id, title: st.title, type: st.type, approvers: st.approvers, logic: st.logic, isFinal: st.isFinal })),
      decisions: inst.decisions.map((d) => ({
        id: d.id,
        stepId: d.stepId,
        approverUserId: d.approverUserId,
        decision: d.decision,
        reason: d.reason,
        createdAt: d.createdAt.toISOString(),
      })),
      currentStep: currentStep ? { id: currentStep.id, title: currentStep.title, type: currentStep.type, approvers: currentStep.approvers } : null,
      capabilities: caps,
      viewerHasDecidedCurrentStep: Boolean(currentStep && decisions.some((d) => d.stepId === currentStep.id && d.approverUserId === params.userId)),
      userMap,
      usage,
    },
  };
}

export async function recordAppendixApprovalDecision(params: {
  tenantId: string;
  userId: string;
  actorName: string;
  appendixId: string;
  decision: 'APPROVE' | 'REQUEST_REVISION' | 'REJECT_TO_DRAFT';
  reason?: string;
}) {
  const appendix = await loadAppendixApprovalContext(params.tenantId, params.appendixId);
  if (!appendix || !appendix.approvalInstance) return { ok: false as const, message: 'متمم یا فرایند تایید آن یافت نشد.' };

  const inst = appendix.approvalInstance;
  if (inst.status !== 'IN_REVIEW') return { ok: false as const, message: 'این متمم در مرحله تصمیم‌گیری نیست.' };
  const steps = snapshotWorkflowSteps(inst.stepsSnapshot);
  const currentStep = steps[inst.currentStepIndex] ?? null;
  if (!currentStep) return { ok: false as const, message: 'مرحله جاری فرایند یافت نشد.' };

  const access = await getMembershipAccess(params.userId, params.tenantId);
  const caps = resolveApprovalCapabilities({
    userId: params.userId,
    isOwner: Boolean(access?.isOwner),
    hasContractsUpdate: hasPermission(access, 'contracts.update'),
    instanceStatus: inst.status,
    currentStep,
    decisions: inst.decisions.map((d) => ({ stepId: d.stepId, approverUserId: d.approverUserId, decision: d.decision })),
    workflowFinalApproverUserId: inst.finalApproverUserId ?? inst.workflow.finalApproverUserId ?? null,
  });
  if (params.decision === 'APPROVE' && !caps.canApprove) return { ok: false as const, message: 'شما مجاز به تایید این متمم نیستید.' };
  if (params.decision === 'REQUEST_REVISION' && !caps.canRequestRevision) return { ok: false as const, message: 'شما مجاز به درخواست اصلاح این متمم نیستید.' };
  if (params.decision === 'REJECT_TO_DRAFT' && !caps.canRejectToDraft) return { ok: false as const, message: 'شما مجاز به رد این متمم نیستید.' };

  const existingDecision = inst.decisions.find((d) => d.stepId === currentStep.id && d.approverUserId === params.userId);
  if (existingDecision) return { ok: false as const, message: 'رأی شما در این مرحله قبلاً ثبت شده است.' };

  const stepsDecisions = inst.decisions.map((d) => ({ stepId: d.stepId, approverUserId: d.approverUserId, decision: d.decision }));

  await prisma.$transaction(async (tx) => {
    await tx.contractAppendixApprovalDecision.create({
      data: {
        instanceId: inst.id,
        stepId: currentStep.id,
        approverUserId: params.userId,
        decision: params.decision,
        reason: params.reason?.trim() || null,
      },
    });

    if (params.decision === 'REQUEST_REVISION') {
      await tx.contractAppendixApprovalInstance.update({
        where: { id: inst.id },
        data: {
          status: 'REVISION_REQUESTED',
          revisionResumeStepIndex: inst.currentStepIndex,
        },
      });
      await tx.contractAppendix.update({
        where: { id: appendix.id },
        data: {
          status: 'DRAFT',
          approvalReturnedPending: true,
          approvalLastRejectedAt: new Date(),
          approvalLastRejectionReason: params.reason?.trim() || null,
        },
      });
      return;
    }

    if (params.decision === 'REJECT_TO_DRAFT') {
      await tx.contractAppendixApprovalInstance.update({
        where: { id: inst.id },
        data: {
          status: 'REJECTED_TO_DRAFT',
          revisionResumeStepIndex: 0,
        },
      });
      await tx.contractAppendix.update({
        where: { id: appendix.id },
        data: {
          status: 'DRAFT',
          approvalReturnedPending: true,
          approvalLastRejectedAt: new Date(),
          approvalLastRejectionReason: params.reason?.trim() || null,
        },
      });
      return;
    }

    const updatedDecisions = [...stepsDecisions, { stepId: currentStep.id, approverUserId: params.userId, decision: 'APPROVE' as const }];
    const currentStepDecisions = updatedDecisions.filter((d) => d.stepId === currentStep.id);
    const currentStepApproved = isStepApproveComplete(
      currentStep,
      currentStepDecisions.map((d) => ({
        stepId: currentStep.id,
        approverUserId: d.approverUserId,
        decision: d.decision,
      })),
    );

    if (!currentStepApproved) return;

    const nextStepIndex = findStepIndexById(steps, currentStep.id) + 1;
    const workflowFinalApproverUserId = inst.finalApproverUserId ?? inst.workflow.finalApproverUserId ?? null;
    const forceApproveByWorkflowFinalApprover =
      Boolean(workflowFinalApproverUserId) && workflowFinalApproverUserId === params.userId;
    if (nextStepIndex >= steps.length || forceApproveByWorkflowFinalApprover) {
      await tx.contractAppendixApprovalInstance.update({
        where: { id: inst.id },
        data: { status: 'APPROVED' },
      });
      await tx.contractAppendix.update({
        where: { id: appendix.id },
        data: {
          status: 'APPROVED',
          approvalReturnedPending: false,
          approvalLastRejectedAt: null,
          approvalLastRejectionReason: null,
        },
      });
      return;
    }

    await tx.contractAppendixApprovalInstance.update({
      where: { id: inst.id },
      data: { currentStepIndex: nextStepIndex },
    });
  });

  await recordAuditLog({
    tenantId: params.tenantId,
    actorUserId: params.userId,
    actorName: params.actorName,
    action: 'appendix.approval.decision',
    entityType: 'contract_appendix',
    entityId: appendix.id,
    entityLabel: `متمم ${appendix.appendixNumber}`,
    summary: 'ثبت تصمیم تایید متمم',
    details: { decision: params.decision, reason: params.reason ?? null },
  });

  return { ok: true as const };
}

export async function revokeAppendixApprovalDecision(params: { tenantId: string; userId: string; appendixId: string }) {
  const appendix = await loadAppendixApprovalContext(params.tenantId, params.appendixId);
  if (!appendix?.approvalInstance) return { ok: false as const, message: 'فرایند تایید متمم یافت نشد.' };
  const inst = appendix.approvalInstance;
  const steps = snapshotWorkflowSteps(inst.stepsSnapshot);
  const currentStep = steps[inst.currentStepIndex] ?? null;
  if (!currentStep) return { ok: false as const, message: 'مرحله جاری یافت نشد.' };
  const decision = inst.decisions.find((d) => d.stepId === currentStep.id && d.approverUserId === params.userId);
  if (!decision) return { ok: false as const, message: 'رأی قابل حذفی برای شما ثبت نشده است.' };
  await prisma.contractAppendixApprovalDecision.delete({ where: { id: decision.id } });
  return { ok: true as const };
}
