'use client';

import { Building2, ChevronLeft, Info, Pencil, Phone, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  fetchProfilePayload,
  fetchProfileStore,
  type LegalOwnershipForm,
  type NaturalOwnershipForm,
  type OwnershipKind,
  type ProfileMeta,
  persistProfileStore,
} from './profileStorage';

const emptyProfileMeta: ProfileMeta = {
  businessName: '',
  slug: '',
  brandCode: 'VN',
  packageKey: 'starter',
  billingCycle: 'monthly',
  createdAt: null,
  owner: {
    fullName: '',
    mobile: null,
    email: null,
  },
};

function formatOwnerMobile(value: string | null) {
  if (!value) return '';
  if (value.startsWith('+')) return value;
  if (/^9\d{9}$/.test(value)) return `+98 ${value}`;
  return value;
}

function OwnershipTabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={[
        'relative flex h-[75px] w-1/2 flex-col items-center justify-center gap-1.5 border-0 border-b-2 bg-transparent px-2 font-inherit text-[12px] font-normal text-[#3f3f46] transition',
        active ? 'border-b-[#4b5563] font-semibold text-[#3f3f46]' : 'border-b-transparent text-[#3f3f46]',
      ].join(' ')}
      onClick={onClick}
    >
      <span className={active ? 'text-[#008f8f]' : 'text-[#8a96a3]'} aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

function OwnershipField({
  label,
  value,
  onChange,
  required = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="grid gap-2 text-right">
      <span className="text-[14px] font-semibold leading-[22px] text-[#3f3f46]">
        {label}
        {required ? <i className="mr-1 not-italic text-[#d71920]">*</i> : null}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-[8px] border border-[rgba(15,23,42,0.7)] bg-white px-3 text-right text-[13px] font-normal text-[#111827] outline-none transition focus:border-[#008f8f] focus:ring-4 focus:ring-[#008f8f]/10"
        dir="auto"
      />
      {hint ? <small className="text-right text-[11px] font-normal leading-[18px] text-[#7b8794]">{hint}</small> : null}
    </label>
  );
}

export function BusinessOwnershipPanel() {
  const router = useRouter();
  const [ownershipKind, setOwnershipKind] = useState<OwnershipKind>('legal');
  const [profileMeta, setProfileMeta] = useState<ProfileMeta>(emptyProfileMeta);
  const [legalForm, setLegalForm] = useState<LegalOwnershipForm>({
    legalType: '',
    companyName: '',
    brandName: '',
    registrationNumber: '',
    nationalId: '',
    taxFileNumber: '',
    registrationDate: '',
    economicCode: '',
  });
  const [naturalForm, setNaturalForm] = useState<NaturalOwnershipForm>({
    taxFileNumber: '',
    economicCode: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    fetchProfilePayload().then(({ store, meta }) => {
      if (ignore) return;
      setOwnershipKind(store.ownershipKind);
      setLegalForm(store.legal);
      setNaturalForm(store.natural);
      setProfileMeta(meta);
    });

    return () => {
      ignore = true;
    };
  }, []);

  const activeForm = ownershipKind === 'legal' ? legalForm : naturalForm;
  const displayBusinessName = profileMeta.businessName || 'کسب‌وکار ثبت نشده';
  const displayOwnerName = profileMeta.owner.fullName || 'ثبت نشده';
  const displayOwnerMobile = formatOwnerMobile(profileMeta.owner.mobile) || 'ثبت نشده';

  async function save() {
    setIsSaving(true);

    try {
      const store = await fetchProfileStore();
      await persistProfileStore({
        ...store,
        ownershipKind,
        legal: legalForm,
        natural: naturalForm,
      });
      router.push('/business-settings/profile');
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section dir="rtl" className="mx-auto w-full max-w-[700px] pb-10">
      <div
        className="overflow-hidden rounded-[15px] border border-[#d7e0e8] shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,247,249,0.98) 100%), repeating-linear-gradient(135deg, rgba(148,163,184,0.14) 0 1px, transparent 1px 22px, rgba(148,163,184,0.08) 22px 23px, transparent 23px 44px)',
        }}
      >
        <div className="flex items-start justify-between gap-4 px-5 py-4">
          <div className="grid gap-1 text-right">
            <h1 className="m-0 text-[18px] font-semibold leading-[26px] text-[#3f3f46]">نوع مالکیت و اطلاعات پایه</h1>
            <p className="m-0 text-[12.5px] font-normal leading-[21px] text-[#52657a]">ورود این اطلاعات در تنظیمات قرارداد ضروری است</p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="inline-flex h-[52px] w-[52px] items-center justify-center rounded-[16px] bg-[rgba(0,143,143,0.10)] text-[#008f8f] shadow-[0_4px_12px_rgba(15,23,42,0.06)]">
              <Info className="h-[24px] w-[24px]" strokeWidth={2.6} />
            </span>
            <ChevronLeft className="h-[28px] w-[28px] shrink-0 text-[#008f8f]" strokeWidth={2.7} />
          </div>
        </div>
      </div>

      <div role="tablist" aria-label="نوع مالکیت" className="mt-4 flex h-[75px] border-b border-[#d7e0e8]">
        <OwnershipTabButton
          active={ownershipKind === 'legal'}
          icon={<Building2 className="h-[20px] w-[20px]" strokeWidth={2.1} />}
          label="حقوقی"
          onClick={() => setOwnershipKind('legal')}
        />
        <OwnershipTabButton
          active={ownershipKind === 'natural'}
          icon={<UserRound className="h-[20px] w-[20px]" strokeWidth={2.1} />}
          label="حقیقی"
          onClick={() => setOwnershipKind('natural')}
        />
      </div>

      <p className="mt-7 mb-4 text-right text-[15px] font-semibold leading-[26px] text-[#3f3f46]">
        نوع کسب‌وکار خود را انتخاب کنید: حقیقی برای اشخاص فردی و حقوقی برای شرکت‌ها یا سازمان‌های ثبت‌شده با شناسه ملی
      </p>

      <section className="overflow-hidden rounded-[8px] border border-[#b7c7d8] bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
        <div className="flex items-start justify-between gap-4 bg-[#92d0d1] px-[18px] py-[14px] text-right">
          <div className="grid gap-1 text-right">
            <strong className="text-[15px] font-semibold leading-[22px] text-[#2f3743]">مالک کسب‌وکار</strong>
            <p className="m-0 text-[11.5px] font-normal leading-[18px] text-[#52657a]">
              اطلاعات ثبت‌شده برای این کسب‌وکار را می‌توانید در همین بخش ویرایش کنید.
            </p>
          </div>
        </div>

        <div className="flex min-h-[88px] items-center justify-between gap-4 bg-white px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[6px] bg-[#b7bfcc] text-white">
              <Building2 className="h-[24px] w-[24px]" strokeWidth={2.2} />
            </div>

            <div className="grid min-w-0 gap-1 text-right">
              <strong className="truncate text-[14px] font-semibold text-[#3f3f46]">{displayOwnerName}</strong>
              <span className="truncate text-[11.5px] font-normal text-[#52657a]" dir="ltr">
                {displayOwnerMobile}
              </span>
              <span className="truncate text-[11.5px] font-normal text-[#52657a]">{displayBusinessName}</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              aria-label="ویرایش"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border-0 bg-transparent text-[#0f766e] transition hover:bg-[rgba(15,118,110,0.08)]"
            >
              <Pencil className="h-[22px] w-[22px]" />
            </button>
            <button
              type="button"
              aria-label="تماس"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border-0 bg-transparent text-[#0f766e] transition hover:bg-[rgba(15,118,110,0.08)]"
            >
              <Phone className="h-[22px] w-[22px]" />
            </button>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <OwnershipField
          label="شماره پرونده مالیاتی"
          value={activeForm.taxFileNumber}
          onChange={(value) =>
            ownershipKind === 'legal'
              ? setLegalForm((current) => ({ ...current, taxFileNumber: value }))
              : setNaturalForm((current) => ({ ...current, taxFileNumber: value }))
          }
          required
          hint="شماره اختصاصی پرونده مالیاتی کسب‌وکار"
        />
        <OwnershipField
          label="کد اقتصادی"
          value={activeForm.economicCode}
          onChange={(value) =>
            ownershipKind === 'legal'
              ? setLegalForm((current) => ({ ...current, economicCode: value }))
              : setNaturalForm((current) => ({ ...current, economicCode: value }))
          }
          required
          hint="کد اقتصادی صادرشده توسط سازمان امور مالیاتی"
        />
      </div>

      <div className="mt-6 flex justify-start">
        <button
          type="button"
          onClick={save}
          disabled={isSaving}
          className="inline-flex h-10 w-[224px] items-center justify-center rounded-[8px] border-0 bg-[#008f8f] px-4 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(0,143,143,0.18)] transition hover:bg-[#007f7f] hover:shadow-[0_10px_22px_rgba(0,143,143,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          ثبت
        </button>
      </div>
    </section>
  );
}
