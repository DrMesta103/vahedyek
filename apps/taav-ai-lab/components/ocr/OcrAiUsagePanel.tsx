import { ArrowDownToLine, ArrowUpFromLine, Bot, Cpu } from 'lucide-react';
import { formatTokenCount } from '@/app/lib/business-utils';
import type { OcrAiUsage } from '@/components/ocr/utils';

type OcrAiUsagePanelProps = {
  usage: OcrAiUsage;
  transportMode: 'rest' | 'grpc';
  confidence?: number;
  compact?: boolean;
};

function formatConfidence(confidence: number) {
  return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(confidence)}%`;
}

export function OcrAiUsagePanel({ usage, transportMode, confidence, compact = false }: OcrAiUsagePanelProps) {
  const inputShare = usage.totalTokens > 0 ? (usage.inputTokens / usage.totalTokens) * 100 : 50;
  const outputShare = 100 - inputShare;

  return (
    <aside
      className={[
        'ai-lab-ocr-usage',
        compact ? 'ai-lab-ocr-usage--compact' : '',
        `ai-lab-ocr-usage--${transportMode}`,
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
        <span className={`ai-lab-ocr-usage-transport ai-lab-ocr-usage-transport--${transportMode}`}>
          <Bot className="h-3 w-3" aria-hidden />
          {transportMode === 'grpc' ? 'gRPC' : 'REST'}
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

      <footer className="ai-lab-ocr-usage-foot">
        <span>
          مجموع: <strong>{formatTokenCount(usage.totalTokens)}</strong> توکن
        </span>
        {confidence !== undefined ? <span>شباهت: {formatConfidence(confidence)}</span> : null}
      </footer>
    </aside>
  );
}
