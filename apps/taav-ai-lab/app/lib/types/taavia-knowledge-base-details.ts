export type KnowledgeBaseDetailsReadModel = {
  businessId: string;
  brandId: string;
  knowledgeBaseId: string;
  versionLabel: string;
  isActive: boolean;
  build: {
    id: string | null;
    type: string;
    status: string;
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
    duration: string | null;
    inputSourceCount: number;
    createdBy: string | null;
  };
  summary: {
    rootCategoryCount: number;
    subcategoryCount: number;
    snapshotCount: number;
    storedContentSizeBytes: number | null;
  };
  synchronization: {
    added: number;
    edited: number;
    archived: number;
    isSynchronized: boolean;
  };
  update: {
    canStart: boolean;
    reason: string;
    activeBuildId: string | null;
  };
  sourceGroups: Array<{ key: string; label: string; count: number }>;
  categories: Array<{ id: string; title: string; childCount: number; sourceCount: number }>;
  sources: Array<{ id: string; title: string; type: string; group: string; createdAt: string }>;
};
