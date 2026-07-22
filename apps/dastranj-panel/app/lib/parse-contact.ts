import { isValidIranMobile, sanitizeIranMobileInput } from './contact';

export function parseContactInput(value: string): {
  isValid: boolean;
  type?: 'phone' | 'email';
  normalizedValue?: string;
  error?: string;
} {
  const trimmed = value.trim();
  if (!trimmed) return { isValid: false };

  if (trimmed.includes('@')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
      ? { isValid: true, type: 'email', normalizedValue: trimmed }
      : { isValid: false, error: 'ایمیل معتبر نیست.' };
  }

  return isValidIranMobile(trimmed)
    ? { isValid: true, type: 'phone', normalizedValue: sanitizeIranMobileInput(trimmed) }
    : { isValid: false, error: 'شماره موبایل معتبر نیست.' };
}

export function isNationalIdValid(value: string) {
  return /^\d{10}$/.test(value.trim());
}
