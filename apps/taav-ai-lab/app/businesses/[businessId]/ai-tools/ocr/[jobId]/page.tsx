import { getOcrJobForTenant, getTenantForUser } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabShell } from '@/components/AiLabShell';
import { OcrJobDetailClient } from '@/components/OcrJobDetailClient';
import Link from 'next/link';
import { Suspense } from 'react';
import { TaavButton } from '@repo/ui/taav/primitives';

export default async function OcrJobPage({
  params,
}: {
  params: Promise<{ businessId: string; jobId: string }>;
}) {
  const session = await requireSession();
  const currentTenant = await getCurrentTenant();
  const { businessId, jobId } = await params;
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
        <div className="grid gap-3">
          <h1 className="m-0 text-2xl font-black text-[var(--taav-text-strong)]">این کسب‌وکار برای شما در دسترس نیست</h1>
        </div>
      </AiLabShell>
    );
  }

  const job = await getOcrJobForTenant(session.userId, business.id, jobId);

  if (!job) {
    return (
      <AiLabShell
        pathname={`/businesses/${business.id}/ai-tools/ocr`}
        fullName={session.fullName}
        email={session.email}
        mobile={session.mobile}
        currentTenantId={business.id}
        currentTenantName={business.name}
      >
        <div className="grid gap-3">
          <h1 className="m-0 text-2xl font-black text-[var(--taav-text-strong)]">job پیدا نشد</h1>
          <p className="m-0 text-sm text-[var(--taav-text-muted)]">این اجرا برای tenant فعلی وجود ندارد یا حذف شده است.</p>
          <Link href={`/businesses/${business.id}/ai-tools/ocr`}>
            <TaavButton>بازگشت به تاریخچه</TaavButton>
          </Link>
        </div>
      </AiLabShell>
    );
  }

  return (
    <AiLabShell
      pathname={`/businesses/${business.id}/ai-tools/ocr/${job.id}`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <Suspense fallback={null}>
        <OcrJobDetailClient businessId={business.id} initialJob={job} />
      </Suspense>
    </AiLabShell>
  );
}
