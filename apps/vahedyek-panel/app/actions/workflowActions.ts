'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '../lib/prisma';
import { getSessionContext } from '../lib/auth';
import { requireBusinessOwner } from '../lib/access-control';
import { APPROVAL_USAGE_KEYS, type ApprovalUsageKey } from '../lib/contractApprovalAccess';
import {
  normalizeWorkflowSteps,
  validateWorkflowPayload,
  type WorkflowDefinitionPayload,
  type WorkflowStepDefinition,
} from '../lib/workflowTypes';

async function requireTenantSession() {
  const session = await getSessionContext();
  if (!session?.tenantId || session.state !== 'active') {
    return { ok: false as const, message: 'برای ادامه باید وارد شوید.' };
  }
  return { ok: true as const, tenantId: session.tenantId, userId: session.userId };
}

export async function listApprovalWorkflowsAction() {
  const s = await requireTenantSession();
  if (!s.ok) return { ok: false, message: s.message, items: [] as const };

  const items = await prisma.approvalWorkflow.findMany({
    where: { tenantId: s.tenantId },
    orderBy: { updatedAt: 'desc' },
  });

  return {
    ok: true,
    items: items.map((w) => ({
      id: w.id,
      title: w.title,
      usageTypes: w.usageTypes as ApprovalUsageKey[],
      finalApproverUserId: w.finalApproverUserId ?? null,
      steps: normalizeWorkflowSteps(w.steps),
      buyerShouldApprove: w.buyerShouldApprove,
      active: w.active,
      updatedAt: w.updatedAt.toISOString(),
    })),
  };
}

export async function getApprovalWorkflowAction(workflowId: string) {
  const s = await requireTenantSession();
  if (!s.ok) return { ok: false as const, message: s.message, item: null };

  const item = await prisma.approvalWorkflow.findFirst({
    where: { id: workflowId, tenantId: s.tenantId },
  });
  if (!item) return { ok: false as const, message: 'فرایند یافت نشد.', item: null };

  return {
    ok: true as const,
    item: {
      id: item.id,
      title: item.title,
      usageTypes: item.usageTypes as ApprovalUsageKey[],
      finalApproverUserId: item.finalApproverUserId ?? null,
      steps: normalizeWorkflowSteps(item.steps),
      buyerShouldApprove: item.buyerShouldApprove,
      active: item.active,
      updatedAt: item.updatedAt.toISOString(),
    },
  };
}

export async function listTenantMembersForApproversAction() {
  const s = await requireTenantSession();
  if (!s.ok) return { ok: false, message: s.message, users: [] as const };

  const rows = await prisma.userTenantMembership.findMany({
    where: { tenantId: s.tenantId },
    include: { user: { select: { id: true, fullName: true, firstName: true, lastName: true, mobile: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return {
    ok: true,
    users: rows.map((m) => ({
      id: m.user.id,
      label: m.user.fullName || `${m.user.firstName} ${m.user.lastName}`.trim() || m.user.mobile || m.user.id,
    })),
  };
}

export async function createApprovalWorkflowAction(payload: WorkflowDefinitionPayload) {
  const s = await requireTenantSession();
  if (!s.ok) return { ok: false, message: s.message };

  const ownerOk = await requireBusinessOwner(s.userId, s.tenantId);
  if (!ownerOk) return { ok: false, message: 'تنها مالک کسب‌وکار می‌تواند فرایند تأیید را تعریف کند.' };

  const v = validateWorkflowPayload(payload, { allowEmptyApprovers: true });
  if (!v.ok) return v;

  const usageTypes = payload.usageTypes.filter((u) => (APPROVAL_USAGE_KEYS as readonly string[]).includes(u)) as ApprovalUsageKey[];
  if (usageTypes.length !== 1) return { ok: false, message: 'هر فرایند فقط می‌تواند یک نوع کاربری داشته باشد.' };
  const usageKey = usageTypes[0]!;
  const duplicate = await prisma.approvalWorkflow.findFirst({
    where: { tenantId: s.tenantId, usageTypes: { has: usageKey } },
    select: { id: true, title: true },
  });
  if (duplicate) {
    return { ok: false, message: `برای «${usageKey}» قبلاً یک فرایند تعریف شده است («${duplicate.title}»).` };
  }
  const steps = normalizeWorkflowSteps(payload.steps) as unknown as WorkflowStepDefinition[];

  const wf = await prisma.approvalWorkflow.create({
    data: {
      tenantId: s.tenantId,
      title: payload.title.trim(),
      usageTypes,
      finalApproverUserId: payload.finalApproverUserId ? String(payload.finalApproverUserId).trim() || null : null,
      steps: steps as unknown as object[],
      buyerShouldApprove: payload.buyerShouldApprove ?? true,
      active: payload.active ?? true,
    },
  });

  revalidatePath('/business-settings/approval-process');
  return { ok: true, id: wf.id };
}

export async function updateApprovalWorkflowAction(
  workflowId: string,
  payload: WorkflowDefinitionPayload,
) {
  const s = await requireTenantSession();
  if (!s.ok) return { ok: false, message: s.message };

  const ownerOk = await requireBusinessOwner(s.userId, s.tenantId);
  if (!ownerOk) return { ok: false, message: 'تنها مالک کسب‌وکار می‌تواند فرایند تأیید را ویرایش کند.' };

  const existing = await prisma.approvalWorkflow.findFirst({
    where: { id: workflowId, tenantId: s.tenantId },
  });
  if (!existing) return { ok: false, message: 'فرایند یافت نشد.' };

  const v = validateWorkflowPayload(payload);
  if (!v.ok) return v;

  const usageTypes = payload.usageTypes.filter((u) => (APPROVAL_USAGE_KEYS as readonly string[]).includes(u)) as ApprovalUsageKey[];
  if (usageTypes.length !== 1) return { ok: false, message: 'هر فرایند فقط می‌تواند یک نوع کاربری داشته باشد.' };
  const usageKey = usageTypes[0]!;
  const duplicate = await prisma.approvalWorkflow.findFirst({
    where: { tenantId: s.tenantId, id: { not: workflowId }, usageTypes: { has: usageKey } },
    select: { id: true, title: true },
  });
  if (duplicate) {
    return { ok: false, message: `برای «${usageKey}» قبلاً یک فرایند تعریف شده است («${duplicate.title}»).` };
  }
  const steps = normalizeWorkflowSteps(payload.steps) as unknown as WorkflowStepDefinition[];

  await prisma.approvalWorkflow.update({
    where: { id: workflowId },
    data: {
      title: payload.title.trim(),
      usageTypes,
      finalApproverUserId: payload.finalApproverUserId ? String(payload.finalApproverUserId).trim() || null : null,
      steps: steps as unknown as object[],
      buyerShouldApprove: payload.buyerShouldApprove ?? true,
      active: payload.active ?? true,
    },
  });

  revalidatePath('/business-settings/approval-process');
  revalidatePath(`/business-settings/approval-process/${workflowId}`);
  return { ok: true };
}

export async function deleteApprovalWorkflowAction(workflowId: string) {
  const s = await requireTenantSession();
  if (!s.ok) return { ok: false, message: s.message };

  const ownerOk = await requireBusinessOwner(s.userId, s.tenantId);
  if (!ownerOk) return { ok: false, message: 'تنها مالک کسب‌وکار می‌تواند فرایند را حذف کند.' };

  const existing = await prisma.approvalWorkflow.findFirst({
    where: { id: workflowId, tenantId: s.tenantId },
    include: { _count: { select: { instances: true } } },
  });
  if (!existing) return { ok: false, message: 'فرایند یافت نشد.' };
  if (existing._count.instances > 0) {
    return { ok: false, message: 'این فرایند روی قراردادها در حال اجراست؛ ابداً حذف نمی‌شود. می‌توانید غیرفعالش کنید.' };
  }

  await prisma.approvalWorkflow.delete({ where: { id: workflowId } });
  revalidatePath('/business-settings/approval-process');
  return { ok: true };
}
