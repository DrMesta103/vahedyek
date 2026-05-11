import type { ContractPartiesData, PersonType, ShareMode } from '../../../../types/contract';

export type { PersonType, ShareMode };

export type DirectoryItem = {
  id: string;
  name: string;
  personType: PersonType;
  directoryId?: string | null;
};

export type PartyRow = DirectoryItem & {
  shareValue: number;
  isPrimary: boolean;
  /** برچسب‌های نمایشی (مثلاً صاحب کسب‌وکار) */
  tags?: string[];
  /** اگر true باشد، ردیف قابل حذف/تغییر نیست. */
  locked?: boolean;
  /** اگر true باشد، مقدار سهم قابل تغییر نیست. */
  lockShare?: boolean;
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
    share: {
      value: row.shareValue,
      mode,
    },
  }));
}
