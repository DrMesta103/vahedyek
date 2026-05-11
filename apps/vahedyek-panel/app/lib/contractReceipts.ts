export type ReceiptTransferKind = 'cash' | 'cheque' | 'remittance' | 'account_transfer' | 'card_to_card';

export type ReceiptAllocationMode = 'direct' | 'auto';

export type ReceiptDocumentFile = {
  id: string;
  name: string;
  size: number;
  mimeType: string | null;
  dataUrl: string | null;
};

export type ReceiptDocument = {
  id: string;
  category: string;
  title: string;
  date: string;
  description: string;
  files: ReceiptDocumentFile[];
};

export type RegisteredReceiptRecord = {
  id: string;
  contractId?: string;
  allocationMode: ReceiptAllocationMode;
  allocationDate: string;
  dueRowId?: string;
  dueTitle?: string;
  dueDate?: string;
  dueAmount?: number;
  transferKind: ReceiptTransferKind;
  depositorName: string;
  paidAmountRial: number;
  depositDate: string;
  depositTime: string;
  destinationValue: string;
  destinationHolder: string;
  destinationHolders: string[];
  trackingNumber: string;
  referenceNumber: string;
  receiptNumber: string;
  notes: string;
  documents: ReceiptDocument[];
  createdAt: string;
};

export function getReceiptsStorageKey(contractId: string) {
  return `vahedyek.contract-receipts.${contractId}`;
}

export function normalizeReceiptRecord(raw: unknown): RegisteredReceiptRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Partial<RegisteredReceiptRecord>;
  const id = String(item.id ?? '').trim();
  if (!id) return null;

  const legacyDueDate = String(item.dueDate ?? '').trim();
  const depositDate = String(item.depositDate ?? '').trim();
  const allocationMode = item.allocationMode === 'auto' ? 'auto' : 'direct';
  const allocationDate = String(item.allocationDate ?? (legacyDueDate || depositDate)).trim();

  return {
    id,
    contractId: item.contractId ? String(item.contractId) : undefined,
    allocationMode,
    allocationDate,
    dueRowId: item.dueRowId ? String(item.dueRowId) : undefined,
    dueTitle: item.dueTitle ? String(item.dueTitle) : undefined,
    dueDate: legacyDueDate || undefined,
    dueAmount: Number(item.dueAmount) || 0,
    transferKind: item.transferKind ?? 'card_to_card',
    depositorName: String(item.depositorName ?? ''),
    paidAmountRial: Number(item.paidAmountRial) || 0,
    depositDate,
    depositTime: String(item.depositTime ?? ''),
    destinationValue: String(item.destinationValue ?? ''),
    destinationHolder: String(item.destinationHolder ?? ''),
    destinationHolders: Array.isArray(item.destinationHolders) ? item.destinationHolders.map(String) : [],
    trackingNumber: String(item.trackingNumber ?? ''),
    referenceNumber: String(item.referenceNumber ?? ''),
    receiptNumber: String(item.receiptNumber ?? ''),
    notes: String(item.notes ?? ''),
    documents: Array.isArray(item.documents) ? item.documents : [],
    createdAt: String(item.createdAt ?? new Date().toISOString()),
  };
}

export function normalizeReceiptRecords(raw: unknown): RegisteredReceiptRecord[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeReceiptRecord).filter((item): item is RegisteredReceiptRecord => item !== null);
}
