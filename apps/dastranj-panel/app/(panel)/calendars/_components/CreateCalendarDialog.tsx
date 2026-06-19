'use client';

import { Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { TaavFieldBlock, TaavInput, TaavTextarea } from '@repo/ui/taav/forms';
import { createCalendarDraftFromDefaultAction } from '../../../lib/actions';
import { MinimalScroll } from '../../../components/MinimalScroll';

type CreateCalendarDialogProps = {
  open: boolean;
  yearLabel: string;
  onClose: () => void;
};

function toPersianDigits(value: string) {
  return value.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)] ?? digit);
}

export function CreateCalendarDialog({ open, yearLabel, onClose }: CreateCalendarDialogProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [includeOfficialEvents, setIncludeOfficialEvents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ignoreBackdropClickRef = useRef(false);

  const yearLabelFa = toPersianDigits(yearLabel);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    setTitle('');
    setDescription('');
    setIncludeOfficialEvents(false);
    setError(null);

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
  }, [onClose, open]);

  if (!open || !mounted) return null;

  const canSubmit = Boolean(title.trim());

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;

    setSaving(true);
    setError(null);

    try {
      const result = await createCalendarDraftFromDefaultAction({
        title: title.trim(),
        description: description.trim() || undefined,
        yearLabel,
        includeOfficialEvents,
      });
      onClose();
      router.push(`/calendars/${result.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'ثبت تقویم انجام نشد.');
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
          <h2 id="calendar-create-modal-title">تقویم جدید</h2>
        </header>

        <div className="calendar-create-modal-body">
          <TaavFieldBlock label="عنوان" required htmlFor="calendar-create-title">
            <TaavInput
              id="calendar-create-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="عنوان تقویم را وارد کنید"
              autoFocus
            />
          </TaavFieldBlock>

          <TaavFieldBlock label="توضیحات" htmlFor="calendar-create-description">
            <TaavTextarea
              id="calendar-create-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="توضیحات تقویم (اختیاری)"
              rows={3}
            />
          </TaavFieldBlock>

          <div className="calendar-create-official-row">
            <span>افزودن رویداد های رسمی</span>
            <button
              type="button"
              className={`calendar-create-check${includeOfficialEvents ? ' is-on' : ''}`}
              role="checkbox"
              aria-checked={includeOfficialEvents}
              aria-label="افزودن رویداد های رسمی"
              onClick={() => setIncludeOfficialEvents((prev) => !prev)}
            >
              <span className="calendar-create-check-mark" aria-hidden />
            </button>
          </div>

          <div className="calendar-create-year-bar">
            <Info className="h-4 w-4" aria-hidden />
            <strong>{yearLabelFa}</strong>
          </div>
        </div>

        {error ? <p className="calendar-create-error">{error}</p> : null}

        <footer className="calendar-create-modal-footer">
          <button type="button" className="calendar-create-submit" disabled={!canSubmit || saving} onClick={handleSubmit}>
            {saving ? 'در حال ثبت...' : 'تأیید'}
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
