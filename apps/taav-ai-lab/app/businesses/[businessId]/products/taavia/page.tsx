import Link from 'next/link';
import { ArrowLeft, BarChart3, Building2, Headphones } from 'lucide-react';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabFeatureCard } from '@/components/AiLabFeatureCard';
import { AiLabPage, AiLabSectionCard } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';
import { TaavButton } from '@repo/ui/taav/primitives';

export default async function TaaviaPage({ params }: { params: Promise<{ businessId: string }> }) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { businessId } = await params;
  const business = await getTenantForUser(session.userId, businessId);

  if (!business) {
    return (
      <AiLabShell
        pathname="/businesses"
        fullName={session.fullName}
        email={session.email}
        mobile={session.mobile}
        currentTenantId={currentTenant?.id ?? session.activeTenantId ?? null}
        currentTenantName={currentTenant?.name ?? null}
      >
        <AiLabPage eyebrow="عدم دسترسی" title="این کسب‌وکار برای شما در دسترس نیست" description="از فهرست کسب‌وکارها یکی از tenantهای خودتان را انتخاب کنید." />
      </AiLabShell>
    );
  }

  return (
    <AiLabShell
      pathname={`/businesses/${business.id}/products/taavia`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <AiLabPage
        eyebrow="محصول تاویا"
        title="تاویا"
        description="مدیریت برندها، نالج‌بیس و چت‌بات‌های پشتیبانی هوشمند"
        badge="فعال"
        titleTooltip={AI_LAB_TOOLTIPS.products.taavia}
      >
        <div className="mb-4">
          <Link href={`/businesses/${business.id}/products`}>
            <TaavButton variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
              بازگشت به محصولات
            </TaavButton>
          </Link>
        </div>

        <div className="taavia-sections-shell">
          <AiLabSectionCard
            title="بخش‌های تاویا"
            description="از اینجا وارد مدیریت برندها، گزارش‌ها یا اپراتورها شوید."
            titleTooltip={AI_LAB_TOOLTIPS.products.brands}
          >
            <div className="ai-lab-card-grid taavia-section-grid">
            <AiLabFeatureCard
              icon={<Building2 className="h-5 w-5 text-[var(--taav-brand-strong)]" />}
              title="برندها"
              description="ایجاد و مدیریت برندها و ورود به ایجنت مدیریت برند"
              tooltip={AI_LAB_TOOLTIPS.products.brands}
              badge={{ label: 'فعال', tone: 'brand' }}
              href={`/businesses/${business.id}/products/taavia/brands`}
              buttonLabel="انتخاب"
            />
            <AiLabFeatureCard
              icon={<BarChart3 className="h-5 w-5 text-[var(--taav-text-subtle)]" />}
              title="گزارش‌ها"
              description="گزارش عملکرد چت‌بات‌ها و تحلیل مکالمات"
              tooltip={AI_LAB_TOOLTIPS.products.reports}
              badge={{ label: 'به‌زودی', tone: 'neutral' }}
              href={`/businesses/${business.id}/products/taavia/reports`}
              buttonLabel="مشاهده"
              buttonVariant="secondary"
              variant="soft"
            />
            <AiLabFeatureCard
              icon={<Headphones className="h-5 w-5 text-[var(--taav-text-subtle)]" />}
              title="اپراتورها"
              description="مدیریت اپراتورهای انسانی و هم‌افزایی با چت‌بات"
              tooltip={AI_LAB_TOOLTIPS.products.operators}
              badge={{ label: 'به‌زودی', tone: 'neutral' }}
              href={`/businesses/${business.id}/products/taavia/operators`}
              buttonLabel="مشاهده"
              buttonVariant="secondary"
              variant="soft"
            />
            </div>
          </AiLabSectionCard>
        </div>
      </AiLabPage>
    </AiLabShell>
  );
}
