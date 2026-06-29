import Link from 'next/link';
import { ArrowLeft, FileSearch, ScanSearch } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { getTenantForUser } from '@/app/lib/simulator-store';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage, AiLabSectionCard } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';

export default async function AiToolsPage({ params }: { params: Promise<{ businessId: string }> }) {
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
      pathname={`/businesses/${business.id}/ai-tools`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <AiLabPage
        eyebrow="کاتالوگ ابزارها"
        title={`${business.name} · ابزارهای هوش مصنوعی`}
        description="در فاز ۱ ابتدا OCR / Document AI فعال است و بقیه ابزارها به عنوان نقشه راه نمایش داده می‌شوند."
        badge="تمرکز فاز ۱"
      >
        <AiLabSectionCard title="ابزارهای موجود" description="از کارت فعال وارد placeholder مربوط به OCR شوید.">
          <div className="ai-lab-card-grid">
            <TaavCard variant="outlined" padding="md" radius="xl">
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-3">
                  <FileSearch className="h-5 w-5 text-[var(--taav-brand-strong)]" />
                  <TaavBadge tone="brand" variant="soft">فعال</TaavBadge>
                </div>
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
                    OCR / Document AI
                  </h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    نقطه ورود برای تست دریافت سند، اعتبارسنجی استخراج، مشاهده خروجی و سناریوهای آینده OCR.
                  </p>
                </div>
                <Link href={`/businesses/${business.id}/ai-tools/ocr`}>
                  <TaavButton width="full" iconStart={<ArrowLeft className="h-4 w-4" />}>
                    ورود به placeholder OCR
                  </TaavButton>
                </Link>
              </div>
            </TaavCard>

            <TaavCard variant="soft" padding="md" radius="xl">
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-3">
                  <ScanSearch className="h-5 w-5 text-[var(--taav-text-subtle)]" />
                  <TaavBadge tone="neutral" variant="soft">به‌زودی</TaavBadge>
                </div>
                <div>
                  <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
                    ابزارهای بعدی
                  </h2>
                  <p className="mt-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    در مراحل بعد، ابزارهای دیگری مثل طبقه‌بندی، خلاصه‌سازی و agentهای عملیاتی به این بخش اضافه می‌شوند.
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
