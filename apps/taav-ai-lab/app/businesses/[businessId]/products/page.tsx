import Link from 'next/link';
import { ArrowLeft, Boxes, FileSearch, Layers3 } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { getTenantForUser } from '@/app/lib/simulator-store';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage, AiLabSectionCard } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';

export default async function ProductsPlaceholderPage({ params }: { params: Promise<{ businessId: string }> }) {
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
      pathname={`/businesses/${business.id}/products`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <AiLabPage
        eyebrow="placeholder محصولات"
        title={`${business.name} · محصولات`}
        description="این بخش عمدا قابل مشاهده نگه‌داشته شده تا مسیر انتقال از تست مستقل OCR به سناریوی محصول واقعی برای تیم‌ها روشن باشد."
        badge="مرحله بعد"
      >
        <AiLabSectionCard title="پیش‌نمایش Unit 1" description="در این مرحله پیاده‌سازی کامل محصول انجام نمی‌شود.">
          <TaavCard variant="outlined" padding="lg" radius="xl">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Boxes className="h-5 w-5 text-[var(--taav-info-strong)]" />
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">Unit 1</h2>
                  <TaavBadge tone="info" variant="soft">مرحله بعد</TaavBadge>
                </div>
                <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                  بعد از تست مستقل OCR، مرحله بعدی این است که رفتار خروجی OCR در جریان محصول Unit 1 شبیه‌سازی و بررسی شود.
                </p>
                <div className="ai-lab-info-row">
                  <TaavBadge tone="brand" variant="outline" iconStart={<FileSearch className="h-3.5 w-3.5" />}>
                    ابتدا OCR
                  </TaavBadge>
                  <TaavBadge tone="neutral" variant="soft" iconStart={<Layers3 className="h-3.5 w-3.5" />}>
                    سپس اتصال به محصول
                  </TaavBadge>
                </div>
              </div>
              <Link href={`/businesses/${business.id}/ai-tools/ocr`}>
                <TaavButton iconStart={<ArrowLeft className="h-4 w-4" />}>بازگشت به placeholder OCR</TaavButton>
              </Link>
            </div>
          </TaavCard>
        </AiLabSectionCard>
      </AiLabPage>
    </AiLabShell>
  );
}
