'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { Camera, Layers, Pencil, Plus, Search, Square, X } from 'lucide-react';
import { ModulePageHeader } from '../../../../components/module-page/ModulePageHeader';
import { createEmployeeAction } from '../../../../lib/actions';
import { isNationalIdValid, parseContactInput } from '../../../../lib/parse-contact';

type WizardStep = 'lookup' | 'basic' | 'additional';

const maritalStatusOptions = [
  { value: 'single', label: 'مجرد' },
  { value: 'married', label: 'متاهل' },
  { value: 'divorced', label: 'جداشده' },
] as const;

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function PhotoUploadCircle({
  label,
  imageUrl,
  onPick,
  inputId,
}: {
  label: string;
  imageUrl: string;
  onPick: (file: File | null) => void;
  inputId: string;
}) {
  return (
    <div className="employee-add-photo-field">
      <span className="employee-add-field-label">{label}</span>
      <div className="employee-add-photo-wrap">
        <div className="employee-add-photo-circle" aria-hidden>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" />
          ) : (
            <Layers className="h-9 w-9 opacity-80" strokeWidth={1.6} />
          )}
        </div>
        <label htmlFor={inputId} className="employee-add-photo-camera" aria-label={`بارگذاری ${label}`}>
          <Camera className="h-4 w-4" strokeWidth={2.2} />
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => onPick(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>
    </div>
  );
}

export function AddEmployeeFlow() {
  const [step, setStep] = useState<WizardStep>('lookup');
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [contactLookup, setContactLookup] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [mobile1, setMobile1] = useState('');
  const [mobile2, setMobile2] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [identityPhotoUrl, setIdentityPhotoUrl] = useState('');
  const [personnelCode, setPersonnelCode] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [childrenCount, setChildrenCount] = useState('0');
  const [canEditIdentityPhoto, setCanEditIdentityPhoto] = useState(false);

  const parsedContact = useMemo(() => parseContactInput(contactLookup), [contactLookup]);
  const nationalIdError = nationalId.trim() && !isNationalIdValid(nationalId) ? 'کد ملی باید ۱۰ رقم باشد.' : '';

  const breadcrumbs =
    step === 'lookup'
      ? [
          { label: 'دسترنج', href: '/' },
          { label: 'تنظیمات کسب و کار', href: '/business-settings' },
          { label: 'کارمندان', href: '/employees' },
          { label: 'افزودن کارمند' },
        ]
      : [
          { label: 'دسترنج', href: '/' },
          { label: 'تنظیمات کسب و کار', href: '/business-settings' },
          { label: 'کارمندان', href: '/employees' },
          { label: 'افزودن کارمند', href: '/employees/new' },
          { label: 'تکمیل اطلاعات کارمند' },
        ];

  const pageTitle = step === 'lookup' ? 'افزودن کارمند' : 'تکمیل اطلاعات کارمند';

  const handleLookupConfirm = () => {
    if (!parsedContact.isValid || !parsedContact.normalizedValue || !parsedContact.type) return;
    if (parsedContact.type === 'email') {
      setEmail(parsedContact.normalizedValue);
      setMobile1('');
    } else {
      setMobile1(parsedContact.normalizedValue);
    }
    setStep('basic');
  };

  const handleBack = () => {
    if (step === 'additional') {
      setStep('basic');
      return;
    }
    if (step === 'basic') {
      setStep('lookup');
    }
  };

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim() || !nationalId.trim() || nationalIdError) return;
    startTransition(() => {
      formRef.current?.requestSubmit();
    });
  };

  const uploadAvatar = async (file: File | null) => {
    if (!file) return;
    setAvatarUrl(await readFileAsDataUrl(file));
  };

  const uploadIdentityPhoto = async (file: File | null) => {
    if (!file) return;
    setIdentityPhotoUrl(await readFileAsDataUrl(file));
  };

  return (
    <div className="employee-add-page">
      <ModulePageHeader
        breadcrumbs={breadcrumbs}
        title={pageTitle}
        onTitleClick={step === 'lookup' ? undefined : handleBack}
      />

      {step === 'lookup' ? (
        <div className="employee-add-lookup-shell">
          <div className="employee-add-card employee-add-lookup-card">
            <div className="employee-add-brand" aria-hidden>
              <Layers className="h-9 w-9" strokeWidth={1.5} />
            </div>

            <label className="employee-add-lookup-field">
              <span className="employee-add-field-label">
                موبایل یا ایمیل <span className="employee-add-required">*</span>
              </span>
              <div className="employee-add-lookup-input-wrap">
                <Search className="employee-add-lookup-icon" aria-hidden />
                <input
                  type="text"
                  value={contactLookup}
                  maxLength={50}
                  placeholder=""
                  onChange={(event) => setContactLookup(event.target.value)}
                />
              </div>
              <span className="employee-add-char-count">{contactLookup.length}/50</span>
              {contactLookup.trim() && parsedContact.error ? (
                <span className="employee-add-field-error">{parsedContact.error}</span>
              ) : null}
            </label>

            <p className="employee-add-lookup-hint">وارد کردن شماره موبایل یا ایمیل برای ثبت کاربر ضروری می‌باشد.</p>
          </div>

          <div className="employee-add-lookup-footer">
            <button
              type="button"
              className="module-page-add-btn employee-add-confirm-btn"
              disabled={!parsedContact.isValid}
              onClick={handleLookupConfirm}
            >
              انتخاب و تایید
            </button>
          </div>
        </div>
      ) : (
        <div className="employee-add-wizard-shell">
          <div className="employee-add-card employee-add-wizard-card">
            <div className="employee-add-stepper" aria-label="مراحل ثبت کارمند">
              <div className={`employee-add-step${step === 'basic' ? ' is-active' : ' is-done'}`}>
                <span className="employee-add-step-badge">1</span>
                <span>اطلاعات پایه</span>
              </div>
              <span className="employee-add-step-line" aria-hidden />
              <div className={`employee-add-step${step === 'additional' ? ' is-active' : ''}`}>
                <span className="employee-add-step-badge">2</span>
                <span>اطلاعات تکمیلی</span>
              </div>
            </div>

            {step === 'basic' ? (
              <div className="employee-add-form-body">
                <PhotoUploadCircle label="عکس پروفایل" imageUrl={avatarUrl} onPick={uploadAvatar} inputId="employee-avatar" />

                <div className="employee-add-fields-grid">
                  <label className="employee-add-field">
                    <span className="employee-add-field-label">
                      نام <span className="employee-add-required">*</span>
                    </span>
                    <input value={firstName} onChange={(event) => setFirstName(event.target.value)} required />
                  </label>
                  <label className="employee-add-field">
                    <span className="employee-add-field-label">
                      نام خانوادگی <span className="employee-add-required">*</span>
                    </span>
                    <input value={lastName} onChange={(event) => setLastName(event.target.value)} required />
                  </label>
                  <label className="employee-add-field employee-add-field-full">
                    <span className="employee-add-field-label">
                      کد ملی <span className="employee-add-required">*</span>
                    </span>
                    <input value={nationalId} onChange={(event) => setNationalId(event.target.value)} inputMode="numeric" required />
                    {nationalIdError ? <span className="employee-add-field-error">{nationalIdError}</span> : null}
                  </label>
                </div>

                <div className="employee-add-contact-panel">
                  <div className="employee-add-contact-row">
                    <span className="employee-add-contact-label">موبایل ۱</span>
                    <div className="employee-add-contact-input">
                      <Plus className="h-4 w-4 opacity-60" aria-hidden />
                      <input value={mobile1} onChange={(event) => setMobile1(event.target.value)} placeholder="-" />
                      <Square className="h-3.5 w-3.5 opacity-50" aria-hidden />
                    </div>
                  </div>
                  <div className="employee-add-contact-row">
                    <span className="employee-add-contact-label">موبایل ۲</span>
                    <div className="employee-add-contact-input">
                      <Plus className="h-4 w-4 opacity-60" aria-hidden />
                      <input value={mobile2} onChange={(event) => setMobile2(event.target.value)} placeholder="-" />
                      <Square className="h-3.5 w-3.5 opacity-50" aria-hidden />
                    </div>
                  </div>
                  <div className="employee-add-contact-row">
                    <span className="employee-add-contact-label">ایمیل</span>
                    <div className="employee-add-contact-input">
                      <Pencil className="h-4 w-4 opacity-60" aria-hidden />
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="-"
                      />
                      <Square className="h-3.5 w-3.5 opacity-50" aria-hidden />
                    </div>
                  </div>
                </div>

                <div className="employee-add-wizard-actions">
                  <button
                    type="button"
                    className="module-page-add-btn"
                    disabled={!firstName.trim() || !lastName.trim() || !nationalId.trim() || Boolean(nationalIdError)}
                    onClick={() => setStep('additional')}
                  >
                    ثبت اطلاعات
                  </button>
                </div>
              </div>
            ) : (
              <div className="employee-add-form-body">
                <h2 className="employee-add-section-title">اطلاعات تکمیلی</h2>

                <PhotoUploadCircle
                  label="عکس احراز هویت"
                  imageUrl={identityPhotoUrl}
                  onPick={uploadIdentityPhoto}
                  inputId="employee-identity-photo"
                />

                <div className="employee-add-fields-grid">
                  <label className="employee-add-field employee-add-field-full">
                    <span className="employee-add-field-label">کد پرسنلی</span>
                    <input value={personnelCode} onChange={(event) => setPersonnelCode(event.target.value)} />
                  </label>

                  <label className="employee-add-field">
                    <span className="employee-add-field-label">وضعیت تاهل</span>
                    <div className="employee-add-select-wrap">
                      <select value={maritalStatus} onChange={(event) => setMaritalStatus(event.target.value)}>
                        <option value="">-</option>
                        {maritalStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {maritalStatus ? (
                        <button type="button" className="employee-add-clear-btn" aria-label="پاک کردن" onClick={() => setMaritalStatus('')}>
                          <X className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </label>

                  <label className="employee-add-field">
                    <span className="employee-add-field-label">تعداد فرزندان</span>
                    <div className="employee-add-select-wrap">
                      <input
                        type="number"
                        min={0}
                        value={childrenCount}
                        onChange={(event) => setChildrenCount(event.target.value)}
                      />
                    </div>
                  </label>
                </div>

                <label className="employee-add-toggle-row">
                  <span>امکان ویرایش عکس احراز هویت توسط کارمند</span>
                  <span className="request-reason-toggle employee-card-toggle">
                    <input
                      type="checkbox"
                      checked={canEditIdentityPhoto}
                      onChange={(event) => setCanEditIdentityPhoto(event.target.checked)}
                    />
                    <span className="request-reason-toggle-track" aria-hidden />
                  </span>
                </label>

                <div className="employee-add-wizard-actions employee-add-wizard-actions-split">
                  <button type="button" className="employee-add-secondary-btn" onClick={() => setStep('basic')}>
                    لغو
                  </button>
                  <button
                    type="button"
                    className="module-page-add-btn"
                    disabled={pending || !firstName.trim() || !lastName.trim() || !nationalId.trim() || Boolean(nationalIdError)}
                    onClick={handleSave}
                  >
                    {pending ? 'در حال ذخیره...' : 'ذخیره'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <form ref={formRef} action={createEmployeeAction} hidden>
        <input name="firstName" value={firstName} readOnly />
        <input name="lastName" value={lastName} readOnly />
        <input name="nationalId" value={nationalId} readOnly />
        <input name="mobile1" value={mobile1} readOnly />
        <input name="mobile2" value={mobile2} readOnly />
        <input name="email" value={email} readOnly />
        <input name="personnelCode" value={personnelCode} readOnly />
        <input name="avatarUrl" value={avatarUrl} readOnly />
        <input name="identityPhotoUrl" value={identityPhotoUrl} readOnly />
        <input name="maritalStatus" value={maritalStatus || 'single'} readOnly />
        <input name="childrenCount" value={childrenCount} readOnly />
        {canEditIdentityPhoto ? <input name="canEditIdentityPhoto" value="on" readOnly /> : null}
        <input name="isActive" value="on" readOnly />
      </form>
    </div>
  );
}
