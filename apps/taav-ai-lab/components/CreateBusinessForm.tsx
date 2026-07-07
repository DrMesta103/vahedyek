'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ImageUp, Plus } from 'lucide-react';
import { TaavButton } from '@repo/ui/taav/primitives';
import { TaavInput } from '@repo/ui/taav/forms';

const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('خواندن فایل تصویر انجام نشد.'));
    reader.readAsDataURL(file);
  });
}

function isAcceptedImage(file: File) {
  return ACCEPTED_IMAGE_TYPES.includes(file.type) || file.type.startsWith('image/');
}

function CreateBusinessLabel({ children, required = false }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="ai-lab-create-label">
      {children}
      {required ? <span className="ai-lab-create-required">*</span> : null}
    </label>
  );
}

export function CreateBusinessForm({
  mode = 'page',
  defaultFirstName = '',
  defaultLastName = '',
  onCancel,
  onCreated,
}: {
  mode?: 'page' | 'dialog';
  defaultFirstName?: string;
  defaultLastName?: string;
  onCancel?: () => void;
  onCreated?: (businessId: string) => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState(defaultFirstName);
  const [lastName, setLastName] = useState(defaultLastName);
  const [nameError, setNameError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    return () => {
      if (logoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [logoPreview]);

  const applyLogoFile = async (file: File) => {
    if (!isAcceptedImage(file)) {
      setError('فقط فایل‌های PNG، JPG، WEBP یا SVG برای لوگو قابل قبول است.');
      return;
    }

    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError('حجم تصویر لوگو نباید بیشتر از ۵ مگابایت باشد.');
      return;
    }

    setError('');
    setLogoLoading(true);

    try {
      const preview = await fileToDataUrl(file);
      setLogoPreview(preview);
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : 'خواندن تصویر انجام نشد.');
    } finally {
      setLogoLoading(false);
    }
  };

  const handleLogoPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await applyLogoFile(file);
    event.target.value = '';
  };

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!submitting && !logoLoading) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = async (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDragActive(false);
    if (submitting || logoLoading) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      await applyLogoFile(file);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    let hasError = false;

    if (!trimmedName) {
      setNameError('نام کسب‌وکار الزامی است.');
      hasError = true;
    } else {
      setNameError('');
    }

    if (!trimmedFirstName) {
      setFirstNameError('نام صاحب کسب‌وکار الزامی است.');
      hasError = true;
    } else {
      setFirstNameError('');
    }

    if (!trimmedLastName) {
      setLastNameError('نام خانوادگی صاحب کسب‌وکار الزامی است.');
      hasError = true;
    } else {
      setLastNameError('');
    }

    if (hasError) {
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          logoUrl: logoPreview,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string; business?: { id: string } } | null;
      if (!response.ok || !payload?.business?.id) {
        throw new Error(payload?.message || 'ایجاد کسب‌وکار انجام نشد.');
      }

      onCreated?.(payload.business.id);
      if (onCreated) {
        return;
      }

      router.push(`/businesses/${payload.business.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'ایجاد کسب‌وکار انجام نشد.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="ai-lab-create-business-form" onSubmit={handleSubmit} noValidate>
      <div className="ai-lab-create-field">
        <CreateBusinessLabel required>نام کسب‌وکار</CreateBusinessLabel>
        <TaavInput
          id="business-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (nameError) setNameError('');
          }}
          placeholder="مثال: استودیو خلاقه پارس"
          disabled={submitting}
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? 'business-name-error' : undefined}
        />
        {nameError ? (
          <p id="business-name-error" className="ai-lab-create-field-error" role="alert">
            {nameError}
          </p>
        ) : null}
      </div>

      <div className="ai-lab-create-field-row">
        <div className="ai-lab-create-field">
          <CreateBusinessLabel required>نام صاحب کسب‌وکار</CreateBusinessLabel>
          <TaavInput
            id="owner-first-name"
            value={firstName}
            onChange={(event) => {
              setFirstName(event.target.value);
              if (firstNameError) setFirstNameError('');
            }}
            placeholder="مثال: علی"
            disabled={submitting}
            aria-invalid={Boolean(firstNameError)}
            aria-describedby={firstNameError ? 'owner-first-name-error' : undefined}
          />
          {firstNameError ? (
            <p id="owner-first-name-error" className="ai-lab-create-field-error" role="alert">
              {firstNameError}
            </p>
          ) : null}
        </div>

        <div className="ai-lab-create-field">
          <CreateBusinessLabel required>نام خانوادگی صاحب کسب‌وکار</CreateBusinessLabel>
          <TaavInput
            id="owner-last-name"
            value={lastName}
            onChange={(event) => {
              setLastName(event.target.value);
              if (lastNameError) setLastNameError('');
            }}
            placeholder="مثال: محمدی"
            disabled={submitting}
            aria-invalid={Boolean(lastNameError)}
            aria-describedby={lastNameError ? 'owner-last-name-error' : undefined}
          />
          {lastNameError ? (
            <p id="owner-last-name-error" className="ai-lab-create-field-error" role="alert">
              {lastNameError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="ai-lab-create-field">
        <CreateBusinessLabel>آیکن یا لوگوی کسب‌وکار</CreateBusinessLabel>

        <div className="ai-lab-create-upload-row">
          <input
            ref={fileInputRef}
            id="business-logo"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            className="sr-only"
            onChange={handleLogoPick}
            disabled={submitting || logoLoading}
          />

          <button
            type="button"
            className={['ai-lab-create-dropzone', dragActive ? 'is-drag-active' : ''].filter(Boolean).join(' ')}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            disabled={submitting || logoLoading}
            aria-label="انتخاب یا کشیدن تصویر لوگو"
          >
            <div className="ai-lab-create-dropzone-icon" aria-hidden="true">
              <ImageUp className="h-6 w-6" strokeWidth={1.6} />
            </div>
            <div className="ai-lab-create-dropzone-copy">
              <strong>برای انتخاب فایل، کلیک کنید یا فایل را اینجا بکشید</strong>
              <span>فرمت‌های مجاز: PNG, JPG, WEBP, SVG</span>
            </div>
          </button>

          <div className="ai-lab-create-preview-card">
            <p className="ai-lab-create-preview-title">پیش‌نمایش</p>
            <div className="ai-lab-create-preview-body">
              {logoPreview ? (
                <img src={logoPreview} alt="پیش‌نمایش لوگوی انتخاب‌شده" className="ai-lab-create-preview-image" />
              ) : (
                <div className="ai-lab-create-preview-empty">
                  <div className="ai-lab-create-preview-placeholder" aria-hidden="true">
                    <Building2 className="h-5 w-5" strokeWidth={1.6} />
                  </div>
                  <p>پس از انتخاب، آیکن در اینجا نمایش داده می‌شود.</p>
                </div>
              )}
            </div>
            {logoPreview ? (
              <button
                type="button"
                className="ai-lab-create-preview-replace"
                onClick={() => fileInputRef.current?.click()}
                disabled={submitting || logoLoading}
              >
                تغییر تصویر
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {error ? <div className="ai-lab-error-box">{error}</div> : null}

      <div className="ai-lab-create-footer">
        {mode === 'page' ? (
          <Link href="/businesses">
            <TaavButton type="button" variant="secondary" tone="neutral" disabled={submitting}>
              انصراف
            </TaavButton>
          </Link>
        ) : (
          <TaavButton type="button" variant="secondary" tone="neutral" onClick={onCancel} disabled={submitting}>
            انصراف
          </TaavButton>
        )}
        <TaavButton type="submit" loading={submitting} disabled={submitting || logoLoading} iconStart={<Plus className="h-4 w-4" />}>
          ثبت کسب‌وکار
        </TaavButton>
      </div>
    </form>
  );
}
