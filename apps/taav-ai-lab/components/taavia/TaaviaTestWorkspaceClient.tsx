'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookText, Boxes, CircleHelp, FlaskConical, Sparkles } from 'lucide-react';
import type { TaaviaUseCaseKey } from '@/app/lib/types/domain';
import type { ProductCatalogSnapshot, ProductField, WorkspaceContentMessage } from '@/app/lib/types/taavia-workspace';
import type { TestFaqItem, TestKnowledgeBaseDocument } from '@/app/lib/types/taavia-test-workspace';
import { buildTestKnowledgeBaseDocument } from '@/app/lib/taavia-test-knowledge-builder';
import {
  buildTestStatusReportSections,
  buildTestStatusWarnings,
  getTestWorkspaceCounts,
  hasAnyTestWorkspaceData,
} from '@/app/lib/taavia-test-requirements';
import { loadTestWorkspaceSnapshot, saveTestWorkspaceSnapshot } from '@/app/lib/taavia-test-storage';
import { createTextMessage, hydrateWorkspaceMessages } from '@/app/lib/taavia-workspace-knowledge';
import { ContentFeedEditor } from '@/components/taavia/ContentFeedEditor';
import { TestBuildKnowledgeBaseButton } from '@/components/taavia/test/TestBuildKnowledgeBaseButton';
import { TestFaqEditor } from '@/components/taavia/test/TestFaqEditor';
import { TestKnowledgeBaseCategoriesPreview } from '@/components/taavia/test/TestKnowledgeBaseCategoriesPreview';
import { TestKnowledgeBaseEditor } from '@/components/taavia/test/TestKnowledgeBaseEditor';
import { TestProductCatalogEditor } from '@/components/taavia/test/TestProductCatalogEditor';
import { TestStatusReportPanel } from '@/components/taavia/test/TestStatusReportPanel';
import {
  TaavTabs,
  TaavTabsContent,
  TaavTabsList,
  TaavTabsTrigger,
} from '@repo/ui/taav/navigation';

const INITIAL_PRODUCT_FIELDS: ProductField[] = [
  { id: 'product-name', label: 'نام محصول', type: 'text' },
  { id: 'product-type', label: 'نوع', type: 'text' },
  { id: 'product-description', label: 'توضیحات', type: 'textarea' },
  { id: 'product-price', label: 'قیمت', type: 'number' },
  { id: 'product-active', label: 'فعال است؟', type: 'boolean' },
];

const USE_CASE_LABELS: Record<TaaviaUseCaseKey, string> = {
  support: 'پشتیبانی',
  sales: 'فروش',
  marketing: 'بازاریابی',
  operations: 'عملیات',
  finance: 'مالی',
  hr: 'منابع انسانی',
  product: 'محصول',
  management: 'مدیریت',
  it: 'فناوری اطلاعات',
  all: 'همه سناریوها',
};

function createAutofillFaqItem(index: number, question: string, answer: string, category: string): TestFaqItem {
  return {
    id: `faq-autofill-${Date.now()}-${index}`,
    question,
    answer,
    category,
    tags: [category, 'خودکار'],
    priority: index === 1 ? 'high' : 'medium',
    isActive: true,
    supplementaryNote: 'این مورد به‌صورت خودکار برای راه‌اندازی سریع اولیه تولید شده است.',
  };
}

function buildAutofillData(brandName: string, selectedUseCases: TaaviaUseCaseKey[]) {
  const useCaseKeys = selectedUseCases.filter((item) => item !== 'all');
  const useCaseLabels = useCaseKeys.map((item) => USE_CASE_LABELS[item]).filter(Boolean);
  const focusLabel = useCaseLabels.length > 0 ? useCaseLabels.join('، ') : 'پشتیبانی، فروش و راهنمایی مشتری';
  const generatedAt = new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date());

  const brandMessages: WorkspaceContentMessage[] = [
    createTextMessage(
      `${brandName} یک برند در حال راه‌اندازی برای ارائه تجربه‌ای سریع، دقیق و حرفه‌ای است. لحن ارتباطی باید دوستانه، مطمئن و خلاصه باشد.`,
    ),
    createTextMessage(
      `تمرکز اصلی ${brandName} روی ${focusLabel} است. پاسخ‌ها باید شفاف، عملیاتی و قابل اجرا باشند و در صورت نیاز کاربر را به گام بعدی هدایت کنند.`,
    ),
    createTextMessage(
      `بسته خودکار در ${generatedAt} تولید شد تا همه تب‌ها برای ساخت Knowledge Base آماده باشند و فقط مرحله Set Knowledge باقی بماند.`,
    ),
  ];

  const serviceSeeds =
    useCaseLabels.length > 0
      ? useCaseLabels.slice(0, 3)
      : ['پشتیبانی', 'فروش', 'آنبوردینگ'];

  const productCatalog: ProductCatalogSnapshot = {
    fields: INITIAL_PRODUCT_FIELDS,
    rows: serviceSeeds.map((label, index) => ({
      id: `product-autofill-${Date.now()}-${index + 1}`,
      values: {
        'product-name': `${brandName} ${label}`,
        'product-type': index === 0 ? 'سرویس اصلی' : index === 1 ? 'پکیج تخصصی' : 'جریان کمکی',
        'product-description': `${brandName} در بخش ${label} با تمرکز روی سرعت اجرا، شفافیت پاسخ و امکان پیگیری سناریوها طراحی شده است.`,
        'product-price': `${(index + 1) * 2500000}`,
        'product-active': 'yes',
      },
    })),
  };

  const faqItems: TestFaqItem[] = [
    createAutofillFaqItem(
      1,
      `${brandName} چه کمکی به کاربر می‌کند؟`,
      `${brandName} با تمرکز روی ${focusLabel} به کاربر کمک می‌کند سریع‌تر تصمیم بگیرد و پاسخ دقیق‌تر دریافت کند.`,
      'شناخت برند',
    ),
    createAutofillFaqItem(
      2,
      `چگونه می‌توان از ${brandName} شروع کرد؟`,
      `کافی است سناریو یا درخواست خود را ثبت کنید تا ${brandName} متناسب با نیاز شما پیشنهاد و مسیر اجرایی ارائه دهد.`,
      'شروع کار',
    ),
    createAutofillFaqItem(
      3,
      `آیا اطلاعات ${brandName} قابل سفارشی‌سازی است؟`,
      `بله، ساختار Knowledge Base، داده‌های محصول و FAQ همگی قابل ویرایش و شخصی‌سازی هستند.`,
      'تنظیمات',
    ),
  ];

  return { brandMessages, productCatalog, faqItems };
}

type TestTab = 'brand' | 'products' | 'faq' | 'knowledge-base';

type TaaviaTestWorkspaceClientProps = {
  businessId: string;
  brandId: string;
  brandName: string;
  selectedUseCases?: TaaviaUseCaseKey[];
};

export function TaaviaTestWorkspaceClient({
  businessId,
  brandId,
  brandName,
  selectedUseCases = [],
}: TaaviaTestWorkspaceClientProps) {
  const entryPath = `/businesses/${businessId}/products/taavia/brands/${brandId}/entry`;

  const [activeTab, setActiveTab] = useState<TestTab>('brand');
  const [brandMessages, setBrandMessages] = useState<WorkspaceContentMessage[]>([]);
  const [productCatalog, setProductCatalog] = useState<ProductCatalogSnapshot>({
    fields: INITIAL_PRODUCT_FIELDS,
    rows: [],
  });
  const [faqItems, setFaqItems] = useState<TestFaqItem[]>([]);
  const [knowledgeBaseDocument, setKnowledgeBaseDocument] = useState<TestKnowledgeBaseDocument | null>(null);
  const [kbSelection, setKbSelection] = useState<{ tabId: string; subTabId: string | null } | null>(null);
  const [pendingKbNavigation, setPendingKbNavigation] = useState<{ tabId: string; subTabId?: string } | null>(null);
  const [kbDirty, setKbDirty] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isSavingKb, setIsSavingKb] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadTestWorkspaceSnapshot(brandId);
    if (saved) {
      setBrandMessages(hydrateWorkspaceMessages(saved.brandMessages));
      setProductCatalog(saved.productCatalog);
      setFaqItems(saved.faqItems);
      setKnowledgeBaseDocument(saved.knowledgeBaseDocument);
    }
    setHydrated(true);
  }, [brandId]);

  useEffect(() => {
    if (!hydrated) return;
    saveTestWorkspaceSnapshot(brandId, {
      brandMessages: brandMessages.map(({ file: _file, objectUrl: _objectUrl, ...message }) => message),
      productCatalog,
      faqItems,
      knowledgeBaseDocument,
      lastBuiltAt: knowledgeBaseDocument?.builtAt ?? null,
    });
  }, [brandId, brandMessages, productCatalog, faqItems, knowledgeBaseDocument, hydrated]);

  const counts = useMemo(
    () => getTestWorkspaceCounts({ brandMessages, productCatalog, faqItems }),
    [brandMessages, productCatalog, faqItems],
  );

  const canBuild = hasAnyTestWorkspaceData({ brandMessages, productCatalog, faqItems });

  const kbPreviewDocument = useMemo(() => knowledgeBaseDocument, [knowledgeBaseDocument]);

  const previewMeta = useMemo(() => {
    if (!kbPreviewDocument) return { categories: [] as string[], subsectionHints: [] as string[] };
    return {
      categories: kbPreviewDocument.tabs.map((tab) => tab.title),
      subsectionHints: kbPreviewDocument.tabs.flatMap((tab) =>
        tab.subTabs.length > 0 ? tab.subTabs.map((sub) => sub.title) : [tab.title],
      ),
    };
  }, [kbPreviewDocument]);

  const kbPreviewTabs = kbPreviewDocument?.tabs ?? [];

  const resolveKbSelection = useCallback(
    (
      previewTabId: string,
      previewSubTabId?: string,
      doc: TestKnowledgeBaseDocument | null = knowledgeBaseDocument,
    ) => {
      if (!doc) return null;

      const previewTab = kbPreviewTabs.find((tab) => tab.id === previewTabId);
      const previewSub = previewSubTabId ? previewTab?.subTabs.find((sub) => sub.id === previewSubTabId) : null;

      const tab =
        doc.tabs.find((item) => item.id === previewTabId) ??
        doc.tabs.find((item) => item.title === previewTab?.title);
      if (!tab) return null;

      if (previewSubTabId || previewSub) {
        const sub =
          tab.subTabs.find((item) => item.id === previewSubTabId) ??
          tab.subTabs.find((item) => item.title === previewSub?.title) ??
          tab.subTabs[0];
        return { tabId: tab.id, subTabId: sub?.id ?? null };
      }

      if (tab.subTabs.length > 0) {
        return { tabId: tab.id, subTabId: tab.subTabs[0]?.id ?? null };
      }

      return { tabId: tab.id, subTabId: null };
    },
    [knowledgeBaseDocument, kbPreviewTabs],
  );

  useEffect(() => {
    if (!knowledgeBaseDocument) {
      setKbSelection(null);
      return;
    }

    setKbSelection((current) => {
      if (current && knowledgeBaseDocument.tabs.some((tab) => tab.id === current.tabId)) {
        return current;
      }
      const first = knowledgeBaseDocument.tabs[0];
      return { tabId: first?.id ?? '', subTabId: first?.subTabs[0]?.id ?? null };
    });
  }, [knowledgeBaseDocument]);

  useEffect(() => {
    if (!knowledgeBaseDocument || !pendingKbNavigation) return;

    const selection = resolveKbSelection(
      pendingKbNavigation.tabId,
      pendingKbNavigation.subTabId,
      knowledgeBaseDocument,
    );
    if (selection) setKbSelection(selection);
    setActiveTab('knowledge-base');
    setPendingKbNavigation(null);
  }, [knowledgeBaseDocument, pendingKbNavigation, resolveKbSelection]);

  const warnings = useMemo(
    () => buildTestStatusWarnings({ brandMessages, productCatalog, faqItems }),
    [brandMessages, productCatalog, faqItems],
  );

  const statusSections = useMemo(
    () =>
      buildTestStatusReportSections({
        brandMessages,
        productCatalog,
        faqItems,
        predictedCategories: previewMeta.categories,
        predictedSubsectionHints: previewMeta.subsectionHints,
        knowledgeBaseBuilt: knowledgeBaseDocument !== null,
        canBuild,
      }),
    [
      brandMessages,
      productCatalog,
      faqItems,
      previewMeta.categories,
      previewMeta.subsectionHints,
      knowledgeBaseDocument,
      canBuild,
    ],
  );

  const previewLines = useMemo(
    () => [
      `${new Intl.NumberFormat('fa-IR').format(counts.brandItems)} آیتم در معرفی برند`,
      `${new Intl.NumberFormat('fa-IR').format(counts.productRows)} محصول / خدمت`,
      `${new Intl.NumberFormat('fa-IR').format(counts.faqItems)} FAQ فعال`,
    ],
    [counts],
  );

  const handleAutofillWorkspace = useCallback(() => {
    const hasExistingData =
      brandMessages.length > 0 ||
      productCatalog.rows.length > 0 ||
      faqItems.length > 0 ||
      knowledgeBaseDocument !== null;

    if (hasExistingData) {
      const confirmed = window.confirm('داده‌های فعلی جایگزین می‌شوند. ادامه می‌دهی؟');
      if (!confirmed) return;
    }

    const autofill = buildAutofillData(brandName, selectedUseCases);
    setBrandMessages(autofill.brandMessages);
    setProductCatalog(autofill.productCatalog);
    setFaqItems(autofill.faqItems);
    setKnowledgeBaseDocument(null);
    setKbSelection(null);
    setPendingKbNavigation(null);
    setKbDirty(false);
    setActiveTab('brand');
    setFeedback('همه تب‌ها با موفقیت به‌صورت خودکار پر شدند. حالا می‌توانی روی Set Knowledge بزنی.');
  }, [brandMessages.length, productCatalog.rows.length, faqItems.length, knowledgeBaseDocument, brandName, selectedUseCases]);

  const handleBuildKnowledgeBase = useCallback(async () => {
    if (!canBuild) {
      setFeedback('برای ساخت Knowledge Base، حداقل یک مورد اطلاعات وارد کن.');
      throw new Error('no data');
    }

    setIsBuilding(true);
    setFeedback(null);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const document = buildTestKnowledgeBaseDocument({
      brandName,
      selectedUseCases,
      brandMessages,
      productCatalog,
      faqItems,
    });

    if (document.tabs.length === 0) {
      setIsBuilding(false);
      setFeedback('دسته‌ای برای ساخت Knowledge Base پیدا نشد.');
      throw new Error('empty document');
    }

    setKnowledgeBaseDocument(document);
    setKbDirty(false);
    setActiveTab('knowledge-base');
    setFeedback('Knowledge Base با موفقیت ساخته شد.');
    setIsBuilding(false);
  }, [brandName, selectedUseCases, brandMessages, productCatalog, faqItems, canBuild]);

  const handleKnowledgeBaseChange = useCallback((document: TestKnowledgeBaseDocument) => {
    setKnowledgeBaseDocument(document);
    setKbDirty(true);
  }, []);

  const handleKnowledgeBaseSave = useCallback(async () => {
    if (!knowledgeBaseDocument) return;
    setIsSavingKb(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setKnowledgeBaseDocument({
      ...knowledgeBaseDocument,
      lastSavedAt: new Date().toISOString(),
    });
    setKbDirty(false);
    setFeedback('تغییرات Knowledge Base ذخیره شد.');
    setIsSavingKb(false);
  }, [knowledgeBaseDocument]);

  const handleTabChange = useCallback(
    (value: string) => {
      if (activeTab === 'knowledge-base' && kbDirty && value !== 'knowledge-base') {
        const confirmed = window.confirm('تغییرات ذخیره نشده دارید. بدون ذخیره ادامه می‌دهی؟');
        if (!confirmed) return;
        setKbDirty(false);
      }
      setActiveTab(value as TestTab);
    },
    [activeTab, kbDirty],
  );

  const handleBackToInput = useCallback(() => {
    if (kbDirty) {
      const confirmed = window.confirm('تغییرات ذخیره نشده دارید. بدون ذخیره به ورود اطلاعات برمی‌گردی؟');
      if (!confirmed) return;
      setKbDirty(false);
    }
    setActiveTab('brand');
  }, [kbDirty]);

  const handleKbCategoryNavigate = useCallback(
    async (previewTabId: string, previewSubTabId?: string) => {
      if (activeTab === 'knowledge-base' && kbDirty) {
        const confirmed = window.confirm('تغییرات ذخیره نشده دارید. بدون ذخیره ادامه می‌دهی؟');
        if (!confirmed) return;
        setKbDirty(false);
      }

      if (!knowledgeBaseDocument) {
        if (!canBuild) {
          setFeedback('برای ورود به این بخش، ابتدا داده وارد کن و Knowledge Base را بساز.');
          return;
        }
        setFeedback('برای دیدن Knowledge Base، ابتدا روی دکمه Set Knowledge Base بزن.');
        return;
      }

      const selection = resolveKbSelection(previewTabId, previewSubTabId);
      if (!selection) return;
      setKbSelection(selection);
      setActiveTab('knowledge-base');
    },
    [activeTab, kbDirty, knowledgeBaseDocument, resolveKbSelection],
  );

  const tabs: Array<{ value: Exclude<TestTab, 'knowledge-base'>; label: string; icon: typeof BookText }> = [
    { value: 'brand', label: 'معرفی برند', icon: BookText },
    { value: 'products', label: 'محصول / خدمات', icon: Boxes },
    { value: 'faq', label: 'سوالات پرتکرار', icon: CircleHelp },
  ];

  const showCategoriesPreview = activeTab !== 'knowledge-base';

  return (
    <div className="relative isolate overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,16,33,0.98)_0%,rgba(11,22,43,0.95)_100%)] px-4 py-5 pb-28 md:px-5 md:py-6">
      <div className="absolute inset-x-[-10%] top-[-18%] h-64 rounded-full bg-[radial-gradient(circle,rgba(250,204,21,0.16)_0%,rgba(250,204,21,0)_72%)] blur-3xl" />

      <div className="relative grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAutofillWorkspace}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(66,237,211,0.24)] bg-[rgba(66,237,211,0.12)] px-4 py-2 text-[length:var(--taav-text-sm)] font-bold text-[rgb(150,246,231)] backdrop-blur-xl transition hover:border-[rgba(66,237,211,0.36)] hover:bg-[rgba(66,237,211,0.18)]"
            >
              <Sparkles className="h-4 w-4" />
              پر کردن خودکار تب‌ها
            </button>
            <Link href={entryPath}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[length:var(--taav-text-sm)] font-bold text-[var(--taav-text-strong)] backdrop-blur-xl transition hover:border-white/20 hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
              بازگشت به انتخاب مسیر
            </span>
            </Link>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(250,204,21,0.24)] bg-[rgba(250,204,21,0.10)] px-4 py-2 text-[length:var(--taav-text-xs)] font-black text-[rgb(253,224,71)]">
            <FlaskConical className="h-4 w-4" />
            تنظیم دستی · {brandName}
          </div>
        </div>

        <div className="text-right">
          <h1 className="m-0 text-[clamp(1.6rem,2.4vw,2.4rem)] font-black text-white">ساخت Knowledge Base (تنظیم دستی)</h1>
          <p className="mt-2 max-w-3xl text-[length:var(--taav-text-sm)] leading-8 text-[rgba(217,229,255,0.72)]">
            اطلاعات برند، محصول و FAQ را وارد کن. در پایان یک سند قابل ویرایش با تب و زیرتب ساخته می‌شود.
          </p>
        </div>

        {feedback ? (
          <div
            className={`rounded-[16px] border px-4 py-3 text-[12px] font-semibold ${
              feedback.includes('موفقیت') || feedback.includes('ذخیره')
                ? 'border-[rgba(66,237,211,0.22)] bg-[rgba(66,237,211,0.10)] text-[rgb(165,248,235)]'
                : 'border-[rgba(248,113,113,0.22)] bg-[rgba(248,113,113,0.08)] text-[rgb(254,202,202)]'
            }`}
          >
            {feedback}
          </div>
        ) : null}

        <div
          className={`grid items-start gap-2 ${
            showCategoriesPreview
              ? 'lg:grid-cols-[minmax(200px,240px)_minmax(0,1fr)_minmax(200px,240px)]'
              : 'lg:grid-cols-[minmax(200px,240px)_minmax(0,1fr)]'
          }`}
        >
          <div className="order-3 lg:col-start-1 lg:row-start-1">
            <TestStatusReportPanel
              counts={counts}
              predictedCategories={previewMeta.categories}
              canBuild={canBuild}
              sections={statusSections}
              warnings={warnings}
            />
          </div>

          <div className="order-1 min-w-0 lg:col-start-2 lg:row-start-1">
            <TaavTabs value={activeTab === 'knowledge-base' ? 'brand' : activeTab} onValueChange={handleTabChange} dir="rtl">
              <TaavTabsList className="flex w-full flex-wrap justify-start gap-2 overflow-x-auto bg-transparent p-0">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <TaavTabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="shrink-0 gap-2 rounded-[16px] border border-white/8 bg-white/5 px-4 py-2.5 data-[state=active]:border-[rgba(66,237,211,0.24)] data-[state=active]:bg-[rgba(66,237,211,0.12)]"
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </TaavTabsTrigger>
                  );
                })}
              </TaavTabsList>

              {activeTab !== 'knowledge-base' ? (
                <>
                  <TaavTabsContent value="brand" className="m-0">
                    <ContentFeedEditor
                      title="معرفی برند"
                      description="متن، ویس، تصویر، ویدیو و فایل درباره برند"
                      placeholder="معرفی برند، تاریخچه، لحن، ارزش‌ها و مخاطب هدف را بنویس..."
                      emptyTitle="هنوز محتوایی برای برند ثبت نشده"
                      emptyDescription="می‌توانی متن بنویسی، ویس ضبط کنی یا فایل و تصویر اضافه کنی."
                      messages={brandMessages}
                      onMessagesChange={setBrandMessages}
                    />
                  </TaavTabsContent>

                  <TaavTabsContent value="products" className="m-0">
                    <TestProductCatalogEditor catalog={productCatalog} onChange={setProductCatalog} />
                  </TaavTabsContent>

                  <TaavTabsContent value="faq" className="m-0">
                    <TestFaqEditor items={faqItems} onChange={setFaqItems} />
                  </TaavTabsContent>
                </>
              ) : null}
            </TaavTabs>

            {activeTab === 'knowledge-base' && knowledgeBaseDocument ? (
              <div className="mt-2">
                <TestKnowledgeBaseEditor
                  document={knowledgeBaseDocument}
                  onChange={handleKnowledgeBaseChange}
                  onSave={() => void handleKnowledgeBaseSave()}
                  onBackToInput={handleBackToInput}
                  isSaving={isSavingKb}
                  isDirty={kbDirty}
                  selectedTabId={kbSelection?.tabId ?? knowledgeBaseDocument.tabs[0]?.id}
                  selectedSubTabId={kbSelection?.subTabId ?? knowledgeBaseDocument.tabs[0]?.subTabs[0]?.id ?? null}
                  onSelectTab={(tabId, subTabId) => setKbSelection({ tabId, subTabId })}
                />
              </div>
            ) : null}
          </div>

          {showCategoriesPreview ? (
            <div className="order-2 lg:col-start-3 lg:row-start-1">
              <TestKnowledgeBaseCategoriesPreview
                tabs={kbPreviewTabs}
                isBuilt={knowledgeBaseDocument !== null}
                activeTabId={kbSelection?.tabId}
                activeSubTabId={kbSelection?.subTabId}
                isNavigationActive={false}
                onNavigate={(tabId, subTabId) => void handleKbCategoryNavigate(tabId, subTabId)}
              />
            </div>
          ) : null}
        </div>
      </div>

      <TestBuildKnowledgeBaseButton
        canBuild={canBuild}
        previewLines={previewLines}
        categoryHints={previewMeta.categories}
        isBuilding={isBuilding}
        hidden={activeTab === 'knowledge-base'}
        onBuild={handleBuildKnowledgeBase}
        onError={(message) => setFeedback(message)}
      />
    </div>
  );
}
