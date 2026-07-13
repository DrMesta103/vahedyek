import { assertTenantAccess } from '../auth';
import { prisma } from '../prisma';
import { getGlobalSettings } from './global-settings';
import { listAiProviderAccounts } from './ai-accounts';
import {
  AI_PROVIDER_MODEL_TYPE_LABELS,
  AI_PROVIDER_MODEL_TYPES,
  type AiProviderModelBrandTag,
  type AiProviderModelPublic,
  type AiProviderModelType,
} from '../types/ai-provider-models';
import {
  BRAND_TOOL_MODEL_TYPE_ORDER,
  type BrandToolModelType,
} from '../types/domain';
import { usdToTomanCost } from '../ai-usage-cost';

export type BrandToolModelPreferences = Partial<Record<BrandToolModelType, string>>;

export type BrandToolModelResolvedState = 'override' | 'fallback-default' | 'invalid-selection';

export type BrandToolModelOption = {
  id: string;
  accountId: string;
  displayName: string;
  providerModelName: string;
  providerLabel: string;
  modelType: BrandToolModelType;
  modelTypeLabel: string;
  isDefault: boolean;
  brandTag: AiProviderModelBrandTag | null;
  brandTagLabel: string | null;
  inputTokenPriceUsd: number;
  outputTokenPriceUsd: number;
  priceSummaryUsd: string;
  priceSummaryToman: string;
};

export type BrandToolModelSection = {
  type: BrandToolModelType;
  typeLabel: string;
  models: BrandToolModelOption[];
  selectedModelId: string | null;
  selectedModel: BrandToolModelOption | null;
  defaultModel: BrandToolModelOption | null;
  effectiveModel: BrandToolModelOption | null;
  selectionState: BrandToolModelResolvedState | null;
};

export type BrandModelSettingsPayload = {
  brand: {
    id: string;
    name: string;
    tenantId: string;
  };
  modelPreferences: BrandToolModelPreferences;
  usdToToman: number;
  sections: BrandToolModelSection[];
};

const BRAND_MODEL_TYPE_SET = new Set<string>(AI_PROVIDER_MODEL_TYPES);

function isBrandToolModelType(value: string): value is BrandToolModelType {
  return BRAND_MODEL_TYPE_SET.has(value);
}

export function sanitizeBrandToolModelPreferences(value: unknown): BrandToolModelPreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const next: BrandToolModelPreferences = {};
  for (const [key, rawValue] of Object.entries(value)) {
    if (!isBrandToolModelType(key)) continue;
    if (typeof rawValue !== 'string') continue;
    const trimmed = rawValue.trim();
    if (!trimmed) continue;
    next[key] = trimmed;
  }

  return next;
}

function trimTrailingZeros(value: string) {
  if (!value.includes('.')) return value;
  const trimmed = value.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  return trimmed || '0';
}

function formatModelTokenPriceUsd(value: number) {
  if (value === 0) return '$0.0000000000';
  return `$${trimTrailingZeros(value.toFixed(10))}`;
}

function formatModelTokenPriceToman(priceUsd: number, usdToToman: number) {
  const value = usdToTomanCost(priceUsd, usdToToman);
  if (value === 0) return '0.0000000000 تومان';
  return `${trimTrailingZeros(value.toFixed(10))} تومان`;
}

function isDefaultForType(model: AiProviderModelPublic, type: BrandToolModelType) {
  switch (type) {
    case 'CHAT':
      return model.isDefaultForChat;
    case 'OCR':
      return model.isDefaultForOcr;
    case 'EMBEDDING':
      return model.isDefaultForEmbedding;
    case 'VISION':
      return model.isDefaultForVision;
    default:
      return false;
  }
}

function formatModelOption(
  model: AiProviderModelPublic,
  providerLabel: string,
  usdToToman: number,
): BrandToolModelOption {
  const usdParts = [
    `ورودی ${formatModelTokenPriceUsd(model.inputTokenPriceUsd)}`,
    `خروجی ${formatModelTokenPriceUsd(model.outputTokenPriceUsd)}`,
  ];

  const tomanParts = [
    `ورودی ${formatModelTokenPriceToman(model.inputTokenPriceUsd, usdToToman)}`,
    `خروجی ${formatModelTokenPriceToman(model.outputTokenPriceUsd, usdToToman)}`,
  ];

  return {
    id: model.id,
    accountId: model.accountId,
    displayName: model.displayName,
    providerModelName: model.providerModelName,
    providerLabel,
    modelType: model.modelType,
    modelTypeLabel: model.modelTypeLabel,
    isDefault: isDefaultForType(model, model.modelType),
    brandTag: model.brandTag,
    brandTagLabel: model.brandTagLabel,
    inputTokenPriceUsd: model.inputTokenPriceUsd,
    outputTokenPriceUsd: model.outputTokenPriceUsd,
    priceSummaryUsd: usdParts.join(' / '),
    priceSummaryToman: tomanParts.join(' / '),
  };
}

function buildSections(
  models: Array<AiProviderModelPublic & { providerLabel: string }>,
  preferences: BrandToolModelPreferences,
  usdToToman: number,
): BrandToolModelSection[] {
  const activeModels = models.filter((model) => model.isActive);
  const presentTypes = new Set<BrandToolModelType>();
  for (const model of activeModels) {
    presentTypes.add(model.modelType);
  }

  const orderedTypes = [
    ...BRAND_TOOL_MODEL_TYPE_ORDER.filter((type) => presentTypes.has(type)),
    ...Array.from(presentTypes).filter((type) => !BRAND_TOOL_MODEL_TYPE_ORDER.includes(type as never)).sort(),
  ] as BrandToolModelType[];

  return orderedTypes.map((type) => {
    const typeModels = activeModels
      .filter((model) => model.modelType === type)
      .sort((a, b) => {
        const defaultDiff = Number(isDefaultForType(b, type)) - Number(isDefaultForType(a, type));
        if (defaultDiff !== 0) return defaultDiff;
        return a.displayName.localeCompare(b.displayName, 'fa');
      });
    const selectedModelId = preferences[type] ?? null;
    const selectedModel = selectedModelId ? typeModels.find((model) => model.id === selectedModelId) ?? null : null;
    const defaultModel = typeModels.find((model) => isDefaultForType(model, type)) ?? null;
    const invalidSelection = Boolean(selectedModelId && !selectedModel);
    const effectiveModel = selectedModel ?? defaultModel ?? null;
    const selectionState = selectedModel
      ? 'override'
      : invalidSelection
        ? 'invalid-selection'
        : defaultModel
          ? 'fallback-default'
          : null;

    return {
      type,
      typeLabel: AI_PROVIDER_MODEL_TYPE_LABELS[type],
      models: typeModels.map((model) => formatModelOption(model, model.providerLabel, usdToToman)),
      selectedModelId,
      selectedModel: selectedModel ? formatModelOption(selectedModel, selectedModel.providerLabel, usdToToman) : null,
      defaultModel: defaultModel ? formatModelOption(defaultModel, defaultModel.providerLabel, usdToToman) : null,
      effectiveModel: effectiveModel ? formatModelOption(effectiveModel, effectiveModel.providerLabel, usdToToman) : null,
      selectionState,
    };
  });
}

export async function getBrandModelSettings(userId: string, tenantId: string, brandId: string): Promise<BrandModelSettingsPayload | null> {
  if (!(await assertTenantAccess(userId, tenantId))) return null;

  const brand = await prisma.taaviaBrand.findFirst({
    where: { id: brandId, tenantId, isActive: true },
    include: {
      conversations: {
        where: { type: 'admin_agent' },
        select: {
          messages: {
            where: { role: 'assistant' },
            orderBy: { createdAt: 'asc' },
            take: 1,
            select: { metadata: true },
          },
        },
      },
    },
  });
  if (!brand) return null;

  const [{ accounts }, globalSettings] = await Promise.all([
    listAiProviderAccounts({ includeModels: true }),
    getGlobalSettings(),
  ]);

  const models = accounts
    .filter((account) => account.isActive)
    .flatMap((account) =>
      (account.models ?? []).filter((model) => model.isActive).map((model) => ({
        ...model,
        providerLabel: account.providerLabel,
      })),
    );
  const metadata = (brand.conversations[0]?.messages[0]?.metadata as { modelPreferences?: unknown } | null | undefined) ?? undefined;
  const modelPreferences = sanitizeBrandToolModelPreferences(metadata?.modelPreferences);

  return {
    brand: {
      id: brand.id,
      name: brand.name,
      tenantId: brand.tenantId,
    },
    modelPreferences,
    usdToToman: globalSettings.usdToToman,
    sections: buildSections(models, modelPreferences, globalSettings.usdToToman),
  };
}

export async function resolveBrandEffectiveModel(
  userId: string,
  tenantId: string,
  brandId: string,
  type: BrandToolModelType,
) {
  const payload = await getBrandModelSettings(userId, tenantId, brandId);
  if (!payload) return null;
  return payload.sections.find((section) => section.type === type) ?? null;
}

export async function resolveBrandEffectiveOcrModel(userId: string, tenantId: string, brandId: string) {
  return resolveBrandEffectiveModel(userId, tenantId, brandId, 'OCR');
}

export async function resolveBrandEffectiveChatModel(userId: string, tenantId: string, brandId: string) {
  return resolveBrandEffectiveModel(userId, tenantId, brandId, 'CHAT');
}
