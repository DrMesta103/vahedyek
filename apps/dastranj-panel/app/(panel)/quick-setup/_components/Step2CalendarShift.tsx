'use client';

import { ArrowLeft, CalendarDays, Check, ChevronDown, ChevronUp, Clock3, Coffee, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { createCalendarWithShiftAction } from '../../../lib/actions';
import type { CompletedCalendarItem } from './quick-setup.types';

type SectionKey = 'calendar' | 'holiday' | 'shift';
type ShiftType = 'fixed' | 'float-day' | 'float-abs' | 'split' | 'rotate';
type RestType = 'fixed' | 'floating';

type HolidayItem = { id: string; date: string; title: string };
type RestItem = { id: string; type: RestType; start: string; end: string; duration: number; deductFromWork: boolean };

const WEEK_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
const SHIFT_OPTIONS: Array<{ id: ShiftType; label: string; hint: string }> = [
  { id: 'fixed', label: 'شیفت ثابت', hint: 'برای تیم هایی که ساعت شروع و پایان مشخص و یکسان دارند.' },
  { id: 'float-day', label: 'شیفت شناور (شروع روز)', hint: 'کارمند در بازه شروع وارد می شود و زمان موظفی را کامل می کند.' },
  { id: 'float-abs', label: 'شیفت شناور مطلق', hint: 'فقط مجموع زمان کار اهمیت دارد.' },
  { id: 'split', label: 'شیفت دو تکه', hint: 'ساعت کاری در دو بخش جدا انجام می شود.' },
  { id: 'rotate', label: 'شیفت چرخشی', hint: 'الگوی نوبت کاری بین روزها یا افراد جابه جا می شود.' },
];
const TEMPLATE_ITEMS = [
  { id: 'system-morning', title: 'شیفت صبح', description: 'مناسب تیم های اداری و پشتیبانی روزانه', startTime: '08:00', endTime: '16:30', workingDays: WEEK_DAYS.slice(0, 5) },
  { id: 'system-evening', title: 'شیفت عصر', description: 'مناسب فروشگاه ها و تیم های شیفت دوم', startTime: '15:00', endTime: '23:00', workingDays: WEEK_DAYS.slice(0, 6) },
  { id: 'system-night', title: 'شیفت شب', description: 'مناسب نگهبانی و تیم های شبانه', startTime: '22:00', endTime: '06:00', workingDays: WEEK_DAYS },
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

export default function Step2CalendarShift({
  isCompleted,
  initialCalendar,
  onComplete,
  onBack,
}: {
  isCompleted: boolean;
  initialCalendar: CompletedCalendarItem | null;
  onComplete: (summary: CompletedCalendarItem) => void;
  onBack: () => void;
}) {
  const [activeSection, setActiveSection] = useState<SectionKey>('calendar');
  const [calendarConfirmed, setCalendarConfirmed] = useState(false);
  const [holidayConfirmed, setHolidayConfirmed] = useState(false);
  const [title, setTitle] = useState(initialCalendar?.title ?? 'تقویم کاری 1405');
  const [description, setDescription] = useState(initialCalendar?.description ?? 'تقویم پایه شرکت');
  const [year, setYear] = useState(initialCalendar?.yearLabel ?? '1405');
  const [weekends, setWeekends] = useState<string[]>(['جمعه']);
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [holidayTitle, setHolidayTitle] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [shiftMode, setShiftMode] = useState<'manual' | 'template'>('manual');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [shiftType, setShiftType] = useState<ShiftType>('fixed');
  const [shiftTitle, setShiftTitle] = useState('شیفت صبح اداری');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:30');
  const [workingDays, setWorkingDays] = useState<string[]>(WEEK_DAYS.slice(0, 5));
  const [rests, setRests] = useState<RestItem[]>([{ id: 'default-rest', type: 'fixed', start: '12:00', end: '12:30', duration: 30, deductFromWork: true }]);
  const [saving, setSaving] = useState(false);

  const selectedTemplate = TEMPLATE_ITEMS.find((item) => item.id === selectedTemplateId);
  const canSave = title.trim() && year.trim() && workingDays.length > 0 && shiftTitle.trim();

  const summary = useMemo(
    () => ({
      id: initialCalendar?.id ?? '',
      title,
      yearLabel: year,
      description,
      shiftTitle,
      shiftTypeLabel: SHIFT_OPTIONS.find((item) => item.id === shiftType)?.label ?? shiftType,
      holidayCount: weekends.length + holidays.length,
    }),
    [description, holidays.length, initialCalendar?.id, shiftTitle, shiftType, title, weekends.length, year],
  );

  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const applyTemplate = (id: string) => {
    const template = TEMPLATE_ITEMS.find((item) => item.id === id);
    setSelectedTemplateId(id);
    if (!template) return;
    setShiftTitle(template.title);
    setStartTime(template.startTime);
    setEndTime(template.endTime);
    setWorkingDays(template.workingDays);
    setShiftType('fixed');
  };

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const result = await createCalendarWithShiftAction({
        title: title.trim(),
        yearLabel: year.trim(),
        startDate: `${year}/01/01`,
        endDate: `${year}/12/29`,
        weekends,
        singleHolidays: holidays,
        shiftType,
        shiftTitle: shiftTitle.trim(),
        shiftConfig: { mode: shiftMode, templateId: selectedTemplateId, startTime, endTime, workingDays, rests },
        breaks: rests,
      });
      onComplete({ ...summary, id: result.id, title: result.title, yearLabel: result.yearLabel });
    } finally {
      setSaving(false);
    }
  };

  if (isCompleted && initialCalendar) {
    return (
      <section className="rounded-2xl border border-white/10 bg-slate-800/65 p-3.5 sm:p-4">
        <div className="rounded-xl border border-white/10 bg-slate-950/45 p-4 sm:p-5">
          <div className="mx-auto w-full rounded-xl border border-white/10 bg-slate-900/70 p-4 text-right lg:max-w-[320px]">
            <div className="text-lg font-bold text-white">عنوان: {initialCalendar.title}</div>
            <div className="mt-2 text-sm text-slate-300">سال کاری: {initialCalendar.yearLabel}</div>
            <div className="mt-2 text-sm text-slate-300">شیفت: {initialCalendar.shiftTitle ?? '-'}</div>
            <div className="mt-2 text-sm text-slate-300">تعطیلات: {initialCalendar.holidayCount ?? 0} روز</div>
          </div>
          <a href="/calendars" className="mt-5 flex w-full items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500">
            برای مدیریت کامل تقویم کاری، کلیک کنید تا به فهرست تقویم ها بروید.
          </a>
        </div>
        <div className="mt-5 flex">
          <button type="button" onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-500"><ArrowLeft className="h-4 w-4" /></button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-800/65 p-3.5 sm:p-4">
      <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/45 p-4 sm:p-5">
        <SectionShell title="تقویم کاری را تعریف کنید" icon={<CalendarDays className="h-5 w-5" />} isOpen={activeSection === 'calendar'} onToggle={() => setActiveSection('calendar')}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-right"><span className="text-xs font-bold text-white">عنوان تقویم</span><input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400" /></label>
            <label className="space-y-2 text-right"><span className="text-xs font-bold text-white">سال کاری</span><input value={year} onChange={(e) => setYear(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400" /></label>
            <label className="space-y-2 text-right md:col-span-2"><span className="text-xs font-bold text-white">توضیحات</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-400" /></label>
          </div>
          <div className="mt-4 flex justify-start">
            <button type="button" onClick={() => { setCalendarConfirmed(true); setActiveSection('holiday'); }} disabled={!title.trim() || !year.trim()} className="rounded-full bg-slate-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-400 disabled:opacity-50">تایید و ادامه</button>
          </div>
        </SectionShell>

        <SectionShell title="تعطیلات و روزهای غیرکاری" icon={<Coffee className="h-5 w-5" />} isOpen={activeSection === 'holiday'} canOpen={calendarConfirmed} onToggle={() => setActiveSection('holiday')}>
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-right text-xs font-bold text-white">تعطیلات هفتگی</div>
              <div className="flex flex-wrap gap-2">{WEEK_DAYS.map((day) => <button key={day} type="button" onClick={() => setWeekends((prev) => toggle(prev, day))} className={cn('rounded-full border px-4 py-2 text-sm', weekends.includes(day) ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-white/10 bg-slate-950/50 text-slate-200')}>{weekends.includes(day) ? `${day} ✓` : day}</button>)}</div>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input value={holidayTitle} onChange={(e) => setHolidayTitle(e.target.value)} placeholder="عنوان تعطیلی" className="rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none" />
              <input value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} placeholder="تاریخ مثل 1405/01/01" className="rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none" />
              <button type="button" onClick={() => { if (!holidayTitle || !holidayDate) return; setHolidays((prev) => [...prev, { id: `${Date.now()}`, title: holidayTitle, date: holidayDate }]); setHolidayTitle(''); setHolidayDate(''); }} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"><Plus className="inline h-4 w-4" /> افزودن</button>
            </div>
            {holidays.map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-200"><button type="button" onClick={() => setHolidays((prev) => prev.filter((h) => h.id !== item.id))}><Trash2 className="h-4 w-4 text-rose-300" /></button><span>{item.title} - {item.date}</span></div>)}
          </div>
          <div className="mt-4 flex justify-start"><button type="button" onClick={() => { setHolidayConfirmed(true); setActiveSection('shift'); }} className="rounded-full bg-slate-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-400">تایید و ادامه</button></div>
        </SectionShell>

        <SectionShell title="شیفت پیش فرض تقویم" icon={<Clock3 className="h-5 w-5" />} isOpen={activeSection === 'shift'} canOpen={holidayConfirmed} onToggle={() => setActiveSection('shift')}>
          <div className="space-y-5 text-right">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setShiftMode('manual')} className={cn('rounded-full border px-4 py-2 text-sm', shiftMode === 'manual' ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-white/10 text-slate-200')}>تعریف دستی</button>
              <button type="button" onClick={() => setShiftMode('template')} className={cn('rounded-full border px-4 py-2 text-sm', shiftMode === 'template' ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-white/10 text-slate-200')}>قالب آماده</button>
            </div>
            {shiftMode === 'template' ? (
              <div className="grid gap-3 md:grid-cols-3">{TEMPLATE_ITEMS.map((item) => <button key={item.id} type="button" onClick={() => applyTemplate(item.id)} className={cn('rounded-xl border p-4 text-right', selectedTemplateId === item.id ? 'border-indigo-400 bg-indigo-500/15' : 'border-white/10 bg-slate-800/40')}><div className="font-bold text-white">{item.title}</div><div className="mt-2 text-xs text-slate-400">{item.description}</div></button>)}</div>
            ) : (
              <div className="flex flex-wrap gap-2">{SHIFT_OPTIONS.map((option) => <button key={option.id} type="button" title={option.hint} onClick={() => setShiftType(option.id)} className={cn('rounded-full border px-4 py-2 text-sm', shiftType === option.id ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-white/10 bg-slate-950/50 text-slate-200')}>{shiftType === option.id ? `${option.label} ✓` : option.label}</button>)}</div>
            )}
            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2"><span className="text-xs font-bold text-white">عنوان شیفت</span><input value={shiftTitle} onChange={(e) => setShiftTitle(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none" /></label>
              <label className="space-y-2"><span className="text-xs font-bold text-white">شروع</span><input value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none" /></label>
              <label className="space-y-2"><span className="text-xs font-bold text-white">پایان</span><input value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none" /></label>
            </div>
            <div><div className="mb-2 text-xs font-bold text-white">روزهای کاری</div><div className="flex flex-wrap gap-2">{WEEK_DAYS.map((day) => <button key={day} type="button" onClick={() => setWorkingDays((prev) => toggle(prev, day))} className={cn('rounded-full border px-4 py-2 text-sm', workingDays.includes(day) ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-white/10 bg-slate-950/50 text-slate-200')}>{workingDays.includes(day) ? `${day} ✓` : day}</button>)}</div></div>
            <div className="rounded-[22px] border border-white/10 p-4">
              <div className="mb-3 flex items-center justify-between"><button type="button" onClick={() => setRests((prev) => [...prev, { id: `${Date.now()}`, type: 'fixed', start: '12:00', end: '12:30', duration: 30, deductFromWork: true }])} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-200">افزودن استراحت</button><div className="font-bold text-white">استراحت ها</div></div>
              {rests.map((rest) => <div key={rest.id} className="mb-2 grid gap-2 rounded-xl bg-slate-900/50 p-3 md:grid-cols-5"><select value={rest.type} onChange={(e) => setRests((prev) => prev.map((r) => r.id === rest.id ? { ...r, type: e.target.value as RestType } : r))} className="rounded-lg bg-slate-800 px-2 py-2 text-white"><option value="fixed">ثابت</option><option value="floating">شناور</option></select><input value={rest.start} onChange={(e) => setRests((prev) => prev.map((r) => r.id === rest.id ? { ...r, start: e.target.value } : r))} className="rounded-lg bg-slate-800 px-2 py-2 text-white" /><input value={rest.end} onChange={(e) => setRests((prev) => prev.map((r) => r.id === rest.id ? { ...r, end: e.target.value } : r))} className="rounded-lg bg-slate-800 px-2 py-2 text-white" /><input value={rest.duration} onChange={(e) => setRests((prev) => prev.map((r) => r.id === rest.id ? { ...r, duration: Number(e.target.value) || 0 } : r))} className="rounded-lg bg-slate-800 px-2 py-2 text-white" /><button type="button" onClick={() => setRests((prev) => prev.filter((r) => r.id !== rest.id))} className="text-rose-300">حذف</button></div>)}
            </div>
            <div className="flex justify-start"><button type="button" onClick={save} disabled={!canSave || saving} className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">{saving ? 'در حال ثبت...' : 'تایید و ادامه'} <Check className="h-4 w-4" /></button></div>
          </div>
        </SectionShell>
      </div>
    </section>
  );
}
