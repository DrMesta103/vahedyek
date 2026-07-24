export const KNOWLEDGE_BASE_SOURCE_SNAPSHOT_TYPES = ['BRAND_INFO', 'PRODUCTS_SERVICES', 'FAQ', 'FILE', 'IMAGE', 'LINK'] as const;
export type KnowledgeBaseSourceSnapshotType = (typeof KNOWLEDGE_BASE_SOURCE_SNAPSHOT_TYPES)[number];

export const KNOWLEDGE_BASE_SOURCE_COMPARISON_STATUSES = [
  'UNCHANGED',
  'CHANGED_AFTER_BUILD',
  'CURRENT_SOURCE_DELETED',
  'CURRENT_SOURCE_UNAVAILABLE',
] as const;
export type KnowledgeBaseSourceComparisonStatus = (typeof KNOWLEDGE_BASE_SOURCE_COMPARISON_STATUSES)[number];

/** Immutable record captured while building a selected brand's Knowledge Base. */
export type KnowledgeBaseSourceSnapshot = {
  snapshotId: string;
  knowledgeBaseId: string;
  originalBrandSourceId: string | null;
  sourceType: KnowledgeBaseSourceSnapshotType;
  /** Category of the original source; may differ from the source's media type. */
  sourceGroup?: 'brand_info' | 'products_services' | 'faq' | 'file' | 'link';
  title: string;
  snapshotReference: string;
  snapshotCreatedAt: string;
  buildId?: string;
  buildLabel?: string;
  comparisonStatus: KnowledgeBaseSourceComparisonStatus;
  currentBrandSourceExists: boolean;
  /** Immutable file payload metadata when the snapshot represents a media source. */
  fileSnapshot?: {
    fileType: string;
    fileSize: string;
    extractionStatus: 'EXTRACTED' | 'UNAVAILABLE';
    extractedWordCount: number;
    previewUrl: string | null;
    extractedText: string[];
  };
};

export type KnowledgeBaseSourceSnapshotTypeCount = {
  type: KnowledgeBaseSourceSnapshotType;
  count: number;
};

export type KnowledgeBaseSourceSnapshotSummary = {
  total: number;
  typeCounts: KnowledgeBaseSourceSnapshotTypeCount[];
};

export type KnowledgeBaseSourceSnapshotsPageData = {
  businessId: string;
  brandId: string;
  knowledgeBaseId: string;
  summary: KnowledgeBaseSourceSnapshotSummary;
  snapshots: KnowledgeBaseSourceSnapshot[];
};

export type KnowledgeBaseSourceSnapshotMetadata = {
  contentType: string;
  sourceGroup: string;
  contentLanguage: string;
  wordCount: number;
  characterCount: number;
  originalBrandSourceIdentifier: string | null;
};

/** Fully immutable detail view for a single captured Knowledge Base source. */
export type KnowledgeBaseSourceSnapshotDetail = KnowledgeBaseSourceSnapshot & {
  businessId: string;
  brandId: string;
  buildId: string;
  buildLabel: string;
  content: string[];
  lastComparedAt: string | null;
  metadata: KnowledgeBaseSourceSnapshotMetadata;
};

export type KnowledgeBaseTextSnapshotDetail = KnowledgeBaseSourceSnapshotDetail & {
  detailMode: 'TEXT';
};

export type KnowledgeBaseFileSnapshotDetail = KnowledgeBaseSourceSnapshotDetail & {
  detailMode: 'FILE';
  file: {
    fileType: string;
    fileSize: string;
    extractionStatus: 'EXTRACTED' | 'UNAVAILABLE';
    extractedWordCount: number;
    previewUrl: string | null;
    extractedText: string[];
  };
};

export type KnowledgeBaseSourceSnapshotDetailView = KnowledgeBaseTextSnapshotDetail | KnowledgeBaseFileSnapshotDetail;

export type KnowledgeBaseSourceSimpleComparisonStatus = 'UNCHANGED' | 'CHANGED' | 'CURRENT_SOURCE_DELETED' | 'CURRENT_SOURCE_UNAVAILABLE';

/** Phase 1 comparison: complete read-only texts and one simple equality result only. */
export type KnowledgeBaseSourceSimpleComparison = {
  businessId: string;
  brandId: string;
  snapshotId: string;
  originalBrandSourceId: string | null;
  title: string;
  sourceType: KnowledgeBaseSourceSnapshotType;
  snapshotContent: string[];
  snapshotCreatedAt: string;
  buildId: string;
  buildLabel: string;
  currentSourceContent: string[] | null;
  currentSourceUpdatedAt: string | null;
  currentSourceExists: boolean;
  comparisonStatus: KnowledgeBaseSourceSimpleComparisonStatus;
};
