export type AuthIdentifier =
  | { type: 'email'; value: string }
  | { type: 'mobile'; value: string }
  | { type: 'unknown'; value: string };

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function sanitizeIranMobileInput(value: string) {
  let digits = value.replace(/\D/g, '');

  if (digits.startsWith('0098')) {
    digits = digits.slice(4);
  } else if (digits.startsWith('98')) {
    digits = digits.slice(2);
  }

  while (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  return digits.slice(0, 10);
}

export function isValidIranMobile(value: string) {
  return /^9\d{9}$/.test(sanitizeIranMobileInput(value));
}

export function parseAuthIdentifier(value: string): AuthIdentifier {
  const trimmed = value.trim();
  if (!trimmed) {
    return { type: 'unknown', value: '' };
  }

  if (trimmed.includes('@')) {
    return { type: 'email', value: normalizeEmail(trimmed) };
  }

  const mobile = sanitizeIranMobileInput(trimmed);
  if (isValidIranMobile(mobile)) {
    return { type: 'mobile', value: mobile };
  }

  return { type: 'unknown', value: trimmed };
}

export function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

export function formatIdentityLabel(email?: string | null, mobile?: string | null) {
  if (email) return email;
  if (mobile) return `+98 ${mobile}`;
  return '';
}
