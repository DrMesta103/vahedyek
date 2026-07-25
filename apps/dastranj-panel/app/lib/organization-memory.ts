import { getSessionContext } from './auth';
import { prisma } from './prisma';

type EventInput = {
  tenantId: string;
  organizationUnitId?: string | null;
  positionId?: string | null;
  entityType: 'UNIT' | 'POSITION' | 'ASSIGNMENT' | 'CONTRACT' | 'EMPLOYMENT_ORDER' | 'WORKFLOW' | 'PERMISSION' | 'DOCUMENT' | 'JOB_CLASSIFICATION';
  eventType: string;
  description: string;
  previousValue?: unknown;
  newValue?: unknown;
  effectiveAt?: Date | null;
  reason?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  documentId?: string | null;
};

export async function recordOrganizationEvent(input: EventInput) {
  const session = await getSessionContext();
  if (!session?.userId || session.tenantId !== input.tenantId) throw new Error('ثبت رویداد سازمانی خارج از کسب‌وکار جاری مجاز نیست.');
  const membership = await prisma.userTenantMembership.findUnique({ where: { userId_tenantId: { userId: session.userId, tenantId: input.tenantId } }, select: { role: true } });
  return prisma.organizationEvent.create({
    data: {
      tenantId: input.tenantId,
      organizationUnitId: input.organizationUnitId ?? null,
      positionId: input.positionId ?? null,
      entityType: input.entityType,
      eventType: input.eventType,
      description: input.description,
      previousValue: input.previousValue == null ? undefined : input.previousValue as never,
      newValue: input.newValue == null ? undefined : input.newValue as never,
      effectiveAt: input.effectiveAt ?? null,
      actorUserId: session.userId,
      actorRole: membership?.role ?? null,
      reason: input.reason ?? null,
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId ?? null,
      documentId: input.documentId ?? null,
    },
  });
}

export function changedFields(before: Record<string, unknown>, after: Record<string, unknown>) {
  return Object.keys(after).filter((key) => JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null));
}
