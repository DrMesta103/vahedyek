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
import { EditEmployeeFlow, type EditEmployeeData } from './EditEmployeeFlow';

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
  workGroups?: Array<{ id: string; title: string }>;
  organizationUnits?: Array<{ id: string; title: string }>;
  bankAccountsCount?: number;
  guaranteeCount?: number;
};

function normalizeDisplay(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : 'ثبت نشده';
}

function countCompletion(employee: EmployeeDetailData) {
  const items = [
    employee.personnelCode,
    employee.email,
    employee.mobile1,
    employee.mobile2,
    employee.avatarUrl,
    employee.organizationUnits?.length ? '1' : '',
    employee.workGroups?.length ? '1' : '',
  ];
  return Math.round((items.filter(Boolean).length / items.length) * 100);
}

function daysSinceCreated(createdAt: string) {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)));
}

function buildSections(employeeId: string): Array<{ title: string; cards: EmployeeDetailSection[]; layout?: 'default' | 'contract' }> {
  return [
    {
      title: 'گزارشات و درخواست ها',
      cards: [
        {
          title: 'درخواست ها',
          description: 'همه درخواست‌های ثبت‌شده توسط کارمند را در اینجا می‌بینید.',
          href: `/employees/${employeeId}/requests`,
          highlighted: true,
          icon: ClipboardList,
        },
        {
          title: 'گزارشات',
          description: 'گزارش‌های مربوط به عملکرد، حضور و فعالیت کارمند در این بخش قرار می‌گیرد.',
          disabled: true,
          badge: 'در آینده',
          icon: Gauge,
        },
        {
          title: 'ارزیابی عملکرد',
          description: 'سوابق ارزیابی، بازخوردها و نتایج دوره‌ای در این بخش نمایش داده می‌شود.',
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
          title: 'تنظیم پیش‌نویس',
          description: 'پیش‌نویس قرارداد را باز کنید، از قالب آماده شروع کنید و مراحل را ادامه دهید.',
          href: `/employees/${employeeId}/contract-drafts`,
          highlighted: true,
          icon: Pencil,
        },
        {
          title: 'مرکز اسناد',
          description: 'پیوست‌ها، قراردادهای امضاشده و اسناد مرتبط در این بخش نگهداری می‌شوند.',
          disabled: true,
          badge: 'در آینده',
          icon: FolderOpen,
        },
        {
          title: 'تاریخچه چاپ قرارداد',
          description: 'نسخه‌های چاپ‌شده قرارداد و سوابق مربوطه در اینجا ثبت می‌شود.',
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
          description: 'ثبت تغییرات مالی یا مزایای قرارداد از این بخش انجام می‌شود.',
          disabled: true,
          badge: 'در آینده',
          icon: Wallet,
        },
        {
          title: 'متمم بر تاریخ (تمدید)',
          description: 'مدت قرارداد و تاریخ‌های تمدید از این مسیر قابل مدیریت است.',
          disabled: true,
          badge: 'در آینده',
          icon: CalendarDays,
        },
        {
          title: 'متمم بر نوع قرارداد',
          description: 'تغییر نوع قرارداد یا ساختار همکاری از اینجا اعمال می‌شود.',
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
          description: 'فرایند ثبت، بررسی و تأیید درخواست استعفا در این بخش انجام می‌شود.',
          disabled: true,
          badge: 'در آینده',
          icon: FileText,
        },
        {
          title: 'ترک کار',
          description: 'فرایند ترک کار کارمند و ثبت نتیجه نهایی از این مسیر پیگیری می‌شود.',
          disabled: true,
          badge: 'در آینده',
          icon: UserMinus,
        },
        {
          title: 'اخراج',
          description: 'ثبت و پیگیری فرایند اخراج کارمند در این بخش انجام می‌شود.',
          disabled: true,
          badge: 'در آینده',
          icon: UserX,
        },
        {
          title: 'تسویه نهایی',
          description: 'حساب‌های بانکی، ضمانت‌ها و تسویه نهایی کارمند از این بخش مدیریت می‌شود.',
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

export function EmployeeDetailView({
  employee,
}: {
  employee: EmployeeDetailData;
}) {
  const [editing, setEditing] = useState(false);

  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  const organizationUnits = employee.organizationUnits ?? [];
  const workGroups = employee.workGroups ?? [];
  const completionPercent = countCompletion(employee);
  const membershipDays = daysSinceCreated(employee.createdAt);
  const missingSections = 7 - Math.round((completionPercent / 100) * 7);
  const sections = useMemo(() => buildSections(employee.id), [employee.id]);

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
                <p>کد ملی: {normalizeDisplay(employee.nationalId)}</p>
              </div>
            </div>
            <div className="employee-detail-hero-contact-icons">
              <span title="موبایل">
                <Phone className="h-4 w-4" aria-hidden />
              </span>
              <span title="ایمیل">
                <Mail className="h-4 w-4" aria-hidden />
              </span>
              <span title="واحد سازمانی">
                <MapPin className="h-4 w-4" aria-hidden />
              </span>
            </div>
            <div className="employee-detail-hero-profile-actions">
              <button type="button" className="employee-detail-action-btn is-primary" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
                ویرایش
              </button>
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
                <strong>{normalizeDisplay(employee.personnelCode)}</strong>
              </div>
              <div className="employee-detail-contract-item">
                <span>مبلغ قرارداد</span>
                <strong>ثبت نشده</strong>
              </div>
              <div className="employee-detail-contract-item is-wide">
                <span>مدت قرارداد</span>
                <strong>ثبت نشده</strong>
              </div>
              <div className="employee-detail-contract-item is-wide">
                <span>بازه قرارداد</span>
                <strong>
                  از تاریخ {formatPersianDate(employee.createdAt)} تا ثبت نشده
                </strong>
              </div>
            </div>
            <div className="employee-detail-hero-contract-meta">
              <span>{organizationUnits.length ? organizationUnits.map((item) => item.title).join('، ') : 'واحد سازمانی ثبت نشده'}</span>
              <span>{workGroups.length ? workGroups.map((item) => item.title).join('، ') : 'گروه کاری ثبت نشده'}</span>
            </div>
          </article>

          <article className="employee-detail-hero-card employee-detail-hero-status">
            <div className="employee-detail-arc-gauge" style={{ ['--progress' as never]: `${completionPercent}%` }} aria-hidden>
              <div className="employee-detail-arc-gauge-track" />
              <div className="employee-detail-arc-gauge-fill" />
              <div className="employee-detail-arc-gauge-value">
                <strong>{formatFaNumber(completionPercent, { useGrouping: false })}%</strong>
              </div>
            </div>
            <div className="employee-detail-status-badges">
              <span className="employee-detail-status-badge is-outline">موقت (پاره وقت)</span>
              <span className="employee-detail-status-badge is-solid">فاقد قرارداد</span>
            </div>
            <div className="employee-detail-status-stats">
              <p>
                <span className="employee-detail-status-dot is-passed" aria-hidden />
                {formatFaNumber(membershipDays, { useGrouping: false })} روز از عضویت گذشته
              </p>
              <p>
                <span className="employee-detail-status-dot is-remaining" aria-hidden />
                {missingSections > 0
                  ? `${formatFaNumber(missingSections, { useGrouping: false })} بخش ناقص در پرونده`
                  : 'پرونده کامل است'}
              </p>
            </div>
          </article>
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

      {editing ? <EditEmployeeFlow employee={employee} onClose={() => setEditing(false)} /> : null}
    </>
  );
}
