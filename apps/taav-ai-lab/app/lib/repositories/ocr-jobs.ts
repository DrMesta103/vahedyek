import { assertTenantAccess } from '../auth';
import {
  buildOcrCostMeta,
  buildOcrUsageCost,
} from '../ocr-ai-pricing';
import { DEFAULT_OCR_MODEL_ID, type OcrModelProvider } from '../ocr-models';
import { AI_PROVIDER_LABELS, type AiProviderType } from '../types/ai-accounts';
import {
  buildOcrSimulationJob,
  mapDbJobToDomain,
  mapOcrJobToDbData,
  materializeOcrJob,
} from '../ocr-job-builder';
import { prisma } from '../prisma';
import { getGlobalSettings } from './global-settings';
import type { CreateOcrSimulationInput, OcrSimulationJob } from '../types/domain';

function toNumber(value: { toString(): string } | number) {
  return Number(value);
}

function mapAccountProviderToOcrProvider(value: string): OcrModelProvider | null {
  const normalized = value.trim().toUpperCase();
  if (normalized === 'OPENAI') return 'openai';
  if (normalized === 'DEEPSEEK') return 'deepseek';
  if (normalized === 'GEMINI') return 'google';
  if (normalized === 'GROK') return 'xai';
  return null;
}

function parseOcrModelKey(value: string): { accountId: string; providerModelName: string } | null {
  const trimmed = value.trim();
  const idx = trimmed.indexOf(':');
  if (idx <= 0 || idx === trimmed.length - 1) return null;
  return { accountId: trimmed.slice(0, idx), providerModelName: trimmed.slice(idx + 1) };
}

function readModelCachePrices(row: unknown) {
  const anyRow = row as {
    cacheReadTokenPriceUsd?: { toString(): string } | number;
    cacheWriteTokenPriceUsd?: { toString(): string } | number;
  };
  return {
    cacheReadTokenPriceUsd: toNumber(anyRow.cacheReadTokenPriceUsd ?? 0),
    cacheWriteTokenPriceUsd: toNumber(anyRow.cacheWriteTokenPriceUsd ?? 0),
  };
}

function readModelTokenPrices(row: unknown) {
  const anyRow = row as {
    inputTokenPriceUsd?: { toString(): string } | number;
    outputTokenPriceUsd?: { toString(): string } | number;
  };
  return {
    inputTokenPriceUsd: toNumber(anyRow.inputTokenPriceUsd ?? 0),
    outputTokenPriceUsd: toNumber(anyRow.outputTokenPriceUsd ?? 0),
  };
}

async function persistMaterializedJob(job: OcrSimulationJob) {
  await prisma.ocrJob.update({
    where: { id: job.id },
    data: {
      status: job.status,
      progress: job.progress,
      completedAt: job.completedAt ? new Date(job.completedAt) : null,
      updatedAt: new Date(job.updatedAt),
    },
  });

  if (job.status === 'completed' || job.status === 'failed') {
    await prisma.tenant.update({
      where: { id: job.tenantId },
      data: {
        lastActivity: job.completedAt ? new Date(job.completedAt) : new Date(job.updatedAt),
      },
    });
  }
}

export async function getOcrJobsForTenant(userId: string, tenantId: string): Promise<OcrSimulationJob[]> {
  if (!(await assertTenantAccess(userId, tenantId))) return [];

  const rows = await prisma.ocrJob.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
  });

  let changed = false;
  const jobs = rows.map((row) => {
    const job = mapDbJobToDomain(row);
    const didChange = materializeOcrJob(job);
    if (didChange) changed = true;
    return job;
  });

  if (changed) {
    await Promise.all(jobs.filter((job) => job.status !== 'processing').map((job) => persistMaterializedJob(job)));
    const processingJobs = jobs.filter((job) => job.status === 'processing');
    await Promise.all(processingJobs.map((job) => persistMaterializedJob(job)));
  }

  return jobs;
}

export async function getOcrJobForTenant(
  userId: string,
  tenantId: string,
  jobId: string,
): Promise<OcrSimulationJob | null> {
  const jobs = await getOcrJobsForTenant(userId, tenantId);
  return jobs.find((job) => job.id === jobId) ?? null;
}

export async function createOcrJobForTenant(
  userId: string,
  input: CreateOcrSimulationInput,
): Promise<OcrSimulationJob | null> {
  if (!(await assertTenantAccess(userId, input.tenantId))) return null;

  let job = buildOcrSimulationJob(input.tenantId, input);
  const globalSettings = await getGlobalSettings();

  const ocrModelKey = input.modelId?.trim() || DEFAULT_OCR_MODEL_ID;
  const parsedOcrKey = parseOcrModelKey(ocrModelKey);

  const selectedOcrRow = parsedOcrKey
    ? await prisma.aiProviderModel.findFirst({
        where: {
          accountId: parsedOcrKey.accountId,
          isActive: true,
          modelType: 'OCR',
          providerModelName: parsedOcrKey.providerModelName,
          account: { isActive: true },
        },
        include: { account: true },
      })
    : await prisma.aiProviderModel.findFirst({
        where: {
          isActive: true,
          modelType: 'OCR',
          providerModelName: ocrModelKey,
          account: { isActive: true },
        },
        include: { account: true },
        orderBy: [{ updatedAt: 'desc' }],
      });

  const ocrProviderType = selectedOcrRow ? (selectedOcrRow.account.provider as AiProviderType) : null;
  const ocrProvider = selectedOcrRow
    ? (mapAccountProviderToOcrProvider(selectedOcrRow.account.provider) ?? 'openai')
    : 'openai';
  const ocrProviderLabel = ocrProviderType
    ? (AI_PROVIDER_LABELS[ocrProviderType] ?? selectedOcrRow!.account.provider)
    : '—';

  const rowRatio = selectedOcrRow
    ? toNumber(((selectedOcrRow as unknown as { ocrInputRatio?: { toString(): string } | number }).ocrInputRatio ?? 0.6))
    : 0.6;
  const inputRatio = Math.min(0.99, Math.max(0.01, rowRatio));
  const ocrInputTokens = Math.max(1, Math.round(job.tokensUsed * inputRatio));
  const ocrOutputTokens = Math.max(1, job.tokensUsed - ocrInputTokens);
  const ocrCachedInputTokens = 0;
  const ocrCacheWriteTokens = 0;

  const ocrTokenPrices = selectedOcrRow ? readModelTokenPrices(selectedOcrRow) : { inputTokenPriceUsd: 0, outputTokenPriceUsd: 0 };
  const ocrCachePrices = selectedOcrRow ? readModelCachePrices(selectedOcrRow) : { cacheReadTokenPriceUsd: 0, cacheWriteTokenPriceUsd: 0 };

  const ocrPricing = selectedOcrRow
    ? {
        accountId: selectedOcrRow.accountId,
        provider: (selectedOcrRow.account.provider as AiProviderType) ?? 'OPENAI',
        providerLabel: ocrProviderLabel,
        inputTokenPriceUsd: ocrTokenPrices.inputTokenPriceUsd,
        outputTokenPriceUsd: ocrTokenPrices.outputTokenPriceUsd,
        cacheReadTokenPriceUsd: ocrCachePrices.cacheReadTokenPriceUsd,
        cacheWriteTokenPriceUsd: ocrCachePrices.cacheWriteTokenPriceUsd,
      }
    : null;

  const ocrUsageCost = buildOcrUsageCost({
    inputTokens: ocrInputTokens,
    outputTokens: ocrOutputTokens,
    cachedInputTokens: ocrCachedInputTokens,
    cacheWriteTokens: ocrCacheWriteTokens,
    pricing: ocrPricing,
    usdToToman: globalSettings.usdToToman,
    providerLabel: ocrProviderLabel,
  });

  // Chat stage (modelType=CHAT)
  const chatModelKey = input.chatModelId?.trim() || '';
  const parsedChatKey = chatModelKey ? parseOcrModelKey(chatModelKey) : null;
  const selectedChatRow = parsedChatKey
    ? await prisma.aiProviderModel.findFirst({
        where: {
          accountId: parsedChatKey.accountId,
          isActive: true,
          modelType: 'CHAT',
          providerModelName: parsedChatKey.providerModelName,
          account: { isActive: true },
        },
        include: { account: true },
      })
    : null;

  const chatProviderType = selectedChatRow ? (selectedChatRow.account.provider as AiProviderType) : null;
  const chatProvider = selectedChatRow
    ? (mapAccountProviderToOcrProvider(selectedChatRow.account.provider) ?? 'openai')
    : 'openai';
  const chatProviderLabel = chatProviderType
    ? (AI_PROVIDER_LABELS[chatProviderType] ?? selectedChatRow!.account.provider)
    : '—';

  const chatInputTokens = 0;
  const chatOutputTokens = 0;
  const chatCachedInputTokens = 0;
  const chatCacheWriteTokens = 0;

  const chatTokenPrices = selectedChatRow ? readModelTokenPrices(selectedChatRow) : { inputTokenPriceUsd: 0, outputTokenPriceUsd: 0 };
  const chatCachePrices = selectedChatRow ? readModelCachePrices(selectedChatRow) : { cacheReadTokenPriceUsd: 0, cacheWriteTokenPriceUsd: 0 };
  const chatPricing = selectedChatRow
    ? {
        accountId: selectedChatRow.accountId,
        provider: (selectedChatRow.account.provider as AiProviderType) ?? 'OPENAI',
        providerLabel: chatProviderLabel,
        inputTokenPriceUsd: chatTokenPrices.inputTokenPriceUsd,
        outputTokenPriceUsd: chatTokenPrices.outputTokenPriceUsd,
        cacheReadTokenPriceUsd: chatCachePrices.cacheReadTokenPriceUsd,
        cacheWriteTokenPriceUsd: chatCachePrices.cacheWriteTokenPriceUsd,
      }
    : null;
  const chatUsageCost = buildOcrUsageCost({
    inputTokens: chatInputTokens,
    outputTokens: chatOutputTokens,
    cachedInputTokens: chatCachedInputTokens,
    cacheWriteTokens: chatCacheWriteTokens,
    pricing: chatPricing,
    usdToToman: globalSettings.usdToToman,
    providerLabel: chatProviderLabel,
  });

  const totalCostUsd = ocrUsageCost.totalCostUsd + chatUsageCost.totalCostUsd;
  const totalCostToman = ocrUsageCost.totalCostToman + chatUsageCost.totalCostToman;

  job = {
    ...job,
    extractedJson: {
      ...job.extractedJson,
      // OCR stage (namespaced)
      __ocrModelId: selectedOcrRow?.providerModelName ?? ocrModelKey,
      __ocrModelName: selectedOcrRow?.displayName ?? ocrModelKey,
      __ocrProviderLabel: ocrProviderLabel,
      __ocrProvider: ocrProvider,
      __ocrInputTokens: String(ocrInputTokens),
      __ocrOutputTokens: String(ocrOutputTokens),
      __ocrCachedInputTokens: String(ocrCachedInputTokens),
      __ocrCacheWriteTokens: String(ocrCacheWriteTokens),
      __ocrInputTokenPriceUsd: String(ocrTokenPrices.inputTokenPriceUsd),
      __ocrOutputTokenPriceUsd: String(ocrTokenPrices.outputTokenPriceUsd),
      __ocrCacheReadTokenPriceUsd: String(ocrCachePrices.cacheReadTokenPriceUsd),
      __ocrCacheWriteTokenPriceUsd: String(ocrCachePrices.cacheWriteTokenPriceUsd),
      __ocrInputCostUsd: String(ocrUsageCost.inputCostUsd),
      __ocrOutputCostUsd: String(ocrUsageCost.outputCostUsd),
      __ocrCacheReadCostUsd: String(ocrUsageCost.cacheReadCostUsd),
      __ocrCacheWriteCostUsd: String(ocrUsageCost.cacheWriteCostUsd),
      __ocrTotalCostUsd: String(ocrUsageCost.totalCostUsd),
      __ocrTotalCostToman: String(ocrUsageCost.totalCostToman),

      // Chat stage (namespaced)
      __chatModelId: selectedChatRow?.providerModelName ?? (chatModelKey || '—'),
      __chatModelName: selectedChatRow?.displayName ?? (chatModelKey || '—'),
      __chatProviderLabel: chatProviderLabel,
      __chatProvider: chatProvider,
      __chatInputTokens: String(chatInputTokens),
      __chatOutputTokens: String(chatOutputTokens),
      __chatCachedInputTokens: String(chatCachedInputTokens),
      __chatCacheWriteTokens: String(chatCacheWriteTokens),
      __chatInputTokenPriceUsd: String(chatTokenPrices.inputTokenPriceUsd),
      __chatOutputTokenPriceUsd: String(chatTokenPrices.outputTokenPriceUsd),
      __chatCacheReadTokenPriceUsd: String(chatCachePrices.cacheReadTokenPriceUsd),
      __chatCacheWriteTokenPriceUsd: String(chatCachePrices.cacheWriteTokenPriceUsd),
      __chatInputCostUsd: String(chatUsageCost.inputCostUsd),
      __chatOutputCostUsd: String(chatUsageCost.outputCostUsd),
      __chatCacheReadCostUsd: String(chatUsageCost.cacheReadCostUsd),
      __chatCacheWriteCostUsd: String(chatUsageCost.cacheWriteCostUsd),
      __chatTotalCostUsd: String(chatUsageCost.totalCostUsd),
      __chatTotalCostToman: String(chatUsageCost.totalCostToman),

      // Total (for list/reporting)
      __totalCostUsd: String(totalCostUsd),
      __totalCostToman: String(totalCostToman),

      // Keep backwards compatible keys for existing UI paths
      ...buildOcrCostMeta({ ...ocrUsageCost, totalCostUsd, totalCostToman }),
    },
  };

  const data = mapOcrJobToDbData(job);

  await prisma.$transaction(async (tx) => {
    await tx.ocrJob.create({ data });
    await tx.tenant.update({
      where: { id: input.tenantId },
      data: {
        ocrTestsCount: { increment: 1 },
        usedTokens: { increment: job.tokensUsed },
        lastActivity: new Date(job.updatedAt),
      },
    });

    if (ocrUsageCost.accountId && ocrUsageCost.totalCostUsd > 0) {
      await tx.aiUsageLog.create({
        data: {
          aiAccountId: ocrUsageCost.accountId,
          tenantId: input.tenantId,
          businessId: input.tenantId,
          serviceName: 'ocr',
          featureName: selectedOcrRow?.providerModelName ?? ocrModelKey,
          requestId: job.id,
          inputTokens: ocrInputTokens,
          outputTokens: ocrOutputTokens,
          cachedInputTokens: ocrCachedInputTokens,
          cacheWriteTokens: ocrCacheWriteTokens,
          totalTokens: ocrInputTokens + ocrOutputTokens + ocrCachedInputTokens + ocrCacheWriteTokens,
          inputCostUsd: ocrUsageCost.inputCostUsd,
          outputCostUsd: ocrUsageCost.outputCostUsd,
          cacheReadCostUsd: ocrUsageCost.cacheReadCostUsd,
          cacheWriteCostUsd: ocrUsageCost.cacheWriteCostUsd,
          totalCostUsd: ocrUsageCost.totalCostUsd,
          metadata: {
            stage: 'ocr',
            modelName: selectedOcrRow?.displayName ?? ocrModelKey,
            providerLabel: ocrUsageCost.providerLabel,
            totalCostToman: ocrUsageCost.totalCostToman,
          },
        } as any,
      });

      await tx.aiProviderAccount.update({
        where: { id: ocrUsageCost.accountId },
        data: {
          usedCreditUsd: { increment: ocrUsageCost.totalCostUsd },
        },
      });
    }

    if (chatUsageCost.accountId && chatUsageCost.totalCostUsd > 0) {
      await tx.aiUsageLog.create({
        data: {
          aiAccountId: chatUsageCost.accountId,
          tenantId: input.tenantId,
          businessId: input.tenantId,
          serviceName: 'ocr-chat',
          featureName: selectedChatRow?.providerModelName ?? chatModelKey,
          requestId: job.id,
          inputTokens: chatInputTokens,
          outputTokens: chatOutputTokens,
          cachedInputTokens: chatCachedInputTokens,
          cacheWriteTokens: chatCacheWriteTokens,
          totalTokens: chatInputTokens + chatOutputTokens + chatCachedInputTokens + chatCacheWriteTokens,
          inputCostUsd: chatUsageCost.inputCostUsd,
          outputCostUsd: chatUsageCost.outputCostUsd,
          cacheReadCostUsd: chatUsageCost.cacheReadCostUsd,
          cacheWriteCostUsd: chatUsageCost.cacheWriteCostUsd,
          totalCostUsd: chatUsageCost.totalCostUsd,
          metadata: {
            stage: 'chat',
            modelName: selectedChatRow?.displayName ?? chatModelKey,
            providerLabel: chatUsageCost.providerLabel,
            totalCostToman: chatUsageCost.totalCostToman,
          },
        } as any,
      });

      await tx.aiProviderAccount.update({
        where: { id: chatUsageCost.accountId },
        data: {
          usedCreditUsd: { increment: chatUsageCost.totalCostUsd },
        },
      });
    }
  });

  return job;
}
