import type { KnowledgeBaseFileSnapshotDetail, KnowledgeBaseSourceSimpleComparison, KnowledgeBaseSourceSimpleComparisonStatus, KnowledgeBaseSourceSnapshot, KnowledgeBaseSourceSnapshotDetail, KnowledgeBaseSourceSnapshotDetailView, KnowledgeBaseSourceSnapshotMetadata, KnowledgeBaseSourceSnapshotsPageData } from '@/app/lib/types/taavia-knowledge-base-source-snapshots';

const metadataByType: Record<KnowledgeBaseSourceSnapshot['sourceType'], KnowledgeBaseSourceSnapshotMetadata> = {
  BRAND_INFO: { contentType: 'متن', sourceGroup: 'معرفی برند', contentLanguage: 'فارسی', wordCount: 148, characterCount: 874, originalBrandSourceIdentifier: 'BRAND-INTRO-001' },
  PRODUCTS_SERVICES: { contentType: 'متن', sourceGroup: 'محصولات و خدمات', contentLanguage: 'فارسی', wordCount: 112, characterCount: 660, originalBrandSourceIdentifier: 'PRODUCT-001' },
  FAQ: { contentType: 'متن', sourceGroup: 'سوالات متداول', contentLanguage: 'فارسی', wordCount: 76, characterCount: 428, originalBrandSourceIdentifier: 'FAQ-001' },
  FILE: { contentType: 'فایل متنی', sourceGroup: 'فایل‌ها', contentLanguage: 'فارسی', wordCount: 235, characterCount: 1408, originalBrandSourceIdentifier: 'FILE-001' },
  IMAGE: { contentType: 'تصویر', sourceGroup: 'معرفی برند', contentLanguage: 'فارسی', wordCount: 82, characterCount: 516, originalBrandSourceIdentifier: 'BRAND-FILE-0021' },
  LINK: { contentType: 'لینک', sourceGroup: 'لینک‌ها', contentLanguage: 'فارسی', wordCount: 54, characterCount: 310, originalBrandSourceIdentifier: 'LINK-001' },
};

const brandMissionContent = [
  'ما در تاو با هدف خلق ارزش پایدار برای کسب‌وکارها و افراد، فعالیت خود را آغاز کرده‌ایم.',
  'ماموریت ما ارائه راهکارهای هوشمند مبتنی بر فناوری‌های نوین برای ساده‌سازی فرایندها، افزایش بهره‌وری و کمک به رشد کسب‌وکارهاست.',
  'ما باور داریم که فناوری زمانی ارزشمند است که در خدمت انسان و کسب‌وکار قرار گیرد، تجربه‌ای بهتر بسازد و مسیر تحول دیجیتال را برای سازمان‌ها هموار کند.',
  'تاو متعهد است با نوآوری مستمر، کیفیت بالا و همکاری نزدیک با مشتریان، همراهی قابل اعتماد در مسیر رشد آن‌ها باشد.',
];

/**
 * UI-only immutable Knowledge Base source snapshots for one selected brand.
 * This is deliberately separate from the live, editable brand-source domain.
 */
export function getKnowledgeBaseSourceSnapshotsMock(businessId: string, brandId: string): KnowledgeBaseSourceSnapshotsPageData {
  return {
    businessId,
    brandId,
    knowledgeBaseId: `kb-${brandId}`,
    summary: {
      total: 97,
      typeCounts: [
        { type: 'BRAND_INFO', count: 12 },
        { type: 'PRODUCTS_SERVICES', count: 32 },
        { type: 'FAQ', count: 28 },
        { type: 'FILE', count: 18 },
        { type: 'LINK', count: 7 },
      ],
    },
    snapshots: [
      { snapshotId: 'snapshot-brand-info-1', knowledgeBaseId: `kb-${brandId}`, originalBrandSourceId: 'brand-info-1', sourceType: 'BRAND_INFO', title: 'داستان و ماموریت برند', snapshotReference: 'snapshot://brand-info-1', snapshotCreatedAt: '۱۴۰۵/۰۴/۲۰ - ۱۱:۳۰', comparisonStatus: 'UNCHANGED', currentBrandSourceExists: true },
      { snapshotId: 'snapshot-brand-info-2', knowledgeBaseId: `kb-${brandId}`, originalBrandSourceId: 'brand-info-2', sourceType: 'BRAND_INFO', title: 'ارزش‌ها و اصول برند', snapshotReference: 'snapshot://brand-info-2', snapshotCreatedAt: '۱۴۰۵/۰۴/۱۸ - ۰۹:۱۵', comparisonStatus: 'CHANGED_AFTER_BUILD', currentBrandSourceExists: true },
      { snapshotId: 'snapshot-brand-info-3', knowledgeBaseId: `kb-${brandId}`, originalBrandSourceId: 'brand-info-3', sourceType: 'BRAND_INFO', title: 'گروه هدف و مخاطبان', snapshotReference: 'snapshot://brand-info-3', snapshotCreatedAt: '۱۴۰۵/۰۴/۱۶ - ۱۶:۴۵', comparisonStatus: 'UNCHANGED', currentBrandSourceExists: true },
      { snapshotId: 'snapshot-brand-info-4', knowledgeBaseId: `kb-${brandId}`, originalBrandSourceId: 'brand-info-4', sourceType: 'BRAND_INFO', title: 'چشم‌انداز بلندمدت', snapshotReference: 'snapshot://brand-info-4', snapshotCreatedAt: '۱۴۰۵/۰۴/۱۰ - ۱۴:۲۰', comparisonStatus: 'CHANGED_AFTER_BUILD', currentBrandSourceExists: true },
      { snapshotId: 'snapshot-brand-info-5', knowledgeBaseId: `kb-${brandId}`, originalBrandSourceId: 'brand-info-5', sourceType: 'BRAND_INFO', title: 'تاریخچه و پیشینه برند', snapshotReference: 'snapshot://brand-info-5', snapshotCreatedAt: '۱۴۰۵/۰۳/۲۸ - ۱۰:۰۵', comparisonStatus: 'CURRENT_SOURCE_DELETED', currentBrandSourceExists: false },
      { snapshotId: 'snapshot-brand-image-1', knowledgeBaseId: `kb-${brandId}`, buildId: `build-v4-${brandId}`, buildLabel: 'Build v4', originalBrandSourceId: 'brand-file-0021', sourceGroup: 'brand_info', sourceType: 'IMAGE', title: 'تصویر معرفی برند و لوگو', snapshotReference: 'snapshot://brand-image-1', snapshotCreatedAt: '۱۴۰۵/۰۴/۲۰ - ۱۱:۳۰', comparisonStatus: 'CHANGED_AFTER_BUILD', currentBrandSourceExists: true, fileSnapshot: { fileType: 'image/png', fileSize: '1.24 MB', extractionStatus: 'EXTRACTED', extractedWordCount: 82, previewUrl: createFilePreviewUrl(), extractedText: ['متن زیر از این تصویر استخراج شده است.', 'ویران، نامی که جهان تازه‌ای به طبیعت می‌بخشد.', 'در ویران ما به آینده‌ای پایدار برای کسب‌وکارها و افراد می‌اندیشیم.', 'ماموریت ما ارائه راهکارهای هوشمند مبتنی بر فناوری‌های نوین برای پایداری سازمان‌ها و ارتقای کیفیت زندگی شهروندان است.', 'ما باور داریم که فناوری ارزشمند است که در خدمت انسان و کسب‌وکار قرار گیرد و تجربه‌ای بهتر و شفاف‌تر برای همه ایجاد کند.', 'این تعهد است که نوآوری، مسئولیت‌پذیری و همکاری نزدیک با مشتریان، مسیر رشد و موفقیت دیجیتال را برای سازمان‌ها هموار کند.'] } },
      { snapshotId: 'snapshot-product-1', knowledgeBaseId: `kb-${brandId}`, originalBrandSourceId: 'product-1', sourceType: 'PRODUCTS_SERVICES', title: 'خدمت مشاوره برند', snapshotReference: 'snapshot://product-1', snapshotCreatedAt: '۱۴۰۵/۰۴/۱۹ - ۱۳:۱۰', comparisonStatus: 'UNCHANGED', currentBrandSourceExists: true },
      { snapshotId: 'snapshot-product-2', knowledgeBaseId: `kb-${brandId}`, originalBrandSourceId: 'product-2', sourceType: 'PRODUCTS_SERVICES', title: 'پکیج راه‌اندازی دیجیتال', snapshotReference: 'snapshot://product-2', snapshotCreatedAt: '۱۴۰۵/۰۴/۱۷ - ۰۸:۴۰', comparisonStatus: 'CURRENT_SOURCE_UNAVAILABLE', currentBrandSourceExists: false },
      { snapshotId: 'snapshot-faq-1', knowledgeBaseId: `kb-${brandId}`, originalBrandSourceId: 'faq-1', sourceType: 'FAQ', title: 'شرایط شروع همکاری چیست؟', snapshotReference: 'snapshot://faq-1', snapshotCreatedAt: '۱۴۰۵/۰۴/۱۶ - ۱۲:۳۰', comparisonStatus: 'UNCHANGED', currentBrandSourceExists: true },
      { snapshotId: 'snapshot-file-1', knowledgeBaseId: `kb-${brandId}`, originalBrandSourceId: 'file-1', sourceType: 'FILE', title: 'راهنمای هویت بصری برند', snapshotReference: 'snapshot://file-1', snapshotCreatedAt: '۱۴۰۵/۰۴/۱۳ - ۱۵:۰۰', comparisonStatus: 'CHANGED_AFTER_BUILD', currentBrandSourceExists: true },
      { snapshotId: 'snapshot-link-1', knowledgeBaseId: `kb-${brandId}`, originalBrandSourceId: 'link-1', sourceType: 'LINK', title: 'وب‌سایت رسمی برند', snapshotReference: 'snapshot://link-1', snapshotCreatedAt: '۱۴۰۵/۰۴/۱۲ - ۱۱:۰۰', comparisonStatus: 'UNCHANGED', currentBrandSourceExists: true },
    ],
  };
}

/** Resolves one immutable detail record only within the requested business and brand scope. */
function createFilePreviewUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 675"><defs><linearGradient id="sky" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#f5c58f"/><stop offset=".45" stop-color="#7d9ec5"/><stop offset="1" stop-color="#0c1f37"/></linearGradient></defs><rect width="1200" height="675" fill="url(#sky)"/><path d="M0 530 195 320l112 112 165-274 180 310 108-126 220 188v145H0Z" fill="#172b43"/><path d="m405 405 67-247 92 157-42 37-35-31-43 91Z" fill="#dce8ef"/><path d="M0 585 260 433l150 110 130-95 220 143 135-91 305 135v40H0Z" fill="#0a1728"/><text x="600" y="522" text-anchor="middle" font-family="Arial, sans-serif" font-size="92" font-weight="700" fill="#1ae0d0">ویران</text><text x="600" y="575" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="white">هوشمندانه، ساده، انسانی</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getKnowledgeBaseSourceSnapshotDetailMock(businessId: string, brandId: string, snapshotId: string): KnowledgeBaseSourceSnapshotDetailView | null {
  const pageData = getKnowledgeBaseSourceSnapshotsMock(businessId, brandId);
  const snapshot = pageData.snapshots.find((item) => item.snapshotId === snapshotId);
  if (!snapshot) return null;

  const metadata = metadataByType[snapshot.sourceType];
  const detail: KnowledgeBaseSourceSnapshotDetail = {
    ...snapshot,
    businessId,
    brandId,
    buildId: snapshot.buildId ?? `build-v4-${brandId}`,
    buildLabel: snapshot.buildLabel ?? 'Build v4',
    content: snapshot.sourceType === 'BRAND_INFO' && snapshot.snapshotId === 'snapshot-brand-info-1'
      ? brandMissionContent
      : [`این محتوای ثبت‌شده از «${snapshot.title}» در زمان ساخت دانشنامه Snapshot شده است.`, 'این رکورد فقط برای مشاهده نگهداری می‌شود و با تغییر منبع فعلی برند تغییر نمی‌کند.'],
    lastComparedAt: '۱۴۰۵/۰۴/۲۵ - ۰۹:۴۵',
    metadata,
  };

  if (snapshot.sourceType === 'FILE' || snapshot.sourceType === 'IMAGE') {
    const fileDetail: KnowledgeBaseFileSnapshotDetail = {
      ...detail,
      detailMode: 'FILE',
      title: snapshot.sourceType === 'IMAGE' ? snapshot.title : 'تصویر معرفی برند و لوگو',
      file: snapshot.fileSnapshot ?? {
        fileType: 'image/png',
        fileSize: '1.24 MB',
        extractionStatus: 'EXTRACTED',
        extractedWordCount: 82,
        previewUrl: createFilePreviewUrl(),
        extractedText: [
          'متن زیر از این تصویر استخراج شده است.',
          'ویران، نامی که جهان تازه‌ای به طبیعت می‌بخشد.',
          'در ویران ما به آینده‌ای پایدار برای کسب‌وکارها و افراد می‌اندیشیم. خود را آغاز کرده‌ایم.',
          'ماموریت ما ارائه راهکارهای هوشمند مبتنی بر فناوری‌های نوین برای پایداری سازمان‌ها و ارتقای کیفیت زندگی شهروندان است.',
          'ما باور داریم که فناوری ارزشمند است که در خدمت انسان و کسب‌وکار قرار گیرد و تجربه‌ای بهتر و شفاف‌تر برای همه ایجاد کند.',
          'این تعهد است که نوآوری، مسئولیت‌پذیری و همکاری نزدیک با مشتریان، مسیر رشد و موفقیت دیجیتال را برای سازمان‌ها هموار کند.',
        ],
      },
    };
    return fileDetail;
  }

  return { ...detail, detailMode: 'TEXT' };
}

function normalizeContent(content: string[]) {
  return content.join('\n').replace(/\r\n/g, '\n').trim();
}

/** Resolves only the two complete read-only texts needed for Phase 1 comparison. */
export function getKnowledgeBaseSourceSimpleComparisonMock(businessId: string, brandId: string, snapshotId: string): KnowledgeBaseSourceSimpleComparison | null {
  const snapshot = getKnowledgeBaseSourceSnapshotDetailMock(businessId, brandId, snapshotId);
  if (!snapshot) return null;

  const currentSourceContent = !snapshot.currentBrandSourceExists
    ? null
    : snapshot.snapshotId === 'snapshot-brand-info-1'
      ? [
        'ما در تاو با هدف خلق ارزش پایدار برای کسب‌وکارها و افراد، فعالیت خود را آغاز کرده‌ایم.',
        'ماموریت ما ارائه راهکارهای هوشمند مبتنی بر فناوری‌های نوین برای ساده‌سازی فرایندها، افزایش بهره‌وری و کمک به رشد کسب‌وکارهاست.',
        'ما باور داریم فناوری زمانی ارزشمند است که در خدمت انسان و کسب‌وکار قرار گیرد و تجربه‌ای بهتر برای مشتریان بسازد.',
        'تاو با نوآوری مستمر، کیفیت بالا و همکاری نزدیک با مشتریان، همراهی قابل اعتماد در مسیر تحول دیجیتال آن‌هاست.',
      ]
      : snapshot.content;

  const comparisonStatus: KnowledgeBaseSourceSimpleComparisonStatus = snapshot.comparisonStatus === 'CURRENT_SOURCE_DELETED'
    ? 'CURRENT_SOURCE_DELETED'
    : snapshot.comparisonStatus === 'CURRENT_SOURCE_UNAVAILABLE'
      ? 'CURRENT_SOURCE_UNAVAILABLE'
      : currentSourceContent && normalizeContent(snapshot.content) === normalizeContent(currentSourceContent)
        ? 'UNCHANGED'
        : 'CHANGED';

  return {
    businessId,
    brandId,
    snapshotId: snapshot.snapshotId,
    originalBrandSourceId: snapshot.originalBrandSourceId,
    title: snapshot.title,
    sourceType: snapshot.sourceType,
    snapshotContent: snapshot.content,
    snapshotCreatedAt: snapshot.snapshotCreatedAt,
    buildId: snapshot.buildId,
    buildLabel: snapshot.buildLabel,
    currentSourceContent,
    currentSourceUpdatedAt: currentSourceContent ? '۱۴۰۵/۰۴/۲۵ - ۰۹:۴۵' : null,
    currentSourceExists: snapshot.currentBrandSourceExists,
    comparisonStatus,
  };
}
