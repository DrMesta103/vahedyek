import { ArrowDownToLine, ArrowUpFromLine, Database, PencilLine, Wallet } from 'lucide-react';
import { formatCostUsd, formatTokenPriceUsd } from '@/app/lib/ai-usage-cost';
import { formatTokenCount } from '@/app/lib/business-utils';
import { formatCostToman } from '@/app/lib/ocr-ai-pricing';
import type { OcrAiUsageCost, OcrStageKey, OcrStageUsage } from '@/components/ocr/utils';
import { buildCostLines } from '@/components/ocr/usage-format';

type OcrStageUsageCardProps = {
  stage: OcrStageKey;
  usage: OcrStageUsage;
  cost: OcrAiUsageCost;
  compact?: boolean;
};

const STAGE_LABEL: Record<OcrStageKey, string> = {
  ocr: 'OCR',
  chat: 'Chat',
};

function StageTokenChip({
  kind,
  label,
  value,
}: {
  kind: 'input' | 'output' | 'cacheRead' | 'cacheWrite';
  label: string;
  value: number;
}) {
  const Icon =
    kind === 'input'
      ? ArrowDownToLine
      : kind === 'output'
        ? ArrowUpFromLine
        : kind === 'cacheRead'
          ? Database
          : PencilLine;

  return (
    <div className={`ai-lab-ocr-stage-usage__chip ai-lab-ocr-stage-usage__chip--${kind}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span>{label}</span>
      <strong>{formatTokenCount(value)}</strong>
    </div>
  );
}

export function OcrStageUsageCard({ stage, usage, cost, compact = false }: OcrStageUsageCardProps) {
  const isPlaceholder = usage.modelName === '—' && usage.modelId === '—';
  const stageClass = stage === 'ocr' ? 'ai-lab-ocr-stage-usage--ocr' : 'ai-lab-ocr-stage-usage--chat';
  const lines = isPlaceholder ? [] : buildCostLines(usage, cost);

  return (
    <section
      className={[
        'ai-lab-ocr-stage-usage',
        stageClass,
        compact ? 'ai-lab-ocr-stage-usage--compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={`مصرف و هزینه ${STAGE_LABEL[stage]}`}
    >
      <header className="ai-lab-ocr-stage-usage__head">
        <div className="ai-lab-ocr-stage-usage__title">
          <span className="ai-lab-ocr-stage-usage__badge">{STAGE_LABEL[stage]}</span>
          <div className="ai-lab-ocr-stage-usage__model">
            <span className="ai-lab-ocr-stage-usage__provider">{usage.providerLabel}</span>
            <strong title={usage.modelName}>{usage.modelName}</strong>
          </div>
        </div>
      </header>

      {!isPlaceholder ? (
        <>
          <div className="ai-lab-ocr-stage-usage__chips" aria-label="توکن‌ها">
            <StageTokenChip kind="input" label="ورودی" value={usage.inputTokens} />
            <StageTokenChip kind="output" label="خروجی" value={usage.outputTokens} />
            {usage.cachedInputTokens > 0 ? (
              <StageTokenChip kind="cacheRead" label="کش" value={usage.cachedInputTokens} />
            ) : null}
            {usage.cacheWriteTokens > 0 ? (
              <StageTokenChip kind="cacheWrite" label="نوشتن کش" value={usage.cacheWriteTokens} />
            ) : null}
          </div>

          <div className="ai-lab-ocr-stage-usage__cost" aria-label="هزینه">
            <div className="ai-lab-ocr-stage-usage__cost-head">
              <Wallet className="h-3.5 w-3.5" aria-hidden />
              <strong>هزینه این مرحله</strong>
            </div>

            <div className="ai-lab-ocr-stage-usage__cost-rows" role="list">
              {lines.map((line) => {
                const isCache = line.key === 'cacheRead' || line.key === 'cacheWrite';
                return (
                  <div
                    key={line.key}
                    className={[
                      'ai-lab-ocr-stage-usage__cost-line',
                      isCache ? 'ai-lab-ocr-stage-usage__cost-line--cache' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    role="listitem"
                  >
                    <span className="ai-lab-ocr-stage-usage__cost-label">{line.label}</span>
                    <span className="ai-lab-ocr-stage-usage__cost-formula">
                      <span className="ai-lab-ocr-stage-usage__cost-tokens">{formatTokenCount(line.tokens)}</span>
                      <span className="ai-lab-ocr-stage-usage__cost-mul" aria-hidden>
                        ×
                      </span>
                      <span dir="ltr" className="ai-lab-ocr-stage-usage__cost-unit">
                        {formatTokenPriceUsd(line.unitPriceUsd)}
                      </span>
                    </span>
                    <span dir="ltr" className="ai-lab-ocr-stage-usage__cost-usd">
                      {formatCostUsd(line.costUsd)}
                    </span>
                    <span className="ai-lab-ocr-stage-usage__cost-toman">
                      {formatCostToman(line.costToman)}
                    </span>
                  </div>
                );
              })}

              <div className="ai-lab-ocr-stage-usage__cost-line ai-lab-ocr-stage-usage__cost-line--total" role="listitem">
                <span className="ai-lab-ocr-stage-usage__cost-label">مجموع</span>
                <span className="ai-lab-ocr-stage-usage__cost-formula" />
                <span dir="ltr" className="ai-lab-ocr-stage-usage__cost-usd">
                  {formatCostUsd(cost.totalCostUsd)}
                </span>
                <span className="ai-lab-ocr-stage-usage__cost-toman">
                  {formatCostToman(cost.totalCostToman)}
                </span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="ai-lab-ocr-stage-usage__placeholder">برای این مرحله مدلی ثبت نشده است.</div>
      )}
    </section>
  );
}

