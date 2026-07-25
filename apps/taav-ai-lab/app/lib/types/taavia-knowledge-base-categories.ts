export type KnowledgeBaseCategoryLevel = 1 | 2;

export type KnowledgeBaseCategorySourceReference = {
  sourceSnapshotId: string;
  originalBrandSourceId: string | null;
  title: string;
  sourceType: 'DOCX' | 'PDF' | 'PNG' | 'URL';
  snapshotLabel: string;
  usedAt: string;
  previewRoute: string | null;
};

/** The UI type enforces exactly two category depths: nodes cannot own children. */
export type KnowledgeBaseCategoryTreeNode = {
  categoryId: string;
  knowledgeBaseId: string;
  businessId: string;
  brandId: string;
  title: string;
  slug: string;
  level: KnowledgeBaseCategoryLevel;
  parentCategoryId: string | null;
  childCount: number;
};

export type KnowledgeBaseCategoryDetail = KnowledgeBaseCategoryTreeNode & {
  content: string[];
  createdAt: string;
  updatedAt: string;
  sources: KnowledgeBaseCategorySourceReference[];
};

export type KnowledgeBaseCategoriesPageData = {
  businessId: string;
  brandId: string;
  knowledgeBaseId: string;
  activeVersionLabel: string;
  updatedAt: string;
  categories: KnowledgeBaseCategoryDetail[];
};
