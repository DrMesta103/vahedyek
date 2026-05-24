'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { MinimalScroll } from './MinimalScroll';

type PanelFormModalProps = {
  open: boolean;
  title: string;
  lead?: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  error?: string | null;
};

export function PanelFormModal({ open, title, lead, onClose, children, footer, error }: PanelFormModalProps) {
  const ignoreBackdropClickRef = useRef(false);

  useEffect(() => {
    if (!open) return;

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

  if (!open || typeof document === 'undefined') return null;

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
        aria-labelledby="panel-form-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="calendar-create-modal-head">
          <h2 id="panel-form-modal-title">{title}</h2>
          {lead ? <p className="calendar-event-modal-lead">{lead}</p> : null}
        </header>

        <div className="calendar-create-modal-body">{children}</div>

        {error ? <p className="calendar-create-error">{error}</p> : null}

        <footer className="calendar-create-modal-footer">{footer}</footer>
      </MinimalScroll>
    </div>,
    document.body,
  );
}

export function PanelFormModalActions({
  submitLabel,
  cancelLabel = 'انصراف',
  saving,
  savingLabel,
  disabled,
  onSubmit,
  onCancel,
}: {
  submitLabel: string;
  cancelLabel?: string;
  saving?: boolean;
  savingLabel?: string;
  disabled?: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <button type="button" className="calendar-create-submit" disabled={disabled || saving} onClick={onSubmit}>
        {saving ? savingLabel ?? 'در حال ثبت...' : submitLabel}
      </button>
      <button type="button" className="calendar-create-cancel" disabled={saving} onClick={onCancel}>
        {cancelLabel}
      </button>
    </>
  );
}
