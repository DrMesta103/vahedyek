'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock3, GitBranch, Hourglass, RefreshCw, Timer } from 'lucide-react';
import { MinimalScroll } from '../../../../components/MinimalScroll';
import type { CalendarShiftType } from '../../../../../lib/calendar-shifts';
import type { ShiftTemplatePickerItem } from '../../../../../lib/shift-template-picker';
import type { CalendarShiftDayContext, CalendarShiftWizardCalendar } from './types';

const CalendarShiftWizard = dynamic(
  () => import('./CalendarShiftWizard').then((module) => ({ default: module.CalendarShiftWizard })),
  {
    ssr: false,
    loading: () => (
      <div className="calendar-shift-wizard-loading" role="status">
        در حال بارگذاری فرم شیفت...
      </div>
    ),
  },
);

const SHIFT_TYPE_CARDS: Array<{
  id: CalendarShiftType;
  label: string;
  icon: typeof Clock3;
  tone: 'green' | 'blue' | 'cyan' | 'amber' | 'purple';
}> = [
  { id: 'fixed', label: 'شیفت ثابت', icon: Clock3, tone: 'green' },
  { id: 'float-day', label: 'شیفت شناور - شروع روز', icon: Hourglass, tone: 'blue' },
  { id: 'float-abs', label: 'شیفت شناور - مطلق', icon: Timer, tone: 'cyan' },
  { id: 'split', label: 'شیفت دو تکه', icon: GitBranch, tone: 'amber' },
  { id: 'rotate', label: 'شیفت چرخشی', icon: RefreshCw, tone: 'purple' },
];

type CreateWorkShiftDialogProps = {
  open: boolean;
  calendar: CalendarShiftWizardCalendar;
  shiftTemplates?: ShiftTemplatePickerItem[];
  dayContext?: CalendarShiftDayContext;
  onClose: () => void;
  onSaved: () => void;
};

export function CreateWorkShiftDialog({
  open,
  calendar,
  shiftTemplates = [],
  dayContext,
  onClose,
  onSaved,
}: CreateWorkShiftDialogProps) {
  const [selectedType, setSelectedType] = useState<CalendarShiftType | null>(null);
  const [mounted, setMounted] = useState(false);
  const ignoreBackdropClickRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setSelectedType(null);
      return;
    }

    ignoreBackdropClickRef.current = true;
    const timer = window.setTimeout(() => {
      ignoreBackdropClickRef.current = false;
    }, 300);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (selectedType) {
          setSelectedType(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose, selectedType]);

  if (!open || !mounted) return null;

  const handleClose = () => {
    setSelectedType(null);
    onClose();
  };

  const handleBackdropClick = () => {
    if (ignoreBackdropClickRef.current) return;
    handleClose();
  };

  const handleSaved = () => {
    setSelectedType(null);
    onSaved();
  };

  const selectedCard = SHIFT_TYPE_CARDS.find((item) => item.id === selectedType);
  const visibleShiftTypes = dayContext ? SHIFT_TYPE_CARDS.filter((item) => item.id !== 'rotate') : SHIFT_TYPE_CARDS;

  return createPortal(
    <div
      className="calendar-shift-modal-backdrop"
      role="presentation"
      dir="rtl"
      lang="fa"
      onMouseDown={handleBackdropClick}
    >
      <MinimalScroll
        className="calendar-shift-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-shift-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="calendar-shift-modal-head">
          <h2 id="calendar-shift-modal-title">{dayContext ? 'افزودن شیفت برای روز' : 'ایجاد شیفت کاری'}</h2>
          <p>
            {selectedCard
              ? dayContext
                ? `جزئیات شیفت را برای ${dayContext.date} تکمیل کنید.`
                : 'جزئیات شیفت را تکمیل کنید.'
              : dayContext
                ? `نوع شیفت را برای ${dayContext.date} انتخاب کنید.`
                : 'نوع شیفت را انتخاب کنید.'}
          </p>
          {dayContext?.isHoliday ? (
            <p className="calendar-shift-holiday-hint">
              این روز تعطیل است. ثبت شیفت مجاز است، اما در صورت کارکرد ممکن است ضریب تعطیل/جمعه‌کاری در حقوق و دستمزد
              اعمال شود.
            </p>
          ) : null}
        </header>

        {selectedCard ? (
          <>
            <div className={`calendar-shift-selected-type is-${selectedCard.tone}`}>
              <div className="calendar-shift-selected-type-copy">
                <span className={`calendar-shift-type-icon is-${selectedCard.tone}`}>
                  {(() => {
                    const SelectedIcon = selectedCard.icon;
                    return <SelectedIcon className="h-4 w-4" />;
                  })()}
                </span>
                <div>
                  <strong>{selectedCard.label}</strong>
                </div>
              </div>
              <button type="button" className="calendar-shift-type-change" onClick={() => setSelectedType(null)}>
                تغییر
              </button>
            </div>

            <div className="calendar-shift-modal-body">
              <CalendarShiftWizard
                key={`${selectedType}-${dayContext?.date ?? 'bulk'}`}
                calendar={calendar}
                initialShiftType={selectedType!}
                dayContext={dayContext}
                persistedTemplates={shiftTemplates}
                hideTypePicker
                compact
                onCancel={() => setSelectedType(null)}
                onSaved={handleSaved}
              />
            </div>
          </>
        ) : (
          <>
            <div className="calendar-shift-type-chips">
              {visibleShiftTypes.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`calendar-shift-type-chip is-${item.tone}`}
                    onClick={() => setSelectedType(item.id)}
                  >
                    <span className={`calendar-shift-type-icon is-${item.tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <footer className="calendar-shift-modal-footer">
              <button type="button" className="calendar-shift-modal-cancel" onClick={handleClose}>
                انصراف
              </button>
            </footer>
          </>
        )}
      </MinimalScroll>
    </div>,
    document.body,
  );
}

export type { CalendarShiftWizardCalendar };
