import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialRuleState, normalizeRuleState } from '../app/lib/businessContractRules';
import {
  BUILDER_PENALTY_PERCENT_BASIS_OPTIONS,
  normalizeBuilderPenaltyRuleState,
  validateBuilderPenaltyRuleState,
} from '../app/lib/builderPenalty';

test('normalizeRuleState provides defaults for unit delivery delay business fields', () => {
  const state = normalizeRuleState('builder-penalty', {});

  assert.equal(state.values.unitDeliveryDelayPercentBasis, BUILDER_PENALTY_PERCENT_BASIS_OPTIONS[0]);
  assert.equal(state.values.unitDeliveryDelayPenaltyCapUnlimited, false);
});

test('builder penalty validation rejects cap lower than fixed base amount', () => {
  const state = createInitialRuleState('builder-penalty');
  state.values.unitDeliveryDelayEnabled = true;
  state.values.unitDeliveryDelayMode = 'fixed';
  state.values.unitDeliveryDelayFixedAmount = '400000';
  state.values.unitDeliveryDelayPenaltyCap = '300000';

  const result = validateBuilderPenaltyRuleState(normalizeBuilderPenaltyRuleState(state));

  assert.equal(result.ok, false);
  assert.ok(result.message.length > 0);
});

test('builder penalty validation requires percent basis for percent mode', () => {
  const state = createInitialRuleState('builder-penalty');
  state.values.unitDeliveryDelayEnabled = true;
  state.values.unitDeliveryDelayMode = 'percent';
  state.values.unitDeliveryDelayPercentAmount = '1';
  state.values.unitDeliveryDelayPercentBasis = '';

  const result = validateBuilderPenaltyRuleState(normalizeBuilderPenaltyRuleState(state));

  assert.equal(result.ok, false);
  assert.ok(result.message.length > 0);
});

test('builder penalty validation requires market value flow fields when basis is market value', () => {
  const state = createInitialRuleState('builder-penalty');
  state.values.unitDeliveryDelayEnabled = true;
  state.values.unitDeliveryDelayMode = 'percent';
  state.values.unitDeliveryDelayPercentAmount = '2';
  state.values.unitDeliveryDelayPercentBasis = 'ارزش روز واحد';
  state.values.unitDeliveryDelayMarketValueAmount = '5000000000';
  state.values.unitDeliveryDelayMarketValueReference = '';

  const result = validateBuilderPenaltyRuleState(normalizeBuilderPenaltyRuleState(state));

  assert.equal(result.ok, false);
  assert.ok(result.message.length > 0);
});

test('builder penalty validation requires expert amount flow fields when basis is expert amount', () => {
  const state = createInitialRuleState('builder-penalty');
  state.values.unitDeliveryDelayEnabled = true;
  state.values.unitDeliveryDelayMode = 'percent';
  state.values.unitDeliveryDelayPercentAmount = '2';
  state.values.unitDeliveryDelayPercentBasis = 'مبلغ تعیین‌شده توسط کارشناس';
  state.values.unitDeliveryDelayExpertAmount = '750000000';
  state.values.unitDeliveryDelayExpertReference = '';

  const result = validateBuilderPenaltyRuleState(normalizeBuilderPenaltyRuleState(state));

  assert.equal(result.ok, false);
  assert.ok(result.message.length > 0);
});

test('builder penalty validation requires custom basis title and amount when basis is custom', () => {
  const state = createInitialRuleState('builder-penalty');
  state.values.unitDeliveryDelayEnabled = true;
  state.values.unitDeliveryDelayMode = 'percent';
  state.values.unitDeliveryDelayPercentAmount = '2';
  state.values.unitDeliveryDelayPercentBasis = 'سفارشی';
  state.values.unitDeliveryDelayCustomBasisTitle = '';
  state.values.unitDeliveryDelayCustomBasisAmount = '';

  const result = validateBuilderPenaltyRuleState(normalizeBuilderPenaltyRuleState(state));

  assert.equal(result.ok, false);
  assert.ok(result.message.length > 0);
});

test('unlimited cap clears cap amount', () => {
  const state = createInitialRuleState('builder-penalty');
  state.values.unitDeliveryDelayEnabled = true;
  state.values.unitDeliveryDelayMode = 'fixed';
  state.values.unitDeliveryDelayFixedAmount = '400000';
  state.values.unitDeliveryDelayPenaltyCap = '900000';
  state.values.unitDeliveryDelayPenaltyCapUnlimited = true;

  const normalized = normalizeBuilderPenaltyRuleState(state);

  assert.equal(normalized.values.unitDeliveryDelayPenaltyCap, '');
});
