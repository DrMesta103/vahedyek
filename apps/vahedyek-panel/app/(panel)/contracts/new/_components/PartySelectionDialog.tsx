'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Search, UserRound } from 'lucide-react';
import { ContractModal } from './ContractModal';
import { Input } from '@repo/ui';
import { getEntityLabels, getTypeLabel, type DirectoryItem, type EntityKind, type PartyRow, type PersonType } from './partiesTypes';

export function PartySelectionDialog({
  open,
  onClose,
  kind,
  partnerSource,
  rows,
  naturalItems,
  legalItems,
  onCreateItem,
  onAddSelected,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  kind: EntityKind;
  /** فقط برای `kind="partner"`: منبع لیست طرف اول. */
  partnerSource?: 'partners' | 'shareholders';
  rows: PartyRow[];
  naturalItems: DirectoryItem[];
  legalItems: DirectoryItem[];
  onCreateItem: (personType: PersonType, name: string) => Promise<DirectoryItem | null>;
  onAddSelected: (items: DirectoryItem[]) => void;
  loading: boolean;
}) {
  const router = useRouter();
  const labels = getEntityLabels(kind);
  const partnerLabel = kind !== 'partner' ? null : partnerSource === 'partners' ? 'شرکا' : 'سهام‌داران';
  const [personTab, setPersonTab] = useState<PersonType>('natural');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItemMode, setNewItemMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const currentItems = personTab === 'natural' ? naturalItems : legalItems;
  const availableItems = useMemo(
    () =>
      currentItems.filter((item) => {
        const alreadyExists = rows.some((row) => row.id === item.id);
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return !alreadyExists && matchesSearch;
      }),
    [currentItems, rows, searchTerm],
  );

  const resetAndClose = () => {
    setSelectedIds([]);
    setSearchTerm('');
    setNewItemMode(false);
    setNewName('');
    setPersonTab('natural');
    onClose();
  };

  const handleAddSelected = () => {
    const selectedItems = currentItems.filter((item) => selectedIds.includes(item.id));
    if (!selectedItems.length) return;
    onAddSelected(selectedItems);
    setSelectedIds([]);
    setSearchTerm('');
    setNewItemMode(false);
    setNewName('');
  };

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCreating(true);
    const created = await onCreateItem(personTab, trimmed);
    setCreating(false);
    if (created) onAddSelected([created]);
    setNewName('');
    setNewItemMode(false);
    setSearchTerm('');
  };

  return (
    <ContractModal
      open={open}
      onClose={resetAndClose}
      title={`افزودن ${kind === 'buyer' ? 'طرف دوم' : kind === 'partner' ? 'طرف اول' : labels.singular}`}
      description={undefined}
      maxWidthClass="max-w-xl"
      centeredTitle
      footer={
        <>
          <button
            type="button"
            onClick={resetAndClose}
            className="min-w-[120px] rounded-full border border-[color-mix(in_srgb,var(--dark-teal)_45%,transparent)] bg-white px-6 py-2.5 text-sm font-bold text-[color-mix(in_srgb,var(--dark-teal)_92%,black)] transition hover:bg-slate-50"
          >
            لغو
          </button>
          <button
            type="button"
            onClick={handleAddSelected}
            disabled={!selectedIds.length}
            className="min-w-[140px] rounded-full bg-[color-mix(in_srgb,var(--dark-teal)_92%,black)] px-7 py-2.5 text-sm font-black text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ذخیره
          </button>
        </>
      }
    >
      <div className="space-y-5" dir="rtl" lang="fa">
        <div className="flex flex-col items-center justify-center gap-2 pt-1">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
            <UserRound className="h-7 w-7" aria-hidden />
          </span>
        </div>

        <div className="flex items-center justify-center gap-6">
          <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
            <input
              type="radio"
              name="party-person-type"
              checked={personTab === 'natural'}
              onChange={() => setPersonTab('natural')}
              className="h-4 w-4 accent-[color-mix(in_srgb,var(--dark-teal)_92%,black)]"
            />
            حقیقی
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
            <input
              type="radio"
              name="party-person-type"
              checked={personTab === 'legal'}
              onChange={() => setPersonTab('legal')}
              className="h-4 w-4 accent-[color-mix(in_srgb,var(--dark-teal)_92%,black)]"
            />
            حقوقی
          </label>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-11 rounded-2xl pl-10"
            placeholder="جستجو"
          />
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">
              در حال بارگذاری…
            </div>
          ) : availableItems.length ? (
            availableItems.map((item) => {
              const checked = selectedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setSelectedIds((current) => (current.includes(item.id) ? current.filter((itemId) => itemId !== item.id) : [...current, item.id]))
                  }
                  className={`relative flex w-full flex-row-reverse items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-right shadow-sm transition-colors ${
                    checked
                      ? 'border-[color-mix(in_srgb,var(--dark-teal)_40%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_18%,white)]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#ff9d72] text-white">
                    <UserRound className="h-6 w-6" aria-hidden />
                  </span>

                  <div className="min-w-0 flex-1 text-right">
                    <div className="truncate text-[14px] font-extrabold text-slate-800">{item.name}</div>
                    <div className="mt-1 text-[12px] font-semibold text-slate-600">
                      {getTypeLabel(item.personType)}
                    </div>
                  </div>

                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200/70 text-slate-600">
                    <MoreVertical className="h-5 w-5" aria-hidden />
                  </span>
                  {checked ? (
                    <span
                      className="absolute left-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700"
                      aria-hidden
                    >
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                  ) : null}
                </button>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-400">
              موردی پیدا نشد.
            </div>
          )}
        </div>

        {newItemMode ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <div className="text-right text-[12px] font-bold text-slate-700">
              نام {personTab === 'natural' ? 'شخص حقیقی' : 'شخص حقوقی'}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                className="h-11 flex-1 rounded-2xl"
                placeholder={personTab === 'natural' ? 'مثلا مهدی علینقی پور' : 'مثلا شرکت نمونه'}
              />
              <button
                type="button"
                onClick={() => void handleCreate()}
                disabled={!newName.trim() || creating}
                className="shrink-0 rounded-2xl bg-[color-mix(in_srgb,var(--dark-teal)_92%,black)] px-4 py-3 text-[12px] font-black text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? '...' : 'ثبت'}
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-start pt-2">
          <button
            type="button"
            onClick={() => {
              if (kind === 'buyer') {
                const returnTo = '/contracts/new?buyerDialog=1';
                router.push(`/business-settings/profile/buyers/new?kind=${personTab}&tab=${personTab}&returnTo=${encodeURIComponent(returnTo)}`);
                return;
              }
              if (kind === 'partner') {
                const returnTo = '/contracts/new?partnerDialog=1';
                if (partnerSource === 'partners') {
                  router.push(
                    `/business-settings/profile/partners/new?title=${encodeURIComponent('ثبت شریک')}&returnTo=${encodeURIComponent(returnTo)}`,
                  );
                } else {
                  router.push(
                    `/business-settings/profile/shareholders/new?kind=${personTab}&tab=${personTab}&returnTo=${encodeURIComponent(returnTo)}`,
                  );
                }
                return;
              }
              setNewItemMode(true);
            }}
            className="inline-flex items-center gap-3 rounded-full bg-[color-mix(in_srgb,var(--dark-teal)_92%,black)] px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/35 bg-white/10 text-xl leading-none">
              +
            </span>
            افزودن {kind === 'buyer' ? 'خریدار' : kind === 'partner' ? partnerLabel ?? labels.plural : labels.singular}
          </button>
        </div>
      </div>
    </ContractModal>
  );
}
