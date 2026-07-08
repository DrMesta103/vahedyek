export function maskApiKey(apiKey: string) {
  const trimmed = apiKey.trim();
  if (!trimmed) return '••••••••';
  if (trimmed.length <= 8) return '••••••••';

  const prefixLength = trimmed.includes('-') ? trimmed.indexOf('-') + 1 : Math.min(3, trimmed.length - 4);
  const prefix = trimmed.slice(0, prefixLength);
  const suffix = trimmed.slice(-4);
  const hiddenLength = Math.max(8, trimmed.length - prefix.length - suffix.length);

  return `${prefix}${'•'.repeat(hiddenLength)}${suffix}`;
}
