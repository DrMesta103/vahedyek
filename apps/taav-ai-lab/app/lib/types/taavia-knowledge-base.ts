export type KnowledgeBaseSourceCounts = {
  brandInfo: number;
  productsAndServices: number;
  faqs: number;
  files: number;
  links: number;
  needsReview: number;
};

/** Live, editable sources that currently belong to the selected brand. */
export type CurrentBrandSourcesSummary = KnowledgeBaseSourceCounts & {
  updatedAt: string;
};

/** Immutable source snapshot captured when a specific Knowledge Base version was built. */
export type KnowledgeBaseVersionSourcesSummary = KnowledgeBaseSourceCounts & {
  version: string;
  capturedAt: string;
};

export type KnowledgeBaseVersionSummary = {
  version: string;
  buildType: string;
  createdAt: string;
  categoryCount: number;
  subcategoryCount: number;
  createdBy: string;
  health: 'healthy';
};

export type KnowledgeBaseBuildSummary = {
  buildType: string;
  status: 'successful';
  generatedVersion: string;
  sourceCount: number;
  startedAt: string;
  finishedAt: string;
};

export type KnowledgeBasePendingChanges = {
  added: number;
  edited: number;
  removed: number;
  total: number;
};

export type KnowledgeBaseOverview = {
  businessId: string;
  brandId: string;
  activeVersion: KnowledgeBaseVersionSummary;
  currentBrandSources: CurrentBrandSourcesSummary;
  activeVersionSources: KnowledgeBaseVersionSourcesSummary;
  pendingChanges: KnowledgeBasePendingChanges;
  latestBuild: KnowledgeBaseBuildSummary;
  output: {
    categoryCount: number;
    subcategoryCount: number;
  };
  health: {
    sourceCompleteness: number;
    contentQuality: number;
  };
};
