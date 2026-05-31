'use client';

import dynamic from 'next/dynamic';
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
import { createCalendarDraftFromDefaultAction, updateCalendarFromQuickSetupAction, updateCalendarHolidaysFromQuickSetupAction } from '../../../lib/actions';
import { resolveCalendarShiftTitle } from '../../../lib/calendar-shifts';
import { calculateTimeRangeDurationMinutes, validateTimeRangeUnder24Hours } from '../../../lib/time-range-validation';
import type { ShiftWizardSavePayload } from '../../calendars/[calendarId]/_components/shift/CalendarShiftWizard';
import type { CalendarShiftWizardCalendar } from '../../calendars/[calendarId]/_components/shift/types';
import type { CompletedCalendarItem, DefaultCalendarTemplate } from './quick-setup.types';

const CalendarShiftWizard = dynamic(
  () =>
    import('../../calendars/[calendarId]/_components/shift/CalendarShiftWizard').then((module) => ({
      default: module.CalendarShiftWizard,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-[22px] border border-white/10 bg-slate-900/50 p-6 text-center text-sm text-slate-300" role="status">
        در حال بارگذاری فرم شیفت چرخشی...
      </div>
    ),
  },
);

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
    hintTitle: 'شیفت ثابت',
    hintDescription: 'شیفت ثابت برای تیم‌هایی مناسب است که ساعت ورود و خروج مشخص و تکرارشونده دارند.',
    hintExample: 'مثال: ۸:۰۰ تا ۱۶:۳۰',
  },
  {
    id: 'float-day',
    label: 'شیفت شناور شروع روز',
    hintTitle: 'شیفت شناور شروع روز',
    hintDescription: 'در این نوع شیفت، کارمند می‌تواند در یک بازه مشخص وارد شود، اما باید مدت کار موظف را کامل کند. ساعت خروج بر اساس زمان ورود واقعی محاسبه می‌شود.',
    hintExample: 'مثال: ورود ۷:۰۰ تا ۹:۰۰ و تکمیل ۸ ساعت کار',
  },
  {
    id: 'float-abs',
    label: 'شیفت شناور مطلق',
    hintTitle: 'شیفت شناور مطلق',
    hintDescription: 'مناسب برای تیم‌هایی که ساعت ثابت ندارند و فقط مجموع زمان کار روزانه اهمیت دارد.',
    hintExample: '',
  },
  {
    id: 'split',
    label: 'شیفت دو تکه',
    hintTitle: 'شیفت دو تکه',
    hintDescription: 'در این نوع شیفت، روز کاری از دو یا چند بازه کاری جدا تشکیل می‌شود. فاصله بین بازه‌ها الزاماً استراحت محسوب نمی‌شود.',
    hintExample: 'بازه کاری اول ۸:۰۰ تا ۱۲:۰۰ و بازه کاری دوم ۱۶:۰۰ تا ۲۰:۰۰. مدت کارکرد کل ۸ ساعت است و فاصله بین دو بازه به‌صورت خودکار استراحت محاسبه نمی‌شود.',
  },
  {
    id: 'rotate',
    label: 'شیفت چرخشی',
    hintTitle: 'شیفت چرخشی',
    hintDescription: 'مناسب برای تیم‌هایی که شیفت آن‌ها بین روزها یا افراد جابه‌جا می‌شود.',
    hintExample: '',
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
    description: 'مناسب برای فروشگاه‌ها و تیم‌های شیفت دوم',
    startTime: '15:00',
    endTime: '20:30',
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

function formatFloatDayPermittedExitRange(entryStart: string, entryEnd: string, requiredMinutes: number) {
  const exitStartMinutes = parseTime(entryStart) + requiredMinutes;
  const exitEndMinutes = parseTime(entryEnd) + requiredMinutes;
  const exitStartNextDay = exitStartMinutes >= 24 * 60;
  const exitEndNextDay = exitEndMinutes >= 24 * 60;
  const exitStart = minutesToTime(exitStartMinutes % (24 * 60));
  const exitEnd = minutesToTime(exitEndMinutes % (24 * 60));

  if (exitStartNextDay && exitEndNextDay) {
    return `${exitStart} (روز بعد) تا ${exitEnd} (روز بعد)`;
  }
  if (exitEndNextDay) {
    return `${exitStart} تا ${exitEnd} (روز بعد)`;
  }
  return `${exitStart} تا ${exitEnd}`;
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
  const duration = item.type === 'fixed' ? calculateTimeRangeDurationMinutes(item.start, item.end, item.endsNextDay) : item.unit === 'hours' ? item.duration * 60 : item.duration;
  if (duration >= 24 * 60) return 'بازه زمانی نمی‌تواند ۲۴ ساعت یا بیشتر باشد.';
  if (item.type !== 'fixed' || !range) return '';
  const workStart = parseTime(range.start);
  const workEnd = rangeEndMinutes(range);
  const restStart = normalizeToRangeDay(item.start, range);
  let restEnd = parseTime(item.end) + (item.endsNextDay ? 24 * 60 : 0);
  if (workEnd > 24 * 60 && restEnd < workStart) restEnd += 24 * 60;

  if (restEnd <= restStart) return 'پایان استراحت باید بعد از شروع استراحت باشد.';
  if (restStart < workStart || restEnd > workEnd) return 'بازه استراحت باید داخل محدوده شیفت باشد.';
  return '';
}

function hasFixedRestError(items: RestItem[], range?: WorkRange) {
  return items.some((item) => Boolean(fixedRestError(item, range)));
}

function grossShiftMinutes(start: string, end: string, nextDay: boolean) {
  return calculateTimeRangeDurationMinutes(start, end, nextDay);
}

function intervalsOverlap(a: WorkRange, b: WorkRange) {
  const aStart = parseTime(a.start);
  const aEnd = rangeEndMinutes(a);
  const bStart = parseTime(b.start);
  const bEnd = rangeEndMinutes(b);
  return aStart < bEnd && bStart < aEnd;
}

function fixedRestInterval(item: RestItem, range: WorkRange) {
  if (item.type !== 'fixed') return null;
  const workStart = parseTime(range.start);
  const workEnd = rangeEndMinutes(range);
  const restStart = normalizeToRangeDay(item.start, range);
  let restEnd = parseTime(item.end) + (item.endsNextDay ? 24 * 60 : 0);
  if (workEnd > 24 * 60 && restEnd < workStart) restEnd += 24 * 60;
  return { start: restStart, end: restEnd };
}

function hasOverlappingFixedRests(items: RestItem[], range?: WorkRange) {
  if (!range) return false;
  const intervals = items
    .map((item) => fixedRestInterval(item, range))
    .filter((item): item is { start: number; end: number } => Boolean(item));
  intervals.sort((a, b) => a.start - b.start);

  for (let index = 1; index < intervals.length; index += 1) {
    if (intervals[index].start < intervals[index - 1].end) return true;
  }
  return false;
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

function fixedRestDurationMinutes(item: RestItem) {
  return calculateTimeRangeDurationMinutes(item.start, item.end, item.endsNextDay);
}

function convertRestToFloating(item: RestItem) {
  const duration = item.type === 'fixed' ? fixedRestDurationMinutes(item) : item.unit === 'hours' ? item.duration * 60 : item.duration;
  if (duration <= 0 || duration >= 24 * 60) return null;
  return {
    ...item,
    type: 'floating' as RestType,
    start: '00:00',
    end: '00:00',
    endsNextDay: false,
    duration,
    unit: duration % 60 === 0 ? ('hours' as RestUnit) : ('minutes' as RestUnit),
  };
}

function normalizeAbsoluteFloatingRests(value: unknown, rangeEnabled: boolean) {
  return normalizeRests(value, []).flatMap((item) => {
    if (rangeEnabled || item.type !== 'fixed') return [item];
    const converted = convertRestToFloating(item);
    return converted ? [converted] : [];
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
        {option.hintExample ? <div className="mt-2 rounded-xl bg-slate-800 px-3 py-2 text-xs leading-5 text-indigo-200">{option.hintExample}</div> : null}
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

function TimeField({
  label,
  value,
  onChange,
  hint,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn('space-y-2 text-right', disabled && 'opacity-60')}>
      <span className="flex flex-row-reverse items-center justify-end gap-2 text-sm font-bold text-slate-300">
        <span>{label}</span>
        {hint ? <FieldTooltip text={hint} /> : null}
      </span>
      <input
        type="time"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-right text-sm font-bold text-white outline-none transition-colors focus:border-indigo-400',
          disabled && 'cursor-not-allowed opacity-70',
        )}
      />
    </label>
  );
}

function DurationAmountField({
  label,
  value,
  unit,
  onChange,
  onUnitChange,
  hint,
}: {
  label: string;
  value: number;
  unit: RestUnit;
  onChange: (value: number) => void;
  onUnitChange: (unit: RestUnit) => void;
  hint?: string;
}) {
  const displayValue = unit === 'hours' ? Math.max(value / 60, 0) : value;

  return (
    <label className="space-y-2 text-right">
      <span className="flex flex-row-reverse items-center justify-end gap-2 text-sm font-bold text-slate-300">
        <span>{label}</span>
        {hint ? <FieldTooltip text={hint} /> : null}
      </span>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          type="number"
          step={unit === 'hours' ? 0.5 : 1}
          min={0}
          value={displayValue}
          onChange={(event) => {
            const nextValue = Number(event.target.value) || 0;
            onChange(unit === 'hours' ? nextValue * 60 : nextValue);
          }}
          className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-3 text-right text-sm font-bold text-white outline-none transition-colors focus:border-indigo-400"
        />
        <div className="rounded-full bg-slate-950/80 p-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUnitChange('hours')}
              className={cn('rounded-full px-3 py-3 text-xs font-bold transition-colors', unit === 'hours' ? 'bg-slate-700 text-white' : 'text-slate-400')}
            >
              ساعت
            </button>
            <button
              type="button"
              onClick={() => onUnitChange('minutes')}
              className={cn('rounded-full px-3 py-3 text-xs font-bold transition-colors', unit === 'minutes' ? 'bg-slate-700 text-white' : 'text-slate-400')}
            >
              دقیقه
            </button>
          </div>
        </div>
      </div>
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

function formatHoursLabel(minutes: number) {
  const normalized = Math.max(Math.round(minutes), 0);
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  if (mins === 0) return `${hours} ساعت`;
  return `${hours} ساعت و ${mins} دقیقه`;
}

function formatWorkingDaysLabel(days: string[]) {
  if (days.length === 0) return '-';
  if (days.length === 1) return days[0];
  const indices = days.map((day) => WEEK_DAYS.indexOf(day)).filter((index) => index >= 0).sort((a, b) => a - b);
  if (indices.length === 0) return days.join('، ');
  let start = indices[0];
  let end = indices[0];
  const ranges: string[] = [];
  for (let index = 1; index <= indices.length; index += 1) {
    if (index < indices.length && indices[index] === end + 1) {
      end = indices[index];
      continue;
    }
    ranges.push(start === end ? WEEK_DAYS[start] : `${WEEK_DAYS[start]} تا ${WEEK_DAYS[end]}`);
    if (index < indices.length) {
      start = indices[index];
      end = indices[index];
    }
  }
  return ranges.join('، ');
}

function totalDeductedRestMinutes(items: RestItem[]) {
  return items.reduce((sum, item) => sum + restMinutes(item), 0);
}

function TitleCard({
  title,
  setTitle,
  error,
  helper,
  required = false,
  placeholder = 'مثلاً: شیفت صبح اداری',
}: {
  title: string;
  setTitle: (value: string) => void;
  error?: string;
  helper?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 p-5">
      <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500 text-indigo-300">i</div>
        <div className="text-xl font-black text-white">اطلاعات پایه شیفت</div>
      </div>
      <label className="mt-6 block space-y-2 text-right">
        <span className="text-sm font-bold text-white">{required ? 'عنوان شیفت' : 'عنوان شیفت (اختیاری)'}</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border bg-slate-900/60 px-4 py-3 text-right text-sm text-white outline-none transition-colors focus:border-indigo-400',
            error ? 'border-rose-400/60' : 'border-slate-600',
          )}
        />
        {helper ? <p className="text-xs leading-6 text-slate-400">{helper}</p> : <p className="text-xs leading-6 text-slate-400">در صورت خالی بودن، نام پیش‌فرض بر اساس نوع شیفت استفاده می‌شود.</p>}
        {error ? <small className="block text-xs font-bold text-rose-300">{error}</small> : null}
      </label>
    </div>
  );
}

function ModeSwitch({ mode, setMode, noTemplateMessage }: { mode: ShiftMode; setMode: (mode: ShiftMode) => void; noTemplateMessage?: boolean }) {
  return (
    <>
      <div className="mt-4 text-right text-sm font-bold text-slate-300">روش تعریف شیفت</div>
      <div className="mt-2 rounded-full bg-slate-950/80 p-1" dir="rtl">
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
            انتخاب از قالب آماده
          </button>
        </div>
      </div>
      {mode === 'template' && !noTemplateMessage ? (
        <div className="mt-3 text-right text-xs leading-6 text-slate-400">
          پس از انتخاب قالب، می‌توانید روزها، ساعت‌ها و استراحت‌ها را متناسب با سازمان خود ویرایش کنید.
        </div>
      ) : null}
      {noTemplateMessage && mode === 'template' ? <div className="mt-4 text-right text-sm text-slate-400">قالبی برای این نوع شیفت ثبت نشده است.</div> : null}
    </>
  );
}

function WeekDaysEditor({
  days,
  calendarHolidayDays,
  onToggle,
  error,
}: {
  days: string[];
  calendarHolidayDays: string[];
  onToggle: (day: string) => void;
  error?: string;
}) {
  const selectedHolidayDays = days.filter((day) => calendarHolidayDays.includes(day));

  return (
    <div className="space-y-3 text-right">
      <div className="flex flex-row-reverse items-center justify-end gap-2 text-xl font-black text-white">
        <span>روزهای فعال</span>
        <CalendarDays className="h-5 w-5 text-slate-300" />
      </div>
      <div className="flex flex-wrap justify-start gap-2">
        {WEEK_DAYS.map((day) => {
          const isHoliday = calendarHolidayDays.includes(day);
          const active = days.includes(day);
          return (
            <div key={day} className="relative inline-flex flex-col items-center gap-1">
              <DetailToggle active={active} onClick={() => onToggle(day)}>
                {active ? `${day} ✓` : day}
              </DetailToggle>
              {isHoliday ? (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-200">تعطیل در تقویم</span>
              ) : null}
            </div>
          );
        })}
      </div>
      {selectedHolidayDays.length > 0 ? (
        <div className="rounded-xl border border-amber-400/25 bg-amber-950/30 px-3 py-2 text-xs leading-6 text-amber-100">
          این روز در تقویم کاری تعطیل ثبت شده است. با انتخاب آن، این شیفت برای همان روز فعال خواهد شد.
        </div>
      ) : null}
      {error ? <small className="block text-xs font-bold text-rose-300">{error}</small> : null}
    </div>
  );
}

function RestTypeSwitch({ value, onChange, floatingOnly }: { value: RestType; onChange: (value: RestType) => void; floatingOnly: boolean }) {
  if (floatingOnly) {
    return <div className="rounded-xl border border-slate-600 bg-slate-700/40 px-4 py-3 text-right text-sm font-bold text-slate-200">مدت شناور</div>;
  }

  return (
    <div className="space-y-2 text-right">
      <span className="text-xs font-bold text-slate-400">نوع استراحت</span>
      <div className="rounded-full bg-slate-950/80 p-1">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange('fixed')}
            className={cn('rounded-full px-3 py-2 text-xs font-bold transition-colors', value === 'fixed' ? 'bg-slate-700 text-white' : 'text-slate-400')}
          >
            بازه ثابت
          </button>
          <button
            type="button"
            onClick={() => onChange('floating')}
            className={cn('rounded-full px-3 py-2 text-xs font-bold transition-colors', value === 'floating' ? 'bg-slate-700 text-white' : 'text-slate-400')}
          >
            مدت شناور
          </button>
        </div>
      </div>
    </div>
  );
}

function DeductToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <InlineToggle
      label="کسر استراحت از کارکرد"
      checked={checked}
      onChange={onChange}
    />
  );
}

function BreakEditor({
  items,
  onChange,
  floatingOnly = false,
  preferFloatingDuration = false,
  workRange,
  allowFixedRestEndsNextDay = false,
}: {
  items: RestItem[];
  onChange: (items: RestItem[]) => void;
  floatingOnly?: boolean;
  preferFloatingDuration?: boolean;
  workRange?: WorkRange;
  allowFixedRestEndsNextDay?: boolean;
}) {
  const updateItem = (id: string, patch: Partial<RestItem>) => onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  return (
    <div className="space-y-3 rounded-[22px] border border-white/10 p-4 text-right">
      <div dir="ltr" className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onChange([...items, createRest(preferFloatingDuration || floatingOnly ? 'floating' : 'fixed')])}
          className="inline-flex flex-row-reverse items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          افزودن استراحت
        </button>
        <div dir="rtl" className="flex flex-row-reverse items-center gap-2 text-xl font-black text-white">
          <span>استراحت‌ها</span>
          <Coffee className="h-5 w-5 text-slate-300" />
        </div>
      </div>
      {preferFloatingDuration ? (
        <div className="rounded-xl border border-indigo-400/20 bg-indigo-950/30 px-3 py-2 text-xs leading-6 text-indigo-100">
          برای شیفت شناور، مدت شناور معمولاً مناسب‌تر است؛ مگر اینکه سازمان ساعت استراحت ثابت داشته باشد.
        </div>
      ) : null}

      {items.map((item) => (
        <div key={item.id} className="space-y-4 rounded-[18px] border border-white/10 bg-slate-800/45 p-4">
          {(() => {
            const error = fixedRestError(item, workRange);
            return error ? <div className="rounded-xl border border-rose-400/25 bg-rose-950/40 px-3 py-2 text-right text-xs font-bold leading-6 text-rose-200">{error}</div> : null;
          })()}
          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <RestTypeSwitch value={item.type} onChange={(value) => updateItem(item.id, { type: value })} floatingOnly={floatingOnly} />
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
                {preferFloatingDuration ? (
                  <p className="text-xs leading-6 text-slate-400">
                    در شیفت شناور، بازه ثابت استراحت فقط زمانی مناسب است که سازمان ساعت استراحت مشخص و ثابتی داشته باشد.
                  </p>
                ) : null}
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
              <label className="block space-y-2 text-right">
                <span className="flex flex-row-reverse items-center justify-end gap-2 text-sm font-bold text-slate-300">
                  <span>مدت استراحت ({item.unit === 'minutes' ? 'دقیقه' : 'ساعت'})</span>
                </span>
                <input
                  type="number"
                  min={0}
                  value={item.duration}
                  onChange={(event) => updateItem(item.id, { duration: Number(event.target.value) || 0 })}
                  className="w-full rounded-xl border border-slate-600 bg-slate-700/40 px-4 py-3 text-right text-sm font-bold text-white outline-none"
                />
              </label>
              <div className="flex flex-row-reverse flex-wrap justify-end gap-2">
                {(['minutes', 'hours'] as RestUnit[]).map((unit) => (
                  <DetailToggle key={unit} active={item.unit === unit} onClick={() => updateItem(item.id, { unit })}>
                    {unit === 'minutes' ? 'دقیقه' : 'ساعت'}
                  </DetailToggle>
                ))}
              </div>
              <div className="flex justify-start">
                <span className="group relative inline-flex">
                  <DeductToggle checked={item.deductFromWork} onChange={(checked) => updateItem(item.id, { deductFromWork: checked })} />
                  <span className="pointer-events-none absolute right-0 top-10 z-30 hidden w-72 rounded-xl border border-white/10 bg-slate-900 p-3 text-right text-xs leading-6 text-slate-200 shadow-2xl group-hover:block">
                    اگر فعال باشد، مدت استراحت از ساعت کاری مفید کارمند کم می‌شود.
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ShiftSummary({
  shiftType,
  shiftMode,
  shiftTitle,
  workingDays,
  startTime,
  endTime,
  nextDay,
  rests,
  floatDayRequiredMinutes,
  floatDayEntryStart,
  floatDayEntryEnd,
  floatDayCoreStart,
  floatDayCoreEnd,
  floatDayCoreEnabled,
  floatAbsRequiredMinutes,
  floatAbsRangeEnabled,
  floatAbsRangeStart,
  floatAbsRangeEnd,
  split1Start,
  split1End,
  split1NextDay,
  split2Start,
  split2End,
  split2NextDay,
  split1Rests,
  split2Rests,
  floatDayRests,
  floatAbsRests,
}: {
  shiftType: ShiftType;
  shiftMode: ShiftMode;
  shiftTitle: string;
  workingDays: string[];
  startTime: string;
  endTime: string;
  nextDay: boolean;
  rests: RestItem[];
  floatDayRequiredMinutes: number;
  floatDayEntryStart: string;
  floatDayEntryEnd: string;
  floatDayCoreStart: string;
  floatDayCoreEnd: string;
  floatDayCoreEnabled: boolean;
  floatAbsRequiredMinutes: number;
  floatAbsRangeEnabled: boolean;
  floatAbsRangeStart: string;
  floatAbsRangeEnd: string;
  split1Start: string;
  split1End: string;
  split1NextDay: boolean;
  split2Start: string;
  split2End: string;
  split2NextDay: boolean;
  split1Rests: RestItem[];
  split2Rests: RestItem[];
  floatDayRests: RestItem[];
  floatAbsRests: RestItem[];
}) {
  const shiftLabel = SHIFT_OPTIONS.find((item) => item.id === shiftType)?.label ?? '-';
  const modeLabel = shiftMode === 'template' ? 'انتخاب از قالب آماده' : 'تعریف دستی';
  const daysLabel = formatWorkingDaysLabel(workingDays);

  let workTime = '-';
  let deducted = 0;
  let netWork = 0;
  let grossWork = 0;
  let extra = '';

  if (shiftType === 'fixed') {
    deducted = totalDeductedRestMinutes(rests);
    grossWork = grossShiftMinutes(startTime, endTime, nextDay);
    netWork = shiftDuration(startTime, endTime, nextDay, rests);
    workTime = `${startTime} تا ${endTime}${nextDay ? ' (روز بعد)' : ''}`;
  } else if (shiftType === 'float-day') {
    deducted = totalDeductedRestMinutes(floatDayRests);
    netWork = Math.max(floatDayRequiredMinutes - deducted, 0);
    const sampleEntry = '08:30';
    const sampleExit = minutesToTime(parseTime(sampleEntry) + floatDayRequiredMinutes);
    const sampleStatus = parseTime(sampleEntry) < parseTime(floatDayEntryStart)
      ? 'قبل از بازه'
      : parseTime(sampleEntry) > parseTime(floatDayEntryEnd)
        ? 'بعد از بازه'
        : 'مجاز';
    extra = `اگر کارمند ساعت ${sampleEntry} وارد شود، خروج مورد انتظار ${sampleExit} خواهد بود. وضعیت ورود: ${sampleStatus}.`;
  } else if (shiftType === 'float-abs') {
    deducted = totalDeductedRestMinutes(floatAbsRests);
    netWork = Math.max(floatAbsRequiredMinutes - deducted, 0);
    extra = 'در این نوع شیفت، تأخیر بر اساس ساعت ورود محاسبه نمی‌شود؛ ملاک، تکمیل حداقل کارکرد روزانه است.';
  } else if (shiftType === 'split') {
    const split1Gross = grossShiftMinutes(split1Start, split1End, split1NextDay);
    const split2Gross = grossShiftMinutes(split2Start, split2End, split2NextDay);
    deducted = totalDeductedRestMinutes([...split1Rests, ...split2Rests]);
    grossWork = split1Gross + split2Gross;
    netWork = Math.max(grossWork - deducted, 0);
    extra = 'فاصله بین بازه‌های کاری به‌صورت خودکار استراحت محسوب نمی‌شود.';
  }

  if (shiftType === 'rotate') return null;

  return (
    <div className="rounded-[22px] border border-indigo-400/25 bg-indigo-950/35 p-5 text-right">
      <div className="text-lg font-black text-white">خلاصه شیفت</div>
      <div className="mt-4 space-y-2 text-sm leading-7 text-slate-200">
        <div>نوع شیفت: {shiftLabel}</div>
        <div>روش تعریف: {modeLabel}</div>
        <div>عنوان: {shiftTitle || '-'}</div>
        <div>روزهای فعال: {daysLabel}</div>
        {shiftType === 'float-day' ? <div>بازه مجاز ورود: {floatDayEntryStart} تا {floatDayEntryEnd}</div> : null}
        {shiftType === 'float-day' ? (
          <div>
            بازه مجاز خروج: {formatFloatDayPermittedExitRange(floatDayEntryStart, floatDayEntryEnd, floatDayRequiredMinutes)}
          </div>
        ) : null}
        {shiftType === 'float-day' ? <div>مدت کار موظف: {formatHoursLabel(floatDayRequiredMinutes)}</div> : null}
        {shiftType === 'float-day' && floatDayCoreEnabled && floatDayCoreStart && floatDayCoreEnd ? (
          <div>هسته حضور: {floatDayCoreStart} تا {floatDayCoreEnd}</div>
        ) : null}
        {shiftType === 'float-abs' ? <div>ملاک محاسبه: مجموع کارکرد روزانه</div> : null}
        {shiftType === 'float-abs' ? <div>حداقل کارکرد لازم: {formatHoursLabel(floatAbsRequiredMinutes)}</div> : null}
        {shiftType === 'float-abs' ? <div>محدوده مجاز ثبت تردد: {floatAbsRangeEnabled ? `${floatAbsRangeStart} تا ${floatAbsRangeEnd}` : 'بدون محدودیت زمانی'}</div> : null}
        {shiftType === 'float-abs' ? <div>استراحت قابل کسر: {formatHoursLabel(deducted)}</div> : null}
        {shiftType === 'float-abs' ? <div>مدت کارکرد مفید مورد انتظار: {formatHoursLabel(netWork)}</div> : null}
        {shiftType === 'split' ? (
          <div className="rounded-xl bg-slate-900/50 px-3 py-2 text-xs leading-6 text-indigo-100">
            <div>بازه‌های کاری:</div>
            <div className="mt-1">
              ۱. {split1Start} تا {split1End}{split1NextDay ? ' (روز بعد)' : ''} —{' '}
              {validateTimeRangeUnder24Hours(split1Start, split1End, split1NextDay) ? 'نامعتبر' : formatHoursLabel(grossShiftMinutes(split1Start, split1End, split1NextDay))}
            </div>
            <div>
              ۲. {split2Start} تا {split2End}{split2NextDay ? ' (روز بعد)' : ''} —{' '}
              {validateTimeRangeUnder24Hours(split2Start, split2End, split2NextDay) ? 'نامعتبر' : formatHoursLabel(grossShiftMinutes(split2Start, split2End, split2NextDay))}
            </div>
            <div className="mt-2">فاصله بین بازه‌های کاری به‌صورت خودکار استراحت محسوب نمی‌شود.</div>
          </div>
        ) : null}
        {shiftType === 'split' ? <div>مدت کارکرد کل: {formatHoursLabel(grossWork)}</div> : null}
        {shiftType === 'fixed' ? (
          <>
            <div>مدت کل شیفت: {validateTimeRangeUnder24Hours(startTime, endTime, nextDay) ? 'نامعتبر' : formatHoursLabel(grossWork)}</div>
            <div>استراحت قابل کسر: {formatHoursLabel(deducted)}</div>
            <div>مدت کارکرد مفید: {formatHoursLabel(netWork)}</div>
          </>
        ) : null}
        {shiftType === 'split' ? <div>استراحت قابل کسر: {formatHoursLabel(deducted)}</div> : null}
        {shiftType === 'split' ? <div>مدت کارکرد مفید: {formatHoursLabel(netWork)}</div> : null}
        {shiftType === 'float-day' ? <div>استراحت قابل کسر: {formatHoursLabel(deducted)}</div> : null}
        {shiftType === 'float-day' ? <div>مدت کارکرد مفید در گزارش: {formatHoursLabel(netWork)}</div> : null}
        {shiftType !== 'fixed' && shiftType !== 'float-day' && shiftType !== 'float-abs' && deducted > 0 ? <div>استراحت قابل کسر: {deducted} دقیقه</div> : null}
        {shiftType !== 'fixed' && shiftType !== 'float-day' && shiftType !== 'float-abs' && netWork > 0 ? <div>مدت کارکرد مفید: {formatHoursLabel(netWork)}</div> : null}
        {extra ? <div className="mt-2 rounded-xl bg-slate-900/50 px-3 py-2 text-xs leading-6 text-indigo-100">{extra}</div> : null}
        {shiftType === 'float-abs' ? (
          <div className="rounded-xl bg-slate-900/50 px-3 py-2 text-xs leading-6 text-indigo-100">
            <div>در این نوع شیفت، تأخیر بر اساس ساعت ورود محاسبه نمی‌شود؛ ملاک، تکمیل حداقل کارکرد روزانه است.</div>
            <div className="mt-1">ورود اول: ۹:۰۰ تا ۱۲:۰۰</div>
            <div>ورود دوم: ۱۵:۰۰ تا ۱۸:۰۰</div>
            <div>مجموع کارکرد: ۶ ساعت</div>
            <div>وضعیت: تکمیل‌شده</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function Step2CalendarShift({
  isCompleted,
  initialCalendar,
  defaultCalendarTemplate,
  onComplete,
  onBack,
}: {
  isCompleted: boolean;
  initialCalendar: CompletedCalendarItem | null;
  defaultCalendarTemplate: DefaultCalendarTemplate | null;
  onComplete: (summary: CompletedCalendarItem) => void;
  onBack: () => void;
}) {
  const baseCalendar = initialCalendar ?? defaultCalendarTemplate;
  const baseShiftConfig = asObject(defaultCalendarTemplate?.shiftConfig);
  const fixedShift = asObject(baseShiftConfig.fixedShift);
  const floatDayConfig = asObject(baseShiftConfig.floatingShiftStartOfDay);
  const floatAbsConfig = asObject(baseShiftConfig.absoluteFloatingShift);
  const splitConfig = asObject(baseShiftConfig.splitShift);

  const [activeSection, setActiveSection] = useState<SectionKey>('calendar');
  const [calendarConfirmed, setCalendarConfirmed] = useState(false);
  const [holidayConfirmed, setHolidayConfirmed] = useState(false);
  const [draftCalendarId, setDraftCalendarId] = useState(initialCalendar?.id ?? '');
  const [title] = useState(baseCalendar?.title ?? 'تقویم کاری');
  const [description] = useState(baseCalendar?.description ?? 'تقویم پایه شرکت');
  const [year] = useState(baseCalendar?.yearLabel ?? '');
  const [weekends, setWeekends] = useState<string[]>(defaultCalendarTemplate?.weekends?.length ? defaultCalendarTemplate.weekends : ['جمعه']);
  const [holidays, setHolidays] = useState<HolidayItem[]>(
    defaultCalendarTemplate?.singleHolidays?.map((item) => ({ id: item.id, title: item.title, date: item.date })) ?? [],
  );
  const [holidayTitle, setHolidayTitle] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [singleHolidayDialogOpen, setSingleHolidayDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [shiftTypeChangeOpen, setShiftTypeChangeOpen] = useState(false);
  const [rotateComingSoonOpen, setRotateComingSoonOpen] = useState(false);
  const [pendingShiftType, setPendingShiftType] = useState<ShiftType | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [shiftType, setShiftType] = useState<ShiftType>((baseShiftConfig.shiftType as ShiftType | undefined) ?? 'fixed');
  const [shiftMode, setShiftMode] = useState<ShiftMode>((baseShiftConfig.mode as ShiftMode | undefined) ?? 'manual');
  const [selectedTemplateId, setSelectedTemplateId] = useState(String(baseShiftConfig.templateId ?? ''));
  const [shiftTitle, setShiftTitle] = useState('');

  const [workingDays, setWorkingDays] = useState<string[]>(stringArray(baseShiftConfig.workingDays, DEFAULT_WORKING_DAYS));
  const [startTime, setStartTime] = useState(String(fixedShift.startTime ?? baseShiftConfig.startTime ?? '08:00'));
  const [endTime, setEndTime] = useState(String(fixedShift.endTime ?? baseShiftConfig.endTime ?? '16:30'));
  const [nextDay, setNextDay] = useState(Boolean(fixedShift.endsNextDay ?? baseShiftConfig.nextDay ?? false));
  const [rests, setRests] = useState<RestItem[]>(normalizeRests(baseShiftConfig.rests, [
    createRest('fixed'),
    { ...createRest('floating'), id: 'floating-rest', deductFromWork: false },
  ]));

  const [floatDayWorkingDays, setFloatDayWorkingDays] = useState<string[]>(stringArray(baseShiftConfig.floatDayWorkingDays, DEFAULT_WORKING_DAYS));
  const initialFloatDayRequiredMinutes = Number(floatDayConfig.requiredMinutes ?? 480) || 480;
  const [floatDayRequiredMinutes, setFloatDayRequiredMinutes] = useState(initialFloatDayRequiredMinutes);
  const [floatDayRequiredUnit, setFloatDayRequiredUnit] = useState<RestUnit>(initialFloatDayRequiredMinutes % 60 === 0 ? 'hours' : 'minutes');
  const [floatDayEntryStart, setFloatDayEntryStart] = useState(String(floatDayConfig.bandwidthStart ?? '08:00'));
  const [floatDayEntryEnd, setFloatDayEntryEnd] = useState(String(floatDayConfig.bandwidthEnd ?? '16:00'));
  const [floatDayCoreStart, setFloatDayCoreStart] = useState(String(floatDayConfig.coreTimeStart ?? '10:00'));
  const [floatDayCoreEnd, setFloatDayCoreEnd] = useState(String(floatDayConfig.coreTimeEnd ?? '14:00'));
  const [floatDayCoreEnabled, setFloatDayCoreEnabled] = useState(Boolean(floatDayConfig.coreTimeStart && floatDayConfig.coreTimeEnd));
  const [floatDayRests, setFloatDayRests] = useState<RestItem[]>(normalizeRests(floatDayConfig.rests ?? baseShiftConfig.floatDayRests, []));

  const [floatAbsWorkingDays, setFloatAbsWorkingDays] = useState<string[]>(stringArray(baseShiftConfig.floatAbsWorkingDays, DEFAULT_WORKING_DAYS));
  const [floatAbsRequiredMinutes, setFloatAbsRequiredMinutes] = useState(Number(floatAbsConfig.requiredMinutes ?? 480) || 480);
  const initialFloatAbsRangeEnabled = Boolean(
    floatAbsConfig.registrationRangeEnabled ?? ('startTime' in floatAbsConfig || 'endTime' in floatAbsConfig || 'endsNextDay' in floatAbsConfig),
  );
  const [floatAbsRangeEnabled, setFloatAbsRangeEnabled] = useState(initialFloatAbsRangeEnabled);
  const [floatAbsStart, setFloatAbsStart] = useState(String(floatAbsConfig.startTime ?? '08:00'));
  const [floatAbsEnd, setFloatAbsEnd] = useState(String(floatAbsConfig.endTime ?? '16:00'));
  const [floatAbsRests, setFloatAbsRests] = useState<RestItem[]>(
    normalizeAbsoluteFloatingRests(floatAbsConfig.rests ?? baseShiftConfig.floatAbsRests, initialFloatAbsRangeEnabled),
  );

  const [splitWorkingDays, setSplitWorkingDays] = useState<string[]>(stringArray(baseShiftConfig.splitWorkingDays, DEFAULT_WORKING_DAYS));
  const [split1Start, setSplit1Start] = useState(String(splitConfig.segment1Start ?? '08:00'));
  const [split1End, setSplit1End] = useState(String(splitConfig.segment1End ?? '12:00'));
  const [split1NextDay, setSplit1NextDay] = useState(Boolean(splitConfig.segment1EndsNextDay ?? false));
  const [split1Rests, setSplit1Rests] = useState<RestItem[]>(normalizeRests(splitConfig.segment1Breaks, []));
  const [split2Start, setSplit2Start] = useState(String(splitConfig.segment2Start ?? '16:00'));
  const [split2End, setSplit2End] = useState(String(splitConfig.segment2End ?? '20:00'));
  const [split2NextDay, setSplit2NextDay] = useState(Boolean(splitConfig.segment2EndsNextDay ?? false));
  const [split2Rests, setSplit2Rests] = useState<RestItem[]>(normalizeRests(splitConfig.segment2Breaks, []));

  const [rotateSegments, setRotateSegments] = useState<RotateSegment[]>(normalizeSegments(baseShiftConfig.rotatingItems));

  const setFloatDayRequiredMinutesValue = (minutes: number) => {
    const safe = Math.max(Math.round(minutes), 0);
    setFloatDayRequiredMinutes(safe);
  };

  const fixedWorkRange = useMemo<WorkRange>(() => ({ start: startTime, end: endTime, nextDay }), [endTime, nextDay, startTime]);
  const floatDayDeducted = useMemo(() => floatDayRests.reduce((sum, item) => sum + restMinutes(item), 0), [floatDayRests]);
  const floatDayWorkRange = useMemo<WorkRange>(() => {
    const rangeEnd = parseTime(floatDayEntryStart) + floatDayRequiredMinutes;
    return {
      start: floatDayEntryStart,
      end: minutesToTime(rangeEnd % (24 * 60)),
      nextDay: rangeEnd >= 24 * 60,
    };
  }, [floatDayEntryStart, floatDayRequiredMinutes]);
  const floatDayNetMinutes = useMemo(() => Math.max(floatDayRequiredMinutes - floatDayDeducted, 0), [floatDayDeducted, floatDayRequiredMinutes]);
  const floatDaySampleEntry = '08:30';
  const floatDaySampleExit = minutesToTime(parseTime(floatDaySampleEntry) + floatDayRequiredMinutes);
  const floatDaySampleStatus = parseTime(floatDaySampleEntry) < parseTime(floatDayEntryStart)
    ? 'قبل از بازه'
    : parseTime(floatDaySampleEntry) > parseTime(floatDayEntryEnd)
      ? 'بعد از بازه'
      : 'مجاز';
  const floatAbsWorkRange = useMemo<WorkRange | undefined>(() => {
    if (!floatAbsRangeEnabled) return undefined;
    if (!floatAbsStart || !floatAbsEnd) return undefined;
    if (parseTime(floatAbsEnd) <= parseTime(floatAbsStart)) return undefined;
    return { start: floatAbsStart, end: floatAbsEnd, nextDay: false };
  }, [floatAbsEnd, floatAbsRangeEnabled, floatAbsStart]);
  const floatAbsFixedBreaksAllowed = Boolean(floatAbsWorkRange);
  const split1WorkRange = useMemo<WorkRange>(() => ({ start: split1Start, end: split1End, nextDay: split1NextDay }), [split1End, split1NextDay, split1Start]);
  const split2WorkRange = useMemo<WorkRange>(() => ({ start: split2Start, end: split2End, nextDay: split2NextDay }), [split2End, split2NextDay, split2Start]);

  const setFloatAbsRangeEnabledWithConversion = (checked: boolean) => {
    if (!checked && floatAbsRangeEnabled && floatAbsRests.some((item) => item.type === 'fixed')) {
      const confirmed = window.confirm(
        'با غیرفعال کردن محدودیت زمانی ثبت تردد، استراحت‌های بازه ثابت دیگر معتبر نیستند و به مدت شناور تبدیل یا حذف می‌شوند. ادامه می‌دهید؟',
      );
      if (!confirmed) return;
      setFloatAbsRests((prev) => prev.flatMap((item) => {
        if (item.type !== 'fixed') return [item];
        const converted = convertRestToFloating(item);
        return converted ? [converted] : [];
      }));
    }
    setFloatAbsRangeEnabled(checked);
    if (!checked) {
      setFloatAbsStart('');
      setFloatAbsEnd('');
    }
  };

  const handleFloatAbsBreakChange = (items: RestItem[]) => {
    if (!floatAbsFixedBreaksAllowed) {
      setFloatAbsRests(items.flatMap((item) => {
        if (item.type !== 'fixed') return [item];
        const converted = convertRestToFloating(item);
        return converted ? [converted] : [];
      }));
      return;
    }
    setFloatAbsRests(items);
  };

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  const validateShiftForm = (): string[] => {
    const errors: string[] = [];
    if (!shiftType) errors.push('نوع شیفت کاری را انتخاب کنید.');
    if (!shiftMode) errors.push('روش تعریف شیفت را انتخاب کنید.');

    const activeDays =
      shiftType === 'float-day'
        ? floatDayWorkingDays
        : shiftType === 'float-abs'
          ? floatAbsWorkingDays
          : shiftType === 'split'
            ? splitWorkingDays
            : workingDays;

    if (shiftType !== 'rotate' && activeDays.length === 0) {
      errors.push('حداقل یک روز برای این شیفت انتخاب کنید.');
    }

    if (shiftType === 'fixed') {
      if (!startTime) errors.push('ساعت ورود را مشخص کنید.');
      if (!endTime) errors.push('ساعت خروج را مشخص کنید.');
      if (startTime && endTime && !nextDay && parseTime(endTime) <= parseTime(startTime)) {
        errors.push('ساعت خروج قبل از ساعت ورود است. اگر این شیفت شبانه است، گزینه «خروج در روز بعد» را فعال کنید.');
      }
      if (validateTimeRangeUnder24Hours(startTime, endTime, nextDay)) {
        errors.push('بازه زمانی نمی‌تواند ۲۴ ساعت یا بیشتر باشد.');
      }
      if (hasFixedRestError(rests, fixedWorkRange)) errors.push('بازه استراحت باید داخل محدوده شیفت باشد.');
      if (hasOverlappingFixedRests(rests, fixedWorkRange)) errors.push('بازه‌های استراحت با یکدیگر تداخل دارند.');
      if (totalDeductedRestMinutes(rests) > grossShiftMinutes(startTime, endTime, nextDay)) {
        errors.push('مدت استراحت نمی‌تواند از مدت شیفت بیشتر باشد.');
      }
    }

    if (shiftType === 'float-day') {
      if (!shiftTitle.trim()) errors.push('عنوان شیفت را وارد کنید.');
      if (!floatDayEntryStart || !floatDayEntryEnd) errors.push('بازه مجاز ورود را کامل کنید.');
      if (floatDayEntryStart && floatDayEntryEnd && parseTime(floatDayEntryEnd) <= parseTime(floatDayEntryStart)) {
        errors.push('پایان بازه مجاز ورود باید بعد از شروع آن باشد.');
      }
      if (validateTimeRangeUnder24Hours(floatDayEntryStart, floatDayEntryEnd)) {
        errors.push('بازه زمانی نمی‌تواند ۲۴ ساعت یا بیشتر باشد.');
      }
      if (!floatDayRequiredMinutes) errors.push('مدت کار موظف را وارد کنید.');
      if (floatDayRequiredMinutes <= 0) errors.push('مدت کار موظف باید بیشتر از صفر باشد.');
      if (floatDayCoreEnabled) {
        if (!floatDayCoreStart || !floatDayCoreEnd) {
          errors.push('شروع و پایان هسته حضور را کامل کنید.');
        }
        if (floatDayCoreStart && floatDayCoreEnd && parseTime(floatDayCoreEnd) <= parseTime(floatDayCoreStart)) {
          errors.push('پایان هسته حضور باید بعد از شروع آن باشد.');
        }
        if (validateTimeRangeUnder24Hours(floatDayCoreStart, floatDayCoreEnd)) {
          errors.push('بازه زمانی نمی‌تواند ۲۴ ساعت یا بیشتر باشد.');
        }
      }
      if (totalDeductedRestMinutes(floatDayRests) > floatDayRequiredMinutes) {
        errors.push('مدت استراحت نمی‌تواند از مدت کار موظف بیشتر باشد.');
      }
      if (hasFixedRestError(floatDayRests, floatDayWorkRange)) errors.push('بازه استراحت باید داخل محدوده شیفت باشد.');
      if (hasOverlappingFixedRests(floatDayRests, floatDayWorkRange)) errors.push('بازه‌های استراحت با یکدیگر تداخل دارند.');
    }

    if (shiftType === 'float-abs') {
      if (!floatAbsRequiredMinutes) errors.push('حداقل مدت کار روزانه را وارد کنید.');
      if (floatAbsRequiredMinutes <= 0) errors.push('حداقل مدت کار روزانه باید بیشتر از صفر باشد.');
      if (floatAbsRangeEnabled) {
        if (!floatAbsStart || !floatAbsEnd) errors.push('محدوده مجاز ثبت تردد را کامل کنید.');
        if (floatAbsStart && floatAbsEnd && parseTime(floatAbsEnd) <= parseTime(floatAbsStart)) {
          errors.push('پایان محدوده مجاز ثبت تردد باید بعد از شروع آن باشد.');
        }
        if (validateTimeRangeUnder24Hours(floatAbsStart, floatAbsEnd)) {
          errors.push('بازه زمانی نمی‌تواند ۲۴ ساعت یا بیشتر باشد.');
        }
      }
      if (totalDeductedRestMinutes(floatAbsRests) > floatAbsRequiredMinutes) {
        errors.push('مدت استراحت نمی‌تواند از حداقل مدت کار روزانه بیشتر باشد.');
      }
      if (floatAbsWorkRange && hasFixedRestError(floatAbsRests, floatAbsWorkRange)) {
        errors.push('بازه استراحت ثابت باید داخل محدوده مجاز ثبت تردد باشد.');
      }
      if (floatAbsWorkRange && hasOverlappingFixedRests(floatAbsRests, floatAbsWorkRange)) {
        errors.push('بازه‌های استراحت با یکدیگر تداخل دارند.');
      }
    }

    if (shiftType === 'split') {
      if (!split1Start || !split1End || !split2Start || !split2End) {
        errors.push('شروع و پایان هر بازه کاری را مشخص کنید.');
      }
      if (!split1Start || !split1End || !split2Start || !split2End) {
        errors.push('برای شیفت دو تکه، حداقل دو بازه کاری تعریف کنید.');
      }
      if (split1Start && split1End && parseTime(split1End) <= parseTime(split1Start) && !split1NextDay) {
        errors.push('اگر پایان بازه مربوط به روز بعد است، گزینه خروج در روز بعد را فعال کنید.');
      }
      if (validateTimeRangeUnder24Hours(split1Start, split1End, split1NextDay)) {
        errors.push('بازه زمانی نمی‌تواند ۲۴ ساعت یا بیشتر باشد.');
      }
      if (split2Start && split2End && parseTime(split2End) <= parseTime(split2Start) && !split2NextDay) {
        errors.push('اگر پایان بازه مربوط به روز بعد است، گزینه خروج در روز بعد را فعال کنید.');
      }
      if (validateTimeRangeUnder24Hours(split2Start, split2End, split2NextDay)) {
        errors.push('بازه زمانی نمی‌تواند ۲۴ ساعت یا بیشتر باشد.');
      }
      if (split1WorkRange && split2WorkRange && intervalsOverlap(split1WorkRange, split2WorkRange)) {
        errors.push('بازه‌های کاری با یکدیگر تداخل دارند.');
      }
      if (hasFixedRestError(split1Rests, split1WorkRange) || hasFixedRestError(split2Rests, split2WorkRange)) {
        errors.push('بازه استراحت باید داخل یکی از بازه‌های کاری باشد.');
      }
      if (hasOverlappingFixedRests(split1Rests, split1WorkRange) || hasOverlappingFixedRests(split2Rests, split2WorkRange)) {
        errors.push('بازه‌های استراحت با یکدیگر تداخل دارند.');
      }
      const splitGrossMinutes = grossShiftMinutes(split1Start, split1End, split1NextDay) + grossShiftMinutes(split2Start, split2End, split2NextDay);
      if (totalDeductedRestMinutes([...split1Rests, ...split2Rests]) > splitGrossMinutes) {
        errors.push('مدت استراحت نمی‌تواند از مدت کارکرد کل بیشتر باشد.');
      }
    }

    return errors;
  };

  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

  const removeDayFromWorkingDays = (day: string) => {
    const remove = (days: string[]) => days.filter((item) => item !== day);
    setWorkingDays(remove);
    setFloatDayWorkingDays(remove);
    setFloatAbsWorkingDays(remove);
    setSplitWorkingDays(remove);
  };

  const stripHolidayDaysFromWorkingDays = (holidayDays: string[]) => {
    const strip = (days: string[]) => days.filter((day) => !holidayDays.includes(day));
    setWorkingDays(strip);
    setFloatDayWorkingDays(strip);
    setFloatAbsWorkingDays(strip);
    setSplitWorkingDays(strip);
  };

  const toggleWeekendDay = (day: string) => {
    setWeekends((prev) => {
      const next = toggle(prev, day);
      if (next.includes(day) && !prev.includes(day)) {
        removeDayFromWorkingDays(day);
      }
      return next;
    });
  };

  const applyTemplate = (id: string) => {
    const template = TEMPLATE_ITEMS.find((item) => item.id === id);
    if (!template) return;
    markDirty();
    setSelectedTemplateId(template.id);
    setShiftTitle(template.title);
    setStartTime(template.startTime);
    setEndTime(template.endTime);
    setNextDay(template.nextDay);
    setWorkingDays(template.workingDays);
    setRests(template.rests.map((item, index) => ({ ...item, id: `${template.id}-${index}` })));
    setShiftType('fixed');
    setShiftMode('template');
  };

  const requestShiftTypeChange = (nextType: ShiftType) => {
    if (nextType === shiftType) return;
    if (nextType === 'rotate') {
      setRotateComingSoonOpen(true);
      return;
    }
    if (isDirty) {
      setPendingShiftType(nextType);
      setShiftTypeChangeOpen(true);
      return;
    }
    setShiftType(nextType);
    if (nextType !== 'fixed') setShiftMode('manual');
  };

  const confirmShiftTypeChange = () => {
    if (!pendingShiftType) return;
    setShiftType(pendingShiftType);
    if (pendingShiftType !== 'fixed') setShiftMode('manual');
    setPendingShiftType(null);
    setShiftTypeChangeOpen(false);
    markDirty();
  };

  const handleStartTimeChange = (value: string) => {
    markDirty();
    setStartTime(value);
    const startMinutes = parseTime(value);
    const endMinutes = parseTime(endTime);
    if (startMinutes >= 20 * 60 && endMinutes < startMinutes && !nextDay) {
      setNextDay(true);
    }
  };

  const handleEndTimeChange = (value: string) => {
    markDirty();
    setEndTime(value);
    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(value);
    if (endMinutes <= startMinutes && parseTime(startTime) >= 20 * 60 && !nextDay) {
      setNextDay(true);
    }
  };

  const buildShiftConfig = () => ({
    shiftType,
    mode: shiftMode,
    templateId: selectedTemplateId,
    title: resolveCalendarShiftTitle(shiftTitle, shiftType),
    fixedShift: { startTime, endTime, endsNextDay: nextDay },
    workingDays,
    rests,
    floatingShiftStartOfDay: {
      requiredMinutes: floatDayRequiredMinutes,
      bandwidthStart: floatDayEntryStart,
      bandwidthEnd: floatDayEntryEnd,
      bandwidthEndsNextDay: false,
      coreTimeStart: floatDayCoreEnabled ? floatDayCoreStart : '',
      coreTimeEnd: floatDayCoreEnabled ? floatDayCoreEnd : '',
      rests: floatDayRests,
    },
    floatDayWorkingDays,
    absoluteFloatingShift: {
      requiredMinutes: floatAbsRequiredMinutes,
      registrationRangeEnabled: floatAbsRangeEnabled,
      startTime: floatAbsRangeEnabled ? floatAbsStart : '',
      endTime: floatAbsRangeEnabled ? floatAbsEnd : '',
      endsNextDay: false,
      rests: floatAbsRests,
    },
    floatAbsWorkingDays,
      splitShift: {
        segment1Start: split1Start,
        segment1End: split1End,
        segment1EndsNextDay: split1NextDay,
        segment1Breaks: split1Rests,
        segment2Start: split2Start,
      segment2End: split2End,
      segment2EndsNextDay: split2NextDay,
      segment2Breaks: split2Rests,
    },
    splitWorkingDays,
    rotatingItems: rotateSegments,
  });

  const confirmCalendar = async () => {
    if (!title.trim() || !year.trim()) return;
    if (draftCalendarId) {
      setCalendarConfirmed(true);
      setActiveSection('holiday');
      return;
    }

    setSaving(true);
    try {
      const result = await createCalendarDraftFromDefaultAction({
        title: title.trim(),
        description: description?.trim(),
        yearLabel: year.trim(),
      });
      setDraftCalendarId(result.id);
      setCalendarConfirmed(true);
      setActiveSection('holiday');
    } finally {
      setSaving(false);
    }
  };

  const confirmHolidays = async () => {
    if (!draftCalendarId) return;

    stripHolidayDaysFromWorkingDays(weekends);
    setSaving(true);
    setSaveError('');
    try {
      await updateCalendarHolidaysFromQuickSetupAction({
        calendarId: draftCalendarId,
        startDate: `${year}/01/01`,
        endDate: `${year}/12/29`,
        weekends,
        singleHolidays: holidays,
      });
      setHolidayConfirmed(true);
      setActiveSection('shift');
    } catch {
      setSaveError('تعطیلات ذخیره نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    const errors = validateShiftForm();
    setFormErrors(errors);
    if (errors.length > 0 || !draftCalendarId) return;

    setSaving(true);
    setSaveError('');
    try {
      const result = await updateCalendarFromQuickSetupAction({
        calendarId: draftCalendarId,
        title: title.trim(),
        description: description?.trim(),
        yearLabel: year.trim(),
        startDate: `${year}/01/01`,
        endDate: `${year}/12/29`,
        weekends,
        singleHolidays: holidays,
        shiftType,
        shiftTitle: resolveCalendarShiftTitle(shiftTitle, shiftType),
        shiftConfig: buildShiftConfig(),
      });
      setIsDirty(false);
      onComplete({
        id: result.id,
        title: result.title,
        yearLabel: result.yearLabel,
        description: result.description,
        shiftTitle: result.shiftTitle,
        shiftTypeLabel: result.shiftTypeLabel,
        holidayCount: result.holidayCount,
      });
    } catch {
      setSaveError('شیفت ذخیره نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      setExitOpen(true);
      return;
    }
    onBack();
  };

  const activeWorkingDays =
    shiftType === 'float-day'
      ? floatDayWorkingDays
      : shiftType === 'float-abs'
        ? floatAbsWorkingDays
        : shiftType === 'split'
          ? splitWorkingDays
          : workingDays;

  const rotateWizardCalendar = useMemo<CalendarShiftWizardCalendar>(
    () => ({
      id: draftCalendarId || 'draft',
      title: title.trim(),
      description: description?.trim() || null,
      yearLabel: year.trim(),
      startDate: `${year}/01/01`,
      endDate: `${year}/12/29`,
      weekends,
      singleHolidays: holidays,
    }),
    [description, draftCalendarId, holidays, title, weekends, year],
  );

  const saveRotateShift = async (payload: ShiftWizardSavePayload) => {
    if (!draftCalendarId) throw new Error('ابتدا مراحل تقویم و تعطیلات را تکمیل کنید.');

    setSaveError('');
    try {
      const result = await updateCalendarFromQuickSetupAction({
        calendarId: draftCalendarId,
        title: title.trim(),
        description: description?.trim(),
        yearLabel: year.trim(),
        startDate: `${year}/01/01`,
        endDate: `${year}/12/29`,
        weekends,
        singleHolidays: holidays,
        shiftType: payload.shiftType,
        shiftTitle: payload.shiftTitle,
        shiftConfig: payload.shiftConfig,
      });
      setIsDirty(false);
      onComplete({
        id: result.id,
        title: result.title,
        yearLabel: result.yearLabel,
        description: result.description,
        shiftTitle: result.shiftTitle,
        shiftTypeLabel: result.shiftTypeLabel,
        holidayCount: result.holidayCount,
      });
    } catch {
      setSaveError('شیفت ذخیره نشد. دوباره تلاش کنید.');
      throw new Error('save failed');
    }
  };

  const addSingleHoliday = () => {
    if (!holidayTitle.trim() || !holidayDate.trim()) return;
    setHolidays((prev) => [...prev, { id: `${Date.now()}`, title: holidayTitle.trim(), date: holidayDate.trim() }]);
    setHolidayTitle('');
    setHolidayDate('');
    setSingleHolidayDialogOpen(false);
  };

  if (isCompleted && initialCalendar) {
    return (
      <section className="rounded-xl border border-white/10 bg-slate-800/65 p-3.5 sm:p-4">
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
          <button type="button" onClick={onBack} className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-500">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-white/10 bg-slate-800/65 p-3.5 sm:p-4" dir="rtl">
      <div className="space-y-3 rounded-xl border border-white/10 bg-slate-950/45 p-4 sm:p-5">
        <SectionShell title="تقویم کاری را تعریف کنید" icon={<CalendarDays className="h-5 w-5" />} isOpen={activeSection === 'calendar'} onToggle={() => setActiveSection('calendar')}>
          <div className="w-full rounded-xl border border-indigo-500/70 bg-[linear-gradient(135deg,rgba(71,85,255,0.18),rgba(40,48,116,0.22))] p-5 text-right">
            <div className="text-sm font-bold text-slate-300">
              عنوان: <span className="text-lg text-white">{title}</span>
            </div>
            <div className="mt-3 text-sm font-bold text-slate-300">
              توضیحات: <span className="font-medium text-slate-200">{description || 'توضیحات ثبت نشده است'}</span>
            </div>
            <div className="mt-3 text-sm font-bold text-slate-300">
              سال کاری: <span className="font-medium text-slate-200">{year}</span>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-right text-xs leading-6 text-emerald-100">
            این تقویم به صورت پیش فرض برای سال جاری آماده شده است. با تایید این مرحله، یک نسخه مخصوص کسب و کار شما ساخته می شود تا در ادامه بتوانید تعطیلات و شیفت کاری را روی همان نسخه تنظیم کنید.
          </div>
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={confirmCalendar} disabled={!title.trim() || !year.trim() || saving} className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50">
              {saving && !draftCalendarId ? 'در حال ایجاد...' : 'تکمیل مرحله 1'}
            </button>
          </div>
        </SectionShell>

        <SectionShell title="تعطیلات و روزهای غیرکاری" icon={<Coffee className="h-5 w-5" />} isOpen={activeSection === 'holiday'} canOpen={calendarConfirmed} onToggle={() => setActiveSection('holiday')}>
          <div className="space-y-5 text-right">
            <div className="space-y-3">
              <div className="text-lg font-black text-white">تعطیلات هفتگی</div>
              <p className="text-xs leading-6 text-slate-400">
                روزهای انتخاب‌شده در تمام بازهٔ سال کاری ({year}) به‌عنوان تعطیل ثبت می‌شوند.
              </p>
              <div className="flex flex-wrap justify-start gap-2">
                {[...WEEK_DAYS].reverse().map((day) => (
                  <DetailToggle key={day} active={weekends.includes(day)} onClick={() => toggleWeekendDay(day)}>
                    {weekends.includes(day) ? `${day} ✓` : day}
                  </DetailToggle>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/40 p-4">
              <div className="flex flex-row-reverse items-center justify-between gap-3">
                <div className="text-base font-bold text-white">تعطیلات تکی</div>
                <button type="button" onClick={() => setSingleHolidayDialogOpen(true)} className="inline-flex flex-row-reverse items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500">
                  <Plus className="h-4 w-4" />
                  افزودن تعطیلات تکی
                </button>
              </div>
            </div>
            {holidays.length > 0 ? (
              <div className="flex flex-row-reverse flex-wrap justify-end gap-2">
                {holidays.map((item) => (
                  <div key={item.id} className="inline-flex flex-row-reverse items-center gap-2 rounded-full bg-indigo-500 px-4 py-2 text-sm text-white">
                    <button type="button" onClick={() => setHolidays((prev) => prev.filter((holiday) => holiday.id !== item.id))} className="text-rose-100 transition hover:text-white">
                      ×
                    </button>
                    <span>
                      {item.title} - {item.date}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-400">هنوز تعطیلی تکی ثبت نشده است.</div>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={confirmHolidays}
              disabled={!draftCalendarId || saving}
              className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {saving && !holidayConfirmed ? 'در حال ذخیره...' : 'تکمیل مرحله 2'}
            </button>
          </div>
        </SectionShell>

        <SectionShell title="شیفت کاری پایه را تعریف کنید" icon={<Clock3 className="h-5 w-5" />} isOpen={activeSection === 'shift'} canOpen={holidayConfirmed} onToggle={() => setActiveSection('shift')}>
          <div className="space-y-5 text-right">
            <div className="rounded-xl border border-indigo-400/20 bg-indigo-950/30 p-4">
              <div className="text-sm font-bold text-white">این شیفت برای محاسبه حضور، تأخیر، خروج زودهنگام، استراحت و مدت کارکرد کارکنان استفاده می‌شود.</div>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                در این مرحله فقط یک شیفت پایه برای شروع کار تعریف کنید. پس از تکمیل راه‌اندازی، می‌توانید برای گروه‌های کاری مختلف، شیفت‌های بیشتری بسازید.
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-lg font-bold text-white">نوع شیفت کاری</div>
              <div className="flex flex-wrap justify-start gap-1">
                {SHIFT_OPTIONS.map((option) => (
                  <ShiftHelpChip
                    key={option.id}
                    option={option}
                    active={shiftType === option.id}
                    onClick={() => requestShiftTypeChange(option.id)}
                  />
                ))}
              </div>
            </div>

            {shiftType === 'fixed' ? (
              <>
                <TitleCard title={shiftTitle} setTitle={(value) => { markDirty(); setShiftTitle(value); }} />
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-right">
                  <div className="text-sm font-bold text-emerald-100">شیفت ثابت برای تیم‌هایی مناسب است که ساعت ورود و خروج مشخص و تکرارشونده دارند.</div>
                  <p className="mt-2 text-xs leading-6 text-emerald-50/80">مثال: ۸:۰۰ تا ۱۶:۳۰</p>
                </div>
                <div className="rounded-[22px] border border-white/10 p-5">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
                    <SlidersHorizontal className="h-5 w-5 text-indigo-300" />
                    <div className="text-xl font-black text-white">تعریف شیفت ثابت</div>
                  </div>
                  <ModeSwitch mode={shiftMode} setMode={(mode) => { markDirty(); setShiftMode(mode); }} />
                  <div className="mt-6 space-y-5">
                    {shiftMode === 'template' ? (
                      <div className="space-y-4">
                        <div className="text-right text-lg font-bold text-white">قالب‌های آماده</div>
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
                                    {item.nextDay ? ' — خروج در روز بعد' : ''}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <WeekDaysEditor
                      days={workingDays}
                      calendarHolidayDays={weekends}
                      onToggle={(day) => { markDirty(); setWorkingDays((prev) => toggle(prev, day)); }}
                      error={formErrors.includes('حداقل یک روز برای این شیفت انتخاب کنید.') ? 'حداقل یک روز برای این شیفت انتخاب کنید.' : undefined}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <TimeField label="ساعت ورود" value={startTime} onChange={handleStartTimeChange} hint="زمانی که انتظار می‌رود کارمند شیفت خود را شروع کند." />
                      <div className="min-w-0 space-y-2">
                        <TimeField label="ساعت خروج" value={endTime} onChange={handleEndTimeChange} hint="زمانی که انتظار می‌رود کارمند شیفت خود را پایان دهد." />
                        <div className="flex flex-row-reverse items-center justify-end gap-2">
                          <FieldTooltip text="اگر شیفت امروز شروع می‌شود اما خروج آن مربوط به روز بعد است، این گزینه را فعال کنید. مثال: ۲۲:۰۰ تا ۶:۰۰ صبح روز بعد." />
                          <CheckboxField
                            label="خروج در روز بعد"
                            checked={nextDay}
                            onChange={(checked) => { markDirty(); setNextDay(checked); }}
                          />
                        </div>
                        {!nextDay && parseTime(endTime) <= parseTime(startTime) ? (
                          <div className="text-xs font-bold text-amber-200">اگر خروج مربوط به روز بعد است، گزینه خروج در روز بعد را فعال کنید.</div>
                        ) : null}
                      </div>
                    </div>
                    <BreakEditor items={rests} onChange={(items) => { markDirty(); setRests(items); }} workRange={fixedWorkRange} allowFixedRestEndsNextDay />
                  </div>
                </div>
              </>
            ) : null}

            {shiftType === 'float-day' ? (
              <>
                <TitleCard
                  title={shiftTitle}
                  setTitle={(value) => { markDirty(); setShiftTitle(value); }}
                  helper="این عنوان بعداً در گزارش‌ها، تنظیمات کاربران و گروه‌های کاری نمایش داده می‌شود."
                  required
                  placeholder="مثلاً: شیفت شناور اداری"
                />
                <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-4 text-right">
                  <div className="text-sm font-bold text-indigo-100">
                    در این نوع شیفت، کارمند می‌تواند در یک بازه مشخص وارد شود، اما باید مدت کار موظف را کامل کند. ساعت خروج بر اساس زمان ورود واقعی محاسبه می‌شود.
                  </div>
                  <p className="mt-2 text-xs leading-6 text-indigo-50/80">اگر بازه ورود ۷:۰۰ تا ۹:۰۰ و مدت کار موظف ۸ ساعت باشد، کارمندی که ساعت ۸:۳۰ وارد شود، خروج مورد انتظارش ۱۶:۳۰ خواهد بود.</p>
                </div>
                <div className="rounded-[22px] border border-white/10 p-5">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
                    <SlidersHorizontal className="h-5 w-5 text-indigo-300" />
                    <div className="text-xl font-black text-white">تعریف شیفت شناور شروع روز</div>
                  </div>
                  <ModeSwitch mode={shiftMode} setMode={(mode) => { markDirty(); setShiftMode(mode); }} noTemplateMessage />
                  <div className="mt-3 rounded-xl border border-indigo-400/20 bg-indigo-950/30 p-4 text-right">
                    <div className="text-sm font-bold text-white">کارمند فقط در این بازه می‌تواند ورود خود را بدون تأخیر ثبت کند.</div>
                    <p className="mt-2 text-xs leading-6 text-slate-300">ورود قبل از شروع بازه، طبق سیاست‌های تردد سازمان در مراحل بعدی قابل تنظیم است. ورود بعد از پایان بازه مجاز می‌تواند در گزارش‌ها به‌عنوان تأخیر نمایش داده شود.</p>
                  </div>
                  <div className="mt-6 space-y-5">
                    <WeekDaysEditor
                      days={floatDayWorkingDays}
                      calendarHolidayDays={weekends}
                      onToggle={(day) => { markDirty(); setFloatDayWorkingDays((prev) => toggle(prev, day)); }}
                      error={formErrors.includes('حداقل یک روز برای این شیفت انتخاب کنید.') ? 'حداقل یک روز برای این شیفت انتخاب کنید.' : undefined}
                    />
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <TimeField label="شروع بازه مجاز ورود" value={floatDayEntryStart} onChange={(value) => { markDirty(); setFloatDayEntryStart(value); }} hint="زودترین زمانی که ورود کارمند مجاز است." />
                        <TimeField label="پایان بازه مجاز ورود" value={floatDayEntryEnd} onChange={(value) => { markDirty(); setFloatDayEntryEnd(value); }} hint="آخرین زمانی که ورود کارمند بدون تأخیر پذیرفته می‌شود." />
                      </div>
                      <div className="max-w-[26rem]">
                        <DurationAmountField
                          label="مدت کار موظف"
                          value={floatDayRequiredMinutes}
                          unit={floatDayRequiredUnit}
                          onChange={(value) => { markDirty(); setFloatDayRequiredMinutesValue(value); }}
                          onUnitChange={(unit) => { markDirty(); setFloatDayRequiredUnit(unit); }}
                          hint="مدت کاری که کارمند باید پس از ورود کامل کند."
                        />
                        <p className="mt-2 text-xs leading-6 text-slate-300">خروج مورد انتظار بر اساس ساعت ورود واقعی و مدت کار موظف محاسبه می‌شود.</p>
                        {floatDayRequiredMinutes > 12 * 60 ? <p className="mt-2 text-xs font-bold text-amber-200">مدت کار موظف بیش از حد معمول است. مقدار را بررسی کنید.</p> : null}
                      </div>
                      <div className="rounded-[18px] border border-white/10 bg-slate-900/40 p-4">
                        <div className="flex flex-row-reverse items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-bold text-white">هسته حضور</div>
                            <p className="mt-2 text-xs leading-6 text-slate-400">
                              هسته حضور بازه‌ای است که با وجود شناور بودن زمان ورود، انتظار می‌رود کارمند در آن بازه حاضر باشد.
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-row-reverse gap-2">
                            <DetailToggle
                              active={floatDayCoreEnabled}
                              onClick={() => {
                                markDirty();
                                setFloatDayCoreEnabled(true);
                              }}
                            >
                              فعال
                            </DetailToggle>
                            <DetailToggle
                              active={!floatDayCoreEnabled}
                              onClick={() => {
                                markDirty();
                                setFloatDayCoreEnabled(false);
                              }}
                            >
                              غیرفعال
                            </DetailToggle>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <TimeField
                            label="شروع هسته حضور"
                            value={floatDayCoreStart}
                            onChange={(value) => {
                              markDirty();
                              setFloatDayCoreStart(value);
                            }}
                            hint="زمان شروع بازه‌ای که حضور کارمند از آن به بعد الزامی‌تر می‌شود."
                            disabled={!floatDayCoreEnabled}
                          />
                          <TimeField
                            label="پایان هسته حضور"
                            value={floatDayCoreEnd}
                            onChange={(value) => {
                              markDirty();
                              setFloatDayCoreEnd(value);
                            }}
                            hint="زمان پایان بازه‌ای که حضور کارمند تا آن زمان باید حفظ شود."
                            disabled={!floatDayCoreEnabled}
                          />
                        </div>
                      </div>
                    </div>
                    <BreakEditor
                      items={floatDayRests}
                      onChange={(items) => { markDirty(); setFloatDayRests(items); }}
                      workRange={floatDayWorkRange}
                      preferFloatingDuration
                    />
                  </div>
                </div>
              </>
            ) : null}

            {shiftType === 'float-abs' ? (
              <>
                <TitleCard title={shiftTitle} setTitle={(value) => { markDirty(); setShiftTitle(value); }} />
                <div className="rounded-[22px] border border-white/10 p-5">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
                    <SlidersHorizontal className="h-5 w-5 text-indigo-300" />
                    <div className="text-xl font-black text-white">تعریف شیفت شناور مطلق</div>
                  </div>
                  <ModeSwitch mode={shiftMode} setMode={(mode) => { markDirty(); setShiftMode(mode); }} noTemplateMessage />
                  <div className="mt-3 rounded-xl border border-indigo-400/20 bg-indigo-950/30 p-4 text-right">
                    <div className="text-sm font-bold text-white">در این نوع شیفت، ساعت ورود و خروج ثابت کنترل نمی‌شود. ملاک اصلی، مجموع کارکرد روزانه کارمند است.</div>
                    <p className="mt-2 text-xs leading-6 text-slate-300">
                      مثال: حداقل مدت کار روزانه ۶ ساعت. اگر کارمند امروز در چند نوبت مختلف مجموعاً ۶ ساعت کار کند، کارکرد روزانه او تکمیل‌شده محسوب می‌شود.
                    </p>
                  </div>
                  <div className="mt-6 space-y-5">
                    <WeekDaysEditor
                      days={floatAbsWorkingDays}
                      calendarHolidayDays={weekends}
                      onToggle={(day) => { markDirty(); setFloatAbsWorkingDays((prev) => toggle(prev, day)); }}
                      error={formErrors.includes('حداقل یک روز برای این شیفت انتخاب کنید.') ? 'حداقل یک روز برای این شیفت انتخاب کنید.' : undefined}
                    />
                    <div className="max-w-[22rem]">
                      <TimeField
                        label="حداقل مدت کار روزانه"
                        value={minutesToTime(floatAbsRequiredMinutes)}
                        onChange={(value) => { markDirty(); setFloatAbsRequiredMinutes(parseTime(value)); }}
                        hint="حداقل مجموع زمانی که کارمند باید در یک روز کاری ثبت کارکرد داشته باشد."
                      />
                      <p className="mt-2 text-xs leading-6 text-slate-300">در این مدل، کارکرد روزانه می‌تواند از یک یا چند بازه ورود و خروج تشکیل شود. ملاک، مجموع کارکرد روزانه است.</p>
                      {floatAbsRequiredMinutes > 12 * 60 ? (
                        <p className="mt-2 text-xs font-bold text-amber-200">مدت کار روزانه بیش از حد معمول است. مقدار را بررسی کنید.</p>
                      ) : null}
                    </div>
                    <div className="space-y-3 rounded-[18px] border border-white/10 bg-slate-900/40 p-4">
                      <InlineToggle
                        label="محدودیت زمانی برای ثبت تردد فعال شود"
                        checked={floatAbsRangeEnabled}
                        onChange={(checked) => {
                          markDirty();
                          setFloatAbsRangeEnabledWithConversion(checked);
                        }}
                      />
                      <div className="text-sm font-bold text-white">محدوده مجاز ثبت تردد، اختیاری</div>
                      <p className="text-xs leading-6 text-slate-400">در صورت نیاز، می‌توانید مشخص کنید ثبت ورود و خروج فقط در یک بازه زمانی خاص از روز مجاز باشد.</p>
                      {floatAbsRangeEnabled ? (
                        <div className="grid grid-cols-2 gap-4">
                          <TimeField
                            label="از ساعت"
                            value={floatAbsStart}
                            onChange={(value) => {
                              markDirty();
                              setFloatAbsStart(value);
                            }}
                            hint="زودترین زمانی که ثبت تردد در این شیفت مجاز است."
                          />
                          <TimeField
                            label="تا ساعت"
                            value={floatAbsEnd}
                            onChange={(value) => {
                              markDirty();
                              setFloatAbsEnd(value);
                            }}
                            hint="آخرین زمانی که ثبت تردد در این شیفت مجاز است."
                          />
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/30 px-3 py-2 text-xs leading-6 text-slate-300">بدون محدودیت زمانی</div>
                      )}
                    </div>
                    <BreakEditor
                      items={floatAbsRests}
                      onChange={(items) => {
                        markDirty();
                        handleFloatAbsBreakChange(items);
                      }}
                      preferFloatingDuration
                      floatingOnly={!floatAbsFixedBreaksAllowed}
                      workRange={floatAbsFixedBreaksAllowed ? floatAbsWorkRange : undefined}
                    />
                  </div>
                </div>
              </>
            ) : null}

            {shiftType === 'split' ? (
              <>
                <TitleCard title={shiftTitle} setTitle={(value) => { markDirty(); setShiftTitle(value); }} />
                <div className="rounded-[22px] border border-white/10 p-5">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
                    <SlidersHorizontal className="h-5 w-5 text-indigo-300" />
                    <div className="text-xl font-black text-white">تعریف شیفت دو تکه</div>
                  </div>
                  <ModeSwitch mode={shiftMode} setMode={(mode) => { markDirty(); setShiftMode(mode); }} noTemplateMessage />
                  <div className="mt-6 space-y-5">
                    <WeekDaysEditor
                      days={splitWorkingDays}
                      calendarHolidayDays={weekends}
                      onToggle={(day) => { markDirty(); setSplitWorkingDays((prev) => toggle(prev, day)); }}
                      error={formErrors.includes('حداقل یک روز برای این شیفت انتخاب کنید.') ? 'حداقل یک روز برای این شیفت انتخاب کنید.' : undefined}
                    />
                    <div className="space-y-4 rounded-[18px] border border-indigo-500/30 bg-slate-900/40 p-4">
                      <div className="text-right text-base font-black text-indigo-300">بازه کاری اول</div>
                      <div className="grid grid-cols-2 gap-4">
                        <TimeField label="شروع بازه کاری" value={split1Start} onChange={(value) => { markDirty(); setSplit1Start(value); }} />
                        <div className="min-w-0 space-y-2">
                          <TimeField label="پایان بازه کاری" value={split1End} onChange={(value) => { markDirty(); setSplit1End(value); }} />
                          <div className="flex justify-end">
                            <CheckboxField label="خروج در روز بعد" checked={split1NextDay} onChange={(checked) => { markDirty(); setSplit1NextDay(checked); }} />
                          </div>
                        </div>
                      </div>
                      <BreakEditor items={split1Rests} onChange={(items) => { markDirty(); setSplit1Rests(items); }} workRange={split1WorkRange} />
                    </div>
                    <div className="space-y-4 rounded-[18px] border border-indigo-500/30 bg-slate-900/40 p-4">
                      <div className="text-right text-base font-black text-indigo-300">بازه کاری دوم</div>
                      <div className="grid grid-cols-2 gap-4">
                        <TimeField label="شروع بازه کاری" value={split2Start} onChange={(value) => { markDirty(); setSplit2Start(value); }} />
                        <div className="min-w-0 space-y-2">
                          <TimeField label="پایان بازه کاری" value={split2End} onChange={(value) => { markDirty(); setSplit2End(value); }} />
                          <div className="flex justify-end">
                            <CheckboxField label="خروج در روز بعد" checked={split2NextDay} onChange={(checked) => { markDirty(); setSplit2NextDay(checked); }} />
                          </div>
                        </div>
                      </div>
                      <BreakEditor items={split2Rests} onChange={(items) => { markDirty(); setSplit2Rests(items); }} workRange={split2WorkRange} />
                    </div>
                    <div className="rounded-[18px] border border-indigo-400/25 bg-indigo-950/35 p-5 text-right">
                      <div className="text-lg font-black text-white">خلاصه شیفت</div>
                      <div className="mt-4 space-y-2 text-sm leading-7 text-slate-200">
                        <div>نوع شیفت: شیفت دو تکه</div>
                        <div>روش تعریف: {shiftMode === 'template' ? 'انتخاب از قالب آماده' : 'تعریف دستی'}</div>
                        <div>عنوان: {shiftTitle || '-'}</div>
                        <div>روزهای فعال: {formatWorkingDaysLabel(splitWorkingDays)}</div>
                        <div>بازه‌های کاری:</div>
                        <div>۱. {split1Start} تا {split1End}{split1NextDay ? ' (روز بعد)' : ''} — {formatHoursLabel(grossShiftMinutes(split1Start, split1End, split1NextDay))}</div>
                        <div>۲. {split2Start} تا {split2End}{split2NextDay ? ' (روز بعد)' : ''} — {formatHoursLabel(grossShiftMinutes(split2Start, split2End, split2NextDay))}</div>
                        <div>مدت کارکرد کل: {formatHoursLabel(grossShiftMinutes(split1Start, split1End, split1NextDay) + grossShiftMinutes(split2Start, split2End, split2NextDay))}</div>
                        <div>استراحت قابل کسر: {formatHoursLabel(totalDeductedRestMinutes([...split1Rests, ...split2Rests]))}</div>
                        <div>مدت کارکرد مفید: {formatHoursLabel(shiftDuration(split1Start, split1End, split1NextDay, split1Rests) + shiftDuration(split2Start, split2End, split2NextDay, split2Rests))}</div>
                        <div className="rounded-xl bg-slate-900/50 px-3 py-2 text-xs leading-6 text-indigo-100">
                          فاصله بین بازه‌های کاری به‌صورت خودکار استراحت محسوب نمی‌شود.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {shiftType === 'rotate' ? (
              draftCalendarId ? (
                <CalendarShiftWizard
                  key={`quick-setup-rotate-${draftCalendarId}`}
                  calendar={rotateWizardCalendar}
                  initialShiftType="rotate"
                  hideTypePicker
                  compact
                  enableBuiltinTemplatePicker={false}
                  submitLabel="ذخیره و ادامه به مدیریت کاربران"
                  onSaveShift={saveRotateShift}
                  onSaved={() => {}}
                  onCancel={() => setShiftType('fixed')}
                />
              ) : (
                <div className="rounded-[22px] border border-amber-400/25 bg-amber-950/30 p-6 text-right">
                  <div className="text-lg font-black text-white">ابتدا مراحل تقویم و تعطیلات را تکمیل کنید.</div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    برای تعریف شیفت چرخشی، باید تقویم کاری و تعطیلات را در مراحل قبل ثبت کنید.
                  </p>
                </div>
              )
            ) : null}

            {shiftType !== 'rotate' ? (
              <ShiftSummary
                shiftType={shiftType}
                shiftMode={shiftMode}
                shiftTitle={shiftTitle}
                workingDays={activeWorkingDays}
                startTime={startTime}
                endTime={endTime}
                nextDay={nextDay}
                rests={rests}
                floatDayRequiredMinutes={floatDayRequiredMinutes}
                floatDayEntryStart={floatDayEntryStart}
                floatDayEntryEnd={floatDayEntryEnd}
                floatDayCoreStart={floatDayCoreStart}
                floatDayCoreEnd={floatDayCoreEnd}
                floatDayCoreEnabled={floatDayCoreEnabled}
                floatAbsRequiredMinutes={floatAbsRequiredMinutes}
                split1Start={split1Start}
                split1End={split1End}
                split1NextDay={split1NextDay}
                split2Start={split2Start}
                split2End={split2End}
                split2NextDay={split2NextDay}
                split1Rests={split1Rests}
                split2Rests={split2Rests}
                floatDayRests={floatDayRests}
                floatAbsRests={floatAbsRests}
                floatAbsRangeEnabled={floatAbsRangeEnabled}
                floatAbsRangeStart={floatAbsStart}
                floatAbsRangeEnd={floatAbsEnd}
              />
            ) : null}

            {formErrors.length > 0 ? (
              <div className="rounded-xl border border-rose-400/25 bg-rose-950/40 px-4 py-3 text-right">
                {formErrors.map((error) => (
                  <div key={error} className="text-xs font-bold leading-6 text-rose-200">
                    {error}
                  </div>
                ))}
              </div>
            ) : null}

            {saveError ? (
              <div className="rounded-xl border border-rose-400/25 bg-rose-950/40 px-4 py-3 text-right text-sm font-bold text-rose-200">{saveError}</div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={handleBack} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white transition-colors hover:border-white/20">
                <ArrowLeft className="h-4 w-4" />
              </button>
              {shiftType !== 'rotate' ? (
                <button
                  dir="rtl"
                  type="button"
                  onClick={() => void save()}
                  disabled={saving}
                  className="inline-flex flex-row-reverse items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'در حال ثبت...' : 'ذخیره و ادامه به مدیریت کاربران'}
                  <Check className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </SectionShell>
      </div>

      {shiftTypeChangeOpen ? (
        <div className="fixed inset-0 z-[100] bg-black/65" onClick={() => setShiftTypeChangeOpen(false)}>
          <div
            className="fixed left-1/2 top-1/2 z-[101] w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-slate-900 p-4 text-right text-slate-100"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-lg font-black text-white">تغییر نوع شیفت</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">با تغییر نوع شیفت، برخی اطلاعات واردشده پاک یا غیرقابل استفاده می‌شود. ادامه می‌دهید؟</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={confirmShiftTypeChange} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">
                ادامه
              </button>
              <button type="button" onClick={() => { setShiftTypeChangeOpen(false); setPendingShiftType(null); }} className="rounded-xl border border-white/10 px-4 py-2 text-sm">
                انصراف
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {rotateComingSoonOpen ? (
        <div className="fixed inset-0 z-[100] bg-black/65" onClick={() => setRotateComingSoonOpen(false)}>
          <div
            className="fixed left-1/2 top-1/2 z-[101] w-[min(100%-2rem,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-900 p-5 text-right text-slate-100 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-lg font-black text-white">شیفت چرخشی</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">این قابلیت به‌زودی اضافه می‌شود.</p>
            <p className="mt-2 text-xs leading-6 text-slate-400">
              زیرساخت این بخش آماده است، اما تعریف و مدیریت شیفت‌های چرخشی در نسخه‌های بعدی فعال خواهد شد.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setRotateComingSoonOpen(false)}
                className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-400"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {exitOpen ? (
        <div className="fixed inset-0 z-[100] bg-black/65" onClick={() => setExitOpen(false)}>
          <div
            className="fixed left-1/2 top-1/2 z-[101] w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-slate-900 p-4 text-right text-slate-100"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-lg font-black text-white">تغییرات شما ذخیره نشده است</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">آیا می‌خواهید بدون ذخیره خارج شوید؟</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={onBack} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white">
                بدون ذخیره خارج شوم
              </button>
              <button type="button" onClick={() => setExitOpen(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm">
                انصراف
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {singleHolidayDialogOpen ? (
        <div className="fixed inset-0 z-[100] bg-black/65" onClick={() => setSingleHolidayDialogOpen(false)}>
          <div
            className="fixed left-1/2 top-1/2 z-[101] w-[min(100%-2rem,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-slate-900 p-4 text-right text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-xl font-black text-white">افزودن تعطیلات تکی</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">برای ثبت هر تعطیلی، عنوان مناسب و تاریخ دقیق آن روز را وارد کنید.</p>
            <div className="mt-5 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-bold text-white">عنوان تعطیلی</span>
                <input
                  value={holidayTitle}
                  onChange={(event) => setHolidayTitle(event.target.value)}
                  placeholder="مثلا تاسیس شرکت"
                  className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-3 text-sm text-white outline-none focus:border-indigo-400"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-bold text-white">تاریخ تعطیلی</span>
                <input
                  value={holidayDate}
                  onChange={(event) => setHolidayDate(event.target.value)}
                  placeholder="1405/01/01"
                  className="w-full rounded-xl border border-slate-600 bg-slate-900/60 px-3 py-3 text-sm text-white outline-none focus:border-indigo-400"
                />
              </label>
            </div>
            <div className="mt-6 flex items-center justify-between gap-3">
              <button type="button" onClick={addSingleHoliday} disabled={!holidayTitle.trim() || !holidayDate.trim()} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
                ثبت تعطیلی
              </button>
              <button type="button" onClick={() => setSingleHolidayDialogOpen(false)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-200">
                بستن
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
