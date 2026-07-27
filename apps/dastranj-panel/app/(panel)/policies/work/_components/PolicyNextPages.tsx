'use client';

import { TaavModuleCard, TaavModuleCardGrid, TaavModuleCardGridItem } from '@repo/ui/taav/business';

type PolicyNextPagesProps = {
  items: Array<{ title: string; href: string; configured: boolean }>;
  showHeader?: boolean;
};

export function PolicyNextPages({ items, showHeader = true }: PolicyNextPagesProps) {
  return (
    <section className="policy-next-pages">
      {showHeader ? <header className="policy-next-pages-header">
        <div>
          <h2>صفحات بعدی</h2>
          <p>بخش موردنیاز برای تکمیل سیاست کاری را انتخاب کنید.</p>
        </div>
      </header> : null}

      <nav aria-label="بخش‌های سیاست کاری">
        <TaavModuleCardGrid columns={1} gap="md" className="policy-work-sections">
          {items.map((item) => (
            <TaavModuleCardGridItem key={item.title}>
              <TaavModuleCard
                href={item.href}
                title={<span className="policy-next-page-title">{item.title}{item.configured ? <span className="policy-next-page-configured">تنظیم‌شده</span> : null}</span>}
                description="مشاهده و تنظیم این بخش از سیاست کاری"
                variant="compact"
                size="sm"
                width="full"
                themeMode="auto"
                align="start"
              />
            </TaavModuleCardGridItem>
          ))}
        </TaavModuleCardGrid>
      </nav>
    </section>
  );
}
