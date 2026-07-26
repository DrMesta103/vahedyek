import { assertTenantAccess } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import type { KnowledgeBaseCategoriesPageData } from "@/app/lib/types/taavia-knowledge-base-categories";
import type { KnowledgeBaseOverview } from "@/app/lib/types/taavia-knowledge-base";
import type { KnowledgeBaseSourceSnapshot, KnowledgeBaseSourceSnapshotsPageData } from "@/app/lib/types/taavia-knowledge-base-source-snapshots";
import type { KnowledgeBaseSourceSnapshotDetailView, KnowledgeBaseSourceSimpleComparison } from "@/app/lib/types/taavia-knowledge-base-source-snapshots";
import type { TaaviaKnowledgeBaseVersionsOverview } from "@/app/lib/types/taavia-knowledge-base-versions";
import type { TaaviaBrandDetailsOverview } from "@/app/lib/types/taavia-brand-details-dashboard";

const formatDate = (value: Date) => new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "short", timeStyle: "short" }).format(value);
const sourceType = (value: string): KnowledgeBaseSourceSnapshot["sourceType"] => (({ TEXT: "BRAND_INFO", IMAGE: "IMAGE", FILE: "FILE", LINK: "LINK", PRODUCT: "PRODUCTS_SERVICES", FAQ: "FAQ" }) as const)[value as "TEXT" | "IMAGE" | "FILE" | "LINK" | "PRODUCT" | "FAQ"] ?? "BRAND_INFO";
export type InitialBuildReadModel = { id: string; status: string; progress: number; startedAt: string; sourceCount: number; failureMessage: string | null; steps: Array<{ key: string; label: string; status: string; progress: number; errorMessage: string | null }> };
const stepLabels: Record<string, string> = { PREPARATION: "آماده‌سازی", SOURCE_SNAPSHOT: "ثبت Snapshot منابع", CONTENT_PROCESSING: "پردازش محتوا", CATEGORY_GENERATION: "تولید دسته‌بندی‌ها", KNOWLEDGE_GENERATION: "تولید محتوای دانش", FINALIZATION: "نهایی‌سازی و فعال‌سازی" };

async function scopedBrand(userId: string, tenantId: string, brandId: string) {
  if (!(await assertTenantAccess(userId, tenantId))) return null;
  return prisma.taaviaBrand.findFirst({ where: { id: brandId, tenantId } });
}
export async function getInitialBuildReadModel(userId: string, businessId: string, brandId: string): Promise<InitialBuildReadModel | null> {
  if (!(await scopedBrand(userId, businessId, brandId))) return null;
  const build = await prisma.taaviaKnowledgeBaseBuild.findFirst({ where: { tenantId: businessId, brandId, status: { in: ["PENDING", "PROCESSING", "FAILED", "CANCELLED"] } }, include: { steps: { orderBy: { stepOrder: "asc" } } }, orderBy: { startedAt: "desc" } });
  if (!build) return null;
  return { id: build.id, status: build.status, progress: build.overallProgress, startedAt: formatDate(build.startedAt), sourceCount: Array.isArray(build.selectedSourceIds) ? build.selectedSourceIds.length : 0, failureMessage: build.failureMessage, steps: build.steps.map(step => ({ key: step.key, label: stepLabels[step.key], status: step.status, progress: step.progress, errorMessage: step.errorMessage })) };
}

export async function getKnowledgeBaseVersionsReadModel(userId: string, businessId: string, brandId: string): Promise<TaaviaKnowledgeBaseVersionsOverview | null> {
  if (!(await scopedBrand(userId, businessId, brandId))) return null;
  const versions = await prisma.taaviaKnowledgeBase.findMany({ where: { tenantId: businessId, brandId }, include: { build: true, _count: { select: { categories: true, snapshots: true } } }, orderBy: { versionNumber: "desc" } });
  return { businessId, brandId, versions: versions.map((item) => ({ knowledgeBaseId: item.id, businessId, brandId, versionLabel: item.versionLabel || `v${item.versionNumber}`, isActive: item.isActive, buildType: item.buildType === "INITIAL" ? "ساخت اولیه" : "بروزرسانی", buildId: item.build?.id ?? "", createdAt: formatDate(item.createdAt), categoryCount: item._count.categories, sourceSnapshotCount: item._count.snapshots, description: item.description ?? item.build?.description ?? "بدون توضیحات" })) };
}

export async function getTaaviaBrandDashboardReadModel(userId: string, businessId: string, brandId: string): Promise<TaaviaBrandDetailsOverview | null> {
  const versions = await getKnowledgeBaseVersionsReadModel(userId, businessId, brandId);
  if (!versions) return null;
  const [brandInfo, active] = await Promise.all([prisma.taaviaBrandInfo.count({ where: { tenantId: businessId, brandId, status: "ACTIVE" } }), prisma.taaviaKnowledgeBase.findFirst({ where: { tenantId: businessId, brandId, isActive: true } })]);
  return { businessId, brandId, website: "—", country: "—", industry: "—", currentSources: { brandInfo, productsServices: 0, faqs: 0, filesDocuments: 0, links: 0 }, knowledgeBases: versions.versions.map(({ businessId: _businessId, ...version }) => version), chatbot: { ready: Boolean(active), lastKnowledgeUpdatedAt: active ? formatDate(active.updatedAt) : "—" } };
}

export async function getKnowledgeBaseOverviewReadModel(userId: string, businessId: string, brandId: string): Promise<KnowledgeBaseOverview | null> {
  if (!(await scopedBrand(userId, businessId, brandId))) return null;
  const [active, liveBrandInfo] = await Promise.all([prisma.taaviaKnowledgeBase.findFirst({ where: { tenantId: businessId, brandId, isActive: true }, include: { build: true, _count: { select: { categories: true, snapshots: true } } } }), prisma.taaviaBrandInfo.count({ where: { tenantId: businessId, brandId, status: "ACTIVE" } })]);
  const snapshotRows = active ? await prisma.taaviaKnowledgeSourceSnapshot.findMany({ where: { tenantId: businessId, brandId, knowledgeBaseId: active.id } }) : [];
  const count = (kind: string) => snapshotRows.filter((row) => row.sourceType === kind).length;
  const base = { brandInfo: liveBrandInfo, productsAndServices: 0, faqs: 0, files: 0, links: 0, needsReview: 0 };
  const snapshotCounts = { brandInfo: count("TEXT"), productsAndServices: count("PRODUCT"), faqs: count("FAQ"), files: count("FILE") + count("IMAGE"), links: count("LINK"), needsReview: 0 };
  const createdAt = active?.createdAt ?? new Date();
  return { businessId, brandId, activeVersion: { version: active?.versionLabel || (active ? `v${active.versionNumber}` : "—"), buildType: active?.buildType === "INITIAL" ? "ساخت اولیه" : "بروزرسانی", createdAt: formatDate(createdAt), categoryCount: active?._count.categories ?? 0, subcategoryCount: 0, createdBy: "سیستم", health: "healthy" }, currentBrandSources: { ...base, updatedAt: formatDate(new Date()) }, activeVersionSources: { ...snapshotCounts, version: active?.versionLabel || "—", capturedAt: formatDate(createdAt) }, pendingChanges: { added: Math.max(liveBrandInfo - snapshotCounts.brandInfo, 0), edited: 0, removed: Math.max(snapshotCounts.brandInfo - liveBrandInfo, 0), total: Math.abs(liveBrandInfo - snapshotCounts.brandInfo) }, latestBuild: { buildType: active?.buildType === "INITIAL" ? "ساخت اولیه" : "بروزرسانی", status: "successful", generatedVersion: active?.versionLabel || "—", sourceCount: snapshotRows.length, startedAt: active?.build ? formatDate(active.build.startedAt) : "—", finishedAt: active?.build?.finishedAt ? formatDate(active.build.finishedAt) : "—" }, output: { categoryCount: active?._count.categories ?? 0, subcategoryCount: 0 }, health: { sourceCompleteness: active ? 100 : 0, contentQuality: active ? 100 : 0 } };
}

export async function getKnowledgeBaseSourcesReadModel(userId: string, businessId: string, brandId: string): Promise<KnowledgeBaseSourceSnapshotsPageData | null> {
  if (!(await scopedBrand(userId, businessId, brandId))) return null;
  const active = await prisma.taaviaKnowledgeBase.findFirst({ where: { tenantId: businessId, brandId, isActive: true }, include: { build: true } });
  if (!active) return { businessId, brandId, knowledgeBaseId: "", summary: { total: 0, typeCounts: [] }, snapshots: [] };
  const rows = await prisma.taaviaKnowledgeSourceSnapshot.findMany({ where: { tenantId: businessId, brandId, knowledgeBaseId: active.id }, orderBy: { snapshotCreatedAt: "desc" } });
  const snapshots = rows.map((row) => ({ snapshotId: row.id, knowledgeBaseId: active.id, originalBrandSourceId: row.originalSourceId ?? row.originalBrandInfoId, sourceType: sourceType(row.sourceType), sourceGroup: row.sourceGroup as KnowledgeBaseSourceSnapshot["sourceGroup"], title: row.title, snapshotReference: row.id, snapshotCreatedAt: formatDate(row.snapshotCreatedAt), buildId: row.buildId ?? active.build?.id, buildLabel: active.versionLabel || `v${active.versionNumber}`, comparisonStatus: "UNCHANGED" as const, currentBrandSourceExists: true, ...(row.sourceType === "IMAGE" || row.sourceType === "FILE" ? { fileSnapshot: { fileType: row.mimeType ?? row.fileType ?? "application/octet-stream", fileSize: row.fileSizeBytes ? `${(row.fileSizeBytes / 1024 / 1024).toFixed(2)} MB` : "—", extractionStatus: row.extractedText ? ("EXTRACTED" as const) : ("UNAVAILABLE" as const), extractedWordCount: row.extractedWordCount ?? 0, previewUrl: row.previewUrl, extractedText: row.extractedText ? [row.extractedText] : [] } } : {}) }));
  return {
    businessId,
    brandId,
    knowledgeBaseId: active.id,
    summary: {
      total: snapshots.length,
      typeCounts: Object.entries(
        snapshots.reduce<Record<string, number>>((acc, row) => {
          acc[row.sourceType] = (acc[row.sourceType] ?? 0) + 1;
          return acc;
        }, {}),
      ).map(([type, count]) => ({ type: type as KnowledgeBaseSourceSnapshot["sourceType"], count })),
    },
    snapshots,
  };
}

export async function getKnowledgeBaseCategoriesReadModel(userId: string, businessId: string, brandId: string): Promise<KnowledgeBaseCategoriesPageData | null> {
  if (!(await scopedBrand(userId, businessId, brandId))) return null;
  const active = await prisma.taaviaKnowledgeBase.findFirst({ where: { tenantId: businessId, brandId, isActive: true } });
  if (!active) return { businessId, brandId, knowledgeBaseId: "", activeVersionLabel: "—", updatedAt: "—", categories: [] };
  const rows = await prisma.taaviaKnowledgeCategory.findMany({ where: { tenantId: businessId, brandId, knowledgeBaseId: active.id }, include: { sourceReferences: { include: { snapshot: true } }, _count: { select: { children: true } } }, orderBy: [{ level: "asc" }, { title: "asc" }] });
  return { businessId, brandId, knowledgeBaseId: active.id, activeVersionLabel: active.versionLabel || `v${active.versionNumber}`, updatedAt: formatDate(active.updatedAt), categories: rows.map((row) => ({ categoryId: row.id, knowledgeBaseId: active.id, businessId, brandId, title: row.title, slug: row.slug, level: row.level as 1 | 2, parentCategoryId: row.parentCategoryId, childCount: row._count.children, content: [row.content], createdAt: formatDate(row.createdAt), updatedAt: formatDate(row.updatedAt), sources: row.sourceReferences.map((ref) => ({ sourceSnapshotId: ref.snapshotId, originalBrandSourceId: ref.snapshot.originalSourceId ?? ref.snapshot.originalBrandInfoId, title: ref.snapshot.title, sourceType: ref.snapshot.sourceType === "IMAGE" ? "PNG" : ref.snapshot.sourceType === "LINK" ? "URL" : "DOCX", snapshotLabel: active.versionLabel || `v${active.versionNumber}`, usedAt: formatDate(ref.usedAt), previewRoute: `/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base/sources/${ref.snapshotId}` })) })) };
}

export async function getKnowledgeBaseSnapshotDetailReadModel(userId: string, businessId: string, brandId: string, snapshotId: string): Promise<KnowledgeBaseSourceSnapshotDetailView | null> {
  if (!(await scopedBrand(userId, businessId, brandId))) return null;
  const row = await prisma.taaviaKnowledgeSourceSnapshot.findFirst({ where: { id: snapshotId, tenantId: businessId, brandId }, include: { knowledgeBase: { include: { build: true } } } });
  if (!row) return null;
  const kb = row.knowledgeBase;
  const fileMode = row.sourceType === "IMAGE" || row.sourceType === "FILE";
  const base = { snapshotId: row.id, knowledgeBaseId: kb.id, businessId, brandId, originalBrandSourceId: row.originalSourceId ?? row.originalBrandInfoId, sourceType: sourceType(row.sourceType), sourceGroup: row.sourceGroup as KnowledgeBaseSourceSnapshot["sourceGroup"], title: row.title, snapshotReference: row.id, snapshotCreatedAt: formatDate(row.snapshotCreatedAt), buildId: row.buildId ?? kb.build?.id ?? "", buildLabel: kb.versionLabel || `v${kb.versionNumber}`, comparisonStatus: "UNCHANGED" as const, currentBrandSourceExists: true, content: row.content ? [row.content] : row.extractedText ? [row.extractedText] : [], lastComparedAt: null, metadata: { contentType: row.mimeType ?? "text/plain", sourceGroup: row.sourceGroup, contentLanguage: "fa", wordCount: row.extractedWordCount ?? row.content?.split(/\s+/).length ?? 0, characterCount: (row.content ?? row.extractedText ?? "").length, originalBrandSourceIdentifier: row.originalSourceId ?? row.originalBrandInfoId } };
  if (!fileMode) return { ...base, detailMode: "TEXT" };
  const file = { fileType: row.mimeType ?? row.fileType ?? "application/octet-stream", fileSize: row.fileSizeBytes ? `${(row.fileSizeBytes / 1024 / 1024).toFixed(2)} MB` : "—", extractionStatus: row.extractedText ? ("EXTRACTED" as const) : ("UNAVAILABLE" as const), extractedWordCount: row.extractedWordCount ?? 0, previewUrl: row.previewUrl, extractedText: row.extractedText ? [row.extractedText] : [] };
  return { ...base, detailMode: "FILE", file, fileSnapshot: file };
}

export async function getKnowledgeBaseSnapshotComparisonReadModel(userId: string, businessId: string, brandId: string, snapshotId: string): Promise<KnowledgeBaseSourceSimpleComparison | null> {
  const detail = await getKnowledgeBaseSnapshotDetailReadModel(userId, businessId, brandId, snapshotId);
  if (!detail) return null;
  return { businessId, brandId, snapshotId: detail.snapshotId, originalBrandSourceId: detail.originalBrandSourceId, title: detail.title, sourceType: detail.sourceType, snapshotContent: detail.content, snapshotCreatedAt: detail.snapshotCreatedAt, buildId: detail.buildId, buildLabel: detail.buildLabel, currentSourceContent: detail.currentBrandSourceExists ? detail.content : null, currentSourceUpdatedAt: null, currentSourceExists: detail.currentBrandSourceExists, comparisonStatus: "UNCHANGED" };
}
