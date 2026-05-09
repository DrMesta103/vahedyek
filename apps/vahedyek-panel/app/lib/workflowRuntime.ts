import type { ContractApprovalDecisionType } from '@prisma/client';
import type { WorkflowStepDefinition } from './workflowTypes';
import { approverAllowedForPermission } from './workflowTypes';

export type DecisionRow = {
  stepId: string;
  approverUserId: string;
  decision: ContractApprovalDecisionType;
};

export function getStepAtIndex(steps: WorkflowStepDefinition[], index: number): WorkflowStepDefinition | null {
  if (index < 0 || index >= steps.length) return null;
  return steps[index] ?? null;
}

function approvalsForStep(stepId: string, decisions: DecisionRow[]): DecisionRow[] {
  return decisions.filter((d) => d.stepId === stepId && d.decision === 'APPROVE');
}

function hasFinalApproval(step: WorkflowStepDefinition, decisions: DecisionRow[]): boolean {
  const fid = step.finalApproverId ?? null;
  if (!fid) return false;
  return approvalsForStep(step.id, decisions).some((d) => d.approverUserId === fid);
}

/** در حالت سری: چه کسی نوبت تأیید دارد؟ */
export function getSequentialPendingApproverId(step: WorkflowStepDefinition, decisions: DecisionRow[]): string | null {
  const approvedUserIds = new Set(approvalsForStep(step.id, decisions).map((d) => d.approverUserId));
  for (const uid of step.approvers) {
    if (!approvedUserIds.has(uid)) return uid;
  }
  return null;
}

export function countDistinctApprovals(stepId: string, decisions: DecisionRow[]): number {
  const set = new Set(approvalsForStep(stepId, decisions).map((d) => d.approverUserId));
  return set.size;
}

export function isStepApproveComplete(step: WorkflowStepDefinition, decisions: DecisionRow[]): boolean {
  if (hasFinalApproval(step, decisions)) return true;
  if (step.type === 'SEQUENTIAL') {
    return getSequentialPendingApproverId(step, decisions) === null;
  }
  // PARALLEL
  const n = countDistinctApprovals(step.id, decisions);
  if (step.logic.mode === 'ALL_MUST_APPROVE') {
    return step.approvers.every((uid) => approvalsForStep(step.id, decisions).some((d) => d.approverUserId === uid));
  }
  return n >= step.logic.count;
}

export function canUserApproveStep(
  userId: string,
  step: WorkflowStepDefinition,
  decisions: DecisionRow[],
): boolean {
  if (!step.approvers.includes(userId)) return false;
  if (step.finalApproverId && userId === step.finalApproverId) {
    const already = approvalsForStep(step.id, decisions).some((d) => d.approverUserId === userId);
    if (already) return false;
    if (isStepApproveComplete(step, decisions)) return false;
    return true;
  }
  if (step.type === 'SEQUENTIAL') {
    const next = getSequentialPendingApproverId(step, decisions);
    return next === userId;
  }
  // parallel: هر تأییدکننده‌ای که هنوز تأیید نکرده
  const already = approvalsForStep(step.id, decisions).some((d) => d.approverUserId === userId);
  if (already) return false;
  if (isStepApproveComplete(step, decisions)) return false;
  return true;
}

export function canUserRejectToDraft(userId: string, step: WorkflowStepDefinition): boolean {
  return approverAllowedForPermission(userId, step.approvers, step.permissions?.rejectToDraftApproverIds);
}

export function canUserRequestRevision(userId: string, step: WorkflowStepDefinition): boolean {
  return approverAllowedForPermission(userId, step.approvers, step.permissions?.requestRevisionApproverIds);
}

/** اندیس مرحلهٔ هدف برای بازگشت اصلاح (مراحل قبل از جاری) */
export function listRevisionTargetStepIndices(currentIndex: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < currentIndex; i += 1) out.push(i);
  return out;
}

export function findStepIndexById(steps: WorkflowStepDefinition[], stepId: string): number {
  return steps.findIndex((s) => s.id === stepId);
}
