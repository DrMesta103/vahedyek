'use client';

import { ArrowLeft, BriefcaseBusiness, CalendarDays, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { MinimalScroll } from '../../../components/MinimalScroll';
import { createPolicyFromQuickSetupAction } from '../../../lib/actions';
import type { CompletedCalendarItem, QuickPolicySummary } from './quick-setup.types';

type PolicyTemplate = { id: string; title: string; description: string; application: string; year: string };
type SectionKey = 'calendar' | 'template';

const SYSTEM_TEMPLATES: PolicyTemplate[] = [
  { id: 'office', title: 'سیاست کاری اداری', description: 'مناسب برای تیم‌های اداری با ساعات کاری منظم و استاندارد', application: 'اداری', year: '1404' },
  { id: 'restaurant', title: 'سیاست کاری رستورانی', description: 'مناسب کسب‌وکارها و تیم‌های شیفتی و خدماتی', application: 'رستورانی', year: '1404' },
  { id: 'retail', title: 'سیاست کاری فروشگاهی', description: 'مناسب فروشگاه‌ها و محیط‌های کاری با شیفت‌های منعطف', application: 'فروشگاهی', year: '1404' },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function FieldTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-slate-950/50 text-slate-300" aria-hidden="true">
        ?
      </span>
      <span className="pointer-events-none absolute right-0 top-8 z-30 hidden w-72 rounded-xl border border-white/10 bg-slate-900 p-3 text-right text-xs leading-6 text-slate-200 shadow-2xl group-hover:block">
        {text}
      </span>
    </span>
  );
}

function uniqueCalendars(items: CompletedCalendarItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function SectionShell({
  title,
  icon,
  isOpen,
  canOpen = true,
  onToggle,
  children,
}: {
  title: string;
  icon: ReactNode;
  isOpen: boolean;
  canOpen?: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-slate-950/25">
      <div className="flex flex-row-reverse items-center justify-between gap-4 px-4 py-4 text-right sm:px-5">
        <button
          type="button"
          onClick={onToggle}
          disabled={!canOpen}
          className={cn(
            'inline-flex flex-row-reverse items-center gap-2 text-xs text-slate-400 transition-colors',
            canOpen ? 'hover:text-white' : 'cursor-not-allowed opacity-40',
          )}
        >
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {isOpen ? 'بستن' : 'مشاهده جزئیات'}
        </button>
        <div className="flex flex-row-reverse items-center gap-3 text-right">
          <div className="text-base font-bold text-white">{title}</div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-200">{icon}</div>
        </div>
      </div>
      {isOpen ? <div className="border-t border-white/10 px-4 pb-4 pt-4 sm:px-5">{children}</div> : null}
    </section>
  );
}

export default function Step3Policy({
  isCompleted,
  calendar,
  calendars,
  policy,
  onPolicyChange,
  onComplete,
  onBack,
}: {
  isCompleted: boolean;
  calendar: CompletedCalendarItem | null;
  calendars: CompletedCalendarItem[];
  policy: QuickPolicySummary | null;
  onPolicyChange: (policy: QuickPolicySummary | null) => void;
  onComplete: (policy: QuickPolicySummary) => void;
  onBack: () => void;
}) {
  const calendarOptions = useMemo(() => uniqueCalendars([...(calendar ? [calendar] : []), ...calendars]), [calendar, calendars]);
  const [activeSection, setActiveSection] = useState<SectionKey>('calendar');
  const [selectedCalendarId, setSelectedCalendarId] = useState(calendar?.id ?? calendarOptions[0]?.id ?? '');
  const [calendarConfirmed, setCalendarConfirmed] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const selectedCalendar = useMemo(
    () => calendarOptions.find((item) => item.id === selectedCalendarId) ?? null,
    [calendarOptions, selectedCalendarId],
  );
  const selectedTemplate = useMemo(() => SYSTEM_TEMPLATES.find((item) => item.id === selectedTemplateId) ?? null, [selectedTemplateId]);
  const canContinue = Boolean(selectedCalendar && calendarConfirmed && selectedTemplate && !saving);

  useEffect(() => {
    if (!calendarOptions.length) return;
    const stillAvailable = calendarOptions.some((item) => item.id === selectedCalendarId);
    if (!selectedCalendarId || !stillAvailable) {
      setSelectedCalendarId(calendarOptions[0].id);
    }
  }, [calendarOptions, selectedCalendarId]);

  const save = async () => {
    setSaveError('');
    if (!selectedCalendar || !calendarConfirmed) {
      setSaveError('برای ادامه، ابتدا تقویم کاری را تأیید کنید.');
      return;
    }
    if (!selectedTemplate) {
      setSaveError('برای ادامه، ابتدا یک قالب سیاست کاری انتخاب کنید.');
      return;
    }
    setSaving(true);
    try {
      const result = await createPolicyFromQuickSetupAction({
        calendarId: selectedCalendar.id,
        policyTemplateId: selectedTemplate.id,
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        templateTitle: selectedTemplate.title,
        year: selectedCalendar.yearLabel,
      });
      const nextPolicy = {
        id: result.id,
        title: result.title,
        description: result.description,
        calendarId: selectedCalendar.id,
        calendarTitle: selectedCalendar.title,
        isDefault: true,
        templateId: selectedTemplate.id,
        templateTitle: selectedTemplate.title,
        selectedCalendarId: selectedCalendar.id,
        selectedPolicyTemplateId: selectedTemplate.id,
        generatedPolicyTitle: selectedTemplate.title,
        generatedPolicyDescription: selectedTemplate.description,
        year: selectedCalendar.yearLabel,
      };
      onPolicyChange(nextPolicy);
      onComplete(nextPolicy);
    } catch {
      setSaveError('سیاست کاری ذخیره نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  if (isCompleted && policy) {
    return (
      <section className="rounded-xl border border-white/10 bg-slate-800/65 p-3.5 sm:p-4">
        <div className="rounded-xl border border-white/10 bg-slate-950/45 p-4 sm:p-5">
          <div className="mx-auto w-full rounded-xl border border-white/10 bg-slate-900/70 p-4 text-right lg:max-w-[300px]">
            <div className="text-lg font-bold text-white">عنوان: {policy.title}</div>
            <div className="mt-3 text-sm text-slate-300">توضیحات: {policy.description}</div>
            <div className="mt-2 text-sm text-slate-300">تقویم کاری: {policy.calendarTitle}</div>
            <div className="mt-2 text-sm text-slate-300">سال کاری: {policy.year}</div>
            <div className="mt-2 text-sm text-slate-300">قالب: {policy.templateTitle}</div>
            <div className="mt-2 text-sm text-slate-300">وضعیت: {policy.isDefault ? 'پیش‌فرض' : 'عادی'}</div>
          </div>
          <a href="/policies" className="mt-5 flex w-full items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500">
            برای مدیریت کامل سیاست های کاری، کلیک کنید تا به فهرست سیاست های کاری بروید.
          </a>
        </div>
        <div className="mt-5 flex">
          <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-500">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-white/10 bg-slate-800/65 p-3.5 sm:p-4" dir="rtl">
      <div className="space-y-4 rounded-xl border border-white/10 bg-slate-950/45 p-4 sm:p-5">
        <div className="rounded-[22px] border border-indigo-500/20 bg-[linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.9))] p-5 text-right">
          <div className="text-2xl font-black text-white">انتخاب سیاست کاری</div>
          <p className="mt-3 max-w-4xl text-sm leading-8 text-slate-300">
            سیاست کاری مشخص می‌کند سیستم تردد، ساعت کار، مرخصی، اضافه‌کاری و درخواست‌های کارکنان را بر چه قواعدی مدیریت کند. یک قالب نزدیک به مدل کاری سازمان خود انتخاب کنید. جزئیات این سیاست بعداً از بخش سیاست‌های کاری قابل ویرایش است.
          </p>
          <p className="mt-3 text-xs leading-6 text-slate-400">
            تنظیمات حقوق و دستمزد در این بخش انجام نمی‌شود و در تنظیمات کسب‌وکار به‌صورت جداگانه مدیریت خواهد شد.
          </p>
        </div>

        <SectionShell title="انتخاب تقویم کاری" icon={<CalendarDays className="h-5 w-5" />} isOpen={activeSection === 'calendar'} onToggle={() => setActiveSection('calendar')}>
          {calendarOptions.length > 0 ? (
            <>
              <div className="mb-4 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-right text-sm leading-7 text-slate-200">
                <span className="font-bold text-white">انتخاب تقویم کاری</span>
                <div className="mt-2 text-slate-300">تقویم کاری، مبنای تشخیص روزهای کاری، تعطیلات و روزهای غیرکاری در این سیاست است.</div>
              </div>
              <MinimalScroll className="max-h-[360px] rounded-xl border border-white/10 bg-slate-950/25 p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  {calendarOptions.map((item) => {
                    const selected = selectedCalendarId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedCalendarId(item.id);
                          setCalendarConfirmed(false);
                          setSelectedTemplateId('');
                          setSaveError('');
                        }}
                        className={cn(
                          'min-h-[132px] rounded-xl border p-4 text-right transition-all',
                          selected
                            ? 'border-indigo-400 bg-[linear-gradient(135deg,rgba(99,102,241,0.24),rgba(38,44,102,0.9))] shadow-[0_0_0_1px_rgba(99,102,241,0.18)]'
                            : 'border-white/10 bg-slate-800/40 hover:border-white/20',
                        )}
                      >
                        <div className="flex h-full flex-col justify-between gap-3">
                          <div>
                            <div className="text-xs font-bold text-slate-400">عنوان تقویم</div>
                            <div className="mt-1 text-base font-black text-white">{item.title}</div>
                            <div className="mt-3 text-xs font-bold text-slate-400">توضیحات</div>
                            <div className="mt-1 line-clamp-2 text-sm leading-6 text-slate-300">{item.description || 'توضیحات ثبت نشده است'}</div>
                          </div>
                          <div className="flex flex-row-reverse items-center justify-between gap-3 text-xs text-slate-400">
                            <span>سال کاری: {item.yearLabel}</span>
                            {selected ? <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-200">انتخاب شده</span> : null}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </MinimalScroll>
              {selectedCalendar ? (
                <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-right">
                  <div className="flex flex-row-reverse items-center justify-between gap-3">
                    <div className="text-sm font-bold text-white">تقویم انتخاب شده</div>
                    {calendarConfirmed ? <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-200">تقویم کاری {selectedCalendar.yearLabel} تأیید شد</span> : null}
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-300">عنوان: {selectedCalendar.title}</div>
                  <div className="mt-1 text-sm leading-7 text-slate-300">سال کاری: {selectedCalendar.yearLabel}</div>
                </div>
              ) : null}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setCalendarConfirmed(true);
                    setActiveSection('template');
                  }}
                  disabled={!selectedCalendar}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                    selectedCalendar ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-500',
                  )}
                >
                  تأیید تقویم و انتخاب سیاست کاری
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-white/15 bg-slate-900/40 p-4 text-sm text-amber-300">
              ابتدا باید تقویم کاری را تکمیل کنید تا سیاست کاری بر اساس آن ساخته شود.
              <div className="mt-4 flex justify-end">
                <button type="button" onClick={onBack} className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500">
                  بازگشت به تقویم
                </button>
              </div>
            </div>
          )}
        </SectionShell>

        <SectionShell
          title="قالب سیاست کاری را انتخاب کنید"
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          isOpen={activeSection === 'template'}
          canOpen={calendarConfirmed}
          onToggle={() => setActiveSection('template')}
        >
          <div className="mb-4 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-right text-sm leading-7 text-slate-200">
            <span className="inline-flex flex-row-reverse items-center gap-2 font-bold text-white">
              انتخاب قالب سیاست کاری
              <FieldTooltip text="قالب سیاست کاری مجموعه‌ای از تنظیمات آماده برای مدیریت تردد و درخواست‌هاست. نزدیک‌ترین گزینه به مدل کاری سازمان خود را انتخاب کنید." />
            </span>
            <div className="mt-2 text-slate-300">قالب انتخابی به صورت پیش‌فرض تنظیم می‌شود و بعدا می‌توانید آن را با قواعد سازمان خود تطبیق دهید.</div>
          </div>
          <div className="mb-4 rounded-xl border border-white/10 bg-slate-900/50 p-4 text-right text-sm leading-7 text-slate-200">
            <div className="font-bold text-white">خلاصه انتخاب‌ها</div>
            <div className="mt-2 text-slate-300">تقویم: {selectedCalendar ? `${selectedCalendar.title} (${selectedCalendar.yearLabel})` : 'انتخاب نشده'}</div>
            <div className="mt-1 text-slate-300">سیاست: {selectedTemplate ? selectedTemplate.title : 'انتخاب نشده'}</div>
            <div className="mt-1 text-slate-300">وضعیت: {selectedTemplate ? 'این سیاست به‌عنوان سیاست اولیه سازمان ذخیره می‌شود.' : 'برای ادامه، ابتدا یک قالب سیاست کاری انتخاب کنید.'}</div>
            <div className="mt-1 text-slate-400">بعداً می‌توانید این سیاست را از بخش سیاست‌های کاری ویرایش کنید یا سیاست‌های بیشتری بسازید.</div>
          </div>
          {calendarConfirmed && !selectedTemplate ? (
            <div className="mb-4 rounded-xl border border-rose-400/25 bg-rose-950/35 px-4 py-3 text-right text-sm font-bold text-rose-200">
              برای ادامه، ابتدا یک قالب سیاست کاری انتخاب کنید.
            </div>
          ) : null}
          <div className="space-y-3">
            {SYSTEM_TEMPLATES.map((template) => {
              const selected = selectedTemplateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                    onClick={() => {
                      setSelectedTemplateId(template.id);
                      setSaveError('');
                    }}
                    className={cn(
                    'w-full rounded-xl border bg-slate-800/40 p-3.5 text-right transition-colors',
                    selected ? 'border-indigo-400 bg-indigo-500/15 shadow-[0_0_0_1px_rgba(99,102,241,0.25)]' : 'border-white/10 hover:border-white/20',
                  )}
                >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-row-reverse items-center justify-end gap-1.5 text-sm font-bold text-white">
                          <span>{template.title}</span>
                          {selected ? <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-200">انتخاب شده</span> : null}
                        </div>
                        <div className="mt-2 text-xs text-slate-400">کاربرد: {template.application}</div>
                        <div className="mt-2 text-xs text-slate-400">توضیحات: {template.description}</div>
                        <div className="mt-2 text-xs text-slate-400">تقویم کاری: {selectedCalendar?.title ?? 'ابتدا تقویم را انتخاب کنید'}</div>
                      <div className="mt-1 text-xs text-slate-400">سال کاری: {selectedCalendar?.yearLabel ?? template.year}</div>
                    </div>
                    {selected ? <Check className="mt-1 h-4 w-4 text-emerald-300" /> : null}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={save}
              disabled={!canContinue}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:opacity-60"
            >
              {saving ? 'در حال ثبت...' : 'تأیید و ادامه به مدیریت کارکنان'}
            </button>
          </div>
          {!calendarConfirmed ? (
            <div className="mt-3 text-right text-xs leading-6 text-amber-300">برای ادامه، ابتدا تقویم کاری را تأیید کنید.</div>
          ) : !selectedTemplate ? (
            <div className="mt-3 text-right text-xs leading-6 text-amber-300">برای ادامه، ابتدا یک قالب سیاست کاری انتخاب کنید.</div>
          ) : (
            <div className="mt-3 text-right text-xs leading-6 text-slate-400">این سیاست به‌عنوان سیاست اولیه سازمان ذخیره می‌شود و بعداً از بخش سیاست‌های کاری قابل ویرایش است.</div>
          )}
        </SectionShell>

        {saveError ? <div className="rounded-xl border border-rose-400/25 bg-rose-950/40 px-4 py-3 text-right text-sm font-bold text-rose-200">{saveError}</div> : null}
      </div>
    </section>
  );
}
