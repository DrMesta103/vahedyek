import type { Prisma } from '@/lib/prisma-client';

export type AuditDiff = {
  field: string;
  label: string;
  before: string;
  after: string;
  beforeMeta?: string;
  afterMeta?: string;
};

export type AuditLogInput = {
  tenantId: string;
  actorUserId?: string | null;
  actorName?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  entityLabel?: string | null;
  summary: string;
  details?: Prisma.InputJsonValue;
  diff?: AuditDiff[];
  metadata?: Prisma.InputJsonValue;
  request?: Request;
};

type AuditClient = Pick<Prisma.TransactionClient, 'auditLog'>;

function getHeader(request: Request | undefined, name: string) {
  return request?.headers.get(name) ?? null;
}

function getIpAddress(request: Request | undefined) {
  const forwarded = getHeader(request, 'x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || null;
  return getHeader(request, 'x-real-ip');
}

export function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'خالی';
  if (typeof value === 'number') return new Intl.NumberFormat('fa-IR').format(value);
  if (typeof value === 'bigint') return new Intl.NumberFormat('fa-IR').format(Number(value));
  if (typeof value === 'boolean') return value ? 'بله' : 'خیر';
  if (value instanceof Date) return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(value);
  if (Array.isArray(value)) return value.length ? `${new Intl.NumberFormat('fa-IR').format(value.length)} مورد` : 'بدون مورد';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function comparable(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return value ?? '';
}

export function buildFieldDiffs<T extends Record<string, unknown>>(
  before: T | null | undefined,
  after: T | null | undefined,
  labels: Partial<Record<keyof T, string>>,
) {
  const diffs: AuditDiff[] = [];
  for (const key of Object.keys(labels) as Array<keyof T>) {
    const oldValue = before?.[key];
    const newValue = after?.[key];
    if (comparable(oldValue) === comparable(newValue)) continue;
    diffs.push({
      field: String(key),
      label: labels[key] ?? String(key),
      before: formatAuditValue(oldValue),
      after: formatAuditValue(newValue),
    });
  }
  return diffs;
}

export async function recordAuditLogTx(tx: AuditClient, input: AuditLogInput) {
  return tx.auditLog.create({
    data: {
      tenantId: input.tenantId,
      actorUserId: input.actorUserId ?? null,
      actorName: input.actorName || 'کاربر ناشناس',
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      entityLabel: input.entityLabel ?? null,
      summary: input.summary,
      details: input.details ?? {},
      diff: input.diff ?? [],
      metadata: input.metadata ?? {},
      ipAddress: getIpAddress(input.request),
      userAgent: getHeader(input.request, 'user-agent'),
    },
  });
}

export async function recordAuditLog(input: AuditLogInput) {
  try {
    const { prisma } = await import('./prisma');
    return await recordAuditLogTx(prisma, input);
  } catch (error) {
    console.error('Audit log write failed', error);
    return null;
  }
}

export function getActorName(session: { user?: { fullName?: string | null; email?: string | null; mobile?: string | null } } | null | undefined) {
  return session?.user?.fullName || session?.user?.email || session?.user?.mobile || 'کاربر ناشناس';
}
