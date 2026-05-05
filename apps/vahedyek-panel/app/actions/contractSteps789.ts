'use server';

import type { Prisma } from '@prisma/client';
import { getSessionContext } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { getAttachmentsRow, getExtraCostsRow, getTechnicalSpecsRow, upsertAttachmentsRow, upsertExtraCostsRow, upsertTechnicalSpecsRow } from '../lib/contractSteps789Db';

export type ExtraCostPayer = 'buyer' | 'constructor' | 'shared';

export type ExtraCostItem = {
  id: string;
  title: string;
  enabled: boolean;
  payer: ExtraCostPayer;
  systemKey?: 'transfer' | 'taxes' | 'notary' | 'utilities';
};

export type TechnicalSpecItem = {
  id: string;
  title: string;
  standard: string;
  location: string;
  systemKey?: string;
};

export type AttachmentItem = {
  id: string;
  title: string;
  provided: boolean;
  file?: {
    dataUrl: string;
    mimeType: string | null;
    name: string;
    size: number;
  } | null;
  systemKey?: string;
};

async function ensureDraftAccess(draftId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await getSessionContext();
  if (!session?.tenantId) return { ok: false as const, message: 'برای ذخیره باید وارد شوید.' };

  const draft = await prisma.contractDraft.findFirst({
    where: { id: draftId, tenantId: session.tenantId },
    select: { id: true },
  });

  if (!draft) return { ok: false as const, message: 'پیش‌نویس یافت نشد.' };
  return { ok: true as const };
}

export async function getContractExtraCosts(
  draftId: string,
): Promise<{ ok: true; exists: boolean; payload: ExtraCostItem[] } | { ok: false; message: string }> {
  const access = await ensureDraftAccess(draftId);
  if (access.ok === false) return { ok: false, message: access.message };

  const row = await getExtraCostsRow(draftId);
  return { ok: true, exists: row !== null, payload: (Array.isArray(row) ? row : []) as ExtraCostItem[] };
}

export async function upsertContractExtraCosts(
  draftId: string,
  payload: ExtraCostItem[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  const access = await ensureDraftAccess(draftId);
  if (access.ok === false) return { ok: false, message: access.message };

  await upsertExtraCostsRow(draftId, payload as unknown as Prisma.InputJsonValue);
  return { ok: true };
}

export async function getContractTechnicalSpecs(
  draftId: string,
): Promise<{ ok: true; exists: boolean; specs: TechnicalSpecItem[] } | { ok: false; message: string }> {
  const access = await ensureDraftAccess(draftId);
  if (access.ok === false) return { ok: false, message: access.message };

  const row = await getTechnicalSpecsRow(draftId);
  return { ok: true, exists: row !== null, specs: (Array.isArray(row) ? row : []) as TechnicalSpecItem[] };
}

export async function upsertContractTechnicalSpecs(
  draftId: string,
  specs: TechnicalSpecItem[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  const access = await ensureDraftAccess(draftId);
  if (access.ok === false) return { ok: false, message: access.message };

  await upsertTechnicalSpecsRow(draftId, specs as unknown as Prisma.InputJsonValue);
  return { ok: true };
}

export async function getContractAttachments(
  draftId: string,
): Promise<{ ok: true; exists: boolean; documents: AttachmentItem[]; notes: string } | { ok: false; message: string }> {
  const access = await ensureDraftAccess(draftId);
  if (access.ok === false) return { ok: false, message: access.message };

  const row = await getAttachmentsRow(draftId);
  const docs = row?.documents;
  return { ok: true, exists: row !== null, documents: (Array.isArray(docs) ? docs : []) as AttachmentItem[], notes: row?.notes ?? '' };
}

export async function upsertContractAttachments(
  draftId: string,
  documents: AttachmentItem[],
  notes: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const access = await ensureDraftAccess(draftId);
  if (access.ok === false) return { ok: false, message: access.message };

  await upsertAttachmentsRow(draftId, documents as unknown as Prisma.InputJsonValue, notes.trim() ? notes : null);
  return { ok: true };
}

