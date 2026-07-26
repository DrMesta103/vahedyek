import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { getSessionContext } from './auth';
import { DEFAULT_PAYROLL_SETTINGS } from './payroll-business-settings';
import { type EmployeeContractDraft } from './employee-contract-drafts';
import { type EmployeeCurrentContractSummary } from './employee-contracts';

type ContractRow = {
  id: string;
  employeeId: string;
  status: 'draft' | 'active' | 'ended' | 'canceled';
  isCurrent: boolean;
  startDate: string | null;
  endDate: string | null;
  contractNumber: string | null;
  templateId: string | null;
  data: unknown;
  finalizedAt: Date | null;
};

function getDraftData(row: ContractRow) {
  return (row.data && typeof row.data === 'object' ? row.data : {}) as Partial<EmployeeContractDraft>;
}

function isMissingEmployeeContractTable(error: unknown) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  const message = error.message.toLowerCase();
  return message.includes('employeecontract') && (message.includes('does not exist') || message.includes('42p01'));
}

function contractRowToSummary(row: ContractRow): EmployeeCurrentContractSummary {
  const data = getDraftData(row);
  const responsibilities = Array.isArray(data.subject?.responsibilities) ? data.subject?.responsibilities : [];
  const jobTitle = responsibilities[0] || data.subject?.responsibility || data.subject?.jobGroup || data.subject?.contractType || '';
  return {
    id: row.id,
    employeeId: row.employeeId,
    status: row.status,
    isCurrent: row.isCurrent,
    startDate: row.startDate,
    endDate: row.endDate,
    contractNumber: row.contractNumber,
    templateId: row.templateId,
    templateName: data.templateName ?? null,
    jobTitle,
    dailyBaseSalary: Number.isFinite(data.financial?.dailyBaseSalary) ? Number(data.financial?.dailyBaseSalary) : null,
    dailyRequiredMinutes: Number.isFinite(data.financial?.dailyRequiredMinutes)
      ? Number(data.financial?.dailyRequiredMinutes)
      : DEFAULT_PAYROLL_SETTINGS.financial.dailyRequiredMinutes,
    finalizedAt: row.finalizedAt?.toISOString() ?? null,
    data: data as EmployeeContractDraft,
  };
}

function employeeContractTenantFilter(tenantId?: string | null) {
  return tenantId != null ? { tenantId } : {};
}

async function queryCurrentEmployeeContractRows(employeeIds: string[], tenantId?: string | null) {
  if (!employeeIds.length) return [] as ContractRow[];

  return prisma.employeeContract.findMany({
    where: {
      employeeId: { in: employeeIds },
      isCurrent: true,
      status: 'active',
      ...employeeContractTenantFilter(tenantId),
    },
    orderBy: [{ employeeId: 'asc' }, { finalizedAt: 'desc' }, { updatedAt: 'desc' }],
    select: {
      id: true,
      employeeId: true,
      status: true,
      isCurrent: true,
      startDate: true,
      endDate: true,
      contractNumber: true,
      templateId: true,
      data: true,
      finalizedAt: true,
    },
  });
}

export async function getEndedEmployeeIds(employeeIds: string[], tenantId?: string | null) {
  if (!employeeIds.length) return new Set<string>();
  try {
    const rows = await prisma.employeeContract.findMany({
      where: {
        employeeId: { in: employeeIds },
        status: 'ended',
        ...employeeContractTenantFilter(tenantId),
      },
      select: { employeeId: true },
      distinct: ['employeeId'],
    });
    return new Set(rows.map((row) => row.employeeId));
  } catch (error) {
    if (isMissingEmployeeContractTable(error)) return new Set<string>();
    throw error;
  }
}

async function queryEmployeeContractRowsByDate(employeeIds: string[], dateIso: string, tenantId?: string | null) {
  if (!employeeIds.length) return [] as ContractRow[];

  return prisma.employeeContract.findMany({
    where: {
      employeeId: { in: employeeIds },
      status: 'active',
      OR: [{ startDate: null }, { startDate: { lte: dateIso } }],
      AND: [{ OR: [{ endDate: null }, { endDate: { gte: dateIso } }] }],
      ...employeeContractTenantFilter(tenantId),
    },
    orderBy: [{ employeeId: 'asc' }, { finalizedAt: 'desc' }, { updatedAt: 'desc' }],
    select: {
      id: true,
      employeeId: true,
      status: true,
      isCurrent: true,
      startDate: true,
      endDate: true,
      contractNumber: true,
      templateId: true,
      data: true,
      finalizedAt: true,
    },
  });
}

export async function getCurrentEmployeeContract(employeeId: string, tenantId?: string | null) {
  try {
    const rows = await queryCurrentEmployeeContractRows([employeeId], tenantId);
    return rows[0] ? contractRowToSummary(rows[0]) : null;
  } catch (error) {
    if (isMissingEmployeeContractTable(error)) return null;
    throw error;
  }
}

/** Returns the active contract, or the most recently ended contract for detail-only display. */
export async function getEmployeeDetailContract(employeeId: string, tenantId?: string | null) {
  try {
    const current = await getCurrentEmployeeContract(employeeId, tenantId);
    if (current) return current;

    const historical = await prisma.employeeContract.findFirst({
      where: {
        employeeId,
        status: { in: ['ended', 'canceled'] },
        ...employeeContractTenantFilter(tenantId),
      },
      orderBy: [{ endDate: 'desc' }, { finalizedAt: 'desc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        employeeId: true,
        status: true,
        isCurrent: true,
        startDate: true,
        endDate: true,
        contractNumber: true,
        templateId: true,
        data: true,
        finalizedAt: true,
      },
    });
    return historical ? contractRowToSummary(historical) : null;
  } catch (error) {
    if (isMissingEmployeeContractTable(error)) return null;
    throw error;
  }
}

export async function getCurrentEmployeeContracts(employeeIds: string[], tenantId?: string | null) {
  if (!employeeIds.length) return new Map<string, EmployeeCurrentContractSummary>();
  try {
    const rows = await queryCurrentEmployeeContractRows(employeeIds, tenantId);
    return new Map(rows.map((row) => [row.employeeId, contractRowToSummary(row)]));
  } catch (error) {
    if (isMissingEmployeeContractTable(error)) return new Map();
    throw error;
  }
}

export async function getEmployeeContractForDate(employeeId: string, dateIso: string, tenantId?: string | null) {
  try {
    const rows = await queryEmployeeContractRowsByDate([employeeId], dateIso, tenantId);
    return rows[0] ? contractRowToSummary(rows[0]) : null;
  } catch (error) {
    if (isMissingEmployeeContractTable(error)) return null;
    throw error;
  }
}

export async function getEmployeeContractsForMonth(
  employeeId: string,
  monthStart: string,
  monthEnd: string,
  tenantId?: string | null,
) {
  try {
    const rows = await prisma.employeeContract.findMany({
      where: {
        employeeId,
        status: 'active',
        OR: [{ startDate: null }, { startDate: { lte: monthEnd } }],
        AND: [{ OR: [{ endDate: null }, { endDate: { gte: monthStart } }] }],
        ...employeeContractTenantFilter(tenantId),
      },
      orderBy: [{ finalizedAt: 'desc' }, { updatedAt: 'desc' }],
      select: {
        id: true,
        employeeId: true,
        status: true,
        isCurrent: true,
        startDate: true,
        endDate: true,
        contractNumber: true,
        templateId: true,
        data: true,
        finalizedAt: true,
      },
    });
    return rows.map(contractRowToSummary);
  } catch (error) {
    if (isMissingEmployeeContractTable(error)) return [];
    throw error;
  }
}

export async function finalizeEmployeeContractDraft(employeeId: string, draft: EmployeeContractDraft) {
  const session = await getSessionContext();
  if (!session?.tenantId) throw new Error('tenant_not_selected');
  const tenantId = session.tenantId;
  const employee = await prisma.employee.findFirst({ where: { id: employeeId, tenantId }, select: { id: true } });
  if (!employee) throw new Error('employee_not_found');
  if (draft.employeeId !== employeeId) throw new Error('invalid_employee_contract');

  const now = new Date();
  const data = {
    ...draft,
    status: 'active',
    isCurrent: true,
    finalizedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  const dataJson = JSON.stringify(data);

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      UPDATE "EmployeeContract"
      SET "isCurrent" = false, status = 'ended', "updatedAt" = ${now}
      WHERE "tenantId" = ${tenantId}
        AND "employeeId" = ${employeeId}
        AND "isCurrent" = true
        AND id <> ${draft.id}
    `;
    await tx.$executeRaw`
      INSERT INTO "EmployeeContract" (
        id, "tenantId", "employeeId", status, "isCurrent", "startDate", "endDate", "contractNumber", "templateId", data, "finalizedAt", "createdAt", "updatedAt"
      )
      VALUES (
        ${draft.id}, ${tenantId}, ${employeeId}, 'active', true, ${draft.timing.startDate || null}, ${draft.timing.endDate || null},
        ${draft.contractNumber || draft.timing.registrationNumber || null}, ${draft.templateId}, ${dataJson}::jsonb, ${now}, ${now}, ${now}
      )
      ON CONFLICT (id) DO UPDATE SET
        status = 'active',
        "isCurrent" = true,
        "startDate" = EXCLUDED."startDate",
        "endDate" = EXCLUDED."endDate",
        "contractNumber" = EXCLUDED."contractNumber",
        "templateId" = EXCLUDED."templateId",
        data = EXCLUDED.data,
        "finalizedAt" = EXCLUDED."finalizedAt",
        "updatedAt" = EXCLUDED."updatedAt"
    `;
  });

  return getCurrentEmployeeContract(employeeId, tenantId);
}
