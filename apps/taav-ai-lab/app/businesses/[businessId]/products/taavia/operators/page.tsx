import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabPage, AiLabSectionCard } from '@/components/AiLabPage';
import { AiLabShell } from '@/components/AiLabShell';
import { TaavButton, TaavCard } from '@repo/ui/taav/primitives';

export default async function TaaviaOperatorsPlaceholderPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
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
      pathname={`/businesses/${business.id}/products/taavia/operators`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <AiLabPage eyebrow="تاویا" title="اپراتورها" description="این بخش در فاز بعدی پیاده‌سازی می‌شود.">
        <Link href={`/businesses/${business.id}/products/taavia`}>
          <TaavButton variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
            بازگشت به تاویا
          </TaavButton>
        </Link>
        <AiLabSectionCard title="به‌زودی" description="مدیریت اپراتورهای انسانی هنوز فعال نیست.">
          <TaavCard variant="soft" padding="lg" radius="xl">
            <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
              این صفحه به‌عنوان placeholder نگه‌داشته شده است.
            </p>
          </TaavCard>
        </AiLabSectionCard>
      </AiLabPage>
    </AiLabShell>
  );
}
