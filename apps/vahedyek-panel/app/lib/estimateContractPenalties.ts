/**
 * جمع ناخالص جریمه از روی تنظیمات ذخیره‌شدهٔ مرحلهٔ جریمه (فعال؛ غیرفعال‌ها رد می‌شوند).
 */
export function estimateContractPenaltiesTotalRial(contractTotal: number, penalties: unknown): number {
  const p = penalties as { rules?: unknown[]; types?: unknown[] } | null | undefined;
  if (!(contractTotal > 0) || !Array.isArray(p?.rules) || p.rules.length === 0) return 0;

  const activeTypes = new Set(
    (Array.isArray(p.types) ? p.types : [])
      .filter((t: unknown) => Boolean((t as { active?: boolean })?.active))
      .map((t: unknown) => String((t as { id?: string })?.id ?? '')),
  );

  let sum = 0;
  for (const raw of p.rules!) {
    if (!raw || typeof raw !== 'object') continue;
    const rule = raw as {
      penaltyTypeId?: unknown;
      penaltyPercent?: unknown;
      fixedAmount?: unknown;
      bankInterestPercent?: unknown;
    };

    const typeId = String(rule.penaltyTypeId ?? '');
    if (activeTypes.size && typeId && !activeTypes.has(typeId)) continue;

    const pct = Number(rule.penaltyPercent ?? 0);
    const fixed = Number(String(rule.fixedAmount ?? '').replace(/,/g, '') || 0);
    const bankPct = Number(rule.bankInterestPercent ?? 0);

    if (pct > 0) sum += Math.round((contractTotal * pct) / 100);
    if (bankPct > 0) sum += Math.round((contractTotal * bankPct) / 100);
    if (fixed > 0) sum += fixed;
  }

  return Math.max(0, sum);
}
