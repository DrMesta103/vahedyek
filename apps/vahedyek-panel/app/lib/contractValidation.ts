import { sumFinancialCapsCountedAgainstContractTotal } from './financialUtils';
import type {
  ContractDiscountsData,
  ContractFinancialData,
  ContractPartiesData,
  ContractParty,
  ContractPenaltiesData,
  ContractSubjectData,
  ContractTerminationData,
  ConstructorTerminationSubsectionId,
  BuyerTerminationSubsectionId,
  ShareMode,
} from '../types/contract';
import { validateProgressiveRows } from './progressivePenalty';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const REQUIRED_MSG = 'این فیلد الزامی است';

export function validateStep1(data: Partial<ContractSubjectData>): ValidationResult {
  const errors: Record<string, string> = {};

  const requiredFields: (keyof ContractSubjectData)[] = [
    'contractType',
    'contractDate',
    'contractNumber',
    'deliveryDate',
    'blockId',
    'unitId',
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      errors[field] = REQUIRED_MSG;
    }
  }

  const contractor = data.contractor;
  if (contractor?.type === 'employee') {
    if (!contractor.employeeId) {
      errors['contractor.employeeId'] = REQUIRED_MSG;
    }
  } else if (contractor?.type === 'former-employee') {
    if (!contractor.formerFirstName) {
      errors['contractor.formerFirstName'] = REQUIRED_MSG;
    }
    if (!contractor.formerLastName) {
      errors['contractor.formerLastName'] = REQUIRED_MSG;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateShares(parties: ContractParty[], mode: ShareMode): ValidationResult {
  const errors: Record<string, string> = {};
  const total = parties.reduce((sum, p) => sum + (p.share?.value ?? 0), 0);

  if (mode === 'percent' && total > 100) {
    errors.shares = 'مجموع سهم‌ها نباید از 100٪ تجاوز کند';
  } else if (mode === 'dang' && total > 6) {
    errors.shares = 'مجموع سهم‌ها نباید از 6 دانگ تجاوز کند';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateStep2(data: Partial<ContractPartiesData>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.partyOne || data.partyOne.length === 0) {
    errors.partyOne = REQUIRED_MSG;
  }

  if (!data.partyTwo || data.partyTwo.length === 0) {
    errors.partyTwo = REQUIRED_MSG;
  }

  if (data.partyOne && data.partyOne.length > 0) {
    const mode = data.partyOneMode ?? data.partyOne[0].share?.mode;
    if (mode) {
      const sharesResult = validateShares(data.partyOne, mode);
      Object.assign(errors, sharesResult.errors);
    }
  }

  if (data.partyTwo && data.partyTwo.length > 0) {
    const mode = data.partyTwoMode ?? data.partyTwo[0].share?.mode;
    if (mode) {
      const sharesResult = validateShares(data.partyTwo, mode);
      if (!sharesResult.valid) {
        errors.partyTwoShares = Object.values(sharesResult.errors)[0];
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateFinancialStep(data: Partial<ContractFinancialData>): ValidationResult {
  const errors: Record<string, string> = {};

  const pricingType = data.pricingType ?? 'fixed';
  const totalArea = Number(data.totalArea ?? 0);
  const parkingArea = Number(data.parkingArea ?? 0);
  const pricePerMeter = Number(data.pricePerMeter ?? 0);
  const parkingPricePerMeter = Number(data.parkingPricePerMeter ?? 0);
  const fixedTotalAmount = Number(data.fixedTotalAmount ?? 0);
  const categories = data.categories ?? [];
  const dueItems = data.dueItems ?? [];

  if (pricingType === 'metered') {
    if (totalArea <= 0) errors.totalArea = REQUIRED_MSG;
    if (pricePerMeter <= 0) errors.pricePerMeter = REQUIRED_MSG;
    if (parkingArea > 0 && parkingPricePerMeter <= 0) errors.parkingPricePerMeter = REQUIRED_MSG;
  } else if (fixedTotalAmount <= 0) {
    errors.fixedTotalAmount = REQUIRED_MSG;
  }

  if (!categories.length) {
    errors.categories = 'حداقل یک ردیف مالی باید ثبت شود';
  }

  const unitArea = Number(data.unitArea ?? Math.max(totalArea - parkingArea, 0));
  const totalContractAmount = pricingType === 'metered' ? unitArea * pricePerMeter + parkingArea * parkingPricePerMeter : fixedTotalAmount;
  const categoriesTotal = sumFinancialCapsCountedAgainstContractTotal(categories);
  if (totalContractAmount > 0 && categoriesTotal > totalContractAmount) {
    errors.categoriesTotal = 'جمع ردیف‌های مالی از مبلغ قرارداد بیشتر است.';
  }

  const validCategoryIds = new Set(categories.map((item) => item.id));
  if (dueItems.some((item) => !validCategoryIds.has(item.categoryId))) {
    errors.dueItems = 'بعضی از سررسیدها به دسته‌بندی معتبر متصل نیستند';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validatePenaltiesStep(data: Partial<ContractPenaltiesData>): ValidationResult {
  const errors: Record<string, string> = {};
  const types = data.types ?? [];
  const rules = data.rules ?? [];
  const activeTypes = types.filter((item) => item.active);

  for (const type of activeTypes) {
    const typeRules = rules.filter((item) => item.penaltyTypeId === type.id);
    if (typeRules.length === 0) {
      errors[`type:${type.id}`] = `برای «${type.title}» باید حداقل یک جریمه ثبت شود.`;
    }
  }

  rules.forEach((rule, index) => {
    if (rule.mode !== 'progressive') return;
    const validation = validateProgressiveRows(rule.progressiveRows ?? []);
    if (!validation.ok) {
      errors[`rule:${rule.id || index}:progressiveRows`] = validation.message;
    }
  });

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateDiscountsStep(data: Partial<ContractDiscountsData>): ValidationResult {
  const errors: Record<string, string> = {};
  const types = data.types ?? [];
  const rules = data.rules ?? [];
  const activeTypes = types.filter((item) => item.active);

  for (const type of activeTypes) {
    const typeRules = rules.filter((item) => item.discountTypeId === type.id);
    if (typeRules.length === 0) {
      errors[`type:${type.id}`] = `برای «${type.title}» باید حداقل یک تخفیف ثبت شود.`;
    }
  }

  rules.forEach((rule, index) => {
    const minValue = Number(String(rule.minValue ?? '').replace(/,/g, ''));
    const maxValue = Number(String(rule.maxValue ?? '').replace(/,/g, ''));
    const thresholdValue = Number(String(rule.approvalThreshold ?? '').replace(/,/g, ''));

    if (!(maxValue > 0)) {
      errors[`rule:${rule.id || index}:maxValue`] = 'حداکثر مقدار تخفیف را وارد کنید.';
    }

    if (String(rule.minValue ?? '').trim() !== '' && minValue < 0) {
      errors[`rule:${rule.id || index}:minValue`] = 'حداقل مقدار تخفیف معتبر نیست.';
    }

    if (minValue > maxValue && maxValue > 0) {
      errors[`rule:${rule.id || index}:range`] = 'حداقل تخفیف نمی‌تواند بیشتر از حداکثر تخفیف باشد.';
    }

    if (rule.managerApproval && !(thresholdValue > 0)) {
      errors[`rule:${rule.id || index}:approvalThreshold`] = 'آستانه تایید مدیر را وارد کنید.';
    }
  });

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Validates one constructor subsection before marking it completed (ثبت). */
export function validateTerminationSubsection(
  subsection: ConstructorTerminationSubsectionId,
  data: ContractTerminationData,
): ValidationResult {
  const errors: Record<string, string> = {};
  const isPositive = (value: string | undefined) => Number(String(value ?? '').replace(/,/g, '')) > 0;
  const c = data.constructorTerms;

  switch (subsection) {
    case 'lateInstallment': {
      const li = c.lateInstallment;
      if (!li.ruleEnabled) return { valid: true, errors: {} };
      if (li.gracePreset === 'other' && !isPositive(li.graceDaysCustom)) {
        errors['constructorTerms.lateInstallment.graceDaysCustom'] = REQUIRED_MSG;
      }
      if (li.detectionBasis === 'total-debt' && !isPositive(li.minDebtAmount)) {
        errors['constructorTerms.lateInstallment.minDebtAmount'] = 'حداقل مبلغ بدهی را وارد کنید.';
      }
      break;
    }
    case 'financialObligations': {
      const fin = c.financialObligations;
      if (!fin.ruleEnabled) return { valid: true, errors: {} };
      if (fin.gracePreset === 'other' && !isPositive(fin.graceDaysCustom)) {
        errors['constructorTerms.financialObligations.graceDaysCustom'] = REQUIRED_MSG;
      }
      break;
    }
    case 'documentDeficiencies':
      if (!c.documentDeficiencies.ruleEnabled) return { valid: true, errors: {} };
      if (!c.documentDeficiencies.mandatoryItems.length) {
        errors['constructorTerms.documentDeficiencies.mandatoryItems'] = 'حداقل یک مورد اجباری را انتخاب کنید.';
      }
      break;
    case 'otherBreach':
      if (!c.otherBreach.ruleEnabled) return { valid: true, errors: {} };
      if (!c.otherBreach.violationTypes.length) {
        errors['constructorTerms.otherBreach.violationTypes'] = 'حداقل یک نوع تخلف را انتخاب کنید.';
      }
      if (c.otherBreach.rectificationDays === 'other' && !isPositiveIntString(c.otherBreach.rectificationDaysCustom)) {
        errors['constructorTerms.otherBreach.rectificationDaysCustom'] = REQUIRED_MSG;
      }
      break;
    default:
      break;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function isPositiveIntString(value: string | undefined) {
  const n = Number(String(value ?? '').replace(/\D/g, ''));
  return Number.isFinite(n) && n > 0;
}

function isPositivePercentString(value: string | undefined) {
  const n = Number(String(value ?? '').replace(/,/g, '').trim());
  return Number.isFinite(n) && n > 0 && n <= 100;
}

/** اعتبارسنجی یک زیربخش فسخ خریدار پیش از علامت «ثبت شده». */
export function validateBuyerTerminationSubsection(
  subsection: BuyerTerminationSubsectionId,
  data: ContractTerminationData,
): ValidationResult {
  const errors: Record<string, string> = {};
  const b = data.buyerTerms;

  switch (subsection) {
    case 'lateDelivery': {
      if (!b.lateDelivery.ruleEnabled) return { valid: true, errors: {} };
      if (b.lateDelivery.gracePreset === 'other' && !isPositiveIntString(b.lateDelivery.graceDaysCustom)) {
        errors['buyerTerms.lateDelivery.graceDaysCustom'] = REQUIRED_MSG;
      }
      break;
    }
    case 'specificationChanges': {
      if (!b.specificationChanges.ruleEnabled) return { valid: true, errors: {} };
      if (!b.specificationChanges.includedTypes.length) {
        errors['buyerTerms.specificationChanges.includedTypes'] = 'حداقل یک نوع تغییر مشخصات انتخاب کنید.';
      }
      break;
    }
    case 'breachOfObligations': {
      if (!b.breachOfObligations.ruleEnabled) return { valid: true, errors: {} };
      if (!b.breachOfObligations.obligationTypes.length) {
        errors['buyerTerms.breachOfObligations.obligationTypes'] = 'حداقل یک تعهد سازنده انتخاب کنید.';
      }
      if (b.breachOfObligations.rectificationPreset === 'other' && !isPositiveIntString(b.breachOfObligations.rectificationDaysCustom)) {
        errors['buyerTerms.breachOfObligations.rectificationDaysCustom'] = REQUIRED_MSG;
      }
      break;
    }
    case 'areaDiscrepancy': {
      if (!b.areaDiscrepancy.ruleEnabled) return { valid: true, errors: {} };
      if (b.areaDiscrepancy.thresholdPreset === 'other' && !isPositivePercentString(b.areaDiscrepancy.thresholdPercentCustom)) {
        errors['buyerTerms.areaDiscrepancy.thresholdPercentCustom'] = 'درصد معتبر (۰–۱۰۰) وارد کنید.';
      }
      if (!b.areaDiscrepancy.referenceSources.length) {
        errors['buyerTerms.areaDiscrepancy.referenceSources'] = 'حداقل یک مرجع رسمی انتخاب کنید.';
      }
      break;
    }
    case 'notification':
      if (!b.notification.ruleEnabled) return { valid: true, errors: {} };
      break;
    default:
      break;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateTerminationStep(data: Partial<ContractTerminationData>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.terminationEnabled) {
    return { valid: true, errors: {} };
  }

  const seller = Boolean(data.sellerTerminationEngaged);
  const buyer = Boolean(data.buyerTerminationEngaged);

  if (!seller && !buyer) {
    errors['termination.partyEngagement'] =
      'با فعال بودن فسخ، ابتدا یکی از گزینه‌های «تنظیمات فسخ سازنده» یا «تنظیمات فسخ خریدار» را باز کنید، سپس «ثبت شرایط فسخ» را بزنید.';
    return { valid: false, errors };
  }

  return { valid: true, errors: {} };
}
