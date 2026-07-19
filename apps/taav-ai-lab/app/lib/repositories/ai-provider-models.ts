import { prisma } from '../prisma';
import {
  AI_PROVIDER_MODEL_BRAND_TAG_LABELS,
  AI_PROVIDER_MODEL_BRAND_TAGS,
  AI_PROVIDER_MODEL_TYPE_LABELS,
  AI_PROVIDER_MODEL_TYPES,
  AI_PROVIDER_PRICING_UNIT_LABELS,
  AI_PROVIDER_PRICING_UNITS,
  type AiProviderAccountDetail,
  type AiProviderModelBrandTag,
  type AiProviderModelPublic,
  type AiProviderModelType,
  type AiProviderPricingUnit,
  type CreateAiProviderModelInput,
  type UpdateAiProviderModelInput,
  type UsedBrandTagsByModelType,
} from '../types/ai-provider-models';
import { AI_PROVIDER_LABELS, SystemAiProviderError, type AiProviderType } from '../types/ai-accounts';
import { type OcrModelProvider } from '../ocr-models';

type ModelRow = Awaited<ReturnType<typeof prisma.aiProviderModel.findMany>>[number];

const DEFAULT_FIELDS = [
  'isDefaultForChat',
  'isDefaultForOcr',
  'isDefaultForEmbedding',
  'isDefaultForVision',
] as const;

function toNumber(value: { toString(): string } | number) {
  return Number(value);
}

function isModelType(value: string): value is AiProviderModelType {
  return (AI_PROVIDER_MODEL_TYPES as readonly string[]).includes(value);
}

function isPricingUnit(value: string): value is AiProviderPricingUnit {
  return (AI_PROVIDER_PRICING_UNITS as readonly string[]).includes(value);
}

function isBrandTag(value: string): value is AiProviderModelBrandTag {
  return (AI_PROVIDER_MODEL_BRAND_TAGS as readonly string[]).includes(value);
}

function resolveBrandTag(value: string | null | undefined): AiProviderModelBrandTag | null {
  if (!value) return null;
  return isBrandTag(value) ? value : null;
}

function mapModel(row: ModelRow): AiProviderModelPublic {
  const modelType = isModelType(row.modelType) ? row.modelType : 'OTHER';
  const pricingUnit = isPricingUnit(row.pricingUnit) ? row.pricingUnit : 'MIXED';

  const ocrInputRatio = toNumber(((row as unknown as { ocrInputRatio?: { toString(): string } | number }).ocrInputRatio ?? 0.6));
  const cacheReadTokenPriceUsd = toNumber(
    ((row as unknown as { cacheReadTokenPriceUsd?: { toString(): string } | number }).cacheReadTokenPriceUsd ?? 0),
  );
  const cacheWriteTokenPriceUsd = toNumber(
    ((row as unknown as { cacheWriteTokenPriceUsd?: { toString(): string } | number }).cacheWriteTokenPriceUsd ?? 0),
  );
  const brandTag = resolveBrandTag(row.brandTag);

  return {
    id: row.id,
    accountId: row.accountId,
    displayName: row.displayName,
    providerModelName: row.providerModelName,
    modelType,
    modelTypeLabel: AI_PROVIDER_MODEL_TYPE_LABELS[modelType],
    pricingUnit,
    pricingUnitLabel: AI_PROVIDER_PRICING_UNIT_LABELS[pricingUnit],
    inputTokenPriceUsd: toNumber(row.inputTokenPriceUsd),
    outputTokenPriceUsd: toNumber(row.outputTokenPriceUsd),
    ocrInputRatio,
    cacheReadTokenPriceUsd,
    cacheWriteTokenPriceUsd,
    requestPriceUsd: toNumber(row.requestPriceUsd),
    pagePriceUsd: toNumber(row.pagePriceUsd),
    imagePriceUsd: toNumber(row.imagePriceUsd),
    minutePriceUsd: toNumber(row.minutePriceUsd),
    supportsPersian: row.supportsPersian,
    supportsEnglish: row.supportsEnglish,
    supportsVision: row.supportsVision,
    supportsPdf: row.supportsPdf,
    supportsImage: row.supportsImage,
    supportsStructuredExtraction: row.supportsStructuredExtraction,
    supportsEmbedding: row.supportsEmbedding,
    supportsFunctionCalling: row.supportsFunctionCalling,
    maxInputTokens: row.maxInputTokens,
    maxOutputTokens: row.maxOutputTokens,
    isDefaultForChat: row.isDefaultForChat,
    isDefaultForOcr: row.isDefaultForOcr,
    isDefaultForEmbedding: row.isDefaultForEmbedding,
    isDefaultForVision: row.isDefaultForVision,
    isSystem: row.isSystem,
    isActive: row.isActive,
    brandTag,
    brandTagLabel: brandTag ? AI_PROVIDER_MODEL_BRAND_TAG_LABELS[brandTag] : null,
    notes: row.notes,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function buildModelData(input: CreateAiProviderModelInput | UpdateAiProviderModelInput) {
  return {
    ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
    ...(input.providerModelName !== undefined ? { providerModelName: input.providerModelName } : {}),
    ...(input.modelType !== undefined ? { modelType: input.modelType } : {}),
    ...(input.pricingUnit !== undefined ? { pricingUnit: input.pricingUnit } : {}),
    ...(input.inputTokenPriceUsd !== undefined ? { inputTokenPriceUsd: input.inputTokenPriceUsd } : {}),
    ...(input.outputTokenPriceUsd !== undefined ? { outputTokenPriceUsd: input.outputTokenPriceUsd } : {}),
    ...(input.ocrInputRatio !== undefined ? { ocrInputRatio: input.ocrInputRatio } : {}),
    ...(input.cacheReadTokenPriceUsd !== undefined ? { cacheReadTokenPriceUsd: input.cacheReadTokenPriceUsd } : {}),
    ...(input.cacheWriteTokenPriceUsd !== undefined ? { cacheWriteTokenPriceUsd: input.cacheWriteTokenPriceUsd } : {}),
    ...(input.requestPriceUsd !== undefined ? { requestPriceUsd: input.requestPriceUsd } : {}),
    ...(input.pagePriceUsd !== undefined ? { pagePriceUsd: input.pagePriceUsd } : {}),
    ...(input.imagePriceUsd !== undefined ? { imagePriceUsd: input.imagePriceUsd } : {}),
    ...(input.minutePriceUsd !== undefined ? { minutePriceUsd: input.minutePriceUsd } : {}),
    ...(input.supportsPersian !== undefined ? { supportsPersian: input.supportsPersian } : {}),
    ...(input.supportsEnglish !== undefined ? { supportsEnglish: input.supportsEnglish } : {}),
    ...(input.supportsVision !== undefined ? { supportsVision: input.supportsVision } : {}),
    ...(input.supportsPdf !== undefined ? { supportsPdf: input.supportsPdf } : {}),
    ...(input.supportsImage !== undefined ? { supportsImage: input.supportsImage } : {}),
    ...(input.supportsStructuredExtraction !== undefined
      ? { supportsStructuredExtraction: input.supportsStructuredExtraction }
      : {}),
    ...(input.supportsEmbedding !== undefined ? { supportsEmbedding: input.supportsEmbedding } : {}),
    ...(input.supportsFunctionCalling !== undefined ? { supportsFunctionCalling: input.supportsFunctionCalling } : {}),
    ...(input.maxInputTokens !== undefined ? { maxInputTokens: input.maxInputTokens } : {}),
    ...(input.maxOutputTokens !== undefined ? { maxOutputTokens: input.maxOutputTokens } : {}),
    ...(input.isDefaultForChat !== undefined ? { isDefaultForChat: input.isDefaultForChat } : {}),
    ...(input.isDefaultForOcr !== undefined ? { isDefaultForOcr: input.isDefaultForOcr } : {}),
    ...(input.isDefaultForEmbedding !== undefined ? { isDefaultForEmbedding: input.isDefaultForEmbedding } : {}),
    ...(input.isDefaultForVision !== undefined ? { isDefaultForVision: input.isDefaultForVision } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
    ...(input.brandTag !== undefined ? { brandTag: input.brandTag } : {}),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
  };
}

async function unsetOtherDefaults(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  accountId: string,
  modelId: string,
  flags: Partial<Record<(typeof DEFAULT_FIELDS)[number], boolean>>,
) {
  for (const field of DEFAULT_FIELDS) {
    if (flags[field] === true) {
      await tx.aiProviderModel.updateMany({
        where: { accountId, id: { not: modelId } },
        data: { [field]: false },
      });
    }
  }
}

async function ensureAccountExists(accountId: string) {
  return prisma.aiProviderAccount.findUnique({ where: { id: accountId } });
}

function assertValidOcrInputRatio(value: number) {
  if (!Number.isFinite(value) || value <= 0 || value >= 1) {
    throw new SystemAiProviderError('برای مدل OCR، نسبت توکن ورودی باید عددی بین 0 و 1 باشد.');
  }
}

async function assertUniqueProviderModelName(providerModelName: string, excludeModelId?: string) {
  const existing = await prisma.aiProviderModel.findFirst({
    where: {
      providerModelName,
      ...(excludeModelId ? { id: { not: excludeModelId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw new SystemAiProviderError('providerModelName تکراری است و امکان ثبت آن وجود ندارد.');
  }
}

async function assertUniqueBrandTag(
  modelType: AiProviderModelType,
  brandTag: AiProviderModelBrandTag | null | undefined,
  isActive: boolean,
  excludeModelId?: string,
) {
  if (!brandTag || !isActive) return;

  const existing = await prisma.aiProviderModel.findFirst({
    where: {
      modelType,
      brandTag,
      isActive: true,
      ...(excludeModelId ? { id: { not: excludeModelId } } : {}),
    },
    select: { id: true, displayName: true },
  });

  if (existing) {
    throw new SystemAiProviderError(
      `برای ${AI_PROVIDER_MODEL_TYPE_LABELS[modelType]}، تگ ${AI_PROVIDER_MODEL_BRAND_TAG_LABELS[brandTag]} قبلاً به مدل «${existing.displayName}» اختصاص داده شده است.`,
    );
  }
}

export async function listUsedBrandTagsByModelType(): Promise<UsedBrandTagsByModelType> {
  const rows = await prisma.aiProviderModel.findMany({
    where: {
      isActive: true,
      brandTag: { not: null },
    },
    select: {
      id: true,
      displayName: true,
      modelType: true,
      brandTag: true,
    },
  });

  const result: UsedBrandTagsByModelType = {};
  for (const row of rows) {
    const modelType = isModelType(row.modelType) ? row.modelType : null;
    const brandTag = resolveBrandTag(row.brandTag);
    if (!modelType || !brandTag) continue;

    if (!result[modelType]) {
      result[modelType] = {};
    }
    result[modelType]![brandTag] = {
      modelId: row.id,
      displayName: row.displayName,
    };
  }

  return result;
}

export async function listAiProviderModels(accountId: string) {
  const account = await ensureAccountExists(accountId);
  if (!account) return null;

  const rows = await prisma.aiProviderModel.findMany({
    where: { accountId },
    orderBy: [{ updatedAt: 'desc' }, { displayName: 'asc' }],
  });

  return rows.map(mapModel);
}

export async function getAiProviderModelById(accountId: string, modelId: string) {
  const row = await prisma.aiProviderModel.findFirst({
    where: { id: modelId, accountId },
  });
  if (!row) return null;
  return mapModel(row);
}

export async function getAiProviderAccountDetail(accountId: string): Promise<AiProviderAccountDetail | null> {
  const account = await ensureAccountExists(accountId);
  if (!account) return null;

  const [models, totalModelCount, activeModelCount] = await Promise.all([
    prisma.aiProviderModel.findMany({
      where: { accountId },
      orderBy: [{ updatedAt: 'desc' }, { displayName: 'asc' }],
    }),
    prisma.aiProviderModel.count({ where: { accountId } }),
    prisma.aiProviderModel.count({ where: { accountId, isActive: true } }),
  ]);

  const provider = account.provider as AiProviderType;
  const purchasedCreditUsd = toNumber(account.purchasedCreditUsd);
  const usedCreditUsd = toNumber(account.usedCreditUsd);

  return {
    account: {
      id: account.id,
      name: account.name,
      provider: account.provider,
      providerLabel: AI_PROVIDER_LABELS[provider] ?? account.provider,
      apiKeyMasked: account.apiKeyMasked,
      purchasedCreditUsd,
      usedCreditUsd,
      remainingCreditUsd: Math.max(0, purchasedCreditUsd - usedCreditUsd),
      isActive: account.isActive,
      isSystem: account.isSystem,
      totalModelCount,
      activeModelCount,
    },
    models: models.map(mapModel),
  };
}

export async function createAiProviderModel(accountId: string, input: CreateAiProviderModelInput) {
  const account = await ensureAccountExists(accountId);
  if (!account) return null;

  await assertUniqueProviderModelName(input.providerModelName);

  if (input.modelType === 'OCR') {
    const inputPrice = input.inputTokenPriceUsd ?? 0;
    const outputPrice = input.outputTokenPriceUsd ?? 0;
    if (!(Number.isFinite(inputPrice) && inputPrice > 0) || !(Number.isFinite(outputPrice) && outputPrice > 0)) {
      throw new SystemAiProviderError('برای مدل OCR، قیمت توکن ورودی و خروجی باید الزامی و بزرگ‌تر از صفر باشند.');
    }
    assertValidOcrInputRatio(input.ocrInputRatio ?? 0.6);
  }

  const nextBrandTag = input.brandTag ?? null;
  const nextIsActive = input.isActive !== false;
  await assertUniqueBrandTag(input.modelType, nextBrandTag, nextIsActive);

  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.aiProviderModel.create({
      data: {
        accountId,
        ...buildModelData(input),
        displayName: input.displayName,
        providerModelName: input.providerModelName,
        modelType: input.modelType,
        pricingUnit: input.pricingUnit,
        inputTokenPriceUsd: input.inputTokenPriceUsd ?? 0,
        outputTokenPriceUsd: input.outputTokenPriceUsd ?? 0,
        ocrInputRatio: input.ocrInputRatio ?? 0.6,
        cacheReadTokenPriceUsd: input.cacheReadTokenPriceUsd ?? 0,
        cacheWriteTokenPriceUsd: input.cacheWriteTokenPriceUsd ?? 0,
        requestPriceUsd: input.requestPriceUsd ?? 0,
        pagePriceUsd: input.pagePriceUsd ?? 0,
        imagePriceUsd: input.imagePriceUsd ?? 0,
        minutePriceUsd: input.minutePriceUsd ?? 0,
        supportsPersian: input.supportsPersian ?? false,
        supportsEnglish: input.supportsEnglish ?? false,
        supportsVision: input.supportsVision ?? false,
        supportsPdf: input.supportsPdf ?? false,
        supportsImage: input.supportsImage ?? false,
        supportsStructuredExtraction: input.supportsStructuredExtraction ?? false,
        supportsEmbedding: input.supportsEmbedding ?? false,
        supportsFunctionCalling: input.supportsFunctionCalling ?? false,
        maxInputTokens: input.maxInputTokens ?? null,
        maxOutputTokens: input.maxOutputTokens ?? null,
        isDefaultForChat: input.isDefaultForChat ?? false,
        isDefaultForOcr: input.isDefaultForOcr ?? false,
        isDefaultForEmbedding: input.isDefaultForEmbedding ?? false,
        isDefaultForVision: input.isDefaultForVision ?? false,
        isActive: nextIsActive,
        brandTag: nextBrandTag,
        notes: input.notes ?? null,
        createdByUserId: input.createdByUserId ?? null,
      } as any,
    });

    await unsetOtherDefaults(tx, accountId, created.id, {
      isDefaultForChat: created.isDefaultForChat,
      isDefaultForOcr: created.isDefaultForOcr,
      isDefaultForEmbedding: created.isDefaultForEmbedding,
      isDefaultForVision: created.isDefaultForVision,
    });

    return created;
  });

  return mapModel(row);
}

export async function updateAiProviderModel(
  accountId: string,
  modelId: string,
  input: UpdateAiProviderModelInput,
) {
  const existing = await prisma.aiProviderModel.findFirst({
    where: { id: modelId, accountId },
  });
  if (!existing) return null;

  if (input.providerModelName !== undefined && input.providerModelName !== existing.providerModelName) {
    await assertUniqueProviderModelName(input.providerModelName, modelId);
  }

  const nextModelType = input.modelType ?? (isModelType(existing.modelType) ? existing.modelType : 'OTHER');
  if (nextModelType === 'OCR') {
    const nextInputPrice = input.inputTokenPriceUsd ?? toNumber(existing.inputTokenPriceUsd);
    const nextOutputPrice = input.outputTokenPriceUsd ?? toNumber(existing.outputTokenPriceUsd);
    if (!(Number.isFinite(nextInputPrice) && nextInputPrice > 0) || !(Number.isFinite(nextOutputPrice) && nextOutputPrice > 0)) {
      throw new SystemAiProviderError('برای مدل OCR، قیمت توکن ورودی و خروجی باید الزامی و بزرگ‌تر از صفر باشند.');
    }
    const existingRatio = toNumber(
      ((existing as unknown as { ocrInputRatio?: { toString(): string } | number }).ocrInputRatio ?? 0.6),
    );
    assertValidOcrInputRatio(input.ocrInputRatio ?? existingRatio);
  }

  const nextBrandTag =
    input.brandTag !== undefined
      ? input.brandTag
      : resolveBrandTag(existing.brandTag);
  const nextIsActive = input.isActive ?? existing.isActive;
  await assertUniqueBrandTag(nextModelType, nextBrandTag, nextIsActive, modelId);

  const row = await prisma.$transaction(async (tx) => {
    const updated = await tx.aiProviderModel.update({
      where: { id: modelId },
      data: buildModelData(input) as any,
    });

    await unsetOtherDefaults(tx, accountId, modelId, {
      isDefaultForChat: input.isDefaultForChat,
      isDefaultForOcr: input.isDefaultForOcr,
      isDefaultForEmbedding: input.isDefaultForEmbedding,
      isDefaultForVision: input.isDefaultForVision,
    });

    return updated;
  });

  return mapModel(row);
}

export async function toggleAiProviderModelStatus(accountId: string, modelId: string, isActive: boolean) {
  const existing = await prisma.aiProviderModel.findFirst({
    where: { id: modelId, accountId },
  });
  if (!existing) return null;

  const modelType = isModelType(existing.modelType) ? existing.modelType : 'OTHER';
  const brandTag = resolveBrandTag(existing.brandTag);
  await assertUniqueBrandTag(modelType, brandTag, isActive, modelId);

  const row = await prisma.aiProviderModel.update({
    where: { id: modelId },
    data: { isActive },
  });

  return mapModel(row);
}

export async function deleteAiProviderModel(accountId: string, modelId: string) {
  const existing = await prisma.aiProviderModel.findFirst({
    where: { id: modelId, accountId },
  });
  if (!existing) return false;

  if (existing.isSystem) {
    throw new SystemAiProviderError('مدل سیستمی قابل حذف نیست.');
  }

  await prisma.aiProviderModel.delete({ where: { id: modelId } });
  return true;
}

export type SystemOcrModelRow = {
  accountId: string;
  provider: OcrModelProvider;
  providerLabel: string;
  displayName: string;
  providerModelName: string;
  inputTokenPriceUsd: number;
  outputTokenPriceUsd: number;
  cacheReadTokenPriceUsd: number;
  cacheWriteTokenPriceUsd: number;
};

function mapAccountProviderToOcrProvider(value: string): OcrModelProvider | null {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'OPENAI') return 'openai';
  if (normalized === 'DEEPSEEK') return 'deepseek';
  if (normalized === 'GEMINI') return 'google';
  if (normalized === 'GROK') return 'xai';
  return null;
}

export async function listSystemOcrModels(): Promise<SystemOcrModelRow[]> {
  const rows = await prisma.aiProviderModel.findMany({
    where: {
      isActive: true,
      modelType: 'OCR',
      account: {
        isActive: true,
      },
    },
    include: {
      account: true,
    },
    orderBy: [{ updatedAt: 'desc' }, { displayName: 'asc' }],
  });

  return rows
    .filter((row) => toNumber(row.inputTokenPriceUsd) > 0 && toNumber(row.outputTokenPriceUsd) > 0)
    .map((row) => {
      const provider = mapAccountProviderToOcrProvider(row.account.provider) ?? 'openai';
      const providerType = row.account.provider as AiProviderType;
      return {
        accountId: row.accountId,
        provider,
        providerLabel: AI_PROVIDER_LABELS[providerType] ?? row.account.provider,
        displayName: row.displayName,
        providerModelName: row.providerModelName,
        inputTokenPriceUsd: toNumber(row.inputTokenPriceUsd),
        outputTokenPriceUsd: toNumber(row.outputTokenPriceUsd),
        cacheReadTokenPriceUsd: toNumber(
          ((row as unknown as { cacheReadTokenPriceUsd?: { toString(): string } | number }).cacheReadTokenPriceUsd ?? 0),
        ),
        cacheWriteTokenPriceUsd: toNumber(
          ((row as unknown as { cacheWriteTokenPriceUsd?: { toString(): string } | number }).cacheWriteTokenPriceUsd ?? 0),
        ),
      };
    });
}

export type ActiveChatModelRow = {
  accountId: string;
  provider: OcrModelProvider;
  providerLabel: string;
  displayName: string;
  providerModelName: string;
  inputTokenPriceUsd: number;
  outputTokenPriceUsd: number;
  cacheReadTokenPriceUsd: number;
  cacheWriteTokenPriceUsd: number;
};

export async function listActiveChatModels(): Promise<ActiveChatModelRow[]> {
  const rows = await prisma.aiProviderModel.findMany({
    where: {
      isActive: true,
      modelType: 'CHAT',
      account: {
        isActive: true,
      },
    },
    include: {
      account: true,
    },
    orderBy: [{ updatedAt: 'desc' }, { displayName: 'asc' }],
  });

  return rows.map((row) => {
    const provider = mapAccountProviderToOcrProvider(row.account.provider) ?? 'openai';
    const providerType = row.account.provider as AiProviderType;
    return {
      accountId: row.accountId,
      provider,
      providerLabel: AI_PROVIDER_LABELS[providerType] ?? row.account.provider,
      displayName: row.displayName,
      providerModelName: row.providerModelName,
      inputTokenPriceUsd: toNumber(row.inputTokenPriceUsd),
      outputTokenPriceUsd: toNumber(row.outputTokenPriceUsd),
      cacheReadTokenPriceUsd: toNumber(
        ((row as unknown as { cacheReadTokenPriceUsd?: { toString(): string } | number }).cacheReadTokenPriceUsd ?? 0),
      ),
      cacheWriteTokenPriceUsd: toNumber(
        ((row as unknown as { cacheWriteTokenPriceUsd?: { toString(): string } | number }).cacheWriteTokenPriceUsd ?? 0),
      ),
    };
  });
}

export async function resolveModelPricingForOcr(accountId: string, ocrModelId: string) {
  const byName = await prisma.aiProviderModel.findFirst({
    where: {
      accountId,
      isActive: true,
      providerModelName: ocrModelId,
    },
  });

  if (byName) {
    return {
      inputTokenPriceUsd: toNumber(byName.inputTokenPriceUsd),
      outputTokenPriceUsd: toNumber(byName.outputTokenPriceUsd),
    };
  }

  const defaultOcr = await prisma.aiProviderModel.findFirst({
    where: {
      accountId,
      isActive: true,
      isDefaultForOcr: true,
    },
  });

  if (defaultOcr) {
    return {
      inputTokenPriceUsd: toNumber(defaultOcr.inputTokenPriceUsd),
      outputTokenPriceUsd: toNumber(defaultOcr.outputTokenPriceUsd),
    };
  }

  return null;
}

export function parseAiProviderModelType(value: unknown): AiProviderModelType | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return isModelType(normalized) ? normalized : null;
}

export function parseAiProviderPricingUnit(value: unknown): AiProviderPricingUnit | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return isPricingUnit(normalized) ? normalized : null;
}

export function parseAiProviderModelBrandTag(value: unknown): AiProviderModelBrandTag | null {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return isBrandTag(normalized) ? normalized : null;
}

export function hasAnyPositivePrice(input: {
  inputTokenPriceUsd?: number;
  outputTokenPriceUsd?: number;
  requestPriceUsd?: number;
  pagePriceUsd?: number;
  imagePriceUsd?: number;
  minutePriceUsd?: number;
}) {
  return [
    input.inputTokenPriceUsd,
    input.outputTokenPriceUsd,
    input.requestPriceUsd,
    input.pagePriceUsd,
    input.imagePriceUsd,
    input.minutePriceUsd,
  ].some((value) => typeof value === 'number' && value > 0);
}

export async function listModelsGroupedByAccountIds(accountIds: string[]) {
  if (accountIds.length === 0) return new Map<string, AiProviderModelPublic[]>();

  const rows = await prisma.aiProviderModel.findMany({
    where: { accountId: { in: accountIds } },
    orderBy: [{ updatedAt: 'desc' }, { displayName: 'asc' }],
  });

  const grouped = new Map<string, AiProviderModelPublic[]>();
  for (const id of accountIds) {
    grouped.set(id, []);
  }
  for (const row of rows) {
    const current = grouped.get(row.accountId) ?? [];
    current.push(mapModel(row));
    grouped.set(row.accountId, current);
  }

  return grouped;
}

export async function getModelCountsByAccountIds(accountIds: string[]) {
  if (accountIds.length === 0) return new Map<string, { total: number; active: number }>();

  const [totalRows, activeRows] = await Promise.all([
    prisma.aiProviderModel.groupBy({
      by: ['accountId'],
      where: { accountId: { in: accountIds } },
      _count: { _all: true },
    }),
    prisma.aiProviderModel.groupBy({
      by: ['accountId'],
      where: { accountId: { in: accountIds }, isActive: true },
      _count: { _all: true },
    }),
  ]);

  const counts = new Map<string, { total: number; active: number }>();
  for (const id of accountIds) {
    counts.set(id, { total: 0, active: 0 });
  }
  for (const row of totalRows) {
    const current = counts.get(row.accountId) ?? { total: 0, active: 0 };
    counts.set(row.accountId, { ...current, total: row._count._all });
  }
  for (const row of activeRows) {
    const current = counts.get(row.accountId) ?? { total: 0, active: 0 };
    counts.set(row.accountId, { ...current, active: row._count._all });
  }

  return counts;
}
