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

  const modelKey = input.modelId?.trim() || DEFAULT_OCR_MODEL_ID;
  const parsedKey = parseOcrModelKey(modelKey);

  const selectedModelRow = parsedKey
    ? await prisma.aiProviderModel.findFirst({
        where: {
          accountId: parsedKey.accountId,
          isActive: true,
          modelType: 'OCR',
          providerModelName: parsedKey.providerModelName,
          account: { isActive: true },
        },
        include: { account: true },
      })
    : await prisma.aiProviderModel.findFirst({
        where: {
          isActive: true,
          modelType: 'OCR',
          providerModelName: modelKey,
          account: { isActive: true },
        },
        include: { account: true },
        orderBy: [{ updatedAt: 'desc' }],
      });

  const providerType = selectedModelRow ? (selectedModelRow.account.provider as AiProviderType) : null;
  const provider = selectedModelRow
    ? (mapAccountProviderToOcrProvider(selectedModelRow.account.provider) ?? 'openai')
    : 'openai';
  const providerLabel = providerType ? (AI_PROVIDER_LABELS[providerType] ?? selectedModelRow!.account.provider) : '—';

  const rowRatio = selectedModelRow
    ? toNumber(((selectedModelRow as unknown as { ocrInputRatio?: { toString(): string } | number }).ocrInputRatio ?? 0.6))
    : 0.6;
  const inputRatio = Math.min(0.99, Math.max(0.01, rowRatio));
  const inputTokens = Math.max(1, Math.round(job.tokensUsed * inputRatio));
  const outputTokens = Math.max(1, job.tokensUsed - inputTokens);

  const pricing = selectedModelRow
    ? {
        accountId: selectedModelRow.accountId,
        provider: (selectedModelRow.account.provider as AiProviderType) ?? 'OPENAI',
        providerLabel,
        inputTokenPriceUsd: toNumber(selectedModelRow.inputTokenPriceUsd),
        outputTokenPriceUsd: toNumber(selectedModelRow.outputTokenPriceUsd),
      }
    : null;

  const usageCost = buildOcrUsageCost({
    inputTokens,
    outputTokens,
    pricing,
    usdToToman: globalSettings.usdToToman,
    providerLabel,
  });

  job = {
    ...job,
    extractedJson: {
      ...job.extractedJson,
      ...buildOcrCostMeta(usageCost),
      __aiModelId: selectedModelRow?.providerModelName ?? modelKey,
      __aiModelName: selectedModelRow?.displayName ?? modelKey,
      __aiProviderLabel: providerLabel,
      __inputTokens: String(inputTokens),
      __outputTokens: String(outputTokens),
      __ocrProvider: provider,
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

    if (usageCost.accountId && usageCost.totalCostUsd > 0) {
      await tx.aiUsageLog.create({
        data: {
          aiAccountId: usageCost.accountId,
          tenantId: input.tenantId,
          businessId: input.tenantId,
          serviceName: 'ocr',
          featureName: selectedModelRow?.providerModelName ?? modelKey,
          requestId: job.id,
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          inputCostUsd: usageCost.inputCostUsd,
          outputCostUsd: usageCost.outputCostUsd,
          totalCostUsd: usageCost.totalCostUsd,
          metadata: {
            modelName: selectedModelRow?.displayName ?? modelKey,
            providerLabel: usageCost.providerLabel,
            totalCostToman: usageCost.totalCostToman,
          },
        },
      });

      await tx.aiProviderAccount.update({
        where: { id: usageCost.accountId },
        data: {
          usedCreditUsd: { increment: usageCost.totalCostUsd },
        },
      });
    }
  });

  return job;
}
