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
import { createCalendarDraftFromDefaultAction, updateCalendarFromQuickSetupAction } from '../../../lib/actions';
import { resolveCalendarShiftTitle } from '../../../lib/calendar-shifts';
import type { CompletedCalendarItem, DefaultCalendarTemplate } from './quick-setup.types';

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
    hintDescription: 'مناسب برای تیم‌هایی که ساعت ورود و خروج مشخص و تکرارشونده دارند.',
    hintExample: 'مثال: ۸:۰۰ تا ۱۶:۳۰',
  },
  {
    id: 'float-day',
    label: 'شیفت شناور شروع روز',
    hintTitle: 'شیفت شناور شروع روز',
    hintDescription: 'مناسب زمانی که کارمند می‌تواند در یک بازه مشخص وارد شود، اما باید مدت مشخصی کار کند.',
    hintExample: 'مثال: ورود بین ۷ تا ۹ و تکمیل ۸ ساعت کار',
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
    hintDescription: 'مناسب برای کسب‌وکارهایی که ساعت کاری آن‌ها در دو بازه جدا انجام می‌شود.',
    hintExample: 'مثال: ۸ تا ۱۲ و ۱۶ تا ۲۰',
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

function TitleCard({ title, setTitle, error }: { title: string; setTitle: (value: string) => void; error?: string }) {
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
          placeholder="مثلاً: شیفت صبح اداری"
          className={cn(
            'w-full rounded-xl border bg-slate-900/60 px-4 py-3 text-right text-sm text-white outline-none transition-colors focus:border-indigo-400',
            error ? 'border-rose-400/60' : 'border-slate-600',
          )}
        />
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
        {[...WEEK_DAYS].reverse().map((day) => {
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
  workingDays,
  startTime,
  endTime,
  nextDay,
  rests,
  floatDayRequiredMinutes,
  floatDayEntryStart,
  floatAbsRequiredMinutes,
  split1Start,
  split1End,
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
  workingDays: string[];
  startTime: string;
  endTime: string;
  nextDay: boolean;
  rests: RestItem[];
  floatDayRequiredMinutes: number;
  floatDayEntryStart: string;
  floatAbsRequiredMinutes: number;
  split1Start: string;
  split1End: string;
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
  let extra = '';

  if (shiftType === 'fixed') {
    deducted = totalDeductedRestMinutes(rests);
    netWork = shiftDuration(startTime, endTime, nextDay, rests);
    workTime = `${startTime} تا ${endTime}${nextDay ? ' (روز بعد)' : ''}`;
  } else if (shiftType === 'float-day') {
    deducted = totalDeductedRestMinutes(floatDayRests);
    netWork = floatDayRequiredMinutes;
    const sampleExit = minutesToTime(parseTime(floatDayEntryStart) + floatDayRequiredMinutes + deducted);
    extra = `اگر کارمند ساعت ${floatDayEntryStart} وارد شود، خروج مورد انتظار پس از تکمیل مدت کار موظف حدود ${sampleExit} خواهد بود.`;
  } else if (shiftType === 'float-abs') {
    deducted = totalDeductedRestMinutes(floatAbsRests);
    netWork = floatAbsRequiredMinutes;
    extra = 'ملاک محاسبه، مجموع کارکرد روزانه است.';
  } else if (shiftType === 'split') {
    deducted = totalDeductedRestMinutes([...split1Rests, ...split2Rests]);
    netWork = shiftDuration(split1Start, split1End, false, split1Rests) + shiftDuration(split2Start, split2End, split2NextDay, split2Rests);
    workTime = `${split1Start} تا ${split1End} و ${split2Start} تا ${split2End}${split2NextDay ? ' (روز بعد)' : ''}`;
  }

  if (shiftType === 'rotate') return null;

  return (
    <div className="rounded-[22px] border border-indigo-400/25 bg-indigo-950/35 p-5 text-right">
      <div className="text-lg font-black text-white">خلاصه شیفت</div>
      <div className="mt-4 space-y-2 text-sm leading-7 text-slate-200">
        <div>نوع شیفت: {shiftLabel}</div>
        <div>روش تعریف: {modeLabel}</div>
        <div>روزهای فعال: {daysLabel}</div>
        {shiftType !== 'float-abs' && shiftType !== 'float-day' ? <div>ساعت کار: {workTime}</div> : null}
        {shiftType === 'float-day' ? <div>مدت کار موظف: {formatHoursLabel(floatDayRequiredMinutes)}</div> : null}
        {shiftType === 'float-abs' ? <div>حداقل مدت کار روزانه: {formatHoursLabel(floatAbsRequiredMinutes)}</div> : null}
        {deducted > 0 ? <div>استراحت قابل کسر: {deducted} دقیقه</div> : null}
        {netWork > 0 ? <div>مدت کارکرد مفید: {formatHoursLabel(netWork)}</div> : null}
        {extra ? <div className="mt-2 rounded-xl bg-slate-900/50 px-3 py-2 text-xs leading-6 text-indigo-100">{extra}</div> : null}
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
  const [pendingShiftType, setPendingShiftType] = useState<ShiftType | null>(null);
  const [exitOpen, setExitOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [shiftType, setShiftType] = useState<ShiftType>((baseShiftConfig.shiftType as ShiftType | undefined) ?? 'fixed');
  const [shiftMode, setShiftMode] = useState<ShiftMode>((baseShiftConfig.mode as ShiftMode | undefined) ?? 'manual');
  const [selectedTemplateId, setSelectedTemplateId] = useState(String(baseShiftConfig.templateId ?? ''));
  const [shiftTitle, setShiftTitle] = useState(baseCalendar?.shiftTitle ?? 'شیفت صبح اداری');

  const [workingDays, setWorkingDays] = useState<string[]>(stringArray(baseShiftConfig.workingDays, DEFAULT_WORKING_DAYS));
  const [startTime, setStartTime] = useState(String(fixedShift.startTime ?? baseShiftConfig.startTime ?? '08:00'));
  const [endTime, setEndTime] = useState(String(fixedShift.endTime ?? baseShiftConfig.endTime ?? '16:30'));
  const [nextDay, setNextDay] = useState(Boolean(fixedShift.endsNextDay ?? baseShiftConfig.nextDay ?? false));
  const [rests, setRests] = useState<RestItem[]>(normalizeRests(baseShiftConfig.rests, [
    createRest('fixed'),
    { ...createRest('floating'), id: 'floating-rest', deductFromWork: false },
  ]));

  const [floatDayWorkingDays, setFloatDayWorkingDays] = useState<string[]>(stringArray(baseShiftConfig.floatDayWorkingDays, DEFAULT_WORKING_DAYS));
  const [floatDayRequiredMinutes, setFloatDayRequiredMinutes] = useState(Number(floatDayConfig.requiredMinutes ?? 480) || 480);
  const [floatDayEntryStart, setFloatDayEntryStart] = useState(String(floatDayConfig.bandwidthStart ?? '08:00'));
  const [floatDayEntryEnd, setFloatDayEntryEnd] = useState(String(floatDayConfig.bandwidthEnd ?? '16:00'));
  const [floatDayEntryEndsNextDay, setFloatDayEntryEndsNextDay] = useState(Boolean(floatDayConfig.bandwidthEndsNextDay ?? false));
  const [floatDayCoreStart, setFloatDayCoreStart] = useState(String(floatDayConfig.coreTimeStart ?? '10:00'));
  const [floatDayCoreEnd, setFloatDayCoreEnd] = useState(String(floatDayConfig.coreTimeEnd ?? '14:00'));
  const [floatDayRests, setFloatDayRests] = useState<RestItem[]>(normalizeRests(floatDayConfig.rests ?? baseShiftConfig.floatDayRests, []));

  const [floatAbsWorkingDays, setFloatAbsWorkingDays] = useState<string[]>(stringArray(baseShiftConfig.floatAbsWorkingDays, DEFAULT_WORKING_DAYS));
  const [floatAbsRequiredMinutes, setFloatAbsRequiredMinutes] = useState(Number(floatAbsConfig.requiredMinutes ?? 480) || 480);
  const [floatAbsStart, setFloatAbsStart] = useState(String(floatAbsConfig.startTime ?? '08:00'));
  const [floatAbsEnd, setFloatAbsEnd] = useState(String(floatAbsConfig.endTime ?? '16:00'));
  const [floatAbsNextDay, setFloatAbsNextDay] = useState(Boolean(floatAbsConfig.endsNextDay ?? false));
  const [floatAbsRests, setFloatAbsRests] = useState<RestItem[]>(normalizeRests(floatAbsConfig.rests ?? baseShiftConfig.floatAbsRests, []));

  const [splitWorkingDays, setSplitWorkingDays] = useState<string[]>(stringArray(baseShiftConfig.splitWorkingDays, DEFAULT_WORKING_DAYS));
  const [split1Start, setSplit1Start] = useState(String(splitConfig.segment1Start ?? '08:00'));
  const [split1End, setSplit1End] = useState(String(splitConfig.segment1End ?? '12:00'));
  const [split1Rests, setSplit1Rests] = useState<RestItem[]>(normalizeRests(splitConfig.segment1Breaks, []));
  const [split2Start, setSplit2Start] = useState(String(splitConfig.segment2Start ?? '16:00'));
  const [split2End, setSplit2End] = useState(String(splitConfig.segment2End ?? '20:00'));
  const [split2NextDay, setSplit2NextDay] = useState(Boolean(splitConfig.segment2EndsNextDay ?? false));
  const [split2Rests, setSplit2Rests] = useState<RestItem[]>(normalizeRests(splitConfig.segment2Breaks, []));

  const [rotateSegments, setRotateSegments] = useState<RotateSegment[]>(normalizeSegments(baseShiftConfig.rotatingItems));

  const fixedWorkRange = useMemo<WorkRange>(() => ({ start: startTime, end: endTime, nextDay }), [endTime, nextDay, startTime]);
  const floatDayDeducted = useMemo(() => floatDayRests.reduce((sum, item) => sum + restMinutes(item), 0), [floatDayRests]);
  const floatDayWorkRange = useMemo<WorkRange>(() => {
    const exitEnd = parseTime(floatDayEntryStart) + floatDayRequiredMinutes + floatDayDeducted;
    return {
      start: floatDayEntryStart,
      end: minutesToTime(exitEnd % (24 * 60)),
      nextDay: exitEnd >= 24 * 60,
    };
  }, [floatDayDeducted, floatDayEntryStart, floatDayRequiredMinutes]);
  const split1WorkRange = useMemo<WorkRange>(() => ({ start: split1Start, end: split1End, nextDay: false }), [split1End, split1Start]);
  const split2WorkRange = useMemo<WorkRange>(() => ({ start: split2Start, end: split2End, nextDay: split2NextDay }), [split2End, split2NextDay, split2Start]);

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  const validateShiftForm = (): string[] => {
    const errors: string[] = [];
    if (!shiftType) errors.push('نوع شیفت کاری را انتخاب کنید.');
    if (!shiftMode) errors.push('روش تعریف شیفت را انتخاب کنید.');
    if (!shiftTitle.trim()) errors.push('عنوان شیفت را وارد کنید.');

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
      if (!nextDay && parseTime(endTime) <= parseTime(startTime)) {
        errors.push('اگر خروج مربوط به روز بعد است، گزینه خروج در روز بعد را فعال کنید.');
      }
      if (hasFixedRestError(rests, fixedWorkRange)) errors.push('استراحت خارج از بازه شیفت است.');
      if (totalDeductedRestMinutes(rests) > shiftDuration(startTime, endTime, nextDay, [])) {
        errors.push('مدت استراحت نمی‌تواند از مدت شیفت بیشتر باشد.');
      }
    }

    if (shiftType === 'float-day') {
      if (!floatDayEntryStart || !floatDayEntryEnd) errors.push('بازه مجاز ورود را کامل کنید.');
      if (!floatDayRequiredMinutes) errors.push('مدت کار موظف را وارد کنید.');
      if (hasFixedRestError(floatDayRests, floatDayWorkRange)) errors.push('استراحت خارج از بازه شیفت است.');
    }

    if (shiftType === 'float-abs') {
      if (!floatAbsRequiredMinutes) errors.push('حداقل مدت کار روزانه را وارد کنید.');
    }

    if (shiftType === 'split') {
      if (!split1Start || !split1End || !split2Start || !split2End) {
        errors.push('شروع و پایان هر بازه کاری را مشخص کنید.');
      }
      if (hasFixedRestError(split1Rests, split1WorkRange) || hasFixedRestError(split2Rests, split2WorkRange)) {
        errors.push('استراحت خارج از بازه شیفت است.');
      }
    }

    return errors;
  };

  const toggle = (list: string[], value: string) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

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
      bandwidthEndsNextDay: floatDayEntryEndsNextDay,
      coreTimeStart: floatDayCoreStart,
      coreTimeEnd: floatDayCoreEnd,
      rests: floatDayRests,
    },
    floatDayWorkingDays,
    absoluteFloatingShift: {
      requiredMinutes: floatAbsRequiredMinutes,
      startTime: floatAbsStart,
      endTime: floatAbsEnd,
      endsNextDay: floatAbsNextDay,
      rests: floatAbsRests,
    },
    floatAbsWorkingDays,
    splitShift: {
      segment1Start: split1Start,
      segment1End: split1End,
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

  const rotateAdvancedHref = draftCalendarId
    ? `/calendars/${draftCalendarId}?returnTo=${encodeURIComponent('/quick-setup')}`
    : `/shift-templates?returnTo=${encodeURIComponent('/quick-setup')}`;

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
              <div className="flex flex-wrap justify-start gap-2">
                {[...WEEK_DAYS].reverse().map((day) => (
                  <DetailToggle key={day} active={weekends.includes(day)} onClick={() => setWeekends((prev) => toggle(prev, day))}>
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
              onClick={() => {
                setHolidayConfirmed(true);
                setActiveSection('shift');
              }}
              className="rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
            >
              تکمیل مرحله 2
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
                <TitleCard title={shiftTitle} setTitle={(value) => { markDirty(); setShiftTitle(value); }} error={formErrors.includes('عنوان شیفت را وارد کنید.') ? 'عنوان شیفت را وارد کنید.' : undefined} />
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
                      <TimeField label="ساعت ورود" value={startTime} onChange={handleStartTimeChange} />
                      <div className="min-w-0 space-y-2">
                        <TimeField label="ساعت خروج" value={endTime} onChange={handleEndTimeChange} />
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
                <TitleCard title={shiftTitle} setTitle={(value) => { markDirty(); setShiftTitle(value); }} error={formErrors.includes('عنوان شیفت را وارد کنید.') ? 'عنوان شیفت را وارد کنید.' : undefined} />
                <div className="rounded-[22px] border border-white/10 p-5">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
                    <SlidersHorizontal className="h-5 w-5 text-indigo-300" />
                    <div className="text-xl font-black text-white">تعریف شیفت شناور شروع روز</div>
                  </div>
                  <ModeSwitch mode={shiftMode} setMode={(mode) => { markDirty(); setShiftMode(mode); }} noTemplateMessage />
                  <div className="mt-6 space-y-5">
                    <WeekDaysEditor
                      days={floatDayWorkingDays}
                      calendarHolidayDays={weekends}
                      onToggle={(day) => { markDirty(); setFloatDayWorkingDays((prev) => toggle(prev, day)); }}
                      error={formErrors.includes('حداقل یک روز برای این شیفت انتخاب کنید.') ? 'حداقل یک روز برای این شیفت انتخاب کنید.' : undefined}
                    />
                    <div className="space-y-4">
                      <div className="text-sm font-bold text-white">بازه مجاز ورود</div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <TimeField label="از ساعت" value={floatDayEntryStart} onChange={(value) => { markDirty(); setFloatDayEntryStart(value); }} />
                        <div className="min-w-0 space-y-2">
                          <TimeField label="تا ساعت" value={floatDayEntryEnd} onChange={(value) => { markDirty(); setFloatDayEntryEnd(value); }} />
                          <div className="flex justify-end">
                            <CheckboxField label="پایان در روز بعد" checked={floatDayEntryEndsNextDay} onChange={(checked) => { markDirty(); setFloatDayEntryEndsNextDay(checked); }} />
                          </div>
                        </div>
                      </div>
                      <div className="max-w-[22rem]">
                        <TimeField
                          label="مدت کار موظف"
                          value={minutesToTime(floatDayRequiredMinutes)}
                          onChange={(value) => { markDirty(); setFloatDayRequiredMinutes(parseTime(value)); }}
                        />
                      </div>
                      <div className="rounded-xl border border-indigo-400/20 bg-indigo-950/40 px-4 py-3 text-xs leading-6 text-indigo-100">
                        خروج مورد انتظار بر اساس ساعت ورود و مدت کار موظف محاسبه می‌شود.
                      </div>
                    </div>
                    <BreakEditor items={floatDayRests} onChange={(items) => { markDirty(); setFloatDayRests(items); }} workRange={floatDayWorkRange} allowFixedRestEndsNextDay />
                  </div>
                </div>
              </>
            ) : null}

            {shiftType === 'float-abs' ? (
              <>
                <TitleCard title={shiftTitle} setTitle={(value) => { markDirty(); setShiftTitle(value); }} error={formErrors.includes('عنوان شیفت را وارد کنید.') ? 'عنوان شیفت را وارد کنید.' : undefined} />
                <div className="rounded-[22px] border border-white/10 p-5">
                  <div className="flex flex-row-reverse items-center justify-between gap-3 border-b border-white/10 pb-4 text-right">
                    <SlidersHorizontal className="h-5 w-5 text-indigo-300" />
                    <div className="text-xl font-black text-white">تعریف شیفت شناور مطلق</div>
                  </div>
                  <ModeSwitch mode={shiftMode} setMode={(mode) => { markDirty(); setShiftMode(mode); }} noTemplateMessage />
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
                      />
                    </div>
                    <div className="space-y-3 rounded-[18px] border border-white/10 bg-slate-900/40 p-4">
                      <div className="text-sm font-bold text-white">محدوده مجاز ثبت تردد، اختیاری</div>
                      <div className="grid grid-cols-2 gap-4">
                        <TimeField label="از ساعت" value={floatAbsStart} onChange={(value) => { markDirty(); setFloatAbsStart(value); }} />
                        <div className="min-w-0 space-y-2">
                          <TimeField label="تا ساعت" value={floatAbsEnd} onChange={(value) => { markDirty(); setFloatAbsEnd(value); }} />
                          <div className="flex justify-end">
                            <CheckboxField label="پایان در روز بعد" checked={floatAbsNextDay} onChange={(checked) => { markDirty(); setFloatAbsNextDay(checked); }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-indigo-400/20 bg-indigo-950/40 px-4 py-3 text-xs leading-6 text-indigo-100">
                      در این نوع شیفت، ساعت ورود و خروج ثابت کنترل نمی‌شود؛ مجموع کارکرد روزانه ملاک است.
                    </div>
                    <BreakEditor items={floatAbsRests} onChange={(items) => { markDirty(); setFloatAbsRests(items); }} floatingOnly />
                  </div>
                </div>
              </>
            ) : null}

            {shiftType === 'split' ? (
              <>
                <TitleCard title={shiftTitle} setTitle={(value) => { markDirty(); setShiftTitle(value); }} error={formErrors.includes('عنوان شیفت را وارد کنید.') ? 'عنوان شیفت را وارد کنید.' : undefined} />
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
                        <TimeField label="شروع" value={split1Start} onChange={(value) => { markDirty(); setSplit1Start(value); }} />
                        <TimeField label="پایان" value={split1End} onChange={(value) => { markDirty(); setSplit1End(value); }} />
                      </div>
                      <BreakEditor items={split1Rests} onChange={(items) => { markDirty(); setSplit1Rests(items); }} workRange={split1WorkRange} />
                    </div>
                    <div className="space-y-4 rounded-[18px] border border-indigo-500/30 bg-slate-900/40 p-4">
                      <div className="text-right text-base font-black text-indigo-300">بازه کاری دوم</div>
                      <div className="grid grid-cols-2 gap-4">
                        <TimeField label="شروع" value={split2Start} onChange={(value) => { markDirty(); setSplit2Start(value); }} />
                        <div className="min-w-0 space-y-2">
                          <TimeField label="پایان" value={split2End} onChange={(value) => { markDirty(); setSplit2End(value); }} />
                          <div className="flex justify-end">
                            <CheckboxField label="خروج در روز بعد" checked={split2NextDay} onChange={(checked) => { markDirty(); setSplit2NextDay(checked); }} />
                          </div>
                        </div>
                      </div>
                      <BreakEditor items={split2Rests} onChange={(items) => { markDirty(); setSplit2Rests(items); }} workRange={split2WorkRange} />
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {shiftType === 'rotate' ? (
              <div className="rounded-[22px] border border-white/10 bg-slate-900/50 p-6 text-right">
                <div className="text-lg font-black text-white">شیفت چرخشی نیاز به تعریف الگوی پیشرفته دارد.</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  برای این نوع شیفت باید مشخص شود الگو چگونه بین روزها، افراد یا گروه‌ها جابه‌جا می‌شود.
                </p>
                <a
                  href={rotateAdvancedHref}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500"
                >
                  ورود به تنظیمات پیشرفته چرخش
                </a>
              </div>
            ) : null}

            {shiftType !== 'rotate' ? (
              <ShiftSummary
                shiftType={shiftType}
                shiftMode={shiftMode}
                workingDays={activeWorkingDays}
                startTime={startTime}
                endTime={endTime}
                nextDay={nextDay}
                rests={rests}
                floatDayRequiredMinutes={floatDayRequiredMinutes}
                floatDayEntryStart={floatDayEntryStart}
                floatAbsRequiredMinutes={floatAbsRequiredMinutes}
                split1Start={split1Start}
                split1End={split1End}
                split2Start={split2Start}
                split2End={split2End}
                split2NextDay={split2NextDay}
                split1Rests={split1Rests}
                split2Rests={split2Rests}
                floatDayRests={floatDayRests}
                floatAbsRests={floatAbsRests}
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
            <p className="mt-3 text-sm leading-7 text-slate-300">با تغییر نوع شیفت، بخشی از داده‌های واردشده ممکن است پاک یا غیرقابل استفاده شود. ادامه می‌دهید؟</p>
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
