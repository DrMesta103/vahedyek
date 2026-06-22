'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition, type KeyboardEvent } from 'react';
import { CardMenu } from '../../../components/CardMenu';
import { deleteCalendarAction, toggleCalendarStatusAction } from '../../../lib/actions';
import { getCalendarShiftTypeLabel, type CalendarShiftType } from '../../../lib/calendar-shifts';

export type CalendarCardItem = {
  id: string;
  title: string;
  description: string | null;
  status: 'active' | 'inactive';
  isIncomplete: boolean;
  yearLabel: string;
  shiftCount: number;
  shiftTypes: CalendarShiftType[];
  totalShiftDays: number;
  eventCount: number;
  holidayCount: number;
  otherEventCount: number;
  policyCount: number;
  workGroupCount: number;
};

function resolveCalendarStatus(item: Pick<CalendarCardItem, 'status' | 'isIncomplete'>) {
  if (item.status === 'inactive') {
    return { label: 'غیرفعال', className: 'is-inactive' };
  }

  if (item.isIncomplete) {
    return { label: 'ناقص', className: 'is-incomplete' };
  }

  return { label: 'فعال', className: 'is-active' };
}

export function CalendarCard({ item }: { item: CalendarCardItem }) {
  const router = useRouter();
  const [status, setStatus] = useState(item.status);
  const [pending, startTransition] = useTransition();
  const statusDisplay = resolveCalendarStatus({ status, isIncomplete: item.isIncomplete });
  const detailsHref = `/calendars/${item.id}`;

  const shiftSummary = useMemo(() => {
    if (item.shiftCount <= 0) {
      return { label: 'بدون شیفت', tone: 'is-empty' as const };
    }

    const labels = item.shiftTypes.slice(0, 2).map((type) => getCalendarShiftTypeLabel(type));
    const summary = labels.join('، ');
    return {
      label: `${item.shiftCount.toLocaleString('fa-IR')} شیفت ثبت شده${summary ? ` • ${summary}` : ''}`,
      tone: 'is-filled' as const,
    };
  }, [item.shiftCount, item.shiftTypes]);

  const eventSummary = useMemo(() => {
    if (item.eventCount <= 0) {
      return { label: 'بدون رویداد', tone: 'is-empty' as const };
    }

    const holidayLabel = item.holidayCount > 0 ? `${item.holidayCount.toLocaleString('fa-IR')} تعطیلی` : null;
    const otherLabel = item.otherEventCount > 0 ? `${item.otherEventCount.toLocaleString('fa-IR')} مناسبت` : null;
    return {
      label: [holidayLabel, otherLabel].filter(Boolean).join(' • ') || `${item.eventCount.toLocaleString('fa-IR')} رویداد`,
      tone: 'is-filled' as const,
    };
  }, [item.eventCount, item.holidayCount, item.otherEventCount]);

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
      aria-label={`مشاهده جزئیات تقویم ${item.title}`}
    >
      <div className="module-grid-card-top">
        <div className="module-grid-card-body">
          <div className="module-grid-card-title-row">
            <h3>{item.title}</h3>
            <span className={`module-status-pill ${statusDisplay.className}`}>{statusDisplay.label}</span>
          </div>
          <p>سال: {item.yearLabel}</p>
          <p>{item.description?.trim() ? item.description : 'توضیحات: ثبت نشده'}</p>
        </div>

        <div
          className="module-grid-card-top-actions"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <label
            className="request-reason-toggle module-grid-card-toggle"
            aria-label={status === 'active' ? 'غیرفعال کردن تقویم' : 'فعال کردن تقویم'}
          >
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
              { kind: 'link', href: detailsHref, label: 'مشاهده جزئیات تقویم' },
              ...(item.policyCount > 0 ? [{ kind: 'link' as const, href: '/policies', label: 'سیاست‌های مرتبط' }] : []),
              ...(item.workGroupCount > 0
                ? [
                    {
                      kind: 'link' as const,
                      href: `/work-groups?calendarId=${item.id}`,
                      label: 'گروه‌های کاری مرتبط',
                    },
                  ]
                : []),
              {
                kind: 'action' as const,
                label: status === 'active' ? 'غیرفعال‌سازی تقویم' : 'فعال‌سازی تقویم',
                onClick: () => handleToggle(status !== 'active'),
              },
              {
                kind: 'submit',
                label: 'حذف تقویم',
                tone: 'danger',
                action: deleteCalendarAction,
                hiddenFields: { id: item.id },
                confirm: {
                  title: 'حذف تقویم کاری',
                  description:
                    item.policyCount > 0 || item.workGroupCount > 0
                      ? 'آیا از حذف این تقویم کاری مطمئن هستید؟ در صورت وجود وابستگی، حذف مستقیم متوقف می‌شود.'
                      : 'آیا از حذف این تقویم کاری مطمئن هستید؟',
                  confirmLabel: 'حذف تقویم',
                  cancelLabel: 'انصراف',
                },
              },
            ]}
          />
        </div>
      </div>

      <div className="module-card-metrics">
        <div className="module-metric-panel">
          <span>خلاصه شیفت‌ها</span>
          <strong>{item.shiftCount.toLocaleString('fa-IR')}</strong>
          <b className={`module-card-summary-chip ${shiftSummary.tone}`}>{shiftSummary.label}</b>
        </div>

        <div className="module-metric-panel">
          <span>خلاصه رویدادها و تعطیلات</span>
          <strong>{item.eventCount.toLocaleString('fa-IR')}</strong>
          <b className={`module-card-summary-chip ${eventSummary.tone}`}>{eventSummary.label}</b>
        </div>
      </div>
    </article>
  );
}
