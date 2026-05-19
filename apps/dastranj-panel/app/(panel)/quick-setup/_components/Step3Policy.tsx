'use client';

import { ArrowLeft, BriefcaseBusiness, CalendarDays, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo, useState } from 'react';
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

function SectionShell({
  title,
  icon,
  isOpen,
  canOpen = true,
  onToggle,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  canOpen?: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/25">
      <div className="flex flex-row-reverse items-center justify-between gap-4 px-4 py-4 text-right sm:px-5">
        <button type="button" onClick={onToggle} disabled={!canOpen} className={cn('inline-flex flex-row-reverse items-center gap-2 text-xs text-slate-400 transition-colors', canOpen ? 'hover:text-white' : 'cursor-not-allowed opacity-40')}>
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
  policy,
  onPolicyChange,
  onComplete,
  onBack,
}: {
  isCompleted: boolean;
  calendar: CompletedCalendarItem | null;
  policy: QuickPolicySummary | null;
  onPolicyChange: (policy: QuickPolicySummary | null) => void;
  onComplete: (policy: QuickPolicySummary) => void;
  onBack: () => void;
}) {
  const [activeSection, setActiveSection] = useState<SectionKey>('calendar');
  const [selectedCalendarId, setSelectedCalendarId] = useState(calendar?.id ?? '');
  const [calendarConfirmed, setCalendarConfirmed] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [saving, setSaving] = useState(false);
  const selectedTemplate = useMemo(() => SYSTEM_TEMPLATES.find((item) => item.id === selectedTemplateId) ?? null, [selectedTemplateId]);

  const save = async () => {
    if (!calendar || !selectedTemplate) return;
    setSaving(true);
    try {
      const result = await createPolicyFromQuickSetupAction({
        calendarId: calendar.id,
        policyTemplateId: selectedTemplate.id,
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        templateTitle: selectedTemplate.title,
        year: selectedTemplate.year,
      });
      const nextPolicy = {
        id: result.id,
        title: result.title,
        description: result.description,
        calendarId: calendar.id,
        calendarTitle: calendar.title,
        templateId: selectedTemplate.id,
        templateTitle: selectedTemplate.title,
        year: selectedTemplate.year,
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
        <div className="mt-5 flex"><button type="button" onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-500"><ArrowLeft className="h-4 w-4" /></button></div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-800/65 p-3.5 sm:p-4">
      <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/45 p-4 sm:p-5">
        <SectionShell title="تقویم کاری سیاست را انتخاب کنید" icon={<CalendarDays className="h-5 w-5" />} isOpen={activeSection === 'calendar'} onToggle={() => setActiveSection('calendar')}>
          {calendar ? (
            <>
              <button type="button" onClick={() => setSelectedCalendarId(calendar.id)} className={cn('w-full rounded-xl border p-4 text-right transition-colors', selectedCalendarId === calendar.id ? 'border-indigo-400 bg-indigo-500/15' : 'border-white/10 bg-slate-800/40 hover:border-white/20')}>
                <div className="text-base font-bold text-white">{calendar.title}</div>
                <div className="mt-2 text-sm text-slate-300">{calendar.description ?? 'توضیحات ثبت نشده است'}</div>
                <div className="mt-2 text-sm text-slate-300">سال کاری: {calendar.yearLabel}</div>
              </button>
              <div className="mt-4 flex justify-start">
                <button type="button" onClick={() => { setCalendarConfirmed(true); setActiveSection('template'); }} disabled={selectedCalendarId !== calendar.id} className="inline-flex items-center gap-2 rounded-full bg-slate-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-400 disabled:cursor-not-allowed disabled:opacity-50">
                  تایید و ادامه
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-white/15 bg-slate-900/40 p-4 text-sm text-amber-300">ابتدا در استپر قبلی یک تقویم کاری ثبت کنید.</div>
          )}
        </SectionShell>

        <SectionShell title="قالب سیاست کاری را انتخاب کنید" icon={<BriefcaseBusiness className="h-5 w-5" />} isOpen={activeSection === 'template'} canOpen={calendarConfirmed} onToggle={() => setActiveSection('template')}>
          <div className="space-y-3">
            {SYSTEM_TEMPLATES.map((template) => {
              const selected = selectedTemplateId === template.id;
              return (
                <button key={template.id} type="button" onClick={() => setSelectedTemplateId(template.id)} className={cn('w-full rounded-xl border bg-slate-800/40 p-3.5 text-right transition-colors', selected ? 'border-indigo-400 bg-indigo-500/15' : 'border-white/10 hover:border-white/20')}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">عنوان: {template.title}</div>
                      <div className="mt-1 text-xs text-slate-400">توضیحات: {template.description}</div>
                      <div className="mt-2 text-xs text-slate-400">سال کاری: {template.year}</div>
                    </div>
                    {selected ? <Check className="mt-1 h-4 w-4 text-emerald-300" /> : null}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex justify-start">
            <button type="button" onClick={save} disabled={!calendarConfirmed || !selectedTemplate || saving} className="inline-flex items-center gap-2 rounded-full bg-slate-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-400 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? 'در حال ثبت...' : 'تایید و ادامه'}
            </button>
          </div>
        </SectionShell>
      </div>
    </section>
  );
}
