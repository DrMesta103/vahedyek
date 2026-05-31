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
  description: string;
  example: string;
}> = [
  {
    id: 'fixed',
    label: 'شیفت ثابت',
    icon: Clock3,
    tone: 'green',
    description: 'شیفت ثابت برای تیم‌هایی مناسب است که ساعت ورود و خروج مشخص و تکرارشونده دارند.',
    example: 'مثال: ۸:۰۰ تا ۱۶:۳۰',
  },
  {
    id: 'float-day',
    label: 'شیفت شناور شروع روز',
    icon: Hourglass,
    tone: 'blue',
    description: 'در این نوع شیفت، کارمند می‌تواند در یک بازه مشخص وارد شود، اما باید مدت کار موظف را کامل کند. ساعت خروج بر اساس زمان ورود واقعی محاسبه می‌شود.',
    example: 'مثال: بازه ورود ۷:۰۰ تا ۹:۰۰، مدت کار موظف ۸ ساعت و ورود ۸:۳۰ با خروج ۱۶:۳۰.',
  },
  {
    id: 'float-abs',
    label: 'شیفت شناور مطلق',
    icon: Timer,
    tone: 'cyan',
    description: 'برای تیم‌هایی که فقط مجموع زمان کار روزانه اهمیت دارد.',
    example: '',
  },
  {
    id: 'split',
    label: 'شیفت دو تکه',
    icon: GitBranch,
    tone: 'amber',
    description: 'وقتی ساعت کاری در دو بازه جدا از هم انجام می‌شود.',
    example: '',
  },
  {
    id: 'rotate',
    label: 'شیفت چرخشی',
    icon: RefreshCw,
    tone: 'purple',
    description: 'برای مجموعه‌هایی که الگوی شیفت بین افراد یا روزها جابه‌جا می‌شود.',
    example: '',
  },
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
  const [changeTypeConfirmOpen, setChangeTypeConfirmOpen] = useState(false);
  const [rotateComingSoonOpen, setRotateComingSoonOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ignoreBackdropClickRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setSelectedType(null);
      setChangeTypeConfirmOpen(false);
      setRotateComingSoonOpen(false);
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
        if (rotateComingSoonOpen) {
          setRotateComingSoonOpen(false);
          return;
        }
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
  }, [changeTypeConfirmOpen, open, onClose, rotateComingSoonOpen, selectedType]);

  if (!open || !mounted) return null;

  const handleClose = () => {
    setSelectedType(null);
    setChangeTypeConfirmOpen(false);
    setRotateComingSoonOpen(false);
    onClose();
  };

  const handleBackdropClick = () => {
    if (ignoreBackdropClickRef.current) return;
    handleClose();
  };

  const handleSaved = () => {
    setSelectedType(null);
    setChangeTypeConfirmOpen(false);
    setRotateComingSoonOpen(false);
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
                    onClick={() => {
                      if (item.id === 'rotate') {
                        setRotateComingSoonOpen(true);
                        return;
                      }
                      setSelectedType(item.id);
                    }}
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
      {changeTypeConfirmOpen ? (
        <div className="fixed inset-0 z-[110] bg-black/65" onClick={() => setChangeTypeConfirmOpen(false)}>
          <div
            className="fixed left-1/2 top-1/2 z-[111] w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-slate-900 p-4 text-right text-slate-100"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-lg font-black text-white">تغییر نوع شیفت</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">با تغییر نوع شیفت، برخی اطلاعات واردشده پاک یا غیرقابل استفاده می‌شود. ادامه می‌دهید؟</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedType(null);
                  setChangeTypeConfirmOpen(false);
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white"
              >
                ادامه
              </button>
              <button type="button" onClick={() => setChangeTypeConfirmOpen(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm">
                انصراف
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {rotateComingSoonOpen ? (
        <div className="fixed inset-0 z-[110] bg-black/65" onClick={() => setRotateComingSoonOpen(false)}>
          <div
            className="fixed left-1/2 top-1/2 z-[111] w-[min(100%-2rem,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-900 p-5 text-right text-slate-100 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-lg font-black text-white">شیفت چرخشی</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">این قابلیت به‌زودی اضافه می‌شود.</p>
            <p className="mt-2 text-xs leading-6 text-slate-400">
              زیرساخت این بخش آماده است، اما تعریف و مدیریت شیفت‌های چرخشی در نسخه‌های بعدی فعال خواهد شد.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setRotateComingSoonOpen(false)}
                className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-400"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>,
    document.body,
  );
}

export type { CalendarShiftWizardCalendar };
