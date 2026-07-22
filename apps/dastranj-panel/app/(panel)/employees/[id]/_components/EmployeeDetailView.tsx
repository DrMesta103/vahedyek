'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  Gauge,
  LayoutGrid,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Printer,
  Type,
  User,
  UserMinus,
  UserX,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatPersianDate } from '../../../../lib/format-date';
import { formatFaNumber } from '../../../../lib/format-fa';
import { getEmployeeContractProfileProgress } from '../../../../lib/employee-contracts';
import { getEmployeeContractTimelineProgress } from '../../../../lib/employee-contracts';
import { computeSupplementalCompleteness } from '../../../../lib/employee-supplemental-fields';
import type { EmployeeCurrentContractSummary } from '../../../../lib/employee-contracts';
import type { EmployeeSupplementalProfile } from '../../../../lib/employee-contract-drafts';
import { EditEmployeeFlow, type EditEmployeeData } from './EditEmployeeFlow';
import { toggleEmployeeActiveAction } from '../../../../lib/actions';

type EmployeeDetailSection = {
  title: string;
  description: string;
  href?: string;
  disabled?: boolean;
  badge?: string;
  highlighted?: boolean;
  icon: LucideIcon;
};

type EmployeeDetailData = EditEmployeeData & {
  createdAt: string;
  isActive: boolean;
  quickSetupStatus: string | null;
  quickSetupInvitationStatus: string | null;
  hasEndedContract: boolean;
  permissions: {
    canUpdate: boolean; canDisable: boolean; canSensitiveView: boolean; canSensitiveUpdate: boolean;
    canIdentityPhotoView: boolean; canIdentityPhotoUpdate: boolean; canHistoryView: boolean;
  };
  updatedAt: string;
  supplemental: EmployeeSupplementalProfile;
  userTenantMembership: {
    id: string;
    role: string;
    user: { id: string; firstName: string; lastName: string; email: string | null; mobile: string | null };
    roles: Array<{ key: string; label: string }>;
  } | null;
  workGroups?: Array<{ id: string; title: string }>;
  organizationUnits?: Array<{
    id: string;
    title: string;
    position?: { id: string; title: string; code: string | null; status: string } | null;
    startDate?: string | null;
    manager?: { id: string; firstName: string; lastName: string } | null;
  }>;
  bankAccountsCount?: number;
  guaranteeCount?: number;
  currentContract?: EmployeeCurrentContractSummary | null;
};

function normalizeDisplay(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : 'ثبت نشده';
}

function resolveLifecycleStatus(employee: Pick<EmployeeDetailData, 'isActive' | 'quickSetupStatus' | 'quickSetupInvitationStatus'>, hasEndedContract: boolean) {
  if (hasEndedContract) return 'Ended employment';
  if (employee.quickSetupStatus === 'invite_sent' || employee.quickSetupInvitationStatus === 'sent') return 'Invited';
  if (employee.quickSetupStatus === 'pending_completion' || employee.quickSetupStatus === 'in_progress') return 'Incomplete';
  return employee.isActive ? 'Active' : 'Inactive';
}

function buildSections(employeeId: string, canHistoryView: boolean): Array<{ title: string; cards: EmployeeDetailSection[]; layout?: 'default' | 'contract' }> {
  return [
    {
      title: 'گزارشات و درخواست ها',
      cards: [
        ...(canHistoryView ? [{ title: 'تاریخچه تغییرات', description: 'تغییرات مهم پرونده با مقادیر حساس ماسک‌شده ثبت می‌شود.', href: `/employees/${employeeId}/history`, highlighted: true, icon: ClipboardList }] : []),
        {
          title: 'درخواست ها',
          description: 'همه درخواست های ثبت شده توسط کارمند را در اینجا می بینید.',
          href: `/employees/${employeeId}/requests`,
          highlighted: true,
          icon: ClipboardList,
        },
        {
          title: 'گزارش کارکرد',
          description: 'مشاهده گزارش ماهانه، حضور، مرخصی، اضافه کاری و وضعیت تردد کارمند.',
          href: `/employees/${employeeId}/work-report`,
          highlighted: true,
          icon: Gauge,
        },
        {
          title: 'ارزیابی عملکرد',
          description: 'سوابق ارزیابی، بازخوردها و نتایج دوره ای در این بخش نمایش داده می شود.',
          disabled: true,
          badge: 'در آینده',
          icon: BadgeCheck,
        },
        {
          title: 'گزارش حقوق و دستمزد',
          description: 'خلاصه اطلاعات حقوق و تردد کارمند از اینجا قابل مشاهده خواهد بود.',
          disabled: true,
          badge: 'در آینده',
          icon: Wallet,
        },
      ],
    },
    {
      title: 'اطلاعات قرارداد',
      layout: 'contract',
      cards: [
        {
          title: 'مشخصات کارمند',
          description: 'اطلاعات شخصی، تحصیلی، شغلی، نظام وظیفه و آدرس کارمند را مدیریت کنید.',
          href: `/employees/${employeeId}/profile`,
          highlighted: true,
          icon: User,
        },
        {
          title: 'تنظیم پیش نویس',
          description: 'پیش نویس قرارداد را باز کنید، از قالب آماده شروع کنید و مراحل را ادامه دهید.',
          href: `/employees/${employeeId}/contract-drafts`,
          highlighted: true,
          icon: Pencil,
        },
        {
          title: 'مرکز اسناد',
          description: 'پیوست ها، قراردادهای امضا شده و اسناد مرتبط در این بخش نگهداری می شوند.',
          disabled: true,
          badge: 'در آینده',
          icon: FolderOpen,
        },
        {
          title: 'تاریخچه چاپ قرارداد',
          description: 'نسخه های چاپ شده قرارداد و سوابق مرتبطه در اینجا ثبت می شود.',
          disabled: true,
          badge: 'در آینده',
          icon: Printer,
        },
        {
          title: 'تنظیم متن قرارداد',
          description: 'متن قرارداد، بندها و شرایط همکاری را از این مسیر تنظیم کنید.',
          disabled: true,
          badge: 'در آینده',
          icon: Type,
        },
      ],
    },
    {
      title: 'ایجاد متمم',
      cards: [
        {
          title: 'متمم بر مبلغ قرارداد',
          description: 'ثبت تغییرات مالی یا مزایای قرارداد از این بخش انجام می شود.',
          disabled: true,
          badge: 'در آینده',
          icon: Wallet,
        },
        {
          title: 'متمم بر تاریخ (تمدید)',
          description: 'مدت قرارداد و تاریخ های تمدید از این مسیر قابل مدیریت است.',
          disabled: true,
          badge: 'در آینده',
          icon: CalendarDays,
        },
        {
          title: 'متمم بر نوع قرارداد',
          description: 'تغییر نوع قرارداد یا ساختار همکاری از اینجا اعمال می شود.',
          disabled: true,
          badge: 'در آینده',
          icon: LayoutGrid,
        },
      ],
    },
    {
      title: 'خاتمه همکاری',
      cards: [
        {
          title: 'درخواست استعفا',
          description: 'فرایند ثبت، بررسی و تایید درخواست استعفا در این بخش انجام می شود.',
          disabled: true,
          badge: 'در آینده',
          icon: FileText,
        },
        {
          title: 'ترک کار',
          description: 'فرایند ترک کار کارمند و ثبت نتیجه نهایی از این مسیر پیگیری می شود.',
          disabled: true,
          badge: 'در آینده',
          icon: UserMinus,
        },
        {
          title: 'اخراج',
          description: 'ثبت و پیگیری فرایند اخراج کارمند در این بخش انجام می شود.',
          disabled: true,
          badge: 'در آینده',
          icon: UserX,
        },
        {
          title: 'تسویه نهایی',
          description: 'حساب های بانکی، ضمانت ها و تسویه نهایی کارمند از این بخش مدیریت می شود.',
          href: `/employees/${employeeId}/bank-accounts`,
          icon: CreditCard,
        },
      ],
    },
  ];
}

function DetailTile({
  title,
  description,
  href,
  disabled,
  badge,
  highlighted,
  icon: Icon,
}: EmployeeDetailSection) {
  const content = (
    <>
      <span className={`employee-detail-tile-arrow${disabled ? ' is-disabled' : ''}`}>
        <ArrowLeft className="h-4 w-4" aria-hidden />
      </span>
      <div className="employee-detail-tile-copy">
        <div className="employee-detail-tile-title-row">
          <h3>{title}</h3>
          {badge ? <span className={`employee-detail-tile-badge${disabled ? ' is-disabled' : ''}`}>{badge}</span> : null}
        </div>
        <p>{description}</p>
      </div>
      <span className="employee-detail-tile-icon" aria-hidden>
        <Icon className="h-7 w-7" strokeWidth={1.8} />
      </span>
    </>
  );

  if (disabled || !href) {
    return (
      <article className={`employee-detail-tile is-disabled${highlighted ? ' is-highlighted' : ''}`} aria-disabled="true">
        {content}
      </article>
    );
  }

  return (
    <Link href={href} className={`employee-detail-tile${highlighted ? ' is-highlighted' : ''}`}>
      {content}
    </Link>
  );
}

export function EmployeeDetailView({ employee }: { employee: EmployeeDetailData }) {
  const [editing, setEditing] = useState(false);

  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  const organizationUnits = employee.organizationUnits ?? [];
  const workGroups = employee.workGroups ?? [];
  const currentContract = employee.currentContract ?? null;
  const contractProgress = getEmployeeContractProfileProgress(currentContract);
  const contractTimeline = getEmployeeContractTimelineProgress(currentContract);
  const profileCompletion = computeSupplementalCompleteness(employee.supplemental, employee);
  const lifecycleStatus = resolveLifecycleStatus(employee, employee.hasEndedContract);
  const primaryAssignment = organizationUnits[0] ?? null;
  const sections = useMemo(() => buildSections(employee.id, employee.permissions.canHistoryView), [employee.id, employee.permissions.canHistoryView]);

  return (
    <>
      <div className="employee-detail-shell" dir="rtl" lang="fa">
        <section className="employee-detail-hero">
          <article className="employee-detail-hero-card employee-detail-hero-profile">
            <div className="employee-detail-hero-profile-main">
              <div className="employee-detail-avatar employee-detail-avatar--round">
                {employee.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={employee.avatarUrl} alt="" />
                ) : (
                  <User className="h-9 w-9" strokeWidth={1.7} />
                )}
              </div>
              <div className="employee-detail-hero-profile-copy">
                <h2>{fullName || 'بدون نام'}</h2>
                <p>Personnel code: {normalizeDisplay(employee.personnelCode)}</p>
                <p>کد ملی: {normalizeDisplay(employee.nationalId)}</p>
              </div>
            </div>
            <div className="employee-detail-hero-contact-icons">
              <span title={employee.mobile1 ?? 'Mobile not registered'}>
                <Phone className="h-4 w-4" aria-hidden />
                <small>{normalizeDisplay(employee.mobile1)}</small>
              </span>
              <span title={employee.email ?? 'Email not registered'}>
                <Mail className="h-4 w-4" aria-hidden />
                <small>{normalizeDisplay(employee.email)}</small>
              </span>
              <span title={primaryAssignment?.title ?? 'Organization unit not registered'}>
                <MapPin className="h-4 w-4" aria-hidden />
                <small>{normalizeDisplay(primaryAssignment?.title)}</small>
              </span>
            </div>
            <div className="employee-detail-status-badges employee-detail-status-badges--summary">
              <span className="employee-detail-status-badge is-solid">{lifecycleStatus}</span>
              <span className="employee-detail-status-badge is-outline">{employee.userTenantMembership ? 'User connected' : 'No user account'}</span>
              <span className="employee-detail-status-badge is-outline">{profileCompletion}% profile</span>
            </div>
            <div className="employee-detail-hero-profile-actions">
              {employee.permissions.canUpdate ? (
                <button type="button" className="employee-detail-action-btn is-primary" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" />
                  ویرایش
                </button>
              ) : null}
              {employee.permissions.canDisable ? (
                <form action={toggleEmployeeActiveAction} onSubmit={(event) => {
                  if (!window.confirm(employee.isActive ? 'Disable this employee account?' : 'Reactivate this employee account?')) event.preventDefault();
                }}>
                  <input type="hidden" name="id" value={employee.id} />
                  <input type="hidden" name="isActive" value={employee.isActive ? 'false' : 'true'} />
                  <button type="submit" className="employee-detail-action-btn">
                    {employee.isActive ? 'Disable' : 'Reactivate'}
                  </button>
                </form>
              ) : null}
              <Link href={`/employees/${employee.id}/guarantee`} className="employee-detail-action-btn">
                ضمانت‌ها
              </Link>
            </div>
          </article>

          <article className="employee-detail-hero-card employee-detail-hero-contract">
            <div className="employee-detail-hero-contract-head">
              <h3>اطلاعات آخرین قرارداد</h3>
              <Link href="/employees" className="employee-detail-back-link">
                بازگشت به فهرست
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <div className="employee-detail-hero-contract-grid">
              <div className="employee-detail-contract-item">
                <span>شماره قرارداد</span>
                <strong>{normalizeDisplay(currentContract?.contractNumber ?? null)}</strong>
              </div>
              <div className="employee-detail-contract-item">
                <span>مبلغ قرارداد</span>
                <strong>{currentContract?.dailyBaseSalary ? `${formatFaNumber(currentContract.dailyBaseSalary)} ریال روزانه` : 'ثبت نشده'}</strong>
              </div>
              <div className="employee-detail-contract-item is-wide">
                <span>مدت قرارداد</span>
                <strong>{currentContract?.startDate && currentContract?.endDate ? 'ثبت شده' : 'ثبت نشده'}</strong>
              </div>
              <div className="employee-detail-contract-item is-wide">
                <span>بازه قرارداد</span>
                <strong>
                  {currentContract ? `از تاریخ ${currentContract.startDate ?? '-'} تا ${currentContract.endDate ?? '-'}` : 'فاقد قرارداد'}
                </strong>
              </div>
            </div>
            <div className="employee-detail-hero-contract-meta">
              <span>{organizationUnits.length ? organizationUnits.map((item) => item.title).join('، ') : 'واحد سازمانی ثبت نشده'}</span>
              <span>{workGroups.length ? workGroups.map((item) => item.title).join('، ') : 'گروه کاری ثبت نشده'}</span>
            </div>
          </article>

          <article className="employee-detail-hero-card employee-detail-hero-status">
            <div className="employee-detail-arc-gauge" style={{ ['--progress' as never]: `${profileCompletion}%` }} aria-hidden>
              <div className="employee-detail-arc-gauge-track" />
              <div className="employee-detail-arc-gauge-fill" />
              <div className="employee-detail-arc-gauge-value">
                <strong>{formatFaNumber(profileCompletion, { useGrouping: false })}%</strong>
              </div>
            </div>
            <div className="employee-detail-status-badges">
              <span className="employee-detail-status-badge is-outline">{primaryAssignment?.position?.title || currentContract?.jobTitle || 'عنوان شغلی ثبت نشده'}</span>
              <span className="employee-detail-status-badge is-solid">{currentContract ? 'قرارداد فعال' : 'فاقد قرارداد'}</span>
            </div>
            <div className="employee-detail-status-stats">
              <p>
                <span className="employee-detail-status-dot is-passed" aria-hidden />
                {contractProgress.hasContract
                  ? `${formatFaNumber(contractProgress.daysSinceContractStart, { useGrouping: false })} روز از شروع قرارداد گذشته`
                  : 'قرارداد فعال ثبت نشده'}
              </p>
              <p>
                <span className="employee-detail-status-dot is-remaining" aria-hidden />
                {!contractProgress.hasContract
                  ? 'برای تکمیل پرونده، قرارداد را نهایی کنید'
                  : contractProgress.missingSections > 0
                    ? `${formatFaNumber(contractProgress.missingSections, { useGrouping: false })} مرحله ناقص در قرارداد`
                    : 'پرونده قرارداد کامل است'}
              </p>
            </div>
          </article>
        </section>

        <section className="employee-detail-summary-grid" aria-label="Employee record summary">
          <article className="employee-detail-summary-card">
            <h3>Basic information</h3>
            <div><span>Mobile</span><strong>{normalizeDisplay(employee.mobile1)}</strong></div>
            <div><span>Email</span><strong>{normalizeDisplay(employee.email)}</strong></div>
            <div><span>Marital status</span><strong>{normalizeDisplay(employee.maritalStatus)}</strong></div>
            <div><span>Children</span><strong>{formatFaNumber(employee.childrenCount, { useGrouping: false })}</strong></div>
          </article>
          <article className="employee-detail-summary-card">
            <h3>Organization</h3>
            <div><span>Unit</span><strong>{normalizeDisplay(primaryAssignment?.title)}</strong></div>
            <div><span>Position</span><strong>{normalizeDisplay(primaryAssignment?.position?.title)}</strong></div>
            <div><span>Manager</span><strong>{primaryAssignment?.manager ? `${primaryAssignment.manager.firstName} ${primaryAssignment.manager.lastName}` : 'Not registered'}</strong></div>
            <div><span>Work group</span><strong>{workGroups.length ? workGroups.map((item) => item.title).join('، ') : 'Not registered'}</strong></div>
          </article>
          <article className="employee-detail-summary-card">
            <h3>Account</h3>
            <div><span>Account status</span><strong>{employee.userTenantMembership ? 'Connected' : 'No user account'}</strong></div>
            <div><span>User</span><strong>{employee.userTenantMembership ? `${employee.userTenantMembership.user.firstName} ${employee.userTenantMembership.user.lastName}` : 'Not registered'}</strong></div>
            <div><span>Membership role</span><strong>{employee.userTenantMembership?.role ?? 'Not registered'}</strong></div>
            <div><span>Profile status</span><strong>{profileCompletion >= 70 ? 'Complete' : 'Incomplete'}</strong></div>
          </article>
        </section>

        <section className="employee-detail-contract-timeline" aria-label="Contract timeline">
          <div className="employee-detail-section-head">
            <h3>Contract timeline</h3>
            <span className="employee-detail-status-badge is-outline">{currentContract ? 'Active contract' : 'No active contract'}</span>
          </div>
          {contractTimeline.hasTimeline ? (
            <div className="employee-detail-timeline-grid">
              <div><span>Start</span><strong>{normalizeDisplay(contractTimeline.startDate)}</strong></div>
              <div><span>End</span><strong>{normalizeDisplay(contractTimeline.endDate)}</strong></div>
              <div><span>Total days</span><strong>{formatFaNumber(contractTimeline.totalDays, { useGrouping: false })}</strong></div>
              <div><span>Elapsed</span><strong>{formatFaNumber(contractTimeline.elapsedDays, { useGrouping: false })} ({contractTimeline.elapsedPercent}%)</strong></div>
              <div><span>Remaining</span><strong>{formatFaNumber(contractTimeline.remainingDays, { useGrouping: false })} ({contractTimeline.remainingPercent}%)</strong></div>
            </div>
          ) : (
            <p className="employee-detail-empty-note">No active contract timeline is available.</p>
          )}
        </section>

        {sections.map((section) => (
          <section key={section.title} className="employee-detail-section">
            <div className="employee-detail-section-head">
              <h3>{section.title}</h3>
            </div>
            {section.layout === 'contract' ? (
              <>
                <div className="employee-detail-grid">
                  {section.cards.slice(0, 4).map((card) => (
                    <DetailTile key={card.title} {...card} />
                  ))}
                </div>
                <div className="employee-detail-grid employee-detail-grid--single">
                  <DetailTile {...section.cards[4]} />
                </div>
              </>
            ) : (
              <div className={`employee-detail-grid${section.cards.length === 3 ? ' employee-detail-grid--three' : ''}`}>
                {section.cards.map((card) => (
                  <DetailTile key={card.title} {...card} />
                ))}
              </div>
            )}
            {section.title === 'خاتمه همکاری' ? (
              <p className="employee-detail-settlement-note">
                تنها در صورت خاتمه همکاری، فرایند تسویه فعال خواهد شد.
              </p>
            ) : null}
          </section>
        ))}
      </div>

      {editing ? <EditEmployeeFlow employee={{ ...employee, canSensitiveUpdate: employee.permissions.canSensitiveUpdate, canIdentityPhotoUpdate: employee.permissions.canIdentityPhotoUpdate }} onClose={() => setEditing(false)} /> : null}
    </>
  );
}

