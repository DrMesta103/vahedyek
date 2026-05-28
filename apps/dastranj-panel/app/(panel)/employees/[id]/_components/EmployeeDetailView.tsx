'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock3,
  CreditCard,
  FileText,
  Gauge,
  LayoutGrid,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  User,
  Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatPersianDate } from '../../../../lib/format-date';
import { EditEmployeeFlow, type EditEmployeeData } from './EditEmployeeFlow';

type EmployeeDetailSection = {
  title: string;
  description: string;
  href?: string;
  disabled?: boolean;
  badge?: string;
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

function buildSections(employeeId: string, bankAccountsCount: number, guaranteeCount: number): Array<{ title: string; cards: EmployeeDetailSection[] }> {
  return [
    {
      title: 'گزارشات و درخواست ها',
      cards: [
        {
          title: 'درخواست ها',
          description: 'همه درخواست های ثبت شده توسط کارمند را در اینجا می بینید. این بخش برای بررسی وضعیت درخواست ها و پیگیری بعدا توسعه می یابد.',
          disabled: true,
          badge: 'در آینده',
          icon: FileText,
        },
        {
          title: 'گزارشات',
          description: 'گزارش های مربوط به عملکرد، حضور و فعالیت کارمند در این بخش قرار می گیرد.',
          disabled: true,
          badge: 'در آینده',
          icon: Gauge,
        },
        {
          title: 'ارزیابی عملکرد',
          description: 'سوابق ارزیابی، بازخوردها و نتیجه های دوره ای در آینده در همین بخش اضافه می شود.',
          disabled: true,
          badge: 'در آینده',
          icon: BadgeCheck,
        },
        {
          title: 'حقوق و دستمزد',
          description: 'خلاصه اطلاعات حقوق و تردد کارمند از اینجا قابل مشاهده و مدیریت خواهد شد.',
          disabled: true,
          badge: 'در آینده',
          icon: Wallet,
        },
      ],
    },
    {
      title: 'اطلاعات قرارداد',
      cards: [
        {
          title: 'مشخصات قرارداد',
          description: 'اطلاعات هویتی، شغلی و وضعیت قرارداد را به صورت خلاصه اینجا مدیریت کنید.',
          disabled: true,
          badge: 'در آینده',
          icon: FileText,
        },
        {
          title: 'تنظیم پیش‌نویس',
          description: 'پیش‌نویس قرارداد این کارمند را باز کنید، از قالب آماده شروع کنید و مراحل قرارداد را ادامه دهید.',
          href: `/employees/${employeeId}/contract-drafts`,
          badge: 'شروع',
          icon: Pencil,
        },
        {
          title: 'تاریخچه قرارداد',
          description: 'نسخه های قرارداد، تغییرات و رویدادهای ثبت شده بعدا در این بخش دیده می شود.',
          disabled: true,
          badge: 'در آینده',
          icon: Clock3,
        },
        {
          title: 'مرکز اسناد',
          description: 'پیوست ها، قراردادهای امضا شده و اسناد مربوطه در نسخه های بعدی اضافه می شود.',
          disabled: true,
          badge: 'در آینده',
          icon: CreditCard,
        },
      ],
    },
    {
      title: 'ایجاد منظم',
      cards: [
        {
          title: 'متمم بر مبلغ قرارداد',
          description: 'اگر تغییرات مالی یا مزدی وجود داشته باشد، این بخش برای ثبت متمم ها آماده می شود.',
          disabled: true,
          badge: 'در آینده',
          icon: Wallet,
        },
        {
          title: 'متمم بر تاریخ (تمدید)',
          description: 'مدت قرارداد و تاریخ های تمدید در آینده از این مسیر قابل مدیریت خواهد بود.',
          disabled: true,
          badge: 'در آینده',
          icon: CalendarDays,
        },
        {
          title: 'متمم بر نوع قرارداد',
          description: 'تغییر نوع قرارداد یا ساختار همکاری بعدا از اینجا اعمال می شود.',
          disabled: true,
          badge: 'در آینده',
          icon: LayoutGrid,
        },
        {
          title: 'تایید و ثبت',
          description: 'ثبت نهایی تغییرات پس از تکمیل همه مراحل در همین قسمت اضافه می شود.',
          disabled: true,
          badge: 'در آینده',
          icon: ShieldCheck,
        },
      ],
    },
    {
      title: 'خاتمه همکاری',
      cards: [
        {
          title: 'درخواست استعفا',
          description: 'فرایند ثبت درخواست استعفا، بررسی و تایید آن در این بخش پیاده می شود.',
          disabled: true,
          badge: 'در آینده',
          icon: FileText,
        },
        {
          title: 'ترک کار',
          description: 'فرایند ترک کار کارمند و ثبت نتیجه نهایی در نسخه های بعدی آماده می شود.',
          disabled: true,
          badge: 'در آینده',
          icon: User,
        },
        {
          title: 'استخراج',
          description: 'خروجی های لازم برای بایگانی، گزارش یا انتقال اطلاعات بعدا اضافه خواهد شد.',
          disabled: true,
          badge: 'در آینده',
          icon: FileText,
        },
        {
          title: 'حساب ها و ضمانت ها',
          description: 'حساب های بانکی و ضمانت های فعلی کارمند را از همین بخش ها می توان مدیریت کرد.',
          href: `/employees/${employeeId}/bank-accounts`,
          icon: CreditCard,
          badge: `${bankAccountsCount.toLocaleString('fa-IR')} حساب / ${guaranteeCount.toLocaleString('fa-IR')} ضمانت`,
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
  icon: Icon,
}: EmployeeDetailSection) {
  const content = (
    <>
      <div className="employee-detail-tile-head">
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
      </div>
      {disabled ? <span className="employee-detail-tile-footer">در آینده توسعه می‌دهیم</span> : null}
    </>
  );

  if (disabled || !href) {
    return (
      <article className="employee-detail-tile is-disabled" aria-disabled="true">
        {content}
      </article>
    );
  }

  return (
    <Link href={href} className="employee-detail-tile">
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
  const bankAccountsCount = employee.bankAccountsCount ?? 0;
  const guaranteeCount = employee.guaranteeCount ?? 0;
  const sections = useMemo(() => buildSections(employee.id, bankAccountsCount, guaranteeCount), [bankAccountsCount, employee.id, guaranteeCount]);

  return (
    <>
      <div className="employee-detail-shell" dir="rtl" lang="fa">
        <section className="employee-detail-summary-grid">
          <article className="employee-detail-stat-card employee-detail-profile-card">
            <div className="employee-detail-profile-head">
              <div className="employee-detail-avatar-wrap">
                <div className="employee-detail-avatar">
                  {employee.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={employee.avatarUrl} alt="" />
                  ) : (
                    <User className="h-8 w-8" strokeWidth={1.7} />
                  )}
                </div>
                <div className="employee-detail-avatar-secondary">
                  {employee.identityPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={employee.identityPhotoUrl} alt="" />
                  ) : (
                    <CreditCard className="h-5 w-5" strokeWidth={1.7} />
                  )}
                </div>
              </div>

              <div className="employee-detail-profile-copy">
                <h2>{fullName || 'بدون نام'}</h2>
                <div className="employee-detail-profile-subtitle">
                  <span>کد ملی: {normalizeDisplay(employee.nationalId)}</span>
                  <span>کد پرسنلی: {normalizeDisplay(employee.personnelCode)}</span>
                </div>
                <div className="employee-detail-contact-row">
                  <span>
                    <Phone className="h-3.5 w-3.5" />
                    {normalizeDisplay(employee.mobile1)}
                  </span>
                  <span>
                    <Mail className="h-3.5 w-3.5" />
                    {normalizeDisplay(employee.email)}
                  </span>
                  <span>
                    <MapPin className="h-3.5 w-3.5" />
                    {organizationUnits.length ? organizationUnits.map((item) => item.title).join('، ') : 'واحد ندارد'}
                  </span>
                </div>
              </div>
            </div>

            <div className="employee-detail-profile-actions">
              <button type="button" className="employee-detail-action-btn is-primary" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
                ویرایش
              </button>
              <Link href={`/employees/${employee.id}/bank-accounts`} className="employee-detail-action-btn">
                <CreditCard className="h-4 w-4" />
                حساب‌های بانکی
              </Link>
            </div>
          </article>

          <article className="employee-detail-stat-card employee-detail-stat-card--wide">
            <div className="employee-detail-stat-head">
              <div>
                <p>اطلاعات آخرین قرارداد</p>
                <h3>نمای خلاصه پرونده</h3>
              </div>
              <Link href="/employees" className="employee-detail-back-link">
                بازگشت به فهرست
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="employee-detail-stat-body">
              <div className="employee-detail-ring">
                <div className="employee-detail-ring-inner">
                  <strong>60%</strong>
                  <span>تکمیل</span>
                </div>
              </div>

              <div className="employee-detail-contract-grid">
                <div className="employee-detail-contract-item">
                  <span>وضعیت قرارداد</span>
                  <strong>فعال</strong>
                </div>
                <div className="employee-detail-contract-item">
                  <span>شماره قرارداد</span>
                  <strong>{normalizeDisplay(employee.personnelCode)}</strong>
                </div>
                <div className="employee-detail-contract-item">
                  <span>مبلغ قرارداد</span>
                  <strong>در آینده توسعه می‌دهیم</strong>
                </div>
                <div className="employee-detail-contract-item">
                  <span>مدت قرارداد</span>
                  <strong>{formatPersianDate(employee.createdAt)}</strong>
                </div>
              </div>
            </div>
          </article>
        </section>

        {sections.map((section) => (
          <section key={section.title} className="employee-detail-section">
            <div className="employee-detail-section-head">
              <h3>{section.title}</h3>
            </div>
            <div className="employee-detail-grid">
              {section.cards.map((card) => (
                <DetailTile key={card.title} {...card} />
              ))}
            </div>
          </section>
        ))}

        <section className="employee-detail-section">
          <div className="employee-detail-section-head">
            <h3>امکانات تکمیلی</h3>
          </div>
          <div className="employee-detail-grid employee-detail-grid--two">
            <article className="employee-detail-note-panel">
              <div className="employee-detail-note-title">اطلاعات تکمیلی کارمند</div>
              <p>وضعیت تأهل: {employee.maritalStatus === 'married' ? 'متاهل' : employee.maritalStatus === 'divorced' ? 'جداشده' : 'مجرد'}</p>
              <p>تعداد فرزندان: {employee.childrenCount.toLocaleString('fa-IR')}</p>
              <p>گروه‌های کاری: {workGroups.length ? workGroups.map((item) => item.title).join('، ') : 'ثبت نشده'}</p>
              <p>ضمانت‌ها: {guaranteeCount.toLocaleString('fa-IR')} مورد</p>
            </article>

            <article className="employee-detail-note-panel is-muted">
              <div className="employee-detail-note-title">یادداشت</div>
              <p>بخش‌های نمایش داده شده مطابق ساختار فیگما چیده شده‌اند. هر موردی که هنوز پیاده نشده باشد به صورت غیرفعال نمایش داده می‌شود و پیام «در آینده توسعه می‌دهیم» دارد.</p>
            </article>
          </div>
        </section>
      </div>

      {editing ? <EditEmployeeFlow employee={employee} onClose={() => setEditing(false)} /> : null}
    </>
  );
}
