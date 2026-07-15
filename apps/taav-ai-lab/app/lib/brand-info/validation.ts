import { BrandInfoError, BrandInfoFileTooLargeError, BrandInfoUnsupportedMediaError } from './errors';
import type { BrandInfoType } from './types';

export const BRAND_INFO_LIMITS = {
  textCharacters: 100_000,
  imageBytes: 10 * 1024 * 1024,
  fileBytes: 25 * 1024 * 1024,
  voiceBytes: 50 * 1024 * 1024,
  videoBytes: 200 * 1024 * 1024,
} as const;

const RULES: Record<Exclude<BrandInfoType, 'TEXT'>, { extensions: string[]; mimeTypes: string[]; maxBytes: number }> = {
  IMAGE: { extensions: ['jpg', 'jpeg', 'png', 'webp'], mimeTypes: ['image/jpeg', 'image/png', 'image/webp'], maxBytes: BRAND_INFO_LIMITS.imageBytes },
  FILE: { extensions: ['pdf', 'docx', 'txt', 'md', 'csv', 'xlsx'], mimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], maxBytes: BRAND_INFO_LIMITS.fileBytes },
  VOICE: { extensions: ['webm', 'mp3', 'wav', 'm4a', 'ogg'], mimeTypes: ['audio/webm', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/ogg'], maxBytes: BRAND_INFO_LIMITS.voiceBytes },
  VIDEO: { extensions: ['mp4', 'webm', 'mov'], mimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'], maxBytes: BRAND_INFO_LIMITS.videoBytes },
};

export function isBrandInfoType(value: unknown): value is BrandInfoType {
  return value === 'TEXT' || value === 'IMAGE' || value === 'FILE' || value === 'VOICE' || value === 'VIDEO';
}

export function normalizeTitle(value: string | null | undefined) {
  const title = value?.trim() || null;
  if (title && title.length > 300) throw new BrandInfoError('VALIDATION', 'عنوان نمی‌تواند بیشتر از ۳۰۰ کاراکتر باشد.');
  return title;
}

export function normalizeTextContent(value: string | null | undefined) {
  const text = value?.replace(/\r\n?/g, '\n').trim() || null;
  if (text && text.length > BRAND_INFO_LIMITS.textCharacters) throw new BrandInfoError('VALIDATION', 'متن بیش از حد مجاز طولانی است.');
  return text;
}

export function validateSourceFields(type: BrandInfoType, title: string | null | undefined, textContent: string | null | undefined, hasMedia: boolean) {
  const normalizedTitle = normalizeTitle(title);
  const normalizedText = normalizeTextContent(textContent);
  if (type === 'TEXT') {
    if (!normalizedText) throw new BrandInfoError('VALIDATION', 'متن خالی مجاز نیست.');
    if (hasMedia) throw new BrandInfoError('VALIDATION', 'منبع متنی نمی‌تواند فایل رسانه‌ای داشته باشد.');
  } else {
    if (!normalizedTitle) throw new BrandInfoError('VALIDATION', 'عنوان برای منابع رسانه‌ای الزامی است.');
    if (normalizedText || !hasMedia) throw new BrandInfoError('VALIDATION', 'منبع رسانه‌ای باید دقیقاً یک فایل داشته باشد و متن نداشته باشد.');
  }
  return { title: normalizedTitle, textContent: normalizedText };
}

function safeExtension(name: string) {
  const clean = name.trim().toLowerCase();
  // User-facing filenames may contain spaces, Unicode, commas, and parentheses.
  // Only reject path/control characters and require a simple alphanumeric extension.
  if (!clean || clean.length > 255 || /[\\/\u0000-\u001f\u007f]/.test(clean) || clean === '.' || clean === '..') {
    throw new BrandInfoUnsupportedMediaError('نام فایل معتبر نیست.');
  }
  const extension = /\.([a-z0-9]{1,10})$/.exec(clean)?.[1];
  if (!extension) throw new BrandInfoUnsupportedMediaError('نام فایل معتبر نیست.');
  return extension;
}

export function validateUploadedFile(type: BrandInfoType, file: File) {
  if (!isBrandInfoType(type) || type === 'TEXT') throw new BrandInfoUnsupportedMediaError('نوع منبع معتبر نیست.');
  if (!file || file.size <= 0) throw new BrandInfoUnsupportedMediaError('فایل خالی است.');
  const extension = safeExtension(file.name);
  const rule = RULES[type];
  if (!rule.extensions.includes(extension)) throw new BrandInfoUnsupportedMediaError('پسوند فایل برای این نوع منبع پشتیبانی نمی‌شود.');
  const mimeType = file.type.toLowerCase().split(';', 1)[0] ?? '';
  if (!rule.mimeTypes.includes(mimeType)) throw new BrandInfoUnsupportedMediaError('نوع MIME فایل پشتیبانی نمی‌شود.');
  if (file.size > rule.maxBytes) throw new BrandInfoFileTooLargeError('حجم فایل بیشتر از حد مجاز است.');
  return { extension, mimeType, size: file.size };
}

export function validateExpectedRevision(value: unknown) {
  const revision = typeof value === 'string' ? BigInt(value) : typeof value === 'number' && Number.isSafeInteger(value) ? BigInt(value) : null;
  if (revision === null || revision < BigInt(1)) throw new BrandInfoError('VALIDATION', 'revision معتبر نیست.');
  return revision;
}
