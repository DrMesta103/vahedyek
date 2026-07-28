'use client';

import { Scale } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { BaseDifference } from '../../lib/payroll-business-settings';
import { MinutesEquivalentHint } from '../MinutesEquivalentHint';
import { ContractFinancialDifferenceBadge } from './ContractFinancialDifferenceBadge';
import type { ContractFinancialDerivedItem } from '../../lib/contract-financial-calculations';

function normalizeNumericInput(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/,/g, '')
    .replace(/[^\d.]/g, '');
}

type ContractFinancialBasisCardProps = {
  title: string;
  description: string;
  fieldLabel: string;
  unit: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  footnote?: string;
  derivedItems: ContractFinancialDerivedItem[];
  templateDifference?: BaseDifference | null;
  tenantBaseDifference?: BaseDifference | null;
  workDaysNote?: string;
  tone?: 'minutes' | 'salary';
};

export function ContractFinancialBasisCard({
  title,
  description,
  fieldLabel,
  unit,
  value,
  onChange,
  error,
  footnote,
  derivedItems,
  templateDifference,
  tenantBaseDifference,
  workDaysNote,
  tone = 'minutes',
}: ContractFinancialBasisCardProps) {
  const [draftValue, setDraftValue] = useState(Number.isFinite(value) ? String(value) : '');

  useEffect(() => {
    setDraftValue(Number.isFinite(value) ? String(value) : '');
  }, [value]);

  return (
    <section className={`contract-financial-basis-card contract-financial-basis-card--${tone}`}>
      <div className="contract-financial-basis-card-head">
        <div className="contract-financial-basis-card-copy">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span className="contract-draft-reg-badge contract-draft-reg-badge--legal">
          <Scale className="h-3.5 w-3.5" aria-hidden />
          آیین‌نامه حقوقی
        </span>
      </div>

      <div className="contract-financial-basis-input-row">
        <label className={`contract-financial-basis-field${error ? ' has-error' : ''}`}>
          <span className="contract-financial-basis-field-label">{fieldLabel}</span>
          <span className="contract-financial-basis-input">
            <input
              type="text"
              inputMode="numeric"
              value={draftValue}
              onChange={(event) => {
                const nextRaw = normalizeNumericInput(event.target.value);
                setDraftValue(event.target.value.replace(/[^\d۰-۹٠-٩,]/g, ''));
                onChange(nextRaw ? Number(nextRaw) : Number.NaN);
              }}
            />
            <b>{unit}</b>
          </span>
          {unit === 'دقیقه' ? <MinutesEquivalentHint minutes={Number.isFinite(value) ? value : null} /> : null}
        </label>
        <span className="contract-financial-difference-badges">
          <ContractFinancialDifferenceBadge difference={templateDifference} softenLowerTone={tone === 'minutes'} />
          <ContractFinancialDifferenceBadge
            difference={tenantBaseDifference}
            softenLowerTone={tone === 'minutes'}
            variant="tenant_base"
          />
        </span>
      </div>

      {error ? <em className="contract-timing-field-error">{error}</em> : null}

      <div className="contract-financial-derived-grid">
        {derivedItems.map((item) => (
          <div key={item.label} className="contract-financial-derived-item">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      {workDaysNote ? <p className="contract-financial-workdays-note">{workDaysNote}</p> : null}
    </section>
  );
}
