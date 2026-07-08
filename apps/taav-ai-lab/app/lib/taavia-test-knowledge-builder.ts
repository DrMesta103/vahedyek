import type { TaaviaUseCaseKey } from '@/app/lib/types/domain';
import type { ProductCatalogSnapshot, WorkspaceContentMessage } from '@/app/lib/types/taavia-workspace';
import { collectMessagesText, getContentKindLabel } from '@/app/lib/taavia-workspace-knowledge';
import { deriveCategoriesFromAllSources } from '@/app/lib/taavia-workspace-categorization';
import { hasSupportKnowledgeUseCase } from '@/app/lib/taavia-test-requirements';
import { createTestKbId } from '@/app/lib/taavia-test-knowledge-migrate';
import type {
  TestAttachmentRef,
  TestFaqItem,
  TestKnowledgeBaseDocument,
  TestKnowledgeBaseSourceRef,
  TestKnowledgeBaseSubTab,
  TestKnowledgeBaseTab,
} from '@/app/lib/types/taavia-test-workspace';

type SubTabDraft = Omit<TestKnowledgeBaseSubTab, 'updatedAt'> & { updatedAt?: string };
type TabDraft = Omit<TestKnowledgeBaseTab, 'updatedAt' | 'subTabs'> & {
  updatedAt?: string;
  subTabs: SubTabDraft[];
};

function stampTab(tab: TabDraft, stamp: string): TestKnowledgeBaseTab {
  return {
    ...tab,
    updatedAt: tab.updatedAt ?? stamp,
    subTabs: tab.subTabs.map((sub) => ({
      ...sub,
      updatedAt: sub.updatedAt ?? stamp,
    })),
  };
}

function createSource(id: string, label: string, detail?: string): TestKnowledgeBaseSourceRef {
  return { id, label, detail };
}

function mapMessagesToAttachments(messages: WorkspaceContentMessage[]): TestAttachmentRef[] {
  return messages
    .filter((message) => message.kind !== 'text')
    .map((message) => ({
      id: message.id,
      kind: message.kind,
      fileName: message.fileName,
      objectUrl: message.objectUrl,
      label: `${getContentKindLabel(message.kind)}${message.fileName ? `: ${message.fileName}` : ''}`,
    }));
}

function mapBrandSources(messages: WorkspaceContentMessage[]): TestKnowledgeBaseSourceRef[] {
  return messages.map((message, index) =>
    createSource(
      message.id,
      message.kind === 'text' ? `متن برند ${index + 1}` : `رسانه برند ${index + 1}`,
      message.kind === 'text' ? message.text?.trim().slice(0, 140) : message.fileName ?? getContentKindLabel(message.kind),
    ),
  );
}

function mapProductRowSources(
  catalog: ProductCatalogSnapshot,
  row: ProductCatalogSnapshot['rows'][number],
  index: number,
): TestKnowledgeBaseSourceRef[] {
  const detail = catalog.fields
    .map((field) => {
      const value = row.values[field.id]?.trim();
      return value ? `${field.label}: ${value}` : null;
    })
    .filter(Boolean)
    .join(' | ');

  return [createSource(row.id, `ردیف محصول ${index + 1}`, detail)];
}

function mapFaqSources(item: TestFaqItem, index: number): TestKnowledgeBaseSourceRef[] {
  return [
    createSource(
      item.id,
      `FAQ ${index + 1}`,
      `سوال: ${item.question}${item.category ? ` | دسته: ${item.category}` : ''}`,
    ),
  ];
}

function buildBrandTab(
  brandMessages: WorkspaceContentMessage[],
  productCatalog: ProductCatalogSnapshot,
  faqItems: TestFaqItem[],
): TabDraft | null {
  if (brandMessages.length === 0) return null;

  const derived = deriveCategoriesFromAllSources(brandMessages, productCatalog, faqItems, [], []);
  const brandDerived = derived.filter(
    (section) => !section.title.includes('محصول') && !section.title.includes('سوالات') && !section.title.includes('FAQ'),
  );

  const subTabs: SubTabDraft[] = [];
  const mediaAttachments = mapMessagesToAttachments(brandMessages);
  const brandSources = mapBrandSources(brandMessages);

  for (const section of brandDerived.filter((s) => s.parentId === null)) {
    const children = brandDerived.filter((child) => child.parentId === section.id);
    const isMedia = section.title.includes('رسانه') || section.title.includes('فایل');

    if (children.length > 0) {
      if (section.content.trim()) {
        subTabs.push({
          id: section.id,
          title: section.title,
          body: section.content,
          attachments: isMedia ? mediaAttachments : [],
          sources: brandSources,
        });
      }

      for (const child of children) {
        subTabs.push({
          id: child.id,
          title: child.title,
          body: child.content,
          attachments: [],
          sources: brandSources,
        });
      }
    } else if (section.content.trim() || isMedia) {
      subTabs.push({
        id: section.id,
        title: section.title,
        body: section.content || 'فایل‌ها و رسانه‌های برند',
        attachments: isMedia ? mediaAttachments : [],
        sources: brandSources,
      });
    }
  }

  if (subTabs.length === 0) {
    const text = collectMessagesText(brandMessages);
    return {
      id: createTestKbId('tab-brand'),
      title: 'دانش برند',
      body: text || 'محتوای متنی ثبت نشده و فقط فایل یا رسانه موجود است.',
      attachments: mediaAttachments,
      sources: brandSources,
      subTabs: [],
    };
  }

  const brandSummary = collectMessagesText(brandMessages).trim();
  const summaryParts = [
    brandSummary || null,
    subTabs.length > 0 ? `${subTabs.length} بخش برای دانش برند ساخته شده است.` : null,
    mediaAttachments.length > 0 ? `${mediaAttachments.length} فایل یا رسانه به این تب متصل است.` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    id: createTestKbId('tab-brand'),
    title: 'دانش برند',
    body: summaryParts || 'مرور کلی دانش برند در این تب قرار می‌گیرد.',
    attachments: mediaAttachments,
    sources: brandSources,
    subTabs,
  };
}

function buildProductTab(catalog: ProductCatalogSnapshot): TabDraft | null {
  const validRows = catalog.rows.filter((row) => catalog.fields.some((field) => row.values[field.id]?.trim()));
  if (validRows.length === 0) return null;

  const nameFieldId = catalog.fields.find((field) => field.label.includes('نام'))?.id ?? '';
  const descriptionFieldId = catalog.fields.find((field) => field.label.includes('توضیح'))?.id ?? '';

  const subTabs: SubTabDraft[] = validRows.map((row, index) => {
    const lines = catalog.fields
      .map((field) => {
        const value = row.values[field.id]?.trim();
        return value ? `${field.label}: ${value}` : null;
      })
      .filter(Boolean)
      .join('\n');

    const name = row.values[nameFieldId]?.trim() || `محصول ${index + 1}`;

    return {
      id: row.id,
      title: name,
      body: lines || name,
      attachments: [],
      sources: mapProductRowSources(catalog, row, index),
    };
  });

  const productSummary = validRows
    .map((row, index) => {
      const name = row.values[nameFieldId]?.trim() || `محصول ${index + 1}`;
      const description = row.values[descriptionFieldId]?.trim();
      return description ? `${name}: ${description}` : name;
    })
    .join('\n');

  return {
    id: createTestKbId('tab-products'),
    title: 'محصولات و خدمات',
    body: `${validRows.length} محصول یا خدمت ثبت شده است.\n\n${productSummary}`,
    attachments: [],
    sources: validRows.flatMap((row, index) => mapProductRowSources(catalog, row, index)),
    subTabs,
  };
}

function categorizeFaq(faq: TestFaqItem): string {
  const category = faq.category?.trim().toLowerCase() ?? '';
  if (category.includes('محصول') || category.includes('product')) return 'product';
  if (category.includes('پشتیبانی') || category.includes('support')) return 'support';
  if (category.includes('برند') || category.includes('brand')) return 'brand';
  return 'general';
}

function buildFaqTab(faqItems: TestFaqItem[]): TabDraft | null {
  const valid = faqItems.filter((item) => item.isActive && item.question.trim() && item.answer.trim());
  if (valid.length === 0) return null;

  const groups: Record<string, TestFaqItem[]> = {
    general: [],
    product: [],
    support: [],
    brand: [],
    other: [],
  };

  for (const item of valid) {
    const key = categorizeFaq(item);
    (groups[key] ?? groups.other).push(item);
  }

  const groupLabels: Record<string, string> = {
    general: 'سوالات عمومی',
    product: 'سوالات محصول',
    support: 'سوالات پشتیبانی',
    brand: 'سوالات برند',
    other: 'سایر سوالات',
  };

  const subTabs: SubTabDraft[] = Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([key, items]) => ({
      id: createTestKbId(`faq-group-${key}`),
      title: groupLabels[key] ?? key,
      body: items
        .map((item) =>
          [
            `سوال: ${item.question}`,
            `پاسخ: ${item.answer}`,
            item.category ? `دسته: ${item.category}` : null,
            item.tags?.length ? `برچسب‌ها: ${item.tags.join('، ')}` : null,
          ]
            .filter(Boolean)
            .join('\n'),
        )
        .join('\n\n---\n\n'),
      attachments: [],
      sources: items.flatMap((item, index) => mapFaqSources(item, index)),
    }));

  return {
    id: createTestKbId('tab-faq'),
    title: 'سوالات پرتکرار',
    body: `${valid.length} سوال فعال`,
    attachments: [],
    sources: valid.flatMap((item, index) => mapFaqSources(item, index)),
    subTabs,
  };
}

function buildSupportTab(
  selectedUseCases: TaaviaUseCaseKey[],
  brandMessages: WorkspaceContentMessage[],
): TabDraft | null {
  if (!hasSupportKnowledgeUseCase(selectedUseCases)) return null;

  const brandText = collectMessagesText(brandMessages).toLowerCase();
  const hasTone = /لحن|پیام|ارتباط|گفتار/.test(brandText);
  const hasRules = /قانون|ممنوع|حساس|ارجاع/.test(brandText);
  const brandSources = mapBrandSources(brandMessages);

  const subTabs: SubTabDraft[] = [
    {
      id: createTestKbId('support-tone'),
      title: 'لحن و پیام',
      body: hasTone
        ? 'بر اساس محتوای برند، لحن و سبک ارتباط استخراج شده و آماده استفاده است.'
        : 'لحن و پیام برند هنوز به‌صورت صریح ثبت نشده است.',
      attachments: [],
      sources: brandSources,
    },
    {
      id: createTestKbId('support-scenarios'),
      title: 'مخاطب هدف',
      body: 'سناریوهای مکالمه و مسیر پاسخ‌گویی با تکیه بر محتوای برند و FAQ قابل توسعه است.',
      attachments: [],
      sources: brandSources,
    },
  ];

  if (hasRules) {
    subTabs.push({
      id: createTestKbId('support-rules'),
      title: 'قوانین و حساسیت‌ها',
      body: 'موارد حساس و قوانین پاسخ‌گویی از محتوای برند استخراج شده است.',
      attachments: [],
      sources: brandSources,
    });
  }

  const supportSummary = subTabs.map((item) => `${item.title}: ${item.body}`).join('\n\n');

  return {
    id: createTestKbId('tab-support'),
    title: 'کارشناس فروش',
    body: supportSummary,
    attachments: [],
    sources: brandSources,
    subTabs,
  };
}

export function buildTestKnowledgeBasePreview(input: {
  brandName: string;
  selectedUseCases: TaaviaUseCaseKey[];
  brandMessages: WorkspaceContentMessage[];
  productCatalog: ProductCatalogSnapshot;
  faqItems: TestFaqItem[];
}): { categories: string[]; subsectionHints: string[] } {
  const doc = buildTestKnowledgeBaseDocument(input);
  return {
    categories: doc.tabs.map((tab) => tab.title),
    subsectionHints: doc.tabs.flatMap((tab) => [
      ...(tab.subTabs.length > 0 ? tab.subTabs.map((sub) => sub.title) : [tab.title]),
    ]),
  };
}

export function buildTestKnowledgeBaseDocument(input: {
  brandName: string;
  selectedUseCases: TaaviaUseCaseKey[];
  brandMessages: WorkspaceContentMessage[];
  productCatalog: ProductCatalogSnapshot;
  faqItems: TestFaqItem[];
}): TestKnowledgeBaseDocument {
  const tabs: TestKnowledgeBaseTab[] = [];
  const stamp = new Date().toISOString();

  const brand = buildBrandTab(input.brandMessages, input.productCatalog, input.faqItems);
  if (brand) tabs.push(stampTab(brand, stamp));

  const products = buildProductTab(input.productCatalog);
  if (products) tabs.push(stampTab(products, stamp));

  const faq = buildFaqTab(input.faqItems);
  if (faq) tabs.push(stampTab(faq, stamp));

  const support = buildSupportTab(input.selectedUseCases, input.brandMessages);
  if (support) tabs.push(stampTab(support, stamp));

  return {
    title: `Knowledge Base - ${input.brandName}`,
    brandName: input.brandName,
    builtAt: stamp,
    lastSavedAt: null,
    tabs,
  };
}
