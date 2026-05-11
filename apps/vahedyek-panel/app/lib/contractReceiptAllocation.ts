import type { PaymentHistoryDueRow, PaymentHistoryMonthBucket } from './contractPaymentMonthBuckets';
import type { RegisteredReceiptRecord } from './contractReceipts';
import { toComparableDateFromDueString } from './financialUtils';

export type ReceiptDueAllocation = {
  receiptId: string;
  dueRowId: string;
  amountRial: number;
  receipt: RegisteredReceiptRecord;
  due: PaymentHistoryDueRow;
};

export type DueReceiptAllocationSummary = {
  row: PaymentHistoryDueRow;
  dueAmountRial: number;
  paidAmountRial: number;
  remainingAmountRial: number;
  status: 'unpaid' | 'partial' | 'paid';
  allocations: ReceiptDueAllocation[];
  receipts: RegisteredReceiptRecord[];
};

export type ReceiptAllocationSummary = {
  receipt: RegisteredReceiptRecord;
  allocatedAmountRial: number;
  walletAmountRial: number;
  allocations: ReceiptDueAllocation[];
};

export type WalletLedgerEntry = {
  id: string;
  receiptId: string;
  contractId?: string;
  amountRial: number;
  reason: 'overpayment';
  createdAt: string;
};

export type ContractReceiptAllocationResult = {
  dueSummaries: DueReceiptAllocationSummary[];
  dueById: Record<string, DueReceiptAllocationSummary>;
  receiptsByDueId: Record<string, RegisteredReceiptRecord[]>;
  receiptSummaries: ReceiptAllocationSummary[];
  receiptById: Record<string, ReceiptAllocationSummary>;
  walletLedger: WalletLedgerEntry[];
  walletCreditRial: number;
  totalPaidRial: number;
  totalAllocatedRial: number;
  totalRemainingRial: number;
};

function comparableTime(value: string) {
  return toComparableDateFromDueString(value)?.getTime() ?? Number.POSITIVE_INFINITY;
}

function sortDues(rows: PaymentHistoryDueRow[]) {
  return [...rows].sort((a, b) => {
    const byDate = comparableTime(a.dueDate) - comparableTime(b.dueDate);
    if (byDate !== 0) return byDate;
    return String(a.id).localeCompare(String(b.id));
  });
}

function sortReceipts(receipts: RegisteredReceiptRecord[]) {
  return [...receipts].sort((a, b) => {
    const byDate = comparableTime(a.allocationDate || a.depositDate || a.dueDate || '') - comparableTime(b.allocationDate || b.depositDate || b.dueDate || '');
    if (byDate !== 0) return byDate;
    const byCreated = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (Number.isFinite(byCreated) && byCreated !== 0) return byCreated;
    return String(a.id).localeCompare(String(b.id));
  });
}

function firstDirectDueIndex(rows: PaymentHistoryDueRow[], allocationDate: string, remainingByDueId: Map<string, number>) {
  const allocationTime = comparableTime(allocationDate);
  const byDateIndex = rows.findIndex((row) => comparableTime(row.dueDate) >= allocationTime && (remainingByDueId.get(row.id) ?? 0) > 0);
  if (byDateIndex >= 0) return byDateIndex;
  return rows.findIndex((row) => (remainingByDueId.get(row.id) ?? 0) > 0);
}

export function buildReceiptAllocation(params: {
  buckets: PaymentHistoryMonthBucket[];
  receipts: RegisteredReceiptRecord[];
}): ContractReceiptAllocationResult {
  const dues = sortDues(params.buckets.flatMap((bucket) => bucket.items));
  const receipts = sortReceipts(params.receipts);
  const remainingByDueId = new Map(dues.map((row) => [row.id, Math.max(0, Number(row.amount) || 0)]));
  const allocationsByDueId = new Map<string, ReceiptDueAllocation[]>();
  const allocationsByReceiptId = new Map<string, ReceiptDueAllocation[]>();
  const walletLedger: WalletLedgerEntry[] = [];

  for (const receipt of receipts) {
    let remainingReceiptAmount = Math.max(0, Number(receipt.paidAmountRial) || 0);
    if (remainingReceiptAmount <= 0) continue;

    const startIndex =
      receipt.allocationMode === 'auto'
        ? dues.findIndex((row) => (remainingByDueId.get(row.id) ?? 0) > 0)
        : firstDirectDueIndex(dues, receipt.allocationDate || receipt.depositDate || receipt.dueDate || '', remainingByDueId);

    if (startIndex >= 0) {
      for (let index = startIndex; index < dues.length && remainingReceiptAmount > 0; index += 1) {
        const due = dues[index];
        const dueRemaining = remainingByDueId.get(due.id) ?? 0;
        if (dueRemaining <= 0) continue;
        const amountRial = Math.min(dueRemaining, remainingReceiptAmount);
        if (amountRial <= 0) continue;
        const allocation: ReceiptDueAllocation = {
          receiptId: receipt.id,
          dueRowId: due.id,
          amountRial,
          receipt,
          due,
        };
        remainingByDueId.set(due.id, dueRemaining - amountRial);
        remainingReceiptAmount -= amountRial;
        allocationsByDueId.set(due.id, [...(allocationsByDueId.get(due.id) ?? []), allocation]);
        allocationsByReceiptId.set(receipt.id, [...(allocationsByReceiptId.get(receipt.id) ?? []), allocation]);
      }
    }

    if (remainingReceiptAmount > 0) {
      walletLedger.push({
        id: `wallet-${receipt.id}`,
        receiptId: receipt.id,
        contractId: receipt.contractId,
        amountRial: remainingReceiptAmount,
        reason: 'overpayment',
        createdAt: receipt.createdAt,
      });
    }
  }

  const dueSummaries = dues.map((row) => {
    const dueAmountRial = Math.max(0, Number(row.amount) || 0);
    const remainingAmountRial = remainingByDueId.get(row.id) ?? dueAmountRial;
    const paidAmountRial = Math.max(0, dueAmountRial - remainingAmountRial);
    const allocations = allocationsByDueId.get(row.id) ?? [];
    const receiptMap = new Map(allocations.map((allocation) => [allocation.receipt.id, allocation.receipt]));
    return {
      row,
      dueAmountRial,
      paidAmountRial,
      remainingAmountRial,
      status: paidAmountRial <= 0 ? 'unpaid' : remainingAmountRial <= 0 ? 'paid' : 'partial',
      allocations,
      receipts: [...receiptMap.values()],
    } satisfies DueReceiptAllocationSummary;
  });

  const receiptSummaries = receipts.map((receipt) => {
    const allocations = allocationsByReceiptId.get(receipt.id) ?? [];
    const allocatedAmountRial = allocations.reduce((sum, allocation) => sum + allocation.amountRial, 0);
    return {
      receipt,
      allocatedAmountRial,
      walletAmountRial: Math.max(0, (Number(receipt.paidAmountRial) || 0) - allocatedAmountRial),
      allocations,
    } satisfies ReceiptAllocationSummary;
  });

  const dueById = Object.fromEntries(dueSummaries.map((summary) => [summary.row.id, summary]));
  const receiptById = Object.fromEntries(receiptSummaries.map((summary) => [summary.receipt.id, summary]));
  const receiptsByDueId = Object.fromEntries(dueSummaries.map((summary) => [summary.row.id, summary.receipts]));
  const totalPaidRial = receipts.reduce((sum, receipt) => sum + (Number(receipt.paidAmountRial) || 0), 0);
  const totalAllocatedRial = receiptSummaries.reduce((sum, summary) => sum + summary.allocatedAmountRial, 0);
  const totalRemainingRial = dueSummaries.reduce((sum, summary) => sum + summary.remainingAmountRial, 0);
  const walletCreditRial = walletLedger.reduce((sum, entry) => sum + entry.amountRial, 0);

  return {
    dueSummaries,
    dueById,
    receiptsByDueId,
    receiptSummaries,
    receiptById,
    walletLedger,
    walletCreditRial,
    totalPaidRial,
    totalAllocatedRial,
    totalRemainingRial,
  };
}
