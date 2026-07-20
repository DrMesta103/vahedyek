import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBusinessSettingsComparison,
  buildRuleStateComparison,
  compareBusinessSetting,
  formatBusinessSettingAmount,
  formatBusinessSettingValue,
  getRuleSettingComparison,
} from '../app/lib/contractSettingsReference';
import { RULE_CONFIGS } from '../app/lib/businessContractRules';

test('business setting comparison identifies equal, different, and missing values', () => {
  const equal = compareBusinessSetting('monthly', 'monthly');
  assert.equal(equal.status, 'equal');
  assert.equal(equal.differs, false);
  assert.equal(equal.missing, false);
  assert.equal(compareBusinessSetting('monthly', 'daily').status, 'different');
  assert.equal(compareBusinessSetting(undefined, 'daily').status, 'missing');
});

test('business setting comparison explains numeric direction and delta', () => {
  const under = compareBusinessSetting('10', '9', 'تومان');
  assert.equal(under.numericDifference, -1);
  assert.equal(under.differenceDirection, 'under');
  assert.equal(under.differenceText, 'مقدار فعلی ۱ تومان کمتر از تنظیمات است.');

  const over = compareBusinessSetting('10', '11', 'تومان');
  assert.equal(over.numericDifference, 1);
  assert.equal(over.differenceDirection, 'over');
  assert.equal(over.differenceText, 'مقدار فعلی ۱ تومان بیشتر از تنظیمات است.');
});

test('business setting comparison normalizes formatted Persian numbers', () => {
  const same = compareBusinessSetting('۱۲۰٬۰۰۰', '120,000');
  assert.equal(same.numericDifference, 0);
  assert.equal(same.differs, false);
});

test('business setting comparison supports breakdown and info states', () => {
  const comparison = buildBusinessSettingsComparison({
    status: 'info',
    breakdownLines: [
      { label: 'درصد تنظیمات', value: '۵٪' },
      { label: 'مبلغ ثابت تنظیمات', value: formatBusinessSettingAmount(1_000_000) },
    ],
    helperText: 'بعد از تکمیل مبلغ کل قرارداد محاسبه می‌شود.',
  });
  assert.equal(comparison.status, 'info');
  assert.equal(comparison.breakdownLines.length, 2);
  assert.equal(comparison.helperText, 'بعد از تکمیل مبلغ کل قرارداد محاسبه می‌شود.');
});

test('rule setting comparison reads the reference rule values', () => {
  const result = getRuleSettingComparison(
    {
      rules: { installments: { active: true, activeTab: 'regular', values: { regularInterval: 'monthly' } } },
      loanSettings: null,
      termination: null,
      loadedAt: 1,
    },
    'installments',
    'regularInterval',
    'daily',
  );
  assert.equal(result.reference, 'monthly');
  assert.equal(result.current, 'daily');
  assert.equal(result.differs, true);
});

test('rule state comparison exposes active tab fields as reference lines', () => {
  const comparison = buildRuleStateComparison(
    RULE_CONFIGS.interest,
    {
      active: true,
      activeTab: 'simple-interest',
      values: {
        interestApr: '44',
        interestPenaltyEnabled: true,
      },
    },
    {
      active: true,
      activeTab: 'compound-interest',
      values: {
        interestApr: '40',
      },
    },
  );
  assert.equal(comparison.status, 'different');
  assert.ok(comparison.breakdownLines.some((line) => line.label.includes('APR')));
});

test('business setting values have readable Persian states', () => {
  assert.equal(formatBusinessSettingValue('true'), 'فعال');
  assert.equal(formatBusinessSettingValue('false'), 'غیرفعال');
  assert.equal(formatBusinessSettingValue(null), 'ثبت نشده');
});
