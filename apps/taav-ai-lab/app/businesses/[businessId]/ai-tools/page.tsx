import { ArrowLeft, FileSearch, ScanSearch } from 'lucide-react';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabFeatureCard } from '@/components/AiLabFeatureCard';
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
        description="در فاز ۱ فقط OCR / Document AI فعال است و سایر ابزارها به‌عنوان نقشه‌ی راه نمایش داده می‌شوند."
        badge="تمرکز فاز ۱"
        titleTooltip={AI_LAB_TOOLTIPS.nav['ai-tools']}
      >
        <AiLabSectionCard title="ابزارهای موجود" description="از کارت فعال وارد شبیه‌ساز OCR شوید." titleTooltip={AI_LAB_TOOLTIPS.aiTools.ocr}>
          <div className="ai-lab-card-grid">
            <AiLabFeatureCard
              icon={<FileSearch className="h-5 w-5 text-[var(--taav-brand-strong)]" />}
              title="OCR / Document AI"
              description="نقطه ورود برای تست دریافت سند، اعتبارسنجی استخراج، مشاهده خروجی و سناریوهای آینده OCR."
              tooltip={AI_LAB_TOOLTIPS.aiTools.ocr}
              badge={{ label: 'فعال', tone: 'brand' }}
              href={`/businesses/${business.id}/ai-tools/ocr`}
              buttonLabel="ورود به شبیه‌ساز OCR"
            />
            <AiLabFeatureCard
              icon={<ScanSearch className="h-5 w-5 text-[var(--taav-text-subtle)]" />}
              title="ابزارهای بعدی"
              description="در مراحل بعد، ابزارهای دیگری مثل طبقه‌بندی، خلاصه‌سازی و agentهای عملیاتی به این بخش اضافه می‌شوند."
              tooltip={AI_LAB_TOOLTIPS.aiTools.future}
              badge={{ label: 'به‌زودی', tone: 'neutral' }}
              variant="soft"
            />
          </div>
        </AiLabSectionCard>
      </AiLabPage>
    </AiLabShell>
  );
}
