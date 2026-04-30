'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ChoiceCard } from './ChoiceCard';
import { ContractModal } from './ContractModal';
import { FieldLabel } from './FieldLabel';
import { Input } from '@repo/ui';
import { getEntityLabels, getTypeLabel, type DirectoryItem, type EntityKind, type PartyRow, type PersonType } from './partiesTypes';

export function PartySelectionDialog({
  open,
  onClose,
  kind,
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
  rows: PartyRow[];
  naturalItems: DirectoryItem[];
  legalItems: DirectoryItem[];
  onCreateItem: (personType: PersonType, name: string) => Promise<DirectoryItem | null>;
  onAddSelected: (items: DirectoryItem[]) => void;
  loading: boolean;
}) {
  const labels = getEntityLabels(kind);
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
      title={labels.modalTitle}
      description={`از بین ${labels.plural} حقیقی یا حقوقی انتخاب کنید یا ${labels.singular} جدید بسازید.`}
      maxWidthClass="max-w-4xl"
      centeredTitle
      footer={
        <>
          <button
            type="button"
            onClick={handleAddSelected}
            disabled={!selectedIds.length}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {labels.addSelected}
          </button>
          <button type="button" onClick={resetAndClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            انصراف
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2">
          <ChoiceCard title="حقیقی" active={personTab === 'natural'} onClick={() => setPersonTab('natural')} />
          <ChoiceCard title="حقوقی" active={personTab === 'legal'} onClick={() => setPersonTab('legal')} />
        </div>

        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-800">{labels.listTitle}</p>
              <p className="mt-1 text-xs text-gray-500">
                از بین {labels.plural} {personTab === 'natural' ? 'حقیقی' : 'حقوقی'} چند نفر را انتخاب کنید.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewItemMode((current) => !current);
                setNewName('');
              }}
              className="rounded-xl bg-white px-4 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-100"
            >
              افزودن {labels.singular} جدید
            </button>
          </div>

          {newItemMode ? (
            <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
              <FieldLabel label={`نام ${labels.singular} جدید`} />
              <Input
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                className="mt-2"
                placeholder={personTab === 'natural' ? 'مثلا محمد قاسمی' : `مثلا ${labels.singular} نوین`}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!newName.trim() || creating}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {creating ? 'در حال ثبت...' : `ثبت ${labels.singular} جدید`}
                </button>
              </div>
            </div>
          ) : null}

          <div className="relative mb-4">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="pr-10" placeholder={`جستجو در ${labels.plural}...`} />
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
                در حال بارگذاری اشخاص...
              </div>
            ) : availableItems.length ? (
              availableItems.map((item) => {
                const checked = selectedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedIds((current) => (current.includes(item.id) ? current.filter((itemId) => itemId !== item.id) : [...current, item.id]))}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-right transition-colors ${
                      checked ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          checked ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-400 bg-white text-transparent'
                        }`}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-current" />
                      </span>
                      <p className="font-medium text-gray-800">{item.name}</p>
                    </div>
                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500">
                      {getTypeLabel(item.personType)}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
                موردی برای نمایش پیدا نشد.
              </div>
            )}
          </div>
        </div>
      </div>
    </ContractModal>
  );
}
