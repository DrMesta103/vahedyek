import type { ContractRuleState } from '../businessContractRules';
import {
  buildBusinessSettingsComparison,
  formatBusinessSettingValue,
  type BusinessSettingsComparison,
  type BusinessSettingsLine,
} from '../contractSettingsReference';

type TerminationTermsLike = Partial<Record<string, { ruleEnabled?: boolean }>> | null | undefined;

type TerminationLike = {
  terminationEnabled?: boolean;
  sellerTerminationEngaged?: boolean;
  buyerTerminationEngaged?: boolean;
  terminationPartyTab?: string;
  constructorTerms?: TerminationTermsLike;
  buyerTerms?: TerminationTermsLike;
} | null | undefined;

function asTerminationLike(value: unknown): TerminationLike {
  if (!value || typeof value !== 'object') return null;
  return value as TerminationLike;
}

const SELLER_LABELS: Record<string, string> = {
  lateInstallment: 'تأخیر اقساط',
  financialObligations: 'تعهدات مالی',
  documentDeficiencies: 'نقص مدارک',
  otherBreach: 'سایر تخلفات',
  notifications: 'اعلان‌ها',
};

const BUYER_LABELS: Record<string, string> = {
  lateDelivery: 'تأخیر تحویل',
  specificationChanges: 'تغییر مشخصات',
  breachOfObligations: 'نقض تعهدات',
  physicalProgressDelay: 'تأخیر پیشرفت فیزیکی',
  areaDiscrepancy: 'اختلاف مساحت',
  notification: 'اعلان',
  draftTemplateUsage: 'استفاده از قالب',
};

function enabledCount(terms: TerminationTermsLike) {
  if (!terms) return 0;
  return Object.values(terms).filter((term) => term?.ruleEnabled).length;
}

function termLines(
  terms: TerminationTermsLike,
  labels: Record<string, string>,
  prefix: string,
): BusinessSettingsLine[] {
  if (!terms) return [];
  return Object.entries(labels).map(([key, label]) => ({
    label: `${prefix}: ${label}`,
    value: formatBusinessSettingValue(String(Boolean(terms[key]?.ruleEnabled))),
  }));
}

export function resolveTerminationHint(
  referenceInput: unknown,
  currentInput: unknown,
  cancellationRules?: {
    builder?: ContractRuleState | null;
    buyer?: ContractRuleState | null;
  },
): BusinessSettingsComparison {
  const reference = asTerminationLike(referenceInput);
  const current = asTerminationLike(currentInput);
  if (!reference) {
    return buildBusinessSettingsComparison({
      status: 'missing',
      helperText: 'برای فسخ تنظیم مرجعی در تنظیمات کسب‌وکار ثبت نشده است.',
    });
  }

  const refSeller = Boolean(reference.sellerTerminationEngaged);
  const refBuyer = Boolean(reference.buyerTerminationEngaged);
  const curSeller = Boolean(current?.sellerTerminationEngaged);
  const curBuyer = Boolean(current?.buyerTerminationEngaged);
  const refEnabled = Boolean(reference.terminationEnabled);
  const curEnabled = Boolean(current?.terminationEnabled);

  const referenceLines: BusinessSettingsLine[] = [
    { label: 'وضعیت فسخ در تنظیمات', value: refEnabled ? 'فعال' : 'غیرفعال' },
    { label: 'فسخ سازنده در تنظیمات', value: refSeller ? 'فعال' : 'غیرفعال' },
    { label: 'فسخ خریدار در تنظیمات', value: refBuyer ? 'فعال' : 'غیرفعال' },
  ];

  if (cancellationRules?.builder) {
    referenceLines.push({
      label: 'تنظیمات فسخ سازنده (rule)',
      value: formatBusinessSettingValue(String(cancellationRules.builder.active)),
    });
  }
  if (cancellationRules?.buyer) {
    referenceLines.push({
      label: 'تنظیمات فسخ خریدار (rule)',
      value: formatBusinessSettingValue(String(cancellationRules.buyer.active)),
    });
  }

  const currentLines: BusinessSettingsLine[] = [
    { label: 'وضعیت فعلی فسخ', value: curEnabled ? 'فعال' : 'غیرفعال' },
    { label: 'فسخ سازنده در پیش‌نویس', value: curSeller ? 'فعال' : 'غیرفعال' },
    { label: 'فسخ خریدار در پیش‌نویس', value: curBuyer ? 'فعال' : 'غیرفعال' },
    {
      label: 'تب فعلی پیش‌نویس',
      value: current?.terminationPartyTab === 'seller' ? 'سازنده' : 'خریدار',
    },
  ];

  const breakdownLines: BusinessSettingsLine[] = [
    ...termLines(reference.constructorTerms, SELLER_LABELS, 'سازنده (تنظیمات)'),
    ...termLines(current?.constructorTerms, SELLER_LABELS, 'سازنده (پیش‌نویس)').filter(
      (line) => line.value === 'فعال' || enabledCount(current?.constructorTerms) > 0,
    ),
    ...termLines(reference.buyerTerms, BUYER_LABELS, 'خریدار (تنظیمات)'),
    ...termLines(current?.buyerTerms, BUYER_LABELS, 'خریدار (پیش‌نویس)').filter(
      (line) => line.value === 'فعال' || enabledCount(current?.buyerTerms) > 0,
    ),
  ].slice(0, 16);

  const same =
    refEnabled === curEnabled &&
    refSeller === curSeller &&
    refBuyer === curBuyer;

  return buildBusinessSettingsComparison({
    reference: refEnabled,
    current: curEnabled,
    status: same ? 'equal' : 'different',
    referenceLines,
    currentLines,
    breakdownLines,
    differenceText: same ? null : 'وضعیت فعال‌سازی فسخ یا طرفین با تنظیمات کسب‌وکار مغایرت دارد.',
    helperText: 'این مرجع از تنظیمات فسخ کسب‌وکار خوانده شده و تغییر دستی پیش‌نویس را بازنویسی نمی‌کند.',
  });
}
