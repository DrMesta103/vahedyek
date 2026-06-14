import assert from 'node:assert/strict';
import test from 'node:test';
import { buildApprovedReceiptTrend, buildInstallmentStatusItems } from '../app/lib/contractFinancialChartUtils';
import type { RegisteredReceiptRecord } from '../app/lib/contractReceipts';

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

test('buildApprovedReceiptTrend includes only approved receipts and groups them by month', () => {
  const trend = buildApprovedReceiptTrend([
    buildReceipt({ id: 'approved-1', reviewStatus: 'approved', paidAmountRial: 200000, depositDate: '1404/01/10' }),
    buildReceipt({ id: 'approved-2', reviewStatus: 'approved', paidAmountRial: 300000, depositDate: '1404/01/25' }),
    buildReceipt({ id: 'pending-1', reviewStatus: 'pending', paidAmountRial: 500000, depositDate: '1404/01/26' }),
    buildReceipt({ id: 'rejected-1', reviewStatus: 'rejected', paidAmountRial: 600000, depositDate: '1404/01/27' }),
  ]);

  assert.equal(trend.approvedReceiptCount, 2);
  assert.equal(trend.points.length, 1);
  assert.equal(trend.points[0]?.amountRial, 500000);
});

test('buildApprovedReceiptTrend reports missing timeline data instead of making fake bars', () => {
  const trend = buildApprovedReceiptTrend([
    buildReceipt({ id: 'approved-1', reviewStatus: 'approved', paidAmountRial: 200000, depositDate: 'invalid-date', createdAt: 'not-a-date' }),
  ]);

  assert.equal(trend.approvedReceiptCount, 1);
  assert.equal(trend.points.length, 0);
  assert.equal(trend.missingTimelineCount, 1);
});

test('buildInstallmentStatusItems separates paid, future, overdue, and partial installments', () => {
  const items = buildInstallmentStatusItems([
    { paidRial: 100000, remainingRial: 0, dueDate: '1450/01/01' },
    { paidRial: 0, remainingRial: 100000, dueDate: '1450/02/01' },
    { paidRial: 0, remainingRial: 100000, dueDate: '1404/01/01' },
    { paidRial: 50000, remainingRial: 50000, dueDate: '1404/02/01' },
  ]);

  assert.equal(items.totalCount, 4);
  assert.equal(items.items.find((item) => item.key === 'paid')?.count, 1);
  assert.equal(items.items.find((item) => item.key === 'future')?.count, 1);
  assert.equal(items.items.find((item) => item.key === 'overdue')?.count, 1);
  assert.equal(items.items.find((item) => item.key === 'partial')?.count, 1);
});
