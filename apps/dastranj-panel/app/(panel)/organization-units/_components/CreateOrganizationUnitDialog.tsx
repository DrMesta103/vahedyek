'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PanelFormModal, PanelFormModalActions } from '../../../components/PanelFormModal';
import { createOrganizationUnitFromDialogAction } from '../../../lib/actions';

type CreateOrganizationUnitDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateOrganizationUnitDialog({ open, onClose }: CreateOrganizationUnitDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setDescription('');
    setError(null);
  }, [open]);

  const canSubmit = Boolean(title.trim());

  const handleSubmit = async () => {
    if (!canSubmit || saving) return;

    setSaving(true);
    setError(null);

    try {
      await createOrganizationUnitFromDialogAction({
        title: title.trim(),
        description: description.trim() || undefined,
      });
      onClose();
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'ثبت واحد انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PanelFormModal
      open={open}
      title="واحد سازمانی جدید"
      lead="واحدهای منابع انسانی، مالی، عملیات و ... را اینجا تعریف کنید."
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
      <label className="calendar-create-field">
        <span>
          عنوان <em>*</em>
        </span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="عنوان واحد سازمانی"
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
    </PanelFormModal>
  );
}
