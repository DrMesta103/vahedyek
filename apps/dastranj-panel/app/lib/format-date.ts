import { formatPersianJalaliDate } from './format-fa';

export function formatPersianDate(value: Date | string) {
  return formatPersianJalaliDate(value);
}
