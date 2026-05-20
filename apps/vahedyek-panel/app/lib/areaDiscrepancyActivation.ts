import type { BuyerTerminationTerms } from '../types/contract';

export type AreaDiscrepancyActivationStatus =
  | 'disabled'
  | 'missing-area'
  | 'below-threshold'
  | 'scope-excluded'
  | 'termination-active'
  | 'financial-settlement-suggested';

export type AreaDiscrepancyActivationResult = {
  status: AreaDiscrepancyActivationStatus;
  differenceArea: number;
  differencePercent: number;
  direction: 'deficit' | 'surplus' | 'none';
};

function toPositiveNumber(value: string | number | null | undefined) {
  const parsed = typeof value === 'number' ? value : Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function getThresholdPercent(rule: BuyerTerminationTerms['areaDiscrepancy']) {
  const raw = rule.thresholdPreset === 'other' ? rule.thresholdPercentCustom : rule.thresholdPreset;
  return toPositiveNumber(raw);
}

export function evaluateAreaDiscrepancyActivation({
  rule,
  contractArea,
  finalArea,
}: {
  rule: BuyerTerminationTerms['areaDiscrepancy'] | null | undefined;
  contractArea: string | number | null | undefined;
  finalArea: string | number | null | undefined;
}): AreaDiscrepancyActivationResult {
  const empty: AreaDiscrepancyActivationResult = {
    status: 'disabled',
    differenceArea: 0,
    differencePercent: 0,
    direction: 'none',
  };

  if (!rule?.ruleEnabled) return empty;

  const baseArea = toPositiveNumber(contractArea);
  const measuredArea = toPositiveNumber(finalArea);
  const thresholdPercent = getThresholdPercent(rule);

  if (!baseArea || !measuredArea || !thresholdPercent) {
    return { ...empty, status: 'missing-area' };
  }

  const differenceArea = measuredArea - baseArea;
  const absoluteDifferenceArea = Math.abs(differenceArea);
  const differencePercent = (absoluteDifferenceArea / baseArea) * 100;
  const direction = differenceArea < 0 ? 'deficit' : differenceArea > 0 ? 'surplus' : 'none';

  if (differencePercent <= thresholdPercent || direction === 'none') {
    return { status: 'below-threshold', differenceArea, differencePercent, direction };
  }

  const scopes = Array.isArray(rule.discrepancyScopes) ? rule.discrepancyScopes : [];
  if (
    scopes.length === 0 ||
    (direction === 'deficit' && !scopes.includes('deficit-only')) ||
    (direction === 'surplus' && !scopes.includes('surplus-only'))
  ) {
    return { status: 'scope-excluded', differenceArea, differencePercent, direction };
  }

  return {
    status: rule.financialSettlementInsteadOfTermination ? 'financial-settlement-suggested' : 'termination-active',
    differenceArea,
    differencePercent,
    direction,
  };
}
