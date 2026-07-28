export type KnowledgeBaseCategoryBuildProgress = {
  id: string;
  status: string;
  progress: number;
  startedAt: string;
  sourceCount: number;
  failureMessage: string | null;
  steps: Array<{
    key: string;
    label: string;
    status: string;
    progress: number;
    errorMessage: string | null;
  }>;
};

export type KnowledgeBaseCategoryLastBuildSummary = {
  id: string;
  buildType: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  sourceCount: number;
};

export type KnowledgeBaseCategoryUpdateStatus = {
  isSynchronized: boolean;
  canStart: boolean;
  changeCount: number;
  reason: string;
};

export type KnowledgeBaseCategoryDetailsPageData = {
  businessId: string;
  brandId: string;
  knowledgeBaseId: string | null;
  brandName: string;
  versionLabel: string;
  isActive: boolean;
  updatedAt: string;
  createdBy: string | null;
  totalCategories: number;
  activeBuild: KnowledgeBaseCategoryBuildProgress | null;
  lastBuild: KnowledgeBaseCategoryLastBuildSummary | null;
  update: KnowledgeBaseCategoryUpdateStatus | null;
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
