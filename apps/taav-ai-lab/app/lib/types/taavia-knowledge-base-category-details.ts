export type KnowledgeBaseCategoryDetailsPageData = {
  businessId: string;
  brandId: string;
  knowledgeBaseId: string;
  brandName: string;
  versionLabel: string;
  isActive: boolean;
  updatedAt: string;
  createdBy: string | null;
  totalCategories: number;
  categories: Array<{
    id: string;
    title: string;
    level: 1 | 2;
    parentCategoryId: string | null;
    parentTitle: string | null;
    content: string;
    sourceCount: number;
    childrenCount: number;
    resourceTypeLabels: string[];
    resources: Array<{
      snapshotId: string;
      title: string;
      sourceType: string;
      sourceTypeLabel: string;
      snapshotDate: string;
      versionLabel: string;
      href: string;
    }>;
  }>;
};
