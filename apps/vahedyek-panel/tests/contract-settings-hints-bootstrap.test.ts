import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveInstallmentHintReference,
  resolvePrepaymentHintReference,
  resolveDomainRuleHint,
} from '../app/lib/contractSettingsHints';
import {
  buildBootstrapDiscountsPayload,
  buildBootstrapFinancialPayload,
  buildBootstrapPenaltiesPayload,
} from '../app/lib/contractSettingsBootstrap';
import { RULE_CONFIGS, createInitialRuleState, normalizeRuleState } from '../app/lib/businessContractRules';

test('prepayment hint compares fixed amount against current', () => {
  const prepayment = normalizeRuleState('prepayment', {
    active: true,
    activeTab: 'fixed',
    values: { preFixedAmount: '1000000' },
  });
  const equal = resolvePrepaymentHintReference(prepayment, 0, 1_000_000);
  assert.equal(equal.status, 'equal');
  const different = resolvePrepaymentHintReference(prepayment, 0, 500_000);
  assert.equal(different.status, 'different');
});

test('installment hint exposes mode and balloon breakdown', () => {
  const installments = normalizeRuleState('installments', {
    active: true,
    activeTab: 'regular',
    values: {
      regularInterval: 'ماهانه',
      regularBalloonEnabled: true,
      regularBalloonWindow: 'ماه آخر',
      regularBalloonPercent: '20',
    },
  });
  const hint = resolveInstallmentHintReference(installments, true, 3);
  assert.equal(hint.status, 'equal');
  assert.ok(hint.breakdownLines.some((line) => line.label.includes('بالونی')));
});

test('domain discount hint reports missing settings', () => {
  const missing = resolveDomainRuleHint(RULE_CONFIGS.discount, null, createInitialRuleState('discount'));
  assert.equal(missing.status, 'missing');
});

test('bootstrap financial seeds fixed prepayment amount only', () => {
  const seeded = buildBootstrapFinancialPayload(
    normalizeRuleState('prepayment', {
      active: true,
      activeTab: 'fixed',
      values: { preFixedAmount: '2500000' },
    }),
  );
  assert.ok(seeded);
  const advance = seeded?.categories.find((item) => item.id === 'advance');
  assert.equal(advance?.capAmount, 2_500_000);

  const percentOnly = buildBootstrapFinancialPayload(
    normalizeRuleState('prepayment', {
      active: true,
      activeTab: 'percent',
      values: { prePercent: '10' },
    }),
  );
  assert.equal(percentOnly, null);
});

test('bootstrap discounts and penalties map active settings', () => {
  const discounts = buildBootstrapDiscountsPayload(
    normalizeRuleState('discount', {
      active: true,
      activeTab: 'on-contract',
      activeChip: 'contract-base',
      values: {
        discountContractValue: '100000',
        discountValueMode: 'amount',
        discountScope: 'whole',
      },
    }),
  );
  assert.ok(discounts);
  assert.equal(discounts?.types.find((item) => item.id === 'contract-base')?.active, true);
  assert.equal(discounts?.rules.length, 1);

  const penalties = buildBootstrapPenaltiesPayload(
    normalizeRuleState('penalty', {
      active: true,
      activeTab: 'fixed',
      values: {
        penaltyFixedAmount: '50000',
        penaltyFixedPeriod: 'ماهانه',
        penaltyFixedGraceDays: '2',
      },
    }),
  );
  assert.ok(penalties);
  assert.equal(penalties?.rules[0]?.mode, 'fixed');
  assert.equal(penalties?.types.find((item) => item.id === 'installment-delay')?.active, true);
});
