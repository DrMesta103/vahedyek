'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Search, UserRound } from 'lucide-react';
import { Input } from '@repo/ui';
import { ContractModal } from './ContractModal';
import type { RelatedParticipantOption } from './partiesTypes';

export function FirstPartyParticipantSelectionDialog({
  open,
  onClose,
  title,
  description,
  roleLabel,
  emptyMessage,
  items,
  selectedSourceIds,
  onAddSelected,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  roleLabel: string;
  emptyMessage: string;
  items: RelatedParticipantOption[];
  selectedSourceIds: Set<string>;
  onAddSelected: (items: RelatedParticipantOption[]) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setSearchTerm('');
    setPendingIds([]);
  }, [open]);

  const availableItems = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('fa');
    return items.filter((item) => {
      if (selectedSourceIds.has(item.sourceId)) return false;
      if (!query) return true;
      return `${item.name} ${item.description ?? ''}`.toLocaleLowerCase('fa').includes(query);
    });
  }, [items, searchTerm, selectedSourceIds]);

  const toggleItem = (sourceId: string) => {
    setPendingIds((current) =>
      current.includes(sourceId) ? current.filter((item) => item !== sourceId) : [...current, sourceId],
    );
  };

  return (
    <ContractModal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      maxWidthClass="max-w-xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            انصراف
          </button>
          <button
            type="button"
            disabled={!pendingIds.length}
            onClick={() => onAddSelected(items.filter((item) => pendingIds.includes(item.sourceId)))}
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-sm font-bold text-[var(--theme-action-text)] transition-colors hover:bg-[var(--theme-action-bg-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            افزودن انتخاب‌شده‌ها{pendingIds.length ? ` (${pendingIds.length})` : ''}
          </button>
        </>
      }
    >
      <div className="space-y-4" dir="rtl" lang="fa">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-11 rounded-[8px] pl-10 text-sm"
            placeholder="جست‌وجو بر اساس نام یا اطلاعات تماس"
            aria-label={`جست‌وجوی ${roleLabel}`}
          />
        </div>

        <div className="space-y-2">
          {availableItems.length ? (
            availableItems.map((item) => {
              const selected = pendingIds.includes(item.sourceId);
              return (
                <button
                  key={item.sourceId}
                  type="button"
                  onClick={() => toggleItem(item.sourceId)}
                  aria-pressed={selected}
                  className={`flex min-h-14 w-full items-center gap-3 rounded-[8px] border px-3 py-2.5 text-right transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-action-border)] ${
                    selected
                      ? 'border-[var(--theme-action-border)] bg-[var(--theme-action-bg)]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <UserRound className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-800">{item.name}</span>
                      <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700">
                        {roleLabel}
                      </span>
                    </span>
                    {item.description ? <span className="mt-1 block text-xs font-semibold text-slate-500">{item.description}</span> : null}
                  </span>
                  <span
                    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                      selected ? 'border-[var(--theme-action-border)] bg-white text-[var(--theme-action-text)]' : 'border-slate-200 text-transparent'
                    }`}
                    aria-hidden
                  >
                    <Check className="h-4 w-4" />
                  </span>
                </button>
              );
            })
          ) : (
            <div className="rounded-[8px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
              {searchTerm.trim() ? 'موردی مطابق جست‌وجو پیدا نشد.' : emptyMessage}
            </div>
          )}
        </div>
      </div>
    </ContractModal>
  );
}
