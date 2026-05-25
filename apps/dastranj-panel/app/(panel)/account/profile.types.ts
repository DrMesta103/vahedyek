export type OwnershipKind = 'legal' | 'natural';

export type OwnershipProfile = {
  ownershipKind: OwnershipKind;
  legalType: string;
  companyName: string;
  brandName: string;
  legalName: string;
  registrationNumber: string;
  nationalId: string;
  taxFileNumber: string;
  registrationDate: string;
  economicCode: string;
};

export type BankAccountType = 'current' | 'short' | 'long' | 'loan' | 'foreign';

export type BankAccountUsage =
  | 'primary'
  | 'contract'
  | 'penalty'
  | 'late-fee'
  | 'installment'
  | 'shareholders'
  | 'project-cost'
  | 'other';

export type BankAccountRecord = {
  id: string;
  bankName: string;
  bankCode: string;
  bankLogoMode: 'text' | 'badge';
  accountNumber: string;
  sheba: string;
  cardNumber: string;
  showInContracts: boolean;
  owners: string[];
  accountType: BankAccountType;
  usage: BankAccountUsage;
  title: string;
};

export type BrandingSettings = {
  logoImage: string;
  sealImage: string;
  headerImage: string;
  footerImage: string;
  legalStatement: string;
};

export type ProfileStore = {
  ownership: OwnershipProfile;
  bankAccounts: BankAccountRecord[];
  branding: BrandingSettings;
};

export type ProfileMeta = {
  tenantId?: string;
  businessName: string;
  slug: string;
  brandCode: string;
  packageKey: string;
  billingCycle: string;
  createdAt: string | null;
  owner: {
    fullName: string;
    mobile: string | null;
    email: string | null;
  };
};

export const PROFILE_STORAGE_KEY = 'dastranj.business-profile.v1';

export const DEFAULT_PROFILE_META: ProfileMeta = {
  businessName: '',
  slug: '',
  brandCode: 'DS',
  packageKey: 'starter',
  billingCycle: 'monthly',
  createdAt: null,
  owner: {
    fullName: '',
    mobile: null,
    email: null,
  },
};

export function createDefaultProfileStore(): ProfileStore {
  return {
    ownership: {
      ownershipKind: 'legal',
      legalType: 'شرکت سهامی خاص',
      companyName: '',
      brandName: 'دسترنج',
      legalName: '',
      registrationNumber: '',
      nationalId: '',
      taxFileNumber: '',
      registrationDate: '',
      economicCode: '',
    },
    bankAccounts: [],
    branding: {
      logoImage: '',
      sealImage: '',
      headerImage: '',
      footerImage: '',
      legalStatement: '',
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeOwnership(value: unknown): OwnershipProfile {
  const base = createDefaultProfileStore().ownership;
  if (!isRecord(value)) return base;

  return {
    ownershipKind: value.ownershipKind === 'natural' ? 'natural' : 'legal',
    legalType: typeof value.legalType === 'string' ? value.legalType : base.legalType,
    companyName: typeof value.companyName === 'string' ? value.companyName : base.companyName,
    brandName: typeof value.brandName === 'string' ? value.brandName : base.brandName,
    legalName: typeof value.legalName === 'string' ? value.legalName : base.legalName,
    registrationNumber: typeof value.registrationNumber === 'string' ? value.registrationNumber : base.registrationNumber,
    nationalId: typeof value.nationalId === 'string' ? value.nationalId : base.nationalId,
    taxFileNumber: typeof value.taxFileNumber === 'string' ? value.taxFileNumber : base.taxFileNumber,
    registrationDate: typeof value.registrationDate === 'string' ? value.registrationDate : base.registrationDate,
    economicCode: typeof value.economicCode === 'string' ? value.economicCode : base.economicCode,
  };
}

function normalizeBankAccounts(value: unknown): BankAccountRecord[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isRecord)
    .map((item) => ({
      id: typeof item.id === 'string' && item.id ? item.id : globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
      bankName: typeof item.bankName === 'string' ? item.bankName : '',
      bankCode: typeof item.bankCode === 'string' ? item.bankCode : '',
      bankLogoMode: item.bankLogoMode === 'badge' ? 'badge' : 'text',
      accountNumber: typeof item.accountNumber === 'string' ? item.accountNumber : '',
      sheba: typeof item.sheba === 'string' ? item.sheba : '',
      cardNumber: typeof item.cardNumber === 'string' ? item.cardNumber : '',
      showInContracts: typeof item.showInContracts === 'boolean' ? item.showInContracts : true,
      owners: Array.isArray(item.owners) ? item.owners.filter((owner): owner is string => typeof owner === 'string') : [],
      accountType:
        item.accountType === 'short' || item.accountType === 'long' || item.accountType === 'loan' || item.accountType === 'foreign'
          ? item.accountType
          : 'current',
      usage:
        item.usage === 'contract' ||
        item.usage === 'penalty' ||
        item.usage === 'late-fee' ||
        item.usage === 'installment' ||
        item.usage === 'project-cost' ||
        item.usage === 'other'
          ? item.usage
          : 'primary',
      title: typeof item.title === 'string' ? item.title : '',
    }));
}

function normalizeBranding(value: unknown): BrandingSettings {
  const base = createDefaultProfileStore().branding;
  if (!isRecord(value)) return base;
  return {
    logoImage: typeof value.logoImage === 'string' ? value.logoImage : base.logoImage,
    sealImage: typeof value.sealImage === 'string' ? value.sealImage : base.sealImage,
    headerImage: typeof value.headerImage === 'string' ? value.headerImage : base.headerImage,
    footerImage: typeof value.footerImage === 'string' ? value.footerImage : base.footerImage,
    legalStatement: typeof value.legalStatement === 'string' ? value.legalStatement : base.legalStatement,
  };
}

export function normalizeProfileStore(parsed: unknown): ProfileStore {
  const base = createDefaultProfileStore();
  if (!isRecord(parsed)) return base;

  return {
    ownership: normalizeOwnership(parsed.ownership),
    bankAccounts: normalizeBankAccounts(parsed.bankAccounts),
    branding: normalizeBranding(parsed.branding),
  };
}
