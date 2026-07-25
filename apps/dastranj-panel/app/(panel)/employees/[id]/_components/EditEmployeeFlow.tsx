'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { Camera, ChevronRight, Layers, X } from 'lucide-react';
import { submitEmployeeChangeRequestAction, updateEmployeeAction } from '../../../../lib/actions';
import { isNationalIdValid } from '../../../../lib/parse-contact';

type EditStep = 'basic' | 'additional';

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

export type EditEmployeeData = {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string | null;
  mobile1: string | null;
  mobile2: string | null;
  email: string | null;
  personnelCode: string | null;
  avatarUrl: string | null;
  identityPhotoUrl: string | null;
  maritalStatus: string;
  childrenCount: number;
  canEditIdentityPhoto: boolean;
  canSensitiveUpdate?: boolean;
  canIdentityPhotoUpdate?: boolean;
  updatedAt?: string;
};

export function EditEmployeeFlow({
  employee,
  onClose,
}: {
  employee: EditEmployeeData;
  onClose: () => void;
}) {
  const [step, setStep] = useState<EditStep>('basic');
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [firstName, setFirstName] = useState(employee.firstName);
  const [lastName, setLastName] = useState(employee.lastName);
  const [nationalId, setNationalId] = useState(employee.nationalId ?? '');
  const [mobile1, setMobile1] = useState(employee.mobile1 ?? '');
  const [mobile2, setMobile2] = useState(employee.mobile2 ?? '');
  const [email, setEmail] = useState(employee.email ?? '');
  const [avatarUrl, setAvatarUrl] = useState(employee.avatarUrl ?? '');
  const [identityPhotoUrl, setIdentityPhotoUrl] = useState(employee.identityPhotoUrl ?? '');
  const [personnelCode, setPersonnelCode] = useState(employee.personnelCode ?? '');
  const [maritalStatus, setMaritalStatus] = useState(employee.maritalStatus ?? '');
  const [childrenCount, setChildrenCount] = useState(String(employee.childrenCount));
  const [canEditIdentityPhoto, setCanEditIdentityPhoto] = useState(employee.canEditIdentityPhoto);
  const [changeRequestError, setChangeRequestError] = useState('');
  const [changeRequestSuccess, setChangeRequestSuccess] = useState('');

  const nationalIdError = useMemo(
    () => (nationalId.trim() && !isNationalIdValid(nationalId) ? 'کد ملی باید ۱۰ رقم باشد.' : ''),
    [nationalId],
  );

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) return;
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

  const handleChangeRequestSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setChangeRequestError('');
    setChangeRequestSuccess('');
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(() => {
      void submitEmployeeChangeRequestAction(data)
        .then((result) => {
          if (result.ok) { setChangeRequestSuccess('درخواست تغییر برای بررسی ثبت شد.'); form.reset(); }
        })
        .catch((error: unknown) => setChangeRequestError(error instanceof Error ? error.message : 'ثبت درخواست تغییر ناموفق بود.'));
    });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm" dir="rtl" lang="fa">
      <div className="flex w-[min(96vw,560px)] max-h-[90vh] flex-col gap-5 overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0c1425] p-6 [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:bg-white">
        <div className="flex items-center justify-between">
          <h2 className="m-0 text-base font-extrabold text-white [html[data-theme=light]_&]:text-slate-900">ویرایش اطلاعات کارمند</h2>
          <button
            type="button"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] border border-white/[0.08] bg-transparent font-inherit text-slate-400 transition-all hover:bg-white/5 hover:text-white [html[data-theme=light]_&]:border-slate-200 [html[data-theme=light]_&]:text-slate-500 [html[data-theme=light]_&]:hover:bg-slate-50 [html[data-theme=light]_&]:hover:text-slate-900"
            onClick={onClose}
            aria-label="بستن"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="employee-add-stepper" aria-label="مراحل ویرایش">
          <div className={`employee-add-step${step === 'basic' ? ' is-active' : ' is-done'}`}>
            <span className="employee-add-step-badge">۱</span>
            <span>اطلاعات پایه</span>
          </div>
          <span className="employee-add-step-line" aria-hidden />
          <div className={`employee-add-step${step === 'additional' ? ' is-active' : ''}`}>
            <span className="employee-add-step-badge">۲</span>
            <span>اطلاعات تکمیلی</span>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          {step === 'basic' ? (
            <div className="employee-add-form-body">
              <PhotoUploadCircle label="عکس پروفایل" imageUrl={avatarUrl} onPick={uploadAvatar} inputId="edit-avatar" />

              <div className="employee-add-fields-grid">
                <label className="employee-add-field">
                  <span className="employee-add-field-label">
                    نام <span className="employee-add-required">*</span>
                  </span>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </label>
                <label className="employee-add-field">
                  <span className="employee-add-field-label">
                    نام خانوادگی <span className="employee-add-required">*</span>
                  </span>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </label>
                {employee.canSensitiveUpdate ? <label className="employee-add-field employee-add-field-full">
                  <span className="employee-add-field-label">کد ملی</span>
                  <input value={nationalId} onChange={(e) => setNationalId(e.target.value)} inputMode="numeric" />
                  {nationalIdError ? <span className="employee-add-field-error">{nationalIdError}</span> : null}
                </label> : null}
              </div>

              {employee.canSensitiveUpdate ? <div className="employee-add-fields-grid">
                <label className="employee-add-field">
                  <span className="employee-add-field-label">موبایل ۱</span>
                  <input value={mobile1} onChange={(e) => setMobile1(e.target.value)} inputMode="tel" />
                </label>
                <label className="employee-add-field">
                  <span className="employee-add-field-label">موبایل ۲</span>
                  <input value={mobile2} onChange={(e) => setMobile2(e.target.value)} inputMode="tel" />
                </label>
                <label className="employee-add-field employee-add-field-full">
                  <span className="employee-add-field-label">ایمیل</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
              </div> : null}

              <div className="employee-add-wizard-actions">
                <button
                  type="button"
                  className="module-page-add-btn"
                  disabled={!firstName.trim() || !lastName.trim() || Boolean(nationalIdError)}
                  onClick={() => setStep('additional')}
                >
                  مرحله بعد
                  <ChevronRight className="h-4 w-4 flip-icon" />
                </button>
              </div>
            </div>
          ) : (
            <div className="employee-add-form-body">
              {employee.canIdentityPhotoUpdate ? <PhotoUploadCircle
                label="عکس احراز هویت"
                imageUrl={identityPhotoUrl}
                onPick={uploadIdentityPhoto}
                inputId="edit-identity-photo"
              /> : null}

              <div className="employee-add-fields-grid">
                <label className="employee-add-field employee-add-field-full">
                  <span className="employee-add-field-label">کد پرسنلی</span>
                  <input value={personnelCode} onChange={(e) => setPersonnelCode(e.target.value)} />
                </label>

                <label className="employee-add-field">
                  <span className="employee-add-field-label">وضعیت تاهل</span>
                  <div className="employee-add-select-wrap">
                    <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)}>
                      <option value="">-</option>
                      {maritalStatusOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
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
                  <input
                    type="number"
                    min={0}
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(e.target.value)}
                  />
                </label>
              </div>

              <label className="employee-add-toggle-row">
                <span>امکان ویرایش عکس احراز هویت توسط کارمند</span>
                <span className="request-reason-toggle employee-card-toggle">
                  <input
                    type="checkbox"
                    checked={canEditIdentityPhoto}
                    onChange={(e) => setCanEditIdentityPhoto(e.target.checked)}
                  />
                  <span className="request-reason-toggle-track" aria-hidden />
                </span>
              </label>

              <div className="employee-add-wizard-actions employee-add-wizard-actions-split">
                <button type="button" className="employee-add-secondary-btn" onClick={() => setStep('basic')}>
                  مرحله قبل
                </button>
                <button
                  type="button"
                  className="module-page-add-btn"
                  disabled={pending || !firstName.trim() || !lastName.trim() || Boolean(nationalIdError)}
                  onClick={handleSave}
                >
                  {pending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </div>
          )}
        </div>

        <form ref={formRef} action={updateEmployeeAction} hidden>
          <input name="id" value={employee.id} readOnly />
          <input name="expectedUpdatedAt" value={employee.updatedAt ?? ''} readOnly />
          <input name="firstName" value={firstName} readOnly />
          <input name="lastName" value={lastName} readOnly />
          {employee.canSensitiveUpdate ? <><input name="nationalId" value={nationalId} readOnly /><input name="mobile1" value={mobile1} readOnly /><input name="mobile2" value={mobile2} readOnly /><input name="email" value={email} readOnly /></> : null}
          <input name="personnelCode" value={personnelCode} readOnly />
          <input name="avatarUrl" value={avatarUrl} readOnly />
          {employee.canIdentityPhotoUpdate ? <input name="identityPhotoUrl" value={identityPhotoUrl} readOnly /> : null}
          <input name="maritalStatus" value={maritalStatus || 'single'} readOnly />
          <input name="childrenCount" value={childrenCount} readOnly />
          {canEditIdentityPhoto ? <input name="canEditIdentityPhoto" value="on" readOnly /> : null}
        </form>

        {employee.canSensitiveUpdate ? (
          <form onSubmit={handleChangeRequestSubmit} className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-slate-200 [html[data-theme=light]_&]:text-slate-700">
            <h3 className="m-0 text-sm font-bold">درخواست تغییر اطلاعات رسمی</h3>
            <p className="mt-2">اطلاعات حساس و اثرگذار بر حقوق فقط پس از تأیید اعمال می‌شوند.</p>
            <input type="hidden" name="employeeId" value={employee.id} />
            <div className="employee-add-fields-grid">
              <label className="employee-add-field"><span className="employee-add-field-label">فیلد</span><select name="fieldKey" defaultValue="nationalId"><option value="nationalId">کد ملی</option><option value="mobile1">موبایل اصلی</option><option value="mobile2">موبایل دوم</option><option value="email">ایمیل</option><option value="identityPhotoUrl">نشانی تصویر هویتی</option><option value="maritalStatus">وضعیت تأهل</option><option value="childrenCount">تعداد فرزندان</option></select></label>
              <label className="employee-add-field"><span className="employee-add-field-label">مقدار جدید</span><input name="value" required /></label>
              <label className="employee-add-field"><span className="employee-add-field-label">دلیل</span><select name="reasonCode" defaultValue="INITIAL_DATA_CORRECTION"><option value="INITIAL_DATA_CORRECTION">اصلاح ثبت اولیه</option><option value="LEGAL_CHANGE">تغییر قانونی</option><option value="NEW_DOCUMENT">ارائه مدرک جدید</option><option value="EMPLOYEE_REQUEST">درخواست کارمند</option><option value="HR_ORDER">دستور منابع انسانی</option><option value="OTHER">سایر</option></select></label>
              <label className="employee-add-field"><span className="employee-add-field-label">تاریخ اثرگذاری</span><input name="effectiveDate" type="date" /></label>
              <label className="employee-add-field employee-add-field-full"><span className="employee-add-field-label">توضیح / پیوست</span><input name="reasonText" placeholder="توضیح دلیل (برای سایر الزامی است)" /><input className="mt-2" name="attachmentUrl" placeholder="نشانی پیوست" /></label>
            </div>
            <button type="submit" className="module-page-add-btn mt-3">ارسال برای تأیید</button>
            {changeRequestError ? <p className="employee-add-field-error mt-3" role="alert">{changeRequestError}</p> : null}
            {changeRequestSuccess ? <p className="mt-3 text-emerald-400" role="status">{changeRequestSuccess}</p> : null}
          </form>
        ) : null}
      </div>
    </div>
  );
}
