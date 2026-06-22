export function normalizeDigits(input: string): string {
  return input.replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (char) => {
    const code = char.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

export function parsePropNumericValue(value: number | string | undefined, decimal: boolean): number | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;

  const normalized = normalizeDigits(String(value)).replace(decimal ? /[^\d.]/g : /\D/g, '');
  if (!normalized) return null;

  const parsed = decimal ? Number.parseFloat(normalized) : Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatIntegerInput(raw: string): { display: string; numeric: number | null } {
  const digits = normalizeDigits(raw).replace(/\D/g, '');
  if (!digits) return { display: '', numeric: null };

  const numeric = Number.parseInt(digits, 10);
  return {
    display: numeric.toLocaleString('en-US'),
    numeric,
  };
}

export function formatDecimalInput(raw: string): { display: string; numeric: number | null } {
  const normalized = normalizeDigits(raw).replace(/[٫,]/g, '.');
  const cleaned = normalized.replace(/[^\d.]/g, '');
  if (!cleaned) return { display: '', numeric: null };

  const [integerPart = '', ...fractionParts] = cleaned.split('.');
  const fractionPart = fractionParts.join('');
  const hasFraction = fractionParts.length > 0;
  const display = hasFraction ? `${integerPart}.${fractionPart}` : integerPart;
  const numeric = Number.parseFloat(display);

  if (!Number.isFinite(numeric)) {
    return { display: hasFraction ? `${integerPart}.` : integerPart, numeric: null };
  }

  return { display, numeric };
}

export function formatNumericDisplay(value: number | null, decimal: boolean): string {
  if (value === null) return '';
  if (decimal) return String(value);
  return value.toLocaleString('en-US');
}

export function isOutOfRange(value: number | null, min?: number, max?: number): boolean {
  if (value === null) return false;
  if (min !== undefined && value < min) return true;
  if (max !== undefined && value > max) return true;
  return false;
}

export function clampNumericValue(value: number | null, min?: number, max?: number): number | null {
  if (value === null) return null;

  let result = value;
  if (min !== undefined && result < min) result = min;
  if (max !== undefined && result > max) result = max;
  return result;
}
