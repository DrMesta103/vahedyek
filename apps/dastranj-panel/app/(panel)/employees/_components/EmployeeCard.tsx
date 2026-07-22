'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { Building2, CalendarDays, Check, Copy, ExternalLink, Info, Layers3, Pencil, Phone, User, UserRound } from 'lucide-react';
import { CardMenu } from '../../../components/CardMenu';
import { toggleEmployeeActiveAction } from '../../../lib/actions';
import { formatPersianDate } from '../../../lib/format-date';
import { formatFaNumber } from '../../../lib/format-fa';
import { getEmployeeContractTimelineProgress } from '../../../lib/employee-contracts';
import type { EmployeeCurrentContractSummary } from '../../../lib/employee-contracts';
import type { EmployeeLifecycleStatus } from '../../../lib/data';

export type EmployeeCardItem = {
  id: string;
  firstName: string;
  lastName: string;
  personnelCode: string | null;
  nationalId: string | null;
  email: string | null;
  mobile1: string | null;
  mobile2: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  profileStatus: 'complete' | 'incomplete';
  lifecycleStatus: EmployeeLifecycleStatus;
  createdAt: string;
  organizationUnits: Array<{ id: string; title: string }>;
  workGroups: Array<{ id: string; title: string }>;
  currentContract?: EmployeeCurrentContractSummary | null;
};

function displayValue(value: string | null | undefined, emptyText: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : emptyText;
}

export function EmployeeCard({ employee }: { employee: EmployeeCardItem }) {
  const [isActive, setIsActive] = useState(employee.isActive);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  const organizationUnitTitles = employee.organizationUnits.map((item) => item.title);
  const workGroupTitles = employee.workGroups.map((item) => item.title);
  const currentContract = employee.currentContract ?? null;
  const contractProgress = getEmployeeContractTimelineProgress(currentContract);
  const contactLine = employee.mobile1?.trim() || employee.personnelCode?.trim() || '';
  const lifecycleLabels: Record<EmployeeLifecycleStatus, string> = {
    ended: 'پایان همکاری',
    invited: 'دعوت شده',
    incomplete: 'تکمیل نشده',
    active: 'فعال',
    inactive: 'غیرفعال',
  };
  const lifecycleClass = employee.lifecycleStatus === 'active' ? 'is-active' : employee.lifecycleStatus === 'inactive' ? 'is-inactive' : employee.lifecycleStatus === 'ended' ? 'is-ended' : 'is-pending';

  const handleToggle = (next: boolean) => {
    setIsActive(next);
    const formData = new FormData();
    formData.set('id', employee.id);
    formData.set('isActive', String(next));
    startTransition(() => void toggleEmployeeActiveAction(formData));
  };

  const handleCopy = async () => {
    if (!contactLine) return;
    try {
      await navigator.clipboard.writeText(contactLine);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard may be unavailable in restricted browser contexts.
    }
  };

  return (
    <article className="employee-card">
      <div className="employee-card-toolbar">
        <CardMenu
          items={[
            { kind: 'link', href: `/employees/${employee.id}`, label: 'مشاهده پرونده', icon: <Info className="h-4 w-4" strokeWidth={2.2} /> },
            { kind: 'link', href: `/employees/${employee.id}`, label: 'ویرایش اطلاعات', icon: <Pencil className="h-4 w-4" strokeWidth={2.2} /> },
            {
              kind: 'action',
              label: isActive ? 'قطع دسترسی' : 'فعال‌سازی دسترسی',
              icon: isActive ? <UserRound className="h-4 w-4" /> : <User className="h-4 w-4" />,
              onClick: () => handleToggle(!isActive),
            },
          ]}
        />
        <label className="request-reason-toggle employee-card-toggle" title={isActive ? 'قطع دسترسی' : 'فعال‌سازی دسترسی'}>
          <input type="checkbox" checked={isActive} disabled={pending} onChange={(event) => handleToggle(event.target.checked)} />
          <span className="request-reason-toggle-track" aria-hidden />
        </label>
      </div>

      <div className="employee-card-profile">
        <div className="employee-card-avatar employee-card-avatar--large" aria-hidden>
          {employee.avatarUrl ? <img src={employee.avatarUrl} alt="" /> : <User className="h-8 w-8" strokeWidth={2} />}
        </div>
        <div className="employee-card-profile-copy">
          <strong>{fullName || 'نام ثبت نشده'}</strong>
          <div className="employee-card-contact-line">
            <span>{displayValue(contactLine, 'موبایل ثبت نشده')}</span>
            {contactLine ? <button type="button" className="employee-card-copy-btn" onClick={handleCopy} aria-label="کپی اطلاعات تماس">{copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}</button> : null}
          </div>
        </div>
      </div>

      <div className="employee-card-details">
        <div className="employee-card-detail-row is-compact">
          <span className="employee-card-detail-label">وضعیت همکاری:</span>
          <span className={`employee-card-status ${lifecycleClass}`}>{lifecycleLabels[employee.lifecycleStatus]}</span>
          <Link href={`/employees/${employee.id}`} className="employee-card-detail-value employee-card-detail-value--link">مشاهده پرونده <ExternalLink className="h-3.5 w-3.5" aria-hidden /></Link>
        </div>
        <div className="employee-card-detail-row"><span className="employee-card-detail-label">کد پرسنلی:</span><span className="employee-card-detail-value">{displayValue(employee.personnelCode, 'کد پرسنلی ثبت نشده')}</span></div>
        <div className="employee-card-detail-row"><span className="employee-card-detail-label"><Phone className="h-3.5 w-3.5" aria-hidden /> موبایل:</span><span className="employee-card-detail-value">{displayValue(employee.mobile1, 'موبایل ثبت نشده')}</span></div>
        <div className="employee-card-detail-row"><span className="employee-card-detail-label"><Phone className="h-3.5 w-3.5" aria-hidden /> موبایل دوم:</span><span className="employee-card-detail-value">{displayValue(employee.mobile2, 'موبایل ثبت نشده')}</span></div>
        <div className="employee-card-detail-row"><span className="employee-card-detail-label">ایمیل:</span><span className="employee-card-detail-value">{displayValue(employee.email, 'ایمیل ثبت نشده')}</span></div>
        <div className="employee-card-detail-row"><span className="employee-card-detail-label"><Building2 className="h-3.5 w-3.5" aria-hidden /> واحد سازمانی:</span><span className="employee-card-detail-value">{organizationUnitTitles.length ? organizationUnitTitles.join('، ') : 'واحد سازمانی مشخص نشده'}</span></div>
        <div className="employee-card-detail-row"><span className="employee-card-detail-label"><Layers3 className="h-3.5 w-3.5" aria-hidden /> گروه کاری:</span><span className="employee-card-detail-value">{workGroupTitles.length ? workGroupTitles.join('، ') : 'گروه کاری مشخص نشده'}</span></div>
        <div className="employee-card-detail-row"><span className="employee-card-detail-label">سمت:</span><span className="employee-card-detail-value">{displayValue(currentContract?.jobTitle, 'سمت ثبت نشده')}</span></div>
        <div className="employee-card-detail-row"><span className="employee-card-detail-label"><CalendarDays className="h-3.5 w-3.5" aria-hidden /> تاریخ ایجاد:</span><span className="employee-card-detail-value">{formatPersianDate(employee.createdAt)}</span></div>
      </div>

      <div className="employee-card-progress" aria-label="وضعیت پرونده و قرارداد">
        <div className={`employee-card-profile-status ${employee.profileStatus === 'complete' ? 'is-complete' : 'is-incomplete'}`}>
          <span>{employee.profileStatus === 'complete' ? 'پرونده کامل' : 'پرونده ناقص'}</span>
          {employee.profileStatus === 'incomplete' ? <Link href={`/employees/${employee.id}/profile`}>مشاهده نقص‌ها</Link> : null}
        </div>

        {currentContract && contractProgress.hasTimeline ? (
          <>
            <div className="employee-card-contract-timeline-title">وضعیت مدت قرارداد</div>
            <div className="employee-card-arc-gauge" style={{ ['--progress' as never]: `${contractProgress.elapsedPercent}%` }} aria-hidden>
              <div className="employee-card-arc-gauge-track" />
              <div className="employee-card-arc-gauge-fill" />
              <div className="employee-card-arc-gauge-value"><strong>{formatFaNumber(contractProgress.elapsedPercent, { useGrouping: false })}%</strong></div>
            </div>
            <div className="employee-card-progress-stats">
              <p><span className="employee-card-progress-dot is-passed" aria-hidden /><span>شروع: {contractProgress.startDate} · پایان: {contractProgress.endDate}</span></p>
              <p><span className="employee-card-progress-dot is-remaining" aria-hidden /><span>کل مدت: {formatFaNumber(contractProgress.totalDays, { useGrouping: false })} روز · سپری‌شده: {formatFaNumber(contractProgress.elapsedDays, { useGrouping: false })} روز</span></p>
              <p><span className="employee-card-progress-dot is-remaining" aria-hidden /><span>باقی‌مانده: {formatFaNumber(contractProgress.remainingDays, { useGrouping: false })} روز</span></p>
              <p><span className="employee-card-progress-dot is-passed" aria-hidden /><span>{formatFaNumber(contractProgress.elapsedPercent, { useGrouping: false })}% سپری‌شده · {formatFaNumber(contractProgress.remainingPercent, { useGrouping: false })}% باقی‌مانده</span></p>
            </div>
          </>
        ) : currentContract ? (
          <div className="employee-card-contract-empty"><strong>قرارداد فعال</strong><span>بازه زمانی قرارداد کامل ثبت نشده است.</span></div>
        ) : (
          <div className="employee-card-contract-empty"><strong>بدون قرارداد فعال</strong><Link href={`/employees/${employee.id}/contract-drafts`}>ثبت قرارداد</Link></div>
        )}
      </div>
    </article>
  );
}
