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
import { ConfirmDialog } from '../../../../../components/ConfirmDialog';
import { addCalendarShiftAction } from '../../../../../lib/actions';
import { normalizePersianDateInput } from '../../../../../lib/calendar-events';
import { resolveCalendarShiftTitle } from '../../../../../lib/calendar-shifts';
import { calculateTimeRangeDurationMinutes, validateTimeRangeUnder24Hours } from '../../../../../lib/time-range-validation';
import type { ShiftTemplatePickerItem } from '../../../../../lib/shift-template-picker';
import { RotateShiftComingSoonModal } from './RotateShiftComingSoonModal';
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
    hintTitle: 'شیفت ثابت',
    hintDescription: 'شیفت ثابت برای تیم‌هایی مناسب است که ساعت ورود و خروج مشخص و تکرارشونده دارند.',
    hintExample: 'مثال: ۸:۰۰ تا ۱۶:۳۰',
  },
  {
    id: 'float-day',
    label: 'شیفت شناور شروع روز',
    hintTitle: 'شیفت شناور شروع روز',
    hintDescription: 'در این نوع شیفت، کارمند می‌تواند در یک بازه مشخص وارد شود، اما باید مدت کار موظف را کامل کند. ساعت خروج بر اساس زمان ورود واقعی محاسبه می‌شود.',
    hintExample: 'مثال: ورود ۷:۰۰ تا ۹:۰۰ و تکمیل ۸ ساعت کار.',
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
    hintDescription: 'در این نوع شیفت، روز کاری از دو یا چند بازه کاری جدا تشکیل می شود. فاصله بین بازه ها الزاماً استراحت محسوب نمی شود.',
    hintExample: 'بازه کاری اول 08:00 تا 12:00 و بازه کاری دوم 16:00 تا 20:00. مدت کارکرد کل 8 ساعت است و فاصله بین دو بازه به صورت خودکار استراحت محاسبه نمی شود.',
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

function intervalGapMinutes(first: WorkRange, second: WorkRange) {
  const firstEnd = rangeEndMinutes(first);
  let secondStart = parseTime(second.start);

  while (secondStart < firstEnd) {
    secondStart += 24 * 60;
  }

  return Math.max(secondStart - firstEnd, 0);
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

function DurationCard({ minutes, label = 'مدت شیفت' }: { minutes: number; label?: string }) {
  return (
    <div className={cn('rounded-[18px] px-5 py-4 text-right', minutes >= 24 * 60 ? 'bg-rose-950/70' : 'bg-indigo-950/70')}>
      <div className="text-sm text-slate-300">{label}</div>
      <div className={cn('mt-2 text-5xl font-black', minutes >= 24 * 60 ? 'text-rose-400' : 'text-indigo-400')}>{formatDuration(minutes)}</div>
      {minutes >= 24 * 60 ? <div className="mt-1 text-xs text-rose-300">بازه زمانی نمی‌تواند ۲۴ ساعت یا بیشتر باشد.</div> : null}
    </div>
  );
}

function TitleCard({
  title,
  setTitle,
  helper,
  error,
  placeholder = 'مثلاً: شیفت صبح اداری، شیفت عصر فروشگاه، شیفت ویژه تعطیل',
}: {
  title: string;
  setTitle: (value: string) => void;
  helper?: string;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 p-5">
      <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500 text-indigo-300">i</div>
        <div className="text-xl font-black text-white">اطلاعات پایه شیفت</div>
      </div>
      <label className="mt-6 block space-y-2 text-right">
        <span className="text-sm font-bold text-white">عنوان شیفت</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-xl border bg-slate-900/60 px-4 py-3 text-right text-sm text-white outline-none transition-colors focus:border-indigo-400',
            error ? 'border-rose-400/60' : 'border-slate-600',
          )}
        />
        {helper ? (
          <p className="text-xs leading-6 text-slate-400">{helper}</p>
        ) : (
          <p className="text-xs leading-6 text-slate-400">نامی برای این شیفت وارد کنید؛ مثل شیفت صبح اداری یا شیفت عصر فروشگاه.</p>
        )}
        {error ? <small className="block text-xs font-bold text-rose-300">{error}</small> : null}
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
            انتخاب از قالب آماده
          </button>
        </div>
      </div>
      {noTemplateMessage && mode === 'template' ? <div className="mt-4 text-right text-sm text-slate-400">قالبی برای این نوع شیفت ثبت نشده است</div> : null}
    </>
  );
}

function WeekDaysEditor({
  days,
  onToggle,
  calendarHolidayDays = [],
}: {
  days: string[];
  onToggle: (day: string) => void;
  calendarHolidayDays?: string[];
}) {
  const selectedHolidayDays = days.filter((day) => calendarHolidayDays.includes(day));

  return (
    <div className="space-y-3 text-right">
      <div className="flex flex-row-reverse items-center justify-end gap-2 text-xl font-black text-white">
        <span>روزهای فعال</span>
        <CalendarDays className="h-5 w-5 text-slate-300" />
      </div>
      <div className="flex flex-wrap justify-start gap-2">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="relative inline-flex flex-col items-center gap-1">
            <DetailToggle active={days.includes(day)} onClick={() => onToggle(day)}>
              {days.includes(day) ? `${day} ✓` : day}
            </DetailToggle>
            {calendarHolidayDays.includes(day) ? (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-200">تعطیل در تقویم</span>
            ) : null}
          </div>
        ))}
      </div>
      {selectedHolidayDays.length > 0 ? (
        <div className="rounded-xl border border-amber-400/25 bg-amber-950/30 px-3 py-2 text-xs leading-6 text-amber-100">
          این روز در تقویم کاری تعطیل ثبت شده است. با انتخاب آن، این شیفت برای همان روز فعال خواهد شد.
        </div>
      ) : (
        <div className="text-sm text-slate-400">روزهای غیرفعال شده در تقویم فعلی شما تعطیل هستند.</div>
      )}
    </div>
  );
}

function LockedDayField({ dayContext }: { dayContext: CalendarShiftDayContext }) {
  return (
    <div className="calendar-shift-locked-day text-right">
      <div className="flex flex-row-reverse items-center justify-end gap-2 text-base font-black text-white">
        <span>تاریخ اعمال شیفت</span>
        <CalendarDays className="h-5 w-5 text-slate-300" />
      </div>
      <div className="calendar-shift-locked-day-value">
        <strong>{dayContext.date}</strong>
        <span>{dayContext.weekdayName}</span>
      </div>
      <p className="calendar-shift-locked-day-hint">این شیفت فقط برای همین روز ثبت می‌شود.</p>
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
      <div className="rounded-xl border border-slate-600 bg-slate-700/40 px-4 py-3 text-right text-sm font-bold text-slate-200">مدت شناور</div>
    );
  }

  return (
    <div className="space-y-2 text-right">
      <span className="text-xs font-bold text-slate-400">نوع استراحت</span>
      <div className="rounded-full bg-slate-950/80 p-1">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange('fixed')}
            className={cn('rounded-full px-4 py-3 text-sm font-bold transition-colors', value === 'fixed' ? 'bg-slate-700 text-white' : 'text-slate-400')}
          >
            بازه ثابت
          </button>
          <button
            type="button"
            onClick={() => onChange('floating')}
            className={cn('rounded-full px-4 py-3 text-sm font-bold transition-colors', value === 'floating' ? 'bg-slate-700 text-white' : 'text-slate-400')}
          >
            مدت شناور
          </button>
        </div>
      </div>
    </div>
  );
}

function DeductToggle({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return <InlineToggle label="کسر از کارکرد روزانه" checked={checked} onChange={onChange} />;
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
          className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-500"
        >
          <Plus className="h-5 w-5" />
        </button>
        <div dir="rtl" className="flex flex-row-reverse items-center gap-2 text-xl font-black text-white">
          <span>استراحت ها</span>
          <FieldTooltip text="اگر فعال باشد، مدت این استراحت از کارکرد روزانه کم می‌شود." />
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
  forcedIncludedDates?: string[];
  hideWorkingDaysEditor?: boolean;
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
  forcedIncludedDates = [],
  hideWorkingDaysEditor = false,
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
  const groupedIncludedDates = forcedIncludedDates.map((item) => normalizePersianDateInput(item)).filter(Boolean);
  const fixedShift = asObject(baseShiftConfig.fixedShift);
  const floatDayConfig = asObject(baseShiftConfig.floatingShiftStartOfDay);
  const floatAbsConfig = asObject(baseShiftConfig.absoluteFloatingShift);
  const splitConfig = asObject(baseShiftConfig.splitShift);

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
  const [saveError, setSaveError] = useState('');
  const [holidayConfirmOpen, setHolidayConfirmOpen] = useState(false);
  const [rotateComingSoonOpen, setRotateComingSoonOpen] = useState(false);
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
  const initialFloatDayRequiredMinutes = Number(floatDayConfig.requiredMinutes ?? 480) || 480;
  const [floatDayRequiredMinutes, setFloatDayRequiredMinutes] = useState(initialFloatDayRequiredMinutes);
  const [floatDayRequiredUnit, setFloatDayRequiredUnit] = useState<RestUnit>(initialFloatDayRequiredMinutes % 60 === 0 ? 'hours' : 'minutes');
  const [floatDayEntryStart, setFloatDayEntryStart] = useState(String(floatDayConfig.bandwidthStart ?? '08:00'));
  const [floatDayEntryEnd, setFloatDayEntryEnd] = useState(String(floatDayConfig.bandwidthEnd ?? '16:00'));
  const [floatDayCoreStart, setFloatDayCoreStart] = useState(String(floatDayConfig.coreTimeStart ?? '10:00'));
  const [floatDayCoreEnd, setFloatDayCoreEnd] = useState(String(floatDayConfig.coreTimeEnd ?? '14:00'));
  const [floatDayCoreEnabled, setFloatDayCoreEnabled] = useState(Boolean(floatDayConfig.coreTimeStart && floatDayConfig.coreTimeEnd));
  const [floatDayRests, setFloatDayRests] = useState<RestItem[]>(normalizeRests(floatDayConfig.rests ?? baseShiftConfig.floatDayRests, []));

  const [floatAbsWorkingDays, setFloatAbsWorkingDays] = useState<string[]>(
    stringArray(baseShiftConfig.floatAbsWorkingDays, defaultWorkingDaysForContext),
  );
  const [floatAbsRequiredMinutes, setFloatAbsRequiredMinutes] = useState(Number(floatAbsConfig.requiredMinutes ?? 480) || 480);
  const [floatAbsStart, setFloatAbsStart] = useState(String(floatAbsConfig.startTime ?? '08:00'));
  const [floatAbsEnd, setFloatAbsEnd] = useState(String(floatAbsConfig.endTime ?? '16:00'));
  const [floatAbsRests, setFloatAbsRests] = useState<RestItem[]>(
    normalizeAbsoluteFloatingRests(floatAbsConfig.rests ?? baseShiftConfig.floatAbsRests, true),
  );

  const [splitWorkingDays, setSplitWorkingDays] = useState<string[]>(
    stringArray(baseShiftConfig.splitWorkingDays, defaultWorkingDaysForContext),
  );
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
  const floatAbsWorkRange = useMemo<WorkRange | undefined>(() => {
    if (!floatAbsStart || !floatAbsEnd) return undefined;
    if (parseTime(floatAbsEnd) <= parseTime(floatAbsStart)) return undefined;
    return { start: floatAbsStart, end: floatAbsEnd, nextDay: false };
  }, [floatAbsEnd, floatAbsStart]);
  const floatAbsFixedBreaksAllowed = Boolean(floatAbsWorkRange);
  const floatAbsDeducted = useMemo(() => totalDeductedRestMinutes(floatAbsRests), [floatAbsRests]);
  const floatAbsNetMinutes = useMemo(() => Math.max(floatAbsRequiredMinutes - floatAbsDeducted, 0), [floatAbsDeducted, floatAbsRequiredMinutes]);
  const split1WorkRange = useMemo<WorkRange>(() => ({ start: split1Start, end: split1End, nextDay: split1NextDay }), [split1End, split1NextDay, split1Start]);
  const split2WorkRange = useMemo<WorkRange>(() => ({ start: split2Start, end: split2End, nextDay: split2NextDay }), [split2End, split2NextDay, split2Start]);

  const fixedTotalMinutes = useMemo(() => shiftDuration(startTime, endTime, nextDay, rests), [endTime, nextDay, rests, startTime]);
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
  const splitTotalMinutes = useMemo(
    () => shiftDuration(split1Start, split1End, split1NextDay, split1Rests) + shiftDuration(split2Start, split2End, split2NextDay, split2Rests),
    [split1End, split1NextDay, split1Rests, split1Start, split2End, split2NextDay, split2Rests, split2Start],
  );
  const splitGapMinutes = useMemo(() => intervalGapMinutes(split1WorkRange, split2WorkRange), [split1WorkRange, split2WorkRange]);

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

  const getFixedShiftErrors = () => {
    const errors: string[] = [];
    if (!dayContext && groupedIncludedDates.length === 0 && workingDays.length === 0) errors.push('حداقل یک روز برای این شیفت انتخاب کنید.');
    if (!shiftTitle.trim()) errors.push('عنوان شیفت را وارد کنید.');
    if (!startTime) errors.push('ساعت ورود را وارد کنید.');
    if (!endTime) errors.push('ساعت خروج را وارد کنید.');
    if (startTime && endTime && !nextDay && parseTime(endTime) <= parseTime(startTime)) {
      errors.push('اگر خروج در روز بعد انجام می‌شود، گزینه خروج در روز بعد را فعال کنید.');
    }
    if (validateTimeRangeUnder24Hours(startTime, endTime, nextDay)) {
      errors.push('بازه زمانی نمی‌تواند ۲۴ ساعت یا بیشتر باشد.');
    }
    if (hasFixedRestError(rests, fixedWorkRange)) errors.push('بازه استراحت باید داخل محدوده شیفت باشد.');
    if (hasOverlappingFixedRests(rests, fixedWorkRange)) errors.push('بازه‌های استراحت با یکدیگر تداخل دارند.');
    if (totalDeductedRestMinutes(rests) > grossShiftMinutes(startTime, endTime, nextDay)) {
      errors.push('مدت استراحت نمی‌تواند از مدت شیفت بیشتر باشد.');
    }
    return errors;
  };

  const getFloatDayErrors = () => {
    const errors: string[] = [];
    if (!dayContext && groupedIncludedDates.length === 0 && floatDayWorkingDays.length === 0) errors.push('حداقل یک روز برای این شیفت انتخاب کنید.');
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
    if (hasFixedRestError(floatDayRests, floatDayWorkRange)) {
      errors.push('بازه استراحت باید داخل محدوده شیفت باشد.');
    }
    if (hasOverlappingFixedRests(floatDayRests, floatDayWorkRange)) {
      errors.push('بازه‌های استراحت با یکدیگر تداخل دارند.');
    }
    return errors;
  };

  const fixedShiftErrors = shiftType === 'fixed' ? getFixedShiftErrors() : [];
  const floatDayErrors = shiftType === 'float-day' ? getFloatDayErrors() : [];
  const floatAbsErrors = (() => {
    if (shiftType !== 'float-abs') return [] as string[];
    const errors: string[] = [];
    if (!shiftTitle.trim()) errors.push('عنوان شیفت را وارد کنید.');
    if (!dayContext && groupedIncludedDates.length === 0 && floatAbsWorkingDays.length === 0) errors.push('حداقل یک روز برای این شیفت انتخاب کنید.');
    if (!floatAbsRequiredMinutes) errors.push('حداقل مدت کار روزانه را وارد کنید.');
    if (floatAbsRequiredMinutes <= 0) errors.push('حداقل مدت کار روزانه باید بیشتر از صفر باشد.');
    if (!floatAbsStart || !floatAbsEnd) errors.push('محدوده مجاز ثبت تردد را کامل کنید.');
    if (floatAbsStart && floatAbsEnd && parseTime(floatAbsEnd) <= parseTime(floatAbsStart)) {
      errors.push('پایان محدوده مجاز ثبت تردد باید بعد از شروع آن باشد.');
    }
    if (validateTimeRangeUnder24Hours(floatAbsStart, floatAbsEnd)) {
      errors.push('بازه زمانی نمی‌تواند ۲۴ ساعت یا بیشتر باشد.');
    }
    if (floatAbsDeducted > floatAbsRequiredMinutes) {
      errors.push('مدت استراحت نمی‌تواند از حداقل مدت کار روزانه بیشتر باشد.');
    }
    if (floatAbsWorkRange && hasFixedRestError(floatAbsRests, floatAbsWorkRange)) {
      errors.push('بازه استراحت ثابت باید داخل محدوده مجاز ثبت تردد باشد.');
    }
    if (hasOverlappingFixedRests(floatAbsRests, floatAbsWorkRange)) {
      errors.push('بازه‌های استراحت با یکدیگر تداخل دارند.');
    }
    return errors;
  })();

  const splitErrors = (() => {
    if (shiftType !== 'split') return [] as string[];
    const errors: string[] = [];
    if (!shiftTitle.trim()) errors.push('عنوان شیفت را وارد کنید.');
    if (!dayContext && groupedIncludedDates.length === 0 && splitWorkingDays.length === 0) errors.push('حداقل یک روز برای این شیفت انتخاب کنید.');
    if (!split1Start || !split1End) errors.push('شروع و پایان بازه اول کاری را کامل کنید.');
    if (!split2Start || !split2End) errors.push('شروع و پایان بازه دوم کاری را کامل کنید.');

    if (split1Start && split1End && !split1NextDay && parseTime(split1End) <= parseTime(split1Start)) {
      errors.push('پایان بازه اول باید بعد از شروع آن باشد. اگر پایان در روز بعد است، گزینه خروج در روز بعد را فعال کنید.');
    }
    if (split2Start && split2End && !split2NextDay && parseTime(split2End) <= parseTime(split2Start)) {
      errors.push('پایان بازه دوم باید بعد از شروع آن باشد. اگر پایان در روز بعد است، گزینه خروج در روز بعد را فعال کنید.');
    }
    if (validateTimeRangeUnder24Hours(split1Start, split1End, split1NextDay)) {
      errors.push('بازه اول نمی‌تواند ۲۴ ساعت یا بیشتر باشد.');
    }
    if (validateTimeRangeUnder24Hours(split2Start, split2End, split2NextDay)) {
      errors.push('بازه دوم نمی‌تواند ۲۴ ساعت یا بیشتر باشد.');
    }
    if (intervalsOverlap(split1WorkRange, split2WorkRange)) {
      errors.push('دو بازه کاری نباید با یکدیگر هم‌پوشانی داشته باشند.');
    }
    if (split1Start && split1End && split2Start && split2End && rangeEndMinutes(split1WorkRange) > parseTime(split2Start) && split2NextDay === false) {
      errors.push('بازه دوم باید بعد از بازه اول شروع شود.');
    }
    if (hasFixedRestError(split1Rests, split1WorkRange)) {
      errors.push('استراحت‌های بازه اول باید داخل همان بازه ثبت شوند.');
    }
    if (hasFixedRestError(split2Rests, split2WorkRange)) {
      errors.push('استراحت‌های بازه دوم باید داخل همان بازه ثبت شوند.');
    }
    if (hasOverlappingFixedRests(split1Rests, split1WorkRange)) {
      errors.push('استراحت‌های بازه اول با هم تداخل دارند.');
    }
    if (hasOverlappingFixedRests(split2Rests, split2WorkRange)) {
      errors.push('استراحت‌های بازه دوم با هم تداخل دارند.');
    }
    if (totalDeductedRestMinutes([...split1Rests, ...split2Rests]) > grossShiftMinutes(split1Start, split1End, split1NextDay) + grossShiftMinutes(split2Start, split2End, split2NextDay)) {
      errors.push('مدت استراحت نمی‌تواند از مدت کل دو بازه بیشتر باشد.');
    }
    return errors;
  })();

  const hasWeekdaySchedule = (days: string[]) => Boolean(dayContext) || days.length > 0;
  const hasGroupSchedule = groupedIncludedDates.length > 0;
  const hasSchedule = (days: string[]) => Boolean(dayContext) || hasGroupSchedule || days.length > 0;
  const fixedReady =
    shiftType === 'fixed' &&
    fixedShiftErrors.length === 0 &&
    hasSchedule(workingDays) &&
    grossShiftMinutes(startTime, endTime, nextDay) < 24 * 60;
  const floatDayReady =
    shiftType === 'float-day' &&
    floatDayErrors.length === 0 &&
    hasSchedule(floatDayWorkingDays);
  const floatAbsReady =
    shiftType === 'float-abs' &&
    floatAbsErrors.length === 0 &&
    hasSchedule(floatAbsWorkingDays);
  const splitGrossMinutes = grossShiftMinutes(split1Start, split1End, split1NextDay) + grossShiftMinutes(split2Start, split2End, split2NextDay);
  const splitReady =
    shiftType === 'split' &&
    splitErrors.length === 0 &&
    hasSchedule(splitWorkingDays) &&
    splitTotalMinutes <= 24 * 60;
  const rotateReady =
    shiftType === 'rotate' &&
    rotateSegments.length > 0 &&
    rotateSegments.every(
      (segment) =>
        segment.kind === 'off' ||
        !hasFixedRestError(segment.rests, { start: segment.start, end: segment.end, nextDay: segment.nextDay }),
    );
  const canSave = Boolean(fixedReady || floatDayReady || floatAbsReady || splitReady || rotateReady);

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
      setFloatDayRequiredMinutesValue(Number(floatDay.requiredMinutes ?? 480) || 480);
      setFloatDayEntryStart(String(floatDay.bandwidthStart ?? '08:00'));
      setFloatDayEntryEnd(String(floatDay.bandwidthEnd ?? '16:00'));
      setFloatDayCoreStart(String(floatDay.coreTimeStart ?? '10:00'));
      setFloatDayCoreEnd(String(floatDay.coreTimeEnd ?? '14:00'));
      setFloatDayCoreEnabled(Boolean(floatDay.coreTimeStart && floatDay.coreTimeEnd));
      setFloatDayRests(normalizeRests(floatDay.rests, floatDayRests));
      return;
    }

    if (template.shiftType === 'float-abs') {
      const floatAbs = asObject(config.absoluteFloatingShift);
      setFloatAbsWorkingDays(template.weekDays.length > 0 ? template.weekDays : stringArray(config.floatAbsWorkingDays, DEFAULT_WORKING_DAYS));
      setFloatAbsRequiredMinutes(Number(floatAbs.requiredMinutes ?? 480) || 480);
      setFloatAbsStart(String(floatAbs.startTime ?? '08:00'));
      setFloatAbsEnd(String(floatAbs.endTime ?? '16:00'));
      setFloatAbsRests(normalizeAbsoluteFloatingRests(floatAbs.rests, true));
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
    const scheduleDates = singleDayDate ? [singleDayDate] : groupedIncludedDates;
    const scheduleFields = scheduleDates.length > 0
      ? {
          includedDates: scheduleDates,
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
      title: resolveCalendarShiftTitle(shiftTitle, shiftType),
      fixedShift: { startTime, endTime, endsNextDay: nextDay },
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
      absoluteFloatingShift: {
        requiredMinutes: floatAbsRequiredMinutes,
        registrationRangeEnabled: true,
        startTime: floatAbsStart,
        endTime: floatAbsEnd,
        endsNextDay: false,
        rests: floatAbsRests,
      },
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
      rotatingItems: rotateSegments,
      ...scheduleFields,
    };
  };

  const persistShift = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError('');
    try {
      const payload: ShiftWizardSavePayload = {
        shiftType,
        shiftTitle: resolveCalendarShiftTitle(shiftTitle, shiftType),
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
    } catch {
      setSaveError('شیفت ذخیره نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    if (!canSave) return;
    if (dayContext?.isHoliday && !holidayConfirmOpen) {
      setHolidayConfirmOpen(true);
      return;
    }
    await persistShift();
  };

  const resolvedSubmitLabel = submitLabel ?? (isTemplatePurpose ? 'ثبت قالب' : 'ذخیره شیفت');

  return (
    <section
      className={compact ? 'calendar-shift-wizard is-compact' : 'rounded-xl border border-white/10 bg-slate-800/65 p-3.5 sm:p-4'}
      dir="rtl"
    >
      <div className={compact ? 'calendar-shift-wizard-inner' : 'space-y-3 rounded-xl border border-white/10 bg-slate-950/45 p-4 sm:p-5'}>
        <div className={compact ? 'calendar-shift-wizard-content' : 'space-y-5 text-right'}>
            {dayContext ? <LockedDayField dayContext={dayContext} /> : null}

            {dayContext?.isHoliday ? (
              <p className="calendar-shift-holiday-hint">
                این روز تعطیل است. ثبت شیفت مجاز است، اما در صورت کارکرد ممکن است ضریب تعطیل هفتگی در حقوق و
                دستمزد اعمال شود.
              </p>
            ) : null}

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
                        if (option.id === 'rotate') {
                          setRotateComingSoonOpen(true);
                          return;
                        }
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

            {dayContext && enableBuiltinTemplatePicker && shiftMode === 'template' ? (
              <div className="rounded-xl border border-indigo-400/20 bg-indigo-950/30 px-4 py-3 text-right text-xs leading-6 text-indigo-100">
                اگر قالب آماده را تغییر دهید، تغییرات فقط برای این روز ذخیره می‌شود و قالب اصلی تغییر نمی‌کند.
              </div>
            ) : null}

            {shiftType === 'fixed' ? (
              <>
                <TitleCard
                  title={shiftTitle}
                  setTitle={setShiftTitle}
                  helper="نامی برای این شیفت وارد کنید؛ مثل شیفت صبح اداری یا شیفت عصر فروشگاه."
                  placeholder="مثلاً: شیفت صبح اداری، شیفت عصر فروشگاه، شیفت ویژه تعطیل"
                />
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-right">
                  <div className="text-sm font-bold text-emerald-100">شیفت ثابت برای تیم‌هایی مناسب است که ساعت ورود و خروج مشخص و تکرارشونده دارند.</div>
                  <p className="mt-2 text-xs leading-6 text-emerald-50/80">مثال: ۸:۰۰ تا ۱۶:۳۰</p>
                </div>
                <div className="rounded-[22px] border border-white/10 p-5">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
                    <SlidersHorizontal className="h-5 w-5 text-indigo-300" />
                    <div className="text-xl font-black text-white">شیفت کاری پایه را تعریف کنید</div>
                  </div>
                  {enableBuiltinTemplatePicker ? <ModeSwitch mode={shiftMode} setMode={setShiftMode} /> : null}
                  <div className="mt-3 rounded-xl border border-indigo-400/20 bg-indigo-950/30 p-4 text-right">
                    <div className="text-sm font-bold text-white">این شیفت برای محاسبه حضور، تأخیر، خروج زودهنگام، استراحت و مدت کارکرد کارکنان استفاده می‌شود.</div>
                    <p className="mt-2 text-xs leading-6 text-slate-300">
                      در این مرحله فقط یک شیفت پایه برای شروع کار تعریف کنید. پس از تکمیل راه‌اندازی، می‌توانید برای گروه‌های کاری مختلف، شیفت‌های بیشتری بسازید.
                    </p>
                  </div>
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
                    {!dayContext && !hideWorkingDaysEditor ? (
                      <WeekDaysEditor
                        days={workingDays}
                        calendarHolidayDays={weekends}
                        onToggle={(day) => setWorkingDays((prev) => toggle(prev, day))}
                      />
                    ) : null}
                    <div className="grid grid-cols-2 gap-4">
                      <TimeField label="ساعت ورود" value={startTime} onChange={setStartTime} hint="زمانی که انتظار می‌رود کارمند شیفت خود را شروع کند." />
                      <div className="min-w-0 space-y-2">
                        <TimeField label="ساعت خروج" value={endTime} onChange={setEndTime} hint="زمانی که انتظار می‌رود کارمند شیفت خود را پایان دهد." />
                        <div className="flex justify-end">
                          <CheckboxField label="خروج در روز بعد" checked={nextDay} onChange={setNextDay} />
                        </div>
                        <p className="text-xs leading-6 text-slate-400">اگر ساعت خروج بعد از نیمه‌شب و در روز بعد است، این گزینه را فعال کنید.</p>
                      </div>
                    </div>
                    <BreakEditor items={rests} onChange={setRests} workRange={fixedWorkRange} allowFixedRestEndsNextDay />
                    {fixedShiftErrors.length > 0 ? (
                      <div className="rounded-xl border border-rose-400/25 bg-rose-950/40 px-4 py-3 text-right">
                        {fixedShiftErrors.map((error) => (
                          <div key={error} className="text-xs font-bold leading-6 text-rose-200">
                            {error}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div className="rounded-[18px] border border-indigo-400/25 bg-indigo-950/35 p-5 text-right">
                      <div className="text-lg font-black text-white">خلاصه شیفت</div>
                      {fixedReady ? (
                        <div className="mt-4 space-y-2 text-sm leading-7 text-slate-200">
                          <div>نوع شیفت: شیفت ثابت</div>
                          {dayContext ? <div>تاریخ اعمال: فقط همان روز انتخاب‌شده ({dayContext.date})</div> : null}
                          {!isTemplatePurpose ? <div>روش تعریف: {shiftMode === 'template' ? 'انتخاب از قالب آماده' : 'تعریف دستی'}</div> : null}
                          <div>عنوان: {shiftTitle}</div>
                          <div>{dayContext ? 'تاریخ انتخاب‌شده' : 'روزهای اعمال شیفت'}: {dayContext ? dayContext.date : formatWorkingDaysLabel(workingDays)}</div>
                          <div>ساعت شروع کار: {startTime}</div>
                          <div>ساعت پایان کار: {endTime}{nextDay ? ' (روز بعد)' : ''}</div>
                          <div>خروج در روز بعد: {nextDay ? 'بله' : 'خیر'}</div>
                          <div>مدت استراحت: {formatDuration(totalDeductedRestMinutes(rests))}</div>
                          <div>مدت کل شیفت: {formatDuration(grossShiftMinutes(startTime, endTime, nextDay))}</div>
                          <div>مدت کار خالص: {formatDuration(fixedTotalMinutes)}</div>
                        </div>
                      ) : (
                        <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm leading-7 text-slate-300">
                          برای نمایش خلاصه، اطلاعات شیفت را کامل کنید.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {shiftType === 'float-day' ? (
              <>
                <TitleCard
                  title={shiftTitle}
                  setTitle={setShiftTitle}
                  helper="این عنوان بعداً در گزارش‌ها، تنظیمات کاربران و گروه‌های کاری نمایش داده می‌شود. در صورت خالی بودن، نام پیش‌فرض بر اساس نوع شیفت استفاده می‌شود."
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
                  {enableBuiltinTemplatePicker ? <ModeSwitch mode={shiftMode} setMode={setShiftMode} /> : null}
                  <div className="mt-3 rounded-xl border border-indigo-400/20 bg-indigo-950/30 p-4 text-right">
                    <div className="text-sm font-bold text-white">کارمند فقط در این بازه می‌تواند ورود خود را بدون تأخیر ثبت کند.</div>
                    <p className="mt-2 text-xs leading-6 text-slate-300">ورود قبل از شروع بازه، طبق سیاست‌های تردد سازمان در مراحل بعدی قابل تنظیم است. ورود بعد از پایان بازه مجاز می‌تواند در گزارش‌ها به‌عنوان تأخیر نمایش داده شود.</p>
                  </div>
                  <div className="mt-6 space-y-5">
                    {!dayContext && !hideWorkingDaysEditor ? (
                      <WeekDaysEditor
                        days={floatDayWorkingDays}
                        calendarHolidayDays={weekends}
                        onToggle={(day) => setFloatDayWorkingDays((prev) => toggle(prev, day))}
                      />
                    ) : null}
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <TimeField label="شروع بازه مجاز ورود" value={floatDayEntryStart} onChange={setFloatDayEntryStart} hint="زودترین زمانی که ورود کارمند مجاز است." />
                        <TimeField label="پایان بازه مجاز ورود" value={floatDayEntryEnd} onChange={setFloatDayEntryEnd} hint="آخرین زمانی که ورود کارمند بدون تأخیر پذیرفته می‌شود." />
                      </div>
                      <div className="max-w-[26rem]">
                        <DurationAmountField
                          label="مدت کار موظف"
                          value={floatDayRequiredMinutes}
                          unit={floatDayRequiredUnit}
                          onChange={setFloatDayRequiredMinutesValue}
                          onUnitChange={setFloatDayRequiredUnit}
                          hint="مدت کاری که کارمند باید پس از ورود کامل کند."
                        />
                        <p className="mt-2 text-xs leading-6 text-slate-300">خروج مورد انتظار بر اساس ساعت ورود واقعی و مدت کار موظف محاسبه می‌شود.</p>
                        {floatDayRequiredMinutes > 12 * 60 ? (
                          <p className="mt-2 text-xs font-bold text-amber-200">مدت کار موظف بیش از حد معمول است. مقدار را بررسی کنید.</p>
                        ) : null}
                      </div>
                      <div className="rounded-[18px] border border-white/10 bg-slate-900/40 p-4">
                        <div className="flex flex-row-reverse items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-white">
                              <span>بازه حضور الزامی</span>
                              <FieldTooltip text="اگر فعال باشد، کارمند باید در این بازه حتماً حاضر باشد؛ حتی اگر زمان ورود شناور باشد." />
                            </div>
                            <p className="mt-2 text-xs leading-6 text-slate-400">
                              بازه حضور الزامی، بخشی از روز است که انتظار می‌رود کارمند در آن حاضر باشد.
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-row-reverse gap-2">
                            <DetailToggle active={floatDayCoreEnabled} onClick={() => setFloatDayCoreEnabled(true)}>
                              فعال
                            </DetailToggle>
                            <DetailToggle active={!floatDayCoreEnabled} onClick={() => setFloatDayCoreEnabled(false)}>
                              غیرفعال
                            </DetailToggle>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <TimeField
                            label="شروع بازه حضور الزامی"
                            value={floatDayCoreStart}
                            onChange={setFloatDayCoreStart}
                            hint="زمان شروع بازه‌ای که حضور کارمند از آن به بعد الزامی‌تر می‌شود."
                            disabled={!floatDayCoreEnabled}
                          />
                          <TimeField
                            label="پایان بازه حضور الزامی"
                            value={floatDayCoreEnd}
                            onChange={setFloatDayCoreEnd}
                            hint="زمان پایان بازه‌ای که حضور کارمند تا آن زمان باید حفظ شود."
                            disabled={!floatDayCoreEnabled}
                          />
                        </div>
                      </div>
                    </div>
                    <BreakEditor
                      items={floatDayRests}
                      onChange={setFloatDayRests}
                      workRange={floatDayWorkRange}
                      preferFloatingDuration
                    />
                    {floatDayErrors.length > 0 ? (
                      <div className="rounded-xl border border-rose-400/25 bg-rose-950/40 px-4 py-3 text-right">
                        {floatDayErrors.map((error) => (
                          <div key={error} className="text-xs font-bold leading-6 text-rose-200">
                            {error}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div className="rounded-[18px] border border-indigo-400/25 bg-indigo-950/35 p-5 text-right">
                      <div className="text-lg font-black text-white">خلاصه شیفت</div>
                      {floatDayReady ? (
                        <div className="mt-4 space-y-2 text-sm leading-7 text-slate-200">
                          <div>نوع شیفت: شیفت شناور شروع روز</div>
                          {dayContext ? <div>تاریخ اعمال: فقط همان روز انتخاب‌شده ({dayContext.date})</div> : null}
                          {!isTemplatePurpose ? <div>روش تعریف: {shiftMode === 'template' ? 'انتخاب از قالب آماده' : 'تعریف دستی'}</div> : null}
                          <div>عنوان: {shiftTitle}</div>
                          <div>روزهای اعمال شیفت: {formatWorkingDaysLabel(floatDayWorkingDays)}</div>
                          <div>بازه مجاز ورود: {floatDayEntryStart} تا {floatDayEntryEnd}</div>
                          <div>
                            بازه مجاز خروج:{' '}
                            {formatFloatDayPermittedExitRange(floatDayEntryStart, floatDayEntryEnd, floatDayRequiredMinutes)}
                          </div>
                          <div>مدت کار مورد انتظار: {formatDuration(floatDayRequiredMinutes)}</div>
                          {floatDayCoreEnabled && floatDayCoreStart && floatDayCoreEnd ? (
                            <div>بازه حضور الزامی: {floatDayCoreStart} تا {floatDayCoreEnd}</div>
                          ) : null}
                          <div>استراحت قابل کسر: {formatDuration(floatDayDeducted)}</div>
                          <div>مدت کارکرد مفید در گزارش: {formatDuration(floatDayNetMinutes)}</div>
                          <div className="rounded-xl bg-slate-900/50 px-3 py-2 text-xs leading-6 text-indigo-100">
                            <div>نمونه محاسبه:</div>
                            <div>اگر کارمند ساعت {floatDaySampleEntry} وارد شود:</div>
                            <div>خروج مورد انتظار: {floatDaySampleExit}</div>
                            <div>وضعیت ورود: {floatDaySampleStatus}</div>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm leading-7 text-slate-300">
                          برای نمایش خلاصه، اطلاعات شیفت را کامل کنید.
                        </p>
                      )}
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
                    <div className="text-xl font-black text-white">تعریف شیفت شناور مطلق</div>
                  </div>
                  {enableBuiltinTemplatePicker ? <ModeSwitch mode={shiftMode} setMode={setShiftMode} /> : null}
                  <div className="mt-3 rounded-xl border border-indigo-400/20 bg-indigo-950/30 p-4 text-right">
                    <div className="text-sm font-bold text-white">در این نوع شیفت، ساعت ورود و خروج ثابت کنترل نمی‌شود. ملاک اصلی، مجموع کارکرد روزانه کارمند است.</div>
                    <p className="mt-2 text-xs leading-6 text-slate-300">
                      مثال: حداقل مدت کار روزانه ۶ ساعت. اگر کارمند امروز در چند نوبت مختلف مجموعاً ۶ ساعت کار کند، کارکرد روزانه او تکمیل‌شده محسوب می‌شود.
                    </p>
                  </div>
                  <div className="mt-6 space-y-5">
                    {!dayContext && !hideWorkingDaysEditor ? (
                      <WeekDaysEditor
                        days={floatAbsWorkingDays}
                        calendarHolidayDays={weekends}
                        onToggle={(day) => setFloatAbsWorkingDays((prev) => toggle(prev, day))}
                      />
                    ) : null}
                    <div className="max-w-[22rem]">
                      <TimeField
                        label="حداقل مدت کار روزانه"
                        value={minutesToTime(floatAbsRequiredMinutes)}
                        onChange={(value) => setFloatAbsRequiredMinutes(parseTime(value))}
                        hint="حداقل مجموع زمانی که کارمند باید در یک روز کاری ثبت کارکرد داشته باشد."
                      />
                      <p className="mt-2 text-xs leading-6 text-slate-300">در این مدل، کارکرد روزانه می‌تواند از یک یا چند بازه ورود و خروج تشکیل شود. ملاک، مجموع کارکرد روزانه است.</p>
                      {floatAbsRequiredMinutes > 12 * 60 ? (
                        <p className="mt-2 text-xs font-bold text-amber-200">مدت کار روزانه بیش از حد معمول است. مقدار را بررسی کنید.</p>
                      ) : null}
                    </div>
                    <div className="space-y-3 rounded-[18px] border border-white/10 bg-slate-900/40 p-4">
                      <div className="text-sm font-bold text-white">
                        <b>*</b> بازه مجاز ثبت تردد
                      </div>
                      <p className="text-xs leading-6 text-slate-400">ثبت ورود و خروج فقط در این بازه زمانی مجاز است.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <TimeField
                          label="شروع بازه مجاز ثبت تردد"
                          value={floatAbsStart}
                          onChange={setFloatAbsStart}
                          hint="زودترین زمانی که ثبت تردد در این شیفت مجاز است."
                        />
                        <TimeField
                          label="پایان بازه مجاز ثبت تردد"
                          value={floatAbsEnd}
                          onChange={setFloatAbsEnd}
                          hint="آخرین زمانی که ثبت تردد در این شیفت مجاز است."
                        />
                      </div>
                    </div>
                    <BreakEditor
                      items={floatAbsRests}
                      onChange={handleFloatAbsBreakChange}
                      preferFloatingDuration
                      floatingOnly={!floatAbsFixedBreaksAllowed}
                      workRange={floatAbsFixedBreaksAllowed ? floatAbsWorkRange : undefined}
                    />
                    {floatAbsErrors.length > 0 ? (
                      <div className="rounded-xl border border-rose-400/25 bg-rose-950/40 px-4 py-3 text-right">
                        {floatAbsErrors.map((error) => (
                          <div key={error} className="text-xs font-bold leading-6 text-rose-200">
                            {error}
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <div className="rounded-[18px] border border-indigo-400/25 bg-indigo-950/35 p-5 text-right">
                      <div className="text-lg font-black text-white">خلاصه شیفت</div>
                      {floatAbsReady ? (
                        <div className="mt-4 space-y-2 text-sm leading-7 text-slate-200">
                          <div>نوع شیفت: شیفت شناور مطلق</div>
                          {dayContext ? <div>تاریخ اعمال: فقط همان روز انتخاب‌شده ({dayContext.date})</div> : null}
                          {!isTemplatePurpose ? <div>روش تعریف: {shiftMode === 'template' ? 'انتخاب از قالب آماده' : 'تعریف دستی'}</div> : null}
                          <div>عنوان: {shiftTitle}</div>
                          <div>روزهای اعمال شیفت: {formatWorkingDaysLabel(floatAbsWorkingDays)}</div>
                          <div>مدت کار مورد انتظار: {formatDuration(floatAbsRequiredMinutes)}</div>
                          <div>بازه مجاز ثبت تردد: {floatAbsStart && floatAbsEnd ? `${floatAbsStart} تا ${floatAbsEnd}` : 'نامشخص'}</div>
                          <div>استراحت قابل کسر: {formatDuration(floatAbsDeducted)}</div>
                          <div>مدت کارکرد مفید مورد انتظار: {formatDuration(floatAbsNetMinutes)}</div>
                          <div className="rounded-xl bg-slate-900/50 px-3 py-2 text-xs leading-6 text-indigo-100">
                            <div>در این نوع شیفت، تأخیر بر اساس ساعت ورود محاسبه نمی‌شود؛ ملاک، تکمیل حداقل کارکرد روزانه است.</div>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm leading-7 text-slate-300">
                          برای نمایش خلاصه، اطلاعات شیفت را کامل کنید.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {shiftType === 'split' ? (
              <>
                <div className="space-y-4 rounded-[22px] border border-white/10 p-5">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
                    <div className="flex flex-row-reverse items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/70 bg-indigo-500/10 text-sm font-black text-indigo-200">1</span>
                      <div className="text-xl font-black text-white">اطلاعات پایه شیفت</div>
                    </div>
                    <SlidersHorizontal className="h-5 w-5 text-indigo-300" />
                  </div>
                  <TitleCard title={shiftTitle} setTitle={setShiftTitle} />
                  {enableBuiltinTemplatePicker ? <ModeSwitch mode={shiftMode} setMode={setShiftMode} /> : null}
                  {!dayContext && !hideWorkingDaysEditor ? (
                    <WeekDaysEditor
                      days={splitWorkingDays}
                      calendarHolidayDays={weekends}
                      onToggle={(day) => setSplitWorkingDays((prev) => toggle(prev, day))}
                    />
                  ) : null}
                  <div className="rounded-xl border border-indigo-400/20 bg-indigo-950/25 px-4 py-3 text-xs leading-6 text-indigo-100">
                    این نوع شیفت فقط زمانی ذخیره می‌شود که هر دو بازه کاری و استراحت‌های هر بازه جداگانه تکمیل شوند.
                  </div>
                </div>

                <div className="space-y-4 rounded-[22px] border border-white/10 p-5">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
                    <div className="flex flex-row-reverse items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/70 bg-indigo-500/10 text-sm font-black text-indigo-200">2</span>
                      <div className="text-xl font-black text-white">بازه اول کاری</div>
                    </div>
                    <div className="text-xs font-bold text-slate-400">استراحت‌های این بخش فقط از همین بازه کسر می‌شوند.</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <TimeField label="شروع بازه اول کاری" value={split1Start} onChange={setSplit1Start} />
                    <div className="min-w-0 space-y-2">
                      <TimeField label="پایان بازه اول کاری" value={split1End} onChange={setSplit1End} />
                      <div className="flex justify-end">
                        <CheckboxField label="پایان در روز بعد" checked={split1NextDay} onChange={setSplit1NextDay} />
                      </div>
                    </div>
                  </div>
                  <BreakEditor items={split1Rests} onChange={setSplit1Rests} workRange={split1WorkRange} />
                </div>

                <div className="space-y-4 rounded-[22px] border border-white/10 p-5">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
                    <div className="flex flex-row-reverse items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/70 bg-indigo-500/10 text-sm font-black text-indigo-200">3</span>
                      <div className="text-xl font-black text-white">بازه دوم کاری</div>
                    </div>
                    <div className="text-xs font-bold text-slate-400">این بازه مستقل از بازه اول است و استراحت‌های خودش را دارد.</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <TimeField label="شروع بازه دوم کاری" value={split2Start} onChange={setSplit2Start} />
                    <div className="min-w-0 space-y-2">
                      <TimeField label="پایان بازه دوم کاری" value={split2End} onChange={setSplit2End} />
                      <div className="flex justify-end">
                        <CheckboxField label="پایان در روز بعد" checked={split2NextDay} onChange={setSplit2NextDay} />
                      </div>
                    </div>
                  </div>
                  <BreakEditor items={split2Rests} onChange={setSplit2Rests} workRange={split2WorkRange} />
                </div>

                <div className="rounded-[18px] border border-indigo-400/25 bg-indigo-950/35 p-5 text-right">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-indigo-400/20 pb-4">
                    <div className="flex flex-row-reverse items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-300/50 bg-indigo-400/10 text-sm font-black text-indigo-100">4</span>
                      <div className="text-lg font-black text-white">خلاصه شیفت</div>
                    </div>
                    <FieldTooltip text="فاصله بین دو نوبت کاری، استراحت محسوب نمی‌شود و از کارکرد کسر نمی‌شود." />
                  </div>
                  {splitErrors.length > 0 ? (
                    <div className="mt-4 space-y-2 rounded-xl border border-rose-400/25 bg-rose-950/35 px-4 py-3 text-xs leading-6 text-rose-200">
                      {splitErrors.map((error) => (
                        <div key={error} className="font-bold">
                          {error}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {splitReady ? (
                    <div className="mt-4 space-y-2 text-sm leading-7 text-slate-200">
                      <div>نوع شیفت: شیفت دو تکه</div>
                      {dayContext ? <div>تاریخ اعمال: فقط همان روز انتخاب‌شده ({dayContext.date})</div> : null}
                      {!isTemplatePurpose ? <div>روش تعریف: {shiftMode === 'template' ? 'انتخاب از قالب آماده' : 'تعریف دستی'}</div> : null}
                      <div>عنوان: {shiftTitle || '-'}</div>
                      <div>روزهای اعمال شیفت: {formatWorkingDaysLabel(splitWorkingDays)}</div>
                      <div>
                        بازه اول کاری: {split1Start} تا {split1End}
                        {split1NextDay ? ' (روز بعد)' : ''} - {formatDuration(grossShiftMinutes(split1Start, split1End, split1NextDay))}
                      </div>
                      <div>
                        بازه دوم کاری: {split2Start} تا {split2End}
                        {split2NextDay ? ' (روز بعد)' : ''} - {formatDuration(grossShiftMinutes(split2Start, split2End, split2NextDay))}
                      </div>
                      <div>فاصله بین دو نوبت کاری: {formatDuration(splitGapMinutes)}</div>
                      <div>مدت کارکرد کل: {formatDuration(splitGrossMinutes)}</div>
                      <div>استراحت قابل کسر بازه اول: {formatDuration(totalDeductedRestMinutes(split1Rests))}</div>
                      <div>استراحت قابل کسر بازه دوم: {formatDuration(totalDeductedRestMinutes(split2Rests))}</div>
                      <div>استراحت قابل کسر کل: {formatDuration(totalDeductedRestMinutes([...split1Rests, ...split2Rests]))}</div>
                      <div>مدت کارکرد مفید: {formatDuration(splitTotalMinutes)}</div>
                      <div
                        className={cn(
                          'rounded-xl px-3 py-2 text-xs leading-6',
                          splitGapMinutes < 30 || splitGapMinutes > 8 * 60 ? 'border border-amber-400/25 bg-amber-950/35 text-amber-100' : 'bg-slate-900/50 text-indigo-100',
                        )}
                      >
                        {splitGapMinutes < 30
                          ? 'فاصله بین دو نوبت کاری خیلی کوتاه است؛ اگر این فاصله عمدی نیست، دوباره بررسی کنید.'
                          : splitGapMinutes > 8 * 60
                            ? 'فاصله بین دو نوبت کاری طولانی است؛ مطمئن شوید این فاصله عمداً به‌عنوان زمان بدون کار تعریف شده است.'
                            : 'این فاصله نه استراحت است و نه کارکرد؛ فقط فاصله بین دو نوبت کاری است.'}
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm leading-7 text-slate-300">
                      برای نمایش خلاصه، اطلاعات شیفت را کامل کنید.
                    </p>
                  )}
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
                  {enableBuiltinTemplatePicker ? <ModeSwitch mode={shiftMode} setMode={setShiftMode} /> : null}
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

            {saveError ? (
              <div className="rounded-xl border border-rose-400/25 bg-rose-950/40 px-4 py-3 text-right text-sm font-bold text-rose-200">{saveError}</div>
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

      <ConfirmDialog
        open={holidayConfirmOpen}
        title="ثبت شیفت در روز تعطیل"
        description="این روز به‌عنوان تعطیل ثبت شده است. افزودن شیفت در روز تعطیل ممکن است به‌عنوان کار در تعطیل یا اضافه‌کاری محاسبه شود. آیا ادامه می‌دهید؟"
        confirmLabel="ادامه و افزودن شیفت"
        cancelLabel="انصراف"
        onCancel={() => setHolidayConfirmOpen(false)}
        onConfirm={() => {
          setHolidayConfirmOpen(false);
          void persistShift();
        }}
      />

      <RotateShiftComingSoonModal open={rotateComingSoonOpen} onClose={() => setRotateComingSoonOpen(false)} />
    </section>
  );
}
