'use client';

import { AlertTriangle, Check } from 'lucide-react';
import type { BaseDifference } from '../../lib/payroll-business-settings';

export function ContractFinancialDifferenceBadge({
  difference,
  softenLowerTone = false,
  variant = 'template',
}: {
  difference?: BaseDifference | null;
  /** When true, values below template use neutral (blue) styling — e.g. obligatory minutes. */
  softenLowerTone?: boolean;
  variant?: 'template' | 'tenant_base';
}) {
  if (!difference) return null;

  const toneClass =
    difference.direction === 'lower'
      ? softenLowerTone
        ? ' is-higher'
        : ' is-lower'
      : difference.direction === 'higher'
        ? ' is-higher'
        : ' is-changed';

  const variantClass = variant === 'tenant_base' ? ' contract-financial-difference-badge--tenant-base' : '';

  return (
    <span className={`contract-financial-difference-badge${toneClass}${variantClass}`} title={difference.tooltip}>
      {difference.direction === 'lower' && !softenLowerTone ? (
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden />
      ) : (
        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
      )}
      <span>{difference.message}</span>
    </span>
  );
}
