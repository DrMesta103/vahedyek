import { ArrowDownToLine, ArrowUpFromLine, Bot, Clock3, Cpu, Wallet } from 'lucide-react';
import { formatTokenCount } from '@/app/lib/business-utils';
import { formatCostUsd } from '@/app/lib/ai-usage-cost';
import { formatCostToman } from '@/app/lib/ocr-ai-pricing';
import { getOcrTransportUsageLabel, type OcrAiUsageCost, type OcrTransportMode } from '@/components/ocr/utils';
import type { OcrAiUsage } from '@/components/ocr/utils';

type OcrAiUsagePanelProps = {
  usage: OcrAiUsage;
  cost?: OcrAiUsageCost | null;
  transportMode: OcrTransportMode;
  confidence?: number;
  durationMs?: number;
  compact?: boolean;
};

function formatConfidence(confidence: number) {
  return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(confidence)}%`;
}

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

export function OcrAiUsagePanel({
  usage,
  cost,
  transportMode,
  confidence,
  durationMs,
  compact = false,
}: OcrAiUsagePanelProps) {
  const inputShare = usage.totalTokens > 0 ? (usage.inputTokens / usage.totalTokens) * 100 : 50;
  const outputShare = 100 - inputShare;
  const durationLabel = durationMs !== undefined ? formatDurationMs(durationMs) : null;
  const usageStyleMode = transportMode === 'rest' ? 'rest' : 'grpc';
  const showCost = cost && (cost.totalCostUsd > 0 || cost.totalCostToman > 0);

  return (
    <aside
      className={[
        'ai-lab-ocr-usage',
        compact ? 'ai-lab-ocr-usage--compact' : '',
        `ai-lab-ocr-usage--${transportMode}`,
        `ai-lab-ocr-usage--${usageStyleMode}`,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label="مصرف توکن و مدل AI"
    >
      <div className="ai-lab-ocr-usage-head">
        <div className="ai-lab-ocr-usage-model">
          <span className="ai-lab-ocr-usage-model-icon" aria-hidden>
            <Cpu className="h-4 w-4" />
          </span>
          <div>
            <span className="ai-lab-ocr-usage-provider">{usage.providerLabel}</span>
            <strong>{usage.modelName}</strong>
          </div>
        </div>
        <span className={`ai-lab-ocr-usage-transport ai-lab-ocr-usage-transport--${usageStyleMode}`}>
          <Bot className="h-3 w-3" aria-hidden />
          {getOcrTransportUsageLabel(transportMode)}
        </span>
      </div>

      <div className="ai-lab-ocr-usage-stats">
        <div className="ai-lab-ocr-usage-stat ai-lab-ocr-usage-stat--input">
          <span className="ai-lab-ocr-usage-stat-label">
            <ArrowDownToLine className="h-3.5 w-3.5" aria-hidden />
            توکن ورودی
          </span>
          <strong>{formatTokenCount(usage.inputTokens)}</strong>
        </div>
        <div className="ai-lab-ocr-usage-stat ai-lab-ocr-usage-stat--output">
          <span className="ai-lab-ocr-usage-stat-label">
            <ArrowUpFromLine className="h-3.5 w-3.5" aria-hidden />
            توکن خروجی
          </span>
          <strong>{formatTokenCount(usage.outputTokens)}</strong>
        </div>
      </div>

      <div className="ai-lab-ocr-usage-bar" aria-hidden>
        <span className="ai-lab-ocr-usage-bar-input" style={{ width: `${inputShare}%` }} />
        <span className="ai-lab-ocr-usage-bar-output" style={{ width: `${outputShare}%` }} />
      </div>

      {showCost ? (
        <div className="ai-lab-ocr-usage-cost" aria-label="هزینه مصرف">
          <div className="ai-lab-ocr-usage-cost-head">
            <Wallet className="h-3.5 w-3.5" aria-hidden />
            <strong>{cost.providerLabel}</strong>
          </div>
          <div className="ai-lab-ocr-usage-cost-rows">
            <div className="ai-lab-ocr-usage-cost-row">
              <span>ورودی</span>
              <span dir="ltr">{formatCostUsd(cost.inputCostUsd)}</span>
              <span>{formatCostToman(cost.inputCostToman)}</span>
            </div>
            <div className="ai-lab-ocr-usage-cost-row">
              <span>خروجی</span>
              <span dir="ltr">{formatCostUsd(cost.outputCostUsd)}</span>
              <span>{formatCostToman(cost.outputCostToman)}</span>
            </div>
            {cost.cacheReadCostUsd > 0 || cost.cacheReadCostToman > 0 ? (
              <div className="ai-lab-ocr-usage-cost-row">
                <span>Cache read</span>
                <span dir="ltr">{formatCostUsd(cost.cacheReadCostUsd)}</span>
                <span>{formatCostToman(cost.cacheReadCostToman)}</span>
              </div>
            ) : null}
            {cost.cacheWriteCostUsd > 0 || cost.cacheWriteCostToman > 0 ? (
              <div className="ai-lab-ocr-usage-cost-row">
                <span>Cache write</span>
                <span dir="ltr">{formatCostUsd(cost.cacheWriteCostUsd)}</span>
                <span>{formatCostToman(cost.cacheWriteCostToman)}</span>
              </div>
            ) : null}
            <div className="ai-lab-ocr-usage-cost-row ai-lab-ocr-usage-cost-row--total">
              <span>مجموع</span>
              <span dir="ltr">{formatCostUsd(cost.totalCostUsd)}</span>
              <span>{formatCostToman(cost.totalCostToman)}</span>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="ai-lab-ocr-usage-foot">
        <span>
          مجموع: <strong>{formatTokenCount(usage.totalTokens)}</strong> توکن
        </span>
        {durationLabel ? (
          <span>
            <Clock3 className="h-3.5 w-3.5" aria-hidden style={{ display: 'inline', marginInlineEnd: 4 }} />
            زمان پاسخ: <strong>{durationLabel}</strong>
          </span>
        ) : null}
        {confidence !== undefined ? <span>شباهت: {formatConfidence(confidence)}</span> : null}
      </footer>
    </aside>
  );
}
