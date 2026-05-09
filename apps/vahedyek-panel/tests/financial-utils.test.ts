import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addIntervalToDate,
  buildRegularDueItems,
  distributeAmount,
  normalizeFinancialCategories,
  normalizeFinancialDueItems,
  sumFinancialCapsCountedAgainstContractTotal,
} from '../app/lib/financialUtils';
import { mapFinancialCategoriesForClientApi } from '../app/lib/financialCategoriesApiSerialize';

test('distributeAmount splits total and keeps exact sum', () => {
  const result = distributeAmount(1000, 3);

  assert.deepEqual(result, [333, 333, 334]);
  assert.equal(result.reduce((sum, item) => sum + item, 0), 1000);
});

test('addIntervalToDate respects monthly period', () => {
  assert.equal(addIntervalToDate('1405/01/15', 2, 'monthly', 2), '1405/05/15');
});

test('addIntervalToDate respects daily period', () => {
  assert.equal(addIntervalToDate('1405/01/01', 2, 'daily', 10), '1405/01/21');
});

test('addIntervalToDate accepts Persian digits from date picker values', () => {
  assert.equal(addIntervalToDate('۱۴۰۵/۰۱/۱۵', 2, 'monthly', 2), '1405/05/15');
});

test('buildRegularDueItems generates grouped installments with titles and dates', () => {
  const result = buildRegularDueItems({
    activeTab: 'installment',
    title: 'قسط منظم',
    totalAmount: 1200,
    count: 3,
    startDate: '1405/02/10',
    frequency: 'monthly',
    period: 2,
    idPrefix: 'fixed-seed',
  });

  assert.equal(result.length, 3);
  assert.deepEqual(
    result.map((item) => ({
      id: item.id,
      title: item.title,
      amount: item.amount,
      dueDate: item.dueDate,
    })),
    [
      { id: 'fixed-seed-0', title: 'قسط منظم 1', amount: 400, dueDate: '1405/02/10' },
      { id: 'fixed-seed-1', title: 'قسط منظم 2', amount: 400, dueDate: '1405/04/10' },
      { id: 'fixed-seed-2', title: 'قسط منظم 3', amount: 400, dueDate: '1405/06/10' },
    ],
  );
});

test('buildRegularDueItems accepts Persian-digit start dates', () => {
  const result = buildRegularDueItems({
    activeTab: 'installment',
    title: 'قسط منظم',
    totalAmount: 900,
    count: 3,
    startDate: '۱۴۰۵/۰۲/۱۰',
    frequency: 'monthly',
    period: 1,
    idPrefix: 'persian-seed',
  });

  assert.deepEqual(
    result.map((item) => item.dueDate),
    ['1405/02/10', '1405/03/10', '1405/04/10'],
  );
});

test('normalizeFinancialCategories trims values and removes duplicate ids', () => {
  const result = normalizeFinancialCategories([
    { id: 'advance', name: ' پیش پرداخت ', capAmount: '1000', system: true },
    { id: 'advance', name: 'تکراری', capAmount: 700, system: false },
    { id: 'custom-1', name: 'قسط', capAmount: '2500', system: false, requiresDue: false },
  ]);

  assert.deepEqual(result, [
    {
      id: 'advance',
      name: 'پیش پرداخت',
      capAmount: 1000,
      dueAmount: 1000,
      noDueAmount: 0,
      system: true,
      requiresDue: true,
    },
    {
      id: 'custom-1',
      name: 'قسط',
      capAmount: 2500,
      dueAmount: 0,
      noDueAmount: 2500,
      system: false,
      requiresDue: false,
    },
  ]);
});

test('mapFinancialCategoriesForClientApi strips financialId prefix from category ids', () => {
  const fid = 'fin-test-id';
  const rows = mapFinancialCategoriesForClientApi(fid, [
    {
      id: `${fid}:principal`,
      name: 'مبلغ اصل قرارداد',
      capAmount: 10,
      dueAmount: 0,
      noDueAmount: 10,
      system: true,
      requiresDue: false,
    },
    {
      id: `${fid}:advance`,
      name: 'پیش پرداخت',
      capAmount: 4,
      dueAmount: 4,
      noDueAmount: 0,
      system: true,
      requiresDue: true,
    },
  ]);

  assert.deepEqual(
    rows.map((r) => r.id),
    ['principal', 'advance'],
  );
});

test('sumFinancialCapsCountedAgainstContractTotal counts only principal breakdown and misc rows', () => {
  const lin = 'fin-line-a';
  const sum = sumFinancialCapsCountedAgainstContractTotal([
    { id: 'principal', capAmount: 10_000_000 },
    { id: 'advance', capAmount: 4_000_000 },
    { id: 'installment', capAmount: 6_000_000 },
    { id: lin, capAmount: 9_000_000 },
    { id: `${lin}:advance`, capAmount: 9_000_000 },
    { id: 'custom-legacy', capAmount: 7_000_000 },
  ]);

  assert.equal(sum, 10_000_000);
});

test('normalizeFinancialDueItems keeps only valid due items', () => {
  const result = normalizeFinancialDueItems(
    [
      { id: '1', categoryId: 'advance', title: ' قسط اول ', amount: '1200', dueDate: '1405/03/01' },
      { id: '2', categoryId: 'missing', title: 'رد شود', amount: '900', dueDate: '1405/03/02' },
      { id: '3', categoryId: 'advance', title: '', amount: '800', dueDate: '1405/03/03' },
      { id: '4', categoryId: 'advance', title: 'صفر', amount: '0', dueDate: '1405/03/04' },
    ],
    new Set(['advance']),
  );

  assert.deepEqual(result, [
    {
      id: '1',
      categoryId: 'advance',
      title: 'قسط اول',
      amount: 1200,
      dueDate: '1405/03/01',
    },
  ]);
});
