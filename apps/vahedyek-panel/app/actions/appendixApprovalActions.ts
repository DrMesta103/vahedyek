'use server';

import { revalidatePath } from 'next/cache';
import { getSessionContext } from '../lib/auth';
import {
  getAppendixApprovalState,
  recordAppendixApprovalDecision,
  revokeAppendixApprovalDecision,
  submitAppendixApprovalWorkflow,
} from '../lib/appendixApprovalCore';

async function requireAppendixSession() {
  const session = await getSessionContext();
  if (!session?.tenantId || session.state !== 'active') {
    return { ok: false as const, message: 'برای ادامه باید وارد شوید.' };
  }
  return {
    ok: true as const,
    tenantId: session.tenantId,
    userId: session.userId,
    actorName: session.user.fullName || session.user.email || session.user.mobile || 'کاربر ناشناس',
  };
}

export async function getAppendixApprovalStateAction(appendixId: string) {
  const session = await requireAppendixSession();
  if (!session.ok) return { ok: false, message: session.message, state: null };
  return getAppendixApprovalState({ tenantId: session.tenantId, userId: session.userId, appendixId });
}

export async function submitAppendixApprovalWorkflowAction(appendixId: string) {
  const session = await requireAppendixSession();
  if (!session.ok) return { ok: false, message: session.message };
  const result = await submitAppendixApprovalWorkflow({
    tenantId: session.tenantId,
    userId: session.userId,
    actorName: session.actorName,
    appendixId,
  });
  revalidatePath('/contracts');
  return result;
}

export async function recordAppendixApprovalDecisionAction(
  appendixId: string,
  input: { decision: 'APPROVE' | 'REQUEST_REVISION' | 'REJECT_TO_DRAFT'; reason?: string },
) {
  const session = await requireAppendixSession();
  if (!session.ok) return { ok: false, message: session.message };
  const result = await recordAppendixApprovalDecision({
    tenantId: session.tenantId,
    userId: session.userId,
    actorName: session.actorName,
    appendixId,
    decision: input.decision,
    reason: input.reason,
  });
  revalidatePath('/contracts');
  return result;
}

export async function revokeAppendixApprovalDecisionAction(appendixId: string) {
  const session = await requireAppendixSession();
  if (!session.ok) return { ok: false, message: session.message };
  const result = await revokeAppendixApprovalDecision({
    tenantId: session.tenantId,
    userId: session.userId,
    appendixId,
  });
  revalidatePath('/contracts');
  return result;
}
