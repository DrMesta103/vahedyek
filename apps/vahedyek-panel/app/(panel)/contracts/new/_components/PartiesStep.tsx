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
  type OwnershipKind,
  type ProfileMeta,
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
      <span className="pointer-events-none absolute right-0 top-6 z-10 hidden w-[min(520px,calc(100vw-48px))] rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-right text-[12px] font-semibold leading-6 text-slate-700 shadow-xl group-hover:block">
        {text}
      </span>
    </span>
  );
}

function normalizeName(value: string | undefined | null) {
  return value?.trim().replace(/\s+/g, ' ') ?? '';
}

function buildDefaultPartyOneRow(
  shareMode: ShareMode,
  profileStore: ProfileStore,
  profileMeta: ProfileMeta,
  auth: AuthMePayload,
): PartyRow {
  const shareValue = PARTY_TOTALS[shareMode];
  const ownershipKind: OwnershipKind = profileStore.ownershipKind === 'natural' ? 'natural' : 'legal';
  const ownerName = normalizeName(profileMeta.owner.fullName) || normalizeName(auth?.user.fullName) || 'مالک کسب‌وکار';
  const ownerContact = [normalizeName(profileMeta.owner.mobile), normalizeName(profileMeta.owner.email)].filter(Boolean).join(' / ');

  if (ownershipKind === 'natural') {
    return {
      id: 'default-business-owner:natural',
      directoryId: null,
      personType: 'natural',
      name: ownerName,
      shareValue,
      isPrimary: true,
      locked: true,
      lockShare: true,
      tags: ['مالک کسب‌وکار'],
      details: ownerContact ? [`راه ارتباطی: ${ownerContact}`] : [],
    };
  }

  const companyName =
    normalizeName(profileStore.legal.companyName) || normalizeName(profileMeta.businessName) || normalizeName(auth?.tenant?.name) || 'کسب‌وکار حقوقی';
  const brandName = normalizeName(profileStore.legal.brandName);
  const nationalId = normalizeName(profileStore.legal.nationalId);

  return {
    id: 'default-business-owner:legal',
    directoryId: null,
    personType: 'legal',
    name: companyName,
    shareValue,
    isPrimary: true,
    locked: true,
    lockShare: true,
    tags: ['کسب‌وکار حقوقی'],
    details: [
      brandName ? `نام تجاری: ${brandName}` : 'نام تجاری: ثبت نشده',
      nationalId ? `شناسه ملی: ${nationalId}` : 'شناسه ملی: ثبت نشده',
      `نماینده: ${ownerName}${ownerContact ? ` (${ownerContact})` : ''}`,
    ],
  };
}

function getBusinessPartyOneMissingFields(profileStore: ProfileStore, profileMeta: ProfileMeta, auth: AuthMePayload) {
  const missingFields: string[] = [];
  const ownerName = normalizeName(profileMeta.owner.fullName) || normalizeName(auth?.user.fullName);

  if (profileStore.ownershipKind === 'natural') {
    if (!ownerName) missingFields.push('نام و نام خانوادگی مالک');
    if (!normalizeName(profileMeta.owner.mobile) && !normalizeName(profileMeta.owner.email)) {
      missingFields.push('راه ارتباطی مالک');
    }
    return missingFields;
  }

  if (!normalizeName(profileStore.legal.companyName)) missingFields.push('نام کسب‌وکار');
  if (!normalizeName(profileStore.legal.brandName)) missingFields.push('نام تجاری');
  if (!normalizeName(profileStore.legal.nationalId)) missingFields.push('شناسه ملی');
  if (!ownerName) missingFields.push('نماینده کسب‌وکار');
  return missingFields;
}

function mapProfileBuyersToDirectoryItems(profileStore: ProfileStore) {
  return {
    buyerNaturals: (profileStore.naturalBuyers ?? []).map((item) => ({
      id: String(item.id),
      directoryId: null,
      personType: 'natural' as const,
      name: String(item.fullName || item.mobile || item.email || 'خریدار'),
    })),
    buyerLegals: (profileStore.legalBuyers ?? []).map((item) => ({
      id: String(item.id),
      directoryId: null,
      personType: 'legal' as const,
      name: String(item.companyName || item.brandName || 'خریدار حقوقی'),
    })),
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
  const [buyerNaturals, setBuyerNaturals] = useState<DirectoryItem[]>([]);
  const [buyerLegals, setBuyerLegals] = useState<DirectoryItem[]>([]);
  const [partyTwoDialogOpen, setPartyTwoDialogOpen] = useState(false);
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [inlineHint, setInlineHint] = useState('');
  const [businessProfile, setBusinessProfile] = useState<{ store: ProfileStore; meta: ProfileMeta; auth: AuthMePayload } | null>(null);

  const applyReferenceData = (referenceData: ReferenceDataResponse, profileStore?: ProfileStore | null) => {
    const profileBuyers = profileStore ? mapProfileBuyersToDirectoryItems(profileStore) : { buyerNaturals: [], buyerLegals: [] };

    setBuyerNaturals([
      ...referenceData.directory.buyer.natural.map((item) => ({ ...item, personType: 'natural' as const, directoryId: item.id })),
      ...profileBuyers.buyerNaturals,
    ]);
    setBuyerLegals([
      ...referenceData.directory.buyer.legal.map((item) => ({ ...item, personType: 'legal' as const, directoryId: item.id })),
      ...profileBuyers.buyerLegals,
    ]);
  };

  const reloadReferenceData = async () => {
    setDirectoryLoading(true);
    try {
      const [referenceData, profilePayload] = await Promise.all([getReferenceData(), fetchProfilePayload()]);
      applyReferenceData(referenceData, profilePayload.store);
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

        const resolvedAuth = auth ?? null;
        const businessContext = {
          store: profilePayload.store,
          meta: profilePayload.meta,
          auth: resolvedAuth,
        };
        setDraftId(id);
        setBusinessProfile(businessContext);
        applyReferenceData(referenceData, profilePayload.store);

        const computedDefaultPartyOneRow = buildDefaultPartyOneRow('dang', profilePayload.store, profilePayload.meta, resolvedAuth);
        setDefaultPartyOneRow(computedDefaultPartyOneRow);

        const nextShareMode = partiesData?.partyOneMode ?? partiesData?.partyTwoMode ?? 'dang';
        setShareMode(nextShareMode);
        const nextDefaultPartyOneRow =
          nextShareMode === 'dang'
            ? computedDefaultPartyOneRow
            : {
                ...computedDefaultPartyOneRow,
                shareValue: PARTY_TOTALS[nextShareMode],
              };
        setDefaultPartyOneRow(nextDefaultPartyOneRow);
        setPartyOneRows([nextDefaultPartyOneRow]);

        if (partiesData) {
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

  useEffect(() => {
    const shouldOpenBuyerDialog = searchParams.get('buyerDialog') === '1';
    if (!shouldOpenBuyerDialog) return;

    setPartyTwoDialogOpen(true);
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

    if (personType === 'natural') setBuyerNaturals((current) => [...current, item]);
    else setBuyerLegals((current) => [...current, item]);

    return item;
  };

  const buildPayload = (): ContractPartiesData => ({
    partyOneMode: shareMode,
    partyTwoMode: shareMode,
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
    if (!businessProfile) return;

    const partyOneMissingFields = getBusinessPartyOneMissingFields(businessProfile.store, businessProfile.meta, businessProfile.auth);
    if (partyOneMissingFields.length) {
      setShowValidation(true);
      setFormError(`اطلاعات طرف اول کسب‌وکار کامل نیست: ${partyOneMissingFields.join('، ')}.`);
      return;
    }

    if (!validation.valid) {
      setShowValidation(true);
      setFormError(
        buildValidationSummary(
          validation.errors,
          {
            partyOne: 'طرف اول',
            partyTwo: 'طرف دوم',
            shares: 'سهم طرف اول',
            partyTwoShares: 'سهم طرف دوم',
          },
          'اطلاعات طرفین کامل نیست.',
        ),
      );
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
      {formError ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}

      {!embedded ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            <p className="mt-1 text-gray-500">طرف اول و طرف دوم را در یک صفحه مدیریت کنید و برای هر کدام سهم مستقل ثبت کنید.</p>
          </div>
          <button
            type="button"
            onClick={() => router.push(basePath)}
            className="rounded-[8px] border border-gray-300 px-3.5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            بازگشت به مراحل
          </button>
        </div>
      ) : null}

      {inlineHint ? (
        <div className="rounded-[8px] border border-slate-200 bg-white/80 px-4 py-3 text-right text-[12px] font-bold text-slate-700">{inlineHint}</div>
      ) : null}

      <div className="rounded-[8px] border border-slate-200 bg-white/70 px-5 py-4">
        <div className="mb-3 text-center text-[13px] font-extrabold text-slate-700">طرفین قرارداد</div>
        <div className="space-y-2 text-right text-[12px] font-semibold leading-6 text-slate-600">
          <div className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color-mix(in_srgb,var(--dark-teal)_75%,black)]" aria-hidden />
            <div className="min-w-0">
              <span>طرف اول از پروفایل کسب‌وکار و مالک آن خوانده می‌شود.</span>
              <span className="mr-2 inline-block">
                <HelpTip text="برای کسب‌وکار حقیقی، طرف اول مالک کسب‌وکار است و نام و راه ارتباطی او باید در پروفایل ثبت شده باشد. برای کسب‌وکار حقوقی، نام کسب‌وکار، نام تجاری، شناسه ملی و نماینده (مالک) از پروفایل کسب‌وکار خوانده می‌شود." />
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color-mix(in_srgb,var(--dark-teal)_75%,black)]" aria-hidden />
            <div className="min-w-0">
              <span>طرف اول قفل شده است و از لیست سهامداران/شرکا قابل انتخاب نیست.</span>
              <span className="mr-2 inline-block">
                <HelpTip text="در این مرحله فقط طرف دوم قابل اضافه و ویرایش است. طرف اول همیشه از اطلاعات پایه‌ی پروفایل کسب‌وکار پر می‌شود." />
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

      <div className="text-right text-[12px] font-semibold text-slate-500">
        {businessProfile?.store.ownershipKind === 'natural'
          ? 'کسب‌وکار حقیقی: طرف اول مالک کسب‌وکار است و نام و راه ارتباطی او از پروفایل پایه خوانده می‌شود.'
          : 'کسب‌وکار حقوقی: طرف اول نام کسب‌وکار، نام تجاری، شناسه ملی و نماینده (مالک) را از پروفایل پایه می‌گیرد.'}
      </div>

      <PartySection
        title={businessProfile?.store.ownershipKind === 'natural' ? 'طرف اول کسب‌وکار حقیقی' : 'طرف اول کسب‌وکار حقوقی'}
        description={businessProfile?.store.ownershipKind === 'natural' ? 'مالک کسب‌وکار از پروفایل پایه خوانده می‌شود و قابل تغییر نیست.' : 'مشخصات شرکت و نماینده از پروفایل پایه خوانده می‌شود و قابل تغییر نیست.'}
        rows={partyOneRows}
        shareMode={shareMode}
        onShareChange={(id, value) => setPartyOneRows((current) => updateRowShare(current, id, value, shareMode))}
        onPrimaryChange={(id) => setPartyOneRows((current) => setPrimaryRow(current, id))}
        onRemove={(id) => setPartyOneRows((current) => removeRow(current, id, defaultPartyOneRow))}
        addButtonLabel={partyOneLabels.addButton}
        onOpenDialog={() => undefined}
        disableAdd
        layout="grid"
        primaryControl="switch"
        invalid={Boolean(visibleErrors.partyOne || visibleErrors.shares)}
      />

      {sectionDivider('طرف دوم')}

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-right text-[12px] font-semibold text-slate-500">برای افزودن خریداران (طرف دوم) از دکمه + استفاده کنید.</div>
        <button
          type="button"
          onClick={() => {
            void reloadReferenceData();
            setPartyTwoDialogOpen(true);
          }}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_90%,black)] shadow-sm transition hover:bg-[color-mix(in_srgb,var(--dark-teal)_16%,white)]"
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


