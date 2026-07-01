import Link from 'next/link';
import { ArrowLeft, BarChart3, Bot, Building2 } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage, AiLabSectionCard } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';

export default async function ProductsPage({ params }: { params: Promise<{ businessId: string }> }) {
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
        eyebrow="محصولات"
        title={`${business.name} · محصولات`}
        description="محصولات هوش مصنوعی تاو برای شبیه‌سازی و مدیریت قابلیت‌های کسب‌وکار."
        badge="کاتالوگ"
      >
        <AiLabSectionCard title="محصولات موجود" description="یک محصول را انتخاب کنید تا وارد فضای کاری آن شوید.">
          <div className="ai-lab-card-grid">
            <TaavCard variant="outlined" padding="md" radius="xl">
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-3">
                  <Bot className="h-5 w-5 text-[var(--taav-brand-strong)]" />
                  <TaavBadge tone="brand" variant="soft">فعال</TaavBadge>
                </div>
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
                    تاویا
                  </h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    شبیه‌ساز چت‌بات پشتیبانی برندها و مدیریت دانش با هوش مصنوعی
                  </p>
                </div>
                <Link href={`/businesses/${business.id}/products/taavia`}>
                  <TaavButton width="full" iconStart={<ArrowLeft className="h-4 w-4" />}>
                    ورود به تاویا
                  </TaavButton>
                </Link>
              </div>
            </TaavCard>

            <TaavCard variant="soft" padding="md" radius="xl">
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-3">
                  <Building2 className="h-5 w-5 text-[var(--taav-text-subtle)]" />
                  <TaavBadge tone="neutral" variant="soft">به‌زودی</TaavBadge>
                </div>
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
                    Unit 1
                  </h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    محصول بعدی برای اتصال خروجی OCR به جریان‌های عملیاتی کسب‌وکار.
                  </p>
                </div>
              </div>
            </TaavCard>

            <TaavCard variant="soft" padding="md" radius="xl">
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-3">
                  <BarChart3 className="h-5 w-5 text-[var(--taav-text-subtle)]" />
                  <TaavBadge tone="neutral" variant="soft">به‌زودی</TaavBadge>
                </div>
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
                    محصولات بعدی
                  </h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    در مراحل بعد، محصولات بیشتری به این کاتالوگ اضافه می‌شوند.
                  </p>
                </div>
              </div>
            </TaavCard>
          </div>
        </AiLabSectionCard>
      </AiLabPage>
    </AiLabShell>
  );
}
