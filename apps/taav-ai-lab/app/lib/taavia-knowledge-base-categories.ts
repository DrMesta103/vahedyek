import type { KnowledgeBaseCategoriesPageData } from '@/app/lib/types/taavia-knowledge-base-categories';

/** Read-only active Knowledge Base output; it deliberately does not represent brand-source inputs. */
export function getKnowledgeBaseCategoriesMock(businessId: string, brandId: string): KnowledgeBaseCategoriesPageData {
  const knowledgeBaseId = `kb-${brandId}`;
  const sourceRoute = (snapshotId: string) => `/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base/sources/${snapshotId}`;
  const sharedSources = [
    { sourceSnapshotId: 'snapshot-brand-info-1', originalBrandSourceId: 'brand-info-1', title: 'معرفی برند تاو سیستم', sourceType: 'DOCX' as const, snapshotLabel: 'Snapshot v4', usedAt: '۱۴۰۵/۰۴/۲۰ - ۱۰:۱۵', previewRoute: sourceRoute('snapshot-brand-info-1') },
    { sourceSnapshotId: 'snapshot-file-1', originalBrandSourceId: 'file-1', title: 'بروشور معرفی شرکت .pdf', sourceType: 'PDF' as const, snapshotLabel: 'Snapshot v4', usedAt: '۱۴۰۵/۰۴/۲۰ - ۱۰:۱۸', previewRoute: sourceRoute('snapshot-file-1') },
    { sourceSnapshotId: 'snapshot-brand-image-1', originalBrandSourceId: 'brand-file-0021', title: 'لوگوی تاو سیستم .png', sourceType: 'PNG' as const, snapshotLabel: 'Snapshot v4', usedAt: '۱۴۰۵/۰۴/۲۰ - ۱۰:۲۰', previewRoute: sourceRoute('snapshot-brand-image-1') },
    { sourceSnapshotId: 'snapshot-link-1', originalBrandSourceId: 'link-1', title: 'https://www.tausys.com/about', sourceType: 'URL' as const, snapshotLabel: 'Snapshot v4', usedAt: '۱۴۰۵/۰۴/۲۰ - ۱۰:۲۵', previewRoute: sourceRoute('snapshot-link-1') },
  ];

  return {
    businessId,
    brandId,
    knowledgeBaseId,
    activeVersionLabel: 'نسخه فعال v4',
    updatedAt: '۱۴۰۵/۰۴/۲۶ - ۱۳:۴۰',
    categories: [
      { categoryId: 'about-us', knowledgeBaseId, businessId, brandId, title: 'درباره ما', slug: 'about-us', level: 1, parentCategoryId: null, childCount: 2, createdAt: '۱۴۰۵/۰۴/۲۰', updatedAt: '۱۴۰۵/۰۴/۲۶ - ۱۳:۴۰', content: ['تاو سیستم با هدف ارائه راهکارهای هوشمند و قابل اتکا برای کسب‌وکارها فعالیت می‌کند. ما فناوری را ابزاری برای ساده‌تر شدن کارها، تصمیم‌گیری بهتر و ساخت تجربه‌ای انسانی‌تر می‌دانیم.', 'دانشنامه این برند بر پایه منابع تأییدشده ساخته شده است تا پاسخ‌ها، معرفی خدمات و اطلاعات هویتی برند با یک لحن روشن و یکپارچه در دسترس باشند.'], sources: sharedSources },
      { categoryId: 'brand-history', knowledgeBaseId, businessId, brandId, title: 'تاریخچه برند', slug: 'brand-history', level: 2, parentCategoryId: 'about-us', childCount: 0, createdAt: '۱۴۰۵/۰۴/۲۰', updatedAt: '۱۴۰۵/۰۴/۲۶ - ۱۳:۴۰', content: ['تاو سیستم از آغاز فعالیت خود مسیر توسعه راهکارهای دیجیتال را با تمرکز بر نیازهای واقعی سازمان‌ها دنبال کرده است.'], sources: sharedSources.slice(0, 2) },
      { categoryId: 'mission-vision', knowledgeBaseId, businessId, brandId, title: 'ماموریت و چشم‌انداز', slug: 'mission-vision', level: 2, parentCategoryId: 'about-us', childCount: 0, createdAt: '۱۴۰۵/۰۴/۲۰', updatedAt: '۱۴۰۵/۰۴/۲۶ - ۱۳:۴۰', content: ['ماموریت ما ایجاد ارزش پایدار از طریق راهکارهای هوشمند است و چشم‌انداز ما همراهی بلندمدت با سازمان‌ها در مسیر تحول دیجیتال است.'], sources: sharedSources.slice(0, 1) },
      { categoryId: 'brand-identity', knowledgeBaseId, businessId, brandId, title: 'ارزش‌ها و هویت برند', slug: 'brand-identity', level: 1, parentCategoryId: null, childCount: 3, createdAt: '۱۴۰۵/۰۴/۲۰', updatedAt: '۱۴۰۵/۰۴/۲۵ - ۰۹:۴۵', content: ['هویت برند تاو بر نوآوری مسئولانه، شفافیت و همکاری نزدیک با مشتریان استوار است.'], sources: sharedSources.slice(0, 3) },
      { categoryId: 'values', knowledgeBaseId, businessId, brandId, title: 'ارزش‌های ما', slug: 'values', level: 2, parentCategoryId: 'brand-identity', childCount: 0, createdAt: '۱۴۰۵/۰۴/۲۰', updatedAt: '۱۴۰۵/۰۴/۲۵ - ۰۹:۴۵', content: ['تعهد، کیفیت، یادگیری مستمر و احترام به انسان‌ها، ارزش‌های راهنمای این برند هستند.'], sources: sharedSources.slice(0, 1) },
      { categoryId: 'visual-identity', knowledgeBaseId, businessId, brandId, title: 'هویت بصری', slug: 'visual-identity', level: 2, parentCategoryId: 'brand-identity', childCount: 0, createdAt: '۱۴۰۵/۰۴/۲۰', updatedAt: '۱۴۰۵/۰۴/۲۵ - ۰۹:۴۵', content: ['هویت بصری تاو برای ایجاد تجربه‌ای یکپارچه، خوانا و قابل تشخیص در همه نقاط تماس برند طراحی شده است.'], sources: sharedSources.slice(2, 3) },
      { categoryId: 'communication-guide', knowledgeBaseId, businessId, brandId, title: 'راهنمای ارتباطی', slug: 'communication-guide', level: 2, parentCategoryId: 'brand-identity', childCount: 0, createdAt: '۱۴۰۵/۰۴/۲۰', updatedAt: '۱۴۰۵/۰۴/۲۵ - ۰۹:۴۵', content: ['لحن ارتباطی برند روشن، حرفه‌ای و همدلانه است و بر انتقال دقیق ارزش به مخاطب تمرکز دارد.'], sources: sharedSources.slice(0, 2) },
      { categoryId: 'contact-information', knowledgeBaseId, businessId, brandId, title: 'اطلاعات تماس', slug: 'contact-information', level: 1, parentCategoryId: null, childCount: 1, createdAt: '۱۴۰۵/۰۴/۲۰', updatedAt: '۱۴۰۵/۰۴/۲۴ - ۱۱:۱۰', content: ['اطلاعات تماس رسمی و مسیرهای ارتباطی برند در این دسته‌بندی نگهداری می‌شوند.'], sources: sharedSources.slice(3) },
      { categoryId: 'social-networks', knowledgeBaseId, businessId, brandId, title: 'شبکه‌های اجتماعی', slug: 'social-networks', level: 2, parentCategoryId: 'contact-information', childCount: 0, createdAt: '۱۴۰۵/۰۴/۲۰', updatedAt: '۱۴۰۵/۰۴/۲۴ - ۱۱:۱۰', content: ['شبکه‌های اجتماعی رسمی برند برای ارتباط مستمر با مخاطبان و انتشار محتوای معتبر استفاده می‌شوند.'], sources: sharedSources.slice(3) },
    ],
  };
}
