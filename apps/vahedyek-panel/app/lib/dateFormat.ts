export type CalendarSystem = 'jalali' | 'gregorian';

function isParsableDate(input: unknown): input is string | number | Date {
  return typeof input === 'string' || typeof input === 'number' || input instanceof Date;
}

function safeDate(input: string | number | Date): Date | null {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function formatPartsToYmd(parts: Intl.DateTimeFormatPart[]) {
  const year = parts.find((p) => p.type === 'year')?.value ?? '';
  const month = parts.find((p) => p.type === 'month')?.value ?? '';
  const day = parts.find((p) => p.type === 'day')?.value ?? '';
  return `${year}/${month}/${day}`.replace(/\/{2,}/g, '/');
}

function formatPartsToHm(parts: Intl.DateTimeFormatPart[]) {
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '';
  return `${hour}:${minute}`.replace(/:{2,}/g, ':');
}

export function formatDateFa(input: unknown, opts?: { system?: CalendarSystem; withTime?: boolean }) {
  if (!input) return '—';
  if (!isParsableDate(input)) return '—';

  // If user already stored Jalali as a string, keep it.
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return '—';
    if (/^\d{4}\/\d{1,2}\/\d{1,2}/.test(trimmed)) return trimmed;
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      // Treat yyyy-mm-dd as a date-only input, avoid timezone shifting.
      const [y, m, d] = trimmed.split('-').map((part) => Number(part));
      const local = new Date(y, (m || 1) - 1, d || 1);
      const dateParts = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(local);
      return formatPartsToYmd(dateParts);
    }
  }

  const date = safeDate(input);
  if (!date) return '—';

  const system = opts?.system ?? 'jalali';
  const locale = system === 'jalali' ? 'fa-IR-u-ca-persian' : 'fa-IR';

  const dateParts = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  if (!opts?.withTime) return formatPartsToYmd(dateParts);

  const timeParts = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  return `${formatPartsToYmd(dateParts)} ${formatPartsToHm(timeParts)}`.trim();
}

