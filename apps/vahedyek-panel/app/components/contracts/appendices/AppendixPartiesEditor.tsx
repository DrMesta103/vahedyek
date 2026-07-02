'use client';

import { useEffect, useMemo, useState } from 'react';
import { FieldGroup, TagPills } from '../../../(panel)/contracts/new/_components/ContractFormPrimitives';
import { PartySection } from '../../../(panel)/contracts/new/_components/PartySection';
import { PartySelectionDialog } from '../../../(panel)/contracts/new/_components/PartySelectionDialog';
import {
  PARTY_TOTALS,
  clampShare,
  convertShare,
  getEntityLabels,
  mapRowsToPayload,
  roundShare,
  type DirectoryItem,
  type PartyRow,
  type PersonType,
  type ShareMode,
} from '../../../(panel)/contracts/new/_components/partiesTypes';
import { createDirectoryPerson, getReferenceData, type ReferenceDataResponse } from '../../../lib/contractDraftClient';
import { fetchProfileStore, type ProfileStore } from '../../../(panel)/business-settings/profile/_components/profileStorage';
import type { ContractPartiesData, ContractParty } from '../../../types/contract';

type Side = 'first-party' | 'second-party';

type PartiesValue = {
  shareMode: ShareMode;
  parties: ContractParty[];
};

function normalizePrimary(rows: PartyRow[]) {
  if (!rows.length) return rows;
  if (rows.some((row) => row.isPrimary)) return rows;
  return rows.map((row, index) => ({ ...row, isPrimary: index === 0 }));
}

function setPrimaryRow(rows: PartyRow[], id: string) {
  return rows.map((row) => ({
    ...row,
    isPrimary: row.id === id,
    tags: row.id === id ? ['طرف اصلی'] : undefined,
  }));
}

function updateRowShare(rows: PartyRow[], id: string, rawValue: string, mode: ShareMode) {
  const parsed = rawValue === '' ? 0 : Number(rawValue);
  const otherTotal = rows.filter((row) => row.id !== id).reduce((sum, row) => sum + row.shareValue, 0);
  const maxForRow = Math.max(0, PARTY_TOTALS[mode] - otherTotal);
  const nextValue = Math.min(clampShare(parsed, mode), maxForRow);

  return rows.map((row) => (row.id === id ? { ...row, shareValue: roundShare(nextValue) } : row));
}

function removeRow(rows: PartyRow[], id: string) {
  return normalizePrimary(
    rows
      .filter((row) => row.id !== id)
      .map((row) => ({
        ...row,
        tags: row.isPrimary ? ['طرف اصلی'] : undefined,
      })),
  );
}

function addRows(currentRows: PartyRow[], items: DirectoryItem[]) {
  return normalizePrimary([
    ...currentRows,
    ...items
      .filter((item) => !currentRows.some((row) => row.id === item.id))
      .map((item) => ({
        ...item,
        shareValue: 0,
        isPrimary: currentRows.length === 0,
        tags: currentRows.length === 0 ? ['طرف اصلی'] : undefined,
      })),
  ]);
}

function addRowsWithoutPrimary(currentRows: PartyRow[], items: DirectoryItem[]) {
  return [
    ...currentRows,
    ...items
      .filter((item) => !currentRows.some((row) => row.id === item.id))
      .map((item) => ({
        ...item,
        shareValue: 0,
        isPrimary: false,
      })),
  ];
}

function convertRows(rows: PartyRow[], from: ShareMode, to: ShareMode) {
  return rows.map((row) => ({
    ...row,
    shareValue: convertShare(row.shareValue, from, to),
  }));
}

function applyReferenceData(referenceData: ReferenceDataResponse) {
  return {
    partnerNaturals: referenceData.directory.partner.natural.map((item) => ({
      ...item,
      personType: 'natural' as const,
      directoryId: item.id,
    })),
    partnerLegals: referenceData.directory.partner.legal.map((item) => ({
      ...item,
      personType: 'legal' as const,
      directoryId: item.id,
    })),
    buyerNaturals: referenceData.directory.buyer.natural.map((item) => ({
      ...item,
      personType: 'natural' as const,
      directoryId: item.id,
    })),
    buyerLegals: referenceData.directory.buyer.legal.map((item) => ({
      ...item,
      personType: 'legal' as const,
      directoryId: item.id,
    })),
  };
}

function applyPartnerDirectoryFromProfile(store: ProfileStore) {
  const source: 'partners' | 'shareholders' = store.ownershipKind === 'natural' ? 'partners' : 'shareholders';

  const partnerNaturals =
    source === 'partners'
      ? (store.principalPartners ?? []).map((item: any) => ({
          id: String(item.id),
          directoryId: null,
          personType: 'natural' as const,
          name: String(item.fullName || item.mobile || item.email || 'شریک'),
        }))
      : (store.naturalShareholders ?? []).map((item: any) => ({
          id: String(item.id),
          directoryId: null,
          personType: 'natural' as const,
          name: String(item.fullName || item.mobile || item.email || 'سهام‌دار'),
        }));

  const partnerLegals =
    source === 'partners'
      ? []
      : (store.legalShareholders ?? []).map((item: any) => ({
          id: String(item.id),
          directoryId: null,
          personType: 'legal' as const,
          name: String(item.companyName || item.brandName || 'سهام‌دار حقوقی'),
        }));

  return { source, partnerNaturals, partnerLegals };
}

function applyBuyerDirectoryFromProfile(store: ProfileStore) {
  return {
    buyerNaturals: (store.naturalBuyers ?? []).map((item: any) => ({
      id: String(item.id),
      directoryId: null,
      personType: 'natural' as const,
      name: String(item.fullName || item.mobile || item.email || 'خریدار'),
    })),
    buyerLegals: (store.legalBuyers ?? []).map((item: any) => ({
      id: String(item.id),
      directoryId: null,
      personType: 'legal' as const,
      name: String(item.companyName || item.brandName || 'خریدار حقوقی'),
    })),
  };
}

function toPartyRows(parties: ContractParty[]) {
  return normalizePrimary(
    parties.map((item) => ({
      id: item.personId,
      directoryId: item.directoryId ?? null,
      personType: item.personType,
      name: item.name,
      shareValue: Number(item.share?.value ?? 0),
      isPrimary: Boolean(item.isPrimary),
      locked: false,
      lockShare: false,
      tags: item.isPrimary ? ['طرف اصلی'] : undefined,
    })),
  );
}

export function AppendixPartiesEditor({
  side,
  value,
  initialParties,
  returnTo,
  onChange,
  openDialogSignal,
  onDialogSignalConsumed,
}: {
  side: Side;
  value: PartiesValue | null;
  initialParties: ContractPartiesData | null;
  returnTo: string;
  onChange: (value: PartiesValue) => void;
  openDialogSignal?: number;
  onDialogSignalConsumed?: () => void;
}) {
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [partnerSource, setPartnerSource] = useState<'partners' | 'shareholders'>('shareholders');
  const [partnerNaturals, setPartnerNaturals] = useState<DirectoryItem[]>([]);
  const [partnerLegals, setPartnerLegals] = useState<DirectoryItem[]>([]);
  const [buyerNaturals, setBuyerNaturals] = useState<DirectoryItem[]>([]);
  const [buyerLegals, setBuyerLegals] = useState<DirectoryItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const shareMode = value?.shareMode ?? initialParties?.partyOneMode ?? initialParties?.partyTwoMode ?? 'dang';

  const rows = useMemo(() => {
    if (value) return toPartyRows(value.parties);

    return side === 'first-party'
      ? toPartyRows(initialParties?.partyOne ?? [])
      : toPartyRows(initialParties?.partyTwo ?? []);
  }, [initialParties, side, value]);

  useEffect(() => {
    if (value) return;
    onChange({
      shareMode,
      parties: mapRowsToPayload(rows, shareMode),
    });
  }, [onChange, rows, shareMode, value]);

  const reloadReferenceData = async () => {
    setDirectoryLoading(true);
    try {
      const [referenceData, profileStore] = await Promise.all([getReferenceData(), fetchProfileStore()]);
      const apiDirectory = applyReferenceData(referenceData);
      const profilePartners = applyPartnerDirectoryFromProfile(profileStore);
      const profileBuyers = applyBuyerDirectoryFromProfile(profileStore);

      setPartnerSource(profilePartners.source);
      setPartnerNaturals(profilePartners.partnerNaturals.length ? profilePartners.partnerNaturals : apiDirectory.partnerNaturals);
      setPartnerLegals(profilePartners.partnerLegals.length ? profilePartners.partnerLegals : apiDirectory.partnerLegals);
      setBuyerNaturals(profileBuyers.buyerNaturals.length ? profileBuyers.buyerNaturals : apiDirectory.buyerNaturals);
      setBuyerLegals(profileBuyers.buyerLegals.length ? profileBuyers.buyerLegals : apiDirectory.buyerLegals);
    } finally {
      setDirectoryLoading(false);
    }
  };

  useEffect(() => {
    void reloadReferenceData();
  }, []);

  useEffect(() => {
    if (!openDialogSignal) return;
    void reloadReferenceData().then(() => {
      setDialogOpen(true);
      onDialogSignalConsumed?.();
    });
  }, [onDialogSignalConsumed, openDialogSignal]);

  const setRowsAndShareMode = (nextRows: PartyRow[], nextShareMode = shareMode) => {
    onChange({
      shareMode: nextShareMode,
      parties: mapRowsToPayload(nextRows, nextShareMode),
    });
  };

  const handleShareModeChange = (nextMode: ShareMode) => {
    if (nextMode === shareMode) return;
    setRowsAndShareMode(convertRows(rows, shareMode, nextMode), nextMode);
  };

  const createDirectoryItem = async (kind: 'partner' | 'buyer', personType: PersonType, name: string) => {
    const created = await createDirectoryPerson({ role: kind, personType, name });
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

  const labels = getEntityLabels(side === 'first-party' ? 'partner' : 'buyer');
  const helperText =
    side === 'first-party'
      ? 'برای اصلاح طرف اول، می‌توانید افراد را اضافه، حذف و سهم هر کدام را در همین صفحه تنظیم کنید.'
      : 'برای افزودن خریداران (طرف دوم)، از دکمه + استفاده کنید.';

  return (
    <div className="space-y-5">
        <FieldGroup label="نوع سهم">
        <TagPills
          value={shareMode}
          onChange={handleShareModeChange}
          options={[
            { value: 'dang', label: 'دانگ' },
            { value: 'percent', label: 'درصد' },
          ]}
          className="justify-end"
        />
      </FieldGroup>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-right text-[12px] font-semibold text-slate-500">{helperText}</div>
        <button
          type="button"
          onClick={() => {
            void reloadReferenceData();
            setDialogOpen(true);
          }}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_90%,black)] shadow-sm transition hover:bg-[color-mix(in_srgb,var(--dark-teal)_16%,white)]"
          aria-label={side === 'first-party' ? 'افزودن طرف اول' : 'افزودن طرف دوم'}
        >
          <span className="text-xl leading-none">+</span>
        </button>
      </div>

      <PartySection
        title={labels.formTitle}
        description={labels.formDescription}
        rows={rows}
        shareMode={shareMode}
        onShareChange={(id, amount) => setRowsAndShareMode(updateRowShare(rows, id, amount, shareMode))}
        onPrimaryChange={(id) => setRowsAndShareMode(setPrimaryRow(rows, id))}
        onRemove={(id) => setRowsAndShareMode(removeRow(rows, id))}
        addButtonLabel={labels.addButton}
        onOpenDialog={() => {
          void reloadReferenceData();
          setDialogOpen(true);
        }}
        disableAdd
        layout="grid"
        primaryControl="switch"
      />

      <PartySelectionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        kind={side === 'first-party' ? 'partner' : 'buyer'}
        partnerSource={partnerSource}
        rows={rows}
        naturalItems={side === 'first-party' ? partnerNaturals : buyerNaturals}
        legalItems={side === 'first-party' ? partnerLegals : buyerLegals}
        onCreateItem={(personType, name) =>
          createDirectoryItem(side === 'first-party' ? 'partner' : 'buyer', personType, name)
        }
        onAddSelected={(items) => {
          const nextRows = side === 'first-party' ? addRows(rows, items) : addRowsWithoutPrimary(rows, items);
          setRowsAndShareMode(nextRows);
          setDialogOpen(false);
        }}
        loading={directoryLoading}
        returnToOverride={returnTo}
      />
    </div>
  );
}

