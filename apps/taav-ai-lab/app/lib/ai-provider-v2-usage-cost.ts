export function calculateUsageItemCostUsd(params: {
  usageQuantity: number;
  appliedUnitQuantity: number;
  appliedPriceUsd: number;
}) {
  if (!(Number.isFinite(params.usageQuantity) && params.usageQuantity > 0)) {
    throw new Error('UsageQuantity باید بزرگ‌تر از صفر باشد.');
  }
  if (!(Number.isFinite(params.appliedUnitQuantity) && params.appliedUnitQuantity > 0)) {
    throw new Error('AppliedUnitQuantity باید بزرگ‌تر از صفر باشد.');
  }
  if (!(Number.isFinite(params.appliedPriceUsd) && params.appliedPriceUsd >= 0)) {
    throw new Error('AppliedPriceUsd معتبر نیست.');
  }

  return (params.usageQuantity / params.appliedUnitQuantity) * params.appliedPriceUsd;
}

