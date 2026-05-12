import assert from 'node:assert/strict';
import test from 'node:test';
import { buildReceiptAllocation } from '../app/lib/contractReceiptAllocation';
import type { PaymentHistoryMonthBucket } from '../app/lib/contractPaymentMonthBuckets';
import type { RegisteredReceiptRecord } from '../app/lib/contractReceipts';

function bucket(rows: Array<{ id: string; amount: number; dueDate: string }>): PaymentHistoryMonthBucket[] {
  return [
    {
      key: '1405-01',
      sortKey: 140501,
      jalaliYear: 1405,
      jalaliMonth: 1,
      heading: 'فروردین ۱۴۰۵',
      totalRial: rows.reduce((sum, row) => sum + row.amount, 0),
      overdueRial: 0,
      penaltyRial: 0,
      items: rows.map((row) => ({
        id: row.id,
        categoryId: 'principal',
        categoryTitle: 'اصل',
        title: row.id,
        amount: row.amount,
        dueDate: row.dueDate,
        isOverdueUnpaid: false,
      })),
    },
  ];
}

function receipt(overrides: Partial<RegisteredReceiptRecord>): RegisteredReceiptRecord {
  return {
    id: overrides.id ?? 'receipt-1',
    allocationMode: overrides.allocationMode ?? 'direct',
    allocationDate: overrides.allocationDate ?? '1405/01/01',
    transferKind: 'cash',
    depositorName: 'payer',
    paidAmountRial: overrides.paidAmountRial ?? 0,
    depositDate: overrides.depositDate ?? overrides.allocationDate ?? '1405/01/01',
    depositTime: '',
    destinationValue: '',
    destinationHolder: '',
    destinationHolders: [],
    trackingNumber: '',
    referenceNumber: '',
    receiptNumber: '1',
    notes: '',
    documents: [],
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

test('direct full payment marks due paid', () => {
  const result = buildReceiptAllocation({
    buckets: bucket([{ id: 'due-1', amount: 50, dueDate: '1405/01/01' }]),
    receipts: [receipt({ paidAmountRial: 50, allocationDate: '1405/01/01' })],
  });
  assert.equal(result.dueById['due-1'].status, 'paid');
  assert.equal(result.walletCreditRial, 0);
});

test('direct partial payment leaves remaining debt', () => {
  const result = buildReceiptAllocation({
    buckets: bucket([{ id: 'due-1', amount: 50, dueDate: '1405/01/01' }]),
    receipts: [receipt({ paidAmountRial: 40, allocationDate: '1405/01/01' })],
  });
  assert.equal(result.dueById['due-1'].paidAmountRial, 40);
  assert.equal(result.dueById['due-1'].remainingAmountRial, 10);
});

test('direct overpayment spills into next due', () => {
  const result = buildReceiptAllocation({
    buckets: bucket([
      { id: 'due-1', amount: 50, dueDate: '1405/01/01' },
      { id: 'due-2', amount: 60, dueDate: '1405/02/01' },
    ]),
    receipts: [receipt({ paidAmountRial: 60, allocationDate: '1405/01/01' })],
  });
  assert.equal(result.dueById['due-1'].status, 'paid');
  assert.equal(result.dueById['due-2'].paidAmountRial, 10);
});

test('direct overpayment on last due creates wallet credit', () => {
  const result = buildReceiptAllocation({
    buckets: bucket([{ id: 'due-1', amount: 50, dueDate: '1405/01/01' }]),
    receipts: [receipt({ paidAmountRial: 60, allocationDate: '1405/01/01' })],
  });
  assert.equal(result.dueById['due-1'].status, 'paid');
  assert.equal(result.walletCreditRial, 10);
});

test('automatic payment starts from oldest debt', () => {
  const result = buildReceiptAllocation({
    buckets: bucket([
      { id: 'due-1', amount: 50, dueDate: '1405/01/01' },
      { id: 'due-2', amount: 60, dueDate: '1405/02/01' },
    ]),
    receipts: [receipt({ allocationMode: 'auto', paidAmountRial: 70, allocationDate: '1405/03/01' })],
  });
  assert.equal(result.dueById['due-1'].status, 'paid');
  assert.equal(result.dueById['due-2'].paidAmountRial, 20);
  assert.equal(result.dueById['due-2'].remainingAmountRial, 40);
});

test('payment without remaining dues goes to wallet', () => {
  const result = buildReceiptAllocation({
    buckets: bucket([]),
    receipts: [receipt({ allocationMode: 'auto', paidAmountRial: 70, allocationDate: '1405/03/01' })],
  });
  assert.equal(result.totalAllocatedRial, 0);
  assert.equal(result.walletCreditRial, 70);
});
