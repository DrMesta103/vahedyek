"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/app/lib/session";
import { archiveBrandInfo, getBrandInfo, reactivateBrandInfo, reorderBrandInfo } from "@/app/lib/brand-info/service";
import { assertTenantAccess } from "@/app/lib/auth";
import { ACTIVE_BUILD_SOURCE_LOCK_MESSAGE, assertNoActiveBuild } from "@/app/lib/taavia-active-build";
import { prisma } from "@/app/lib/prisma";

type Input = { businessId: string; brandId: string; sourceId: string; sourceType: "brand_info" | "knowledge" | "product" | "faq"; revision: string; nextStatus: "ACTIVE" | "ARCHIVED" };
export async function changeBrandSourceStatus(input: Input): Promise<{ ok: true; message?: undefined } | { ok: false; message: string }> {
  const session = await requireSession();
  if (!(await assertTenantAccess(session.userId, input.businessId))) return { ok: false, message: "دسترسی مجاز نیست." };
  const brand = await prisma.taaviaBrand.findFirst({ where: { id: input.brandId, tenantId: input.businessId }, select: { id: true } });
  if (!brand) return { ok: false, message: "برند پیدا نشد." };
  try {
    await assertNoActiveBuild(input.businessId, input.brandId);
    if (input.sourceType === "brand_info") {
      if (input.nextStatus === "ARCHIVED") await archiveBrandInfo(session.userId, { tenantId: input.businessId, brandId: input.brandId, id: input.sourceId, expectedRevision: input.revision });
      else await reactivateBrandInfo(session.userId, { tenantId: input.businessId, brandId: input.brandId, id: input.sourceId, expectedRevision: input.revision });
    } else {
      const where = { id: input.sourceId, tenantId: input.businessId, brandId: input.brandId, revision: BigInt(input.revision) };
      const data = { status: input.nextStatus, archivedAt: input.nextStatus === "ARCHIVED" ? new Date() : null, archivedBy: input.nextStatus === "ARCHIVED" ? session.userId : null, updatedAt: new Date(), updatedBy: session.userId, revision: { increment: BigInt(1) } };
      const result = input.sourceType === "knowledge" ? await prisma.taaviaBrandKnowledge.updateMany({ where, data }) : input.sourceType === "product" ? await prisma.taaviaBrandProduct.updateMany({ where, data }) : await prisma.taaviaBrandFaq.updateMany({ where, data });
      if (result.count !== 1) return { ok: false, message: "منبع تغییر کرده یا در دسترس نیست." };
    }
    const base = `/businesses/${input.businessId}/products/taavia/brands/${input.brandId}`;
    revalidatePath(`${base}/sources`);
    revalidatePath(base);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "ذخیرهٔ تغییر وضعیت انجام نشد.";
    return { ok: false, message: message === ACTIVE_BUILD_SOURCE_LOCK_MESSAGE ? message : "ذخیرهٔ تغییر وضعیت انجام نشد." };
  }
}

type SourceInput = { businessId: string; brandId: string; sourceId: string };
export async function getBrandSourceDetails(input: SourceInput) {
  const session = await requireSession();
  try { return await getBrandInfo(session.userId, input.businessId, input.brandId, input.sourceId); } catch {
    if (!(await assertTenantAccess(session.userId, input.businessId))) throw new Error("دسترسی مجاز نیست.");
    const source = await prisma.taaviaBrandKnowledge.findFirst({ where: { id: input.sourceId, tenantId: input.businessId, brandId: input.brandId } });
    if (!source) throw new Error("منبع پیدا نشد.");
    return { id: source.id, type: "TEXT" as const, title: source.title, textContent: source.content, media: null, status: source.status, displayOrder: source.sortOrder, revision: source.revision.toString(), createdBy: source.createdBy, updatedBy: source.updatedBy, archivedAt: source.archivedAt?.toISOString() ?? null, archivedBy: source.archivedBy, createdAt: source.createdAt.toISOString(), updatedAt: source.updatedAt.toISOString() };
  }
}

export async function getBrandSourceUsageHistory(input: SourceInput) {
  const session = await requireSession();
  if (!(await assertTenantAccess(session.userId, input.businessId))) throw new Error("دسترسی مجاز نیست.");
  const brand = await prisma.taaviaBrand.findFirst({ where: { id: input.brandId, tenantId: input.businessId }, select: { id: true } });
  if (!brand) throw new Error("برند پیدا نشد.");
  const current = await prisma.taaviaBrandInfo.findFirst({ where: { id: input.sourceId, tenantId: input.businessId, brandId: input.brandId }, select: { contentHash: true } }) ?? await prisma.taaviaBrandKnowledge.findFirst({ where: { id: input.sourceId, tenantId: input.businessId, brandId: input.brandId }, select: { contentHash: true } });
  if (!current) throw new Error("منبع پیدا نشد.");
  const snapshots = await prisma.taaviaKnowledgeSourceSnapshot.findMany({
    where: { tenantId: input.businessId, brandId: input.brandId, OR: [{ originalSourceId: input.sourceId }, { originalBrandInfoId: input.sourceId }] },
    include: { knowledgeBase: { include: { build: true } } }, orderBy: { snapshotCreatedAt: "desc" },
  });
  return snapshots.map((snapshot) => ({ snapshotId: snapshot.id, versionLabel: snapshot.knowledgeBase.versionLabel || `v${snapshot.knowledgeBase.versionNumber}`, knowledgeBaseId: snapshot.knowledgeBaseId, active: snapshot.knowledgeBase.isActive, buildType: snapshot.knowledgeBase.buildType, completedAt: snapshot.knowledgeBase.build?.completedAt?.toISOString() ?? snapshot.knowledgeBase.build?.finishedAt?.toISOString() ?? null, snapshotCreatedAt: snapshot.snapshotCreatedAt.toISOString(), contentType: snapshot.sourceType, changed: Boolean(snapshot.contentHash && snapshot.contentHash !== current.contentHash) }));
}

export async function reorderBrandKnowledgeSources(input: { businessId: string; brandId: string; ids: string[] }): Promise<{ ok: true; message?: undefined } | { ok: false; message: string }> {
  const session = await requireSession();
  try {
    await assertNoActiveBuild(input.businessId, input.brandId);
    await reorderBrandInfo(session.userId, { tenantId: input.businessId, brandId: input.brandId, ids: input.ids });
    const base = `/businesses/${input.businessId}/products/taavia/brands/${input.brandId}`;
    revalidatePath(`${base}/sources`); revalidatePath(base);
    return { ok: true };
  } catch (error) { return { ok: false, message: error instanceof Error ? error.message : "ذخیره ترتیب انجام نشد." }; }
}
