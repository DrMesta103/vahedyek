'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MinimalScroll } from '../../../components/MinimalScroll';
import { createShiftTemplateFromDialogAction, updateShiftTemplateFromDialogAction } from '../../../lib/actions';
import type { CalendarShiftType } from '../../../lib/calendar-shifts';
import { RotateShiftComingSoonModal } from '../../calendars/[calendarId]/_components/shift/RotateShiftComingSoonModal';
import { SHIFT_TYPE_CARDS } from '../../calendars/[calendarId]/_components/shift/shift-type-cards';
import { SHIFT_TEMPLATE_WIZARD_CALENDAR } from './shift-template-wizard-stub';
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

type CreateShiftTemplateDialogProps = {
  open: boolean;
  initialShiftType?: CalendarShiftType | null;
  onClose: () => void;
  onSaved: (templateId?: string) => void;
  mode?: 'create' | 'edit' | 'clone';
  template?: {
    id: string;
    title: string;
    description: string | null;
    shiftType: CalendarShiftType;
    config: Record<string, unknown>;
    isUsed: boolean;
    usageUnknown: boolean;
    isActive: boolean;
  } | null;
};

export function CreateShiftTemplateDialog({
  open,
  initialShiftType = null,
  onClose,
  onSaved,
  mode = 'create',
  template = null,
}: CreateShiftTemplateDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedType, setSelectedType] = useState<CalendarShiftType | null>(null);
  const [pendingType, setPendingType] = useState<CalendarShiftType | null>(null);
  const [changeTypeConfirmOpen, setChangeTypeConfirmOpen] = useState(false);
  const [rotateComingSoonOpen, setRotateComingSoonOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ignoreBackdropClickRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setSelectedType(null);
      setPendingType(null);
      setChangeTypeConfirmOpen(false);
      setRotateComingSoonOpen(false);
      setError(null);
      return;
    }

    const resolvedInitialType = mode !== 'create' && template ? template.shiftType : initialShiftType;
    if (resolvedInitialType && resolvedInitialType !== 'rotate') {
      setSelectedType(resolvedInitialType);
      setPendingType(resolvedInitialType);
    } else if (resolvedInitialType === 'rotate') {
      setSelectedType(null);
      setPendingType(null);
      setRotateComingSoonOpen(true);
    } else {
      setSelectedType(null);
      setPendingType(null);
    }

    setError(null);
    ignoreBackdropClickRef.current = true;
    const timer = window.setTimeout(() => {
      ignoreBackdropClickRef.current = false;
    }, 300);

    return () => window.clearTimeout(timer);
  }, [initialShiftType, mode, open, template]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
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
        if (mode === 'edit') {
          onClose();
        } else if (selectedType) {
          setSelectedType(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [changeTypeConfirmOpen, mode, onClose, open, rotateComingSoonOpen, selectedType]);

  if (!open || !mounted) return null;

  const handleClose = () => {
    setSelectedType(null);
    setPendingType(null);
    setChangeTypeConfirmOpen(false);
    setRotateComingSoonOpen(false);
    setError(null);
    onClose();
  };

  const handleBackdropClick = () => {
    if (ignoreBackdropClickRef.current) return;
    handleClose();
  };

  const handleSaved = (templateId?: string) => {
    setSelectedType(null);
    setChangeTypeConfirmOpen(false);
    setRotateComingSoonOpen(false);
    setError(null);
    onSaved(templateId);
  };

  const selectedCard = SHIFT_TYPE_CARDS.find((item) => item.id === selectedType);

  return createPortal(
    <div
      className="calendar-shift-modal-backdrop"
      role="presentation"
      dir="rtl"
      lang="fa"
      onMouseDown={handleBackdropClick}
    >
      <MinimalScroll
        className={`calendar-shift-modal${selectedCard ? ' calendar-shift-modal-wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-template-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="calendar-shift-modal-head">
          <h2 id="shift-template-modal-title">{mode === 'edit' ? 'ویرایش قالب شیفت' : mode === 'clone' ? 'ایجاد نسخه مشابه قالب شیفت' : 'افزودن قالب شیفت'}</h2>
          <p>
            {selectedCard
              ? 'جزئیات قالب را تکمیل کنید تا در ثبت شیفت تقویم قابل استفاده باشد.'
              : 'نوع قالب شیفت را انتخاب کنید.'}
          </p>
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
                  {selectedCard.example ? (
                    <p className="mt-2 rounded-xl bg-slate-800 px-3 py-2 text-xs leading-6 text-indigo-200">{selectedCard.example}</p>
                  ) : null}
                </div>
              </div>
              {mode === 'create' ? <button
                type="button"
                className="calendar-shift-type-change"
                onClick={() => {
                  setChangeTypeConfirmOpen(true);
                }}
              >
                تغییر نوع شیفت
              </button> : null}
            </div>

            {error ? <p className="calendar-create-error">{error}</p> : null}

            <div className="calendar-shift-modal-body">
              <CalendarShiftWizard
                key={selectedType}
                calendar={SHIFT_TEMPLATE_WIZARD_CALENDAR}
                initialShiftType={selectedType!}
                hideTypePicker
                compact
                purpose="template"
                enableBuiltinTemplatePicker={false}
                submitLabel={mode === 'edit' ? 'ذخیره تغییرات' : mode === 'clone' ? 'ایجاد نسخه مشابه' : 'ثبت قالب شیفت'}
                requireReviewBeforeSave={mode === 'create'}
                allowTemplateStatusEditing={mode === 'create'}
                initialIsActive={template?.isActive ?? true}
                initialDescription={template?.description ?? ''}
                initialShiftConfig={template?.config}
                initialShiftTitle={mode === 'clone' ? `${template?.title ?? ''} - کپی` : template?.title}
                onSaveShift={async (payload) => {
                  setError(null);
                  try {
                    if (mode === 'edit' && template?.isUsed && !window.confirm('تغییرات جدید روی استفاده‌های قبلی اعمال نمی‌شود و فقط در استفاده‌های بعدی از قالب اعمال خواهد شد. آیا از ذخیره تغییرات مطمئن هستید؟')) {
                      throw new DOMException('ذخیره تغییرات لغو شد.', 'AbortError');
                    }
                    const input = {
                      shiftType: payload.shiftType,
                      shiftTitle: payload.shiftTitle,
                      description: payload.description,
                      shiftConfig: payload.shiftConfig,
                      isActive: payload.isActive,
                      ...(mode === 'clone' && template ? { sourceTemplateId: template.id } : {}),
                    };
                    if (mode === 'edit' && template) {
                      await updateShiftTemplateFromDialogAction({ ...input, id: template.id });
                    } else {
                      return await createShiftTemplateFromDialogAction(input);
                    }
                  } catch (saveError) {
                    if (saveError instanceof DOMException && saveError.name === 'AbortError') throw saveError;
                    setError(saveError instanceof Error ? saveError.message : 'ثبت قالب انجام نشد.');
                    throw saveError;
                  }
                }}
                onSaved={handleSaved}
                onCancel={handleClose}
              />
            </div>
          </>
        ) : (
          <>
            <div className="calendar-shift-type-selection-copy"><h3>انتخاب نوع شیفت</h3><p>ابتدا مشخص کنید قالب جدید بر اساس چه نوع شیفتی ساخته شود.</p></div>
            {error ? <p className="calendar-create-error" role="alert">{error}</p> : null}
            <div className="calendar-shift-type-chips" role="radiogroup" aria-label="انتخاب نوع شیفت">
              {SHIFT_TYPE_CARDS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={pendingType === item.id}
                    disabled={item.id === 'rotate'}
                    className={`calendar-shift-type-chip is-${item.tone}${pendingType === item.id ? ' is-selected' : ''}`}
                    onClick={() => {
                      if (item.id !== 'rotate') { setPendingType(item.id); setError(null); }
                    }}
                  >
                    <span className={`calendar-shift-type-icon is-${item.tone}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{item.label}</span>
                    {item.id === 'rotate' ? <span className="module-status-pill is-inactive">در دست توسعه</span> : null}
                  </button>
                );
              })}
            </div>

            <footer className="calendar-shift-modal-footer">
              <button type="button" className="calendar-shift-wizard-save" onClick={() => { if (!pendingType) { setError('نوع شیفت را انتخاب کنید.'); return; } setSelectedType(pendingType); }}>ادامه</button>
              <button type="button" className="calendar-shift-modal-cancel" onClick={handleClose}>
                انصراف
              </button>
            </footer>
          </>
        )}
      </MinimalScroll>

      {changeTypeConfirmOpen && mode === 'create' ? (
        <div className="fixed inset-0 z-[110] bg-black/65" onClick={() => setChangeTypeConfirmOpen(false)}>
          <div
            className="fixed left-1/2 top-1/2 z-[111] w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-slate-900 p-4 text-right text-slate-100"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-lg font-black text-white">تغییر نوع شیفت</div>
            <p className="mt-3 text-sm leading-7 text-slate-300">با تغییر نوع شیفت، تنظیمات زمانی واردشده برای نوع فعلی پاک می‌شود. آیا ادامه می‌دهید؟</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedType(null);
                  setPendingType(null);
                  setChangeTypeConfirmOpen(false);
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white"
              >
                تغییر نوع
              </button>
              <button type="button" onClick={() => setChangeTypeConfirmOpen(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm">
                انصراف
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <RotateShiftComingSoonModal open={rotateComingSoonOpen} onClose={() => setRotateComingSoonOpen(false)} />
    </div>,
    document.body,
  );
}
