export type EmployeeBankAccount = {
  id: string;
  bankName: string;
  cardNumber: string;
  sheba?: string;
  accountNumber?: string;
  isPrimary: boolean;
  createdAt: string;
};

export type EmployeeCheckGuarantee = {
  id: string;
  kind: 'check';
  bankName: string;
  accountHolderName: string;
  checkNumber: string;
  amount: string;
  createdAt: string;
};

export type EmployeePromissoryGuarantee = {
  id: string;
  kind: 'promissory';
  promissoryNumber: string;
  amount: string;
  createdAt: string;
};

export type EmployeeGuarantee = EmployeeCheckGuarantee | EmployeePromissoryGuarantee;

function createRecordId() {
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export function parseBankAccounts(value: unknown): EmployeeBankAccount[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    const record = asObject(item);
    if (!record) return [];

    const account: EmployeeBankAccount = {
      id: String(record.id ?? createRecordId()),
      bankName: String(record.bankName ?? ''),
      cardNumber: String(record.cardNumber ?? ''),
      sheba: record.sheba ? String(record.sheba) : undefined,
      accountNumber: record.accountNumber ? String(record.accountNumber) : undefined,
      isPrimary: Boolean(record.isPrimary),
      createdAt: String(record.createdAt ?? new Date().toISOString()),
    };

    return account.bankName || account.cardNumber ? [account] : [];
  });
}

export function parseGuarantees(value: unknown): EmployeeGuarantee[] {
  if (!Array.isArray(value)) return [];

  const items: EmployeeGuarantee[] = [];

  for (const item of value) {
    const record = asObject(item);
    if (!record) continue;

    const kind = record.kind === 'promissory' ? 'promissory' : 'check';
    const createdAt = String(record.createdAt ?? new Date().toISOString());

    if (kind === 'promissory') {
      const promissory: EmployeePromissoryGuarantee = {
        id: String(record.id ?? createRecordId()),
        kind: 'promissory',
        promissoryNumber: String(record.promissoryNumber ?? record.referenceNumber ?? ''),
        amount: String(record.amount ?? ''),
        createdAt,
      };
      if (promissory.promissoryNumber || promissory.amount) items.push(promissory);
      continue;
    }

    const check: EmployeeCheckGuarantee = {
      id: String(record.id ?? createRecordId()),
      kind: 'check',
      bankName: String(record.bankName ?? 'ملی'),
      accountHolderName: String(record.accountHolderName ?? ''),
      checkNumber: String(record.checkNumber ?? record.referenceNumber ?? ''),
      amount: String(record.amount ?? ''),
      createdAt,
    };
    if (check.checkNumber || check.amount) items.push(check);
  }

  return items;
}

export function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

export function formatAmount(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '-';
  return Number(digits).toLocaleString('fa-IR');
}
