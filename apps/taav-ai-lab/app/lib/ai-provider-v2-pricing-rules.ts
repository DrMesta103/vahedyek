export type PricingPeriod = {
  effectiveFrom: Date;
  effectiveTo: Date | null;
  isDeleted?: boolean;
};

export function overlapsAt(period: PricingPeriod, at: Date) {
  if (period.isDeleted) return false;
  if (at < period.effectiveFrom) return false;
  if (period.effectiveTo && at >= period.effectiveTo) return false;
  return true;
}

export function hasAnyOverlap(periods: PricingPeriod[], at: Date) {
  return periods.some((p) => overlapsAt(p, at));
}

