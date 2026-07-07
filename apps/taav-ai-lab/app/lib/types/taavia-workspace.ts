export type WorkspaceContentKind = 'text' | 'image' | 'video' | 'audio' | 'file';

export type WorkspaceContentMessage = {
  id: string;
  kind: WorkspaceContentKind;
  text?: string;
  fileName?: string;
  objectUrl?: string;
  file?: File;
  createdAt: string;
};

export type WorkspaceSectionKey = 'brand' | 'products' | 'faq';

export type WorkspaceSectionStatus = {
  key: WorkspaceSectionKey;
  label: string;
  isEmpty: boolean;
  hasText: boolean;
  hasFile: boolean;
  hasVoice: boolean;
  itemCount: number;
  isReadyForTransfer: boolean;
  statusLabel: string;
};

export type SerializableWorkspaceContentMessage = Omit<WorkspaceContentMessage, 'file' | 'objectUrl'>;

export type ProductFieldType = 'text' | 'number' | 'textarea' | 'date' | 'select' | 'boolean';

export type ProductFieldOption = {
  id: string;
  label: string;
};

export type ProductField = {
  id: string;
  label: string;
  type: ProductFieldType;
  options?: ProductFieldOption[];
  defaultOptionId?: string | null;
};

export type ProductRow = {
  id: string;
  values: Record<string, string>;
};

export type ProductCatalogSnapshot = {
  fields: ProductField[];
  rows: ProductRow[];
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category?: string;
};

export type BrandSectionTab = {
  id: string;
  parentId: string | null;
  title: string;
  content: string;
  updatedAt: string;
};

export type TaaviaWorkspaceSnapshot = {
  brandMessages: SerializableWorkspaceContentMessage[];
  productMessages: SerializableWorkspaceContentMessage[];
  faqMessages: SerializableWorkspaceContentMessage[];
  productCatalog: ProductCatalogSnapshot;
  faqItems: FaqItem[];
  knowledgeBaseSections: BrandSectionTab[];
  lastTextUpdatedAt: string | null;
  lastKnowledgeBaseSyncAt: string | null;
};

export type KnowledgeBaseCategorySummary = {
  domain: 'brand' | 'products' | 'faq';
  title: string;
  itemCount: number;
  children: string[];
};

export type KnowledgeBaseSyncPayload = {
  workspace: TaaviaWorkspaceSnapshot;
  knowledgeBase: {
    sections: BrandSectionTab[];
    categories: KnowledgeBaseCategorySummary[];
    syncedAt: string;
  };
};
