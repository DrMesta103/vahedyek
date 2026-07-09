import { useMemo } from 'react';
import { Bot, Clock3, Wallet } from 'lucide-react';
import type { OcrSimulationJob } from '@/app/lib/data';
import { formatCostUsd } from '@/app/lib/ai-usage-cost';
import { formatTokenCount } from '@/app/lib/business-utils';
import { formatCostToman } from '@/app/lib/ocr-ai-pricing';
import { OcrStageUsageCard } from '@/components/ocr/OcrStageUsageCard';
import {
  formatConfidence,
  getOcrAiUsage,
  getOcrPipelineCost,
  getOcrStageCost,
  getOcrStageUsage,
  getOcrTransportUsageLabel,
  hasOcrStageMeta,
  type OcrAiUsageCost,
  type OcrStageUsage,
  type OcrTransportMode,
} from '@/components/ocr/utils';

type OcrPipelineUsageSectionProps = {
  job: OcrSimulationJob;
  usdToToman: number;
  transportMode: OcrTransportMode;
  legacyCost?: OcrAiUsageCost | null;
  confidence?: number;
  durationMs?: number;
  compact?: boolean;
};

function formatDurationMs(durationMs: number) {
  if (!Number.isFinite(durationMs) || durationMs < 0) return null;
  if (durationMs < 1000) {
    return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(durationMs)} ms`;
  }

  const seconds = durationMs / 1000;
  if (seconds < 60) {
    return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(seconds)} ثانیه`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  const minutesLabel = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(minutes);
  const secondsLabel = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(Math.round(remainder));
  return `${minutesLabel}:${secondsLabel.padStart(2, '0')}`;
}

function buildLegacyOcrStageUsage(job: OcrSimulationJob, transportMode: OcrTransportMode): OcrStageUsage {
  const legacy = getOcrAiUsage(job, transportMode);
  const extracted = job.extractedJson ?? {};

  return {
    stage: 'ocr',
    modelId: legacy.modelId,
    modelName: legacy.modelName,
    providerLabel: legacy.providerLabel,
    provider: String((extracted as Record<string, string>).__ocrProvider ?? '—'),
    inputTokens: legacy.inputTokens,
    outputTokens: legacy.outputTokens,
    cachedInputTokens: 0,
    cacheWriteTokens: 0,
    totalTokens: legacy.totalTokens,
    inputTokenPriceUsd: Number((extracted as Record<string, string>).__ocrInputTokenPriceUsd) || 0,
    outputTokenPriceUsd: Number((extracted as Record<string, string>).__ocrOutputTokenPriceUsd) || 0,
    cacheReadTokenPriceUsd: Number((extracted as Record<string, string>).__ocrCacheReadTokenPriceUsd) || 0,
    cacheWriteTokenPriceUsd: Number((extracted as Record<string, string>).__ocrCacheWriteTokenPriceUsd) || 0,
  };
}

export function OcrPipelineUsageSection({
  job,
  usdToToman,
  transportMode,
  legacyCost,
  confidence,
  durationMs,
  compact = false,
}: OcrPipelineUsageSectionProps) {
  const { ocrUsage, chatUsage, ocrCost, chatCost, pipelineCost, totalTokens } = useMemo(() => {
    const ocrStageUsage = hasOcrStageMeta(job, 'ocr')
      ? getOcrStageUsage(job, 'ocr')
      : buildLegacyOcrStageUsage(job, transportMode);
    const chatStageUsage = getOcrStageUsage(job, 'chat');
    const ocrStageCost = hasOcrStageMeta(job, 'ocr')
      ? getOcrStageCost(job, 'ocr', usdToToman)
      : (legacyCost ?? getOcrStageCost(job, 'ocr', usdToToman));
    const chatStageCost = getOcrStageCost(job, 'chat', usdToToman);
    const pipeline = getOcrPipelineCost(job, usdToToman, legacyCost);
    const tokens =
      (ocrStageUsage.totalTokens + (hasOcrStageMeta(job, 'chat') ? chatStageUsage.totalTokens : 0)) ||
      job.tokensUsed;

    return {
      ocrUsage: ocrStageUsage,
      chatUsage: chatStageUsage,
      ocrCost: ocrStageCost,
      chatCost: chatStageCost,
      pipelineCost: pipeline,
      totalTokens: tokens,
    };
  }, [job, usdToToman, transportMode, legacyCost]);

  const durationLabel = durationMs !== undefined ? formatDurationMs(durationMs) : null;
  const usageStyleMode = transportMode === 'rest' ? 'rest' : 'grpc';

  return (
    <section
      className={[
        'ai-lab-ocr-pipeline-usage',
        compact ? 'ai-lab-ocr-pipeline-usage--compact' : '',
        `ai-lab-ocr-pipeline-usage--${usageStyleMode}`,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="مصرف و هزینه مدل‌های OCR"
    >
      <div className="ai-lab-ocr-pipeline-usage__cards">
        <OcrStageUsageCard stage="ocr" usage={ocrUsage} cost={ocrCost} compact={compact} />
        <OcrStageUsageCard stage="chat" usage={chatUsage} cost={chatCost} compact={compact} />
      </div>

      <footer className="ai-lab-ocr-pipeline-usage__foot">
        <div className="ai-lab-ocr-pipeline-usage__foot-row">
          <span className={`ai-lab-ocr-pipeline-usage__transport ai-lab-ocr-pipeline-usage__transport--${usageStyleMode}`}>
            <Bot className="h-3 w-3" aria-hidden />
            {getOcrTransportUsageLabel(transportMode)}
          </span>
          <span className="ai-lab-ocr-pipeline-usage__foot-tokens">
            مجموع: <strong>{formatTokenCount(totalTokens)}</strong> توکن
          </span>
        </div>

        <div className="ai-lab-ocr-pipeline-usage__foot-total">
          <Wallet className="h-3.5 w-3.5" aria-hidden />
          <span>مجموع کل</span>
          <span dir="ltr" className="ai-lab-ocr-pipeline-usage__foot-usd">
            {formatCostUsd(pipelineCost.totalCostUsd)}
          </span>
          <span className="ai-lab-ocr-pipeline-usage__foot-toman">
            {formatCostToman(pipelineCost.totalCostToman)}
          </span>
        </div>

        <div className="ai-lab-ocr-pipeline-usage__foot-meta">
          {durationLabel ? (
            <span>
              <Clock3 className="h-3.5 w-3.5" aria-hidden style={{ display: 'inline', marginInlineEnd: 4 }} />
              زمان پاسخ: <strong>{durationLabel}</strong>
            </span>
          ) : null}
          {confidence !== undefined ? <span>شباهت: {formatConfidence(confidence)}</span> : null}
        </div>
      </footer>
    </section>
  );
}
