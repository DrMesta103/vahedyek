export const KNOWLEDGE_BASE_VERSION_SOURCE_TABS = ['knowledge', 'products', 'faqs', 'links'] as const;
export type KnowledgeBaseVersionSourceTab = (typeof KNOWLEDGE_BASE_VERSION_SOURCE_TABS)[number];

export const KNOWLEDGE_BASE_VERSION_SOURCE_STATUSES = ['UNCHANGED', 'CHANGED_AFTER_BUILD', 'DELETED'] as const;
export type KnowledgeBaseVersionSourceStatus = (typeof KNOWLEDGE_BASE_VERSION_SOURCE_STATUSES)[number];

export type KnowledgeBaseVersionSourceDetailKind = 'knowledge' | 'product' | 'faq' | 'link';

export type KnowledgeBaseVersionSourceItem = {
  snapshotId: string;
  title: string;
  tab: KnowledgeBaseVersionSourceTab;
  sourceTypeLabel: string;
  sourceTypeKey: string;
  status: KnowledgeBaseVersionSourceStatus;
  snapshotCreatedAt: string | null;
  versionLabel: string;
  createdByDisplayName: string | null;
  updatedByDisplayName: string | null;
  updatedAt: string | null;
  detailKind: KnowledgeBaseVersionSourceDetailKind;
  /** Immutable snapshot payload for the read-only details modal. */
  snapshot: {
    content: string;
    extractedText: string | null;
    previewUrl: string | null;
    url: string | null;
    productShortDescription: string | null;
    productFullDescription: string | null;
    faqQuestion: string | null;
    faqAnswer: string | null;
  };
  /** Live brand source used for comparison modal (null when deleted/unavailable). */
  current: {
    title: string;
    content: string;
    updatedAt: string | null;
  } | null;
};

export type KnowledgeBaseVersionSourcesPageData = {
  businessId: string;
  brandId: string;
  brandName: string;
  knowledgeBaseId: string;
  title: string;
  versionLabel: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string | null;
  summary: {
    total: number;
    unchanged: number;
    changed: number;
    deleted: number;
  };
  tabCounts: Record<KnowledgeBaseVersionSourceTab, number>;
  sources: KnowledgeBaseVersionSourceItem[];
};
