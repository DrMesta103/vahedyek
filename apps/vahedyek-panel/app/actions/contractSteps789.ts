'use server';

import type { Prisma } from '@/lib/prisma-client';
import { getSessionContext } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { getAttachmentsRow, getExtraCostsRow, getTechnicalSpecsRow, upsertAttachmentsRow, upsertExtraCostsRow, upsertTechnicalSpecsRow } from '../lib/contractSteps789Db';

export type ContractRelatedExpenseType = 'COMMISSION' | 'NOTARY' | 'LEGAL';
export type ContractRelatedExpenseCalculationMethod = 'AMOUNT' | 'PERCENTAGE';

export type ContractRelatedExpense = {
  type: ContractRelatedExpenseType;
  calculationMethod: ContractRelatedExpenseCalculationMethod;
  /** Amount (currency) or Percentage value depending on calculationMethod */
  totalValue: number;
  buyerSharePercentage: number;
  sellerSharePercentage: number;
  /** The recipient/payer name for seller's share */
  sellerName: string;
};

export type TechnicalSpecItem = {
  id: string;
  title: string;
  standard: string;
  location: string;
  systemKey?: string;
};

export type ContractTechnicalSpecGroup = {
  id: string;
  title: string;
  selectedSpecIds: string[];
};

export type ContractTechnicalSpecsPayload = {
  specs: ContractTechnicalSpecGroup[];
};

export type AttachmentItem = {
  id: string;
  category?: string;
  title: string;
  /** Persian date (e.g. 1404/01/24) */
  date?: string;
  description?: string;
  provided?: boolean;
  /** New multi-file format */
  files?: Array<{
    dataUrl: string;
    mimeType: string | null;
    name: string;
    size: number;
  }>;
  /** Legacy single-file format (kept for backward compatibility) */
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

function normalizeTechnicalSpecId(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeTechnicalSpecGroup(input: unknown, index: number): ContractTechnicalSpecGroup | null {
  if (!input || typeof input !== 'object') return null;

  const raw = input as Record<string, unknown> & Partial<TechnicalSpecItem>;
  const title = typeof raw.title === 'string' ? raw.title.trim() : typeof raw.name === 'string' ? raw.name.trim() : '';
  const fromSelectedIds = Array.isArray(raw.selectedSpecIds)
    ? raw.selectedSpecIds
        .map((item) => normalizeTechnicalSpecId(item))
        .filter(Boolean)
    : [];
  const fromSpecIds = Array.isArray(raw.specIds)
    ? raw.specIds
        .map((item) => normalizeTechnicalSpecId(item))
        .filter(Boolean)
    : [];
  const fromItems = Array.isArray(raw.items)
    ? raw.items
        .map((item) => (item && typeof item === 'object' ? normalizeTechnicalSpecId((item as Partial<TechnicalSpecItem>).id) : ''))
        .filter(Boolean)
    : [];
  const legacySingleId = normalizeTechnicalSpecId(raw.id);
  const selectedSpecIds = fromSelectedIds.length ? fromSelectedIds : fromSpecIds.length ? fromSpecIds : fromItems;
  const normalizedSelectedSpecIds =
    selectedSpecIds.length || (!title && !selectedSpecIds.length && (raw.standard || raw.location || raw.systemKey)) ? selectedSpecIds : [];
  if (!title && !normalizedSelectedSpecIds.length && !legacySingleId) return null;

  return {
    id: legacySingleId || `group-${index + 1}`,
    title: title || `گروه ${index + 1}`,
    selectedSpecIds: normalizedSelectedSpecIds.length ? normalizedSelectedSpecIds : legacySingleId ? [legacySingleId] : [],
  };
}

function normalizeTechnicalSpecsPayload(input: unknown): ContractTechnicalSpecsPayload {
  if (Array.isArray(input)) {
    return {
      specs: input
        .map((item, index) => normalizeTechnicalSpecGroup(item, index))
        .filter((item): item is ContractTechnicalSpecGroup => Boolean(item)),
    };
  }

  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const directSpecs = Array.isArray(raw.specs) ? raw.specs : Array.isArray(raw.groups) ? raw.groups : null;
  if (directSpecs) {
    return {
      specs: directSpecs
        .map((item, index) => normalizeTechnicalSpecGroup(item, index))
        .filter((item): item is ContractTechnicalSpecGroup => Boolean(item)),
    };
  }

  return { specs: [] };
}

export async function getContractExtraCosts(
  draftId: string,
): Promise<{ ok: true; exists: boolean; payload: ContractRelatedExpense[] } | { ok: false; message: string }> {
  const access = await ensureDraftAccess(draftId);
  if (access.ok === false) return { ok: false, message: access.message };

  const row = await getExtraCostsRow(draftId);
  return { ok: true, exists: row !== null, payload: (Array.isArray(row) ? row : []) as ContractRelatedExpense[] };
}

export async function upsertContractExtraCosts(
  draftId: string,
  payload: ContractRelatedExpense[],
): Promise<{ ok: true } | { ok: false; message: string }> {
  const access = await ensureDraftAccess(draftId);
  if (access.ok === false) return { ok: false, message: access.message };

  await upsertExtraCostsRow(draftId, payload as unknown as Prisma.InputJsonValue);
  return { ok: true };
}

export async function getContractTechnicalSpecs(
  draftId: string,
): Promise<{ ok: true; exists: boolean; specs: any[] } | { ok: false; message: string }> {
  const access = await ensureDraftAccess(draftId);
  if (access.ok === false) return { ok: false, message: access.message };

  const row = await getTechnicalSpecsRow(draftId);
  const payload = normalizeTechnicalSpecsPayload(row);
  return { ok: true, exists: payload.specs.length > 0, specs: payload.specs as any[] };
}

export async function upsertContractTechnicalSpecs(
  draftId: string,
  payload: ContractTechnicalSpecsPayload | ContractTechnicalSpecGroup[] | any,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const access = await ensureDraftAccess(draftId);
  if (access.ok === false) return { ok: false, message: access.message };

  const normalized = normalizeTechnicalSpecsPayload(payload);
  await upsertTechnicalSpecsRow(draftId, normalized as unknown as Prisma.InputJsonValue);
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

