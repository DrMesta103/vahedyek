import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { panelBreadcrumbs } from '../../components/module-page/module-breadcrumbs';
import { requestReasonCategories } from '../../lib/constants';
import { listRequestReasons } from '../../lib/data';
import { RequestReasonsClient } from './_components/RequestReasonsClient';

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
      : 'attendance';

  return (
    <div className="page-stack module-page request-reasons-page" dir="rtl" lang="fa">
      <ModulePageHeader
        breadcrumbs={panelBreadcrumbs('دلایل درخواست')}
        title="دلایل درخواست"
        subtitle="مدیریت علت‌ها با ترتیب‌دهی، فعال‌سازی و ویرایش سریع."
        addHref={`/request-reasons/new?category=${activeCategory}`}
        addLabel="افزودن علت درخواست"
      />

      <RequestReasonsClient
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
