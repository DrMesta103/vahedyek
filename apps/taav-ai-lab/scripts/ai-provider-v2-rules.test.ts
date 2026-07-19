import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAccountTransactionV2 } from '@/app/lib/ai-provider-v2-rules';

test('validateAccountTransactionV2: purchase must be positive', () => {
  assert.equal(
    validateAccountTransactionV2({
      transactionType: 'PURCHASE',
      amountUsd: -1,
      amountToman: -1000,
      transactionAt: new Date().toISOString(),
      description: null,
    }),
    'در خرید اعتبار، مبلغ باید مثبت باشد.',
  );
});

test('validateAccountTransactionV2: manual adjustment needs description', () => {
  assert.equal(
    validateAccountTransactionV2({
      transactionType: 'MANUAL_ADJUSTMENT',
      amountUsd: 1,
      amountToman: 1000,
      transactionAt: new Date().toISOString(),
      description: '   ',
    }),
    'برای اصلاح دستی، توضیحات اجباری است.',
  );
});

test('validateAccountTransactionV2: toman/usd sign must match', () => {
  assert.equal(
    validateAccountTransactionV2({
      transactionType: 'MANUAL_ADJUSTMENT',
      amountUsd: 1,
      amountToman: -1000,
      transactionAt: new Date().toISOString(),
      description: 'fix',
    }),
    'مبلغ دلار و تومان باید علامت یکسان داشته باشند.',
  );
});

test('validateAccountTransactionV2: valid transaction passes', () => {
  assert.equal(
    validateAccountTransactionV2({
      transactionType: 'MANUAL_ADJUSTMENT',
      amountUsd: -1.5,
      amountToman: -1000,
      transactionAt: new Date().toISOString(),
      description: 'correction',
    }),
    null,
  );
});

