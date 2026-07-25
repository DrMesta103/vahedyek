import { getAreaPricingModeConfig, normalizeAreaPricingMode } from './contractFinancialPricing';
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
  BuyerTerminationTerms,
  FirstPartyRelatedParticipant,
  ShareMode,
} from '../types/contract';
import { validateProgressiveRows } from './progressivePenalty';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const REQUIRED_MSG = 'این فیلد الزامی است.';

function addPhysicalProgressMilestoneErrors(
  errors: Record<string, string>,
  physicalProgressDelay: BuyerTerminationTerms['physicalProgressDelay'],
) {
  for (const milestone of physicalProgressDelay.milestoneTypes) {
    const setting = physicalProgressDelay.milestoneSettings[milestone] ?? {
      timelinePreset: physicalProgressDelay.timelinePreset,
      timelineMonthsCustom: physicalProgressDelay.timelineMonthsCustom,
      timelineSpecificDate: physicalProgressDelay.timelineSpecificDate,
      gracePreset: physicalProgressDelay.gracePreset,
      graceDaysCustom: physicalProgressDelay.graceDaysCustom,
    };

    if (setting.timelinePreset === 'other' && !isPositiveIntString(setting.timelineMonthsCustom)) {
      errors[`buyerTerms.physicalProgressDelay.milestoneSettings.${milestone}.timelineMonthsCustom`] =
        'تعیین بازه زمانی این مرحله الزامی است.';
    }
    if (setting.timelinePreset === 'specific-date' && !String(setting.timelineSpecificDate ?? '').trim()) {
      errors[`buyerTerms.physicalProgressDelay.milestoneSettings.${milestone}.timelineSpecificDate`] =
        'تعیین تاریخ این مرحله الزامی است.';
    }
    if (setting.gracePreset === 'other' && !isPositiveIntString(setting.graceDaysCustom)) {
      errors[`buyerTerms.physicalProgressDelay.milestoneSettings.${milestone}.graceDaysCustom`] =
        'تعیین مهلت تنفس این مرحله الزامی است.';
    }
  }
}

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
    errors.shares = 'جمع سهم‌ها نباید از 100٪ بیشتر شود.';
  } else if (mode === 'dang' && total > 6) {
    errors.shares = 'جمع سهم‌ها نباید از 6 دانگ بیشتر شود.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateFirstPartyRelatedParticipants(
  participants: FirstPartyRelatedParticipant[] | undefined,
): ValidationResult {
  const errors: Record<string, string> = {};
  const items = participants ?? [];
  const ids = new Set<string>();
  const sources = new Set<string>();

  for (const participant of items) {
    const expectedPersonType = participant.role === 'legal_shareholder' ? 'legal' : 'natural';
    const sourceKey = `${participant.parentSourceId ?? 'legacy'}:${participant.role}:${participant.sourceId}`;

    if (!participant.id?.trim() || !participant.sourceId?.trim() || !participant.name?.trim()) {
      errors.firstPartyRelatedParticipants = 'اطلاعات یکی از افراد وابسته به طرف اول کامل نیست.';
      break;
    }

    if (participant.personType !== expectedPersonType) {
      errors.firstPartyRelatedParticipants = 'نوع شخص با نقش فرد وابسته به طرف اول سازگار نیست.';
      break;
    }

    if (ids.has(participant.id) || sources.has(sourceKey)) {
      errors.firstPartyRelatedParticipants = 'فرد وابسته تکراری برای طرف اول قابل ثبت نیست.';
      break;
    }

    ids.add(participant.id);
    sources.add(sourceKey);
  }

  if (!errors.firstPartyRelatedParticipants) {
    const byId = new Map(items.map((participant) => [participant.id, participant]));
    for (const participant of items) {
      if (!participant.parentParticipantId) continue;
      const parent = byId.get(participant.parentParticipantId);
      if (!parent || parent.id === participant.id || parent.role !== 'legal_shareholder') {
        errors.firstPartyRelatedParticipants = 'رابطه والد برای فرد وابسته به طرف اول نامعتبر است.';
        break;
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateStep2(
  data: Partial<ContractPartiesData>,
  options: { allowEmptyPartyOne?: boolean } = {},
): ValidationResult {
  const errors: Record<string, string> = {};

  if ((!data.partyOne || data.partyOne.length === 0) && !options.allowEmptyPartyOne) {
    errors.partyOne = REQUIRED_MSG;
  }

  if (!data.partyTwo || data.partyTwo.length === 0) {
    errors.partyTwo = REQUIRED_MSG;
  }

  if (data.partyOne && data.partyOne.length > 0) {
    const memberIds = new Set<string>();
    for (const member of data.partyOne) {
      if (memberIds.has(member.personId)) {
        errors.partyOne = `طرف اول «${member.name}» تکراری است.`;
        break;
      }
      memberIds.add(member.personId);

      if (member.partyOneMemberKind === 'natural_shareholder' && member.personType !== 'natural') {
        errors.partyOne = `نوع شخص طرف اول «${member.name}» با سهام‌دار حقیقی سازگار نیست.`;
        break;
      }
      if (member.partyOneMemberKind === 'legal_shareholder' && member.personType !== 'legal') {
        errors.partyOne = `نوع شخص طرف اول «${member.name}» با سهام‌دار حقوقی سازگار نیست.`;
        break;
      }
    }

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

  Object.assign(errors, validateFirstPartyRelatedParticipants(data.firstPartyRelatedParticipants).errors);

  if (!errors.firstPartyRelatedParticipants) {
    const parentById = new Map((data.partyOne ?? []).map((member) => [member.personId, member]));
    for (const participant of data.firstPartyRelatedParticipants ?? []) {
      if (participant.role !== 'representative' && participant.role !== 'board_member') continue;
      if (!participant.parentSourceId && participant.parentParticipantId) continue;
      const parent = participant.parentSourceId ? parentById.get(participant.parentSourceId) : null;
      if (!parent) {
        errors.firstPartyRelatedParticipants = `والد فرد وابسته «${participant.name}» در طرف اول وجود ندارد.`;
        break;
      }
      if (participant.role === 'board_member' && parent.partyOneMemberKind !== 'business') {
        errors.firstPartyRelatedParticipants = `عضو هیئت‌مدیره «${participant.name}» فقط می‌تواند به کارت کسب‌وکار وابسته باشد.`;
        break;
      }
      if (
        participant.role === 'representative' &&
        parent.partyOneMemberKind !== 'business' &&
        parent.partyOneMemberKind !== 'legal_shareholder'
      ) {
        errors.firstPartyRelatedParticipants = `نماینده «${participant.name}» فقط می‌تواند به کسب‌وکار یا سهام‌دار حقوقی وابسته باشد.`;
        break;
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateFinancialStep(data: Partial<ContractFinancialData>): ValidationResult {
  const errors: Record<string, string> = {};

  const pricingType = data.pricingType ?? 'fixed';
  const areaPricingMode = normalizeAreaPricingMode(data.areaPricingMode);
  const totalArea = Number(data.totalArea ?? 0);
  const parkingArea = Number(data.parkingArea ?? 0);
  const storageArea = Number(data.storageArea ?? 0);
  const pricePerMeter = Number(data.pricePerMeter ?? 0);
  const parkingPricePerMeter = Number(data.parkingPricePerMeter ?? 0);
  const storagePricePerMeter = Number(data.storagePricePerMeter ?? 0);
  const fixedTotalAmount = Number(data.fixedTotalAmount ?? 0);
  const parkingFixedAmount = Number(data.parkingFixedAmount ?? 0);
  const storageFixedAmount = Number(data.storageFixedAmount ?? 0);
  const categories = data.categories ?? [];
  const dueItems = data.dueItems ?? [];
  const areaPricingConfig = getAreaPricingModeConfig(areaPricingMode);

  if (pricingType === 'metered') {
    if (totalArea <= 0) errors.totalArea = REQUIRED_MSG;
    if (pricePerMeter <= 0) errors.pricePerMeter = REQUIRED_MSG;
    if (parkingArea > 0 && !areaPricingConfig.includeParkingInBase && parkingPricePerMeter <= 0) {
      errors.parkingPricePerMeter = REQUIRED_MSG;
    }
    if (storageArea > 0 && !areaPricingConfig.includeStorageInBase && storagePricePerMeter <= 0) {
      errors.storagePricePerMeter = REQUIRED_MSG;
    }
  } else {
    if (fixedTotalAmount <= 0) errors.fixedTotalAmount = REQUIRED_MSG;
    if (parkingArea > 0 && !areaPricingConfig.includeParkingInBase && parkingFixedAmount <= 0) {
      errors.parkingFixedAmount = REQUIRED_MSG;
    }
    if (storageArea > 0 && !areaPricingConfig.includeStorageInBase && storageFixedAmount <= 0) {
      errors.storageFixedAmount = REQUIRED_MSG;
    }
  }

  if (!categories.length) {
    errors.categories = 'حداقل یک دسته مالی باید تعریف شود.';
  }

  const validCategoryIds = new Set(categories.map((item) => item.id));
  if (dueItems.some((item) => !validCategoryIds.has(item.categoryId))) {
    errors.dueItems = 'یکی از آیتم‌های سررسید به یک دسته نامعتبر اشاره می‌کند.';
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
      errors[`type:${type.id}`] = `برای «${type.title}» حداقل یک قانون باید ثبت شود.`;
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
  const rules = (data.rules ?? []).filter((item) => item.enabled !== false);
  const activeTypes = types.filter((item) => item.active);

  for (const type of activeTypes) {
    const typeRules = rules.filter((item) => item.discountTypeId === type.id);
    if (typeRules.length === 0) {
      errors[`type:${type.id}`] = `برای «${type.title}» حداقل یک قانون باید ثبت شود.`;
    }
  }

  rules.forEach((rule, index) => {
    const minValue = Number(String(rule.minValue ?? '').replace(/,/g, ''));
    const maxValue = Number(String(rule.maxValue ?? '').replace(/,/g, ''));
    const thresholdValue = Number(String(rule.approvalThreshold ?? '').replace(/,/g, ''));

    if (!(maxValue > 0)) {
      errors[`rule:${rule.id || index}:maxValue`] = 'حداکثر مقدار باید تعیین شود.';
    }

    if (String(rule.minValue ?? '').trim() !== '' && minValue < 0) {
      errors[`rule:${rule.id || index}:minValue`] = 'حداقل مقدار نمی‌تواند منفی باشد.';
    }

    if (minValue > maxValue && maxValue > 0) {
      errors[`rule:${rule.id || index}:range`] = 'بازه مقدارها نامعتبر است.';
    }

    if (rule.managerApproval && !(thresholdValue > 0)) {
      errors[`rule:${rule.id || index}:approvalThreshold`] = 'آستانه تأیید مدیر باید تعیین شود.';
    }
  });

  return { valid: Object.keys(errors).length === 0, errors };
}

/** یک زیربخش از فسخ سازنده را قبل از تکمیل اعتبارسنجی می‌کند. */
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
        errors['constructorTerms.lateInstallment.minDebtAmount'] = 'مبلغ حداقل بدهی باید تعیین شود.';
      }
      if (li.detectionBasis === 'consecutive-installments' && !isPositiveIntString(li.consecutiveInstallmentsCount)) {
        errors['constructorTerms.lateInstallment.consecutiveInstallmentsCount'] =
          'تعداد اقساط متوالی باید تعیین شود.';
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
        errors['constructorTerms.documentDeficiencies.mandatoryItems'] = 'حداقل یک مورد الزامی باید تعریف شود.';
      }
      break;
    case 'otherBreach':
      if (!c.otherBreach.ruleEnabled) return { valid: true, errors: {} };
      if (!c.otherBreach.violationTypes.length) {
        errors['constructorTerms.otherBreach.violationTypes'] = 'حداقل یک نوع تخلف باید تعریف شود.';
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

/** اعتبارسنجی زیربخش‌های فسخ خریدار */
export function validateBuyerTerminationSubsection(
  subsection: BuyerTerminationSubsectionId,
  data: ContractTerminationData,
): ValidationResult {
  const errors: Record<string, string> = {};
  const b = data.buyerTerms;

  switch (subsection) {
    case 'lateDelivery': {
      if (!b.lateDelivery.ruleEnabled) return { valid: true, errors: {} };
      if (!b.lateDelivery.calculationBasis.length) {
        errors['buyerTerms.lateDelivery.calculationBasis'] = 'حداقل یک مبنای محاسبه باید انتخاب شود.';
      }
      if (b.lateDelivery.gracePreset === 'other' && !isPositiveIntString(b.lateDelivery.graceMonthsCustom)) {
        errors['buyerTerms.lateDelivery.graceMonthsCustom'] = REQUIRED_MSG;
      }
      break;
    }
    case 'specificationChanges': {
      if (!b.specificationChanges.ruleEnabled) return { valid: true, errors: {} };
      if (!b.specificationChanges.includedTypes.length) {
        errors['buyerTerms.specificationChanges.includedTypes'] = 'حداقل یک نوع تغییر مشخصات باید انتخاب شود.';
      }
      break;
    }
    case 'breachOfObligations': {
      if (!b.breachOfObligations.ruleEnabled && !b.physicalProgressDelay.ruleEnabled) return { valid: true, errors: {} };
      if (b.breachOfObligations.ruleEnabled && !b.breachOfObligations.obligationTypes.length) {
        errors['buyerTerms.breachOfObligations.obligationTypes'] = 'حداقل یک تعهد باید انتخاب شود.';
      }
      if (b.physicalProgressDelay.ruleEnabled) {
        if (!b.physicalProgressDelay.milestoneTypes.length) {
          errors['buyerTerms.physicalProgressDelay.milestoneTypes'] = 'حداقل یک مرحله پیشرفت فیزیکی باید انتخاب شود.';
        }
        addPhysicalProgressMilestoneErrors(errors, b.physicalProgressDelay);
      }
      break;
    }
    case 'physicalProgressDelay': {
      if (!b.physicalProgressDelay.ruleEnabled) return { valid: true, errors: {} };
      if (!b.physicalProgressDelay.milestoneTypes.length) {
        errors['buyerTerms.physicalProgressDelay.milestoneTypes'] = 'حداقل یک مرحله پیشرفت فیزیکی باید انتخاب شود.';
      }
      addPhysicalProgressMilestoneErrors(errors, b.physicalProgressDelay);
      if (!['any-milestone', 'all-milestones'].includes(b.physicalProgressDelay.triggerCondition)) {
        errors['buyerTerms.physicalProgressDelay.triggerCondition'] = 'شرط فعال‌سازی معتبر انتخاب نشده است.';
      }
      if (
        ![
          'project-supervisor-report',
          'official-expert-report',
          'constructor-reported-progress',
          'contract-manager-approval',
          'parties-agreement',
        ].includes(b.physicalProgressDelay.progressCertificationSource)
      ) {
        errors['buyerTerms.physicalProgressDelay.progressCertificationSource'] = 'منبع تأیید پیشرفت معتبر انتخاب نشده است.';
      }
      break;
    }
    case 'areaDiscrepancy': {
      if (!b.areaDiscrepancy.ruleEnabled) return { valid: true, errors: {} };
      if (b.areaDiscrepancy.thresholdPreset === 'other' && !isPositivePercentString(b.areaDiscrepancy.thresholdPercentCustom)) {
        errors['buyerTerms.areaDiscrepancy.thresholdPercentCustom'] = 'آستانه اختلاف باید تعیین شود.';
      }
      if (!b.areaDiscrepancy.referenceSources.length) {
        errors['buyerTerms.areaDiscrepancy.referenceSources'] = 'حداقل یک منبع مرجع باید انتخاب شود.';
      }
      if (
        !Array.isArray(b.areaDiscrepancy.discrepancyScopes) ||
        b.areaDiscrepancy.discrepancyScopes.length === 0 ||
        b.areaDiscrepancy.discrepancyScopes.some((item) => item !== 'deficit-only' && item !== 'surplus-only')
      ) {
        errors['buyerTerms.areaDiscrepancy.discrepancyScopes'] = 'حداقل یک دامنه اختلاف معتبر باید انتخاب شود.';
      }
      if (
        b.areaDiscrepancy.financialSettlementInsteadOfTermination &&
        !['contract-price', 'market-price', 'official-expert'].includes(b.areaDiscrepancy.settlementPricingBasis)
      ) {
        errors['buyerTerms.areaDiscrepancy.settlementPricingBasis'] = 'مبنای تسویه مالی معتبر انتخاب نشده است.';
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
      'حداقل یکی از طرفین باید در بخش فسخ فعال باشد؛ فروشنده، خریدار یا هر دو.';
    return { valid: false, errors };
  }

  return { valid: true, errors: {} };
}
