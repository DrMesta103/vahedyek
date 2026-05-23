'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type KeyboardEvent } from 'react';
import { CardMenu } from '../../../components/CardMenu';
import { deleteCalendarAction, toggleCalendarStatusAction } from '../../../lib/actions';

export type CalendarCardItem = {
  id: string;
  title: string;
  description: string | null;
  status: 'active' | 'inactive';
  yearLabel: string;
  totalShiftDays: number;
  totalEventDays: number;
};

function statusMeta(status: 'active' | 'inactive') {
  if (status === 'active') {
    return { label: 'فعال', className: 'is-active' };
  }

  return { label: 'غیرفعال', className: 'is-inactive' };
}

function metricProgress(value: number, max: number) {
  if (max <= 0) return 8;
  return Math.min(100, Math.max(8, Math.round((value / max) * 100)));
}

export function CalendarCard({
  item,
  onCreateCalendar,
}: {
  item: CalendarCardItem;
  onCreateCalendar?: () => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(item.status);
  const [pending, startTransition] = useTransition();
  const statusDisplay = statusMeta(status);
  const detailsHref = `/calendars/${item.id}`;

  const openDetails = () => {
    router.push(detailsHref);
  };

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetails();
    }
  };

  const handleToggle = (next: boolean) => {
    const nextStatus = next ? 'active' : 'inactive';
    setStatus(nextStatus);
    const formData = new FormData();
    formData.set('id', item.id);
    formData.set('isActive', String(next));
    startTransition(() => {
      void toggleCalendarStatusAction(formData);
    });
  };

  return (
    <article
      className="module-grid-card is-clickable"
      role="link"
      tabIndex={0}
      onClick={openDetails}
      onKeyDown={handleCardKeyDown}
      aria-label={`مشاهده جزئیات ${item.title}`}
    >
      <div className="module-grid-card-top">
        <div className="module-grid-card-body">
          <h3>{item.title}</h3>
          <p>توضیحات : {item.description ?? 'ثبت نشده'}</p>
        </div>

        <div className="module-grid-card-top-actions" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <span className={`module-status-pill ${statusDisplay.className}`}>{statusDisplay.label}</span>
          <label className="request-reason-toggle module-grid-card-toggle" aria-label={status === 'active' ? 'غیرفعال کردن تقویم' : 'فعال کردن تقویم'}>
            <input
              type="checkbox"
              checked={status === 'active'}
              disabled={pending}
              onChange={(event) => handleToggle(event.target.checked)}
            />
            <span className="request-reason-toggle-track" aria-hidden />
          </label>
          <CardMenu
            items={[
              { kind: 'link', href: detailsHref, label: 'جزئیات تقویم' },
              ...(onCreateCalendar
                ? [{ kind: 'action' as const, label: 'تقویم جدید', onClick: onCreateCalendar }]
                : []),
              { kind: 'link', href: '/policies', label: 'سیاست‌ها' },
              {
                kind: 'submit',
                label: 'حذف تقویم',
                tone: 'danger',
                action: deleteCalendarAction,
                hiddenFields: { id: item.id },
                confirm: {
                  title: 'حذف تقویم کاری',
                  description: `آیا از حذف «${item.title}» مطمئن هستید؟ این تقویم از فهرست شما حذف می‌شود.`,
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
          <span>روز های کاری / شیفت ها</span>
          <strong>{item.totalShiftDays}</strong>
          <div className="module-metric-progress" aria-hidden>
            <span style={{ width: `${metricProgress(item.totalShiftDays, 365)}%` }} />
          </div>
        </div>

        <div className="module-metric-panel">
          <span>رویداد ها / روز های تعطیل</span>
          <strong>{item.totalEventDays}</strong>
          <div className="module-metric-progress" aria-hidden>
            <span style={{ width: `${metricProgress(item.totalEventDays, 50)}%` }} />
          </div>
        </div>
      </div>
    </article>
  );
}
