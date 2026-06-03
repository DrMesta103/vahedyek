import { redirect } from 'next/navigation';
import { Prisma } from '../../node_modules/.prisma/client';
import { prisma } from './prisma';
import { getSessionContext } from './auth';
import { ensureTenantDefaultRequestReasons } from './request-reason-defaults';
import { DEFAULT_PAYROLL_SETTINGS } from './payroll-business-settings';
import { getContractLeaveBalanceInputs, getContractOvertimeRules } from './employee-contracts';
import { getCurrentEmployeeContract } from './employee-contracts.server';
import type { RequestReasonCategoryKey } from './constants';

export type EmployeeRequestType = RequestReasonCategoryKey;
export type EmployeeRequestStatus = 'pending' | 'approved' | 'rejected' | 'canceled';
export type EmployeeRequestSubmissionMode = 'approved' | 'pending';
export type EmployeeRequestRangeType = 'full_day' | 'multi_day' | 'hourly' | 'range' | 'point';
// Legacy compatibility for older attendance records and future imports.
export type AttendanceActionType = 'check_in' | 'check_out' | 'correction';

export type AttachmentDraft = {
  id: string;
  ownerType?: string;
  ownerId?: string;
  categoryId?: string | null;
  categoryName: string;
  titleId?: string | null;
  title: string;
  fileUrl: string;
  fileName: string;
  fileType?: string | null;
  fileSize?: number | null;
  issuedAt?: string | null;
  description?: string | null;
  uploadedAt?: string;
};

export type CompanyLoanItem = {
  id: string;
  title: string;
  guarantorCount: number;
  minAmount: number;
  maxAmount: number;
  minInstallments: number;
  maxInstallments: number;
  feeRate: number;
  interestRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeRequestItem = {
  id: string;
  employeeId: string;
  requestType: EmployeeRequestType;
  status: EmployeeRequestStatus;
  submissionMode: EmployeeRequestSubmissionMode;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  dateTime: string | null;
  rangeType: EmployeeRequestRangeType | null;
  attendanceActionType: AttendanceActionType | null;
  amount: number | null;
  loanId: string | null;
  loanTitle: string | null;
  installments: number | null;
  reasonId: string | null;
  reasonTitle: string | null;
  description: string | null;
  calculatedDurationMinutes: number | null;
  calculationMeta: Record<string, unknown>;
  attachmentCount: number;
  attachments: AttachmentDraft[];
  createdBy: string | null;
  approvedBy: string | null;
  rejectedBy: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeRequestsEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  personnelCode: string | null;
  jobTitle: string;
  organizationUnitTitle: string;
  workGroupTitle: string;
  hasActiveContract: boolean;
  currentContractId?: string | null;
  overtimeRules?: ReturnType<typeof getContractOvertimeRules> | null;
};

export type RequestReasonOption = {
  id: string;
  title: string;
  description: string | null;
  category: EmployeeRequestType;
};

export type LeaveBalanceSummary = {
  annualMinutes: number | null;
  usedMinutes: number;
  remainingMinutes: number | null;
  dailyRequiredMinutes: number | null;
};

export type EmployeeRequestFormPayload = {
  id?: string;
  employeeId: string;
  requestType: EmployeeRequestType;
  status: EmployeeRequestStatus;
  submissionMode: EmployeeRequestSubmissionMode;
  rangeType?: EmployeeRequestRangeType | null;
  attendanceActionType?: AttendanceActionType | null;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  dateTime?: string | null;
  amount?: number | null;
  loanId?: string | null;
  installments?: number | null;
  reasonId?: string | null;
  description?: string | null;
  attachments?: AttachmentDraft[];
};

type RawEmployeeRequestRow = {
  id: string;
  employeeId: string;
  requestType: EmployeeRequestType;
  status: EmployeeRequestStatus;
  submissionMode: EmployeeRequestSubmissionMode;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  dateTime: string | null;
  rangeType: EmployeeRequestRangeType | null;
  attendanceActionType: AttendanceActionType | null;
  amount: Prisma.Decimal | number | string | null;
  loanId: string | null;
  loanTitle: string | null;
  installments: number | null;
  reasonId: string | null;
  reasonTitle: string | null;
  description: string | null;
  calculatedDurationMinutes: number | null;
  calculationMeta: unknown;
  attachmentCount: bigint | number;
  createdBy: string | null;
  approvedBy: string | null;
  rejectedBy: string | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  canceledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

type RawAttachmentRow = {
  id: string;
  ownerType: string;
  ownerId: string;
  categoryId: string | null;
  categoryName: string;
  titleId: string | null;
  title: string;
  fileUrl: string;
  fileName: string;
  fileType: string | null;
  fileSize: number | null;
  issuedAt: string | null;
  description: string | null;
  uploadedAt: Date;
};

async function requireTenantId() {
  const session = await getSessionContext();
  if (!session?.tenantId) redirect('/select-tenant');
  return { tenantId: session.tenantId, userName: session.user?.fullName ?? session.user?.email ?? 'مدیر سیستم' };
}

function numberValue(value: Prisma.Decimal | number | string | null | undefined) {
  if (value == null) return null;
  return typeof value === 'number' ? value : Number(value.toString());
}

function dateValue(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

function timeToMinutes(value?: string | null) {
  if (!value) return null;
  const [hour, minute] = value.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  return hour * 60 + minute;
}

function positiveDuration(startTime?: string | null, endTime?: string | null) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (start == null || end == null) return null;
  return Math.max(0, end - start);
}

function daySpan(startDate?: string | null, endDate?: string | null) {
  if (!startDate || !endDate) return 1;
  if (startDate === endDate) return 1;
  return 2;
}

function calculateDuration(payload: EmployeeRequestFormPayload, dailyRequiredMinutes: number) {
  if (payload.requestType === 'attendance') return null;
  if (payload.requestType === 'salary_advance' || payload.requestType === 'loan') return null;
  if (payload.rangeType === 'hourly') return positiveDuration(payload.startTime, payload.endTime);
  if (payload.rangeType === 'full_day') return dailyRequiredMinutes;
  if (payload.rangeType === 'multi_day') return daySpan(payload.startDate, payload.endDate) * dailyRequiredMinutes;
  return positiveDuration(payload.startTime, payload.endTime) ?? dailyRequiredMinutes;
}

function calculationMeta(
  payload: EmployeeRequestFormPayload,
  duration: number | null,
  overtimeRules = DEFAULT_PAYROLL_SETTINGS.workTimePayRules,
  hasActiveContract = true,
) {
  if (payload.requestType === 'overtime') {
    const warnings: string[] = [];
    const limitMinutes = Math.max(0, Number(overtimeRules.overtime.dailyLimitHours) * 60);
    if (!hasActiveContract) warnings.push('برای محاسبه اضافه‌کاری، قرارداد فعال وجود ندارد.');
    if (duration && limitMinutes && duration > limitMinutes) warnings.push('مدت اضافه‌کاری از سقف قرارداد جاری بیشتر است.');
    return {
      requestedDurationMinutes: duration,
      validOvertimeDurationMinutes: limitMinutes ? Math.min(duration ?? 0, limitMinutes) : duration,
      overtimeCoefficient: overtimeRules.overtime.normalCoefficient,
      dailyLimitMinutes: limitMinutes,
      outsideNormalWorkTime: true,
      nightWorkOverlapMinutes: 0,
      weeklyRestDayOverlapMinutes: 0,
      holidayOverlapMinutes: 0,
      warnings,
    };
  }
  if (payload.requestType === 'remote_work') return { requestedDurationMinutes: duration };
  return {};
}

async function resolveDailyRequiredMinutes(tenantId: string) {
  const rows = await prisma.workPolicy.findMany({
    where: { tenantId, isDefault: true },
    select: { sectionValues: true },
    take: 1,
  });
  const values = rows[0]?.sectionValues;
  if (values && typeof values === 'object' && !Array.isArray(values)) {
    const requiredMinutes = (values as Record<string, unknown>).requiredMinutes;
    if (typeof requiredMinutes === 'number' && requiredMinutes > 0) return requiredMinutes;
  }
  return DEFAULT_PAYROLL_SETTINGS.financial.dailyRequiredMinutes;
}

async function resolveLeaveAnnualMinutes(tenantId: string) {
  const rows = await prisma.workPolicy.findMany({
    where: { tenantId },
    select: { sectionValues: true },
  });
  const leavePolicy = rows
    .map((row) => row.sectionValues)
    .find((values) => values && typeof values === 'object' && !Array.isArray(values) && (values as Record<string, unknown>).familyKey === 'leave');
  if (leavePolicy && typeof leavePolicy === 'object' && !Array.isArray(leavePolicy)) {
    const monthlyLimit = (leavePolicy as Record<string, unknown>).monthlyLimit;
    if (typeof monthlyLimit === 'number' && monthlyLimit > 0) return monthlyLimit * 12 * 60;
  }
  return DEFAULT_PAYROLL_SETTINGS.leave.monthlyQuotaHours * 12 * 60;
}

function mapAttachment(row: RawAttachmentRow): AttachmentDraft {
  return {
    id: row.id,
    ownerType: row.ownerType,
    ownerId: row.ownerId,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    titleId: row.titleId,
    title: row.title,
    fileUrl: row.fileUrl,
    fileName: row.fileName,
    fileType: row.fileType,
    fileSize: row.fileSize,
    issuedAt: row.issuedAt,
    description: row.description,
    uploadedAt: row.uploadedAt.toISOString(),
  };
}

function mapRequest(row: RawEmployeeRequestRow, attachments: AttachmentDraft[]): EmployeeRequestItem {
  return {
    id: row.id,
    employeeId: row.employeeId,
    requestType: row.requestType,
    status: row.status,
    submissionMode: row.submissionMode,
    startDate: row.startDate,
    endDate: row.endDate,
    startTime: row.startTime,
    endTime: row.endTime,
    dateTime: row.dateTime,
    rangeType: row.rangeType,
    attendanceActionType: row.attendanceActionType,
    amount: numberValue(row.amount),
    loanId: row.loanId,
    loanTitle: row.loanTitle,
    installments: row.installments,
    reasonId: row.reasonId,
    reasonTitle: row.reasonTitle,
    description: row.description,
    calculatedDurationMinutes: row.calculatedDurationMinutes,
    calculationMeta: row.calculationMeta && typeof row.calculationMeta === 'object' ? row.calculationMeta as Record<string, unknown> : {},
    attachmentCount: Number(row.attachmentCount ?? 0),
    attachments,
    createdBy: row.createdBy,
    approvedBy: row.approvedBy,
    rejectedBy: row.rejectedBy,
    approvedAt: dateValue(row.approvedAt),
    rejectedAt: dateValue(row.rejectedAt),
    canceledAt: dateValue(row.canceledAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listCompanyLoans(): Promise<CompanyLoanItem[]> {
  const { tenantId } = await requireTenantId();
  const rows = await prisma.$queryRaw<Array<{
    id: string;
    title: string;
    guarantorCount: number;
    minAmount: Prisma.Decimal;
    maxAmount: Prisma.Decimal;
    minInstallments: number;
    maxInstallments: number;
    feeRate: Prisma.Decimal;
    interestRate: Prisma.Decimal;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>>`
    SELECT * FROM "CompanyLoan"
    WHERE "tenantId" = ${tenantId}
    ORDER BY "updatedAt" DESC
  `;
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    guarantorCount: row.guarantorCount,
    minAmount: Number(row.minAmount),
    maxAmount: Number(row.maxAmount),
    minInstallments: row.minInstallments,
    maxInstallments: row.maxInstallments,
    feeRate: Number(row.feeRate),
    interestRate: Number(row.interestRate),
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getEmployeeLeaveBalanceSummary(employeeId: string, tenantId: string) {
  const currentContract = await getCurrentEmployeeContract(employeeId, tenantId);
  const contractLeave = getContractLeaveBalanceInputs(currentContract, { fallbackToDefaults: false });
  const usedRows = await prisma.$queryRaw<Array<{ usedMinutes: bigint | number | null }>>`
    SELECT COALESCE(SUM("calculatedDurationMinutes"), 0) AS "usedMinutes"
    FROM "EmployeeRequest"
    WHERE "tenantId" = ${tenantId}
      AND "employeeId" = ${employeeId}
      AND "status" = 'approved'
      AND "requestType" IN ('daily_leave'::"EmployeeRequestType", 'hourly_leave'::"EmployeeRequestType")
  `;
  const usedMinutes = Number(usedRows[0]?.usedMinutes ?? 0);
  return {
    annualMinutes: currentContract ? contractLeave.annualMinutes : null,
    usedMinutes,
    remainingMinutes:
      currentContract && contractLeave.annualMinutes != null ? Math.max(0, contractLeave.annualMinutes - usedMinutes) : null,
    dailyRequiredMinutes: currentContract ? contractLeave.dailyRequiredMinutes : null,
  } satisfies LeaveBalanceSummary;
}

export async function getEmployeeRequestsPageData(employeeId: string) {
  const { tenantId } = await requireTenantId();
  await ensureTenantDefaultRequestReasons(prisma, tenantId);
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, tenantId },
    include: {
      organizationUnits: { include: { organizationUnit: true } },
      workGroupMemberships: { where: { isCurrent: true }, include: { workGroup: true } },
    },
  });
  if (!employee) return null;

  const currentContract = await getCurrentEmployeeContract(employeeId, tenantId);
  const overtimeRules = getContractOvertimeRules(currentContract);

  const [requests, attachmentRows, reasons, loans, leaveBalance] = await Promise.all([
    prisma.$queryRaw<RawEmployeeRequestRow[]>`
      SELECT
        er.*,
        rr."title" AS "reasonTitle",
        cl."title" AS "loanTitle",
        COUNT(att."id") AS "attachmentCount"
      FROM "EmployeeRequest" er
      LEFT JOIN "RequestReason" rr ON rr."id" = er."reasonId"
      LEFT JOIN "CompanyLoan" cl ON cl."id" = er."loanId"
      LEFT JOIN "Attachment" att ON att."ownerType" = 'employee_request' AND att."ownerId" = er."id"
      WHERE er."tenantId" = ${tenantId} AND er."employeeId" = ${employeeId}
      GROUP BY er."id", rr."title", cl."title"
      ORDER BY er."createdAt" DESC
    `,
    prisma.$queryRaw<RawAttachmentRow[]>`
      SELECT att.*
      FROM "Attachment" att
      INNER JOIN "EmployeeRequest" er ON er."id" = att."ownerId"
      WHERE att."tenantId" = ${tenantId}
        AND att."ownerType" = 'employee_request'
        AND er."employeeId" = ${employeeId}
      ORDER BY att."uploadedAt" ASC
    `,
    prisma.requestReason.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, title: true, description: true, category: true },
    }),
    listCompanyLoans(),
    getEmployeeLeaveBalanceSummary(employeeId, tenantId),
  ]);

  const attachmentsByRequest = new Map<string, AttachmentDraft[]>();
  attachmentRows.forEach((row) => {
    const list = attachmentsByRequest.get(row.ownerId) ?? [];
    list.push(mapAttachment(row));
    attachmentsByRequest.set(row.ownerId, list);
  });

  const employeeData: EmployeeRequestsEmployee = {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    avatarUrl: employee.avatarUrl,
    personnelCode: employee.personnelCode,
    organizationUnitTitle: employee.organizationUnits.map((item) => item.organizationUnit.title).join('، '),
    workGroupTitle: employee.workGroupMemberships.map((item) => item.workGroup.title).join('، '),
    jobTitle: currentContract?.jobTitle ?? '',
    hasActiveContract: Boolean(currentContract),
    currentContractId: currentContract?.id ?? null,
    overtimeRules,
  };

  return {
    employee: employeeData,
    requests: requests.map((row) => mapRequest(row, attachmentsByRequest.get(row.id) ?? [])),
    reasons: reasons.map((reason) => ({
      id: reason.id,
      title: reason.title,
      description: reason.description,
      category: reason.category as EmployeeRequestType,
    })) satisfies RequestReasonOption[],
    loans,
    leaveBalance,
  };
}

async function replaceAttachments(tenantId: string, ownerId: string, attachments: AttachmentDraft[]) {
  await prisma.$executeRaw`
    DELETE FROM "Attachment"
    WHERE "tenantId" = ${tenantId}
      AND "ownerType" = 'employee_request'
      AND "ownerId" = ${ownerId}
  `;
  for (const attachment of attachments) {
    await prisma.$executeRaw`
      INSERT INTO "Attachment" (
        "id", "tenantId", "ownerType", "ownerId", "categoryId", "categoryName",
        "titleId", "title", "fileUrl", "fileName", "fileType", "fileSize", "issuedAt", "description", "uploadedAt"
      )
      VALUES (
        ${attachment.id || crypto.randomUUID()}, ${tenantId}, 'employee_request', ${ownerId},
        ${attachment.categoryId ?? null}, ${attachment.categoryName}, ${attachment.titleId ?? null}, ${attachment.title},
        ${attachment.fileUrl}, ${attachment.fileName}, ${attachment.fileType ?? null}, ${attachment.fileSize ?? null},
        ${attachment.issuedAt ?? null}, ${attachment.description ?? null}, NOW()
      )
    `;
  }
}

export async function upsertEmployeeRequest(payload: EmployeeRequestFormPayload) {
  const { tenantId, userName } = await requireTenantId();
  const employee = await prisma.employee.findFirst({ where: { id: payload.employeeId, tenantId }, select: { id: true } });
  if (!employee) throw new Error('Employee not found for active tenant.');
  if (!payload.reasonId && payload.requestType !== 'mission') throw new Error('Reason is required.');
  if (payload.rangeType === 'multi_day' && (!payload.startDate || !payload.endDate || payload.endDate < payload.startDate)) {
    throw new Error('Invalid leave date range.');
  }
  if (payload.rangeType === 'hourly' && (!payload.startTime || !payload.endTime || payload.endTime <= payload.startTime)) {
    throw new Error('Invalid hourly range.');
  }
  if (['overtime', 'remote_work'].includes(payload.requestType) && (!payload.startDate || !payload.endDate || payload.endDate < payload.startDate || !payload.startTime || !payload.endTime)) {
    throw new Error('Invalid request date range.');
  }
  if (['overtime', 'remote_work'].includes(payload.requestType) && payload.startDate === payload.endDate && payload.endTime! <= payload.startTime!) {
    throw new Error('Invalid request time range.');
  }
  const currentContract = await getCurrentEmployeeContract(payload.employeeId, tenantId);
  const contractLeave = getContractLeaveBalanceInputs(currentContract, { fallbackToDefaults: false });
  const calculatedDuration = calculateDuration(payload, contractLeave.dailyRequiredMinutes);
  if (!['attendance', 'salary_advance', 'loan'].includes(payload.requestType) && (!calculatedDuration || calculatedDuration <= 0)) {
    throw new Error('Duration must be positive.');
  }
  const status = payload.submissionMode === 'approved' ? 'approved' : payload.status;
  const approvedBy = status === 'approved' ? userName : null;
  const approvedAt = status === 'approved' ? new Date() : null;
  const meta = calculationMeta(payload, calculatedDuration, getContractOvertimeRules(currentContract), Boolean(currentContract));
  const attendanceActionType = payload.requestType === 'attendance' ? null : payload.attendanceActionType ?? null;

  let requestId = payload.id;
  if (requestId) {
    const current = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "EmployeeRequest"
      WHERE "id" = ${requestId} AND "tenantId" = ${tenantId} AND "employeeId" = ${payload.employeeId}
      LIMIT 1
    `;
    if (!current.length) throw new Error('Request not found for active tenant.');
    await prisma.$executeRaw`
      UPDATE "EmployeeRequest"
      SET
        "requestType" = ${payload.requestType}::"EmployeeRequestType",
        "status" = ${status}::"EmployeeRequestStatus",
        "submissionMode" = ${payload.submissionMode}::"EmployeeRequestSubmissionMode",
        "startDate" = ${payload.startDate ?? null},
        "endDate" = ${payload.endDate ?? null},
        "startTime" = ${payload.startTime ?? null},
        "endTime" = ${payload.endTime ?? null},
        "dateTime" = ${payload.dateTime ?? null},
        "rangeType" = ${payload.rangeType ?? null}::"EmployeeRequestRangeType",
        "attendanceActionType" = ${attendanceActionType}::"AttendanceActionType",
        "amount" = ${payload.amount ?? null},
        "loanId" = ${payload.loanId ?? null},
        "installments" = ${payload.installments ?? null},
        "reasonId" = ${payload.reasonId ?? null},
        "description" = ${payload.description?.trim() || null},
        "calculatedDurationMinutes" = ${calculatedDuration},
        "calculationMeta" = ${JSON.stringify(meta)}::jsonb,
        "approvedBy" = ${approvedBy},
        "approvedAt" = ${approvedAt},
        "rejectedBy" = NULL,
        "rejectedAt" = NULL,
        "canceledAt" = CASE WHEN ${status} = 'canceled' THEN NOW() ELSE NULL END,
        "updatedAt" = NOW()
      WHERE "id" = ${requestId}
    `;
  } else {
    requestId = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO "EmployeeRequest" (
        "id", "tenantId", "employeeId", "requestType", "status", "submissionMode",
        "startDate", "endDate", "startTime", "endTime", "dateTime", "rangeType", "attendanceActionType",
        "amount", "loanId", "installments", "reasonId", "description", "calculatedDurationMinutes", "calculationMeta",
        "createdBy", "approvedBy", "approvedAt", "canceledAt", "createdAt", "updatedAt"
      )
      VALUES (
        ${requestId}, ${tenantId}, ${payload.employeeId}, ${payload.requestType}::"EmployeeRequestType",
        ${status}::"EmployeeRequestStatus", ${payload.submissionMode}::"EmployeeRequestSubmissionMode",
        ${payload.startDate ?? null}, ${payload.endDate ?? null}, ${payload.startTime ?? null}, ${payload.endTime ?? null},
        ${payload.dateTime ?? null}, ${payload.rangeType ?? null}::"EmployeeRequestRangeType",
        ${attendanceActionType}::"AttendanceActionType", ${payload.amount ?? null}, ${payload.loanId ?? null},
        ${payload.installments ?? null}, ${payload.reasonId ?? null}, ${payload.description?.trim() || null},
        ${calculatedDuration}, ${JSON.stringify(meta)}::jsonb, ${userName}, ${approvedBy}, ${approvedAt},
        CASE WHEN ${status} = 'canceled' THEN NOW() ELSE NULL END, NOW(), NOW()
      )
    `;
  }
  await replaceAttachments(tenantId, requestId, payload.attachments ?? []);
  return { ok: true as const, id: requestId };
}

export async function updateEmployeeRequestStatus(id: string, status: EmployeeRequestStatus) {
  const { tenantId, userName } = await requireTenantId();
  await prisma.$executeRaw`
    UPDATE "EmployeeRequest"
    SET
      "status" = ${status}::"EmployeeRequestStatus",
      "approvedBy" = CASE WHEN ${status} = 'approved' THEN ${userName} ELSE "approvedBy" END,
      "approvedAt" = CASE WHEN ${status} = 'approved' THEN NOW() WHEN ${status} = 'pending' THEN NULL ELSE "approvedAt" END,
      "rejectedBy" = CASE WHEN ${status} = 'rejected' THEN ${userName} ELSE NULL END,
      "rejectedAt" = CASE WHEN ${status} = 'rejected' THEN NOW() ELSE NULL END,
      "canceledAt" = CASE WHEN ${status} = 'canceled' THEN NOW() ELSE NULL END,
      "updatedAt" = NOW()
    WHERE "id" = ${id} AND "tenantId" = ${tenantId}
  `;
  return { ok: true as const };
}

export async function deleteEmployeeRequest(id: string) {
  const { tenantId } = await requireTenantId();
  await prisma.$transaction([
    prisma.$executeRaw`DELETE FROM "Attachment" WHERE "tenantId" = ${tenantId} AND "ownerType" = 'employee_request' AND "ownerId" = ${id}`,
    prisma.$executeRaw`DELETE FROM "EmployeeRequest" WHERE "id" = ${id} AND "tenantId" = ${tenantId}`,
  ]);
  return { ok: true as const };
}

export async function upsertCompanyLoan(input: Omit<CompanyLoanItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const { tenantId } = await requireTenantId();
  const id = input.id || crypto.randomUUID();
  if (input.id) {
    await prisma.$executeRaw`
      UPDATE "CompanyLoan"
      SET "title" = ${input.title}, "guarantorCount" = ${input.guarantorCount}, "minAmount" = ${input.minAmount},
        "maxAmount" = ${input.maxAmount}, "minInstallments" = ${input.minInstallments}, "maxInstallments" = ${input.maxInstallments},
        "feeRate" = ${input.feeRate}, "interestRate" = ${input.interestRate}, "isActive" = ${input.isActive}, "updatedAt" = NOW()
      WHERE "id" = ${input.id} AND "tenantId" = ${tenantId}
    `;
  } else {
    await prisma.$executeRaw`
      INSERT INTO "CompanyLoan" (
        "id", "tenantId", "title", "guarantorCount", "minAmount", "maxAmount",
        "minInstallments", "maxInstallments", "feeRate", "interestRate", "isActive", "createdAt", "updatedAt"
      )
      VALUES (
        ${id}, ${tenantId}, ${input.title}, ${input.guarantorCount}, ${input.minAmount}, ${input.maxAmount},
        ${input.minInstallments}, ${input.maxInstallments}, ${input.feeRate}, ${input.interestRate}, ${input.isActive}, NOW(), NOW()
      )
    `;
  }
  return { ok: true as const, id };
}

export async function deleteCompanyLoan(id: string) {
  const { tenantId } = await requireTenantId();
  await prisma.$executeRaw`DELETE FROM "CompanyLoan" WHERE "id" = ${id} AND "tenantId" = ${tenantId}`;
  return { ok: true as const };
}
