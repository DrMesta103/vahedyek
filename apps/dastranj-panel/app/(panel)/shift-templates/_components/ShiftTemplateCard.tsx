'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Copy, Trash2 } from 'lucide-react';
import { CardMenu } from '../../../components/CardMenu';
import { deleteShiftTemplateAction, toggleShiftTemplateActiveAction } from '../../../lib/actions';
import { getShiftTemplateTypeLabel, type ShiftTemplateCategory } from '../../../lib/shift-template-map';

export type ShiftTemplateListItem = {
  id: string;
  title: string;
  description: string | null;
  shiftType: ShiftTemplateCategory;
  weekDays: string[];
  isActive: boolean;
  config: Record<string, unknown>;
  timeSummary: string;
  breakSummary: string;
  usageCount: number;
  isUsed: boolean;
  usageUnknown: boolean;
  usageCalendars: Array<{ id: string; title: string }>;
  updatedAt: string;
};

function statusMeta(isActive: boolean) {
  return isActive ? { label: 'فعال', className: 'is-active' } : { label: 'غیرفعال', className: 'is-inactive' };
}

export function ShiftTemplateCard({ item, canManage, onDetail, onEdit, onClone }: { item: ShiftTemplateListItem; canManage: boolean; onDetail: () => void; onEdit: () => void; onClone: () => void }) {
  const router = useRouter();
  const [isActive, setIsActive] = useState(item.isActive);
  const [pending, startTransition] = useTransition();
  const status = statusMeta(isActive);
  const weekDaysLabel = item.shiftType === 'rotate'
    ? 'الگوی چرخشی'
    : item.weekDays.length > 0 ? item.weekDays.join('، ') : 'روزی انتخاب نشده';

  const handleToggle = (next: boolean) => {
    if (!next && !window.confirm(item.isUsed ? `این قالب در ${item.usageCount} استفاده ثبت‌شده دارد. غیرفعال شود؟` : 'قالب غیرفعال شود؟')) return;
    setIsActive(next);
    const formData = new FormData();
    formData.set('id', item.id);
    formData.set('isActive', String(next));
    startTransition(() => {
      void toggleShiftTemplateActiveAction(formData)
        .then(() => router.refresh())
        .catch(() => setIsActive(!next));
    });
  };

  const menuItems = [
    { kind: 'action' as const, label: 'مشاهده جزئیات', icon: <Eye className="h-4 w-4" />, onClick: onDetail },
    { kind: 'action' as const, label: 'ویرایش', icon: <Pencil className="h-4 w-4" />, onClick: onEdit },
    { kind: 'action' as const, label: 'ایجاد نسخه مشابه', icon: <Copy className="h-4 w-4" />, onClick: onClone },
    ...(!item.isUsed && !item.usageUnknown ? [{
      kind: 'submit' as const,
      label: 'حذف',
      tone: 'danger' as const,
      icon: <Trash2 className="h-4 w-4" strokeWidth={2.2} />,
      action: deleteShiftTemplateAction,
      hiddenFields: { id: item.id },
      confirm: {
        title: 'حذف قالب شیفت',
        description: `آیا از حذف «${item.title}» مطمئن هستید؟`,
        confirmLabel: 'بله، حذف شود',
        cancelLabel: 'انصراف',
      },
    }] : []),
  ];

  return (
    <article className="module-grid-card shift-template-card">
      <div className="module-grid-card-top">
        <div className="module-grid-card-body">
          <div className="shift-template-card-title-row"><h3>{item.title}</h3><span className="module-status-pill is-neutral">{getShiftTemplateTypeLabel(item.shiftType)}</span></div>
          <p>{item.description?.trim() ? item.description : 'توضیحات ثبت نشده است'}</p>
        </div>
        <div className="module-grid-card-top-actions">
          <span className={`module-status-pill ${status.className}`}>{status.label}</span>
          {canManage ? <label className="request-reason-toggle module-grid-card-toggle" aria-label={isActive ? 'غیرفعال کردن قالب' : 'فعال کردن قالب'}>
            <input type="checkbox" checked={isActive} disabled={pending} onChange={(event) => handleToggle(event.target.checked)} />
            <span className="request-reason-toggle-track" aria-hidden />
          </label> : null}
          {canManage ? <CardMenu items={menuItems} /> : null}
        </div>
      </div>
      <div className="module-card-metrics">
        <div className="module-metric-panel"><span>خلاصه زمانی</span><strong>{item.timeSummary}</strong></div>
        <div className="module-metric-panel"><span>روزهای فعال</span><strong>{weekDaysLabel}</strong></div>
        <div className="module-metric-panel"><span>استفاده</span><strong>{item.isUsed ? `استفاده‌شده · ${item.usageCount} مورد` : item.usageUnknown ? 'استفاده نامشخص؛ داده قدیمی بدون منبع' : 'بدون استفاده ثبت‌شده'}</strong></div>
        <div className="module-metric-panel"><span>استراحت</span><strong>{item.breakSummary}</strong></div>
        <div className="module-metric-panel"><span>منبع</span><strong>{typeof item.config.sourceTemplateId === 'string' ? 'نسخه مشابه از قالب دیگر' : 'سفارشی'}</strong></div>
      </div>
    </article>
  );
}
