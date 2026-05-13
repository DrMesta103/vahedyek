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
  assert.equal(payload.activeTab, `${APPENDIX_ADJUSTMENT_LINE_ID}:advance`);
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

  assert.equal(validateAdjustmentPayload(payload), 'اطلاعات مالی تعدیل معتبر نیست.');
});

test('filterSupportedAppendixTags keeps only implemented appendix pages', () => {
  const tags = filterSupportedAppendixTags([
    'first-party',
    'adjustment',
    'discount',
    'unit-delivery-date',
  ] as AppendixTagKey[]);

  assert.deepEqual(tags, ['first-party', 'adjustment', 'unit-delivery-date']);
});
