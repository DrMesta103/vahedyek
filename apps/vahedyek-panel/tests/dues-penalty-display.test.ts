import test from 'node:test';
import assert from 'node:assert/strict';
import { buildContractPenaltyTimeline } from '../app/lib/contractPenaltyEngine';
import type { ContractFinancialData, ContractPenaltiesData } from '../app/types/contract';

test('penalty details are exposed per principal due for dues UI', () => {
  const financial: ContractFinancialData = {
    pricingType: 'fixed',
    totalArea: '',
    pricePerMeter: '',
    fixedTotalAmount: '10000000',
    activeTab: 'principal',
    categories: [
      { id: 'installment', name: 'اقساط', capAmount: 10000000, dueAmount: 10000000, noDueAmount: 0, system: true, requiresDue: true },
    ],
    dueItems: [{ id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 10000000, dueDate: '1403/03/10' }],
  };
  const penalties: ContractPenaltiesData = {
    activeTab: '',
    types: [{ id: 'installment-delay', title: 'تاخیر اقساط', description: '', active: true }],
    rules: [
      {
        id: 'rule-1',
        penaltyTypeId: 'installment-delay',
        mode: 'overdue',
        period: 'daily',
        fixedAmount: '',
        penaltyPercent: '0.5',
        bankInterestPercent: '',
        graceDays: '2',
        roundRule: '0',
        extraFeeEnabled: false,
        extraFeeType: 'fixed',
        extraFeeAmount: '',
        extraFeeRoundRule: '0',
        progressiveRows: [],
      },
    ],
  };

  const timeline = buildContractPenaltyTimeline({
    financial,
    penalties,
    asOfDate: new Date(2024, 5, 14),
  });

  const detail = timeline.penaltyDetailsByPrincipalDueId['due-1'];
  assert.ok(detail);
  assert.equal(detail.totalPenaltyRial, 650_000);
  assert.equal(timeline.penaltyCalculation.totalPenaltyRial, 650_000);
  assert.equal(timeline.penaltyRows[0]?.amount, 650_000);
});
