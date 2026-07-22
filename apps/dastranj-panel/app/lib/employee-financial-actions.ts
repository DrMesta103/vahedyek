'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from './prisma';
import { getEmployeeCompensationAccess } from './employee-compensation-access';
import { createEmployeeAuditLog } from './employee-audit';

const text = (value: FormDataEntryValue | null) => String(value ?? '').trim();
const refresh = (employeeId: string) => revalidatePath(`/employees/${employeeId}/compensation`);
const audit = (tenantId: string, employeeId: string, action: string, oldStatus: string | null, newStatus: string, sourceId: string, reason?: string) => createEmployeeAuditLog({ tenantId, employeeId, action, oldValue: oldStatus ? JSON.stringify({ status: oldStatus }) : null, newValue: JSON.stringify({ id: sourceId, status: newStatus }), reason, source: 'employee_compensation' });

export async function createEmployeeFinancialItem(formData: FormData) {
  const employeeId = text(formData.get('employeeId')); const access = await getEmployeeCompensationAccess(employeeId);
  if (!access.tenantId || !access.canManageFinancial) throw new Error('اجازه ثبت آیتم مالی را ندارید.');
  const title = text(formData.get('title')); const amount = Number(text(formData.get('amount'))); const effectiveDate = text(formData.get('effectiveDate')); const type = text(formData.get('type')); const applyMethod = text(formData.get('applyMethod'));
  if (!title) throw new Error('عنوان الزامی است.'); if (!Number.isFinite(amount) || amount <= 0) throw new Error('مبلغ باید بزرگ‌تر از صفر باشد.'); if (!effectiveDate || !type || !applyMethod) throw new Error('نوع، تاریخ اثرگذاری و روش اعمال الزامی است.');
  const item = await prisma.employeeFinancialItem.create({ data: { tenantId: access.tenantId, employeeId, type: type as never, title, amount, effectiveDate: new Date(effectiveDate), applyMethod: applyMethod as never, sourceModule: 'employee_compensation', description: text(formData.get('description')) || null, createdById: access.userId, status: 'DRAFT' } });
  await audit(access.tenantId, employeeId, 'CREATE_FINANCIAL_ITEM', null, 'DRAFT', item.id); refresh(employeeId);
}

export async function updateEmployeeFinancialItem(formData: FormData) {
  const id = text(formData.get('itemId')); const row = await prisma.employeeFinancialItem.findUnique({ where: { id } }); if (!row) throw new Error('آیتم مالی یافت نشد.');
  const access = await getEmployeeCompensationAccess(row.employeeId); if (!access.tenantId || access.tenantId !== row.tenantId || !access.canManageFinancial || row.status !== 'DRAFT') throw new Error('ویرایش این آیتم مجاز نیست.');
  const title = text(formData.get('title')); const amount = Number(text(formData.get('amount'))); if (!title || !Number.isFinite(amount) || amount <= 0) throw new Error('عنوان و مبلغ معتبر الزامی است.');
  await prisma.employeeFinancialItem.update({ where: { id }, data: { title, amount, description: text(formData.get('description')) || null } }); await audit(row.tenantId, row.employeeId, 'UPDATE_FINANCIAL_ITEM', 'DRAFT', 'DRAFT', id); refresh(row.employeeId);
}

async function transitionFinancialItem(formData: FormData, next: string, action: string, capability: 'manage' | 'approve' | 'finance') {
  const id = text(formData.get('itemId')); const row = await prisma.employeeFinancialItem.findUnique({ where: { id } }); if (!row) throw new Error('آیتم مالی یافت نشد.');
  const access = await getEmployeeCompensationAccess(row.employeeId); const allowedCapability = capability === 'manage' ? access.canManageFinancial : capability === 'approve' ? access.canApproveFinancial : access.canFinance;
  if (!access.tenantId || access.tenantId !== row.tenantId || !allowedCapability) throw new Error('اجازه انجام این عملیات را ندارید.');
  const transitions: Record<string, string[]> = { PENDING_APPROVAL: ['DRAFT'], APPROVED: ['PENDING_APPROVAL'], REJECTED: ['PENDING_APPROVAL'], APPLIED_TO_PAYROLL: ['APPROVED'], PAID: ['APPLIED_TO_PAYROLL'], SETTLED: ['PAID'], CANCELLED: ['DRAFT'] };
  if (!transitions[next]?.includes(row.status)) throw new Error('انتقال وضعیت مجاز نیست.');
  const reason = text(formData.get('reason')); if (next === 'REJECTED' && !reason) throw new Error('دلیل رد الزامی است.');
  const data: Record<string, unknown> = { status: next };
  if (next === 'APPROVED') Object.assign(data, { approvedById: access.userId, approvedAt: new Date() });
  if (next === 'REJECTED') Object.assign(data, { rejectedById: access.userId, rejectedAt: new Date(), rejectionReason: reason });
  if (next === 'APPLIED_TO_PAYROLL') Object.assign(data, { payrollPeriod: text(formData.get('payrollPeriod')) || null, payrollReferenceId: text(formData.get('payrollReferenceId')) || null, appliedAmount: row.amount, payrollAppliedAt: new Date() });
  if (next === 'PAID') Object.assign(data, { paymentDate: new Date(), paymentAmount: row.amount, paymentReference: text(formData.get('paymentReference')) || null, paidById: access.userId });
  if (next === 'SETTLED') data.settledAt = new Date();
  await prisma.employeeFinancialItem.update({ where: { id }, data: data as never }); await audit(row.tenantId, row.employeeId, action, row.status, next, id, reason || undefined); refresh(row.employeeId);
}
export async function submitFinancialItemForApproval(f: FormData) { return transitionFinancialItem(f, 'PENDING_APPROVAL', 'SUBMIT_FINANCIAL_ITEM', 'manage'); }
export async function approveFinancialItem(f: FormData) { return transitionFinancialItem(f, 'APPROVED', 'APPROVE_FINANCIAL_ITEM', 'approve'); }
export async function rejectFinancialItem(f: FormData) { return transitionFinancialItem(f, 'REJECTED', 'REJECT_FINANCIAL_ITEM', 'approve'); }
export async function applyFinancialItemToPayroll(f: FormData) { return transitionFinancialItem(f, 'APPLIED_TO_PAYROLL', 'APPLY_PAYROLL', 'finance'); }
export async function markFinancialItemPaid(f: FormData) { return transitionFinancialItem(f, 'PAID', 'MARK_PAID', 'finance'); }
export async function settleFinancialItem(f: FormData) { return transitionFinancialItem(f, 'SETTLED', 'SETTLE', 'finance'); }
export async function cancelFinancialItem(f: FormData) { return transitionFinancialItem(f, 'CANCELLED', 'CANCEL_FINANCIAL_ITEM', 'manage'); }

export async function createEmployeeDamage(formData: FormData) {
  const employeeId = text(formData.get('employeeId')); const access = await getEmployeeCompensationAccess(employeeId); if (!access.tenantId || !access.canManageDamage) throw new Error('اجازه ثبت خسارت را ندارید.');
  const title = text(formData.get('title')); const description = text(formData.get('description')); const amount = Number(text(formData.get('amount'))); const incidentDate = text(formData.get('incidentDate')); const effectiveDate = text(formData.get('effectiveDate'));
  if (!title || !description) throw new Error('عنوان و دلیل خسارت الزامی است.'); if (!Number.isFinite(amount) || amount <= 0) throw new Error('مبلغ باید بزرگ‌تر از صفر باشد.'); if (!incidentDate || !effectiveDate) throw new Error('تاریخ وقوع و اثرگذاری الزامی است.');
  const damage = await prisma.employeeDamage.create({ data: { tenantId: access.tenantId, employeeId, title, description, amount, incidentDate: new Date(incidentDate), effectiveDate: new Date(effectiveDate), documentReference: text(formData.get('documents')) || null, createdBy: access.userId } });
  await audit(access.tenantId, employeeId, 'CREATE_DAMAGE', null, 'DRAFT', damage.id); refresh(employeeId);
}

async function transitionDamage(formData: FormData, next: string, action: string) {
  const id = text(formData.get('damageId')); const row = await prisma.employeeDamage.findUnique({ where: { id } }); if (!row) throw new Error('خسارت یافت نشد.'); const access = await getEmployeeCompensationAccess(row.employeeId); if (!access.tenantId || access.tenantId !== row.tenantId || !access.canManageDamage) throw new Error('اجازه مدیریت خسارت را ندارید.');
  const transitions: Record<string, string[]> = { PENDING_REVIEW: ['DRAFT'], APPROVED: ['PENDING_REVIEW'], REJECTED: ['PENDING_REVIEW'], APPLIED: ['APPROVED'], CLOSED: ['APPLIED'] }; if (!transitions[next]?.includes(row.status)) throw new Error('انتقال وضعیت خسارت مجاز نیست.');
  await prisma.employeeDamage.update({ where: { id }, data: { status: next as never, approvedBy: next === 'APPROVED' ? access.userId : row.approvedBy } }); await audit(row.tenantId, row.employeeId, action, row.status, next, id, text(formData.get('reason')) || undefined); refresh(row.employeeId);
}
export async function submitDamage(f: FormData) { return transitionDamage(f, 'PENDING_REVIEW', 'SUBMIT_DAMAGE'); } export async function approveDamage(f: FormData) { return transitionDamage(f, 'APPROVED', 'APPROVE_DAMAGE'); } export async function rejectDamage(f: FormData) { return transitionDamage(f, 'REJECTED', 'REJECT_DAMAGE'); } export async function applyDamage(f: FormData) { return transitionDamage(f, 'APPLIED', 'APPLY_DAMAGE'); } export async function closeDamage(f: FormData) { return transitionDamage(f, 'CLOSED', 'CLOSE_DAMAGE'); }

export async function createDamageObjection(formData: FormData) {
  const damageId = text(formData.get('damageId')); const damage = await prisma.employeeDamage.findUnique({ where: { id: damageId } }); if (!damage) throw new Error('خسارت یافت نشد.'); const access = await getEmployeeCompensationAccess(damage.employeeId); if (!access.tenantId || access.tenantId !== damage.tenantId || !access.canCreateObjection) throw new Error('فقط کارمند می‌تواند برای خسارت خود اعتراض ثبت کند.');
  const description = text(formData.get('description')); if (!description) throw new Error('شرح اعتراض الزامی است.'); const objection = await prisma.employeeDamageObjection.create({ data: { damageId, employeeId: damage.employeeId, description, documents: text(formData.get('documents')) || null } }); await audit(damage.tenantId, damage.employeeId, 'CREATE_OBJECTION', null, 'SUBMITTED', objection.id); refresh(damage.employeeId);
}
async function transitionObjection(formData: FormData, next: string, action: string) { const id = text(formData.get('objectionId')); const row = await prisma.employeeDamageObjection.findUnique({ where: { id }, include: { damage: true } }); if (!row) throw new Error('اعتراض یافت نشد.'); const access = await getEmployeeCompensationAccess(row.employeeId); if (!access.tenantId || access.tenantId !== row.damage.tenantId || !access.canReviewObjection) throw new Error('اجازه بررسی اعتراض را ندارید.'); const transitions: Record<string, string[]> = { UNDER_REVIEW: ['SUBMITTED'], APPROVED: ['UNDER_REVIEW'], REJECTED: ['UNDER_REVIEW'], CLOSED: ['APPROVED', 'REJECTED'] }; if (!transitions[next]?.includes(row.status)) throw new Error('انتقال وضعیت اعتراض مجاز نیست.'); await prisma.employeeDamageObjection.update({ where: { id }, data: { status: next as never, reviewedAt: new Date(), reviewedBy: access.userId } }); await audit(row.damage.tenantId, row.employeeId, action, row.status, next, id, text(formData.get('reason')) || undefined); refresh(row.employeeId); }
export async function reviewObjection(f: FormData) { return transitionObjection(f, 'UNDER_REVIEW', 'REVIEW_OBJECTION'); } export async function approveObjection(f: FormData) { return transitionObjection(f, 'APPROVED', 'APPROVE_OBJECTION'); } export async function rejectObjection(f: FormData) { return transitionObjection(f, 'REJECTED', 'REJECT_OBJECTION'); } export async function closeObjection(f: FormData) { return transitionObjection(f, 'CLOSED', 'CLOSE_OBJECTION'); }
