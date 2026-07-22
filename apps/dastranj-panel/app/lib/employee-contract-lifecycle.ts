import { Prisma } from '../../node_modules/.prisma/client';
import { getSessionContext } from './auth';
import { prisma } from './prisma';

export const CONTRACT_STATUSES = ['draft', 'DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'active', 'EXPIRED', 'SUSPENDED', 'TERMINATED', 'CANCELLED'] as const;
export type ContractLifecycleStatus = (typeof CONTRACT_STATUSES)[number];
export type ContractOperation = 'CREATE_CONTRACT' | 'RENEW_CONTRACT' | 'AMEND_CONTRACT' | 'TERMINATE_CONTRACT';

const TRANSITIONS: Record<ContractLifecycleStatus, readonly ContractLifecycleStatus[]> = {
  draft: ['SUBMITTED', 'CANCELLED'],
  DRAFT: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'draft', 'CANCELLED'],
  APPROVED: ['active', 'CANCELLED'],
  active: ['EXPIRED', 'SUSPENDED', 'TERMINATED'],
  EXPIRED: [], SUSPENDED: ['active', 'TERMINATED'], TERMINATED: [], CANCELLED: [],
};

export function assertContractTransition(from: string, to: string) {
  if (!(TRANSITIONS[from as ContractLifecycleStatus] ?? []).includes(to as ContractLifecycleStatus)) {
    throw new Error(`گذار وضعیت قرارداد از ${from} به ${to} مجاز نیست.`);
  }
}

export function validateContractDates(startDate: string, endDate: string | null, effectiveDate: string) {
  if (!startDate) throw new Error('تاریخ شروع الزامی است.');
  if (!effectiveDate) throw new Error('تاریخ اثرگذاری الزامی است.');
  if (endDate && endDate < startDate) throw new Error('تاریخ پایان نمی‌تواند پیش از تاریخ شروع باشد.');
}

export async function getEmployeeContractAccess(employeeId: string) {
  const session = await getSessionContext();
  if (!session?.tenantId || !session.userId) throw new Error('برای دسترسی به قرارداد باید وارد سامانه شوید.');
  const membership = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId: session.userId, tenantId: session.tenantId } },
    include: { roles: { include: { role: { select: { key: true } } } }, employee: { select: { id: true } } },
  });
  const roles = new Set([membership?.role?.toLowerCase(), ...(membership?.roles.map((r) => r.role.key.toLowerCase()) ?? [])].filter(Boolean) as string[]);
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, tenantId: session.tenantId },
    select: { id: true, organizationUnits: { select: { organizationUnit: { select: { managerId: true } } } } },
  });
  if (!employee) throw new Error('کارمند در کسب‌وکار فعال پیدا نشد.');
  const isSelf = membership?.employee?.id === employeeId;
  const isOwner = roles.has('owner');
  const isHr = roles.has('hr_manager');
  const isManager = roles.has('manager');
  const managesEmployee = isManager && Boolean(membership?.employee?.id) && employee.organizationUnits.some((unit) => unit.organizationUnit.managerId === membership?.employee?.id);
  return {
    tenantId: session.tenantId, userId: session.userId, actorRole: [...roles][0] ?? membership?.role ?? 'unknown',
    canView: isSelf || isOwner || isHr || managesEmployee,
    canCreate: isOwner || isHr,
    canRenew: isOwner || isHr,
    canAmend: isOwner || isHr || isSelf,
    canTerminate: isOwner || isHr,
    canApprove: isOwner || isHr,
    canBackdate: isOwner,
  };
}

async function audit(tx: Prisma.TransactionClient, input: {
  tenantId: string; contractId: string; employeeId: string; operationType: string; actorUserId: string;
  actorRole: string; reason: string; effectiveDate?: string | null; approvalStatus?: string | null; oldValue?: unknown; newValue?: unknown;
}) {
  await tx.employeeContractAuditLog.create({ data: {
    ...input,
    oldValue: input.oldValue == null ? Prisma.JsonNull : input.oldValue as Prisma.InputJsonValue,
    newValue: input.newValue == null ? Prisma.JsonNull : input.newValue as Prisma.InputJsonValue,
  } });
}

export async function getEmployeeContractLifecycle(employeeId: string) {
  const permission = await getEmployeeContractAccess(employeeId);
  if (!permission.canView) throw new Error('دسترسی مشاهده قرارداد را ندارید.');
  const contracts = await prisma.employeeContract.findMany({
    where: { tenantId: permission.tenantId, employeeId },
    orderBy: [{ version: 'desc' }, { createdAt: 'desc' }],
    include: { approvals: { orderBy: { requestedAt: 'desc' } }, auditLogs: { orderBy: { createdAt: 'desc' } } },
  });
  return { contracts, permission };
}

type DraftInput = { employeeId: string; operationType: ContractOperation; startDate: string; endDate?: string | null; effectiveDate: string; contractNumber?: string | null; contractType: string; reason: string; attachmentUrl?: string | null; parentContractId?: string | null };

export async function createContractVersion(input: DraftInput) {
  const permission = await getEmployeeContractAccess(input.employeeId);
  const allowed = input.operationType === 'CREATE_CONTRACT' ? permission.canCreate : input.operationType === 'RENEW_CONTRACT' ? permission.canRenew : input.operationType === 'AMEND_CONTRACT' ? permission.canAmend : permission.canTerminate;
  if (!allowed) throw new Error('مجوز این عملیات قرارداد را ندارید.');
  if (!input.reason.trim()) throw new Error('دلیل عملیات الزامی است.');
  validateContractDates(input.startDate, input.endDate ?? null, input.effectiveDate);
  if (input.effectiveDate < new Date().toISOString().slice(0, 10) && !permission.canBackdate) throw new Error('تغییر با اثرگذاری گذشته فقط با مجوز مالک مجاز است.');

  return prisma.$transaction(async (tx) => {
    const latest = await tx.employeeContract.findFirst({ where: { tenantId: permission.tenantId, employeeId: input.employeeId }, orderBy: { version: 'desc' } });
    if (input.operationType !== 'CREATE_CONTRACT' && (!input.parentContractId || !latest)) throw new Error('عملیات باید بر مبنای یک قرارداد موجود انجام شود.');
    if (input.operationType === 'CREATE_CONTRACT') {
      const duplicate = await tx.employeeContract.findFirst({ where: { tenantId: permission.tenantId, employeeId: input.employeeId, status: { in: ['active', 'APPROVED', 'PENDING_APPROVAL', 'SUBMITTED'] } } });
      if (duplicate) throw new Error('برای این کارمند قرارداد فعال یا در جریان وجود دارد.');
    }
    const version = (latest?.version ?? 0) + 1;
    const contract = await tx.employeeContract.create({ data: {
      id: crypto.randomUUID(), tenantId: permission.tenantId, employeeId: input.employeeId, status: 'DRAFT', isCurrent: false,
      version, parentContractId: input.parentContractId ?? latest?.id ?? null, operationType: input.operationType,
      startDate: input.startDate, endDate: input.endDate ?? null, effectiveDate: input.effectiveDate,
      contractNumber: input.contractNumber ?? null, reason: input.reason.trim(), attachmentUrl: input.attachmentUrl ?? null,
      createdById: permission.userId, data: { contractType: input.contractType },
    } });
    const auditOperation = input.operationType === 'RENEW_CONTRACT' ? 'RENEW' : input.operationType === 'AMEND_CONTRACT' ? 'AMEND' : input.operationType === 'TERMINATE_CONTRACT' ? 'TERMINATE' : 'CREATE';
    await audit(tx, { tenantId: permission.tenantId, actorUserId: permission.userId, actorRole: permission.actorRole, contractId: contract.id, employeeId: input.employeeId, operationType: auditOperation, reason: input.reason, effectiveDate: input.effectiveDate, newValue: contract });
    return contract;
  });
}

export async function transitionContract(contractId: string, target: ContractLifecycleStatus, reason: string) {
  if (!reason.trim()) throw new Error('دلیل تغییر وضعیت الزامی است.');
  const existing = await prisma.employeeContract.findUnique({ where: { id: contractId } });
  if (!existing) throw new Error('قرارداد پیدا نشد.');
  const permission = await getEmployeeContractAccess(existing.employeeId);
  if (existing.tenantId !== permission.tenantId) throw new Error('دسترسی بین کسب‌وکارها مجاز نیست.');
  const current = existing.status as ContractLifecycleStatus;
  assertContractTransition(current, target);
  if (target === 'APPROVED' && !permission.canApprove) throw new Error('مجوز تأیید قرارداد را ندارید.');
  if (target === 'active' && !permission.canApprove) throw new Error('مجوز فعال‌سازی قرارداد را ندارید.');
  if (['TERMINATED', 'EXPIRED', 'SUSPENDED'].includes(target) && !permission.canTerminate) throw new Error('مجوز پایان یا تعلیق قرارداد را ندارید.');
  const now = new Date();
  return prisma.$transaction(async (tx) => {
    if (target === 'active') {
      if ((existing.effectiveDate ?? existing.startDate ?? '') > now.toISOString().slice(0, 10)) throw new Error('قرارداد پیش از تاریخ اثرگذاری قابل فعال‌سازی نیست.');
      if (existing.operationType === 'TERMINATE_CONTRACT') {
        await tx.employeeContract.updateMany({
          where: { tenantId: permission.tenantId, employeeId: existing.employeeId, isCurrent: true },
          data: { isCurrent: false, status: 'TERMINATED', endDate: existing.effectiveDate ?? existing.endDate, reason },
        });
      }
      await tx.employeeContract.updateMany({ where: { tenantId: permission.tenantId, employeeId: existing.employeeId, isCurrent: true, id: { not: contractId } }, data: { isCurrent: false, status: 'ended' } });
    }
    const appliedStatus = target === 'active' && existing.operationType === 'TERMINATE_CONTRACT' ? 'TERMINATED' : target;
    const contract = await tx.employeeContract.update({ where: { id: contractId }, data: {
      status: appliedStatus, isCurrent: target === 'active' && existing.operationType !== 'TERMINATE_CONTRACT', reason,
      submittedAt: target === 'SUBMITTED' ? now : existing.submittedAt,
      approvedById: target === 'APPROVED' ? permission.userId : existing.approvedById,
      approvedAt: target === 'APPROVED' ? now : existing.approvedAt,
      appliedAt: target === 'active' ? now : existing.appliedAt,
      finalizedAt: target === 'active' ? now : existing.finalizedAt,
    } });
    if (target === 'PENDING_APPROVAL') await tx.employeeContractApproval.create({ data: { tenantId: permission.tenantId, contractId, requesterId: permission.userId, reason } });
    if (target === 'APPROVED' || target === 'DRAFT') await tx.employeeContractApproval.updateMany({ where: { tenantId: permission.tenantId, contractId, status: 'PENDING' }, data: { status: target === 'APPROVED' ? 'APPROVED' : 'REJECTED', approverId: permission.userId, reviewNote: reason, reviewedAt: now } });
    await audit(tx, { tenantId: permission.tenantId, actorUserId: permission.userId, actorRole: permission.actorRole, contractId, employeeId: existing.employeeId, operationType: target === 'APPROVED' ? 'APPROVE' : target === 'DRAFT' ? 'REJECT' : target === 'active' ? 'APPLY' : target === 'TERMINATED' ? 'TERMINATE' : 'UPDATE', reason, effectiveDate: existing.effectiveDate, approvalStatus: appliedStatus, oldValue: { status: current }, newValue: { status: appliedStatus } });
    return contract;
  });
}
