import type { TaaviaBrandDetailsOverview } from '@/app/lib/types/taavia-brand-details-dashboard';
export function getTaaviaBrandDetailsOverviewMock(businessId: string, brandId: string): TaaviaBrandDetailsOverview {
  const records = [
    ['v4', true, 'بروزرسانی', '۱۴۰۵/۰۲/۲۰ - ۱۰:۱۵', 128, 22, 'بروزرسانی محصولات و FAQ'],
    ['v3', false, 'بروزرسانی', '۱۴۰۵/۰۲/۰۸ - ۱۵:۴۰', 105, 19, 'افزودن محصولات جدید'],
    ['v2', false, 'ساخت اولیه', '۱۴۰۵/۰۱/۲۸ - ۰۹:۳۰', 86, 18, 'اولین ساخت Knowledge Base'],
    ['v1', false, 'ساخت اولیه', '۱۴۰۵/۰۱/۱۵ - ۱۶:۱۰', 62, 14, 'ساخت اولیه از منابع برند'],
    ['v0', false, 'ساخت اولیه', '۱۴۰۵/۰۱/۱۰ - ۱۱:۰۵', 34, 10, 'ایجاد اولیه برند در تاویا'],
  ] as const;
  return { businessId, brandId, website: 'https://www.tausys.com', country: 'ایران', industry: 'فناوری اطلاعات و نرم‌افزار', currentSources: { brandInfo: 1, productsServices: 24, faqs: 8, filesDocuments: 15, links: 3 }, knowledgeBases: records.map(([versionLabel, isActive, buildType, createdAt, categoryCount, sourceSnapshotCount, description]) => ({ knowledgeBaseId: `kb-${brandId}-${versionLabel}`, brandId, versionLabel, isActive, buildType, buildId: `build-${versionLabel}-${brandId}`, createdAt, categoryCount, sourceSnapshotCount, description })), chatbot: { ready: true, lastKnowledgeUpdatedAt: '۱۴۰۵/۰۲/۲۰ - ۱۰:۱۵' } };
}
