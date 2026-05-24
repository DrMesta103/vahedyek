'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { CardMenu } from '../../../components/CardMenu';
import { deleteShiftTemplateAction, toggleShiftTemplateActiveAction } from '../../../lib/actions';
import type { ShiftTemplateCategory } from '../../../lib/shift-template-map';

export type ShiftTemplateListItem = {
  id: string;
  title: string;
  description: string | null;
  shiftType: ShiftTemplateCategory;
  weekDays: string[];
  isActive: boolean;
};

function statusMeta(isActive: boolean) {
  return isActive ? { label: 'فعال', className: 'is-active' } : { label: 'غیرفعال', className: 'is-inactive' };
}

export function ShiftTemplateCard({ item }: { item: ShiftTemplateListItem }) {
  const [isActive, setIsActive] = useState(item.isActive);
  const [pending, startTransition] = useTransition();
  const status = statusMeta(isActive);
  const weekDaysLabel =
    item.shiftType === 'rotate'
      ? 'الگوی چرخشی'
      : item.weekDays.length > 0
        ? item.weekDays.join('، ')
        : 'روزی انتخاب نشده';

  const handleToggle = (next: boolean) => {
    setIsActive(next);
    const formData = new FormData();
    formData.set('id', item.id);
    formData.set('isActive', String(next));
    startTransition(() => {
      void toggleShiftTemplateActiveAction(formData);
    });
  };

  return (
    <article className="module-grid-card shift-template-card">
      <div className="module-grid-card-top">
        <div className="module-grid-card-body">
          <h3>{item.title}</h3>
          <p>{item.description?.trim() ? item.description : 'توضیحات ثبت نشده است'}</p>
        </div>

        <div className="module-grid-card-top-actions">
          <span className={`module-status-pill ${status.className}`}>{status.label}</span>
          <label className="request-reason-toggle module-grid-card-toggle" aria-label={isActive ? 'غیرفعال کردن قالب' : 'فعال کردن قالب'}>
            <input type="checkbox" checked={isActive} disabled={pending} onChange={(event) => handleToggle(event.target.checked)} />
            <span className="request-reason-toggle-track" aria-hidden />
          </label>
          <CardMenu
            items={[
              {
                kind: 'submit',
                label: 'حذف',
                tone: 'danger',
                icon: <Trash2 className="h-4 w-4" strokeWidth={2.2} />,
                action: deleteShiftTemplateAction,
                hiddenFields: { id: item.id },
                confirm: {
                  title: 'حذف قالب شیفت',
                  description: `آیا از حذف «${item.title}» مطمئن هستید؟`,
                  confirmLabel: 'بله، حذف شود',
                  cancelLabel: 'انصراف',
                },
              },
            ]}
          />
        </div>
      </div>

      <div className="module-card-metrics">
        <div className="module-metric-panel">
          <span>روزهای هفته</span>
          <strong>{weekDaysLabel}</strong>
        </div>
      </div>
    </article>
  );
}
