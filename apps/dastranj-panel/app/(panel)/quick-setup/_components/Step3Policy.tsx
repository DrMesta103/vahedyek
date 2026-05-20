'use client';

import { ArrowLeft, BriefcaseBusiness, CalendarDays, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPolicyFromQuickSetupAction } from '../../../lib/actions';
import type { CompletedCalendarItem, QuickPolicySummary } from './quick-setup.types';

type PolicyTemplate = { id: string; title: string; description: string; year: string };
type SectionKey = 'calendar' | 'template';

const SYSTEM_TEMPLATES: PolicyTemplate[] = [
  { id: 'office-1404', title: 'سیاست کاری اداره کار سال 1404', description: 'قالب مناسب تیم های اداری و ستادی', year: '1404' },
  { id: 'restaurant-1404', title: 'سیاست کاری رستورانی سال 1404', description: 'قالب مناسب کسب و کارهای شیفتی و خدماتی', year: '1404' },
  { id: 'retail-1404', title: 'سیاست کاری فروشگاهی سال 1404', description: 'قالب مناسب فروشگاه و شعب چندشیفته', year: '1404' },
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
      <span className="pointer-events-none absolute right-0 top-8 z-30 hidden w-72 rounded-2xl border border-white/10 bg-slate-900 p-3 text-right text-xs leading-6 text-slate-200 shadow-2xl group-hover:block">
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
    <section className="rounded-2xl border border-white/10 bg-slate-950/25">
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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-200">{icon}</div>
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

  const selectedCalendar = useMemo(
    () => calendarOptions.find((item) => item.id === selectedCalendarId) ?? null,
    [calendarOptions, selectedCalendarId],
  );
  const selectedTemplate = useMemo(() => SYSTEM_TEMPLATES.find((item) => item.id === selectedTemplateId) ?? null, [selectedTemplateId]);

  useEffect(() => {
    if (!calendarOptions.length) return;
    const stillAvailable = calendarOptions.some((item) => item.id === selectedCalendarId);
    if (!selectedCalendarId || !stillAvailable) {
      setSelectedCalendarId(calendarOptions[0].id);
    }
  }, [calendarOptions, selectedCalendarId]);

  const save = async () => {
    if (!selectedCalendar || !selectedTemplate) return;
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
        templateId: selectedTemplate.id,
        templateTitle: selectedTemplate.title,
        year: selectedCalendar.yearLabel,
      };
      onPolicyChange(nextPolicy);
      onComplete(nextPolicy);
    } finally {
      setSaving(false);
    }
  };

  if (isCompleted && policy) {
    return (
      <section className="rounded-2xl border border-white/10 bg-slate-800/65 p-3.5 sm:p-4">
        <div className="rounded-xl border border-white/10 bg-slate-950/45 p-4 sm:p-5">
          <div className="mx-auto w-full rounded-xl border border-white/10 bg-slate-900/70 p-4 text-right lg:max-w-[300px]">
            <div className="text-lg font-bold text-white">عنوان: {policy.title}</div>
            <div className="mt-3 text-sm text-slate-300">توضیحات: {policy.description}</div>
            <div className="mt-2 text-sm text-slate-300">تقویم کاری: {policy.calendarTitle}</div>
            <div className="mt-2 text-sm text-slate-300">سال کاری: {policy.year}</div>
          </div>
          <a href="/policies" className="mt-5 flex w-full items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500">
            برای مدیریت کامل سیاست های کاری، کلیک کنید تا به فهرست سیاست های کاری بروید.
          </a>
        </div>
        <div className="mt-5 flex">
          <button type="button" onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-500">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-800/65 p-3.5 sm:p-4" dir="rtl">
      <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/45 p-4 sm:p-5">
        <SectionShell title="تقویم کاری سیاست را انتخاب کنید" icon={<CalendarDays className="h-5 w-5" />} isOpen={activeSection === 'calendar'} onToggle={() => setActiveSection('calendar')}>
          {calendarOptions.length > 0 ? (
            <>
              <div className="max-h-[360px] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/25 p-3">
                <div className="grid gap-3 md:grid-cols-2">
                  {calendarOptions.map((item) => {
                    const selected = selectedCalendarId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedCalendarId(item.id)}
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
                            {selected ? <Check className="h-4 w-4 text-emerald-300" /> : null}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
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
                  تایید و ادامه
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-white/15 bg-slate-900/40 p-4 text-sm text-amber-300">ابتدا در استپر قبلی یک تقویم کاری ثبت کنید.</div>
          )}
        </SectionShell>

        <SectionShell
          title="قالب سیاست کاری را انتخاب کنید"
          icon={<BriefcaseBusiness className="h-5 w-5" />}
          isOpen={activeSection === 'template'}
          canOpen={calendarConfirmed}
          onToggle={() => setActiveSection('template')}
        >
          <div className="mb-4 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-3 text-right text-sm leading-7 text-slate-200">
            <span className="inline-flex flex-row-reverse items-center gap-2 font-bold text-white">
              سیاست کاری
              <FieldTooltip text="سیاست کاری مجموعه تنظیمات پیش‌فرض حضور، مرخصی، اضافه‌کاری و قواعد اجرایی سازمان است. این قالب نقطه شروع است و بعدا می‌توان آن را مطابق نیاز هر سازمان ویرایش کرد." />
            </span>
            <div className="mt-2 text-slate-300">قالب انتخابی به صورت پیش‌فرض تنظیم می‌شود و بعدا می‌توانید آن را با قواعد سازمان خود تطبیق دهید.</div>
          </div>
          <div className="space-y-3">
            {SYSTEM_TEMPLATES.map((template) => {
              const selected = selectedTemplateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={cn(
                    'w-full rounded-xl border bg-slate-800/40 p-3.5 text-right transition-colors',
                    selected ? 'border-indigo-400 bg-indigo-500/15 shadow-[0_0_0_1px_rgba(99,102,241,0.25)]' : 'border-white/10 hover:border-white/20',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-row-reverse items-center justify-end gap-1.5 text-sm font-bold text-white">
                        <span>عنوان: {template.title}</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-400">
                        <span>توضیحات: {template.description}</span>
                      </div>
                      <div className="mt-2 text-xs text-slate-400">سال کاری: {selectedCalendar?.yearLabel ?? template.year}</div>
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
              disabled={!calendarConfirmed || !selectedTemplate || !selectedCalendar || saving}
              className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:opacity-60"
            >
              {saving ? 'در حال ثبت...' : 'تایید و ادامه'}
            </button>
          </div>
        </SectionShell>
      </div>
    </section>
  );
}
