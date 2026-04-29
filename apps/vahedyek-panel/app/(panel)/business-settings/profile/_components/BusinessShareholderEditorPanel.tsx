'use client';

import Link from 'next/link';
import { Camera, ChevronLeft, Plus, Search, UserRound, Users } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormTextInput } from '../../../contracts/new/_components/ContractFormPrimitives';
import {
  LEGAL_TYPE_OPTIONS,
  fetchProfileStore,
  persistProfileStore,
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
import { BusinessRepresentativePickerPanel } from './BusinessRepresentativePickerPanel';
import { PersonAvatar, PersonRowCard } from './ProfilePeoplePrimitives';

type ShareholderKind = 'natural' | 'legal';
type EditorStep = 'details' | 'representatives';

const legalTypeOptions = LEGAL_TYPE_OPTIONS.map((item) => ({ value: item, label: item }));

const emptyLegalForm: Omit<LegalShareholderRecord, 'id' | 'representatives'> = {
  legalType: LEGAL_TYPE_OPTIONS[2],
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
  mandateEndDate: '',
  signatureAvatarMode: 'badge',
  signatureAvatarText: 'ش',
  signatureAvatarImage: '',
};

export function BusinessShareholderEditorPanel({ shareholderId }: { shareholderId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const requestedKind = searchParams.get('kind');
  const lockedKind = requestedKind === 'legal' || requestedKind === 'natural' ? requestedKind : null;
  const isLegalRegistrationFlow = requestedKind === 'legal';
  const [kind, setKind] = useState<ShareholderKind>('legal');
  const [step, setStep] = useState<EditorStep>('details');
  const [legalForm, setLegalForm] = useState(emptyLegalForm);
  const [naturalForm, setNaturalForm] = useState(emptyNaturalForm);
  const [representatives, setRepresentatives] = useState<RepresentativeRecord[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let ignore = false;

    fetchProfileStore().then((store) => {
      if (ignore) return;

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
          mandateEndDate: naturalShareholder.mandateEndDate ?? '',
          signatureAvatarMode: naturalShareholder.signatureAvatarMode ?? 'badge',
          signatureAvatarText: naturalShareholder.signatureAvatarText ?? naturalShareholder.avatarText,
          signatureAvatarImage: naturalShareholder.signatureAvatarImage ?? '',
        });
      } else {
        setKind(lockedKind === 'natural' ? 'natural' : 'legal');
        setRepresentatives([]);
        setLegalForm(emptyLegalForm);
        setNaturalForm(emptyNaturalForm);
      }

      setStep(requestedStep === 'representatives' ? 'representatives' : 'details');
    });

    return () => {
      ignore = true;
    };
  }, [lockedKind, searchParams, shareholderId]);

  if (!shareholderId && lockedKind === 'natural') {
    return <BusinessRepresentativePickerPanel mode="natural-shareholder" />;
  }

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

  const saveDetails = async () => {
    const store = await fetchProfileStore();

    if (kind === 'natural') {
      await persistProfileStore(
        upsertNaturalShareholder(store, {
          id: shareholderId ?? `natural-shareholder-${Date.now()}`,
          ...naturalForm,
          avatarText: naturalForm.fullName.trim().slice(0, 1) || 'ش',
          signatureAvatarText: naturalForm.signatureAvatarText || naturalForm.fullName.trim().slice(0, 1) || 'ش',
        }),
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

    await persistProfileStore(upsertLegalShareholder(store, nextShareholder));
    router.push(`/business-settings/profile/shareholders/${activeShareholderId}?step=representatives&tab=legal&kind=legal`);
    router.refresh();
  };

  const finishLegalFlow = () => {
    router.push('/business-settings/profile/shareholders?tab=legal');
    router.refresh();
  };

  const headingTitle =
    kind === 'legal'
      ? step === 'representatives' && isLegalRegistrationFlow
        ? 'لیست نمایندگان'
        : isLegalRegistrationFlow
          ? 'ثبت سهامدار حقوقی'
          : 'اطلاعات شرکت'
      : 'اطلاعات سهامدار حقیقی';

  const headingDescription =
    kind === 'legal'
      ? step === 'representatives' && isLegalRegistrationFlow
        ? 'دراین بخش میتوانید اطلاعات تکمیلی سهامدار را وارد کنید'
        : isLegalRegistrationFlow
          ? 'دراین بخش میتوانید اطلاعات تکمیلی سهامدار را وارد کنید'
          : 'در این بخش می توانید اطلاعات شرکت را وارد کنید'
      : 'در این بخش می توانید اطلاعات سهامدار حقیقی را وارد کنید';

  return (
    <ProfilePageShell>
      <ProfileCard className={`shareholder-editor-card${isLegalRegistrationFlow ? ' is-legal-registration-flow' : ''}`}>
        <ProfileHeading title={headingTitle} description={headingDescription} />

        {kind === 'legal' ? <ShareholderSteps activeStep={step} /> : null}

        {!(kind === 'legal' && step === 'representatives' && isLegalRegistrationFlow) ? (
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
        ) : null}

        {!shareholderId && !lockedKind ? (
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
              hint="نوع شرکت خود را میتوانید انتخاب کنید"
              items={legalTypeOptions}
              value={legalForm.legalType}
              onChange={(value) => setLegalForm((current) => ({ ...current, legalType: value }))}
            />

            <div className={`profile-form-grid${isLegalRegistrationFlow ? ' legal-registration-grid' : ''}`}>
              <ProfileTextField
                label="نام قانونی شرکت"
                required
                hint="نام رسمی ثبت شده شرکت خود را در این بخش وارد کنید"
                value={legalForm.companyName}
                onChange={(value) => setLegalForm((current) => ({ ...current, companyName: value }))}
              />
              <ProfileTextField
                label="نام تجاری"
                hint="نام برند خود را در این بخش میتوانید وارد کنید"
                value={legalForm.brandName}
                onChange={(value) => setLegalForm((current) => ({ ...current, brandName: value }))}
              />
              <ProfileTextField
                label="شناسه ملی"
                required
                hint="شناسه ملی ثبت شده شرکت را در این بخش وارد کنید"
                value={legalForm.nationalId}
                onChange={(value) => setLegalForm((current) => ({ ...current, nationalId: value }))}
              />
              <ProfileTextField
                label="شماره ثبت شرکت"
                required
                hint="شماره ثبت شده را در این بخش وارد کنید"
                value={legalForm.registrationNumber}
                onChange={(value) => setLegalForm((current) => ({ ...current, registrationNumber: value }))}
              />
              <ProfileDateField
                label="تاریخ ثبت شرکت"
                required
                hint="تاریخ رسمی که شرکت خود را ثبت کرده اید"
                value={legalForm.registrationDate}
                onChange={(value) => setLegalForm((current) => ({ ...current, registrationDate: value }))}
              />
              <ProfileTextField
                label="شماره پرونده مالیاتی"
                hint="شماره ای که در اداره مالیات ثبت گردیده است"
                value={legalForm.taxFileNumber}
                onChange={(value) => setLegalForm((current) => ({ ...current, taxFileNumber: value }))}
              />
              <ProfileTextField
                label="کد اقتصادی"
                required
                hint="کد اقتصادی 12 رقمی صادر شده توسط سازمان امور مالیاتی"
                value={legalForm.economicCode}
                onChange={(value) => setLegalForm((current) => ({ ...current, economicCode: value }))}
              />
              <ProfileTextField
                label="درصد مالکیت"
                required
                hint="درباین بخش میزان سهم و سهام مالکیت سهامدار را مشخص کنید"
                value={legalForm.sharePercent}
                onChange={(value) => setLegalForm((current) => ({ ...current, sharePercent: value }))}
              />
            </div>

            {isLegalRegistrationFlow ? (
              <button type="button" className="shareholder-legal-teaser">
                <div className="shareholder-legal-teaser-copy">
                  <strong>راههای ارتباطی</strong>
                  <p>تمام راه های ارتباطی را میتوانید در این بخش وارد کنید</p>
                </div>
                <div className="shareholder-legal-teaser-art">CONTRACT</div>
                <ChevronLeft />
              </button>
            ) : null}
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
          <div className={`shareholder-representatives-step${isLegalRegistrationFlow ? ' is-legal-registration-step' : ''}`}>
            <p className="shareholder-representatives-copy">نماینده قانونی / صاحب امضا (فردی که اختیار امضای قراردادها و اسناد رسمی را دارد)</p>

            <div className="shareholder-representatives-toolbar">
              <label className="representative-search shareholder-representatives-search">
                <FormTextInput value={query} onChange={setQuery} placeholder="جستجو" icon={Search} />
              </label>

              <Link
                href={`/business-settings/profile/representatives/new?shareholderId=${activeShareholderId}&title=${encodeURIComponent(
                  'لیست نماینده',
                )}&returnTo=${encodeURIComponent(`/business-settings/profile/shareholders/${activeShareholderId}?step=representatives&tab=legal&kind=legal`)}`}
                className="shareholder-representatives-plus"
              >
                <Plus />
              </Link>
            </div>

            {filteredRepresentatives.length ? (
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
            ) : (
              <Link
                href={`/business-settings/profile/representatives/new?shareholderId=${activeShareholderId}&title=${encodeURIComponent(
                  'لیست نماینده',
                )}&returnTo=${encodeURIComponent(`/business-settings/profile/shareholders/${activeShareholderId}?step=representatives&tab=legal&kind=legal`)}`}
                className="shareholder-representatives-empty"
              >
                <span className="shareholder-representatives-empty-inner">
                  <Plus />
                </span>
              </Link>
            )}
          </div>
        ) : null}

        <div className={`shareholder-editor-actions${isLegalRegistrationFlow ? ' is-legal-registration-actions' : ''}`}>
          {!(isLegalRegistrationFlow && step === 'details') ? (
            <button
              type="button"
              className="profile-primary-button is-secondary"
              onClick={() => {
                if (kind === 'legal' && step === 'representatives') {
                  setStep('details');
                  router.push(`/business-settings/profile/shareholders/${activeShareholderId}?tab=legal&kind=legal`);
                  return;
                }
                router.push(`/business-settings/profile/shareholders?tab=${kind}`);
              }}
            >
              بازگشت
            </button>
          ) : null}
          <button type="button" className="profile-primary-button" onClick={step === 'representatives' ? finishLegalFlow : saveDetails}>
            {kind === 'legal' && step === 'details' && isLegalRegistrationFlow ? 'ثبت و ادامه' : 'ثبت'}
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
