import { isPositiveDecimal, sanitizeDecimalInput, validateProgressiveRows } from './progressivePenalty';
import type { ContractRuleState } from './businessContractRules';

export type BuilderPenaltySectionId = 'unit-delivery-delay' | 'material-specs-change' | 'area-difference';
export type BuilderPenaltyMode = 'fixed' | 'percent' | 'progressive';

export const BUILDER_PENALTY_PERIOD_OPTIONS = [
  { value: 'روزانه', label: 'روزانه' },
  { value: 'ماهانه', label: 'ماهانه' },
  { value: 'سالانه', label: 'سالانه' },
] as const;

export const BUILDER_PENALTY_MODE_OPTIONS: Array<{ value: BuilderPenaltyMode; label: string }> = [
  { value: 'fixed', label: 'مبلغ ثابت' },
  { value: 'percent', label: 'درصدی' },
  { value: 'progressive', label: 'تصاعدی' },
];

export const BUILDER_PENALTY_PERCENT_BASIS_OPTIONS = [
  'مبلغ کل قرارداد',
  'مانده تعهد مالی',
  'ارزش روز واحد',
  'مبلغ تعیین‌شده توسط کارشناس',
  'سفارشی',
] as const;

type BuilderPenaltySectionConfig = {
  title: string;
  description: string;
  stateKey: 'unitDeliveryDelayEnabled' | 'materialSpecsChangeEnabled' | 'areaDifferenceEnabled';
  modeKey: string;
  periodKey: string;
  fixedAmountKey: string;
  percentAmountKey: string;
  capKey: string;
  progressiveRows: Array<{ fromKey: string; toKey: string; rateKey: string }>;
  graceDaysKey?: string;
  unlimitedCapKey?: string;
  percentBasisKey?: string;
  marketValueAmountKey?: string;
  marketValueReferenceKey?: string;
  expertAmountKey?: string;
  expertReferenceKey?: string;
  customBasisTitleKey?: string;
  customBasisAmountKey?: string;
  customBasisReferenceKey?: string;
};

export const BUILDER_PENALTY_SECTION_META: Record<BuilderPenaltySectionId, BuilderPenaltySectionConfig> = {
  'unit-delivery-delay': {
    title: 'تاخیر در تحویل واحد',
    description: 'مشخص می‌کند جریمه تاخیر در تحویل واحد برای سازنده در چه شرایطی و با چه فرمولی اعمال شود.',
    stateKey: 'unitDeliveryDelayEnabled',
    modeKey: 'unitDeliveryDelayMode',
    periodKey: 'unitDeliveryDelayPeriod',
    fixedAmountKey: 'unitDeliveryDelayFixedAmount',
    percentAmountKey: 'unitDeliveryDelayPercentAmount',
    capKey: 'unitDeliveryDelayPenaltyCap',
    graceDaysKey: 'unitDeliveryDelayGraceDays',
    unlimitedCapKey: 'unitDeliveryDelayPenaltyCapUnlimited',
    percentBasisKey: 'unitDeliveryDelayPercentBasis',
    marketValueAmountKey: 'unitDeliveryDelayMarketValueAmount',
    marketValueReferenceKey: 'unitDeliveryDelayMarketValueReference',
    expertAmountKey: 'unitDeliveryDelayExpertAmount',
    expertReferenceKey: 'unitDeliveryDelayExpertReference',
    customBasisTitleKey: 'unitDeliveryDelayCustomBasisTitle',
    customBasisAmountKey: 'unitDeliveryDelayCustomBasisAmount',
    customBasisReferenceKey: 'unitDeliveryDelayCustomBasisReference',
    progressiveRows: [
      { fromKey: 'unitDeliveryDelayProgressiveRow1From', toKey: 'unitDeliveryDelayProgressiveRow1To', rateKey: 'unitDeliveryDelayProgressiveRow1Rate' },
      { fromKey: 'unitDeliveryDelayProgressiveRow2From', toKey: 'unitDeliveryDelayProgressiveRow2To', rateKey: 'unitDeliveryDelayProgressiveRow2Rate' },
      { fromKey: 'unitDeliveryDelayProgressiveRow3From', toKey: 'unitDeliveryDelayProgressiveRow3To', rateKey: 'unitDeliveryDelayProgressiveRow3Rate' },
    ],
  },
  'material-specs-change': {
    title: 'تغییر مصالح / مشخصات',
    description: 'مشخص می‌کند جریمه تغییر مصالح یا مشخصات واحد برای سازنده در چه شرایطی قابل استفاده باشد.',
    stateKey: 'materialSpecsChangeEnabled',
    modeKey: 'materialSpecsChangeMode',
    periodKey: 'materialSpecsChangePeriod',
    fixedAmountKey: 'materialSpecsChangeFixedAmount',
    percentAmountKey: 'materialSpecsChangePercentAmount',
    capKey: 'materialSpecsChangePenaltyCap',
    progressiveRows: [
      { fromKey: 'materialSpecsChangeProgressiveRow1From', toKey: 'materialSpecsChangeProgressiveRow1To', rateKey: 'materialSpecsChangeProgressiveRow1Rate' },
      { fromKey: 'materialSpecsChangeProgressiveRow2From', toKey: 'materialSpecsChangeProgressiveRow2To', rateKey: 'materialSpecsChangeProgressiveRow2Rate' },
      { fromKey: 'materialSpecsChangeProgressiveRow3From', toKey: 'materialSpecsChangeProgressiveRow3To', rateKey: 'materialSpecsChangeProgressiveRow3Rate' },
    ],
  },
  'area-difference': {
    title: 'اختلاف متراژ',
    description: 'مشخص می‌کند جریمه اختلاف متراژ برای سازنده در چه شرایطی قابل استفاده باشد.',
    stateKey: 'areaDifferenceEnabled',
    modeKey: 'areaDifferenceMode',
    periodKey: 'areaDifferencePeriod',
    fixedAmountKey: 'areaDifferenceFixedAmount',
    percentAmountKey: 'areaDifferencePercentAmount',
    capKey: 'areaDifferencePenaltyCap',
    progressiveRows: [
      { fromKey: 'areaDifferenceProgressiveRow1From', toKey: 'areaDifferenceProgressiveRow1To', rateKey: 'areaDifferenceProgressiveRow1Rate' },
      { fromKey: 'areaDifferenceProgressiveRow2From', toKey: 'areaDifferenceProgressiveRow2To', rateKey: 'areaDifferenceProgressiveRow2Rate' },
      { fromKey: 'areaDifferenceProgressiveRow3From', toKey: 'areaDifferenceProgressiveRow3To', rateKey: 'areaDifferenceProgressiveRow3Rate' },
    ],
  },
};

function parsePositiveNumber(value: string | boolean | undefined) {
  if (typeof value !== 'string') return 0;
  const normalized = Number(sanitizeDecimalInput(value));
  return Number.isFinite(normalized) && normalized > 0 ? normalized : 0;
}

function hasNonEmptyText(value: string | boolean | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function normalizeBuilderPenaltyRuleState(state: ContractRuleState): ContractRuleState {
  const nextValues = { ...state.values };
  const unitConfig = BUILDER_PENALTY_SECTION_META['unit-delivery-delay'];
  const unlimited = unitConfig.unlimitedCapKey ? Boolean(nextValues[unitConfig.unlimitedCapKey]) : false;

  if (unlimited && unitConfig.capKey) {
    nextValues[unitConfig.capKey] = '';
  }

  return {
    ...state,
    values: nextValues,
  };
}

export function validateBuilderPenaltyRuleState(state: ContractRuleState) {
  for (const sectionId of Object.keys(BUILDER_PENALTY_SECTION_META) as BuilderPenaltySectionId[]) {
    const config = BUILDER_PENALTY_SECTION_META[sectionId];
    if (!state.values[config.stateKey]) continue;

    const mode = String(state.values[config.modeKey] || 'fixed') as BuilderPenaltyMode;
    const capUnlimited = config.unlimitedCapKey ? Boolean(state.values[config.unlimitedCapKey]) : false;

    if (mode === 'fixed') {
      const fixedAmount = parsePositiveNumber(state.values[config.fixedAmountKey]);
      if (fixedAmount <= 0) {
        return { ok: false as const, message: `برای «${config.title}» مبلغ جریمه ثابت باید بزرگ‌تر از صفر باشد.` };
      }

      if (!capUnlimited) {
        const cap = parsePositiveNumber(state.values[config.capKey]);
        if (cap <= 0) {
          return { ok: false as const, message: `برای «${config.title}» سقف جریمه باید بزرگ‌تر از صفر باشد یا گزینه «بدون سقف» فعال شود.` };
        }
        if (cap < fixedAmount) {
          return { ok: false as const, message: `برای «${config.title}» سقف جریمه نمی‌تواند کمتر از مبلغ پایه جریمه باشد.` };
        }
      }
    }

    if (mode === 'percent') {
      const percentAmount = parsePositiveNumber(state.values[config.percentAmountKey]);
      if (percentAmount <= 0) {
        return { ok: false as const, message: `برای «${config.title}» درصد جریمه باید بزرگ‌تر از صفر باشد.` };
      }

      const selectedBasis = config.percentBasisKey ? String(state.values[config.percentBasisKey] ?? '').trim() : '';

      if (config.percentBasisKey && !selectedBasis) {
        return { ok: false as const, message: `برای «${config.title}» مبنای محاسبه درصد را مشخص کنید.` };
      }

      if (selectedBasis === 'ارزش روز واحد') {
        if (parsePositiveNumber(state.values[config.marketValueAmountKey ?? '']) <= 0) {
          return { ok: false as const, message: `برای «${config.title}» مبلغ ارزش روز واحد را وارد کنید.` };
        }
        if (!hasNonEmptyText(state.values[config.marketValueReferenceKey ?? ''])) {
          return { ok: false as const, message: `برای «${config.title}» مرجع یا توضیح ارزش روز واحد را ثبت کنید.` };
        }
      }

      if (selectedBasis === 'مبلغ تعیین‌شده توسط کارشناس') {
        if (parsePositiveNumber(state.values[config.expertAmountKey ?? '']) <= 0) {
          return { ok: false as const, message: `برای «${config.title}» مبلغ تعیین‌شده توسط کارشناس را وارد کنید.` };
        }
        if (!hasNonEmptyText(state.values[config.expertReferenceKey ?? ''])) {
          return { ok: false as const, message: `برای «${config.title}» نام کارشناس، شماره گزارش یا توضیح مبنا را ثبت کنید.` };
        }
      }

      if (selectedBasis === 'سفارشی') {
        if (!hasNonEmptyText(state.values[config.customBasisTitleKey ?? ''])) {
          return { ok: false as const, message: `برای «${config.title}» عنوان مبنای سفارشی را مشخص کنید.` };
        }
        if (parsePositiveNumber(state.values[config.customBasisAmountKey ?? '']) <= 0) {
          return { ok: false as const, message: `برای «${config.title}» مبلغ مبنای سفارشی را وارد کنید.` };
        }
      }
    }

    if (mode === 'progressive') {
      const validation = validateProgressiveRows(
        config.progressiveRows.map((row, index) => ({
          id: `${sectionId}-${index + 1}`,
          fromDay: String(state.values[row.fromKey] ?? ''),
          toDay: String(state.values[row.toKey] ?? ''),
          rate: String(state.values[row.rateKey] ?? ''),
          openEnded: Boolean(state.values[row.toKey.replace(/To$/, 'OpenEnded')]),
        })),
      );
      if (!validation.ok) {
        return { ok: false as const, message: `برای «${config.title}» ${validation.message}` };
      }

      const invalidAmount = validation.rows.some((row) => !isPositiveDecimal(row.rate));
      if (invalidAmount) {
        return { ok: false as const, message: `برای «${config.title}» مبلغ هر پله باید بزرگ‌تر از صفر باشد.` };
      }
    }
  }

  return { ok: true as const };
}
