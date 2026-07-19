'use client';

import { X, Pencil, Copy } from 'lucide-react';
import { getShiftTemplateTypeLabel } from '../../../lib/shift-template-map';
import type { ShiftTemplateListItem } from './ShiftTemplateCard';

export function ShiftTemplateDetailDialog({ item, canManage, onClose, onEdit, onClone }: { item: ShiftTemplateListItem | null; canManage: boolean; onClose: () => void; onEdit: () => void; onClone: () => void }) {
  if (!item) return null;
  return <div className="calendar-create-modal-backdrop" role="presentation" dir="rtl" onMouseDown={onClose}>
    <section className="calendar-create-modal" role="dialog" aria-modal="true" aria-labelledby="shift-template-detail-title" onMouseDown={(event) => event.stopPropagation()}>
      <header className="calendar-create-modal-head"><div className="panel-form-modal-title-row"><h2 id="shift-template-detail-title">جزئیات قالب شیفت</h2><button type="button" className="panel-form-modal-close" aria-label="بستن" onClick={onClose}><X className="h-4 w-4" /></button></div><p className="calendar-event-modal-lead">اطلاعات واقعی ذخیره‌شده و استفاده‌های قابل‌اثبات این قالب</p></header>
      <div className="calendar-create-modal-body shift-template-detail-body"><div className="shift-template-detail-title"><h3>{item.title}</h3><span className={`module-status-pill ${item.isActive ? 'is-active' : 'is-inactive'}`}>{item.isActive ? 'فعال' : 'غیرفعال'}</span></div><dl className="shift-template-detail-grid"><div><dt>نوع شیفت</dt><dd>{getShiftTemplateTypeLabel(item.shiftType)}</dd></div><div><dt>روزهای فعال</dt><dd>{item.weekDays.join('، ') || 'ثبت نشده'}</dd></div><div><dt>خلاصه زمانی</dt><dd>{item.timeSummary}</dd></div><div><dt>استراحت</dt><dd>{item.breakSummary}</dd></div><div><dt>وضعیت استفاده</dt><dd>{item.isUsed ? `استفاده‌شده در ${item.usageCount} شیفت تقویم` : item.usageUnknown ? 'استفاده نامشخص؛ داده قدیمی بدون منبع' : 'بدون استفاده قابل‌اثبات'}</dd></div><div><dt>منبع</dt><dd>{typeof item.config.sourceTemplateId === 'string' ? 'نسخه مشابه از قالب دیگر' : 'سفارشی'}</dd></div></dl>{item.usageCalendars.length ? <div className="shift-template-detail-usage"><strong>تقویم‌های استفاده‌کننده</strong>{item.usageCalendars.map((calendar) => <span key={calendar.id}>{calendar.title}</span>)}</div> : null}</div>
      <footer className="calendar-create-modal-footer">{canManage ? <><button type="button" className="calendar-create-submit" onClick={onEdit}><Pencil className="h-4 w-4" /> ویرایش</button><button type="button" className="calendar-create-submit" onClick={onClone}><Copy className="h-4 w-4" /> ایجاد نسخه مشابه</button></> : null}<button type="button" className="calendar-create-cancel" onClick={onClose}>بستن</button></footer>
    </section>
  </div>;
}
