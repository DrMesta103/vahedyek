import type {
  ContractPartiesData,
  FirstPartyRelatedParticipant,
  FirstPartyRelatedParticipantRole,
  FirstPartySnapshot,
  PersonType,
  PartyOneMemberKind,
  ShareMode,
} from '../../../../types/contract';

export type { FirstPartyRelatedParticipant, FirstPartyRelatedParticipantRole, FirstPartySnapshot, PartyOneMemberKind, PersonType, ShareMode };

export type DirectoryItem = {
  id: string;
  name: string;
  personType: PersonType;
  directoryId?: string | null;
};

export type PartyRow = DirectoryItem & {
  shareValue: number;
  isPrimary: boolean;
  tags?: string[];
  details?: string[];
  locked?: boolean;
  lockShare?: boolean;
  partyOneMemberKind?: PartyOneMemberKind | null;
  snapshot?: FirstPartySnapshot | null;
};

export type RelatedParticipantOption = {
  sourceId: string;
  sourceDirectoryId?: string | null;
  personType: PersonType;
  name: string;
  description?: string;
  snapshot?: FirstPartySnapshot | null;
};

export type EntityKind = 'partner' | 'buyer';
export type PartyKey = 'party-one' | 'party-two';

export const PARTY_TOTALS: Record<ShareMode, number> = {
  dang: 6,
  percent: 100,
};

export function roundShare(value: number) {
  return Math.round(value * 100) / 100;
}

export function clampShare(value: number, mode: ShareMode) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(PARTY_TOTALS[mode], value));
}

export function convertShare(value: number, from: ShareMode, to: ShareMode) {
  if (from === to) return roundShare(value);
  if (from === 'dang' && to === 'percent') return roundShare((value / 6) * 100);
  return roundShare((value / 100) * 6);
}

export function getTypeLabel(personType: PersonType) {
  return personType === 'natural' ? 'حقیقی' : 'حقوقی';
}

function hasSnapshotValue(value: string | undefined) {
  return Boolean(value?.trim());
}

export function getPartyOneSnapshotMissingFields(row: Pick<PartyRow, 'partyOneMemberKind' | 'personType' | 'snapshot'>) {
  const snapshot = row.snapshot ?? {};
  const missing: string[] = [];

  if (row.partyOneMemberKind === 'natural_shareholder') {
    if (!hasSnapshotValue(snapshot.fullName)) missing.push('نام و نام خانوادگی');
    return missing;
  }

  if (row.partyOneMemberKind === 'legal_shareholder') {
    if (!hasSnapshotValue(snapshot.legalName)) missing.push('نام قانونی شرکت');
    if (!hasSnapshotValue(snapshot.nationalId)) missing.push('شناسه ملی');
    if (!hasSnapshotValue(snapshot.registrationNumber)) missing.push('شماره ثبت شرکت');
    if (!hasSnapshotValue(snapshot.registrationDate)) missing.push('تاریخ ثبت شرکت');
    if (!hasSnapshotValue(snapshot.economicCode)) missing.push('کد اقتصادی');
    return missing;
  }

  if (row.personType === 'natural') {
    if (!hasSnapshotValue(snapshot.fullName)) missing.push('نام و نام خانوادگی مالک');
    if (!hasSnapshotValue(snapshot.mobile) && !hasSnapshotValue(snapshot.email)) missing.push('راه ارتباطی مالک');
    return missing;
  }

  if (!hasSnapshotValue(snapshot.legalName)) missing.push('نام کسب‌وکار');
  if (!hasSnapshotValue(snapshot.tradeName)) missing.push('نام تجاری');
  if (!hasSnapshotValue(snapshot.nationalId)) missing.push('شناسه ملی');
  if (!hasSnapshotValue(snapshot.contactName)) missing.push('نماینده کسب‌وکار');
  return missing;
}

export function getPartyOneSnapshotDetails(row: Pick<PartyRow, 'partyOneMemberKind' | 'personType' | 'snapshot'>) {
  const snapshot = row.snapshot ?? {};
  if (row.partyOneMemberKind === 'natural_shareholder') {
    return [snapshot.mobile ? `موبایل: ${snapshot.mobile}` : '', snapshot.email ? `ایمیل: ${snapshot.email}` : ''].filter(Boolean);
  }
  if (row.partyOneMemberKind === 'legal_shareholder') {
    return [
      snapshot.tradeName ? `نام تجاری: ${snapshot.tradeName}` : '',
      snapshot.nationalId ? `شناسه ملی: ${snapshot.nationalId}` : 'شناسه ملی: ثبت نشده',
    ].filter(Boolean);
  }
  if (row.personType === 'natural') {
    const contact = [snapshot.mobile, snapshot.email].filter(Boolean).join(' / ');
    return contact ? [`راه ارتباطی: ${contact}`] : [];
  }
  return [
    snapshot.tradeName ? `نام تجاری: ${snapshot.tradeName}` : 'نام تجاری: ثبت نشده',
    snapshot.nationalId ? `شناسه ملی: ${snapshot.nationalId}` : 'شناسه ملی: ثبت نشده',
    snapshot.contactName ? `نماینده: ${snapshot.contactName}` : 'نماینده: ثبت نشده',
  ];
}

export function getEntityLabels(kind: EntityKind) {
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

export function mapRowsToPayload(rows: PartyRow[], mode: ShareMode): ContractPartiesData['partyOne'] {
  return rows.map((row) => ({
    personId: row.id,
    directoryId: row.directoryId ?? null,
    personType: row.personType,
    name: row.name,
    isPrimary: row.isPrimary,
    partyOneMemberKind: row.partyOneMemberKind ?? null,
    snapshot: row.snapshot ?? null,
    share: {
      value: row.shareValue,
      mode,
    },
  }));
}
