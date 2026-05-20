import type { WorkPolicy } from '../../node_modules/.prisma/client';

export type PolicyFamilyKey = 'work' | 'shift' | 'leave' | 'mission' | 'manual' | 'night';

export type PolicyVariantKey =
  | 'fixed'
  | 'floating-day'
  | 'floating-absolute'
  | 'split'
  | 'rotate'
  | 'annual'
  | 'sick'
  | 'unpaid'
  | 'bonus'
  | 'default';

export type PolicyWorkspaceSectionValues = Record<string, unknown>;

export type PolicyFamilyMeta = {
  key: PolicyFamilyKey;
  title: string;
  subtitle: string;
  pageTitle: string;
  pageHint: string;
  infoBanner: string;
  route: string;
};

export const POLICY_FAMILIES: PolicyFamilyMeta[] = [
  {
    key: 'work',
    title: 'سیاست کاری',
    subtitle: 'تنظیمات پایه و قواعد سطح سازمانی',
    pageTitle: 'ویرایش سیاست کاری',
    pageHint: 'تنظیمات پایه حضور و غیاب که برای همه بخش‌ها مبنا است.',
    infoBanner: 'در سیاست کاری فقط پارامترهای هسته‌ای و قواعد عمومی سازمان تنظیم می‌شود.',
    route: '/policies/work',
  },
  {
    key: 'shift',
    title: 'سیاست های شیفت',
    subtitle: 'شیفت ثابت، شناور و ترکیب‌های متنوع آن',
    pageTitle: 'ویرایش سیاست‌های شیفت',
    pageHint: 'تعریف بازه‌ها، استراحت‌ها و قواعد حضور در شیفت',
    infoBanner: 'در شیفت، ورودی و خروجی، استراحت‌ها و قواعد محاسبه باید دقیق تنظیم شوند. این صفحه برای الگوهای مختلف شیفت ساخته شده است.',
    route: '/policies/shift',
  },
  {
    key: 'leave',
    title: 'سیاست های مرخصی',
    subtitle: 'مرخصی استحقاقی، استعلاجی و موارد مشابه',
    pageTitle: 'ویرایش سیاست‌های مرخصی',
    pageHint: 'تعریف قانون ثبت، تایید و مصرف روزهای مرخصی',
    infoBanner: 'در سیاست‌های مرخصی فقط مصرف ماهانه و قواعد ثبت درخواست تنظیم می‌شود.',
    route: '/policies/leave',
  },
  {
    key: 'mission',
    title: 'سیاست های ماموریت',
    subtitle: 'تایید و محدودیت‌های زمانی ماموریت سازمانی',
    pageTitle: 'ویرایش سیاست‌های ماموریت',
    pageHint: 'تعریف قوانین ثبت، تایید و محدوده ماموریت',
    infoBanner: 'در ماموریت، بازه زمانی، محدوده مکانی و الزام پیوست فایل قابل تنظیم است.',
    route: '/policies/mission',
  },
  {
    key: 'manual',
    title: 'سیاست های تردد دستی',
    subtitle: 'ثبت دستی ورود و خروج و قواعد جایگزین',
    pageTitle: 'ویرایش سیاست‌های تردد دستی',
    pageHint: 'تعریف شرایط ثبت دستی و تاییدهای لازم',
    infoBanner: 'در تردد دستی فقط زمانی که ثبت خودکار ممکن نیست، رفتار ثبت و تایید مدیریت می‌شود.',
    route: '/policies/manual',
  },
  {
    key: 'night',
    title: 'سیاست های شب‌کاری',
    subtitle: 'تنظیم قوانین حضور شبانه و عبور از نیمه‌شب',
    pageTitle: 'ویرایش سیاست‌های شب‌کاری',
    pageHint: 'تعریف قوانین ورود، خروج و محاسبه برای شب‌کاری',
    infoBanner: 'در شب‌کاری فقط بازه‌های زمانی، الزام‌ها و قواعد محاسبه‌ی اضافه قابل تنظیم است.',
    route: '/policies/night',
  },
];

export const POLICY_VARIANTS: Record<PolicyFamilyKey, Array<{ key: PolicyVariantKey; title: string; subtitle: string }>> = {
  work: [{ key: 'default', title: 'سیاست کاری', subtitle: 'قواعد پایه و سطح سازمان' }],
  shift: [
    { key: 'fixed', title: 'شیفت ثابت', subtitle: 'ساعت شروع و پایان ثابت' },
    { key: 'floating-day', title: 'شناور شروع روز', subtitle: 'بازه ورود در ابتدای روز' },
    { key: 'floating-absolute', title: 'شناور مطلق', subtitle: 'بازه ورود و خروج بدون قید ثابت' },
    { key: 'split', title: 'شیفت دو تکه', subtitle: 'دو بازه کاری جداگانه' },
    { key: 'rotate', title: 'شیفت چرخشی', subtitle: 'چرخش روزانه یا هفتگی' },
  ],
  leave: [
    { key: 'annual', title: 'استحقاقی', subtitle: 'مناسب برای مرخصی سالانه' },
    { key: 'sick', title: 'استعلاجی', subtitle: 'مناسب برای گواهی پزشکی' },
    { key: 'unpaid', title: 'بدون حقوق', subtitle: 'کسر از حقوق و بیمه' },
    { key: 'bonus', title: 'تشویقی', subtitle: 'مرخصی تشویقی و پاداشی' },
  ],
  mission: [{ key: 'default', title: 'ماموریت سازمانی', subtitle: 'یک قالب پایه برای ماموریت' }],
  manual: [{ key: 'default', title: 'تردد دستی', subtitle: 'قواعد ثبت دستی و تایید' }],
  night: [{ key: 'default', title: 'شب‌کاری', subtitle: 'ورود و خروج شبانه' }],
};

export const POLICY_FAMILY_ORDER: PolicyFamilyKey[] = ['work', 'shift', 'leave', 'mission', 'manual', 'night'];

export function getPolicyFamilyMeta(key: string) {
  return POLICY_FAMILIES.find((item) => item.key === key) ?? null;
}

export function getPolicyVariantMeta(familyKey: PolicyFamilyKey, variantKey?: string | null) {
  const variants = POLICY_VARIANTS[familyKey];
  return variants.find((item) => item.key === variantKey) ?? variants[0] ?? null;
}

export function getPolicySectionValues(policy: Pick<WorkPolicy, 'sectionValues'> | null | undefined): PolicyWorkspaceSectionValues {
  const raw = policy?.sectionValues;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return raw as PolicyWorkspaceSectionValues;
}

export function getPolicyFamilyKey(policy: Pick<WorkPolicy, 'sectionValues'> | null | undefined): PolicyFamilyKey | null {
  const sectionValues = getPolicySectionValues(policy);
  const familyKey = sectionValues.familyKey;
  if (typeof familyKey === 'string' && POLICY_FAMILIES.some((item) => item.key === familyKey)) {
    return familyKey as PolicyFamilyKey;
  }
  return null;
}

export function getPolicyVariantKey(policy: Pick<WorkPolicy, 'sectionValues'> | null | undefined): PolicyVariantKey | null {
  const sectionValues = getPolicySectionValues(policy);
  const variant = sectionValues.variant;
  if (typeof variant === 'string') return variant as PolicyVariantKey;
  return null;
}

export function findPolicyByFamilyKey(policies: WorkPolicy[], familyKey: PolicyFamilyKey) {
  const direct = policies.find((policy) => getPolicyFamilyKey(policy) === familyKey);
  if (direct) return direct;
  if (familyKey === 'work') {
    return (
      policies.find((policy) => !getPolicyFamilyKey(policy)) ??
      policies[0] ??
      null
    );
  }
  return null;
}

export function listPoliciesByFamilyKey(policies: WorkPolicy[], familyKey: PolicyFamilyKey) {
  const filtered = policies.filter((policy) => getPolicyFamilyKey(policy) === familyKey);
  if (familyKey === 'work') {
    return filtered.length > 0 ? filtered : policies.filter((policy) => !getPolicyFamilyKey(policy));
  }
  return filtered;
}
