'use client';

import { Save, X } from 'lucide-react';
import type { FormEvent } from 'react';

export type TimeCoefficientItem = {
  value?: string;
  insurance?: boolean;
  tax?: boolean;
};

type TimeCoefficientsSectionProps = {
  values?: Record<string, TimeCoefficientItem | undefined>;
  onFocus: () => void;
  onDirty: () => void;
  stepDirty: boolean;
  stepSavedAt: number | null;
  stepSaving: boolean;
  onSave: () => void;
};

const timeCoefficientItems = [
  {
    id: 'overtimeCoefficient',
    title: 'ضریب اضافه کاری',
    description: 'ضریب محاسبه اضافه‌کاری نسبت به مزد ساعتی عادی',
  },
  {
    id: 'nightWorkCoefficient',
    title: 'ضریب شب کاری',
    description: 'ضریب پرداخت ساعات شب‌کاری',
  },
  {
    id: 'holidayWorkCoefficient',
    title: 'ضریب تعطیل کاری',
    description: 'ضریب پرداخت کار در روز تعطیل رسمی',
  },
  {
    id: 'fridayWorkCoefficient',
    title: 'ضریب جمعه کاری',
    description: 'جمعه‌کاری در حالت همراه با اضافه‌کاری',
  },
  {
    id: 'fridayWorkNoOvertimeCoefficient',
    title: 'ضریب جمعه کاری بدون اضافه کاری',
    description: 'جمعه‌کاری بدون اعمال ضریب اضافه‌کاری',
  },
];

function normalizeDecimalInput(event: FormEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  const latin = input.value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[^\d.]/g, '');
  const [whole, ...rest] = latin.split('.');
  input.value = rest.length ? `${whole}.${rest.join('')}` : whole;
}

export function TimeCoefficientsSection({
  values,
  onFocus,
  onDirty,
  stepDirty,
  stepSavedAt,
  stepSaving,
  onSave,
}: TimeCoefficientsSectionProps) {
  return (
    <section
      id="timeCoefficients"
      className="draft-template-flow-section draft-template-flow-time-coefficients-section"
      onFocus={onFocus}
    >
      <header className="draft-template-flow-section-head">
        <div>
          <h2>فوق‌العاده ضرایب زمانی</h2>
          <p>ضرایب اضافه‌کاری و شب‌کاری</p>
        </div>
      </header>

      <div className="draft-template-flow-time-coefficients-list">
        {timeCoefficientItems.map((item) => {
          const current = values?.[item.id];
          return (
            <article key={item.id} className="draft-template-flow-time-coefficient-card">
              <div className="draft-template-flow-time-coefficient-copy">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="draft-template-flow-time-coefficient-pills">
                  <label>
                    <input
                      type="checkbox"
                      name={`${item.id}Insurance`}
                      defaultChecked={current?.insurance ?? false}
                      onChange={onDirty}
                    />
                    <span aria-hidden />
                    مشمول بیمه
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name={`${item.id}Tax`}
                      defaultChecked={current?.tax ?? false}
                      onChange={onDirty}
                    />
                    <span aria-hidden />
                    مشمول مالیات
                  </label>
                </div>
              </div>

              <div className="draft-template-flow-time-coefficient-input">
                <input
                  name={item.id}
                  defaultValue={current?.value ?? ''}
                  inputMode="decimal"
                  placeholder="۰"
                  onInput={(event) => {
                    normalizeDecimalInput(event);
                    onDirty();
                  }}
                />
                <button
                  type="button"
                  aria-label="پاک کردن ضریب"
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
            </article>
          );
        })}
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
