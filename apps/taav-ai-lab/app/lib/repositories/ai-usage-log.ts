import { prisma } from '../prisma';
import type { OcrAiUsageCost } from '../ocr-ai-pricing';

export type RecordAiUsageLogInput = {
  accountId: string;
  tenantId?: string | null;
  businessId?: string | null;
  serviceName: string;
  featureName: string;
  requestId?: string | null;
  inputTokens: number;
  outputTokens: number;
  costs: Pick<OcrAiUsageCost, 'inputCostUsd' | 'outputCostUsd' | 'totalCostUsd'>;
  metadata?: Record<string, unknown> | null;
};

export async function recordAiUsageLog(input: RecordAiUsageLogInput) {
  const safeInputTokens = Math.max(0, Math.floor(input.inputTokens));
  const safeOutputTokens = Math.max(0, Math.floor(input.outputTokens));

  return prisma.aiUsageLog.create({
    data: {
      aiAccountId: input.accountId,
      tenantId: input.tenantId ?? null,
      businessId: input.businessId ?? null,
      serviceName: input.serviceName,
      featureName: input.featureName,
      requestId: input.requestId ?? null,
      inputTokens: safeInputTokens,
      outputTokens: safeOutputTokens,
      totalTokens: safeInputTokens + safeOutputTokens,
      inputCostUsd: input.costs.inputCostUsd,
      outputCostUsd: input.costs.outputCostUsd,
      totalCostUsd: input.costs.totalCostUsd,
      metadata: input.metadata ? (input.metadata as object) : undefined,
    },
  });
}

export async function incrementAccountUsedCredit(accountId: string, amountUsd: number) {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) return;

  await prisma.aiProviderAccount.update({
    where: { id: accountId },
    data: {
      usedCreditUsd: { increment: amountUsd },
    },
  });
}
