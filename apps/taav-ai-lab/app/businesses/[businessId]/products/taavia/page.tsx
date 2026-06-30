import Link from 'next/link';
import { ArrowLeft, BarChart3, Building2, Headphones } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage, AiLabSectionCard } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';

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
      >
        <div className="mb-4">
          <Link href={`/businesses/${business.id}/products`}>
            <TaavButton variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
              بازگشت به محصولات
            </TaavButton>
          </Link>
        </div>

        <AiLabSectionCard title="بخش‌های تاویا" description="از اینجا وارد مدیریت برندها، گزارشات یا اپراتورها شوید.">
          <div className="ai-lab-card-grid">
            <TaavCard variant="outlined" padding="md" radius="xl">
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-3">
                  <Building2 className="h-5 w-5 text-[var(--taav-brand-strong)]" />
                  <TaavBadge tone="brand" variant="soft">فعال</TaavBadge>
                </div>
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">برندها</h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    ایجاد و مدیریت برندها و ورود به ایجنت مدیریت برند
                  </p>
                </div>
                <Link href={`/businesses/${business.id}/products/taavia/brands`}>
                  <TaavButton width="full" iconStart={<ArrowLeft className="h-4 w-4" />}>
                    ورود به برندها
                  </TaavButton>
                </Link>
              </div>
            </TaavCard>

            <TaavCard variant="soft" padding="md" radius="xl">
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-3">
                  <BarChart3 className="h-5 w-5 text-[var(--taav-text-subtle)]" />
                  <TaavBadge tone="neutral" variant="soft">به‌زودی</TaavBadge>
                </div>
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">گزارشات</h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    گزارش‌های عملکرد چت‌بات‌ها و تحلیل مکالمات
                  </p>
                </div>
                <Link href={`/businesses/${business.id}/products/taavia/reports`}>
                  <TaavButton width="full" variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
                    مشاهده placeholder
                  </TaavButton>
                </Link>
              </div>
            </TaavCard>

            <TaavCard variant="soft" padding="md" radius="xl">
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-3">
                  <Headphones className="h-5 w-5 text-[var(--taav-text-subtle)]" />
                  <TaavBadge tone="neutral" variant="soft">به‌زودی</TaavBadge>
                </div>
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">اپراتورها</h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    مدیریت اپراتورهای انسانی و هم‌افزایی با چت‌بات
                  </p>
                </div>
                <Link href={`/businesses/${business.id}/products/taavia/operators`}>
                  <TaavButton width="full" variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
                    مشاهده placeholder
                  </TaavButton>
                </Link>
              </div>
            </TaavCard>
          </div>
        </AiLabSectionCard>
      </AiLabPage>
    </AiLabShell>
  );
}
