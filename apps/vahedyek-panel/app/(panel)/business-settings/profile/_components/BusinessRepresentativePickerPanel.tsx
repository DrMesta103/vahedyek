'use client';

import { CalendarDays, Camera, ChevronLeft, FileText, Mail, Pencil, Phone, Plus, Search, UserRound, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  buildRepresentativeFullName,
  fetchProfileStore,
  linkRepresentativeToLegalShareholder,
  normalizeEmail,
  normalizePhone,
  persistProfileStore,
  syncRepresentativeAcrossStore,
  upsertNaturalShareholder,
  type RepresentativeCandidate,
  type RepresentativeRecord,
  upsertRepresentativeCandidate,
} from './profileStorage';
import { FormTextInput, TagPill } from '../../../contracts/new/_components/ContractFormPrimitives';
import { PersonAvatar } from './ProfilePeoplePrimitives';

type FlowStep = 'lookup' | 'details';
type GenderValue = 'male' | 'female';
type NaturalShareholderStep = 'user' | 'extra';

type RepresentativeFormState = {
  firstName: string;
  lastName: string;
  gender: GenderValue;
  nationalId: string;
  mobile: string;
  secondaryMobile: string;
  email: string;
  avatarMode: RepresentativeRecord['avatarMode'];
  avatarText: string;
  avatarImage: string;
};

type NaturalShareholderExtraState = {
  mandateEndDate: string;
  signatureAvatarMode: RepresentativeRecord['avatarMode'];
  signatureAvatarText: string;
  signatureAvatarImage: string;
};

const emptyForm: RepresentativeFormState = {
  firstName: '',
  lastName: '',
  gender: 'male',
  nationalId: '',
  mobile: '',
  secondaryMobile: '',
  email: '',
  avatarMode: 'ghost',
  avatarText: 'ن',
  avatarImage: '',
};

const emptyNaturalExtra: NaturalShareholderExtraState = {
  mandateEndDate: '',
  signatureAvatarMode: 'badge',
  signatureAvatarText: 'ن',
  signatureAvatarImage: '',
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function isValidMobile(value: string) {
  const normalized = normalizePhone(value).replace(/^\+/, '');
  return normalized.length >= 10;
}

function normalizeRepresentativeForm(candidate: RepresentativeCandidate | null, identity: string): RepresentativeFormState {
  if (candidate) {
    const nameParts = candidate.fullName.trim().split(/\s+/);
    return {
      firstName: candidate.firstName ?? nameParts[0] ?? '',
      lastName: candidate.lastName ?? nameParts.slice(1).join(' '),
      gender: candidate.gender ?? 'male',
      nationalId: candidate.nationalId ?? '',
      mobile: candidate.mobile,
      secondaryMobile: candidate.secondaryMobile ?? '',
      email: candidate.email,
      avatarMode: candidate.avatarMode,
      avatarText: candidate.avatarText,
      avatarImage: candidate.avatarImage ?? '',
    };
  }

  const identityIsEmail = isValidEmail(identity);
  return {
    ...emptyForm,
    mobile: identityIsEmail ? '' : normalizePhone(identity),
    email: identityIsEmail ? normalizeEmail(identity) : '',
  };
}

export function BusinessRepresentativePickerPanel({
  mode = 'representative',
}: {
  mode?: 'representative' | 'natural-shareholder';
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const signatureInputRef = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState<FlowStep>('lookup');
  const [query, setQuery] = useState('');
  const [directory, setDirectory] = useState<RepresentativeCandidate[]>([]);
  const [searchResults, setSearchResults] = useState<RepresentativeCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<RepresentativeCandidate | null>(null);
  const [form, setForm] = useState<RepresentativeFormState>(emptyForm);
  const [showSecondaryMobile, setShowSecondaryMobile] = useState(false);
  const [showEmailField, setShowEmailField] = useState(false);
  const [allowPrimaryMobileEdit, setAllowPrimaryMobileEdit] = useState(true);
  const [saving, setSaving] = useState(false);
  const [naturalStep, setNaturalStep] = useState<NaturalShareholderStep>('user');
  const [naturalShareholderId, setNaturalShareholderId] = useState<string | null>(null);
  const [naturalExtra, setNaturalExtra] = useState<NaturalShareholderExtraState>(emptyNaturalExtra);
  const title =
    searchParams.get('title') ||
    (mode === 'natural-shareholder' ? 'ثبت سهامدار' : searchParams.get('shareholderId') ? 'لیست نماینده' : 'لیست نماینده');
  const subtitle =
    step === 'lookup'
      ? 'در این بخش می‌توانید اطلاعات تماس نماینده را وارد کنید'
      : mode === 'natural-shareholder' && naturalStep === 'extra'
        ? 'در این بخش می‌توانید اطلاعات تکمیلی سهامدار را وارد کنید'
        : 'در این بخش می‌توانید اطلاعات تماس و نام و نام خانوادگی را تغییر دهید';

  useEffect(() => {
    let ignore = false;

    fetchProfileStore().then((store) => {
      if (ignore) return;
      setDirectory(store.directory);
    });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const raw = query.trim();
    if (!raw) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/business-settings/profile/directory?q=${encodeURIComponent(raw)}`, {
          cache: 'no-store',
          credentials: 'same-origin',
        });
        if (!response.ok) {
          setSearchResults([]);
          return;
        }
        const payload = (await response.json()) as { items?: RepresentativeCandidate[] };
        setSearchResults(Array.isArray(payload.items) ? payload.items : []);
      } finally {
        setSearching(false);
      }
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const normalizedQuery = normalizePhone(query);
  const normalizedEmailQuery = normalizeEmail(query);
  const matchedCandidates = useMemo(() => {
    const raw = query.trim();
    if (!raw) return [];
    if (searchResults.length) return searchResults;

    return directory.filter((item) => {
      const mobileMatches = normalizePhone(item.mobile).includes(normalizedQuery) || normalizePhone(item.secondaryMobile ?? '').includes(normalizedQuery);
      const emailMatches = normalizeEmail(item.email).includes(normalizedEmailQuery);
      const nameMatches = item.fullName.includes(raw);
      return mobileMatches || emailMatches || nameMatches;
    });
  }, [directory, normalizedEmailQuery, normalizedQuery, query, searchResults]);

  const canContinueLookup = Boolean(selected) || isValidMobile(query) || isValidEmail(query);
  const exactCandidate =
    matchedCandidates.find(
      (item) => normalizePhone(item.mobile) === normalizedQuery || normalizeEmail(item.email) === normalizedEmailQuery,
    ) ?? null;
  const activeCandidate = selected ?? exactCandidate;

  const openDetailsStep = () => {
    const source = activeCandidate;
    const nextForm = normalizeRepresentativeForm(source, query.trim());
    setForm(nextForm);
    setShowSecondaryMobile(Boolean(nextForm.secondaryMobile));
    setShowEmailField(Boolean(nextForm.email));
    setAllowPrimaryMobileEdit(!source);
    setNaturalStep('user');
    setNaturalExtra((current) => ({
      ...current,
      signatureAvatarText: nextForm.firstName.trim().slice(0, 1) || nextForm.lastName.trim().slice(0, 1) || 'ن',
    }));
    setStep('details');
  };

  const saveRepresentative = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.nationalId.trim()) return;
    if (!form.mobile.trim() && !form.email.trim()) return;
    if (form.mobile.trim() && !isValidMobile(form.mobile)) return;
    if (form.secondaryMobile.trim() && !isValidMobile(form.secondaryMobile)) return;
    if (form.email.trim() && !isValidEmail(form.email)) return;

    const fullName = buildRepresentativeFullName(form.firstName, form.lastName, selected?.fullName);
    const avatarText = fullName.trim().slice(0, 1) || 'ن';
    const candidate: RepresentativeCandidate = {
      id: selected?.id ?? `rep-${Date.now()}`,
      fullName,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      nationalId: form.nationalId.trim(),
      mobile: normalizePhone(form.mobile),
      secondaryMobile: form.secondaryMobile ? normalizePhone(form.secondaryMobile) : '',
      email: normalizeEmail(form.email),
      avatarMode: form.avatarMode,
      avatarText,
      avatarImage: form.avatarImage,
      isPrimary: selected?.isPrimary ?? false,
      linkedUser: selected?.linkedUser ?? false,
      canEmail: Boolean(form.email.trim()),
    };

    setSaving(true);
    try {
      const store = await fetchProfileStore();
      const withDirectory = upsertRepresentativeCandidate(store, candidate);
      const withRepresentative = syncRepresentativeAcrossStore(withDirectory, candidate);

      if (mode === 'natural-shareholder') {
        const shareholderId = naturalShareholderId ?? `natural-shareholder-${Date.now()}`;
        await persistProfileStore(
          upsertNaturalShareholder(withRepresentative, {
            id: shareholderId,
            fullName,
            mobile: candidate.mobile,
            email: candidate.email,
            avatarMode: candidate.avatarMode,
            avatarText,
            avatarImage: candidate.avatarImage,
            sharePercent: '0',
            mandateEndDate: naturalExtra.mandateEndDate,
            signatureAvatarMode: naturalExtra.signatureAvatarMode,
            signatureAvatarText: naturalExtra.signatureAvatarText || avatarText,
            signatureAvatarImage: naturalExtra.signatureAvatarImage,
          }),
        );
        setNaturalShareholderId(shareholderId);

        if (naturalStep === 'user') {
          setNaturalStep('extra');
        } else {
          router.push(searchParams.get('returnTo') || '/business-settings/profile/shareholders?tab=natural');
          router.refresh();
        }
        return;
      }

      const shareholderId = searchParams.get('shareholderId');
      const finalStore = shareholderId ? linkRepresentativeToLegalShareholder(withRepresentative, shareholderId, candidate) : withRepresentative;
      await persistProfileStore(finalStore);
      router.push(searchParams.get('returnTo') || '/business-settings/profile/representatives');
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const readAvatarFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result ?? '');
      setForm((current) => ({
        ...current,
        avatarMode: 'image',
        avatarImage: image,
      }));
    };
    reader.readAsDataURL(file);
  };

  const readSignatureFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result ?? '');
      setNaturalExtra((current) => ({
        ...current,
        signatureAvatarMode: 'image',
        signatureAvatarImage: image,
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="representative-picker-page" aria-label="افزودن نماینده قانونی">
      <div className="representative-flow-header">
        <h1>{title}</h1>
        {step === 'details' ? <p>{subtitle}</p> : null}
      </div>

      {step === 'lookup' ? (
        <>
          <div className="representative-picker-card representative-picker-stage-card">
            <div className="representative-picker-logo" aria-hidden="true">
              <span>1</span>
            </div>

            <label className="profile-form-field representative-picker-field">
              <span>
                موبایل یا ایمیل
                <i>*</i>
              </span>
              <div className="representative-picker-input-wrap">
                <FormTextInput
                  value={query}
                  onChange={(value) => {
                    setQuery(value.slice(0, 50));
                    setSelected(null);
                  }}
                  icon={Search}
                />
                {query ? (
                  <button
                    type="button"
                    className="representative-picker-clear"
                    aria-label="پاک کردن"
                    onClick={() => {
                      setQuery('');
                      setSelected(null);
                    }}
                  >
                    <X />
                  </button>
                ) : null}
              </div>
              <small>وارد کردن شماره موبایل یا ایمیل برای ثبت کاربر ضروری میباشد .</small>
            </label>

            {!selected && matchedCandidates.length ? (
              <div className="representative-picker-suggestions">
                {matchedCandidates.slice(0, 5).map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    className="representative-picker-suggestion"
                    onClick={() => {
                      setSelected(candidate);
                      setQuery(candidate.mobile || candidate.email);
                    }}
                  >
                    {candidate.mobile || candidate.email}
                  </button>
                ))}
              </div>
            ) : null}
            {searching ? <div className="representative-picker-search-status">در حال جستجو...</div> : null}
          </div>

          {activeCandidate ? (
            <div className="representative-picker-selection-shell">
              <button
                type="button"
                className={`representative-picker-selection-card${selected?.id === activeCandidate.id ? ' is-selected' : ''}`}
                onClick={() => setSelected(activeCandidate)}
              >
                <div className="representative-picker-selection-avatar">
                  <PersonAvatar
                    avatarMode={activeCandidate.avatarMode}
                    avatarText={activeCandidate.avatarText}
                    avatarImage={activeCandidate.avatarImage}
                    kind="person"
                  />
                </div>
                <div className="representative-picker-selection-meta">
                  <strong>{activeCandidate.fullName}</strong>
                  <span dir="ltr">{activeCandidate.mobile}</span>
                  <div className="representative-picker-selection-contact">
                    <span dir="ltr">
                      <Phone />
                      {activeCandidate.mobile}
                    </span>
                    {activeCandidate.email ? (
                      <span dir="ltr">
                        <Mail />
                        {activeCandidate.email}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="representative-picker-selection-badge">
                  <Camera />
                </div>
              </button>
            </div>
          ) : null}

          <div className="representative-picker-submit">
            <button type="button" className="profile-primary-button is-wide" disabled={!canContinueLookup} onClick={openDetailsStep}>
              انتخاب و تایید
            </button>
          </div>
        </>
      ) : (
        <div className="representative-details-stage">
          {mode === 'natural-shareholder' ? (
            <NaturalShareholderSteps activeStep={naturalStep} />
          ) : (
            <div className="representative-flow-steps" aria-label="مراحل افزودن کاربر">
              <div className="representative-flow-step">
                <span className="representative-flow-icon is-muted">
                  <Phone />
                </span>
                <strong>اطلاعات تکمیلی</strong>
              </div>
              <div className="representative-flow-step is-active">
                <span className="representative-flow-icon">
                  <UserRound />
                </span>
                <strong>اطلاعات پایه</strong>
              </div>
            </div>
          )}

          {mode !== 'natural-shareholder' || naturalStep === 'user' ? (
            <div className="representative-details-card">
              <div className="representative-contact-board">
                <ContactRow
                  label="موبایل 1"
                  value={form.mobile}
                  editable={allowPrimaryMobileEdit}
                  placeholder="+989123456789"
                  actionIcon={allowPrimaryMobileEdit ? undefined : Pencil}
                  onAction={() => setAllowPrimaryMobileEdit(true)}
                  onChange={(value) => setForm((current) => ({ ...current, mobile: value }))}
                />

                {showSecondaryMobile ? (
                  <ContactRow
                    label="موبایل 2"
                    value={form.secondaryMobile}
                    editable
                    placeholder="+989123456780"
                    countryCode="+98"
                    onChange={(value) => setForm((current) => ({ ...current, secondaryMobile: value }))}
                  />
                ) : (
                  <ContactAdder label="موبایل 2" onClick={() => setShowSecondaryMobile(true)} />
                )}

                {showEmailField ? (
                  <ContactRow
                    label="ایمیل"
                    value={form.email}
                    editable
                    placeholder="name@example.com"
                    onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                  />
                ) : (
                  <ContactAdder label="ایمیل" onClick={() => setShowEmailField(true)} />
                )}
              </div>

              <div className="representative-details-form-shell">
                <div className="shareholder-editor-avatar representative-details-avatar">
                  <PersonAvatar
                    avatarMode={form.avatarMode}
                    avatarText={form.avatarText || (form.firstName.trim().slice(0, 1) || 'ن')}
                    avatarImage={form.avatarImage}
                    kind="person"
                    size="large"
                  />
                  <button type="button" className="shareholder-avatar-upload" onClick={() => fileInputRef.current?.click()}>
                    <Camera />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(event) => readAvatarFile(event.target.files?.[0] ?? null)} />
                </div>

                <div className="representative-gender-field">
                  <span>جنسیت</span>
                  <div className="representative-gender-chips">
                    <TagPill label="مرد" active={form.gender === 'male'} onClick={() => setForm((current) => ({ ...current, gender: 'male' }))} />
                    <TagPill label="زن" active={form.gender === 'female'} onClick={() => setForm((current) => ({ ...current, gender: 'female' }))} />
                  </div>
                </div>

                <div className="representative-details-grid">
                  <FieldInput label="نام" required value={form.firstName} onChange={(value) => setForm((current) => ({ ...current, firstName: value }))} />
                  <FieldInput
                    label="نام خانوادگی"
                    required
                    value={form.lastName}
                    onChange={(value) => setForm((current) => ({ ...current, lastName: value }))}
                  />
                  <FieldInput
                    label="کد ملی"
                    required
                    value={form.nationalId}
                    onChange={(value) => setForm((current) => ({ ...current, nationalId: value }))}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="representative-details-card">
              <div className="representative-extra-stack">
                <label className="representative-inline-field representative-extra-date-field">
                  <span>پایان دوره نمایندگی</span>
                  <div className="representative-inline-input-shell representative-date-shell">
                    <span className="representative-date-icon">
                      <CalendarDays />
                    </span>
                    <input
                      className="app-control"
                      value={naturalExtra.mandateEndDate}
                      onChange={(event) => setNaturalExtra((current) => ({ ...current, mandateEndDate: event.target.value }))}
                      placeholder="انتخاب تاریخ"
                    />
                  </div>
                  <small>در این بخش می‌توانید پایان اعتبار نمایندگی را وارد کنید.</small>
                </label>

                <button type="button" className="representative-extra-link-card is-highlighted">
                  <div className="representative-extra-link-copy">
                    <strong>راه‌های ارتباطی</strong>
                    <p>تمام راه‌های ارتباطی سهامدار را می‌توانید در این بخش وارد کنید</p>
                  </div>
                  <div className="representative-extra-link-art">CONTACT</div>
                  <ChevronLeft />
                </button>

                <button type="button" className="representative-extra-link-card">
                  <div className="representative-extra-link-copy">
                    <strong>مدارک</strong>
                    <p>در این بخش می‌توانید مدارک سهامدار را ثبت و مدیریت کنید</p>
                  </div>
                  <FileText />
                  <ChevronLeft />
                </button>

                <div className="representative-signature-card">
                  <strong>امضای دیجیتال سهامدار</strong>
                  <div className="representative-signature-avatar">
                    <PersonAvatar
                      avatarMode={naturalExtra.signatureAvatarMode}
                      avatarText={naturalExtra.signatureAvatarText}
                      avatarImage={naturalExtra.signatureAvatarImage}
                      kind="person"
                      size="large"
                    />
                    <button type="button" className="shareholder-avatar-upload" onClick={() => signatureInputRef.current?.click()}>
                      <Camera />
                    </button>
                    <input
                      ref={signatureInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(event) => readSignatureFile(event.target.files?.[0] ?? null)}
                    />
                  </div>
                  <p>امضای دیجیتال سهامدار را برای استفاده در اسناد رسمی بارگذاری کنید</p>
                </div>
              </div>
            </div>
          )}

          <div className="representative-details-actions">
            <button type="button" className="profile-primary-button" disabled={saving} onClick={saveRepresentative}>
              ثبت اطلاعات
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function NaturalShareholderSteps({ activeStep }: { activeStep: NaturalShareholderStep }) {
  return (
    <div className="shareholder-steps" aria-label="مراحل ثبت سهامدار حقیقی">
      <div className={`shareholder-step ${activeStep === 'user' ? 'is-active' : ''}`}>
        <span>1</span>
        <strong>اطلاعات کاربر</strong>
      </div>
      <div className={`shareholder-step ${activeStep === 'extra' ? 'is-active' : ''}`}>
        <span>2</span>
        <strong>اطلاعات تکمیلی</strong>
      </div>
    </div>
  );
}

function ContactRow({
  label,
  value,
  editable,
  placeholder,
  countryCode,
  actionIcon: ActionIcon,
  onAction,
  onChange,
}: {
  label: string;
  value: string;
  editable?: boolean;
  placeholder?: string;
  countryCode?: string;
  actionIcon?: typeof Pencil;
  onAction?: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="representative-contact-row">
      <div className="representative-contact-value">
        {ActionIcon ? (
          <button type="button" className="representative-contact-action" onClick={onAction}>
            <ActionIcon />
          </button>
        ) : (
          <span className="representative-contact-action-placeholder" />
        )}
        {countryCode ? <span className="representative-contact-prefix">{countryCode}</span> : null}
        <input
          className="representative-contact-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          readOnly={!editable}
          placeholder={placeholder}
          dir="ltr"
        />
      </div>
      <div className="representative-contact-label">{label}</div>
    </div>
  );
}

function ContactAdder({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="representative-contact-adder" onClick={onClick}>
      <span className="representative-contact-adder-icon">
        <Plus />
      </span>
      <span className="representative-contact-adder-dash">---</span>
      <strong>{label}</strong>
    </button>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="representative-inline-field">
      <span>
        {label}
        {required ? <i>*</i> : null}
      </span>
      <div className="representative-inline-input-shell">
        <button type="button" className="representative-inline-input-clear" aria-label="پاک کردن" onClick={() => onChange('')}>
          <X />
        </button>
        <input className="app-control" value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}
