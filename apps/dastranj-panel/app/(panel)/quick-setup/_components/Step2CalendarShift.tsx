'use client';

import { useState } from 'react';
import { CalendarDays, Check, ChevronDown, ChevronUp, Clock3, Pencil, Plus, SlidersHorizontal, Trash2 } from 'lucide-react';import { createCalendarWithShiftAction } from '../../../lib/actions';

// ─── Types ───────────────────────────────────────────────────────────────────

type BreakItem = {
  id: string;
  type: 'fixed' | 'floating';
  start?: string;
  end?: string;
  durationMinutes?: number;
  deductFromWork: boolean;
};

type RotateKind = 'morning' | 'evening' | 'night' | 'rest';

type RotateSegment = {
  id: string;
  kind: RotateKind;
  repeat: number;
  start: string;
  end: string;
  nextDay: boolean;
  rests: BreakItem[];
};

type SingleHoliday = { id: string; title: string; date: string };

type CalendarSummary = {
  id: string;
  title: string;
  yearLabel: string;
  shiftTitle: string;
  shiftTypeLabel: string;
  holidayCount: number;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const WEEK_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

const SHIFT_OPTIONS = [
  { id: 'fixed', label: 'شیفت ثابت ✓' },
  { id: 'template', label: 'قالب آماده' },
  { id: 'float-day', label: 'شیفت شناور (شروع روز)' },
  { id: 'float-abs', label: 'شیفت شناور مطلق' },
  { id: 'split', label: 'شیفت دوتکه' },
  { id: 'rotate', label: 'شیفت چرخشی' },
];

const ROTATE_KIND_LABELS: Record<RotateKind, string> = {
  morning: 'صبح',
  evening: 'عصر',
  night: 'شب',
  rest: 'استراحت',
};

const CALENDAR_OPTIONS = [
  { id: 'cal-1404', yearLabel: '1404', title: 'تقویم 1404', startDate: '1404/01/01', endDate: '1404/12/29' },
  { id: 'cal-1405', yearLabel: '1405', title: 'تقویم 1405', startDate: '1405/01/01', endDate: '1405/12/29' },
];

const TEMPLATE_ITEMS = [
  {
    id: 'system-morning',
    title: 'شیفت صبح',
    description: 'مناسب برای تیم‌های اداری و پشتیبانی روزانه',
    startTime: '08:00',
    endTime: '16:30',
    nextDay: false,
    workingDays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه'],
    rests: [
      { id: 'tmpl-fixed', type: 'fixed' as const, start: '12:00', end: '12:30', deductFromWork: true },
      { id: 'tmpl-float', type: 'floating' as const, durationMinutes: 30, deductFromWork: false },
    ],
  },
  {
    id: 'system-evening',
    title: 'شیفت عصر',
    description: 'مناسب برای فروشگاه‌ها و تیم‌های شیفت دوم',
    startTime: '15:00',
    endTime: '23:00',
    nextDay: false,
    workingDays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه'],
    rests: [
      { id: 'tmpl-eve-rest', type: 'fixed' as const, start: '19:00', end: '19:30', deductFromWork: true },
    ],
  },
  {
    id: 'system-night',
    title: 'شیفت شب',
    description: 'مناسب برای نگهبانی، مانیتورینگ و تیم‌های شبانه',
    startTime: '22:00',
    endTime: '06:00',
    nextDay: true,
    workingDays: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
    rests: [
      { id: 'tmpl-night-rest', type: 'floating' as const, durationMinutes: 45, deductFromWork: false },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2);
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatDuration(minutes: number) {
  const h = Math.floor(Math.abs(minutes) / 60);
  const m = Math.abs(minutes) % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

function calcShiftMinutes(start: string, end: string, nextDay: boolean, breaks: BreakItem[]) {
  let total = timeToMinutes(end) - timeToMinutes(start);
  if (nextDay) total += 24 * 60;
  const deducted = breaks.filter((b) => b.deductFromWork).reduce((acc, b) => {
    if (b.type === 'fixed' && b.start && b.end) return acc + (timeToMinutes(b.end) - timeToMinutes(b.start));
    if (b.type === 'floating' && b.durationMinutes) return acc + b.durationMinutes;
    return acc;
  }, 0);
  return total - deducted;
}

function StyledCheckbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
        <span style={{
          width: 18, height: 18, borderRadius: 5,
          border: `2px solid ${checked ? '#7063ff' : 'rgba(255,255,255,0.25)'}`,
          background: checked ? 'linear-gradient(135deg,#7063ff,#8d80ff)' : 'rgba(255,255,255,0.03)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}>
          {checked && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </span>
      <span style={{ color: checked ? '#c4beff' : '#aeb8d9', fontSize: 13 }}>{label}</span>
    </label>
  );
}

function createSegment(): RotateSegment {
  return { id: uid(), kind: 'morning', repeat: 1, start: '06:00', end: '14:00', nextDay: false, rests: [] };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DayToggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: active ? 'none' : '1px solid rgba(255,255,255,0.12)',
        borderRadius: 999,
        background: active ? 'linear-gradient(135deg,#7063ff,#8d80ff)' : 'rgba(255,255,255,0.03)',
        color: active ? '#fff' : '#aeb8d9',
        padding: '6px 16px',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function ShiftTypeChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: active ? 'none' : '1px solid rgba(255,255,255,0.12)',
        borderRadius: 999,
        background: active ? 'linear-gradient(135deg,#7063ff,#8d80ff)' : 'rgba(255,255,255,0.03)',
        color: active ? '#fff' : '#aeb8d9',
        padding: '7px 16px',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function BreakEditor({ items, onChange }: { items: BreakItem[]; onChange: (items: BreakItem[]) => void }) {
  const [addingType, setAddingType] = useState<'fixed' | 'floating' | null>(null);

  const addBreak = () => {
    if (!addingType) return;
    const newItem: BreakItem = addingType === 'fixed'
      ? { id: uid(), type: 'fixed', start: '12:00', end: '12:30', deductFromWork: true }
      : { id: uid(), type: 'floating', durationMinutes: 30, deductFromWork: false };
    onChange([...items, newItem]);
    setAddingType(null);
  };

  const remove = (id: string) => onChange(items.filter((b) => b.id !== id));
  const update = (id: string, patch: Partial<BreakItem>) => onChange(items.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const labelStyle: React.CSSProperties = { display: 'grid', gap: 6, textAlign: 'right' };
  const spanStyle: React.CSSProperties = { color: '#aeb8d9', fontSize: 12, fontWeight: 600 };
  const inputS: React.CSSProperties = {
    width: '100%', minHeight: 36, border: '1px solid rgba(126,142,187,0.38)',
    borderRadius: 10, background: 'rgba(18,25,46,0.96)', color: '#fff',
    padding: '0 12px', fontSize: 13, boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fff', fontWeight: 900, fontSize: 16 }}>
          <Clock3 size={18} style={{ color: '#aeb8d9' }} />
          <span>استراحت‌ها</span>
        </div>
        <button
          type="button"
          onClick={() => setAddingType(addingType ? null : 'fixed')}
          title="افزودن استراحت"
          style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <Plus size={15} />
        </button>
      </div>

      {/* Add new break panel */}
      {addingType !== null ? (
        <div style={{ border: '1px solid rgba(122,109,255,0.3)', borderRadius: 16, background: 'rgba(122,109,255,0.06)', padding: 14, display: 'grid', gap: 12 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 13, textAlign: 'right' }}>نوع استراحت</div>
          <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: 16 }}>
            {/* ثابت */}
            <label style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <input
                  type="radio"
                  name="break-type-new"
                  checked={addingType === 'fixed'}
                  onChange={() => setAddingType('fixed')}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: `2px solid ${addingType === 'fixed' ? '#7063ff' : 'rgba(255,255,255,0.3)'}`,
                  background: addingType === 'fixed' ? '#7063ff' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {addingType === 'fixed' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                </span>
              </span>
              <span style={{ color: '#fff', fontSize: 13 }}>ثابت</span>
              <span title="استراحت با ساعت شروع و پایان مشخص" style={{ color: '#6b7a99', fontSize: 11, cursor: 'help', marginRight: 2 }}>ⓘ</span>
            </label>
            {/* شناور */}
            <label style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <input
                  type="radio"
                  name="break-type-new"
                  checked={addingType === 'floating'}
                  onChange={() => setAddingType('floating')}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: `2px solid ${addingType === 'floating' ? '#7063ff' : 'rgba(255,255,255,0.3)'}`,
                  background: addingType === 'floating' ? '#7063ff' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {addingType === 'floating' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                </span>
              </span>
              <span style={{ color: '#fff', fontSize: 13 }}>شناور</span>
              <span title="استراحت با مدت زمان مشخص، بدون ساعت ثابت" style={{ color: '#6b7a99', fontSize: 11, cursor: 'help', marginRight: 2 }}>ⓘ</span>
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" onClick={() => setAddingType(null)} style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#aeb8d9', padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>انصراف</button>
            <button type="button" onClick={addBreak} style={{ borderRadius: 10, background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff', border: 'none', padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>افزودن</button>
          </div>
        </div>
      ) : null}

      {/* Break items */}
      {items.map((b) => (
        <div key={b.id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, background: 'rgba(255,255,255,0.02)', padding: 14, display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button type="button" onClick={() => remove(b.id)} style={{ border: 'none', background: 'transparent', color: '#aeb8d9', cursor: 'pointer', display: 'flex', padding: 4 }}>
              <Trash2 size={15} />
            </button>
            <span style={{ color: b.type === 'fixed' ? '#8d82ff' : '#5eead4', fontSize: 12, fontWeight: 700, background: b.type === 'fixed' ? 'rgba(122,109,255,0.12)' : 'rgba(94,234,212,0.1)', padding: '3px 10px', borderRadius: 999 }}>
              {b.type === 'fixed' ? 'ثابت' : 'شناور'}
            </span>
          </div>
          {b.type === 'fixed' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
              <label style={labelStyle}>
                <span style={spanStyle}>شروع استراحت</span>
                <input type="time" value={b.start || ''} onChange={(e) => update(b.id, { start: e.target.value })} style={inputS} />
              </label>
              <label style={labelStyle}>
                <span style={spanStyle}>پایان استراحت</span>
                <input type="time" value={b.end || ''} onChange={(e) => update(b.id, { end: e.target.value })} style={inputS} />
              </label>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
              <label style={labelStyle}>
                <span style={spanStyle}>مدت (دقیقه)</span>
                <input type="number" min={1} value={b.durationMinutes || 30} onChange={(e) => update(b.id, { durationMinutes: Number(e.target.value) })} style={inputS} />
              </label>
              <div />
            </div>
          )}
          {/* Checkbox بهبودیافته */}
          <label style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
            <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={b.deductFromWork}
                onChange={(e) => update(b.id, { deductFromWork: e.target.checked })}
                style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                width: 18, height: 18, borderRadius: 5,
                border: `2px solid ${b.deductFromWork ? '#7063ff' : 'rgba(255,255,255,0.25)'}`,
                background: b.deductFromWork ? 'linear-gradient(135deg,#7063ff,#8d80ff)' : 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}>
                {b.deductFromWork && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
            </span>
            <span style={{ color: b.deductFromWork ? '#c4beff' : '#aeb8d9', fontSize: 13 }}>کسر از ساعات کاری</span>
          </label>
        </div>
      ))}
    </div>
  );
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
    <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, background: 'rgba(12,19,36,0.8)', overflow: 'hidden' }}>
      <button
        type="button"
        onClick={canOpen ? onToggle : undefined}
        disabled={!canOpen}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '16px 18px',
          border: 'none',
          background: 'transparent',
          cursor: canOpen ? 'pointer' : 'not-allowed',
          opacity: canOpen ? 1 : 0.5,
          textAlign: 'right',
        }}
      >
        {/* سمت چپ: مشاهده جزئیات */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#aeb8d9', fontSize: 13 }}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {isOpen ? 'بستن' : 'مشاهده جزئیات'}
        </div>
        {/* سمت راست: آیکون و عنوان */}
        <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(118,104,255,0.14)', color: '#8d82ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{title}</span>
        </div>
      </button>
      {isOpen && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '16px 18px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Step2CalendarShift({
  onComplete,
  onBack,
}: {
  onComplete: (summary: CalendarSummary) => void;
  onBack: () => void;
}) {
  const [activeSection, setActiveSection] = useState<'calendar' | 'holiday' | 'shift'>('calendar');
  const [calendarDone, setCalendarDone] = useState(false);
  const [holidayDone, setHolidayDone] = useState(false);
  const [saving, setSaving] = useState(false);

  // Calendar selection
  const [selectedCalendarId, setSelectedCalendarId] = useState('cal-1404');

  // Holiday
  const [weekends, setWeekends] = useState<string[]>(['جمعه', 'شنبه']);
  const [singleHolidays, setSingleHolidays] = useState<SingleHoliday[]>([]);
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [holidayDate, setHolidayDate] = useState('');
  const [holidayTitle, setHolidayTitle] = useState('');

  // Shift
  const [shiftType, setShiftType] = useState<string>('fixed');
  const [shiftTitle, setShiftTitle] = useState('');
  const [templateId, setTemplateId] = useState('');

  // Fixed shift
  const [workingDays, setWorkingDays] = useState<string[]>(['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه']);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:30');
  const [nextDay, setNextDay] = useState(false);
  const [rests, setRests] = useState<BreakItem[]>([]);

  // Rotate
  const [rotateSegments, setRotateSegments] = useState<RotateSegment[]>([createSegment()]);

  const selectedCalendar = CALENDAR_OPTIONS.find((c) => c.id === selectedCalendarId) ?? CALENDAR_OPTIONS[0];

  const applyTemplate = (id: string) => {
    const item = TEMPLATE_ITEMS.find((t) => t.id === id);
    if (!item) return;
    setTemplateId(id);
    setStartTime(item.startTime);
    setEndTime(item.endTime);
    setNextDay(item.nextDay);
    setWorkingDays(item.workingDays);
    setRests(item.rests.map((r) => ({ ...r, id: uid() })));
    if (!shiftTitle) setShiftTitle(item.title);
  };

  const totalShiftMinutes = calcShiftMinutes(startTime, endTime, nextDay, rests);
  const fixedShiftReady = shiftTitle.trim() !== '' && workingDays.length > 0;

  const toggleWeekend = (day: string) =>
    setWeekends((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));

  const addHoliday = () => {
    if (!holidayDate.trim() || !holidayTitle.trim()) return;
    setSingleHolidays((prev) => [...prev, { id: uid(), title: holidayTitle.trim(), date: holidayDate.trim() }]);
    setHolidayDate('');
    setHolidayTitle('');
    setHolidayDialogOpen(false);
  };

  const updateSegment = (id: string, patch: Partial<RotateSegment>) =>
    setRotateSegments((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const removeSegment = (id: string) => setRotateSegments((prev) => prev.filter((s) => s.id !== id));
  const moveSegment = (id: string, dir: 'up' | 'down') => {
    setRotateSegments((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return next;
    });
  };

  const registerShift = async () => {
    setSaving(true);
    try {
      const result = await createCalendarWithShiftAction({
        title: selectedCalendar.title,
        yearLabel: selectedCalendar.yearLabel,
        startDate: selectedCalendar.startDate,
        endDate: selectedCalendar.endDate,
        weekends,
        singleHolidays,
        shiftType,
        shiftTitle,
        shiftConfig: shiftType === 'fixed' || shiftType === 'template'
          ? { workingDays, startTime, endTime, nextDay }
          : { segments: rotateSegments },
        breaks: rests,
      });
      onComplete({
        id: result.id,
        title: result.title,
        yearLabel: result.yearLabel,
        shiftTitle,
        shiftTypeLabel: shiftType,
        holidayCount: weekends.length + singleHolidays.length,
      });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 38,
    border: '1px solid rgba(126,142,187,0.38)',
    borderRadius: 10,
    background: 'rgba(18,25,46,0.96)',
    color: '#fff',
    padding: '0 14px',
    fontSize: 13,
    boxSizing: 'border-box',
  };

  const sectionBodyStyle: React.CSSProperties = { display: 'grid', gap: 16, textAlign: 'right' };

  const completeBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    background: 'linear-gradient(135deg,#7063ff,#8d80ff)',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  };

  const disabledBtnStyle: React.CSSProperties = { ...completeBtnStyle, opacity: 0.5, cursor: 'not-allowed' };

  return (
    <div style={{ display: 'grid', gap: 10 }}>

      {/* ── Section 1: Calendar ── */}
      <SectionShell
        title="تقویم خود را انتخاب کنید"
        icon={<Pencil size={18} />}
        isOpen={activeSection === 'calendar'}
        onToggle={() => setActiveSection('calendar')}
      >
        <div style={sectionBodyStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {CALENDAR_OPTIONS.map((cal) => {
              const isSelected = selectedCalendarId === cal.id;
              return (
                <button
                  key={cal.id}
                  type="button"
                  onClick={() => setSelectedCalendarId(cal.id)}
                  style={{
                    border: `1px solid ${isSelected ? 'rgba(122,109,255,0.6)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 18,
                    background: isSelected ? 'rgba(122,109,255,0.1)' : 'rgba(255,255,255,0.02)',
                    padding: 16,
                    textAlign: 'right',
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{cal.title}</div>
                  <div style={{ color: '#aeb8d9', fontSize: 13, marginTop: 6 }}>سال کاری: {cal.yearLabel}</div>
                  <div style={{ color: '#aeb8d9', fontSize: 12, marginTop: 4 }}>{cal.startDate} تا {cal.endDate}</div>
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" style={completeBtnStyle} onClick={() => { setCalendarDone(true); setActiveSection('holiday'); }}>
              تکمیل مرحله 1 <Check size={16} />
            </button>
          </div>
        </div>
      </SectionShell>

      {/* ── Section 2: Holidays ── */}
      <SectionShell
        title="تعطیلات سازمانی"
        icon={<CalendarDays size={18} />}
        isOpen={activeSection === 'holiday'}
        canOpen={calendarDone}
        onToggle={() => { if (calendarDone) setActiveSection('holiday'); }}
      >
        <div style={sectionBodyStyle}>
          {/* Week days */}
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>روزهای تعطیل</div>
            <div style={{ display: 'flex', flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8 }}>
              {WEEK_DAYS.map((day) => (
                <DayToggle key={day} active={weekends.includes(day)} onClick={() => toggleWeekend(day)}>
                  {weekends.includes(day) ? `${day} ✓` : day}
                </DayToggle>
              ))}
            </div>
          </div>

          {/* Single holidays */}
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>تعطیلات تکی</div>
              <button
                type="button"
                onClick={() => setHolidayDialogOpen(true)}
                title="افزودن تعطیلی تکی"
                style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                <Plus size={16} />
              </button>
            </div>
            {singleHolidays.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8 }}>
                {singleHolidays.map((item) => (
                  <div key={item.id} style={{ display: 'inline-flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 6, borderRadius: 999, background: 'linear-gradient(135deg,#7063ff,#8d80ff)', color: '#fff', padding: '6px 14px', fontSize: 12 }}>
                    <button type="button" onClick={() => setSingleHolidays((p) => p.filter((h) => h.id !== item.id))} style={{ border: 'none', background: 'transparent', color: 'rgba(255,200,200,0.9)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>×</button>
                    {item.title} - {item.date}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#aeb8d9', fontSize: 13 }}>هنوز تعطیلی تکی ثبت نشده است.</div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" style={weekends.length > 0 ? completeBtnStyle : disabledBtnStyle} disabled={weekends.length === 0} onClick={() => { setHolidayDone(true); setActiveSection('shift'); }}>
              تکمیل مرحله 2 <Check size={16} />
            </button>
          </div>
        </div>
      </SectionShell>

      {/* ── Section 3: Shift ── */}
      <SectionShell
        title="شیفت تقویم خود را اعمال کنید"
        icon={<Clock3 size={18} />}
        isOpen={activeSection === 'shift'}
        canOpen={calendarDone && holidayDone}
        onToggle={() => { if (calendarDone && holidayDone) setActiveSection('shift'); }}
      >
        <div style={sectionBodyStyle}>
          {/* Shift type */}
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>نوع شیفت</div>
            <div dir="rtl" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 6 }}>
              {SHIFT_OPTIONS.map((opt) => (
                <ShiftTypeChip key={opt.id} active={shiftType === opt.id} onClick={() => setShiftType(opt.id)}>
                  {opt.label}
                </ShiftTypeChip>
              ))}
            </div>
          </div>

          {/* Template shift */}
          {shiftType === 'template' ? (
            <>
              <div style={{ display: 'grid', gap: 10 }}>
                {TEMPLATE_ITEMS.map((item) => {
                  const isSelected = templateId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => applyTemplate(item.id)}
                      style={{
                        border: `1px solid ${isSelected ? 'rgba(122,109,255,0.6)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 18,
                        background: isSelected ? 'rgba(122,109,255,0.1)' : 'rgba(255,255,255,0.02)',
                        padding: 16,
                        textAlign: 'right',
                        cursor: 'pointer',
                        width: '100%',
                      }}
                    >
                      <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{item.title}</div>
                      <div style={{ color: '#aeb8d9', fontSize: 13, marginTop: 6 }}>{item.description}</div>
                      <div style={{ color: '#aeb8d9', fontSize: 12, marginTop: 4 }}>{item.startTime} تا {item.endTime}{item.nextDay ? ' (روز بعد)' : ''}</div>
                    </button>
                  );
                })}
              </div>
              {templateId ? (
                <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: 20 }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 16, textAlign: 'right' }}>اطلاعات شیفت انتخابی</div>
                  <label style={{ display: 'grid', gap: 8, textAlign: 'right' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>عنوان شیفت <span style={{ color: '#f87171' }}>*</span></span>
                    <input value={shiftTitle} onChange={(e) => setShiftTitle(e.target.value)} style={inputStyle} />
                  </label>
                </div>
              ) : null}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" style={templateId && shiftTitle.trim() && !saving ? completeBtnStyle : disabledBtnStyle} disabled={!templateId || !shiftTitle.trim() || saving} onClick={registerShift}>
                  {saving ? 'در حال ذخیره...' : 'تکمیل مرحله 3'} <Check size={16} />
                </button>
              </div>
            </>
          ) : null}

          {/* Fixed shift */}
          {shiftType === 'fixed' ? (
            <>
              {/* Base info */}
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #7063ff', color: '#8d82ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>i</div>
                  <div style={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>اطلاعات پایه شیفت</div>
                </div>
                <label style={{ display: 'grid', gap: 8, textAlign: 'right' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>عنوان شیفت <span style={{ color: '#f87171' }}>*</span></span>
                  <input value={shiftTitle} onChange={(e) => setShiftTitle(e.target.value)} style={inputStyle} />
                </label>
              </div>

              {/* Shift definition */}
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 20 }}>
                  <SlidersHorizontal size={18} style={{ color: '#8d82ff' }} />
                  <div style={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>تعریف شیفت ثابت</div>
                </div>

                <div style={{ display: 'grid', gap: 20 }}>
                  {/* Working days */}
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'flex-end', gap: 8, color: '#fff', fontWeight: 900, fontSize: 18 }}>
                      <span>روزهای هفته</span>
                      <CalendarDays size={18} style={{ color: '#aeb8d9' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8 }}>
                      {WEEK_DAYS.map((day) => (
                        <DayToggle key={day} active={workingDays.includes(day)} onClick={() => setWorkingDays((p) => p.includes(day) ? p.filter((d) => d !== day) : [...p, day])}>
                          {workingDays.includes(day) ? `${day} ✓` : day}
                        </DayToggle>
                      ))}
                    </div>
                    <div style={{ color: '#aeb8d9', fontSize: 12 }}>روزهای غیرفعال شده در تقویم فعلی شما تعطیل هستند.</div>
                  </div>

                  {/* Times */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <label style={{ display: 'grid', gap: 8, textAlign: 'right' }}>
                      <span style={{ color: '#aeb8d9', fontSize: 13 }}>ساعت ورود</span>
                      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={inputStyle} />
                    </label>
                    <div style={{ display: 'grid', gap: 8 }}>
                      <label style={{ display: 'grid', gap: 8, textAlign: 'right' }}>
                        <span style={{ color: '#aeb8d9', fontSize: 13 }}>ساعت خروج</span>
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={inputStyle} />
                      </label>
                      <StyledCheckbox checked={nextDay} onChange={setNextDay} label="پایان در روز بعد" />
                    </div>
                  </div>

                  <BreakEditor items={rests} onChange={setRests} />

                  {/* Duration */}
                  <div style={{ borderRadius: 18, padding: '16px 20px', background: totalShiftMinutes > 24 * 60 ? 'rgba(127,29,29,0.7)' : 'rgba(35,39,94,0.86)', textAlign: 'right' }}>
                    <div style={{ color: '#aeb8d9', fontSize: 13 }}>مدت شیفت</div>
                    <div style={{ color: totalShiftMinutes > 24 * 60 ? '#f87171' : '#8d80ff', fontWeight: 900, fontSize: 40, marginTop: 8 }}>{formatDuration(totalShiftMinutes)}</div>
                    {totalShiftMinutes > 24 * 60 ? <div style={{ color: '#fca5a5', fontSize: 12, marginTop: 4 }}>شیفت نمی‌تواند بیشتر از ۲۴ ساعت باشد</div> : null}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" style={fixedShiftReady && !saving ? completeBtnStyle : disabledBtnStyle} disabled={!fixedShiftReady || saving} onClick={registerShift}>
                  {saving ? 'در حال ذخیره...' : 'تکمیل مرحله 3'} <Check size={16} />
                </button>
              </div>
            </>
          ) : null}

          {/* Rotate shift */}
          {shiftType === 'rotate' ? (
            <>
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 20 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid #7063ff', color: '#8d82ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>i</div>
                  <div style={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>اطلاعات پایه شیفت</div>
                </div>
                <label style={{ display: 'grid', gap: 8, textAlign: 'right' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>عنوان شیفت <span style={{ color: '#f87171' }}>*</span></span>
                  <input value={shiftTitle} onChange={(e) => setShiftTitle(e.target.value)} style={inputStyle} />
                </label>
              </div>

              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 20 }}>
                  <SlidersHorizontal size={18} style={{ color: '#8d82ff' }} />
                  <div style={{ color: '#fff', fontWeight: 900, fontSize: 20 }}>تعریف شیفت چرخشی</div>
                </div>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
                    <button type="button" style={completeBtnStyle} onClick={() => setRotateSegments((p) => [...p, createSegment()])}>
                      <Plus size={14} /> افزودن تکه جدید
                    </button>
                    <div style={{ color: '#fff', fontWeight: 900, fontSize: 18 }}>الگوی چرخشی</div>
                  </div>
                  {rotateSegments.map((seg, idx) => (
                    <div key={seg.id} style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, background: 'rgba(255,255,255,0.02)', padding: 16, display: 'grid', gap: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 16 }}>
                          <label style={{ display: 'grid', gap: 4, textAlign: 'right' }}>
                            <span style={{ color: '#aeb8d9', fontSize: 11 }}>نوع شیفت</span>
                            <select value={seg.kind} onChange={(e) => updateSegment(seg.id, { kind: e.target.value as RotateKind })} style={{ ...inputStyle, minHeight: 34, padding: '0 10px' }}>
                              {(Object.keys(ROTATE_KIND_LABELS) as RotateKind[]).map((k) => <option key={k} value={k}>{ROTATE_KIND_LABELS[k]}</option>)}
                            </select>
                          </label>
                          <label style={{ display: 'grid', gap: 4, textAlign: 'right' }}>
                            <span style={{ color: '#aeb8d9', fontSize: 11 }}>تعداد تکرار</span>
                            <input type="number" min={1} max={30} value={seg.repeat} onChange={(e) => updateSegment(seg.id, { repeat: Math.max(1, Number(e.target.value)) })} style={{ ...inputStyle, width: 70, textAlign: 'center' }} />
                          </label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button type="button" onClick={() => removeSegment(seg.id)} style={{ border: 'none', background: 'transparent', color: '#aeb8d9', cursor: 'pointer', display: 'flex' }}><Trash2 size={16} /></button>
                          <button type="button" onClick={() => moveSegment(seg.id, 'down')} disabled={idx === rotateSegments.length - 1} style={{ border: 'none', background: 'transparent', color: '#aeb8d9', cursor: 'pointer', opacity: idx === rotateSegments.length - 1 ? 0.3 : 1 }}>↓</button>
                          <button type="button" onClick={() => moveSegment(seg.id, 'up')} disabled={idx === 0} style={{ border: 'none', background: 'transparent', color: '#aeb8d9', cursor: 'pointer', opacity: idx === 0 ? 0.3 : 1 }}>↑</button>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        <label style={{ display: 'grid', gap: 6, textAlign: 'right' }}>
                          <span style={{ color: '#aeb8d9', fontSize: 13 }}>شروع شیفت</span>
                          <input type="time" value={seg.start} onChange={(e) => updateSegment(seg.id, { start: e.target.value })} style={inputStyle} />
                        </label>
                        <div style={{ display: 'grid', gap: 6 }}>
                          <label style={{ display: 'grid', gap: 6, textAlign: 'right' }}>
                            <span style={{ color: '#aeb8d9', fontSize: 13 }}>پایان شیفت</span>
                            <input type="time" value={seg.end} onChange={(e) => updateSegment(seg.id, { end: e.target.value })} style={inputStyle} />
                          </label>
                          <StyledCheckbox checked={seg.nextDay} onChange={(v) => updateSegment(seg.id, { nextDay: v })} label="پایان در روز بعد" />
                        </div>
                      </div>
                      <BreakEditor items={seg.rests} onChange={(items) => updateSegment(seg.id, { rests: items })} />
                    </div>
                  ))}
                  {rotateSegments.length === 0 ? <div style={{ color: '#aeb8d9', fontSize: 13, textAlign: 'right' }}>هنوز تکه‌ای اضافه نشده است.</div> : null}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" style={shiftTitle.trim() && rotateSegments.length > 0 && !saving ? completeBtnStyle : disabledBtnStyle} disabled={!shiftTitle.trim() || rotateSegments.length === 0 || saving} onClick={registerShift}>
                  {saving ? 'در حال ذخیره...' : 'ثبت شیفت'} <Check size={16} />
                </button>
              </div>
            </>
          ) : null}

          {/* Other types placeholder */}
          {!['fixed', 'rotate', 'template'].includes(shiftType) ? (
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 20, color: '#aeb8d9', fontSize: 13, textAlign: 'center' }}>
              این نوع شیفت در حال توسعه است. لطفاً شیفت ثابت یا چرخشی را انتخاب کنید.
            </div>
          ) : null}
        </div>
      </SectionShell>

      {/* Holiday dialog */}
      {holidayDialogOpen ? (
        <div
          onClick={() => setHolidayDialogOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', padding: 16 }}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 420, borderRadius: 22, border: '1px solid rgba(255,255,255,0.1)', background: '#0f1828', padding: 24, display: 'grid', gap: 16 }}
          >
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>افزودن تعطیلی تکی</div>
              <div style={{ color: '#aeb8d9', fontSize: 13, marginTop: 4 }}>تاریخ و عنوان تعطیلی را ثبت کنید.</div>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <label style={{ display: 'grid', gap: 6, textAlign: 'right' }}>
                <span style={{ color: '#aeb8d9', fontSize: 12, fontWeight: 700 }}>تاریخ تعطیلی</span>
                {/* تقویم میلادی - کاربر می‌تواند از تقویم انتخاب کند */}
                <input
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  style={{ ...inputStyle, colorScheme: 'dark', cursor: 'pointer' }}
                />
                <span style={{ color: '#6b7a99', fontSize: 11 }}>یا تاریخ شمسی را دستی وارد کنید (مثال: 1404/01/01)</span>
                <input
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                  placeholder="1404/01/01"
                  style={inputStyle}
                />
              </label>
              <label style={{ display: 'grid', gap: 6, textAlign: 'right' }}>
                <span style={{ color: '#aeb8d9', fontSize: 12, fontWeight: 700 }}>عنوان تعطیلی</span>
                <input value={holidayTitle} onChange={(e) => setHolidayTitle(e.target.value)} placeholder="مثال: تأسیس شرکت" style={inputStyle} />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 10 }}>
              <button type="button" onClick={() => setHolidayDialogOpen(false)} style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#d7ddf7', padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>انصراف</button>
              <button type="button" onClick={addHoliday} style={completeBtnStyle}>ثبت</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
