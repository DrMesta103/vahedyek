'use client';

import { Building2, Pencil, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDefaultProfileStore, DEFAULT_PROFILE_META, type OwnershipKind, type ProfileMeta, type ProfileStore } from '../profile.types';
import { fetchProfilePayload, loadProfileStore, persistProfileStore } from '../profileStorage';
import { BUSINESS_PROFILE_OWNERSHIP, BUSINESS_PROFILE_ROOT, getSelectTenantPath } from '../routes';
import { Breadcrumbs, LoadingCard } from './account-ui';
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

export default function OwnershipPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<ProfileStore>(createDefaultProfileStore());
  const [meta, setMeta] = useState<ProfileMeta>(DEFAULT_PROFILE_META);
  const [notice, setNotice] = useState('');

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

  const save = async () => {
    setSaving(true);
    setNotice('');
    try {
      await persistProfileStore(store);
      router.push(BUSINESS_PROFILE_ROOT);
      router.refresh();
    } catch (error) {
      if (error instanceof Error && error.message === 'unauthorized') {
        router.replace(getSelectTenantPath(BUSINESS_PROFILE_OWNERSHIP));
        return;
      }
      setNotice('ثبت اطلاعات با خطا مواجه شد.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingCard label="در حال بارگذاری..." />;
  }

  const tenantBusinessName = meta.businessName.trim() || 'دسترنج';

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'خانه', href: BUSINESS_PROFILE_ROOT },
          { label: 'تنظیمات کسب و کار', href: '/business-settings' },
          { label: 'پروفایل کسب‌وکار', href: BUSINESS_PROFILE_ROOT },
          { label: 'نوع مالکیت و اطلاعات پایه' },
        ]}
      />

      {notice ? <LoadingCard label={notice} /> : null}

      <ProfilePageShell className="ownership-reference-page">
        <div className="flex items-center justify-between gap-3 ownership-reference-backlink">
          <ProfileBackLink href={BUSINESS_PROFILE_ROOT}>بازگشت به پروفایل کسب‌وکار</ProfileBackLink>
        </div>

        <ProfileCard className="ownership-profile-card">
          <ProfileHeading
            title="نوع کسب و کار"
            description="نوع کسب‌وکار خود را برای تنظیم قراردادها و اطلاعات پایه مشخص کنید."
          />

          <ProfileChipGroup
            label="نوع شخصیت"
            items={kindOptions}
            value={store.ownership.ownershipKind}
            onChange={(value) => updateOwnership({ ownershipKind: value })}
            className="ownership-chip-group"
            pillsClassName="ownership-chip-row"
            pillClassName="ownership-chip-pill"
          />

          <div className="profile-owner-card profile-owner-card-minimal">
            <div className="profile-owner-banner">
              <strong>مالک کسب و کار</strong>
              <span>در صورت ثبت قبلی اطلاعات، از طریق ویرایش ادامه دهید.</span>
            </div>

            <div className="profile-owner-body">
              <div className="profile-owner-actions">
                <button type="button" aria-label="ویرایش">
                  <Pencil />
                </button>
                <button type="button" aria-label="تماس">
                  <Phone />
                </button>
              </div>

              <div className="profile-owner-meta">
                <strong>{meta.owner.fullName || '---'}</strong>
                <span dir="ltr">{formatOwnerMobile(meta.owner.mobile) || '---'}</span>
              </div>

              <div className="profile-owner-logo">
                <Building2 />
              </div>
            </div>
          </div>

          {store.ownership.ownershipKind === 'legal' ? (
            <>
              <ProfileChipGroup
                label="نوع شخصیت حقوقی"
                hint="این گزینه تعیین می‌کند چه شناسه‌هایی الزامی هستند."
                items={legalTypeOptions}
                value={store.ownership.legalType}
                onChange={(value) => updateOwnership({ legalType: value })}
                className="ownership-chip-group"
                pillsClassName="ownership-chip-row"
                pillClassName="ownership-chip-pill"
              />

              <div className="profile-form-grid">
                <ProfileReadonlyField
                  label="نام کسب‌وکار"
                  hint="این نام برای نمایش در سامانه استفاده می‌شود."
                  value={tenantBusinessName}
                />
                <ProfileTextField
                  label="نام تجاری / برند"
                  hint="نام برند جهت نمایش در سامانه"
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

        <ProfileSubmitBar label={saving ? 'در حال ثبت...' : 'ثبت'} onClick={save} disabled={saving} align="center" />
      </ProfilePageShell>
    </>
  );
}
