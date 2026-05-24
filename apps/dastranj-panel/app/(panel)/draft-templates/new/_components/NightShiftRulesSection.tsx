'use client';

import { Save, X } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

export type NightShiftRules = {
  insurance?: boolean;
  tax?: boolean;
  morningEveningPercent?: string;
  morningNightPercent?: string;
  morningEveningNightPercent?: string;
  eveningNightPercent?: string;
};

type NightShiftRulesSectionProps = {
  values?: NightShiftRules | null;
  onFocus: () => void;
  onDirty: () => void;
  stepDirty: boolean;
  stepSavedAt: number | null;
  stepSaving: boolean;
  onSave: () => void;
};

const percentFields = [
  {
    id: 'morningEveningPercent',
    title: 'درصد شیفت صبح و عصر',
    description: 'درصد فوق‌العاده نوبت‌کاری برای الگوی صبح و عصر.',
  },
  {
    id: 'morningNightPercent',
    title: 'درصد شیفت صبح و عصر و شب',
    description: 'درصد فوق‌العاده نوبت‌کاری برای الگوی صبح، عصر و شب.',
  },
  {
    id: 'morningEveningNightPercent',
    title: 'درصد شیفت صبح و شب',
    description: 'درصد فوق‌العاده نوبت‌کاری برای الگوی صبح و شب.',
  },
  {
    id: 'eveningNightPercent',
    title: 'درصد شیفت عصر و شب',
    description: 'درصد فوق‌العاده نوبت‌کاری برای الگوی عصر و شب.',
  },
] as const;

function normalizeDecimalInput(event: FormEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  const latin = input.value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[^\d.]/g, '');
  const [whole, ...rest] = latin.split('.');
  input.value = rest.length ? `${whole}.${rest.join('')}` : whole;
}

export function NightShiftRulesSection({
  values,
  onFocus,
  onDirty,
  stepDirty,
  stepSavedAt,
  stepSaving,
  onSave,
}: NightShiftRulesSectionProps) {
  const [insurance, setInsurance] = useState(values?.insurance ?? true);
  const [tax, setTax] = useState(values?.tax ?? false);

  useEffect(() => {
    setInsurance(values?.insurance ?? true);
    setTax(values?.tax ?? false);
  }, [values?.insurance, values?.tax]);

  return (
    <section
      id="nightShiftRules"
      className="draft-template-flow-section draft-template-flow-night-shift-section"
      onFocus={onFocus}
    >
      <header className="draft-template-flow-section-head">
        <div>
          <h2>فوق‌العاده نوبت کاری</h2>
          <p>درصدها، شیفت‌های نوبت‌کاری</p>
        </div>
      </header>

      <div className="draft-template-flow-night-shift-toggles">
        <label className={insurance ? 'is-active' : ''}>
          <input
            type="checkbox"
            name="nightShiftInsurance"
            checked={insurance}
            onChange={(event) => {
              setInsurance(event.currentTarget.checked);
              onDirty();
            }}
          />
          <span aria-hidden />
          مشمول بیمه
        </label>
        <label className={tax ? 'is-active' : ''}>
          <input
            type="checkbox"
            name="nightShiftTax"
            checked={tax}
            onChange={(event) => {
              setTax(event.currentTarget.checked);
              onDirty();
            }}
          />
          <span aria-hidden />
          مشمول مالیات
        </label>
      </div>

      <p className="draft-template-flow-night-shift-warning">
        هشدار: غیرفعال کردن بیمه یا مالیات در نوبت‌کاری می‌تواند منجر به مغایرت محاسبات شود.
      </p>

      <div className="draft-template-flow-night-shift-fields">
        {percentFields.map((field) => (
          <label key={field.id} className="draft-template-flow-night-shift-field">
            <span>{field.title}</span>
            <div>
              <input
                name={field.id}
                defaultValue={values?.[field.id] ?? ''}
                inputMode="decimal"
                placeholder="۰"
                onInput={(event) => {
                  normalizeDecimalInput(event);
                  onDirty();
                }}
              />
              <button
                type="button"
                aria-label="پاک کردن درصد"
                onClick={(event) => {
                  const input = event.currentTarget.previousElementSibling;
                  if (input instanceof HTMLInputElement) {
                    input.value = '';
                    onDirty();
                  }
                }}
              >
                <X className="h-4 w-4" strokeWidth={2.1} />
              </button>
            </div>
            <small>{field.description}</small>
          </label>
        ))}
      </div>

      <div className="draft-template-flow-section-footer">
        <button
          type="button"
          className={`draft-template-flow-section-save ${stepDirty ? 'is-dirty' : 'is-saved'}`}
          disabled={Boolean(!stepDirty && stepSavedAt) || stepSaving}
          onClick={onSave}
        >
          <Save className="h-4 w-4" strokeWidth={2.1} />
          {stepSaving ? 'در حال ذخیره...' : stepDirty ? 'ذخیره تغییرات' : stepSavedAt ? 'ذخیره شده' : 'ذخیره'}
        </button>
      </div>
    </section>
  );
}
