import assert from 'node:assert/strict';
import test from 'node:test';
import { buildBuyerFinancialSummary } from '../app/lib/contractBuyerFinancialSummary';
import { buildReceiptAllocation } from '../app/lib/contractReceiptAllocation';
import type { RegisteredReceiptRecord } from '../app/lib/contractReceipts';

type DueItem = { id: string; categoryId: string; title: string; amount: number; dueDate: string };

function buildContract(overrides: {
  dueItems?: DueItem[];
  penalties?: any;
  deliveryDate?: string;
  terminationRules?: any;
  financial?: any;
} = {}) {
  const financial =
    overrides.financial === undefined
      ? {
          pricingType: 'fixed',
          totalArea: '',
          pricePerMeter: '',
          fixedTotalAmount: '1000000',
          activeTab: 'principal',
          categories: [
            {
              id: 'principal',
              name: 'مبلغ اصل قرارداد',
              capAmount: 1000000,
              dueAmount: 1000000,
              noDueAmount: 0,
              system: true,
              requiresDue: true,
            },
            {
              id: 'installment',
              name: 'قسط',
              capAmount: 1000000,
              dueAmount: 1000000,
              noDueAmount: 0,
              system: true,
              requiresDue: true,
            },
          ],
          dueItems:
            overrides.dueItems ?? [
              { id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 1000000, dueDate: '1405/04/01' },
            ],
        }
      : overrides.financial;

  return {
    data: {
      subject: {
        contractNumber: 'CTR-1405-001',
        contractDate: '1405/01/01',
        contractType: 'sale',
        blockName: 'A',
        floorName: '3',
        unitName: '12',
        deliveryDate: overrides.deliveryDate ?? '1405/06/01',
      },
      financial,
      penalties: overrides.penalties ?? null,
      terminationRules: overrides.terminationRules ?? null,
    },
  };
}

function buildReceipt(
  overrides: Partial<RegisteredReceiptRecord> & { reviewStatus?: RegisteredReceiptRecord['reviewStatus'] } = {},
): RegisteredReceiptRecord {
  return {
    id: overrides.id ?? 'receipt-1',
    allocationMode: overrides.allocationMode ?? 'direct',
    allocationDate: overrides.allocationDate ?? '1405/04/02',
    transferKind: overrides.transferKind ?? 'cash',
    depositorName: overrides.depositorName ?? 'خریدار',
    paidAmountRial: overrides.paidAmountRial ?? 0,
    depositDate: overrides.depositDate ?? '1405/04/02',
    depositTime: overrides.depositTime ?? '',
    destinationValue: overrides.destinationValue ?? '',
    destinationHolder: overrides.destinationHolder ?? '',
    destinationHolders: overrides.destinationHolders ?? [],
    trackingNumber: overrides.trackingNumber ?? '',
    referenceNumber: overrides.referenceNumber ?? '',
    receiptNumber: overrides.receiptNumber ?? '1',
    notes: overrides.notes ?? '',
    documents: overrides.documents ?? [],
    createdAt: overrides.createdAt ?? '2026-06-11T00:00:00.000Z',
    reviewStatus: overrides.reviewStatus,
    reviewedBy: overrides.reviewedBy,
    rejectionReason: overrides.rejectionReason,
  };
}

function buildPenaltyRules() {
  return {
    activeTab: '',
    types: [{ id: 'installment-delay', title: 'تاخیر اقساط', description: '', active: true }],
    rules: [
      {
        id: 'rule-fixed',
        penaltyTypeId: 'installment-delay',
        mode: 'fixed',
        period: 'daily',
        fixedAmount: '1000',
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
}

function chartCount(summary: ReturnType<typeof buildBuyerFinancialSummary>, key: 'paid' | 'future' | 'overdue' | 'partial') {
  return summary.charts.installmentStatus.items.find((item) => item.key === key)?.count ?? 0;
}

test('contracts without financial data return empty chart models instead of fake numbers', () => {
  const summary = buildBuyerFinancialSummary(buildContract({ financial: null }), []);

  assert.equal(summary.hasFinancialData, false);
  assert.equal(summary.charts.paymentBreakdown.confirmedPaidRial, 0);
  assert.equal(summary.charts.paymentTrend.points.length, 0);
  assert.equal(summary.charts.installmentStatus.totalCount, 0);
  assert.equal(summary.charts.penalties.totalCount, 0);
});

test('contract without payment keeps debt in remaining bucket and shows future installment only', () => {
  const contract = buildContract({
    dueItems: [{ id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 1000000, dueDate: '1450/01/01' }],
  });

  const summary = buildBuyerFinancialSummary(contract, []);

  assert.equal(summary.confirmedPaidRial, 0);
  assert.equal(summary.charts.paymentBreakdown.confirmedPaidRial, 0);
  assert.equal(summary.charts.paymentBreakdown.remainingDebtRial, 1000000);
  assert.equal(summary.charts.paymentTrend.approvedReceiptCount, 0);
  assert.equal(chartCount(summary, 'future'), 1);
  assert.equal(chartCount(summary, 'overdue'), 0);
});

test('payment full and on-time settles the contract and marks the chart as settled', () => {
  const contract = buildContract({
    dueItems: [{ id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 1000000, dueDate: '1450/01/01' }],
  });

  const summary = buildBuyerFinancialSummary(contract, [
    buildReceipt({ reviewStatus: 'approved', paidAmountRial: 1000000 }),
  ]);

  assert.equal(summary.confirmedPaidRial, 1000000);
  assert.equal(summary.remainingDebtRial, 0);
  assert.equal(summary.settlementStatus?.label, 'تسویه کامل');
  assert.equal(summary.readinessStatus?.label, 'آماده است');
  assert.equal(summary.charts.paymentBreakdown.settled, true);
  assert.equal(chartCount(summary, 'paid'), 1);
});

test('pending receipt stays separate from confirmed payment in chart totals', () => {
  const summary = buildBuyerFinancialSummary(buildContract(), [
    buildReceipt({ reviewStatus: 'pending', paidAmountRial: 1000000 }),
  ]);

  assert.equal(summary.confirmedPaidRial, 0);
  assert.equal(summary.pendingReviewRial, 1000000);
  assert.equal(summary.charts.paymentBreakdown.confirmedPaidRial, 0);
  assert.equal(summary.charts.paymentBreakdown.pendingReviewRial, 1000000);
  assert.equal(summary.charts.paymentTrend.approvedReceiptCount, 0);
});

test('rejected receipt is excluded from payment breakdown and payment trend', () => {
  const contract = buildContract({
    dueItems: [{ id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 1000000, dueDate: '1450/01/01' }],
  });

  const summary = buildBuyerFinancialSummary(contract, [
    buildReceipt({ reviewStatus: 'rejected', paidAmountRial: 1000000, reviewedBy: 'کارشناس مالی', rejectionReason: 'مغایرت مبلغ' }),
  ]);

  assert.equal(summary.confirmedPaidRial, 0);
  assert.equal(summary.pendingReviewRial, 0);
  assert.equal(summary.charts.paymentBreakdown.confirmedPaidRial, 0);
  assert.equal(summary.charts.paymentTrend.approvedReceiptCount, 0);
  assert.equal(summary.charts.paymentTrend.points.length, 0);
});

test('partial payment does not mark installment as fully paid and keeps chart totals aligned', () => {
  const contract = buildContract({
    dueItems: [{ id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 1000000, dueDate: '1404/01/01' }],
  });

  const summary = buildBuyerFinancialSummary(contract, [
    buildReceipt({ reviewStatus: 'approved', paidAmountRial: 400000 }),
  ]);

  assert.equal(summary.confirmedPaidRial, 400000);
  assert.equal(summary.remainingDebtRial, 600000);
  assert.equal(summary.charts.paymentBreakdown.confirmedPaidRial, 400000);
  assert.equal(summary.charts.paymentBreakdown.remainingDebtRial, 600000);
  assert.equal(chartCount(summary, 'partial'), 1);
  assert.equal(chartCount(summary, 'paid'), 0);
});

test('future and overdue installments are separated in chart status buckets', () => {
  const contract = buildContract({
    dueItems: [
      { id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 500000, dueDate: '1404/01/01' },
      { id: 'due-2', categoryId: 'installment', title: 'قسط دوم', amount: 500000, dueDate: '1450/02/01' },
    ],
  });

  const summary = buildBuyerFinancialSummary(contract, []);

  assert.equal(summary.charts.installmentStatus.totalCount, 2);
  assert.equal(chartCount(summary, 'overdue'), 1);
  assert.equal(chartCount(summary, 'future'), 1);
});

test('payment trend uses approved receipts only and stays aligned with installment chart totals', () => {
  const contract = buildContract({
    dueItems: [
      { id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 500000, dueDate: '1404/01/01' },
      { id: 'due-2', categoryId: 'installment', title: 'قسط دوم', amount: 500000, dueDate: '1450/02/01' },
    ],
  });

  const summary = buildBuyerFinancialSummary(contract, [
    buildReceipt({ id: 'approved-1', reviewStatus: 'approved', paidAmountRial: 300000, depositDate: '1404/01/10' }),
    buildReceipt({ id: 'pending-1', reviewStatus: 'pending', paidAmountRial: 250000, depositDate: '1404/01/11' }),
    buildReceipt({ id: 'rejected-1', reviewStatus: 'rejected', paidAmountRial: 100000, depositDate: '1404/01/12' }),
  ]);

  assert.equal(summary.charts.paymentTrend.approvedReceiptCount, 1);
  assert.equal(summary.charts.paymentTrend.points.length, 1);
  assert.equal(summary.charts.paymentTrend.points[0]?.amountRial, 300000);
  assert.equal(summary.charts.installmentStatus.totalCount, 2);
  assert.equal(chartCount(summary, 'partial'), 1);
  assert.equal(
    summary.charts.installmentStatus.items.reduce((sum, item) => sum + item.count, 0),
    summary.charts.installmentStatus.totalCount,
  );
});

test('approved receipt without usable timeline stays out of trend bars and becomes a chart gap instead of fake data', () => {
  const summary = buildBuyerFinancialSummary(buildContract(), [
    buildReceipt({ reviewStatus: 'approved', paidAmountRial: 1000000, depositDate: 'invalid-date', createdAt: 'not-a-date' }),
  ]);

  assert.equal(summary.charts.paymentTrend.approvedReceiptCount, 1);
  assert.equal(summary.charts.paymentTrend.points.length, 0);
  assert.equal(summary.charts.paymentTrend.missingTimelineCount, 1);
});

test('overpayment is separated into due allocation and wallet credit', () => {
  const contract = buildContract();
  const receipt = buildReceipt({ reviewStatus: 'approved', paidAmountRial: 1200000 });

  const summary = buildBuyerFinancialSummary(contract, [receipt]);
  const allocation = buildReceiptAllocation({
    buckets: [
      {
        key: '1405-04',
        sortKey: 140504,
        jalaliYear: 1405,
        jalaliMonth: 4,
        heading: 'تیر ۱۴۰۵',
        totalRial: 1000000,
        overdueRial: 0,
        penaltyRial: 0,
        items: [
          {
            id: 'due-1',
            categoryId: 'installment',
            categoryTitle: 'قسط',
            title: 'قسط اول',
            amount: 1000000,
            dueDate: '1450/01/01',
            isOverdueUnpaid: false,
          },
        ],
      },
    ],
    receipts: [receipt],
  });

  assert.equal(summary.confirmedPaidRial, 1000000);
  assert.equal(summary.remainingDebtRial, 0);
  assert.equal(summary.settlementStatus?.label, 'تسویه کامل');
  assert.equal(allocation.walletCreditRial, 200000);
});

test('applied penalty stays separate from principal debt and forgiveness is not fabricated', () => {
  const contract = buildContract({
    dueItems: [{ id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 1000000, dueDate: '1404/01/01' }],
    penalties: buildPenaltyRules(),
  });

  const summary = buildBuyerFinancialSummary(contract, []);

  assert.ok((summary.openPenaltyRial ?? 0) > 0);
  assert.ok(summary.charts.penalties.appliedRial > 0);
  assert.equal(summary.charts.penalties.paidRial, 0);
  assert.equal(summary.charts.penalties.forgivenRial, null);
  assert.notEqual(summary.settlementStatus?.label, 'تسویه کامل');
});

test('termination-enabled contract with debt stays out of ready state without leaking extra internal detail', () => {
  const contract = buildContract({
    terminationRules: { enabled: true },
    dueItems: [{ id: 'due-1', categoryId: 'installment', title: 'قسط اول', amount: 1000000, dueDate: '1404/01/01' }],
  });

  const summary = buildBuyerFinancialSummary(contract, []);

  assert.equal(summary.readinessStatus?.label, 'نیازمند بررسی حقوقی');
  assert.equal(summary.charts.paymentBreakdown.remainingDebtRial, 1000000);
});
