export type ProgressivePenaltyRow = {
  id: string;
  fromDay: string;
  toDay: string;
  rate: string;
  openEnded?: boolean;
};

export function sanitizePositiveIntegerInput(value: string) {
  return value.replace(/\D/g, '');
}

export function sanitizeDecimalInput(value: string) {
  const normalized = value.replace(/[^\d.]/g, '');
  const [head, ...tail] = normalized.split('.');
  return tail.length ? `${head}.${tail.join('')}` : head;
}

export function isPositiveDecimal(value: string) {
  const normalized = String(value ?? '').trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) return false;
  return Number(normalized) > 0;
}

export function normalizeProgressiveRows<T extends ProgressivePenaltyRow>(rows: T[]): T[] {
  let nextFrom = 1;
  let closed = false;

  return rows.map((row, index) => {
    const openEnded = Boolean(row.openEnded) && !closed;
    const normalized: T = {
      ...row,
      fromDay: String(nextFrom),
      toDay: openEnded ? '' : sanitizePositiveIntegerInput(String(row.toDay ?? '')),
      rate: sanitizeDecimalInput(String(row.rate ?? '')),
      openEnded,
    };

    if (openEnded) {
      closed = true;
      return normalized;
    }

    const to = Number(normalized.toDay);
    if (Number.isFinite(to) && to >= nextFrom) {
      nextFrom = to + 1;
    } else if (index === 0) {
      nextFrom = 1;
    }

    return normalized;
  });
}

export function canAddProgressiveRow(rows: ProgressivePenaltyRow[]) {
  return rows.length === 0 || !rows[rows.length - 1]?.openEnded;
}

export function getNextProgressiveFromDay(rows: ProgressivePenaltyRow[]) {
  const normalized = normalizeProgressiveRows(rows);
  const last = normalized[normalized.length - 1];
  if (!last) return '1';
  if (last.openEnded) return '';
  const to = Number(last.toDay);
  return Number.isFinite(to) && to > 0 ? String(to + 1) : String(Number(last.fromDay || 1));
}

export function validateProgressiveRows(rows: ProgressivePenaltyRow[]) {
  const normalized = normalizeProgressiveRows(rows).filter((row) => row.rate || row.toDay || row.openEnded);

  if (normalized.length === 0) {
    return { ok: false as const, message: 'حداقل یک بازه تصاعدی کامل ثبت کنید.' };
  }

  for (let index = 0; index < normalized.length; index += 1) {
    const row = normalized[index]!;
    const from = Number(row.fromDay);
    const expectedFrom = index === 0 ? 1 : Number(normalized[index - 1]!.toDay) + 1;

    if (from !== expectedFrom) {
      return { ok: false as const, message: `شروع بازه ${index + 1} باید ${expectedFrom} باشد.` };
    }

    if (!isPositiveDecimal(row.rate)) {
      return { ok: false as const, message: `نرخ جریمه بازه ${index + 1} معتبر نیست.` };
    }

    if (row.openEnded) {
      if (index !== normalized.length - 1) {
        return { ok: false as const, message: 'ردیف «به بعد» باید آخرین بازه باشد.' };
      }
      return { ok: true as const, rows: normalized };
    }

    const to = Number(row.toDay);
    if (!Number.isInteger(to) || to < from) {
      return { ok: false as const, message: `پایان بازه ${index + 1} باید بزرگ‌تر یا مساوی شروع همان بازه باشد.` };
    }
  }

  return { ok: true as const, rows: normalized };
}
