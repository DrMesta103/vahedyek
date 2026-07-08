import { assertTenantAccess } from '../auth';
import {
  buildOcrCostMeta,
  buildOcrUsageCost,
  resolveOcrModelPricing,
} from '../ocr-ai-pricing';
import { buildOcrAiMetaFromModel, resolveOcrModel } from '../ocr-models';
import {
  buildOcrSimulationJob,
  mapDbJobToDomain,
  mapOcrJobToDbData,
  materializeOcrJob,
} from '../ocr-job-builder';
import { prisma } from '../prisma';
import { listAiProviderAccounts } from './ai-accounts';
import { getGlobalSettings } from './global-settings';
import type { CreateOcrSimulationInput, OcrSimulationJob } from '../types/domain';

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
  const [{ accounts }, globalSettings] = await Promise.all([
    listAiProviderAccounts(),
    getGlobalSettings(),
  ]);

  const model = resolveOcrModel(input.modelId, input.transportMode);
  const aiMeta = buildOcrAiMetaFromModel(job.tokensUsed, model);
  const inputTokens = Number(aiMeta.__inputTokens);
  const outputTokens = Number(aiMeta.__outputTokens);
  const pricing = resolveOcrModelPricing(model.id, accounts);
  const usageCost = buildOcrUsageCost({
    inputTokens,
    outputTokens,
    pricing,
    usdToToman: globalSettings.usdToToman,
    providerLabel: model.providerLabel,
  });

  job = {
    ...job,
    extractedJson: {
      ...job.extractedJson,
      ...buildOcrCostMeta(usageCost),
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
          featureName: model.id,
          requestId: job.id,
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          inputCostUsd: usageCost.inputCostUsd,
          outputCostUsd: usageCost.outputCostUsd,
          totalCostUsd: usageCost.totalCostUsd,
          metadata: {
            modelName: model.name,
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
