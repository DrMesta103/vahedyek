export type AiUsageCostAccount = {
  inputTokenPriceUsd: number;
  outputTokenPriceUsd: number;
  cacheReadTokenPriceUsd?: number;
  cacheWriteTokenPriceUsd?: number;
};

export type AiUsageCostResult = {
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
};

export type AiUsageCostDetailedResult = AiUsageCostResult & {
  cacheReadCostUsd: number;
  cacheWriteCostUsd: number;
};

export type AiUsageTokenCounts = {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
  cacheWriteTokens?: number;
};

/**
 * Calculates usage cost from account-level per-token prices.
 * TODO: When persisting to AiUsageLog, prefer Prisma Decimal for money fields.
 */
export function calculateAiUsageCost(
  account: AiUsageCostAccount,
  inputTokens: number,
  outputTokens: number,
): AiUsageCostResult {
  const safeInputTokens = Math.max(0, Math.floor(inputTokens));
  const safeOutputTokens = Math.max(0, Math.floor(outputTokens));
  const inputCostUsd = safeInputTokens * account.inputTokenPriceUsd;
  const outputCostUsd = safeOutputTokens * account.outputTokenPriceUsd;

  return {
    inputCostUsd,
    outputCostUsd,
    totalCostUsd: inputCostUsd + outputCostUsd,
  };
}

export function calculateAiUsageCostDetailed(
  account: AiUsageCostAccount,
  tokens: AiUsageTokenCounts,
): AiUsageCostDetailedResult {
  const safeInputTokens = Math.max(0, Math.floor(tokens.inputTokens));
  const safeOutputTokens = Math.max(0, Math.floor(tokens.outputTokens));
  const safeCachedInputTokens = Math.max(0, Math.floor(tokens.cachedInputTokens ?? 0));
  const safeCacheWriteTokens = Math.max(0, Math.floor(tokens.cacheWriteTokens ?? 0));

  const inputCostUsd = safeInputTokens * account.inputTokenPriceUsd;
  const outputCostUsd = safeOutputTokens * account.outputTokenPriceUsd;
  const cacheReadCostUsd = safeCachedInputTokens * (account.cacheReadTokenPriceUsd ?? 0);
  const cacheWriteCostUsd = safeCacheWriteTokens * (account.cacheWriteTokenPriceUsd ?? 0);

  return {
    inputCostUsd,
    outputCostUsd,
    cacheReadCostUsd,
    cacheWriteCostUsd,
    totalCostUsd: inputCostUsd + outputCostUsd + cacheReadCostUsd + cacheWriteCostUsd,
  };
}

export function parseNonNegativeDecimal(value: unknown) {
  if (value === undefined || value === null || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function formatTokenPriceUsd(value: number) {
  if (!Number.isFinite(value) || value === 0) {
    return '$0';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 12,
  }).format(value);
}

export function usdToTomanCost(costUsd: number, usdToToman: number) {
  if (!Number.isFinite(costUsd) || !Number.isFinite(usdToToman)) return 0;
  return costUsd * usdToToman;
}

export function formatCostUsd(value: number) {
  if (!Number.isFinite(value) || value === 0) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);
}
