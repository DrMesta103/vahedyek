'use client';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  error?: string | null;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  confirmDisabled?: boolean;
  cancelDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  error,
  confirmLabel = '\u062a\u0627\u06cc\u06cc\u062f',
  cancelLabel = '\u0627\u0646\u0635\u0631\u0627\u0641',
  tone = 'default',
  confirmDisabled = false,
  cancelDisabled = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="confirm-dialog-backdrop" role="presentation" onClick={cancelDisabled ? undefined : onCancel}>
      <div
        className="confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="confirm-dialog-copy">
          <strong id="confirm-dialog-title">{title}</strong>
          <p>{description}</p>
          {error ? <p className="auth-alert auth-alert-error">{error}</p> : null}
        </div>

        <div className="confirm-dialog-actions">
          <button type="button" className="secondary-button" onClick={onCancel} disabled={cancelDisabled}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={tone === 'danger' ? 'confirm-dialog-danger-button' : 'primary-button'}
            onClick={onConfirm}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
