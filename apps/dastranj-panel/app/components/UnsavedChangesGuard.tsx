'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PanelFormModal } from './PanelFormModal';

type LeaveAction = () => void;

type UseUnsavedLeaveGuardOptions = {
  hasUnsavedChanges: boolean;
  onSaveAndLeave: () => boolean | Promise<boolean>;
  onDiscardAndLeave?: () => void;
  onBrowserBack?: () => void;
};

export function useUnsavedLeaveGuard({
  hasUnsavedChanges,
  onSaveAndLeave,
  onDiscardAndLeave,
  onBrowserBack,
}: UseUnsavedLeaveGuardOptions) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const pendingLeaveActionRef = useRef<LeaveAction | null>(null);
  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  const saveHandlerRef = useRef(onSaveAndLeave);
  const discardHandlerRef = useRef(onDiscardAndLeave);
  const browserBackHandlerRef = useRef(onBrowserBack);
  const allowBrowserBackRef = useRef(false);

  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  useEffect(() => {
    saveHandlerRef.current = onSaveAndLeave;
  }, [onSaveAndLeave]);

  useEffect(() => {
    discardHandlerRef.current = onDiscardAndLeave;
  }, [onDiscardAndLeave]);

  useEffect(() => {
    browserBackHandlerRef.current = onBrowserBack;
  }, [onBrowserBack]);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    pendingLeaveActionRef.current = null;
  }, []);

  const proceedLeave = useCallback(() => {
    const action = pendingLeaveActionRef.current;
    pendingLeaveActionRef.current = null;
    setDialogOpen(false);
    action?.();
  }, []);

  const requestLeave = useCallback((leaveAction: LeaveAction) => {
    if (!hasUnsavedChangesRef.current) {
      leaveAction();
      return;
    }
    pendingLeaveActionRef.current = leaveAction;
    setDialogOpen(true);
  }, []);

  const confirmSaveAndLeave = useCallback(async () => {
    setSaving(true);
    try {
      const saved = await saveHandlerRef.current();
      if (!saved) return;
      proceedLeave();
    } finally {
      setSaving(false);
    }
  }, [proceedLeave]);

  const confirmDiscardAndLeave = useCallback(() => {
    discardHandlerRef.current?.();
    proceedLeave();
  }, [proceedLeave]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChangesRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    // Duplicate the current entry so the first browser-back remains on this page and can be guarded.
    window.history.pushState({ __unsavedLeaveGuard: true }, '', window.location.href);

    const handlePopState = () => {
      if (allowBrowserBackRef.current) {
        allowBrowserBackRef.current = false;
        return;
      }

      const leaveCurrentPage = () => {
        allowBrowserBackRef.current = true;
        if (browserBackHandlerRef.current) {
          browserBackHandlerRef.current();
          return;
        }
        window.history.back();
      };

      if (!hasUnsavedChangesRef.current) {
        leaveCurrentPage();
        return;
      }

      pendingLeaveActionRef.current = leaveCurrentPage;
      setDialogOpen(true);
      window.history.pushState({ __unsavedLeaveGuard: true }, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    dialogOpen,
    saving,
    requestLeave,
    closeDialog,
    confirmSaveAndLeave,
    confirmDiscardAndLeave,
  };
}

export function UnsavedChangesDialog({
  open,
  saving,
  onSaveAndLeave,
  onDiscardAndLeave,
  onCancel,
}: {
  open: boolean;
  saving?: boolean;
  onSaveAndLeave: () => void;
  onDiscardAndLeave: () => void;
  onCancel: () => void;
}) {
  return (
    <PanelFormModal
      open={open}
      title="تغییرات ذخیره نشده"
      lead="در این مرحله تغییرات ذخیره نشده دارید. یکی از گزینه‌های زیر را انتخاب کنید."
      onClose={onCancel}
      footer={
        <div className="unsaved-guard-actions">
          <button
            type="button"
            className="calendar-create-submit unsaved-guard-action is-primary"
            onClick={onSaveAndLeave}
            disabled={saving}
          >
            {saving ? 'در حال ذخیره...' : 'ذخیره و بازگشت'}
          </button>
          <button
            type="button"
            className="calendar-create-cancel unsaved-guard-action is-danger"
            onClick={onDiscardAndLeave}
            disabled={saving}
          >
            ذخیره نشود
          </button>
          <button
            type="button"
            className="calendar-create-cancel unsaved-guard-action is-secondary"
            onClick={onCancel}
            disabled={saving}
          >
            انصراف
          </button>
        </div>
      }
    >
      <div className="unsaved-guard-dialog" />
    </PanelFormModal>
  );
}
