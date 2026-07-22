'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, Check, Search, UserPlus, UserRound } from 'lucide-react';
import { Input } from '@repo/ui';
import { ContractModal } from './ContractModal';
import type { FirstPartySnapshot, PartyOneMemberKind, RelatedParticipantOption } from './partiesTypes';

type SelectionTab = PartyOneMemberKind;

function optionKey(item: RelatedParticipantOption) {
  return `${item.personType}:${item.sourceId}`;
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
  const availableItems = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('fa');
    return currentItems.filter((item) => {
      if (selectedSourceIds.has(item.sourceId)) return false;
      if (!query) return true;
      return `${item.name} ${item.description ?? ''}`.toLocaleLowerCase('fa').includes(query);
    });
  }, [currentItems, searchTerm, selectedSourceIds]);

  const allItems = useMemo(() => [...naturalItems, ...legalItems, ...businessItems], [businessItems, legalItems, naturalItems]);

  const toggleItem = (item: RelatedParticipantOption) => {
    const key = optionKey(item);
    setPendingKeys((current) => (current.includes(key) ? current.filter((itemKey) => itemKey !== key) : [...current, key]));
  };

  const getItemKind = (item: RelatedParticipantOption): SelectionTab =>
    businessItems.some((candidate) => candidate.sourceId === item.sourceId)
      ? 'business'
      : legalItems.some((candidate) => candidate.sourceId === item.sourceId)
        ? 'legal_shareholder'
        : 'natural_shareholder';
  const selectedItems = () =>
    allItems
      .filter((item) => pendingKeys.includes(optionKey(item)))
      .map((item) => (editedSnapshots[item.sourceId] ? { ...item, snapshot: editedSnapshots[item.sourceId] } : item));
  const hasMissingPrimaryData = (item: RelatedParticipantOption, kind: SelectionTab) => {
    const snapshot = item.snapshot ?? {};
    const required =
      kind === 'natural_shareholder'
        ? ['fullName', 'nationalId']
        : kind === 'legal_shareholder'
          ? ['legalName', 'nationalId', 'registrationNumber', 'registrationDate', 'economicCode']
          : ['legalName', 'tradeName', 'nationalId', 'contactName'];
    return required.some((key) => !String(snapshot[key as keyof FirstPartySnapshot] ?? '').trim());
  };
  const handleAddSelected = () => {
    const items = selectedItems();
    const incomplete = items.find((item) => hasMissingPrimaryData(item, getItemKind(item)));
    if (incomplete) {
      setQuickEditKind(getItemKind(incomplete));
      setQuickEditItem(incomplete);
      return;
    }
    onAddSelected(items);
  };
  const handleQuickEditSave = (snapshot: FirstPartySnapshot) => {
    if (!quickEditItem) return;
    setEditedSnapshots((current) => ({ ...current, [quickEditItem.sourceId]: snapshot }));
    const updatedItems = selectedItems().map((item) =>
      item.sourceId === quickEditItem.sourceId ? { ...item, name: snapshot.fullName || snapshot.legalName || item.name, snapshot } : item,
    );
    const nextIncomplete = updatedItems.find((item) => hasMissingPrimaryData(item, getItemKind(item)));
    if (nextIncomplete) {
      setQuickEditItem(nextIncomplete);
      return;
    }
    setQuickEditItem(null);
    onAddSelected(updatedItems);
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
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
          >
            انصراف
          </button>
          <button
            type="button"
            disabled={!pendingKeys.length}
            onClick={handleAddSelected}
            className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-sm font-bold text-[var(--theme-action-text)] transition-colors hover:bg-[var(--theme-action-bg-hover)] disabled:cursor-not-allowed disabled:opacity-50"
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
              className={`h-11 rounded-[8px] border text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-action-border)] ${
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
            className="h-11 rounded-[8px] pl-10 text-sm"
            placeholder="جست‌وجوی طرف اول"
            aria-label="جست‌وجوی طرف اول"
          />
        </div>

        {activeTab !== 'business' ? (
          <button
            type="button"
            disabled={registrationLoading}
            onClick={() => onRegisterNew(activeTab === 'natural_shareholder' ? 'natural' : 'legal')}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[8px] border border-dashed border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-sm font-bold text-[var(--theme-action-text)] transition-colors hover:bg-[var(--theme-action-bg-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            {registrationLoading
              ? 'در حال ذخیره پیش‌نویس...'
              : activeTab === 'natural_shareholder'
                ? 'ثبت سهام‌دار حقیقی جدید'
                : 'ثبت سهام‌دار حقوقی جدید'}
          </button>
        ) : null}

        <div className="space-y-2" role="tabpanel">
          {availableItems.length ? (
            availableItems.map((item) => {
              const selected = pendingKeys.includes(optionKey(item));
              const isLegal = item.personType === 'legal';
              const Icon = isLegal ? Building2 : UserRound;
              return (
                <button
                  key={optionKey(item)}
                  type="button"
                  onClick={() => toggleItem(item)}
                  aria-pressed={selected}
                  className={`flex min-h-14 w-full items-center gap-3 rounded-[8px] border px-3 py-2.5 text-right transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-action-border)] ${
                    selected
                      ? 'border-[var(--theme-action-border)] bg-[var(--theme-action-bg)]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      isLegal ? 'bg-violet-50 text-violet-700' : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-800">{item.name}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                          isLegal ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                      >
                        {activeTab === 'business' ? 'کسب‌وکار' : isLegal ? 'سهام‌دار حقوقی' : 'سهام‌دار حقیقی'}
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
    <ShareholderPrimaryDataDialog
      open={quickEditItem !== null}
      item={quickEditItem}
      kind={quickEditKind}
      onClose={() => setQuickEditItem(null)}
      onSave={handleQuickEditSave}
    />
    </>
  );
}

function ShareholderPrimaryDataDialog({
  open,
  item,
  kind,
  onClose,
  onSave,
}: {
  open: boolean;
  item: RelatedParticipantOption | null;
  kind: SelectionTab;
  onClose: () => void;
  onSave: (snapshot: FirstPartySnapshot) => void;
}) {
  const [snapshot, setSnapshot] = useState<FirstPartySnapshot>({});
  const [naturalFirstName, setNaturalFirstName] = useState('');
  const [naturalLastName, setNaturalLastName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const fields = kind === 'natural_shareholder'
    ? [['fullName', '\u0646\u0627\u0645 \u0648 \u0646\u0627\u0645 \u062e\u0627\u0646\u0648\u0627\u062f\u06af\u06cc'], ['nationalId', '\u06a9\u062f \u0645\u0644\u06cc']]
    : kind === 'legal_shareholder'
      ? [['legalName', '\u0646\u0627\u0645 \u0642\u0627\u0646\u0648\u0646\u06cc \u0634\u0631\u06a9\u062a'], ['tradeName', '\u0646\u0627\u0645 \u062a\u062c\u0627\u0631\u06cc'], ['nationalId', '\u0634\u0646\u0627\u0633\u0647 \u0645\u0644\u06cc'], ['registrationNumber', '\u0634\u0645\u0627\u0631\u0647 \u062b\u0628\u062a \u0634\u0631\u06a9\u062a'], ['registrationDate', '\u062a\u0627\u0631\u06cc\u062e \u062b\u062b\u062a \u0634\u0631\u06a9\u062a'], ['economicCode', '\u06a9\u062f \u0627\u0642\u062a\u0635\u0627\u062f\u06cc']]
      : [['legalName', '\u0646\u0627\u0645 \u0642\u0627\u0646\u0648\u0646\u06cc \u06a9\u0633\u0628\u200c\u0648\u06a9\u0627\u0631'], ['tradeName', '\u0646\u0627\u0645 \u062a\u062c\u0627\u0631\u06cc'], ['nationalId', '\u0634\u0646\u0627\u0633\u0647 \u0645\u0644\u06cc'], ['contactName', '\u0646\u0645\u0627\u06cc\u0646\u062f\u0647 \u06a9\u0633\u0628\u200c\u0648\u06a9\u0627\u0631']];

  useEffect(() => {
    if (!open || !item) return;
    const nextSnapshot = item.snapshot ?? {};
    const nameParts = (nextSnapshot.fullName ?? item.name).trim().split(/\s+/);
    setSnapshot(nextSnapshot);
    setNaturalFirstName(nameParts[0] ?? '');
    setNaturalLastName(nameParts.slice(1).join(' '));
    setSubmitted(false);
  }, [item, open]);

  if (!item) return null;
  const missing =
    kind === 'natural_shareholder'
      ? [
          ...(!naturalFirstName.trim() ? ['firstName'] : []),
          ...(!naturalLastName.trim() ? ['lastName'] : []),
          ...(!String(snapshot.nationalId ?? '').trim() ? ['nationalId'] : []),
        ]
      : fields.filter(([key]) => !String(snapshot[key as keyof FirstPartySnapshot] ?? '').trim());
  return (
    <ContractModal
      open={open}
      onClose={onClose}
      title={'\u062a\u06a9\u0645\u06cc\u0644 \u0627\u0637\u0644\u0627\u0639\u0627\u062a'}
      description={'\u0628\u0631\u0627\u06cc \u0627\u062f\u0627\u0645\u0647\u060c \u0627\u0637\u0644\u0627\u0639\u0627\u062a \u0627\u0635\u0644\u06cc \u0627\u06cc\u0646 \u0645\u0648\u0631\u062f \u0631\u0627 \u06a9\u0627\u0645\u0644 \u06a9\u0646\u06cc\u062f.'}
      maxWidthClass="max-w-xl"
      footer={<><button type="button" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600">{'\u0628\u0627\u0632\u06af\u0634\u062a \u0628\u0647 \u0641\u0647\u0631\u0633\u062a'}</button><button type="button" onClick={() => { setSubmitted(true); if (missing.length) return; onSave(kind === 'natural_shareholder' ? { ...snapshot, fullName: naturalFirstName.trim() + ' ' + naturalLastName.trim() } : snapshot); }} className="inline-flex h-11 items-center justify-center rounded-[8px] border border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] px-4 text-sm font-bold text-[var(--theme-action-text)]">{'\u062a\u0627\u06cc\u06cc\u062f \u0627\u0637\u0644\u0627\u0639\u0627\u062a'}</button></>}
    >
      <div className="grid gap-4 sm:grid-cols-2" dir="rtl" lang="fa">
        {kind === 'natural_shareholder' ? (
          <>
            <label className="block text-right text-sm font-bold text-slate-700">{'\u0646\u0627\u0645'}<span className="mr-1 text-rose-600">*</span><Input value={naturalFirstName} onChange={(event) => setNaturalFirstName(event.target.value)} aria-invalid={submitted && !naturalFirstName.trim()} className={'mt-2 h-11 rounded-[8px] text-sm ' + (submitted && !naturalFirstName.trim() ? 'border-rose-400 ring-1 ring-rose-200' : '')} /></label>
            <label className="block text-right text-sm font-bold text-slate-700">{'\u0646\u0627\u0645 \u062e\u0627\u0646\u0648\u0627\u062f\u06af\u06cc'}<span className="mr-1 text-rose-600">*</span><Input value={naturalLastName} onChange={(event) => setNaturalLastName(event.target.value)} aria-invalid={submitted && !naturalLastName.trim()} className={'mt-2 h-11 rounded-[8px] text-sm ' + (submitted && !naturalLastName.trim() ? 'border-rose-400 ring-1 ring-rose-200' : '')} /></label>
            <label className="block text-right text-sm font-bold text-slate-700">{'\u06a9\u062f \u0645\u0644\u06cc'}<span className="mr-1 text-rose-600">*</span><Input value={String(snapshot.nationalId ?? '')} onChange={(event) => setSnapshot((current) => ({ ...current, nationalId: event.target.value }))} aria-invalid={submitted && !String(snapshot.nationalId ?? '').trim()} className={'mt-2 h-11 rounded-[8px] text-sm ' + (submitted && !String(snapshot.nationalId ?? '').trim() ? 'border-rose-400 ring-1 ring-rose-200' : '')} /></label>
          </>
        ) : fields.map(([key, label]) => {
          const value = String(snapshot[key as keyof FirstPartySnapshot] ?? '');
          const invalid = submitted && !value.trim();
          return <label key={key} className="block text-right text-sm font-bold text-slate-700">{label}<span className="mr-1 text-rose-600">*</span><Input value={value} onChange={(event) => setSnapshot((current) => ({ ...current, [key]: event.target.value }))} aria-invalid={invalid} className={'mt-2 h-11 rounded-[8px] text-sm ' + (invalid ? 'border-rose-400 ring-1 ring-rose-200' : '')} /></label>;
        })}
        {submitted && missing.length ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 sm:col-span-2">{'\u0645\u0648\u0627\u0631\u062f \u0627\u0644\u0632\u0627\u0645\u06cc \u0631\u0627 \u06a9\u0627\u0645\u0644 \u06a9\u0646\u06cc\u062f.'}</div> : null}
      </div>
    </ContractModal>
  );
}
