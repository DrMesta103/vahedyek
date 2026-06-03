'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import {
  Building2,
  CalendarDays,
  Check,
  Copy,
  ExternalLink,
  Info,
  Layers3,
  Pencil,
  Phone,
  Trash2,
  User,
} from 'lucide-react';
import { CardMenu } from '../../../components/CardMenu';
import { deleteEmployeeAction, toggleEmployeeActiveAction } from '../../../lib/actions';
import { formatPersianDate } from '../../../lib/format-date';
import { formatFaNumber } from '../../../lib/format-fa';
import { getEmployeeContractProfileProgress } from '../../../lib/employee-contracts';
import type { EmployeeCurrentContractSummary } from '../../../lib/employee-contracts';

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
  currentContract?: EmployeeCurrentContractSummary | null;
};

function displayValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '-';
}

export function EmployeeCard({ employee }: { employee: EmployeeCardItem }) {
  const [isActive, setIsActive] = useState(employee.isActive);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  const organizationUnitTitles = employee.organizationUnits.map((item) => item.title);
  const workGroupTitles = employee.workGroups.map((item) => item.title);
  const currentContract = employee.currentContract ?? null;
  const contractProgress = getEmployeeContractProfileProgress(currentContract);
  const contactLine = displayValue(employee.mobile1) !== '-' ? employee.mobile1 : employee.personnelCode;
  const contactLabel = displayValue(employee.mobile1) !== '-' ? 'موبایل' : 'کد پرسنلی';

  const handleToggle = (next: boolean) => {
    setIsActive(next);
    const formData = new FormData();
    formData.set('id', employee.id);
    formData.set('isActive', String(next));
    startTransition(() => {
      void toggleEmployeeActiveAction(formData);
    });
  };

  const handleCopy = async () => {
    const value = contactLine?.trim();
    if (!value || value === '-') return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <article className="employee-card">
      <div className="employee-card-toolbar">
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
        <label className="request-reason-toggle employee-card-toggle">
          <input
            type="checkbox"
            checked={isActive}
            disabled={pending}
            onChange={(event) => handleToggle(event.target.checked)}
          />
          <span className="request-reason-toggle-track" aria-hidden />
        </label>
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
          <div className="employee-card-contact-line">
            <span>{displayValue(contactLine)}</span>
            {contactLine && contactLine !== '-' ? (
              <button type="button" className="employee-card-copy-btn" onClick={handleCopy} aria-label={`کپی ${contactLabel}`}>
                {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="employee-card-details">
        <div className="employee-card-detail-row is-compact">
          <span className="employee-card-detail-label">وضعیت کارمند:</span>
          <span className={`employee-card-status ${isActive ? 'is-active' : 'is-inactive'}`}>{isActive ? 'فعال' : 'غیرفعال'}</span>
          <Link href={`/employees/${employee.id}`} className="employee-card-detail-value employee-card-detail-value--link">
            مشاهده جزئیات
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </div>
        <div className="employee-card-detail-row">
          <span className="employee-card-detail-label">
            <Phone className="h-3.5 w-3.5" aria-hidden />
            موبایل ۱:
          </span>
          <span className="employee-card-detail-value">{displayValue(employee.mobile1)}</span>
        </div>
        <div className="employee-card-detail-row">
          <span className="employee-card-detail-label">
            <Phone className="h-3.5 w-3.5" aria-hidden />
            موبایل ۲:
          </span>
          <span className="employee-card-detail-value">{displayValue(employee.mobile2)}</span>
        </div>
        <div className="employee-card-detail-row">
          <span className="employee-card-detail-label">
            <Building2 className="h-3.5 w-3.5" aria-hidden />
            واحد سازمانی:
          </span>
          <span className="employee-card-detail-value">{organizationUnitTitles.length ? organizationUnitTitles.join('، ') : '-'}</span>
        </div>
        <div className="employee-card-detail-row">
          <span className="employee-card-detail-label">
            <Layers3 className="h-3.5 w-3.5" aria-hidden />
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
            {currentContract ? `${currentContract.contractNumber ?? 'بدون شماره'} · ${currentContract.startDate ?? '-'} تا ${currentContract.endDate ?? '-'}` : 'فاقد قرارداد'}
          </span>
        </div>
        {currentContract?.jobTitle ? (
          <div className="employee-card-detail-row">
            <span className="employee-card-detail-label">عنوان شغلی قرارداد:</span>
            <span className="employee-card-detail-value">{currentContract.jobTitle}</span>
          </div>
        ) : null}
        <div className="employee-card-detail-row">
          <span className="employee-card-detail-label">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            تاریخ ایجاد:
          </span>
          <span className="employee-card-detail-value">{formatPersianDate(employee.createdAt)}</span>
        </div>
      </div>

      <div className="employee-card-progress" aria-label="تکمیل پرونده قرارداد">
        <div className="employee-card-arc-gauge" style={{ ['--progress' as never]: `${contractProgress.completionPercent}%` }} aria-hidden>
          <div className="employee-card-arc-gauge-track" />
          <div className="employee-card-arc-gauge-fill" />
          <div className="employee-card-arc-gauge-value">
            <strong>{formatFaNumber(contractProgress.completionPercent, { useGrouping: false })}%</strong>
          </div>
        </div>
        <div className="employee-card-progress-stats">
          <p>
            <span className="employee-card-progress-dot is-passed" aria-hidden />
            <span>
              {contractProgress.hasContract
                ? `${formatFaNumber(contractProgress.daysSinceContractStart, { useGrouping: false })} روز از شروع قرارداد گذشته`
                : 'قرارداد فعال ثبت نشده'}
            </span>
          </p>
          <p>
            <span className="employee-card-progress-dot is-remaining" aria-hidden />
            <span>
              {!contractProgress.hasContract
                ? 'برای تکمیل پرونده، قرارداد را نهایی کنید'
                : contractProgress.missingSections > 0
                  ? `${formatFaNumber(contractProgress.missingSections, { useGrouping: false })} مرحله ناقص در قرارداد`
                  : 'پرونده قرارداد کامل است'}
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}
