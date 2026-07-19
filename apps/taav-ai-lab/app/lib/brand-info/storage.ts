import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), '.data', 'taavia-brand-info-media');

export async function storeBrandInfoMedia(file: File) {
  const key = `${randomUUID().replaceAll('-', '')}-${path.basename(file.name).replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const absolute = path.join(ROOT, key);
  await mkdir(ROOT, { recursive: true });
  await writeFile(absolute, Buffer.from(await file.arrayBuffer()), { flag: 'wx' });
  return { key, absolutePath: absolute };
}

export async function removeBrandInfoMedia(storageKey: string) {
  const absolute = path.resolve(ROOT, storageKey);
  if (!absolute.startsWith(`${ROOT}${path.sep}`)) throw new Error('Invalid storage key');
  await rm(absolute, { force: true });
}

export function openBrandInfoMedia(storageKey: string) {
  const absolute = path.resolve(ROOT, storageKey);
  if (!absolute.startsWith(`${ROOT}${path.sep}`)) throw new Error('Invalid storage key');
  return createReadStream(absolute);
}
