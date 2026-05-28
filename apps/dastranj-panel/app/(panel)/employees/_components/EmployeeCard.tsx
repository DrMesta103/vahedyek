'use client';

import { useState, useTransition } from 'react';
import { Building2, CalendarDays, Info, Layers3, Pencil, Phone, Trash2, User } from 'lucide-react';
import { CardMenu } from '../../../components/CardMenu';
import { deleteEmployeeAction, toggleEmployeeActiveAction } from '../../../lib/actions';
import { formatPersianDate } from '../../../lib/format-date';

export type EmployeeCardItem = {
  id: string;
  firstName: string;
  lastName: string;
  personnelCode: string | null;
  email: string | null;
  mobile1: string | null;
  mobile2: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  organizationUnits: Array<{ id: string; title: string }>;
  workGroups: Array<{ id: string; title: string }>;
};

function displayValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '-';
}

function countCompletion(employee: EmployeeCardItem) {
  const items = [
    employee.personnelCode,
    employee.email,
    employee.mobile1,
    employee.mobile2,
    employee.avatarUrl,
    employee.organizationUnits.length ? '1' : '',
    employee.workGroups.length ? '1' : '',
  ];
  return Math.round((items.filter(Boolean).length / items.length) * 100);
}

export function EmployeeCard({ employee }: { employee: EmployeeCardItem }) {
  const [isActive, setIsActive] = useState(employee.isActive);
  const [pending, startTransition] = useTransition();
  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  const organizationUnitTitles = employee.organizationUnits.map((item) => item.title);
  const workGroupTitles = employee.workGroups.map((item) => item.title);
  const completionPercent = countCompletion(employee);
  const missingCount = 7 - Math.round((completionPercent / 100) * 7);

  const handleToggle = (next: boolean) => {
    setIsActive(next);
    const formData = new FormData();
    formData.set('id', employee.id);
    formData.set('isActive', String(next));
    startTransition(() => {
      void toggleEmployeeActiveAction(formData);
    });
  };

  return (
    <article className="employee-card">
      <div className="employee-card-progress" aria-label="تکمیل پرونده">
        <div
          className="employee-card-progress-ring"
          style={{ ['--progress' as never]: `${completionPercent}%` }}
          aria-hidden
        >
          <div className="employee-card-progress-ring-inner">
            <strong>{completionPercent}%</strong>
            <span>تکمیل پرونده</span>
          </div>
        </div>
        <div className="employee-card-progress-note">
          <span>{displayValue(employee.personnelCode) === '-' ? 'کد پرسنلی ثبت نشده' : `کد ${displayValue(employee.personnelCode)}`}</span>
          <small>{missingCount > 0 ? `${missingCount} بخش ناقص` : 'پرونده کامل است'}</small>
        </div>
      </div>

      <div className="employee-card-details">
        <div className="employee-card-detail-row is-compact">
          <span className="employee-card-detail-label">وضعیت کارمند:</span>
          <span className={`employee-card-status ${isActive ? 'is-active' : 'is-inactive'}`}>{isActive ? 'فعال' : 'غیرفعال'}</span>
          <span className="employee-card-detail-value employee-card-detail-value--link">مشاهده جزئیات</span>
        </div>
        <div className="employee-card-detail-row">
          <span className="employee-card-detail-label">
            <Phone className="h-3.5 w-3.5" />
            موبایل ۱:
          </span>
          <span className="employee-card-detail-value">{displayValue(employee.mobile1)}</span>
        </div>
        <div className="employee-card-detail-row">
          <span className="employee-card-detail-label">
            <Phone className="h-3.5 w-3.5" />
            موبایل ۲:
          </span>
          <span className="employee-card-detail-value">{displayValue(employee.mobile2)}</span>
        </div>
        <div className="employee-card-detail-row">
          <span className="employee-card-detail-label">
            <Building2 className="h-3.5 w-3.5" />
            واحد سازمانی:
          </span>
          <span className="employee-card-detail-value">{organizationUnitTitles.length ? organizationUnitTitles.join('، ') : '-'}</span>
        </div>
        <div className="employee-card-detail-row">
          <span className="employee-card-detail-label">
            <Layers3 className="h-3.5 w-3.5" />
            گروه کاری:
          </span>
          <span className="employee-card-detail-value">{workGroupTitles.length ? workGroupTitles.join('، ') : '-'}</span>
        </div>
        <div className="employee-card-detail-row">
          <span className="employee-card-detail-label">ایمیل:</span>
          <span className="employee-card-detail-value">{displayValue(employee.email)}</span>
        </div>
        <div className="employee-card-detail-row">
          <span className="employee-card-detail-label">
            <CalendarDays className="h-3.5 w-3.5" />
            تاریخ ایجاد:
          </span>
          <span className="employee-card-detail-value">{formatPersianDate(employee.createdAt)}</span>
        </div>
      </div>

      <div className="employee-card-profile">
        <div className="employee-card-avatar employee-card-avatar--large" aria-hidden>
          {employee.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={employee.avatarUrl} alt="" />
          ) : (
            <User className="h-8 w-8" strokeWidth={2} />
          )}
        </div>
        <div className="employee-card-profile-copy">
          <strong>{fullName || 'بدون نام'}</strong>
          <span>{displayValue(employee.personnelCode)}</span>
        </div>
        <div className="employee-card-actions">
          <label className="request-reason-toggle employee-card-toggle">
            <input
              type="checkbox"
              checked={isActive}
              disabled={pending}
              onChange={(event) => handleToggle(event.target.checked)}
            />
            <span className="request-reason-toggle-track" aria-hidden />
          </label>

          <CardMenu
            items={[
              {
                kind: 'link',
                href: `/employees/${employee.id}`,
                label: 'ویرایش',
                icon: <Pencil className="h-4 w-4" strokeWidth={2.2} />,
              },
              {
                kind: 'link',
                href: `/employees/${employee.id}`,
                label: 'جزئیات',
                icon: <Info className="h-4 w-4" strokeWidth={2.2} />,
              },
              {
                kind: 'submit',
                label: 'حذف',
                tone: 'danger',
                icon: <Trash2 className="h-4 w-4" strokeWidth={2.2} />,
                action: deleteEmployeeAction,
                hiddenFields: { id: employee.id },
                confirm: {
                  title: 'حذف کارمند',
                  description: `آیا از حذف «${fullName}» مطمئن هستید؟`,
                  confirmLabel: 'بله، حذف شود',
                  cancelLabel: 'انصراف',
                },
              },
            ]}
          />
        </div>
      </div>
    </article>
  );
}
