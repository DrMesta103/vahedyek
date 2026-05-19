import type { ApprovalUsageKey } from './contractApprovalAccess';
import type { WorkflowStepDefinition } from './workflowTypes';

export type ApprovalProcessEditorDraft = {
  title: string;
  usageType: ApprovalUsageKey | '';
  finalApproverUserId: string;
  buyerShouldApprove: boolean;
  workflowActive: boolean;
  globalType: 'PARALLEL' | 'SEQUENTIAL';
  steps: WorkflowStepDefinition[];
  openStepId: string | null;
  targetStageId: string | null;
};

export type ApprovalRoadmapItem = {
  id: string;
  index: number;
  title: string;
  processingLabel: string;
  completionLabel: string;
  approverIds: string[];
  finalApproverId: string | null;
};

export function getApprovalProcessDraftStorageKey(workflowId?: string) {
  return `approval-process:draft:${workflowId || 'new'}`;
}

export function buildApprovalProcessDraft(
  draft: ApprovalProcessEditorDraft,
): ApprovalProcessEditorDraft {
  return {
    ...draft,
    steps: draft.steps.map((step) => ({
      ...step,
      approvers: [...step.approvers],
      finalApproverId: step.finalApproverId ?? null,
      permissions: step.permissions
        ? {
            rejectToDraftApproverIds: Array.isArray(step.permissions.rejectToDraftApproverIds)
              ? [...step.permissions.rejectToDraftApproverIds]
              : step.permissions.rejectToDraftApproverIds,
            requestRevisionApproverIds: Array.isArray(step.permissions.requestRevisionApproverIds)
              ? [...step.permissions.requestRevisionApproverIds]
              : step.permissions.requestRevisionApproverIds,
          }
        : undefined,
    })),
  };
}

export function parseApprovalProcessDraft(raw: string | null): ApprovalProcessEditorDraft | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ApprovalProcessEditorDraft> | null;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.steps)) return null;

    const globalType = parsed.globalType === 'SEQUENTIAL' ? 'SEQUENTIAL' : 'PARALLEL';

    return {
      title: typeof parsed.title === 'string' ? parsed.title : '',
      usageType: typeof parsed.usageType === 'string' ? (parsed.usageType as ApprovalUsageKey | '') : '',
      finalApproverUserId: typeof parsed.finalApproverUserId === 'string' ? parsed.finalApproverUserId : '',
      buyerShouldApprove: parsed.buyerShouldApprove !== false,
      workflowActive: parsed.workflowActive !== false,
      globalType,
      steps: parsed.steps
        .filter((step): step is WorkflowStepDefinition => Boolean(step && typeof step === 'object' && (step as { id?: unknown }).id))
        .map((step) => ({
          ...step,
          type: step.type === 'SEQUENTIAL' ? 'SEQUENTIAL' : 'PARALLEL',
          approvers: Array.isArray(step.approvers) ? step.approvers.filter(Boolean) : [],
          finalApproverId: step.finalApproverId ?? null,
        })),
      openStepId: typeof parsed.openStepId === 'string' ? parsed.openStepId : null,
      targetStageId: typeof parsed.targetStageId === 'string' ? parsed.targetStageId : null,
    };
  } catch {
    return null;
  }
}

export function attachApproverToStep(
  steps: WorkflowStepDefinition[],
  stepId: string,
  approverId: string,
): WorkflowStepDefinition[] {
  return steps.map((step) => {
    if (step.id !== stepId) return step;
    if (step.approvers.includes(approverId)) return step;
    return {
      ...step,
      approvers: [...step.approvers, approverId],
    };
  });
}

export function buildApprovalRoadmapItems(steps: WorkflowStepDefinition[]): ApprovalRoadmapItem[] {
  return steps.map((step, index) => ({
    id: step.id,
    index,
    title: step.title?.trim() || `مرحله ${index + 1}`,
    processingLabel: step.type === 'SEQUENTIAL' ? 'مرحله‌به‌مرحله' : 'بدون ترتیب',
    completionLabel:
      step.logic.mode === 'MINIMUM_COUNT'
        ? `حداقل ${step.logic.count} تایید`
        : 'تایید کامل همه تاییدکنندگان',
    approverIds: [...step.approvers],
    finalApproverId: step.finalApproverId ?? null,
  }));
}
