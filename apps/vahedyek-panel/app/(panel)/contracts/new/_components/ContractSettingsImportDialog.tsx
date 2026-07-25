'use client';

import { DatabaseZap } from 'lucide-react';
import { ContractModal } from './ContractModal';

const DEFAULT_DESCRIPTION =
  'مقادیر فعلی این بخش با تنظیمات کسب‌وکار جایگزین می‌شود. بعداً می‌توانید هر فیلد را جداگانه ویرایش کنید.';

export function ContractSettingsImportDialog({
  open,
  loading = false,
  error = '',
  title,
  description = DEFAULT_DESCRIPTION,
  confirmLabel = 'سازگار کردن با تنظیمات',
  onConfirm,
  onClose,
}: {
  open: boolean;
  loading?: boolean;
  error?: string;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <ContractModal
      open={open}
      onClose={onClose}
      title={title}
      centeredTitle
      maxWidthClass="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-cyan-600 bg-cyan-600 px-4 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-wait disabled:opacity-60"
          >
            <DatabaseZap className="h-4 w-4" />
            {loading ? 'در حال سازگار کردن...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-right">
        {error ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div> : null}
        <p className="text-sm leading-7 text-slate-600">{description}</p>
      </div>
    </ContractModal>
  );
}
