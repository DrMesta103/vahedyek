import { createHash } from "node:crypto";
import { prisma } from "@/app/lib/prisma";

export const BUILD_STEPS = [
  ["PREPARATION", "آماده‌سازی", 10], ["SOURCE_SNAPSHOT", "ثبت Snapshot منابع", 25],
  ["CONTENT_PROCESSING", "پردازش محتوا", 45], ["CATEGORY_GENERATION", "تولید دسته‌بندی‌ها", 65],
  ["KNOWLEDGE_GENERATION", "تولید محتوای دانش", 85], ["FINALIZATION", "نهایی‌سازی و فعال‌سازی", 100],
] as const;
type StepKey = (typeof BUILD_STEPS)[number][0];
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

async function sources(tenantId: string, brandId: string) {
  const [info, knowledge, products, faqs] = await Promise.all([
    prisma.taaviaBrandInfo.findMany({ where: { tenantId, brandId, status: "ACTIVE" } }),
    prisma.taaviaBrandKnowledge.findMany({ where: { tenantId, brandId, status: "ACTIVE" } }),
    prisma.taaviaBrandProduct.findMany({ where: { tenantId, brandId, status: "ACTIVE" } }),
    prisma.taaviaBrandFaq.findMany({ where: { tenantId, brandId, status: "ACTIVE" } }),
  ]);
  return [
    ...info.map(x => ({ id: x.id, title: x.title, content: x.textContent ?? "", type: "TEXT" as const })),
    ...knowledge.map(x => ({ id: x.id, title: x.title, content: x.content, type: "TEXT" as const })),
    ...products.map(x => ({ id: x.id, title: x.name, content: `${x.shortDescription ?? ""}\n${x.fullDescription}`, type: "PRODUCT" as const })),
    ...faqs.map(x => ({ id: x.id, title: x.question, content: `${x.question}\n${x.answer}`, type: "FAQ" as const })),
  ];
}

export async function startInitialKnowledgeBuild(input: { tenantId: string; brandId: string; userId: string }) {
  const brand = await prisma.taaviaBrand.findFirst({ where: { id: input.brandId, tenantId: input.tenantId } });
  if (!brand) throw new Error("برند پیدا نشد.");
  if (await prisma.taaviaKnowledgeBase.findFirst({ where: { tenantId: input.tenantId, brandId: input.brandId } })) throw new Error("برای این برند Knowledge Base از قبل وجود دارد.");
  if (await prisma.taaviaKnowledgeBaseBuild.findFirst({ where: { tenantId: input.tenantId, brandId: input.brandId, status: { in: ["PENDING", "PROCESSING"] } } })) throw new Error("یک Build فعال برای این برند وجود دارد.");
  const selected = await sources(input.tenantId, input.brandId);
  if (!selected.length) throw new Error("برای ساخت Knowledge Base حداقل یک منبع فعال لازم است.");
  try {
    return await prisma.taaviaKnowledgeBaseBuild.create({ data: {
      tenantId: input.tenantId, brandId: input.brandId, buildType: "INITIAL", status: "PROCESSING", overallProgress: 10,
      selectedSourceIds: selected.map(x => x.id), selectedSources: selected, createdByUserId: input.userId,
      steps: { create: BUILD_STEPS.map(([key, _label, progress], index) => ({ key, stepOrder: index + 1, status: index === 0 ? "IN_PROGRESS" : "PENDING", progress: index === 0 ? progress : 0, startedAt: index === 0 ? new Date() : null })) },
    }, include: { steps: { orderBy: { stepOrder: "asc" } } } });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") throw new Error("یک Build فعال برای این برند وجود دارد.");
    throw error;
  }
}

async function executeStep(buildId: string, key: StepKey) {
  const build = await prisma.taaviaKnowledgeBaseBuild.findUniqueOrThrow({ where: { id: buildId } });
  if (key === "SOURCE_SNAPSHOT") {
    const selected = Array.isArray(build.selectedSources)
      ? build.selectedSources.filter((x): x is { id: string; title: string; content: string; type: "TEXT" | "PRODUCT" | "FAQ" } => Boolean(x && typeof x === "object" && typeof (x as { id?: unknown }).id === "string" && typeof (x as { title?: unknown }).title === "string" && typeof (x as { content?: unknown }).content === "string" && ["TEXT", "PRODUCT", "FAQ"].includes((x as { type?: string }).type ?? "")))
      : (await sources(build.tenantId, build.brandId)).filter(x => (Array.isArray(build.selectedSourceIds) ? build.selectedSourceIds : []).includes(x.id));
    await prisma.taaviaKnowledgeSourceSnapshot.createMany({ data: selected.map(x => ({ tenantId: build.tenantId, brandId: build.brandId, buildId, originalSourceId: x.id, sourceType: x.type, title: x.title, content: x.content, contentHash: hash(x.content), extractedText: null, extractedWordCount: 0 })) });
  }
  if (key === "CONTENT_PROCESSING") {
    const rows = await prisma.taaviaKnowledgeSourceSnapshot.findMany({ where: { tenantId: build.tenantId, brandId: build.brandId, buildId } });
    await Promise.all(rows.map(row => {
      const extracted = row.sourceType === "TEXT" ? row.content?.replace(/\s+/g, " ").trim() : `محتوای استخراج‌شده از ${row.title}: ${(row.content ?? "").replace(/\s+/g, " ").trim()}`;
      return prisma.taaviaKnowledgeSourceSnapshot.update({ where: { id: row.id }, data: { extractedText: extracted, extractedWordCount: extracted.split(/\s+/).filter(Boolean).length } });
    }));
  }
  if (key === "CATEGORY_GENERATION") {
    const rows = await prisma.taaviaKnowledgeSourceSnapshot.findMany({ where: { tenantId: build.tenantId, brandId: build.brandId, buildId }, orderBy: { title: "asc" } });
    for (const row of rows) {
      const slug = `source-${row.id}`;
      const parent = await prisma.taaviaKnowledgeCategory.create({ data: { tenantId: build.tenantId, brandId: build.brandId, buildId, title: row.title.slice(0, 80), slug, level: 1, content: row.extractedText ?? row.content ?? "", sourceReferences: { create: { snapshotId: row.id, tenantId: build.tenantId, brandId: build.brandId, buildId } } } });
      await prisma.taaviaKnowledgeCategory.create({ data: { tenantId: build.tenantId, brandId: build.brandId, buildId, parentCategoryId: parent.id, title: `جزئیات ${row.title.slice(0, 60)}`, slug: `${slug}-details`, level: 2, content: row.extractedText ?? row.content ?? "", sourceReferences: { create: { snapshotId: row.id, tenantId: build.tenantId, brandId: build.brandId, buildId } } } });
    }
  }
  if (key === "FINALIZATION") {
    await prisma.$transaction(async tx => {
      const existing = await tx.taaviaKnowledgeBase.findFirst({ where: { tenantId: build.tenantId, brandId: build.brandId, isActive: true } });
      if (existing) throw new Error("Knowledge Base فعال از قبل وجود دارد.");
      const kb = await tx.taaviaKnowledgeBase.create({ data: { tenantId: build.tenantId, brandId: build.brandId, versionNumber: 1, versionLabel: "v1", isActive: true, buildType: "INITIAL", createdByUserId: build.createdByUserId, activatedByUserId: build.createdByUserId, activatedAt: new Date() } });
      await tx.taaviaKnowledgeSourceSnapshot.updateMany({ where: { tenantId: build.tenantId, brandId: build.brandId, buildId }, data: { knowledgeBaseId: kb.id } });
      await tx.taaviaKnowledgeCategory.updateMany({ where: { tenantId: build.tenantId, brandId: build.brandId, sourceReferences: { some: { snapshot: { buildId } } } }, data: { knowledgeBaseId: kb.id } });
      await tx.taaviaKnowledgeCategorySourceReference.updateMany({ where: { tenantId: build.tenantId, brandId: build.brandId, snapshot: { buildId } }, data: { knowledgeBaseId: kb.id } });
      await tx.taaviaKnowledgeBaseBuild.update({ where: { id: buildId }, data: { knowledgeBaseId: kb.id, status: "COMPLETED", overallProgress: 100, completedAt: new Date(), finishedAt: new Date() } });
    });
  }
}

export async function advanceInitialKnowledgeBuild(buildId: string) {
  const build = await prisma.taaviaKnowledgeBaseBuild.findUniqueOrThrow({ where: { id: buildId }, include: { steps: { orderBy: { stepOrder: "asc" } } } });
  if (build.status !== "PROCESSING") throw new Error("Build در حال پردازش نیست.");
  const current = build.steps.find(x => x.status === "IN_PROGRESS"); if (!current) throw new Error("مرحله فعالی وجود ندارد.");
  await executeStep(buildId, current.key);
  const next = build.steps.find(x => x.stepOrder === current.stepOrder + 1);
  await prisma.$transaction([
    prisma.taaviaKnowledgeBaseBuildStep.update({ where: { id: current.id }, data: { status: "COMPLETED", progress: BUILD_STEPS[current.stepOrder - 1][2], completedAt: new Date(), errorCode: null, errorMessage: null } }),
    ...(next ? [prisma.taaviaKnowledgeBaseBuildStep.update({ where: { id: next.id }, data: { status: "IN_PROGRESS", progress: BUILD_STEPS[next.stepOrder - 1][2], startedAt: new Date() } })] : []),
    ...(next ? [prisma.taaviaKnowledgeBaseBuild.update({ where: { id: buildId }, data: { overallProgress: BUILD_STEPS[next.stepOrder - 1][2] } })] : []),
  ]);
}

export async function failInitialKnowledgeBuild(buildId: string) { const current = await prisma.taaviaKnowledgeBaseBuildStep.findFirstOrThrow({ where: { buildId, status: "IN_PROGRESS" } }); await prisma.$transaction([prisma.taaviaKnowledgeBaseBuildStep.update({ where: { id: current.id }, data: { status: "FAILED", failedAt: new Date(), errorCode: "SIMULATED_FAILURE", errorMessage: "شکست شبیه‌سازی‌شده مرحله فعلی" } }), prisma.taaviaKnowledgeBaseBuild.update({ where: { id: buildId }, data: { status: "FAILED", failedAt: new Date(), failureCode: "SIMULATED_FAILURE", failureMessage: "شکست شبیه‌سازی‌شده مرحله فعلی" } })]); }
export async function retryInitialKnowledgeBuild(buildId: string) { const failed = await prisma.taaviaKnowledgeBaseBuildStep.findFirstOrThrow({ where: { buildId, status: "FAILED" } }); await prisma.$transaction([prisma.taaviaKnowledgeBaseBuildStep.update({ where: { id: failed.id }, data: { status: "IN_PROGRESS", failedAt: null, errorCode: null, errorMessage: null, startedAt: new Date() } }), prisma.taaviaKnowledgeBaseBuild.update({ where: { id: buildId }, data: { status: "PROCESSING", failedAt: null, failureCode: null, failureMessage: null, attemptCount: { increment: 1 } } })]); }
export async function cancelInitialKnowledgeBuild(buildId: string) { await prisma.taaviaKnowledgeBaseBuild.update({ where: { id: buildId }, data: { status: "CANCELLED", finishedAt: new Date() } }); }
export async function completeInitialKnowledgeBuild(buildId: string) {
  for (let index = 0; index < BUILD_STEPS.length; index += 1) {
    const build = await prisma.taaviaKnowledgeBaseBuild.findUniqueOrThrow({ where: { id: buildId }, select: { status: true } });
    if (build.status === "COMPLETED") return;
    await advanceInitialKnowledgeBuild(buildId);
  }
}
export async function resetInitialKnowledgeBuild(buildId: string) {
  const build = await prisma.taaviaKnowledgeBaseBuild.findUniqueOrThrow({ where: { id: buildId }, select: { status: true, knowledgeBaseId: true, tenantId: true, brandId: true } });
  if (build.status === "COMPLETED" || build.knowledgeBaseId) throw new Error("بازنشانی Build تکمیل‌شده مجاز نیست.");
  const snapshotIds = (await prisma.taaviaKnowledgeSourceSnapshot.findMany({ where: { tenantId: build.tenantId, brandId: build.brandId, buildId }, select: { id: true } })).map(x => x.id);
  await prisma.$transaction([
    prisma.taaviaKnowledgeCategorySourceReference.deleteMany({ where: { snapshotId: { in: snapshotIds } } }),
    prisma.taaviaKnowledgeCategory.deleteMany({ where: { tenantId: build.tenantId, brandId: build.brandId, buildId, knowledgeBaseId: null } }),
    prisma.taaviaKnowledgeSourceSnapshot.deleteMany({ where: { id: { in: snapshotIds } } }),
    prisma.taaviaKnowledgeBaseBuild.delete({ where: { id: buildId } }),
  ]);
}
