const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export type PersianDateParts = {
  year: number;
  month: number;
  day: number;
};

export function getPersianDateParts(date = new Date()): PersianDateParts {
  const parts = new Intl.DateTimeFormat('en-u-nu-latn', {
    calendar: 'persian',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
  };
}

export function parsePersianInteger(value: string) {
  const normalized = value.replace(/[۰-۹]/g, (char) => {
    const index = PERSIAN_DIGITS.indexOf(char);
    return index >= 0 ? String(index) : char;
  });

  return Number(normalized);
}
