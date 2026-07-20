'use client';

import { useEffect, useState, useTransition } from 'react';
import { Copy, Pencil, Power, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CardMenu } from '../../../components/CardMenu';
import { deleteShiftTemplateAction, toggleShiftTemplateActiveAction } from '../../../lib/actions';
import { formatPersianDate } from '../../../lib/format-date';
import { extractTemplateBreaks, getShiftTemplateTypeLabel } from '../../../lib/shift-template-map';
import type { ShiftTemplateListItem } from './ShiftTemplateCard';

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

function minutesLabel(value: unknown) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours ? `${hours} ساعت` : ''}${hours && remainder ? ' و ' : ''}${remainder ? `${remainder} دقیقه` : ''}`;
}

function timeMinutes(value: unknown) {
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function rangeMinutes(start: unknown, end: unknown, endsNextDay = false) {
  const startValue = timeMinutes(start);
  const endValue = timeMinutes(end);
  if (startValue === null || endValue === null) return null;
  const resolvedEnd = endValue + (endsNextDay ? 1440 : 0);
  const duration = resolvedEnd - startValue;
  return duration > 0 && duration < 1440 ? duration : null;
}

function breakMinutes(rest: Record<string, unknown>) {
  if (rest.type !== 'floating') {
    const fixedDuration = rangeMinutes(rest.start, rest.end, Boolean(rest.endsNextDay));
    if (fixedDuration !== null) return fixedDuration;
  }
  const duration = Number(rest.duration);
  if (!Number.isFinite(duration) || duration <= 0) return null;
  return rest.unit === 'hours' ? duration * 60 : duration;
}

function totalBreakMinutes(breaks: Record<string, unknown>[], deductibleOnly = false) {
  let hasDuration = false;
  const total = breaks.reduce((sum, rest) => {
    if (deductibleOnly && rest.deductFromWork === false) return sum;
    const duration = breakMinutes(rest);
    if (duration === null) return sum;
    hasDuration = true;
    return sum + duration;
  }, 0);
  return hasDuration ? total : null;
}

function rangeLabel(start: unknown, end: unknown, endsNextDay = false) {
  const startValue = text(start);
  const endValue = text(end);
  return startValue && endValue ? `${startValue} تا ${endValue}${endsNextDay ? ' روز بعد' : ''}` : null;
}

function timingRows(item: ShiftTemplateListItem): Array<[string, string]> {
  const config = item.config;
  const rows: Array<[string, string | null]> = [['روزهای فعال', item.weekDays.join('، ') || null]];
  if (item.shiftType === 'fixed') {
    const fixed = asObject(config.fixedShift);
    const start = fixed.startTime ?? config.startTime;
    const end = fixed.endTime ?? config.endTime;
    const endsNextDay = Boolean(fixed.endsNextDay ?? config.nextDay);
    const gross = rangeMinutes(start, end, endsNextDay);
    const breaks = extractTemplateBreaks(item.shiftType, config).map(asObject);
    const deductibleBreaks = totalBreakMinutes(breaks, true);
    rows.push(['ساعت شروع', text(start)], ['ساعت پایان', text(end)], ['مدت ناخالص شیفت', gross === null ? null : minutesLabel(gross)], ['مجموع استراحت‌های کسرشونده', deductibleBreaks === null ? null : minutesLabel(deductibleBreaks)], ['مدت خالص کارکرد', gross === null ? null : minutesLabel(Math.max(0, gross - (deductibleBreaks ?? 0)))]);
    if (endsNextDay) rows.push(['پایان', 'روز بعد']);
  } else if (item.shiftType === 'float-day') {
    const floating = asObject(config.floatingShiftStartOfDay);
    const start = text(floating.bandwidthStart); const end = text(floating.bandwidthEnd);
    rows.push(['بازه مجاز ورود', start && end ? `${start} تا ${end}` : null], ['مدت کار روزانه', minutesLabel(floating.requiredMinutes)]);
    rows.push(['قاعده خروج', 'خروج مورد انتظار بر اساس زمان ورود واقعی و مدت کار روزانه محاسبه می‌شود.']);
    const breakTotal = totalBreakMinutes(extractTemplateBreaks(item.shiftType, config).map(asObject));
    rows.push(['مجموع استراحت‌ها', breakTotal === null ? null : minutesLabel(breakTotal)]);
    const exitStart = floating.exitWindowStart ?? floating.permittedExitStart;
    const exitEnd = floating.exitWindowEnd ?? floating.permittedExitEnd;
    rows.push(['بازه مجاز خروج', rangeLabel(exitStart, exitEnd, Boolean(floating.exitWindowEndsNextDay))]);
  } else if (item.shiftType === 'float-abs') {
    const floating = asObject(config.absoluteFloatingShift);
    const start = text(floating.startTime); const end = text(floating.endTime);
    rows.push(['مدت کار مورد انتظار', minutesLabel(floating.requiredMinutes)], ['بازه اختیاری', start && end ? `${start} تا ${end}` : null]);
    rows.push(['ساعت ورود ثابت', 'ندارد']);
    const breakTotal = totalBreakMinutes(extractTemplateBreaks(item.shiftType, config).map(asObject));
    rows.push(['مجموع استراحت‌ها', breakTotal === null ? null : minutesLabel(breakTotal)]);
  } else if (item.shiftType === 'split') {
    const split = asObject(config.splitShift);
    const s1 = text(split.segment1Start); const e1 = text(split.segment1End); const s2 = text(split.segment2Start); const e2 = text(split.segment2End);
    const firstNextDay = Boolean(split.segment1EndsNextDay);
    const secondNextDay = Boolean(split.segment2EndsNextDay);
    const firstDuration = rangeMinutes(s1, e1, firstNextDay);
    const secondDuration = rangeMinutes(s2, e2, secondNextDay);
    const segmentBreaks = [...(Array.isArray(split.segment1Breaks) ? split.segment1Breaks : []), ...(Array.isArray(split.segment2Breaks) ? split.segment2Breaks : [])].map(asObject);
    const breakTotal = totalBreakMinutes(segmentBreaks);
    const deductibleBreaks = totalBreakMinutes(segmentBreaks, true);
    rows.push(['بازه اول', rangeLabel(s1, e1, firstNextDay)], ['مدت بازه اول', firstDuration === null ? null : minutesLabel(firstDuration)], ['بازه دوم', rangeLabel(s2, e2, secondNextDay)], ['مدت بازه دوم', secondDuration === null ? null : minutesLabel(secondDuration)]);
    if (firstDuration !== null && secondDuration !== null) rows.push(['مجموع مدت دو بازه', minutesLabel(firstDuration + secondDuration)], ['مدت خالص کارکرد', minutesLabel(Math.max(0, firstDuration + secondDuration - (deductibleBreaks ?? 0)))]);
    if (e1 && s2) rows.push(['فاصله بین دو بازه', `${e1} تا ${s2} (استراحت محسوب نمی‌شود)`]);
    rows.push(['مجموع استراحت‌ها', breakTotal === null ? null : minutesLabel(breakTotal)]);
  } else {
    rows.push(['وضعیت تنظیمات', 'اطلاعات قابل‌اثبات این قالب چرخشی فقط به‌صورت خواندنی نمایش داده می‌شود.']);
  }
  rows.push(['خلاصه زمانی', item.timeSummary]);
  return rows.filter((row): row is [string, string] => Boolean(row[1]));
}

export function ShiftTemplateDetailDialog({ item, canManage, onClose, onEdit, onClone }: { item: ShiftTemplateListItem | null; canManage: boolean; onClose: () => void; onEdit: () => void; onClone: () => void }) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(Boolean(item?.isActive));
  const [operationError, setOperationError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  useEffect(() => { setIsActive(Boolean(item?.isActive)); setOperationError(null); }, [item]);
  if (!item) return null;
  const split = asObject(item.config.splitShift);
  const breaks = item.shiftType === 'split'
    ? [
        ...(Array.isArray(split.segment1Breaks) ? split.segment1Breaks.map((rest) => ({ ...asObject(rest), provenSegment: 'بازه اول' })) : []),
        ...(Array.isArray(split.segment2Breaks) ? split.segment2Breaks.map((rest) => ({ ...asObject(rest), provenSegment: 'بازه دوم' })) : []),
      ]
    : extractTemplateBreaks(item.shiftType, item.config).map(asObject);
  const source = item.sourceTemplateTitle ? `ایجادشده با ایجاد نسخه مشابه از «${item.sourceTemplateTitle}»` : null;
  const handleToggle = (next: boolean) => {
    const message = item.isUsed && !next
      ? 'این قالب قبلاً در تقویم‌های کاری استفاده شده است. غیرفعال‌سازی فقط مانع انتخاب آن برای استفاده‌های جدید می‌شود و تنظیمات قبلی تقویم‌ها را تغییر نمی‌دهد.\n\nغیرفعال کردن؟'
      : next ? 'قالب فعال شود؟' : 'قالب غیرفعال شود؟';
    if (!window.confirm(message)) return;
    setOperationError(null);
    const formData = new FormData(); formData.set('id', item.id); formData.set('isActive', String(next));
    startTransition(() => { void toggleShiftTemplateActiveAction(formData).then(() => { setIsActive(next); router.refresh(); }).catch((error) => setOperationError(error instanceof Error && error.message ? error.message : 'تغییر وضعیت قالب شیفت انجام نشد. دوباره تلاش کنید.')); });
  };
  return <div className="calendar-create-modal-backdrop" role="presentation" dir="rtl" onMouseDown={onClose}>
    <section className="calendar-create-modal shift-template-detail-modal" role="dialog" aria-modal="true" aria-labelledby="shift-template-detail-title" onMouseDown={(event) => event.stopPropagation()}>
      <header className="calendar-create-modal-head"><div className="panel-form-modal-title-row"><h2 id="shift-template-detail-title">جزئیات قالب شیفت</h2><button type="button" className="panel-form-modal-close" aria-label="بستن" onClick={onClose}><X className="h-4 w-4" /></button></div><p className="calendar-event-modal-lead">اطلاعات زمانی، وضعیت استفاده و نحوه به‌کارگیری این قالب را مشاهده کنید.</p></header>
      <div className="calendar-create-modal-body shift-template-detail-body">
        <div className="shift-template-detail-title"><div><h3>{item.title}</h3><span>{getShiftTemplateTypeLabel(item.shiftType)}</span></div><div className="shift-template-detail-badges"><span className={`module-status-pill ${isActive ? 'is-active' : 'is-inactive'}`}>{isActive ? 'فعال' : 'غیرفعال'}</span><span className="module-status-pill is-neutral">{item.isUsed ? 'استفاده‌شده' : item.usageUnknown ? 'استفاده نامشخص' : 'بدون استفاده'}</span></div></div>
        <section><h4>اطلاعات پایه</h4><dl className="shift-template-detail-grid"><div><dt>نام قالب</dt><dd>{item.title}</dd></div><div><dt>نوع شیفت</dt><dd>{getShiftTemplateTypeLabel(item.shiftType)}</dd></div><div><dt>توضیحات</dt><dd>{item.description?.trim() || 'توضیحی ثبت نشده است.'}</dd></div><div><dt>وضعیت</dt><dd>{isActive ? 'فعال' : 'غیرفعال'}</dd></div>{source ? <div><dt>منبع</dt><dd>{source}</dd></div> : null}<div><dt>تاریخ ایجاد</dt><dd>{formatPersianDate(item.createdAt)}</dd></div><div><dt>آخرین ویرایش</dt><dd>{formatPersianDate(item.updatedAt)}</dd></div></dl></section>
        <section><h4>تنظیمات زمانی</h4><dl className="shift-template-detail-grid">{timingRows(item).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
        <section><h4>استراحت‌ها</h4>{breaks.length ? <div className="shift-template-break-list">{breaks.map((rest, index) => { const duration = breakMinutes(rest); const hasRange = rest.type !== 'floating' && Boolean(text(rest.start) && text(rest.end)); return <dl key={index} className="shift-template-detail-grid"><div><dt>نوع استراحت</dt><dd>{text(rest.title) ?? (rest.type === 'floating' ? 'شناور' : 'ثابت')}</dd></div>{hasRange ? <div><dt>زمان</dt><dd>{rangeLabel(rest.start, rest.end, Boolean(rest.endsNextDay))}</dd></div> : duration !== null ? <div><dt>مدت استراحت</dt><dd>{minutesLabel(duration)}</dd></div> : null}<div><dt>کسر از کارکرد</dt><dd>{rest.deductFromWork === false ? 'بدون کسر از کارکرد' : 'با کسر از کارکرد'}</dd></div>{text(rest.provenSegment ?? rest.segment) ? <div><dt>بازه مربوط</dt><dd>{text(rest.provenSegment ?? rest.segment)}</dd></div> : null}</dl>; })}</div> : <p className="shift-template-detail-empty">برای این قالب، استراحتی تعریف نشده است.</p>}</section>
        <section><h4>وضعیت استفاده</h4><p className="shift-template-copy-note">ویرایش این قالب استفاده‌های قبلی را تغییر نمی‌دهد و فقط تنظیمات استفاده‌های بعدی را به‌روزرسانی می‌کند.</p><p>{item.isUsed ? `این قالب در ${item.usageCount} شیفت تقویم استفاده شده است.` : item.usageUnknown ? 'به‌دلیل وجود داده قدیمی بدون منبع، نبود استفاده با قطعیت قابل اثبات نیست.' : 'استفاده‌ای با منشأ قابل‌اثبات برای این قالب ثبت نشده است.'}</p>{item.usageCalendars.length ? <div className="shift-template-detail-usage"><strong>تقویم‌های استفاده‌کننده</strong>{item.usageCalendars.map((calendar) => <span key={calendar.id}>{calendar.title}</span>)}</div> : null}</section>
      </div>
      {operationError ? <p className="calendar-create-error" role="alert">{operationError}</p> : null}
      <footer className="calendar-create-modal-footer">{canManage ? <><button type="button" className="calendar-create-submit" onClick={onEdit}><Pencil className="h-4 w-4" /> ویرایش قالب شیفت</button><button type="button" className="calendar-create-submit" onClick={onClone}><Copy className="h-4 w-4" /> ایجاد نسخه مشابه</button><CardMenu items={[{ kind: 'action', label: isActive ? 'غیرفعال کردن' : 'فعال کردن', icon: <Power className="h-4 w-4" />, onClick: () => handleToggle(!isActive) }, ...(!item.isUsed && !item.usageUnknown ? [{ kind: 'submit' as const, label: 'حذف', tone: 'danger' as const, icon: <Trash2 className="h-4 w-4" />, action: async (formData: FormData) => { await deleteShiftTemplateAction(formData); onClose(); }, hiddenFields: { id: item.id }, confirm: { title: 'حذف قالب شیفت', description: `آیا از حذف «${item.title}» مطمئن هستید؟`, confirmLabel: 'بله، حذف شود', cancelLabel: 'انصراف' } }] : [])]} />{pending ? <span role="status">در حال تغییر وضعیت...</span> : null}</> : null}<button type="button" className="calendar-create-cancel" onClick={onClose}>بستن</button></footer>
    </section>
  </div>;
}
