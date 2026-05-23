'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock3, GitBranch, Hourglass, RefreshCw, Timer } from 'lucide-react';
import { MinimalScroll } from '../../../components/MinimalScroll';
import { createShiftTemplateFromDialogAction } from '../../../lib/actions';
import type { CalendarShiftType } from '../../../lib/calendar-shifts';
import { SHIFT_TEMPLATE_CATEGORIES, type ShiftTemplateCategory } from '../../../lib/shift-template-map';
import { SHIFT_TEMPLATE_WIZARD_CALENDAR } from './shift-template-wizard-stub';
import type { ShiftWizardSavePayload } from '../../calendars/[calendarId]/_components/shift/CalendarShiftWizard';

const CalendarShiftWizard = dynamic(
  () =>
    import('../../calendars/[calendarId]/_components/shift/CalendarShiftWizard').then((module) => ({
      default: module.CalendarShiftWizard,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="calendar-shift-wizard-loading" role="status">
        در حال بارگذاری فرم قالب شیفت...
      </div>
    ),
  },
);

const TYPE_META: Record<
  ShiftTemplateCategory,
  { icon: typeof Clock3; tone: 'green' | 'blue' | 'cyan' | 'amber' | 'purple' }
> = {
  fixed: { icon: Clock3, tone: 'green' },
  'float-day': { icon: Hourglass, tone: 'blue' },
  'float-abs': { icon: Timer, tone: 'cyan' },
  split: { icon: GitBranch, tone: 'amber' },
  rotate: { icon: RefreshCw, tone: 'purple' },
};

type CreateShiftTemplateDialogProps = {
  open: boolean;
  shiftType: ShiftTemplateCategory;
  onClose: () => void;
  onSaved: () => void;
};

export function CreateShiftTemplateDialog({ open, shiftType, onClose, onSaved }: CreateShiftTemplateDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ignoreBackdropClickRef = useRef(false);

  const category = SHIFT_TEMPLATE_CATEGORIES.find((item) => item.id === shiftType) ?? SHIFT_TEMPLATE_CATEGORIES[0];
  const meta = TYPE_META[category.id];
  const TypeIcon = meta.icon;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

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

  return createPortal(
    <div
      className="calendar-shift-modal-backdrop"
      role="presentation"
      dir="rtl"
      lang="fa"
      onMouseDown={() => {
        if (ignoreBackdropClickRef.current) return;
        onClose();
      }}
    >
      <MinimalScroll
        className="calendar-shift-modal calendar-shift-modal-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-template-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="calendar-shift-modal-head">
          <h2 id="shift-template-modal-title">قالب شیفت جدید</h2>
          <p>جزئیات قالب را تکمیل کنید تا در ثبت شیفت تقویم قابل استفاده باشد.</p>
        </header>

        <div className={`calendar-shift-selected-type is-${meta.tone}`}>
          <div className="calendar-shift-selected-type-copy">
            <span className={`calendar-shift-type-icon is-${meta.tone}`}>
              <TypeIcon className="h-4 w-4" />
            </span>
            <div>
              <strong>{category.label}</strong>
              <p className="shift-template-selected-type-desc">{category.description}</p>
            </div>
          </div>
        </div>

        {error ? <p className="calendar-create-error">{error}</p> : null}

        <div className="calendar-shift-modal-body">
          <CalendarShiftWizard
            key={shiftType}
            calendar={SHIFT_TEMPLATE_WIZARD_CALENDAR}
            initialShiftType={shiftType as CalendarShiftType}
            hideTypePicker
            compact
            purpose="template"
            enableBuiltinTemplatePicker={false}
            submitLabel="ثبت قالب"
            onSaveShift={async (payload) => {
              setError(null);
              try {
                await createShiftTemplateFromDialogAction({
                  shiftType: payload.shiftType,
                  shiftTitle: payload.shiftTitle,
                  description: payload.description,
                  shiftConfig: payload.shiftConfig,
                });
              } catch (saveError) {
                setError(saveError instanceof Error ? saveError.message : 'ثبت قالب انجام نشد.');
                throw saveError;
              }
            }}
            onSaved={onSaved}
            onCancel={onClose}
          />
        </div>
      </MinimalScroll>
    </div>,
    document.body,
  );
}
