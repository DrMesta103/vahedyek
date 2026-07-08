import type { TaaviaUseCaseKey } from '@/app/lib/types/domain';
import type { ProductCatalogSnapshot, WorkspaceContentMessage } from '@/app/lib/types/taavia-workspace';
import type {
  TestFaqItem,
  TestRequirementCard,
  TestSectionCompletionStatus,
  TestStatusReportSection,
  TestStatusWarning,
} from '@/app/lib/types/taavia-test-workspace';

type RequirementDefinition = {
  id: string;
  label: string;
  description: string;
  relatedTab: TestRequirementCard['relatedTab'];
  useCases: TaaviaUseCaseKey[];
};

const ALL_USE_CASES: TaaviaUseCaseKey[] = [
  'support',
  'sales',
  'marketing',
  'operations',
  'finance',
  'hr',
  'product',
  'management',
  'it',
  'all',
];

const REQUIREMENT_DEFINITIONS: RequirementDefinition[] = [
  {
    id: 'brand-tone',
    label: 'لحن پیام و سبک ارتباط برند',
    description: 'سبک گفتار، لحن پاسخ گویی و شخصیت برند',
    relatedTab: 'brand',
    useCases: ['support', 'sales', 'marketing', 'management', 'all'],
  },
  {
    id: 'brand-intro',
    label: 'معرفی برند',
    description: 'معرفی کلی، ماموریت و چشم انداز برند',
    relatedTab: 'brand',
    useCases: ALL_USE_CASES,
  },
  {
    id: 'brand-history',
    label: 'تاریخچه برند',
    description: 'داستان شکل گیری و سوابق فعالیت',
    relatedTab: 'brand',
    useCases: ['support', 'marketing', 'management', 'hr', 'all'],
  },
  {
    id: 'brand-values',
    label: 'ارزش ها و ماموریت برند',
    description: 'اصول، تعهدات و ارزش های اصلی',
    relatedTab: 'brand',
    useCases: ['sales', 'marketing', 'management', 'all'],
  },
  {
    id: 'products',
    label: 'محصولات و خدمات',
    description: 'نام، مشخصات، مزایا و شرایط محصولات',
    relatedTab: 'products',
    useCases: ['support', 'sales', 'marketing', 'product', 'finance', 'all'],
  },
  {
    id: 'target-audience',
    label: 'مخاطب هدف',
    description: 'پروفایل مشتریان و کاربران هدف',
    relatedTab: 'brand',
    useCases: ['sales', 'marketing', 'product', 'all'],
  },
  {
    id: 'faq',
    label: 'سوالات پرتکرار',
    description: 'پرسش ها و پاسخ های استاندارد مشتریان',
    relatedTab: 'faq',
    useCases: ['support', 'sales', 'marketing', 'operations', 'product', 'it', 'all'],
  },
  {
    id: 'support-info',
    label: 'اطلاعات پشتیبانی',
    description: 'قوانین پاسخ گویی و مسیرهای ارجاع',
    relatedTab: 'support',
    useCases: ['support', 'operations', 'it', 'all'],
  },
  {
    id: 'competitive-advantage',
    label: 'مزیت های رقابتی',
    description: 'تمایز برند نسبت به رقبا',
    relatedTab: 'brand',
    useCases: ['sales', 'marketing', 'management', 'all'],
  },
  {
    id: 'conversation-scenarios',
    label: 'سناریوهای رایج مکالمه',
    description: 'پاسخ های پیشنهادی برای موقعیت های تکراری',
    relatedTab: 'support',
    useCases: ['support', 'sales', 'all'],
  },
  {
    id: 'media-assets',
    label: 'فایل ها و مدیاهای مرتبط',
    description: 'تصویر، ویدیو، صوت و داکیومنت های برند',
    relatedTab: 'brand',
    useCases: ALL_USE_CASES,
  },
];

function normalizeUseCases(selectedUseCases: TaaviaUseCaseKey[]) {
  if (!selectedUseCases.length || selectedUseCases.includes('all')) {
    return new Set<RequirementDefinition['useCases'][number]>(ALL_USE_CASES);
  }

  return new Set(selectedUseCases);
}

function hasBrandData(messages: WorkspaceContentMessage[]) {
  return messages.length > 0;
}

function hasProductData(catalog: ProductCatalogSnapshot) {
  return catalog.rows.some((row) => catalog.fields.some((field) => row.values[field.id]?.trim()));
}

function hasFaqData(items: TestFaqItem[]) {
  return items.some((item) => item.isActive && item.question.trim() && item.answer.trim());
}

export function buildTestRequirementCards(input: {
  selectedUseCases: TaaviaUseCaseKey[];
  brandMessages: WorkspaceContentMessage[];
  productCatalog: ProductCatalogSnapshot;
  faqItems: TestFaqItem[];
}): TestRequirementCard[] {
  const activeUseCases = normalizeUseCases(input.selectedUseCases);
  const brandData = hasBrandData(input.brandMessages);
  const productData = hasProductData(input.productCatalog);
  const faqData = hasFaqData(input.faqItems);
  const hasMedia = input.brandMessages.some((message) => message.kind !== 'text');

  return REQUIREMENT_DEFINITIONS.filter((definition) =>
    definition.useCases.some((useCase) => activeUseCases.has(useCase)),
  ).map((definition) => {
    let hasData = false;

    switch (definition.id) {
      case 'products':
        hasData = productData;
        break;
      case 'faq':
      case 'support-info':
      case 'conversation-scenarios':
        hasData = faqData;
        break;
      case 'media-assets':
        hasData = hasMedia;
        break;
      default:
        hasData = brandData;
        break;
    }

    return {
      id: definition.id,
      label: definition.label,
      description: definition.description,
      relatedTab: definition.relatedTab,
      status: hasData ? 'completed' : 'optional',
    } satisfies TestRequirementCard;
  });
}

export function hasSupportKnowledgeUseCase(selectedUseCases: TaaviaUseCaseKey[]) {
  const active = normalizeUseCases(selectedUseCases);
  return active.has('support') || active.has('sales') || active.has('marketing');
}

export function getTestWorkspaceCounts(input: {
  brandMessages: WorkspaceContentMessage[];
  productCatalog: ProductCatalogSnapshot;
  faqItems: TestFaqItem[];
}) {
  const brandItems = input.brandMessages.length;
  const productRows = input.productCatalog.rows.filter((row) =>
    input.productCatalog.fields.some((field) => row.values[field.id]?.trim()),
  ).length;
  const faqItems = input.faqItems.filter(
    (item) => item.isActive && item.question.trim() && item.answer.trim(),
  ).length;

  return {
    brandItems,
    productRows,
    faqItems,
    total: brandItems + productRows + faqItems,
  };
}

export function hasAnyTestWorkspaceData(input: {
  brandMessages: WorkspaceContentMessage[];
  productCatalog: ProductCatalogSnapshot;
  faqItems: TestFaqItem[];
}) {
  return getTestWorkspaceCounts(input).total > 0;
}

export function buildTestStatusWarnings(input: {
  brandMessages: WorkspaceContentMessage[];
  productCatalog: ProductCatalogSnapshot;
  faqItems: TestFaqItem[];
}): TestStatusWarning[] {
  const warnings: TestStatusWarning[] = [];
  const counts = getTestWorkspaceCounts(input);

  if (counts.faqItems === 0 && input.faqItems.length > 0) {
    warnings.push({ id: 'faq-incomplete', message: 'برخی FAQها ناقص هستند یا غیرفعال اند.' });
  } else if (counts.faqItems === 0) {
    warnings.push({ id: 'faq-empty', message: 'هنوز FAQ وارد نشده است.' });
  }

  const hasProductFields = input.productCatalog.fields.length > 0;
  const hasProductRows = counts.productRows > 0;
  if (hasProductFields && !hasProductRows) {
    warnings.push({ id: 'product-no-rows', message: 'فیلد محصول ساخته شده اما محصولی ثبت نشده است.' });
  }

  const hasBrandText = input.brandMessages.some((message) => message.kind === 'text' && message.text?.trim());
  const hasBrandMedia = input.brandMessages.some((message) => message.kind !== 'text');
  if (hasBrandMedia && !hasBrandText) {
    warnings.push({ id: 'brand-media-only', message: 'معرفی برند فایل دارد اما متن برند هنوز کامل نشده است.' });
  }

  if (counts.brandItems === 0) {
    warnings.push({ id: 'brand-empty', message: 'بخش معرفی برند هنوز خالی است.' });
  }

  return warnings;
}

function sectionStatus(hasData: boolean, hasPartial: boolean): TestSectionCompletionStatus {
  if (hasData) return 'completed';
  if (hasPartial) return 'incomplete';
  return 'empty';
}

export function buildTestStatusReportSections(input: {
  selectedUseCases: TaaviaUseCaseKey[];
  brandMessages: WorkspaceContentMessage[];
  productCatalog: ProductCatalogSnapshot;
  faqItems: TestFaqItem[];
  predictedCategories: string[];
  predictedSubsectionHints: string[];
  knowledgeBaseBuilt: boolean;
  canBuild: boolean;
}): TestStatusReportSection[] {
  const activeUseCases = normalizeUseCases(input.selectedUseCases);
  const counts = getTestWorkspaceCounts(input);
  const fa = (n: number) => new Intl.NumberFormat('fa-IR').format(n);

  const textCount = input.brandMessages.filter((message) => message.kind === 'text').length;
  const voiceCount = input.brandMessages.filter((message) => message.kind === 'audio').length;
  const imageCount = input.brandMessages.filter((message) => message.kind === 'image').length;
  const videoCount = input.brandMessages.filter((message) => message.kind === 'video').length;
  const fileCount = input.brandMessages.filter((message) => message.kind === 'file').length;
  const hasBrandText = input.brandMessages.some((message) => message.kind === 'text' && message.text?.trim());
  const hasBrandData = input.brandMessages.length > 0;

  const brandStats: string[] = [];
  if (textCount > 0) brandStats.push(`${fa(textCount)} متن`);
  if (voiceCount > 0) brandStats.push(`${fa(voiceCount)} ویس`);
  if (imageCount > 0) brandStats.push(`${fa(imageCount)} تصویر`);
  if (videoCount > 0) brandStats.push(`${fa(videoCount)} ویدیو`);
  if (fileCount > 0) brandStats.push(`${fa(fileCount)} فایل`);

  const hasProductRows = counts.productRows > 0;
  const hasProductFields = input.productCatalog.fields.length > 0;
  const hasPartialProducts = hasProductFields && !hasProductRows;

  const hasFaqDrafts = input.faqItems.length > 0;
  const hasValidFaq = counts.faqItems > 0;
  const mediaTotal = voiceCount + imageCount + videoCount + fileCount;

  const kbTabCount = input.predictedCategories.length;
  const kbSubTabCount = input.predictedSubsectionHints.length;
  const kbReadiness = input.knowledgeBaseBuilt
    ? 'ساخته شده'
    : input.canBuild
      ? 'آماده ساخت'
      : 'نیاز به حداقل یک داده';

  const requirementSections = REQUIREMENT_DEFINITIONS.filter((definition) =>
    definition.useCases.some((useCase) => activeUseCases.has(useCase)),
  ).map((definition) => {
    let status: TestSectionCompletionStatus = 'empty';
    let stats: string[] = [];

    switch (definition.id) {
      case 'products':
        status = hasProductRows
          ? 'completed'
          : input.productCatalog.rows.length > 0 || hasPartialProducts
            ? 'incomplete'
            : 'empty';
        stats = [
          `${fa(input.productCatalog.fields.length)} فیلد`,
          `${fa(counts.productRows)} محصول ثبت شده`,
          'تکمیل از بخش محصول',
        ];
        break;
      case 'faq':
      case 'conversation-scenarios':
      case 'support-info':
        status = sectionStatus(hasValidFaq, hasFaqDrafts && !hasValidFaq);
        stats = [
          `${fa(counts.faqItems)} FAQ فعال`,
          hasValidFaq ? 'از بخش FAQ تکمیل شده' : 'تکمیل از بخش FAQ',
        ];
        break;
      case 'media-assets':
        status = mediaTotal > 0 ? 'completed' : hasBrandData ? 'incomplete' : 'empty';
        stats =
          mediaTotal > 0
            ? [
                ...(imageCount > 0 ? [`${fa(imageCount)} تصویر`] : []),
                ...(videoCount > 0 ? [`${fa(videoCount)} ویدیو`] : []),
                ...(voiceCount > 0 ? [`${fa(voiceCount)} ویس`] : []),
                ...(fileCount > 0 ? [`${fa(fileCount)} فایل`] : []),
              ]
            : ['تکمیل از بخش معرفی برند'];
        break;
      default:
        status = counts.brandItems === 0 ? 'empty' : hasBrandText ? 'completed' : 'incomplete';
        stats = hasBrandText
          ? [
              ...(brandStats.slice(0, 3).length > 0 ? brandStats.slice(0, 3) : [`${fa(counts.brandItems)} آیتم`]),
              'از بخش معرفی برند',
            ]
          : hasBrandData
            ? ['داده برند وارد شده', 'بهتر است متن کامل تری ثبت شود']
            : ['تکمیل از بخش معرفی برند'];
        break;
    }

    return {
      id: definition.id,
      title: definition.label,
      status,
      stats,
    } satisfies TestStatusReportSection;
  });

  return [
    ...requirementSections,
    {
      id: 'kb-output',
      title: 'خروجی Knowledge Base',
      status: input.knowledgeBaseBuilt ? 'completed' : input.canBuild ? 'incomplete' : 'empty',
      stats: [
        `${fa(kbTabCount)} تب قابل ساخت`,
        `${fa(kbSubTabCount)} زیربتب قابل ساخت`,
        `وضعیت: ${kbReadiness}`,
      ],
    },
  ];
}
