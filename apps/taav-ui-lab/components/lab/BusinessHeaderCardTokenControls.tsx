'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import {
  applyHeaderCardTokens,
  buildTokenCssSnippet,
  clearHeaderCardTokenOverrides,
  clearStoredHeaderCardTokens,
  colorInputValue,
  HEADER_CARD_TOKEN_DEFAULTS,
  normalizeHeaderCardTokens,
  readStoredHeaderCardTokens,
  storeHeaderCardTokens,
  type HeaderCardColorTokenKey,
  type HeaderCardNumericTokenKey,
  type HeaderCardTokenValues,
} from '@/lib/header-card-tokens';

type SliderField = {
  key: HeaderCardNumericTokenKey;
  label: string;
  min: number;
  max: number;
  step: number;
};

type ColorField = {
  key: HeaderCardColorTokenKey;
  label: string;
};

const SLIDERS: SliderField[] = [
  { key: 'radius', label: 'شعاع کارت', min: 0, max: 32, step: 1 },
  { key: 'radiusCompact', label: 'شعاع کارت فشرده', min: 0, max: 32, step: 1 },
  { key: 'iconRadius', label: 'شعاع باکس آیکن', min: 0, max: 28, step: 1 },
  { key: 'actionRadius', label: 'شعاع دکمه اکشن', min: 0, max: 28, step: 1 },
  { key: 'titleSize', label: 'اندازه فونت عنوان', min: 12, max: 28, step: 0.5 },
  { key: 'descSize', label: 'اندازه فونت توضیح', min: 10, max: 18, step: 0.5 },
  { key: 'actionSize', label: 'اندازه فونت دکمه', min: 10, max: 18, step: 0.5 },
  { key: 'searchSize', label: 'اندازه فونت جستجو', min: 10, max: 18, step: 0.5 },
];

const COLORS: ColorField[] = [
  { key: 'surface', label: 'پس‌زمینه کارت' },
  { key: 'surfaceHover', label: 'پس‌زمینه هاور' },
  { key: 'border', label: 'رنگ حاشیه' },
  { key: 'titleColor', label: 'رنگ عنوان' },
  { key: 'descriptionColor', label: 'رنگ توضیح' },
  { key: 'accent', label: 'رنگ برند / اکسنت' },
  { key: 'iconBg', label: 'پس‌زمینه آیکن' },
  { key: 'actionText', label: 'رنگ متن دکمه' },
  { key: 'searchBg', label: 'پس‌زمینه جستجو' },
  { key: 'searchText', label: 'رنگ متن جستجو' },
];

function SliderRow({
  field,
  value,
  onChange,
}: {
  field: SliderField;
  value: number;
  onChange: (key: HeaderCardNumericTokenKey, next: number) => void;
}) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(field.key, Number(event.target.value));
  };

  return (
    <label className="grid gap-1.5 rounded-[var(--taav-radius-md)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-2.5 py-2.5">
      <div className="flex items-center justify-between gap-2 text-[length:var(--taav-text-xs)]">
        <span className="font-bold text-[var(--taav-text-body)]">{field.label}</span>
        <span className="tabular-nums text-[var(--taav-text-muted)]">{value}px</span>
      </div>
      <input
        type="range"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={handleChange}
        className="w-full accent-[var(--taav-brand)]"
      />
    </label>
  );
}

function ColorRow({
  field,
  value,
  onChange,
}: {
  field: ColorField;
  value: string;
  onChange: (key: HeaderCardColorTokenKey, next: string) => void;
}) {
  return (
    <label className="grid gap-1.5 rounded-[var(--taav-radius-md)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-2.5 py-2.5">
      <div className="flex items-center justify-between gap-2 text-[length:var(--taav-text-xs)]">
        <span className="font-bold text-[var(--taav-text-body)]">{field.label}</span>
        <span
          className="h-4 w-4 shrink-0 rounded-full border border-[var(--taav-border)]"
          style={{ background: value }}
          aria-hidden
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={colorInputValue(value)}
          onChange={(event) => onChange(field.key, event.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-[var(--taav-border)] bg-transparent p-0.5"
          aria-label={field.label}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(field.key, event.target.value)}
          spellCheck={false}
          className="min-w-0 flex-1 rounded-[var(--taav-radius-sm)] border border-[var(--taav-border)] bg-[var(--taav-surface)] px-2 py-1.5 text-[length:var(--taav-text-2xs)] text-[var(--taav-text-body)]"
        />
      </div>
    </label>
  );
}

/** Sticky left-edge inspector: radius/font/color controls + live CSS token list. */
export function BusinessHeaderCardTokenControls() {
  const [values, setValues] = useState<HeaderCardTokenValues>(() => normalizeHeaderCardTokens(HEADER_CARD_TOKEN_DEFAULTS));
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const stored = readStoredHeaderCardTokens();
    const next = stored ?? normalizeHeaderCardTokens(HEADER_CARD_TOKEN_DEFAULTS);
    setValues(next);
    applyHeaderCardTokens(next);
  }, []);

  const commit = (updated: HeaderCardTokenValues) => {
    applyHeaderCardTokens(updated);
    storeHeaderCardTokens(updated);
    setSaveState('idle');
    setSaveMessage('');
    setValues(updated);
  };

  const updateNumeric = (key: HeaderCardNumericTokenKey, next: number) => {
    commit({ ...values, [key]: next });
  };

  const updateColor = (key: HeaderCardColorTokenKey, next: string) => {
    const updated = { ...values, [key]: next };
    if (key === 'accent' && values.iconBg === HEADER_CARD_TOKEN_DEFAULTS.iconBg) {
      updated.iconBg = `color-mix(in srgb, ${next} 10%, transparent)`;
    }
    commit(updated);
  };

  const resetDefaults = () => {
    const next = normalizeHeaderCardTokens(HEADER_CARD_TOKEN_DEFAULTS);
    setValues(next);
    clearStoredHeaderCardTokens();
    clearHeaderCardTokenOverrides();
    setSaveState('idle');
    setSaveMessage('به مقادیر پیش‌فرض برگشت.');
  };

  const persistToTokensFile = async () => {
    setSaveState('saving');
    setSaveMessage('');
    try {
      const response = await fetch('/api/header-card-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        throw new Error('save failed');
      }
      storeHeaderCardTokens(values);
      applyHeaderCardTokens(values);
      setSaveState('saved');
      setSaveMessage('در فایل توکن ذخیره شد؛ در dastranj-panel و بقیه مصرف‌کننده‌ها هم اعمال می‌شود.');
    } catch {
      setSaveState('error');
      setSaveMessage('ذخیره در فایل توکن ناموفق بود.');
    }
  };

  return (
    <div className="grid gap-5">
      <div className="grid gap-1">
        <h3 className="m-0 text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]">تنظیم زنده</h3>
        <p className="m-0 text-[length:var(--taav-text-2xs)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
          شعاع، فونت و رنگ — تغییرات بلافاصله اعمال می‌شود.
        </p>
      </div>

      <div className="grid gap-2">
        <h4 className="m-0 text-[length:var(--taav-text-xs)] font-black text-[var(--taav-text-body)]">شعاع و فونت</h4>
        <div className="grid gap-2">
          {SLIDERS.map((field) => (
            <SliderRow key={field.key} field={field} value={values[field.key]} onChange={updateNumeric} />
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <h4 className="m-0 text-[length:var(--taav-text-xs)] font-black text-[var(--taav-text-body)]">رنگ‌ها</h4>
        <div className="grid gap-2">
          {COLORS.map((field) => (
            <ColorRow key={field.key} field={field} value={values[field.key]} onChange={updateColor} />
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <button
          type="button"
          onClick={persistToTokensFile}
          disabled={saveState === 'saving'}
          className="rounded-[var(--taav-radius-md)] bg-[var(--taav-brand)] px-3 py-2 text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-text-on-brand)] disabled:opacity-60"
        >
          {saveState === 'saving' ? 'در حال ذخیره…' : 'ذخیره در توکن‌ها (سراسری)'}
        </button>
        <button
          type="button"
          onClick={resetDefaults}
          className="rounded-[var(--taav-radius-md)] border border-[var(--taav-border)] bg-[var(--taav-surface-soft)] px-3 py-2 text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-text-body)]"
        >
          بازنشانی
        </button>
      </div>

      {saveMessage ? (
        <p
          className={`m-0 text-[length:var(--taav-text-2xs)] ${
            saveState === 'error' ? 'text-[var(--taav-danger-strong)]' : 'text-[var(--taav-text-muted)]'
          }`}
        >
          {saveMessage}
        </p>
      ) : null}

      <div className="grid gap-2 border-t border-[var(--taav-border-subtle)] pt-4">
        <h4 className="m-0 text-[length:var(--taav-text-xs)] font-black text-[var(--taav-text-body)]">توکن‌ها</h4>
        <pre className="lab-code m-0 overflow-x-auto whitespace-pre-wrap rounded-[var(--taav-radius-md)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] p-2.5 text-[length:var(--taav-text-2xs)] text-[var(--taav-brand-strong)]">
          {buildTokenCssSnippet(values)}
        </pre>
      </div>
    </div>
  );
}
