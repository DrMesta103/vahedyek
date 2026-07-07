import type {
  FaqItem,
  KnowledgeBaseCategorySummary,
  ProductCatalogSnapshot,
  SerializableWorkspaceContentMessage,
  WorkspaceContentMessage,
  WorkspaceSectionKey,
  WorkspaceSectionStatus,
} from '@/app/lib/types/taavia-workspace';

const SECTION_LABELS: Record<WorkspaceSectionKey, string> = {
  brand: 'معرفی برند',
  products: 'معرفی محصول',
  faq: 'سوالات پرتکرار',
};

export function getContentKindLabel(kind: WorkspaceContentMessage['kind']) {
  switch (kind) {
    case 'text':
      return 'متن';
    case 'image':
      return 'تصویر';
    case 'video':
      return 'ویدئو';
    case 'audio':
      return 'صوت';
    default:
      return 'فایل';
  }
}

export function createTextMessage(text: string): WorkspaceContentMessage {
  return {
    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    kind: 'text',
    text,
    createdAt: new Date().toISOString(),
  };
}

export function createFileMessage(file: File, kind: WorkspaceContentMessage['kind']): WorkspaceContentMessage {
  const shouldPreview = kind === 'image' || kind === 'video' || kind === 'audio';
  return {
    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    kind,
    fileName: file.name,
    file,
    objectUrl: shouldPreview ? URL.createObjectURL(file) : undefined,
    createdAt: new Date().toISOString(),
  };
}

export function classifyFileKind(file: File): WorkspaceContentMessage['kind'] {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'file';
}

export function collectMessagesText(messages: WorkspaceContentMessage[] | SerializableWorkspaceContentMessage[]) {
  return messages
    .map((message) => {
      if (message.kind === 'text') return message.text?.trim() ?? '';
      return `[${getContentKindLabel(message.kind)}: ${message.fileName ?? 'فایل'}]`;
    })
    .filter(Boolean)
    .join('\n\n');
}

function analyzeMessages(messages: WorkspaceContentMessage[] | SerializableWorkspaceContentMessage[]) {
  const hasText = messages.some((message) => message.kind === 'text' && Boolean(message.text?.trim()));
  const hasFile = messages.some((message) => message.kind === 'file' || message.kind === 'image' || message.kind === 'video');
  const hasVoice = messages.some((message) => message.kind === 'audio');
  return { hasText, hasFile, hasVoice, itemCount: messages.length };
}

function hasStructuredProductData(catalog: ProductCatalogSnapshot) {
  return catalog.rows.some((row) => catalog.fields.some((field) => row.values[field.id]?.trim()));
}

function hasStructuredFaqData(items: FaqItem[]) {
  return items.some((item) => item.question.trim() || item.answer.trim());
}

function buildStatusLabel(input: {
  isEmpty: boolean;
  hasText: boolean;
  hasFile: boolean;
  hasVoice: boolean;
  structuredCount?: number;
}) {
  if (input.isEmpty) return 'خالی';
  const parts: string[] = [];
  if (input.hasText || (input.structuredCount ?? 0) > 0) parts.push('دارای متن');
  if (input.hasFile) parts.push('دارای فایل');
  if (input.hasVoice) parts.push('دارای ویس');
  if (parts.length === 0) return 'آماده انتقال';
  return parts.join(' · ');
}

export function getWorkspaceSectionStatuses(input: {
  brandMessages: WorkspaceContentMessage[];
  productMessages: WorkspaceContentMessage[];
  faqMessages: WorkspaceContentMessage[];
  productCatalog: ProductCatalogSnapshot;
  faqItems: FaqItem[];
}): WorkspaceSectionStatus[] {
  const brandAnalysis = analyzeMessages(input.brandMessages);
  const productAnalysis = analyzeMessages(input.productMessages);
  const faqAnalysis = analyzeMessages(input.faqMessages);
  const structuredProducts = hasStructuredProductData(input.productCatalog);
  const structuredFaqs = hasStructuredFaqData(input.faqItems);

  const brandEmpty = brandAnalysis.itemCount === 0;
  const productsEmpty = productAnalysis.itemCount === 0 && !structuredProducts;
  const faqEmpty = faqAnalysis.itemCount === 0 && !structuredFaqs;

  return [
    {
      key: 'brand',
      label: SECTION_LABELS.brand,
      isEmpty: brandEmpty,
      hasText: brandAnalysis.hasText,
      hasFile: brandAnalysis.hasFile,
      hasVoice: brandAnalysis.hasVoice,
      itemCount: brandAnalysis.itemCount,
      isReadyForTransfer: !brandEmpty,
      statusLabel: buildStatusLabel({ ...brandAnalysis, isEmpty: brandEmpty }),
    },
    {
      key: 'products',
      label: SECTION_LABELS.products,
      isEmpty: productsEmpty,
      hasText: productAnalysis.hasText || structuredProducts,
      hasFile: productAnalysis.hasFile,
      hasVoice: productAnalysis.hasVoice,
      itemCount: productAnalysis.itemCount + (structuredProducts ? input.productCatalog.rows.length : 0),
      isReadyForTransfer: !productsEmpty,
      statusLabel: buildStatusLabel({
        ...productAnalysis,
        isEmpty: productsEmpty,
        hasText: productAnalysis.hasText || structuredProducts,
        structuredCount: structuredProducts ? input.productCatalog.rows.length : 0,
      }),
    },
    {
      key: 'faq',
      label: SECTION_LABELS.faq,
      isEmpty: faqEmpty,
      hasText: faqAnalysis.hasText || structuredFaqs,
      hasFile: faqAnalysis.hasFile,
      hasVoice: faqAnalysis.hasVoice,
      itemCount: faqAnalysis.itemCount + input.faqItems.filter((item) => item.question.trim() || item.answer.trim()).length,
      isReadyForTransfer: !faqEmpty,
      statusLabel: buildStatusLabel({
        ...faqAnalysis,
        isEmpty: faqEmpty,
        hasText: faqAnalysis.hasText || structuredFaqs,
        structuredCount: input.faqItems.length,
      }),
    },
  ];
}

export function hasAnyWorkspaceData(input: {
  brandMessages: WorkspaceContentMessage[];
  productMessages: WorkspaceContentMessage[];
  faqMessages: WorkspaceContentMessage[];
  productCatalog: ProductCatalogSnapshot;
  faqItems: FaqItem[];
}) {
  return getWorkspaceSectionStatuses(input).some((section) => section.isReadyForTransfer);
}

export function serializeWorkspaceMessages(messages: WorkspaceContentMessage[]): SerializableWorkspaceContentMessage[] {
  return messages.map(({ file: _file, objectUrl: _objectUrl, ...message }) => message);
}

export function hydrateWorkspaceMessages(messages: SerializableWorkspaceContentMessage[]): WorkspaceContentMessage[] {
  return messages.map((message) => ({ ...message }));
}

export function buildKnowledgeBaseCategorySummaries(
  sections: Array<{ title: string; parentId: string | null }>,
): KnowledgeBaseCategorySummary[] {
  const topLevel = sections.filter((section) => section.parentId === null);
  const domainMatchers: Array<{ domain: KnowledgeBaseCategorySummary['domain']; keywords: string[] }> = [
    { domain: 'products', keywords: ['محصول', 'خدمات'] },
    { domain: 'faq', keywords: ['سوالات', 'پرتکرار', 'سوال'] },
    { domain: 'brand', keywords: ['هویت', 'لحن', 'ارزش', 'مخاطب', 'تاریخچه', 'رسانه', 'فایل'] },
  ];

  const grouped = new Map<KnowledgeBaseCategorySummary['domain'], KnowledgeBaseCategorySummary>();

  for (const section of topLevel) {
    const matchedDomain =
      domainMatchers.find((matcher) => matcher.keywords.some((keyword) => section.title.includes(keyword)))?.domain ??
      'brand';

    const children = sections
      .filter((item) => item.parentId && sections.find((parent) => parent.title === section.title))
      .map((item) => item.title);

    const current = grouped.get(matchedDomain);
    if (current) {
      current.itemCount += 1;
      current.children.push(section.title);
      continue;
    }

    grouped.set(matchedDomain, {
      domain: matchedDomain,
      title:
        matchedDomain === 'products'
          ? 'Product Introduction'
          : matchedDomain === 'faq'
            ? 'FAQ'
            : 'Brand Introduction',
      itemCount: 1,
      children: [section.title],
    });
  }

  return Array.from(grouped.values());
}

export function buildTransferPreviewLines(input: {
  sectionStatuses: WorkspaceSectionStatus[];
  categorySummaries: KnowledgeBaseCategorySummary[];
}) {
  const readySections = input.sectionStatuses.filter((section) => section.isReadyForTransfer);
  const lines = readySections.map(
    (section) => `${section.label}: ${section.itemCount} مورد (${section.statusLabel})`,
  );

  if (input.categorySummaries.length > 0) {
    lines.push(
      ...input.categorySummaries.map(
        (category) => `${category.title}: ${formatNumberFa(category.itemCount)} دسته`,
      ),
    );
  }

  return lines;
}

function formatNumberFa(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value);
}
