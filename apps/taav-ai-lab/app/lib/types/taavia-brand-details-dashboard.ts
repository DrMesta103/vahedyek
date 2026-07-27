export type TaaviaBrandCurrentSourceSummary = {
  brandInfo: number;
  productsServices: number;
  faqs: number;
  filesDocuments: number;
  links: number;
};

export type TaaviaBrandKnowledgeBaseListItem = {
  knowledgeBaseId: string;
  brandId: string;
  versionLabel: string;
  isActive: boolean;
  buildType: string;
  buildId: string;
  createdAt: string;
  categoryCount: number;
  sourceSnapshotCount: number;
  description: string;
};

export type TaaviaBrandBuildListItem = {
  buildId: string;
  brandId: string;
  buildType: string;
  status: string;
  statusTone: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  progress: number;
  startedAt: string;
  finishedAt: string | null;
  knowledgeBaseId: string | null;
  versionLabel: string | null;
  failureMessage: string | null;
  sourceCount: number;
  isInProgress: boolean;
};

export type TaaviaBrandModelSlotSummary = {
  purpose: string;
  label: string;
  modelName: string | null;
  accountName: string | null;
  assigned: boolean;
};

export type TaaviaBrandDetailsOverview = {
  businessId: string;
  brandId: string;
  website: string;
  country: string;
  industry: string;
  currentSources: TaaviaBrandCurrentSourceSummary;
  modelSlots: TaaviaBrandModelSlotSummary[];
  knowledgeBases: TaaviaBrandKnowledgeBaseListItem[];
  builds: TaaviaBrandBuildListItem[];
  chatbot: { ready: boolean; lastKnowledgeUpdatedAt: string };
};
