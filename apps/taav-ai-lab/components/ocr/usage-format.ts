import type { OcrAiUsageCost, OcrStageUsage } from '@/components/ocr/utils';

export type OcrCostLine = {
  key: 'input' | 'output' | 'cacheRead' | 'cacheWrite';
  label: string;
  tokens: number;
  unitPriceUsd: number;
  costUsd: number;
  costToman: number;
};

export function buildCostLines(usage: OcrStageUsage, cost: OcrAiUsageCost): OcrCostLine[] {
  const lines: OcrCostLine[] = [];

  const inputTokens = Math.max(0, Math.floor(usage.inputTokens));
  const outputTokens = Math.max(0, Math.floor(usage.outputTokens));
  const cacheReadTokens = Math.max(0, Math.floor(usage.cachedInputTokens));
  const cacheWriteTokens = Math.max(0, Math.floor(usage.cacheWriteTokens));

  const inputUnit = Number.isFinite(usage.inputTokenPriceUsd) ? usage.inputTokenPriceUsd : 0;
  const outputUnit = Number.isFinite(usage.outputTokenPriceUsd) ? usage.outputTokenPriceUsd : 0;
  const cacheReadUnit = Number.isFinite(usage.cacheReadTokenPriceUsd) ? usage.cacheReadTokenPriceUsd : 0;
  const cacheWriteUnit = Number.isFinite(usage.cacheWriteTokenPriceUsd) ? usage.cacheWriteTokenPriceUsd : 0;

  if (inputTokens > 0 || cost.inputCostUsd > 0 || cost.inputCostToman > 0) {
    lines.push({
      key: 'input',
      label: 'ورودی',
      tokens: inputTokens,
      unitPriceUsd: inputUnit,
      costUsd: cost.inputCostUsd,
      costToman: cost.inputCostToman,
    });
  }

  if (outputTokens > 0 || cost.outputCostUsd > 0 || cost.outputCostToman > 0) {
    lines.push({
      key: 'output',
      label: 'خروجی',
      tokens: outputTokens,
      unitPriceUsd: outputUnit,
      costUsd: cost.outputCostUsd,
      costToman: cost.outputCostToman,
    });
  }

  if (cacheReadTokens > 0 || cost.cacheReadCostUsd > 0 || cost.cacheReadCostToman > 0) {
    lines.push({
      key: 'cacheRead',
      label: 'کش (خواندن)',
      tokens: cacheReadTokens,
      unitPriceUsd: cacheReadUnit,
      costUsd: cost.cacheReadCostUsd,
      costToman: cost.cacheReadCostToman,
    });
  }

  if (cacheWriteTokens > 0 || cost.cacheWriteCostUsd > 0 || cost.cacheWriteCostToman > 0) {
    lines.push({
      key: 'cacheWrite',
      label: 'کش (نوشتن)',
      tokens: cacheWriteTokens,
      unitPriceUsd: cacheWriteUnit,
      costUsd: cost.cacheWriteCostUsd,
      costToman: cost.cacheWriteCostToman,
    });
  }

  return lines;
}

