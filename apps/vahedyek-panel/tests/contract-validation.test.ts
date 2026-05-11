import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDiscountsStep, validateFinancialStep, validatePenaltiesStep, validateTerminationStep } from '../app/lib/contractValidation';
import type { ContractDiscountsData, ContractFinancialData, ContractPenaltiesData, ContractTerminationData } from '../app/types/contract';

function makeValidFinancialData(overrides: Partial<ContractFinancialData> = {}): ContractFinancialData {
  return {
    pricingType: 'fixed',
    unitArea: '0',
    parkingArea: '0',
    totalArea: '0',
    pricePerMeter: '0',
    parkingPricePerMeter: '0',
    fixedTotalAmount: '10000000',
    activeTab: 'advance',
    categories: [
      {
        id: 'advance',
        name: 'پیش پرداخت',
        capAmount: 4000000,
        dueAmount: 4000000,
        noDueAmount: 0,
        system: true,
        requiresDue: true,
      },
      {
        id: 'installment',
        name: 'اقساط',
        capAmount: 6000000,
        dueAmount: 6000000,
        noDueAmount: 0,
        system: true,
        requiresDue: true,
      },
    ],
    dueItems: [
      {
        id: 'due-1',
        categoryId: 'advance',
        title: 'پیش پرداخت اول',
        amount: 4000000,
        dueDate: '1405/01/01',
      },
    ],
    ...overrides,
  };
}

test('validateFinancialStep accepts a valid fixed-price payload', () => {
  const result = validateFinancialStep(makeValidFinancialData());

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('validateFinancialStep rejects fixed pricing without total amount', () => {
  const result = validateFinancialStep(makeValidFinancialData({ fixedTotalAmount: '0' }));

  assert.equal(result.valid, false);
  assert.equal(result.errors.fixedTotalAmount, 'این فیلد الزامی است');
});

test('validateFinancialStep rejects metered pricing without area or price-per-meter', () => {
  const result = validateFinancialStep(
    makeValidFinancialData({
      pricingType: 'metered',
      unitArea: '0',
      parkingArea: '0',
      totalArea: '0',
      pricePerMeter: '0',
      parkingPricePerMeter: '0',
      fixedTotalAmount: '0',
    }),
  );

  assert.equal(result.valid, false);
  assert.equal(result.errors.totalArea, 'این فیلد الزامی است');
  assert.equal(result.errors.pricePerMeter, 'این فیلد الزامی است');
});

test('validateFinancialStep rejects metered pricing with parking area but without parking price', () => {
  const result = validateFinancialStep(
    makeValidFinancialData({
      pricingType: 'metered',
      unitArea: '100',
      parkingArea: '12',
      totalArea: '112',
      pricePerMeter: '1000000',
      parkingPricePerMeter: '0',
      fixedTotalAmount: '0',
    }),
  );

  assert.equal(result.valid, false);
  assert.ok(result.errors.parkingPricePerMeter);
});

test('validateFinancialStep rejects category totals above contract amount', () => {
  const result = validateFinancialStep(
    makeValidFinancialData({
      fixedTotalAmount: '5000000',
    }),
  );

  assert.equal(result.valid, false);
  assert.equal(result.errors.categoriesTotal, 'جمع ردیف‌های مالی از مبلغ قرارداد بیشتر است.');
});

test('validateFinancialStep ignores fin-line supplementary rows vs contract amount', () => {
  const lin = 'fin-line-test';
  const result = validateFinancialStep(
    makeValidFinancialData({
      fixedTotalAmount: '10000000',
      categories: [
        {
          id: 'advance',
          name: 'پیش پرداخت',
          capAmount: 4000000,
          dueAmount: 4000000,
          noDueAmount: 0,
          system: true,
          requiresDue: true,
        },
        {
          id: 'installment',
          name: 'اقساط',
          capAmount: 6000000,
          dueAmount: 6000000,
          noDueAmount: 0,
          system: true,
          requiresDue: true,
        },
        {
          id: lin,
          name: 'خط پرداخت اضافه',
          capAmount: 5000000,
          dueAmount: 0,
          noDueAmount: 5000000,
          system: false,
          requiresDue: false,
        },
        {
          id: `${lin}:advance`,
          name: 'پیش پرداخت',
          capAmount: 5000000,
          dueAmount: 0,
          noDueAmount: 0,
          system: true,
          requiresDue: false,
        },
      ],
    }),
  );

  assert.equal(result.valid, true);
  assert.equal(result.errors.categoriesTotal, undefined);
});

test('validateFinancialStep ignores legacy custom-* root row vs contract amount', () => {
  const result = validateFinancialStep(
    makeValidFinancialData({
      fixedTotalAmount: '10000000',
      categories: [
        {
          id: 'advance',
          name: 'پیش پرداخت',
          capAmount: 4000000,
          dueAmount: 4000000,
          noDueAmount: 0,
          system: true,
          requiresDue: true,
        },
        {
          id: 'installment',
          name: 'اقساط',
          capAmount: 6000000,
          dueAmount: 6000000,
          noDueAmount: 0,
          system: true,
          requiresDue: true,
        },
        {
          id: 'custom-xyz',
          name: 'هزینه جانبی',
          capAmount: 8000000,
          dueAmount: 0,
          noDueAmount: 8000000,
          system: false,
          requiresDue: false,
        },
      ],
    }),
  );

  assert.equal(result.valid, true);
  assert.equal(result.errors.categoriesTotal, undefined);
});

test('validateFinancialStep rejects due items linked to invalid categories', () => {
  const result = validateFinancialStep(
    makeValidFinancialData({
      dueItems: [
        {
          id: 'due-invalid',
          categoryId: 'missing-category',
          title: 'قسط نامعتبر',
          amount: 1000000,
          dueDate: '1405/02/01',
        },
      ],
    }),
  );

  assert.equal(result.valid, false);
  assert.equal(result.errors.dueItems, 'بعضی از سررسیدها به دسته‌بندی معتبر متصل نیستند');
});

test('validateFinancialStep rejects when categories are completely missing', () => {
  const result = validateFinancialStep(
    makeValidFinancialData({
      categories: [],
      dueItems: [],
      activeTab: '',
    }),
  );

  assert.equal(result.valid, false);
  assert.equal(result.errors.categories, 'حداقل یک ردیف مالی باید ثبت شود');
});

function makeValidPenaltiesData(overrides: Partial<ContractPenaltiesData> = {}): ContractPenaltiesData {
  return {
    activeTab: 'installment-delay',
    types: [
      {
        id: 'installment-delay',
        title: 'جریمه تاخیر در پرداخت اقساط',
        description: 'desc',
        active: true,
      },
      {
        id: 'document-delay',
        title: 'جریمه تاخیر در تحویل سند',
        description: 'desc',
        active: false,
      },
    ],
    rules: [
      {
        id: 'rule-1',
        penaltyTypeId: 'installment-delay',
        mode: 'fixed',
        period: 'monthly',
        fixedAmount: '100000',
        penaltyPercent: '',
        bankInterestPercent: '',
        graceDays: '2',
        roundRule: '100',
        extraFeeEnabled: false,
        extraFeeType: 'percent',
        extraFeeAmount: '',
        extraFeeRoundRule: '100',
        progressiveRows: [],
      },
    ],
    ...overrides,
  };
}

test('validatePenaltiesStep accepts active penalty types with at least one rule', () => {
  const result = validatePenaltiesStep(makeValidPenaltiesData());

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('validatePenaltiesStep rejects active penalty types without any saved rule', () => {
  const result = validatePenaltiesStep(
    makeValidPenaltiesData({
      rules: [],
    }),
  );

  assert.equal(result.valid, false);
  assert.equal(result.errors['type:installment-delay'], 'برای «جریمه تاخیر در پرداخت اقساط» باید حداقل یک جریمه ثبت شود.');
});

function makeValidDiscountsData(overrides: Partial<ContractDiscountsData> = {}): ContractDiscountsData {
  return {
    activeTab: 'contract-base',
    types: [
      {
        id: 'contract-base',
        title: 'تخفیف روی اصل قرارداد',
        description: 'desc',
        active: true,
      },
      {
        id: 'early-payment',
        title: 'تخفیف مشوق پرداخت زودتر از موعد',
        description: 'desc',
        active: false,
      },
    ],
    rules: [
      {
        id: 'discount-rule-1',
        discountTypeId: 'contract-base',
        scope: 'whole',
        entryId: 'all-dues',
        valueMode: 'amount',
        minValue: '100000',
        maxValue: '250000',
        conditionNote: 'پرداخت زودتر از موعد',
        managerApproval: false,
        approvalThreshold: '',
      },
    ],
    ...overrides,
  };
}

test('validateDiscountsStep accepts active discount types with at least one rule', () => {
  const result = validateDiscountsStep(makeValidDiscountsData());

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('validateDiscountsStep rejects active discount types without any saved rule', () => {
  const result = validateDiscountsStep(
    makeValidDiscountsData({
      rules: [],
    }),
  );

  assert.equal(result.valid, false);
  assert.equal(result.errors['type:contract-base'], 'برای «تخفیف روی اصل قرارداد» باید حداقل یک تخفیف ثبت شود.');
});

test('validateDiscountsStep rejects invalid discount ranges and empty approval threshold', () => {
  const result = validateDiscountsStep(
    makeValidDiscountsData({
      rules: [
        {
          id: 'discount-rule-1',
          discountTypeId: 'contract-base',
          scope: 'itemized',
          entryId: 'installments',
          valueMode: 'percent',
          minValue: '20',
          maxValue: '10',
          conditionNote: '',
          managerApproval: true,
          approvalThreshold: '',
        },
      ],
    }),
  );

  assert.equal(result.valid, false);
  assert.equal(result.errors['rule:discount-rule-1:range'], 'حداقل تخفیف نمی‌تواند بیشتر از حداکثر تخفیف باشد.');
  assert.equal(result.errors['rule:discount-rule-1:approvalThreshold'], 'آستانه تایید مدیر را وارد کنید.');
});
function makeValidTerminationData(overrides: Partial<ContractTerminationData> = {}): ContractTerminationData {
  return {
    terminationEnabled: true,
    terminationPartyTab: 'seller',
    terminationConstructorPanel: 'list',
    terminationBuyerPanel: 'list',
    sellerTerminationEngaged: true,
    buyerTerminationEngaged: false,
    buyerCompletion: {
      lateDelivery: false,
      specificationChanges: false,
      breachOfObligations: false,
      areaDiscrepancy: false,
      notification: false,
      draftTemplateUsage: false,
    },
    constructorCompletion: {
      lateInstallment: true,
      financialObligations: true,
      documentDeficiencies: true,
      otherBreach: true,
      notifications: true,
    },
    constructorTerms: {
      lateInstallment: {
        ruleEnabled: true,
        gracePreset: '7',
        graceDaysCustom: '',
        detectionBasis: 'total-debt',
        minDebtAmount: '5000000',
        partialHandling: 'by-remaining-debt',
      },
      financialObligations: {
        ruleEnabled: true,
        obligationTypes: ['contract-costs', 'penalties'],
        gracePreset: '7',
        graceDaysCustom: '',
        officialDemandRequired: true,
      },
      documentDeficiencies: {
        ruleEnabled: true,
        mandatoryItems: ['identity'],
        completionDeadlineDays: '10',
        completionDeadlineDaysCustom: '',
        autoReminderEnabled: true,
      },
      otherBreach: {
        ruleEnabled: true,
        violationTypes: ['false-information'],
        rectificationDays: '15',
        rectificationDaysCustom: '',
        requiresContractManagerApproval: true,
      },
      notifications: {
        ruleEnabled: true,
        notifyConstructor: true,
        notifyManager: true,
        showTerminationActionInContractDetails: true,
      },
    },
    buyerTerms: {
      lateDelivery: {
        ruleEnabled: true,
        calculationBasis: 'contract-date',
        gracePreset: '30',
        graceDaysCustom: '',
        expertApprovalRequired: false,
      },
      specificationChanges: { ruleEnabled: false, includedTypes: [], priorApprovalRequired: false },
      breachOfObligations: {
        ruleEnabled: false,
        obligationTypes: [],
        rectificationPreset: '30',
        rectificationDaysCustom: '',
      },
      areaDiscrepancy: {
        ruleEnabled: false,
        thresholdPreset: '2',
        thresholdPercentCustom: '',
        referenceSources: [],
        financialSettlementInsteadOfTermination: false,
      },
      notification: {
        ruleEnabled: false,
        notifyBuyer: false,
        notifyContractManager: false,
        showManagementOptionInGrid: false,
      },
      draftTemplateUsage: {
        ruleEnabled: false,
        allowPerContractOverride: false,
      },
    },
    ...overrides,
  };
}

test('validateTerminationStep accepts a complete termination payload', () => {
  const result = validateTerminationStep(makeValidTerminationData());

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('validateTerminationStep rejects termination when neither seller nor buyer path was engaged', () => {
  const result = validateTerminationStep(
    makeValidTerminationData({
      sellerTerminationEngaged: false,
      buyerTerminationEngaged: false,
    }),
  );

  assert.equal(result.valid, false);
  assert.ok(result.errors['termination.partyEngagement']);
});

test('validateTerminationStep accepts termination when buyer path was engaged', () => {
  const result = validateTerminationStep(
    makeValidTerminationData({
      sellerTerminationEngaged: false,
      buyerTerminationEngaged: true,
    }),
  );

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});
