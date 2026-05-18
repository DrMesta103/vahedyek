import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APPENDIX_ADJUSTMENT_LINE_ID,
  APPENDIX_ADJUSTMENT_TITLE,
  createInitialAppendixPayload,
  normalizeAppendixPayload,
  validateAdjustmentPayload,
} from '../app/lib/appendixPayloads';
import { filterSupportedAppendixTags } from '../app/lib/appendixTagSupport';
import type { AppendixAdjustmentPayload, AppendixTagKey } from '../app/types/contract';
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
