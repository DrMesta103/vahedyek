'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PartySection } from './PartySection';
import { PartySelectionDialog } from './PartySelectionDialog';
import { StickySubmitBar } from '@repo/ui';
import { ContractStepLoader } from './ContractStepLoader';
import { FieldGroup, TagPills } from './ContractFormPrimitives';
import { dispatchContractFlowDirty, dispatchContractFlowSavedForDraft } from './contractFlowSignals';
import { validateStep2 } from '../../../../lib/contractValidation';
import { buildValidationSummary } from './validationPresentation';
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
  fetchProfileStore,
  type OwnershipKind,
  type ProfileStore,
  type RepresentativeRecord,
  type LegalShareholderRecord,
  type NaturalShareholderRecord,
} from '../../../business-settings/profile/_components/profileStorage';
import {
  createDirectoryPerson,
  ensureActiveDraftId,
  getReferenceData,
  getStepData,
  saveStepData,
  type ReferenceDataResponse,
} from '../../../../lib/contractDraftClient';
import type { ContractPartiesData } from '../../../../types/contract';

type AuthMePayload = {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
    brandCode: string;
  } | null;
  membership: {
    id: string;
    role: string;
    roleLabels: string[];
    roleKeys: string[];
  } | null;
  access: {
    isOwner: boolean;
    roleLabels: string[];
    roleKeys: string[];
    permissionKeys: string[];
    allowedMenuItemIds: string[];
  } | null;
} | null;

function normalizeName(value: string | undefined | null) {
  return value?.trim().replace(/\s+/g, ' ') ?? '';
}

function hasAnyRole(roleKeys: Set<string>, keys: string[]) {
  return keys.some((key) => roleKeys.has(key));
}

function buildLegalPartyOneName(companyName: string, actorName: string, title?: string) {
  const segments = [companyName, actorName].filter(Boolean);
  if (title) segments.push(`سمت: ${title}`);
  return segments.join(' - ');
}

function buildDefaultPartyOneRow(
  shareMode: ShareMode,
  profileStore: ProfileStore,
  auth: AuthMePayload,
): PartyRow {
  const shareValue = PARTY_TOTALS[shareMode];
  const userId = auth?.user.id ?? 'anonymous';
  const userFullName = normalizeName(auth?.user.fullName);
  const roleKeys = new Set([...(auth?.membership?.roleKeys ?? []), ...(auth?.access?.roleKeys ?? [])]);
  const ownershipKind: OwnershipKind = profileStore.ownershipKind === 'natural' ? 'natural' : 'legal';

  const matchingNaturalShareholder =
    userFullName &&
    profileStore.naturalShareholders.find((item: NaturalShareholderRecord) => normalizeName(item.fullName) === userFullName);

  if (ownershipKind === 'natural') {
    const displayName = matchingNaturalShareholder?.fullName || userFullName || 'صاحب کسب و کار';
    return {
      id: matchingNaturalShareholder ? `default-natural-shareholder:${matchingNaturalShareholder.id}` : `default-owner:${userId}`,
      directoryId: null,
      personType: 'natural',
      name: displayName,
      shareValue,
      isPrimary: true,
    };
  }

  const companyName = normalizeName(profileStore.legal.companyName) || normalizeName(auth?.tenant?.name) || 'شخص حقوقی';
  const matchingLegalRepresentative = userFullName
    ? profileStore.legalShareholders
        .map((shareholder: LegalShareholderRecord) => ({
          shareholder,
          representative: shareholder.representatives.find((item: RepresentativeRecord) => normalizeName(item.fullName) === userFullName) ?? null,
        }))
        .find((item) => item.representative)
    : undefined;
  const matchingRepresentative =
    userFullName &&
    (profileStore.representatives.find((item: RepresentativeRecord) => normalizeName(item.fullName) === userFullName) ?? null);

  if (matchingLegalRepresentative?.representative && hasAnyRole(roleKeys, ['legal_shareholder_representative'])) {
    return {
      id: `default-legal-shareholder-representative:${matchingLegalRepresentative.shareholder.id}:${matchingLegalRepresentative.representative.id}`,
      directoryId: null,
      personType: 'legal',
      name: buildLegalPartyOneName(companyName, matchingLegalRepresentative.representative.fullName, 'نماینده سهام دار حقوقی'),
      shareValue,
      isPrimary: true,
    };
  }

  if (matchingRepresentative && hasAnyRole(roleKeys, ['representative', 'partner_representative'])) {
    return {
      id: `default-representative:${matchingRepresentative.id}`,
      directoryId: null,
      personType: 'legal',
      name: buildLegalPartyOneName(companyName, matchingRepresentative.fullName, roleKeys.has('partner_representative') ? 'نماینده شریک' : 'نماینده'),
      shareValue,
      isPrimary: true,
    };
  }

  if (matchingNaturalShareholder && hasAnyRole(roleKeys, ['shareholder'])) {
    return {
      id: `default-shareholder:${matchingNaturalShareholder.id}`,
      directoryId: null,
      personType: 'legal',
      name: buildLegalPartyOneName(companyName, matchingNaturalShareholder.fullName, 'سهام دار'),
      shareValue,
      isPrimary: true,
    };
  }

  return {
    id: `default-legal-owner:${userId}`,
    directoryId: null,
    personType: 'legal',
    name: buildLegalPartyOneName(companyName, userFullName || 'صاحب کسب و کار'),
    shareValue,
    isPrimary: true,
  };
}

async function getAuthMe() {
  const response = await fetch('/api/auth/me', { cache: 'no-store' });
  if (!response.ok) return null;
  return (await response.json()) as AuthMePayload;
}

export function PartiesStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const initialSnapshotRef = useRef('');

  const [draftId, setDraftId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [showValidation, setShowValidation] = useState(false);

  const [shareMode, setShareMode] = useState<ShareMode>('dang');
  const [partyOneRows, setPartyOneRows] = useState<PartyRow[]>([]);
  const [partyTwoRows, setPartyTwoRows] = useState<PartyRow[]>([]);
  const [defaultPartyOneRow, setDefaultPartyOneRow] = useState<PartyRow | null>(null);
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
        const [referenceData, partiesData, profileStore, auth] = await Promise.all([
          getReferenceData(),
          getStepData<ContractPartiesData>(id, 'parties'),
          fetchProfileStore(),
          getAuthMe(),
        ]);

        if (!mounted) return;

        setDraftId(id);
        applyReferenceData(referenceData);
        const computedDefaultPartyOneRow = buildDefaultPartyOneRow('dang', profileStore, auth);
        setDefaultPartyOneRow(computedDefaultPartyOneRow);

        if (partiesData) {
          const nextShareMode = partiesData.partyOneMode ?? partiesData.partyTwoMode ?? 'dang';
          setShareMode(nextShareMode);
          const nextDefaultPartyOneRow =
            nextShareMode === 'dang'
              ? computedDefaultPartyOneRow
              : {
                  ...computedDefaultPartyOneRow,
                  shareValue: PARTY_TOTALS[nextShareMode],
                };
          setDefaultPartyOneRow(nextDefaultPartyOneRow);
          setPartyOneRows(
            partiesData.partyOne.length
              ? partiesData.partyOne.map((item) => ({
                  id: item.personId,
                  directoryId: item.directoryId ?? null,
                  personType: item.personType,
                  name: item.name,
                  shareValue: item.share.value,
                  isPrimary: Boolean(item.isPrimary),
                }))
              : [nextDefaultPartyOneRow],
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
        } else {
          setPartyOneRows([computedDefaultPartyOneRow]);
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
    setDefaultPartyOneRow((current) =>
      current
        ? {
            ...current,
            shareValue: PARTY_TOTALS[nextMode],
          }
        : current,
    );
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

  const removeRow = (rows: PartyRow[], id: string, fallbackRow?: PartyRow | null) => {
    const nextRows = rows.filter((row) => row.id !== id);
    if (!nextRows.length && fallbackRow) {
      return [fallbackRow];
    }
    return normalizePrimary(nextRows);
  };

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

  const payload = buildPayload();
  const validation = validateStep2(payload);
  const visibleErrors = showValidation ? validation.errors : {};

  const handleSubmit = async () => {
    if (!draftId) return;

    if (!validation.valid) {
      setShowValidation(true);
      setFormError(buildValidationSummary(validation.errors, {
        partyOne: 'طرف اول',
        partyTwo: 'طرف دوم',
        shares: 'سهم طرف اول',
        partyTwoShares: 'سهم طرف دوم',
      }, 'اطلاعات طرفین کامل نیست.'));
      return;
    }

    setSaving(true);
    setFormError('');
    setShowValidation(false);
    try {
      await saveStepData(draftId, 'parties', payload);
      initialSnapshotRef.current = JSON.stringify(payload);
      dispatchContractFlowDirty(stepId as 'parties', false);
      dispatchContractFlowSavedForDraft(draftId, stepId as 'parties', Date.now(), payload);
      router.push(basePath);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (loading || !draftId) return;
    const snapshot = JSON.stringify(payload);
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
      {formError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>
      ) : null}

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
        onRemove={(id) => setPartyOneRows((current) => removeRow(current, id, defaultPartyOneRow))}
        addButtonLabel={partyOneLabels.addButton}
        onOpenDialog={() => {
          void reloadReferenceData();
          setPartyOneDialogOpen(true);
        }}
        invalid={Boolean(visibleErrors.partyOne || visibleErrors.shares)}
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
        invalid={Boolean(visibleErrors.partyTwo || visibleErrors.partyTwoShares)}
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
