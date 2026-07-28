import type { KnowledgeBaseCategoryDetailsPageData } from '@/app/lib/types/taavia-knowledge-base-category-details';
import type { CategoryEditNode } from '@/app/lib/types/taavia-knowledge-base-manual-draft';

type CategorySeed = KnowledgeBaseCategoryDetailsPageData['categories'][number];

function recomputeEdited(node: CategoryEditNode): boolean {
  if (!node.baseline) return true;
  if (node.isPendingDeletion) return true;
  return (
    node.title !== node.baseline.title ||
    node.content !== node.baseline.content ||
    node.parentId !== node.baseline.parentId ||
    node.order !== node.baseline.order
  );
}

function withEdited(node: CategoryEditNode): CategoryEditNode {
  return { ...node, isEdited: recomputeEdited(node) };
}

export function createCategoryEditNodes(categories: CategorySeed[]): CategoryEditNode[] {
  const parents = categories.filter((item) => item.level === 1);
  const parentOrder = new Map(parents.map((item, index) => [item.id, index + 1]));
  const childOrderByParent = new Map<string, number>();

  return categories.map((item) => {
    let order = 1;
    if (item.level === 1) {
      order = parentOrder.get(item.id) ?? 1;
    } else if (item.parentCategoryId) {
      const next = (childOrderByParent.get(item.parentCategoryId) ?? 0) + 1;
      childOrderByParent.set(item.parentCategoryId, next);
      order = next;
    }

    const baseline = {
      parentId: item.parentCategoryId,
      title: item.title,
      content: item.content ?? '',
      order,
    };

    return {
      id: item.id,
      parentId: item.parentCategoryId,
      title: item.title,
      content: item.content ?? '',
      order,
      level: item.level,
      unlocked: false,
      isEdited: false,
      isManualVsAi: false,
      isPendingDeletion: false,
      sourceCount: item.sourceCount,
      resources: item.resources.map((resource) => ({
        snapshotId: resource.snapshotId,
        title: resource.title,
        sourceTypeLabel: resource.sourceTypeLabel,
        snapshotDate: resource.snapshotDate,
        versionLabel: resource.versionLabel,
      })),
      baseline,
    } satisfies CategoryEditNode;
  });
}

export function getEditRoots(nodes: CategoryEditNode[]): CategoryEditNode[] {
  return nodes.filter((node) => node.level === 1).sort((a, b) => a.order - b.order);
}

export function getEditChildren(nodes: CategoryEditNode[], parentId: string): CategoryEditNode[] {
  return nodes.filter((node) => node.parentId === parentId).sort((a, b) => a.order - b.order);
}

export function hasPendingCategoryEdits(nodes: CategoryEditNode[]): boolean {
  return nodes.some((node) => node.isEdited || node.isPendingDeletion);
}

export function unlockCategoryNode(nodes: CategoryEditNode[], id: string): CategoryEditNode[] {
  return nodes.map((node) => (node.id === id ? { ...node, unlocked: true } : node));
}

export function updateCategoryNodeFields(
  nodes: CategoryEditNode[],
  id: string,
  patch: Partial<Pick<CategoryEditNode, 'title' | 'content' | 'parentId' | 'order'>>,
): CategoryEditNode[] {
  return nodes.map((node) => {
    if (node.id !== id) return node;
    const next: CategoryEditNode = {
      ...node,
      ...patch,
      level: patch.parentId !== undefined ? (patch.parentId ? 2 : 1) : node.level,
    };
    return withEdited(next);
  });
}

export function createCategoryNode(input: {
  nodes: CategoryEditNode[];
  title: string;
  parentId: string | null;
}): { nodes: CategoryEditNode[]; id: string } {
  const id = `edit-${crypto.randomUUID()}`;
  const level: 1 | 2 = input.parentId ? 2 : 1;
  const siblings = input.nodes.filter((node) =>
    input.parentId ? node.parentId === input.parentId : node.level === 1,
  );
  const order = siblings.reduce((max, node) => Math.max(max, node.order), 0) + 1;

  const created: CategoryEditNode = {
    id,
    parentId: input.parentId,
    title: input.title.trim() || 'دسته‌بندی جدید',
    content: '',
    order,
    level,
    unlocked: true,
    isEdited: true,
    isManualVsAi: false,
    isPendingDeletion: false,
    sourceCount: 0,
    resources: [],
    baseline: null,
  };

  return { nodes: [...input.nodes, created], id };
}

export function markCategoryNodeDeleted(nodes: CategoryEditNode[], id: string): CategoryEditNode[] {
  const target = nodes.find((node) => node.id === id);
  if (!target) return nodes;

  if (!target.baseline) {
    const removeIds = new Set<string>([id, ...nodes.filter((node) => node.parentId === id).map((node) => node.id)]);
    return nodes.filter((node) => !removeIds.has(node.id));
  }

  return nodes.map((node) => {
    if (node.id === id || node.parentId === id) {
      return withEdited({ ...node, isPendingDeletion: true, unlocked: true });
    }
    return node;
  });
}

export function restoreCategoryNode(nodes: CategoryEditNode[], id: string): CategoryEditNode[] {
  return nodes.map((node) => {
    if (node.id !== id && node.parentId !== id) return node;
    return withEdited({ ...node, isPendingDeletion: false });
  });
}

export function moveCategoryNode(
  nodes: CategoryEditNode[],
  id: string,
  destinationParentId: string | null,
  order: number,
): CategoryEditNode[] {
  const target = nodes.find((node) => node.id === id);
  if (!target) return nodes;
  if (destinationParentId === id) return nodes;

  const childCount = nodes.filter((node) => node.parentId === id).length;
  if (destinationParentId && childCount > 0) return nodes;

  if (destinationParentId) {
    const parent = nodes.find((node) => node.id === destinationParentId);
    if (!parent || parent.level !== 1 || parent.isPendingDeletion) return nodes;
  }

  return updateCategoryNodeFields(nodes, id, {
    parentId: destinationParentId,
    order: Math.max(1, order),
  }).map((node) => (node.id === id ? { ...node, unlocked: true } : node));
}

/** Reorder siblings within the same parent (or among roots). */
export function reorderCategorySiblings(
  nodes: CategoryEditNode[],
  orderedIds: string[],
  parentId: string | null,
): CategoryEditNode[] {
  const idSet = new Set(orderedIds);
  return nodes.map((node) => {
    const belongs = parentId ? node.parentId === parentId : node.level === 1 && !node.parentId;
    if (!belongs || !idSet.has(node.id)) return node;
    const order = orderedIds.indexOf(node.id) + 1;
    return withEdited({ ...node, order, unlocked: true });
  });
}

export function resetCategoryNodesToBaseline(nodes: CategoryEditNode[]): CategoryEditNode[] {
  return nodes
    .filter((node) => node.baseline)
    .map((node) => ({
      ...node,
      parentId: node.baseline!.parentId,
      title: node.baseline!.title,
      content: node.baseline!.content,
      order: node.baseline!.order,
      level: node.baseline!.parentId ? 2 : 1,
      unlocked: false,
      isEdited: false,
      isPendingDeletion: false,
    }));
}

/** After successful "send to AI", treat current tree as the new baseline. */
export function commitCategoryNodesAsBaseline(nodes: CategoryEditNode[]): CategoryEditNode[] {
  return nodes
    .filter((node) => !node.isPendingDeletion)
    .map((node) => {
      const wasManualChange = node.isEdited || !node.baseline || node.isManualVsAi;
      return {
        ...node,
        unlocked: false,
        isEdited: false,
        isManualVsAi: wasManualChange,
        isPendingDeletion: false,
        baseline: {
          parentId: node.parentId,
          title: node.title,
          content: node.content,
          order: node.order,
        },
      };
    });
}
