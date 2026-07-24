'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@repo/ui';
import { ContractModal } from './ContractModal';
import { getSelectionCardFields, hasMissingPrimaryData, PartySelectionOptionCard } from './PartySelectionOptionCard';
import { FirstPartyInfoEditDialog } from './FirstPartyInfoEditDialog';
import type { FirstPartySnapshot, RelatedParticipantOption } from './partiesTypes';

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
  const [quickEditItem, setQuickEditItem] = useState<RelatedParticipantOption | null>(null);
  const [editedSnapshots, setEditedSnapshots] = useState<Record<string, FirstPartySnapshot>>({});

  useEffect(() => {
    if (!open) return;
    setSearchTerm('');
    setPendingIds([]);
    setQuickEditItem(null);
    setEditedSnapshots({});
  }, [open]);

  const resolveItem = (item: RelatedParticipantOption): RelatedParticipantOption =>
    editedSnapshots[item.sourceId] ? { ...item, snapshot: editedSnapshots[item.sourceId] } : item;

  const availableItems = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('fa');
    return items
      .filter((item) => {
        if (selectedSourceIds.has(item.sourceId)) return false;
        if (!query) return true;
        return `${item.name} ${item.description ?? ''}`.toLocaleLowerCase('fa').includes(query);
      })
      .map((item) => (editedSnapshots[item.sourceId] ? { ...item, snapshot: editedSnapshots[item.sourceId] } : item));
  }, [editedSnapshots, items, searchTerm, selectedSourceIds]);

  const toggleItem = (item: RelatedParticipantOption) => {
    const resolved = resolveItem(item);
    if (hasMissingPrimaryData(resolved, 'natural_person')) return;
    setPendingIds((current) =>
      current.includes(resolved.sourceId) ? current.filter((id) => id !== resolved.sourceId) : [...current, resolved.sourceId],
    );
  };

  const handleQuickEditSave = (snapshot: FirstPartySnapshot) => {
    if (!quickEditItem) return;
    setEditedSnapshots((current) => ({ ...current, [quickEditItem.sourceId]: snapshot }));
    setPendingIds((current) => (current.includes(quickEditItem.sourceId) ? current : [...current, quickEditItem.sourceId]));
    setQuickEditItem(null);
  };

  return (
    <>
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
              className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              انصراف
            </button>
            <button
              type="button"
              disabled={!pendingIds.length}
              onClick={() =>
                onAddSelected(
                  items
                    .filter((item) => pendingIds.includes(item.sourceId))
                    .map((item) => {
                      const resolved = resolveItem(item);
                      return {
                        ...resolved,
                        name: resolved.snapshot?.fullName || resolved.name,
                      };
                    }),
                )
              }
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-sm font-bold text-[var(--theme-action-text)] transition-colors hover:bg-[var(--theme-action-bg-hover)] disabled:cursor-not-allowed disabled:opacity-50"
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
              className="h-11 rounded-lg pl-10 text-sm"
              placeholder={`جستجوی ${roleLabel}`}
              aria-label={`جستجوی ${roleLabel}`}
            />
          </div>

          <div className="space-y-2">
            {availableItems.length ? (
              availableItems.map((item) => {
                const complete = !hasMissingPrimaryData(item, 'natural_person');
                return (
                  <PartySelectionOptionCard
                    key={item.sourceId}
                    name={item.name}
                    roleLabel={roleLabel}
                    personType={item.personType}
                    fields={getSelectionCardFields(item)}
                    complete={complete}
                    selected={pendingIds.includes(item.sourceId)}
                    onSelect={() => toggleItem(item)}
                    onCompleteInfo={() => setQuickEditItem(item)}
                  />
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
                {searchTerm.trim() ? 'موردی مطابق جست‌وجو پیدا نشد.' : emptyMessage}
              </div>
            )}
          </div>
        </div>
      </ContractModal>

      <FirstPartyInfoEditDialog
        open={quickEditItem !== null}
        kind="natural_person"
        name={quickEditItem?.name}
        roleLabel={roleLabel}
        initialSnapshot={quickEditItem?.snapshot}
        mode="complete"
        onClose={() => setQuickEditItem(null)}
        onSave={handleQuickEditSave}
      />
    </>
  );
}
