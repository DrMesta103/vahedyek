'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { TaavInput, TaavTextarea } from '@repo/ui/taav/forms';
import { createCalendarDraftFromDefaultAction } from '../../../lib/actions';
import { MinimalScroll } from '../../../components/MinimalScroll';

type CreateCalendarDialogProps = {
  open: boolean;
  yearLabel: string;
  yearOptions: string[];
  onClose: () => void;
};

type FormErrors = {
  title?: string;
  yearLabel?: string;
  summary?: string;
};

function normalizeDigits(value: string) {
  return value.replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
}

export function CreateCalendarDialog({ open, yearLabel, yearOptions, onClose }: CreateCalendarDialogProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedYear, setSelectedYear] = useState(yearLabel);
  const [description, setDescription] = useState('');
  const [includeOfficialEvents, setIncludeOfficialEvents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const ignoreBackdropClickRef = useRef(false);

  const resolvedYearOptions = useMemo(
    () => Array.from(new Set([yearLabel, ...yearOptions.map((item) => normalizeDigits(item))])).sort(),
    [yearLabel, yearOptions],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    setTitle('');
    setSelectedYear(yearLabel);
    setDescription('');
    setIncludeOfficialEvents(false);
    setErrors({});

    ignoreBackdropClickRef.current = true;
    const timer = window.setTimeout(() => {
      ignoreBackdropClickRef.current = false;
    }, 300);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, open, yearLabel]);

  if (!open || !mounted) return null;

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!title.trim()) {
      nextErrors.title = 'عنوان تقویم را وارد کنید.';
    }

    if (!selectedYear.trim()) {
      nextErrors.yearLabel = 'سال تقویم را انتخاب کنید.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (saving) return;
    if (!validate()) return;

    setSaving(true);
    setErrors({});

    try {
      const result = await createCalendarDraftFromDefaultAction({
        title: title.trim(),
        description: description.trim() || undefined,
        yearLabel: selectedYear,
        includeOfficialEvents,
      });
      onClose();
      router.push(`/calendars/${result.id}?created=1`);
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'تقویم کاری ثبت نشد. دوباره تلاش کنید.';
      setErrors((current) => ({ ...current, summary: message }));
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="calendar-create-modal-backdrop"
      role="presentation"
      dir="rtl"
      lang="fa"
      onMouseDown={() => {
        if (ignoreBackdropClickRef.current) return;
        onClose();
      }}
    >
      <MinimalScroll
        className="calendar-create-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-create-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="calendar-create-modal-head">
          <h2 id="calendar-create-modal-title">ایجاد تقویم کاری جدید</h2>
        </header>

        <div className="calendar-create-modal-body">
          <div className="calendar-create-form-row">
            <label className="calendar-create-label" htmlFor="calendar-create-title">
              عنوان تقویم
            </label>
            <TaavInput
              id="calendar-create-title"
              type="text"
              value={title}
              invalid={Boolean(errors.title)}
              onChange={(event) => {
                setTitle(event.target.value);
                if (errors.title) setErrors((current) => ({ ...current, title: undefined }));
              }}
              placeholder="مثلاً: تقویم کاری ۱۴۰۵، تقویم شعبه تهران، تقویم پروژه شمال"
              autoFocus
            />
            <p className="calendar-create-helper">
              نامی برای شناسایی این تقویم وارد کنید؛ مثل تقویم کاری ۱۴۰۵ یا تقویم شعبه تهران.
            </p>
            {errors.title ? <p className="calendar-create-field-error">{errors.title}</p> : null}
          </div>

          <div className="calendar-create-form-row">
            <label className="calendar-create-label" htmlFor="calendar-create-year">
              سال تقویم
            </label>
            <select
              id="calendar-create-year"
              className={`calendar-create-select${errors.yearLabel ? ' is-invalid' : ''}`}
              value={selectedYear}
              onChange={(event) => {
                setSelectedYear(event.target.value);
                if (errors.yearLabel) setErrors((current) => ({ ...current, yearLabel: undefined }));
              }}
            >
              <option value="">انتخاب سال</option>
              {resolvedYearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <p className="calendar-create-helper">سالی را انتخاب کنید که این تقویم برای آن ساخته می‌شود.</p>
            {errors.yearLabel ? <p className="calendar-create-field-error">{errors.yearLabel}</p> : null}
          </div>

          <div className="calendar-create-form-row">
            <label className="calendar-create-label" htmlFor="calendar-create-description">
              توضیحات تقویم
            </label>
            <TaavTextarea
              id="calendar-create-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="مثلاً: تقویم مخصوص شعبه تهران یا تیم‌های اداری"
              rows={4}
            />
            <p className="calendar-create-helper">
              اگر این تقویم برای شعبه، پروژه، گروه یا شرایط خاصی استفاده می‌شود، اینجا توضیح دهید.
            </p>
          </div>

          <div className="calendar-create-form-row">
            <div className="calendar-create-official-row">
              <div className="calendar-create-toggle-copy">
                <strong>افزودن تعطیلات رسمی سال</strong>
                <p>با فعال‌سازی این گزینه، تعطیلات رسمی سال انتخاب‌شده به تقویم اضافه می‌شود.</p>
              </div>
              <button
                type="button"
                className={`calendar-create-check${includeOfficialEvents ? ' is-on' : ''}`}
                role="checkbox"
                aria-checked={includeOfficialEvents}
                aria-label="افزودن تعطیلات رسمی سال"
                onClick={() => setIncludeOfficialEvents((prev) => !prev)}
              >
                <span className="calendar-create-check-mark" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {errors.summary ? <p className="calendar-create-error">{errors.summary}</p> : null}

        <footer className="calendar-create-modal-footer">
          <button type="button" className="calendar-create-submit" disabled={saving} onClick={handleSubmit}>
            {saving ? 'در حال ایجاد...' : 'ایجاد تقویم کاری'}
          </button>
          <button type="button" className="calendar-create-cancel" disabled={saving} onClick={onClose}>
            انصراف
          </button>
        </footer>
      </MinimalScroll>
    </div>,
    document.body,
  );
}
