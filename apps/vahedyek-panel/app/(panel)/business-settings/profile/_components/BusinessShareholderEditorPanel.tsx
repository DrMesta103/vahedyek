'use client';

import Link from 'next/link';
import { Camera, Plus, Search, UserRound, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormTextInput } from '../../../contracts/new/_components/ContractFormPrimitives';
import {
  LEGAL_TYPE_OPTIONS,
  loadProfileStore,
  saveProfileStore,
  upsertLegalShareholder,
  upsertNaturalShareholder,
  type LegalShareholderRecord,
  type NaturalShareholderRecord,
  type RepresentativeRecord,
} from './profileStorage';
import {
  ProfileCard,
  ProfileChipGroup,
  ProfileDateField,
  ProfileHeading,
  ProfilePageShell,
  ProfileTextField,
} from './ProfileFormShell';
import { PersonAvatar, PersonRowCard } from './ProfilePeoplePrimitives';

type ShareholderKind = 'natural' | 'legal';
type EditorStep = 'details' | 'representatives';

const legalTypeOptions = LEGAL_TYPE_OPTIONS.map((item) => ({ value: item, label: item }));

const emptyLegalForm: Omit<LegalShareholderRecord, 'id' | 'representatives'> = {
  legalType: LEGAL_TYPE_OPTIONS[0],
  companyName: '',
  brandName: '',
  registrationNumber: '',
  nationalId: '',
  taxFileNumber: '',
  registrationDate: '',
  economicCode: '',
  sharePercent: '',
  avatarMode: 'ghost',
  avatarText: 'ش',
  avatarImage: '',
};

const emptyNaturalForm: Omit<NaturalShareholderRecord, 'id'> = {
  fullName: '',
  mobile: '',
  email: '',
  avatarMode: 'ghost',
  avatarText: 'ش',
  avatarImage: '',
  sharePercent: '',
};

export function BusinessShareholderEditorPanel({ shareholderId }: { shareholderId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [kind, setKind] = useState<ShareholderKind>('legal');
  const [step, setStep] = useState<EditorStep>('details');
  const [legalForm, setLegalForm] = useState(emptyLegalForm);
  const [naturalForm, setNaturalForm] = useState(emptyNaturalForm);
  const [representatives, setRepresentatives] = useState<RepresentativeRecord[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const store = loadProfileStore();
    const requestedKind = searchParams.get('kind');
    const requestedStep = searchParams.get('step');
    const legalShareholder = shareholderId ? store.legalShareholders.find((item) => item.id === shareholderId) : null;
    const naturalShareholder = shareholderId ? store.naturalShareholders.find((item) => item.id === shareholderId) : null;

    if (legalShareholder) {
      setKind('legal');
      setLegalForm({
        legalType: legalShareholder.legalType,
        companyName: legalShareholder.companyName,
        brandName: legalShareholder.brandName,
        registrationNumber: legalShareholder.registrationNumber,
        nationalId: legalShareholder.nationalId,
        taxFileNumber: legalShareholder.taxFileNumber,
        registrationDate: legalShareholder.registrationDate,
        economicCode: legalShareholder.economicCode,
        sharePercent: legalShareholder.sharePercent,
        avatarMode: legalShareholder.avatarMode,
        avatarText: legalShareholder.avatarText,
        avatarImage: legalShareholder.avatarImage ?? '',
      });
      setRepresentatives(legalShareholder.representatives);
    } else if (naturalShareholder) {
      setKind('natural');
      setNaturalForm({
        fullName: naturalShareholder.fullName,
        mobile: naturalShareholder.mobile,
        email: naturalShareholder.email,
        avatarMode: naturalShareholder.avatarMode,
        avatarText: naturalShareholder.avatarText,
        avatarImage: naturalShareholder.avatarImage ?? '',
        sharePercent: naturalShareholder.sharePercent,
      });
    } else {
      setKind(requestedKind === 'natural' ? 'natural' : 'legal');
      setRepresentatives([]);
      setLegalForm(emptyLegalForm);
      setNaturalForm(emptyNaturalForm);
    }

    setStep(requestedStep === 'representatives' ? 'representatives' : 'details');
  }, [searchParams, shareholderId]);

  const filteredRepresentatives = useMemo(() => {
    const normalizedQuery = query.trim();
    return representatives.filter((item) => !normalizedQuery || item.fullName.includes(normalizedQuery) || item.mobile.includes(normalizedQuery) || item.email.includes(normalizedQuery));
  }, [query, representatives]);

  const activeShareholderId = shareholderId ?? `legal-shareholder-${Date.now()}`;

  const readAvatarFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result ?? '');
      if (kind === 'legal') {
        setLegalForm((current) => ({ ...current, avatarMode: 'image', avatarImage: image }));
        return;
      }
      setNaturalForm((current) => ({ ...current, avatarMode: 'image', avatarImage: image }));
    };
    reader.readAsDataURL(file);
  };

  const saveDetails = () => {
    const store = loadProfileStore();

    if (kind === 'natural') {
      saveProfileStore(
        upsertNaturalShareholder(store, {
          id: shareholderId ?? `natural-shareholder-${Date.now()}`,
          ...naturalForm,
          avatarText: naturalForm.fullName.trim().slice(0, 1) || 'ش',
        })
      );
      router.push('/business-settings/profile/shareholders?tab=natural');
      router.refresh();
      return;
    }

    const nextShareholder: LegalShareholderRecord = {
      id: activeShareholderId,
      ...legalForm,
      avatarText: legalForm.companyName.trim().slice(0, 1) || 'ش',
      representatives,
    };

    saveProfileStore(upsertLegalShareholder(store, nextShareholder));
    router.push(`/business-settings/profile/shareholders/${activeShareholderId}?step=representatives&tab=legal`);
    router.refresh();
  };

  const finishLegalFlow = () => {
    router.push('/business-settings/profile/shareholders?tab=legal');
    router.refresh();
  };

  return (
    <ProfilePageShell>
      <ProfileCard className="shareholder-editor-card">
        <ProfileHeading
          title={kind === 'legal' ? 'اطلاعات شرکت' : 'اطلاعات سهامدار حقیقی'}
          description={kind === 'legal' ? 'در این بخش می توانید اطلاعات شرکت را وارد کنید' : 'در این بخش می توانید اطلاعات سهامدار حقیقی را وارد کنید'}
        />

        {kind === 'legal' ? <ShareholderSteps activeStep={step} /> : null}

        <div className="shareholder-editor-avatar">
          <PersonAvatar
            avatarMode={kind === 'legal' ? legalForm.avatarMode : naturalForm.avatarMode}
            avatarText={kind === 'legal' ? legalForm.avatarText : naturalForm.avatarText}
            avatarImage={kind === 'legal' ? legalForm.avatarImage : naturalForm.avatarImage}
            kind={kind === 'legal' ? 'company' : 'person'}
            size="large"
          />
          <button type="button" className="shareholder-avatar-upload" onClick={() => fileInputRef.current?.click()}>
            <Camera />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(event) => readAvatarFile(event.target.files?.[0] ?? null)} />
        </div>

        {!shareholderId ? (
          <div className="shareholder-kind-tabs">
            <button type="button" className={kind === 'legal' ? 'is-active' : ''} onClick={() => setKind('legal')}>
              <Users />
              <span>حقوقی</span>
            </button>
            <button type="button" className={kind === 'natural' ? 'is-active' : ''} onClick={() => setKind('natural')}>
              <UserRound />
              <span>حقیقی</span>
            </button>
          </div>
        ) : null}

        {kind === 'legal' && step === 'details' ? (
          <>
            <ProfileChipGroup
              label="نوع شخصیت حقوقی"
              items={legalTypeOptions}
              value={legalForm.legalType}
              onChange={(value) => setLegalForm((current) => ({ ...current, legalType: value }))}
            />

            <div className="profile-form-grid">
              <ProfileTextField label="نام قانونی شرکت" required value={legalForm.companyName} onChange={(value) => setLegalForm((current) => ({ ...current, companyName: value }))} />
              <ProfileTextField label="نام تجاری" value={legalForm.brandName} onChange={(value) => setLegalForm((current) => ({ ...current, brandName: value }))} />
              <ProfileTextField label="شماره ثبت شرکت" required value={legalForm.registrationNumber} onChange={(value) => setLegalForm((current) => ({ ...current, registrationNumber: value }))} />
              <ProfileTextField label="شناسه ملی" required value={legalForm.nationalId} onChange={(value) => setLegalForm((current) => ({ ...current, nationalId: value }))} />
              <ProfileTextField label="شماره پرونده مالیاتی" value={legalForm.taxFileNumber} onChange={(value) => setLegalForm((current) => ({ ...current, taxFileNumber: value }))} />
              <ProfileDateField label="تاریخ ثبت شرکت" required value={legalForm.registrationDate} onChange={(value) => setLegalForm((current) => ({ ...current, registrationDate: value }))} />
              <ProfileTextField label="درصد مالکیت" required value={legalForm.sharePercent} onChange={(value) => setLegalForm((current) => ({ ...current, sharePercent: value }))} />
              <ProfileTextField label="کد اقتصادی" required value={legalForm.economicCode} onChange={(value) => setLegalForm((current) => ({ ...current, economicCode: value }))} />
            </div>
          </>
        ) : null}

        {kind === 'natural' ? (
          <div className="profile-form-grid">
            <ProfileTextField label="نام و نام خانوادگی" required value={naturalForm.fullName} onChange={(value) => setNaturalForm((current) => ({ ...current, fullName: value }))} />
            <ProfileTextField label="شماره موبایل" value={naturalForm.mobile} onChange={(value) => setNaturalForm((current) => ({ ...current, mobile: value }))} />
            <ProfileTextField label="ایمیل" value={naturalForm.email} onChange={(value) => setNaturalForm((current) => ({ ...current, email: value }))} />
            <ProfileTextField label="درصد مالکیت" required value={naturalForm.sharePercent} onChange={(value) => setNaturalForm((current) => ({ ...current, sharePercent: value }))} />
          </div>
        ) : null}

        {kind === 'legal' && step === 'representatives' ? (
          <div className="shareholder-representatives-step">
            <p className="shareholder-representatives-copy">نماینده قانونی / صاحب امضا فردی که اختیار امضای قراردادها و اسناد رسمی را دارد</p>

            <div className="representative-toolbar shareholders-toolbar">
              <Link
                href={`/business-settings/profile/representatives/new?shareholderId=${activeShareholderId}&returnTo=${encodeURIComponent(
                  `/business-settings/profile/shareholders/${activeShareholderId}?step=representatives&tab=legal`
                )}`}
                className="representative-add-button"
              >
                <Plus />
                افزودن نماینده
              </Link>

              <label className="representative-search">
                <FormTextInput value={query} onChange={setQuery} placeholder="جستجو..." icon={Search} />
              </label>
            </div>

            <div className="representative-list">
              {filteredRepresentatives.map((item) => (
                <PersonRowCard
                  key={item.id}
                  className="representative-list-card"
                  name={item.fullName}
                  subtitle={item.mobile}
                  email={item.email}
                  avatar={<PersonAvatar avatarMode={item.avatarMode} avatarText={item.avatarText} avatarImage={item.avatarImage} kind="person" />}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="shareholder-editor-actions">
          <button
            type="button"
            className="profile-primary-button is-secondary"
            onClick={() => {
              if (kind === 'legal' && step === 'representatives') {
                setStep('details');
                router.push(`/business-settings/profile/shareholders/${activeShareholderId}?tab=legal`);
                return;
              }
              router.push(`/business-settings/profile/shareholders?tab=${kind}`);
            }}
          >
            بازگشت
          </button>
          <button type="button" className="profile-primary-button" onClick={step === 'representatives' ? finishLegalFlow : saveDetails}>
            ثبت
          </button>
        </div>
      </ProfileCard>
    </ProfilePageShell>
  );
}

function ShareholderSteps({ activeStep }: { activeStep: EditorStep }) {
  return (
    <div className="shareholder-steps" aria-label="مراحل ثبت سهامدار">
      <div className={`shareholder-step ${activeStep === 'details' ? 'is-active' : ''}`}>
        <span>1</span>
        <strong>اطلاعات شرکت</strong>
      </div>
      <div className={`shareholder-step ${activeStep === 'representatives' ? 'is-active' : ''}`}>
        <span>2</span>
        <strong>لیست نمایندگان</strong>
      </div>
    </div>
  );
}
