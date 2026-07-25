'use server';

import { revalidatePath } from 'next/cache';
import { getSessionContext } from './auth';
import { prisma } from './prisma';
import { createEmployeeAuditLog } from './employee-audit';
import { requireOffboardingAccess } from './offboarding-access';
import { revokeEmployeeAccess } from './access-revocation-service';
import { getEmployeeAssetClearance } from './asset-clearance-provider';

const text = (form: FormData, key: string) => String(form.get(key) ?? '').trim();

const flow: Record<string, Record<string, { status: string; nextAction: string; owner: string; step?: string; capability: 'canSubmit'|'canManagerApprove'|'canHrApprove'|'canFinance'|'canAccess'|'canFinalize'|'canArchive' }>> = {
  DRAFT: { SUBMIT: { status: 'SUBMITTED', nextAction: 'MANAGER_REVIEW', owner: 'MANAGER', capability: 'canSubmit' } },
  SUBMITTED: { APPROVE: { status: 'APPROVAL_PENDING', nextAction: 'HR_REVIEW', owner: 'HR', step: 'MANAGER_REVIEW', capability: 'canManagerApprove' } },
  APPROVAL_PENDING: { APPROVE: { status: 'SETTLEMENT', nextAction: 'FINANCE_CLEARANCE', owner: 'FINANCE', step: 'HR_REVIEW', capability: 'canHrApprove' } },
  SETTLEMENT: { SETTLE: { status: 'ACCESS_REVOCATION', nextAction: 'IT_CLEARANCE', owner: 'IT', step: 'FINANCE_CLEARANCE', capability: 'canFinance' } },
  ACCESS_REVOCATION: { ACCESS_DISABLE: { status: 'READY_FOR_FINALIZATION', nextAction: 'FINALIZATION', owner: 'HR', step: 'IT_CLEARANCE', capability: 'canAccess' } },
  READY_FOR_FINALIZATION: { FINALIZE: { status: 'COMPLETED', nextAction: 'ARCHIVE', owner: 'HR', step: 'FINALIZATION', capability: 'canFinalize' } },
  COMPLETED: { ARCHIVE: { status: 'ARCHIVED', nextAction: 'DONE', owner: 'HR', capability: 'canArchive' } },
};

async function blockers(tenantId: string, employeeId: string) {
  const [contracts, financial, requests, documents, asset] = await Promise.all([
    prisma.employeeContract.count({ where: { tenantId, employeeId, status: { in: ['active', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED'] } } }),
    prisma.employeeFinancialItem.count({ where: { tenantId, employeeId, status: { in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'APPLIED_TO_PAYROLL'] } } }),
    prisma.employeeRequest.count({ where: { tenantId, employeeId, status: { in: ['pending', 'approved'] } } }),
    prisma.employeeDocument.count({ where: { tenantId, employeeId, status: 'PENDING_APPROVAL' } }),
    getEmployeeAssetClearance({ tenantId, employeeId }),
  ]);
  return [contracts && `${contracts} قرارداد باز`, financial && `${financial} آیتم مالی یا وام باز`, requests && `${requests} درخواست باز`, documents && `${documents} سند در انتظار تأیید`, asset.status === 'BLOCKED' && asset.reason].filter(Boolean);
}

export async function handleEmployeeOffboardingAction(formData: FormData) {
  const session = await getSessionContext();
  if (!session?.tenantId || !session.userId) throw new Error('نشست معتبر نیست.');
  const id = text(formData, 'id'); const action = text(formData, 'action'); const comment = text(formData, 'comment') || null;
  const process = await prisma.employeeTerminationIntent.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!process) throw new Error('فرایند خاتمه همکاری پیدا نشد.');
  const transition = flow[process.status]?.[action];
  if (!transition) throw new Error('این تغییر وضعیت در مرحله فعلی مجاز نیست.');
  await requireOffboardingAccess(process.employeeId, transition.capability);
  if (action === 'FINALIZE') { const open = await blockers(session.tenantId, process.employeeId); if (open.length) throw new Error(`نهایی‌سازی ممکن نیست: ${open.join('، ')}`); }
  if (action === 'SUBMIT') await prisma.offboardingApprovalStep.createMany({ data: ['MANAGER_REVIEW','HR_REVIEW','FINANCE_CLEARANCE','IT_CLEARANCE','FINALIZATION'].map((stepType, index) => ({ tenantId: session.tenantId!, offboardingId: id, stepType, sequence: index + 1 })), skipDuplicates: true });
  if (action === 'ACCESS_DISABLE') await revokeEmployeeAccess({ tenantId: session.tenantId, employeeId: process.employeeId, reason: comment ?? 'OFFBOARDING_ACCESS_REVOCATION', actorUserId: session.userId });
  const data: Record<string, unknown> = { status: transition.status, nextAction: transition.nextAction, stageOwner: transition.owner };
  if (action === 'SETTLE') { data.settlementStatus = 'SETTLED'; data.settlementCompletionDate = new Date(); }
  if (action === 'ACCESS_DISABLE') { data.accessStatus = 'DISABLED'; data.accessDisableDate = new Date(); data.immediateAccessRevocation = true; }
  if (action === 'ARCHIVE') data.archiveDate = new Date();
  await prisma.$transaction(async (tx) => { await tx.employeeTerminationIntent.update({ where: { id }, data }); if (transition.step) await tx.offboardingApprovalStep.update({ where: { offboardingId_stepType: { offboardingId: id, stepType: transition.step } }, data: { status: 'APPROVED', approverId: session.userId, completedAt: new Date(), comment } }); });
  const event = action === 'SUBMIT' ? 'SUBMIT_OFFBOARDING' : action === 'APPROVE' ? 'APPROVE_OFFBOARDING' : action === 'SETTLE' ? 'COMPLETE_SETTLEMENT' : action === 'ACCESS_DISABLE' ? 'DISABLE_ACCESS' : action === 'FINALIZE' ? 'FINALIZE_OFFBOARDING' : 'ARCHIVE_OFFBOARDING';
  await createEmployeeAuditLog({ tenantId: session.tenantId, employeeId: process.employeeId, action: event, fieldKey: 'status', oldValue: process.status, newValue: transition.status, reason: comment, source: `offboarding:${id}` });
  if (transition.status === 'SETTLEMENT') await createEmployeeAuditLog({ tenantId: session.tenantId, employeeId: process.employeeId, action: 'START_SETTLEMENT', fieldKey: 'settlementStatus', oldValue: process.settlementStatus, newValue: 'PENDING', reason: comment, source: `offboarding:${id}` });
  revalidatePath(`/employees/${process.employeeId}/offboarding`); revalidatePath(`/employees/${process.employeeId}`);
}

export async function rejectOrReturnOffboardingAction(formData: FormData) {
  const session = await getSessionContext(); if (!session?.tenantId || !session.userId) throw new Error('نشست معتبر نیست.');
  const id = text(formData, 'id'); const decision = text(formData, 'decision'); const reason = text(formData, 'reason');
  if (!reason || !['REJECTED','RETURNED'].includes(decision)) throw new Error('دلیل رد یا بازگشت الزامی است.');
  const process = await prisma.employeeTerminationIntent.findFirst({ where: { id, tenantId: session.tenantId }, include: { approvalSteps: { where: { status: 'PENDING' }, orderBy: { sequence: 'asc' }, take: 1 } } });
  if (!process || !['SUBMITTED','APPROVAL_PENDING'].includes(process.status) || !process.approvalSteps[0]) throw new Error('این تغییر وضعیت در مرحله فعلی مجاز نیست.');
  const capability = process.status === 'SUBMITTED' ? 'canManagerApprove' : 'canHrApprove'; await requireOffboardingAccess(process.employeeId, capability);
  const nextStatus = decision === 'RETURNED' ? 'DRAFT' : 'CANCELLED'; const step = process.approvalSteps[0];
  await prisma.$transaction([prisma.offboardingApprovalStep.update({ where: { id: step.id }, data: { status: decision, approverId: session.userId, completedAt: new Date(), rejectReason: reason } }), prisma.employeeTerminationIntent.update({ where: { id }, data: { status: nextStatus, nextAction: decision === 'RETURNED' ? 'SUBMIT' : 'DONE', stageOwner: 'HR' } })]);
  await createEmployeeAuditLog({ tenantId: session.tenantId, employeeId: process.employeeId, action: decision === 'RETURNED' ? 'RETURN_OFFBOARDING' : 'REJECT_OFFBOARDING', fieldKey: 'status', oldValue: process.status, newValue: nextStatus, reason, source: `offboarding:${id}` });
  revalidatePath(`/employees/${process.employeeId}/offboarding`);
}

export async function restoreEmployeeAccess(formData: FormData) {
  const session = await getSessionContext(); if (!session?.tenantId) throw new Error('نشست معتبر نیست.');
  const id = text(formData, 'id'); const reason = text(formData, 'reason'); if (!reason) throw new Error('دلیل بازیابی دسترسی الزامی است.');
  const process = await prisma.employeeTerminationIntent.findFirst({ where: { id, tenantId: session.tenantId } }); if (!process || process.accessStatus !== 'DISABLED') throw new Error('دسترسی غیرفعالی برای بازیابی وجود ندارد.');
  await requireOffboardingAccess(process.employeeId, 'canRestore');
  await prisma.$transaction([prisma.employee.update({ where: { id: process.employeeId }, data: { isActive: true } }), prisma.employeeTerminationIntent.update({ where: { id }, data: { accessStatus: 'RESTORED', immediateAccessRevocation: false } })]);
  await createEmployeeAuditLog({ tenantId: session.tenantId, employeeId: process.employeeId, action: 'RESTORE_ACCESS', fieldKey: 'accessStatus', oldValue: 'DISABLED', newValue: 'RESTORED', reason, source: `offboarding:${id}` });
  revalidatePath(`/employees/${process.employeeId}/offboarding`); revalidatePath(`/employees/${process.employeeId}`);
}
