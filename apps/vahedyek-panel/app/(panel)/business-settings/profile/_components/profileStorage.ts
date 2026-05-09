'use client';

export type OwnershipKind = 'legal' | 'natural';

export type LegalOwnershipForm = {
  legalType: string;
  companyName: string;
  brandName: string;
  registrationNumber: string;
  nationalId: string;
  taxFileNumber: string;
  registrationDate: string;
  economicCode: string;
};

export type NaturalOwnershipForm = {
  taxFileNumber: string;
  economicCode: string;
};

export type RepresentativeRecord = {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female';
  nationalId?: string;
  mobile: string;
  secondaryMobile?: string;
  email: string;
  avatarMode: 'image' | 'badge' | 'ghost';
  avatarText: string;
  avatarImage?: string;
  isPrimary: boolean;
  linkedUser: boolean;
};

export type RepresentativeCandidate = RepresentativeRecord & {
  canEmail: boolean;
};

export type ShareholderAvatarMode = RepresentativeRecord['avatarMode'];

export type NaturalShareholderRecord = {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  avatarMode: ShareholderAvatarMode;
  avatarText: string;
  avatarImage?: string;
  sharePercent: string;
  mandateEndDate?: string;
  signatureAvatarMode?: ShareholderAvatarMode;
  signatureAvatarText?: string;
  signatureAvatarImage?: string;
};

export type LegalShareholderRecord = {
  id: string;
  legalType: string;
  companyName: string;
  brandName: string;
  registrationNumber: string;
  nationalId: string;
  taxFileNumber: string;
  registrationDate: string;
  economicCode: string;
  sharePercent: string;
  avatarMode: ShareholderAvatarMode;
  avatarText: string;
  avatarImage?: string;
  representatives: RepresentativeRecord[];
};

export type NaturalCustomerRecord = NaturalShareholderRecord;
export type LegalCustomerRecord = LegalShareholderRecord;

export type NaturalBuyerRecord = NaturalShareholderRecord & {
  job?: string;
  contactNumber?: string;
  acquaintanceMethod?: string;
  address?: {
    country: string;
    province: string;
    city: string;
    mainStreet: string;
    sideStreet: string;
    alley: string;
    plaque: string;
    floor: string;
    unit: string;
    postalCode: string;
    fullAddress: string;
  };
  socialNetworks?: Array<{
    id: string;
    platform: 'whatsapp' | 'telegram' | 'instagram' | 'linkedin';
    handle: string;
    phoneNumber: string;
  }>;
};
export type LegalBuyerRecord = LegalShareholderRecord;

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

export type LanguageSettings = {
  defaultLanguage: string;
  activeLanguages: string[];
};

export type CurrencySettings = {
  baseCurrency: 'irr';
  quoteCurrency: 'irr' | 'toman';
};

export type MeasurementSettings = {
  unit: 'meter' | 'foot';
};

export type CalendarSettings = {
  system: 'jalali' | 'gregorian';
  format: 'yyyy/mm/dd' | 'dd/mm/yyyy' | 'yyyy/mm/dd-short' | 'month-title';
};

export type ContactOfficeAddress = {
  country: string;
  province: string;
  city: string;
  mainStreet: string;
  sideStreet: string;
  alley: string;
  plaque: string;
  floor: string;
  unit: string;
  postalCode: string;
  fullAddress: string;
};

export type ContactOfficeChannels = {
  mobiles: string[];
  phones: string[];
  faxes: string[];
  websites: string[];
  emails: string[];
  socialNetworks: string[];
};

export type ContactOfficeRecord = {
  id: string;
  title: string;
  kind: 'head-office' | 'branch';
  address: ContactOfficeAddress;
  channels: ContactOfficeChannels;
};

export type ProfileStore = {
  ownershipKind: OwnershipKind;
  legal: LegalOwnershipForm;
  natural: NaturalOwnershipForm;
  principalPartners: NaturalShareholderRecord[];
  naturalShareholders: NaturalShareholderRecord[];
  legalShareholders: LegalShareholderRecord[];
  naturalCustomers: NaturalCustomerRecord[];
  legalCustomers: LegalCustomerRecord[];
  naturalBuyers: NaturalBuyerRecord[];
  legalBuyers: LegalBuyerRecord[];
  representatives: RepresentativeRecord[];
  boardMembers: RepresentativeRecord[];
  directory: RepresentativeCandidate[];
  bankAccounts: BankAccountRecord[];
  branding: BrandingSettings;
  languages: LanguageSettings;
  currency: CurrencySettings;
  measurement: MeasurementSettings;
  calendar: CalendarSettings;
  contactOffices: ContactOfficeRecord[];
};

export type ProfileMeta = {
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

export const PROFILE_STORAGE_KEY = 'vahedyek.business-profile.v1';
const PROFILE_API_ENDPOINT = '/api/business-settings/profile';
const defaultProfileMeta: ProfileMeta = {
  businessName: '',
  slug: '',
  brandCode: 'VN',
  packageKey: 'starter',
  billingCycle: 'monthly',
  createdAt: null,
  owner: {
    fullName: '',
    mobile: null,
    email: null,
  },
};

export const LEGAL_TYPE_OPTIONS = [
  'شرکت سهامی خاص',
  'شرکت سهامی عام',
  'شرکت با مسئولیت محدود',
  'شرکت تضامنی',
  'شرکت تعاونی',
] as const;

const defaultStore: ProfileStore = {
  ownershipKind: 'legal',
  legal: {
    legalType: 'شرکت سهامی خاص',
    companyName: '',
    brandName: '',
    registrationNumber: '',
    nationalId: '',
    taxFileNumber: '22',
    registrationDate: '',
    economicCode: '45454',
  },
  natural: {
    taxFileNumber: '22',
    economicCode: '45454',
  },
  principalPartners: [
    {
      id: 'principal-partner-1',
      fullName: 'رضا محمدی',
      mobile: '+989121000101',
      email: 'reza.mohammadi@example.com',
      avatarMode: 'badge',
      avatarText: 'ر',
      avatarImage: '',
      sharePercent: '40',
    },
    {
      id: 'principal-partner-2',
      fullName: 'زهرا صالحی',
      mobile: '+989121000102',
      email: '',
      avatarMode: 'ghost',
      avatarText: 'ز',
      avatarImage: '',
      sharePercent: '35',
    },
  ],
  naturalShareholders: [
    {
      id: 'natural-shareholder-1',
      fullName: 'احمد زارعی',
      mobile: '+989121000001',
      email: 'ahmad.zarei@example.com',
      avatarMode: 'badge',
      avatarText: 'ا',
      avatarImage: '',
      sharePercent: '50',
    },
    {
      id: 'natural-shareholder-2',
      fullName: 'علی کریمی',
      mobile: '+989121000002',
      email: '',
      avatarMode: 'image',
      avatarText: 'ع',
      avatarImage: '',
      sharePercent: '20',
    },
    {
      id: 'natural-shareholder-3',
      fullName: 'قلندا الغا',
      mobile: '+989121000003',
      email: 'gholanda@example.com',
      avatarMode: 'ghost',
      avatarText: 'ق',
      avatarImage: '',
      sharePercent: '25',
    },
    {
      id: 'natural-shareholder-4',
      fullName: 'احمدرضا زارع',
      mobile: '+989121000004',
      email: '',
      avatarMode: 'ghost',
      avatarText: 'ا',
      avatarImage: '',
      sharePercent: '20',
    },
  ],
  legalShareholders: [
    {
      id: 'legal-shareholder-1',
      legalType: 'شرکت سهامی عام',
      companyName: '1111111',
      brandName: '',
      registrationNumber: '15151616124124684464748464646',
      nationalId: '155184845451515151515151518448',
      taxFileNumber: '',
      registrationDate: '1404/07/13',
      economicCode: '545454848484484848484844484844',
      sharePercent: '11.2',
      avatarMode: 'badge',
      avatarText: '1',
      avatarImage: '',
      representatives: [
        {
          id: 'rep-3',
          fullName: 'محمد کاظم عباسی',
          mobile: '+989334442511',
          email: 'm.kazem@example.com',
          avatarMode: 'badge',
          avatarText: '1',
          avatarImage: '',
          isPrimary: true,
          linkedUser: false,
        },
      ],
    },
    {
      id: 'legal-shareholder-2',
      legalType: 'شرکت سهامی عام',
      companyName: 'ماد',
      brandName: '',
      registrationNumber: '',
      nationalId: '',
      taxFileNumber: '',
      registrationDate: '',
      economicCode: '',
      sharePercent: '10',
      avatarMode: 'ghost',
      avatarText: 'م',
      avatarImage: '',
      representatives: [
        {
          id: 'rep-1',
          fullName: 'عباس عباسی',
          mobile: '+989121111111',
          email: 'abbas.abbasi@example.com',
          avatarMode: 'image',
          avatarText: 'ع',
          avatarImage: '',
          isPrimary: false,
          linkedUser: true,
        },
        {
          id: 'rep-2',
          fullName: 'احمدرضا زارع',
          mobile: '+989137477540',
          email: 'ahmad.zare@example.com',
          avatarMode: 'ghost',
          avatarText: 'ا',
          avatarImage: '',
          isPrimary: false,
          linkedUser: true,
        },
      ],
    },
  ],
  naturalCustomers: [
    {
      id: 'natural-customer-1',
      fullName: 'سارا محمدی',
      mobile: '+989121000201',
      email: 'sara.customer@example.com',
      avatarMode: 'badge',
      avatarText: 'س',
      avatarImage: '',
      sharePercent: '0',
    },
  ],
  legalCustomers: [
    {
      id: 'legal-customer-1',
      legalType: 'شرکت با مسئولیت محدود',
      companyName: 'شرکت مشتری نمونه',
      brandName: '',
      registrationNumber: '',
      nationalId: '',
      taxFileNumber: '',
      registrationDate: '',
      economicCode: '',
      sharePercent: '0',
      avatarMode: 'badge',
      avatarText: 'ش',
      avatarImage: '',
      representatives: [],
    },
  ],
  naturalBuyers: [],
  legalBuyers: [],
  representatives: [
    {
      id: 'rep-1',
      fullName: 'عباس عباسی',
      mobile: '+989121111111',
      email: 'abbas.abbasi@example.com',
      avatarMode: 'image',
      avatarText: 'ع',
      avatarImage: '',
      isPrimary: false,
      linkedUser: true,
    },
    {
      id: 'rep-2',
      fullName: 'احمدرضا زارع',
      mobile: '+989137477540',
      email: 'ahmad.zare@example.com',
      avatarMode: 'ghost',
      avatarText: 'ا',
      avatarImage: '',
      isPrimary: false,
      linkedUser: true,
    },
    {
      id: 'rep-3',
      fullName: 'محمد کاظم عباسی',
      mobile: '+989334442511',
      email: 'm.kazem@example.com',
      avatarMode: 'badge',
      avatarText: '1',
      avatarImage: '',
      isPrimary: true,
      linkedUser: false,
    },
  ],
  boardMembers: [
    {
      id: 'board-1',
      fullName: 'محمدرضا زارعی',
      mobile: '+989137477540',
      email: 'ahmad.zare@example.com',
      avatarMode: 'ghost',
      avatarText: 'م',
      avatarImage: '',
      isPrimary: false,
      linkedUser: true,
    },
    {
      id: 'board-2',
      fullName: 'عباس عباسی',
      mobile: '+989121111111',
      email: 'abbas.abbasi@example.com',
      avatarMode: 'image',
      avatarText: 'ع',
      avatarImage: '',
      isPrimary: false,
      linkedUser: true,
    },
  ],
  directory: [
    {
      id: 'rep-1',
      fullName: 'عباس عباسی',
      mobile: '+989121111111',
      email: 'abbas.abbasi@example.com',
      avatarMode: 'image',
      avatarText: 'ع',
      avatarImage: '',
      isPrimary: false,
      linkedUser: true,
      canEmail: true,
    },
    {
      id: 'rep-2',
      fullName: 'احمدرضا زارع',
      mobile: '+989137477540',
      email: 'ahmad.zare@example.com',
      avatarMode: 'ghost',
      avatarText: 'ا',
      avatarImage: '',
      isPrimary: false,
      linkedUser: true,
      canEmail: false,
    },
    {
      id: 'rep-3',
      fullName: 'محمد کاظم عباسی',
      mobile: '+989334442511',
      email: 'm.kazem@example.com',
      avatarMode: 'badge',
      avatarText: '1',
      avatarImage: '',
      isPrimary: true,
      linkedUser: false,
      canEmail: false,
    },
  ],
  bankAccounts: [
    {
      id: 'bank-1',
      bankName: 'ثامن',
      bankCode: 'ث',
      bankLogoMode: 'badge',
      accountNumber: '6219 8619 8943 9962',
      sheba: 'IR35056061182800578179201',
      cardNumber: '50781879201',
      showInContracts: true,
      owners: ['رضا رضایی'],
      accountType: 'current',
      usage: 'primary',
      title: 'وجه التزام',
    },
    {
      id: 'bank-2',
      bankName: 'سپه‌گارد',
      bankCode: 'س',
      bankLogoMode: 'text',
      accountNumber: '5022 2915 8286 3957',
      sheba: 'IR75019000002004875550007',
      cardNumber: '204875550007',
      showInContracts: true,
      owners: ['محمدرضا'],
      accountType: 'short',
      usage: 'project-cost',
      title: 'حساب هزینه پروژه',
    },
    {
      id: 'bank-3',
      bankName: 'ملی',
      bankCode: 'م',
      bankLogoMode: 'text',
      accountNumber: '6037 7995 6565 6565',
      sheba: 'IR34363636363636363636363636',
      cardNumber: '5555555555',
      showInContracts: false,
      owners: ['kJ'],
      accountType: 'long',
      usage: 'other',
      title: 'سایر',
    },
  ],
  branding: {
    logoImage: '',
    sealImage: '',
    headerImage: '',
    footerImage: '',
    legalStatement: '',
  },
  languages: {
    defaultLanguage: 'fa-IR',
    activeLanguages: ['fa-IR', 'en-US', 'ar-AR', 'fr-CA'],
  },
  currency: {
    baseCurrency: 'irr',
    quoteCurrency: 'toman',
  },
  measurement: {
    unit: 'meter',
  },
  calendar: {
    system: 'jalali',
    format: 'yyyy/mm/dd-short',
  },
  contactOffices: [
    {
      id: 'office-head',
      title: 'دفتر مرکزی سازمان',
      kind: 'head-office',
      address: {
        country: 'ایران',
        province: 'فارس',
        city: 'شیراز',
        mainStreet: '',
        sideStreet: '',
        alley: '',
        plaque: '',
        floor: '',
        unit: '',
        postalCode: '',
        fullAddress: '',
      },
      channels: {
        mobiles: [],
        phones: [],
        faxes: [],
        websites: [],
        emails: [],
        socialNetworks: [],
      },
    },
  ],
};

function safeParse(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value) as Partial<ProfileStore>;
  } catch {
    return null;
  }
}

export function normalizePhone(value: string) {
  return value
    .trim()
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[^\d+]/g, '');
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function buildRepresentativeFullName(firstName?: string, lastName?: string, fallback?: string) {
  const fullName = `${firstName ?? ''} ${lastName ?? ''}`.trim();
  if (fullName) return fullName;
  return (fallback ?? '').trim();
}

export function getDefaultProfileStore(): ProfileStore {
  return JSON.parse(JSON.stringify(defaultStore)) as ProfileStore;
}

function mergeProfileStore(parsed: unknown): ProfileStore {
  const base = getDefaultProfileStore();
  return {
    ownershipKind: (parsed as { ownershipKind?: string })?.ownershipKind === 'natural' ? 'natural' : 'legal',
    legal: { ...base.legal, ...(((parsed as { legal?: LegalOwnershipForm })?.legal ?? {}) as Partial<LegalOwnershipForm>) },
    natural: { ...base.natural, ...(((parsed as { natural?: NaturalOwnershipForm })?.natural ?? {}) as Partial<NaturalOwnershipForm>) },
    principalPartners: Array.isArray((parsed as { principalPartners?: unknown[] })?.principalPartners)
      ? ((parsed as { principalPartners: NaturalShareholderRecord[] }).principalPartners ?? base.principalPartners)
      : base.principalPartners,
    naturalShareholders: Array.isArray((parsed as { naturalShareholders?: unknown[] })?.naturalShareholders)
      ? ((parsed as { naturalShareholders: NaturalShareholderRecord[] }).naturalShareholders ?? base.naturalShareholders)
      : base.naturalShareholders,
    legalShareholders: Array.isArray((parsed as { legalShareholders?: unknown[] })?.legalShareholders)
      ? ((parsed as { legalShareholders: LegalShareholderRecord[] }).legalShareholders ?? base.legalShareholders)
      : base.legalShareholders,
    naturalCustomers: Array.isArray((parsed as { naturalCustomers?: unknown[] })?.naturalCustomers)
      ? ((parsed as { naturalCustomers: NaturalCustomerRecord[] }).naturalCustomers ?? base.naturalCustomers)
      : base.naturalCustomers,
    legalCustomers: Array.isArray((parsed as { legalCustomers?: unknown[] })?.legalCustomers)
      ? ((parsed as { legalCustomers: LegalCustomerRecord[] }).legalCustomers ?? base.legalCustomers)
      : base.legalCustomers,
    naturalBuyers: Array.isArray((parsed as { naturalBuyers?: unknown[] })?.naturalBuyers)
      ? ((parsed as { naturalBuyers: NaturalBuyerRecord[] }).naturalBuyers ?? base.naturalBuyers)
      : base.naturalBuyers,
    legalBuyers: Array.isArray((parsed as { legalBuyers?: unknown[] })?.legalBuyers)
      ? ((parsed as { legalBuyers: LegalBuyerRecord[] }).legalBuyers ?? base.legalBuyers)
      : base.legalBuyers,
    representatives: Array.isArray((parsed as { representatives?: unknown[] })?.representatives)
      ? ((parsed as { representatives: RepresentativeRecord[] }).representatives ?? base.representatives)
      : base.representatives,
    boardMembers: Array.isArray((parsed as { boardMembers?: unknown[] })?.boardMembers)
      ? ((parsed as { boardMembers: RepresentativeRecord[] }).boardMembers ?? base.boardMembers)
      : base.boardMembers,
    directory: Array.isArray((parsed as { directory?: unknown[] })?.directory)
      ? ((parsed as { directory: RepresentativeCandidate[] }).directory ?? base.directory)
      : base.directory,
    bankAccounts: Array.isArray((parsed as { bankAccounts?: unknown[] })?.bankAccounts)
      ? ((parsed as { bankAccounts: BankAccountRecord[] }).bankAccounts ?? base.bankAccounts)
      : base.bankAccounts,
    branding: { ...base.branding, ...(((parsed as { branding?: BrandingSettings })?.branding ?? {}) as Partial<BrandingSettings>) },
    languages: {
      defaultLanguage:
        typeof (parsed as { languages?: LanguageSettings })?.languages?.defaultLanguage === 'string'
          ? ((parsed as { languages?: LanguageSettings }).languages?.defaultLanguage ?? base.languages.defaultLanguage)
          : base.languages.defaultLanguage,
      activeLanguages: Array.isArray((parsed as { languages?: LanguageSettings })?.languages?.activeLanguages)
        ? ((parsed as { languages?: LanguageSettings }).languages?.activeLanguages ?? base.languages.activeLanguages)
        : base.languages.activeLanguages,
    },
    currency: { ...base.currency, ...(((parsed as { currency?: CurrencySettings })?.currency ?? {}) as Partial<CurrencySettings>) },
    measurement: {
      ...base.measurement,
      ...(((parsed as { measurement?: MeasurementSettings })?.measurement ?? {}) as Partial<MeasurementSettings>),
    },
    calendar: { ...base.calendar, ...(((parsed as { calendar?: CalendarSettings })?.calendar ?? {}) as Partial<CalendarSettings>) },
    contactOffices: Array.isArray((parsed as { contactOffices?: unknown[] })?.contactOffices)
      ? ((parsed as { contactOffices: ContactOfficeRecord[] }).contactOffices ?? base.contactOffices)
      : base.contactOffices,
  };
}

export function loadProfileStore(): ProfileStore {
  if (typeof window === 'undefined') {
    return getDefaultProfileStore();
  }

  const parsed = safeParse(window.localStorage.getItem(PROFILE_STORAGE_KEY));
  if (!parsed) return getDefaultProfileStore();
  return mergeProfileStore(parsed);
}

export function saveProfileStore(store: ProfileStore) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(store));
}

export async function fetchProfileStore() {
  const payload = await fetchProfilePayload();
  return payload.store;
}

export async function fetchProfilePayload() {
  try {
    const response = await fetch(PROFILE_API_ENDPOINT, {
      cache: 'no-store',
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error(`profile_fetch_failed:${response.status}`);
    }

    const payload = (await response.json()) as { store?: unknown; meta?: Partial<ProfileMeta> };
    const merged = mergeProfileStore(payload.store ?? {});
    saveProfileStore(merged);
    return {
      store: merged,
      meta: {
        businessName: typeof payload.meta?.businessName === 'string' ? payload.meta.businessName : defaultProfileMeta.businessName,
        slug: typeof payload.meta?.slug === 'string' ? payload.meta.slug : defaultProfileMeta.slug,
        brandCode: typeof payload.meta?.brandCode === 'string' ? payload.meta.brandCode : defaultProfileMeta.brandCode,
        packageKey: typeof payload.meta?.packageKey === 'string' ? payload.meta.packageKey : defaultProfileMeta.packageKey,
        billingCycle: typeof payload.meta?.billingCycle === 'string' ? payload.meta.billingCycle : defaultProfileMeta.billingCycle,
        createdAt: typeof payload.meta?.createdAt === 'string' ? payload.meta.createdAt : defaultProfileMeta.createdAt,
        owner: {
          fullName: typeof payload.meta?.owner?.fullName === 'string' ? payload.meta.owner.fullName : defaultProfileMeta.owner.fullName,
          mobile: typeof payload.meta?.owner?.mobile === 'string' ? payload.meta.owner.mobile : defaultProfileMeta.owner.mobile,
          email: typeof payload.meta?.owner?.email === 'string' ? payload.meta.owner.email : defaultProfileMeta.owner.email,
        },
      },
    };
  } catch {
    return {
      store: loadProfileStore(),
      meta: defaultProfileMeta,
    };
  }
}

export async function persistProfileStore(store: ProfileStore) {
  saveProfileStore(store);

  const response = await fetch(PROFILE_API_ENDPOINT, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ store }),
  });

  if (!response.ok) {
    throw new Error(`profile_save_failed:${response.status}`);
  }

  const payload = (await response.json()) as { store?: unknown };
  const merged = mergeProfileStore(payload.store ?? store);
  saveProfileStore(merged);
  return merged;
}

export function upsertRepresentative(store: ProfileStore, candidate: RepresentativeRecord | RepresentativeCandidate) {
  const representative: RepresentativeRecord = {
    id: candidate.id,
    fullName: candidate.fullName,
    firstName: candidate.firstName,
    lastName: candidate.lastName,
    gender: candidate.gender,
    nationalId: candidate.nationalId,
    mobile: candidate.mobile,
    secondaryMobile: candidate.secondaryMobile,
    email: candidate.email,
    avatarMode: candidate.avatarMode,
    avatarText: candidate.avatarText,
    avatarImage: candidate.avatarImage,
    isPrimary: candidate.isPrimary,
    linkedUser: candidate.linkedUser,
  };
  const exists = store.representatives.some((item) => item.id === candidate.id);

  return {
    ...store,
    representatives: exists
      ? store.representatives.map((item) => (item.id === candidate.id ? { ...item, ...representative } : item))
      : [...store.representatives, representative],
  };
}

export function upsertRepresentativeCandidate(store: ProfileStore, candidate: RepresentativeCandidate) {
  const exists = store.directory.some((item) => item.id === candidate.id);

  return {
    ...store,
    directory: exists ? store.directory.map((item) => (item.id === candidate.id ? { ...item, ...candidate } : item)) : [...store.directory, candidate],
  };
}

export function upsertLegalShareholder(store: ProfileStore, shareholder: LegalShareholderRecord) {
  const exists = store.legalShareholders.some((item) => item.id === shareholder.id);
  return {
    ...store,
    legalShareholders: exists
      ? store.legalShareholders.map((item) => (item.id === shareholder.id ? shareholder : item))
      : [shareholder, ...store.legalShareholders],
  };
}

export function upsertNaturalShareholder(store: ProfileStore, shareholder: NaturalShareholderRecord) {
  const exists = store.naturalShareholders.some((item) => item.id === shareholder.id);
  return {
    ...store,
    naturalShareholders: exists
      ? store.naturalShareholders.map((item) => (item.id === shareholder.id ? shareholder : item))
      : [shareholder, ...store.naturalShareholders],
  };
}

export function upsertLegalCustomer(store: ProfileStore, customer: LegalCustomerRecord) {
  const exists = store.legalCustomers.some((item) => item.id === customer.id);
  return {
    ...store,
    legalCustomers: exists ? store.legalCustomers.map((item) => (item.id === customer.id ? customer : item)) : [customer, ...store.legalCustomers],
  };
}

export function upsertNaturalCustomer(store: ProfileStore, customer: NaturalCustomerRecord) {
  const exists = store.naturalCustomers.some((item) => item.id === customer.id);
  return {
    ...store,
    naturalCustomers: exists
      ? store.naturalCustomers.map((item) => (item.id === customer.id ? customer : item))
      : [customer, ...store.naturalCustomers],
  };
}

export function upsertLegalBuyer(store: ProfileStore, buyer: LegalBuyerRecord) {
  const exists = store.legalBuyers.some((item) => item.id === buyer.id);
  return {
    ...store,
    legalBuyers: exists ? store.legalBuyers.map((item) => (item.id === buyer.id ? buyer : item)) : [buyer, ...store.legalBuyers],
  };
}

export function upsertNaturalBuyer(store: ProfileStore, buyer: NaturalBuyerRecord) {
  const exists = store.naturalBuyers.some((item) => item.id === buyer.id);
  return {
    ...store,
    naturalBuyers: exists
      ? store.naturalBuyers.map((item) => (item.id === buyer.id ? buyer : item))
      : [buyer, ...store.naturalBuyers],
  };
}

export function upsertPrincipalPartner(store: ProfileStore, partner: NaturalShareholderRecord) {
  const exists = store.principalPartners.some((item) => item.id === partner.id);
  return {
    ...store,
    principalPartners: exists ? store.principalPartners.map((item) => (item.id === partner.id ? partner : item)) : [partner, ...store.principalPartners],
  };
}

export function upsertBoardMember(store: ProfileStore, boardMember: RepresentativeRecord) {
  const exists = store.boardMembers.some((item) => item.id === boardMember.id);
  return {
    ...store,
    boardMembers: exists ? store.boardMembers.map((item) => (item.id === boardMember.id ? { ...item, ...boardMember } : item)) : [boardMember, ...store.boardMembers],
  };
}

export function linkRepresentativeToLegalShareholder(store: ProfileStore, shareholderId: string, representative: RepresentativeRecord) {
  return {
    ...store,
    legalShareholders: store.legalShareholders.map((shareholder) => {
      if (shareholder.id !== shareholderId) return shareholder;
      if (shareholder.representatives.some((item) => item.id === representative.id)) {
        return {
          ...shareholder,
          representatives: shareholder.representatives.map((item) => (item.id === representative.id ? { ...item, ...representative } : item)),
        };
      }
      return {
        ...shareholder,
        representatives: [...shareholder.representatives, representative],
      };
    }),
  };
}

export function linkRepresentativeToLegalCustomer(store: ProfileStore, customerId: string, representative: RepresentativeRecord) {
  return {
    ...store,
    legalCustomers: store.legalCustomers.map((customer) => {
      if (customer.id !== customerId) return customer;
      if (customer.representatives.some((item) => item.id === representative.id)) {
        return {
          ...customer,
          representatives: customer.representatives.map((item) => (item.id === representative.id ? { ...item, ...representative } : item)),
        };
      }
      return {
        ...customer,
        representatives: [...customer.representatives, representative],
      };
    }),
  };
}

export function linkRepresentativeToLegalBuyer(store: ProfileStore, buyerId: string, representative: RepresentativeRecord) {
  return {
    ...store,
    legalBuyers: store.legalBuyers.map((buyer) => {
      if (buyer.id !== buyerId) return buyer;
      if (buyer.representatives.some((item) => item.id === representative.id)) {
        return {
          ...buyer,
          representatives: buyer.representatives.map((item) => (item.id === representative.id ? { ...item, ...representative } : item)),
        };
      }
      return {
        ...buyer,
        representatives: [...buyer.representatives, representative],
      };
    }),
  };
}

export function syncRepresentativeAcrossStore(store: ProfileStore, representative: RepresentativeRecord | RepresentativeCandidate) {
  const next = upsertRepresentative(store, representative);
  return {
    ...next,
    boardMembers: next.boardMembers.map((item) => (item.id === representative.id ? { ...item, ...representative } : item)),
    legalShareholders: next.legalShareholders.map((shareholder) => ({
      ...shareholder,
      representatives: shareholder.representatives.map((item) => (item.id === representative.id ? { ...item, ...representative } : item)),
    })),
    legalCustomers: next.legalCustomers.map((customer) => ({
      ...customer,
      representatives: customer.representatives.map((item) => (item.id === representative.id ? { ...item, ...representative } : item)),
    })),
  };
}

export function addBankAccount(store: ProfileStore, account: BankAccountRecord) {
  return {
    ...store,
    bankAccounts: [account, ...store.bankAccounts],
  };
}

export function updateBankAccount(store: ProfileStore, accountId: string, account: BankAccountRecord) {
  return {
    ...store,
    bankAccounts: store.bankAccounts.map((item) => (item.id === accountId ? account : item)),
  };
}

export function removeBankAccount(store: ProfileStore, accountId: string) {
  return {
    ...store,
    bankAccounts: store.bankAccounts.filter((item) => item.id !== accountId),
  };
}

export function formatCurrencyBySettings(amount: number, settings?: CurrencySettings) {
  const currency = settings?.quoteCurrency ?? 'toman';
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  return `${formatted} ${currency === 'toman' ? 'تومان' : 'ریال'}`;
}

export function formatDateBySettings(input: string, settings?: CalendarSettings) {
  const format = settings?.format ?? 'yyyy/mm/dd-short';
  if (!input) return '';

  // This is used for preview in settings UI (client). We always render
  // numbers in Persian locale; calendar system toggles between Jalali/Gregorian.
  if (format === 'month-title') {
    const systemLocale = settings?.system === 'gregorian' ? 'fa-IR' : 'fa-IR-u-ca-persian';
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return input;
    return new Intl.DateTimeFormat(systemLocale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  const systemLocale = settings?.system === 'gregorian' ? 'fa-IR' : 'fa-IR-u-ca-persian';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;

  const parts = new Intl.DateTimeFormat(systemLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value ?? '';
  const month = parts.find((p) => p.type === 'month')?.value ?? '';
  const day = parts.find((p) => p.type === 'day')?.value ?? '';

  if (format === 'dd/mm/yyyy') return `${day}/${month}/${year}`;
  if (format === 'yyyy/mm/dd') return `${year}/${month}/${day}`;
  return `${month}/${day}/${year}`;
}
