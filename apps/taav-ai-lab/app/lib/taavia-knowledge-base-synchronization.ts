import { prisma } from "@/app/lib/prisma";

export type KnowledgeBaseBuildSource = {
  id: string;
  title: string;
  content: string;
  contentHash: string;
  type: "TEXT" | "PRODUCT" | "FAQ";
  sourceGroup: "brand_info" | "knowledge" | "products_services" | "faq";
};

export type KnowledgeBaseSynchronization = {
  added: number;
  edited: number;
  archived: number;
  isSynchronized: boolean;
};

export async function getActiveBrandKnowledgeSources(tenantId: string, brandId: string): Promise<KnowledgeBaseBuildSource[]> {
  const [brandInfos, knowledge, products, faqs] = await Promise.all([
    prisma.taaviaBrandInfo.findMany({ where: { tenantId, brandId, status: "ACTIVE" }, select: { id: true, title: true, textContent: true, contentHash: true } }),
    prisma.taaviaBrandKnowledge.findMany({ where: { tenantId, brandId, status: "ACTIVE" }, select: { id: true, title: true, content: true, contentHash: true } }),
    prisma.taaviaBrandProduct.findMany({ where: { tenantId, brandId, status: "ACTIVE" }, select: { id: true, name: true, shortDescription: true, fullDescription: true, contentHash: true } }),
    prisma.taaviaBrandFaq.findMany({ where: { tenantId, brandId, status: "ACTIVE" }, select: { id: true, question: true, answer: true, contentHash: true } }),
  ]);
  return [
    ...brandInfos.map((item) => ({ id: item.id, title: item.title ?? "بدون عنوان", content: item.textContent ?? "", contentHash: item.contentHash, type: "TEXT" as const, sourceGroup: "brand_info" as const })),
    ...knowledge.map((item) => ({ id: item.id, title: item.title, content: item.content, contentHash: item.contentHash, type: "TEXT" as const, sourceGroup: "knowledge" as const })),
    ...products.map((item) => ({ id: item.id, title: item.name, content: `${item.shortDescription ?? ""}\n${item.fullDescription}`, contentHash: item.contentHash, type: "PRODUCT" as const, sourceGroup: "products_services" as const })),
    ...faqs.map((item) => ({ id: item.id, title: item.question, content: `${item.question}\n${item.answer}`, contentHash: item.contentHash, type: "FAQ" as const, sourceGroup: "faq" as const })),
  ];
}

export type SnapshotCompatibilityStatus = "UNCHANGED" | "CHANGED_AFTER_BUILD" | "DELETED";

export function sourceKey(sourceGroup: string, sourceId: string | null | undefined) {
  return sourceId ? `${sourceGroup}:${sourceId}` : null;
}

export function isSnapshotContentUnchanged(
  snapshot: { contentHash: string | null; title: string; content: string | null },
  current: { contentHash: string; title: string; content: string },
) {
  if (snapshot.contentHash && snapshot.contentHash === current.contentHash) return true;
  // Older snapshots stored a hash of the extracted text. The content/title fallback
  // keeps them comparable until their next real UPDATE build writes the source hash.
  return snapshot.title === current.title && (snapshot.content ?? "") === current.content;
}

export function compareSnapshotToCurrentSource(
  snapshot: { originalSourceId: string | null; originalBrandInfoId: string | null; sourceGroup: string; contentHash: string | null; title: string; content: string | null },
  currentByKey: Map<string, KnowledgeBaseBuildSource>,
): SnapshotCompatibilityStatus {
  const key = sourceKey(snapshot.sourceGroup, snapshot.originalSourceId ?? snapshot.originalBrandInfoId);
  if (!key) return "DELETED";
  const current = currentByKey.get(key);
  if (!current) return "DELETED";
  return isSnapshotContentUnchanged(snapshot, current) ? "UNCHANGED" : "CHANGED_AFTER_BUILD";
}

export function compareKnowledgeBaseSources(
  currentSources: KnowledgeBaseBuildSource[],
  snapshots: Array<{ originalSourceId: string | null; originalBrandInfoId: string | null; sourceGroup: string; sourceType: string; contentHash: string | null; title: string; content: string | null }>,
): KnowledgeBaseSynchronization {
  const bySourceKey = new Map(snapshots.map((snapshot) => [`${snapshot.sourceGroup}:${snapshot.originalSourceId ?? snapshot.originalBrandInfoId}`, snapshot]));
  const currentKeys = new Set(currentSources.map((source) => `${source.sourceGroup}:${source.id}`));
  const result = currentSources.reduce((counts, source) => {
    const snapshot = bySourceKey.get(`${source.sourceGroup}:${source.id}`);
    if (!snapshot) counts.added += 1;
    else if (!isSnapshotContentUnchanged(snapshot, source)) counts.edited += 1;
    return counts;
  }, { added: 0, edited: 0, archived: 0 });
  result.archived = snapshots.filter((snapshot) => {
    const sourceId = snapshot.originalSourceId ?? snapshot.originalBrandInfoId;
    return Boolean(sourceId && !currentKeys.has(`${snapshot.sourceGroup}:${sourceId}`));
  }).length;
  return { ...result, isSynchronized: result.added + result.edited + result.archived === 0 };
}
