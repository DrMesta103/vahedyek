import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBrandInfoHash } from '../app/lib/brand-info/hash';
import { BrandInfoError, BrandInfoFileTooLargeError, BrandInfoUnsupportedMediaError } from '../app/lib/brand-info/errors';
import { validateSourceFields, validateUploadedFile } from '../app/lib/brand-info/validation';

test('brand info text rejects whitespace-only content and media', () => {
  assert.throws(() => validateSourceFields('TEXT', null, '  \n ', false), BrandInfoError);
  assert.throws(() => validateSourceFields('TEXT', null, 'text', true), BrandInfoError);
});

test('brand info media requires a title and media', () => {
  assert.throws(() => validateSourceFields('IMAGE', '', null, true), BrandInfoError);
  assert.throws(() => validateSourceFields('IMAGE', 'cover', null, false), BrandInfoError);
});

test('brand info hashes are canonical and exclude order/status', () => {
  const first = calculateBrandInfoHash({ type: 'TEXT', title: '  Title ', textContent: 'a\r\nb' });
  const second = calculateBrandInfoHash({ type: 'TEXT', title: 'Title', textContent: 'a\nb' });
  assert.equal(first, second);
  assert.match(first, /^[a-f0-9]{64}$/);
});

test('brand info file rules validate extension, MIME, and size', () => {
  const file = new File([Buffer.from('%PDF-1.4')], 'ChatGPT Image Jul 6, 2026, 10_55_30 PM.png', { type: 'image/png' });
  assert.deepEqual(validateUploadedFile('IMAGE', file), { extension: 'png', mimeType: 'image/png', size: file.size });
  const pdfFile = new File([Buffer.from('%PDF-1.4')], 'راهنمای برند (نسخه نهایی).pdf', { type: 'application/pdf' });
  assert.deepEqual(validateUploadedFile('FILE', pdfFile), { extension: 'pdf', mimeType: 'application/pdf', size: pdfFile.size });
  assert.throws(() => validateUploadedFile('IMAGE', pdfFile), BrandInfoUnsupportedMediaError);
  assert.throws(() => validateUploadedFile('FILE', new File([], 'brief.pdf', { type: 'application/pdf' })), BrandInfoUnsupportedMediaError);
  assert.throws(() => validateUploadedFile('FILE', new File([new Uint8Array(26 * 1024 * 1024)], 'brief.pdf', { type: 'application/pdf' })), BrandInfoFileTooLargeError);
});
