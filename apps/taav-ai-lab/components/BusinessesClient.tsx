'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Plus } from 'lucide-react';
import { TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavEmptyState } from '@repo/ui/taav/data-display';
import type { Tenant } from '@/app/lib/data';
import { BusinessCard } from './BusinessCard';

function getBusinessStatus(tenant: Tenant) {
  const ratio = tenant.tokenLimit > 0 ? tenant.usedTokens / tenant.tokenLimit : 0;
  return ratio >= 1 ? 'expired' : 'active';
}

export function BusinessesClient({ businesses }: { businesses: Tenant[] }) {
  const router = useRouter();

  const { activeCount, expiredCount } = useMemo(() => {
    let active = 0;
    let expired = 0;

    for (const business of businesses) {
      if (getBusinessStatus(business) === 'expired') {
        expired += 1;
      } else {
        active += 1;
      }
    }

    return { activeCount: active, expiredCount: expired };
  }, [businesses]);

  const openCreateTenantFlow = () => {
    router.push('/businesses/new');
  };

  const summaryLine =
    businesses.length === 0
      ? 'هنوز کسب‌وکاری ثبت نشده است.'
      : expiredCount > 0
        ? `${new Intl.NumberFormat('fa-IR').format(activeCount)} کسب‌وکار فعال و ${new Intl.NumberFormat('fa-IR').format(expiredCount)} کسب‌وکار منقضی‌شده`
        : `${new Intl.NumberFormat('fa-IR').format(activeCount)} کسب‌وکار فعال`;

  return (
    <section className="ai-lab-businesses-page">
      <header className="ai-lab-businesses-header">
        <div className="ai-lab-businesses-heading-copy">
          <h1>فهرست کسب‌وکارهای شما</h1>
          <p className="ai-lab-businesses-summary">{summaryLine}</p>
        </div>

        <TaavButton
          unsafeClassName="ai-lab-businesses-add-btn"
          iconStart={<Plus className="h-4 w-4" />}
          onClick={openCreateTenantFlow}
        >
          افزودن جدید
        </TaavButton>
      </header>

      {businesses.length === 0 ? (
        <TaavCard variant="outlined" padding="none" radius="xl" wrapperClassName="ai-lab-empty-businesses-card">
          <TaavEmptyState
            icon={<Building2 className="h-6 w-6" />}
            title="هنوز کسب‌وکاری ایجاد نشده است"
            description="اولین فضای کاری خود را بسازید تا آزمایش‌های OCR و داده‌های هوش مصنوعی در همان محیط نگهداری شوند."
            primaryAction={
              <TaavButton iconStart={<Plus className="h-4 w-4" />} onClick={openCreateTenantFlow}>
                ایجاد کسب‌وکار
              </TaavButton>
            }
          />
        </TaavCard>
      ) : (
        <section className="ai-lab-business-list" aria-label="فهرست کسب‌وکارها">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </section>
      )}
    </section>
  );
}
