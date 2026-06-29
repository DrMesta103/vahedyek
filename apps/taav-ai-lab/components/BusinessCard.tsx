import Link from 'next/link';
import { ArrowLeft, Coins, ShieldCheck } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { formatActivityLabel, formatTokenCount } from '@/app/lib/business-utils';
import type { Tenant } from '@/app/lib/simulator-store';
import { BusinessLogo } from './BusinessLogo';

export function BusinessCard({ business }: { business: Tenant }) {
  return (
    <TaavCard
      variant="soft"
      padding="md"
      radius="xl"
      wrapperClassName="h-full ai-lab-business-card"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
            آخرین فعالیت: {formatActivityLabel(business.lastActivity)}
          </span>
          <Link href={`/businesses/${business.id}`}>
            <TaavButton size="sm" variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
              ورود به آزمایشگاه
            </TaavButton>
          </Link>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="flex items-start gap-4">
          <BusinessLogo business={business} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">
                {business.name}
              </h2>
              <TaavBadge tone="success" variant="soft" iconStart={<ShieldCheck className="h-3.5 w-3.5" />}>
                مالک و مدیر
              </TaavBadge>
            </div>
            <p className="mt-2 text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
              این tenant برای تست مستقل فایل‌ها، OCR و گزارش‌ها از سایر کسب‌وکارها جدا نگه‌داری می‌شود.
            </p>
          </div>
        </div>

        <div className="ai-lab-info-row">
          <TaavBadge tone="brand" variant="outline" iconStart={<Coins className="h-3.5 w-3.5" />}>
            سقف توکن: {formatTokenCount(business.tokenLimit)}
          </TaavBadge>
          <TaavBadge tone="neutral" variant="soft">توکن مصرف‌شده: {formatTokenCount(business.usedTokens)}</TaavBadge>
          <TaavBadge tone="info" variant="soft">تست OCR: {business.ocrTestsCount}</TaavBadge>
        </div>
      </div>
    </TaavCard>
  );
}
