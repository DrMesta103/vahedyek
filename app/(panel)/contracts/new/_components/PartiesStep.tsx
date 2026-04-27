'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Check, Plus, Search, Star, Trash2, User, X } from 'lucide-react';
import { StickySubmitBar } from './StickySubmitBar';
import { useContractFlowBasePath } from './useContractFlowBasePath';
import {
  createDirectoryPerson,
  ensureActiveDraftId,
  getReferenceData,
  getStepData,
  saveStepData,
  type ReferenceDataResponse,
} from '../../../../lib/contractDraftClient';
import type { ContractPartiesData, PersonType, ShareMode } from '../../../../types/contract';
import { dispatchContractFlowDirty, dispatchContractFlowSaved } from './contractFlowSignals';

type DirectoryItem = { id: string; name: string; personType: PersonType; directoryId?: string | null };
type PartyRow = DirectoryItem & { shareValue: number; isPrimary: boolean; locked?: boolean };
type EntityKind = 'partner' | 'buyer';
type PartyKey = 'party-one' | 'party-two';

const DEFAULT_PARTY_ONE: PartyRow = {
  id: 'partner-legal-1', directoryId: 'partner-legal-1',
  name: 'شرکت فپکو', personType: 'legal',
  shareValue: 6, isPrimary: true, locked: true,
};

const MOCK_PARTNER_NATURALS: DirectoryItem[] = [
  { id: 'pn-1', name: 'علی رضایی', personType: 'natural', directoryId: 'pn-1' },
  { id: 'pn-2', name: 'محمد احمدی', personType: 'natural', directoryId: 'pn-2' },
];
const MOCK_PARTNER_LEGALS: DirectoryItem[] = [
  { id: 'pl-1', name: 'شرکت سازه نوین', personType: 'legal', directoryId: 'pl-1' },
];
const MOCK_BUYER_NATURALS: DirectoryItem[] = [
  { id: 'bn-1', name: 'سارا کریمی', personType: 'natural', directoryId: 'bn-1' },
  { id: 'bn-2', name: 'رضا موسوی', personType: 'natural', directoryId: 'bn-2' },
  { id: 'bn-3', name: 'فاطمه حسینی', personType: 'natural', directoryId: 'bn-3' },
];
const MOCK_BUYER_LEGALS: DirectoryItem[] = [
  { id: 'bl-1', name: 'شرکت پارس تجارت', personType: 'legal', directoryId: 'bl-1' },
];

const PARTY_TOTALS: Record<ShareMode, number> = { dang: 6, percent: 100 };
function roundShare(v: number) { return Math.round(v * 100) / 100; }
function convertShare(v: number, from: ShareMode, to: ShareMode) {
  if (from === to) return roundShare(v);
  return from === 'dang' ? roundShare((v / 6) * 100) : roundShare((v / 100) * 6);
}
function getTypeLabel(p: PersonType) { return p === 'natural' ? 'حقیقی' : 'حقوقی'; }

// ─── Primitives ───────────────────────────────────────────────────────────────
function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-slate-200 bg-white">{children}</div>;
}
function SectionHeader({ label, description }: { label: string; description?: string }) {
  return (
    <div className="border-b border-slate-100 px-5 py-4">
      <p className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      {description ? <p className="mt-0.5 text-[13px] text-slate-500">{description}</p> : null}
    </div>
  );
}

function TagPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[34px] items-center gap-1.5 rounded-full border-[0.5px] px-4 text-[12px] transition-all ${
        active
          ? 'border-[#a6e8ef] bg-[#a6e8ef] font-semibold text-[#123b69]'
          : 'border-[#6e86a3] bg-white text-[#314a67] hover:bg-slate-50'
      }`}
    >
      {active ? <Check className="h-3 w-3 shrink-0 stroke-[2.75]" /> : null}
      {label}
    </button>
  );
}

// ─── Party Row Card ───────────────────────────────────────────────────────────
function PartyRowCard({
  row, showPrimary, onPrimary, onRemove,
}: {
  row: PartyRow; showPrimary: boolean;
  onPrimary: () => void; onRemove: () => void;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors ${
      row.isPrimary ? 'border-teal-200 bg-teal-50/40' : 'border-slate-200 bg-white'
    }`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          row.personType === 'legal' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {row.personType === 'legal' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold text-slate-800">{row.name}</span>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500">
              {getTypeLabel(row.personType)}
            </span>
            {row.locked ? (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600">پیش‌فرض</span>
            ) : null}
            {row.isPrimary ? (
              <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] text-teal-700">طرف اصلی</span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {showPrimary && !row.isPrimary ? (
          <button
            type="button" onClick={onPrimary} title="انتخاب به عنوان طرف اصلی"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600"
          >
            <Star className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <button
          type="button" onClick={onRemove} disabled={row.locked} title="حذف"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Selection Dialog ─────────────────────────────────────────────────────────
function SelectionDialog({
  open, onClose, kind, rows, naturalItems, legalItems,
  onCreateItem, onAddSelected, loading,
}: {
  open: boolean; onClose: () => void; kind: EntityKind;
  rows: PartyRow[]; naturalItems: DirectoryItem[]; legalItems: DirectoryItem[];
  onCreateItem: (p: PersonType, name: string) => Promise<DirectoryItem | null>;
  onAddSelected: (items: DirectoryItem[]) => void; loading: boolean;
}) {
  const isPartner = kind === 'partner';
  const [tab, setTab] = useState<PersonType>('natural');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [newMode, setNewMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const currentItems = tab === 'natural' ? naturalItems : legalItems;
  const available = useMemo(() =>
    currentItems.filter(i => !rows.some(r => r.id === i.id) && i.name.includes(q)),
    [currentItems, rows, q],
  );

  const toggle = (id: string) =>
    setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const confirm = () => {
    const items = currentItems.filter(i => selectedIds.includes(i.id));
    if (!items.length) return;
    onAddSelected(items);
    reset();
  };

  const create = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    const item = await onCreateItem(tab, name);
    setCreating(false);
    if (item) { onAddSelected([item]); reset(); }
  };

  const reset = () => {
    setSelectedIds([]); setQ(''); setNewMode(false); setNewName(''); setTab('natural');
  };

  const close = () => { reset(); onClose(); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={close}>
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">
            {isPartner ? 'افزودن طرف اول' : 'افزودن طرف دوم'}
          </p>
          <button type="button" onClick={close} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {/* type tabs */}
          <div className="flex gap-1.5">
            {(['natural', 'legal'] as PersonType[]).map(t => (
              <TagPill key={t} label={t === 'natural' ? 'حقیقی' : 'حقوقی'} active={tab === t} onClick={() => setTab(t)} />
            ))}
          </div>

          {/* search */}
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q} onChange={e => setQ(e.target.value)}
              placeholder="جستجو..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pr-9 pl-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-slate-400"
            />
          </div>

          {/* new person form */}
          {newMode ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
              <input
                value={newName} onChange={e => setNewName(e.target.value)}
                placeholder={tab === 'natural' ? 'نام و نام خانوادگی' : 'نام شرکت'}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none focus:border-slate-400"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setNewMode(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-100">انصراف</button>
                <button type="button" onClick={create} disabled={!newName.trim() || creating}
                  className="rounded-lg bg-teal-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-teal-800 disabled:opacity-50">
                  {creating ? '...' : 'ثبت'}
                </button>
              </div>
            </div>
          ) : null}

          {/* list */}
          <div className="max-h-56 space-y-1.5 overflow-y-auto">
            {loading ? (
              <p className="py-6 text-center text-[12px] text-slate-400">در حال بارگذاری...</p>
            ) : available.length ? available.map(item => {
              const checked = selectedIds.includes(item.id);
              return (
                <button key={item.id} type="button" onClick={() => toggle(item.id)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-right transition-colors ${
                    checked ? 'border-teal-300 bg-teal-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      checked ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'
                    }`}>
                      {checked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                    </span>
                    <span className="text-[13px] text-slate-700">{item.name}</span>
                  </div>
                  <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500">{getTypeLabel(item.personType)}</span>
                </button>
              );
            }) : (
              <p className="py-6 text-center text-[12px] text-slate-400">موردی یافت نشد</p>
            )}
          </div>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <button type="button" onClick={() => setNewMode(p => !p)}
            className="inline-flex items-center gap-1.5 text-[12px] text-teal-700 hover:text-teal-800">
            <Plus className="h-3.5 w-3.5" />
            {tab === 'natural' ? 'شخص جدید' : 'شرکت جدید'}
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={close} className="rounded-lg border border-slate-200 px-4 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50">انصراف</button>
            <button type="button" onClick={confirm} disabled={!selectedIds.length}
              className="rounded-lg bg-teal-700 px-4 py-1.5 text-[12px] font-medium text-white hover:bg-teal-800 disabled:opacity-50">
              افزودن ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Party Section ────────────────────────────────────────────────────────────
function PartySection({
  sectionLabel, sectionDesc, rows, shareMode, onShareModeChange,
  onPrimary, onRemove, addLabel, onOpenDialog,
}: {
  sectionLabel: string; sectionDesc: string;
  rows: PartyRow[]; shareMode: ShareMode;
  onShareModeChange: (m: ShareMode) => void;
  onPrimary: (id: string) => void; onRemove: (id: string) => void;
  addLabel: string; onOpenDialog: () => void;
}) {
  return (
    <div className="space-y-3">
      {/* نوع سهم */}
      <SectionCard>
        <SectionHeader label="نوع سهم" description="نحوه محاسبه سهم هر طرف را مشخص کنید" />
        <div className="flex flex-wrap gap-1.5 p-5">
          <TagPill label="دانگ" active={shareMode === 'dang'} onClick={() => onShareModeChange('dang')} />
          <TagPill label="درصد" active={shareMode === 'percent'} onClick={() => onShareModeChange('percent')} />
        </div>
      </SectionCard>

      {/* لیست طرفین */}
      <SectionCard>
        <SectionHeader label={sectionLabel} description={sectionDesc} />
        <div className="space-y-2 p-5">
          {rows.length === 0 ? (
            <p className="py-4 text-center text-[12px] text-slate-400">هنوز کسی اضافه نشده</p>
          ) : (
            rows.map(row => (
              <PartyRowCard
                key={row.id} row={row}
                showPrimary={rows.length > 1}
                onPrimary={() => onPrimary(row.id)}
                onRemove={() => onRemove(row.id)}
              />
            ))
          )}
          <button
            type="button" onClick={onOpenDialog}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-[13px] font-medium text-teal-700 transition-colors hover:bg-teal-100"
          >
            <Plus className="h-3.5 w-3.5" />
            {addLabel}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function PartiesStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');

  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<PartyKey>('party-one');

  const [partyOneMode, setPartyOneMode] = useState<ShareMode>('dang');
  const [partyTwoMode, setPartyTwoMode] = useState<ShareMode>('dang');
  const [partyOneRows, setPartyOneRows] = useState<PartyRow[]>([DEFAULT_PARTY_ONE]);
  const [partyTwoRows, setPartyTwoRows] = useState<PartyRow[]>([]);

  const [partnerNaturals, setPartnerNaturals] = useState<DirectoryItem[]>(MOCK_PARTNER_NATURALS);
  const [partnerLegals, setPartnerLegals] = useState<DirectoryItem[]>(MOCK_PARTNER_LEGALS);
  const [buyerNaturals, setBuyerNaturals] = useState<DirectoryItem[]>(MOCK_BUYER_NATURALS);
  const [buyerLegals, setBuyerLegals] = useState<DirectoryItem[]>(MOCK_BUYER_LEGALS);

  const [p1DialogOpen, setP1DialogOpen] = useState(false);
  const [p2DialogOpen, setP2DialogOpen] = useState(false);
  const [dirLoading, setDirLoading] = useState(false);

  const applyRef = (ref: ReferenceDataResponse) => {
    setPartnerNaturals(ref.directory.partner.natural.map(i => ({ ...i, personType: 'natural' as const, directoryId: i.id })));
    setPartnerLegals(ref.directory.partner.legal.map(i => ({ ...i, personType: 'legal' as const, directoryId: i.id })));
    setBuyerNaturals(ref.directory.buyer.natural.map(i => ({ ...i, personType: 'natural' as const, directoryId: i.id })));
    setBuyerLegals(ref.directory.buyer.legal.map(i => ({ ...i, personType: 'legal' as const, directoryId: i.id })));
  };

  const reloadDir = async () => {
    setDirLoading(true);
    try { applyRef(await getReferenceData()); } finally { setDirLoading(false); }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const id = await ensureActiveDraftId();
        const [ref, data] = await Promise.all([getReferenceData(), getStepData<ContractPartiesData>(id, 'parties')]);
        if (!mounted) return;
        setDraftId(id);
        applyRef(ref);
        if (data) {
          setPartyOneMode(data.partyOneMode);
          setPartyTwoMode(data.partyTwoMode);
          setPartyOneRows(data.partyOne.map(i => ({
            id: i.personId, directoryId: i.directoryId ?? null,
            personType: i.personType, name: i.name,
            shareValue: i.share.value, isPrimary: Boolean(i.isPrimary),
            locked: i.personId === DEFAULT_PARTY_ONE.id,
          })));
          setPartyTwoRows(data.partyTwo.map(i => ({
            id: i.personId, directoryId: i.directoryId ?? null,
            personType: i.personType, name: i.name,
            shareValue: i.share.value, isPrimary: Boolean(i.isPrimary),
          })));
        }
      } finally { if (mounted) setLoading(false); }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const normalizePrimary = (rows: PartyRow[]) => {
    if (!rows.length || rows.some(r => r.isPrimary)) return rows;
    return rows.map((r, i) => ({ ...r, isPrimary: i === 0 }));
  };

  const setPrimary = (rows: PartyRow[], id: string) => rows.map(r => ({ ...r, isPrimary: r.id === id }));
  const removeRow = (rows: PartyRow[], id: string) => normalizePrimary(rows.filter(r => r.id !== id));
  const addRows = (cur: PartyRow[], items: DirectoryItem[]) =>
    normalizePrimary([...cur, ...items.filter(i => !cur.some(r => r.id === i.id)).map(i => ({ ...i, shareValue: 0, isPrimary: cur.length === 0 }))]);

  const changeModeOne = (m: ShareMode) => {
    if (m === partyOneMode) return;
    setPartyOneRows(r => r.map(x => ({ ...x, shareValue: convertShare(x.shareValue, partyOneMode, m) })));
    setPartyOneMode(m);
  };
  const changeModeTwo = (m: ShareMode) => {
    if (m === partyTwoMode) return;
    setPartyTwoRows(r => r.map(x => ({ ...x, shareValue: convertShare(x.shareValue, partyTwoMode, m) })));
    setPartyTwoMode(m);
  };

  const createItem = async (kind: EntityKind, personType: PersonType, name: string) => {
    const c = await createDirectoryPerson({ role: kind, personType, name });
    const item: DirectoryItem = { id: c.id, directoryId: c.id, name: c.name, personType: c.personType };
    if (kind === 'partner') personType === 'natural' ? setPartnerNaturals(p => [...p, item]) : setPartnerLegals(p => [...p, item]);
    else personType === 'natural' ? setBuyerNaturals(p => [...p, item]) : setBuyerLegals(p => [...p, item]);
    return item;
  };

  const buildPayload = (): ContractPartiesData => ({
    partyOneMode, partyTwoMode,
    partyOne: partyOneRows.map(r => ({ personId: r.id, directoryId: r.directoryId ?? null, personType: r.personType, name: r.name, isPrimary: r.isPrimary, share: { value: r.shareValue, mode: partyOneMode } })),
    partyTwo: partyTwoRows.map(r => ({ personId: r.id, directoryId: r.directoryId ?? null, personType: r.personType, name: r.name, isPrimary: r.isPrimary, share: { value: r.shareValue, mode: partyTwoMode } })),
  });

  const handleSubmit = async () => {
    if (!draftId) return;
    setSaving(true);
    try {
      const payload = buildPayload();
      await saveStepData(draftId, 'parties', payload);
      initialSnapshotRef.current = JSON.stringify(payload);
      dispatchContractFlowDirty(stepId as 'parties', false);
      dispatchContractFlowSaved(stepId as 'parties');
      router.push(basePath);
    } finally { setSaving(false); }
  };

  useEffect(() => {
    if (loading || !draftId) return;
    const snap = JSON.stringify(buildPayload());
    if (!initialSnapshotRef.current) { initialSnapshotRef.current = snap; dispatchContractFlowDirty(stepId as 'parties', false); return; }
    dispatchContractFlowDirty(stepId as 'parties', snap !== initialSnapshotRef.current);
  }, [draftId, loading, partyOneMode, partyOneRows, partyTwoMode, partyTwoRows, stepId]);

  return (
    <div className="space-y-4">
      {!embedded ? (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <p className="mt-0.5 text-[13px] text-slate-500">طرف اول و طرف دوم قرارداد را مدیریت کنید.</p>
          </div>
          <button type="button" onClick={() => router.push(basePath)} className="rounded-lg border border-slate-200 px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-50">بازگشت</button>
        </div>
      ) : null}

      {/* tab switcher */}
      <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1">
        {(['party-one', 'party-two'] as PartyKey[]).map(key => (
          <button key={key} type="button" onClick={() => setActiveTab(key)}
            className={`flex-1 rounded-md px-4 py-2 text-[13px] font-medium transition-all ${
              activeTab === key ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {key === 'party-one' ? 'طرف اول (فروشنده)' : 'طرف دوم (خریدار)'}
          </button>
        ))}
      </div>

      {activeTab === 'party-one' ? (
        <PartySection
          sectionLabel="طرف اول قرارداد" sectionDesc="فروشنده یا شرکای فروش را اضافه کنید"
          rows={partyOneRows} shareMode={partyOneMode} onShareModeChange={changeModeOne}
          onPrimary={id => setPartyOneRows(r => setPrimary(r, id))}
          onRemove={id => setPartyOneRows(r => removeRow(r, id))}
          addLabel="افزودن طرف اول"
          onOpenDialog={() => { void reloadDir(); setP1DialogOpen(true); }}
        />
      ) : (
        <PartySection
          sectionLabel="طرف دوم قرارداد" sectionDesc="خریداران را اضافه کنید"
          rows={partyTwoRows} shareMode={partyTwoMode} onShareModeChange={changeModeTwo}
          onPrimary={id => setPartyTwoRows(r => setPrimary(r, id))}
          onRemove={id => setPartyTwoRows(r => removeRow(r, id))}
          addLabel="افزودن طرف دوم"
          onOpenDialog={() => { void reloadDir(); setP2DialogOpen(true); }}
        />
      )}

      <StickySubmitBar label="ذخیره طرفین" loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'} disabled={loading || saving} onClick={handleSubmit} embedded={embedded} submitId={stepId} />

      <SelectionDialog open={p1DialogOpen} onClose={() => setP1DialogOpen(false)} kind="partner"
        rows={partyOneRows} naturalItems={partnerNaturals} legalItems={partnerLegals}
        onCreateItem={(p, n) => createItem('partner', p, n)}
        onAddSelected={items => { setPartyOneRows(r => addRows(r, items)); setP1DialogOpen(false); }}
        loading={dirLoading} />

      <SelectionDialog open={p2DialogOpen} onClose={() => setP2DialogOpen(false)} kind="buyer"
        rows={partyTwoRows} naturalItems={buyerNaturals} legalItems={buyerLegals}
        onCreateItem={(p, n) => createItem('buyer', p, n)}
        onAddSelected={items => { setPartyTwoRows(r => addRows(r, items)); setP2DialogOpen(false); }}
        loading={dirLoading} />
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-slate-200 bg-white">{children}</div>;
}
function SectionHeader({ label, description }: { label: string; description?: string }) {
  return (
    <div className="border-b border-slate-100 px-5 py-4">
      <p className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      {description ? <p className="mt-0.5 text-[13px] text-slate-500">{description}</p> : null}
    </div>
  );
}

function TagPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex h-[34px] items-center gap-1.5 rounded-full border-[0.5px] px-4 text-[12px] transition-all ${
        active ? 'border-[#a6e8ef] bg-[#a6e8ef] font-semibold text-[#123b69]' : 'border-[#6e86a3] bg-white text-[#314a67] hover:bg-slate-50'
      }`}>
      {active ? <Check className="h-3 w-3 shrink-0 stroke-[2.75]" /> : null}
      {label}
    </button>
  );
}

function PartyRowCard({ row, showPrimary, onPrimary, onRemove }: {
  row: PartyRow; showPrimary: boolean; onPrimary: () => void; onRemove: () => void;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors ${
      row.isPrimary ? 'border-teal-200 bg-teal-50/40' : 'border-slate-200 bg-white'
    }`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          row.personType === 'legal' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {row.personType === 'legal' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] font-semibold text-slate-800">{row.name}</span>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500">{getTypeLabel(row.personType)}</span>
          {row.locked ? <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600">پیش‌فرض</span> : null}
          {row.isPrimary ? <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] text-teal-700">طرف اصلی</span> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {showPrimary && !row.isPrimary ? (
          <button type="button" onClick={onPrimary} title="انتخاب به عنوان طرف اصلی"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600">
            <Star className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <button type="button" onClick={onRemove} disabled={row.locked} title="حذف"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function SelectionDialog({ open, onClose, kind, rows, naturalItems, legalItems, onCreateItem, onAddSelected, loading }: {
  open: boolean; onClose: () => void; kind: EntityKind; rows: PartyRow[];
  naturalItems: DirectoryItem[]; legalItems: DirectoryItem[];
  onCreateItem: (p: PersonType, name: string) => Promise<DirectoryItem | null>;
  onAddSelected: (items: DirectoryItem[]) => void; loading: boolean;
}) {
  const [tab, setTab] = useState<PersonType>('natural');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [newMode, setNewMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const currentItems = tab === 'natural' ? naturalItems : legalItems;
  const available = useMemo(() =>
    currentItems.filter(i => !rows.some(r => r.id === i.id) && i.name.includes(q)),
    [currentItems, rows, q],
  );

  const toggle = (id: string) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const confirm = () => {
    const items = currentItems.filter(i => selectedIds.includes(i.id));
    if (!items.length) return;
    onAddSelected(items);
    reset();
  };

  const create = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    const item = await onCreateItem(tab, name);
    setCreating(false);
    if (item) { onAddSelected([item]); reset(); }
  };

  const reset = () => { setSelectedIds([]); setQ(''); setNewMode(false); setNewName(''); setTab('natural'); };
  const close = () => { reset(); onClose(); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={close}>
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">
            {kind === 'partner' ? 'افزودن طرف اول' : 'افزودن طرف دوم'}
          </p>
          <button type="button" onClick={close} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex gap-1.5">
            <TagPill label="حقیقی" active={tab === 'natural'} onClick={() => setTab('natural')} />
            <TagPill label="حقوقی" active={tab === 'legal'} onClick={() => setTab('legal')} />
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="جستجو..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pr-9 pl-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-slate-400" />
          </div>
          {newMode ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
              <input value={newName} onChange={e => setNewName(e.target.value)}
                placeholder={tab === 'natural' ? 'نام و نام خانوادگی' : 'نام شرکت'}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none focus:border-slate-400" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setNewMode(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-100">انصراف</button>
                <button type="button" onClick={create} disabled={!newName.trim() || creating}
                  className="rounded-lg bg-teal-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-teal-800 disabled:opacity-50">
                  {creating ? '...' : 'ثبت'}
                </button>
              </div>
            </div>
          ) : null}
          <div className="max-h-56 space-y-1.5 overflow-y-auto">
            {loading ? <p className="py-6 text-center text-[12px] text-slate-400">در حال بارگذاری...</p>
              : available.length ? available.map(item => {
                const checked = selectedIds.includes(item.id);
                return (
                  <button key={item.id} type="button" onClick={() => toggle(item.id)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-right transition-colors ${
                      checked ? 'border-teal-300 bg-teal-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${checked ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'}`}>
                        {checked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                      </span>
                      <span className="text-[13px] text-slate-700">{item.name}</span>
                    </div>
                    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500">{getTypeLabel(item.personType)}</span>
                  </button>
                );
              }) : <p className="py-6 text-center text-[12px] text-slate-400">موردی یافت نشد</p>}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <button type="button" onClick={() => setNewMode(p => !p)}
            className="inline-flex items-center gap-1.5 text-[12px] text-teal-700 hover:text-teal-800">
            <Plus className="h-3.5 w-3.5" />
            {tab === 'natural' ? 'شخص جدید' : 'شرکت جدید'}
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={close} className="rounded-lg border border-slate-200 px-4 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50">انصراف</button>
            <button type="button" onClick={confirm} disabled={!selectedIds.length}
              className="rounded-lg bg-teal-700 px-4 py-1.5 text-[12px] font-medium text-white hover:bg-teal-800 disabled:opacity-50">
              افزودن ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PartySection({ sectionLabel, sectionDesc, rows, shareMode, onShareModeChange, onPrimary, onRemove, addLabel, onOpenDialog }: {
  sectionLabel: string; sectionDesc: string; rows: PartyRow[]; shareMode: ShareMode;
  onShareModeChange: (m: ShareMode) => void; onPrimary: (id: string) => void;
  onRemove: (id: string) => void; addLabel: string; onOpenDialog: () => void;
}) {
  return (
    <div className="space-y-3">
      <SectionCard>
        <SectionHeader label="نوع سهم" description="نحوه محاسبه سهم هر طرف را مشخص کنید" />
        <div className="flex flex-wrap gap-1.5 p-5">
          <TagPill label="دانگ" active={shareMode === 'dang'} onClick={() => onShareModeChange('dang')} />
          <TagPill label="درصد" active={shareMode === 'percent'} onClick={() => onShareModeChange('percent')} />
        </div>
      </SectionCard>
      <SectionCard>
        <SectionHeader label={sectionLabel} description={sectionDesc} />
        <div className="space-y-2 p-5">
          {rows.length === 0
            ? <p className="py-4 text-center text-[12px] text-slate-400">هنوز کسی اضافه نشده</p>
            : rows.map(row => (
              <PartyRowCard key={row.id} row={row} showPrimary={rows.length > 1}
                onPrimary={() => onPrimary(row.id)} onRemove={() => onRemove(row.id)} />
            ))}
          <button type="button" onClick={onOpenDialog}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-[13px] font-medium text-teal-700 hover:bg-teal-100">
            <Plus className="h-3.5 w-3.5" />
            {addLabel}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

export function PartiesStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');

  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<PartyKey>('party-one');
  const [partyOneMode, setPartyOneMode] = useState<ShareMode>('dang');
  const [partyTwoMode, setPartyTwoMode] = useState<ShareMode>('dang');
  const [partyOneRows, setPartyOneRows] = useState<PartyRow[]>([DEFAULT_PARTY_ONE]);
  const [partyTwoRows, setPartyTwoRows] = useState<PartyRow[]>([]);
  const [partnerNaturals, setPartnerNaturals] = useState<DirectoryItem[]>(MOCK_PARTNER_NATURALS);
  const [partnerLegals, setPartnerLegals] = useState<DirectoryItem[]>(MOCK_PARTNER_LEGALS);
  const [buyerNaturals, setBuyerNaturals] = useState<DirectoryItem[]>(MOCK_BUYER_NATURALS);
  const [buyerLegals, setBuyerLegals] = useState<DirectoryItem[]>(MOCK_BUYER_LEGALS);
  const [p1Open, setP1Open] = useState(false);
  const [p2Open, setP2Open] = useState(false);
  const [dirLoading, setDirLoading] = useState(false);

  const applyRef = (ref: ReferenceDataResponse) => {
    setPartnerNaturals(ref.directory.partner.natural.map(i => ({ ...i, personType: 'natural' as const, directoryId: i.id })));
    setPartnerLegals(ref.directory.partner.legal.map(i => ({ ...i, personType: 'legal' as const, directoryId: i.id })));
    setBuyerNaturals(ref.directory.buyer.natural.map(i => ({ ...i, personType: 'natural' as const, directoryId: i.id })));
    setBuyerLegals(ref.directory.buyer.legal.map(i => ({ ...i, personType: 'legal' as const, directoryId: i.id })));
  };

  const reloadDir = async () => { setDirLoading(true); try { applyRef(await getReferenceData()); } finally { setDirLoading(false); } };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const id = await ensureActiveDraftId();
        const [ref, data] = await Promise.all([getReferenceData(), getStepData<ContractPartiesData>(id, 'parties')]);
        if (!mounted) return;
        setDraftId(id);
        applyRef(ref);
        if (data) {
          setPartyOneMode(data.partyOneMode);
          setPartyTwoMode(data.partyTwoMode);
          setPartyOneRows(data.partyOne.map(i => ({ id: i.personId, directoryId: i.directoryId ?? null, personType: i.personType, name: i.name, shareValue: i.share.value, isPrimary: Boolean(i.isPrimary), locked: i.personId === DEFAULT_PARTY_ONE.id })));
          setPartyTwoRows(data.partyTwo.map(i => ({ id: i.personId, directoryId: i.directoryId ?? null, personType: i.personType, name: i.name, shareValue: i.share.value, isPrimary: Boolean(i.isPrimary) })));
        }
      } finally { if (mounted) setLoading(false); }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const normalizePrimary = (rows: PartyRow[]) => (!rows.length || rows.some(r => r.isPrimary)) ? rows : rows.map((r, i) => ({ ...r, isPrimary: i === 0 }));
  const setPrimary = (rows: PartyRow[], id: string) => rows.map(r => ({ ...r, isPrimary: r.id === id }));
  const removeRow = (rows: PartyRow[], id: string) => normalizePrimary(rows.filter(r => r.id !== id));
  const addRows = (cur: PartyRow[], items: DirectoryItem[]) =>
    normalizePrimary([...cur, ...items.filter(i => !cur.some(r => r.id === i.id)).map(i => ({ ...i, shareValue: 0, isPrimary: cur.length === 0 }))]);

  const changeModeOne = (m: ShareMode) => { if (m === partyOneMode) return; setPartyOneRows(r => r.map(x => ({ ...x, shareValue: convertShare(x.shareValue, partyOneMode, m) }))); setPartyOneMode(m); };
  const changeModeTwo = (m: ShareMode) => { if (m === partyTwoMode) return; setPartyTwoRows(r => r.map(x => ({ ...x, shareValue: convertShare(x.shareValue, partyTwoMode, m) }))); setPartyTwoMode(m); };

  const createItem = async (kind: EntityKind, personType: PersonType, name: string) => {
    const c = await createDirectoryPerson({ role: kind, personType, name });
    const item: DirectoryItem = { id: c.id, directoryId: c.id, name: c.name, personType: c.personType };
    if (kind === 'partner') personType === 'natural' ? setPartnerNaturals(p => [...p, item]) : setPartnerLegals(p => [...p, item]);
    else personType === 'natural' ? setBuyerNaturals(p => [...p, item]) : setBuyerLegals(p => [...p, item]);
    return item;
  };

  const buildPayload = (): ContractPartiesData => ({
    partyOneMode, partyTwoMode,
    partyOne: partyOneRows.map(r => ({ personId: r.id, directoryId: r.directoryId ?? null, personType: r.personType, name: r.name, isPrimary: r.isPrimary, share: { value: r.shareValue, mode: partyOneMode } })),
    partyTwo: partyTwoRows.map(r => ({ personId: r.id, directoryId: r.directoryId ?? null, personType: r.personType, name: r.name, isPrimary: r.isPrimary, share: { value: r.shareValue, mode: partyTwoMode } })),
  });

  const handleSubmit = async () => {
    if (!draftId) return;
    setSaving(true);
    try {
      const payload = buildPayload();
      await saveStepData(draftId, 'parties', payload);
      initialSnapshotRef.current = JSON.stringify(payload);
      dispatchContractFlowDirty(stepId as 'parties', false);
      dispatchContractFlowSaved(stepId as 'parties');
      router.push(basePath);
    } finally { setSaving(false); }
  };

  useEffect(() => {
    if (loading || !draftId) return;
    const snap = JSON.stringify(buildPayload());
    if (!initialSnapshotRef.current) { initialSnapshotRef.current = snap; dispatchContractFlowDirty(stepId as 'parties', false); return; }
    dispatchContractFlowDirty(stepId as 'parties', snap !== initialSnapshotRef.current);
  }, [draftId, loading, partyOneMode, partyOneRows, partyTwoMode, partyTwoRows, stepId]);

  return (
    <div className="space-y-4">
      {!embedded ? (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <p className="mt-0.5 text-[13px] text-slate-500">طرف اول و طرف دوم قرارداد را مدیریت کنید.</p>
          </div>
          <button type="button" onClick={() => router.push(basePath)} className="rounded-lg border border-slate-200 px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-50">بازگشت</button>
        </div>
      ) : null}

      <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1">
        {(['party-one', 'party-two'] as PartyKey[]).map(key => (
          <button key={key} type="button" onClick={() => setActiveTab(key)}
            className={`flex-1 rounded-md px-4 py-2 text-[13px] font-medium transition-all ${activeTab === key ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
            {key === 'party-one' ? 'طرف اول (فروشنده)' : 'طرف دوم (خریدار)'}
          </button>
        ))}
      </div>

      {activeTab === 'party-one' ? (
        <PartySection sectionLabel="طرف اول قرارداد" sectionDesc="فروشنده یا شرکای فروش را اضافه کنید"
          rows={partyOneRows} shareMode={partyOneMode} onShareModeChange={changeModeOne}
          onPrimary={id => setPartyOneRows(r => setPrimary(r, id))} onRemove={id => setPartyOneRows(r => removeRow(r, id))}
          addLabel="افزودن طرف اول" onOpenDialog={() => { void reloadDir(); setP1Open(true); }} />
      ) : (
        <PartySection sectionLabel="طرف دوم قرارداد" sectionDesc="خریداران را اضافه کنید"
          rows={partyTwoRows} shareMode={partyTwoMode} onShareModeChange={changeModeTwo}
          onPrimary={id => setPartyTwoRows(r => setPrimary(r, id))} onRemove={id => setPartyTwoRows(r => removeRow(r, id))}
          addLabel="افزودن طرف دوم" onOpenDialog={() => { void reloadDir(); setP2Open(true); }} />
      )}

      <StickySubmitBar label="ذخیره طرفین" loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'} disabled={loading || saving} onClick={handleSubmit} embedded={embedded} submitId={stepId} />

      <SelectionDialog open={p1Open} onClose={() => setP1Open(false)} kind="partner" rows={partyOneRows}
        naturalItems={partnerNaturals} legalItems={partnerLegals}
        onCreateItem={(p, n) => createItem('partner', p, n)}
        onAddSelected={items => { setPartyOneRows(r => addRows(r, items)); setP1Open(false); }} loading={dirLoading} />

      <SelectionDialog open={p2Open} onClose={() => setP2Open(false)} kind="buyer" rows={partyTwoRows}
        naturalItems={buyerNaturals} legalItems={buyerLegals}
        onCreateItem={(p, n) => createItem('buyer', p, n)}
        onAddSelected={items => { setPartyTwoRows(r => addRows(r, items)); setP2Open(false); }} loading={dirLoading} />
    </div>
  );
}

function RowCard({ row, showPrimary, onPrimary, onRemove }: {
  row: PartyRow; showPrimary: boolean; onPrimary: () => void; onRemove: () => void;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${row.isPrimary ? 'border-teal-200 bg-teal-50/40' : 'border-slate-200 bg-white'}`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${row.personType === 'legal' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>
          {row.personType === 'legal' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] font-semibold text-slate-800">{row.name}</span>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500">{typeLabel(row.personType)}</span>
          {row.locked ? <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600">پیش‌فرض</span> : null}
          {row.isPrimary ? <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] text-teal-700">طرف اصلی</span> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {showPrimary && !row.isPrimary ? (
          <button type="button" onClick={onPrimary} title="طرف اصلی"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600">
            <Star className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <button type="button" onClick={onRemove} disabled={row.locked} title="حذف"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function AddDialog({ open, onClose, kind, rows, naturals, legals, onCreate, onAdd, loading }: {
  open: boolean; onClose: () => void; kind: EntityKind; rows: PartyRow[];
  naturals: DirectoryItem[]; legals: DirectoryItem[];
  onCreate: (p: PersonType, n: string) => Promise<DirectoryItem | null>;
  onAdd: (items: DirectoryItem[]) => void; loading: boolean;
}) {
  const [tab, setTab] = useState<PersonType>('natural');
  const [sel, setSel] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [newMode, setNewMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const items = tab === 'natural' ? naturals : legals;
  const avail = useMemo(() => items.filter(i => !rows.some(r => r.id === i.id) && i.name.includes(q)), [items, rows, q]);
  const toggle = (id: string) => setSel(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const reset = () => { setSel([]); setQ(''); setNewMode(false); setNewName(''); setTab('natural'); };
  const close = () => { reset(); onClose(); };
  const confirm = () => { const its = items.filter(i => sel.includes(i.id)); if (!its.length) return; onAdd(its); reset(); };
  const create = async () => {
    const n = newName.trim(); if (!n) return;
    setCreating(true);
    const item = await onCreate(tab, n);
    setCreating(false);
    if (item) { onAdd([item]); reset(); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={close}>
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">{kind === 'partner' ? 'افزودن طرف اول' : 'افزودن طرف دوم'}</p>
          <button type="button" onClick={close} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex gap-1.5">
            <TPill label="حقیقی" active={tab === 'natural'} onClick={() => setTab('natural')} />
            <TPill label="حقوقی" active={tab === 'legal'} onClick={() => setTab('legal')} />
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="جستجو..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pr-9 pl-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-slate-400" />
          </div>
          {newMode ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={tab === 'natural' ? 'نام و نام خانوادگی' : 'نام شرکت'}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none focus:border-slate-400" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setNewMode(false)} className="roun
function PRowCard({ row, showPrimary, onPrimary, onRemove }: {
  row: PartyRow; showPrimary: boolean; onPrimary: () => void; onRemove: () => void;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 ${row.isPrimary ? 'border-teal-200 bg-teal-50/40' : 'border-slate-200 bg-white'}`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${row.personType === 'legal' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>
          {row.personType === 'legal' ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] font-semibold text-slate-800">{row.name}</span>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-500">{typeLabel(row.personType)}</span>
          {row.locked ? <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] text-blue-600">پیش‌فرض</span> : null}
          {row.isPrimary ? <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[10px] text-teal-700">طرف اصلی</span> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {showPrimary && !row.isPrimary ? (
          <button type="button" onClick={onPrimary} title="انتخاب به عنوان طرف اصلی"
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-600">
            <Star className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <button type="button" onClick={onRemove} disabled={row.locked} title="حذف"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-30">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function SelDialog({ open, onClose, kind, rows, naturalItems, legalItems, onCreateItem, onAddSelected, loading }: {
  open: boolean; onClose: () => void; kind: EntityKind; rows: PartyRow[];
  naturalItems: DirectoryItem[]; legalItems: DirectoryItem[];
  onCreateItem: (p: PersonType, name: string) => Promise<DirectoryItem | null>;
  onAddSelected: (items: DirectoryItem[]) => void; loading: boolean;
}) {
  const [tab, setTab] = useState<PersonType>('natural');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [q, setQ] = useState('');
  const [newMode, setNewMode] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

  const currentItems = tab === 'natural' ? naturalItems : legalItems;
  const available = useMemo(() => currentItems.filter(i => !rows.some(r => r.id === i.id) && i.name.includes(q)), [currentItems, rows, q]);

  const toggle = (id: string) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const confirm = () => {
    const items = currentItems.filter(i => selectedIds.includes(i.id));
    if (!items.length) return;
    onAddSelected(items);
    reset();
  };
  const create = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    const item = await onCreateItem(tab, name);
    setCreating(false);
    if (item) { onAddSelected([item]); reset(); }
  };
  const reset = () => { setSelectedIds([]); setQ(''); setNewMode(false); setNewName(''); setTab('natural'); };
  const close = () => { reset(); onClose(); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={close}>
      <div className="w-full max-w-xl rounded-xl border border-slate-200 bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <p className="text-[13px] font-semibold uppercase tracking-widest text-slate-400">{kind === 'partner' ? 'افزودن طرف اول' : 'افزودن طرف دوم'}</p>
          <button type="button" onClick={close} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex gap-1.5">
            <TPill label="حقیقی" active={tab === 'natural'} onClick={() => setTab('natural')} />
            <TPill label="حقوقی" active={tab === 'legal'} onClick={() => setTab('legal')} />
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="جستجو..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-white pr-9 pl-3 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none focus:border-slate-400" />
          </div>
          {newMode ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={tab === 'natural' ? 'نام و نام خانوادگی' : 'نام شرکت'}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-700 outline-none focus:border-slate-400" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setNewMode(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] text-slate-600 hover:bg-slate-100">انصراف</button>
                <button type="button" onClick={create} disabled={!newName.trim() || creating}
                  className="rounded-lg bg-teal-700 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-teal-800 disabled:opacity-50">{creating ? '...' : 'ثبت'}</button>
              </div>
            </div>
          ) : null}
          <div className="max-h-56 space-y-1.5 overflow-y-auto">
            {loading ? <p className="py-6 text-center text-[12px] text-slate-400">در حال بارگذاری...</p>
              : available.length ? available.map(item => {
                const checked = selectedIds.includes(item.id);
                return (
                  <button key={item.id} type="button" onClick={() => toggle(item.id)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-right transition-colors ${checked ? 'border-teal-300 bg-teal-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${checked ? 'border-teal-600 bg-teal-600 text-white' : 'border-slate-300'}`}>
                        {checked ? <Check className="h-2.5 w-2.5 stroke-[3]" /> : null}
                      </span>
                      <span className="text-[13px] text-slate-700">{item.name}</span>
                    </div>
                    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500">{typeLabel(item.personType)}</span>
                  </button>
                );
              }) : <p className="py-6 text-center text-[12px] text-slate-400">موردی یافت نشد</p>}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <button type="button" onClick={() => setNewMode(p => !p)} className="inline-flex items-center gap-1.5 text-[12px] text-teal-700 hover:text-teal-800">
            <Plus className="h-3.5 w-3.5" />
            {tab === 'natural' ? 'شخص جدید' : 'شرکت جدید'}
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={close} className="rounded-lg border border-slate-200 px-4 py-1.5 text-[12px] text-slate-600 hover:bg-slate-50">انصراف</button>
            <button type="button" onClick={confirm} disabled={!selectedIds.length}
              className="rounded-lg bg-teal-700 px-4 py-1.5 text-[12px] font-medium text-white hover:bg-teal-800 disabled:opacity-50">افزودن ({selectedIds.length})</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PSection({ sLabel, sDesc, rows, shareMode, onMode, onPrimary, onRemove, addLabel, onOpen }: {
  sLabel: string; sDesc: string; rows: PartyRow[]; shareMode: ShareMode;
  onMode: (m: ShareMode) => void; onPrimary: (id: string) => void;
  onRemove: (id: string) => void; addLabel: string; onOpen: () => void;
}) {
  return (
    <div className="space-y-3">
      <SCard>
        <SHeader label="نوع سهم" desc="نحوه محاسبه سهم هر طرف را مشخص کنید" />
        <div className="flex flex-wrap gap-1.5 p-5">
          <TPill label="دانگ" active={shareMode === 'dang'} onClick={() => onMode('dang')} />
          <TPill label="درصد" active={shareMode === 'percent'} onClick={() => onMode('percent')} />
        </div>
      </SCard>
      <SCard>
        <SHeader label={sLabel} desc={sDesc} />
        <div className="space-y-2 p-5">
          {rows.length === 0
            ? <p className="py-4 text-center text-[12px] text-slate-400">هنوز کسی اضافه نشده</p>
            : rows.map(row => <PRowCard key={row.id} row={row} showPrimary={rows.length > 1} onPrimary={() => onPrimary(row.id)} onRemove={() => onRemove(row.id)} />)}
          <button type="button" onClick={onOpen}
            className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-[13px] font-medium text-teal-700 hover:bg-teal-100">
            <Plus className="h-3.5 w-3.5" />{addLabel}
          </button>
        </div>
      </SCard>
    </div>
  );
}

export function PartiesStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');
  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<PartyKey>('party-one');
  const [p1Mode, setP1Mode] = useState<ShareMode>('dang');
  const [p2Mode, setP2Mode] = useState<ShareMode>('dang');
  const [p1Rows, setP1Rows] = useState<PartyRow[]>([DEFAULT_PARTY_ONE]);
  const [p2Rows, setP2Rows] = useState<PartyRow[]>([]);
  const [pNat, setPNat] = useState<DirectoryItem[]>(MOCK_PARTNER_NATURALS);
  const [pLeg, setPLeg] = useState<DirectoryItem[]>(MOCK_PARTNER_LEGALS);
  const [bNat, setBNat] = useState<DirectoryItem[]>(MOCK_BUYER_NATURALS);
  const [bLeg, setBLeg] = useState<DirectoryItem[]>(MOCK_BUYER_LEGALS);
  const [d1, setD1] = useState(false);
  const [d2, setD2] = useState(false);
  const [dLoad, setDLoad] = useState(false);

  const applyRef = (ref: ReferenceDataResponse) => {
    setPNat(ref.directory.partner.natural.map(i => ({ ...i, personType: 'natural' as const, directoryId: i.id })));
    setPLeg(ref.directory.partner.legal.map(i => ({ ...i, personType: 'legal' as const, directoryId: i.id })));
    setBNat(ref.directory.buyer.natural.map(i => ({ ...i, personType: 'natural' as const, directoryId: i.id })));
    setBLeg(ref.directory.buyer.legal.map(i => ({ ...i, personType: 'legal' as const, directoryId: i.id })));
  };
  const reloadDir = async () => { setDLoad(true); try { applyRef(await getReferenceData()); } finally { setDLoad(false); } };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const id = await ensureActiveDraftId();
        const [ref, data] = await Promise.all([getReferenceData(), getStepData<ContractPartiesData>(id, 'parties')]);
        if (!mounted) return;
        setDraftId(id); applyRef(ref);
        if (data) {
          setP1Mode(data.partyOneMode); setP2Mode(data.partyTwoMode);
          setP1Rows(data.partyOne.map(i => ({ id: i.personId, directoryId: i.directoryId ?? null, personType: i.personType, name: i.name, shareValue: i.share.value, isPrimary: Boolean(i.isPrimary), locked: i.personId === DEFAULT_PARTY_ONE.id })));
          setP2Rows(data.partyTwo.map(i => ({ id: i.personId, directoryId: i.directoryId ?? null, personType: i.personType, name: i.name, shareValue: i.share.value, isPrimary: Boolean(i.isPrimary) })));
        }
      } finally { if (mounted) setLoading(false); }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const norm = (rows: PartyRow[]) => (!rows.length || rows.some(r => r.isPrimary)) ? rows : rows.map((r, i) => ({ ...r, isPrimary: i === 0 }));
  const setPri = (rows: PartyRow[], id: string) => rows.map(r => ({ ...r, isPrimary: r.id === id }));
  const remRow = (rows: PartyRow[], id: string) => norm(rows.filter(r => r.id !== id));
  const addRows = (cur: PartyRow[], items: DirectoryItem[]) =>
    norm([...cur, ...items.filter(i => !cur.some(r => r.id === i.id)).map(i => ({ ...i, shareValue: 0, isPrimary: cur.length === 0 }))]);

  const chMode1 = (m: ShareMode) => { if (m === p1Mode) return; setP1Rows(r => r.map(x => ({ ...x, shareValue: cvtShare(x.shareValue, p1Mode, m) }))); setP1Mode(m); };
  const chMode2 = (m: ShareMode) => { if (m === p2Mode) return; setP2Rows(r => r.map(x => ({ ...x, shareValue: cvtShare(x.shareValue, p2Mode, m) }))); setP2Mode(m); };

  const createItem = async (kind: EntityKind, personType: PersonType, name: string) => {
    const c = await createDirectoryPerson({ role: kind, personType, name });
    const item: DirectoryItem = { id: c.id, directoryId: c.id, name: c.name, personType: c.personType };
    if (kind === 'partner') personType === 'natural' ? setPNat(p => [...p, item]) : setPLeg(p => [...p, item]);
    else personType === 'natural' ? setBNat(p => [...p, item]) : setBLeg(p => [...p, item]);
    return item;
  };

  const buildPayload = (): ContractPartiesData => ({
    partyOneMode: p1Mode, partyTwoMode: p2Mode,
    partyOne: p1Rows.map(r => ({ personId: r.id, directoryId: r.directoryId ?? null, personType: r.personType, name: r.name, isPrimary: r.isPrimary, share: { value: r.shareValue, mode: p1Mode } })),
    partyTwo: p2Rows.map(r => ({ personId: r.id, directoryId: r.directoryId ?? null, personType: r.personType, name: r.name, isPrimary: r.isPrimary, share: { value: r.shareValue, mode: p2Mode } })),
  });

  const handleSubmit = async () => {
    if (!draftId) return;
    setSaving(true);
    try {
      const payload = buildPayload();
      await saveStepData(draftId, 'parties', payload);
      initialSnapshotRef.current = JSON.stringify(payload);
      dispatchContractFlowDirty(stepId as 'parties', false);
      dispatchContractFlowSaved(stepId as 'parties');
      router.push(basePath);
    } finally { setSaving(false); }
  };

  useEffect(() => {
    if (loading || !draftId) return;
    const snap = JSON.stringify(buildPayload());
    if (!initialSnapshotRef.current) { initialSnapshotRef.current = snap; dispatchContractFlowDirty(stepId as 'parties', false); return; }
    dispatchContractFlowDirty(stepId as 'parties', snap !== initialSnapshotRef.current);
  }, [draftId, loading, p1Mode, p1Rows, p2Mode, p2Rows, stepId]);

  return (
    <div className="space-y-4">
      {!embedded ? (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <p className="mt-0.5 text-[13px] text-slate-500">طرف اول و طرف دوم قرارداد را مدیریت کنید.</p>
          </div>
          <button type="button" onClick={() => router.push(basePath)} className="rounded-lg border border-slate-200 px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-50">بازگشت</button>
        </div>
      ) : null}

      <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1">
        {(['party-one', 'party-two'] as PartyKey[]).map(key => (
          <button key={key} type="button" onClick={() => setActiveTab(key)}
            className={`flex-1 rounded-md px-4 py-2 text-[13px] font-medium transition-all ${activeTab === key ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
            {key === 'party-one' ? 'طرف اول (فروشنده)' : 'طرف دوم (خریدار)'}
          </button>
        ))}
      </div>

      {activeTab === 'party-one'
        ? <PSection sLabel="طرف اول قرارداد" sDesc="فروشنده یا شرکای فروش را اضافه کنید" rows={p1Rows} shareMode={p1Mode} onMode={chMode1} onPrimary={id => setP1Rows(r => setPri(r, id))} onRemove={id => setP1Rows(r => remRow(r, id))} addLabel="افزودن طرف اول" onOpen={() => { void reloadDir(); setD1(true); }} />
        : <PSection sLabel="طرف دوم قرارداد" sDesc="خریداران را اضافه کنید" rows={p2Rows} shareMode={p2Mode} onMode={chMode2} onPrimary={id => setP2Rows(r => setPri(r, id))} onRemove={id => setP2Rows(r => remRow(r, id))} addLabel="افزودن طرف دوم" onOpen={() => { void reloadDir(); setD2(true); }} />
      }

      <StickySubmitBar label="ذخیره طرفین" loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'} disabled={loading || saving} onClick={handleSubmit} embedded={embedded} submitId={stepId} />

      <SelDialog open={d1} onClose={() => setD1(false)} kind="partner" rows={p1Rows} naturalItems={pNat} legalItems={pLeg}
        onCreateItem={(p, n) => createItem('partner', p, n)} onAddSelected={items => { setP1Rows(r => addRows(r, items)); setD1(false); }} loading={dLoad} />
      <SelDialog open={d2} onClose={() => setD2(false)} kind="buyer" rows={p2Rows} naturalItems={bNat} legalItems={bLeg}
        onCreateItem={(p, n) => createItem('buyer', p, n)} onAddSelected={items => { setP2Rows(r => addRows(r, items)); setD2(false); }} loading={dLoad} />
    </div>
  );
}
