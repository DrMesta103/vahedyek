'use client';

import { useRouter } from 'next/navigation';
import { Building2, PlusCircle } from 'lucide-react';
import { TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavEmptyState } from '@repo/ui/taav/data-display';
import type { Tenant } from '@/app/lib/data';
import { BusinessCard } from './BusinessCard';

export function BusinessesClient({ businesses }: { businesses: Tenant[] }) {
  const router = useRouter();

  const openCreateTenantFlow = () => {
    router.push('/businesses/new');
  };

  return (
    <section className="ai-lab-businesses-page">
      <header className="ai-lab-businesses-header">
        <div className="ai-lab-businesses-heading-copy">
          <p className="ai-lab-businesses-kicker">آزمایشگاه هوش مصنوعی تاو</p>
          <h1>فهرست کسب‌وکارهای شما</h1>
          <p>فقط tenantهای متعلق به حساب فعلی در این نما نمایش داده می‌شوند.</p>
        </div>

        <TaavButton iconStart={<PlusCircle className="h-4 w-4" />} onClick={openCreateTenantFlow}>
          افزودن جدید
        </TaavButton>
      </header>

      {businesses.length === 0 ? (
        <TaavCard variant="outlined" padding="none" radius="xl" wrapperClassName="ai-lab-empty-businesses-card">
          <TaavEmptyState
            icon={<Building2 className="h-6 w-6" />}
            title="هنوز کسب‌وکاری ایجاد نشده است"
            description="برای شروع، اولین tenant خود را بسازید تا مسیرهای آزمایشی و داده‌های AI روی همان فضا نگهداری شوند."
            primaryAction={
              <TaavButton iconStart={<PlusCircle className="h-4 w-4" />} onClick={openCreateTenantFlow}>
                ایجاد کسب‌وکار
              </TaavButton>
            }
          />
        </TaavCard>
      ) : (
        <section className="ai-lab-business-list">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </section>
      )}
    </section>
  );
}
