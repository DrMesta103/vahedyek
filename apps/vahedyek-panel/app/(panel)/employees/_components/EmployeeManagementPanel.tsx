'use client';

import { Camera, Check, Mail, Pencil, Phone, Search, UserRound, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@repo/ui';
import { FormTextInput } from '../../contracts/new/_components/ContractFormPrimitives';
import { PersonAvatar } from '../../business-settings/profile/_components/ProfilePeoplePrimitives';

type FlowStep = 'lookup' | 'details';
type ContactFieldKey = 'mobile' | 'secondaryMobile' | 'email';

type DirectoryCandidate = {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  mobile: string;
  secondaryMobile?: string;
  email: string;
  avatarMode: 'image' | 'badge' | 'ghost';
  avatarText: string;
  avatarImage?: string;
};

type EmployeeFormState = {
  firstName: string;
  lastName: string;
  nationalCode: string;
  mobile: string;
  secondaryMobile: string;
  email: string;
  avatarMode: DirectoryCandidate['avatarMode'];
  avatarText: string;
  avatarImage: string;
};

const emptyForm: EmployeeFormState = {
  firstName: '',
  lastName: '',
  nationalCode: '',
  mobile: '',
  secondaryMobile: '',
  email: '',
  avatarMode: 'ghost',
  avatarText: 'ک',
  avatarImage: '',
};

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0098')) return `+98${digits.slice(4)}`;
  if (digits.startsWith('98')) return `+98${digits.slice(2)}`;
  if (digits.startsWith('0')) return `+98${digits.slice(1)}`;
  if (digits.startsWith('9')) return `+98${digits}`;
  return value.trim();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function isValidMobile(value: string) {
  return /^9\d{9}$/.test(normalizePhone(value).replace(/^\+98/, ''));
}

function normalizeNationalCode(value: string) {
  return value.replace(/\D/g, '').slice(0, 10);
}

function isValidNationalCode(value: string) {
  return /^\d{10}$/.test(normalizeNationalCode(value));
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

  if (!response.ok || !result?.user) {
    throw new Error(result?.message ?? 'ساخت کاربر انجام نشد.');
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
}): DirectoryCandidate {
  return {
    id: user.id,
    fullName: user.fullName,
    firstName: user.firstName,
    lastName: user.lastName,
    mobile: user.mobile ?? '',
    secondaryMobile: '',
    email: user.email ?? '',
    avatarMode: 'ghost',
    avatarText: user.firstName.trim().slice(0, 1) || user.lastName.trim().slice(0, 1) || user.fullName.trim().slice(0, 1) || 'ک',
    avatarImage: '',
  };
}

function normalizeForm(candidate: DirectoryCandidate | null, identity: string): EmployeeFormState {
  if (candidate) {
    const nameParts = candidate.fullName.trim().split(/\s+/);
    return {
      firstName: candidate.firstName ?? nameParts[0] ?? '',
      lastName: candidate.lastName ?? nameParts.slice(1).join(' '),
      nationalCode: '',
      mobile: candidate.mobile,
      secondaryMobile: candidate.secondaryMobile ?? '',
      email: candidate.email,
      avatarMode: candidate.avatarMode,
      avatarText: candidate.avatarText,
      avatarImage: candidate.avatarImage ?? '',
    };
  }

  const normalizedIdentity = identity.trim();
  const identityIsEmail = isValidEmail(normalizedIdentity);
  return {
    ...emptyForm,
    mobile: identityIsEmail ? '' : normalizePhone(normalizedIdentity),
    email: identityIsEmail ? normalizeEmail(normalizedIdentity) : '',
  };
}

export function EmployeeManagementPanel() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [step, setStep] = useState<FlowStep>('lookup');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DirectoryCandidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<DirectoryCandidate | null>(null);
  const [form, setForm] = useState<EmployeeFormState>(emptyForm);
  const [showSecondaryMobile, setShowSecondaryMobile] = useState(false);
  const [showEmailField, setShowEmailField] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactFieldKey | null>(null);
  const [creatingLookupUser, setCreatingLookupUser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const raw = query.trim();
    if (!raw) {
      setResults([]);
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
          setResults([]);
          return;
        }

        const payload = (await response.json()) as { items?: DirectoryCandidate[] };
        setResults(Array.isArray(payload.items) ? payload.items : []);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const normalizedQuery = normalizePhone(query);
  const normalizedEmailQuery = normalizeEmail(query);
  const activeCandidate = useMemo(() => {
    if (selected) return selected;
    return (
      results.find(
        (item) => normalizePhone(item.mobile) === normalizedQuery || normalizeEmail(item.email) === normalizedEmailQuery,
      ) ?? null
    );
  }, [normalizedEmailQuery, normalizedQuery, results, selected]);

  const canContinueLookup = Boolean(activeCandidate) || isValidMobile(query) || isValidEmail(query);
  const isLookupCreateAction = !activeCandidate && (isValidMobile(query.trim()) || isValidEmail(query.trim()));

  const openDetailsStep = async () => {
    let source = activeCandidate;
    if (!source) {
      const raw = query.trim();
      if (!isValidMobile(raw) && !isValidEmail(raw)) return;
      const nextForm = normalizeForm(null, raw);
      setForm(nextForm);
      setShowSecondaryMobile(Boolean(nextForm.secondaryMobile));
      setShowEmailField(Boolean(nextForm.email));
      setEditingContact(null);
      setSubmitError(null);
      setStep('details');
      return;

      /*
      setCreatingLookupUser(true);
      try {
        const user = await ensureUserAccount({
          mobile: isValidMobile(raw) ? normalizePhone(raw) : '',
          email: isValidEmail(raw) ? normalizeEmail(raw) : '',
        });
        source = buildCandidateFromUser(user);
        setSelected(source);
        setResults((current) => [source!, ...current.filter((item) => item.id !== source!.id)]);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'ساخت کاربر انجام نشد.');
        setCreatingLookupUser(false);
        return;
      } finally {
        setCreatingLookupUser(false);
      }
      */
    }

    const nextForm = normalizeForm(source, query.trim());
    setForm(nextForm);
    setShowSecondaryMobile(Boolean(nextForm.secondaryMobile));
    setShowEmailField(Boolean(nextForm.email));
    setEditingContact(null);
    setSubmitError(null);
    setStep('details');
  };

  const saveEmployee = async () => {
    setSubmitError(null);

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setSubmitError('نام و نام خانوادگی الزامی است.');
      return;
    }

    if (!isValidNationalCode(form.nationalCode)) {
      setSubmitError('کد ملی باید ۱۰ رقم باشد.');
      return;
    }

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

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const nationalCode = normalizeNationalCode(form.nationalCode);
    const mobile = normalizePhone(form.mobile);
    const email = normalizeEmail(form.email);

    setSaving(true);
    try {
      const user = await ensureUserAccount({
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        mobile,
        email,
      });

      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          firstName,
          lastName,
          nationalCode,
          mobile,
          email,
          avatarUrl: form.avatarImage,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.error ?? payload?.message ?? 'ثبت کارمند انجام نشد.');
      }

      router.push('/employees');
      router.refresh();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'ثبت کارمند انجام نشد.');
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

  return (
    <section className="representative-picker-page" aria-label="افزودن کارمند">
      <div className="representative-flow-header">
        <h1>ثبت کارمند</h1>
        {step === 'details' ? <p>در این بخش می‌توانید اطلاعات پایه کارمند را با همان فلو مدیریت کاربر تکمیل کنید.</p> : null}
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
                    setQuery(value.slice(0, 80));
                    setSelected(null);
                    setResults([]);
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
              <small>با موبایل یا ایمیل، کاربر پیدا می‌شود یا در صورت نبودن، همان‌جا ساخته می‌شود.</small>
            </label>

            {!selected && results.length ? (
              <div className="representative-picker-suggestions">
                {results.slice(0, 5).map((candidate) => (
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
                  <strong>{activeCandidate.fullName || 'کاربر جدید'}</strong>
                  <span dir="ltr">{activeCandidate.mobile || activeCandidate.email}</span>
                  <div className="representative-picker-selection-contact">
                    {activeCandidate.mobile ? (
                      <span dir="ltr">
                        <Phone />
                        {activeCandidate.mobile}
                      </span>
                    ) : null}
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
          <EmployeeManagementSteps activeStep={step} />

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
                  avatarText={form.avatarText || (form.firstName.trim().slice(0, 1) || 'ک')}
                  avatarImage={form.avatarImage}
                  kind="person"
                  size="large"
                />
                <button type="button" className="shareholder-avatar-upload" onClick={() => fileInputRef.current?.click()}>
                  <Camera />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(event) => readAvatarFile(event.target.files?.[0] ?? null)} />
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
                  dir="ltr"
                  inputMode="numeric"
                  value={form.nationalCode}
                  onChange={(value) => setForm((current) => ({ ...current, nationalCode: normalizeNationalCode(value) }))}
                />
              </div>
            </div>
          </div>

          <div className="representative-details-actions">
            <button type="button" className="profile-primary-button" disabled={saving} onClick={saveEmployee}>
              {saving ? 'در حال ثبت...' : 'ثبت کارمند'}
            </button>
          </div>
          {submitError ? <p className="representative-submit-error">{submitError}</p> : null}
        </div>
      )}
    </section>
  );
}

function EmployeeManagementSteps({ activeStep }: { activeStep: FlowStep }) {
  return (
    <div className="shareholder-steps" aria-label="مراحل ثبت کارمند">
      <div className={`shareholder-step ${activeStep === 'lookup' ? 'is-active' : ''}`}>
        <span>1</span>
        <strong>شناسایی کاربر</strong>
      </div>
      <div className={`shareholder-step ${activeStep === 'details' ? 'is-active' : ''}`}>
        <span>2</span>
        <strong>اطلاعات کارمند</strong>
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
  actionIcon?: typeof Pencil | typeof Check;
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
        <UserRound />
      </span>
      <div className="representative-contact-content">
        <strong className="representative-contact-label">{label}</strong>
        <span className="representative-contact-placeholder">-</span>
      </div>
      <span className="representative-contact-adder-icon">
        <Pencil />
      </span>
    </button>
  );
}

function FieldInput({
  label,
  value,
  onChange,
  required,
  dir,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  dir?: 'rtl' | 'ltr';
  inputMode?: 'text' | 'numeric';
}) {
  return (
    <label className="representative-inline-field">
      <span>
        {label}
        {required ? <i>*</i> : null}
      </span>
      <Input className="representative-inline-input" value={value} onChange={(event) => onChange(event.target.value)} dir={dir} inputMode={inputMode} />
    </label>
  );
}
