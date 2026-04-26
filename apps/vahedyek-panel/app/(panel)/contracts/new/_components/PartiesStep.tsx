'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PartySection } from './PartySection';
import { PartySelectionDialog } from './PartySelectionDialog';
import { StickySubmitBar } from './StickySubmitBar';
import { ContractStepLoader } from './ContractStepLoader';
import { FieldGroup, TagPills } from './ContractFormPrimitives';
import { dispatchContractFlowDirty, dispatchContractFlowSaved } from './contractFlowSignals';
import {
  clampShare,
  convertShare,
  getEntityLabels,
  mapRowsToPayload,
  PARTY_TOTALS,
  roundShare,
  type DirectoryItem,
  type EntityKind,
  type PartyRow,
  type PersonType,
  type ShareMode,
} from './partiesTypes';
import { useContractFlowBasePath } from './useContractFlowBasePath';
import {
  createDirectoryPerson,
  ensureActiveDraftId,
  getReferenceData,
  getStepData,
  saveStepData,
  type ReferenceDataResponse,
} from '../../../../lib/contractDraftClient';
import type { ContractPartiesData } from '../../../../types/contract';

export function PartiesStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');

  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [shareMode, setShareMode] = useState<ShareMode>('dang');
  const [partyOneRows, setPartyOneRows] = useState<PartyRow[]>([]);
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
          setShareMode(partiesData.partyOneMode ?? partiesData.partyTwoMode ?? 'dang');
          setPartyOneRows(
            partiesData.partyOne.map((item) => ({
              id: item.personId,
              directoryId: item.directoryId ?? null,
              personType: item.personType,
              name: item.name,
              shareValue: item.share.value,
              isPrimary: Boolean(item.isPrimary),
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

    void load();

    return () => {
      mounted = false;
    };
  }, []);

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

  const handleShareModeChange = (nextMode: ShareMode) => {
    if (nextMode === shareMode) return;
    setPartyOneRows((current) => convertRows(current, shareMode, nextMode));
    setPartyTwoRows((current) => convertRows(current, shareMode, nextMode));
    setShareMode(nextMode);
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
    partyOneMode: shareMode,
    partyTwoMode: shareMode,
    partyOne: mapRowsToPayload(partyOneRows, shareMode),
    partyTwo: mapRowsToPayload(partyTwoRows, shareMode),
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
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (loading || !draftId) return;
    const snapshot = JSON.stringify(buildPayload());
    if (!initialSnapshotRef.current) {
      initialSnapshotRef.current = snapshot;
      dispatchContractFlowDirty(stepId as 'parties', false);
      return;
    }

    dispatchContractFlowDirty(stepId as 'parties', snapshot !== initialSnapshotRef.current);
  }, [draftId, loading, partyOneRows, partyTwoRows, shareMode, stepId]);

  const partyOneLabels = getEntityLabels('partner');
  const partyTwoLabels = getEntityLabels('buyer');
  const sectionDivider = (label: string) => (
    <div className="flex items-center gap-4 py-2" aria-hidden="true">
      <div className="h-px flex-1 bg-[var(--theme-divider)]" />
      <span className="rounded-full border border-[var(--theme-divider)] bg-[var(--surface)] px-4 py-1 text-xs font-bold text-[var(--text-muted)]">
        {label}
      </span>
      <div className="h-px flex-1 bg-[var(--theme-divider)]" />
    </div>
  );

  if (loading) {
    return <ContractStepLoader title={title} description="در حال بارگذاری اطلاعات طرفین قرارداد..." />;
  }

  return (
    <div className="space-y-5">
      {!embedded ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="mt-1 text-gray-500">طرف اول و طرف دوم را در یک صفحه مدیریت کنید و برای هر کدام سهم مستقل ثبت کنید.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push(basePath)}
            className="rounded-md border border-gray-300 px-3.5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            بازگشت به مراحل
          </button>
        </div>
      ) : null}

      <FieldGroup label="نوع سهم">
        <TagPills
          value={shareMode}
          onChange={handleShareModeChange}
          options={[
            { value: 'dang', label: 'دانگ' },
            { value: 'percent', label: 'درصد' },
          ]}
        />
      </FieldGroup>

      {sectionDivider('طرف اول')}

      <PartySection
        title={partyOneLabels.formTitle}
        description={partyOneLabels.formDescription}
        rows={partyOneRows}
        shareMode={shareMode}
        onShareChange={(id, value) => setPartyOneRows((current) => updateRowShare(current, id, value, shareMode))}
        onPrimaryChange={(id) => setPartyOneRows((current) => setPrimaryRow(current, id))}
        onRemove={(id) => setPartyOneRows((current) => removeRow(current, id))}
        addButtonLabel={partyOneLabels.addButton}
        onOpenDialog={() => {
          void reloadReferenceData();
          setPartyOneDialogOpen(true);
        }}
      />

      {sectionDivider('طرف دوم')}

      <PartySection
        title={partyTwoLabels.formTitle}
        description={partyTwoLabels.formDescription}
        rows={partyTwoRows}
        shareMode={shareMode}
        onShareChange={(id, value) => setPartyTwoRows((current) => updateRowShare(current, id, value, shareMode))}
        onPrimaryChange={(id) => setPartyTwoRows((current) => setPrimaryRow(current, id))}
        onRemove={(id) => setPartyTwoRows((current) => removeRow(current, id))}
        addButtonLabel={partyTwoLabels.addButton}
        onOpenDialog={() => {
          void reloadReferenceData();
          setPartyTwoDialogOpen(true);
        }}
      />

      <StickySubmitBar
        label="ثبت اطلاعات طرفین"
        loadingLabel={loading ? 'در حال بارگذاری...' : 'در حال ذخیره...'}
        disabled={loading || saving}
        onClick={handleSubmit}
        embedded={embedded}
        submitId={stepId}
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
