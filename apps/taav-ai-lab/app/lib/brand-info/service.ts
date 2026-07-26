import { randomUUID } from "node:crypto";
import { assertTenantAccess } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@/app/lib/prisma-client";
import { BrandInfoConflictError, BrandInfoError, BrandInfoForbiddenError, BrandInfoNotFoundError } from "./errors";
import { calculateBrandInfoHash } from "./hash";
import { removeBrandInfoMedia, storeBrandInfoMedia } from "./storage";
import { isBrandInfoType, validateExpectedRevision, validateSourceFields, validateUploadedFile } from "./validation";
import type { BrandInfoFilters, BrandInfoDto, BrandInfoMutationResult, BrandInfoType } from "./types";

const newId = () => randomUUID().replaceAll("-", "");
const mediaInclude = { media: true } as const;

async function authorizedBrand(userId: string, tenantId: string, brandId: string, requireActive = false) {
  if (!(await assertTenantAccess(userId, tenantId))) throw new BrandInfoForbiddenError();
  const tenant = await prisma.tenant.findFirst({ where: { id: tenantId, isActive: true }, select: { id: true } });
  if (!tenant) throw new BrandInfoForbiddenError("کسب‌وکار فعال نیست یا دسترسی ندارید.");
  const brand = await prisma.taaviaBrand.findFirst({ where: { id: brandId, tenantId }, select: { id: true, status: true } });
  if (!brand) throw new BrandInfoNotFoundError("برند پیدا نشد.");
  if (requireActive && brand.status !== "ACTIVE") throw new BrandInfoForbiddenError("برند فعال نیست.");
  return brand;
}

async function authorizedItem(userId: string, tenantId: string, brandId: string, id: string, requireActiveBrand = false) {
  await authorizedBrand(userId, tenantId, brandId, requireActiveBrand);
  const item = await prisma.taaviaBrandInfo.findFirst({ where: { id, tenantId, brandId }, include: mediaInclude });
  if (!item) throw new BrandInfoNotFoundError();
  return item;
}

type BrandInfoRow = Prisma.TaaviaBrandInfoGetPayload<{ include: typeof mediaInclude }>;

function dto(row: BrandInfoRow): BrandInfoDto {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    textContent: row.textContent,
    media: row.media
      ? {
          id: row.media.id,
          extension: row.media.extension ?? "",
          size: row.media.sizeBytes ?? 0,
          name: row.media.originalName,
          mimeType: row.media.mimeType,
          previewUrl: `/api/businesses/${row.tenantId}/taavia/brands/${row.brandId}/brand-info/${row.id}/media?mode=preview`,
          downloadUrl: `/api/businesses/${row.tenantId}/taavia/brands/${row.brandId}/brand-info/${row.id}/media`,
        }
      : null,
    status: row.status,
    displayOrder: row.displayOrder,
    revision: row.revision.toString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    archivedAt: row.archivedAt?.toISOString() ?? null,
    archivedBy: row.archivedBy,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function emitEvent(tx: Prisma.TransactionClient, eventType: string, row: BrandInfoRow, occurredAt: Date) {
  await tx.integrationOutbox.create({
    data: {
      id: newId(),
      eventType,
      aggregateId: row.id,
      version: 1,
      occurredAt,
      createdAt: occurredAt,
      payload: { eventId: newId(), eventType, version: 1, tenantId: row.tenantId, brandId: row.brandId, brandInfoId: row.id, sourceType: row.type, revision: row.revision.toString(), occurredAt: occurredAt.toISOString() },
    },
  });
}

export async function listBrandInfo(userId: string, tenantId: string, brandId: string, filters: BrandInfoFilters = {}) {
  await authorizedBrand(userId, tenantId, brandId);
  const rows = await prisma.taaviaBrandInfo.findMany({
    where: { tenantId, brandId, status: filters.status ?? "ACTIVE", ...(filters.type ? { type: filters.type } : {}), ...(filters.search ? { OR: [{ title: { contains: filters.search, mode: "insensitive" } }, { textContent: { contains: filters.search, mode: "insensitive" } }] } : {}) },
    include: mediaInclude,
    orderBy: { displayOrder: "asc" },
  });
  return rows.map(dto);
}

export async function getBrandInfo(userId: string, tenantId: string, brandId: string, id: string) {
  return dto(await authorizedItem(userId, tenantId, brandId, id));
}

export async function createTextBrandInfo(userId: string, input: { tenantId: string; brandId: string; title?: string | null; textContent?: string | null }): Promise<BrandInfoMutationResult> {
  await authorizedBrand(userId, input.tenantId, input.brandId, true);
  const fields = validateSourceFields("TEXT", input.title, input.textContent, false);
  const now = new Date();
  const id = newId();
  const contentHash = calculateBrandInfoHash({ type: "TEXT", ...fields });
  const row = await prisma.$transaction(async (tx) => {
    const first = await tx.taaviaBrandInfo.aggregate({ where: { tenantId: input.tenantId, brandId: input.brandId }, _min: { displayOrder: true } });
    const created = await tx.taaviaBrandInfo.create({ data: { id, tenantId: input.tenantId, brandId: input.brandId, type: "TEXT", title: fields.title, textContent: fields.textContent, mediaAssetId: null, status: "ACTIVE", displayOrder: (first._min.displayOrder ?? 0) - 1, revision: BigInt(1), contentHash, createdBy: userId, updatedBy: userId, archivedAt: null, archivedBy: null, createdAt: now, updatedAt: now }, include: mediaInclude });
    await emitEvent(tx, "taavia-brand-info.source-created", created, now);
    return created;
  });
  return { item: dto(row), changed: true };
}

export async function createMediaBrandInfo(userId: string, input: { tenantId: string; brandId: string; type: Exclude<BrandInfoType, "TEXT">; title?: string | null; file: File }): Promise<BrandInfoMutationResult> {
  await authorizedBrand(userId, input.tenantId, input.brandId, true);
  const fields = validateSourceFields(input.type, input.title, null, true);
  const fileInfo = validateUploadedFile(input.type, input.file);
  const stored = await storeBrandInfoMedia(input.file);
  const now = new Date();
  try {
    const row = await prisma.$transaction(async (tx) => {
      const media = await tx.mediaAsset.create({ data: { id: newId(), tenantId: input.tenantId, extension: fileInfo.extension, sizeBytes: fileInfo.size, mimeType: fileInfo.mimeType, storageKey: stored.key, originalName: input.file.name, previewData: null, storageUrl: null, createdAt: now, updatedAt: now } });
      const first = await tx.taaviaBrandInfo.aggregate({ where: { tenantId: input.tenantId, brandId: input.brandId }, _min: { displayOrder: true } });
      const created = await tx.taaviaBrandInfo.create({ data: { id: newId(), tenantId: input.tenantId, brandId: input.brandId, type: input.type, title: fields.title, textContent: null, mediaAssetId: media.id, status: "ACTIVE", displayOrder: (first._min.displayOrder ?? 0) - 1, revision: BigInt(1), contentHash: calculateBrandInfoHash({ type: input.type, title: fields.title, mediaId: media.id, extension: fileInfo.extension, size: fileInfo.size }), createdBy: userId, updatedBy: userId, archivedAt: null, archivedBy: null, createdAt: now, updatedAt: now }, include: mediaInclude });
      await emitEvent(tx, "taavia-brand-info.source-created", created, now);
      return created;
    });
    return { item: dto(row), changed: true };
  } catch (error) {
    await removeBrandInfoMedia(stored.key).catch(() => undefined);
    throw error;
  }
}

export async function updateBrandInfo(userId: string, input: { tenantId: string; brandId: string; id: string; expectedRevision: unknown; type?: BrandInfoType; title?: string | null; textContent?: string | null; file?: File | null }): Promise<BrandInfoMutationResult> {
  const current = await authorizedItem(userId, input.tenantId, input.brandId, input.id, true);
  if (current.status !== "ACTIVE") throw new BrandInfoForbiddenError("منبع آرشیوشده قابل ویرایش نیست.");
  const expectedRevision = validateExpectedRevision(input.expectedRevision);
  const nextType = input.type ?? current.type;
  if (!isBrandInfoType(nextType)) throw new BrandInfoError("VALIDATION", "نوع منبع معتبر نیست.");
  const typeChanged = nextType !== current.type;
  const keepsCurrentMedia = nextType === current.type && Boolean(current.mediaAssetId) && !input.file;
  const fields = validateSourceFields(nextType, input.title ?? current.title, nextType === "TEXT" ? (input.textContent ?? current.textContent) : null, nextType !== "TEXT" && Boolean(input.file || keepsCurrentMedia));
  let stored: { key: string } | null = null;
  let newFileInfo: ReturnType<typeof validateUploadedFile> | null = null;
  if (nextType !== "TEXT" && input.file) {
    newFileInfo = validateUploadedFile(nextType, input.file);
    stored = await storeBrandInfoMedia(input.file);
  }
  if (typeChanged && nextType !== "TEXT" && !input.file) throw new BrandInfoError("VALIDATION", "برای تغییر نوع منبع، یک فایل جدید انتخاب کنید.");
  const now = new Date();
  try {
    const result = await prisma.$transaction(async (tx) => {
      const media = input.file && stored && newFileInfo ? await tx.mediaAsset.create({ data: { id: newId(), tenantId: input.tenantId, extension: newFileInfo.extension, sizeBytes: newFileInfo.size, mimeType: newFileInfo.mimeType, storageKey: stored.key, originalName: input.file.name, previewData: null, storageUrl: null, createdAt: now, updatedAt: now } }) : null;
      const mediaId = nextType === "TEXT" ? null : (media?.id ?? current.mediaAssetId);
      const mediaMeta = media ?? current.media;
      const hash = calculateBrandInfoHash({ type: nextType, title: fields.title, textContent: fields.textContent, mediaId, extension: mediaMeta?.extension, size: mediaMeta?.sizeBytes });
      const effective = hash !== current.contentHash || Boolean(media) || typeChanged || fields.title !== current.title || fields.textContent !== current.textContent;
      if (!effective) return { row: current, changed: false };
      const updated = await tx.taaviaBrandInfo.updateMany({ where: { id: input.id, tenantId: input.tenantId, brandId: input.brandId, revision: expectedRevision, status: "ACTIVE" }, data: { type: nextType, title: fields.title, textContent: nextType === "TEXT" ? fields.textContent : null, mediaAssetId: mediaId, contentHash: hash, revision: { increment: BigInt(1) }, updatedBy: userId, updatedAt: now } });
      if (updated.count !== 1) throw new BrandInfoConflictError(dto(await authorizedItem(userId, input.tenantId, input.brandId, input.id)));
      const row = await tx.taaviaBrandInfo.findUniqueOrThrow({ where: { id: input.id }, include: mediaInclude });
      await emitEvent(tx, "taavia-brand-info.source-content-changed", row, now);
      return { row, changed: true };
    });
    return { item: dto(result.row), changed: result.changed };
  } catch (error) {
    if (stored) await removeBrandInfoMedia(stored.key).catch(() => undefined);
    throw error;
  }
}

export async function archiveBrandInfo(userId: string, input: { tenantId: string; brandId: string; id: string; expectedRevision: unknown }) {
  return changeStatus(userId, input, "ARCHIVED");
}

export async function reactivateBrandInfo(userId: string, input: { tenantId: string; brandId: string; id: string; expectedRevision: unknown }) {
  return changeStatus(userId, input, "ACTIVE");
}

async function changeStatus(userId: string, input: { tenantId: string; brandId: string; id: string; expectedRevision: unknown }, status: "ACTIVE" | "ARCHIVED") {
  const current = await authorizedItem(userId, input.tenantId, input.brandId, input.id, true);
  const expectedRevision = validateExpectedRevision(input.expectedRevision);
  if (current.status === status) return { item: dto(current), changed: false };
  const now = new Date();
  const row = await prisma.$transaction(async (tx) => {
    const updated = await tx.taaviaBrandInfo.updateMany({ where: { id: input.id, tenantId: input.tenantId, brandId: input.brandId, revision: expectedRevision, status: current.status }, data: { status, archivedAt: status === "ARCHIVED" ? now : null, archivedBy: status === "ARCHIVED" ? userId : null, revision: { increment: BigInt(1) }, updatedAt: now, updatedBy: userId } });
    if (updated.count !== 1) throw new BrandInfoConflictError(dto(await authorizedItem(userId, input.tenantId, input.brandId, input.id)));
    const result = await tx.taaviaBrandInfo.findUniqueOrThrow({ where: { id: input.id }, include: mediaInclude });
    await emitEvent(tx, status === "ARCHIVED" ? "taavia-brand-info.source-archived" : "taavia-brand-info.source-reactivated", result, now);
    return result;
  });
  return { item: dto(row), changed: true };
}

export async function reorderBrandInfo(userId: string, input: { tenantId: string; brandId: string; ids: string[] }) {
  await authorizedBrand(userId, input.tenantId, input.brandId, true);
  if (new Set(input.ids).size !== input.ids.length) throw new BrandInfoForbiddenError("شناسه تکراری در ترتیب منابع مجاز نیست.");
  const rows = await prisma.taaviaBrandInfo.findMany({ where: { tenantId: input.tenantId, brandId: input.brandId, status: "ACTIVE" }, select: { id: true } });
  if (rows.length !== input.ids.length || rows.some((row) => !input.ids.includes(row.id))) throw new BrandInfoForbiddenError("همه منابع باید متعلق به همین برند باشند.");
  await prisma.$transaction(input.ids.map((id, index) => prisma.taaviaBrandInfo.update({ where: { id }, data: { displayOrder: index } })));
  return listBrandInfo(userId, input.tenantId, input.brandId);
}

export async function getBrandInfoMedia(userId: string, tenantId: string, brandId: string, id: string) {
  const item = await authorizedItem(userId, tenantId, brandId, id);
  if (!item.media?.storageKey) throw new BrandInfoNotFoundError("فایل رسانه‌ای پیدا نشد.");
  return { item, streamKey: item.media.storageKey, mimeType: item.media.mimeType ?? "application/octet-stream", size: item.media.sizeBytes ?? 0, name: item.media.originalName ?? `${id}.${item.media.extension ?? "bin"}` };
}
