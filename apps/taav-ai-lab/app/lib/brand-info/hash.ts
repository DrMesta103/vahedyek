import { createHash } from 'node:crypto';
import type { BrandInfoType } from './types';

function normalize(value: string | null | undefined) {
  return value?.replace(/\r\n?/g, '\n').normalize('NFC').trim() ?? null;
}

export function calculateBrandInfoHash(input: { type: BrandInfoType; title?: string | null; textContent?: string | null; mediaId?: string | null; extension?: string | null; size?: number | null }) {
  const canonical = input.type === 'TEXT'
    ? { type: input.type, normalizedTitle: normalize(input.title), normalizedTextContent: normalize(input.textContent) }
    : { type: input.type, normalizedTitle: normalize(input.title), mediaId: input.mediaId ?? null, normalizedExtension: normalize(input.extension)?.toLowerCase() ?? null, mediaSize: input.size ?? null };
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
}
