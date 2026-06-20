import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';
import { DocGuidelines } from '@/components/lab/DocBlocks';
import { LabLayout } from '@/components/lab/LabLayout';
import { LabNavButton } from '@/components/lab/LabNavButton';
import { TAAV_DEV_RULES } from '@/lib/docs/shared';
import { LAB_CATEGORIES, LAB_STATUS_ITEMS } from '@/lib/navigation';

export default function HomePage() {
  return (
    <LabLayout>
      <div className="lab-page lab-page-stack">
        <section className="lab-hero">
          <div className="grid gap-[var(--taav-space-6)] lg:grid-cols-[1fr_280px] lg:items-end">
            <div className="grid gap-[var(--taav-space-4)]">
              <TaavBadge tone="brand" variant="soft" iconStart={<Sparkles className="h-3 w-3" />}>
                TaavUI · Layout Patterns
              </TaavBadge>
              <h1 className="m-0 text-[length:var(--taav-text-3xl)] font-black leading-[var(--taav-leading-tight)] text-[var(--taav-text-strong)] lg:text-4xl">
                سیستم طراحی داخلی
                <span className="mt-2 block text-[var(--taav-brand-strong)]">DastRanj · VahedYek</span>
              </h1>
              <p className="m-0 max-w-2xl text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
                TaavUI زبان بصری مشترک برای پنل‌های DastRanj و VahedYek است.
                این commit Layout Patterns را اضافه می‌کند: PageShell، PageHeader، Section، SettingsSection، DetailHeader، StickyActionBar، SidebarPanel، StatsCard و ProgressSummary.
              </p>
              <div className="flex flex-wrap gap-3">
                <LabNavButton href="/getting-started" size="lg" iconEnd={<BookOpen className="h-4 w-4" />}>
                  شروع سریع
                </LabNavButton>
                <LabNavButton href="/layout" size="lg">
                  Layout
                </LabNavButton>
                <LabNavButton href="/components" variant="outline" tone="neutral" size="lg">
                  Primitives
                </LabNavButton>
                <LabNavButton
                  href="/tokens"
                  variant="outline"
                  tone="neutral"
                  size="lg"
                  iconEnd={<ArrowLeft className="h-4 w-4" />}
                >
                  توکن‌ها
                </LabNavButton>
              </div>
            </div>
            <TaavCard variant="soft" padding="md" radius="xl" wrapperClassName="min-w-0">
              <p className="m-0 text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-text-subtle)]">وضعیت</p>
              <p className="mt-2 text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]">
                Layout Patterns
              </p>
              <p className="mt-2 text-[length:var(--taav-text-xs)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
                صفحات DastRanj و VahedYek هنوز مهاجرت داده نشده‌اند.
              </p>
            </TaavCard>
          </div>
        </section>

        <section className="grid gap-[var(--taav-space-4)]">
          <div>
            <h2 className="m-0 text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">
              دسته‌بندی کامپوننت‌ها
            </h2>
            <p className="mt-1 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
              نقشه رشد TaavUI در لایه‌های محصول
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {LAB_CATEGORIES.map((category) => (
              <TaavCard
                key={category.title}
                variant="outlined"
                padding="md"
                radius="lg"
                interactive
                header={
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-[length:var(--taav-text-sm)] font-black">{category.titleFa}</strong>
                    <TaavBadge tone={category.status === 'active' ? 'brand' : 'neutral'} variant="subtle" size="sm">
                      {category.status === 'active' ? 'فعال' : 'برنامه‌ریزی'}
                    </TaavBadge>
                  </div>
                }
              >
                <p className="m-0 text-[length:var(--taav-text-xs)] font-bold text-[var(--taav-text-subtle)]">
                  {category.title}
                </p>
                <p className="mt-2 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
                  {category.description}
                </p>
              </TaavCard>
            ))}
          </div>
        </section>

        <section className="grid gap-[var(--taav-space-4)]">
          <div>
            <h2 className="m-0 text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">پیشرفت</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {LAB_STATUS_ITEMS.map((item) => (
              <TaavCard key={item.key} variant="soft" padding="md" radius="lg">
                <div className="flex items-center justify-between gap-3">
                  <strong className="text-[length:var(--taav-text-sm)] font-black">{item.label}</strong>
                  <TaavBadge tone="brand" variant="outline" size="sm">
                    {item.status}
                  </TaavBadge>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--taav-surface-muted)]">
                  <div className="h-full rounded-full bg-[var(--taav-brand)]" style={{ width: `${item.progress}%` }} />
                </div>
              </TaavCard>
            ))}
          </div>
        </section>

        <DocGuidelines items={TAAV_DEV_RULES} />

        <TaavCard variant="outlined" padding="md" radius="lg">
          <div className="flex items-start gap-3">
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-[var(--taav-brand-strong)]" />
            <div>
              <strong className="text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]">
                قوانین توسعه
              </strong>
              <p className="mt-2 text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
                جزئیات کامل در <code className="lab-code">packages/ui/TAAVUI.md</code> موجود است.
              </p>
            </div>
          </div>
        </TaavCard>
      </div>
    </LabLayout>
  );
}
