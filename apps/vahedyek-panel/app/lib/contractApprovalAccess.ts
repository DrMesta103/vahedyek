import type { ContractApprovalInstanceStatus } from '@/lib/prisma-client';
import { hasPermission, type AccessSnapshot } from './permissions';
import { canUserApproveStep, canUserRejectToDraft, canUserRequestRevision, type DecisionRow } from './workflowRuntime';
import type { WorkflowStepDefinition } from './workflowTypes';

/** هم‌تراز با مسیرهای کاربری در تنظیمات فرایند تأیید */
export const APPROVAL_USAGE_KEYS = ['residential', 'commercial', 'office', 'parking', 'storage'] as const;
export type ApprovalUsageKey = (typeof APPROVAL_USAGE_KEYS)[number];

export type TenantApprovalStage = {
  id: string;
  title: string;
  role: 'controller' | 'intermediate' | 'final';
  employeeId: string;
};

export type TenantApprovalUsageBlock = {
  buyerShouldApprove: boolean;
  stages: TenantApprovalStage[];
};

export type TenantApprovalProcessConfig = Partial<Record<ApprovalUsageKey, TenantApprovalUsageBlock>>;

export function normalizeApprovalUsageKey(unitUsage: string | null | undefined): ApprovalUsageKey | null {
  const u = (unitUsage ?? '').trim();
  if (!u) return null;
  return (APPROVAL_USAGE_KEYS as readonly string[]).includes(u) ? (u as ApprovalUsageKey) : null;
}

export type ApprovalCapabilities = {
  canSubmitWorkflow: boolean;
  canApprove: boolean;
  canRejectToDraft: boolean;
  canRequestRevision: boolean;
};

export function resolveApprovalCapabilities(params: {
  userId: string;
  isOwner: boolean;
  hasContractsUpdate: boolean;
  instanceStatus: ContractApprovalInstanceStatus | null;
  currentStep: WorkflowStepDefinition | null;
  decisions: DecisionRow[];
  workflowFinalApproverUserId?: string | null;
}): ApprovalCapabilities {
  const canSubmitWorkflow = params.isOwner || params.hasContractsUpdate;

  if (params.instanceStatus !== 'IN_REVIEW' || !params.currentStep) {
    return {
      canSubmitWorkflow,
      canApprove: false,
      canRejectToDraft: false,
      canRequestRevision: false,
    };
  }

  const step = params.currentStep;
  const alreadyDecidedThisStep = params.decisions.some((d) => d.stepId === step.id && d.approverUserId === params.userId);
  if (alreadyDecidedThisStep) {
    return {
      canSubmitWorkflow,
      canApprove: false,
      canRejectToDraft: false,
      canRequestRevision: false,
    };
  }
  const isWorkflowFinalApprover =
    Boolean(params.workflowFinalApproverUserId) && params.userId === params.workflowFinalApproverUserId;
  const isStepFinalApprover = Boolean(step.finalApproverId) && params.userId === step.finalApproverId;
  const canRejectToDraft = isWorkflowFinalApprover || (!params.workflowFinalApproverUserId && isStepFinalApprover);
  const canApprove = isWorkflowFinalApprover || params.isOwner || canUserApproveStep(params.userId, step, params.decisions);
  // Product rule: "revision / reject for correction" is available to all approvers of current step.
  const canRequestRevision = params.isOwner || step.approvers.includes(params.userId);

  return {
    canSubmitWorkflow,
    canApprove,
    // Business rule: only workflow-final (or, if absent, step-final) can reject to draft.
    canRejectToDraft,
    canRequestRevision,
  };
}

/**
 * تأیید در UI جزئیات: مالک همیشه؛ در فرایند جدید، تأییدکنندگان مرحلهٔ جاری؛ در صورت نبود instance، fallback به تنظیمات legacy.
 */
export function userCanDecideApprovalOnContract(params: {
  userId: string;
  access: Pick<AccessSnapshot, 'isOwner'> | null | undefined;
  unitUsage: string | null | undefined;
  approvalProcessConfig: unknown;
  workflowCurrentStep?: WorkflowStepDefinition | null;
  instanceStatus?: ContractApprovalInstanceStatus | null;
}): boolean {
  if (params.access?.isOwner) return true;

  if (params.instanceStatus === 'IN_REVIEW' && params.workflowCurrentStep) {
    return params.workflowCurrentStep.approvers.includes(params.userId);
  }

  const usageKey = normalizeApprovalUsageKey(params.unitUsage);
  if (!usageKey) return false;

  const cfg = params.approvalProcessConfig as TenantApprovalProcessConfig | null | undefined;
  const stages = cfg?.[usageKey]?.stages ?? [];
  if (!Array.isArray(stages) || stages.length === 0) return false;

  return stages.some((s) => s && typeof s.employeeId === 'string' && s.employeeId === params.userId);
}

/** پاک‌کردن پرچم «بازگشت از تأیید» پیش از رسیدن دوباره به این گام؛ مالک، ویراستار قرارداد، یا تأییدکنندهٔ مرحلهٔ جاری (Workflow). */
export function userCanClearApprovalReturnPending(
  access: Pick<AccessSnapshot, 'isOwner' | 'permissionKeys'> | null | undefined,
  params: {
    userId: string;
    unitUsage: string | null | undefined;
    approvalProcessConfig: unknown;
    workflowCurrentStep?: WorkflowStepDefinition | null;
  },
): boolean {
  if (!access) return false;
  if (access.isOwner) return true;
  if (hasPermission(access, 'contracts.update')) return true;
  if (params.workflowCurrentStep?.approvers.includes(params.userId)) return true;
  return userCanDecideApprovalOnContract({
    userId: params.userId,
    access,
    unitUsage: params.unitUsage,
    approvalProcessConfig: params.approvalProcessConfig,
  });
}
