import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APPENDIX_ADJUSTMENT_LINE_ID,
  APPENDIX_ADJUSTMENT_TITLE,
  createInitialAppendixPayload,
  normalizeAppendixPayload,
  validateAdjustmentPayload,
  validateAppendixPayload,
} from '../app/lib/appendixPayloads';
import { filterSupportedAppendixTags } from '../app/lib/appendixTagSupport';
import type { AppendixAdjustmentPayload, AppendixPenaltyWaiverPayload, AppendixTagKey } from '../app/types/contract';
import type { AppendixLoanPayload } from '../app/types/contract';

test('createInitialAppendixPayload builds a fixed single adjustment line', () => {
  const payload = createInitialAppendixPayload('adjustment') as AppendixAdjustmentPayload;
  const line = payload.categories.find((item) => item.id === APPENDIX_ADJUSTMENT_LINE_ID);

  assert.ok(line);
  assert.equal(line?.name, APPENDIX_ADJUSTMENT_TITLE);
  assert.equal(validateAdjustmentPayload(payload), '');
});

test('normalizeAppendixPayload restores the fixed adjustment line name and structure', () => {
  const payload = normalizeAppendixPayload('adjustment', {
    activeTab: 'missing',
    categories: [
      {
        id: APPENDIX_ADJUSTMENT_LINE_ID,
        name: 'عنوان دستکاری شده',
        capAmount: 2500000,
        dueAmount: 0,
        noDueAmount: 2500000,
        system: false,
        requiresDue: false,
      },
    ],
    dueItems: [],
  }) as AppendixAdjustmentPayload;
  const line = payload.categories.find((item) => item.id === APPENDIX_ADJUSTMENT_LINE_ID);

  assert.ok(line);
  assert.equal(line?.name, APPENDIX_ADJUSTMENT_TITLE);
  assert.equal(payload.activeTab, 'advance');
  assert.equal(validateAdjustmentPayload(payload), '');
});

test('validateAdjustmentPayload rejects unknown due categories', () => {
  const payload = createInitialAppendixPayload('adjustment') as AppendixAdjustmentPayload;
  payload.dueItems = [
    {
      id: 'due-1',
      categoryId: 'missing-category',
      title: 'سررسید نامعتبر',
      amount: 100000,
      dueDate: '1405/02/01',
    },
  ];

  assert.equal(validateAdjustmentPayload(payload), 'اطلاعات سررسیدهای مالی معتبر نیست.');
});

test('filterSupportedAppendixTags keeps only implemented appendix pages', () => {
  const tags = filterSupportedAppendixTags([
    'loan',
    'first-party',
    'adjustment',
    'discount',
    'unit-delivery-date',
  ] as AppendixTagKey[]);

  assert.deepEqual(tags, ['loan', 'first-party', 'adjustment', 'unit-delivery-date']);
});

test('createInitialAppendixPayload builds a loan payload with default status step', () => {
  const payload = createInitialAppendixPayload('loan') as AppendixLoanPayload;

  assert.equal(payload.flowStep, 'status');
  assert.equal(payload.paymentStatus, 'unselected');
  assert.equal(payload.selectedBank.length > 0, true);
});

test('normalizeAppendixPayload keeps loan details step only for less-than-contract flow', () => {
  const payload = normalizeAppendixPayload('loan', {
    flowStep: 'details',
    paymentStatus: 'less',
    contractLoanAmount: '1,200,000,000',
    loanAmount: '500,000,000',
    selectedBank: 'ملت',
  }) as AppendixLoanPayload;

  assert.equal(payload.flowStep, 'details');
  assert.equal(payload.paymentStatus, 'less');
  assert.equal(payload.contractLoanAmount, '1200000000');
  assert.equal(payload.loanAmount, '500000000');
});

test('createInitialAppendixPayload builds a penalty waiver payload compatible with the draft penalty section', () => {
  const payload = createInitialAppendixPayload('penalty-waiver') as AppendixPenaltyWaiverPayload;

  assert.equal(payload.mode, 'fixed');
  assert.equal(payload.period, 'monthly');
  assert.equal(payload.fixedAmount, '100,000');
  assert.equal(payload.penaltyPercent, '0.5');
  assert.equal(validateAppendixPayload('penalty-waiver', payload), '');
});

test('normalizeAppendixPayload preserves penalty waiver progressive rows', () => {
  const payload = normalizeAppendixPayload('penalty-waiver', {
    mode: 'progressive',
    period: 'daily',
    fixedAmount: '250000',
    penaltyPercent: '0.75',
    bankInterestPercent: '0.2',
    graceDays: '3',
    roundRule: '0',
    extraFeeEnabled: true,
    extraFeeType: 'fixed',
    extraFeeAmount: '5000',
    extraFeeRoundRule: '1000',
    progressiveRows: [
      { id: 'a', fromDay: '1', toDay: '5', rate: '0.5', openEnded: false },
      { id: 'b', fromDay: '6', toDay: '', rate: '1.25', openEnded: true },
    ],
  }) as AppendixPenaltyWaiverPayload;

  assert.equal(payload.mode, 'progressive');
  assert.equal(payload.period, 'daily');
  assert.equal(payload.fixedAmount, '250000');
  assert.equal(payload.penaltyPercent, '0.75');
  assert.equal(payload.progressiveRows[0]?.fromDay, '1');
  assert.equal(validateAppendixPayload('penalty-waiver', payload), '');
});
