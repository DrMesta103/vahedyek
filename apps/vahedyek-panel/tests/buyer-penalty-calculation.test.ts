import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyPenaltyRounding,
  calculateBuyerPenaltyForDue,
  calculateBuyerPenalties,
  computeChargeableDelayDays,
  computePeriodCount,
  computeProgressivePenaltyRaw,
  diffCalendarDays,
  resolvePenaltyTypeId,
} from '../app/lib/buyerPenaltyCalculation';
import { toComparableDateFromDueString } from '../app/lib/financialUtils';
import type { ContractPenaltiesData, PenaltyRuleData } from '../app/types/contract';

const CALC_DATE = toComparableDateFromDueString('1403/03/25')!;
const GRACE_DAYS = 2;

function makeRule(overrides: Partial<PenaltyRuleData> & { id: string; penaltyTypeId: string }): PenaltyRuleData {
  return {
    mode: 'fixed',
    period: 'daily',
    fixedAmount: '',
    penaltyPercent: '',
    bankInterestPercent: '',
    graceDays: String(GRACE_DAYS),
    roundRule: '0',
    extraFeeEnabled: false,
    extraFeeType: 'fixed',
    extraFeeAmount: '',
    extraFeeRoundRule: '0',
    progressiveRows: [],
    ...overrides,
  };
}

function penaltiesWithRules(rules: PenaltyRuleData[]): ContractPenaltiesData {
  const typeIds = [...new Set(rules.map((rule) => rule.penaltyTypeId))];
  return {
    activeTab: '',
    types: typeIds.map((id) => ({ id, title: id, description: '', active: true })),
    rules,
  };
}

function due(
  id: string,
  categoryId: string,
  amount: number,
  dueDate: string,
  paid = 0,
) {
  return {
    id,
    categoryId,
    title: id,
    dueDate,
    dueAmountRial: amount,
    paidAmountRial: paid,
  };
}

function calcOne(
  dueInput: ReturnType<typeof due>,
  rule: PenaltyRuleData,
  contractTotal = 100_000_000,
  paid = dueInput.paidAmountRial,
) {
  return calculateBuyerPenaltyForDue({
    due: { ...dueInput, paidAmountRial: paid },
    rule,
    penaltyTypeId: rule.penaltyTypeId,
    penaltyTypeTitle: rule.penaltyTypeId,
    totalMainContractAmountRial: contractTotal,
    calculationDate: CALC_DATE,
  });
}

test('delay and grace period helpers match scenario dates', () => {
  const prepayment1Due = toComparableDateFromDueString('1403/01/10')!;
  assert.equal(diffCalendarDays(prepayment1Due, CALC_DATE), 77);
  assert.equal(computeChargeableDelayDays(77, GRACE_DAYS), 75);

  const prepayment2Due = toComparableDateFromDueString('1403/02/10')!;
  assert.equal(diffCalendarDays(prepayment2Due, CALC_DATE), 46);
  assert.equal(computeChargeableDelayDays(46, GRACE_DAYS), 44);

  const installment1Due = toComparableDateFromDueString('1403/03/10')!;
  assert.equal(diffCalendarDays(installment1Due, CALC_DATE), 15);
  assert.equal(computeChargeableDelayDays(15, GRACE_DAYS), 13);

  const water1Due = toComparableDateFromDueString('1403/03/20')!;
  assert.equal(diffCalendarDays(water1Due, CALC_DATE), 5);
  assert.equal(computeChargeableDelayDays(5, GRACE_DAYS), 3);
});

test('test case 1: fixed daily penalty', () => {
  const rule = makeRule({
    id: 'r1',
    penaltyTypeId: 'advance-payment-delay',
    mode: 'fixed',
    period: 'daily',
    fixedAmount: '100000',
  });
  const result = calcOne(due('p1', 'advance', 25_000_000, '1403/01/10'), rule);
  assert.equal(result.mainPenaltyRoundedRial, 7_500_000);
});

test('test case 2: fixed monthly penalty', () => {
  const rule = makeRule({
    id: 'r2',
    penaltyTypeId: 'advance-payment-delay',
    mode: 'fixed',
    period: 'monthly',
    fixedAmount: '1000000',
  });
  const result = calcOne(due('p1', 'advance', 25_000_000, '1403/01/10'), rule);
  assert.equal(computePeriodCount(75, 'monthly'), 3);
  assert.equal(result.mainPenaltyRoundedRial, 3_000_000);
});

test('test case 3: fixed yearly penalty', () => {
  const rule = makeRule({
    id: 'r3',
    penaltyTypeId: 'advance-payment-delay',
    mode: 'fixed',
    period: 'yearly',
    fixedAmount: '10000000',
  });
  const result = calcOne(due('p1', 'advance', 25_000_000, '1403/01/10'), rule);
  assert.equal(computePeriodCount(74, 'yearly'), 1);
  assert.equal(result.mainPenaltyRoundedRial, 10_000_000);
});

test('test case 4: percentage of overdue remaining debt, daily', () => {
  const rule = makeRule({
    id: 'r4',
    penaltyTypeId: 'installment-delay',
    mode: 'overdue',
    period: 'daily',
    penaltyPercent: '0.5',
  });
  const result = calcOne(due('i1', 'installment', 10_000_000, '1403/03/10'), rule);
  assert.equal(result.mainPenaltyRoundedRial, 650_000);
});

test('test case 5: percentage of overdue remaining debt with partial payment', () => {
  const rule = makeRule({
    id: 'r5',
    penaltyTypeId: 'installment-delay',
    mode: 'overdue',
    period: 'daily',
    penaltyPercent: '0.5',
  });
  const result = calcOne(due('i1', 'installment', 10_000_000, '1403/03/10'), rule, 100_000_000, 4_000_000);
  assert.equal(result.overdueRemainingDebtRial, 6_000_000);
  assert.equal(result.mainPenaltyRoundedRial, 390_000);
});

test('test case 6: percentage of overdue remaining debt, monthly', () => {
  const rule = makeRule({
    id: 'r6',
    penaltyTypeId: 'installment-delay',
    mode: 'overdue',
    period: 'monthly',
    penaltyPercent: '2',
  });
  const result = calcOne(due('i1', 'installment', 10_000_000, '1403/03/10'), rule);
  assert.equal(result.mainPenaltyRoundedRial, 200_000);
});

test('test case 7: percentage of total contract, monthly', () => {
  const rule = makeRule({
    id: 'r7',
    penaltyTypeId: 'installment-delay',
    mode: 'contract',
    period: 'monthly',
    penaltyPercent: '0.5',
  });
  const result = calcOne(due('i1', 'installment', 10_000_000, '1403/03/10'), rule);
  assert.equal(result.mainPenaltyRoundedRial, 500_000);
});

test('test case 8: percentage of total contract, daily', () => {
  const rule = makeRule({
    id: 'r8',
    penaltyTypeId: 'installment-delay',
    mode: 'contract',
    period: 'daily',
    penaltyPercent: '0.05',
  });
  const result = calcOne(due('i1', 'installment', 10_000_000, '1403/03/10'), rule);
  assert.equal(result.mainPenaltyRoundedRial, 650_000);
});

test('test case 9: progressive penalty for prepayment', () => {
  const rule = makeRule({
    id: 'r9',
    penaltyTypeId: 'advance-payment-delay',
    mode: 'progressive',
    period: 'daily',
    progressiveRows: [
      { id: 'a', fromDay: '1', toDay: '10', rate: '0.2' },
      { id: 'b', fromDay: '11', toDay: '30', rate: '0.4' },
      { id: 'c', fromDay: '31', toDay: '', rate: '0.7', openEnded: true },
    ],
  });
  const result = calcOne(due('p1', 'advance', 25_000_000, '1403/01/10'), rule);
  assert.equal(result.mainPenaltyRoundedRial, 10_375_000);
});

test('test case 10: progressive penalty for installment', () => {
  const rule = makeRule({
    id: 'r10',
    penaltyTypeId: 'installment-delay',
    mode: 'progressive',
    period: 'daily',
    progressiveRows: [
      { id: 'a', fromDay: '1', toDay: '10', rate: '0.2' },
      { id: 'b', fromDay: '11', toDay: '30', rate: '0.4' },
      { id: 'c', fromDay: '31', toDay: '', rate: '0.7', openEnded: true },
    ],
  });
  const result = calcOne(due('i1', 'installment', 10_000_000, '1403/03/10'), rule);
  assert.equal(result.mainPenaltyRoundedRial, 320_000);
});

test('test case 11: miscellaneous cost penalty for custom financial row', () => {
  assert.equal(resolvePenaltyTypeId('fin-line-water:installment'), 'misc-cost-delay');
  const rule = makeRule({
    id: 'r11',
    penaltyTypeId: 'misc-cost-delay',
    mode: 'overdue',
    period: 'daily',
    penaltyPercent: '0.5',
  });
  const result = calcOne(due('w1', 'fin-line-water:installment', 5_000_000, '1403/03/20'), rule);
  assert.equal(result.mainPenaltyRoundedRial, 75_000);
});

test('test case 12: fixed daily miscellaneous penalty', () => {
  const rule = makeRule({
    id: 'r12',
    penaltyTypeId: 'misc-cost-delay',
    mode: 'fixed',
    period: 'daily',
    fixedAmount: '50000',
  });
  const result = calcOne(due('w1', 'fin-line-water:installment', 5_000_000, '1403/03/20'), rule);
  assert.equal(result.mainPenaltyRoundedRial, 150_000);
});

test('test case 13: fixed late fee', () => {
  const rule = makeRule({
    id: 'r13',
    penaltyTypeId: 'installment-delay',
    mode: 'overdue',
    period: 'daily',
    penaltyPercent: '0.5',
    extraFeeEnabled: true,
    extraFeeType: 'fixed',
    extraFeeAmount: '100000',
  });
  const result = calcOne(due('i1', 'installment', 10_000_000, '1403/03/10'), rule);
  assert.equal(result.mainPenaltyRoundedRial, 650_000);
  assert.equal(result.lateFeeRoundedRial, 100_000);
  assert.equal(result.totalPenaltyRial, 750_000);
  assert.equal(result.totalCollectibleRial, 10_750_000);
});

test('test case 14: percentage late fee on overdue remaining debt', () => {
  const rule = makeRule({
    id: 'r14',
    penaltyTypeId: 'installment-delay',
    mode: 'overdue',
    period: 'daily',
    penaltyPercent: '0.5',
    extraFeeEnabled: true,
    extraFeeType: 'percent',
    extraFeeAmount: '2',
  });
  const result = calcOne(due('i1', 'installment', 10_000_000, '1403/03/10'), rule);
  assert.equal(result.lateFeeRoundedRial, 200_000);
  assert.equal(result.totalPenaltyRial, 850_000);
  assert.equal(result.totalCollectibleRial, 10_850_000);
  assert.notEqual(result.lateFeeRoundedRial, Math.round(result.mainPenaltyRoundedRial * 0.02));
});

test('test case 15: percentage late fee with partial payment', () => {
  const rule = makeRule({
    id: 'r15',
    penaltyTypeId: 'installment-delay',
    mode: 'overdue',
    period: 'daily',
    penaltyPercent: '0.5',
    extraFeeEnabled: true,
    extraFeeType: 'percent',
    extraFeeAmount: '2',
  });
  const result = calcOne(due('i1', 'installment', 10_000_000, '1403/03/10'), rule, 100_000_000, 4_000_000);
  assert.equal(result.mainPenaltyRoundedRial, 390_000);
  assert.equal(result.lateFeeRoundedRial, 120_000);
  assert.equal(result.totalPenaltyRial, 510_000);
  assert.equal(result.totalCollectibleRial, 6_510_000);
});

test('test case 16: percentage late fee for custom financial row', () => {
  const rule = makeRule({
    id: 'r16',
    penaltyTypeId: 'misc-cost-delay',
    mode: 'overdue',
    period: 'daily',
    penaltyPercent: '0.5',
    extraFeeEnabled: true,
    extraFeeType: 'percent',
    extraFeeAmount: '2',
  });
  const result = calcOne(due('w1', 'fin-line-water:installment', 5_000_000, '1403/03/20'), rule);
  assert.equal(result.mainPenaltyRoundedRial, 75_000);
  assert.equal(result.lateFeeRoundedRial, 100_000);
  assert.equal(result.totalPenaltyRial, 175_000);
  assert.equal(result.totalCollectibleRial, 5_175_000);
});

test('test case 17: grace period greater than raw delay', () => {
  const rule = makeRule({ id: 'r17', penaltyTypeId: 'installment-delay', mode: 'overdue', period: 'daily', penaltyPercent: '1' });
  const dueDate = toComparableDateFromDueString('1403/03/24')!;
  const result = calculateBuyerPenaltyForDue({
    due: due('i1', 'installment', 10_000_000, '1403/03/24'),
    rule,
    penaltyTypeId: 'installment-delay',
    penaltyTypeTitle: 'installment-delay',
    totalMainContractAmountRial: 100_000_000,
    calculationDate: CALC_DATE,
  });
  assert.equal(diffCalendarDays(dueDate, CALC_DATE), 1);
  assert.equal(result.chargeableDelayDays, 0);
  assert.equal(result.totalPenaltyRial, 0);
});

test('test case 18: raw delay equals grace period', () => {
  const rule = makeRule({ id: 'r18', penaltyTypeId: 'installment-delay', mode: 'overdue', period: 'daily', penaltyPercent: '1' });
  const result = calcOne(due('i1', 'installment', 10_000_000, '1403/03/23'), rule);
  assert.equal(result.chargeableDelayDays, 0);
  assert.equal(result.totalPenaltyRial, 0);
});

test('test case 19: rounding main penalty amount', () => {
  const rule = makeRule({
    id: 'r19',
    penaltyTypeId: 'misc-cost-delay',
    mode: 'overdue',
    period: 'daily',
    penaltyPercent: '0.333',
    roundRule: '100',
  });
  const result = calcOne(due('w1', 'fin-line-water:installment', 5_000_000, '1403/03/20'), rule);
  assert.equal(applyPenaltyRounding(49_950, '100'), 50_000);
  assert.equal(result.mainPenaltyRoundedRial, 50_000);
});

test('test case 20: rounding late fee amount', () => {
  const rule = makeRule({
    id: 'r20',
    penaltyTypeId: 'installment-delay',
    mode: 'overdue',
    period: 'daily',
    penaltyPercent: '0',
    extraFeeEnabled: true,
    extraFeeType: 'percent',
    extraFeeAmount: '2',
    extraFeeRoundRule: '100',
  });
  const result = calcOne(due('i1', 'installment', 6_333_333, '1403/03/10'), rule);
  assert.equal(applyPenaltyRounding(126_666.66, '100'), 126_700);
  assert.equal(result.lateFeeRoundedRial, 126_700);
});

test('test case 21: multiple overdue dues without late fee', () => {
  const rule = makeRule({
    id: 'r21',
    penaltyTypeId: 'installment-delay',
    mode: 'overdue',
    period: 'daily',
    penaltyPercent: '0.5',
  });
  const advanceRule = { ...rule, id: 'r21a', penaltyTypeId: 'advance-payment-delay' };
  const miscRule = { ...rule, id: 'r21m', penaltyTypeId: 'misc-cost-delay' };
  const penalties = penaltiesWithRules([advanceRule, rule, miscRule]);
  const result = calculateBuyerPenalties({
    dues: [
      due('p1', 'advance', 25_000_000, '1403/01/10'),
      due('p2', 'advance', 25_000_000, '1403/02/10'),
      due('i1', 'installment', 10_000_000, '1403/03/10'),
      due('w1', 'fin-line-water:installment', 5_000_000, '1403/03/20'),
    ],
    penalties,
    totalMainContractAmountRial: 100_000_000,
    calculationDate: CALC_DATE,
  });
  assert.equal(result.byDueId.p1?.mainPenaltyRoundedRial, 9_375_000);
  assert.equal(result.byDueId.p2?.mainPenaltyRoundedRial, 5_500_000);
  assert.equal(result.byDueId.i1?.mainPenaltyRoundedRial, 650_000);
  assert.equal(result.byDueId.w1?.mainPenaltyRoundedRial, 75_000);
  assert.equal(result.totalMainPenaltyRial, 15_600_000);
});

test('test case 22: multiple overdue dues with percentage late fee', () => {
  const base = makeRule({
    id: 'r22',
    penaltyTypeId: 'installment-delay',
    mode: 'overdue',
    period: 'daily',
    penaltyPercent: '0.5',
    extraFeeEnabled: true,
    extraFeeType: 'percent',
    extraFeeAmount: '2',
  });
  const advanceRule = { ...base, id: 'r22a', penaltyTypeId: 'advance-payment-delay' };
  const miscRule = { ...base, id: 'r22m', penaltyTypeId: 'misc-cost-delay' };
  const penalties = penaltiesWithRules([advanceRule, base, miscRule]);
  const result = calculateBuyerPenalties({
    dues: [
      due('p1', 'advance', 25_000_000, '1403/01/10'),
      due('p2', 'advance', 25_000_000, '1403/02/10'),
      due('i1', 'installment', 10_000_000, '1403/03/10'),
      due('w1', 'fin-line-water:installment', 5_000_000, '1403/03/20'),
    ],
    penalties,
    totalMainContractAmountRial: 100_000_000,
    calculationDate: CALC_DATE,
  });
  assert.equal(result.byDueId.p1?.totalPenaltyRial, 9_875_000);
  assert.equal(result.byDueId.p2?.totalPenaltyRial, 6_000_000);
  assert.equal(result.byDueId.i1?.totalPenaltyRial, 850_000);
  assert.equal(result.byDueId.w1?.totalPenaltyRial, 175_000);
  assert.equal(result.totalMainPenaltyRial, 15_600_000);
  assert.equal(result.totalLateFeeRial, 1_300_000);
  assert.equal(result.totalPenaltyRial, 16_900_000);
});

test('progressive breakdown computes per-range amounts', () => {
  const progressive = computeProgressivePenaltyRaw({
    chargeableDelayDays: 13,
    baseAmountRial: 10_000_000,
    progressiveRows: [
      { fromDay: '1', toDay: '10', rate: '0.2' },
      { fromDay: '11', toDay: '30', rate: '0.4' },
    ],
  });
  assert.equal(progressive.total, 320_000);
  assert.equal(progressive.breakdown.length, 2);
});

test('scoped penalty type ids from persisted contracts resolve to active rules', () => {
  const scope = 'cmqg2tsft075ouxj8ydm4i92o';
  const penalties = penaltiesWithRules([
    makeRule({
      id: `${scope}:rule-advance`,
      penaltyTypeId: `${scope}:advance-payment-delay`,
      mode: 'fixed',
      period: 'daily',
      fixedAmount: '50000',
      extraFeeEnabled: true,
      extraFeeType: 'percent',
      extraFeeAmount: '1',
    }),
    makeRule({
      id: `${scope}:rule-installment`,
      penaltyTypeId: `${scope}:installment-delay`,
      mode: 'fixed',
      period: 'monthly',
      fixedAmount: '10000',
      extraFeeEnabled: true,
      extraFeeType: 'fixed',
      extraFeeAmount: '20000',
    }),
  ]);
  penalties.types = [
    { id: `${scope}:advance-payment-delay`, title: 'جریمه تاخیر در پیش‌پرداخت', description: '', active: true },
    { id: `${scope}:installment-delay`, title: 'جریمه تاخیر در پرداخت اقساط', description: '', active: true },
    { id: `${scope}:misc-cost-delay`, title: 'جریمه متفرقه', description: '', active: false },
  ];

  const result = calculateBuyerPenalties({
    dues: [
      due('adv-1', 'advance', 25_000_000, '1403/01/10'),
      due('ins-1', 'installment', 10_000_000, '1403/03/10'),
    ],
    penalties,
    totalMainContractAmountRial: 100_000_000,
    calculationDate: CALC_DATE,
  });

  assert.ok((result.byDueId['adv-1']?.totalPenaltyRial ?? 0) > 0);
  assert.ok((result.byDueId['ins-1']?.totalPenaltyRial ?? 0) > 0);
  assert.equal(result.byDueId['adv-1']?.zeroReason, null);
  assert.equal(result.byDueId['ins-1']?.zeroReason, null);
  assert.equal(result.byDueId['adv-1']?.penaltyTypeTitle, 'جریمه تاخیر در پیش‌پرداخت');
});

test('rule settings snapshot and calculation notes expose configured contract values', () => {
  const rule = makeRule({
    id: 'r-settings',
    penaltyTypeId: 'advance-payment-delay',
    mode: 'fixed',
    period: 'daily',
    fixedAmount: '50000',
    extraFeeEnabled: true,
    extraFeeType: 'percent',
    extraFeeAmount: '1',
    bankInterestPercent: '2',
  });
  const result = calcOne(due('p1', 'advance', 25_000_000, '1403/01/10'), rule);

  assert.ok(result.ruleSettings);
  assert.equal(result.ruleSettings?.fixedAmountRial, 50_000);
  assert.equal(result.ruleSettings?.period, 'daily');
  assert.equal(result.ruleSettings?.extraFeeEnabled, true);
  assert.equal(result.ruleSettings?.extraFeeType, 'percent');
  assert.equal(result.ruleSettings?.extraFeeAmount, 1);
  assert.equal(result.ruleSettings?.bankInterestPercent, 2);
  assert.match(result.ruleSettings?.summaryLine ?? '', /۵۰٬۰۰۰ ریال/);
  assert.ok(result.calculationNotes.some((note) => note.includes('جریمه اصلی')));
  assert.ok(result.calculationNotes.some((note) => note.includes('هزینه دیرکرد')));
  assert.equal(result.lateFeeConfiguredValue, 1);
  assert.equal(result.mainPenaltyCoreRawRial, 50_000 * result.periodCount);
});

test('zero penalty still includes configured rule settings', () => {
  const rule = makeRule({
    id: 'r-grace',
    penaltyTypeId: 'installment-delay',
    mode: 'fixed',
    period: 'daily',
    fixedAmount: '10000',
  });
  const result = calcOne(due('i1', 'installment', 10_000_000, '1403/03/20'), rule);

  assert.equal(result.totalPenaltyRial, 0);
  assert.ok(result.zeroReason);
  assert.equal(result.ruleSettings?.fixedAmountRial, 10_000);
  assert.equal(result.rawDelayDays, 5);
  assert.equal(result.chargeableDelayDays, 3);
});
