import { randomUUID } from 'node:crypto';
import type { Prisma, TaaviaAiUsageMetricType, TaaviaAiUsageUnitType } from '../prisma-client';
import { prisma } from '../prisma';
import { assertValidPurpose, type TaaviaBrandAiModelPurpose } from '../taavia-ai-models';

type UsageItemInput = {
  usageMetricType: string;
  usageUnitType: string;
  usageQuantity: number | string;
};

export type RecordTaaviaUsageInput = {
  tenantId: string;
  brandId: string;
  taaviaBrandAiModelAssignmentId: string;
  aiProviderAccountId: string;
  aiProviderModelId: string;
  purpose: string;
  usageReferenceId: string;
  operationCode: string;
  resourceType: string;
  resourceId?: string | null;
  status: 'SUCCEEDED' | 'FAILED' | 'CANCELED';
  startedAt: string;
  finishedAt: string;
  usageItems: UsageItemInput[];
};

const metricMap: Record<string, TaaviaAiUsageMetricType> = {
  INPUT_TOKEN: 'INPUT_TOKEN', CACHED_INPUT_TOKEN: 'CACHED_INPUT_TOKEN', OUTPUT_TOKEN: 'OUTPUT_TOKEN', IMAGE: 'IMAGE', AUDIO: 'AUDIO', VIDEO: 'VIDEO', DOCUMENT_PAGE: 'DOCUMENT_PAGE', REQUEST: 'REQUEST', CHARACTER: 'CHARACTER',
};
const unitMap: Record<string, TaaviaAiUsageUnitType> = {
  TOKEN: 'TOKEN', ITEM: 'ITEM', SECOND: 'SECOND', MINUTE: 'MINUTE', PAGE: 'PAGE', REQUEST: 'REQUEST', CHARACTER: 'CHARACTER',
};

function id() {
  return randomUUID().replaceAll('-', '');
}

export async function recordTaaviaBrandAiUsage(input: RecordTaaviaUsageInput) {
  if (!input.usageReferenceId.trim()) throw new Error('UsageReferenceId الزامی است.');
  if (!input.operationCode.trim() || !input.resourceType.trim()) throw new Error('OperationCode و ResourceType الزامی هستند.');
  assertValidPurpose(input.purpose);
  const purpose = input.purpose as TaaviaBrandAiModelPurpose;
  const startedAt = new Date(input.startedAt);
  const finishedAt = new Date(input.finishedAt);
  if (Number.isNaN(startedAt.getTime()) || Number.isNaN(finishedAt.getTime()) || finishedAt < startedAt) throw new Error('بازه زمانی usage معتبر نیست.');

  const items = input.usageItems.map((item) => {
    const quantity = Number(item.usageQuantity);
    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error('UsageQuantity باید بزرگ‌تر از صفر باشد.');
    const metric = metricMap[item.usageMetricType];
    const unit = unitMap[item.usageUnitType];
    if (!metric || !unit) throw new Error('Metric یا Unit usage معتبر نیست.');
    return { metric, unit, quantity };
  });
  if (items.length === 0) throw new Error('Usage بدون مصرف مثبت ثبت نمی‌شود.');

  const existing = await prisma.taaviaBrandAiModelUsage.findUnique({ where: { usageReferenceId: input.usageReferenceId } });
  if (existing) return { id: existing.id, created: false };

  const result = await prisma.$transaction(async (tx) => {
    const assignment = await tx.taaviaBrandAiModelAssignment.findFirst({ where: { id: input.taaviaBrandAiModelAssignmentId, tenantId: input.tenantId, brandId: input.brandId, purpose, effectiveTo: null } });
    if (!assignment || assignment.aiProviderAccountId !== input.aiProviderAccountId || assignment.aiProviderModelId !== input.aiProviderModelId) throw new Error('Snapshot تخصیص مدل با تخصیص فعال سازگار نیست.');

    const usage = await tx.taaviaBrandAiModelUsage.create({
      data: {
        id: id(), tenantId: input.tenantId, brandId: input.brandId, taaviaBrandAiModelAssignmentId: assignment.id, aiProviderAccountId: input.aiProviderAccountId, aiProviderModelId: input.aiProviderModelId, purpose, usageReferenceId: input.usageReferenceId.trim(), operationCode: input.operationCode.trim(), resourceType: input.resourceType.trim(), resourceId: input.resourceId?.trim() || null, status: input.status, startedAt, finishedAt, durationMilliseconds: BigInt(finishedAt.getTime() - startedAt.getTime()), createdAt: new Date(),
      },
    });
    await tx.taaviaBrandAiModelUsageItem.createMany({ data: items.map((item) => ({ id: id(), tenantId: input.tenantId, taaviaBrandAiModelUsageId: usage.id, usageMetricType: item.metric, usageUnitType: item.unit, usageQuantity: item.quantity })) });
    await tx.integrationOutbox.create({ data: { id: id(), eventType: 'taavia.brand-ai-usage-created', aggregateId: usage.id, payload: { usageId: usage.id, usageReferenceId: input.usageReferenceId, brandId: input.brandId, assignmentId: assignment.id }, version: 1, occurredAt: new Date(), createdAt: new Date() } });
    return usage;
  });
  return { id: result.id, created: true };
}
