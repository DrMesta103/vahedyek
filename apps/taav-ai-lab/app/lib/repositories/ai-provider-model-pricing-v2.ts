import { prisma } from '../prisma';
import type {
  AiProviderModelPriceItemV2Public,
  AiProviderModelPricingV2Public,
  CreateAiProviderModelPricingV2Input,
  EndAiProviderModelPricingV2Input,
} from '../types/ai-provider-v2';
import type { Prisma } from '@prisma/client';

function toNumber(value: { toString(): string } | number) {
  return Number(value);
}

function mapMetricToPrisma(value: any): Prisma.AiProviderUsageMetricTypeV2 {
  const v = String(value).toUpperCase();
  if (v === 'INPUT_TOKEN') return 'InputToken';
  if (v === 'CACHED_INPUT_TOKEN') return 'CachedInputToken';
  if (v === 'OUTPUT_TOKEN') return 'OutputToken';
  if (v === 'IMAGE') return 'Image';
  if (v === 'AUDIO') return 'Audio';
  if (v === 'VIDEO') return 'Video';
  if (v === 'DOCUMENT_PAGE') return 'DocumentPage';
  if (v === 'REQUEST') return 'Request';
  if (v === 'CHARACTER') return 'Character';
  throw new Error('UsageMetricType معتبر نیست.');
}

function mapUnitToPrisma(value: any): Prisma.AiProviderUsageUnitTypeV2 {
  const v = String(value).toUpperCase();
  if (v === 'TOKEN') return 'Token';
  if (v === 'ITEM') return 'Item';
  if (v === 'SECOND') return 'Second';
  if (v === 'MINUTE') return 'Minute';
  if (v === 'PAGE') return 'Page';
  if (v === 'REQUEST') return 'Request';
  if (v === 'CHARACTER') return 'Character';
  throw new Error('UsageUnitType معتبر نیست.');
}

function mapMetricFromPrisma(value: Prisma.AiProviderUsageMetricTypeV2) {
  switch (value) {
    case 'InputToken':
      return 'INPUT_TOKEN' as const;
    case 'CachedInputToken':
      return 'CACHED_INPUT_TOKEN' as const;
    case 'OutputToken':
      return 'OUTPUT_TOKEN' as const;
    case 'Image':
      return 'IMAGE' as const;
    case 'Audio':
      return 'AUDIO' as const;
    case 'Video':
      return 'VIDEO' as const;
    case 'DocumentPage':
      return 'DOCUMENT_PAGE' as const;
    case 'Request':
      return 'REQUEST' as const;
    case 'Character':
      return 'CHARACTER' as const;
  }
}

function mapUnitFromPrisma(value: Prisma.AiProviderUsageUnitTypeV2) {
  switch (value) {
    case 'Token':
      return 'TOKEN' as const;
    case 'Item':
      return 'ITEM' as const;
    case 'Second':
      return 'SECOND' as const;
    case 'Minute':
      return 'MINUTE' as const;
    case 'Page':
      return 'PAGE' as const;
    case 'Request':
      return 'REQUEST' as const;
    case 'Character':
      return 'CHARACTER' as const;
  }
}

function mapPriceItem(row: any): AiProviderModelPriceItemV2Public {
  return {
    id: row.id,
    aiProviderModelPricingId: row.aiProviderModelPricingId,
    usageMetricType: mapMetricFromPrisma(row.usageMetricType),
    usageUnitType: mapUnitFromPrisma(row.usageUnitType),
    unitQuantity: toNumber(row.unitQuantity),
    priceUsd: toNumber(row.priceUsd),
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    updatedBy: row.updatedBy,
    updatedAt: row.updatedAt.toISOString(),
    isDeleted: row.isDeleted,
    deletedBy: row.deletedBy,
    deletedAt: row.deletedAt?.toISOString() ?? null,
  };
}

function mapPricing(row: any): AiProviderModelPricingV2Public {
  return {
    id: row.id,
    aiProviderModelId: row.aiProviderModelId,
    effectiveFrom: row.effectiveFrom.toISOString(),
    effectiveTo: row.effectiveTo?.toISOString() ?? null,
    endedBy: row.endedBy ?? null,
    isDeleted: row.isDeleted,
    deletedAt: row.deletedAt?.toISOString() ?? null,
    deletedBy: row.deletedBy ?? null,
    createdBy: row.createdBy,
    createdAt: row.createdAt.toISOString(),
    priceItems: (row.priceItems ?? []).map(mapPriceItem),
  };
}

async function assertNoOverlap(modelId: string, effectiveFrom: Date) {
  const overlapping = await prisma.aiProviderModelPricingV2.findFirst({
    where: {
      aiProviderModelId: modelId,
      isDeleted: false,
      OR: [
        { effectiveTo: null, effectiveFrom: { lte: effectiveFrom } },
        { effectiveTo: { gte: effectiveFrom } },
      ],
    },
    select: { id: true },
  });
  if (overlapping) throw new Error('بازه قیمت‌گذاری با بازه‌های قبلی هم‌پوشانی دارد.');
}

export async function listAiProviderModelPricingsV2(input: { modelId: string }) {
  const rows = await prisma.aiProviderModelPricingV2.findMany({
    where: { aiProviderModelId: input.modelId },
    include: { priceItems: { orderBy: [{ usageMetricType: 'asc' }] } },
    orderBy: [{ effectiveFrom: 'desc' }],
  });
  return rows.map(mapPricing);
}

export async function getCurrentAiProviderModelPricingV2(input: { modelId: string }) {
  const row = await prisma.aiProviderModelPricingV2.findFirst({
    where: { aiProviderModelId: input.modelId, effectiveTo: null, isDeleted: false },
    include: { priceItems: { where: { isDeleted: false }, orderBy: [{ usageMetricType: 'asc' }] } },
    orderBy: [{ effectiveFrom: 'desc' }],
  });
  return row ? mapPricing(row) : null;
}

export async function createAiProviderModelPricingV2(input: {
  modelId: string;
  data: CreateAiProviderModelPricingV2Input;
  actorUserId: string;
}): Promise<AiProviderModelPricingV2Public | null> {
  const model = await prisma.aiProviderModelV2.findUnique({ where: { id: input.modelId } });
  if (!model) return null;

  const effectiveFrom = new Date(input.data.effectiveFrom);
  if (Number.isNaN(effectiveFrom.getTime())) throw new Error('تاریخ شروع دوره معتبر نیست.');

  const now = new Date();
  const items = input.data.priceItems ?? [];
  if (items.length === 0) throw new Error('حداقل یک آیتم قیمت لازم است.');
  for (const item of items) {
    if (!(Number.isFinite(item.unitQuantity) && item.unitQuantity > 0)) throw new Error('مقدار واحد باید بزرگ‌تر از صفر باشد.');
    if (!(Number.isFinite(item.priceUsd) && item.priceUsd >= 0)) throw new Error('قیمت دلار نمی‌تواند منفی باشد.');
  }

  await assertNoOverlap(input.modelId, effectiveFrom);

  const created = await prisma.$transaction(async (tx) => {
    const pricing = await tx.aiProviderModelPricingV2.create({
      data: {
        id: crypto.randomUUID().replaceAll('-', ''),
        aiProviderModelId: input.modelId,
        effectiveFrom,
        effectiveTo: null,
        endedBy: null,
        isDeleted: false,
        createdBy: input.actorUserId,
        createdAt: now,
      },
    });

    await tx.aiProviderModelPriceItemV2.createMany({
      data: items.map((item) => ({
        id: crypto.randomUUID().replaceAll('-', ''),
        aiProviderModelPricingId: pricing.id,
        usageMetricType: mapMetricToPrisma(item.usageMetricType),
        usageUnitType: mapUnitToPrisma(item.usageUnitType),
        unitQuantity: item.unitQuantity,
        priceUsd: item.priceUsd,
        createdBy: input.actorUserId,
        createdAt: now,
        updatedBy: input.actorUserId,
        updatedAt: now,
        isDeleted: false,
      })),
    });

    return tx.aiProviderModelPricingV2.findUniqueOrThrow({
      where: { id: pricing.id },
      include: { priceItems: true },
    });
  });

  return mapPricing(created);
}

export async function endAiProviderModelPricingV2(input: {
  pricingId: string;
  data: EndAiProviderModelPricingV2Input;
  actorUserId: string;
}) {
  const pricing = await prisma.aiProviderModelPricingV2.findUnique({ where: { id: input.pricingId } });
  if (!pricing) return null;
  if (pricing.isDeleted) throw new Error('این دوره حذف شده است.');
  if (pricing.effectiveTo) throw new Error('این دوره قبلاً بسته شده است.');

  const effectiveTo = new Date(input.data.effectiveTo);
  if (Number.isNaN(effectiveTo.getTime())) throw new Error('EffectiveTo معتبر نیست.');
  if (effectiveTo <= pricing.effectiveFrom) throw new Error('EffectiveTo باید بعد از EffectiveFrom باشد.');

  const updated = await prisma.aiProviderModelPricingV2.update({
    where: { id: pricing.id },
    data: { effectiveTo, endedBy: input.actorUserId },
    include: { priceItems: true },
  });
  return mapPricing(updated);
}

