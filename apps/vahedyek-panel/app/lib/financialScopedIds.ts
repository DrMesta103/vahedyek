/** دسته‌ها و سررسیدها در DB با پیشوند `${financialId}:` یکتا شده‌اند. */

export function buildFinancialScopedId(financialId: string, logicalId: string) {
  return `${financialId}:${logicalId}`;
}

export function unwrapFinancialScopedId(financialId: string, rawId: string) {
  const prefix = `${financialId}:`;
  return typeof rawId === 'string' && rawId.startsWith(prefix) ? rawId.slice(prefix.length) : rawId;
}
