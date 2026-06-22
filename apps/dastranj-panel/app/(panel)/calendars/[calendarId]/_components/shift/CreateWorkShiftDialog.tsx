'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ConfirmDialog } from '../../../../../components/ConfirmDialog';
import { MinimalScroll } from '../../../../components/MinimalScroll';
import type { CalendarShiftType } from '../../../../../lib/calendar-shifts';
import type { ShiftTemplatePickerItem } from '../../../../../lib/shift-template-picker';
import { SHIFT_TYPE_CARDS } from './shift-type-cards';
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
  const [changeTypeConfirmOpen, setChangeTypeConfirmOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ignoreBackdropClickRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setSelectedType(null);
      setChangeTypeConfirmOpen(false);
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
        if (changeTypeConfirmOpen) {
          setChangeTypeConfirmOpen(false);
          return;
        }
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
  }, [changeTypeConfirmOpen, open, onClose, selectedType]);

  if (!open || !mounted) return null;

  const handleClose = () => {
    setSelectedType(null);
    setChangeTypeConfirmOpen(false);
    onClose();
  };

  const handleBackdropClick = () => {
    if (ignoreBackdropClickRef.current) return;
    handleClose();
  };

  const handleSaved = () => {
    setSelectedType(null);
    setChangeTypeConfirmOpen(false);
    onSaved();
  };

  const selectedCard = SHIFT_TYPE_CARDS.find((item) => item.id === selectedType);
  const visibleShiftTypes = SHIFT_TYPE_CARDS.filter((item) => item.id === 'fixed' || item.id === 'float-day' || item.id === 'float-abs' || item.id === 'split');

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
          <h2 id="calendar-shift-modal-title">{dayContext ? 'افزودن شیفت برای روز انتخاب‌شده' : 'ایجاد شیفت کاری'}</h2>
          <p>
            {selectedCard
              ? dayContext
                ? 'این شیفت فقط برای تاریخ انتخاب‌شده ثبت می‌شود و روی روزهای دیگر تقویم اثری ندارد.'
                : 'جزئیات شیفت را تکمیل کنید.'
              : dayContext
                ? `نوع شیفت را برای ${dayContext.date} انتخاب کنید.`
                : 'نوع شیفت را انتخاب کنید.'}
          </p>
          {dayContext?.isHoliday ? (
            <p className="calendar-shift-holiday-hint">
              این روز تعطیل است. اگر شیفتی ثبت شود، قبل از ذخیره درباره ثبت کار در روز تعطیل به شما هشدار داده می‌شود.
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
                  <p className="mt-2 text-xs leading-6 text-slate-300">{selectedCard.description}</p>
                  {selectedCard.example ? <p className="mt-2 rounded-xl bg-slate-800 px-3 py-2 text-xs leading-6 text-indigo-200">{selectedCard.example}</p> : null}
                </div>
              </div>
              <button
                type="button"
                className="calendar-shift-type-change"
                onClick={() => {
                  setChangeTypeConfirmOpen(true);
                }}
              >
                تغییر نوع شیفت
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
                    className={`calendar-shift-type-card is-${item.tone}${selectedType === item.id ? ' is-selected' : ''}`}
                    title={item.tooltip}
                    aria-label={`${item.label} - ${item.description} - ${item.example}`}
                    onClick={() => setSelectedType(item.id)}
                  >
                    <span className={`calendar-shift-type-icon is-${item.tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="calendar-shift-type-card-copy">
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                      <em>{item.example}</em>
                    </span>
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
      {changeTypeConfirmOpen ? (
        <ConfirmDialog
          open={changeTypeConfirmOpen}
          title="تغییر نوع شیفت"
          description="با تغییر نوع شیفت، اطلاعات واردشده در فرم فعلی ممکن است حذف شود. آیا ادامه می‌دهید؟"
          confirmLabel="تغییر نوع شیفت"
          cancelLabel="انصراف"
          onCancel={() => setChangeTypeConfirmOpen(false)}
          onConfirm={() => {
            setSelectedType(null);
            setChangeTypeConfirmOpen(false);
          }}
        />
      ) : null}

    </div>,
    document.body,
  );
}

export type { CalendarShiftWizardCalendar };
