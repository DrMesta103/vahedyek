import type {
  ProductCatalogSnapshot,
  SerializableWorkspaceContentMessage,
  WorkspaceContentKind,
} from '@/app/lib/types/taavia-workspace';

export type TestFaqPriority = 'low' | 'medium' | 'high';

export type TestFaqItem = {
  id: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
  priority?: TestFaqPriority;
  isActive: boolean;
  supplementaryNote?: string;
};

export type TestRequirementStatus = 'completed' | 'optional' | 'empty';

export type TestRequirementCard = {
  id: string;
  label: string;
  description: string;
  relatedTab: 'brand' | 'products' | 'faq' | 'support';
  status: TestRequirementStatus;
};

export type TestAttachmentRef = {
  id: string;
  kind: WorkspaceContentKind;
  fileName?: string;
  objectUrl?: string;
  label: string;
};

/** @deprecated legacy nested section — use TestKnowledgeBaseTab */
export type TestKnowledgeBaseSection = {
  id: string;
  title: string;
  body: string;
  attachments: TestAttachmentRef[];
  subsections?: TestKnowledgeBaseSection[];
};

/** @deprecated legacy category — use TestKnowledgeBaseTab */
export type TestKnowledgeBaseCategory = {
  id: string;
  title: string;
  subtitle?: string;
  sections: TestKnowledgeBaseSection[];
};

export type TestKnowledgeBaseSubTab = {
  id: string;
  title: string;
  body: string;
  attachments: TestAttachmentRef[];
  updatedAt: string;
};

export type TestKnowledgeBaseTab = {
  id: string;
  title: string;
  body: string;
  attachments: TestAttachmentRef[];
  subTabs: TestKnowledgeBaseSubTab[];
  updatedAt: string;
};

export type TestKnowledgeBaseDocument = {
  title: string;
  brandName: string;
  builtAt: string;
  lastSavedAt: string | null;
  tabs: TestKnowledgeBaseTab[];
};

export type TestWorkspaceSnapshot = {
  brandMessages: SerializableWorkspaceContentMessage[];
  productCatalog: ProductCatalogSnapshot;
  faqItems: TestFaqItem[];
  knowledgeBaseDocument: TestKnowledgeBaseDocument | null;
  lastBuiltAt: string | null;
};

export type TestWorkspaceCounts = {
  brandItems: number;
  productRows: number;
  faqItems: number;
  total: number;
};

export type TestStatusWarning = {
  id: string;
  message: string;
};

export type TestSectionCompletionStatus = 'completed' | 'incomplete' | 'empty';

export type TestStatusReportSection = {
  id: string;
  title: string;
  status: TestSectionCompletionStatus;
  stats: string[];
};
