'use client';

import { useRouter } from 'next/navigation';
import { Building2, PlusCircle } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavEmptyState } from '@repo/ui/taav/data-display';
import type { Tenant } from '@/app/lib/simulator-store';
import { BusinessCard } from './BusinessCard';

export function BusinessesClient({ businesses }: { businesses: Tenant[] }) {
  const router = useRouter();

  const openCreateTenantFlow = () => {
    router.push('/select-tenant?next=/businesses');
  };

  return (
    <div className="ai-lab-page-stack">
      <TaavCard
        variant="soft"
        padding="lg"
        radius="xl"
        header={
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="grid gap-2">
              <TaavBadge tone="brand" variant="soft">
                فهرست کسب‌وکارها
              </TaavBadge>
              <div className="grid gap-2">
                <h2 className="m-0 text-[length:var(--taav-text-2xl)] font-black text-[var(--taav-text-strong)]">
                  کسب‌وکارهای شما
                </h2>
                <p className="m-0 max-w-3xl text-[length:var(--taav-text-sm)] leading-[var(--taav-leading-relaxed)] text-[var(--taav-text-muted)]">
                  هر کسب‌وکار یک tenant مستقل برای تست OCR، فایل‌ها، گزارش‌ها و مصرف توکن است. اینجا فقط فضاهای متعلق به حساب فعلی نمایش داده می‌شود.
                </p>
              </div>
            </div>

            <TaavButton iconStart={<PlusCircle className="h-4 w-4" />} onClick={openCreateTenantFlow}>
              افزودن کسب‌وکار
            </TaavButton>
          </div>
        }
      />

      <section className="ai-lab-list-summary">
        <TaavCard variant="soft" padding="md" radius="xl" wrapperClassName="ai-lab-summary-card">
          <div className="ai-lab-summary-grid">
            <div>
              <span className="ai-lab-summary-label">تعداد کسب‌وکارها</span>
              <strong className="ai-lab-summary-value">{new Intl.NumberFormat('fa-IR').format(businesses.length)}</strong>
            </div>
            <div>
              <span className="ai-lab-summary-label">وضعیت</span>
              <strong className="ai-lab-summary-value">محیط شبیه‌ساز فاز ۱</strong>
            </div>
          </div>
        </TaavCard>
      </section>

      {businesses.length === 0 ? (
        <TaavCard variant="outlined" padding="md" radius="xl" wrapperClassName="ai-lab-empty-panel">
          <TaavEmptyState
            icon={<Building2 className="h-6 w-6" />}
            title="هنوز کسب‌وکاری ایجاد نشده است"
            description="برای شروع، اولین tenant خود را بسازید تا ورود به آزمایشگاه و مسیرهای فاز ۱ را تست کنیم."
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
    </div>
  );
}
