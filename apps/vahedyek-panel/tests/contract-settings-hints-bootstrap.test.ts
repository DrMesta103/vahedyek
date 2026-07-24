import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveInstallmentDueScheduleHint,
  resolveInstallmentHintReference,
  resolvePrepaymentHintReference,
  resolveDomainRuleHint,
  resolveBuyerPenaltyTypeHint,
  resolveBuyerPenaltyFieldHints,
  resolveForgivenessFieldHints,
  resolveForgivenessEntryHint,
  resolveInterestFieldHints,
  resolveDiscountFieldHints,
  resolveDiscountTypeHint,
  resolveBuilderPenaltyFieldHints,
  resolveBuilderPenaltySectionHint,
  resolveTerminationFieldHints,
  canAlignWithSettings,
  aggregateAlignmentStatuses,
} from '../app/lib/contractSettingsHints';
import {
  buildBootstrapDiscountsPayload,
  buildBootstrapFinancialPayload,
  buildBootstrapPenaltiesPayload,
} from '../app/lib/contractSettingsBootstrap';
import { RULE_CONFIGS, createInitialRuleState, normalizeRuleState } from '../app/lib/businessContractRules';
import { normalizeTerminationPayload } from '../app/(panel)/contracts/new/_components/termination/terminationDefaults';

test('prepayment hint compares fixed amount against current', () => {
  const prepayment = normalizeRuleState('prepayment', {
    active: true,
    activeTab: 'fixed',
    values: { preFixedAmount: '1000000' },
  });
  const equal = resolvePrepaymentHintReference(prepayment, 0, 1_000_000);
  assert.equal(equal.status, 'equal');
  const different = resolvePrepaymentHintReference(prepayment, 0, 500_000);
  assert.equal(different.status, 'different');
});

test('installment hint exposes mode and balloon breakdown', () => {
  const installments = normalizeRuleState('installments', {
    active: true,
    activeTab: 'regular',
    values: {
      regularInterval: 'ماهانه',
      regularBalloonEnabled: true,
      regularBalloonWindow: 'ماه آخر',
      regularBalloonPercent: '20',
    },
  });
  const hint = resolveInstallmentHintReference(installments, true, 3);
  assert.equal(hint.status, 'equal');
  assert.ok(hint.breakdownLines.some((line) => line.label.includes('بالونی')));
  assert.ok(hint.referenceLines.some((line) => line.label === 'حالت تنظیمات اقساط' && line.value === 'منظم'));
});

test('installment due schedule hint shows concrete inactive copy like prepayment', () => {
  const installments = normalizeRuleState('installments', {
    active: false,
    activeTab: 'regular',
    values: {},
  });
  const hint = resolveInstallmentDueScheduleHint(installments, []);
  assert.equal(hint.status, 'equal');
  assert.equal(hint.helperText, 'در تنظیمات کسب‌وکار، اقساط فعال نیست.');
  assert.ok(hint.referenceLines.some((line) => line.value === 'غیرفعال'));
});

test('domain discount hint reports missing settings', () => {
  const missing = resolveDomainRuleHint(RULE_CONFIGS.discount, null, createInitialRuleState('discount'));
  assert.equal(missing.status, 'missing');
});

test('bootstrap financial seeds fixed prepayment amount only', () => {
  const seeded = buildBootstrapFinancialPayload(
    normalizeRuleState('prepayment', {
      active: true,
      activeTab: 'fixed',
      values: { preFixedAmount: '2500000' },
    }),
  );
  assert.ok(seeded);
  const advance = seeded?.categories.find((item) => item.id === 'advance');
  assert.equal(advance?.capAmount, 2_500_000);

  const percentOnly = buildBootstrapFinancialPayload(
    normalizeRuleState('prepayment', {
      active: true,
      activeTab: 'percent',
      values: { prePercent: '10' },
    }),
  );
  assert.equal(percentOnly, null);
});

test('bootstrap discounts and penalties map active settings', async () => {
  const discounts = buildBootstrapDiscountsPayload(
    normalizeRuleState('discount', {
      active: true,
      activeTab: 'on-contract',
      activeChip: 'contract-base',
      values: {
        discountContractValue: '100000',
        discountValueMode: 'amount',
        discountScope: 'whole',
      },
    }),
  );
  assert.ok(discounts);
  assert.equal(discounts?.types.find((item) => item.id === 'contract-base')?.active, true);
  assert.equal(discounts?.rules.length, 1);

  const penaltyReference = normalizeRuleState('penalty', {
    active: true,
    activeTab: 'fixed',
    values: {
      penaltyFixedAmount: '50000',
      penaltyFixedPeriod: 'ماهانه',
      penaltyFixedGraceDays: '2',
    },
  });
  const penalties = buildBootstrapPenaltiesPayload(penaltyReference);
  assert.ok(penalties);
  assert.equal(penalties?.rules[0]?.mode, 'fixed');
  assert.equal(penaltyReference.activeChip, undefined);
  assert.equal(penalties?.types.find((item) => item.id === 'installment-delay')?.active, true);

  const advancePenalties = buildBootstrapPenaltiesPayload(
    normalizeRuleState('penalty', {
      active: true,
      activeTab: 'fixed',
      activeChip: 'advance-payment-delay',
      values: {
        penaltyFixedAmount: '10000',
        penaltyFixedPeriod: 'روزانه',
        penaltyFixedGraceDays: '2',
      },
    }),
  );
  assert.equal(advancePenalties?.types.find((item) => item.id === 'advance-payment-delay')?.active, true);
  assert.equal(advancePenalties?.rules[0]?.period, 'daily');
});

test('buyer penalty type hint shows info while inactive against active settings chip', () => {
  const reference = normalizeRuleState('penalty', {
    active: true,
    activeTab: 'fixed',
    activeChip: 'advance-payment-delay',
    values: {
      penaltyFixedAmount: '10000',
      penaltyFixedPeriod: 'روزانه',
      penaltyFixedGraceDays: '2',
    },
  });
  const inactiveTarget = resolveBuyerPenaltyTypeHint(reference, 'advance-payment-delay', false, null);
  assert.equal(inactiveTarget.status, 'info');
  const otherType = resolveBuyerPenaltyTypeHint(reference, 'installment-delay', false, null);
  // No slice for installment → treated as settings-inactive → equal when draft inactive
  assert.equal(otherType.status, 'equal');
});

test('buyer penalty type hints stay visible for every configured slice when inactive', () => {
  const reference = normalizeRuleState('penalty', {
    active: true,
    activeTab: 'fixed',
    activeChip: 'unit-handover-delay',
    values: {
      penaltyFixedAmount: '100',
      penaltyFixedPeriod: 'روزانه',
      penaltyFixedGraceDays: '1',
    },
    valuesByType: {
      'unit-handover-delay': {
        activeTab: 'fixed',
        values: {
          penaltyFixedAmount: '100',
          penaltyFixedPeriod: 'روزانه',
          penaltyFixedGraceDays: '1',
        },
      },
      'installment-delay': {
        activeTab: 'fixed',
        values: {
          penaltyFixedAmount: '200',
          penaltyFixedPeriod: 'ماهانه',
          penaltyFixedGraceDays: '2',
        },
      },
    },
  });

  const unitInactive = resolveBuyerPenaltyTypeHint(reference, 'unit-handover-delay', false, null);
  const installmentInactive = resolveBuyerPenaltyTypeHint(reference, 'installment-delay', false, null);
  assert.notEqual(unitInactive.status, 'missing');
  assert.notEqual(installmentInactive.status, 'missing');
  assert.equal(unitInactive.status, 'info');
  assert.equal(installmentInactive.status, 'info');

  // Types without a settings slice still get a concrete alignment status (not missing).
  const documentInactive = resolveBuyerPenaltyTypeHint(reference, 'document-delay', false, null);
  assert.equal(documentInactive.status, 'equal');
  const documentActive = resolveBuyerPenaltyTypeHint(reference, 'document-delay', true, {
    id: 'r-doc',
    penaltyTypeId: 'document-delay',
    mode: 'fixed',
    period: 'daily',
    fixedAmount: '10',
    penaltyPercent: '',
    bankInterestPercent: '',
    graceDays: '2',
    roundRule: '100',
    extraFeeEnabled: false,
    extraFeeType: 'percent',
    extraFeeAmount: '',
    extraFeeRoundRule: '100',
    progressiveRows: [],
  });
  assert.equal(documentActive.status, 'different');
});

test('buyer penalty field hints expose mode and amount labels', () => {
  const reference = normalizeRuleState('penalty', {
    active: true,
    activeTab: 'fixed',
    activeChip: 'advance-payment-delay',
    values: {
      penaltyFixedAmount: '10000',
      penaltyFixedPeriod: 'روزانه',
      penaltyFixedGraceDays: '2',
      penaltyFixedExtraFeeEnabled: false,
    },
  });

  const mismatched = resolveBuyerPenaltyFieldHints(reference, 'advance-payment-delay', true, {
    id: 'rule-1',
    penaltyTypeId: 'advance-payment-delay',
    mode: 'contract',
    period: 'monthly',
    fixedAmount: '',
    penaltyPercent: '1',
    bankInterestPercent: '',
    graceDays: '2',
    roundRule: '100',
    extraFeeEnabled: false,
    extraFeeType: 'percent',
    extraFeeAmount: '',
    extraFeeRoundRule: '100',
    progressiveRows: [],
  });
  assert.equal(mismatched.mode?.status, 'different');
  assert.equal(mismatched.mode?.settingsLabel, 'مبلغ ثابت برای هر روز/ماه');
  assert.equal(mismatched.period?.status, 'different');
  assert.ok(mismatched.period?.settingsLabel?.includes('روزانه'));

  const aligned = resolveBuyerPenaltyFieldHints(reference, 'advance-payment-delay', true, {
    id: 'rule-2',
    penaltyTypeId: 'advance-payment-delay',
    mode: 'fixed',
    period: 'daily',
    fixedAmount: '10,000',
    penaltyPercent: '',
    bankInterestPercent: '',
    graceDays: '2',
    roundRule: '100',
    extraFeeEnabled: false,
    extraFeeType: 'percent',
    extraFeeAmount: '',
    extraFeeRoundRule: '100',
    progressiveRows: [],
  });
  assert.equal(aligned.mode?.status, 'equal');
  assert.equal(aligned.period?.status, 'equal');
  assert.equal(aligned.fixedAmount?.status, 'equal');
  assert.equal(aligned.graceDays?.status, 'equal');

  const otherType = resolveBuyerPenaltyFieldHints(reference, 'installment-delay', true, {
    id: 'rule-3',
    penaltyTypeId: 'installment-delay',
    mode: 'fixed',
    period: 'daily',
    fixedAmount: '1',
    penaltyPercent: '',
    bankInterestPercent: '',
    graceDays: '2',
    roundRule: '100',
    extraFeeEnabled: false,
    extraFeeType: 'percent',
    extraFeeAmount: '',
    extraFeeRoundRule: '100',
    progressiveRows: [],
  });
  // Unconfigured type still gets field tags against inactive/empty settings template.
  assert.equal(otherType.mode?.status, 'missing');
  assert.equal(otherType.fixedAmount?.status, 'missing');
  assert.equal(otherType.fixedAmount?.settingsLabel, null);
  assert.equal(otherType.graceDays?.status, 'missing');
});

test('buyer penalty field hints stay isolated per valuesByType slice', () => {
  const reference = normalizeRuleState('penalty', {
    active: true,
    activeTab: 'fixed',
    activeChip: 'installment-delay',
    values: {
      penaltyFixedAmount: '1000',
      penaltyFixedPeriod: 'ماهانه',
      penaltyFixedGraceDays: '2',
      penaltyFixedExtraFeeEnabled: false,
    },
    valuesByType: {
      'installment-delay': {
        activeTab: 'fixed',
        values: {
          penaltyFixedAmount: '1000',
          penaltyFixedPeriod: 'ماهانه',
          penaltyFixedGraceDays: '2',
          penaltyFixedExtraFeeEnabled: false,
        },
      },
      'advance-payment-delay': {
        activeTab: 'fixed',
        values: {
          penaltyFixedAmount: '99999',
          penaltyFixedPeriod: 'روزانه',
          penaltyFixedGraceDays: '5',
          penaltyFixedExtraFeeEnabled: false,
        },
      },
    },
  });

  const installmentHints = resolveBuyerPenaltyFieldHints(reference, 'installment-delay', true, {
    id: 'r-inst',
    penaltyTypeId: 'installment-delay',
    mode: 'fixed',
    period: 'monthly',
    fixedAmount: '1000',
    penaltyPercent: '',
    bankInterestPercent: '',
    graceDays: '2',
    roundRule: '100',
    extraFeeEnabled: false,
    extraFeeType: 'percent',
    extraFeeAmount: '',
    extraFeeRoundRule: '100',
    progressiveRows: [],
  });
  assert.equal(installmentHints.fixedAmount?.status, 'equal');
  assert.equal(installmentHints.period?.status, 'equal');

  const advanceHints = resolveBuyerPenaltyFieldHints(reference, 'advance-payment-delay', true, {
    id: 'r-adv',
    penaltyTypeId: 'advance-payment-delay',
    mode: 'fixed',
    period: 'daily',
    fixedAmount: '99999',
    penaltyPercent: '',
    bankInterestPercent: '',
    graceDays: '5',
    roundRule: '100',
    extraFeeEnabled: false,
    extraFeeType: 'percent',
    extraFeeAmount: '',
    extraFeeRoundRule: '100',
    progressiveRows: [],
  });
  assert.equal(advanceHints.fixedAmount?.status, 'equal');
  assert.equal(advanceHints.fixedAmount?.settingsLabel, null);

  // Changing installment root values must not affect advance slice hints.
  const mutated = {
    ...reference,
    values: { ...reference.values, penaltyFixedAmount: '1' },
  };
  const advanceAfterMutation = resolveBuyerPenaltyFieldHints(mutated, 'advance-payment-delay', true, {
    id: 'r-adv-2',
    penaltyTypeId: 'advance-payment-delay',
    mode: 'fixed',
    period: 'daily',
    fixedAmount: '99999',
    penaltyPercent: '',
    bankInterestPercent: '',
    graceDays: '5',
    roundRule: '100',
    extraFeeEnabled: false,
    extraFeeType: 'percent',
    extraFeeAmount: '',
    extraFeeRoundRule: '100',
    progressiveRows: [],
  });
  assert.equal(advanceAfterMutation.fixedAmount?.status, 'equal');

  const unconfigured = resolveBuyerPenaltyFieldHints(reference, 'document-delay', true, {
    id: 'r-doc',
    penaltyTypeId: 'document-delay',
    mode: 'fixed',
    period: 'daily',
    fixedAmount: '10',
    penaltyPercent: '',
    bankInterestPercent: '',
    graceDays: '2',
    roundRule: '100',
    extraFeeEnabled: false,
    extraFeeType: 'percent',
    extraFeeAmount: '',
    extraFeeRoundRule: '100',
    progressiveRows: [],
  });
  assert.equal(unconfigured.mode?.status, 'missing');
  assert.equal(unconfigured.mode?.settingsLabel, null);
  assert.equal(unconfigured.fixedAmount?.status, 'missing');
  assert.equal(unconfigured.fixedAmount?.settingsLabel, null);
  assert.equal(unconfigured.graceDays?.status, 'missing');
  assert.equal(unconfigured.graceDays?.settingsLabel, null);
  // Configured slices stay isolated — document must not pick installment amounts.
  assert.equal(installmentHints.fixedAmount?.status, 'equal');
});

test('bootstrap penalties creates one rule per valuesByType slice', () => {
  const reference = normalizeRuleState('penalty', {
    active: true,
    activeChip: 'installment-delay',
    activeTab: 'fixed',
    values: { penaltyFixedAmount: '1000', penaltyFixedPeriod: 'ماهانه', penaltyFixedGraceDays: '2' },
    valuesByType: {
      'installment-delay': {
        activeTab: 'fixed',
        values: { penaltyFixedAmount: '1000', penaltyFixedPeriod: 'ماهانه', penaltyFixedGraceDays: '2' },
      },
      'advance-payment-delay': {
        activeTab: 'fixed',
        values: { penaltyFixedAmount: '2000', penaltyFixedPeriod: 'روزانه', penaltyFixedGraceDays: '1' },
      },
    },
  });
  const payload = buildBootstrapPenaltiesPayload(reference);
  assert.ok(payload);
  assert.equal(payload?.rules.length, 2);
  assert.equal(payload?.types.find((item) => item.id === 'installment-delay')?.active, true);
  assert.equal(payload?.types.find((item) => item.id === 'advance-payment-delay')?.active, true);
  assert.equal(payload?.rules.find((rule) => rule.penaltyTypeId === 'advance-payment-delay')?.period, 'daily');
});

test('forgiveness field hints equal/different and missing reference', () => {
  assert.deepEqual(resolveForgivenessFieldHints(null, createInitialRuleState('forgiveness')), {});

  const reference = normalizeRuleState('forgiveness', {
    active: true,
    activeTab: 'whole-contract',
    values: {
      forgiveMaxDelayCount: '3',
      forgiveValueMode: 'amount',
      forgiveMinValue: '1000',
      forgiveManagerApproval: true,
    },
  });
  const equal = resolveForgivenessFieldHints(reference, {
    ...reference,
    values: { ...reference.values },
  });
  assert.equal(equal.forgiveMaxDelayCount?.status, 'equal');
  assert.equal(equal.forgiveValueMode?.status, 'equal');

  const different = resolveForgivenessFieldHints(reference, {
    ...reference,
    values: { ...reference.values, forgiveMaxDelayCount: '5', forgiveValueMode: 'percent' },
  });
  assert.equal(different.forgiveMaxDelayCount?.status, 'different');
  assert.equal(different.forgiveValueMode?.status, 'different');
  assert.ok(different.forgiveMaxDelayCount?.settingsLabel);
});

test('interest field hints compare active tab fields', () => {
  const reference = normalizeRuleState('interest', {
    active: true,
    activeTab: 'simple-interest',
    values: { interestApr: '44', interestPenaltyEnabled: false },
  });
  const aligned = resolveInterestFieldHints(reference, {
    ...reference,
    values: { ...reference.values, interestApr: '44' },
  });
  assert.equal(aligned.activeTab?.status, 'equal');
  assert.equal(aligned.interestApr?.status, 'equal');

  const mismatched = resolveInterestFieldHints(reference, {
    ...reference,
    activeTab: 'compound-interest',
    values: { ...reference.values, interestApr: '10' },
  });
  assert.equal(mismatched.activeTab?.status, 'different');
  assert.equal(mismatched.interestApr?.status, 'different');
});

test('discount field hints map contract-base to on-contract tab', () => {
  const reference = normalizeRuleState('discount', {
    active: true,
    activeTab: 'on-contract',
    values: {
      discountContractTarget: 'مبلغ',
      discountContractValue: '500',
      discountContractNeedApproval: false,
      discountScope: 'whole',
    },
  });
  const aligned = resolveDiscountFieldHints(
    reference,
    {
      id: 'd1',
      discountTypeId: 'contract-base',
      enabled: true,
      valueMode: 'amount',
      minValue: '500',
      maxValue: '500',
      managerApproval: false,
      approvalThreshold: '',
      scope: 'whole',
      entryId: '',
      conditionConfigured: false,
    },
    true,
  );
  assert.equal(aligned.valueMode?.status, 'equal');
  assert.equal(aligned.maxValue?.status, 'equal');
  assert.equal(aligned.managerApproval?.status, 'equal');
  assert.notEqual(aligned.valueMode?.status, 'idle');

  const different = resolveDiscountFieldHints(
    reference,
    {
      id: 'd2',
      discountTypeId: 'contract-base',
      enabled: true,
      valueMode: 'percent',
      minValue: '1',
      maxValue: '2',
      managerApproval: true,
      approvalThreshold: '10',
      scope: 'whole',
      entryId: '',
      conditionConfigured: false,
    },
    true,
  );
  assert.equal(different.valueMode?.status, 'different');
  assert.equal(different.managerApproval?.status, 'different');
  assert.equal(different.maxValue?.status, 'different');
  assert.deepEqual(resolveDiscountFieldHints(null, null, true), {});

  // Other type gets no field hints (card-level handles alignment).
  assert.deepEqual(
    resolveDiscountFieldHints(
      reference,
      {
        id: 'd3',
        discountTypeId: 'early-payment',
        enabled: true,
        valueMode: 'amount',
        minValue: '',
        maxValue: '1',
        managerApproval: false,
        approvalThreshold: '',
        scope: 'whole',
        entryId: '',
        conditionConfigured: false,
      },
      true,
    ),
    {},
  );
});

test('discount field hints map early-payment tab fields', () => {
  const reference = normalizeRuleState('discount', {
    active: true,
    activeTab: 'early-payment',
    values: {
      discountEarlyTarget: 'درصد',
      discountEarlyValue: '5',
      discountManagerApproval: true,
      discountApprovalThreshold: '10',
      discountEarlyKeepOnDelay: true,
      discountConditionMaxDelayCount: '3',
      discountConditionGraceDays: '2',
      discountScope: 'whole',
    },
  });
  const hints = resolveDiscountFieldHints(
    reference,
    {
      id: 'd-early',
      discountTypeId: 'early-payment',
      enabled: true,
      valueMode: 'percent',
      minValue: '',
      maxValue: '5',
      managerApproval: true,
      approvalThreshold: '10',
      scope: 'whole',
      entryId: '',
      conditionConfigured: true,
      conditionMaxDelayCount: '3',
      conditionGraceDays: '2',
      conditionKeepOnDelay: true,
      conditionPenaltyOnDiscount: false,
      conditionSettlementTiming: 'unit-handover',
      conditionDueBasis: ['all-payment-types'],
    },
    true,
  );
  assert.equal(hints.valueMode?.status, 'equal');
  assert.equal(hints.maxValue?.status, 'equal');
  assert.equal(hints.managerApproval?.status, 'equal');
  assert.equal(hints.approvalThreshold?.status, 'equal');
  assert.equal(hints.maxDelayCount?.status, 'equal');
  assert.equal(hints.graceDays?.status, 'equal');
  assert.equal(hints.keepOnDelay?.status, 'equal');
});

test('builder penalty field hints scope by section', () => {
  const reference = normalizeRuleState('builder-penalty', {
    active: true,
    activeTab: 'builder-penalty-overview',
    values: {
      unitDeliveryDelayMode: 'fixed',
      unitDeliveryDelayPeriod: 'روزانه',
      unitDeliveryDelayFixedAmount: '10000',
      unitDeliveryDelayGraceDays: '2',
      unitDeliveryDelayPenaltyCap: '50000',
    },
  });
  const current = {
    ...reference,
    values: {
      ...reference.values,
      unitDeliveryDelayFixedAmount: '20000',
      unitDeliveryDelayGraceDays: '2',
    },
  };
  const hints = resolveBuilderPenaltyFieldHints(reference, current, 'unit-delivery-delay');
  assert.equal(hints.unitDeliveryDelayFixedAmount?.status, 'different');
  assert.equal(hints.unitDeliveryDelayGraceDays?.status, 'equal');
  assert.deepEqual(resolveBuilderPenaltyFieldHints(null, current, 'unit-delivery-delay'), {});
});

test('termination field hints cover subsection enable and grace fields', () => {
  const reference = normalizeTerminationPayload({
    terminationEnabled: true,
    sellerTerminationEngaged: true,
    buyerTerminationEngaged: true,
    constructorTerms: {
      lateInstallment: {
        ruleEnabled: true,
        gracePreset: '7',
        graceDaysCustom: '',
        detectionBasis: 'per-installment',
        minDebtAmount: '',
        consecutiveInstallmentsCount: '',
        partialHandling: 'if-not-full',
      },
    },
    buyerTerms: {
      lateDelivery: {
        ruleEnabled: true,
        calculationBasis: ['contract-delivery-date'],
        gracePreset: '6',
        graceMonthsCustom: '',
      },
    },
  });
  const equal = resolveTerminationFieldHints(reference, reference);
  assert.equal(equal['seller.lateInstallment.enabled']?.status, 'equal');
  assert.equal(equal['seller.lateInstallment.gracePreset']?.status, 'equal');
  assert.equal(equal['buyer.lateDelivery.enabled']?.status, 'equal');

  const differentPayload = normalizeTerminationPayload({
    ...reference,
    constructorTerms: {
      ...reference.constructorTerms,
      lateInstallment: {
        ...reference.constructorTerms.lateInstallment,
        ruleEnabled: false,
        gracePreset: '15',
      },
    },
  });
  const different = resolveTerminationFieldHints(reference, differentPayload);
  assert.equal(different['seller.lateInstallment.enabled']?.status, 'different');
  assert.equal(different['seller.lateInstallment.gracePreset']?.status, 'different');
  assert.deepEqual(resolveTerminationFieldHints(null, differentPayload), {});
});

test('builder penalty section hint treats unset settings section as inactive template', () => {
  const reference = normalizeRuleState('builder-penalty', {
    active: true,
    activeTab: 'builder-penalty-overview',
    values: {
      unitDeliveryDelayEnabled: true,
      unitDeliveryDelayMode: 'fixed',
      unitDeliveryDelayPeriod: 'روزانه',
      unitDeliveryDelayFixedAmount: '10000',
      materialSpecsChangeEnabled: false,
    },
  });

  const draftOff = {
    active: true,
    activeTab: 'builder-penalty-overview',
    values: {
      unitDeliveryDelayEnabled: false,
      materialSpecsChangeEnabled: false,
    },
  };

  const unitConfigured = resolveBuilderPenaltySectionHint(reference, draftOff, 'unit-delivery-delay');
  assert.notEqual(unitConfigured.status, 'missing');
  assert.notEqual(unitConfigured.status, 'equal');

  const materialUnset = resolveBuilderPenaltySectionHint(reference, draftOff, 'material-specs-change');
  assert.equal(materialUnset.status, 'equal');

  const materialActiveAgainstUnset = resolveBuilderPenaltySectionHint(
    reference,
    {
      ...draftOff,
      values: { ...draftOff.values, materialSpecsChangeEnabled: true },
    },
    'material-specs-change',
  );
  assert.equal(materialActiveAgainstUnset.status, 'different');
});

test('discount type hint uses inactive template when settings tab does not match', () => {
  const reference = normalizeRuleState('discount', {
    active: true,
    activeTab: 'on-contract',
    values: {
      discountContractTarget: 'مبلغ',
      discountContractValue: '1000',
      discountScope: 'whole',
    },
  });

  const inactiveEarly = resolveDiscountTypeHint(reference, 'early-payment', false, null);
  assert.equal(inactiveEarly.status, 'equal');

  const activeEarly = resolveDiscountTypeHint(reference, 'early-payment', true, {
    id: 'd-early',
    discountTypeId: 'early-payment',
    enabled: true,
    valueMode: 'amount',
    minValue: '1',
    maxValue: '1',
    managerApproval: false,
    approvalThreshold: '',
    scope: 'whole',
    entryId: '',
    conditionConfigured: false,
  });
  assert.equal(activeEarly.status, 'different');

  const inactiveContract = resolveDiscountTypeHint(reference, 'contract-base', false, null);
  assert.notEqual(inactiveContract.status, 'missing');
  assert.notEqual(inactiveContract.status, 'equal');
});

test('forgiveness entry hint equals when inactive without matching settings entry', () => {
  const reference = normalizeRuleState('forgiveness', {
    active: true,
    activeTab: 'forgiveness-overview',
    values: {
      forgiveAllowed: true,
      forgiveScope: 'itemized',
      forgiveEntryId: 'installment-delay',
      forgiveEnabledEntryIds: JSON.stringify(['installment-delay']),
    },
  });

  const unmatchedInactive = resolveForgivenessEntryHint(reference, 'document-delay', false, createInitialRuleState('forgiveness'));
  assert.equal(unmatchedInactive.status, 'equal');

  const unmatchedActive = resolveForgivenessEntryHint(reference, 'document-delay', true, {
    ...createInitialRuleState('forgiveness'),
    active: true,
    values: {
      forgiveScope: 'itemized',
      forgiveEntryId: 'document-delay',
    },
  });
  assert.equal(unmatchedActive.status, 'different');
});

test('termination buyer physicalProgressDelay gets enable hint from cancellation fallback', () => {
  const buyerRule = normalizeRuleState('buyer-cancellation', {
    active: true,
    activeTab: 'buyer-cancellation-overview',
    values: {
      buyerCancellationLateDeliveryEnabled: true,
    },
  });
  const current = normalizeTerminationPayload({
    terminationEnabled: true,
    buyerTerminationEngaged: true,
    buyerTerms: {
      physicalProgressDelay: {
        ruleEnabled: false,
      },
      lateDelivery: {
        ruleEnabled: true,
      },
    },
  });
  const hints = resolveTerminationFieldHints(null, current, { buyer: buyerRule });
  assert.equal(hints['buyer.physicalProgressDelay.enabled']?.status, 'equal');
  assert.equal(hints['buyer.lateDelivery.enabled']?.status, 'equal');

  const enabledProgress = normalizeTerminationPayload({
    ...current,
    buyerTerms: {
      ...current.buyerTerms,
      physicalProgressDelay: {
        ...current.buyerTerms.physicalProgressDelay,
        ruleEnabled: true,
      },
    },
  });
  const different = resolveTerminationFieldHints(null, enabledProgress, { buyer: buyerRule });
  assert.equal(different['buyer.physicalProgressDelay.enabled']?.status, 'different');
});

test('canAlignWithSettings enables only different/info statuses', () => {
  assert.equal(canAlignWithSettings('different'), true);
  assert.equal(canAlignWithSettings('info'), true);
  assert.equal(canAlignWithSettings('equal'), false);
  assert.equal(canAlignWithSettings('missing'), false);
  assert.equal(canAlignWithSettings(null), false);
  assert.equal(canAlignWithSettings(undefined), false);
});

test('aggregateAlignmentStatuses prefers different then info then equal', () => {
  assert.equal(aggregateAlignmentStatuses(['equal', 'info', 'different']), 'different');
  assert.equal(aggregateAlignmentStatuses(['equal', 'info']), 'info');
  assert.equal(aggregateAlignmentStatuses(['equal', 'missing']), 'equal');
  assert.equal(aggregateAlignmentStatuses([null, undefined]), null);
});
