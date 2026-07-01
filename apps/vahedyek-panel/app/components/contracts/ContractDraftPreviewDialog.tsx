'use client';

import { useEffect, useState } from 'react';
import { getContractDetails } from '../../lib/contractDraftClient';
import {
  ContractDraftPreviewContent,
  EMPTY_PREVIEW_CONTRACT_PAYLOAD,
  mapContractDetailsToPreviewPayload,
  type PreviewContractPayload,
} from './ContractDraftPreviewContent';

type ContractDraftPreviewDialogProps = {
  open: boolean;
  draftId: string | null;
  onClose: () => void;
};

export function ContractDraftPreviewDialog({ open, draftId, onClose }: ContractDraftPreviewDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState<PreviewContractPayload>(EMPTY_PREVIEW_CONTRACT_PAYLOAD);

  useEffect(() => {
    if (!open || !draftId) return;

    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getContractDetails(draftId);
        if (cancelled) return;
        setPayload(mapContractDetailsToPreviewPayload(data));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '???????? ????????? ????? ???.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, draftId]);

  useEffect(() => {
    if (!open) {
      setError('');
      setPayload(EMPTY_PREVIEW_CONTRACT_PAYLOAD);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contract-draft-preview-dialog-title"
      onClick={() => onClose()}
    >
      <div
        className="flex max-h-[min(92vh,900px)] w-full max-w-4xl flex-col overflow-hidden rounded-[8px] border border-[var(--border-color)] bg-[var(--surface)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="contract-draft-preview-dialog-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {loading ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 px-6 py-16 text-sm font-bold text-slate-500">
              ?? ??? ???????? ?????????�
            </div>
          ) : error ? (
            <div className="px-6 py-12 text-center text-sm font-bold text-rose-700">{error}</div>
          ) : (
            <>
              <span id="contract-draft-preview-dialog-title" className="sr-only">
                ????????? ???????? ???????
              </span>
              <ContractDraftPreviewContent
                layout="embedded"
                payload={payload}
                contractId={draftId ?? undefined}
                onClose={onClose}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

