'use client';

import { CalendarDays, Camera, Check, ChevronLeft, FileText, Mail, Pencil, Phone, Plus, Search, UserRound, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChoicePillsField, Input } from '@repo/ui';
import {
  buildRepresentativeFullName,
  fetchProfileStore,
  linkRepresentativeToLegalShareholder,
  normalizeEmail,
  normalizePhone,
  persistProfileStore,
  syncRepresentativeAcrossStore,
  upsertNaturalShareholder,
  upsertPrincipalPartner,
  upsertBoardMember,
  type RepresentativeCandidate,
  type RepresentativeRecord,
  upsertRepresentativeCandidate,
} from './profileStorage';
import { FormTextInput } from '../../../contracts/new/_components/ContractFormPrimitives';
import { PersonAvatar } from './ProfilePeoplePrimitives';

type FlowStep = 'lookup' | 'details';
type GenderValue = 'male' | 'female';
type NaturalShareholderStep = 'user' | 'extra';
type ContactFieldKey = 'mobile' | 'secondaryMobile' | 'email';

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

const genderOptions = [
  { value: 'male' as const, label: 'مرد' },
  { value: 'female' as const, label: 'زن' },
];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function isValidMobile(value: string) {
  const normalized = normalizePhone(value).replace(/^\+/, '');
  return normalized.length >= 10;
}

async function ensureUserAccount(payload: {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  mobile?: string;
  email?: string;
}) {
  const response = await fetch('/api/business-settings/profile/directory/ensure-user', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json().catch(() => null)) as {
    message?: string;
    user?: {
      id: string;
      fullName: string;
      firstName: string;
      lastName: string;
      email: string | null;
      mobile: string | null;
    };
  } | null;
  if (!response.ok) {
    throw new Error(result?.message ?? 'user_creation_failed');
  }

  if (!result?.user) {
    throw new Error('user_creation_failed');
  }

  return result.user;
}

function buildCandidateFromUser(user: {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string | null;
}): RepresentativeCandidate {
  return {
    id: user.id,
    fullName: user.fullName,
    firstName: user.firstName,
    lastName: user.lastName,
    gender: 'male',
    nationalId: '',
    mobile: user.mobile ?? '',
    secondaryMobile: '',
    email: user.email ?? '',
    avatarMode: 'ghost',
    avatarText: user.firstName.trim().slice(0, 1) || user.lastName.trim().slice(0, 1) || user.fullName.trim().slice(0, 1) || 'U',
    avatarImage: '',
    isPrimary: false,
    linkedUser: true,
    canEmail: Boolean(user.email),
  };
}

function getCandidateDisplayName(candidate: Pick<RepresentativeCandidate, 'fullName' | 'firstName' | 'lastName'> | null) {
  if (!candidate) return 'کاربر جدید';
  const fullName = candidate.fullName.trim();
  if (fullName) return fullName;
  const composedName = `${candidate.firstName?.trim() ?? ''} ${candidate.lastName?.trim() ?? ''}`.trim();
  return composedName || 'کاربر جدید';
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
  mode?: 'representative' | 'natural-shareholder' | 'partner' | 'board-member';
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
  const [editingContact, setEditingContact] = useState<ContactFieldKey | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [creatingLookupUser, setCreatingLookupUser] = useState(false);
  const [naturalStep, setNaturalStep] = useState<NaturalShareholderStep>('user');
  const [naturalShareholderId, setNaturalShareholderId] = useState<string | null>(null);
  const [naturalExtra, setNaturalExtra] = useState<NaturalShareholderExtraState>(emptyNaturalExtra);
  const isPersonStepperMode = mode === 'natural-shareholder' || mode === 'partner';
  const title =
    searchParams.get('title') ||
    (mode === 'natural-shareholder'
      ? '\u062b\u0628\u062a \u0633\u0647\u0627\u0645\u062f\u0627\u0631'
      : mode === 'partner'
        ? '\u062b\u0628\u062a \u0634\u0631\u06cc\u06a9'
        : mode === 'board-member'
          ? '\u0644\u06cc\u0633\u062a \u0647\u06cc\u0626\u062a \u0645\u062f\u06cc\u0631\u0647'
          : searchParams.get('shareholderId')
            ? '\u0644\u06cc\u0633\u062a \u0646\u0645\u0627\u06cc\u0646\u062f\u0647'
            : '\u0644\u06cc\u0633\u062a \u0646\u0645\u0627\u06cc\u0646\u062f\u0647');
  const subtitle =
    step === 'lookup'
      ? '\u062f\u0631 \u0627\u06cc\u0646 \u0628\u062e\u0634 \u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u06cc\u062f \u0627\u0637\u0644\u0627\u0639\u0627\u062a \u062a\u0645\u0627\u0633 \u0646\u0645\u0627\u06cc\u0646\u062f\u0647 \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646\u06cc\u062f'
      : isPersonStepperMode && naturalStep === 'extra'
        ? '\u062f\u0631 \u0627\u06cc\u0646 \u0628\u062e\u0634 \u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u06cc\u062f \u0627\u0637\u0644\u0627\u0639\u0627\u062a \u062a\u06a9\u0645\u06cc\u0644\u06cc \u0633\u0647\u0627\u0645\u062f\u0627\u0631 \u0631\u0627 \u0648\u0627\u0631\u062f \u06a9\u0646\u06cc\u062f'
        : '\u062f\u0631 \u0627\u06cc\u0646 \u0628\u062e\u0634 \u0645\u06cc\u200c\u062a\u0648\u0627\u0646\u06cc\u062f \u0627\u0637\u0644\u0627\u0639\u0627\u062a \u062a\u0645\u0627\u0633 \u0648 \u0646\u0627\u0645 \u0648 \u0646\u0627\u0645 \u062e\u0627\u0646\u0648\u0627\u062f\u06af\u06cc \u0631\u0627 \u062a\u063a\u06cc\u06cc\u0631 \u062f\u0647\u06cc\u062f';


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
  const isLookupCreateAction = isPersonStepperMode && !activeCandidate && (isValidMobile(query.trim()) || isValidEmail(query.trim()));

  const openDetailsStep = async () => {
    let source = activeCandidate;
    if (!source) {
      const raw = query.trim();
      if (!isValidMobile(raw) && !isValidEmail(raw)) return;
      setCreatingLookupUser(true);
      try {
        const user = await ensureUserAccount({
          mobile: isValidMobile(raw) ? normalizePhone(raw) : '',
          email: isValidEmail(raw) ? normalizeEmail(raw) : '',
        });
        source = buildCandidateFromUser(user);
        setDirectory((current) => {
          const exists = current.some((item) => item.id === source?.id);
          return exists ? current.map((item) => (item.id === source?.id ? { ...item, ...source! } : item)) : [...current, source!];
        });
        setSearchResults((current) => [source!, ...current.filter((item) => item.id !== source?.id)]);
        setSelected(source);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'ساخت کاربر انجام نشد.');
        setCreatingLookupUser(false);
        return;
      } finally {
        setCreatingLookupUser(false);
      }
    }

    const nextForm = normalizeRepresentativeForm(source, query.trim());
    setSubmitError(null);
    setForm(nextForm);
    setShowSecondaryMobile(Boolean(nextForm.secondaryMobile));
    setShowEmailField(Boolean(nextForm.email));
    setEditingContact(null);
    setNaturalStep('user');
    setNaturalExtra((current) => ({
      ...current,
      signatureAvatarText: nextForm.firstName.trim().slice(0, 1) || nextForm.lastName.trim().slice(0, 1) || 'ن',
    }));
    setStep('details');
  };

  const saveRepresentative = async () => {
    setSubmitError(null);
    if (!form.mobile.trim() && !form.email.trim()) {
      setSubmitError('حداقل یک راه ارتباطی وارد کنید.');
      return;
    }
    if (form.mobile.trim() && !isValidMobile(form.mobile)) {
      setSubmitError('شماره موبایل 1 معتبر نیست.');
      return;
    }
    if (form.secondaryMobile.trim() && !isValidMobile(form.secondaryMobile)) {
      setSubmitError('شماره موبایل 2 معتبر نیست.');
      return;
    }
    if (form.email.trim() && !isValidEmail(form.email)) {
      setSubmitError('ایمیل معتبر نیست.');
      return;
    }

    const normalizedMobileValue = normalizePhone(form.mobile);
    const normalizedEmailValue = normalizeEmail(form.email);
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const fullName = buildRepresentativeFullName(firstName, lastName, selected?.fullName);
    const avatarText = fullName.trim().slice(0, 1) || 'ن';
    let ensuredUser: Awaited<ReturnType<typeof ensureUserAccount>> | null = null;
    setSaving(true);
    try {
      ensuredUser = await ensureUserAccount({
        firstName,
        lastName,
        fullName,
        mobile: normalizedMobileValue,
        email: normalizedEmailValue,
      });
      if (!selected || selected.id !== ensuredUser.id) {
        setSelected(buildCandidateFromUser(ensuredUser));
      }
    } catch (error) {
      setSaving(false);
      setSubmitError(error instanceof Error ? error.message : 'ساخت کاربر انجام نشد.');
      return;
    }

    const candidate: RepresentativeCandidate = {
      id: ensuredUser?.id ?? selected?.id ?? `rep-${Date.now()}`,
      fullName,
      firstName,
      lastName,
      gender: form.gender,
      nationalId: form.nationalId.trim(),
      mobile: normalizedMobileValue,
      secondaryMobile: form.secondaryMobile ? normalizePhone(form.secondaryMobile) : '',
      email: normalizedEmailValue,
      avatarMode: form.avatarMode,
      avatarText,
      avatarImage: form.avatarImage,
      isPrimary: selected?.isPrimary ?? false,
      linkedUser: true,
      canEmail: Boolean(form.email.trim()),
    };
    try {
      const store = await fetchProfileStore();
      const withDirectory = upsertRepresentativeCandidate(store, candidate);
      const withRepresentative = syncRepresentativeAcrossStore(withDirectory, candidate);

      if (isPersonStepperMode) {
        const shareholderId = naturalShareholderId ?? ((mode === 'partner' ? 'principal-partner' : 'natural-shareholder') + '-' + Date.now());
        const personRecord = {
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
        };
        const nextStore =
          mode === 'partner' ? upsertPrincipalPartner(withRepresentative, personRecord) : upsertNaturalShareholder(withRepresentative, personRecord);
        await persistProfileStore(nextStore);
        setNaturalShareholderId(shareholderId);

        if (naturalStep === 'user') {
          setNaturalStep('extra');
        } else {
          router.push(searchParams.get('returnTo') || (mode === 'partner' ? '/business-settings/profile/partners' : '/business-settings/profile/shareholders?tab=natural'));
          router.refresh();
        }
        return;
      }

      const shareholderId = searchParams.get('shareholderId');
      const finalStore =
        mode === 'board-member'
          ? upsertBoardMember(withRepresentative, candidate)
          : shareholderId
            ? linkRepresentativeToLegalShareholder(withRepresentative, shareholderId, candidate)
            : withRepresentative;
      await persistProfileStore(finalStore);
      router.push(searchParams.get('returnTo') || (mode === 'board-member' ? '/business-settings/profile/board-members' : '/business-settings/profile/representatives'));
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
                    setSubmitError(null);
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
                      setSubmitError(null);
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
            {creatingLookupUser ? <div className="representative-picker-search-status">در حال ساخت کاربر...</div> : null}
            {submitError ? <p className="representative-submit-error">{submitError}</p> : null}
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
                  <strong>{getCandidateDisplayName(activeCandidate)}</strong>
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
            <button type="button" className="profile-primary-button is-wide" disabled={!canContinueLookup || creatingLookupUser} onClick={openDetailsStep}>
              {isLookupCreateAction ? 'ثبت جدید' : 'انتخاب و تایید'}
            </button>
          </div>
        </>
      ) : (
        <div className="representative-details-stage">
          {isPersonStepperMode ? (
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

          {!isPersonStepperMode || naturalStep === 'user' ? (
            <div className="representative-details-card">
              <div className="representative-contact-board">
                <ContactRow
                  label="موبایل 1"
                  value={form.mobile}
                  editing={editingContact === 'mobile'}
                  placeholder="+989123456789"
                  visualIcon={Phone}
                  actionIcon={editingContact === 'mobile' ? Check : Pencil}
                  onAction={() => setEditingContact((current) => (current === 'mobile' ? null : 'mobile'))}
                  onChange={(value) => setForm((current) => ({ ...current, mobile: value }))}
                />

                {showSecondaryMobile ? (
                  <ContactRow
                    label="موبایل 2"
                    value={form.secondaryMobile}
                    editing={editingContact === 'secondaryMobile'}
                    placeholder="+989123456780"
                    visualIcon={Phone}
                    actionIcon={editingContact === 'secondaryMobile' ? Check : Pencil}
                    onAction={() => setEditingContact((current) => (current === 'secondaryMobile' ? null : 'secondaryMobile'))}
                    secondaryActionIcon={X}
                    onSecondaryAction={() => {
                      setEditingContact((current) => (current === 'secondaryMobile' ? null : current));
                      setShowSecondaryMobile(false);
                      setForm((current) => ({ ...current, secondaryMobile: '' }));
                    }}
                    onChange={(value) => setForm((current) => ({ ...current, secondaryMobile: value }))}
                  />
                ) : (
                  <ContactAdder
                    label="موبایل 2"
                    onClick={() => {
                      setShowSecondaryMobile(true);
                      setEditingContact('secondaryMobile');
                    }}
                  />
                )}

                {showEmailField ? (
                  <ContactRow
                    label="ایمیل"
                    value={form.email}
                    editing={editingContact === 'email'}
                    placeholder="name@example.com"
                    visualIcon={Mail}
                    actionIcon={editingContact === 'email' ? Check : Pencil}
                    onAction={() => setEditingContact((current) => (current === 'email' ? null : 'email'))}
                    onChange={(value) => setForm((current) => ({ ...current, email: value }))}
                  />
                ) : (
                  <ContactAdder
                    label="ایمیل"
                    onClick={() => {
                      setShowEmailField(true);
                      setEditingContact('email');
                    }}
                  />
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

                <ChoicePillsField<GenderValue>
                  label="جنسیت"
                  options={genderOptions}
                  value={form.gender}
                  onChange={(value) => setForm((current) => ({ ...current, gender: value }))}
                  className="representative-gender-field"
                  labelClassName="representative-gender-label"
                  pillsClassName="representative-gender-pills"
                  pillClassName="representative-gender-pill"
                  showActiveIndicator
                />

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
          {submitError ? <p className="representative-submit-error">{submitError}</p> : null}
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
  editing,
  placeholder,
  visualIcon: VisualIcon,
  actionIcon: ActionIcon,
  onAction,
  secondaryActionIcon: SecondaryActionIcon,
  onSecondaryAction,
  onChange,
}: {
  label: string;
  value: string;
  editing?: boolean;
  placeholder?: string;
  visualIcon: typeof Phone | typeof Mail;
  actionIcon?: typeof Pencil;
  onAction?: () => void;
  secondaryActionIcon?: typeof X;
  onSecondaryAction?: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="representative-contact-row">
      <span className="representative-contact-visual" aria-hidden="true">
        <VisualIcon />
      </span>
      <div className="representative-contact-content">
        <div className="representative-contact-label">{label}</div>
        {editing ? (
          <div className="representative-contact-editor">
            <Input
              className="representative-contact-input"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={placeholder}
              dir="ltr"
              autoFocus
            />
          </div>
        ) : (
          <div className="representative-contact-value" dir="ltr">
            {value || '-'}
          </div>
        )}
      </div>
      <div className="representative-contact-side">
        {ActionIcon ? (
          <button type="button" className="representative-contact-action" onClick={onAction}>
            <ActionIcon />
          </button>
        ) : (
          <span className="representative-contact-action-placeholder" />
        )}
        {SecondaryActionIcon ? (
          <button type="button" className="representative-contact-action is-danger" onClick={onSecondaryAction}>
            <SecondaryActionIcon />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function ContactAdder({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="representative-contact-adder" onClick={onClick}>
      <span className="representative-contact-visual" aria-hidden="true">
        <Plus />
      </span>
      <div className="representative-contact-content">
        <strong className="representative-contact-label">{label}</strong>
        <span className="representative-contact-placeholder">-</span>
      </div>
      <span className="representative-contact-adder-icon">
        <Plus />
      </span>
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
      <Input className="representative-inline-input" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
