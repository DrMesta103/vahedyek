'use client';

import { useState, useTransition } from 'react';
import { Info, Pencil, Trash2, User } from 'lucide-react';
import { CardMenu } from '../../../components/CardMenu';
import { deleteEmployeeAction, toggleEmployeeActiveAction } from '../../../lib/actions';
import { formatPersianDate } from '../../../lib/format-date';

export type EmployeeCardItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile1: string | null;
  mobile2: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

function displayValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '-';
}

export function EmployeeCard({ employee }: { employee: EmployeeCardItem }) {
  const [isActive, setIsActive] = useState(employee.isActive);
  const [pending, startTransition] = useTransition();
  const fullName = `${employee.firstName} ${employee.lastName}`.trim();

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
      <div className="employee-card-identity">
        <div className="employee-card-avatar" aria-hidden>
          {employee.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={employee.avatarUrl} alt="" />
          ) : (
            <User className="h-7 w-7" strokeWidth={2} />
          )}
        </div>
        <h3 className="employee-card-name">{fullName || 'بدون نام'}</h3>
      </div>

      <div className="employee-card-details">
        <div className="employee-card-detail-row">
          <span className="employee-card-detail-label">ایمیل:</span>
          <span className="employee-card-detail-value">{displayValue(employee.email)}</span>
        </div>
        <div className="employee-card-detail-row">
          <span className="employee-card-detail-label">شماره موبایل ۱:</span>
          <span className="employee-card-detail-value">{displayValue(employee.mobile1)}</span>
        </div>
        <div className="employee-card-detail-row">
          <span className="employee-card-detail-label">شماره موبایل ۲:</span>
          <span className="employee-card-detail-value">{displayValue(employee.mobile2)}</span>
        </div>
        <div className="employee-card-detail-row">
          <span className="employee-card-detail-label">تاریخ ایجاد:</span>
          <span className="employee-card-detail-value">{formatPersianDate(employee.createdAt)}</span>
        </div>
      </div>

      <div className="employee-card-actions">
        <label className="request-reason-toggle employee-card-toggle">
          <input type="checkbox" checked={isActive} disabled={pending} onChange={(event) => handleToggle(event.target.checked)} />
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
    </article>
  );
}
