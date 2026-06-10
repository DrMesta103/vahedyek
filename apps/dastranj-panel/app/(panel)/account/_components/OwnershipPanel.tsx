'use client';

import { Building2, CircleAlert } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDefaultProfileStore, DEFAULT_PROFILE_META, type OwnershipKind, type ProfileMeta, type ProfileStore } from '../profile.types';
import { fetchProfilePayload, loadProfileStore, persistProfileStore } from '../profileStorage';
import { BUSINESS_PROFILE_OWNERSHIP, BUSINESS_PROFILE_ROOT, getSelectTenantPath } from '../routes';
import { Breadcrumbs, LoadingCard } from './account-ui';
import { PanelFormModal, PanelFormModalActions } from '../../../components/PanelFormModal';
import {
  ProfileBackLink,
  ProfileCard,
  ProfileChipGroup,
  ProfileDateField,
  ProfileHeading,
  ProfilePageShell,
  ProfileReadonlyField,
  ProfileSubmitBar,
  ProfileTextField,
} from './ProfileFormShell';

const kindOptions: Array<{ value: OwnershipKind; label: string }> = [
  { value: 'natural', label: 'حقیقی' },
  { value: 'legal', label: 'حقوقی' },
];

const LEGAL_TYPE_OPTIONS = [
  'شرکت سهامی خاص',
  'شرکت سهامی عام',
  'شرکت با مسئولیت محدود',
  'شرکت تضامنی',
  'شرکت تعاونی',
] as const;

const legalTypeOptions = LEGAL_TYPE_OPTIONS.map((item) => ({ value: item, label: item }));

function formatOwnerMobile(value: string | null) {
  if (!value) return '';
  if (value.startsWith('+')) return value;
  if (/^9\d{9}$/.test(value)) return `+98 ${value}`;
  return value;
}

function hasOwnershipFormData(store: ProfileStore) {
  const ownership = store.ownership;
  const displayBrandName = ownership.brandName.trim() && ownership.brandName.trim() !== 'دسترنج' ? ownership.brandName.trim() : '';

  return Boolean(
    displayBrandName ||
      ownership.companyName.trim() ||
      ownership.legalName.trim() ||
      ownership.legalType.trim() ||
      ownership.registrationNumber.trim() ||
      ownership.nationalId.trim() ||
      ownership.taxFileNumber.trim() ||
      ownership.registrationDate.trim() ||
      ownership.economicCode.trim(),
  );
}

function hasOperationalData(store: ProfileStore) {
  const hasBankAccounts = store.bankAccounts.length > 0;
  const hasBrandingFiles = Boolean(
    store.branding.logoImage.trim() ||
      store.branding.sealImage.trim() ||
      store.branding.headerImage.trim() ||
      store.branding.footerImage.trim() ||
      store.branding.legalStatement.trim(),
  );

  return hasBankAccounts || hasBrandingFiles;
}

function getOwnershipKindLabel(kind: OwnershipKind) {
  return kind === 'legal' ? 'حقوقی' : 'حقیقی';
}

function getOwnershipKindChangeDialogCopy(from: OwnershipKind, to: OwnershipKind) {
  if (to === 'legal') {
    return {
      title: 'تبدیل پروفایل به شخص حقوقی',
      lead: `شما در حال تغییر نوع کسب‌وکار از ${getOwnershipKindLabel(from)} به حقوقی هستید. این کار فقط ساختار اطلاعات را عوض می‌کند و داده‌های فعلی را حذف نمی‌کند.`,
      highlights: [
        'فیلدهای حقوقی مثل نوع شخصیت، شناسه ملی، شماره ثبت، تاریخ ثبت و کد اقتصادی برای این پروفایل فعال می‌شوند.',
        'اطلاعاتی که قبلا ثبت شده‌اند، در پروفایل باقی می‌مانند اما بعضی از آن‌ها در فرم جدید پنهان می‌شوند یا اولویت نمایششان تغییر می‌کند.',
        'اگر برای قراردادها یا خروجی‌های رسمی از این پروفایل استفاده می‌کنید، بعد از تغییر، بخش‌های وابسته را دوباره بررسی کنید.',
      ],
      warning:
        'این تغییر برای مدیریت پروفایل مناسب است، اما اگر کسب‌وکار شما هنوز ثبت حقوقی ندارد، بهتر است نوع حقیقی را نگه دارید تا داده‌های فرم با وضعیت واقعی کسب‌وکار هماهنگ بماند.',
      confirmLabel: 'ادامه تغییر به حقوقی',
    };
  }

  return {
    title: 'تبدیل پروفایل به شخص حقیقی',
    lead: `شما در حال تغییر نوع کسب‌وکار از ${getOwnershipKindLabel(from)} به حقیقی هستید. این تغییر داده‌ها را حذف نمی‌کند، اما فرم را به حالت ساده‌تر برمی‌گرداند.`,
    highlights: [
      'فیلدهای اختصاصی اشخاص حقوقی از نمایش اصلی خارج می‌شوند و فقط اطلاعات پایه‌تر باقی می‌ماند.',
      'اطلاعات ثبت‌شده قبلی در پروفایل ذخیره می‌مانند و با تغییر نوع از بین نمی‌روند.',
      'اگر این پروفایل برای قراردادهای رسمی، اسناد مالی یا خروجی‌های سازمانی استفاده می‌شود، بعد از تغییر حتما همه بخش‌های وابسته را بررسی کنید.',
    ],
    warning:
      'اگر کسب‌وکار شما شرکت یا موسسه ثبت‌شده است، تغییر به حقیقی می‌تواند باعث شود بعضی از اطلاعات ضروری حقوقی در نمایش فرم در دسترس نباشند.',
    confirmLabel: 'ادامه تغییر به حقیقی',
  };
}

export default function OwnershipPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<ProfileStore>(createDefaultProfileStore());
  const [meta, setMeta] = useState<ProfileMeta>(DEFAULT_PROFILE_META);
  const [notice, setNotice] = useState('');
  const [noticeTone, setNoticeTone] = useState<'error' | 'success' | null>(null);
  const [pendingOwnershipKind, setPendingOwnershipKind] = useState<OwnershipKind | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const payload = await fetchProfilePayload();
        if (!mounted) return;
        setStore(payload.store);
        setMeta(payload.meta);
      } catch (error) {
        if (!mounted) return;
        if (error instanceof Error && error.message === 'unauthorized') {
          router.replace(getSelectTenantPath(BUSINESS_PROFILE_OWNERSHIP));
          return;
        }
        setStore(loadProfileStore());
        setMeta(DEFAULT_PROFILE_META);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [router]);

  const updateOwnership = (patch: Partial<ProfileStore['ownership']>) => {
    setStore((current) => ({
      ...current,
      ownership: {
        ...current.ownership,
        ...patch,
      },
    }));
  };

  const handleOwnershipKindChange = (value: OwnershipKind) => {
    if (value === store.ownership.ownershipKind) return;
    setPendingOwnershipKind(value);
  };

  const closeOwnershipKindDialog = () => {
    setPendingOwnershipKind(null);
  };

  const confirmOwnershipKindChange = () => {
    if (!pendingOwnershipKind) return;
    updateOwnership({ ownershipKind: pendingOwnershipKind });
    setPendingOwnershipKind(null);
  };

  const save = async () => {
    setSaving(true);
    setNotice('');
    setNoticeTone(null);

    try {
      const savedStore = await persistProfileStore(store);
      setStore(savedStore);
      setNoticeTone('success');
      setNotice('اطلاعات پایه کسب‌وکار با موفقیت ذخیره شد.');
    } catch (error) {
      if (error instanceof Error && error.message === 'unauthorized') {
        router.replace(getSelectTenantPath(BUSINESS_PROFILE_OWNERSHIP));
        return;
      }
      setNoticeTone('error');
      setNotice('اطلاعات پایه کسب‌وکار ذخیره نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  const displayBrandName = store.ownership.brandName.trim() && store.ownership.brandName.trim() !== 'دسترنج' ? store.ownership.brandName.trim() : '';
  const tenantBusinessName = store.ownership.companyName.trim() || displayBrandName || meta.businessName.trim();
  const operationalDataExists = useMemo(() => hasOperationalData(store), [store]);
  const ownershipKindChangeDialog = pendingOwnershipKind
    ? getOwnershipKindChangeDialogCopy(store.ownership.ownershipKind, pendingOwnershipKind)
    : null;

  if (loading) {
    return <LoadingCard label="در حال بارگذاری اطلاعات پایه..." />;
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'خانه', href: BUSINESS_PROFILE_ROOT },
          { label: 'تنظیمات کسب و کار', href: '/business-settings' },
          { label: 'پروفایل کسب‌وکار', href: BUSINESS_PROFILE_ROOT },
          { label: 'نوع کسب‌وکار' },
        ]}
      />

      {notice ? (
        <div
          className={`profile-summary-card ${
            noticeTone === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
              : 'border-rose-500/20 bg-rose-500/10 text-rose-100'
          }`}
          role="status"
          aria-live="polite"
        >
          {notice}
        </div>
      ) : null}

      <ProfilePageShell className="ownership-reference-page">
        <div className="flex items-center justify-between gap-3 ownership-reference-backlink">
          <ProfileBackLink href={BUSINESS_PROFILE_ROOT}>بازگشت به پروفایل کسب‌وکار</ProfileBackLink>
        </div>

        <ProfileCard className="ownership-profile-card">
          <ProfileHeading
            title="نوع کسب‌وکار"
            description="نوع کسب‌وکار خود را برای تنظیم قراردادها و اطلاعات پایه مشخص کنید."
          />

          <ProfileChipGroup
            label="نوع کسب‌وکار"
            items={kindOptions}
            value={store.ownership.ownershipKind}
            onChange={handleOwnershipKindChange}
            className="ownership-chip-group"
            pillsClassName="ownership-chip-row"
            pillClassName="ownership-chip-pill"
          />

          {operationalDataExists ? (
            <div className="mt-4 rounded-[18px] border border-amber-500/20 bg-amber-500/10 p-4 text-[13px] leading-7 text-amber-100">
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <p className="m-0">
                  اطلاعات عملیاتی مانند حساب‌های بانکی یا فایل‌های برند در این پروفایل ثبت شده است. تغییر نوع کسب‌وکار این داده‌ها را حذف نمی‌کند، اما بهتر است
                  بعد از تغییر، بخش‌های وابسته را دوباره بررسی کنید.
                </p>
              </div>
            </div>
          ) : null}

          <div className="profile-owner-card profile-owner-card-minimal">
            <div className="profile-owner-banner">
              <strong>مالک اکانت کسب‌وکار</strong>
              <span>اطلاعات این کارت از مالک فعلی tenant خوانده می‌شود و از همین صفحه ویرایش نمی‌شود.</span>
            </div>

            <div className="profile-owner-body">
              <div className="profile-owner-actions">
                <span className="status-chip status-chip-completed">فقط نمایش</span>
              </div>

              <div className="profile-owner-meta">
                <strong>{meta.owner.fullName || 'ثبت نشده'}</strong>
                <span dir="ltr">{formatOwnerMobile(meta.owner.mobile) || 'ثبت نشده'}</span>
                <span>{meta.owner.email?.trim() || 'ثبت نشده'}</span>
              </div>

              <div className="profile-owner-logo">
                <Building2 />
              </div>
            </div>
          </div>

          <div className="profile-form-grid">
            <ProfileReadonlyField
              label="نام کسب‌وکار"
              hint="این عنوان از پروفایل کسب‌وکار خوانده می‌شود و در این صفحه به‌صورت مستقیم ویرایش نمی‌شود."
              value={tenantBusinessName || 'ثبت نشده'}
            />
          </div>

          {store.ownership.ownershipKind === 'legal' ? (
            <>
              <ProfileChipGroup
                label="نوع شخصیت حقوقی"
                hint="این گزینه مشخص می‌کند چه شناسه‌هایی برای استفاده در قراردادها و اطلاعات پایه لازم است."
                items={legalTypeOptions}
                value={store.ownership.legalType}
                onChange={(value) => updateOwnership({ legalType: value })}
                className="ownership-chip-group"
                pillsClassName="ownership-chip-row"
                pillClassName="ownership-chip-pill"
              />

              <div className="profile-form-grid">
                <ProfileTextField
                  label="نام تجاری / برند"
                  hint="نام تجاری اختیاری است و برای نمایش در برخی خروجی‌ها استفاده می‌شود."
                  value={store.ownership.brandName}
                  onChange={(value) => updateOwnership({ brandName: value })}
                />
                <ProfileTextField
                  label="شناسه ملی"
                  hint="شناسه ملی اشخاص حقوقی برای شناسایی شرکت‌ها استفاده می‌شود."
                  value={store.ownership.nationalId}
                  onChange={(value) => updateOwnership({ nationalId: value })}
                />
                <ProfileTextField
                  label="شماره ثبت شرکت"
                  hint="شماره اختصاصی ثبت در اداره ثبت شرکت‌ها"
                  value={store.ownership.registrationNumber}
                  onChange={(value) => updateOwnership({ registrationNumber: value })}
                />
                <ProfileDateField
                  label="تاریخ ثبت شرکت"
                  hint="تاریخ رسمی ثبت شرکت در اداره ثبت شرکت‌ها"
                  value={store.ownership.registrationDate}
                  onChange={(value) => updateOwnership({ registrationDate: value })}
                />
                <ProfileTextField
                  label="شماره پرونده مالیاتی"
                  hint="شماره اختصاصی در اداره مالیات"
                  value={store.ownership.taxFileNumber}
                  onChange={(value) => updateOwnership({ taxFileNumber: value })}
                />
                <ProfileTextField
                  label="کد اقتصادی"
                  hint="کد اقتصادی صادر شده توسط سازمان امور مالیاتی"
                  value={store.ownership.economicCode}
                  onChange={(value) => updateOwnership({ economicCode: value })}
                />
              </div>
            </>
          ) : (
            <div className="profile-form-grid profile-form-grid-compact">
              <ProfileTextField
                label="شماره پرونده مالیاتی"
                hint="شماره اختصاصی در اداره مالیات"
                value={store.ownership.taxFileNumber}
                onChange={(value) => updateOwnership({ taxFileNumber: value })}
              />
              <ProfileTextField
                label="کد اقتصادی"
                hint="کد اقتصادی صادر شده توسط سازمان امور مالیاتی"
                value={store.ownership.economicCode}
                onChange={(value) => updateOwnership({ economicCode: value })}
              />
            </div>
          )}
        </ProfileCard>

        <ProfileSubmitBar
          label={saving ? 'در حال ثبت...' : 'ذخیره اطلاعات پایه کسب‌وکار'}
          onClick={save}
          disabled={saving}
          align="center"
        />
      </ProfilePageShell>

      <PanelFormModal
        open={Boolean(ownershipKindChangeDialog)}
        title={ownershipKindChangeDialog?.title ?? 'تغییر نوع کسب‌وکار'}
        lead={ownershipKindChangeDialog?.lead}
        onClose={closeOwnershipKindDialog}
        footer={
          <PanelFormModalActions
            submitLabel={ownershipKindChangeDialog?.confirmLabel ?? 'ادامه'}
            cancelLabel="انصراف"
            onSubmit={confirmOwnershipKindChange}
            onCancel={closeOwnershipKindDialog}
          />
        }
      >
        {ownershipKindChangeDialog ? (
          <div className="flex flex-col gap-4 text-sm leading-7 text-slate-200">
            <div className="rounded-[18px] border border-amber-500/20 bg-amber-500/10 p-4 text-amber-50">
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
                <p className="m-0">{ownershipKindChangeDialog.warning}</p>
              </div>
            </div>

            <section className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <h3 className="mb-3 text-sm font-bold text-white">این تغییر چه اثری دارد؟</h3>
              <ul className="m-0 flex list-disc flex-col gap-2 pr-5">
                {ownershipKindChangeDialog.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-[18px] border border-sky-500/20 bg-sky-500/10 p-4 text-sky-50">
              <strong className="block text-sm text-sky-100">نکته مهم</strong>
              <p className="m-0 mt-2 text-[13px] leading-7">{hasOwnershipFormData(store) ? 'این پروفایل قبلا اطلاعات تکمیل‌شده دارد، بنابراین بعد از تغییر نوع، بهتر است فیلدهای نمایش‌داده‌شده را دوباره مرور کنید.' : 'چون هنوز اطلاعات زیادی در این فرم ثبت نشده، این تغییر از نظر داده‌ای کم‌ریسک‌تر است.'}</p>
            </section>
          </div>
        ) : null}
      </PanelFormModal>
    </>
  );
}
