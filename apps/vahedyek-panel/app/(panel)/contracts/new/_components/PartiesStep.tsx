'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PencilLine, UserRound, UsersRound } from 'lucide-react';
import { FirstPartyMemberEditDialog } from './FirstPartyMemberEditDialog';
import { FirstPartyRelationsDialog, type FirstPartyManagedRole } from './FirstPartyRelationsDialog';
import { PartySection } from './PartySection';
import { PartySelectionDialog } from './PartySelectionDialog';
import { ShareholderSelectionDialog } from './ShareholderSelectionDialog';
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
  getPartyOneSnapshotDetails,
  getPartyOneSnapshotMissingFields,
  mapRowsToPayload,
  PARTY_TOTALS,
  roundShare,
  type DirectoryItem,
  type EntityKind,
  type FirstPartyRelatedParticipant,
  type FirstPartySnapshot,
  type PartyOneMemberKind,
  type PartyRow,
  type PersonType,
  type RelatedParticipantOption,
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
  setActiveDraftId,
  type ReferenceDataResponse,
} from '../../../../lib/contractDraftClient';
import type { ContractPartiesData, ContractParty } from '../../../../types/contract';
import { useContractDraftAutosave } from './useContractDraftAutosave';

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
      locked: false,
      lockShare: false,
      partyOneMemberKind: 'business',
      snapshot: {
        fullName: ownerName,
        mobile: normalizeName(profileMeta.owner.mobile),
        email: normalizeName(profileMeta.owner.email),
      },
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
    locked: false,
    lockShare: false,
    partyOneMemberKind: 'business',
    snapshot: {
      legalName: normalizeName(profileStore.legal.companyName),
      tradeName: brandName,
      nationalId,
      contactName: ownerName,
    },
    tags: ['کسب‌وکار'],
    details: [
      brandName ? `نام تجاری: ${brandName}` : 'نام تجاری: ثبت نشده',
      nationalId ? `شناسه ملی: ${nationalId}` : 'شناسه ملی: ثبت نشده',
      `نماینده: ${ownerName}${ownerContact ? ` (${ownerContact})` : ''}`,
    ],
  };
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

function formatPersianCount(count: number, label: string) {
  return `${new Intl.NumberFormat('fa-IR').format(count)} ${label}`;
}

function getOptionDescription(values: Array<string | undefined | null>) {
  return values.map(normalizeName).filter(Boolean).join(' / ');
}

function mapProfileRelatedParticipantOptions(profileStore: ProfileStore) {
  return {
    representatives: (profileStore.representatives ?? []).map((item) => ({
      sourceId: String(item.id),
      sourceDirectoryId: null,
      personType: 'natural' as const,
      name: normalizeName(item.fullName) || normalizeName(item.mobile) || 'نماینده',
      description: getOptionDescription([item.mobile, item.email]),
      snapshot: {
        fullName: normalizeName(item.fullName),
        nationalId: normalizeName(item.nationalId),
        mobile: normalizeName(item.mobile),
        email: normalizeName(item.email),
      },
    })),
    boardMembers: (profileStore.boardMembers ?? []).map((item) => ({
      sourceId: String(item.id),
      sourceDirectoryId: null,
      personType: 'natural' as const,
      name: normalizeName(item.fullName) || normalizeName(item.mobile) || 'عضو هیئت‌مدیره',
      description: getOptionDescription([item.mobile, item.email]),
      snapshot: {
        fullName: normalizeName(item.fullName),
        nationalId: normalizeName(item.nationalId),
        mobile: normalizeName(item.mobile),
        email: normalizeName(item.email),
      },
    })),
    naturalShareholders: (profileStore.naturalShareholders ?? []).map((item) => ({
      sourceId: String(item.id),
      sourceDirectoryId: null,
      personType: 'natural' as const,
      name: normalizeName(item.fullName) || normalizeName(item.mobile) || 'سهام‌دار حقیقی',
      description: getOptionDescription([item.mobile, item.email]),
      snapshot: {
        fullName: normalizeName(item.fullName),
        nationalId: normalizeName(item.nationalId),
        mobile: normalizeName(item.mobile),
        email: normalizeName(item.email),
      },
    })),
    legalShareholders: (profileStore.legalShareholders ?? []).map((item) => ({
      sourceId: String(item.id),
      sourceDirectoryId: null,
      personType: 'legal' as const,
      name: normalizeName(item.companyName) || normalizeName(item.brandName) || 'سهام‌دار حقوقی',
      description: getOptionDescription([item.legalType, item.brandName, item.nationalId]),
      snapshot: {
        legalName: normalizeName(item.companyName),
        tradeName: normalizeName(item.brandName),
        nationalId: normalizeName(item.nationalId),
        registrationNumber: normalizeName(item.registrationNumber),
        registrationDate: normalizeName(item.registrationDate),
        economicCode: normalizeName(item.economicCode),
      },
    })),
  } satisfies Record<string, RelatedParticipantOption[]>;
}

function getPartyOneMemberKind(
  item: ContractParty,
  businessRow: PartyRow,
  options: ReturnType<typeof mapProfileRelatedParticipantOptions>,
): PartyOneMemberKind {
  if (item.partyOneMemberKind) return item.partyOneMemberKind;
  if (item.personId === businessRow.id) return 'business';
  if (options.legalShareholders.some((option) => option.sourceId === item.personId)) return 'legal_shareholder';
  return 'natural_shareholder';
}

function hydratePartyOneRow(
  item: ContractParty,
  kind: PartyOneMemberKind,
  businessRow: PartyRow,
  options: ReturnType<typeof mapProfileRelatedParticipantOptions>,
): PartyRow {
  const profileSnapshot =
    kind === 'business'
      ? businessRow.snapshot
      : kind === 'legal_shareholder'
        ? options.legalShareholders.find((option) => option.sourceId === item.personId)?.snapshot
        : options.naturalShareholders.find((option) => option.sourceId === item.personId)?.snapshot;
  const snapshot = item.snapshot && Object.keys(item.snapshot).length ? item.snapshot : profileSnapshot ?? {};
  const common = {
    id: item.personId,
    directoryId: item.directoryId ?? null,
    personType: item.personType,
    name: item.name,
    shareValue: item.share.value,
    isPrimary: Boolean(item.isPrimary),
    locked: false,
    lockShare: false,
    partyOneMemberKind: kind,
    snapshot,
  } satisfies PartyRow;

  if (kind === 'business') {
    const row = { ...businessRow, ...common, tags: ['کسب‌وکار'] };
    return { ...row, details: getPartyOneSnapshotDetails(row) };
  }

  const row: PartyRow = {
    ...common,
    tags: [kind === 'legal_shareholder' ? 'سهام‌دار حقوقی' : 'سهام‌دار حقیقی'],
  };
  return { ...row, details: getPartyOneSnapshotDetails(row) };
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
  const [firstPartyRelatedParticipants, setFirstPartyRelatedParticipants] = useState<FirstPartyRelatedParticipant[]>([]);
  const [defaultPartyOneRow, setDefaultPartyOneRow] = useState<PartyRow | null>(null);
  const [buyerNaturals, setBuyerNaturals] = useState<DirectoryItem[]>([]);
  const [buyerLegals, setBuyerLegals] = useState<DirectoryItem[]>([]);
  const [partyTwoDialogOpen, setPartyTwoDialogOpen] = useState(false);
  const [shareholderDialogOpen, setShareholderDialogOpen] = useState(false);
  const [partyOneDialogInitialTab, setPartyOneDialogInitialTab] = useState<PartyOneMemberKind>('natural_shareholder');
  const [editingPartyOneId, setEditingPartyOneId] = useState<string | null>(null);
  const [managingRelationsParentId, setManagingRelationsParentId] = useState<string | null>(null);
  const [relationDialogInitialRole, setRelationDialogInitialRole] = useState<FirstPartyManagedRole>('representative');
  const [directoryLoading, setDirectoryLoading] = useState(false);
  const [inlineHint, setInlineHint] = useState('');
  const [businessProfile, setBusinessProfile] = useState<{ store: ProfileStore; meta: ProfileMeta; auth: AuthMePayload } | null>(null);
  const handledReturnDialogRef = useRef<string | null>(null);

  const closePartyOneShareholderDialog = () => {
    setShareholderDialogOpen(false);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('returnDialog');
    nextParams.delete('returnTab');
    nextParams.delete('returnSection');
    const query = nextParams.toString();
    router.replace(query ? `${basePath}?${query}` : basePath);
  };

  const closeManagedRelationsDialog = () => {
    setManagingRelationsParentId(null);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('returnDialog');
    nextParams.delete('returnTab');
    nextParams.delete('returnSection');
    nextParams.delete('parentSourceId');
    const query = nextParams.toString();
    router.replace(query ? `${basePath}?${query}` : basePath);
  };

  const closePartyTwoDialog = () => {
    setPartyTwoDialogOpen(false);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('returnDialog');
    nextParams.delete('returnTab');
    nextParams.delete('returnSection');
    nextParams.delete('parentSourceId');
    nextParams.delete('buyerDialog');
    const query = nextParams.toString();
    router.replace(query ? `${basePath}?${query}` : basePath);
  };

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
        const requestedDraftId = searchParams.get('draftId');
        if (requestedDraftId) setActiveDraftId(requestedDraftId);
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
        const profileOptions = mapProfileRelatedParticipantOptions(profilePayload.store);
        const savedRelatedParticipants = partiesData?.firstPartyRelatedParticipants ?? [];
        const savedRows =
          partiesData === null
            ? [nextDefaultPartyOneRow]
            : partiesData.partyOne.map((item) =>
                hydratePartyOneRow(
                  item,
                  getPartyOneMemberKind(item, nextDefaultPartyOneRow, profileOptions),
                  nextDefaultPartyOneRow,
                  profileOptions,
                ),
              );
        const legacyShareholderRows = savedRelatedParticipants
          .filter((participant) => participant.role === 'natural_shareholder' || participant.role === 'legal_shareholder')
          .filter((participant) => !savedRows.some((row) => row.id === participant.sourceId))
          .map((participant) =>
            hydratePartyOneRow(
              {
                personId: participant.sourceId,
                directoryId: participant.sourceDirectoryId ?? null,
                personType: participant.personType,
                name: participant.name,
                share: { value: 0, mode: nextShareMode },
                isPrimary: false,
              },
              participant.role === 'legal_shareholder' ? 'legal_shareholder' : 'natural_shareholder',
              nextDefaultPartyOneRow,
              profileOptions,
            ),
          );
        const nextPartyOneRows = [...savedRows, ...legacyShareholderRows];
        setPartyOneRows(nextPartyOneRows);
        const businessId = nextPartyOneRows.find((row) => row.partyOneMemberKind === 'business')?.id ?? null;
        const legacyParentSourceByParticipantId = new Map(
          savedRelatedParticipants
            .filter((participant) => participant.role === 'legal_shareholder')
            .map((participant) => [participant.id, participant.sourceId]),
        );
        setFirstPartyRelatedParticipants(
          savedRelatedParticipants
            .filter((participant) => participant.role === 'representative' || participant.role === 'board_member')
            .map((participant) => ({
              ...participant,
              parentSourceId:
                participant.parentSourceId ??
                (participant.parentParticipantId
                  ? legacyParentSourceByParticipantId.get(participant.parentParticipantId) ?? businessId
                  : businessId),
              snapshot: participant.snapshot ?? { fullName: participant.name },
            }))
            .filter((participant) => participant.parentSourceId && nextPartyOneRows.some((row) => row.id === participant.parentSourceId)),
        );

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
    if (loading || searchParams.get('returnDialog') !== 'partyOne') return;
    const returnDialogKey = [searchParams.get('returnDialog'), searchParams.get('returnTab'), searchParams.get('draftId')].join(':');
    if (handledReturnDialogRef.current === returnDialogKey) return;
    handledReturnDialogRef.current = returnDialogKey;
    let mounted = true;
    const requestedTab = searchParams.get('returnTab');
    setPartyOneDialogInitialTab(requestedTab === 'legal_shareholder' || requestedTab === 'legal-shareholder' ? 'legal_shareholder' : 'natural_shareholder');
    setShareholderDialogOpen(true);

    void Promise.all([fetchProfilePayload(), getReferenceData()])
      .then(([profilePayload, referenceData]) => {
        if (!mounted) return;
        setBusinessProfile((current) => (current ? { ...current, store: profilePayload.store, meta: profilePayload.meta } : current));
        applyReferenceData(referenceData, profilePayload.store);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [loading, searchParams]);

  useEffect(() => {
    if (loading || searchParams.get('returnDialog') !== 'relations') return;
    const parentId = searchParams.get('parentSourceId');
    if (!parentId) return;
    const requestedRole = searchParams.get('returnTab');
    setRelationDialogInitialRole(requestedRole === 'board_member' ? 'board_member' : 'representative');
    setManagingRelationsParentId(parentId);
  }, [loading, searchParams]);

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

  const addPartyOneRows = (items: RelatedParticipantOption[]) => {
    setPartyOneRows((current) => {
      const next = [...current];
      for (const item of items) {
        if (next.some((row) => row.id === item.sourceId)) continue;
        const kind: PartyOneMemberKind =
          item.sourceId === defaultPartyOneRow?.id
            ? 'business'
            : item.personType === 'legal'
              ? 'legal_shareholder'
              : 'natural_shareholder';
        next.push({
          id: item.sourceId,
          directoryId: item.sourceDirectoryId ?? null,
          personType: item.personType,
          name: item.name,
          shareValue: 0,
          isPrimary: false,
          partyOneMemberKind: kind,
          snapshot: item.snapshot ?? (kind === 'business' ? defaultPartyOneRow?.snapshot : {}),
          tags: [kind === 'business' ? 'کسب‌وکار' : kind === 'legal_shareholder' ? 'سهام‌دار حقوقی' : 'سهام‌دار حقیقی'],
          details: [],
        });
      }
      return normalizePrimary(next).map((row) => ({ ...row, details: getPartyOneSnapshotDetails(row) }));
    });
  };

  const removePartyOneRow = (id: string) => {
    setPartyOneRows((current) => removeRow(current, id));
    setFirstPartyRelatedParticipants((current) => current.filter((participant) => participant.parentSourceId !== id));
    if (managingRelationsParentId === id) setManagingRelationsParentId(null);
  };

  const relatedParticipantOptions = useMemo(
    () =>
      businessProfile
        ? mapProfileRelatedParticipantOptions(businessProfile.store)
        : { representatives: [], boardMembers: [], naturalShareholders: [], legalShareholders: [] },
    [businessProfile],
  );

  const selectedNaturalShareholderSourceIds = useMemo(
    () => new Set(partyOneRows.filter((item) => item.partyOneMemberKind === 'natural_shareholder').map((item) => item.id)),
    [partyOneRows],
  );
  const selectedLegalShareholderSourceIds = useMemo(
    () => new Set(partyOneRows.filter((item) => item.partyOneMemberKind === 'legal_shareholder').map((item) => item.id)),
    [partyOneRows],
  );
  const selectedBusinessSourceIds = useMemo(
    () => new Set(partyOneRows.filter((item) => item.partyOneMemberKind === 'business').map((item) => item.id)),
    [partyOneRows],
  );
  const businessOptions = useMemo<RelatedParticipantOption[]>(
    () =>
      defaultPartyOneRow
        ? [
            {
              sourceId: defaultPartyOneRow.id,
              sourceDirectoryId: defaultPartyOneRow.directoryId ?? null,
              personType: defaultPartyOneRow.personType,
              name: defaultPartyOneRow.name,
              description: defaultPartyOneRow.details?.join(' / '),
              snapshot: defaultPartyOneRow.snapshot,
            },
          ]
        : [],
    [defaultPartyOneRow],
  );
  const editingPartyOneRow = partyOneRows.find((row) => row.id === editingPartyOneId) ?? null;
  const managingRelationsRow = partyOneRows.find((row) => row.id === managingRelationsParentId) ?? null;
  const managedParticipants = managingRelationsRow
    ? firstPartyRelatedParticipants.filter((participant) => participant.parentSourceId === managingRelationsRow.id)
    : [];
  const relationCandidates = useMemo(() => {
    const legalShareholder =
      managingRelationsRow?.partyOneMemberKind === 'legal_shareholder'
        ? businessProfile?.store.legalShareholders.find((item) => String(item.id) === managingRelationsRow.id)
        : null;
    const shareholderRepresentatives: RelatedParticipantOption[] = (legalShareholder?.representatives ?? []).map((item) => ({
      sourceId: String(item.id),
      sourceDirectoryId: null,
      personType: 'natural',
      name: normalizeName(item.fullName) || 'نماینده',
      description: getOptionDescription([item.mobile, item.email]),
      snapshot: {
        fullName: normalizeName(item.fullName),
        nationalId: normalizeName(item.nationalId),
        mobile: normalizeName(item.mobile),
        email: normalizeName(item.email),
      },
    }));
    const representatives = [...shareholderRepresentatives, ...relatedParticipantOptions.representatives].filter(
      (item, index, items) => items.findIndex((candidate) => candidate.sourceId === item.sourceId) === index,
    );
    return {
      representative: representatives,
      board_member: relatedParticipantOptions.boardMembers,
    };
  }, [businessProfile, managingRelationsRow, relatedParticipantOptions]);

  const buildPayload = (): ContractPartiesData => ({
    partyOneMode: shareMode,
    partyTwoMode: shareMode,
    partyOne: mapRowsToPayload(partyOneRows, shareMode),
    partyTwo: mapRowsToPayload(partyTwoRows, shareMode),
    firstPartyRelatedParticipants,
  });

  const payload = useMemo<ContractPartiesData>(
    () => buildPayload(),
    [firstPartyRelatedParticipants, partyOneRows, partyTwoRows, shareMode],
  );
  const validation = validateStep2(payload, { allowEmptyPartyOne: Boolean(businessProfile) });
  useContractDraftAutosave({
    draftId,
    step: 'parties',
    payload,
    enabled: !loading && Boolean(draftId),
    onError: (error) => setFormError(error instanceof Error ? `ذخیره خودکار طرفین انجام نشد: ${error.message}` : 'ذخیره خودکار طرفین انجام نشد.'),
  });
  const visibleErrors = showValidation ? validation.errors : {};

  const savePartyOneSnapshot = (snapshot: FirstPartySnapshot) => {
    if (!editingPartyOneRow) return;
    const nextRows = partyOneRows.map((row) => {
      if (row.id !== editingPartyOneRow.id) return row;
      const name =
        row.partyOneMemberKind === 'natural_shareholder' || row.personType === 'natural'
          ? normalizeName(snapshot.fullName) || row.name
          : normalizeName(snapshot.legalName) || row.name;
      const nextRow = { ...row, name, snapshot };
      return { ...nextRow, details: getPartyOneSnapshotDetails(nextRow) };
    });
    setPartyOneRows(nextRows);
    if (nextRows.every((row) => getPartyOneSnapshotMissingFields(row).length === 0)) {
      setFormError('');
      setShowValidation(false);
    }
    setEditingPartyOneId(null);
  };

  const saveManagedParticipants = (nextScopedParticipants: FirstPartyRelatedParticipant[]) => {
    if (!managingRelationsRow) return;
    setFirstPartyRelatedParticipants((current) => [
      ...current.filter((participant) => participant.parentSourceId !== managingRelationsRow.id),
      ...nextScopedParticipants.map((participant) => ({ ...participant, parentSourceId: managingRelationsRow.id })),
    ]);
    closeManagedRelationsDialog();
  };

  const handleRegisterShareholder = async (kind: 'natural' | 'legal') => {
    if (!draftId) return;
    setSaving(true);
    setFormError('');
    try {
      await saveStepData(draftId, 'parties', payload);
      setActiveDraftId(draftId);
      const returnParams = new URLSearchParams({
        section: 'parties',
        draftId,
        returnSection: 'parties',
        returnDialog: 'partyOne',
        returnTab: kind === 'natural' ? 'natural_shareholder' : 'legal_shareholder',
      });
      const returnTo = `/contracts/new?${returnParams.toString()}`;
      router.push(
        `/business-settings/profile/shareholders/new?kind=${kind}&tab=${kind}&returnTo=${encodeURIComponent(returnTo)}`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRegisterManagedParticipant = async (role: FirstPartyManagedRole) => {
    if (!draftId || !managingRelationsRow) return;
    setSaving(true);
    setFormError('');
    try {
      await saveStepData(draftId, 'parties', payload);
      setActiveDraftId(draftId);
      const returnParams = new URLSearchParams({
        section: 'parties',
        draftId,
        returnSection: 'parties',
        returnDialog: 'relations',
        returnTab: role,
        parentSourceId: managingRelationsRow.id,
      });
      const returnTo = `/contracts/new?${returnParams.toString()}`;
      const path = role === 'board_member' ? '/business-settings/profile/board-members/new' : '/business-settings/profile/representatives/new';
      router.push(`${path}?returnTo=${encodeURIComponent(returnTo)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!draftId) return;
    if (!businessProfile) return;

    const incompletePartyOne = partyOneRows
      .map((row) => ({ row, missing: getPartyOneSnapshotMissingFields(row) }))
      .filter((item) => item.missing.length > 0);
    if (incompletePartyOne.length) {
      setShowValidation(true);
      setEditingPartyOneId(incompletePartyOne[0].row.id);
      setFormError(
        `اطلاعات طرف اول کامل نیست: ${incompletePartyOne
          .map((item) => `${item.row.name} (${item.missing.join('، ')})`)
          .join('؛ ')}.`,
      );
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
            firstPartyRelatedParticipants: 'افراد وابسته به طرف اول',
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
  }, [draftId, firstPartyRelatedParticipants, loading, partyOneRows, partyTwoRows, shareMode, stepId]);

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

      {businessProfile ? (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-right text-[12px] font-semibold text-slate-500">
            برای افزودن کسب‌وکار یا سهام‌داران به طرف اول از دکمه + استفاده کنید.
          </div>
          <button
            type="button"
            onClick={() => setShareholderDialogOpen(true)}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[color-mix(in_srgb,var(--dark-teal)_90%,black)] shadow-sm transition hover:bg-[color-mix(in_srgb,var(--dark-teal)_16%,white)]"
            aria-label="افزودن طرف اول"
            title="افزودن طرف اول"
          >
            <span className="text-xl leading-none">+</span>
          </button>
        </div>
      ) : null}

      <PartySection
        title={businessProfile?.store.ownershipKind === 'natural' ? 'طرف اول کسب‌وکار حقیقی' : 'طرف اول کسب‌وکار حقوقی'}
        description={businessProfile?.store.ownershipKind === 'natural' ? 'مالک کسب‌وکار از پروفایل پایه خوانده می‌شود و قابل تغییر نیست.' : 'کسب‌وکار و سهام‌داران انتخاب‌شده، سهم و طرف اصلی مستقل دارند.'}
        rows={partyOneRows}
        shareMode={shareMode}
        onShareChange={(id, value) => setPartyOneRows((current) => updateRowShare(current, id, value, shareMode))}
        onPrimaryChange={(id) => setPartyOneRows((current) => setPrimaryRow(current, id))}
        onRemove={removePartyOneRow}
        addButtonLabel={partyOneLabels.addButton}
        onOpenDialog={() => undefined}
        disableAdd
        layout="grid"
        primaryControl="switch"
        invalid={Boolean(visibleErrors.partyOne || visibleErrors.shares)}
        renderRowActions={(row) => {
          const missing = getPartyOneSnapshotMissingFields(row);
          const related = firstPartyRelatedParticipants.filter((participant) => participant.parentSourceId === row.id);
          const representativeCount = related.filter((participant) => participant.role === 'representative').length;
          const boardMemberCount = related.filter((participant) => participant.role === 'board_member').length;
          const canManageRelations = row.partyOneMemberKind === 'business' || row.partyOneMemberKind === 'legal_shareholder';
          const chipClassName =
            'inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--dark-teal)_32%,transparent)] bg-[color-mix(in_srgb,var(--dark-teal)_5%,white)] px-2.5 py-1 text-[11px] font-bold text-[color-mix(in_srgb,var(--dark-teal)_92%,black)]';
          const actionButtonClassName = missing.length
            ? 'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300'
            : 'inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--dark-teal)_30%,transparent)] bg-white px-3 text-xs font-bold text-[color-mix(in_srgb,var(--dark-teal)_92%,black)] transition-colors hover:bg-[color-mix(in_srgb,var(--dark-teal)_6%,white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_25%,transparent)]';
          return (
            <div className="space-y-3">
              {canManageRelations ? (
                <div className="flex flex-wrap gap-2">
                  <span className={chipClassName}>
                    <UserRound className="h-3.5 w-3.5" aria-hidden />
                    {formatPersianCount(representativeCount, 'نماینده')}
                  </span>
                  {row.partyOneMemberKind === 'business' ? (
                    <span className={chipClassName}>
                      <UsersRound className="h-3.5 w-3.5" aria-hidden />
                      {formatPersianCount(boardMemberCount, 'عضو هیئت‌مدیره')}
                    </span>
                  ) : null}
                </div>
              ) : null}
              <div className={`grid gap-2 ${canManageRelations ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                <button type="button" onClick={() => setEditingPartyOneId(row.id)} className={actionButtonClassName}>
                  <PencilLine className="h-4 w-4 shrink-0" aria-hidden />
                  {missing.length ? 'تکمیل اطلاعات' : 'ویرایش اطلاعات'}
                </button>
                {canManageRelations ? (
                  <button
                    type="button"
                    onClick={() => setManagingRelationsParentId(row.id)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--dark-teal)_30%,transparent)] bg-white px-3 text-xs font-bold text-[color-mix(in_srgb,var(--dark-teal)_92%,black)] transition-colors hover:bg-[color-mix(in_srgb,var(--dark-teal)_6%,white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--dark-teal)_25%,transparent)]"
                  >
                    <UsersRound className="h-4 w-4 shrink-0" aria-hidden />
                    {row.partyOneMemberKind === 'business' ? 'مدیریت نمایندگان و هیئت‌مدیره' : 'مدیریت نمایندگان'}
                  </button>
                ) : null}
              </div>
            </div>
          );
        }}
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

      <FirstPartyMemberEditDialog
        open={editingPartyOneRow !== null}
        row={editingPartyOneRow}
        onClose={() => setEditingPartyOneId(null)}
        onSave={savePartyOneSnapshot}
      />

      {managingRelationsRow ? (
        <FirstPartyRelationsDialog
          open
          parentSourceId={managingRelationsRow.id}
          parentName={managingRelationsRow.name}
          roles={managingRelationsRow.partyOneMemberKind === 'business' ? ['representative', 'board_member'] : ['representative']}
          initialRole={relationDialogInitialRole}
          participants={managedParticipants}
          candidates={relationCandidates}
          onRegisterNew={(role) => {
            void handleRegisterManagedParticipant(role);
          }}
          onClose={closeManagedRelationsDialog}
          onSave={saveManagedParticipants}
        />
      ) : null}

      <ShareholderSelectionDialog
        open={shareholderDialogOpen}
        onClose={closePartyOneShareholderDialog}
        naturalItems={relatedParticipantOptions.naturalShareholders}
        legalItems={relatedParticipantOptions.legalShareholders}
        businessItems={businessOptions}
        selectedNaturalSourceIds={selectedNaturalShareholderSourceIds}
        selectedLegalSourceIds={selectedLegalShareholderSourceIds}
        selectedBusinessSourceIds={selectedBusinessSourceIds}
        initialTab={partyOneDialogInitialTab}
        registrationLoading={saving}
        onRegisterNew={(kind) => {
          void handleRegisterShareholder(kind);
        }}
        onAddSelected={(items) => {
          addPartyOneRows(items);
          closePartyOneShareholderDialog();
        }}
      />

      <PartySelectionDialog
        open={partyTwoDialogOpen}
        onClose={closePartyTwoDialog}
        kind="buyer"
        rows={partyTwoRows}
        naturalItems={buyerNaturals}
        legalItems={buyerLegals}
        onCreateItem={(personType, name) => createDirectoryItem('buyer', personType, name)}
        onAddSelected={(items) => {
          setPartyTwoRows((current) => addRowsWithoutPrimary(current, items));
          closePartyTwoDialog();
        }}
        loading={directoryLoading}
      />
    </div>
  );
}


