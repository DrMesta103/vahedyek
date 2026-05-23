'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PanelFormModal, PanelFormModalActions } from '../../../components/PanelFormModal';
import { requestReasonLabels, requestReasonTabLabels } from '../../../lib/constants';
import { createRequestReasonFromDialogAction } from '../../../lib/actions';

type RequestReasonCategory = keyof typeof requestReasonLabels;

type CreateRequestReasonDialogProps = {
  open: boolean;
  category: RequestReasonCategory;
  onClose: () => void;
};

export function CreateRequestReasonDialog({ open, category, onClose }: CreateRequestReasonDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryLabel = requestReasonTabLabels[category] ?? requestReasonLabels[category];

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setDescription('');
    setIsActive(true);
    setError(null);
  }, [open]);

  const canSubmit = Boolean(title.trim());

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;

    setSaving(true);
    setError(null);

    try {
      await createRequestReasonFromDialogAction({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        isActive,
      });
      onClose();
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'ثبت علت انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PanelFormModal
      open={open}
      title="علت درخواست جدید"
      lead={`ثبت علت جدید برای ${categoryLabel}`}
      onClose={onClose}
      error={error}
      footer={
        <PanelFormModalActions
          submitLabel="تایید"
          saving={saving}
          disabled={!canSubmit}
          onSubmit={() => void handleSubmit()}
          onCancel={onClose}
        />
      }
    >
      <div className="calendar-create-year-bar">
        <span>دسته</span>
        <strong>{categoryLabel}</strong>
      </div>

      <label className="calendar-create-field">
        <span>
          عنوان <em>*</em>
        </span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="عنوان علت درخواست"
          autoFocus
        />
      </label>

      <label className="calendar-create-field">
        <span>توضیحات</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="توضیحات (اختیاری)"
          rows={3}
        />
      </label>

      <div className="calendar-create-official-row">
        <span>فعال باشد</span>
        <button
          type="button"
          className={`calendar-create-check${isActive ? ' is-on' : ''}`}
          role="checkbox"
          aria-checked={isActive}
          aria-label="فعال باشد"
          onClick={() => setIsActive((prev) => !prev)}
        >
          <span className="calendar-create-check-mark" aria-hidden />
        </button>
      </div>
    </PanelFormModal>
  );
}
