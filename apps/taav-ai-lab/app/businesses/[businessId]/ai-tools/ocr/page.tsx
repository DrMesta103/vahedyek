import Link from 'next/link';
import { FileSearch, Orbit, PanelsTopLeft } from 'lucide-react';
import { TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { getTenantForUser } from '@/app/lib/simulator-store';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage, AiLabSectionCard } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';

export default async function OcrPlaceholderPage({ params }: { params: Promise<{ businessId: string }> }) {
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
      pathname={`/businesses/${business.id}/ai-tools/ocr`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <AiLabPage
        eyebrow="placeholder ابزار OCR"
        title={`${business.name} · OCR / Document AI`}
        description="این صفحه فعلا فقط جایگاه مرحله بعد را مشخص می‌کند تا تیم‌های محصول، فرانت، بک‌اند و AI تصویر روشنی از مسیر فاز ۱ داشته باشند."
        badge="پیاده‌سازی نشده"
      >
        <AiLabSectionCard title="وضعیت این بخش" description="در این مرحله OCR پیاده‌سازی نمی‌شود و فقط ساختار مسیر حفظ می‌شود.">
          <div className="ai-lab-card-grid">
            <TaavCard variant="outlined" padding="md" radius="xl">
              <div className="grid gap-3">
                <FileSearch className="h-5 w-5 text-[var(--taav-brand-strong)]" />
                <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">تست OCR در مرحله بعد</strong>
                <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                  این بخش در مرحله بعد برای تست OCR ساده، OCR قرارداد و OCR Async تکمیل می‌شود.
                </p>
              </div>
            </TaavCard>

            <TaavCard variant="outlined" padding="md" radius="xl">
              <div className="grid gap-3">
                <Orbit className="h-5 w-5 text-[var(--taav-info-strong)]" />
                <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">خروجی‌های آینده</strong>
                <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                  خروجی‌های آینده شامل متن استخراج‌شده، JSON ساختاریافته، زمان پردازش، مصرف توکن و وضعیت Job خواهد بود.
                </p>
              </div>
            </TaavCard>

            <TaavCard variant="outlined" padding="md" radius="xl">
              <div className="grid gap-3">
                <PanelsTopLeft className="h-5 w-5 text-[var(--taav-warning-strong)]" />
                <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">استقلال tenant</strong>
                <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                  فایل‌ها، تست‌ها، گزارش‌ها و مصرف توکن این کسب‌وکار از سایر tenantها جدا باقی می‌ماند.
                </p>
              </div>
            </TaavCard>
          </div>
        </AiLabSectionCard>

        <div className="flex flex-wrap gap-3">
          <Link href={`/businesses/${business.id}/ai-tools`}>
            <TaavButton variant="secondary" tone="neutral">بازگشت به ابزارهای هوش مصنوعی</TaavButton>
          </Link>
          <Link href={`/businesses/${business.id}/products`}>
            <TaavButton>مشاهده placeholder محصولات</TaavButton>
          </Link>
        </div>
      </AiLabPage>
    </AiLabShell>
  );
}
