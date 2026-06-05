'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowDown, ArrowLeft, ArrowUp, Braces, Eye, FileCode2, Plus, Save, Trash2 } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { upsertClientStorageStateAction } from '../../../../lib/client-storage-actions';
import type { HydratedClientStorageState } from '../../../../lib/client-storage-persistence';
import {
  NAMING_PATTERN_PART_OPTIONS,
  NAMING_PATTERN_SEPARATOR_OPTIONS,
  NAMING_PATTERN_USAGE_OPTIONS,
  createEmptyNamingPattern,
  createNamingPatternPart,
  getNamingPatternsFromStorage,
  getNamingPatternsStorageKey,
  getNamingPatternPartLabel,
  getNamingPatternPlaceholderParts,
  getNamingPatternPreview,
  getNamingPatternUsageLabel,
  validateNamingPattern,
  type NamingPattern,
  type NamingPatternPart,
  type NamingPatternPartType,
  type NamingPatternUsageType,
} from '../../../../lib/naming-patterns';

type BuilderMode = 'create' | 'edit';

function fieldClass() {
  return 'flex flex-col gap-1.5 text-right text-[12px] font-bold text-slate-300 [html[data-theme=light]_&]:text-slate-700';
}

function inputClass() {
  return 'h-11 rounded-2xl border border-white/10 bg-slate-950/50 px-3 text-sm font-semibold text-white outline-none transition focus:border-orange-400/70 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-white [html[data-theme=light]_&]:text-slate-900';
}

function chipClass(active = false) {
  return active
    ? 'inline-flex items-center gap-1 rounded-full border border-orange-400/40 bg-orange-500/15 px-3 py-1.5 text-[11px] font-extrabold text-orange-200 [html[data-theme=light]_&]:text-orange-700'
    : 'inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-slate-300 transition hover:border-cyan-400/35 hover:text-cyan-100 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-slate-50 [html[data-theme=light]_&]:text-slate-600';
}

function resolveInitialUsage(value: string | null): NamingPatternUsageType | null {
  return NAMING_PATTERN_USAGE_OPTIONS.some((item) => item.value === value) ? value as NamingPatternUsageType : null;
}

function buildPreset(preset: string | null, tenantId?: string | null, usage?: NamingPatternUsageType | null) {
  const pattern = createEmptyNamingPattern(tenantId);
  const basePattern = usage ? { ...pattern, usageType: usage } : pattern;
  if (preset === 'date_contract') {
    return {
      ...basePattern,
      name: 'کد تاریخ‌دار قرارداد',
      usageType: 'contract_number' as NamingPatternUsageType,
      parts: [
        createNamingPatternPart('year', 0),
        createNamingPatternPart('separator', 1),
        createNamingPatternPart('month_2digit', 2),
        createNamingPatternPart('separator', 3),
        createNamingPatternPart('day_2digit', 4),
        createNamingPatternPart('separator', 5),
        { ...createNamingPatternPart('text', 6), config: { mode: 'fixed' as const, value: 'CONTRACT', label: 'متن ثابت' } },
        createNamingPatternPart('separator', 7),
        createNamingPatternPart('sequence', 8),
      ],
    };
  }
  if (preset === 'persian_contract') {
    return {
      ...basePattern,
      name: 'قرارداد سالانه',
      usageType: 'draft_template_name' as NamingPatternUsageType,
      parts: [
        { ...createNamingPatternPart('text', 0), config: { mode: 'fixed' as const, value: 'قالب', label: 'متن ثابت' } },
        createNamingPatternPart('space', 1),
        createNamingPatternPart('year', 2),
        createNamingPatternPart('space', 3),
        createNamingPatternPart('sequence', 4),
      ],
    };
  }
  if (preset === 'letter') {
    return {
      ...basePattern,
      name: 'سری حروفی',
      usageType: 'employee_number' as NamingPatternUsageType,
      parts: [createNamingPatternPart('letter_series', 0), createNamingPatternPart('separator', 1), createNamingPatternPart('sequence', 2)],
    };
  }
  return basePattern;
}

function PartConfigEditor({ part, onChange }: { part: NamingPatternPart; onChange: (part: NamingPatternPart) => void }) {
  const updateConfig = (patch: Partial<NamingPatternPart['config']>) => onChange({ ...part, config: { ...part.config, ...patch } });
  const stablePlaceholderKey = `placeholder_${part.id}`;

  if (part.type === 'text' || part.type === 'static_text') {
    const mode = part.config.mode ?? 'fixed';
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <label className={fieldClass()} title="متن ثابت: مقداری است که همین حالا وارد می‌شود و همیشه ثابت می‌ماند. متن قابل تکمیل: جایگاهی است که مقدار آن هنگام استفاده از الگو وارد می‌شود.">
          نوع متن
          <select
            className={inputClass()}
            value={mode}
            onChange={(event) => {
              const nextMode = event.target.value as 'fixed' | 'placeholder';
              updateConfig({
                mode: nextMode,
                ...(nextMode === 'placeholder' ? { placeholderKey: part.config.placeholderKey?.trim() || stablePlaceholderKey, label: part.config.label?.trim() || 'متن قابل تکمیل' } : {}),
              });
            }}
          >
            <option value="fixed">متن ثابت</option>
            <option value="placeholder">متن قابل تکمیل</option>
          </select>
        </label>
        {mode === 'placeholder' ? (
          <label className={fieldClass()} title="متن قابل تکمیل: جایگاهی است که مقدار آن هنگام استفاده از الگو وارد می‌شود.">
            عنوان جایگاه را وارد کنید
            <input
              className={inputClass()}
              value={part.config.label ?? ''}
              onChange={(event) => updateConfig({ label: event.target.value, placeholderKey: part.config.placeholderKey?.trim() || stablePlaceholderKey })}
              placeholder="مثلا عنوان قالب"
            />
          </label>
        ) : (
          <label className={fieldClass()} title="متن ثابت: مقداری است که همین حالا وارد می‌شود و همیشه ثابت می‌ماند.">
            متن را وارد کنید
            <input className={inputClass()} value={part.config.value ?? part.config.text ?? ''} onChange={(event) => updateConfig({ value: event.target.value, text: event.target.value, label: 'متن ثابت' })} placeholder="مثلا سال یا CNT" />
          </label>
        )}
      </div>
    );
  }

  if (part.type === 'separator') {
    return (
      <div className="grid gap-3 md:grid-cols-2">
        <label className={fieldClass()}>
          کاراکتر / جداکننده
          <select className={inputClass()} value={part.config.value ?? '-'} onChange={(event) => updateConfig({ value: event.target.value })}>
            {NAMING_PATTERN_SEPARATOR_OPTIONS.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        {part.config.value === 'custom' ? (
          <label className={fieldClass()}>
            کاراکتر دلخواه
            <input className={inputClass()} value={part.config.customValue ?? ''} maxLength={12} onChange={(event) => updateConfig({ customValue: event.target.value })} />
          </label>
        ) : null}
      </div>
    );
  }

  if (part.type === 'space') {
    return <p className="m-0 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-400 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-white">یک فاصله معمولی بین بخش‌ها اضافه می‌کند.</p>;
  }

  if (part.type === 'sequence') {
    return (
      <div className="grid gap-3 md:grid-cols-4">
        <label className={fieldClass()}>
          شروع از
          <input className={inputClass()} type="number" min={1} value={part.config.startFrom ?? 1} onChange={(event) => updateConfig({ startFrom: Number(event.target.value) })} />
        </label>
        <label className={fieldClass()}>
          مقدار فعلی
          <input className={inputClass()} type="number" min={1} value={part.config.currentValue ?? 1} onChange={(event) => updateConfig({ currentValue: Number(event.target.value) })} />
        </label>
        <label className={fieldClass()}>
          طول شماره
          <input className={inputClass()} type="number" min={1} max={10} value={part.config.paddingLength ?? 3} onChange={(event) => updateConfig({ paddingLength: Number(event.target.value) })} />
        </label>
        <label className={fieldClass()}>
          گام افزایش
          <input className={inputClass()} type="number" min={1} value={part.config.step ?? 1} onChange={(event) => updateConfig({ step: Number(event.target.value) })} />
        </label>
      </div>
    );
  }

  if (part.type === 'letter_series') {
    const alphabetType = part.config.alphabetType ?? 'english';
    const letters = alphabetType === 'persian' ? ['الف', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د'] : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return (
      <div className="grid gap-3 md:grid-cols-3">
        <label className={fieldClass()}>
          نوع حروف
          <select
            className={inputClass()}
            value={alphabetType}
            onChange={(event) => updateConfig({
              alphabetType: event.target.value as 'english' | 'persian',
              startLetter: event.target.value === 'persian' ? 'الف' : 'A',
              currentLetter: event.target.value === 'persian' ? 'الف' : 'A',
            })}
          >
            <option value="english">انگلیسی</option>
            <option value="persian">فارسی</option>
          </select>
        </label>
        <label className={fieldClass()}>
          حرف شروع
          <select className={inputClass()} value={part.config.startLetter ?? letters[0]} onChange={(event) => updateConfig({ startLetter: event.target.value, currentLetter: event.target.value })}>
            {letters.map((letter) => <option key={letter} value={letter}>{letter}</option>)}
          </select>
        </label>
        <label className={fieldClass()}>
          سقف شماره قبل از تغییر حرف
          <input className={inputClass()} type="number" min={1} value={part.config.sequenceMax ?? 999} onChange={(event) => updateConfig({ sequenceMax: Number(event.target.value) })} />
        </label>
      </div>
    );
  }

  return <p className="m-0 text-xs font-semibold text-slate-400">این بخش فقط در الگوهای قدیمی وجود داشته و در ذخیره بعدی به متن ثابت تبدیل می‌شود.</p>;
}

export function NamingPatternBuilderClient({
  tenantId = null,
  mode,
  patternId,
  storageStates,
}: {
  tenantId?: string | null;
  mode: BuilderMode;
  patternId?: string;
  storageStates: HydratedClientStorageState[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUsage = resolveInitialUsage(searchParams.get('usage'));
  const initialPatterns = useMemo(() => {
    const raw = storageStates.find((item) => item.storageKey === getNamingPatternsStorageKey(tenantId))?.value ?? null;
    return getNamingPatternsFromStorage(raw);
  }, [storageStates, tenantId]);
  const [patterns] = useState<NamingPattern[]>(initialPatterns);
  const [draft, setDraft] = useState<NamingPattern>(() => {
    if (mode === 'edit' && patternId) {
      const found = initialPatterns.find((item) => item.id === patternId);
      if (found) return found;
    }
    return buildPreset(searchParams.get('preset'), tenantId, initialUsage);
  });
  const [error, setError] = useState('');
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});

  const placeholderParts = useMemo(() => getNamingPatternPlaceholderParts(draft), [draft]);
  const preview = useMemo(
    () => getNamingPatternPreview(draft, { date: new Date().toISOString().slice(0, 10), placeholders: placeholderValues }),
    [draft, placeholderValues],
  );
  const groupedParts = useMemo(() => {
    const groups = new Map<string, typeof NAMING_PATTERN_PART_OPTIONS>();
    NAMING_PATTERN_PART_OPTIONS.forEach((item) => {
      groups.set(item.group, [...(groups.get(item.group) ?? []), item]);
    });
    return Array.from(groups.entries());
  }, []);

  const updatePart = (part: NamingPatternPart) => {
    setDraft((current) => ({ ...current, parts: current.parts.map((item) => (item.id === part.id ? part : item)) }));
  };

  const movePart = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      const parts = [...current.parts];
      const target = index + direction;
      if (target < 0 || target >= parts.length) return current;
      [parts[index], parts[target]] = [parts[target], parts[index]];
      return { ...current, parts: parts.map((part, order) => ({ ...part, order })) };
    });
  };

  const save = () => {
    const normalized = {
      ...draft,
      name: draft.name.trim(),
      isDefault: true,
      parts: draft.parts.map((part, order) => ({ ...part, order })),
      updatedAt: new Date().toISOString(),
    };
    const errors = validateNamingPattern(normalized);
    if (errors.length) {
      setError(errors[0]);
      return;
    }
    const exists = patterns.some((item) => item.id === normalized.id);
    if (!exists && patterns.some((item) => item.usageType === normalized.usageType)) {
      setError('برای این کاربرد قبلاً یک الگو تعریف شده است.');
      return;
    }
    const nextPatterns = (exists ? patterns : [normalized, ...patterns]).map((item) => (item.id === normalized.id ? normalized : item));
    void upsertClientStorageStateAction(getNamingPatternsStorageKey(tenantId), JSON.stringify(nextPatterns)).then(() => {
      router.push('/business-settings/naming-patterns');
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    save();
  };

  return (
    <form className="page-stack module-page draft-templates-page business-draft-list-page draft-templates-showcase-page" dir="rtl" lang="fa" onSubmit={handleSubmit}>
      <header className="business-draft-list-header draft-templates-showcase-header">
        <div>
          <Link href="/business-settings/naming-patterns" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-cyan-100 no-underline [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:text-cyan-700">
            <ArrowLeft className="h-4 w-4" />
            بازگشت به فهرست الگوها
          </Link>
          <p className="mt-4">تنظیمات کسب‌وکار</p>
          <h1>{mode === 'create' ? 'افزودن الگو' : 'ویرایش الگو'}</h1>
          <span>بخش‌های ساده الگو را به ترتیب بچینید و خروجی را قبل از ذخیره بررسی کنید.</span>
        </div>
        <button type="submit" className="draft-templates-showcase-add">
          <Save className="h-4 w-4" />
          ذخیره الگو
        </button>
      </header>

      {error ? <p className="calendar-create-error m-0">{error}</p> : null}

      <section className="rounded-[24px] border border-white/10 bg-slate-900/50 p-5 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-white">
        <div className="mb-4 flex items-center gap-2 text-sm font-extrabold text-white [html[data-theme=light]_&]:text-slate-900">
          <FileCode2 className="h-4 w-4 text-orange-300" />
          اطلاعات پایه
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className={fieldClass()}>
            نام الگو <em className="text-orange-300">*</em>
            <input className={inputClass()} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="مثلا شماره قرارداد ساده" />
          </label>
          <label className={fieldClass()}>
            کاربرد الگو <em className="text-orange-300">*</em>
            <select className={inputClass()} value={draft.usageType} onChange={(event) => setDraft((current) => ({ ...current, usageType: event.target.value as NamingPatternUsageType }))}>
              {NAMING_PATTERN_USAGE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label className={fieldClass()} title="جهت خروجی: فقط نحوه نمایش و تولید خروجی را راست‌به‌چپ یا چپ‌به‌راست می‌کند.">
            جهت تولید خروجی
            <select className={inputClass()} value={draft.direction ?? 'rtl'} onChange={(event) => setDraft((current) => ({ ...current, direction: event.target.value as 'rtl' | 'ltr' }))}>
              <option value="rtl">راست به چپ</option>
              <option value="ltr">چپ به راست</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-300 [html[data-theme=light]_&]:text-slate-700">
            <input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))} />
            فعال
          </label>
          {mode === 'create' && patterns.some((item) => item.usageType === draft.usageType) ? <span className={chipClass()}>برای این کاربرد قبلاً یک الگو تعریف شده است.</span> : null}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-slate-900/50 p-5 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-white">
        <div className="mb-4 flex items-center gap-2 text-sm font-extrabold text-white [html[data-theme=light]_&]:text-slate-900">
          <Braces className="h-4 w-4 text-cyan-300" />
          بخش‌های الگو
        </div>
        <div className="mb-5 flex flex-col gap-3 rounded-[20px] border border-white/10 bg-slate-950/30 p-4 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-slate-50">
          <span className="text-xs font-extrabold text-slate-300 [html[data-theme=light]_&]:text-slate-700">افزودن بخش</span>
          {groupedParts.map(([group, options]) => (
            <div key={group} className="flex flex-wrap items-center gap-2">
              <span className="min-w-[64px] text-[11px] font-bold text-slate-500">{group}</span>
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={chipClass()}
                  onClick={() => setDraft((current) => ({ ...current, parts: [...current.parts, createNamingPatternPart(option.value, current.parts.length)] }))}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {option.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {draft.parts.length ? draft.parts.map((part, index) => (
            <article key={part.id} className="rounded-[20px] border border-white/10 bg-white/[0.04] p-4 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-slate-50">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className={chipClass(true)}>{index + 1}</span>
                <strong className="flex-1 text-sm text-white [html[data-theme=light]_&]:text-slate-900">{getNamingPatternPartLabel(part.type)}</strong>
                <button type="button" className={chipClass()} onClick={() => movePart(index, -1)} disabled={index === 0}>
                  <ArrowUp className="h-3.5 w-3.5" />
                  بالا
                </button>
                <button type="button" className={chipClass()} onClick={() => movePart(index, 1)} disabled={index === draft.parts.length - 1}>
                  <ArrowDown className="h-3.5 w-3.5" />
                  پایین
                </button>
                <button type="button" className="inline-flex items-center gap-1 rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1.5 text-[11px] font-bold text-rose-200" onClick={() => setDraft((current) => ({ ...current, parts: current.parts.filter((item) => item.id !== part.id).map((item, order) => ({ ...item, order })) }))}>
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف
                </button>
              </div>
              <PartConfigEditor part={part} onChange={updatePart} />
            </article>
          )) : (
            <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm font-semibold text-slate-400 [html[data-theme=light]_&]:border-slate-300">
              هنوز بخشی اضافه نشده است.
            </div>
          )}
        </div>
      </section>

      <section className="sticky bottom-3 z-10 rounded-[24px] border border-orange-400/25 bg-slate-950/90 p-5 shadow-[0_20px_50px_rgba(2,6,23,0.35)] backdrop-blur [html[data-theme=light]_&]:bg-white/95">
        <div className="mb-4 flex items-center gap-2 text-sm font-extrabold text-white [html[data-theme=light]_&]:text-slate-900">
          <Eye className="h-4 w-4 text-orange-300" />
          پیش‌نمایش
        </div>
        {placeholderParts.length ? (
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            {placeholderParts.map((item) => (
              <label key={item.id} className={fieldClass()}>
                {item.label}
                <input
                  className={inputClass()}
                  value={placeholderValues[item.key] ?? ''}
                  onChange={(event) => setPlaceholderValues((current) => ({ ...current, [item.key]: event.target.value }))}
                  placeholder="مثلا پیش نویس یوایکس"
                />
              </label>
            ))}
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-orange-400/25 bg-orange-500/10 p-3">
            <span className="text-[11px] font-bold text-orange-200">خروجی نمونه</span>
            <strong dir={draft.direction ?? 'rtl'} className="mt-1 block break-words text-lg text-white [html[data-theme=light]_&]:text-slate-900">{preview.current || 'بدون خروجی'}</strong>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 [html[data-theme=light]_&]:border-slate-200">
            <span className="text-[11px] font-bold text-slate-400">خروجی بعدی با شماره فعلی</span>
            <strong dir={draft.direction ?? 'rtl'} className="mt-1 block break-words text-sm text-white [html[data-theme=light]_&]:text-slate-900">{preview.current || '-'}</strong>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 [html[data-theme=light]_&]:border-slate-200">
            <span className="text-[11px] font-bold text-slate-400">خروجی بعدی پس از افزایش شماره</span>
            <strong dir={draft.direction ?? 'rtl'} className="mt-1 block break-words text-sm text-white [html[data-theme=light]_&]:text-slate-900">{preview.afterIncrement || '-'}</strong>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-400">کاربرد: {getNamingPatternUsageLabel(draft.usageType)}</span>
          <button type="submit" className="draft-templates-showcase-add">
            <Save className="h-4 w-4" />
            ذخیره الگو
          </button>
        </div>
      </section>
    </form>
  );
}
