'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { Input } from '@repo/ui';
import { ContractModal } from './ContractModal';
import { FirstPartyInfoEditDialog, type FirstPartyInfoEditKind } from './FirstPartyInfoEditDialog';
import {
  getSelectionCardFields,
  hasMissingPrimaryData,
  optionKey,
  PartySelectionOptionCard,
  PartySelectionRegisterButton,
  type SelectionCompletenessKind,
} from './PartySelectionOptionCard';
import type { FirstPartySnapshot, PartyOneMemberKind, RelatedParticipantOption } from './partiesTypes';

type SelectionTab = PartyOneMemberKind;

function roleLabelForTab(tab: SelectionTab) {
  if (tab === 'business') return 'کسب‌وکار';
  if (tab === 'legal_shareholder') return 'سهام‌دار حقوقی';
  return 'سهام‌دار حقیقی';
}

export function ShareholderSelectionDialog({
  open,
  onClose,
  naturalItems,
  legalItems,
  businessItems,
  selectedNaturalSourceIds,
  selectedLegalSourceIds,
  selectedBusinessSourceIds,
  initialTab = 'natural_shareholder',
  registrationLoading = false,
  onRegisterNew,
  onAddSelected,
}: {
  open: boolean;
  onClose: () => void;
  naturalItems: RelatedParticipantOption[];
  legalItems: RelatedParticipantOption[];
  businessItems: RelatedParticipantOption[];
  selectedNaturalSourceIds: Set<string>;
  selectedLegalSourceIds: Set<string>;
  selectedBusinessSourceIds: Set<string>;
  initialTab?: SelectionTab;
  registrationLoading?: boolean;
  onRegisterNew: (kind: 'natural' | 'legal') => void;
  onAddSelected: (items: RelatedParticipantOption[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<SelectionTab>('natural_shareholder');
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingKeys, setPendingKeys] = useState<string[]>([]);
  const [quickEditItem, setQuickEditItem] = useState<RelatedParticipantOption | null>(null);
  const [quickEditKind, setQuickEditKind] = useState<SelectionTab>('natural_shareholder');
  const [editedSnapshots, setEditedSnapshots] = useState<Record<string, FirstPartySnapshot>>({});

  useEffect(() => {
    if (!open) return;
    setActiveTab(initialTab);
    setSearchTerm('');
    setPendingKeys([]);
    setQuickEditItem(null);
    setEditedSnapshots({});
  }, [initialTab, open]);

  const currentItems =
    activeTab === 'business' ? businessItems : activeTab === 'natural_shareholder' ? naturalItems : legalItems;
  const selectedSourceIds =
    activeTab === 'business'
      ? selectedBusinessSourceIds
      : activeTab === 'natural_shareholder'
        ? selectedNaturalSourceIds
        : selectedLegalSourceIds;

  const resolveItem = (item: RelatedParticipantOption): RelatedParticipantOption =>
    editedSnapshots[item.sourceId] ? { ...item, snapshot: editedSnapshots[item.sourceId] } : item;

  const availableItems = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('fa');
    return currentItems
      .filter((item) => {
        if (selectedSourceIds.has(item.sourceId)) return false;
        if (!query) return true;
        return `${item.name} ${item.description ?? ''}`.toLocaleLowerCase('fa').includes(query);
      })
      .map((item) => (editedSnapshots[item.sourceId] ? { ...item, snapshot: editedSnapshots[item.sourceId] } : item));
  }, [currentItems, editedSnapshots, searchTerm, selectedSourceIds]);

  const allItems = useMemo(() => [...naturalItems, ...legalItems, ...businessItems], [businessItems, legalItems, naturalItems]);

  const getItemKind = (item: RelatedParticipantOption): SelectionTab =>
    businessItems.some((candidate) => candidate.sourceId === item.sourceId)
      ? 'business'
      : legalItems.some((candidate) => candidate.sourceId === item.sourceId)
        ? 'legal_shareholder'
        : 'natural_shareholder';

  const toggleItem = (item: RelatedParticipantOption) => {
    const resolved = resolveItem(item);
    if (hasMissingPrimaryData(resolved, getItemKind(resolved))) return;
    const key = optionKey(resolved);
    setPendingKeys((current) => (current.includes(key) ? current.filter((itemKey) => itemKey !== key) : [...current, key]));
  };

  const selectedItems = () =>
    allItems
      .filter((item) => pendingKeys.includes(optionKey(item)))
      .map((item) => resolveItem(item))
      .map((item) => ({
        ...item,
        name: item.snapshot?.fullName || item.snapshot?.legalName || item.name,
      }));

  const handleAddSelected = () => {
    const items = selectedItems();
    if (!items.length) return;
    const incomplete = items.find((item) => hasMissingPrimaryData(item, getItemKind(item)));
    if (incomplete) {
      setQuickEditKind(getItemKind(incomplete));
      setQuickEditItem(incomplete);
      return;
    }
    onAddSelected(items);
  };

  const openCompleteDialog = (item: RelatedParticipantOption) => {
    setQuickEditKind(getItemKind(item));
    setQuickEditItem(resolveItem(item));
  };

  const handleQuickEditSave = (snapshot: FirstPartySnapshot) => {
    if (!quickEditItem) return;
    const sourceId = quickEditItem.sourceId;
    setEditedSnapshots((current) => ({ ...current, [sourceId]: snapshot }));
    const key = optionKey(quickEditItem);
    setPendingKeys((current) => (current.includes(key) ? current : [...current, key]));
    setQuickEditItem(null);
  };

  return (
    <>
      <ContractModal
        open={open}
        onClose={onClose}
        title="افزودن طرف اول"
        description="کسب‌وکار یا سهام‌داران حقیقی و حقوقی را از پروفایل کسب‌وکار انتخاب کنید."
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
              disabled={!pendingKeys.length}
              onClick={handleAddSelected}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-sm font-bold text-[var(--theme-action-text)] transition-colors hover:bg-[var(--theme-action-bg-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              افزودن انتخاب‌شده‌ها{pendingKeys.length ? ` (${pendingKeys.length})` : ''}
            </button>
          </>
        }
      >
        <div className="space-y-4" dir="rtl" lang="fa">
          <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="نوع طرف اول">
            {(
              [
                { value: 'natural_shareholder', label: 'سهام‌دار حقیقی' },
                { value: 'legal_shareholder', label: 'سهام‌دار حقوقی' },
                { value: 'business', label: 'کسب‌وکار' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setSearchTerm('');
                }}
                className={`h-11 rounded-lg border text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-action-border)] ${
                  activeTab === tab.value
                    ? 'border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] text-[var(--theme-action-text)]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-11 rounded-lg pl-10 text-sm"
              placeholder="جستجوی طرف اول"
              aria-label="جستجوی طرف اول"
            />
          </div>

          {activeTab !== 'business' ? (
            <PartySelectionRegisterButton
              loading={registrationLoading}
              onClick={() => onRegisterNew(activeTab === 'natural_shareholder' ? 'natural' : 'legal')}
              icon={<UserPlus className="h-4 w-4" aria-hidden />}
              label={
                registrationLoading
                  ? 'در حال ذخیره پیش‌نویس...'
                  : activeTab === 'natural_shareholder'
                    ? 'ثبت سهام‌دار حقیقی جدید'
                    : 'ثبت سهام‌دار حقوقی جدید'
              }
            />
          ) : null}

          <div className="space-y-2" role="tabpanel">
            {availableItems.length ? (
              availableItems.map((item) => {
                const complete = !hasMissingPrimaryData(item, activeTab as SelectionCompletenessKind);
                return (
                  <PartySelectionOptionCard
                    key={optionKey(item)}
                    name={item.name}
                    roleLabel={roleLabelForTab(activeTab)}
                    personType={item.personType}
                    fields={getSelectionCardFields(item)}
                    complete={complete}
                    selected={pendingKeys.includes(optionKey(item))}
                    onSelect={() => toggleItem(item)}
                    onCompleteInfo={() => openCompleteDialog(item)}
                  />
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
                {searchTerm.trim()
                  ? 'موردی مطابق جست‌وجو پیدا نشد.'
                  : activeTab === 'business'
                    ? 'کسب‌وکار دیگری برای انتخاب وجود ندارد.'
                    : `سهام‌دار ${activeTab === 'natural_shareholder' ? 'حقیقی' : 'حقوقی'} دیگری برای انتخاب وجود ندارد.`}
              </div>
            )}
          </div>
        </div>
      </ContractModal>

      <FirstPartyInfoEditDialog
        open={quickEditItem !== null}
        kind={(quickEditKind === 'business' ? 'business_legal' : quickEditKind) as FirstPartyInfoEditKind}
        name={quickEditItem?.name}
        roleLabel={quickEditItem ? roleLabelForTab(quickEditKind) : undefined}
        initialSnapshot={quickEditItem?.snapshot}
        mode="complete"
        onClose={() => setQuickEditItem(null)}
        onSave={handleQuickEditSave}
      />
    </>
  );
}
