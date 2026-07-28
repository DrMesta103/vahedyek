import { prisma } from "@/app/lib/prisma";
import { ACTIVE_BUILD_EXISTS_MESSAGE, findActiveBuild } from "@/app/lib/taavia-active-build";
import { compareKnowledgeBaseSources, getActiveBrandKnowledgeSources, type KnowledgeBaseBuildSource } from "@/app/lib/taavia-knowledge-base-synchronization";
import type { Prisma } from "@/app/lib/prisma-client";

export const BUILD_STEPS = [
  ["PREPARATION", "آماده‌سازی", 10], ["SOURCE_SNAPSHOT", "ثبت Snapshot منابع", 25],
  ["CONTENT_PROCESSING", "پردازش محتوا", 45], ["CATEGORY_GENERATION", "تولید دسته‌بندی‌ها", 65],
  ["KNOWLEDGE_GENERATION", "تولید محتوای دانش", 85], ["FINALIZATION", "نهایی‌سازی و فعال‌سازی", 100],
] as const;
type StepKey = (typeof BUILD_STEPS)[number][0];
type BuildType = "INITIAL" | "UPDATE" | "FULL_REBUILD";
type Tx = Prisma.TransactionClient;

export const MAX_KNOWLEDGE_BASE_VERSIONS = 5;

async function createBuild(input: { tenantId: string; brandId: string; userId: string; buildType: BuildType }) {
  if (await findActiveBuild(input.tenantId, input.brandId)) throw new Error(ACTIVE_BUILD_EXISTS_MESSAGE);
  const selected = await getActiveBrandKnowledgeSources(input.tenantId, input.brandId);
  if (!selected.length) throw new Error("برای ساخت Knowledge Base حداقل یک منبع فعال لازم است.");
  try {
    return await prisma.taaviaKnowledgeBaseBuild.create({ data: {
      tenantId: input.tenantId, brandId: input.brandId, buildType: input.buildType, status: "PROCESSING", overallProgress: 10,
      selectedSourceIds: selected.map((source) => source.id), selectedSources: selected, createdByUserId: input.userId,
      steps: { create: BUILD_STEPS.map(([key, _label, progress], index) => ({ key, stepOrder: index + 1, status: index === 0 ? "IN_PROGRESS" : "PENDING", progress: index === 0 ? progress : 0, startedAt: index === 0 ? new Date() : null })) },
    }, include: { steps: { orderBy: { stepOrder: "asc" } } } });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") throw new Error(ACTIVE_BUILD_EXISTS_MESSAGE);
    throw error;
  }
}

export async function startInitialKnowledgeBuild(input: { tenantId: string; brandId: string; userId: string }) {
  const brand = await prisma.taaviaBrand.findFirst({ where: { id: input.brandId, tenantId: input.tenantId } });
  if (!brand) throw new Error("برند پیدا نشد.");
  if (await prisma.taaviaKnowledgeBase.findFirst({ where: { tenantId: input.tenantId, brandId: input.brandId } })) throw new Error("برای این برند Knowledge Base از قبل وجود دارد.");
  return createBuild({ ...input, buildType: "INITIAL" });
}

export async function startUpdateKnowledgeBuild(input: { tenantId: string; brandId: string; userId: string; force?: boolean }) {
  const activeKnowledgeBase = await prisma.taaviaKnowledgeBase.findFirst({ where: { tenantId: input.tenantId, brandId: input.brandId, isActive: true }, include: { snapshots: true } });
  if (!activeKnowledgeBase) throw new Error("نسخهٔ فعال Knowledge Base پیدا نشد.");
  if (!input.force) {
    const currentSources = await getActiveBrandKnowledgeSources(input.tenantId, input.brandId);
    if (compareKnowledgeBaseSources(currentSources, activeKnowledgeBase.snapshots).isSynchronized) {
      throw new Error("منابع فعلی برند با نسخهٔ فعال یکسان‌اند و نیازی به بروزرسانی نیست.");
    }
  }
  return createBuild({ ...input, buildType: "UPDATE" });
}

export async function startRebuildKnowledgeBuild(input: { tenantId: string; brandId: string; userId: string }) {
  const activeKnowledgeBase = await prisma.taaviaKnowledgeBase.findFirst({
    where: { tenantId: input.tenantId, brandId: input.brandId, isActive: true },
    select: { id: true },
  });
  if (!activeKnowledgeBase) throw new Error("نسخهٔ فعال Knowledge Base پیدا نشد.");
  return createBuild({ ...input, buildType: "FULL_REBUILD" });
}

function selectedSources(value: unknown, tenantId: string, brandId: string, ids: unknown) {
  if (Array.isArray(value)) return Promise.resolve(value.filter((item): item is KnowledgeBaseBuildSource => Boolean(item && typeof item === "object" && typeof (item as { id?: unknown }).id === "string" && typeof (item as { title?: unknown }).title === "string" && typeof (item as { content?: unknown }).content === "string" && typeof (item as { contentHash?: unknown }).contentHash === "string" && ["TEXT", "PRODUCT", "FAQ"].includes((item as { type?: string }).type ?? "") && ["brand_info", "knowledge", "products_services", "faq"].includes((item as { sourceGroup?: string }).sourceGroup ?? ""))));
  return getActiveBrandKnowledgeSources(tenantId, brandId).then((sources) => sources.filter((source) => Array.isArray(ids) && ids.includes(source.id)));
}

async function clearKnowledgeBaseContent(tx: Tx, knowledgeBaseId: string) {
  const categoryIds = (
    await tx.taaviaKnowledgeCategory.findMany({ where: { knowledgeBaseId }, select: { id: true } })
  ).map((item) => item.id);
  if (categoryIds.length) {
    await tx.taaviaKnowledgeCategorySourceReference.deleteMany({ where: { categoryId: { in: categoryIds } } });
  }
  await tx.taaviaKnowledgeCategory.deleteMany({ where: { knowledgeBaseId, level: 2 } });
  await tx.taaviaKnowledgeCategory.deleteMany({ where: { knowledgeBaseId, level: 1 } });
  await tx.taaviaKnowledgeSourceSnapshot.deleteMany({ where: { knowledgeBaseId } });
}

async function deleteKnowledgeBaseVersionSafe(tx: Tx, knowledgeBaseId: string) {
  const linkedBuilds = await tx.taaviaKnowledgeBaseBuild.findMany({
    where: { knowledgeBaseId },
    select: { id: true },
  });
  await tx.taaviaKnowledgeBaseBuild.updateMany({ where: { knowledgeBaseId }, data: { knowledgeBaseId: null } });
  await clearKnowledgeBaseContent(tx, knowledgeBaseId);
  if (linkedBuilds.length) {
    await tx.taaviaKnowledgeBaseBuild.deleteMany({ where: { id: { in: linkedBuilds.map((item) => item.id) } } });
  }
  await tx.taaviaKnowledgeBase.delete({ where: { id: knowledgeBaseId } });
}

async function pruneOldKnowledgeBaseVersions(tx: Tx, tenantId: string, brandId: string) {
  const versions = await tx.taaviaKnowledgeBase.findMany({
    where: { tenantId, brandId },
    orderBy: { versionNumber: "asc" },
    select: { id: true, isActive: true },
  });
  if (versions.length <= MAX_KNOWLEDGE_BASE_VERSIONS) return;
  const excess = versions.length - MAX_KNOWLEDGE_BASE_VERSIONS;
  const toDelete = versions.filter((item) => !item.isActive).slice(0, excess);
  for (const version of toDelete) {
    await deleteKnowledgeBaseVersionSafe(tx, version.id);
  }
}

async function attachBuildOutputsToKnowledgeBase(tx: Tx, buildId: string, tenantId: string, brandId: string, knowledgeBaseId: string) {
  await tx.taaviaKnowledgeSourceSnapshot.updateMany({ where: { tenantId, brandId, buildId }, data: { knowledgeBaseId } });
  await tx.taaviaKnowledgeCategory.updateMany({
    where: { tenantId, brandId, buildId },
    data: { knowledgeBaseId },
  });
  await tx.taaviaKnowledgeCategorySourceReference.updateMany({
    where: { tenantId, brandId, buildId },
    data: { knowledgeBaseId },
  });
}

async function executeStep(buildId: string, key: StepKey) {
  const build = await prisma.taaviaKnowledgeBaseBuild.findUniqueOrThrow({ where: { id: buildId } });
  if (key === "SOURCE_SNAPSHOT") {
    const selected = await selectedSources(build.selectedSources, build.tenantId, build.brandId, build.selectedSourceIds);
    await prisma.taaviaKnowledgeSourceSnapshot.createMany({ data: selected.map((source) => ({ tenantId: build.tenantId, brandId: build.brandId, buildId, originalSourceId: source.id, originalBrandInfoId: source.sourceGroup === "brand_info" ? source.id : null, sourceGroup: source.sourceGroup, sourceType: source.type, title: source.title, content: source.content, contentHash: source.contentHash, extractedText: null, extractedWordCount: 0 })) });
  }
  if (key === "CONTENT_PROCESSING") {
    const rows = await prisma.taaviaKnowledgeSourceSnapshot.findMany({ where: { tenantId: build.tenantId, brandId: build.brandId, buildId } });
    await Promise.all(rows.map((row) => { const extracted = row.sourceType === "TEXT" ? row.content?.replace(/\s+/g, " ").trim() : `محتوای استخراج‌شده از ${row.title}: ${(row.content ?? "").replace(/\s+/g, " ").trim()}`; return prisma.taaviaKnowledgeSourceSnapshot.update({ where: { id: row.id }, data: { extractedText: extracted, extractedWordCount: extracted.split(/\s+/).filter(Boolean).length } }); }));
  }
  if (key === "CATEGORY_GENERATION") {
    const rows = await prisma.taaviaKnowledgeSourceSnapshot.findMany({ where: { tenantId: build.tenantId, brandId: build.brandId, buildId }, orderBy: { title: "asc" } });
    for (const row of rows) { const slug = `source-${row.id}`; const parent = await prisma.taaviaKnowledgeCategory.create({ data: { tenantId: build.tenantId, brandId: build.brandId, buildId, title: row.title.slice(0, 80), slug, level: 1, content: row.extractedText ?? row.content ?? "", sourceReferences: { create: { snapshotId: row.id, tenantId: build.tenantId, brandId: build.brandId, buildId } } } }); await prisma.taaviaKnowledgeCategory.create({ data: { tenantId: build.tenantId, brandId: build.brandId, buildId, parentCategoryId: parent.id, title: `جزئیات ${row.title.slice(0, 60)}`, slug: `${slug}-details`, level: 2, content: row.extractedText ?? row.content ?? "", sourceReferences: { create: { snapshotId: row.id, tenantId: build.tenantId, brandId: build.brandId, buildId } } } }); }
  }
  if (key === "FINALIZATION") {
    await prisma.$transaction(async (tx) => {
      const active = await tx.taaviaKnowledgeBase.findFirst({ where: { tenantId: build.tenantId, brandId: build.brandId, isActive: true } });

      if (build.buildType === "FULL_REBUILD") {
        if (!active) throw new Error("برای ریبلد، نسخهٔ فعال Knowledge Base لازم است.");
        await tx.taaviaKnowledgeBaseBuild.updateMany({ where: { knowledgeBaseId: active.id }, data: { knowledgeBaseId: null } });
        await clearKnowledgeBaseContent(tx, active.id);
        await attachBuildOutputsToKnowledgeBase(tx, buildId, build.tenantId, build.brandId, active.id);
        await tx.taaviaKnowledgeBase.update({
          where: { id: active.id },
          data: { buildType: "FULL_REBUILD", updatedAt: new Date() },
        });
        await tx.taaviaKnowledgeBaseBuild.update({
          where: { id: buildId },
          data: { knowledgeBaseId: active.id, status: "COMPLETED", overallProgress: 100, completedAt: new Date(), finishedAt: new Date() },
        });
        return;
      }

      if (build.buildType === "INITIAL" && active) throw new Error("Knowledge Base فعال از قبل وجود دارد.");
      if (build.buildType === "UPDATE" && !active) throw new Error("برای بروزرسانی، نسخهٔ فعال Knowledge Base لازم است.");
      const latest = await tx.taaviaKnowledgeBase.aggregate({ where: { tenantId: build.tenantId, brandId: build.brandId }, _max: { versionNumber: true } });
      const versionNumber = (latest._max.versionNumber ?? 0) + 1;
      const kb = await tx.taaviaKnowledgeBase.create({ data: { tenantId: build.tenantId, brandId: build.brandId, versionNumber, versionLabel: `v${versionNumber}`, isActive: false, buildType: build.buildType, createdByUserId: build.createdByUserId, activatedByUserId: build.createdByUserId, activatedAt: new Date() } });
      await attachBuildOutputsToKnowledgeBase(tx, buildId, build.tenantId, build.brandId, kb.id);
      await tx.taaviaKnowledgeBase.updateMany({ where: { tenantId: build.tenantId, brandId: build.brandId, isActive: true }, data: { isActive: false } });
      await tx.taaviaKnowledgeBase.update({ where: { id: kb.id }, data: { isActive: true } });
      await tx.taaviaKnowledgeBaseBuild.update({ where: { id: buildId }, data: { knowledgeBaseId: kb.id, status: "COMPLETED", overallProgress: 100, completedAt: new Date(), finishedAt: new Date() } });
      if (build.buildType === "UPDATE") {
        await pruneOldKnowledgeBaseVersions(tx, build.tenantId, build.brandId);
      }
    });
  }
}

export async function advanceInitialKnowledgeBuild(buildId: string) { const build = await prisma.taaviaKnowledgeBaseBuild.findUniqueOrThrow({ where: { id: buildId }, include: { steps: { orderBy: { stepOrder: "asc" } } } }); if (build.status !== "PROCESSING") throw new Error("Build در حال پردازش نیست."); const current = build.steps.find((step) => step.status === "IN_PROGRESS"); if (!current) throw new Error("مرحلهٔ فعالی وجود ندارد."); await executeStep(buildId, current.key); const next = build.steps.find((step) => step.stepOrder === current.stepOrder + 1); await prisma.$transaction([prisma.taaviaKnowledgeBaseBuildStep.update({ where: { id: current.id }, data: { status: "COMPLETED", progress: BUILD_STEPS[current.stepOrder - 1][2], completedAt: new Date(), errorCode: null, errorMessage: null } }), ...(next ? [prisma.taaviaKnowledgeBaseBuildStep.update({ where: { id: next.id }, data: { status: "IN_PROGRESS", progress: BUILD_STEPS[next.stepOrder - 1][2], startedAt: new Date() } }), prisma.taaviaKnowledgeBaseBuild.update({ where: { id: buildId }, data: { overallProgress: BUILD_STEPS[next.stepOrder - 1][2] } })] : [])]); }
export async function failInitialKnowledgeBuild(buildId: string) { const current = await prisma.taaviaKnowledgeBaseBuildStep.findFirstOrThrow({ where: { buildId, status: "IN_PROGRESS" } }); await prisma.$transaction([prisma.taaviaKnowledgeBaseBuildStep.update({ where: { id: current.id }, data: { status: "FAILED", failedAt: new Date(), errorCode: "SIMULATED_FAILURE", errorMessage: "شکست شبیه‌سازی‌شده مرحلهٔ فعلی" } }), prisma.taaviaKnowledgeBaseBuild.update({ where: { id: buildId }, data: { status: "FAILED", failedAt: new Date(), failureCode: "SIMULATED_FAILURE", failureMessage: "شکست شبیه‌سازی‌شده مرحلهٔ فعلی" } })]); }
export async function retryInitialKnowledgeBuild(buildId: string) { const failed = await prisma.taaviaKnowledgeBaseBuildStep.findFirstOrThrow({ where: { buildId, status: "FAILED" } }); await prisma.$transaction([prisma.taaviaKnowledgeBaseBuildStep.update({ where: { id: failed.id }, data: { status: "IN_PROGRESS", failedAt: null, errorCode: null, errorMessage: null, startedAt: new Date() } }), prisma.taaviaKnowledgeBaseBuild.update({ where: { id: buildId }, data: { status: "PROCESSING", failedAt: null, failureCode: null, failureMessage: null, attemptCount: { increment: 1 } } })]); }
export async function cancelInitialKnowledgeBuild(buildId: string) { await prisma.taaviaKnowledgeBaseBuild.update({ where: { id: buildId }, data: { status: "CANCELLED", finishedAt: new Date() } }); }
export async function completeInitialKnowledgeBuild(buildId: string) { for (let index = 0; index < BUILD_STEPS.length; index += 1) { const build = await prisma.taaviaKnowledgeBaseBuild.findUniqueOrThrow({ where: { id: buildId }, select: { status: true } }); if (build.status === "COMPLETED") return; await advanceInitialKnowledgeBuild(buildId); } }
export async function resetInitialKnowledgeBuild(buildId: string) { const build = await prisma.taaviaKnowledgeBaseBuild.findUniqueOrThrow({ where: { id: buildId }, select: { status: true, knowledgeBaseId: true, tenantId: true, brandId: true } }); if (build.status === "COMPLETED" || build.knowledgeBaseId) throw new Error("بازنشانی Build تکمیل‌شده مجاز نیست."); const snapshotIds = (await prisma.taaviaKnowledgeSourceSnapshot.findMany({ where: { tenantId: build.tenantId, brandId: build.brandId, buildId }, select: { id: true } })).map((item) => item.id); await prisma.$transaction([prisma.taaviaKnowledgeCategorySourceReference.deleteMany({ where: { snapshotId: { in: snapshotIds } } }), prisma.taaviaKnowledgeCategory.deleteMany({ where: { tenantId: build.tenantId, brandId: build.brandId, buildId, knowledgeBaseId: null } }), prisma.taaviaKnowledgeSourceSnapshot.deleteMany({ where: { id: { in: snapshotIds } } }), prisma.taaviaKnowledgeBaseBuild.delete({ where: { id: buildId } })]); }
