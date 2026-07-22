import { prisma } from './prisma';
import { getSessionContext } from './auth';

type EmployeeAuditInput = {
  tenantId: string;
  employeeId: string;
  action: string;
  fieldKey?: string;
  oldValue?: string | null;
  newValue?: string | null;
  source?: string;
  reason?: string;
  otpVerified?: boolean;
};

const SENSITIVE_FIELDS = new Set(['nationalId', 'mobile1', 'mobile2', 'email', 'identityPhotoUrl', 'bankAccounts', 'health']);

function mask(value: string | null | undefined, fieldKey?: string) {
  if (!value) return null;
  if (!fieldKey || !SENSITIVE_FIELDS.has(fieldKey)) return value;
  if (fieldKey === 'identityPhotoUrl' || fieldKey === 'health') return '[REDACTED]';
  if (fieldKey === 'email') {
    const [local, domain] = value.split('@');
    return `${local.slice(0, 2)}***@${domain ?? ''}`;
  }
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 4) return '****';
  return `${digits.slice(0, 3)}***${digits.slice(-2)}`;
}

export async function createEmployeeAuditLog(input: EmployeeAuditInput) {
  const session = await getSessionContext();
  const membership = session?.userId
    ? await prisma.userTenantMembership.findUnique({
        where: { userId_tenantId: { userId: session.userId, tenantId: input.tenantId } },
        select: { role: true },
      })
    : null;
  return prisma.employeeAuditLog.create({
    data: {
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      action: input.action,
      fieldKey: input.fieldKey ?? null,
      oldValue: mask(input.oldValue, input.fieldKey),
      newValue: mask(input.newValue, input.fieldKey),
      actorUserId: session?.userId ?? null,
      actorRole: membership?.role ?? null,
      source: input.source ?? 'panel',
      otpVerified: input.otpVerified ?? false,
      reason: input.reason ?? null,
    },
  });
}

export { mask as maskEmployeeAuditValue };
