import assert from 'node:assert/strict';
import test from 'node:test';
import { persianMoneyWords } from '../app/lib/persianNumberWords';

test('persianMoneyWords joins scale labels without extra conjunction', () => {
  assert.equal(persianMoneyWords(50_000_000), 'پنجاه میلیون تومان');
  assert.equal(persianMoneyWords(1_250_000), 'یک میلیون و دویست و پنجاه هزار تومان');
});

test('persianMoneyWords returns empty for zero', () => {
  assert.equal(persianMoneyWords(0), '');
});
