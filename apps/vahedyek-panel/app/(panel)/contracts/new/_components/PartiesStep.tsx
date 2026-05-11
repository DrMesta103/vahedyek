'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Info } from 'lucide-react';
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
  fetchProfilePayload,
  fetchProfileStore,
  type OwnershipKind,
  type ProfileStore,
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

function HelpTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex h-5 w-5 items-center justify-center align-middle text-slate-400">
      <Info className="h-4 w-4" aria-hidden />
      <span className="pointer-events-none absolute right-0 top-6 z-10 hidden w-[min(520px,calc(100vw-48px))] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right text-[12px] font-semibold leading-6 text-slate-700 shadow-xl group-hover:block">
        {text}
      </span>
    </span>
  );
}

function normalizeName(value: string | undefined | null) {
  return value?.trim().replace(/\s+/g, ' ') ?? '';
}

function buildLegalPartyOneName(companyName: string, actorName: string, title?: string) {
  const segments = [companyName, actorName].filter(Boolean);
  if (title) segments.push(`سمت: ${title}`);
  return segments.join(' - ');
}

function buildDefaultPartyOneRow(
  shareMode: ShareMode,
  profileStore: ProfileStore,
  profileMetaOwnerName: string,
  profileMetaBusinessName: string,
  auth: AuthMePayload,
): PartyRow {
  const shareValue = PARTY_TOTALS[shareMode];
  const ownershipKind: OwnershipKind = profileStore.ownershipKind === 'natural' ? 'natural' : 'legal';

  if (ownershipKind === 'natural') {
    const displayName = normalizeName(profileMetaOwnerName) || 'صاحب کسب و کار';
    return {
      id: `default-tenant-owner:natural`,
      directoryId: null,
      personType: 'natural',
      name: displayName,
      shareValue,
      isPrimary: true,
      locked: true,
      lockShare: false,
      tags: ['صاحب کسب‌وکار'],
    };
  }

  const companyName =
    normalizeName(profileStore.legal.companyName) || normalizeName(profileMetaBusinessName) || normalizeName(auth?.tenant?.name) || 'شخص حقوقی';
  const ownerName = normalizeName(profileMetaOwnerName) || 'صاحب کسب‌وکار';
  return {
    id: `default-tenant-owner:legal`,
    directoryId: null,
    personType: 'legal',
    name: buildLegalPartyOneName(companyName, ownerName),
    shareValue,
    isPrimary: true,
    locked: true,
    lockShare: false,
    tags: ['صاحب کسب‌وکار'],
  };
}

async function getAuthMe() {
  const response = await fetch('/api/auth/me', { cache: 'no-store' });
  if (!response.ok) return null;
  return (await response.json()) as AuthMePayload;
}

export function PartiesStep({ stepId, title, embedded = false }: { stepId: string; title: string; embedded?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [inlineHint, setInlineHint] = useState('');
  const [partyOneSource, setPartyOneSource] = useState<'partners' | 'shareholders'>('shareholders');

  const applyReferenceData = (referenceData: ReferenceDataResponse) => {
    setPartnerNaturals(
      referenceData.directory.partner.natural.map((item) => ({ ...item, personType: 'natural' as const, directoryId: item.id })),
    );
    setPartnerLegals(
      referenceData.directory.partner.legal.map((item) => ({ ...item, personType: 'legal' as const, directoryId: item.id })),
    );
  };

  const applyPartnerDirectoryFromProfile = (store: ProfileStore) => {
    const source = store.ownershipKind === 'natural' ? 'partners' : 'shareholders';
    setPartyOneSource(source);

    if (source === 'partners') {
      // کسب‌وکار حقیقی → طرف اول از «شرکا»
      setPartnerNaturals(
        (store.principalPartners ?? []).map((item: any) => ({
          id: String(item.id),
          directoryId: null,
          personType: 'natural' as const,
          name: String(item.fullName || item.mobile || item.email || 'شریک'),
        })),
      );
      setPartnerLegals([]);
      return;
    }

    // کسب‌وکار حقوقی → طرف اول از «سهام‌داران»
    setPartnerNaturals(
      (store.naturalShareholders ?? []).map((item: any) => ({
        id: String(item.id),
        directoryId: null,
        personType: 'natural' as const,
        name: String(item.fullName || item.mobile || item.email || 'سهامدار'),
      })),
    );
    setPartnerLegals(
      (store.legalShareholders ?? []).map((item: any) => ({
        id: String(item.id),
        directoryId: null,
        personType: 'legal' as const,
        name: String(item.companyName || item.brandName || 'سهامدار حقوقی'),
      })),
    );
  };

  const applyBuyerDirectoryFromProfile = (store: ProfileStore) => {
    setBuyerNaturals(
      (store.naturalBuyers ?? []).map((item: any) => ({
        id: String(item.id),
        directoryId: null,
        personType: 'natural' as const,
        name: String(item.fullName || item.mobile || item.email || 'خریدار'),
      })),
    );
    setBuyerLegals(
      (store.legalBuyers ?? []).map((item: any) => ({
        id: String(item.id),
        directoryId: null,
        personType: 'legal' as const,
        name: String(item.companyName || item.brandName || 'خریدار حقوقی'),
      })),
    );
  };

  const reloadReferenceData = async () => {
    setDirectoryLoading(true);
    try {
      const [referenceData, profileStore] = await Promise.all([getReferenceData(), fetchProfileStore()]);
      applyReferenceData(referenceData);
      applyPartnerDirectoryFromProfile(profileStore);
      applyBuyerDirectoryFromProfile(profileStore);
    } finally {
      setDirectoryLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const id = await ensureActiveDraftId();
        const [referenceData, partiesData, profilePayload, auth] = await Promise.all([
          getReferenceData(),
          getStepData<ContractPartiesData>(id, 'parties'),
          fetchProfilePayload(),
          getAuthMe(),
        ]);

        if (!mounted) return;

        setDraftId(id);
        applyReferenceData(referenceData);
        applyPartnerDirectoryFromProfile(profilePayload.store);
        applyBuyerDirectoryFromProfile(profilePayload.store);
        const computedDefaultPartyOneRow = buildDefaultPartyOneRow(
          'dang',
          profilePayload.store,
          profilePayload.meta?.owner?.fullName ?? '',
          profilePayload.meta?.businessName ?? '',
          auth,
        );
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
          const restoredOthers = partiesData.partyOne
            .filter((item) => String(item.personId) !== String(nextDefaultPartyOneRow.id))
            .map((item) => ({
              id: item.personId,
              directoryId: item.directoryId ?? null,
              personType: item.personType,
              name: item.name,
              shareValue: item.share.value,
              isPrimary: Boolean(item.isPrimary),
            })) as PartyRow[];
          setPartyOneRows(normalizePrimary([nextDefaultPartyOneRow, ...restoredOthers]));
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

  useEffect(() => {
    const shouldOpenBuyerDialog = searchParams.get('buyerDialog') === '1';
    const shouldOpenPartnerDialog = searchParams.get('partnerDialog') === '1';
    if (!shouldOpenBuyerDialog && !shouldOpenPartnerDialog) return;

    if (shouldOpenBuyerDialog) setPartyTwoDialogOpen(true);
    if (shouldOpenPartnerDialog) setPartyOneDialogOpen(true);

    void reloadReferenceData();
    router.replace('/contracts/new');
  }, [router, searchParams]);

  useEffect(() => {
    if (!inlineHint) return;
    const t = window.setTimeout(() => setInlineHint(''), 2800);
    return () => window.clearTimeout(t);
  }, [inlineHint]);

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

  /** برای طرف دوم: به‌صورت پیش‌فرض هیچ‌کدام «طرف اصلی» نیستند (کاربر خودش انتخاب می‌کند). */
  const addRowsWithoutPrimary = (currentRows: PartyRow[], items: DirectoryItem[]) => {
    const next = [
      ...currentRows,
      ...items
        .filter((item) => !currentRows.some((row) => row.id === item.id))
        .map((item) => ({
          ...item,
          shareValue: 0,
          isPrimary: false,
        })),
    ];
    return next;
  };

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
    // طرف اول همیشه شامل owner است (حتی اگر داده قدیمی ناقص باشد).
    partyOne: mapRowsToPayload(
      defaultPartyOneRow
        ? normalizePrimary([defaultPartyOneRow, ...partyOneRows.filter((row) => row.id !== defaultPartyOneRow.id)])
        : partyOneRows,
      shareMode,
    ),
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
    <div className="space-y-5" dir="rtl" lang="fa">
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

      {inlineHint ? (
        <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-right text-[12px] font-bold text-slate-700">
          {inlineHint}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white/70 px-5 py-4">
        <div className="mb-3 text-center text-[13px] font-extrabold text-slate-700">طرفین قرارداد</div>
        <div className="space-y-2 text-right text-[12px] font-semibold leading-6 text-slate-600">
          <div className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color-mix(in_srgb,var(--dark-teal)_75%,black)]" aria-hidden />
            <div className="min-w-0">
              <span>مشخص کنید که طرف اول و طرف دوم قرارداد چه اشخاصی می‌باشند.</span>
              <span className="mr-2 inline-block">
                <HelpTip text="اگر طرف اول سازنده و طرف دوم خریدار است، طرف اول سازنده واحد است و طرف دوم خریدار یا متقاضی واحد خواهد بود. اگر شخصی در لیست وجود ندارد اطلاعات آن‌ها را از پایین ثبت کنید." />
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color-mix(in_srgb,var(--dark-teal)_75%,black)]" aria-hidden />
            <div className="min-w-0">
              <span>نوع قدرالسهم را تعیین کنید.</span>
              <span className="mr-2 inline-block">
                <HelpTip text="سهم هر شخص می‌تواند بر اساس «دانگ» یا «درصد» باشد. در هر دو حالت مجموع سهم طرف‌ها باید کامل محاسبه شود." />
              </span>
            </div>
          </div>
        </div>
      </div>

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

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-right text-[12px] font-semibold text-slate-500">
          طرف اول به‌صورت پیش‌فرض «صاحب کسب‌وکار» است و قابل تغییر نیست.
        </div>
        <button
          type="button"
          onClick={() => {
            void reloadReferenceData();
            setPartyOneDialogOpen(true);
          }}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_90%,black)] shadow-sm transition hover:bg-[color-mix(in_srgb,var(--dark-teal)_16%,white)]"
          aria-label="افزودن طرف اول"
          title="افزودن طرف اول (سهامداران)"
        >
          <span className="text-xl leading-none">+</span>
        </button>
      </div>

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
        disableAdd
        layout="grid"
        primaryControl="switch"
        invalid={Boolean(visibleErrors.partyOne || visibleErrors.shares)}
      />

      {sectionDivider('طرف دوم')}

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-right text-[12px] font-semibold text-slate-500">
          برای افزودن خریداران (طرف دوم)، از دکمه + استفاده کنید.
        </div>
        <button
          type="button"
          onClick={() => {
            void reloadReferenceData();
            setPartyTwoDialogOpen(true);
          }}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_90%,black)] shadow-sm transition hover:bg-[color-mix(in_srgb,var(--dark-teal)_16%,white)]"
          aria-label="افزودن طرف دوم"
          title="افزودن طرف دوم"
        >
          <span className="text-xl leading-none">+</span>
        </button>
      </div>

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
        disableAdd
        layout="grid"
        primaryControl="switch"
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
        partnerSource={partyOneSource}
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
          setPartyTwoRows((current) => addRowsWithoutPrimary(current, items));
          setPartyTwoDialogOpen(false);
        }}
        loading={directoryLoading}
      />
    </div>
  );
}
