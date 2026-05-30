import { requestReasonCategories } from '../../lib/constants';
import { listRequestReasons } from '../../lib/data';
import { RequestReasonsPageClient } from './_components/RequestReasonsPageClient';

type RequestReasonsPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function RequestReasonsPage({ searchParams }: RequestReasonsPageProps) {
  const items = await listRequestReasons();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const categoryParam = resolvedSearchParams?.category;
  const activeCategory =
    categoryParam && requestReasonCategories.includes(categoryParam as (typeof requestReasonCategories)[number])
      ? (categoryParam as (typeof requestReasonCategories)[number])
      : 'daily_leave';

  return (
    <div className="page-stack module-page request-reasons-page" dir="rtl" lang="fa">
      <RequestReasonsPageClient
        items={items.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          isActive: item.isActive,
          displayOrder: item.displayOrder,
        }))}
        activeCategory={activeCategory}
      />
    </div>
  );
}
