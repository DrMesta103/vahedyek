import type {
  BrandSectionTab,
  FaqItem,
  ProductCatalogSnapshot,
  WorkspaceContentMessage,
} from '@/app/lib/types/taavia-workspace';
import { collectMessagesText, getContentKindLabel } from '@/app/lib/taavia-workspace-knowledge';

type BrandCategoryDefinition = {
  title: string;
  matchTitles: string[];
  matchKeywords: string[];
};

const BRAND_CATEGORY_DEFINITIONS: BrandCategoryDefinition[] = [
  {
    title: 'هویت برند',
    matchTitles: ['هویت'],
    matchKeywords: ['ماموریت', 'چشم‌انداز', 'معرفی برند', 'هدف برند'],
  },
  {
    title: 'لحن و پیام',
    matchTitles: ['لحن', 'پیام'],
    matchKeywords: ['لحن', 'پیام', 'ارتباط', 'گفتار برند'],
  },
  {
    title: 'ارزش‌های برند',
    matchTitles: ['ارزش'],
    matchKeywords: ['ارزش', 'اعتماد', 'کیفیت', 'تعهد'],
  },
  {
    title: 'مخاطب هدف',
    matchTitles: ['مخاطب'],
    matchKeywords: ['مخاطب', 'مشتری', 'کاربر', 'بخش هدف'],
  },
  {
    title: 'تاریخچه',
    matchTitles: ['تاریخچه', 'داستان'],
    matchKeywords: ['تاریخچه', 'داستان شکل', 'شروع فعالیت', 'تاسیس', 'سال تاسیس'],
  },
];

const PRODUCT_CHUNK_KEYWORDS = [
  'محصول',
  'خدمت',
  'خدمات',
  'سرویس',
  'قیمت',
  'بسته',
  'اشتراک',
  'فروش',
  'مزیت کلیدی',
  'نوع:',
  'قیمت:',
  'ارائه می',
  'کاتالوگ',
  'محصولات',
];

const FAQ_CHUNK_KEYWORDS = ['سوال', 'پرسش', 'پاسخ', 'پرتکرار', 'چرا ', 'چگونه ', 'آیا '];

function scoreTextForCategory(text: string, definition: BrandCategoryDefinition) {
  const normalized = text.toLowerCase();
  let score = 0;

  for (const keyword of [...definition.matchTitles, ...definition.matchKeywords]) {
    const normalizedKeyword = keyword.toLowerCase();
    if (normalized.includes(normalizedKeyword)) {
      score += normalizedKeyword.length >= 4 ? 3 : 2;
    }
  }

  return score;
}

function splitDraftIntoChunks(text: string) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.flatMap((paragraph) => {
    const sentences = paragraph
      .split(/(?<=[.!؟])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean);

    return sentences.length > 1 ? sentences : [paragraph];
  });
}

function pickBestCategoryForChunk(
  chunk: string,
  definitions: BrandCategoryDefinition[],
): BrandCategoryDefinition | null {
  const ranked = definitions
    .map((definition) => ({
      definition,
      score: scoreTextForCategory(chunk, definition),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  if (ranked[0]) {
    return ranked[0].definition;
  }

  return definitions.find((definition) => definition.title === 'هویت برند') ?? definitions[0] ?? null;
}

function scoreChunkForProducts(chunk: string) {
  const normalized = chunk.toLowerCase();
  let score = 0;

  for (const keyword of PRODUCT_CHUNK_KEYWORDS) {
    if (normalized.includes(keyword.toLowerCase())) {
      score += keyword.length >= 4 ? 2 : 1;
    }
  }

  if (/\d{4,}/.test(chunk) && /قیمت|تومان|ریال/.test(chunk)) {
    score += 3;
  }

  return score;
}

function scoreChunkForFaq(chunk: string) {
  let score = 0;

  if (/[؟?]/.test(chunk)) {
    score += 3;
  }

  const normalized = chunk.toLowerCase();
  for (const keyword of FAQ_CHUNK_KEYWORDS) {
    if (normalized.includes(keyword.toLowerCase())) {
      score += 2;
    }
  }

  if (/^(س:|ج:|سوال)/.test(chunk.trim())) {
    score += 4;
  }

  return score;
}

function assignWorkspaceChunk(chunk: string): {
  domain: 'brand' | 'products' | 'faq';
  brandDefinition: BrandCategoryDefinition;
} {
  const productScore = scoreChunkForProducts(chunk);
  const faqScore = scoreChunkForFaq(chunk);
  const brandDefinition =
    pickBestCategoryForChunk(chunk, BRAND_CATEGORY_DEFINITIONS) ?? BRAND_CATEGORY_DEFINITIONS[0]!;
  const brandScore = scoreTextForCategory(chunk, brandDefinition);
  const minSpecializedScore = 2;

  if (productScore >= minSpecializedScore && productScore >= faqScore && productScore > brandScore) {
    return { domain: 'products', brandDefinition };
  }

  if (faqScore >= minSpecializedScore && faqScore > productScore && faqScore > brandScore) {
    return { domain: 'faq', brandDefinition };
  }

  return { domain: 'brand', brandDefinition };
}

function partitionWorkspaceText(sourceText: string) {
  const chunks = splitDraftIntoChunks(sourceText);
  const brandChunksByTitle = new Map<string, string[]>();
  const productChunks: string[] = [];
  const faqChunks: string[] = [];

  for (const chunk of chunks) {
    const { domain, brandDefinition } = assignWorkspaceChunk(chunk);

    if (domain === 'products') {
      productChunks.push(chunk);
      continue;
    }

    if (domain === 'faq') {
      faqChunks.push(chunk);
      continue;
    }

    const list = brandChunksByTitle.get(brandDefinition.title) ?? [];
    list.push(chunk);
    brandChunksByTitle.set(brandDefinition.title, list);
  }

  return { brandChunksByTitle, productChunks, faqChunks };
}

function isDuplicateContent(content: string, existingContents: string[]) {
  const normalized = content.trim().toLowerCase();
  if (!normalized) return true;

  const signature = normalized.slice(0, 60);
  return existingContents.some((existing) => {
    const other = existing.trim().toLowerCase();
    if (!other) return false;
    return other.includes(signature) || signature.includes(other.slice(0, 60));
  });
}

function buildSectionsFromChunks(
  idPrefix: string,
  timestamp: number,
  parentId: string | null,
  title: string,
  chunks: string[],
): BrandSectionTab[] {
  if (chunks.length === 0) return [];

  const sectionId = `${idPrefix}-${timestamp}`;
  const updatedAt = new Date().toISOString();
  const content = chunks.join('\n\n');

  if (chunks.length === 1) {
    return [{ id: sectionId, parentId, title, content, updatedAt }];
  }

  return [
    { id: sectionId, parentId, title, content: chunks[0] ?? content, updatedAt },
    ...chunks.slice(1).map((chunk, index) => ({
      id: `${sectionId}-sub-${index}`,
      parentId: sectionId,
      title: `بخش ${index + 2}`,
      content: chunk,
      updatedAt,
    })),
  ];
}

function buildTopLevelCategorySection(
  idPrefix: string,
  timestamp: number,
  title: string,
  entries: Array<{ title: string; content: string }>,
): BrandSectionTab[] {
  if (entries.length === 0) return [];

  const parentId = `${idPrefix}-${timestamp}`;
  const updatedAt = new Date().toISOString();
  const parentContent = entries.map((entry) => entry.content).join('\n\n');
  const sections: BrandSectionTab[] = [
    {
      id: parentId,
      parentId: null,
      title,
      content: entries.length === 1 ? entries[0]!.content : parentContent,
      updatedAt,
    },
  ];

  if (entries.length > 1) {
    entries.forEach((entry, index) => {
      sections.push({
        id: `${parentId}-sub-${index}`,
        parentId,
        title: entry.title,
        content: entry.content,
        updatedAt,
      });
    });
  }

  return sections;
}

function formatProductRowContent(
  row: ProductCatalogSnapshot['rows'][number],
  fields: ProductCatalogSnapshot['fields'],
  index: number,
) {
  const productName = row.values['product-name']?.trim() || `محصول ${index + 1}`;
  const details = fields
    .map((field) => {
      const value = row.values[field.id]?.trim();
      return value ? `${field.label}: ${value}` : null;
    })
    .filter(Boolean)
    .join('\n');

  return {
    title: productName,
    content: details ? `${productName}\n${details}` : productName,
  };
}

function appendMediaSection(
  sections: BrandSectionTab[],
  idPrefix: string,
  timestamp: number,
  title: string,
  messages: WorkspaceContentMessage[],
) {
  const mediaMessages = messages.filter((message) => message.kind !== 'text');
  if (mediaMessages.length === 0) return;

  const mediaParentId = `${idPrefix}-${timestamp}`;
  const updatedAt = new Date().toISOString();

  sections.push({
    id: mediaParentId,
    parentId: null,
    title,
    content: mediaMessages
      .map((message) => `[${getContentKindLabel(message.kind)}] ${message.fileName ?? 'فایل'}`)
      .join('\n'),
    updatedAt,
  });

  if (mediaMessages.length > 1) {
    mediaMessages.forEach((message, index) => {
      sections.push({
        id: `${mediaParentId}-sub-${index}`,
        parentId: mediaParentId,
        title: message.fileName ?? `رسانه ${index + 1}`,
        content: `[${getContentKindLabel(message.kind)}] ${message.fileName ?? 'فایل ضمیمه'}`,
        updatedAt: message.createdAt,
      });
    });
  }
}

export function deriveCategoriesFromAllSources(
  brandMessages: WorkspaceContentMessage[],
  products: ProductCatalogSnapshot,
  faqItems: FaqItem[],
  productMessages: WorkspaceContentMessage[] = [],
  faqMessages: WorkspaceContentMessage[] = [],
) {
  const timestamp = Date.now();
  const sections: BrandSectionTab[] = [];
  const brandText = collectMessagesText(brandMessages);
  const productFeedText = collectMessagesText(productMessages);
  const faqFeedText = collectMessagesText(faqMessages);
  const { brandChunksByTitle, productChunks, faqChunks } = partitionWorkspaceText(brandText);
  const productFeedChunks = splitDraftIntoChunks(productFeedText);
  const faqFeedChunks = splitDraftIntoChunks(faqFeedText);
  const brandIntroChildren: BrandSectionTab[] = [];
  let brandCategoryIndex = 0;

  for (const definition of BRAND_CATEGORY_DEFINITIONS) {
    const chunks = brandChunksByTitle.get(definition.title);
    if (!chunks?.length) continue;

    brandIntroChildren.push(
      ...buildSectionsFromChunks(
        `section-brand-cat-${brandCategoryIndex++}`,
        timestamp,
        null,
        definition.title,
        chunks,
      ),
    );
  }

  if (brandIntroChildren.length === 0 && brandText.trim()) {
    brandIntroChildren.push(
      ...buildSectionsFromChunks(
        'section-brand-fallback',
        timestamp,
        null,
        'هویت برند',
        splitDraftIntoChunks(brandText),
      ),
    );
  }

  appendMediaSection(brandIntroChildren, 'section-brand-media', timestamp, 'فایل‌ها و رسانه‌های برند', brandMessages);

  if (brandMessages.length > 0 || brandIntroChildren.length > 0) {
    sections.push(...brandIntroChildren);
  }

  const productEntries: Array<{ title: string; content: string }> = [];
  const existingProductContents: string[] = [];

  productChunks.forEach((chunk, index) => {
    if (isDuplicateContent(chunk, existingProductContents)) return;

    productEntries.push({
      title: productChunks.length > 1 ? `استخراج از معرفی ${index + 1}` : 'استخراج از معرفی',
      content: chunk,
    });
    existingProductContents.push(chunk);
  });

  const productRows = products.rows.filter((row) =>
    products.fields.some((field) => row.values[field.id]?.trim()),
  );

  productRows.forEach((row, index) => {
    const formatted = formatProductRowContent(row, products.fields, index);
    if (!formatted.content || isDuplicateContent(formatted.content, existingProductContents)) return;

    productEntries.push(formatted);
    existingProductContents.push(formatted.content);
  });

  productFeedChunks.forEach((chunk, index) => {
    if (isDuplicateContent(chunk, existingProductContents)) return;
    productEntries.push({
      title: productFeedChunks.length > 1 ? `محتوای آزاد ${index + 1}` : 'محتوای آزاد محصول',
      content: chunk,
    });
    existingProductContents.push(chunk);
  });

  if (productEntries.length > 0) {
    sections.push(
      ...buildTopLevelCategorySection('section-products', timestamp, 'محصولات و خدمات', productEntries),
    );
  }

  appendMediaSection(sections, 'section-product-media', timestamp, 'فایل‌ها و رسانه‌های محصول', productMessages);

  const faqEntries: Array<{ title: string; content: string }> = [];
  const existingFaqContents: string[] = [];

  faqChunks.forEach((chunk, index) => {
    if (isDuplicateContent(chunk, existingFaqContents)) return;

    faqEntries.push({
      title: faqChunks.length > 1 ? `استخراج از معرفی ${index + 1}` : 'استخراج از معرفی',
      content: chunk,
    });
    existingFaqContents.push(chunk);
  });

  const validFaqs = faqItems.filter((item) => item.question.trim() && item.answer.trim());
  validFaqs.forEach((item) => {
    const content = `س: ${item.question.trim()}\nج: ${item.answer.trim()}`;
    if (isDuplicateContent(content, existingFaqContents)) return;

    faqEntries.push({
      title: item.question.trim().slice(0, 48) + (item.question.trim().length > 48 ? '…' : ''),
      content,
    });
    existingFaqContents.push(content);
  });

  faqFeedChunks.forEach((chunk, index) => {
    if (isDuplicateContent(chunk, existingFaqContents)) return;
    faqEntries.push({
      title: faqFeedChunks.length > 1 ? `محتوای آزاد ${index + 1}` : 'محتوای آزاد FAQ',
      content: chunk,
    });
    existingFaqContents.push(chunk);
  });

  if (faqEntries.length > 0) {
    sections.push(...buildTopLevelCategorySection('section-faq', timestamp, 'سوالات پرتکرار', faqEntries));
  }

  appendMediaSection(sections, 'section-faq-media', timestamp, 'فایل‌ها و رسانه‌های FAQ', faqMessages);

  return sections;
}

export function mergeKnowledgeBaseSections(
  existing: BrandSectionTab[],
  incoming: BrandSectionTab[],
): BrandSectionTab[] {
  if (existing.length === 0) return incoming;
  if (incoming.length === 0) return existing;

  const merged = [...existing];
  const existingTitles = new Set(existing.map((section) => section.title.trim().toLowerCase()));

  for (const section of incoming) {
    const key = section.title.trim().toLowerCase();
    if (existingTitles.has(key)) continue;
    merged.push(section);
    existingTitles.add(key);
  }

  return merged;
}
