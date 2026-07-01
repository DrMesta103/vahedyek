'use client';

import { DatabaseZap } from 'lucide-react';
import { ContractModal } from './ContractModal';

export function ContractSettingsImportDialog({
  open,
  loading = false,
  error = '',
  title,
  description,
  confirmLabel = 'Ø¯Ø±ÛŒØ§ÙØª Ø§Ø² ØªÙ†Ø¸ÛŒÙ…Ø§Øª',
  onConfirm,
  onClose,
}: {
  open: boolean;
  loading?: boolean;
  error?: string;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <ContractModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
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
            Ø§Ù†ØµØ±Ø§Ù
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-cyan-600 bg-cyan-600 px-4 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-wait disabled:opacity-60"
          >
            <DatabaseZap className="h-4 w-4" />
            {loading ? 'Ø¯Ø± Ø­Ø§Ù„ Ø¯Ø±ÛŒØ§ÙØª...' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="space-y-4 text-right">
        {error ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div> : null}
        <div className="rounded-[8px] border border-cyan-100 bg-cyan-50/60 px-4 py-4">
          <p className="text-sm leading-7 text-slate-700">{description}</p>
        </div>
        <p className="text-sm leading-7 text-slate-500">
          Ø¨Ø¹Ø¯ Ø§Ø² ØªØ§ÛŒÛŒØ¯ØŒ Ù…Ù‚Ø¯Ø§Ø±Ù‡Ø§ÛŒ ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ù…Ù‚Ø¯Ø§Ø± Ø§ÙˆÙ„ÛŒÙ‡ Ø¯Ø± Ù¾ÛŒØ´â€ŒÙ†ÙˆÛŒØ³ ÙØ¹Ù„ÛŒ Ù‚Ø±Ø§Ø± Ù…ÛŒâ€ŒÚ¯ÛŒØ±Ù†Ø¯ Ùˆ Ø¨Ø¹Ø¯Ø§Ù‹ Ù‡Ù… Ù…ÛŒâ€ŒØªÙˆØ§Ù†ÛŒØ¯ Ù‡Ø± ÙÛŒÙ„Ø¯ Ø±Ø§ Ø¬Ø¯Ø§Ú¯Ø§Ù†Ù‡ ÙˆÛŒØ±Ø§ÛŒØ´ Ú©Ù†ÛŒØ¯.
        </p>
      </div>
    </ContractModal>
  );
}


