import Link from 'next/link';
import { ArrowLeft, Boxes, BrainCircuit, ShieldCheck } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { getTenantForUser } from '@/app/lib/simulator-store';
import { formatTokenCount } from '@/app/lib/business-utils';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage, AiLabSectionCard } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';
import { BusinessLogo } from '@/components/BusinessLogo';
import { WorkspaceStats } from '@/components/WorkspaceStats';

export default async function BusinessWorkspacePage({ params }: { params: Promise<{ businessId: string }> }) {
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
        <AiLabPage
          eyebrow="عدم دسترسی"
          title="این کسب‌وکار برای شما در دسترس نیست"
          description="یا این tenant وجود ندارد، یا به کاربر دیگری تعلق دارد. از فهرست کسب‌وکارها یکی از فضاهای خودتان را انتخاب کنید."
        >
          <Link href="/businesses">
            <TaavButton>بازگشت به کسب‌وکارها</TaavButton>
          </Link>
        </AiLabPage>
      </AiLabShell>
    );
  }

  return (
    <AiLabShell
      pathname={`/businesses/${business.id}`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <AiLabPage
        eyebrow="نمای کلی tenant"
        title={business.name}
        description="این فضای کاری برای آزمایش‌های هوش مصنوعی، مدیریت مصرف توکن، سنجش OCR و شبیه‌سازی جریان‌های آینده به صورت مستقل نگه‌داری می‌شود."
        badge="مالک tenant"
      >
        <TaavCard variant="outlined" padding="lg" radius="xl">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex items-start gap-4">
              <BusinessLogo business={business} />
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <TaavBadge tone="success" variant="soft" iconStart={<ShieldCheck className="h-3.5 w-3.5" />}>
                    مدیر و مالک
                  </TaavBadge>
                  <TaavBadge tone="brand" variant="outline">
                    سقف توکن: {formatTokenCount(business.tokenLimit)}
                  </TaavBadge>
                </div>
                <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                  این مرزبندی عمدی است تا فایل‌ها، Jobهای OCR، گزارش‌ها، تنظیمات و شبیه‌سازی‌های آینده فقط در همین tenant نگه‌داری شوند.
                </p>
              </div>
            </div>
            <Link href={`/businesses/${business.id}/ai-tools`}>
              <TaavButton iconStart={<ArrowLeft className="h-4 w-4" />}>ورود به ابزارهای هوش مصنوعی</TaavButton>
            </Link>
          </div>
        </TaavCard>

        <AiLabSectionCard title="ناوبری اصلی" description="در فاز ۱، ابزارهای هوش مصنوعی فعال هستند و محصولات به عنوان ایستگاه بعدی نمایش داده می‌شوند.">
          <div className="ai-lab-card-grid">
            <TaavCard variant="outlined" padding="md" radius="xl" wrapperClassName="ai-lab-nav-card">
              <div className="grid h-full gap-4">
                <div className="flex items-center justify-between gap-3">
                  <BrainCircuit className="h-5 w-5 text-[var(--taav-brand-strong)]" />
                  <TaavBadge tone="brand" variant="soft">فعال</TaavBadge>
                </div>
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">ابزارهای هوش مصنوعی</h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    دسترسی به OCR / Document AI و ابزارهای آینده برای تست مستقل قبل از ورود به جریان واقعی محصول.
                  </p>
                </div>
                <Link href={`/businesses/${business.id}/ai-tools`} className="mt-auto">
                  <TaavButton width="full">ورود به ابزارهای هوش مصنوعی</TaavButton>
                </Link>
              </div>
            </TaavCard>

            <TaavCard variant="outlined" padding="md" radius="xl" wrapperClassName="ai-lab-nav-card">
              <div className="grid h-full gap-4">
                <div className="flex items-center justify-between gap-3">
                  <Boxes className="h-5 w-5 text-[var(--taav-info-strong)]" />
                  <TaavBadge tone="info" variant="soft">مرحله بعد</TaavBadge>
                </div>
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">محصولات</h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    بعد از اعتبارسنجی مستقل OCR، سناریوی Unit 1 در این بخش بررسی می‌شود.
                  </p>
                </div>
                <Link href={`/businesses/${business.id}/products`} className="mt-auto">
                  <TaavButton width="full" variant="secondary" tone="neutral">
                    مشاهده محصولات
                  </TaavButton>
                </Link>
              </div>
            </TaavCard>
          </div>
        </AiLabSectionCard>

        <AiLabSectionCard title="شاخص‌های فضای کاری" description="این مقادیر فعلا placeholder هستند و بعدا با داده واقعی OCR و گزارش‌ها تغذیه می‌شوند.">
          <WorkspaceStats business={business} />
        </AiLabSectionCard>
      </AiLabPage>
    </AiLabShell>
  );
}
