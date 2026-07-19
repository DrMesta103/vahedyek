import { prisma } from '../prisma';
import type { AiProviderModelUsageStatusV2, AiProviderUsageMetricTypeV2, AiProviderUsageUnitTypeV2, Prisma } from '../prisma-client';
import { calculateUsageItemCostUsd } from '../ai-provider-v2-usage-cost';

type UsageItemInput = {
  usageMetricType:
    | 'INPUT_TOKEN'
    | 'CACHED_INPUT_TOKEN'
    | 'OUTPUT_TOKEN'
    | 'IMAGE'
    | 'AUDIO'
    | 'VIDEO'
    | 'DOCUMENT_PAGE'
    | 'REQUEST'
    | 'CHARACTER';
  usageUnitType: 'TOKEN' | 'ITEM' | 'SECOND' | 'MINUTE' | 'PAGE' | 'REQUEST' | 'CHARACTER';
  usageQuantity: number;
};

export type RecordAiProviderModelUsageV2Input = {
  usageReferenceId: string;
  aiProviderModelId: string;
  consumerCode: string;
  operationCode: string;
  tenantId?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  status: 'SUCCEEDED' | 'FAILED' | 'CANCELED';
  startedAt: string; // ISO
  finishedAt: string; // ISO
  usageItems: UsageItemInput[];
};

function toMetric(value: UsageItemInput['usageMetricType']): AiProviderUsageMetricTypeV2 {
  switch (value) {
    case 'INPUT_TOKEN':
      return 'InputToken';
    case 'CACHED_INPUT_TOKEN':
      return 'CachedInputToken';
    case 'OUTPUT_TOKEN':
      return 'OutputToken';
    case 'IMAGE':
      return 'Image';
    case 'AUDIO':
      return 'Audio';
    case 'VIDEO':
      return 'Video';
    case 'DOCUMENT_PAGE':
      return 'DocumentPage';
    case 'REQUEST':
      return 'Request';
    case 'CHARACTER':
      return 'Character';
  }
}

function toUnit(value: UsageItemInput['usageUnitType']): AiProviderUsageUnitTypeV2 {
  switch (value) {
    case 'TOKEN':
      return 'Token';
    case 'ITEM':
      return 'Item';
    case 'SECOND':
      return 'Second';
    case 'MINUTE':
      return 'Minute';
    case 'PAGE':
      return 'Page';
    case 'REQUEST':
      return 'Request';
    case 'CHARACTER':
      return 'Character';
  }
}

function toStatus(value: RecordAiProviderModelUsageV2Input['status']): AiProviderModelUsageStatusV2 {
  switch (value) {
    case 'SUCCEEDED':
      return 'Succeeded';
    case 'FAILED':
      return 'Failed';
    case 'CANCELED':
      return 'Canceled';
  }
}

function assertNonEmpty(value: string, message: string) {
  if (!value.trim()) throw new Error(message);
}

function assertUsageItemRules(item: UsageItemInput) {
  if (!(Number.isFinite(item.usageQuantity) && item.usageQuantity > 0)) {
    throw new Error('UsageQuantity باید بزرگ‌تر از صفر باشد.');
  }
}

async function resolvePricingForTime(modelId: string, startedAt: Date) {
  return prisma.aiProviderModelPricingV2.findFirst({
    where: {
      aiProviderModelId: modelId,
      isDeleted: false,
      effectiveFrom: { lte: startedAt },
      OR: [{ effectiveTo: null }, { effectiveTo: { gt: startedAt } }],
    },
    include: { priceItems: { where: { isDeleted: false } } },
    orderBy: [{ effectiveFrom: 'desc' }],
  });
}

export async function recordAiProviderModelUsageV2(input: {
  data: RecordAiProviderModelUsageV2Input;
  createdAt?: Date;
}) {
  assertNonEmpty(input.data.usageReferenceId, 'UsageReferenceId الزامی است.');
  assertNonEmpty(input.data.aiProviderModelId, 'ModelId الزامی است.');
  assertNonEmpty(input.data.consumerCode, 'ConsumerCode الزامی است.');
  assertNonEmpty(input.data.operationCode, 'OperationCode الزامی است.');

  const startedAt = new Date(input.data.startedAt);
  const finishedAt = new Date(input.data.finishedAt);
  if (Number.isNaN(startedAt.getTime()) || Number.isNaN(finishedAt.getTime())) {
    throw new Error('StartedAt/FinishedAt معتبر نیست.');
  }
  if (finishedAt < startedAt) throw new Error('FinishedAt باید بعد از StartedAt باشد.');

  const usageItems = input.data.usageItems ?? [];
  for (const item of usageItems) assertUsageItemRules(item);

  const createdAt = input.createdAt ?? new Date();
  const durationMilliseconds = BigInt(Math.max(0, finishedAt.getTime() - startedAt.getTime()));

  // Idempotency: if exists, return existing record id and totalCost.
  const existing = await prisma.aiProviderModelUsageV2.findUnique({
    where: { usageReferenceId: input.data.usageReferenceId },
    select: { id: true, totalCostUsd: true },
  });
  if (existing) {
    return { id: existing.id, totalCostUsd: Number(existing.totalCostUsd), created: false };
  }

  const pricing = await resolvePricingForTime(input.data.aiProviderModelId, startedAt);
  const priceItemsByMetric = new Map<AiProviderUsageMetricTypeV2, { id: string; unitQuantity: number; priceUsd: number }>();
  if (pricing) {
    for (const pi of pricing.priceItems) {
      priceItemsByMetric.set(pi.usageMetricType, {
        id: pi.id,
        unitQuantity: Number(pi.unitQuantity),
        priceUsd: Number(pi.priceUsd),
      });
    }
  }

  const computedItems = usageItems.map((item) => {
    const metric = toMetric(item.usageMetricType);
    const unit = toUnit(item.usageUnitType);

    const matched = priceItemsByMetric.get(metric);
    if (!matched) {
      throw new Error(`برای معیار ${item.usageMetricType} آیتم قیمت فعال پیدا نشد.`);
    }
    if (!(Number.isFinite(matched.unitQuantity) && matched.unitQuantity > 0)) {
      throw new Error('UnitQuantity معتبر نیست.');
    }
    if (!(Number.isFinite(matched.priceUsd) && matched.priceUsd >= 0)) {
      throw new Error('PriceUsd معتبر نیست.');
    }

    const calculatedCostUsd = calculateUsageItemCostUsd({
      usageQuantity: item.usageQuantity,
      appliedUnitQuantity: matched.unitQuantity,
      appliedPriceUsd: matched.priceUsd,
    });

    return {
      metric,
      unit,
      usageQuantity: item.usageQuantity,
      priceItemId: matched.id,
      appliedUnitQuantity: matched.unitQuantity,
      appliedPriceUsd: matched.priceUsd,
      calculatedCostUsd,
    };
  });

  const totalCostUsd = computedItems.reduce((sum, it) => sum + it.calculatedCostUsd, 0);

  const result = await prisma.$transaction(async (tx) => {
    const usage = await tx.aiProviderModelUsageV2.create({
      data: {
        id: crypto.randomUUID().replaceAll('-', ''),
        aiProviderModelId: input.data.aiProviderModelId,
        usageReferenceId: input.data.usageReferenceId,
        consumerCode: input.data.consumerCode,
        operationCode: input.data.operationCode,
        tenantId: input.data.tenantId ?? null,
        resourceType: input.data.resourceType ?? null,
        resourceId: input.data.resourceId ?? null,
        status: toStatus(input.data.status),
        startedAt,
        finishedAt,
        durationMilliseconds,
        aiProviderModelPricingId: pricing?.id ?? null,
        totalCostUsd,
        createdAt,
      },
    });

    if (computedItems.length > 0) {
      await tx.aiProviderModelUsageItemV2.createMany({
        data: computedItems.map((it) => ({
          id: crypto.randomUUID().replaceAll('-', ''),
          aiProviderModelUsageId: usage.id,
          aiProviderModelPriceItemId: it.priceItemId,
          usageMetricType: it.metric,
          usageUnitType: it.unit,
          usageQuantity: it.usageQuantity,
          appliedUnitQuantity: it.appliedUnitQuantity,
          appliedPriceUsd: it.appliedPriceUsd,
          calculatedCostUsd: it.calculatedCostUsd,
        })),
      });
    }

    return usage;
  });

  return { id: result.id, totalCostUsd, created: true };
}

