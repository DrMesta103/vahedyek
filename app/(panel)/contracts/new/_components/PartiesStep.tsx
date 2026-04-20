'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus, Search, Trash2, User, X } from 'lucide-react';
import { FormBox } from './FormBox';
import { ChoiceCard } from './ChoiceCard';
import { FieldLabel } from './FieldLabel';
import { StickySubmitBar } from './StickySubmitBar';
import { useContractFlowBasePath } from './useContractFlowBasePath';
import { Input } from '../../../../components/ui/input';
import {
  createDirectoryPerson,
  ensureActiveDraftId,
  getReferenceData,
  getStepData,
  saveStepData,
  type ReferenceDataResponse,
} from '../../../../lib/contractDraftClient';
import type { ContractPartiesData, PersonType, ShareMode } from '../../../../types/contract';

type DirectoryItem = {
  id: string;
  name: string;
  personType: PersonType;
  directoryId?: string | null;
};

type PartyRow = DirectoryItem & {
  shareValue: number;
  isPrimary: boolean;
  locked?: boolean;
};

type EntityKind = 'partner' | 'buyer';
type PartyKey = 'party-one' | 'party-two';

const DEFAULT_PARTY_ONE: PartyRow = {
  id: 'partner-legal-1',
  directoryId: 'partner-legal-1',
  name: 'شرکت فپکو',
  personType: 'legal',
  shareValue: 6,
  isPrimary: true,
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
  children: ReactNode;
  footer: ReactNode;
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

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCreating(true);
    const created = await onCreateItem(personTab, trimmed);
    setCreating(false);
    if (created) {
      onAddSelected([created]);
    }
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
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="pr-10"
              placeholder={`جستجو در ${labels.plural}...`}
            />
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
  onPrimaryChange,
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
  onPrimaryChange: (id: string) => void;
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
                      {row.isPrimary ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700">
                          طرف اصلی
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

                <div className="flex flex-col items-end gap-2 lg:self-end">
                  {rows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => onPrimaryChange(row.id)}
                      className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors ${
                        row.isPrimary
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                          : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${row.isPrimary ? 'bg-emerald-600' : 'bg-gray-300'}`} />
                      {row.isPrimary ? 'طرف اصلی' : 'انتخاب به عنوان طرف اصلی'}
                    </button>
                  ) : null}

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
  const basePath = useContractFlowBasePath();

  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<PartyKey>('party-one');
  const [partyOneMode, setPartyOneMode] = useState<ShareMode>('dang');
  const [partyTwoMode, setPartyTwoMode] = useState<ShareMode>('dang');
  const [partyOneRows, setPartyOneRows] = useState<PartyRow[]>([DEFAULT_PARTY_ONE]);
  const [partyTwoRows, setPartyTwoRows] = useState<PartyRow[]>([]);
  const [partnerNaturals, setPartnerNaturals] = useState<DirectoryItem[]>([]);
  const [partnerLegals, setPartnerLegals] = useState<DirectoryItem[]>([]);
  const [buyerNaturals, setBuyerNaturals] = useState<DirectoryItem[]>([]);
  const [buyerLegals, setBuyerLegals] = useState<DirectoryItem[]>([]);
  const [partyOneDialogOpen, setPartyOneDialogOpen] = useState(false);
  const [partyTwoDialogOpen, setPartyTwoDialogOpen] = useState(false);
  const [directoryLoading, setDirectoryLoading] = useState(false);

  const applyReferenceData = (referenceData: ReferenceDataResponse) => {
    setPartnerNaturals(
      referenceData.directory.partner.natural.map((item) => ({ ...item, personType: 'natural' as const, directoryId: item.id })),
    );
    setPartnerLegals(
      referenceData.directory.partner.legal.map((item) => ({ ...item, personType: 'legal' as const, directoryId: item.id })),
    );
    setBuyerNaturals(
      referenceData.directory.buyer.natural.map((item) => ({ ...item, personType: 'natural' as const, directoryId: item.id })),
    );
    setBuyerLegals(
      referenceData.directory.buyer.legal.map((item) => ({ ...item, personType: 'legal' as const, directoryId: item.id })),
    );
  };

  const reloadReferenceData = async () => {
    setDirectoryLoading(true);
    try {
      const referenceData = await getReferenceData();
      applyReferenceData(referenceData);
    } finally {
      setDirectoryLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const id = await ensureActiveDraftId();
        const [referenceData, partiesData] = await Promise.all([
          getReferenceData(),
          getStepData<ContractPartiesData>(id, 'parties'),
        ]);

        if (!mounted) return;

        setDraftId(id);
        applyReferenceData(referenceData);

        if (partiesData) {
          setPartyOneMode(partiesData.partyOneMode);
          setPartyTwoMode(partiesData.partyTwoMode);
          setPartyOneRows(
            partiesData.partyOne.map((item) => ({
              id: item.personId,
              directoryId: item.directoryId ?? null,
              personType: item.personType,
              name: item.name,
              shareValue: item.share.value,
              isPrimary: Boolean(item.isPrimary),
              locked: item.personId === DEFAULT_PARTY_ONE.id,
            })),
          );
          setPartyTwoRows(
            partiesData.partyTwo.map((item) => ({
              id: item.personId,
              directoryId: item.directoryId ?? null,
              personType: item.personType,
              name: item.name,
              shareValue: item.share.value,
              isPrimary: Boolean(item.isPrimary),
            })),
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleBack = () => router.push(basePath);

  const updateRowShare = (rows: PartyRow[], id: string, rawValue: string, mode: ShareMode) => {
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

  const normalizePrimary = (rows: PartyRow[]) => {
    if (!rows.length) return rows;
    if (rows.some((row) => row.isPrimary)) return rows;

    return rows.map((row, index) => ({
      ...row,
      isPrimary: index === 0,
    }));
  };

  const setPrimaryRow = (rows: PartyRow[], id: string) =>
    rows.map((row) => ({
      ...row,
      isPrimary: row.id === id,
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

  const addRows = (currentRows: PartyRow[], items: DirectoryItem[]) =>
    normalizePrimary([
      ...currentRows,
      ...items
        .filter((item) => !currentRows.some((row) => row.id === item.id))
        .map((item) => ({
          ...item,
          shareValue: 0,
          isPrimary: currentRows.length === 0,
        })),
    ]);

  const removeRow = (rows: PartyRow[], id: string) => normalizePrimary(rows.filter((row) => row.id !== id));

  const createDirectoryItem = async (kind: EntityKind, personType: PersonType, name: string) => {
    const created = await createDirectoryPerson({
      role: kind,
      personType,
      name,
    });

    const item = {
      id: created.id,
      directoryId: created.id,
      name: created.name,
      personType: created.personType,
    } satisfies DirectoryItem;

    if (kind === 'partner') {
      if (personType === 'natural') setPartnerNaturals((current) => [...current, item]);
      else setPartnerLegals((current) => [...current, item]);
    } else if (personType === 'natural') {
      setBuyerNaturals((current) => [...current, item]);
    } else {
      setBuyerLegals((current) => [...current, item]);
    }

    return item;
  };

  const buildPayload = (): ContractPartiesData => ({
    partyOneMode,
    partyTwoMode,
    partyOne: partyOneRows.map((row) => ({
      personId: row.id,
      directoryId: row.directoryId ?? null,
      personType: row.personType,
      name: row.name,
      isPrimary: row.isPrimary,
      share: {
        value: row.shareValue,
        mode: partyOneMode,
      },
    })),
    partyTwo: partyTwoRows.map((row) => ({
      personId: row.id,
      directoryId: row.directoryId ?? null,
      personType: row.personType,
      name: row.name,
      isPrimary: row.isPrimary,
      share: {
        value: row.shareValue,
        mode: partyTwoMode,
      },
    })),
  });

  const handleSubmit = async () => {
    if (!draftId) return;

    setSaving(true);
    try {
      await saveStepData(draftId, 'parties', buildPayload());
      router.push(basePath);
    } finally {
      setSaving(false);
    }
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
          onPrimaryChange={(id) => setPartyOneRows((current) => setPrimaryRow(current, id))}
          onRemove={(id) => setPartyOneRows((current) => removeRow(current, id))}
          addButtonLabel={partyOneLabels.addButton}
          onOpenDialog={() => {
            void reloadReferenceData();
            setPartyOneDialogOpen(true);
          }}
        />
      ) : (
        <PartySection
          title={partyTwoLabels.formTitle}
          description={partyTwoLabels.formDescription}
          rows={partyTwoRows}
          shareMode={partyTwoMode}
          onShareModeChange={handlePartyTwoModeChange}
          onShareChange={(id, value) => setPartyTwoRows((current) => updateRowShare(current, id, value, partyTwoMode))}
          onPrimaryChange={(id) => setPartyTwoRows((current) => setPrimaryRow(current, id))}
          onRemove={(id) => setPartyTwoRows((current) => removeRow(current, id))}
          addButtonLabel={partyTwoLabels.addButton}
          onOpenDialog={() => {
            void reloadReferenceData();
            setPartyTwoDialogOpen(true);
          }}
        />
      )}

      <StickySubmitBar
        label="ثبت اطلاعات طرفین"
        loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'}
        disabled={loading || saving}
        onClick={handleSubmit}
      />

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
        loading={directoryLoading}
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
        loading={directoryLoading}
      />
    </div>
  );
}
