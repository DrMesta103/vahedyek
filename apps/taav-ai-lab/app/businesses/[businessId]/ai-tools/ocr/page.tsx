import { getGlobalSettings, getOcrJobsForTenant, getTenantForUser, listAiProviderAccounts } from '@/app/lib/data';
import { getCurrentTenant, requireSession } from '@/app/lib/session';
import { AiLabShell } from '@/components/AiLabShell';
import { OcrHubClient } from '@/components/OcrHubClient';
import { getOcrAiUsageCost } from '@/components/ocr/utils';

export default async function OcrPage({ params }: { params: Promise<{ businessId: string }> }) {
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
        <div className="grid gap-3">
          <h1 className="m-0 text-2xl font-black text-[var(--taav-text-strong)]">این کسب‌وکار برای شما در دسترس نیست</h1>
          <p className="m-0 max-w-2xl text-sm leading-7 text-[var(--taav-text-muted)]">
            یکی از tenantهای خودتان را از فهرست کسب‌وکارها انتخاب کنید.
          </p>
        </div>
      </AiLabShell>
    );
  }

  const jobs = await getOcrJobsForTenant(session.userId, business.id);
  const [{ accounts }, globalSettings] = await Promise.all([listAiProviderAccounts(), getGlobalSettings()]);
  const jobCosts = Object.fromEntries(
    jobs.map((job) => [job.id, getOcrAiUsageCost(job, globalSettings.usdToToman, accounts)]),
  );

  return (
    <AiLabShell
      pathname={`/businesses/${business.id}/ai-tools/ocr`}
      fullName={session.fullName}
      email={session.email}
      mobile={session.mobile}
      currentTenantId={business.id}
      currentTenantName={business.name}
    >
      <OcrHubClient
        business={business}
        businessId={business.id}
        initialJobs={jobs}
        jobCosts={jobCosts}
        usdToToman={globalSettings.usdToToman}
        aiAccounts={accounts}
      />
    </AiLabShell>
  );
}
