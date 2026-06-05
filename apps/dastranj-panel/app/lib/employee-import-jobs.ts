import { prisma } from './prisma';
import type {
  QuickEmployeeImportJobDetails,
  QuickEmployeeImportJobInvitationChannel,
  QuickEmployeeImportJobMockInvitationStatus,
  QuickEmployeeImportJobRowSummary,
  QuickEmployeeImportJobStatus,
  QuickEmployeeImportJobSummary,
  QuickEmployeeImportJobType,
  QuickEmployeeImportJobRowStatus,
} from '../(panel)/quick-setup/_components/quick-setup.types';

type EmployeeImportJobRecord = {
  id: string;
  type: QuickEmployeeImportJobType;
  fileName: string;
  status: QuickEmployeeImportJobStatus;
  totalCount: number;
  processedCount: number;
  createdCount: number;
  existingCount: number;
  duplicateCount: number;
  invalidCount: number;
  failedCount: number;
  mockInvitedCount: number;
  createdAt: Date;
  updatedAt: Date;
};

type EmployeeImportJobRowRecord = {
  id: string;
  rowNumber: number;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string | null;
  employeeId: string | null;
  status: QuickEmployeeImportJobRowStatus;
  message: string | null;
  mockInvitationStatus: QuickEmployeeImportJobMockInvitationStatus;
  invitationChannel: QuickEmployeeImportJobInvitationChannel | null;
  processedAt: Date | null;
};

function toSummary(job: EmployeeImportJobRecord): QuickEmployeeImportJobSummary {
  return {
    id: job.id,
    type: job.type,
    fileName: job.fileName,
    status: job.status,
    totalCount: job.totalCount,
    processedCount: job.processedCount,
    createdCount: job.createdCount,
    existingCount: job.existingCount,
    duplicateCount: job.duplicateCount,
    invalidCount: job.invalidCount,
    failedCount: job.failedCount,
    mockInvitedCount: job.mockInvitedCount,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

function toRowSummary(row: EmployeeImportJobRowRecord): QuickEmployeeImportJobRowSummary {
  return {
    id: row.id,
    rowNumber: row.rowNumber,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    mobile: row.mobile,
    employeeId: row.employeeId,
    status: row.status,
    message: row.message,
    mockInvitationStatus: row.mockInvitationStatus,
    invitationChannel: row.invitationChannel,
    processedAt: row.processedAt?.toISOString() ?? null,
  };
}

export async function listEmployeeImportJobsForTenant(tenantId: string, take = 10) {
  const jobs = (await prisma.employeeImportJob.findMany({
    where: { tenantId },
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    take,
  })) as EmployeeImportJobRecord[];
  return jobs.map(toSummary);
}

export async function getEmployeeImportJobDetailsForTenant(tenantId: string, jobId: string): Promise<QuickEmployeeImportJobDetails | null> {
  const job = (await prisma.employeeImportJob.findFirst({
    where: { id: jobId, tenantId },
    include: {
      rows: {
        orderBy: { rowNumber: 'asc' },
      },
    },
  })) as (EmployeeImportJobRecord & { rows: EmployeeImportJobRowRecord[] }) | null;

  if (!job) return null;

  return {
    ...toSummary(job),
    rows: job.rows.map(toRowSummary),
  };
}

