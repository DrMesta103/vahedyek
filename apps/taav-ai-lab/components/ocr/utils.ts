import { CheckCircle2, Clock3, Loader2, TriangleAlert } from 'lucide-react';
import type { OcrSimulationJob } from '@/app/lib/data';
import { buildOcrAiMetaFromModel, resolveOcrModel } from '@/app/lib/ocr-models';
import {
  buildOcrUsageCost,
  readOcrCostFromMetaWithToman,
  resolveOcrModelPricing,
  type OcrAiUsageCost,
} from '@/app/lib/ocr-ai-pricing';
import type { AiProviderAccountPublic } from '@/app/lib/types/ai-accounts';
import { usdToTomanCost } from '@/app/lib/ai-usage-cost';
import {
  getOcrTransportUsageLabel,
  normalizeOcrTransportMode,
  type OcrTransportMode,
} from '@/app/lib/ocr-transport';
import type { OcrFieldReviewStatus, OcrFieldValidationStatus, OcrOverallStatus } from '@/app/lib/ocr-simulator-data';

const OVERALL_STATUS_LABELS: Record<OcrOverallStatus, string> = {
  completed: 'تکمیل شده',
  completed_with_review_required: 'تکمیل · نیاز به بازبینی',
  failed: 'ناموفق',
  needs_review: 'نیاز به بازبینی',
};

const VALIDATION_STATUS_LABELS: Record<OcrFieldValidationStatus, string> = {
  valid: 'معتبر',
  invalid: 'نامعتبر',
  missing: 'خالی',
  not_applicable: 'غیرمرتبط',
};

const REVIEW_STATUS_LABELS: Record<OcrFieldReviewStatus, string> = {
  accepted: 'پذیرفته',
  needs_review: 'نیاز به بازبینی',
  rejected: 'رد شده',
};

export function formatOverallStatus(status: string) {
  return OVERALL_STATUS_LABELS[status as OcrOverallStatus] ?? status.replaceAll('_', ' · ');
}

export function formatValidationStatus(status: OcrFieldValidationStatus) {
  return VALIDATION_STATUS_LABELS[status];
}

export function formatReviewStatus(status: OcrFieldReviewStatus) {
  return REVIEW_STATUS_LABELS[status];
}

export function getStatusMeta(status: OcrSimulationJob['status']) {
  switch (status) {
    case 'completed':
      return { tone: 'success' as const, label: 'تکمیل شده', icon: CheckCircle2 };
    case 'failed':
      return { tone: 'danger' as const, label: 'ناموفق', icon: TriangleAlert };
    case 'processing':
      return { tone: 'brand' as const, label: 'در حال پردازش', icon: Loader2 };
    default:
      return { tone: 'neutral' as const, label: 'در صف', icon: Clock3 };
  }
}

export function toReadableFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return 'نامشخص';
  if (size < 1024) return `${new Intl.NumberFormat('fa-IR').format(size)} بایت`;
  if (size < 1024 * 1024) {
    return `${new Intl.NumberFormat('fa-IR').format(Math.round(size / 1024))} کیلوبایت`;
  }
  return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(size / (1024 * 1024))} مگابایت`;
}

export function getJobProgress(job: OcrSimulationJob, clockTick: number) {
  if (job.status !== 'processing') return job.progress;

  const startedAt = new Date(job.startedAt).getTime();
  const readyAt = new Date(job.readyAt).getTime();
  const span = Math.max(1, readyAt - startedAt);
  const elapsed = Date.now() - startedAt + clockTick * 16;
  const ratio = Math.max(0, Math.min(1, elapsed / span));
  return Math.max(job.progress, Math.min(97, Math.round(14 + ratio * 80)));
}

export function formatConfidence(confidence: number) {
  return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(confidence)}%`;
}

export function buildOcrStats(jobs: OcrSimulationJob[]) {
  const total = jobs.length;
  const completed = jobs.filter((job) => job.status === 'completed').length;
  const processing = jobs.filter((job) => job.status === 'processing').length;
  const failed = jobs.filter((job) => job.status === 'failed').length;
  const avgConfidence =
    total === 0 ? 0 : Math.round(jobs.reduce((sum, job) => sum + job.confidence, 0) / total);
  const tokensUsed = jobs.reduce((sum, job) => sum + job.tokensUsed, 0);

  return { total, completed, processing, failed, avgConfidence, tokensUsed };
}

export type OcrResultFormField = {
  key: string;
  label: string;
  targetValue: string;
  confidence: number | null;
};

export type { OcrTransportMode } from '@/app/lib/ocr-transport';
export { getOcrTransportLabel, getOcrTransportUsageLabel, normalizeOcrTransportMode } from '@/app/lib/ocr-transport';

export function getOcrTransportMode(job: OcrSimulationJob, hint?: OcrTransportMode | string | null): OcrTransportMode {
  if (hint) return normalizeOcrTransportMode(hint);
  return normalizeOcrTransportMode(job.extractedJson?.__transportMode);
}

export type OcrAiUsage = {
  modelId: string;
  modelName: string;
  providerLabel: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type OcrStageKey = 'ocr' | 'chat';

export type OcrStageUsage = {
  stage: OcrStageKey;
  modelId: string;
  modelName: string;
  providerLabel: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  cacheWriteTokens: number;
  totalTokens: number;
  inputTokenPriceUsd: number;
  outputTokenPriceUsd: number;
  cacheReadTokenPriceUsd: number;
  cacheWriteTokenPriceUsd: number;
};

function readNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getOcrAiUsage(job: OcrSimulationJob, transportMode?: OcrTransportMode | null): OcrAiUsage {
  const mode = transportMode ?? getOcrTransportMode(job);
  const model = resolveOcrModel(job.extractedJson?.__aiModelId, mode);

  const storedInput = Number(job.extractedJson?.__inputTokens);
  const storedOutput = Number(job.extractedJson?.__outputTokens);
  const storedModelName = job.extractedJson?.__aiModelName;
  const storedProvider = job.extractedJson?.__aiProviderLabel;
  const storedModelId = job.extractedJson?.__aiModelId;

  if (storedModelName && Number.isFinite(storedInput) && Number.isFinite(storedOutput)) {
    return {
      modelId: storedModelId || model.id,
      modelName: storedModelName,
      providerLabel: storedProvider || model.providerLabel,
      inputTokens: storedInput,
      outputTokens: storedOutput,
      totalTokens: storedInput + storedOutput,
    };
  }

  const derived = buildOcrAiMetaFromModel(job.tokensUsed, model);
  const inputTokens = Number(derived.__inputTokens);
  const outputTokens = Number(derived.__outputTokens);

  return {
    modelId: model.id,
    modelName: model.name,
    providerLabel: model.providerLabel,
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}

export type { OcrAiUsageCost };

export function getOcrStageUsage(job: OcrSimulationJob, stage: OcrStageKey): OcrStageUsage {
  const prefix = stage === 'ocr' ? '__ocr' : '__chat';
  const extracted = job.extractedJson ?? {};
  const modelId = String((extracted as any)[`${prefix}ModelId`] ?? '—');
  const modelName = String((extracted as any)[`${prefix}ModelName`] ?? modelId);
  const providerLabel = String((extracted as any)[`${prefix}ProviderLabel`] ?? '—');
  const provider = String((extracted as any)[`${prefix}Provider`] ?? '—');
  const inputTokens = readNumber((extracted as any)[`${prefix}InputTokens`]);
  const outputTokens = readNumber((extracted as any)[`${prefix}OutputTokens`]);
  const cachedInputTokens = readNumber((extracted as any)[`${prefix}CachedInputTokens`]);
  const cacheWriteTokens = readNumber((extracted as any)[`${prefix}CacheWriteTokens`]);
  const totalTokens = inputTokens + outputTokens + cachedInputTokens + cacheWriteTokens;

  return {
    stage,
    modelId,
    modelName,
    providerLabel,
    provider,
    inputTokens,
    outputTokens,
    cachedInputTokens,
    cacheWriteTokens,
    totalTokens,
    inputTokenPriceUsd: readNumber((extracted as any)[`${prefix}InputTokenPriceUsd`]),
    outputTokenPriceUsd: readNumber((extracted as any)[`${prefix}OutputTokenPriceUsd`]),
    cacheReadTokenPriceUsd: readNumber((extracted as any)[`${prefix}CacheReadTokenPriceUsd`]),
    cacheWriteTokenPriceUsd: readNumber((extracted as any)[`${prefix}CacheWriteTokenPriceUsd`]),
  };
}

export function getOcrStageCost(job: OcrSimulationJob, stage: OcrStageKey, usdToToman: number): OcrAiUsageCost {
  const extracted = job.extractedJson ?? {};
  const providerLabel = stage === 'ocr'
    ? String((extracted as any).__ocrProviderLabel ?? '—')
    : String((extracted as any).__chatProviderLabel ?? '—');

  const base = stage === 'ocr'
    ? {
        accountId: null,
        providerLabel,
        inputCostUsd: readNumber((extracted as any).__ocrInputCostUsd),
        outputCostUsd: readNumber((extracted as any).__ocrOutputCostUsd),
        cacheReadCostUsd: readNumber((extracted as any).__ocrCacheReadCostUsd),
        cacheWriteCostUsd: readNumber((extracted as any).__ocrCacheWriteCostUsd),
        totalCostUsd: readNumber((extracted as any).__ocrTotalCostUsd),
        inputCostToman: 0,
        outputCostToman: 0,
        cacheReadCostToman: 0,
        cacheWriteCostToman: 0,
        totalCostToman: readNumber((extracted as any).__ocrTotalCostToman),
      }
    : {
        accountId: null,
        providerLabel,
        inputCostUsd: readNumber((extracted as any).__chatInputCostUsd),
        outputCostUsd: readNumber((extracted as any).__chatOutputCostUsd),
        cacheReadCostUsd: readNumber((extracted as any).__chatCacheReadCostUsd),
        cacheWriteCostUsd: readNumber((extracted as any).__chatCacheWriteCostUsd),
        totalCostUsd: readNumber((extracted as any).__chatTotalCostUsd),
        inputCostToman: 0,
        outputCostToman: 0,
        cacheReadCostToman: 0,
        cacheWriteCostToman: 0,
        totalCostToman: readNumber((extracted as any).__chatTotalCostToman),
      };

  return {
    ...base,
    inputCostToman: usdToTomanCost(base.inputCostUsd, usdToToman),
    outputCostToman: usdToTomanCost(base.outputCostUsd, usdToToman),
    cacheReadCostToman: usdToTomanCost(base.cacheReadCostUsd, usdToToman),
    cacheWriteCostToman: usdToTomanCost(base.cacheWriteCostUsd, usdToToman),
    totalCostToman: base.totalCostToman || usdToTomanCost(base.totalCostUsd, usdToToman),
  };
}

function sumStageCosts(ocrCost: OcrAiUsageCost, chatCost: OcrAiUsageCost): OcrAiUsageCost {
  return {
    accountId: null,
    providerLabel: 'کل',
    inputCostUsd: ocrCost.inputCostUsd + chatCost.inputCostUsd,
    outputCostUsd: ocrCost.outputCostUsd + chatCost.outputCostUsd,
    cacheReadCostUsd: ocrCost.cacheReadCostUsd + chatCost.cacheReadCostUsd,
    cacheWriteCostUsd: ocrCost.cacheWriteCostUsd + chatCost.cacheWriteCostUsd,
    totalCostUsd: ocrCost.totalCostUsd + chatCost.totalCostUsd,
    inputCostToman: ocrCost.inputCostToman + chatCost.inputCostToman,
    outputCostToman: ocrCost.outputCostToman + chatCost.outputCostToman,
    cacheReadCostToman: ocrCost.cacheReadCostToman + chatCost.cacheReadCostToman,
    cacheWriteCostToman: ocrCost.cacheWriteCostToman + chatCost.cacheWriteCostToman,
    totalCostToman: ocrCost.totalCostToman + chatCost.totalCostToman,
  };
}

export function hasOcrStageMeta(job: OcrSimulationJob, stage: OcrStageKey) {
  const prefix = stage === 'ocr' ? '__ocr' : '__chat';
  const extracted = job.extractedJson ?? {};
  const modelName = String((extracted as Record<string, string>)[`${prefix}ModelName`] ?? '');
  return modelName.length > 0 && modelName !== '—';
}

export function getOcrPipelineCost(
  job: OcrSimulationJob,
  usdToToman: number,
  legacyCost?: OcrAiUsageCost | null,
): OcrAiUsageCost {
  const extracted = job.extractedJson ?? {};
  const ocrCost = getOcrStageCost(job, 'ocr', usdToToman);
  const chatCost = getOcrStageCost(job, 'chat', usdToToman);
  const totalCostUsd = readNumber((extracted as Record<string, string>).__totalCostUsd);
  const totalCostToman = readNumber((extracted as Record<string, string>).__totalCostToman);

  if (totalCostUsd > 0 || totalCostToman > 0) {
    const summed = sumStageCosts(ocrCost, chatCost);
    return {
      ...summed,
      totalCostUsd: totalCostUsd || summed.totalCostUsd,
      totalCostToman: totalCostToman || usdToTomanCost(totalCostUsd || summed.totalCostUsd, usdToToman),
    };
  }

  const summed = sumStageCosts(ocrCost, chatCost);
  if (summed.totalCostUsd > 0 || summed.totalCostToman > 0) {
    return summed;
  }

  return legacyCost ?? ocrCost;
}

export function getOcrAiUsageCost(
  job: OcrSimulationJob,
  usdToToman: number,
  accounts?: AiProviderAccountPublic[],
  transportMode?: OcrTransportMode | null,
): OcrAiUsageCost {
  const usage = getOcrAiUsage(job, transportMode);
  const snapshot = readOcrCostFromMetaWithToman(job.extractedJson, usage.providerLabel, usdToToman);
  if (snapshot) return snapshot;

  const pricing = accounts ? resolveOcrModelPricing(usage.modelId, accounts) : null;
  return buildOcrUsageCost({
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    pricing,
    usdToToman,
    providerLabel: usage.providerLabel,
  });
}

export function getOcrFormFields(job: OcrSimulationJob): OcrResultFormField[] {
  const resultFields = job.resultJson?.fields ?? [];
  const schemaFields = job.templateSchema?.fields ?? [];

  if (schemaFields.length > 0) {
    return schemaFields.map((schemaField) => {
      const resultField = resultFields.find((field) => field.key === schemaField.key);
      const extracted = job.extractedFields.find((field) => field.key === schemaField.key);
      return {
        key: schemaField.key,
        label: schemaField.label,
        targetValue: resultField?.normalized_value || resultField?.value || extracted?.value || '',
        confidence: resultField?.confidence ?? null,
      };
    });
  }

  return job.extractedFields
    .filter((field) => !field.key.startsWith('__'))
    .map((field) => ({
      key: field.key,
      label: field.label,
      targetValue: field.value,
      confidence: null,
    }));
}
