'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, Search, Trash2, User, X } from 'lucide-react';
import { FormBox } from './FormBox';
import { ChoiceCard } from './ChoiceCard';
import { FieldLabel } from './FieldLabel';
import { StickySubmitBar } from './StickySubmitBar';
import { Input } from '../../../../components/ui/input';
import type { PersonType, ShareMode } from '../../../../types/contract';

type DirectoryItem = {
  id: string;
  name: string;
  personType: PersonType;
};

type PartyRow = DirectoryItem & {
  shareValue: number;
  locked?: boolean;
};

type EntityKind = 'partner' | 'buyer';
type PartyKey = 'party-one' | 'party-two';

const NATURAL_PARTNERS: DirectoryItem[] = [
  { id: 'partner-natural-1', name: 'علی رضایی', personType: 'natural' },
  { id: 'partner-natural-2', name: 'مریم احمدی', personType: 'natural' },
  { id: 'partner-natural-3', name: 'حسین کریمی', personType: 'natural' },
];

const LEGAL_PARTNERS: DirectoryItem[] = [
  { id: 'partner-legal-1', name: 'شرکت فپکو', personType: 'legal' },
  { id: 'partner-legal-2', name: 'شرکت توسعه سپهر', personType: 'legal' },
  { id: 'partner-legal-3', name: 'موسسه سرمایه گستر', personType: 'legal' },
];

const NATURAL_BUYERS: DirectoryItem[] = [
  { id: 'buyer-natural-1', name: 'سارا محمدی', personType: 'natural' },
  { id: 'buyer-natural-2', name: 'رضا عباسی', personType: 'natural' },
  { id: 'buyer-natural-3', name: 'نرگس یوسفی', personType: 'natural' },
];

const LEGAL_BUYERS: DirectoryItem[] = [
  { id: 'buyer-legal-1', name: 'شرکت افق سازان', personType: 'legal' },
  { id: 'buyer-legal-2', name: 'شرکت آتیه مسکن', personType: 'legal' },
  { id: 'buyer-legal-3', name: 'گروه سرمایه گذاری پرگاس', personType: 'legal' },
];

const DEFAULT_PARTY_ONE: PartyRow = {
  id: 'partner-legal-1',
  name: 'شرکت فپکو',
  personType: 'legal',
  shareValue: 6,
  locked: true,
};

const PARTY_TOTALS: Record<ShareMode, number> = {
  dang: 6,
  percent: 100,
};

function roundShare(value: number) {
  return Math.round(value * 100) / 100;
}

function clampShare(value: number, mode: ShareMode) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(PARTY_TOTALS[mode], value));
}

function convertShare(value: number, from: ShareMode, to: ShareMode) {
  if (from === to) return roundShare(value);
  if (from === 'dang' && to === 'percent') return roundShare((value / 6) * 100);
  return roundShare((value / 100) * 6);
}

function getTypeLabel(personType: PersonType) {
  return personType === 'natural' ? 'حقیقی' : 'حقوقی';
}

function getEntityLabels(kind: EntityKind) {
  return kind === 'partner'
    ? {
        singular: 'شریک',
        plural: 'شرکا',
        addButton: 'افزودن طرف اول',
        modalTitle: 'افزودن طرف اول',
        listTitle: 'فهرست شرکا',
        formTitle: 'فهرست طرف‌های طرف اول',
        formDescription: 'هر شریک را اضافه کنید و بعد سهم هر کدام را در همین صفحه تنظیم کنید.',
        addSelected: 'افزودن انتخاب‌شده‌ها',
      }
    : {
        singular: 'خریدار',
        plural: 'خریداران',
        addButton: 'افزودن طرف دوم',
        modalTitle: 'افزودن طرف دوم',
        listTitle: 'فهرست خریداران',
        formTitle: 'فهرست طرف‌های طرف دوم',
        formDescription: 'هر خریدار را اضافه کنید و بعد سهم هر کدام را در همین صفحه تنظیم کنید.',
        addSelected: 'افزودن انتخاب‌شده‌ها',
      };
}

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-4xl rounded-3xl border border-gray-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div className="w-full text-center">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            {description ? <p className="mt-2 text-sm text-gray-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        <div className="flex justify-start gap-3 border-t border-gray-100 px-6 py-4">{footer}</div>
      </div>
    </div>
  );
}

function PartySelectionDialog({
  open,
  onClose,
  kind,
  rows,
  naturalItems,
  legalItems,
  onCreateItem,
  onAddSelected,
}: {
  open: boolean;
  onClose: () => void;
  kind: EntityKind;
  rows: PartyRow[];
  naturalItems: DirectoryItem[];
  legalItems: DirectoryItem[];
  onCreateItem: (personType: PersonType, name: string) => void;
  onAddSelected: (items: DirectoryItem[]) => void;
}) {
  const labels = getEntityLabels(kind);
  const [personTab, setPersonTab] = useState<PersonType>('natural');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItemMode, setNewItemMode] = useState(false);
  const [newName, setNewName] = useState('');

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

  const handleToggle = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]));
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

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreateItem(personTab, trimmed);
    setNewName('');
    setNewItemMode(false);
    setSearchTerm('');
  };

  const handleClose = () => {
    setSelectedIds([]);
    setSearchTerm('');
    setNewItemMode(false);
    setNewName('');
    setPersonTab('natural');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={labels.modalTitle}
      description={`از بین ${labels.plural} حقیقی یا حقوقی انتخاب کنید یا ${labels.singular} جدید بسازید.`}
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
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
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
                placeholder={personTab === 'natural' ? 'مثلاً محمد قاسمی' : `مثلاً ${labels.singular} نوین`}
              />
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ثبت {labels.singular} جدید
                </button>
              </div>
            </div>
          ) : null}

          <div className="mb-4 relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pr-10"
              placeholder={`جستجو در ${labels.plural}...`}
            />
          </div>

          <div className="space-y-3">
            {availableItems.length ? (
              availableItems.map((item) => {
                const checked = selectedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggle(item.id)}
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
    </Modal>
  );
}

function PartySection({
  title,
  description,
  rows,
  shareMode,
  onShareModeChange,
  onShareChange,
  onRemove,
  addButtonLabel,
  onOpenDialog,
}: {
  title: string;
  description: string;
  rows: PartyRow[];
  shareMode: ShareMode;
  onShareModeChange: (mode: ShareMode) => void;
  onShareChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  addButtonLabel: string;
  onOpenDialog: () => void;
}) {
  return (
    <>
      <FormBox title={`تنظیم سهم ${title}`} description="فقط نوع سهم را انتخاب کنید و سپس سهم هر ردیف را در لیست پایین تغییر دهید.">
        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">نوع سهم</p>
              <p className="mt-1 text-xs text-gray-500">نوع ثبت سهم را بین دانگ و درصد انتخاب کنید.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <ChoiceCard title="دانگ" active={shareMode === 'dang'} onClick={() => onShareModeChange('dang')} />
              <ChoiceCard title="درصد" active={shareMode === 'percent'} onClick={() => onShareModeChange('percent')} />
            </div>
          </div>
        </div>
      </FormBox>

      <FormBox title={title} description={description}>
        <div className="space-y-4">
          {rows.map((row) => (
            <div key={row.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                    {row.personType === 'natural' ? <User className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-800">{row.name}</p>
                      <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600">
                        {getTypeLabel(row.personType)}
                      </span>
                      {row.locked ? (
                        <span className="rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-xs text-blue-700">
                          پیش‌فرض
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">شناسه: {row.id}</p>
                  </div>
                </div>

                <div className="min-w-44">
                  <FieldLabel label={`سهم (${shareMode === 'dang' ? 'دانگ' : 'درصد'})`} />
                  <Input
                    type="number"
                    min={0}
                    max={PARTY_TOTALS[shareMode]}
                    step="0.01"
                    value={row.shareValue === 0 ? '' : row.shareValue}
                    onChange={(event) => onShareChange(row.id, event.target.value)}
                    className="mt-2"
                    placeholder={shareMode === 'dang' ? 'مثلاً 1.5' : 'مثلاً 25'}
                  />
                </div>

                <div className="flex justify-end lg:self-end">
                  <button
                    type="button"
                    onClick={() => onRemove(row.id)}
                    disabled={row.locked}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-rose-200 bg-white px-4 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={onOpenDialog}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              <Plus className="h-4 w-4" />
              {addButtonLabel}
            </button>
          </div>
        </div>
      </FormBox>
    </>
  );
}

export function PartiesStep({ title }: { stepId: string; title: string }) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<PartyKey>('party-one');

  const [partyOneMode, setPartyOneMode] = useState<ShareMode>('dang');
  const [partyTwoMode, setPartyTwoMode] = useState<ShareMode>('dang');

  const [partyOneRows, setPartyOneRows] = useState<PartyRow[]>([DEFAULT_PARTY_ONE]);
  const [partyTwoRows, setPartyTwoRows] = useState<PartyRow[]>([]);

  const [partnerNaturals, setPartnerNaturals] = useState<DirectoryItem[]>(NATURAL_PARTNERS);
  const [partnerLegals, setPartnerLegals] = useState<DirectoryItem[]>(LEGAL_PARTNERS);
  const [buyerNaturals, setBuyerNaturals] = useState<DirectoryItem[]>(NATURAL_BUYERS);
  const [buyerLegals, setBuyerLegals] = useState<DirectoryItem[]>(LEGAL_BUYERS);

  const [partyOneDialogOpen, setPartyOneDialogOpen] = useState(false);
  const [partyTwoDialogOpen, setPartyTwoDialogOpen] = useState(false);

  const handleBack = () => router.push('/contracts/new');

  const updateRowShare = (
    rows: PartyRow[],
    id: string,
    rawValue: string,
    mode: ShareMode,
  ) => {
    const parsed = rawValue === '' ? 0 : Number(rawValue);
    const otherTotal = rows.filter((row) => row.id !== id).reduce((sum, row) => sum + row.shareValue, 0);
    const maxForRow = Math.max(0, PARTY_TOTALS[mode] - otherTotal);
    const nextValue = Math.min(clampShare(parsed, mode), maxForRow);

    return rows.map((row) => (row.id === id ? { ...row, shareValue: roundShare(nextValue) } : row));
  };

  const convertRows = (rows: PartyRow[], from: ShareMode, to: ShareMode) =>
    rows.map((row) => ({
      ...row,
      shareValue: convertShare(row.shareValue, from, to),
    }));

  const handlePartyOneModeChange = (nextMode: ShareMode) => {
    if (nextMode === partyOneMode) return;
    setPartyOneRows((current) => convertRows(current, partyOneMode, nextMode));
    setPartyOneMode(nextMode);
  };

  const handlePartyTwoModeChange = (nextMode: ShareMode) => {
    if (nextMode === partyTwoMode) return;
    setPartyTwoRows((current) => convertRows(current, partyTwoMode, nextMode));
    setPartyTwoMode(nextMode);
  };

  const addRows = (currentRows: PartyRow[], items: DirectoryItem[]) => [
    ...currentRows,
    ...items
      .filter((item) => !currentRows.some((row) => row.id === item.id))
      .map((item) => ({
        ...item,
        shareValue: 0,
      })),
  ];

  const createDirectoryItem = (kind: EntityKind, personType: PersonType, name: string) => {
    const item = {
      id: `${kind}-${personType}-${Date.now()}`,
      name,
      personType,
    } satisfies DirectoryItem;

    if (kind === 'partner') {
      if (personType === 'natural') setPartnerNaturals((current) => [...current, item]);
      else setPartnerLegals((current) => [...current, item]);
      return;
    }

    if (personType === 'natural') setBuyerNaturals((current) => [...current, item]);
    else setBuyerLegals((current) => [...current, item]);
  };

  const partyOneLabels = getEntityLabels('partner');
  const partyTwoLabels = getEntityLabels('buyer');

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="mt-1 text-gray-500">طرف اول و طرف دوم را در یک صفحه مدیریت کنید و برای هر کدام سهم مستقل ثبت کنید.</p>
        </div>
        <button
          type="button"
          onClick={handleBack}
          className="rounded-md border border-gray-300 px-3.5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
        >
          بازگشت به مراحل
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
        <div className="grid gap-2 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setActiveTab('party-one')}
            className={`rounded-xl px-4 py-3 text-right transition-colors ${
              activeTab === 'party-one' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="font-semibold">طرف اول</div>
            <div className="mt-1 text-xs text-gray-500">تعریف شرکا و تنظیم سهم هر کدام</div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('party-two')}
            className={`rounded-xl px-4 py-3 text-right transition-colors ${
              activeTab === 'party-two' ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="font-semibold">طرف دوم</div>
            <div className="mt-1 text-xs text-gray-500">تعریف خریداران و تنظیم سهم هر کدام</div>
          </button>
        </div>
      </div>

      {activeTab === 'party-one' ? (
        <PartySection
          title={partyOneLabels.formTitle}
          description={partyOneLabels.formDescription}
          rows={partyOneRows}
          shareMode={partyOneMode}
          onShareModeChange={handlePartyOneModeChange}
          onShareChange={(id, value) => setPartyOneRows((current) => updateRowShare(current, id, value, partyOneMode))}
          onRemove={(id) => setPartyOneRows((current) => current.filter((row) => row.id !== id))}
          addButtonLabel={partyOneLabels.addButton}
          onOpenDialog={() => setPartyOneDialogOpen(true)}
        />
      ) : (
        <PartySection
          title={partyTwoLabels.formTitle}
          description={partyTwoLabels.formDescription}
          rows={partyTwoRows}
          shareMode={partyTwoMode}
          onShareModeChange={handlePartyTwoModeChange}
          onShareChange={(id, value) => setPartyTwoRows((current) => updateRowShare(current, id, value, partyTwoMode))}
          onRemove={(id) => setPartyTwoRows((current) => current.filter((row) => row.id !== id))}
          addButtonLabel={partyTwoLabels.addButton}
          onOpenDialog={() => setPartyTwoDialogOpen(true)}
        />
      )}

      <StickySubmitBar label="ثبت اطلاعات طرفین" onClick={() => router.push('/contracts/new')} />

      <PartySelectionDialog
        open={partyOneDialogOpen}
        onClose={() => setPartyOneDialogOpen(false)}
        kind="partner"
        rows={partyOneRows}
        naturalItems={partnerNaturals}
        legalItems={partnerLegals}
        onCreateItem={(personType, name) => createDirectoryItem('partner', personType, name)}
        onAddSelected={(items) => {
          setPartyOneRows((current) => addRows(current, items));
          setPartyOneDialogOpen(false);
        }}
      />

      <PartySelectionDialog
        open={partyTwoDialogOpen}
        onClose={() => setPartyTwoDialogOpen(false)}
        kind="buyer"
        rows={partyTwoRows}
        naturalItems={buyerNaturals}
        legalItems={buyerLegals}
        onCreateItem={(personType, name) => createDirectoryItem('buyer', personType, name)}
        onAddSelected={(items) => {
          setPartyTwoRows((current) => addRows(current, items));
          setPartyTwoDialogOpen(false);
        }}
      />
    </div>
  );
}
