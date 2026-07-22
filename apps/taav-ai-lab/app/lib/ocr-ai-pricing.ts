import { getOcrModelById, type OcrModelProvider } from './ocr-models';
import type { AiProviderAccountPublic, AiProviderType } from './types/ai-accounts';
import type { AiProviderModelPublic } from './types/ai-provider-models';
import {
  calculateAiUsageCost,
  calculateAiUsageCostDetailed,
  formatCostUsd,
  usdToTomanCost,
} from './ai-usage-cost';
import { formatToman } from './global-settings-mock';

export type OcrModelPricing = {
  accountId: string;
  provider: AiProviderType;
  providerLabel: string;
  inputTokenPriceUsd: number;
  outputTokenPriceUsd: number;
  cacheReadTokenPriceUsd?: number;
  cacheWriteTokenPriceUsd?: number;
  pagePriceUsd: number;
};

export type OcrAiUsageCost = {
  accountId: string | null;
  providerLabel: string;
  inputCostUsd: number;
  outputCostUsd: number;
  cacheReadCostUsd: number;
  cacheWriteCostUsd: number;
  totalCostUsd: number;
  inputCostToman: number;
  outputCostToman: number;
  cacheReadCostToman: number;
  cacheWriteCostToman: number;
  totalCostToman: number;
};

export type AiProviderAccountForPricing = AiProviderAccountPublic & {
  models?: AiProviderModelPublic[];
};

const OCR_PROVIDER_TO_ACCOUNT_TYPE: Record<OcrModelProvider, AiProviderType> = {
  openai: 'OPENAI',
  deepseek: 'DEEPSEEK',
  google: 'GEMINI',
  xai: 'GROK',
};

export function mapOcrProviderToAccountType(provider: OcrModelProvider): AiProviderType {
  return OCR_PROVIDER_TO_ACCOUNT_TYPE[provider];
}

function resolveModelPricingFromAccount(account: AiProviderAccountForPricing, ocrModelId: string) {
  const models = account.models ?? [];
  const byName = models.find((item) => item.isActive && item.providerModelName === ocrModelId);
  if (byName) return byName;

  return models.find((item) => item.isActive && item.isDefaultForOcr) ?? null;
}

export function resolveOcrModelPricing(
  modelId: string,
  accounts: AiProviderAccountForPricing[],
): OcrModelPricing | null {
  const model = getOcrModelById(modelId);
  if (!model) return null;

  const accountType = mapOcrProviderToAccountType(model.provider);
  const account = accounts.find((item) => item.isActive && item.provider === accountType);
  if (!account) return null;

  const pricingModel = resolveModelPricingFromAccount(account, modelId);
  if (!pricingModel) return null;

  return {
    accountId: account.id,
    provider: account.provider,
    providerLabel: account.providerLabel,
    inputTokenPriceUsd: pricingModel.inputTokenPriceUsd,
    outputTokenPriceUsd: pricingModel.outputTokenPriceUsd,
    pagePriceUsd: pricingModel.pagePriceUsd,
  };
}

export function resolvePagePriceUsdFromAccounts(
  modelId: string,
  accounts: AiProviderAccountForPricing[],
): number {
  if (!modelId || modelId === '—') return 0;

  const fromCatalog = resolveOcrModelPricing(modelId, accounts);
  if (fromCatalog && fromCatalog.pagePriceUsd > 0) return fromCatalog.pagePriceUsd;

  const model = accounts
    .filter((account) => account.isActive)
    .flatMap((account) =>
      (account.models ?? []).map((item) => ({
        ...item,
        accountId: account.id,
      })),
    )
    .find(
      (item) =>
        item.isActive &&
        (item.providerModelName === modelId ||
          item.id === modelId ||
          `${item.accountId}:${item.providerModelName}` === modelId),
    );

  return model?.pagePriceUsd ?? 0;
}

export function buildOcrUsageCost(input: {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
  cacheWriteTokens?: number;
  pricing: OcrModelPricing | null;
  usdToToman: number;
  providerLabel?: string;
}): OcrAiUsageCost {
  const providerLabel = input.pricing?.providerLabel ?? input.providerLabel ?? '—';

  if (!input.pricing) {
    return {
      accountId: null,
      providerLabel,
      inputCostUsd: 0,
      outputCostUsd: 0,
      cacheReadCostUsd: 0,
      cacheWriteCostUsd: 0,
      totalCostUsd: 0,
      inputCostToman: 0,
      outputCostToman: 0,
      cacheReadCostToman: 0,
      cacheWriteCostToman: 0,
      totalCostToman: 0,
    };
  }

  const costs = calculateAiUsageCostDetailed(input.pricing, {
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    cachedInputTokens: input.cachedInputTokens ?? 0,
    cacheWriteTokens: input.cacheWriteTokens ?? 0,
  });

  return {
    accountId: input.pricing.accountId,
    providerLabel,
    inputCostUsd: costs.inputCostUsd,
    outputCostUsd: costs.outputCostUsd,
    cacheReadCostUsd: costs.cacheReadCostUsd,
    cacheWriteCostUsd: costs.cacheWriteCostUsd,
    totalCostUsd: costs.totalCostUsd,
    inputCostToman: usdToTomanCost(costs.inputCostUsd, input.usdToToman),
    outputCostToman: usdToTomanCost(costs.outputCostUsd, input.usdToToman),
    cacheReadCostToman: usdToTomanCost(costs.cacheReadCostUsd, input.usdToToman),
    cacheWriteCostToman: usdToTomanCost(costs.cacheWriteCostUsd, input.usdToToman),
    totalCostToman: usdToTomanCost(costs.totalCostUsd, input.usdToToman),
  };
}

export function formatCostToman(value: number) {
  return `${formatToman(value)} تومان`;
}

export function formatPerTokenPriceToman(priceUsd: number, usdToToman: number) {
  return formatCostToman(usdToTomanCost(priceUsd, usdToToman));
}

export { formatCostUsd };

export function buildOcrCostMeta(cost: OcrAiUsageCost): Record<string, string> {
  const meta: Record<string, string> = {
    __inputCostUsd: String(cost.inputCostUsd),
    __outputCostUsd: String(cost.outputCostUsd),
    __cacheReadCostUsd: String(cost.cacheReadCostUsd),
    __cacheWriteCostUsd: String(cost.cacheWriteCostUsd),
    __totalCostUsd: String(cost.totalCostUsd),
    __totalCostToman: String(cost.totalCostToman),
  };

  if (cost.accountId) {
    meta.__aiAccountId = cost.accountId;
  }

  return meta;
}

export function readOcrCostFromMeta(
  extractedJson: Record<string, string> | null | undefined,
  providerLabel: string,
): OcrAiUsageCost | null {
  if (!extractedJson) return null;

  const totalCostUsd = Number(extractedJson.__totalCostUsd);
  const totalCostToman = Number(extractedJson.__totalCostToman);
  if (!Number.isFinite(totalCostUsd) && !Number.isFinite(totalCostToman)) return null;

  const inputCostUsd = Number(extractedJson.__inputCostUsd);
  const outputCostUsd = Number(extractedJson.__outputCostUsd);

  return {
    accountId: extractedJson.__aiAccountId ?? null,
    providerLabel,
    inputCostUsd: Number.isFinite(inputCostUsd) ? inputCostUsd : 0,
    outputCostUsd: Number.isFinite(outputCostUsd) ? outputCostUsd : 0,
    cacheReadCostUsd: Number(extractedJson.__cacheReadCostUsd) || 0,
    cacheWriteCostUsd: Number(extractedJson.__cacheWriteCostUsd) || 0,
    totalCostUsd: Number.isFinite(totalCostUsd) ? totalCostUsd : 0,
    inputCostToman: 0,
    outputCostToman: 0,
    cacheReadCostToman: 0,
    cacheWriteCostToman: 0,
    totalCostToman: Number.isFinite(totalCostToman) ? totalCostToman : 0,
  };
}

export function readOcrCostFromMetaWithToman(
  extractedJson: Record<string, string> | null | undefined,
  providerLabel: string,
  usdToToman: number,
): OcrAiUsageCost | null {
  const snapshot = readOcrCostFromMeta(extractedJson, providerLabel);
  if (!snapshot) return null;

  return {
    ...snapshot,
    inputCostToman: usdToTomanCost(snapshot.inputCostUsd, usdToToman),
    outputCostToman: usdToTomanCost(snapshot.outputCostUsd, usdToToman),
    cacheReadCostToman: usdToTomanCost(snapshot.cacheReadCostUsd, usdToToman),
    cacheWriteCostToman: usdToTomanCost(snapshot.cacheWriteCostUsd, usdToToman),
    totalCostToman: Number.isFinite(Number(extractedJson?.__totalCostToman))
      ? Number(extractedJson!.__totalCostToman)
      : usdToTomanCost(snapshot.totalCostUsd, usdToToman),
  };
}
