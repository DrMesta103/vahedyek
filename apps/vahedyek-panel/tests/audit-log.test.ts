import test from 'node:test';
import assert from 'node:assert/strict';
import { buildFieldDiffs, formatAuditValue } from '../app/lib/audit-log';

test('formatAuditValue formats empty and primitive values for Persian audit UI', () => {
  assert.equal(formatAuditValue(null), 'خالی');
  assert.equal(formatAuditValue(''), 'خالی');
  assert.equal(formatAuditValue(true), 'بله');
  assert.equal(formatAuditValue(false), 'خیر');
  assert.equal(formatAuditValue(1200), '۱٬۲۰۰');
});

test('buildFieldDiffs returns only changed labelled fields', () => {
  const result = buildFieldDiffs(
    { amount: 10, title: 'الف', ignored: 'same' },
    { amount: 20, title: 'الف', ignored: 'same' },
    { amount: 'مبلغ قرارداد', title: 'عنوان' },
  );

  assert.deepEqual(result, [
    {
      field: 'amount',
      label: 'مبلغ قرارداد',
      before: '۱۰',
      after: '۲۰',
    },
  ]);
});

test('buildFieldDiffs handles object values deterministically', () => {
  const result = buildFieldDiffs(
    { payload: { a: 1 } },
    { payload: { a: 2 } },
    { payload: 'جزئیات' },
  );

  assert.equal(result.length, 1);
  assert.equal(result[0].label, 'جزئیات');
});
