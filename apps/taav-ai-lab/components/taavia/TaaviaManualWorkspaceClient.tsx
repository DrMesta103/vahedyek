'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  BookText,
  Boxes,
  Check,
  ChevronDown,
  CircleHelp,
  Clock,
  Coins,
  Database,
  DatabaseZap,
  FileText,
  Image as ImageIcon,
  LayoutTemplate,
  Loader2,
  Mic,
  MoreVertical,
  Paperclip,
  Plus,
  Sparkles,
  StopCircle,
  Trash2,
  Type,
  Video,
  X,
} from 'lucide-react';
import type { TaaviaUseCaseKey } from '@/app/lib/types/domain';
import {
  TaavButton,
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';
import {
  TaavTabs,
  TaavTabsContent,
  TaavTabsList,
  TaavTabsTrigger,
} from '@repo/ui/taav/navigation';

type TaaviaManualWorkspaceClientProps = {
  brandName: string;
  selectedUseCases?: TaaviaUseCaseKey[];
};

type ManualTab = {
  value: string;
  title: string;
  eyebrow: string;
  icon: typeof BookText;
  description: string;
};

type BrandSectionTab = {
  id: string;
  parentId: string | null;
  title: string;
  content: string;
  updatedAt: string;
};

type EditorAttachment = {
  id: string;
  kind: 'image' | 'video' | 'audio' | 'file';
  file: File;
  objectUrl?: string;
  createdAt: string;
};

type ProductFieldType = 'text' | 'number' | 'textarea' | 'date' | 'boolean';

type ProductField = {
  id: string;
  label: string;
  type: ProductFieldType;
};

type ProductRow = {
  id: string;
  values: Record<string, string>;
};

type ProductCatalogSnapshot = {
  fields: ProductField[];
  rows: ProductRow[];
};

const PRODUCT_FIELD_TYPE_OPTIONS: Array<{ value: ProductFieldType; label: string }> = [
  { value: 'text', label: 'متن' },
  { value: 'number', label: 'عدد' },
  { value: 'textarea', label: 'متن چندخطی' },
  { value: 'date', label: 'تاریخ' },
  { value: 'boolean', label: 'بله / خیر' },
];

const INITIAL_PRODUCT_FIELDS: ProductField[] = [
  { id: 'product-name', label: 'نام محصول', type: 'text' },
  { id: 'product-type', label: 'نوع', type: 'text' },
  { id: 'product-description', label: 'توضیحات', type: 'textarea' },
  { id: 'product-advantage', label: 'مزیت کلیدی', type: 'textarea' },
  { id: 'product-price', label: 'قیمت', type: 'number' },
];

function getProductFieldTypeLabel(type: ProductFieldType) {
  return PRODUCT_FIELD_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

function createEmptyProductRow(fields: ProductField[]): ProductRow {
  return {
    id: `product-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    values: Object.fromEntries(fields.map((field) => [field.id, ''])),
  };
}

function createSampleProductRows(): ProductRow[] {
  return [
    {
      id: 'sample-product-complete',
      values: {
        'product-name': 'اشتراک رشد هوشمند',
        'product-type': 'سرویس آموزشی و مشاوره‌ای',
        'product-description':
          'یک بسته کامل برای تیم‌های در حال رشد که شامل مسیر آموزشی، تحلیل وضعیت کسب‌وکار، پیشنهادهای عملیاتی و پشتیبانی مرحله‌ای است.',
        'product-advantage': 'ارائه برنامه اجرایی اختصاصی، گزارش قابل اندازه‌گیری و پشتیبانی مستمر برای تصمیم‌گیری سریع‌تر.',
        'product-price': '4500000',
      },
    },
    {
      id: 'sample-product-incomplete',
      values: {
        'product-name': 'مشاوره سریع برند',
        'product-type': 'جلسه مشاوره',
        'product-description': '',
        'product-advantage': 'دریافت بازخورد سریع برای اصلاح پیام برند.',
        'product-price': '',
      },
    },
  ];
}

function createEmptyProductField(index: number): ProductField {
  return {
    id: `field-${Date.now()}-${index}`,
    label: `فیلد ${index}`,
    type: 'text',
  };
}

type BrandBookSnapshot = {
  sections: BrandSectionTab[];
  draftContent: string;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

function createEmptyFaqItem(): FaqItem {
  return {
    id: `faq-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    question: '',
    answer: '',
  };
}

function deriveFaqsFromBrandBook(brandName: string, sections: BrandSectionTab[], draftContent: string) {
  const combinedText = collectBrandBookText(sections, draftContent);
  const hasEnoughData = combinedText.trim().length >= 120;

  if (!hasEnoughData) {
    return { faqs: [] as FaqItem[], insufficient: true };
  }

  const timestamp = Date.now();
  const findSection = (keyword: string) =>
    sections.find(
      (section) =>
        section.content.trim().length > 0 &&
        (section.title.includes(keyword) || section.content.includes(keyword)),
    );

  const identity = findSection('هویت');
  const tone = findSection('لحن');
  const values = findSection('ارزش');
  const audience = findSection('مخاطب');

  const candidates: Array<{ question: string; answer: string }> = [];

  if (identity) {
    candidates.push({
      question: `${brandName} چیست و چه کاری انجام می‌دهد؟`,
      answer: identity.content.trim(),
    });
  }

  if (tone) {
    candidates.push({
      question: 'لحن و سبک ارتباطی این برند چگونه است؟',
      answer: tone.content.trim(),
    });
  }

  if (values) {
    candidates.push({
      question: 'ارزش‌های اصلی این برند کدام‌اند؟',
      answer: values.content.trim(),
    });
  }

  if (audience) {
    candidates.push({
      question: 'مخاطب هدف این برند چه کسانی هستند؟',
      answer: audience.content.trim(),
    });
  }

  if (candidates.length === 0 && draftContent.trim()) {
    candidates.push({
      question: `معرفی کلی ${brandName} چیست؟`,
      answer: draftContent.trim(),
    });
  }

  if (candidates.length === 0) {
    return { faqs: [] as FaqItem[], insufficient: true };
  }

  return {
    faqs: candidates.map((item, index) => ({
      id: `faq-ai-${timestamp}-${index}`,
      question: item.question,
      answer: item.answer,
    })),
    insufficient: false,
  };
}

const MANUAL_TABS: ManualTab[] = [
  {
    value: 'brand',
    title: 'معرفی برند',
    eyebrow: 'تب اول',
    icon: BookText,
    description: 'در این بخش معرفی کامل برند، هویت، لحن و داستان شکل گیری را ثبت می کنی.',
  },
  {
    value: 'products',
    title: 'معرفی محصولات',
    eyebrow: 'تب دوم',
    icon: Boxes,
    description: 'اینجا لیست محصولات، خدمات، مزیت ها و جزئیات ارزش پیشنهادی برند قرار می گیرد.',
  },
  {
    value: 'faq',
    title: 'سوالات پرتکرار',
    eyebrow: 'تب سوم',
    icon: CircleHelp,
    description: 'پرسش های پرتکرار مشتریان و پاسخ های استاندارد اینجا مدیریت می شوند.',
  },
  {
    value: 'platform',
    title: 'پلتفرم',
    eyebrow: 'تب چهارم',
    icon: LayoutTemplate,
    description: 'در این بخش اتصال ها، کانال ها و ساختار پلتفرم برند را مشخص خواهیم کرد.',
  },
];

const INITIAL_BRAND_SECTIONS: BrandSectionTab[] = [];

const MAX_SECTION_DEPTH = 2;

type BrandCategoryDefinition = {
  title: string;
  matchTitles: string[];
  matchKeywords: string[];
};

type KnowledgeBaseField = {
  label: string;
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

const KNOWLEDGE_BASE_FIELDS: KnowledgeBaseField[] = [
  {
    label: 'تاریخچه',
    matchTitles: ['تاریخچه', 'داستان'],
    matchKeywords: ['تاریخچه', 'داستان شکل', 'شروع فعالیت', 'تاسیس'],
  },
  {
    label: 'هویت برند',
    matchTitles: ['هویت'],
    matchKeywords: ['ماموریت', 'چشم‌انداز', 'معرفی برند'],
  },
  {
    label: 'لحن و پیام',
    matchTitles: ['لحن', 'پیام'],
    matchKeywords: ['لحن', 'پیام برند', 'سبک ارتباط'],
  },
  {
    label: 'ارزش‌های برند',
    matchTitles: ['ارزش'],
    matchKeywords: ['ارزش', 'اصالت', 'اعتماد'],
  },
];

function getSampleBusinessSummary(brandName: string) {
  return `${brandName} یک کسب‌وکار فناوری‌محور در حوزه آموزش و خدمات دیجیتال است که با تمرکز بر تجربه کاربری، پشتیبانی هوشمند و رشد پایدار فعالیت می‌کند.`;
}

function buildSampleBusinessIntroduction(brandName: string) {
  return `برند ${brandName} یک کسب‌وکار فناوری‌محور در حوزه آموزش، مشاوره و خدمات دیجیتال است که برای ساده‌سازی مسیر رشد کسب‌وکارها شکل گرفته است. ماموریت این برند کمک به تیم‌ها و مدیران است تا با استفاده از داده، تجربه کاربری بهتر و راهکارهای هوشمند، تصمیم‌های دقیق‌تر بگیرند و فرآیندهای تکراری خود را ساده‌تر کنند. چشم‌انداز برند تبدیل شدن به یک مرجع قابل اعتماد برای کسب‌وکارهایی است که می‌خواهند با سرعت بیشتر، هزینه کمتر و کیفیت بالاتر رشد کنند.

لحن ارتباطی ${brandName} صمیمی، حرفه‌ای و راهگشا است. این برند تلاش می‌کند مفاهیم پیچیده فناوری و توسعه کسب‌وکار را با زبانی شفاف و قابل فهم توضیح دهد. پیام اصلی برند این است که فناوری باید به انسان کمک کند و مسیر کار را ساده‌تر، سریع‌تر و قابل اندازه‌گیری‌تر کند. در تمام نقاط تماس با مشتری، از معرفی محصول تا پشتیبانی، تاکید بر صداقت، پاسخ‌گویی و ارائه راه‌حل عملی وجود دارد.

ارزش‌های اصلی برند شامل شفافیت، نوآوری مسئولانه، تعهد به کیفیت، احترام به زمان مشتری، یادگیری مستمر و ساخت رابطه بلندمدت مبتنی بر اعتماد است. ${brandName} فقط به فروش یک محصول یا خدمت فکر نمی‌کند، بلکه تلاش می‌کند در کنار مشتری بماند و برای او نتیجه قابل مشاهده ایجاد کند. مخاطب هدف این برند کسب‌وکارهای در حال رشد، تیم‌های محصول، مدیران بازاریابی، سازمان‌های خدماتی و مجموعه‌هایی هستند که می‌خواهند تجربه مشتری، آموزش داخلی، خودکارسازی فرآیندها و استفاده از داده را بهبود دهند.`;
}

function collectBrandBookText(sections: BrandSectionTab[], draftContent: string) {
  const sectionText = sections
    .map((section) => `${section.title}\n${section.content}`.trim())
    .filter(Boolean)
    .join('\n\n');

  return [draftContent.trim(), sectionText].filter(Boolean).join('\n\n');
}

function sectionMatchesDefinition(section: BrandSectionTab, definition: BrandCategoryDefinition | KnowledgeBaseField) {
  const title = section.title.toLowerCase();
  const content = section.content.toLowerCase();

  return (
    definition.matchTitles.some((keyword) => title.includes(keyword.toLowerCase())) ||
    definition.matchKeywords.some((keyword) => title.includes(keyword.toLowerCase()) || content.includes(keyword.toLowerCase()))
  );
}

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

function extractDraftContentForCategory(
  draftContent: string,
  definition: BrandCategoryDefinition,
  definitions: BrandCategoryDefinition[],
) {
  const chunks = splitDraftIntoChunks(draftContent);
  const assignedChunks = chunks.filter((chunk) => {
    const bestCategory = pickBestCategoryForChunk(chunk, definitions);
    return bestCategory?.title === definition.title;
  });

  return assignedChunks.join('\n\n').trim();
}

function deriveCategoriesFromBrandBook(sections: BrandSectionTab[], draftContent: string) {
  const timestamp = Date.now();
  const normalizedDraft = draftContent.trim();

  return BRAND_CATEGORY_DEFINITIONS.map((definition, index) => {
    const matchedSections = sections.filter((section) => sectionMatchesDefinition(section, definition));
    const matchedContent = matchedSections
      .map((section) => section.content.trim())
      .filter(Boolean)
      .join('\n\n');

    const content =
      matchedContent ||
      (normalizedDraft
        ? extractDraftContentForCategory(normalizedDraft, definition, BRAND_CATEGORY_DEFINITIONS)
        : '');

    return {
      id: matchedSections[0]?.id ?? `section-ai-${timestamp}-${index}`,
      parentId: null,
      title: definition.title,
      content,
      updatedAt: new Date().toISOString(),
    };
  }).filter((section) => section.content.trim().length > 0);
}

function analyzeKnowledgeBaseReadiness(sections: BrandSectionTab[], draftContent: string) {
  const combinedText = collectBrandBookText(sections, draftContent).toLowerCase();

  return KNOWLEDGE_BASE_FIELDS.map((field) => {
    const hasSectionMatch = sections.some(
      (section) => section.content.trim().length > 0 && sectionMatchesDefinition(section, field),
    );
    const hasTextMatch = field.matchKeywords.some((keyword) => combinedText.includes(keyword.toLowerCase()));

    return {
      label: field.label,
      ready: hasSectionMatch || hasTextMatch,
    };
  });
}

function analyzeProductKnowledgeBaseReadiness(fields: ProductField[], rows: ProductRow[]) {
  if (rows.length === 0) {
    return ['هیچ محصولی برای انتقال به نالج‌بیس ثبت نشده است.'];
  }

  return rows.flatMap((row, index) => {
    const productName = row.values['product-name']?.trim() || `محصول ${index + 1}`;
    const missingFields = fields
      .filter((field) => !row.values[field.id]?.trim())
      .map((field) => field.label);

    if (missingFields.length === 0) return [];

    return [`${productName}: ${missingFields.join('، ')}`];
  });
}

type AnsweringRequirementKey =
  | 'brand-identity'
  | 'brand-history'
  | 'brand-tone'
  | 'brand-values'
  | 'target-audience'
  | 'products'
  | 'faq'
  | 'platform';

const USE_CASE_LABELS: Record<TaaviaUseCaseKey, string> = {
  all: 'همه موارد',
  support: 'پشتیبانی',
  sales: 'بازرگانی و فروش',
  marketing: 'بازاریابی',
  operations: 'عملیات',
  finance: 'مالی',
  hr: 'منابع انسانی',
  product: 'محصول',
  management: 'مدیریت',
  it: 'فناوری اطلاعات',
};

const ANSWERING_REQUIREMENTS: Record<
  AnsweringRequirementKey,
  { label: string; tab: string; description: string }
> = {
  'brand-identity': {
    label: 'معرفی و هویت برند',
    tab: 'معرفی برند',
    description: 'ماموریت، چشم‌انداز و معرفی کلی کسب‌وکار',
  },
  'brand-history': {
    label: 'تاریخچه برند',
    tab: 'معرفی برند',
    description: 'داستان شکل‌گیری و سوابق فعالیت',
  },
  'brand-tone': {
    label: 'لحن و پیام',
    tab: 'معرفی برند',
    description: 'سبک ارتباطی و پیام اصلی برند',
  },
  'brand-values': {
    label: 'ارزش‌های برند',
    tab: 'معرفی برند',
    description: 'اصول و تعهدات برند',
  },
  'target-audience': {
    label: 'مخاطب هدف',
    tab: 'معرفی برند',
    description: 'پروفایل مشتریان و کاربران هدف',
  },
  products: {
    label: 'محصولات و خدمات',
    tab: 'معرفی محصولات',
    description: 'نام، توضیحات، قیمت و مزیت هر محصول',
  },
  faq: {
    label: 'سوالات پرتکرار',
    tab: 'سوالات پرتکرار',
    description: 'پرسش‌ها و پاسخ‌های استاندارد مشتریان',
  },
  platform: {
    label: 'پلتفرم و کانال‌ها',
    tab: 'پلتفرم',
    description: 'کانال‌های ارتباطی و ساختار پشتیبانی',
  },
};

const USE_CASE_REQUIREMENT_MAP: Record<Exclude<TaaviaUseCaseKey, 'all'>, AnsweringRequirementKey[]> = {
  support: ['brand-identity', 'brand-tone', 'products', 'faq'],
  sales: ['brand-identity', 'products', 'target-audience', 'brand-values'],
  marketing: ['brand-identity', 'brand-tone', 'target-audience', 'brand-values'],
  operations: ['brand-identity', 'products', 'faq'],
  finance: ['brand-identity', 'products'],
  hr: ['brand-identity', 'brand-history', 'brand-tone'],
  product: ['products', 'faq', 'brand-identity', 'target-audience'],
  management: ['brand-identity', 'brand-history', 'products', 'brand-values'],
  it: ['products', 'faq', 'platform', 'brand-identity'],
};

const ALL_ANSWERING_REQUIREMENT_KEYS = Object.keys(ANSWERING_REQUIREMENTS) as AnsweringRequirementKey[];

function getRequiredInfoForUseCases(selectedUseCases: TaaviaUseCaseKey[]) {
  if (!selectedUseCases.length || selectedUseCases.includes('all')) {
    return ALL_ANSWERING_REQUIREMENT_KEYS;
  }

  const requirementKeys = new Set<AnsweringRequirementKey>();
  for (const useCase of selectedUseCases) {
    if (useCase === 'all') continue;
    for (const requirementKey of USE_CASE_REQUIREMENT_MAP[useCase]) {
      requirementKeys.add(requirementKey);
    }
  }

  return ALL_ANSWERING_REQUIREMENT_KEYS.filter((key) => requirementKeys.has(key));
}

function checkRequirementReadiness(
  requirementKey: AnsweringRequirementKey,
  brandBook: BrandBookSnapshot,
  products: ProductCatalogSnapshot,
  faqItems: FaqItem[],
) {
  const { sections, draftContent } = brandBook;
  const combinedText = collectBrandBookText(sections, draftContent).toLowerCase();
  const brandReadiness = analyzeKnowledgeBaseReadiness(sections, draftContent);

  switch (requirementKey) {
    case 'brand-identity':
      return brandReadiness.find((field) => field.label === 'هویت برند')?.ready ?? false;
    case 'brand-history':
      return brandReadiness.find((field) => field.label === 'تاریخچه')?.ready ?? false;
    case 'brand-tone':
      return brandReadiness.find((field) => field.label === 'لحن و پیام')?.ready ?? false;
    case 'brand-values':
      return brandReadiness.find((field) => field.label === 'ارزش‌های برند')?.ready ?? false;
    case 'target-audience':
      return (
        sections.some((section) => section.title.includes('مخاطب') && section.content.trim().length > 0) ||
        combinedText.includes('مخاطب')
      );
    case 'products':
      return products.rows.some((row) =>
        products.fields.every((field) => Boolean(row.values[field.id]?.trim())),
      );
    case 'faq':
      return faqItems.some((item) => item.question.trim().length > 0 && item.answer.trim().length > 0);
    case 'platform':
      return false;
    default:
      return false;
  }
}

function buildAnsweringRequirements(
  selectedUseCases: TaaviaUseCaseKey[],
  brandBook: BrandBookSnapshot,
  products: ProductCatalogSnapshot,
  faqItems: FaqItem[],
) {
  return getRequiredInfoForUseCases(selectedUseCases).map((requirementKey) => ({
    key: requirementKey,
    ...ANSWERING_REQUIREMENTS[requirementKey],
    ready: checkRequirementReadiness(requirementKey, brandBook, products, faqItems),
  }));
}

type BrandIntroAction = 'ai-generate' | 'kb-transfer';

const AI_PRICING_SETTINGS = {
  model: 'GPT (نمونه)',
  currency: 'تومان',
  inputPricePerThousandTokens: 45,
  outputPricePerThousandTokens: 90,
};

type AiUsageRecord = {
  id: string;
  label: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  createdAt: string;
};

function estimateTokensFromText(text: string) {
  const normalized = text.trim();
  if (!normalized) return 0;
  const words = normalized.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words * 1.5));
}

function calculateAiUsage(label: string, inputText: string, outputText: string): AiUsageRecord {
  const inputTokens = estimateTokensFromText(inputText);
  const outputTokens = estimateTokensFromText(outputText);
  const totalTokens = inputTokens + outputTokens;
  const cost =
    (inputTokens / 1000) * AI_PRICING_SETTINGS.inputPricePerThousandTokens +
    (outputTokens / 1000) * AI_PRICING_SETTINGS.outputPricePerThousandTokens;

  return {
    id: `usage-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    label,
    inputTokens,
    outputTokens,
    totalTokens,
    cost: Math.round(cost),
    createdAt: new Date().toISOString(),
  };
}

function formatNumberFa(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value);
}

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

function WorkspaceUpdateStatusCards({
  lastTextUpdatedAt,
  lastKnowledgeBaseSyncAt,
}: {
  lastTextUpdatedAt: string | null;
  lastKnowledgeBaseSyncAt: string | null;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="flex items-center justify-end gap-3 rounded-[16px] border border-white/8 bg-white/5 px-4 py-3 text-right">
        <div>
          <div className="text-[11px] font-bold text-[rgba(217,229,255,0.58)]">آخرین آپدیت متن‌ها</div>
          <div className="mt-1 text-[13px] font-black text-white">
            {lastTextUpdatedAt ? formatUpdatedAt(lastTextUpdatedAt) : 'هنوز تغییری ثبت نشده'}
          </div>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[rgba(66,237,211,0.12)] text-[rgb(150,246,231)]">
          <Clock className="h-4 w-4" />
        </span>
      </div>

      <div className="flex items-center justify-end gap-3 rounded-[16px] border border-white/8 bg-white/5 px-4 py-3 text-right">
        <div>
          <div className="text-[11px] font-bold text-[rgba(217,229,255,0.58)]">آخرین آپدیت نالج‌بیس</div>
          <div className="mt-1 text-[13px] font-black text-white">
            {lastKnowledgeBaseSyncAt ? formatUpdatedAt(lastKnowledgeBaseSyncAt) : 'هنوز انتقالی انجام نشده'}
          </div>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[rgba(130,158,255,0.12)] text-[rgb(199,210,254)]">
          <DatabaseZap className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function AnsweringRequirementsPanel({
  brandName,
  selectedUseCases,
  requirements,
  lastTextUpdatedAt,
  lastKnowledgeBaseSyncAt,
}: {
  brandName: string;
  selectedUseCases: TaaviaUseCaseKey[];
  requirements: ReturnType<typeof buildAnsweringRequirements>;
  lastTextUpdatedAt: string | null;
  lastKnowledgeBaseSyncAt: string | null;
}) {
  const visibleUseCases =
    selectedUseCases.includes('all') || !selectedUseCases.length
      ? (['all'] as TaaviaUseCaseKey[])
      : selectedUseCases;
  const readyCount = requirements.filter((requirement) => requirement.ready).length;

  return (
    <section className="relative z-[1] mb-5 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.88)_0%,rgba(10,19,38,0.88)_100%)] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.22)] md:p-5">
      <WorkspaceUpdateStatusCards
        lastTextUpdatedAt={lastTextUpdatedAt}
        lastKnowledgeBaseSyncAt={lastKnowledgeBaseSyncAt}
      />

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div className="text-right">
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(66,237,211,0.24)] bg-[rgba(66,237,211,0.10)] px-3 py-1 text-[11px] font-black text-[rgb(150,246,231)]">
            <Sparkles className="h-3.5 w-3.5" />
            نیازمندی‌های پاسخ‌دهی
          </div>
          <h2 className="mt-3 m-0 text-[clamp(1.2rem,1.8vw,1.6rem)] font-black text-white">
            برای پاسخ‌دهی در {brandName} این اطلاعات لازم است
          </h2>
          <p className="mt-2 max-w-3xl text-[length:var(--taav-text-sm)] leading-7 text-[rgba(217,229,255,0.68)]">
            بر اساس بخش‌هایی که هنگام ثبت برند انتخاب کرده‌ای، موارد زیر برای آماده‌سازی پاسخ‌های دقیق‌تر نیاز است.
          </p>
        </div>

        <div className="text-left">
          <div className="text-[11px] font-bold text-[rgba(217,229,255,0.58)]">پیشرفت آماده‌سازی</div>
          <div className="mt-1 text-[18px] font-black text-white">
            {formatNumberFa(readyCount)} / {formatNumberFa(requirements.length)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        {visibleUseCases.map((useCase) => (
          <span
            key={useCase}
            className="inline-flex items-center rounded-full border border-[rgba(130,158,255,0.24)] bg-[rgba(130,158,255,0.10)] px-3 py-1 text-[11px] font-bold text-[rgb(199,210,254)]"
          >
            {USE_CASE_LABELS[useCase]}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {requirements.map((requirement) => (
          <div
            key={requirement.key}
            className={`rounded-[18px] border px-4 py-3 text-right ${
              requirement.ready
                ? 'border-[rgba(66,237,211,0.24)] bg-[rgba(66,237,211,0.08)]'
                : 'border-[rgba(248,113,113,0.22)] bg-[rgba(248,113,113,0.08)]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  requirement.ready
                    ? 'bg-[rgba(66,237,211,0.14)] text-[rgb(150,246,231)]'
                    : 'bg-[rgba(248,113,113,0.14)] text-[rgb(254,202,202)]'
                }`}
              >
                {requirement.ready ? <Check className="h-4 w-4" /> : <CircleHelp className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-black text-white">{requirement.label}</div>
                <div className="mt-1 text-[11px] font-bold text-[rgba(217,229,255,0.58)]">تب: {requirement.tab}</div>
                <p className="mt-2 mb-0 text-[12px] leading-6 text-[rgba(217,229,255,0.72)]">{requirement.description}</p>
              </div>
            </div>
            <div
              className={`mt-3 text-[11px] font-bold ${
                requirement.ready ? 'text-[rgb(165,248,235)]' : 'text-[rgb(254,202,202)]'
              }`}
            >
              {requirement.ready ? 'اطلاعات ثبت شده' : 'نیاز به تکمیل'}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlaceholderCanvas({
  title,
  eyebrow,
  description,
  icon: Icon,
}: {
  title: string;
  eyebrow: string;
  description: string;
  icon: ManualTab['icon'];
}) {
  return (
    <section className="min-h-[72vh] rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.04)_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:p-8">
      <div className="mx-auto flex min-h-[64vh] max-w-4xl flex-col rounded-[24px] border border-[rgba(15,23,42,0.08)] bg-[rgba(248,251,255,0.96)] px-5 py-6 text-right shadow-[0_22px_50px_rgba(2,8,23,0.10)] md:px-8 md:py-8">
        <div className="mb-6 flex items-center justify-between gap-3 border-b border-[rgba(148,163,184,0.18)] pb-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(15,23,42,0.05)] px-3 py-1.5 text-[length:var(--taav-text-xs)] font-black text-[rgb(15,23,42)]">
            {eyebrow}
          </div>
          <div className="text-right">
            <h2 className="m-0 text-[clamp(1.4rem,2vw,2rem)] font-black text-[rgb(15,23,42)]">{title}</h2>
            <p className="mt-2 max-w-2xl text-[length:var(--taav-text-sm)] leading-7 text-[rgb(71,85,105)]">
              {description}
            </p>
          </div>
        </div>

        <div className="grid flex-1 place-items-center rounded-[20px] border border-dashed border-[rgba(148,163,184,0.38)] bg-[linear-gradient(180deg,rgba(247,250,255,0.95)_0%,rgba(240,246,255,0.76)_100%)] p-8">
          <div className="grid max-w-xl gap-4 text-center">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,rgba(13,148,136,0.16)_0%,rgba(99,102,241,0.14)_100%)] text-[rgb(15,23,42)] shadow-[0_10px_30px_rgba(13,148,136,0.12)]">
              <Icon className="h-7 w-7" />
            </div>
            <strong className="text-[length:var(--taav-text-lg)] text-[rgb(15,23,42)]">
              محتوای {title} اینجا قرار می گیرد
            </strong>
            <p className="m-0 text-[length:var(--taav-text-sm)] leading-8 text-[rgb(100,116,139)]">
              این بوم آماده است تا فرم ها، متن ها و جزئیات مربوط به {title} داخل همین بخش اضافه شوند.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductIntroEditor({
  brandName,
  onProductCatalogChange,
  onTextUpdated,
}: {
  brandName: string;
  onProductCatalogChange?: (snapshot: ProductCatalogSnapshot) => void;
  onTextUpdated?: () => void;
}) {
  const [fields, setFields] = useState<ProductField[]>(INITIAL_PRODUCT_FIELDS);
  const [rows, setRows] = useState<ProductRow[]>(() => createSampleProductRows());

  useEffect(() => {
    onProductCatalogChange?.({ fields, rows });
  }, [fields, rows, onProductCatalogChange]);

  const addField = () => {
    onTextUpdated?.();
    const nextField = createEmptyProductField(fields.length + 1);
    setFields((current) => [...current, nextField]);
    setRows((current) =>
      current.map((row) => ({
        ...row,
        values: {
          ...row.values,
          [nextField.id]: '',
        },
      })),
    );
  };

  const updateField = (fieldId: string, patch: Partial<Pick<ProductField, 'label' | 'type'>>) => {
    onTextUpdated?.();
    setFields((current) =>
      current.map((field) => (field.id === fieldId ? { ...field, ...patch } : field)),
    );
  };

  const deleteField = (fieldId: string) => {
    if (fields.length === 1) return;
    onTextUpdated?.();

    setFields((current) => current.filter((field) => field.id !== fieldId));
    setRows((current) =>
      current.map((row) => {
        const nextValues = { ...row.values };
        delete nextValues[fieldId];
        return { ...row, values: nextValues };
      }),
    );
  };

  const addRow = () => {
    onTextUpdated?.();
    setRows((current) => [...current, createEmptyProductRow(fields)]);
  };

  const updateCell = (rowId: string, fieldId: string, value: string) => {
    onTextUpdated?.();
    setRows((current) =>
      current.map((row) =>
        row.id === rowId
          ? {
              ...row,
              values: {
                ...row.values,
                [fieldId]: value,
              },
            }
          : row,
      ),
    );
  };

  const deleteRow = (rowId: string) => {
    onTextUpdated?.();
    setRows((current) => current.filter((row) => row.id !== rowId));
  };

  const renderFieldInput = (row: ProductRow, field: ProductField) => {
    const value = row.values[field.id] ?? '';
    const inputClassName =
      'w-full rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-[length:var(--taav-text-sm)] text-white outline-none transition placeholder:text-[rgba(217,229,255,0.34)] focus:border-[rgba(66,237,211,0.36)]';

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(event) => updateCell(row.id, field.id, event.target.value)}
          placeholder={`مقدار ${field.label}`}
          rows={3}
          className={`${inputClassName} min-w-[220px] resize-y leading-7`}
        />
      );
    }

    if (field.type === 'boolean') {
      return (
        <select
          value={value}
          onChange={(event) => updateCell(row.id, field.id, event.target.value)}
          className={`${inputClassName} min-w-[140px]`}
        >
          <option value="">انتخاب کن</option>
          <option value="yes">بله</option>
          <option value="no">خیر</option>
        </select>
      );
    }

    return (
      <input
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
        value={value}
        onChange={(event) => updateCell(row.id, field.id, event.target.value)}
        placeholder={`مقدار ${field.label}`}
        className={`${inputClassName} min-w-[140px]`}
      />
    );
  };

  return (
    <section className="min-h-[72vh] rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.025)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:p-6 xl:p-8">
      <div className="mx-auto flex min-h-[68vh] w-full max-w-7xl flex-col gap-8 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,22,43,0.96)_0%,rgba(8,15,30,0.94)_100%)] px-5 py-8 text-right shadow-[0_26px_80px_rgba(0,0,0,0.26)] md:px-8 md:py-10 xl:px-12">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-7">
          <div className="text-right">
            <h2 className="m-0 text-[clamp(1.6rem,2vw,2.25rem)] font-black text-white">معرفی محصولات</h2>
            <p className="mt-3 max-w-3xl text-[length:var(--taav-text-sm)] leading-8 text-[rgba(217,229,255,0.72)]">
              برای برند {brandName} دو مدل محصول نمونه آماده شده است؛ یکی کامل و یکی ناقص تا هنگام انتقال به نالج‌بیس، بخش‌های ناقص مشخص شوند.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={addField}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2.5 text-[length:var(--taav-text-sm)] font-black text-white transition hover:bg-white/12"
            >
              <Plus className="h-4 w-4" />
              افزودن فیلد
            </button>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(66,237,211,0.26)] bg-[rgba(66,237,211,0.12)] px-4 py-2.5 text-[length:var(--taav-text-sm)] font-black text-[rgb(150,246,231)] transition hover:bg-[rgba(66,237,211,0.18)]"
            >
              <Plus className="h-4 w-4" />
              افزودن محصول
            </button>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[15px] font-semibold text-white">فیلدهای داینامیک جدول</div>
              <div className="mt-1 text-[12px] text-[rgba(217,229,255,0.58)]">
                برای هر فیلد نام و نوع داده را مشخص کن.
              </div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-bold text-[rgba(217,229,255,0.72)]">
              {fields.length} فیلد فعال
            </span>
          </div>

          <div className="grid gap-3">
            {fields.map((field) => (
              <div
                key={field.id}
                className="grid gap-3 rounded-[18px] border border-white/10 bg-[rgba(8,16,31,0.55)] p-3 md:grid-cols-[minmax(0,1.2fr)_minmax(180px,0.7fr)_auto] md:items-center"
              >
                <input
                  value={field.label}
                  onChange={(event) => updateField(field.id, { label: event.target.value })}
                  placeholder="نام فیلد"
                  className="w-full rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-[length:var(--taav-text-sm)] text-white outline-none transition placeholder:text-[rgba(217,229,255,0.34)] focus:border-[rgba(66,237,211,0.36)]"
                />

                <select
                  value={field.type}
                  onChange={(event) => updateField(field.id, { type: event.target.value as ProductFieldType })}
                  className="w-full rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-[length:var(--taav-text-sm)] text-white outline-none transition focus:border-[rgba(66,237,211,0.36)]"
                >
                  {PRODUCT_FIELD_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => deleteField(field.id)}
                  disabled={fields.length === 1}
                  aria-label={`حذف فیلد ${field.label}`}
                  className="inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-full border border-[rgba(248,113,113,0.24)] bg-[rgba(248,113,113,0.10)] text-[rgb(254,202,202)] transition hover:bg-[rgba(248,113,113,0.16)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.78)_0%,rgba(10,19,38,0.78)_100%)] shadow-[0_18px_48px_rgba(0,0,0,0.22)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-right">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  {fields.map((field) => (
                    <th key={field.id} className="px-4 py-4 align-top">
                      <div className="grid gap-1">
                        <span className="text-[12px] font-bold text-[rgba(217,229,255,0.82)]">{field.label}</span>
                        <span className="inline-flex w-fit rounded-full border border-[rgba(66,237,211,0.20)] bg-[rgba(66,237,211,0.10)] px-2 py-0.5 text-[10px] font-bold text-[rgb(150,246,231)]">
                          {getProductFieldTypeLabel(field.type)}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-4 text-[12px] font-bold text-[rgba(217,229,255,0.72)]">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((row) => (
                    <tr key={row.id} className="border-b border-white/8 align-top transition hover:bg-white/4">
                      {fields.map((field) => (
                        <td key={`${row.id}-${field.id}`} className="px-4 py-4">
                          {renderFieldInput(row, field)}
                        </td>
                      ))}
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => deleteRow(row.id)}
                          aria-label="حذف محصول"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(248,113,113,0.24)] bg-[rgba(248,113,113,0.10)] text-[rgb(254,202,202)] transition hover:bg-[rgba(248,113,113,0.16)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={fields.length + 1} className="px-6 py-16 text-center">
                      <div className="mx-auto grid max-w-md gap-3">
                        <strong className="text-[length:var(--taav-text-md)] text-white">هنوز محصولی ثبت نشده</strong>
                        <p className="m-0 text-[length:var(--taav-text-sm)] leading-7 text-[rgba(217,229,255,0.62)]">
                          ابتدا فیلدهای جدول را تنظیم کن، سپس با دکمه «افزودن محصول» اولین ردیف را بساز.
                        </p>
                        <div>
                          <button
                            type="button"
                            onClick={addRow}
                            className="inline-flex items-center gap-2 rounded-full border border-[rgba(66,237,211,0.26)] bg-[rgba(66,237,211,0.12)] px-4 py-2.5 text-[length:var(--taav-text-sm)] font-black text-[rgb(150,246,231)] transition hover:bg-[rgba(66,237,211,0.18)]"
                          >
                            <Plus className="h-4 w-4" />
                            افزودن اولین محصول
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {rows.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-4">
              <span className="text-[12px] font-medium text-[rgba(217,229,255,0.58)]">
                {rows.length} محصول ثبت شده
              </span>
              <button
                type="button"
                onClick={addRow}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-[12px] font-bold text-white transition hover:bg-white/12"
              >
                <Plus className="h-4 w-4" />
                افزودن ردیف جدید
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function FaqEditor({
  brandName,
  brandBookSections,
  brandBookDraft,
  onFaqChange,
  onTextUpdated,
}: {
  brandName: string;
  brandBookSections: BrandSectionTab[];
  brandBookDraft: string;
  onFaqChange?: (items: FaqItem[]) => void;
  onTextUpdated?: () => void;
}) {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmAiOpen, setConfirmAiOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    onFaqChange?.(items);
  }, [items, onFaqChange]);

  const addItem = () => {
    onTextUpdated?.();
    setItems((current) => [...current, createEmptyFaqItem()]);
  };

  const updateItem = (itemId: string, field: 'question' | 'answer', value: string) => {
    onTextUpdated?.();
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, [field]: value } : item)),
    );
  };

  const deleteItem = (itemId: string) => {
    onTextUpdated?.();
    setItems((current) => current.filter((item) => item.id !== itemId));
  };

  const generateFaqsWithAi = async () => {
    const result = deriveFaqsFromBrandBook(brandName, brandBookSections, brandBookDraft);

    if (result.insufficient) {
      setConfirmAiOpen(false);
      setFeedback(
        'داده‌های معرفی برند برای ساخت سوالات پرتکرار کافی نیست. ابتدا در تب معرفی برند نمونه کسب‌وکار را بارگذاری کن یا محتوا را کامل‌تر کن.',
      );
      return;
    }

    setIsGenerating(true);
    setFeedback(null);
    await new Promise((resolve) => setTimeout(resolve, 1600));

    setItems(result.faqs);
    onTextUpdated?.();
    setIsGenerating(false);
    setConfirmAiOpen(false);
    setFeedback(`${result.faqs.length} سوال پرتکرار بر اساس اطلاعات برند ساخته شد.`);
  };

  return (
    <section className="min-h-[72vh] rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.025)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:p-6 xl:p-8">
      <div className="mx-auto flex min-h-[68vh] w-full max-w-7xl flex-col gap-8 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,22,43,0.96)_0%,rgba(8,15,30,0.94)_100%)] px-5 py-8 text-right shadow-[0_26px_80px_rgba(0,0,0,0.26)] md:px-8 md:py-10 xl:px-12">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-7">
          <div className="text-right">
            <h2 className="m-0 text-[clamp(1.6rem,2vw,2.25rem)] font-black text-white">سوالات پرتکرار</h2>
            <p className="mt-3 max-w-3xl text-[length:var(--taav-text-sm)] leading-8 text-[rgba(217,229,255,0.72)]">
              برای برند {brandName} سوال و جواب‌های پرتکرار را ثبت کن یا با AI بر اساس اطلاعات معرفی برند بساز.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmAiOpen(true)}
              disabled={isGenerating}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[rgba(66,237,211,0.34)] bg-[rgba(66,237,211,0.12)] px-4 py-2.5 text-[length:var(--taav-text-sm)] font-black text-[rgb(150,246,231)] transition hover:bg-[rgba(66,237,211,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-[rgba(66,237,211,0.22)] animate-pulse" />
              {isGenerating ? (
                <Loader2 className="relative h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="relative h-4 w-4 animate-pulse" />
              )}
              <span className="relative">ساخت سوالات پرتکرار با AI</span>
            </button>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(130,158,255,0.28)] bg-[rgba(130,158,255,0.12)] px-4 py-2.5 text-[length:var(--taav-text-sm)] font-black text-[rgb(199,210,254)] transition hover:bg-[rgba(130,158,255,0.18)]"
            >
              <Plus className="h-4 w-4" />
              افزودن سوال
            </button>
          </div>
        </div>

        {feedback ? (
          <div className="rounded-[20px] border border-[rgba(66,237,211,0.22)] bg-[rgba(66,237,211,0.10)] px-4 py-3 text-[length:var(--taav-text-sm)] font-semibold text-[rgb(165,248,235)]">
            {feedback}
          </div>
        ) : null}

        <div className="grid gap-4">
          {items.length > 0 ? (
            items.map((item, index) => (
              <div
                key={item.id}
                className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.78)_0%,rgba(10,19,38,0.78)_100%)] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-bold text-[rgba(217,229,255,0.72)]">
                    فرم {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    aria-label="حذف سوال"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(248,113,113,0.24)] bg-[rgba(248,113,113,0.10)] text-[rgb(254,202,202)] transition hover:bg-[rgba(248,113,113,0.16)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label className="text-[12px] font-bold text-[rgba(217,229,255,0.72)]">سوال</label>
                    <input
                      value={item.question}
                      onChange={(event) => updateItem(item.id, 'question', event.target.value)}
                      placeholder="مثلا: این برند چه خدماتی ارائه می‌دهد؟"
                      className="w-full rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-[length:var(--taav-text-sm)] text-white outline-none transition placeholder:text-[rgba(217,229,255,0.34)] focus:border-[rgba(66,237,211,0.36)]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-[12px] font-bold text-[rgba(217,229,255,0.72)]">جواب</label>
                    <textarea
                      value={item.answer}
                      onChange={(event) => updateItem(item.id, 'answer', event.target.value)}
                      placeholder="پاسخ استاندارد این سوال را بنویس"
                      rows={4}
                      className="w-full resize-y rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-[length:var(--taav-text-sm)] leading-7 text-white outline-none transition placeholder:text-[rgba(217,229,255,0.34)] focus:border-[rgba(66,237,211,0.36)]"
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/14 bg-white/5 px-6 py-16 text-center">
              <div className="mx-auto grid max-w-md gap-3">
                <strong className="text-[length:var(--taav-text-md)] text-white">هنوز سوالی ثبت نشده</strong>
                <p className="m-0 text-[length:var(--taav-text-sm)] leading-7 text-[rgba(217,229,255,0.62)]">
                  می‌توانی دستی سوال و جواب اضافه کنی یا با AI بر اساس اطلاعات تب معرفی برند، سوالات پرتکرار بسازی.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(130,158,255,0.28)] bg-[rgba(130,158,255,0.12)] px-4 py-2.5 text-[length:var(--taav-text-sm)] font-black text-[rgb(199,210,254)] transition hover:bg-[rgba(130,158,255,0.18)]"
                  >
                    <Plus className="h-4 w-4" />
                    افزودن اولین سوال
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmAiOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-[rgba(66,237,211,0.26)] bg-[rgba(66,237,211,0.12)] px-4 py-2.5 text-[length:var(--taav-text-sm)] font-black text-[rgb(150,246,231)] transition hover:bg-[rgba(66,237,211,0.18)]"
                  >
                    <Sparkles className="h-4 w-4" />
                    ساخت با AI
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <TaavDialog open={confirmAiOpen} onOpenChange={(open) => (!isGenerating ? setConfirmAiOpen(open) : undefined)}>
        <TaavDialogContent size="sm" contentClassName="ai-lab-dialog">
          <TaavDialogHeader>
            <TaavDialogTitle className="text-right text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
              ساخت سوالات پرتکرار با AI
            </TaavDialogTitle>
            <TaavDialogDescription className="text-right text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
              آیا مطمئن هستید که می‌خواهید AI بر اساس اطلاعات ثبت‌شده در تب معرفی برند، سوالات پرتکرار را بسازد؟
            </TaavDialogDescription>
          </TaavDialogHeader>

          <TaavDialogFooter>
            <TaavButton variant="secondary" tone="neutral" onClick={() => setConfirmAiOpen(false)} disabled={isGenerating}>
              انصراف
            </TaavButton>
            <TaavButton onClick={() => void generateFaqsWithAi()} disabled={isGenerating}>
              {isGenerating ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال ساخت...
                </span>
              ) : (
                'بله، ادامه بده'
              )}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
    </section>
  );
}

function BrandIntroEditor({
  brandName,
  onBrandBookChange,
  productCatalog,
  onTextUpdated,
  onKnowledgeBaseSynced,
}: {
  brandName: string;
  onBrandBookChange?: (snapshot: BrandBookSnapshot) => void;
  productCatalog: ProductCatalogSnapshot;
  onTextUpdated?: () => void;
  onKnowledgeBaseSynced?: () => void;
}) {
  const [sections, setSections] = useState<BrandSectionTab[]>(INITIAL_BRAND_SECTIONS);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(INITIAL_BRAND_SECTIONS[0]?.id ?? null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState('');
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<string[]>([]);
  const [draftContent, setDraftContent] = useState('');
  const [attachments, setAttachments] = useState<EditorAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [confirmAction, setConfirmAction] = useState<BrandIntroAction | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [aiUsageHistory, setAiUsageHistory] = useState<AiUsageRecord[]>([]);
  const [lastAiUsage, setLastAiUsage] = useState<AiUsageRecord | null>(null);
  const recordSessionRef = useRef<{
    recorder: MediaRecorder;
    stream: MediaStream;
    chunks: Blob[];
  } | null>(null);

  const filePickerRef = useRef<HTMLInputElement | null>(null);
  const filePickerKindRef = useRef<EditorAttachment['kind']>('file');

  useEffect(() => {
    onBrandBookChange?.({ sections, draftContent });
  }, [sections, draftContent, onBrandBookChange]);

  const totalAiUsage = useMemo(
    () =>
      aiUsageHistory.reduce(
        (accumulator, record) => ({
          totalTokens: accumulator.totalTokens + record.totalTokens,
          cost: accumulator.cost + record.cost,
        }),
        { totalTokens: 0, cost: 0 },
      ),
    [aiUsageHistory],
  );

  const registerAiUsage = useCallback((record: AiUsageRecord) => {
    setAiUsageHistory((current) => [...current, record]);
    setLastAiUsage(record);
  }, []);

  const brandKnowledgeBaseReadiness = useMemo(
    () => analyzeKnowledgeBaseReadiness(sections, draftContent),
    [sections, draftContent],
  );
  const missingBrandFields = useMemo(
    () => brandKnowledgeBaseReadiness.filter((field) => !field.ready).map((field) => field.label),
    [brandKnowledgeBaseReadiness],
  );
  const missingProductFields = useMemo(
    () => analyzeProductKnowledgeBaseReadiness(productCatalog.fields, productCatalog.rows),
    [productCatalog],
  );

  const getSectionById = (sectionId: string) => sections.find((section) => section.id === sectionId) ?? null;

  const activeSection = useMemo(() => {
    if (!activeSectionId) return null;
    return sections.find((section) => section.id === activeSectionId) ?? null;
  }, [activeSectionId, sections]);

  const getChildren = (parentId: string | null) =>
    sections.filter((section) => section.parentId === parentId);

  const getSectionDepth = (sectionId: string): number => {
    let depth = 1;
    let cursor = getSectionById(sectionId);
    while (cursor?.parentId) {
      depth += 1;
      cursor = getSectionById(cursor.parentId);
      if (depth > 10) break;
    }
    return depth;
  };

  const getTopLevelAncestorId = (sectionId: string) => {
    let cursor = getSectionById(sectionId);
    if (!cursor) return sectionId;
    while (cursor.parentId) {
      const parent = getSectionById(cursor.parentId);
      if (!parent) break;
      cursor = parent;
    }
    return cursor.id;
  };

  const isCollapsed = (sectionId: string) => collapsedSectionIds.includes(sectionId);

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSectionIds((current) =>
      current.includes(sectionId)
        ? current.filter((item) => item !== sectionId)
        : [...current, sectionId],
    );
  };

  const canAddChildSection = (parentId: string | null) => {
    if (parentId === null) return true;
    const parent = getSectionById(parentId);
    if (!parent) return false;
    return getSectionDepth(parentId) < MAX_SECTION_DEPTH;
  };

  const addSection = (parentId: string | null = null) => {
    if (!canAddChildSection(parentId)) return;

    const siblingCount = getChildren(parentId).length;
    const isChild = parentId !== null;
    const nextIndex = siblingCount + 1;
    const newSection: BrandSectionTab = {
      id: `section-${Date.now()}`,
      parentId,
      title: isChild
        ? `زیرتب ${nextIndex}`
        : `تب ${sections.filter((item) => item.parentId === null).length + 1}`,
      content: !isChild && sections.length === 0 ? draftContent : '',
      updatedAt: new Date().toISOString(),
    };

    setSections((current) => [...current, newSection]);
    setActiveSectionId(newSection.id);
    if (!isChild && sections.length === 0) {
      setDraftContent('');
    }
    if (parentId) {
      setCollapsedSectionIds((current) => current.filter((item) => item !== parentId));
    }
    setOpenMenuId(null);
  };

  const startEditingSection = (section: BrandSectionTab) => {
    setEditingSectionId(section.id);
    setTitleDraft(section.title);
    setOpenMenuId(null);
  };

  const saveSectionTitle = (sectionId: string) => {
    const nextTitle = titleDraft.trim();
    if (!nextTitle) {
      setEditingSectionId(null);
      setTitleDraft('');
      return;
    }

    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              title: nextTitle,
              updatedAt: new Date().toISOString(),
            }
          : section,
      ),
    );
    setEditingSectionId(null);
    setTitleDraft('');
  };

  const collectSectionBranchIds = (sectionId: string): string[] => {
    const childIds = sections.filter((section) => section.parentId === sectionId).map((section) => section.id);
    return [sectionId, ...childIds.flatMap((childId) => collectSectionBranchIds(childId))];
  };

  const deleteSection = (sectionId: string) => {
    const branchIds = new Set(collectSectionBranchIds(sectionId));
    const remainingSections = sections.filter((section) => !branchIds.has(section.id));
    const activeDeleted = Boolean(activeSectionId && branchIds.has(activeSectionId));

    if (activeDeleted && remainingSections.length === 0) {
      const deletedActiveSection = sections.find((section) => section.id === activeSectionId);
      if (deletedActiveSection?.content) {
        setDraftContent(deletedActiveSection.content);
      }
    }

    setSections(remainingSections);
    setActiveSectionId((currentActiveId) => {
      if (!currentActiveId || branchIds.has(currentActiveId)) {
        return remainingSections[0]?.id ?? null;
      }
      return currentActiveId;
    });
    setCollapsedSectionIds((current) => current.filter((item) => !branchIds.has(item)));
    setOpenMenuId(null);
    setEditingSectionId((currentEditingId) => (branchIds.has(currentEditingId ?? '') ? null : currentEditingId));
    setTitleDraft('');
  };

  const renderSectionTree = (parentId: string | null = null, level = 0): ReactNode =>
    getChildren(parentId).map((section) => {
      const childSections = getChildren(section.id);
      const hasChildren = childSections.length > 0;

      return (
        <div key={section.id} className="grid gap-1.5">
          <div
            className={`relative flex items-center gap-2 rounded-full px-3 py-2.5 transition ${
              section.id === activeSectionId
                ? 'bg-[rgba(66,237,211,0.18)] text-[rgb(214,255,248)] shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]'
                : 'bg-transparent text-[rgba(217,229,255,0.70)] hover:bg-white/8 hover:text-white'
            }`}
            style={{ marginLeft: `${level * 26}px` }}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                if (hasChildren) {
                  toggleSectionCollapse(section.id);
                }
              }}
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full transition ${
                hasChildren ? 'text-[rgba(217,229,255,0.70)] hover:bg-white/10' : 'cursor-default text-[rgba(217,229,255,0.34)]'
              }`}
            >
              <ChevronDown
                className={`h-4 w-4 transition ${isCollapsed(section.id) ? '-rotate-90' : 'rotate-0'}`}
              />
            </button>

            {editingSectionId === section.id ? (
              <div className="flex min-w-0 flex-1 items-center gap-2" onClick={(event) => event.stopPropagation()}>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[rgb(150,246,231)]">
                  <FileText className="h-4 w-4" />
                </span>
                <input
                  value={titleDraft}
                  onChange={(event) => setTitleDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      saveSectionTitle(section.id);
                    }

                    if (event.key === 'Escape') {
                      setEditingSectionId(null);
                      setTitleDraft('');
                    }
                  }}
                  autoFocus
                  className="h-9 min-w-0 flex-1 rounded-full border border-white/10 bg-[rgba(8,15,30,0.86)] px-3 text-[13px] font-semibold text-white outline-none ring-0"
                />
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    saveSectionTitle(section.id);
                  }}
                  className="rounded-full bg-[rgb(20,184,166)] px-3 py-1 text-[11px] font-bold text-[rgb(4,12,24)]"
                >
                  ثبت
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setActiveSectionId(section.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-right"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[rgb(150,246,231)]">
                  <FileText className="h-4 w-4" />
                </span>
                <span className="grid min-w-0 flex-1 text-left">
                  <span className="truncate text-[15px] font-semibold">{section.title}</span>
                  <span className="truncate text-[11px] font-medium text-[rgba(217,229,255,0.52)]">
                    آخرین بروزرسانی: {formatUpdatedAt(section.updatedAt)}
                  </span>
                </span>
              </button>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenMenuId((currentMenuId) => (currentMenuId === section.id ? null : section.id));
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[rgba(217,229,255,0.65)] transition hover:bg-white/10 hover:text-white"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {openMenuId === section.id ? (
                <div className="absolute left-0 top-9 z-20 grid min-w-[156px] gap-1 rounded-[18px] border border-white/10 bg-[rgb(15,23,42)] p-2 text-right shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      addSection(section.id);
                    }}
                    disabled={!canAddChildSection(section.id)}
                    className="rounded-[12px] px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    افزودن زیرتب
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      startEditingSection(section);
                    }}
                    className="rounded-[12px] px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-white/10"
                  >
                    ویرایش
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteSection(section.id);
                    }}
                    className="rounded-[12px] px-3 py-2 text-[12px] font-semibold text-[rgb(248,113,113)] transition hover:bg-[rgba(248,113,113,0.10)]"
                  >
                    حذف
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          {!isCollapsed(section.id) ? renderSectionTree(section.id, level + 1) : null}
        </div>
      );
    });

  const updateSectionContent = (value: string) => {
    onTextUpdated?.();

    if (!activeSectionId) {
      setDraftContent(value);
      return;
    }

    setSections((current) =>
      current.map((section) =>
        section.id === activeSectionId
          ? {
              ...section,
              content: value,
              updatedAt: new Date().toISOString(),
            }
          : section,
      ),
    );
  };

  const classifyFileKind = (file: File): EditorAttachment['kind'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const addFilesAsAttachments = useCallback((files: FileList | File[], forcedKind?: EditorAttachment['kind']) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    const createdAt = new Date().toISOString();
    const next = list.map((file) => {
      const kind = forcedKind ?? classifyFileKind(file);
      const shouldPreview = kind === 'image' || kind === 'video' || kind === 'audio';
      return {
        id: `att-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        kind,
        file,
        objectUrl: shouldPreview ? URL.createObjectURL(file) : undefined,
        createdAt,
      } satisfies EditorAttachment;
    });

    setAttachments((current) => [...next, ...current]);
  }, []);

  const removeAttachment = (attachmentId: string) => {
    setAttachments((current) => {
      const target = current.find((item) => item.id === attachmentId);
      if (target?.objectUrl) {
        URL.revokeObjectURL(target.objectUrl);
      }
      return current.filter((item) => item.id !== attachmentId);
    });
  };

  const openFilePicker = (kind: EditorAttachment['kind']) => {
    filePickerKindRef.current = kind;
    filePickerRef.current?.click();
  };

  const startAudioRecording = async () => {
    if (isRecording) return;
    if (typeof window === 'undefined') return;
    if (!navigator.mediaDevices?.getUserMedia) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    });

    recorder.addEventListener('stop', () => {
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
      addFilesAsAttachments([file], 'audio');
      stream.getTracks().forEach((track) => track.stop());
      recordSessionRef.current = null;
      setIsRecording(false);
    });

    recordSessionRef.current = { recorder, stream, chunks };
    recorder.start();
    setIsRecording(true);
  };

  const stopAudioRecording = () => {
    const session = recordSessionRef.current;
    if (!session) return;
    session.recorder.stop();
  };

  const closeConfirmDialog = () => {
    if (isGenerating || isTransferring) return;
    setConfirmAction(null);
  };

  const loadSampleBusiness = () => {
    setSections([]);
    setActiveSectionId(null);
    setDraftContent(buildSampleBusinessIntroduction(brandName));
    setAttachments([]);
    setCollapsedSectionIds([]);
    setOpenMenuId(null);
    setEditingSectionId(null);
    setTitleDraft('');
    onTextUpdated?.();
    setActionFeedback('متن نمونه معرفی کسب‌وکار بارگذاری شد. برای ساخت دسته‌بندی از دکمه AI استفاده کن.');
  };

  const generateCategoriesWithAi = async () => {
    const brandBookText = collectBrandBookText(sections, draftContent);
    if (!brandBookText.trim()) {
      setConfirmAction(null);
      setActionFeedback('برای ساخت دسته‌بندی، ابتدا معرفی برند را تکمیل کنید یا نمونه کسب‌وکار را بارگذاری کنید.');
      return;
    }

    setIsGenerating(true);
    setActionFeedback(null);

    await new Promise((resolve) => setTimeout(resolve, 1800));

    const derivedSections = deriveCategoriesFromBrandBook(sections, draftContent);
    if (!derivedSections.length) {
      setIsGenerating(false);
      setConfirmAction(null);
      setActionFeedback('محتوای کافی برای ساخت دسته‌بندی پیدا نشد. ابتدا معرفی برند را کامل‌تر کنید.');
      return;
    }

    const generatedText = derivedSections.map((section) => `${section.title}\n${section.content}`).join('\n\n');
    const usage = calculateAiUsage('ساخت دسته‌بندی با AI', brandBookText, generatedText);
    registerAiUsage(usage);

    setSections(derivedSections);
    setActiveSectionId(derivedSections[0]?.id ?? null);
    setDraftContent('');
    setIsGenerating(false);
    setConfirmAction(null);
    onTextUpdated?.();
    setActionFeedback(
      `دسته‌بندی‌ها بر اساس محتوای برندبوک ساخته شدند. مصرف این درخواست: ${formatNumberFa(
        usage.totalTokens,
      )} توکن معادل ${formatNumberFa(usage.cost)} ${AI_PRICING_SETTINGS.currency}.`,
    );
  };

  const transferToKnowledgeBase = async () => {
    const brandBookText = collectBrandBookText(sections, draftContent);
    if (!brandBookText.trim()) {
      setConfirmAction(null);
      setActionFeedback('برای انتقال به نالج‌بیس، ابتدا اطلاعات معرفی برند را ثبت کنید.');
      return;
    }

    setIsTransferring(true);
    setActionFeedback(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const missingFields = [...missingBrandFields, ...missingProductFields.map((item) => `محصول - ${item}`)];

    const usage = calculateAiUsage('انتقال به نالج‌بیس', brandBookText, missingFields.join('\n') || brandBookText);
    registerAiUsage(usage);

    setIsTransferring(false);
    setConfirmAction(null);

    const usageSummary = `مصرف این درخواست: ${formatNumberFa(usage.totalTokens)} توکن معادل ${formatNumberFa(
      usage.cost,
    )} ${AI_PRICING_SETTINGS.currency}.`;

    if (missingFields.length > 0) {
      setActionFeedback(
        `انتقال به نالج‌بیس انجام نشد. به طور مثال ${missingFields[0]} در دیتاهای شما وجود ندارد. موارد ناقص: ${missingFields.join('، ')}. ${usageSummary}`,
      );
      return;
    }

    onKnowledgeBaseSynced?.();
    setActionFeedback(`اطلاعات معرفی برند با موفقیت به نالج‌بیس منتقل شد. ${usageSummary}`);
  };

  const handleConfirmAction = () => {
    if (confirmAction === 'ai-generate') {
      void generateCategoriesWithAi();
      return;
    }

    if (confirmAction === 'kb-transfer') {
      void transferToKnowledgeBase();
    }
  };

  const isActionBusy = isGenerating || isTransferring;

  return (
    <section className="min-h-[72vh] rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.025)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] md:p-6 xl:p-8">
      <div className="mx-auto flex min-h-[68vh] w-full max-w-7xl flex-col gap-8 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(13,22,43,0.96)_0%,rgba(8,15,30,0.94)_100%)] px-5 py-8 text-right shadow-[0_26px_80px_rgba(0,0,0,0.26)] md:px-8 md:py-10 xl:px-12">
        <div className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.62)_0%,rgba(10,19,38,0.62)_100%)] p-4">
          <div className="flex items-center justify-end gap-3 rounded-[16px] border border-white/8 bg-white/5 px-4 py-3 text-right">
            <div>
              <div className="text-[11px] font-bold text-[rgba(217,229,255,0.58)]">مجموع مصرف AI</div>
              <div className="mt-1 text-[13px] font-black text-white">
                {formatNumberFa(totalAiUsage.totalTokens)} توکن · {formatNumberFa(totalAiUsage.cost)}{' '}
                {AI_PRICING_SETTINGS.currency}
              </div>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[rgba(250,204,21,0.14)] text-[rgb(253,224,71)]">
              <Coins className="h-4 w-4" />
            </span>
          </div>
        </div>

        {lastAiUsage ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-[rgba(250,204,21,0.24)] bg-[rgba(250,204,21,0.08)] px-4 py-3 text-right">
            <span className="inline-flex items-center gap-2 text-[12px] font-black text-[rgb(253,224,71)]">
              <Coins className="h-4 w-4" />
              آخرین درخواست AI: {lastAiUsage.label}
            </span>
            <span className="text-[12px] font-semibold text-[rgba(255,247,201,0.92)]">
              {formatNumberFa(lastAiUsage.totalTokens)} توکن (ورودی {formatNumberFa(lastAiUsage.inputTokens)} · خروجی{' '}
              {formatNumberFa(lastAiUsage.outputTokens)}) — هزینه {formatNumberFa(lastAiUsage.cost)}{' '}
              {AI_PRICING_SETTINGS.currency} · مدل {AI_PRICING_SETTINGS.model}
            </span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={loadSampleBusiness}
          disabled={isActionBusy}
          className="w-full rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.72)_0%,rgba(10,19,38,0.72)_100%)] p-5 text-right transition hover:border-[rgba(66,237,211,0.24)] hover:bg-[rgba(66,237,211,0.08)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(66,237,211,0.22)] bg-[rgba(66,237,211,0.10)] px-3 py-1 text-[11px] font-black text-[rgb(150,246,231)]">
            <BookText className="h-3.5 w-3.5" />
            نمونه کسب‌وکار
          </span>
          <p className="mt-3 text-[length:var(--taav-text-sm)] leading-8 text-[rgba(217,229,255,0.78)]">
            {getSampleBusinessSummary(brandName)}
          </p>
          <span className="mt-3 inline-flex items-center gap-2 text-[12px] font-bold text-[rgb(150,246,231)]">
            برای بارگذاری معرفی کامل برند اینجا کلیک کن
            <ChevronDown className="h-4 w-4 -rotate-90" />
          </span>
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-7">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setConfirmAction('ai-generate')}
              disabled={isActionBusy}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[rgba(66,237,211,0.34)] bg-[rgba(66,237,211,0.12)] px-4 py-2.5 text-[length:var(--taav-text-sm)] font-black text-[rgb(150,246,231)] shadow-[0_0_0_rgba(66,237,211,0.0)] transition hover:bg-[rgba(66,237,211,0.18)] hover:shadow-[0_0_28px_rgba(66,237,211,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.28)_48%,transparent_100%)] transition-transform duration-1000 group-hover:translate-x-full" />
              <span className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-[rgba(66,237,211,0.22)] animate-pulse" />
              {isGenerating ? (
                <Loader2 className="relative h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="relative h-4 w-4 animate-pulse" />
              )}
              <span className="relative">ساخت دسته‌بندی با AI</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmAction('kb-transfer')}
              disabled={isActionBusy}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(130,158,255,0.28)] bg-[rgba(130,158,255,0.12)] px-4 py-2.5 text-[length:var(--taav-text-sm)] font-black text-[rgb(199,210,254)] transition hover:bg-[rgba(130,158,255,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isTransferring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
              انتقال به نالج‌بیس
            </button>
          </div>

          <div className="text-right">
            <h2 className="m-0 text-[clamp(1.6rem,2vw,2.25rem)] font-black text-white">معرفی برند</h2>
            <p className="mt-3 max-w-3xl text-[length:var(--taav-text-sm)] leading-8 text-[rgba(217,229,255,0.72)]">
              برای برند {brandName} می توانی چند ساب تب مجزا بسازی و برای هر کدام متن و محتوای موردنیاز را ثبت کنی.
            </p>
          </div>
        </div>

        {actionFeedback ? (
          <div className="rounded-[20px] border border-[rgba(66,237,211,0.22)] bg-[rgba(66,237,211,0.10)] px-4 py-3 text-[length:var(--taav-text-sm)] font-semibold text-[rgb(165,248,235)]">
            {actionFeedback}
          </div>
        ) : null}

        <div className="grid flex-1 gap-8 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-stretch">
          <aside className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.92)_0%,rgba(12,22,43,0.88)_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] xl:min-h-[560px]">
            <div className="mb-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => addSection(null)}
                aria-label="افزودن تب"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(66,237,211,0.26)] bg-[rgba(66,237,211,0.12)] text-[rgb(150,246,231)] shadow-[0_12px_28px_rgba(20,184,166,0.14)] transition hover:bg-[rgba(66,237,211,0.18)]"
              >
                <Plus className="h-4 w-4" />
              </button>
              <div className="text-right">
                <div className="text-[15px] font-semibold text-white">تب‌های سند</div>
                <div className="mt-1 text-[11px] font-medium text-[rgba(217,229,255,0.58)]">
                  تب‌های اصلی و زیرتب‌ها نامحدود
                </div>
              </div>
            </div>
            {sections.length > 0 ? (
              <div className="grid gap-1">{renderSectionTree()}</div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-white/14 bg-white/5 p-5 text-right">
                <div className="text-[13px] font-semibold text-white">هنوز تبی ساخته نشده</div>
                <div className="mt-2 text-[12px] leading-7 text-[rgba(217,229,255,0.60)]">
                  می‌تونی همین الان متن رو بنویسی؛ هر وقت «+» رو زدی اولین تب با همین محتوا ساخته می‌شه.
                </div>
              </div>
            )}
          </aside>

          <div className="grid min-w-0 gap-4">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.78)_0%,rgba(10,19,38,0.78)_100%)] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.22)] md:p-6 xl:min-h-[560px]">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[length:var(--taav-text-xs)] font-bold text-[rgba(241,245,249,0.90)]"
                  >
                    <Type className="h-3.5 w-3.5" />
                    متن
                  </button>
                </div>

                <div className="text-right">
                  <strong className="block text-[length:var(--taav-text-md)] text-white">
                    {activeSection?.title ?? 'یادداشت'}
                  </strong>
                  <span className="text-[length:var(--taav-text-xs)] text-[rgba(217,229,255,0.58)]">
                    {activeSection ? 'محتوای این بخش را در این ویرایشگر ثبت کن' : 'فعلاً بدون تب؛ با دکمه + می‌تونی اولین تب رو بسازی'}
                  </span>
                </div>
              </div>

              <div
                className="grid gap-3"
                onDragOver={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  if (event.dataTransfer?.files?.length) {
                    addFilesAsAttachments(event.dataTransfer.files);
                  }
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openFilePicker('image')}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(66,237,211,0.22)] bg-[rgba(66,237,211,0.12)] px-3 py-2 text-[12px] font-bold text-[rgb(150,246,231)] transition hover:bg-[rgba(66,237,211,0.18)]"
                    >
                      <ImageIcon className="h-4 w-4" />
                      عکس
                    </button>
                    <button
                      type="button"
                      onClick={() => openFilePicker('video')}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(130,158,255,0.22)] bg-[rgba(130,158,255,0.12)] px-3 py-2 text-[12px] font-bold text-[rgb(199,210,254)] transition hover:bg-[rgba(130,158,255,0.18)]"
                    >
                      <Video className="h-4 w-4" />
                      ویدئو
                    </button>
                    <button
                      type="button"
                      onClick={() => (isRecording ? stopAudioRecording() : startAudioRecording())}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-bold transition ${
                        isRecording
                          ? 'border-[rgba(248,113,113,0.30)] bg-[rgba(248,113,113,0.12)] text-[rgb(254,202,202)] hover:bg-[rgba(248,113,113,0.18)]'
                          : 'border-white/10 bg-white/8 text-[rgba(241,245,249,0.90)] hover:bg-white/12'
                      }`}
                    >
                      {isRecording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      {isRecording ? 'توقف ضبط' : 'ضبط ویس'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openFilePicker('file')}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-2 text-[12px] font-bold text-[rgba(241,245,249,0.90)] transition hover:bg-white/12"
                    >
                      <Paperclip className="h-4 w-4" />
                      فایل
                    </button>
                  </div>

                  <div className="text-[11px] font-medium text-[rgba(217,229,255,0.52)]">
                    می‌تونی فایل رو drag & drop کنی یا تصویر رو paste کنی.
                  </div>
                </div>

                <input
                  ref={filePickerRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept={
                    filePickerKindRef.current === 'image'
                      ? 'image/*'
                      : filePickerKindRef.current === 'video'
                        ? 'video/*'
                        : filePickerKindRef.current === 'audio'
                          ? 'audio/*'
                          : undefined
                  }
                  onChange={(event) => {
                    const files = event.target.files;
                    if (files?.length) {
                      addFilesAsAttachments(files, filePickerKindRef.current);
                    }
                    event.target.value = '';
                  }}
                />

                {attachments.length > 0 ? (
                  <div className="grid gap-3">
                    <div className="flex flex-wrap justify-end gap-2">
                      {attachments.map((att) => (
                        <div
                          key={att.id}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-right"
                        >
                          <span className="text-[12px] font-semibold text-[rgba(241,245,249,0.92)]">{att.file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(att.id)}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[rgba(217,229,255,0.62)] transition hover:bg-white/10 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="grid gap-3 rounded-[18px] border border-white/10 bg-white/5 p-3">
                      {attachments.slice(0, 3).map((att) => (
                        <div key={att.id} className="grid gap-2">
                          {att.kind === 'image' && att.objectUrl ? (
                            <img
                              src={att.objectUrl}
                              alt={att.file.name}
                              className="max-h-56 w-full rounded-[14px] object-cover"
                            />
                          ) : null}
                          {att.kind === 'video' && att.objectUrl ? (
                            <video src={att.objectUrl} controls className="max-h-56 w-full rounded-[14px]" />
                          ) : null}
                          {att.kind === 'audio' && att.objectUrl ? (
                            <audio src={att.objectUrl} controls className="w-full" />
                          ) : null}
                        </div>
                      ))}
                      {attachments.length > 3 ? (
                        <div className="text-right text-[11px] font-medium text-[rgba(217,229,255,0.58)]">
                          +{attachments.length - 3} فایل دیگر
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <textarea
                  value={activeSection?.content ?? draftContent}
                  onChange={(event) => updateSectionContent(event.target.value)}
                  onPaste={(event) => {
                    const items = event.clipboardData?.items;
                    if (!items?.length) return;
                    const files: File[] = [];
                    for (const item of Array.from(items)) {
                      if (item.kind === 'file') {
                        const file = item.getAsFile();
                        if (file) files.push(file);
                      }
                    }
                    if (files.length) {
                      addFilesAsAttachments(files);
                    }
                  }}
                  placeholder="اینجا معرفی برند، لحن، داستان، ارزش ها و هر توضیح مهم دیگری را بنویس..."
                  className="min-h-[520px] w-full resize-none rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(5,12,25,0.82)_0%,rgba(8,16,31,0.74)_100%)] px-6 py-6 text-right text-[length:var(--taav-text-sm)] leading-8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none transition placeholder:text-[rgba(217,229,255,0.38)] focus:border-[rgba(66,237,211,0.36)] focus:ring-4 focus:ring-[rgba(66,237,211,0.10)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaavDialog open={confirmAction !== null} onOpenChange={(open) => (!open ? closeConfirmDialog() : undefined)}>
        <TaavDialogContent size="sm" contentClassName="ai-lab-dialog">
          <TaavDialogHeader>
            <TaavDialogTitle className="text-right text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
              {confirmAction === 'ai-generate' ? 'ساخت دسته‌بندی با AI' : 'انتقال به نالج‌بیس'}
            </TaavDialogTitle>
            <TaavDialogDescription className="text-right text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
              {confirmAction === 'ai-generate'
                ? 'آیا مطمئن هستید که می‌خواهید AI بر اساس محتوای فعلی برندبوک، دسته‌بندی‌ها را بسازد و تب‌های سند را بازآرایی کند؟'
                : 'آیا مطمئن هستید که می‌خواهید اطلاعات ثبت‌شده در برندبوک را برای انتقال به نالج‌بیس بررسی و ارسال کنید؟'}
            </TaavDialogDescription>
          </TaavDialogHeader>

          {confirmAction === 'kb-transfer' ? (
            <div className="grid gap-3 rounded-[18px] border border-[rgba(248,113,113,0.22)] bg-[rgba(248,113,113,0.08)] p-4 text-right">
              <div className="text-[13px] font-black text-[rgb(254,202,202)]">بخش‌های ناقص قبل از انتقال</div>
              {missingBrandFields.length > 0 || missingProductFields.length > 0 ? (
                <div className="grid gap-2 text-[12px] leading-7 text-[rgba(255,226,226,0.88)]">
                  {missingBrandFields.length > 0 ? (
                    <div>
                      <span className="font-bold text-white">معرفی برند: </span>
                      {missingBrandFields.join('، ')}
                    </div>
                  ) : null}
                  {missingProductFields.map((item) => (
                    <div key={item}>
                      <span className="font-bold text-white">معرفی محصول: </span>
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[12px] leading-7 text-[rgba(209,250,229,0.90)]">
                  همه بخش‌های ضروری برند و محصول کامل هستند و آماده انتقال به نالج‌بیس‌اند.
                </div>
              )}
            </div>
          ) : null}

          <TaavDialogFooter>
            <TaavButton variant="secondary" tone="neutral" onClick={closeConfirmDialog} disabled={isActionBusy}>
              انصراف
            </TaavButton>
            <TaavButton onClick={handleConfirmAction} disabled={isActionBusy}>
              {isActionBusy ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  در حال انجام...
                </span>
              ) : (
                'بله، ادامه بده'
              )}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
    </section>
  );
}

export function TaaviaManualWorkspaceClient({
  brandName,
  selectedUseCases = [],
}: TaaviaManualWorkspaceClientProps) {
  const [brandBookSnapshot, setBrandBookSnapshot] = useState<BrandBookSnapshot>({
    sections: INITIAL_BRAND_SECTIONS,
    draftContent: '',
  });
  const [productCatalogSnapshot, setProductCatalogSnapshot] = useState<ProductCatalogSnapshot>({
    fields: INITIAL_PRODUCT_FIELDS,
    rows: createSampleProductRows(),
  });
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [lastTextUpdatedAt, setLastTextUpdatedAt] = useState<string | null>(null);
  const [lastKnowledgeBaseSyncAt, setLastKnowledgeBaseSyncAt] = useState<string | null>(null);

  const handleBrandBookChange = useCallback((snapshot: BrandBookSnapshot) => {
    setBrandBookSnapshot(snapshot);
  }, []);
  const handleProductCatalogChange = useCallback((snapshot: ProductCatalogSnapshot) => {
    setProductCatalogSnapshot(snapshot);
  }, []);
  const handleFaqChange = useCallback((items: FaqItem[]) => {
    setFaqItems(items);
  }, []);
  const markTextUpdated = useCallback(() => {
    setLastTextUpdatedAt(new Date().toISOString());
  }, []);
  const markKnowledgeBaseSynced = useCallback(() => {
    setLastKnowledgeBaseSyncAt(new Date().toISOString());
  }, []);

  const answeringRequirements = useMemo(
    () => buildAnsweringRequirements(selectedUseCases, brandBookSnapshot, productCatalogSnapshot, faqItems),
    [selectedUseCases, brandBookSnapshot, productCatalogSnapshot, faqItems],
  );

  return (
    <div className="relative isolate overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,16,33,0.98)_0%,rgba(13,22,43,0.94)_100%)] p-4 shadow-[0_22px_90px_rgba(0,0,0,0.34)] md:p-6">
      <div className="absolute inset-x-[-8%] top-[-14%] h-64 rounded-full bg-[radial-gradient(circle,rgba(66,237,211,0.18)_0%,rgba(66,237,211,0)_72%)] blur-3xl" />
      <div className="absolute bottom-[-22%] left-[-8%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(99,121,255,0.20)_0%,rgba(99,121,255,0)_74%)] blur-3xl" />

      <AnsweringRequirementsPanel
        brandName={brandName}
        selectedUseCases={selectedUseCases}
        requirements={answeringRequirements}
        lastTextUpdatedAt={lastTextUpdatedAt}
        lastKnowledgeBaseSyncAt={lastKnowledgeBaseSyncAt}
      />

      <TaavTabs
        defaultValue="brand"
        orientation="vertical"
        className="relative grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start"
        dir="rtl"
      >
        <aside className="rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur-2xl">
          <div className="mb-4 grid gap-3 text-right">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(66,237,211,0.24)] bg-[rgba(66,237,211,0.10)] px-3 py-1.5 text-[length:var(--taav-text-xs)] font-black text-[rgb(165,248,235)]">
              <Sparkles className="h-3.5 w-3.5" />
              تنظیم دستی برند
            </div>
            <div>
              <h1 className="m-0 text-[clamp(1.5rem,2vw,2.2rem)] font-black text-white">دفترچه برند {brandName}</h1>
              <p className="mt-2 text-[length:var(--taav-text-sm)] leading-7 text-[rgba(217,229,255,0.70)]">
                ساختار این صفحه مثل یک workspace عمودی است تا بتوانی اطلاعات برند را قدم به قدم و منظم ثبت کنی.
              </p>
            </div>
          </div>

          <TaavTabsList
            orientation="vertical"
            variant="soft"
            tone="neutral"
            className="w-full gap-2 bg-transparent p-0"
          >
            {MANUAL_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TaavTabsTrigger
                  key={tab.value}
                  value={tab.value}
                  variant="soft"
                  tone="neutral"
                  className="w-full justify-between rounded-[20px] border border-white/8 bg-[rgba(255,255,255,0.04)] px-4 py-4 text-right data-[state=active]:border-[rgba(66,237,211,0.22)] data-[state=active]:bg-[linear-gradient(135deg,rgba(66,237,211,0.16)_0%,rgba(255,255,255,0.08)_100%)] data-[state=active]:text-white"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-[rgba(255,255,255,0.10)] text-white">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="grid flex-1 gap-1 text-right">
                    <span className="text-[length:var(--taav-text-2xs)] font-bold text-[rgba(213,223,249,0.60)]">
                      {tab.eyebrow}
                    </span>
                    <span className="text-[length:var(--taav-text-sm)] font-black">{tab.title}</span>
                  </span>
                </TaavTabsTrigger>
              );
            })}
          </TaavTabsList>
        </aside>

        <div className="rounded-[30px] border border-white/10 bg-[rgba(255,255,255,0.05)] p-3 backdrop-blur-2xl md:p-4">
          <TaavTabsContent value="brand" className="m-0">
            <BrandIntroEditor
              brandName={brandName}
              onBrandBookChange={handleBrandBookChange}
              productCatalog={productCatalogSnapshot}
              onTextUpdated={markTextUpdated}
              onKnowledgeBaseSynced={markKnowledgeBaseSynced}
            />
          </TaavTabsContent>

          <TaavTabsContent value="products" className="m-0">
            <ProductIntroEditor
              brandName={brandName}
              onProductCatalogChange={handleProductCatalogChange}
              onTextUpdated={markTextUpdated}
            />
          </TaavTabsContent>

          <TaavTabsContent value="faq" className="m-0">
            <FaqEditor
              brandName={brandName}
              brandBookSections={brandBookSnapshot.sections}
              brandBookDraft={brandBookSnapshot.draftContent}
              onFaqChange={handleFaqChange}
              onTextUpdated={markTextUpdated}
            />
          </TaavTabsContent>

          {MANUAL_TABS.filter((tab) => tab.value !== 'brand' && tab.value !== 'products' && tab.value !== 'faq').map((tab) => (
            <TaavTabsContent key={tab.value} value={tab.value} className="m-0">
              <PlaceholderCanvas
                title={tab.title}
                eyebrow={tab.eyebrow}
                description={tab.description}
                icon={tab.icon}
              />
            </TaavTabsContent>
          ))}
        </div>
      </TaavTabs>
    </div>
  );
}
