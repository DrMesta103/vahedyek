import type { KnowledgeBaseOverview } from '@/app/lib/types/taavia-knowledge-base';

/**
 * UI-only overview data. Current sources and version sources intentionally use
 * separate objects: a version source set is an immutable build snapshot.
 */
export function getKnowledgeBaseOverviewMock(businessId: string, brandId: string): KnowledgeBaseOverview {
  return {
    businessId,
    brandId,
    activeVersion: {
      version: 'v4',
      buildType: 'بروزرسانی',
      createdAt: '۱۴۰۴/۰۴/۲۰ - ۱۰:۵۲',
      categoryCount: 4,
      subcategoryCount: 128,
      createdBy: 'امین نژاد',
      health: 'healthy',
    },
    currentBrandSources: {
      brandInfo: 1,
      productsAndServices: 24,
      faqs: 15,
      files: 34,
      links: 8,
      needsReview: 2,
      updatedAt: '۱۴۰۴/۰۴/۲۵ - ۱۰:۳۰',
    },
    activeVersionSources: {
      version: 'v4',
      brandInfo: 1,
      productsAndServices: 22,
      faqs: 13,
      files: 33,
      links: 8,
      needsReview: 2,
      capturedAt: '۱۴۰۴/۰۴/۲۰ - ۱۰:۵۲',
    },
    pendingChanges: { added: 3, edited: 2, removed: 0, total: 5 },
    latestBuild: {
      buildType: 'بروزرسانی',
      status: 'successful',
      generatedVersion: 'v4',
      sourceCount: 82,
      startedAt: '۱۴۰۴/۰۴/۲۰ - ۱۰:۳۰',
      finishedAt: '۱۴۰۴/۰۴/۲۰ - ۱۰:۵۲',
    },
    output: { categoryCount: 4, subcategoryCount: 128 },
    health: { sourceCompleteness: 92, contentQuality: 93 },
  };
}
