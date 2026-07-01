'use client';

import { Settings2, Sparkles } from 'lucide-react';
import { ContractModal } from './ContractModal';

export function ContractDraftSettingsDialog({
  open,
  loading = false,
  error = '',
  onApplySettings,
  onStartBlank,
}: {
  open: boolean;
  loading?: boolean;
  error?: string;
  onApplySettings: () => void;
  onStartBlank: () => void;
}) {
  return (
    <ContractModal
      open={open}
      onClose={() => {}}
      title="Ø´Ø±ÙˆØ¹ Ù¾ÛŒØ´â€ŒÙ†ÙˆÛŒØ³ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯"
      description="Ø¨Ø±Ø§ÛŒ Ø³Ø§Ø®Øª Ù¾ÛŒØ´â€ŒÙ†ÙˆÛŒØ³ Ø¬Ø¯ÛŒØ¯ Ù…ÛŒâ€ŒØªÙˆØ§Ù†ÛŒØ¯ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ù…Ø§Ù„ÛŒ Ø«Ø¨Øªâ€ŒØ´Ø¯Ù‡ Ø¯Ø± ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø±Ø§ Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ù…Ù‚Ø¯Ø§Ø± Ø§ÙˆÙ„ÛŒÙ‡ Ø¯Ø±ÛŒØ§ÙØª Ú©Ù†ÛŒØ¯."
      centeredTitle
      maxWidthClass="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={onStartBlank}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          >
            Ø´Ø±ÙˆØ¹ Ø®Ø§Ù„ÛŒ
          </button>
          <button
            type="button"
            onClick={onApplySettings}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-cyan-600 bg-cyan-600 px-4 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-wait disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {loading ? 'Ø¯Ø± Ø­Ø§Ù„ Ø¯Ø±ÛŒØ§ÙØª...' : 'Ø¯Ø±ÛŒØ§ÙØª Ø§Ø² ØªÙ†Ø¸ÛŒÙ…Ø§Øª'}
          </button>
        </>
      }
    >
      <div className="space-y-4 text-right">
        {error ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</div> : null}
        <div className="rounded-[8px] border border-cyan-100 bg-cyan-50/60 px-4 py-4">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-cyan-200 bg-white text-cyan-600">
              <Settings2 className="h-5 w-5" />
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-800">Ø¯Ø±ÛŒØ§ÙØª Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø§Ø² ØªÙ†Ø¸ÛŒÙ…Ø§Øª</h3>
              <p className="text-sm leading-7 text-slate-600">
                Ø§Ú¯Ø± Ø§ÛŒÙ† Ú¯Ø²ÛŒÙ†Ù‡ Ø±Ø§ ØªØ§ÛŒÛŒØ¯ Ú©Ù†ÛŒØ¯ØŒ Ù…Ù‚Ø§Ø¯ÛŒØ± Ø«Ø¨Øªâ€ŒØ´Ø¯Ù‡ Ø¯Ø± ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ù…Ø§Ù„ÛŒ Ø¨Ù‡â€ŒØ¹Ù†ÙˆØ§Ù† Ù…Ø¨Ù†Ø§ÛŒ Ø§ÙˆÙ„ÛŒÙ‡ Ø§ÛŒÙ† Ù¾ÛŒØ´â€ŒÙ†ÙˆÛŒØ³ Ø§Ø¹Ù…Ø§Ù„ Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ùˆ Ø¨Ø¹Ø¯Ø§Ù‹ Ù‡Ù… Ù…ÛŒâ€ŒØªÙˆØ§Ù†ÛŒØ¯ Ù‡Ø± Ø¨Ø®Ø´ Ø±Ø§ Ø¬Ø¯Ø§Ú¯Ø§Ù†Ù‡ ØªØºÛŒÛŒØ± Ø¯Ù‡ÛŒØ¯.
              </p>
            </div>
          </div>
        </div>
        <p className="text-sm leading-7 text-slate-500">
          Ø¯Ø± ØµÙˆØ±Øª Ø§Ù†ØªØ®Ø§Ø¨ Â«Ø´Ø±ÙˆØ¹ Ø®Ø§Ù„ÛŒÂ»ØŒ Ù¾ÛŒØ´â€ŒÙ†ÙˆÛŒØ³ Ø¨Ø¯ÙˆÙ† Ø§Ø¹Ù…Ø§Ù„ Ù…Ù‚Ø§Ø¯ÛŒØ± ØªÙ†Ø¸ÛŒÙ…Ø§Øª Ø³Ø§Ø®ØªÙ‡ Ù…ÛŒâ€ŒØ´ÙˆØ¯ Ùˆ Ù‡Ø± Ø²Ù…Ø§Ù† Ø¨Ø®ÙˆØ§Ù‡ÛŒØ¯ Ù…ÛŒâ€ŒØªÙˆØ§Ù†ÛŒØ¯ Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ø±Ø§ Ø¯Ø³ØªÛŒ ÙˆØ§Ø±Ø¯ ÛŒØ§ ÙˆÛŒØ±Ø§ÛŒØ´ Ú©Ù†ÛŒØ¯.
        </p>
      </div>
    </ContractModal>
  );
}


