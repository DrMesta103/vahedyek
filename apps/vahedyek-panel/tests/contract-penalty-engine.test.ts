import test from 'node:test';
import assert from 'node:assert/strict';
import { buildContractPenaltyTimeline } from '../app/lib/contractPenaltyEngine';
import { buildReceiptAllocation } from '../app/lib/contractReceiptAllocation';
import type { ContractFinancialData, ContractPenaltiesData } from '../app/types/contract';

function buildFinancial(dueItems: ContractFinancialData['dueItems']): ContractFinancialData {
  return {
    pricingType: 'fixed',
    totalArea: '',
    pricePerMeter: '',
    fixedTotalAmount: '100000',
    activeTab: 'principal',
    categories: [
      { id: 'principal', name: 'مبلغ اصل قرارداد', capAmount: 100000, dueAmount: 100000, noDueAmount: 0, system: true, requiresDue: true },
      { id: 'installment', name: 'قسط', capAmount: 100000, dueAmount: 100000, noDueAmount: 0, system: true, requiresDue: true },
    ],
    dueItems,
  };
}

function buildForgivenessSnapshot(values: Record<string, string | boolean>) {
  return {
    active: true,
    activeTab: '',
    values,
  };
}

test('fixed penalty applies grace days, periods, and extra fee', () => {
  const financial = buildFinancial([
    { id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 1000, dueDate: '1405/01/01' },
  ]);
  const penalties: ContractPenaltiesData = {
    activeTab: '',
    types: [{ id: 'installment-delay', title: 'تاخیر اقساط', description: '', active: true }],
    rules: [
      {
        id: 'rule-fixed',
        penaltyTypeId: 'installment-delay',
        mode: 'fixed',
        period: 'daily',
        fixedAmount: '100',
        penaltyPercent: '',
        bankInterestPercent: '',
        graceDays: '1',
        roundRule: '0',
        extraFeeEnabled: true,
        extraFeeType: 'fixed',
        extraFeeAmount: '50',
        extraFeeRoundRule: '0',
        progressiveRows: [],
      },
    ],
  };

  const result = buildContractPenaltyTimeline({
    financial,
    penalties,
    asOfDate: new Date(2026, 2, 23),
  });

  assert.equal(result.penaltyRows.length, 1);
  assert.equal(result.penaltyRows[0]?.amount, 150);
});

test('contract percent penalty uses contract base total', () => {
  const financial = buildFinancial([
    { id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 1000, dueDate: '1405/01/01' },
  ]);
  const penalties: ContractPenaltiesData = {
    activeTab: '',
    types: [{ id: 'installment-delay', title: 'تاخیر اقساط', description: '', active: true }],
    rules: [
      {
        id: 'rule-contract',
        penaltyTypeId: 'installment-delay',
        mode: 'contract',
        period: 'monthly',
        fixedAmount: '',
        penaltyPercent: '1',
        bankInterestPercent: '',
        graceDays: '0',
        roundRule: '0',
        extraFeeEnabled: false,
        extraFeeType: 'fixed',
        extraFeeAmount: '',
        extraFeeRoundRule: '0',
        progressiveRows: [],
      },
    ],
  };

  const result = buildContractPenaltyTimeline({
    financial,
    penalties,
    asOfDate: new Date(2026, 2, 22),
  });

  assert.equal(result.penaltyRows[0]?.amount, 1000);
});

test('progressive penalty ignores dues without valid due date', () => {
  const financial = buildFinancial([
    { id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 2000, dueDate: '' },
    { id: 'due-2', categoryId: 'installment', title: 'قسط دوم', amount: 2000, dueDate: '1405/01/01' },
  ]);
  const penalties: ContractPenaltiesData = {
    activeTab: '',
    types: [{ id: 'installment-delay', title: 'تاخیر اقساط', description: '', active: true }],
    rules: [
      {
        id: 'rule-progressive',
        penaltyTypeId: 'installment-delay',
        mode: 'progressive',
        period: 'daily',
        fixedAmount: '',
        penaltyPercent: '',
        bankInterestPercent: '',
        graceDays: '0',
        roundRule: '0',
        extraFeeEnabled: false,
        extraFeeType: 'fixed',
        extraFeeAmount: '',
        extraFeeRoundRule: '0',
        progressiveRows: [
          { id: 'p1', fromDay: '1', toDay: '2', rate: '1' },
          { id: 'p2', fromDay: '3', toDay: '', rate: '2', openEnded: true },
        ],
      },
    ],
  };

  const result = buildContractPenaltyTimeline({
    financial,
    penalties,
    asOfDate: new Date(2026, 2, 24),
  });

  assert.equal(result.penaltyRows.length, 1);
  assert.equal(result.penaltyRows[0]?.principalDueRowId, 'due-2');
});

test('receipt allocation works on shared timeline of principal and penalty', () => {
  const financial = buildFinancial([
    { id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 1000, dueDate: '1405/01/01' },
  ]);
  const penalties: ContractPenaltiesData = {
    activeTab: '',
    types: [{ id: 'installment-delay', title: 'تاخیر اقساط', description: '', active: true }],
    rules: [
      {
        id: 'rule-fixed',
        penaltyTypeId: 'installment-delay',
        mode: 'fixed',
        period: 'daily',
        fixedAmount: '100',
        penaltyPercent: '',
        bankInterestPercent: '',
        graceDays: '0',
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
    asOfDate: new Date(2026, 2, 22),
  });
  const allocation = buildReceiptAllocation({
    buckets: timeline.combinedBuckets,
    receipts: [
      {
        id: 'receipt-1',
        allocationMode: 'auto',
        allocationDate: '1405/01/02',
        transferKind: 'cash',
        depositorName: 'خریدار',
        paidAmountRial: 1100,
        depositDate: '1405/01/02',
        depositTime: '',
        destinationValue: '',
        destinationHolder: '',
        destinationHolders: [],
        trackingNumber: '',
        referenceNumber: '',
        receiptNumber: '',
        notes: '',
        documents: [],
        createdAt: new Date().toISOString(),
      },
    ],
  });

  const penaltyRow = timeline.penaltyRows[0];
  assert.ok(penaltyRow);
  assert.equal(allocation.dueById['due-1']?.paidAmountRial, 1000);
  assert.equal(allocation.dueById[penaltyRow.id]?.paidAmountRial, 100);
});

test('forgiveness is applied after penalty calculation and reduces only the claimable amount', () => {
  const financial = buildFinancial([
    { id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 1000, dueDate: '1405/01/01' },
  ]);
  const penalties: ContractPenaltiesData = {
    activeTab: '',
    types: [{ id: 'installment-delay', title: 'تاخیر اقساط', description: '', active: true }],
    rules: [
      {
        id: 'rule-fixed',
        penaltyTypeId: 'installment-delay',
        mode: 'fixed',
        period: 'daily',
        fixedAmount: '100',
        penaltyPercent: '',
        bankInterestPercent: '',
        graceDays: '0',
        roundRule: '0',
        extraFeeEnabled: true,
        extraFeeType: 'fixed',
        extraFeeAmount: '50',
        extraFeeRoundRule: '0',
        progressiveRows: [],
      },
    ],
  };

  const timeline = buildContractPenaltyTimeline({
    financial,
    penalties,
    asOfDate: new Date(2026, 2, 22),
    forgiveness: buildForgivenessSnapshot({
      forgiveAllowed: true,
      forgiveScope: 'itemized',
      forgiveEnabledEntryIds: JSON.stringify(['installment-delay']),
      forgiveEntryValues: JSON.stringify({
        'installment-delay': {
          forgiveScope: 'itemized',
          forgiveValueMode: 'amount',
          forgiveMinValue: '0',
          forgiveMaxValue: '50',
          forgiveMaxDelayCount: '1',
          forgiveOutsideBuyerControl: false,
          forgiveManagerApproval: false,
        },
      }),
    }),
  });

  const penaltyRow = timeline.penaltyRows[0];
  assert.ok(penaltyRow);
  assert.equal(timeline.penaltyCalculation.totalPenaltyRial, 150);
  assert.equal(penaltyRow?.amount, 150);
  assert.equal(penaltyRow?.forgivenRial, 50);
  assert.equal(penaltyRow?.claimableAmountRial, 100);

  const allocation = buildReceiptAllocation({
    buckets: timeline.combinedBuckets,
    receipts: [
      {
        id: 'receipt-1',
        allocationMode: 'auto',
        allocationDate: '1405/01/02',
        transferKind: 'cash',
        depositorName: 'خریدار',
        paidAmountRial: 1100,
        depositDate: '1405/01/02',
        depositTime: '',
        destinationValue: '',
        destinationHolder: '',
        destinationHolders: [],
        trackingNumber: '',
        referenceNumber: '',
        receiptNumber: '',
        notes: '',
        documents: [],
        createdAt: new Date().toISOString(),
      },
    ],
  });

  assert.equal(allocation.dueById[penaltyRow.id]?.paidAmountRial, 100);
});

test('whole-contract forgiveness limits how many penalty rows are affected', () => {
  const financial = buildFinancial([
    { id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 1000, dueDate: '1405/01/01' },
    { id: 'due-2', categoryId: 'installment', title: 'قسط دوم', amount: 1000, dueDate: '1405/01/02' },
  ]);
  const penalties: ContractPenaltiesData = {
    activeTab: '',
    types: [{ id: 'installment-delay', title: 'تاخیر اقساط', description: '', active: true }],
    rules: [
      {
        id: 'rule-fixed',
        penaltyTypeId: 'installment-delay',
        mode: 'fixed',
        period: 'daily',
        fixedAmount: '100',
        penaltyPercent: '',
        bankInterestPercent: '',
        graceDays: '0',
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
    asOfDate: new Date(2030, 0, 1),
    forgiveness: buildForgivenessSnapshot({
      forgiveAllowed: true,
      forgiveScope: 'whole',
      forgiveValueMode: 'amount',
      forgiveMinValue: '0',
      forgiveMaxValue: '60',
      forgiveMaxDelayCount: '1',
      forgiveOutsideBuyerControl: false,
      forgiveManagerApproval: false,
    }),
  });

  assert.equal(timeline.penaltyRows.length, 2);
  assert.ok((timeline.penaltyRows[0]?.forgivenRial ?? 0) > 0);
  assert.equal(timeline.penaltyRows[1]?.forgivenRial ?? 0, 0);
  assert.ok((timeline.penaltyRows[0]?.claimableAmountRial ?? 0) > 0);
  assert.equal(timeline.penaltyRows[0]?.claimableAmountRial, (timeline.penaltyRows[0]?.amount ?? 0) - (timeline.penaltyRows[0]?.forgivenRial ?? 0));
  assert.equal(timeline.penaltyRows[1]?.claimableAmountRial, timeline.penaltyRows[1]?.amount);
});
