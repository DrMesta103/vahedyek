'use client';

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Clock3,
  Coffee,
  Plus,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { addCalendarShiftAction } from '../../../../../lib/actions';
import { normalizePersianDateInput } from '../../../../../lib/calendar-events';
import type { ShiftTemplatePickerItem } from '../../../../../lib/shift-template-picker';
import type { CalendarShiftDayContext, CalendarShiftWizardCalendar } from './types';

export type { CalendarShiftDayContext, CalendarShiftWizardCalendar } from './types';

type SectionKey = 'calendar' | 'holiday' | 'shift';
type ShiftType = 'fixed' | 'float-day' | 'float-abs' | 'split' | 'rotate';
type ShiftMode = 'manual' | 'template';
type RestType = 'fixed' | 'floating';
type RestUnit = 'minutes' | 'hours';
type RotateKind = 'morning' | 'evening' | 'night' | 'off';

type HolidayItem = { id: string; date: string; title: string };
type RestItem = {
  id: string;
  type: RestType;
  start: string;
  end: string;
  endsNextDay: boolean;
  duration: number;
  unit: RestUnit;
  deductFromWork: boolean;
};
type WorkRange = { start: string; end: string; nextDay: boolean };
type RotateSegment = {
  id: string;
  kind: RotateKind;
  repeat: number;
  start: string;
  end: string;
  nextDay: boolean;
  rests: RestItem[];
};

const WEEK_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
const DEFAULT_WORKING_DAYS = WEEK_DAYS.slice(1, 6);

const SHIFT_OPTIONS: Array<{
  id: ShiftType;
  label: string;
  hintTitle: string;
  hintDescription: string;
  hintExample: string;
}> = [
  {
    id: 'fixed',
    label: 'شیفت ثابت',
    hintTitle: 'مناسب برای برنامه های تکرارشونده',
    hintDescription: 'برای تیم هایی که ساعت شروع و پایان مشخص و یکسان دارند مناسب است.',
    hintExample: 'مثال: کارکنان اداری هر روز از 08:00 تا 16:30.',
  },
  {
    id: 'float-day',
    label: 'شیفت شناور (شروع روز)',
    hintTitle: 'مناسب برای ورود منعطف',
    hintDescription: 'وقتی فقط بازه شروع در روز مهم است و کارمند می تواند در آن بازه ورود بزند.',
    hintExample: 'مثال: ورود بین 07:00 تا 09:00 و تکمیل 8 ساعت کار.',
  },
  {
    id: 'float-abs',
    label: 'شیفت شناور مطلق',
    hintTitle: 'مناسب برای برنامه های کاملا منعطف',
    hintDescription: 'برای تیم هایی که ساعت ثابت ندارند و فقط مجموع زمان کار اهمیت دارد.',
    hintExample: 'مثال: کارشناس پشتیبانی که در هر ساعتی از روز 6 ساعت کار می کند.',
  },
  {
    id: 'split',
    label: 'شیفت دو تکه',
    hintTitle: 'مناسب برای شیفت های چندبازه ای',
    hintDescription: 'وقتی ساعت کاری در دو بخش جدا از هم انجام می شود استفاده می شود.',
    hintExample: 'مثال: 08:00 تا 12:00 و 16:00 تا 20:00 برای فروشگاه.',
  },
  {
    id: 'rotate',
    label: 'شیفت چرخشی',
    hintTitle: 'مناسب برای تیم های نوبتی',
    hintDescription: 'برای مجموعه هایی که الگوی شیفت بین افراد یا روزها جابه جا می شود کاربرد دارد.',
    hintExample: 'مثال: سه روز صبح، سه روز عصر، سه روز شب.',
  },
];

const TEMPLATE_ITEMS = [
  {
    id: 'system-morning',
    title: 'شیفت صبح',
    description: 'مناسب برای تیم های اداری و پشتیبانی روزانه',
    startTime: '08:00',
    endTime: '16:30',
    nextDay: false,
    workingDays: DEFAULT_WORKING_DAYS,
    rests: [
      { id: 'template-fixed', type: 'fixed' as RestType, start: '12:00', end: '12:30', endsNextDay: false, duration: 30, unit: 'minutes' as RestUnit, deductFromWork: true },
      { id: 'template-floating', type: 'floating' as RestType, start: '00:00', end: '00:00', endsNextDay: false, duration: 30, unit: 'minutes' as RestUnit, deductFromWork: false },
    ],
  },
  {
    id: 'system-evening',
    title: 'شیفت عصر',
    description: 'مناسب برای فروشگاه ها و تیم های شیفت دوم',
    startTime: '15:00',
    endTime: '23:00',
    nextDay: false,
    workingDays: WEEK_DAYS.slice(0, 6),
    rests: [{ id: 'template-evening-rest', type: 'fixed' as RestType, start: '19:00', end: '19:30', endsNextDay: false, duration: 30, unit: 'minutes' as RestUnit, deductFromWork: true }],
  },
  {
    id: 'system-night',
    title: 'شیفت شب',
    description: 'مناسب برای نگهبانی، مانیتورینگ و تیم های شبانه',
    startTime: '22:00',
    endTime: '06:00',
    nextDay: true,
    workingDays: WEEK_DAYS,
    rests: [{ id: 'template-night-rest', type: 'floating' as RestType, start: '00:00', end: '00:00', endsNextDay: false, duration: 45, unit: 'minutes' as RestUnit, deductFromWork: false }],
  },
];

const ROTATE_KIND_LABELS: Record<RotateKind, string> = { morning: 'صبح', evening: 'عصر', night: 'شب', off: 'آف' };
const ROTATE_DEFAULTS: Record<Exclude<RotateKind, 'off'>, { start: string; end: string; nextDay: boolean }> = {
  morning: { start: '06:00', end: '14:00', nextDay: false },
  evening: { start: '14:00', end: '22:00', nextDay: false },
  night: { start: '22:00', end: '06:00', nextDay: true },
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function stringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : fallback;
}

function parseTime(value: string) {
  const [hours = 0, minutes = 0] = value.split(':').map(Number);
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0);
}

function minutesToTime(value: number) {
  const safe = Math.max(Math.round(value), 0);
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatDuration(minutes: number) {
  const normalized = Math.max(Math.round(minutes), 0);
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${hours}:${String(mins).padStart(2, '0')}`;
}

function restMinutes(item: RestItem) {
  if (!item.deductFromWork) return 0;
  if (item.type === 'fixed') {
    const start = parseTime(item.start);
    const end = parseTime(item.end) + (item.endsNextDay ? 24 * 60 : 0);
    return Math.max(end - start, 0);
  }
  return item.unit === 'hours' ? item.duration * 60 : item.duration;
}

function shiftDuration(start: string, end: string, nextDay: boolean, rests: RestItem[]) {
  const startMinutes = parseTime(start);
  const endMinutes = parseTime(end);
  const base = endMinutes - startMinutes + (nextDay || endMinutes <= startMinutes ? 24 * 60 : 0);
  return Math.max(base - rests.reduce((sum, item) => sum + restMinutes(item), 0), 0);
}

function rangeEndMinutes(range: WorkRange) {
  const start = parseTime(range.start);
  const end = parseTime(range.end);
  return end + (range.nextDay || end <= start ? 24 * 60 : 0);
}

function normalizeToRangeDay(value: string, range: WorkRange) {
  const start = parseTime(range.start);
  const end = rangeEndMinutes(range);
  const minutes = parseTime(value);
  return end > 24 * 60 && minutes < start ? minutes + 24 * 60 : minutes;
}

function fixedRestError(item: RestItem, range?: WorkRange) {
  if (item.type !== 'fixed' || !range) return '';
  const workStart = parseTime(range.start);
  const workEnd = rangeEndMinutes(range);
  const restStart = normalizeToRangeDay(item.start, range);
  let restEnd = parseTime(item.end) + (item.endsNextDay ? 24 * 60 : 0);
  if (workEnd > 24 * 60 && restEnd < workStart) restEnd += 24 * 60;

  if (restEnd <= restStart) return 'پایان استراحت باید بعد از شروع استراحت باشد.';
  if (restStart < workStart || restEnd > workEnd) return 'استراحت ثابت باید داخل بازه کاری همین شیفت باشد. زمان استراحت را تغییر دهید.';
  return '';
}

function hasFixedRestError(items: RestItem[], range?: WorkRange) {
  return items.some((item) => Boolean(fixedRestError(item, range)));
}

function createRest(type: RestType = 'fixed'): RestItem {
  return {
    id: `${Date.now()}-${Math.random()}`,
    type,
    start: '12:00',
    end: '12:30',
    endsNextDay: false,
    duration: 30,
    unit: 'minutes',
    deductFromWork: true,
  };
}

function normalizeRests(value: unknown, fallback: RestItem[] = [createRest('fixed')]): RestItem[] {
  if (!Array.isArray(value) || value.length === 0) return fallback;
  return value.map((item, index) => {
    const rest = asObject(item);
    return {
      id: String(rest.id ?? `rest-${index + 1}`),
      type: rest.type === 'floating' ? 'floating' : 'fixed',
      start: String(rest.start ?? '12:00'),
      end: String(rest.end ?? '12:30'),
      endsNextDay: Boolean(rest.endsNextDay ?? false),
      duration: Number(rest.duration ?? 30) || 0,
      unit: rest.unit === 'hours' ? 'hours' : 'minutes',
      deductFromWork: rest.deductFromWork !== false,
    };
  });
}

function createSegment(): RotateSegment {
  return {
    id: `segment-${Date.now()}-${Math.random()}`,
    kind: 'morning',
    repeat: 2,
    start: '06:00',
    end: '14:00',
    nextDay: false,
    rests: [],
  };
}

function normalizeSegments(value: unknown): RotateSegment[] {
  if (!Array.isArray(value) || value.length === 0) return [createSegment()];
  return value.map((item, index) => {
    const segment = asObject(item);
    const kind = ['morning', 'evening', 'night', 'off'].includes(String(segment.kind)) ? (segment.kind as RotateKind) : 'morning';
    return {
      id: String(segment.id ?? `segment-${index + 1}`),
      kind,
      repeat: Math.max(1, Number(segment.repeat ?? 2) || 1),
      start: String(segment.start ?? (kind !== 'off' ? ROTATE_DEFAULTS[kind].start : '')),
      end: String(segment.end ?? (kind !== 'off' ? ROTATE_DEFAULTS[kind].end : '')),
      nextDay: Boolean(segment.nextDay ?? (kind !== 'off' ? ROTATE_DEFAULTS[kind].nextDay : false)),
      rests: normalizeRests(segment.rests, []),
    };
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

function DetailToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-2 text-sm font-bold transition-colors',
        active ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-white/10 bg-slate-950/50 text-slate-200 hover:border-white/20',
      )}
    >
      {children}
    </button>
  );
}

function ShiftHelpChip({
  option,
  active,
  onClick,
}: {
  option: (typeof SHIFT_OPTIONS)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div className="group relative inline-flex flex-row-reverse items-center gap-1">
      <DetailToggle active={active} onClick={onClick}>
        {active ? `${option.label} ✓` : option.label}
      </DetailToggle>
      <button
        type="button"
        aria-label={`راهنمای ${option.label}`}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-slate-950/50 text-slate-300 transition-colors hover:border-indigo-400 hover:text-white"
      >
        <CircleHelp className="h-4 w-4" />
      </button>
      <div className="pointer-events-none absolute right-0 top-10 z-20 hidden w-72 rounded-xl border border-white/10 bg-slate-900 p-4 text-right text-slate-100 shadow-2xl group-hover:block">
        <div className="text-sm font-black text-white">{option.hintTitle}</div>
        <div className="mt-2 text-sm leading-6 text-slate-300">{option.hintDescription}</div>
        <div className="mt-2 rounded-xl bg-slate-800 px-3 py-2 text-xs leading-5 text-indigo-200">{option.hintExample}</div>
      </div>
    </div>
  );
}

function FieldTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button type="button" className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-slate-950/50 text-slate-300">
        <CircleHelp className="h-3.5 w-3.5" />
      </button>
      <span className="pointer-events-none absolute right-0 top-8 z-30 hidden w-72 rounded-xl border border-white/10 bg-slate-900 p-3 text-right text-xs leading-6 text-slate-200 shadow-2xl group-hover:block">
        {text}
      </span>
    </span>
  );
}

function TimeField({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return (
    <label className="space-y-2 text-right">
      <span className="flex flex-row-reverse items-center justify-end gap-2 text-sm font-bold text-slate-300">
        <span>{label}</span>
        {hint ? <FieldTooltip text={hint} /> : null}
      </span>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-right text-sm font-bold text-white outline-none transition-colors focus:border-indigo-400"
      />
    </label>
  );
}

function InlineToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex w-fit cursor-pointer flex-row-reverse items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-right transition-colors hover:border-indigo-400/40">
      <span className="whitespace-nowrap text-sm font-bold text-slate-200">{label}</span>
      <span className={cn('relative h-6 w-9 rounded-full transition-colors', checked ? 'bg-indigo-500' : 'bg-slate-700')}>
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
        <span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white transition-all', checked ? 'right-6' : 'right-1')} />
      </span>
    </label>
  );
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <InlineToggle label={label} checked={checked} onChange={onChange} />;
}

function DurationCard({ minutes }: { minutes: number }) {
  return (
    <div className={cn('rounded-[18px] px-5 py-4 text-right', minutes > 24 * 60 ? 'bg-rose-950/70' : 'bg-indigo-950/70')}>
      <div className="text-sm text-slate-300">مدت شیفت</div>
      <div className={cn('mt-2 text-5xl font-black', minutes > 24 * 60 ? 'text-rose-400' : 'text-indigo-400')}>{formatDuration(minutes)}</div>
      {minutes > 24 * 60 ? <div className="mt-1 text-xs text-rose-300">شیفت نمی تواند بیشتر از 24 ساعت باشد</div> : null}
    </div>
  );
}

function TitleCard({ title, setTitle }: { title: string; setTitle: (value: string) => void }) {
  return (
    <div className="rounded-[22px] border border-white/10 p-5">
      <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500 text-indigo-300">i</div>
        <div className="text-xl font-black text-white">اطلاعات پایه شیفت</div>
      </div>
      <label className="mt-6 block space-y-2 text-right">
        <span className="text-sm font-bold text-white">
          عنوان شیفت <span className="text-rose-400">*</span>
        </span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-right text-sm text-white outline-none transition-colors focus:border-indigo-400"
        />
      </label>
    </div>
  );
}

function ModeSwitch({ mode, setMode, noTemplateMessage }: { mode: ShiftMode; setMode: (mode: ShiftMode) => void; noTemplateMessage?: boolean }) {
  return (
    <>
      <div className="mt-4 rounded-full bg-slate-950/80 p-1" dir="rtl">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={cn('rounded-full px-4 py-3 text-sm font-bold transition-colors', mode === 'manual' ? 'bg-slate-700 text-white' : 'text-slate-400')}
          >
            تعریف دستی
          </button>
          <button
            type="button"
            onClick={() => setMode('template')}
            className={cn('rounded-full px-4 py-3 text-sm font-bold transition-colors', mode === 'template' ? 'bg-slate-700 text-white' : 'text-slate-400')}
          >
            انتخاب از قالب ها
          </button>
        </div>
      </div>
      {noTemplateMessage && mode === 'template' ? <div className="mt-4 text-right text-sm text-slate-400">قالبی برای این نوع شیفت ثبت نشده است</div> : null}
    </>
  );
}

function WeekDaysEditor({ days, onToggle }: { days: string[]; onToggle: (day: string) => void }) {
  return (
    <div className="space-y-3 text-right">
      <div className="flex flex-row-reverse items-center justify-end gap-2 text-xl font-black text-white">
        <span>روزهای هفته</span>
        <CalendarDays className="h-5 w-5 text-slate-300" />
      </div>
      <div className="flex flex-wrap justify-start gap-2">
        {[...WEEK_DAYS].reverse().map((day) => (
          <DetailToggle key={day} active={days.includes(day)} onClick={() => onToggle(day)}>
            {days.includes(day) ? `${day} ✓` : day}
          </DetailToggle>
        ))}
      </div>
      <div className="text-sm text-slate-400">روزهای غیرفعال شده در تقویم فعلی شما تعطیل هستند.</div>
    </div>
  );
}

function LockedDayField({ dayContext }: { dayContext: CalendarShiftDayContext }) {
  return (
    <div className="calendar-shift-locked-day text-right">
      <div className="flex flex-row-reverse items-center justify-end gap-2 text-base font-black text-white">
        <span>تاریخ شیفت</span>
        <CalendarDays className="h-5 w-5 text-slate-300" />
      </div>
      <div className="calendar-shift-locked-day-value">
        <strong>{dayContext.date}</strong>
      </div>
      <p className="calendar-shift-locked-day-hint">تاریخ ثابت است؛ عنوان، ساعات، استراحت و سایر جزئیات شیفت مانند عملیات گروهی قابل تنظیم است.</p>
    </div>
  );
}

function BreakTypeSelect({
  value,
  onChange,
  floatingOnly,
}: {
  value: RestType;
  onChange: (value: RestType) => void;
  floatingOnly: boolean;
}) {
  if (floatingOnly) {
    return (
      <div className="rounded-xl border border-slate-600 bg-slate-700/40 px-4 py-3 text-right text-sm font-bold text-slate-200">
        شناور
      </div>
    );
  }

  return (
    <label className="block space-y-2 text-right">
      <span className="text-xs font-bold text-slate-400">نوع استراحت</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as RestType)}
        className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-right text-sm font-bold text-white [color-scheme:dark] outline-none transition-colors focus:border-indigo-400 [&>option]:bg-slate-900 [&>option]:text-white"
      >
        <option value="fixed">بازه ثابت</option>
        <option value="floating">شناور</option>
      </select>
    </label>
  );
}

function DeductToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return <InlineToggle label="کسر از ساعات کاری" checked={checked} onChange={onChange} />;
}

function BreakEditor({
  items,
  onChange,
  floatingOnly = false,
  workRange,
  allowFixedRestEndsNextDay = false,
}: {
  items: RestItem[];
  onChange: (items: RestItem[]) => void;
  floatingOnly?: boolean;
  workRange?: WorkRange;
  allowFixedRestEndsNextDay?: boolean;
}) {
  const updateItem = (id: string, patch: Partial<RestItem>) => onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  return (
    <div className="space-y-3 rounded-[22px] border border-white/10 p-4 text-right">
      <div dir="ltr" className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onChange([...items, createRest(floatingOnly ? 'floating' : 'fixed')])}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-500"
        >
          <Plus className="h-5 w-5" />
        </button>
        <div dir="rtl" className="flex flex-row-reverse items-center gap-2 text-xl font-black text-white">
          <span>استراحت ها</span>
          <Coffee className="h-5 w-5 text-slate-300" />
        </div>
      </div>

      {items.map((item) => (
        <div key={item.id} className="space-y-4 rounded-[18px] border border-white/10 bg-slate-800/45 p-4">
          {(() => {
            const error = fixedRestError(item, workRange);
            return error ? <div className="rounded-xl border border-rose-400/25 bg-rose-950/40 px-3 py-2 text-right text-xs font-bold leading-6 text-rose-200">{error}</div> : null;
          })()}
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <BreakTypeSelect value={item.type} onChange={(value) => updateItem(item.id, { type: value })} floatingOnly={floatingOnly} />
            <button
              type="button"
              onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-indigo-300 transition-colors hover:border-rose-400/40 hover:text-rose-300 md:mt-6"
              aria-label="حذف استراحت"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          {item.type === 'fixed' && !floatingOnly ? (
            <div className="grid items-start gap-3 md:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <TimeField label="شروع استراحت" value={item.start} onChange={(value) => updateItem(item.id, { start: value })} />
                <div className="flex justify-start">
                  <DeductToggle checked={item.deductFromWork} onChange={(checked) => updateItem(item.id, { deductFromWork: checked })} />
                </div>
              </div>
              <div className="min-w-0 space-y-2">
                <TimeField label="پایان استراحت" value={item.end} onChange={(value) => updateItem(item.id, { end: value })} />
                {allowFixedRestEndsNextDay ? (
                  <div className="flex justify-end">
                    <CheckboxField label="پایان در روز بعد" checked={item.endsNextDay} onChange={(checked) => updateItem(item.id, { endsNextDay: checked })} />
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-right">
              <div className="flex flex-row-reverse flex-wrap justify-end gap-2">
                {(['minutes', 'hours'] as RestUnit[]).map((unit) => (
                  <DetailToggle key={unit} active={item.unit === unit} onClick={() => updateItem(item.id, { unit })}>
                    {unit === 'minutes' ? 'دقیقه' : 'ساعت'}
                  </DetailToggle>
                ))}
              </div>
              <label className="block space-y-2 text-right">
                <span className="text-sm font-bold text-slate-300">مدت ({item.unit === 'minutes' ? 'دقیقه' : 'ساعت'})</span>
                <input
                  type="number"
                  min={0}
                  value={item.duration}
                  onChange={(event) => updateItem(item.id, { duration: Number(event.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-600 bg-slate-700/40 px-4 py-3 text-right text-sm font-bold text-white outline-none"
                />
              </label>
              <div className="flex justify-start">
                <DeductToggle checked={item.deductFromWork} onChange={(checked) => updateItem(item.id, { deductFromWork: checked })} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export type ShiftWizardSavePayload = {
  shiftType: ShiftType;
  shiftTitle: string;
  shiftConfig: Record<string, unknown>;
  description?: string;
};

export type CalendarShiftWizardProps = {
  calendar: CalendarShiftWizardCalendar;
  initialShiftType: ShiftType;
  dayContext?: CalendarShiftDayContext;
  persistedTemplates?: ShiftTemplatePickerItem[];
  hideTypePicker?: boolean;
  compact?: boolean;
  purpose?: 'calendar' | 'template';
  enableBuiltinTemplatePicker?: boolean;
  submitLabel?: string;
  initialDescription?: string;
  onSaveShift?: (payload: ShiftWizardSavePayload) => Promise<void>;
  onSaved: () => void;
  onCancel: () => void;
};

export function CalendarShiftWizard({
  calendar,
  initialShiftType,
  dayContext,
  persistedTemplates = [],
  hideTypePicker = true,
  compact = false,
  purpose = 'calendar',
  enableBuiltinTemplatePicker = true,
  submitLabel,
  initialDescription = '',
  onSaveShift,
  onSaved,
  onCancel,
}: CalendarShiftWizardProps) {
  const isTemplatePurpose = purpose === 'template';
  const baseShiftConfig: Record<string, unknown> = {};
  const defaultWorkingDaysForContext = dayContext ? [] : DEFAULT_WORKING_DAYS;
  const singleDayDate = dayContext ? normalizePersianDateInput(dayContext.date) : null;
  const fixedShift = asObject(baseShiftConfig.fixedShift);
  const floatDayConfig = asObject(baseShiftConfig.floatingShiftStartOfDay);
  const floatAbsConfig = asObject(baseShiftConfig.absoluteFloatingShift);
  const splitConfig = asObject(baseShiftConfig.splitShift);

  const [holidayConfirmed] = useState(true);
  const [draftCalendarId] = useState(calendar.id);
  const [title] = useState(calendar.title);
  const [description] = useState(calendar.description ?? '');
  const [year] = useState(calendar.yearLabel);
  const [weekends] = useState<string[]>(calendar.weekends);
  const [holidays] = useState<HolidayItem[]>(calendar.singleHolidays);
  const [saving, setSaving] = useState(false);

  const [shiftType, setShiftType] = useState<ShiftType>(initialShiftType);
  const [shiftMode, setShiftMode] = useState<ShiftMode>(
    enableBuiltinTemplatePicker ? ((baseShiftConfig.mode as ShiftMode | undefined) ?? 'manual') : 'manual',
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(String(baseShiftConfig.templateId ?? ''));
  const [shiftTitle, setShiftTitle] = useState('');
  const [templateDescription, setTemplateDescription] = useState(initialDescription);

  const [workingDays, setWorkingDays] = useState<string[]>(
    stringArray(baseShiftConfig.workingDays, defaultWorkingDaysForContext),
  );
  const [startTime, setStartTime] = useState(String(fixedShift.startTime ?? baseShiftConfig.startTime ?? '08:00'));
  const [endTime, setEndTime] = useState(String(fixedShift.endTime ?? baseShiftConfig.endTime ?? '16:30'));
  const [nextDay, setNextDay] = useState(Boolean(fixedShift.endsNextDay ?? baseShiftConfig.nextDay ?? false));
  const [rests, setRests] = useState<RestItem[]>(normalizeRests(baseShiftConfig.rests, [
    createRest('fixed'),
    { ...createRest('floating'), id: 'floating-rest', deductFromWork: false },
  ]));

  const [floatDayWorkingDays, setFloatDayWorkingDays] = useState<string[]>(
    stringArray(baseShiftConfig.floatDayWorkingDays, defaultWorkingDaysForContext),
  );
  const [floatDayRequiredMinutes, setFloatDayRequiredMinutes] = useState(Number(floatDayConfig.requiredMinutes ?? 480) || 480);
  const [floatDayEntryStart, setFloatDayEntryStart] = useState(String(floatDayConfig.bandwidthStart ?? '08:00'));
  const [floatDayEntryEnd, setFloatDayEntryEnd] = useState(String(floatDayConfig.bandwidthEnd ?? '16:00'));
  const [floatDayEntryEndsNextDay, setFloatDayEntryEndsNextDay] = useState(Boolean(floatDayConfig.bandwidthEndsNextDay ?? false));
  const [floatDayCoreStart, setFloatDayCoreStart] = useState(String(floatDayConfig.coreTimeStart ?? '10:00'));
  const [floatDayCoreEnd, setFloatDayCoreEnd] = useState(String(floatDayConfig.coreTimeEnd ?? '14:00'));
  const [floatDayRests, setFloatDayRests] = useState<RestItem[]>(normalizeRests(floatDayConfig.rests ?? baseShiftConfig.floatDayRests, []));

  const [floatAbsWorkingDays, setFloatAbsWorkingDays] = useState<string[]>(
    stringArray(baseShiftConfig.floatAbsWorkingDays, defaultWorkingDaysForContext),
  );
  const [floatAbsRequiredMinutes, setFloatAbsRequiredMinutes] = useState(Number(floatAbsConfig.requiredMinutes ?? 480) || 480);
  const [floatAbsStart, setFloatAbsStart] = useState(String(floatAbsConfig.startTime ?? '08:00'));
  const [floatAbsEnd, setFloatAbsEnd] = useState(String(floatAbsConfig.endTime ?? '16:00'));
  const [floatAbsNextDay, setFloatAbsNextDay] = useState(Boolean(floatAbsConfig.endsNextDay ?? false));
  const [floatAbsRests, setFloatAbsRests] = useState<RestItem[]>(normalizeRests(floatAbsConfig.rests ?? baseShiftConfig.floatAbsRests, []));

  const [splitWorkingDays, setSplitWorkingDays] = useState<string[]>(
    stringArray(baseShiftConfig.splitWorkingDays, defaultWorkingDaysForContext),
  );
  const [split1Start, setSplit1Start] = useState(String(splitConfig.segment1Start ?? '08:00'));
  const [split1End, setSplit1End] = useState(String(splitConfig.segment1End ?? '12:00'));
  const [split1Rests, setSplit1Rests] = useState<RestItem[]>(normalizeRests(splitConfig.segment1Breaks, []));
  const [split2Start, setSplit2Start] = useState(String(splitConfig.segment2Start ?? '16:00'));
  const [split2End, setSplit2End] = useState(String(splitConfig.segment2End ?? '20:00'));
  const [split2NextDay, setSplit2NextDay] = useState(Boolean(splitConfig.segment2EndsNextDay ?? false));
  const [split2Rests, setSplit2Rests] = useState<RestItem[]>(normalizeRests(splitConfig.segment2Breaks, []));

  const [rotateSegments, setRotateSegments] = useState<RotateSegment[]>(normalizeSegments(baseShiftConfig.rotatingItems));

  const fixedWorkRange = useMemo<WorkRange>(() => ({ start: startTime, end: endTime, nextDay }), [endTime, nextDay, startTime]);
  const floatAbsWorkRange = useMemo<WorkRange>(() => ({ start: floatAbsStart, end: floatAbsEnd, nextDay: floatAbsNextDay }), [floatAbsEnd, floatAbsNextDay, floatAbsStart]);
  const split1WorkRange = useMemo<WorkRange>(() => ({ start: split1Start, end: split1End, nextDay: false }), [split1End, split1Start]);
  const split2WorkRange = useMemo<WorkRange>(() => ({ start: split2Start, end: split2End, nextDay: split2NextDay }), [split2End, split2NextDay, split2Start]);

  const fixedTotalMinutes = useMemo(() => shiftDuration(startTime, endTime, nextDay, rests), [endTime, nextDay, rests, startTime]);
  const floatDayDeducted = useMemo(() => floatDayRests.reduce((sum, item) => sum + restMinutes(item), 0), [floatDayRests]);
  const floatDayExitRange = useMemo(() => {
    const entryStart = parseTime(floatDayEntryStart);
    const entryEnd = parseTime(floatDayEntryEnd) + (floatDayEntryEndsNextDay || parseTime(floatDayEntryEnd) <= entryStart ? 24 * 60 : 0);
    const exitStart = parseTime(floatDayEntryStart) + floatDayRequiredMinutes + floatDayDeducted;
    const exitEnd = entryEnd + floatDayRequiredMinutes + floatDayDeducted;
    const coreEndLimit = parseTime(floatDayCoreEnd) + floatDayRequiredMinutes;
    return { start: formatDuration(exitStart), end: formatDuration(Math.max(exitEnd, coreEndLimit)) };
  }, [floatDayCoreEnd, floatDayDeducted, floatDayEntryEnd, floatDayEntryEndsNextDay, floatDayEntryStart, floatDayRequiredMinutes]);
  const floatDayWorkRange = useMemo<WorkRange>(() => ({ start: floatDayEntryStart, end: floatDayExitRange.end, nextDay: parseTime(floatDayExitRange.end) <= parseTime(floatDayEntryStart) }), [floatDayEntryStart, floatDayExitRange.end]);
  const floatDayTotalMinutes = useMemo(
    () => {
      const entryStart = parseTime(floatDayEntryStart);
      const entryEnd = parseTime(floatDayEntryEnd) + (floatDayEntryEndsNextDay || parseTime(floatDayEntryEnd) <= entryStart ? 24 * 60 : 0);
      return floatDayRequiredMinutes + floatDayDeducted + Math.max(entryEnd - entryStart, 0);
    },
    [floatDayDeducted, floatDayEntryEnd, floatDayEntryEndsNextDay, floatDayEntryStart, floatDayRequiredMinutes],
  );
  const floatAbsTotalMinutes = useMemo(() => shiftDuration(floatAbsStart, floatAbsEnd, floatAbsNextDay, floatAbsRests), [floatAbsEnd, floatAbsNextDay, floatAbsRests, floatAbsStart]);
  const splitTotalMinutes = useMemo(
    () => shiftDuration(split1Start, split1End, false, split1Rests) + shiftDuration(split2Start, split2End, split2NextDay, split2Rests),
    [split1End, split1Rests, split1Start, split2End, split2NextDay, split2Rests, split2Start],
  );

  const selectedShiftLabel = SHIFT_OPTIONS.find((item) => item.id === shiftType)?.label ?? 'شیفت ثبت نشده';
  const hasWeekdaySchedule = (days: string[]) => Boolean(dayContext) || days.length > 0;
  const fixedReady =
    shiftType === 'fixed' &&
    shiftTitle.trim() &&
    hasWeekdaySchedule(workingDays) &&
    fixedTotalMinutes <= 24 * 60 &&
    !hasFixedRestError(rests, fixedWorkRange);
  const floatDayReady =
    shiftType === 'float-day' &&
    shiftTitle.trim() &&
    hasWeekdaySchedule(floatDayWorkingDays) &&
    floatDayTotalMinutes <= 24 * 60 &&
    !hasFixedRestError(floatDayRests, floatDayWorkRange);
  const floatAbsReady =
    shiftType === 'float-abs' &&
    shiftTitle.trim() &&
    hasWeekdaySchedule(floatAbsWorkingDays) &&
    floatAbsTotalMinutes <= 24 * 60 &&
    !hasFixedRestError(floatAbsRests, floatAbsWorkRange);
  const splitReady =
    shiftType === 'split' &&
    shiftTitle.trim() &&
    hasWeekdaySchedule(splitWorkingDays) &&
    splitTotalMinutes <= 24 * 60 &&
    !hasFixedRestError(split1Rests, split1WorkRange) &&
    !hasFixedRestError(split2Rests, split2WorkRange);
  const rotateReady = shiftType === 'rotate' && shiftTitle.trim() && rotateSegments.length > 0 && rotateSegments.every((segment) => segment.kind === 'off' || !hasFixedRestError(segment.rests, { start: segment.start, end: segment.end, nextDay: segment.nextDay }));
  const canSave = Boolean(shiftTitle.trim() && (fixedReady || floatDayReady || floatAbsReady || splitReady || rotateReady));

  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const setRotateKind = (id: string, kind: RotateKind) => {
    setRotateSegments((prev) =>
      prev.map((segment) => {
        if (segment.id !== id) return segment;
        if (kind === 'off') return { ...segment, kind, start: '', end: '', nextDay: false, rests: [] };
        return { ...segment, kind, ...ROTATE_DEFAULTS[kind] };
      }),
    );
  };

  const moveSegment = (id: string, direction: 'up' | 'down') => {
    setRotateSegments((prev) => {
      const index = prev.findIndex((segment) => segment.id === id);
      if (index < 0) return prev;
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
  };

  const applyPersistedTemplate = (template: ShiftTemplatePickerItem) => {
    const config = template.config;
    setSelectedTemplateId(template.id);
    setShiftTitle(template.title);
    setShiftType(template.shiftType);

    if (template.shiftType === 'fixed') {
      const fixed = asObject(config.fixedShift);
      setStartTime(String(fixed.startTime ?? config.startTime ?? '08:00'));
      setEndTime(String(fixed.endTime ?? config.endTime ?? '16:30'));
      setNextDay(Boolean(fixed.endsNextDay ?? config.nextDay ?? false));
      setWorkingDays(template.weekDays.length > 0 ? template.weekDays : stringArray(config.workingDays, DEFAULT_WORKING_DAYS));
      setRests(normalizeRests(config.rests, rests));
      return;
    }

    if (template.shiftType === 'float-day') {
      const floatDay = asObject(config.floatingShiftStartOfDay);
      setFloatDayWorkingDays(template.weekDays.length > 0 ? template.weekDays : stringArray(config.floatDayWorkingDays, DEFAULT_WORKING_DAYS));
      setFloatDayRequiredMinutes(Number(floatDay.requiredMinutes ?? 480) || 480);
      setFloatDayEntryStart(String(floatDay.bandwidthStart ?? '08:00'));
      setFloatDayEntryEnd(String(floatDay.bandwidthEnd ?? '16:00'));
      setFloatDayEntryEndsNextDay(Boolean(floatDay.bandwidthEndsNextDay ?? false));
      setFloatDayCoreStart(String(floatDay.coreTimeStart ?? '10:00'));
      setFloatDayCoreEnd(String(floatDay.coreTimeEnd ?? '14:00'));
      setFloatDayRests(normalizeRests(floatDay.rests, floatDayRests));
      return;
    }

    if (template.shiftType === 'float-abs') {
      const floatAbs = asObject(config.absoluteFloatingShift);
      setFloatAbsWorkingDays(template.weekDays.length > 0 ? template.weekDays : stringArray(config.floatAbsWorkingDays, DEFAULT_WORKING_DAYS));
      setFloatAbsRequiredMinutes(Number(floatAbs.requiredMinutes ?? 480) || 480);
      setFloatAbsStart(String(floatAbs.startTime ?? '08:00'));
      setFloatAbsEnd(String(floatAbs.endTime ?? '16:00'));
      setFloatAbsNextDay(Boolean(floatAbs.endsNextDay ?? false));
      setFloatAbsRests(normalizeRests(floatAbs.rests, floatAbsRests));
      return;
    }

    if (template.shiftType === 'split') {
      const split = asObject(config.splitShift);
      setSplitWorkingDays(template.weekDays.length > 0 ? template.weekDays : stringArray(config.splitWorkingDays, DEFAULT_WORKING_DAYS));
      setSplit1Start(String(split.segment1Start ?? '08:00'));
      setSplit1End(String(split.segment1End ?? '12:00'));
      setSplit1Rests(normalizeRests(split.segment1Breaks, split1Rests));
      setSplit2Start(String(split.segment2Start ?? '16:00'));
      setSplit2End(String(split.segment2End ?? '20:00'));
      setSplit2NextDay(Boolean(split.segment2EndsNextDay ?? false));
      setSplit2Rests(normalizeRests(split.segment2Breaks, split2Rests));
      return;
    }

    if (template.shiftType === 'rotate') {
      setRotateSegments(normalizeSegments(config.rotatingItems));
    }
  };

  const applyTemplate = (id: string) => {
    const persisted = persistedTemplates.find((item) => item.id === id);
    if (persisted) {
      applyPersistedTemplate(persisted);
      return;
    }

    const template = TEMPLATE_ITEMS.find((item) => item.id === id);
    if (!template) return;
    setSelectedTemplateId(template.id);
    setShiftTitle(template.title);
    setStartTime(template.startTime);
    setEndTime(template.endTime);
    setNextDay(template.nextDay);
    setWorkingDays(template.workingDays);
    setRests(template.rests.map((item, index) => ({ ...item, id: `${template.id}-${index}` })));
    setShiftType('fixed');
  };

  const selectablePersistedTemplates = persistedTemplates.filter((item) => item.shiftType === shiftType);

  const buildShiftConfig = () => {
    const scheduleFields = singleDayDate
      ? {
          includedDates: [singleDayDate],
          workingDays: [] as string[],
          floatDayWorkingDays: [] as string[],
          floatAbsWorkingDays: [] as string[],
          splitWorkingDays: [] as string[],
        }
      : {
          workingDays,
          floatDayWorkingDays,
          floatAbsWorkingDays,
          splitWorkingDays,
        };

    return {
      shiftType,
      mode: shiftMode,
      templateId: selectedTemplateId,
      title: shiftTitle.trim(),
      fixedShift: { startTime, endTime, endsNextDay: nextDay },
      rests,
      floatingShiftStartOfDay: {
        requiredMinutes: floatDayRequiredMinutes,
        bandwidthStart: floatDayEntryStart,
        bandwidthEnd: floatDayEntryEnd,
        bandwidthEndsNextDay: floatDayEntryEndsNextDay,
        coreTimeStart: floatDayCoreStart,
        coreTimeEnd: floatDayCoreEnd,
        rests: floatDayRests,
      },
      absoluteFloatingShift: {
        requiredMinutes: floatAbsRequiredMinutes,
        startTime: floatAbsStart,
        endTime: floatAbsEnd,
        endsNextDay: floatAbsNextDay,
        rests: floatAbsRests,
      },
      splitShift: {
        segment1Start: split1Start,
        segment1End: split1End,
        segment1Breaks: split1Rests,
        segment2Start: split2Start,
        segment2End: split2End,
        segment2EndsNextDay: split2NextDay,
        segment2Breaks: split2Rests,
      },
      rotatingItems: rotateSegments,
      ...scheduleFields,
    };
  };

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const payload: ShiftWizardSavePayload = {
        shiftType,
        shiftTitle: shiftTitle.trim(),
        shiftConfig: buildShiftConfig(),
        description: isTemplatePurpose ? templateDescription.trim() || undefined : undefined,
      };

      if (onSaveShift) {
        await onSaveShift(payload);
      } else {
        await addCalendarShiftAction({
          calendarId: calendar.id,
          shiftType: payload.shiftType,
          shiftTitle: payload.shiftTitle,
          shiftConfig: payload.shiftConfig,
        });
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const resolvedSubmitLabel = submitLabel ?? (isTemplatePurpose ? 'ثبت قالب' : 'ثبت شیفت');

  return (
    <section
      className={compact ? 'calendar-shift-wizard is-compact' : 'rounded-xl border border-white/10 bg-slate-800/65 p-3.5 sm:p-4'}
      dir="rtl"
    >
      <div className={compact ? 'calendar-shift-wizard-inner' : 'space-y-3 rounded-xl border border-white/10 bg-slate-950/45 p-4 sm:p-5'}>
        <div className={compact ? 'calendar-shift-wizard-content' : 'space-y-5 text-right'}>
            {dayContext ? <LockedDayField dayContext={dayContext} /> : null}

            {isTemplatePurpose ? (
              <label className="calendar-create-field">
                <span>توضیحات قالب</span>
                <textarea
                  value={templateDescription}
                  onChange={(event) => setTemplateDescription(event.target.value)}
                  placeholder="توضیحات قالب شیفت (اختیاری)"
                  rows={2}
                />
              </label>
            ) : null}

            {!hideTypePicker ? (
              <div className="space-y-4">
                <div className="text-lg font-bold text-white">نوع شیفت</div>
                <div className="flex flex-wrap justify-start gap-1">
                  {SHIFT_OPTIONS.map((option) => (
                    <ShiftHelpChip
                      key={option.id}
                      option={option}
                      active={shiftType === option.id}
                      onClick={() => {
                        setShiftType(option.id);
                        setShiftMode(option.id === 'fixed' ? shiftMode : 'manual');
                      }}
                    />
                  ))}
                </div>
                <div className="text-sm text-slate-400">برای ادامه، یک نوع شیفت انتخاب کنید.</div>
              </div>
            ) : null}

            {enableBuiltinTemplatePicker && selectablePersistedTemplates.length > 0 ? (
              <div className="space-y-3">
                <div className="text-right text-sm font-bold text-white">قالب‌های ذخیره‌شده</div>
                <div className="grid gap-3 md:grid-cols-2">
                  {selectablePersistedTemplates.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => applyPersistedTemplate(item)}
                      className={cn(
                        'rounded-[18px] border p-4 text-right transition-colors',
                        selectedTemplateId === item.id
                          ? 'border-indigo-400 bg-indigo-500/15 text-white'
                          : 'border-white/10 bg-slate-900/40 text-slate-200 hover:border-white/20',
                      )}
                    >
                      <div className="text-base font-black">{item.title}</div>
                      <div className="mt-2 text-xs text-slate-300">{item.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {shiftType === 'fixed' ? (
              <>
                <TitleCard title={shiftTitle} setTitle={setShiftTitle} />
                <div className="rounded-[22px] border border-white/10 p-5">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
                    <SlidersHorizontal className="h-5 w-5 text-indigo-300" />
                    <div className="text-xl font-black text-white">تعریف شیفت ثابت</div>
                  </div>
                  {enableBuiltinTemplatePicker ? <ModeSwitch mode={shiftMode} setMode={setShiftMode} /> : null}
                  <div className="mt-6 space-y-5">
                    {enableBuiltinTemplatePicker && shiftMode === 'template' ? (
                      <div className="space-y-4">
                        <div className="text-right text-lg font-bold text-white">قالب شیفت</div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {TEMPLATE_ITEMS.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => applyTemplate(item.id)}
                              className={cn(
                                'rounded-[18px] border p-4 text-right transition-colors',
                                selectedTemplateId === item.id ? 'border-indigo-400 bg-indigo-500/15 text-white' : 'border-white/10 bg-slate-900/40 text-slate-200 hover:border-white/20',
                              )}
                            >
                              <div className="flex flex-row-reverse items-start justify-between gap-3">
                                <span className={cn('rounded-full px-3 py-1 text-xs font-bold', selectedTemplateId === item.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300')}>
                                  سیستمی
                                </span>
                                <div>
                                  <div className="text-base font-black">{item.title}</div>
                                  <div className="mt-2 text-xs text-slate-300">{item.description}</div>
                                  <div className="mt-3 text-xs text-slate-400">
                                    {item.startTime} تا {item.endTime}
                                    {item.nextDay ? ' - پایان در روز بعد' : ''}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {!dayContext ? (
                      <WeekDaysEditor days={workingDays} onToggle={(day) => setWorkingDays((prev) => toggle(prev, day))} />
                    ) : null}
                    <div className="grid grid-cols-2 gap-4">
                      <TimeField label="ساعت ورود" value={startTime} onChange={setStartTime} hint="ساعت شروع کار در روز کاری انتخاب شده است." />
                      <div className="min-w-0 space-y-2">
                        <TimeField label="ساعت خروج" value={endTime} onChange={setEndTime} hint="اگر خروج بعد از نیمه شب انجام می شود، گزینه پایان در روز بعد را فعال کنید." />
                        <div className="flex justify-end">
                          <CheckboxField label="پایان در روز بعد" checked={nextDay} onChange={setNextDay} />
                        </div>
                      </div>
                    </div>
                    <BreakEditor items={rests} onChange={setRests} workRange={fixedWorkRange} allowFixedRestEndsNextDay />
                    <DurationCard minutes={fixedTotalMinutes} />
                  </div>
                </div>
              </>
            ) : null}

            {shiftType === 'float-day' ? (
              <>
                <TitleCard title={shiftTitle} setTitle={setShiftTitle} />
                <div className="rounded-[22px] border border-white/10 p-5">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
                    <SlidersHorizontal className="h-5 w-5 text-indigo-300" />
                    <div className="text-xl font-black text-white">تعریف شیفت شناور - شروع روز</div>
                  </div>
                  <ModeSwitch mode={shiftMode} setMode={setShiftMode} noTemplateMessage />
                  <div className="mt-6 space-y-5">
                    {!dayContext ? (
                      <WeekDaysEditor
                        days={floatDayWorkingDays}
                        onToggle={(day) => setFloatDayWorkingDays((prev) => toggle(prev, day))}
                      />
                    ) : null}
                    <div className="space-y-4">
                      <div className="max-w-[22rem]">
                        <TimeField label="ساعت کار موظفی" value={minutesToTime(floatDayRequiredMinutes)} onChange={(value) => setFloatDayRequiredMinutes(parseTime(value))} hint="مدت کاری است که از زمان ورود هر کارمند محاسبه می شود." />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <TimeField label="شروع بازه ورود" value={floatDayEntryStart} onChange={setFloatDayEntryStart} hint="زودترین زمانی که ورود کارمند برای این شیفت پذیرفته می شود." />
                        <div className="min-w-0 space-y-2">
                          <TimeField label="پایان بازه ورود" value={floatDayEntryEnd} onChange={setFloatDayEntryEnd} hint="دیرترین زمانی که ورود کارمند برای این شیفت پذیرفته می شود." />
                          <div className="flex justify-end">
                            <CheckboxField label="پایان در روز بعد" checked={floatDayEntryEndsNextDay} onChange={setFloatDayEntryEndsNextDay} />
                          </div>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <TimeField
                          label="شروع هسته حضور"
                          value={floatDayCoreStart}
                          onChange={setFloatDayCoreStart}
                          hint="هسته حضور باید در روز جاری باشد و نمی تواند در روز بعد باشد."
                        />
                        <TimeField
                          label="پایان هسته حضور"
                          value={floatDayCoreEnd}
                          onChange={setFloatDayCoreEnd}
                          hint="هسته حضور باید در روز جاری باشد و نمی تواند در روز بعد باشد."
                        />
                      </div>
                    </div>
                    <div className="rounded-[18px] border border-indigo-400/25 bg-indigo-950/50 p-4 text-right">
                      <div className="text-sm font-bold text-slate-300">پایان بازه خروج</div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl bg-slate-950/45 px-4 py-3">
                          <div className="text-xs text-slate-400">زودترین خروج</div>
                          <div className="mt-1 text-xl font-black text-indigo-300">{floatDayExitRange.start}</div>
                        </div>
                        <div className="rounded-xl bg-slate-950/45 px-4 py-3">
                          <div className="text-xs text-slate-400">دیرترین خروج</div>
                          <div className="mt-1 text-xl font-black text-indigo-300">{floatDayExitRange.end}</div>
                        </div>
                      </div>
                    </div>
                    <BreakEditor items={floatDayRests} onChange={setFloatDayRests} workRange={floatDayWorkRange} allowFixedRestEndsNextDay />
                    <div className="grid grid-cols-2 gap-3">
                      <DurationCard minutes={floatDayTotalMinutes} />
                      <div className="rounded-[18px] bg-slate-900/60 px-5 py-4 text-right">
                        <div className="text-sm text-slate-300">ساعت موظفی</div>
                        <div className="mt-2 text-xl font-black text-emerald-400">{formatDuration(floatDayRequiredMinutes)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {shiftType === 'float-abs' ? (
              <>
                <TitleCard title={shiftTitle} setTitle={setShiftTitle} />
                <div className="rounded-[22px] border border-white/10 p-5">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
                    <SlidersHorizontal className="h-5 w-5 text-indigo-300" />
                    <div className="text-xl font-black text-white">تعریف شیفت شناور - مطلق</div>
                  </div>
                  <ModeSwitch mode={shiftMode} setMode={setShiftMode} noTemplateMessage />
                  <div className="mt-6 space-y-5">
                    {!dayContext ? (
                      <WeekDaysEditor
                        days={floatAbsWorkingDays}
                        onToggle={(day) => setFloatAbsWorkingDays((prev) => toggle(prev, day))}
                      />
                    ) : null}
                    <div className="max-w-[22rem]">
                      <TimeField label="ساعت کار موظفی" value={minutesToTime(floatAbsRequiredMinutes)} onChange={(value) => setFloatAbsRequiredMinutes(parseTime(value))} hint="مدت کار موظفی در شیفت شناور مطلق است و به بازه ورود وابسته نیست." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <TimeField label="ساعت شروع" value={floatAbsStart} onChange={setFloatAbsStart} hint="شروع بازه مجاز برای انجام کار شناور مطلق." />
                      <div className="min-w-0 space-y-2">
                        <TimeField label="ساعت پایان" value={floatAbsEnd} onChange={setFloatAbsEnd} hint="پایان بازه مجاز کار؛ اگر به روز بعد می رسد، گزینه پایان در روز بعد را فعال کنید." />
                        <div className="flex justify-end">
                          <CheckboxField label="پایان در روز بعد" checked={floatAbsNextDay} onChange={setFloatAbsNextDay} />
                        </div>
                      </div>
                    </div>
                    <BreakEditor items={floatAbsRests} onChange={setFloatAbsRests} floatingOnly workRange={floatAbsWorkRange} />
                    <div className="grid grid-cols-2 gap-3">
                      <DurationCard minutes={floatAbsTotalMinutes} />
                      <div className="rounded-[18px] bg-slate-900/60 px-5 py-4 text-right">
                        <div className="text-sm text-slate-300">ساعت موظفی</div>
                        <div className="mt-2 text-xl font-black text-emerald-400">{formatDuration(floatAbsRequiredMinutes)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {shiftType === 'split' ? (
              <>
                <TitleCard title={shiftTitle} setTitle={setShiftTitle} />
                <div className="rounded-[22px] border border-white/10 p-5">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
                    <SlidersHorizontal className="h-5 w-5 text-indigo-300" />
                    <div className="text-xl font-black text-white">تعریف شیفت دو تکه</div>
                  </div>
                  <ModeSwitch mode={shiftMode} setMode={setShiftMode} noTemplateMessage />
                  <div className="mt-6 space-y-5">
                    {!dayContext ? (
                      <WeekDaysEditor days={splitWorkingDays} onToggle={(day) => setSplitWorkingDays((prev) => toggle(prev, day))} />
                    ) : null}
                    <div className="space-y-4 rounded-[18px] border border-indigo-500/30 bg-slate-900/40 p-4">
                      <div className="text-right text-base font-black text-indigo-300">تکه 1</div>
                      <div className="grid grid-cols-2 gap-4">
                        <TimeField label="شروع تکه اول" value={split1Start} onChange={setSplit1Start} hint="شروع تکه اول باید در روز جاری باشد و نمی تواند در روز بعد باشد." />
                        <TimeField label="پایان تکه اول" value={split1End} onChange={setSplit1End} hint="پایان تکه اول باید بعد از شروع تکه اول و قبل از شروع تکه دوم باشد." />
                      </div>
                      <BreakEditor items={split1Rests} onChange={setSplit1Rests} workRange={split1WorkRange} />
                    </div>
                    <div className="space-y-4 rounded-[18px] border border-indigo-500/30 bg-slate-900/40 p-4">
                      <div className="text-right text-base font-black text-indigo-300">تکه 2</div>
                      <div className="grid grid-cols-2 gap-4">
                        <TimeField label="شروع تکه دوم" value={split2Start} onChange={setSplit2Start} hint="شروع تکه دوم باید در روز جاری باشد و نمی تواند در روز بعد باشد." />
                        <div className="min-w-0 space-y-2">
                          <TimeField label="پایان تکه دوم" value={split2End} onChange={setSplit2End} hint="فقط پایان تکه دوم می تواند با گزینه پایان در روز بعد به روز بعد منتقل شود." />
                          <div className="flex justify-end">
                            <CheckboxField label="پایان در روز بعد" checked={split2NextDay} onChange={setSplit2NextDay} />
                          </div>
                        </div>
                      </div>
                      <BreakEditor items={split2Rests} onChange={setSplit2Rests} workRange={split2WorkRange} />
                    </div>
                    <DurationCard minutes={splitTotalMinutes} />
                  </div>
                </div>
              </>
            ) : null}

            {shiftType === 'rotate' ? (
              <>
                <TitleCard title={shiftTitle} setTitle={setShiftTitle} />
                <div className="rounded-[22px] border border-white/10 p-5">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
                    <SlidersHorizontal className="h-5 w-5 text-indigo-300" />
                    <div className="text-xl font-black text-white">تعریف شیفت چرخشی</div>
                  </div>
                  <ModeSwitch mode={shiftMode} setMode={setShiftMode} noTemplateMessage />
                  <div className="mt-6 space-y-4">
                    <div className="flex flex-row-reverse items-center justify-between text-right">
                      <button
                        type="button"
                        onClick={() => setRotateSegments((prev) => [...prev, createSegment()])}
                        className="inline-flex flex-row-reverse items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
                      >
                        <Plus className="h-4 w-4" />
                        افزودن تکه جدید
                      </button>
                      <div className="text-xl font-black text-white">الگوی چرخشی</div>
                    </div>
                    {rotateSegments.map((segment, index) => (
                      <div key={segment.id} className="space-y-4 rounded-[18px] border border-white/10 bg-slate-800/45 p-4">
                        <div dir="ltr" className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1">
                            <button type="button" onClick={() => setRotateSegments((prev) => prev.filter((item) => item.id !== segment.id))} className="p-1 text-indigo-400 transition-colors hover:text-rose-400">
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button type="button" onClick={() => moveSegment(segment.id, 'down')} disabled={index === rotateSegments.length - 1} className="p-1 text-slate-400 transition-colors hover:text-white disabled:opacity-30">
                              ↓
                            </button>
                            <button type="button" onClick={() => moveSegment(segment.id, 'up')} disabled={index === 0} className="p-1 text-slate-400 transition-colors hover:text-white disabled:opacity-30">
                              ↑
                            </button>
                          </div>
                          <div dir="rtl" className="flex flex-row-reverse items-end gap-4">
                            <label className="space-y-1 text-right">
                              <span className="flex flex-row-reverse items-center justify-end gap-1.5 text-xs font-bold text-slate-400">
                                <span>نوع شیفت</span>
                                <FieldTooltip text="نوع این تکه از الگوی چرخشی را مشخص می کند؛ با تغییر آن ساعت های پیش فرض همان نوع شیفت اعمال می شود." />
                              </span>
                              <select
                                value={segment.kind}
                                onChange={(event) => setRotateKind(segment.id, event.target.value as RotateKind)}
                                className="block rounded-xl border border-slate-600 bg-slate-700/40 px-3 py-2 text-right text-sm text-white [color-scheme:dark] outline-none [&>option]:bg-slate-900 [&>option]:text-white"
                              >
                                {(Object.keys(ROTATE_KIND_LABELS) as RotateKind[]).map((kind) => (
                                  <option key={kind} value={kind}>
                                    {ROTATE_KIND_LABELS[kind]}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <label className="space-y-1 text-right">
                              <span className="flex flex-row-reverse items-center justify-end gap-1.5 text-xs font-bold text-slate-400">
                                <span>تعداد تکرار</span>
                                <FieldTooltip text="تعداد روزهای پشت سر همی که این تکه در چرخه تکرار می شود؛ مثلا عدد 2 یعنی این الگو دو روز متوالی اعمال شود." />
                              </span>
                              <input
                                type="number"
                                min={1}
                                max={30}
                                value={segment.repeat}
                                onChange={(event) => setRotateSegments((prev) => prev.map((item) => (item.id === segment.id ? { ...item, repeat: Math.max(1, Number(event.target.value) || 1) } : item)))}
                                className="block w-20 rounded-xl border border-slate-600 bg-slate-700/40 px-3 py-2 text-center text-sm text-white outline-none"
                              />
                            </label>
                          </div>
                        </div>
                        {segment.kind === 'off' ? (
                          <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">برای آیتم آف فقط تعداد تکرار لازم است.</div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 gap-4">
                              <TimeField label="شروع شیفت" value={segment.start} onChange={(value) => setRotateSegments((prev) => prev.map((item) => (item.id === segment.id ? { ...item, start: value } : item)))} hint="شروع این آیتم چرخشی بر اساس نوع انتخاب شده تنظیم می شود." />
                              <div className="min-w-0 space-y-2">
                                <TimeField label="پایان شیفت" value={segment.end} onChange={(value) => setRotateSegments((prev) => prev.map((item) => (item.id === segment.id ? { ...item, end: value } : item)))} hint="اگر پایان این آیتم چرخشی بعد از نیمه شب است، پایان در روز بعد را فعال کنید." />
                                <div className="flex justify-end">
                                  <CheckboxField label="پایان در روز بعد" checked={segment.nextDay} onChange={(checked) => setRotateSegments((prev) => prev.map((item) => (item.id === segment.id ? { ...item, nextDay: checked } : item)))} />
                                </div>
                              </div>
                            </div>
                            <BreakEditor
                              items={segment.rests}
                              onChange={(items) => setRotateSegments((prev) => prev.map((entry) => (entry.id === segment.id ? { ...entry, rests: items } : entry)))}
                              workRange={{ start: segment.start, end: segment.end, nextDay: segment.nextDay }}
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            {compact ? (
              <footer className="calendar-shift-wizard-actions">
                <button
                  type="button"
                  className="calendar-shift-wizard-save"
                  onClick={save}
                  disabled={!canSave || saving}
                >
                  {saving ? 'در حال ثبت...' : resolvedSubmitLabel}
                </button>
                <button type="button" className="calendar-shift-wizard-cancel" onClick={onCancel}>
                  انصراف
                </button>
              </footer>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={onCancel} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-200">
                  انصراف
                </button>
                <button
                  dir="rtl"
                  type="button"
                  onClick={save}
                  disabled={!canSave || saving}
                  className="inline-flex flex-row-reverse items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'در حال ثبت...' : resolvedSubmitLabel}
                  <Check className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
      </div>
    </section>
  );
}
