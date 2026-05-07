'use client';

import { Building2, Pencil, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LEGAL_TYPE_OPTIONS,
  fetchProfilePayload,
  type LegalOwnershipForm,
  type NaturalOwnershipForm,
  type OwnershipKind,
  type ProfileMeta,
  persistProfileStore,
} from './profileStorage';
import {
  ProfileCard,
  ProfileChipGroup,
  ProfileDateField,
  ProfileHeading,
  ProfilePageShell,
  ProfileSubmitBar,
  ProfileTextField,
} from './ProfileFormShell';

const kindOptions: Array<{ value: OwnershipKind; label: string }> = [
  { value: 'natural', label: 'حقیقی' },
  { value: 'legal', label: 'حقوقی' },
];

const legalTypeOptions = LEGAL_TYPE_OPTIONS.map((item) => ({ value: item, label: item }));

function formatOwnerMobile(value: string | null) {
  if (!value) return '';
  if (value.startsWith('+')) return value;
  if (/^9\d{9}$/.test(value)) return `+98 ${value}`;
  return value;
}

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

export function BusinessOwnershipPanel() {
  const router = useRouter();
  const [ownershipKind, setOwnershipKind] = useState<OwnershipKind>('legal');
  const [profileMeta, setProfileMeta] = useState<ProfileMeta>(emptyProfileMeta);
  const [legalForm, setLegalForm] = useState<LegalOwnershipForm>({
    legalType: LEGAL_TYPE_OPTIONS[0],
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

  const save = async () => {
    const { store } = await fetchProfilePayload();
    await persistProfileStore({
      ...store,
      ownershipKind,
      legal: legalForm,
      natural: naturalForm,
    });
    router.push('/business-settings/profile');
    router.refresh();
  };

  return (
    <ProfilePageShell>
      <ProfileCard>
        <ProfileHeading
          title="نوع کسب و کار"
          description="نوع کسب‌وکار خود را برای تنظیم قراردادها و اطلاعات پایه مشخص کنید."
        />

        <ProfileChipGroup label="نوع شخصیت" items={kindOptions} value={ownershipKind} onChange={(value) => setOwnershipKind(value)} />

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
              <strong>{profileMeta.owner.fullName || '---'}</strong>
              <span dir="ltr">{formatOwnerMobile(profileMeta.owner.mobile) || '---'}</span>
            </div>
            <div className="profile-owner-logo">
              <Building2 />
            </div>
          </div>
        </div>

        {ownershipKind === 'legal' ? (
          <>
            <ProfileChipGroup
              label="نوع شخصیت حقوقی"
              hint="این گزینه تعیین می‌کند چه شناسه‌هایی الزامی هستند."
              items={legalTypeOptions}
              value={legalForm.legalType}
              onChange={(value) => setLegalForm((current) => ({ ...current, legalType: value }))}
            />

            <div className="profile-form-grid">
              <ProfileTextField
                label="نام قانونی شرکت / کسب و کار"
                required
                hint="نام رسمی ثبت شده در اداره ثبت شرکت ها"
                value={legalForm.companyName}
                onChange={(value) => setLegalForm((current) => ({ ...current, companyName: value }))}
              />
              <ProfileTextField
                label="نام تجاری / برند"
                hint="نام برند جهت نمایش در سامانه"
                value={legalForm.brandName}
                onChange={(value) => setLegalForm((current) => ({ ...current, brandName: value }))}
              />
              <ProfileTextField
                label="شناسه ملی"
                required
                hint="شناسه ملی اشخاص حقوقی برای شناسایی شرکت ها اجباری است"
                value={legalForm.nationalId}
                onChange={(value) => setLegalForm((current) => ({ ...current, nationalId: value }))}
              />
              <ProfileTextField
                label="شماره ثبت شرکت"
                required
                hint="شماره اختصاصی ثبت در اداره ثبت شرکت ها"
                value={legalForm.registrationNumber}
                onChange={(value) => setLegalForm((current) => ({ ...current, registrationNumber: value }))}
              />
              <ProfileDateField
                label="تاریخ ثبت شرکت"
                required
                hint="تاریخ رسمی ثبت شرکت در اداره ثبت شرکت ها"
                value={legalForm.registrationDate}
                onChange={(value) => setLegalForm((current) => ({ ...current, registrationDate: value }))}
              />
              <ProfileTextField
                label="شماره پرونده مالیاتی"
                hint="شماره اختصاصی در اداره مالیات"
                value={legalForm.taxFileNumber}
                onChange={(value) => setLegalForm((current) => ({ ...current, taxFileNumber: value }))}
              />
              <ProfileTextField
                label="کد اقتصادی"
                required
                hint="کد اقتصادی صادر شده توسط سازمان امور مالیاتی"
                value={legalForm.economicCode}
                onChange={(value) => setLegalForm((current) => ({ ...current, economicCode: value }))}
              />
            </div>
          </>
        ) : (
          <div className="profile-form-grid profile-form-grid-compact">
            <ProfileTextField
              label="شماره پرونده مالیاتی"
              hint="شماره اختصاصی در اداره مالیات"
              value={naturalForm.taxFileNumber}
              onChange={(value) => setNaturalForm((current) => ({ ...current, taxFileNumber: value }))}
            />
            <ProfileTextField
              label="کد اقتصادی"
              required
              hint="کد اقتصادی صادر شده توسط سازمان امور مالیاتی"
              value={naturalForm.economicCode}
              onChange={(value) => setNaturalForm((current) => ({ ...current, economicCode: value }))}
            />
          </div>
        )}
      </ProfileCard>

      <ProfileSubmitBar label="ثبت" onClick={save} />
    </ProfilePageShell>
  );
}
