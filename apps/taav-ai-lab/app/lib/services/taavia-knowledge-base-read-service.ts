import { assertTenantAccess } from "@/app/lib/auth";
import { ACTIVE_BUILD_STATUSES, findActiveBuild } from "@/app/lib/taavia-active-build";
import { prisma } from "@/app/lib/prisma";
import type { KnowledgeBaseCategoriesPageData } from "@/app/lib/types/taavia-knowledge-base-categories";
import type { KnowledgeBaseOverview } from "@/app/lib/types/taavia-knowledge-base";
import type { KnowledgeBaseSourceSnapshot, KnowledgeBaseSourceSnapshotsPageData } from "@/app/lib/types/taavia-knowledge-base-source-snapshots";
import type { KnowledgeBaseSourceSnapshotDetailView, KnowledgeBaseSourceSimpleComparison } from "@/app/lib/types/taavia-knowledge-base-source-snapshots";
import type { TaaviaKnowledgeBaseVersionsOverview } from "@/app/lib/types/taavia-knowledge-base-versions";
import type { TaaviaBrandDetailsOverview } from "@/app/lib/types/taavia-brand-details-dashboard";
import type { KnowledgeBaseDetailsReadModel } from "@/app/lib/types/taavia-knowledge-base-details";
import type { KnowledgeBaseCategoryDetailsPageData } from "@/app/lib/types/taavia-knowledge-base-category-details";
import type { KnowledgeBaseVersionSourceItem, KnowledgeBaseVersionSourceTab, KnowledgeBaseVersionSourcesPageData } from "@/app/lib/types/taavia-knowledge-base-version-sources";
import { compareKnowledgeBaseSources, compareSnapshotToCurrentSource, getActiveBrandKnowledgeSources, sourceKey } from "@/app/lib/taavia-knowledge-base-synchronization";
import { TAAVIA_BRAND_AI_MODEL_PURPOSES, TAAVIA_PURPOSE_LABELS } from "@/app/lib/taavia-ai-models";

const formatDate = (value: Date) => new Intl.DateTimeFormat("fa-IR-u-ca-persian", { dateStyle: "short", timeStyle: "short" }).format(value);
const sourceType = (value: string): KnowledgeBaseSourceSnapshot["sourceType"] => (({ TEXT: "BRAND_INFO", IMAGE: "IMAGE", FILE: "FILE", LINK: "LINK", PRODUCT: "PRODUCTS_SERVICES", FAQ: "FAQ" }) as const)[value as "TEXT" | "IMAGE" | "FILE" | "LINK" | "PRODUCT" | "FAQ"] ?? "BRAND_INFO";
export type InitialBuildReadModel = { id: string; status: string; progress: number; startedAt: string; sourceCount: number; failureMessage: string | null; steps: Array<{ key: string; label: string; status: string; progress: number; errorMessage: string | null }> };
const stepLabels: Record<string, string> = { PREPARATION: "آماده‌سازی", SOURCE_SNAPSHOT: "ثبت Snapshot منابع", CONTENT_PROCESSING: "پردازش محتوا", CATEGORY_GENERATION: "تولید دسته‌بندی‌ها", KNOWLEDGE_GENERATION: "تولید محتوای دانش", FINALIZATION: "نهایی‌سازی و فعال‌سازی" };

function mapBuildReadModel(build: {
  id: string;
  status: string;
  overallProgress: number;
  startedAt: Date;
  selectedSourceIds: unknown;
  failureMessage: string | null;
  steps: Array<{ key: string; status: string; progress: number; errorMessage: string | null }>;
}): InitialBuildReadModel {
  return {
    id: build.id,
    status: build.status,
    progress: build.overallProgress,
    startedAt: formatDate(build.startedAt),
    sourceCount: Array.isArray(build.selectedSourceIds) ? build.selectedSourceIds.length : 0,
    failureMessage: build.failureMessage,
    steps: build.steps.map((step) => ({
      key: step.key,
      label: stepLabels[step.key] ?? step.key,
      status: step.status,
      progress: step.progress,
      errorMessage: step.errorMessage,
    })),
  };
}

async function scopedBrand(userId: string, tenantId: string, brandId: string) {
  if (!(await assertTenantAccess(userId, tenantId))) return null;
  return prisma.taaviaBrand.findFirst({ where: { id: brandId, tenantId } });
}

const formatBuildType = (value: string) => value === "INITIAL" ? "ساخت اولیه" : value === "UPDATE" ? "به‌روزرسانی" : "بازسازی کامل";
const formatBuildStatus = (value: string) => ({ COMPLETED: "موفق", SUCCEEDED: "موفق", PROCESSING: "در حال انجام", PENDING: "در انتظار", FAILED: "ناموفق", CANCELLED: "لغوشده", RUNNING: "در حال انجام" })[value] ?? value;
const formatDuration = (startedAt: Date | null, finishedAt: Date | null) => {
  if (!startedAt || !finishedAt) return null;
  const seconds = Math.max(0, Math.round((finishedAt.getTime() - startedAt.getTime()) / 1000));
  return seconds < 60 ? `${seconds} ثانیه` : `${Math.floor(seconds / 60)} دقیقه`;
};

export async function getActiveKnowledgeBaseId(userId: string, businessId: string, brandId: string) {
  if (!(await scopedBrand(userId, businessId, brandId))) return null;
  const knowledgeBase = await prisma.taaviaKnowledgeBase.findFirst({ where: { tenantId: businessId, brandId, isActive: true }, select: { id: true } });
  return knowledgeBase?.id ?? null;
}

export async function getKnowledgeBaseDetails(userId: string, businessId: string, brandId: string, knowledgeBaseId: string): Promise<KnowledgeBaseDetailsReadModel | null> {
  if (!(await scopedBrand(userId, businessId, brandId))) return null;
  const knowledgeBase = await prisma.taaviaKnowledgeBase.findFirst({
    where: { id: knowledgeBaseId, tenantId: businessId, brandId },
    include: {
      build: true,
      snapshots: { orderBy: { snapshotCreatedAt: "desc" } },
      categories: { include: { _count: { select: { children: true, sourceReferences: true } } }, orderBy: [{ level: "asc" }, { title: "asc" }] },
    },
  });
  if (!knowledgeBase) return null;

  const createdByUserId = knowledgeBase.build?.createdByUserId ?? knowledgeBase.createdByUserId ?? null;
  const [currentSources, activeBuild, createdByUser] = await Promise.all([
    getActiveBrandKnowledgeSources(businessId, brandId),
    findActiveBuild(businessId, brandId),
    createdByUserId
      ? prisma.appUser.findUnique({ where: { id: createdByUserId }, select: { fullName: true } })
      : Promise.resolve(null),
  ]);
  const synchronization = compareKnowledgeBaseSources(currentSources, knowledgeBase.snapshots);

  const sourceGroupDefinitions = [
    { key: "knowledge", label: "دانش‌ها", matches: (source: { sourceGroup: string; sourceType: string }) => source.sourceGroup === "knowledge" || source.sourceGroup === "brand_info" || source.sourceType === "TEXT" },
    { key: "products", label: "محصولات", matches: (source: { sourceGroup: string; sourceType: string }) => source.sourceGroup === "products_services" || source.sourceType === "PRODUCT" },
    { key: "faqs", label: "سوالات پرتکرار", matches: (source: { sourceGroup: string; sourceType: string }) => source.sourceGroup === "faq" || source.sourceType === "FAQ" },
    { key: "links", label: "لینک‌ها", matches: (source: { sourceGroup: string; sourceType: string }) => source.sourceGroup === "link" || source.sourceType === "LINK" },
  ];
  const storedContentSizeBytes = knowledgeBase.snapshots.reduce((size, source) => size + (source.fileSizeBytes ?? Buffer.byteLength(source.content ?? source.extractedText ?? "", "utf8")), 0);
  const build = knowledgeBase.build;

  return {
    businessId,
    brandId,
    knowledgeBaseId: knowledgeBase.id,
    versionLabel: knowledgeBase.versionLabel || `v${knowledgeBase.versionNumber}`,
    isActive: knowledgeBase.isActive,
    build: {
      id: build?.id ?? null,
      type: formatBuildType(knowledgeBase.buildType),
      status: formatBuildStatus(build?.status ?? "COMPLETED"),
      createdAt: formatDate(knowledgeBase.createdAt),
      startedAt: build?.startedAt ? formatDate(build.startedAt) : null,
      completedAt: build?.finishedAt ? formatDate(build.finishedAt) : build?.completedAt ? formatDate(build.completedAt) : null,
      duration: formatDuration(build?.startedAt ?? null, build?.finishedAt ?? build?.completedAt ?? null),
      inputSourceCount: Array.isArray(build?.selectedSourceIds) ? build.selectedSourceIds.length : knowledgeBase.snapshots.length,
      createdBy: createdByUser?.fullName ?? createdByUserId,
    },
    summary: {
      rootCategoryCount: knowledgeBase.categories.filter((category) => category.level === 1).length,
      subcategoryCount: knowledgeBase.categories.filter((category) => category.level === 2).length,
      snapshotCount: knowledgeBase.snapshots.length,
      storedContentSizeBytes,
    },
    synchronization,
    update: {
      canStart: knowledgeBase.isActive && !synchronization.isSynchronized && !activeBuild,
      reason: activeBuild ? "یک فرآیند ساخت برای این برند در حال انجام است." : synchronization.isSynchronized ? "منابع فعلی برند با این نسخه یکسان‌اند؛ نیازی به ساخت نسخهٔ جدید نیست." : "با بروزرسانی، نسخهٔ جدیدی ساخته و فعال می‌شود؛ نسخهٔ فعلی بدون تغییر غیرفعال خواهد شد.",
      activeBuildId: activeBuild?.id ?? null,
    },
    sourceGroups: sourceGroupDefinitions.map((group) => ({ key: group.key, label: group.label, count: knowledgeBase.snapshots.filter(group.matches).length })).filter((group) => group.count > 0),
    categories: knowledgeBase.categories.filter((category) => category.level === 1).map((category) => ({ id: category.id, title: category.title, childCount: category._count.children, sourceCount: category._count.sourceReferences })),
    sources: knowledgeBase.snapshots.map((source) => ({ id: source.id, title: source.title, type: source.sourceType, group: source.sourceGroup, createdAt: formatDate(source.snapshotCreatedAt) })),
  };
}

function resolveVersionSourceTab(sourceGroup: string, sourceType: string): KnowledgeBaseVersionSourceTab | null {
  if (sourceGroup === "link" || sourceType === "LINK") return "links";
  if (sourceGroup === "faq" || sourceType === "FAQ") return "faqs";
  if (sourceGroup === "products_services" || sourceType === "PRODUCT") return "products";
  if (sourceGroup === "brand_info" || sourceGroup === "knowledge" || sourceType === "TEXT") return "knowledge";
  return null;
}

function splitProductContent(content: string | null) {
  if (!content) return { shortDescription: null as string | null, fullDescription: "" };
  const separator = content.indexOf("\n");
  if (separator < 0) return { shortDescription: null, fullDescription: content };
  const shortDescription = content.slice(0, separator).trim();
  const fullDescription = content.slice(separator + 1).trim();
  return { shortDescription: shortDescription || null, fullDescription: fullDescription || content };
}

function splitFaqContent(content: string | null, title: string) {
  if (!content) return { question: title, answer: "" };
  const separator = content.indexOf("\n");
  if (separator < 0) return { question: title || content, answer: content };
  return { question: content.slice(0, separator).trim() || title, answer: content.slice(separator + 1).trim() };
}

function extractUrl(content: string | null, extractedText: string | null) {
  const candidate = (content ?? extractedText ?? "").trim();
  const match = candidate.match(/https?:\/\/[^\s]+/i);
  return match?.[0] ?? (candidate.startsWith("http") ? candidate.split(/\s+/)[0] : null);
}

export async function getKnowledgeBaseVersionSourcesPageData(userId: string, businessId: string, brandId: string, knowledgeBaseId: string, brandName: string): Promise<KnowledgeBaseVersionSourcesPageData | null> {
  if (!(await scopedBrand(userId, businessId, brandId))) return null;
  const knowledgeBase = await prisma.taaviaKnowledgeBase.findFirst({
    where: { id: knowledgeBaseId, tenantId: businessId, brandId },
    include: { build: true, snapshots: { orderBy: [{ snapshotCreatedAt: "desc" }, { title: "asc" }] } },
  });
  if (!knowledgeBase) return null;

  const originalIds = [
    ...new Set(
      knowledgeBase.snapshots
        .map((row) => row.originalSourceId ?? row.originalBrandInfoId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const [currentSources, createdByUser, brandInfos, knowledgeRows, productRows, faqRows] = await Promise.all([
    getActiveBrandKnowledgeSources(businessId, brandId),
    knowledgeBase.createdByUserId
      ? prisma.appUser.findUnique({ where: { id: knowledgeBase.createdByUserId }, select: { fullName: true } })
      : Promise.resolve(null),
    originalIds.length
      ? prisma.taaviaBrandInfo.findMany({
          where: { tenantId: businessId, brandId, id: { in: originalIds } },
          select: { id: true, createdBy: true, updatedBy: true, updatedAt: true },
        })
      : Promise.resolve([]),
    originalIds.length
      ? prisma.taaviaBrandKnowledge.findMany({
          where: { tenantId: businessId, brandId, id: { in: originalIds } },
          select: { id: true, createdBy: true, updatedBy: true, updatedAt: true },
        })
      : Promise.resolve([]),
    originalIds.length
      ? prisma.taaviaBrandProduct.findMany({
          where: { tenantId: businessId, brandId, id: { in: originalIds } },
          select: { id: true, createdBy: true, updatedBy: true, updatedAt: true },
        })
      : Promise.resolve([]),
    originalIds.length
      ? prisma.taaviaBrandFaq.findMany({
          where: { tenantId: businessId, brandId, id: { in: originalIds } },
          select: { id: true, createdBy: true, updatedBy: true, updatedAt: true },
        })
      : Promise.resolve([]),
  ]);
  const currentByKey = new Map(currentSources.map((source) => [`${source.sourceGroup}:${source.id}`, source]));
  const sourceMetaById = new Map(
    [...brandInfos, ...knowledgeRows, ...productRows, ...faqRows].map((row) => [row.id, row]),
  );
  const userIds = [
    ...new Set(
      [...sourceMetaById.values()].flatMap((row) => [row.createdBy, row.updatedBy].filter((id): id is string => Boolean(id))),
    ),
  ];
  const users = userIds.length
    ? await prisma.appUser.findMany({ where: { id: { in: userIds } }, select: { id: true, fullName: true } })
    : [];
  const userNameById = new Map(users.map((user) => [user.id, user.fullName]));
  const versionLabel = knowledgeBase.versionLabel || `v${knowledgeBase.versionNumber}`;

  const sources: KnowledgeBaseVersionSourceItem[] = [];
  for (const row of knowledgeBase.snapshots) {
    const tab = resolveVersionSourceTab(row.sourceGroup, row.sourceType);
    if (!tab) continue;
    const status = compareSnapshotToCurrentSource(row, currentByKey);
    const originalId = row.originalSourceId ?? row.originalBrandInfoId;
    const key = sourceKey(row.sourceGroup, originalId);
    const current = key ? currentByKey.get(key) ?? null : null;
    const meta = originalId ? sourceMetaById.get(originalId) ?? null : null;
    const productParts = tab === "products" ? splitProductContent(row.content) : null;
    const faqParts = tab === "faqs" ? splitFaqContent(row.content, row.title) : null;
    const sourceTypeLabel = tab === "knowledge" ? "مقاله" : tab === "products" ? "محصول" : tab === "faqs" ? "سوال پرتکرار" : "لینک";
    const updatedAt = meta ? formatDate(meta.updatedAt) : null;
    sources.push({
      snapshotId: row.id,
      title: row.title,
      tab,
      sourceTypeLabel,
      sourceTypeKey: tab === "knowledge" ? (row.sourceGroup === "brand_info" ? "brand_info" : "knowledge") : tab,
      status,
      snapshotCreatedAt: status === "DELETED" ? null : formatDate(row.snapshotCreatedAt),
      versionLabel,
      createdByDisplayName: meta?.createdBy ? userNameById.get(meta.createdBy) ?? meta.createdBy : null,
      updatedByDisplayName: meta?.updatedBy ? userNameById.get(meta.updatedBy) ?? meta.updatedBy : null,
      updatedAt,
      detailKind: tab === "knowledge" ? "knowledge" : tab === "products" ? "product" : tab === "faqs" ? "faq" : "link",
      snapshot: {
        content: row.content ?? row.extractedText ?? "",
        extractedText: row.extractedText,
        previewUrl: row.previewUrl,
        url: tab === "links" ? extractUrl(row.content, row.extractedText) : null,
        productShortDescription: productParts?.shortDescription ?? null,
        productFullDescription: productParts?.fullDescription ?? null,
        faqQuestion: faqParts?.question ?? null,
        faqAnswer: faqParts?.answer ?? null,
      },
      current: current
        ? {
            title: current.title,
            content: current.content,
            updatedAt,
          }
        : null,
    });
  }

  const countStatus = (status: KnowledgeBaseVersionSourceItem["status"]) => sources.filter((source) => source.status === status).length;
  const tabCounts = { knowledge: 0, products: 0, faqs: 0, links: 0 } satisfies Record<KnowledgeBaseVersionSourceTab, number>;
  for (const source of sources) tabCounts[source.tab] += 1;

  return {
    businessId,
    brandId,
    brandName,
    knowledgeBaseId: knowledgeBase.id,
    title: knowledgeBase.description?.trim() || `دانشنامه برند ${brandName}`,
    versionLabel,
    isActive: knowledgeBase.isActive,
    createdAt: formatDate(knowledgeBase.createdAt),
    createdBy: createdByUser?.fullName ?? knowledgeBase.createdByUserId,
    summary: {
      total: sources.length,
      unchanged: countStatus("UNCHANGED"),
      changed: countStatus("CHANGED_AFTER_BUILD"),
      deleted: countStatus("DELETED"),
    },
    tabCounts,
    sources,
  };
}

export async function getKnowledgeBaseCategoryDetailsPageData(userId: string, businessId: string, brandId: string, knowledgeBaseId: string, brandName: string): Promise<KnowledgeBaseCategoryDetailsPageData | null> {
  if (!(await scopedBrand(userId, businessId, brandId))) return null;
  const knowledgeBase = await prisma.taaviaKnowledgeBase.findFirst({
    where: { id: knowledgeBaseId, tenantId: businessId, brandId },
    include: {
      snapshots: {
        select: {
          originalSourceId: true,
          originalBrandInfoId: true,
          sourceGroup: true,
          sourceType: true,
          contentHash: true,
          title: true,
          content: true,
        },
      },
      categories: {
        include: { parent: { select: { title: true } }, _count: { select: { children: true } }, sourceReferences: { include: { snapshot: true }, orderBy: { usedAt: "desc" } } },
        orderBy: [{ level: "asc" }, { title: "asc" }],
      },
    },
  });
  if (!knowledgeBase) return null;

  const [createdByUser, activeBuildRow, lastBuildRow, currentSources] = await Promise.all([
    knowledgeBase.createdByUserId
      ? prisma.appUser.findUnique({ where: { id: knowledgeBase.createdByUserId }, select: { fullName: true } })
      : Promise.resolve(null),
    prisma.taaviaKnowledgeBaseBuild.findFirst({
      where: { tenantId: businessId, brandId, status: { in: [...ACTIVE_BUILD_STATUSES] } },
      include: { steps: { orderBy: { stepOrder: "asc" } } },
      orderBy: { startedAt: "desc" },
    }),
    prisma.taaviaKnowledgeBaseBuild.findFirst({
      where: { tenantId: businessId, brandId, knowledgeBaseId, status: "COMPLETED" },
      orderBy: { finishedAt: "desc" },
    }),
    getActiveBrandKnowledgeSources(businessId, brandId),
  ]);

  const synchronization = compareKnowledgeBaseSources(currentSources, knowledgeBase.snapshots);
  const changeCount = synchronization.added + synchronization.edited + synchronization.archived;
  const versionLabel = knowledgeBase.versionLabel || `v${knowledgeBase.versionNumber}`;
  const sourceTypeLabels: Record<string, string> = { TEXT: "متن", PRODUCT: "محصول", FAQ: "سوال پرتکرار", FILE: "فایل", IMAGE: "تصویر", LINK: "لینک" };

  return {
    businessId,
    brandId,
    knowledgeBaseId,
    brandName,
    versionLabel,
    isActive: knowledgeBase.isActive,
    updatedAt: formatDate(knowledgeBase.updatedAt),
    createdBy: createdByUser?.fullName ?? knowledgeBase.createdByUserId,
    totalCategories: knowledgeBase.categories.length,
    activeBuild: activeBuildRow ? mapBuildReadModel(activeBuildRow) : null,
    lastBuild: lastBuildRow
      ? {
          id: lastBuildRow.id,
          buildType: formatBuildType(lastBuildRow.buildType),
          status: formatBuildStatus(lastBuildRow.status),
          startedAt: formatDate(lastBuildRow.startedAt),
          finishedAt: lastBuildRow.finishedAt ? formatDate(lastBuildRow.finishedAt) : null,
          sourceCount: Array.isArray(lastBuildRow.selectedSourceIds) ? lastBuildRow.selectedSourceIds.length : 0,
        }
      : null,
    update: {
      isSynchronized: synchronization.isSynchronized,
      canStart: knowledgeBase.isActive && !synchronization.isSynchronized && !activeBuildRow,
      changeCount,
      reason: activeBuildRow
        ? "یک فرآیند ساخت برای این برند در حال انجام است."
        : !knowledgeBase.isActive
          ? "این نسخه غیرفعال است و قابل بروزرسانی نیست."
          : synchronization.isSynchronized
            ? "دانشنامه با منابع فعلی همگام است."
            : `${changeCount.toLocaleString("fa-IR")} تغییر در منابع؛ برای همگام‌سازی، نالج‌بیس را بروزرسانی کنید.`,
    },
    categories: knowledgeBase.categories.map((category) => {
      const resources = category.sourceReferences.map((reference) => ({
        snapshotId: reference.snapshotId,
        title: reference.snapshot.title,
        sourceType: reference.snapshot.sourceType,
        sourceTypeLabel: sourceTypeLabels[reference.snapshot.sourceType] ?? reference.snapshot.sourceType,
        snapshotDate: formatDate(reference.snapshot.snapshotCreatedAt),
        versionLabel,
        href: `/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base/${knowledgeBaseId}/sources`,
      }));
      return {
        id: category.id,
        title: category.title,
        level: category.level as 1 | 2,
        parentCategoryId: category.parentCategoryId,
        parentTitle: category.parent?.title ?? null,
        content: category.content,
        sourceCount: resources.length,
        childrenCount: category._count.children,
        resourceTypeLabels: [...new Set(resources.map((resource) => resource.sourceTypeLabel))],
        resources,
      };
    }),
  };
}

export async function getBuildingKnowledgeBaseCategoryDetailsPageData(
  userId: string,
  businessId: string,
  brandId: string,
  brandName: string,
): Promise<KnowledgeBaseCategoryDetailsPageData | null> {
  if (!(await scopedBrand(userId, businessId, brandId))) return null;
  const activeBuildRow = await prisma.taaviaKnowledgeBaseBuild.findFirst({
    where: { tenantId: businessId, brandId, status: { in: [...ACTIVE_BUILD_STATUSES] } },
    include: { steps: { orderBy: { stepOrder: "asc" } } },
    orderBy: { startedAt: "desc" },
  });
  if (!activeBuildRow) return null;
  return {
    businessId,
    brandId,
    knowledgeBaseId: null,
    brandName,
    versionLabel: "در حال ساخت",
    isActive: false,
    updatedAt: formatDate(activeBuildRow.startedAt),
    createdBy: null,
    totalCategories: 0,
    activeBuild: mapBuildReadModel(activeBuildRow),
    lastBuild: null,
    update: null,
    categories: [],
  };
}

export async function getInitialBuildReadModel(userId: string, businessId: string, brandId: string): Promise<InitialBuildReadModel | null> {
  if (!(await scopedBrand(userId, businessId, brandId))) return null;
  const build = await prisma.taaviaKnowledgeBaseBuild.findFirst({
    where: { tenantId: businessId, brandId, status: { in: [...ACTIVE_BUILD_STATUSES, "FAILED", "CANCELLED"] } },
    include: { steps: { orderBy: { stepOrder: "asc" } } },
    orderBy: { startedAt: "desc" },
  });
  if (!build) return null;
  return mapBuildReadModel(build);
}
export async function getKnowledgeBaseBuildReadModel(userId: string, businessId: string, brandId: string, buildId: string): Promise<(InitialBuildReadModel & { knowledgeBaseId: string | null }) | null> {
  if (!(await scopedBrand(userId, businessId, brandId))) return null;
  const build = await prisma.taaviaKnowledgeBaseBuild.findFirst({ where: { id: buildId, tenantId: businessId, brandId }, include: { steps: { orderBy: { stepOrder: "asc" } } } });
  if (!build) return null;
  return { ...mapBuildReadModel(build), knowledgeBaseId: build.knowledgeBaseId };
}

export async function getKnowledgeBaseVersionsReadModel(userId: string, businessId: string, brandId: string): Promise<TaaviaKnowledgeBaseVersionsOverview | null> {
  if (!(await scopedBrand(userId, businessId, brandId))) return null;
  const versions = await prisma.taaviaKnowledgeBase.findMany({ where: { tenantId: businessId, brandId }, include: { build: true, _count: { select: { categories: true, snapshots: true } } }, orderBy: { versionNumber: "desc" } });
  return { businessId, brandId, versions: versions.map((item) => ({ knowledgeBaseId: item.id, businessId, brandId, versionLabel: item.versionLabel || `v${item.versionNumber}`, isActive: item.isActive, buildType: item.buildType === "INITIAL" ? "ساخت اولیه" : "بروزرسانی", buildId: item.build?.id ?? "", createdAt: formatDate(item.createdAt), categoryCount: item._count.categories, sourceSnapshotCount: item._count.snapshots, description: item.description ?? item.build?.description ?? "بدون توضیحات" })) };
}

function buildStatusTone(status: string): TaaviaBrandDetailsOverview["builds"][number]["statusTone"] {
  if (status === "COMPLETED" || status === "SUCCEEDED") return "success";
  if (status === "FAILED") return "danger";
  if (status === "PENDING" || status === "PROCESSING" || status === "RUNNING") return "warning";
  if (status === "CANCELLED") return "neutral";
  return "info";
}

export async function getTaaviaBrandDashboardReadModel(userId: string, businessId: string, brandId: string): Promise<TaaviaBrandDetailsOverview | null> {
  const versions = await getKnowledgeBaseVersionsReadModel(userId, businessId, brandId);
  if (!versions) return null;
  const [brandInfo, knowledge, productsServices, faqs, filesDocuments, active, builds, modelAssignments] = await Promise.all([
    prisma.taaviaBrandInfo.count({ where: { tenantId: businessId, brandId, status: "ACTIVE", type: "TEXT" } }),
    prisma.taaviaBrandKnowledge.count({ where: { tenantId: businessId, brandId, status: "ACTIVE" } }),
    prisma.taaviaBrandProduct.count({ where: { tenantId: businessId, brandId, status: "ACTIVE" } }),
    prisma.taaviaBrandFaq.count({ where: { tenantId: businessId, brandId, status: "ACTIVE" } }),
    prisma.taaviaBrandInfo.count({ where: { tenantId: businessId, brandId, status: "ACTIVE", type: { in: ["IMAGE", "FILE", "VOICE", "VIDEO"] } } }),
    prisma.taaviaKnowledgeBase.findFirst({ where: { tenantId: businessId, brandId, isActive: true } }),
    prisma.taaviaKnowledgeBaseBuild.findMany({
      where: { tenantId: businessId, brandId },
      include: { knowledgeBase: { select: { id: true, versionLabel: true, versionNumber: true } } },
      orderBy: { startedAt: "desc" },
      take: 20,
    }),
    prisma.taaviaBrandAiModelAssignment.findMany({
      where: { tenantId: businessId, brandId, effectiveTo: null, purpose: { in: [...TAAVIA_BRAND_AI_MODEL_PURPOSES] } },
      select: {
        purpose: true,
        aiProviderModel: { select: { name: true } },
        aiProviderAccount: { select: { name: true } },
      },
    }),
  ]);
  const assignmentByPurpose = new Map(modelAssignments.map((row) => [row.purpose, row]));
  return {
    businessId,
    brandId,
    website: "—",
    country: "—",
    industry: "—",
    currentSources: {
      brandInfo: brandInfo + knowledge,
      productsServices,
      faqs,
      filesDocuments,
      links: 0,
    },
    modelSlots: TAAVIA_BRAND_AI_MODEL_PURPOSES.map((purpose) => {
      const assignment = assignmentByPurpose.get(purpose);
      return {
        purpose,
        label: TAAVIA_PURPOSE_LABELS[purpose],
        modelName: assignment?.aiProviderModel.name ?? null,
        accountName: assignment?.aiProviderAccount.name ?? null,
        assigned: Boolean(assignment),
      };
    }),
    knowledgeBases: versions.versions.map(({ businessId: _businessId, ...version }) => version),
    builds: builds
      .map((build) => {
        const isInProgress = build.status === "PENDING" || build.status === "PROCESSING" || build.status === "RUNNING";
        return {
          buildId: build.id,
          brandId,
          buildType: formatBuildType(build.buildType),
          status: formatBuildStatus(build.status),
          statusTone: buildStatusTone(build.status),
          progress: build.overallProgress,
          startedAt: formatDate(build.startedAt),
          finishedAt: build.finishedAt ? formatDate(build.finishedAt) : build.completedAt ? formatDate(build.completedAt) : null,
          knowledgeBaseId: build.knowledgeBaseId,
          versionLabel: build.knowledgeBase
            ? build.knowledgeBase.versionLabel || `v${build.knowledgeBase.versionNumber}`
            : null,
          failureMessage: build.failureMessage,
          sourceCount: Array.isArray(build.selectedSourceIds) ? build.selectedSourceIds.length : 0,
          isInProgress,
        };
      })
      .sort((a, b) => Number(b.isInProgress) - Number(a.isInProgress)),
    chatbot: { ready: Boolean(active), lastKnowledgeUpdatedAt: active ? formatDate(active.updatedAt) : "—" },
  };
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
