import test from 'node:test';
import assert from 'node:assert/strict';
import { hasAnyOverlap } from '@/app/lib/ai-provider-v2-pricing-rules';
import { calculateUsageItemCostUsd } from '@/app/lib/ai-provider-v2-usage-cost';

test('hasAnyOverlap: detects overlap with open-ended period', () => {
  const periods = [{ effectiveFrom: new Date('2026-07-01T00:00:00Z'), effectiveTo: null }];
  assert.equal(hasAnyOverlap(periods, new Date('2026-07-10T00:00:00Z')), true);
  assert.equal(hasAnyOverlap(periods, new Date('2026-06-30T23:59:59Z')), false);
});

test('hasAnyOverlap: respects effectiveTo exclusive end', () => {
  const periods = [
    { effectiveFrom: new Date('2026-07-01T00:00:00Z'), effectiveTo: new Date('2026-07-02T00:00:00Z') },
  ];
  assert.equal(hasAnyOverlap(periods, new Date('2026-07-01T12:00:00Z')), true);
  assert.equal(hasAnyOverlap(periods, new Date('2026-07-02T00:00:00Z')), false);
});

test('calculateUsageItemCostUsd: calculates cost', () => {
  assert.equal(
    calculateUsageItemCostUsd({ usageQuantity: 12_000, appliedUnitQuantity: 1_000_000, appliedPriceUsd: 1 }),
    0.012,
  );
});

