import { expandTaaviaUseCases, TAAVIA_USE_CASE_MAP } from '@/app/lib/taavia-use-cases';
import type { TaaviaUseCaseKey } from '@/app/lib/types/domain';
import type { ProductCatalogSnapshot, WorkspaceContentMessage } from '@/app/lib/types/taavia-workspace';
import type {
  TestFaqItem,
  TestRequirementCard,
  TestSectionCompletionStatus,
  TestStatusReportSection,
  TestStatusWarning,
} from '@/app/lib/types/taavia-test-workspace';

type RequirementSource = 'brand' | 'products' | 'faq';

const USE_CASE_SOURCES: Partial<Record<TaaviaUseCaseKey, RequirementSource>> = {
  brand_identity: 'brand',
  products_services: 'products',
  pricing_plans: 'products',
  customer_support: 'faq',
  sales_consulting: 'faq',
  faq: 'faq',
  training_guides: 'faq',
  policies: 'faq',
  complaints_handoff: 'faq',
};

function normalizeUseCases(selectedUseCases: TaaviaUseCaseKey[]) {
  return expandTaaviaUseCases(selectedUseCases);
}

function hasBrandData(messages: WorkspaceContentMessage[]) {
  return messages.length > 0;
}

function hasBrandText(messages: WorkspaceContentMessage[]) {
  return messages.some((message) => message.kind === 'text' && message.text?.trim());
}

function hasProductData(catalog: ProductCatalogSnapshot) {
  return catalog.rows.some((row) => catalog.fields.some((field) => row.values[field.id]?.trim()));
}

function hasFaqData(items: TestFaqItem[]) {
  return items.some((item) => item.isActive && item.question.trim() && item.answer.trim());
}

function getUseCaseStatus(
  useCaseKey: TaaviaUseCaseKey,
  input: {
    brandMessages: WorkspaceContentMessage[];
    productCatalog: ProductCatalogSnapshot;
    faqItems: TestFaqItem[];
  },
): TestSectionCompletionStatus {
  const source = USE_CASE_SOURCES[useCaseKey] ?? 'faq';
  const brandData = hasBrandData(input.brandMessages);
  const brandText = hasBrandText(input.brandMessages);
  const productData = hasProductData(input.productCatalog);
  const faqData = hasFaqData(input.faqItems);

  if (source === 'brand') {
    if (brandText) return 'completed';
    if (brandData) return 'incomplete';
    return 'empty';
  }

  if (source === 'products') {
    if (productData) return 'completed';
    if (input.productCatalog.fields.length > 0) return 'incomplete';
    return 'empty';
  }

  if (faqData) return 'completed';
  if (input.faqItems.length > 0 || brandText) return 'incomplete';
  return 'empty';
}

export function buildTestRequirementCards(input: {
  selectedUseCases: TaaviaUseCaseKey[];
  brandMessages: WorkspaceContentMessage[];
  productCatalog: ProductCatalogSnapshot;
  faqItems: TestFaqItem[];
}): TestRequirementCard[] {
  return normalizeUseCases(input.selectedUseCases).map((useCaseKey) => {
    const definition = TAAVIA_USE_CASE_MAP[useCaseKey];
    const source = USE_CASE_SOURCES[useCaseKey] ?? 'faq';
    const status = getUseCaseStatus(useCaseKey, input);

    return {
      id: useCaseKey,
      label: definition.title,
      description: definition.sections.join('، '),
      relatedTab: source === 'products' ? 'products' : source === 'brand' ? 'brand' : 'faq',
      status: status === 'completed' ? 'completed' : status === 'incomplete' ? 'optional' : 'empty',
    } satisfies TestRequirementCard;
  });
}

export function hasSupportKnowledgeUseCase(selectedUseCases: TaaviaUseCaseKey[]) {
  const active = new Set(normalizeUseCases(selectedUseCases));
  return (
    active.has('customer_support') ||
    active.has('sales_consulting') ||
    active.has('faq') ||
    active.has('training_guides') ||
    active.has('policies') ||
    active.has('complaints_handoff')
  );
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
  const hasProductFields = input.productCatalog.fields.length > 0;
  const hasBrandMedia = input.brandMessages.some((message) => message.kind !== 'text');
  const hasText = hasBrandText(input.brandMessages);

  if (counts.faqItems === 0 && input.faqItems.length > 0) {
    warnings.push({ id: 'faq-incomplete', message: 'برخی FAQها ناقص هستند یا فعال نشده‌اند.' });
  } else if (counts.faqItems === 0) {
    warnings.push({ id: 'faq-empty', message: 'هنوز FAQ معتبری ثبت نشده است.' });
  }

  if (hasProductFields && counts.productRows === 0) {
    warnings.push({ id: 'product-no-rows', message: 'فیلد محصول تعریف شده اما هنوز محصول یا خدمتی ثبت نشده است.' });
  }

  if (hasBrandMedia && !hasText) {
    warnings.push({ id: 'brand-media-only', message: 'برای برند فایل ثبت شده اما متن توضیحی هنوز کامل نشده است.' });
  }

  if (counts.brandItems === 0) {
    warnings.push({ id: 'brand-empty', message: 'بخش معرفی برند هنوز خالی است.' });
  }

  return warnings;
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
  const fa = (n: number) => new Intl.NumberFormat('fa-IR').format(n);

  const requirementSections = activeUseCases.map((useCaseKey) => {
    const definition = TAAVIA_USE_CASE_MAP[useCaseKey];

    return {
      id: useCaseKey,
      title: definition.title,
      status: getUseCaseStatus(useCaseKey, input),
      stats: definition.sections,
    } satisfies TestStatusReportSection;
  });

  return [
    ...requirementSections,
    {
      id: 'kb-output',
      title: 'خروجی Knowledge Base',
      status: input.knowledgeBaseBuilt ? 'completed' : input.canBuild ? 'incomplete' : 'empty',
      stats: [
        `${fa(input.predictedCategories.length)} تب قابل ساخت`,
        `${fa(input.predictedSubsectionHints.length)} زیر‌بخش پیشنهادی`,
        input.knowledgeBaseBuilt ? 'Knowledge Base ساخته شده است' : input.canBuild ? 'آماده ساخت است' : 'هنوز داده کافی ندارد',
      ],
    },
  ];
}
