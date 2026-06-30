import Link from 'next/link';
import { ArrowLeft, ArrowRight, Coins, ShieldAlert, ShieldCheck } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import {
  formatPackageLabel,
  formatRelativeActivityLabel,
  formatTokenCount,
  formatTokenRatioLabel,
} from '@/app/lib/business-utils';
import type { Tenant } from '@/app/lib/simulator-store';
import { BusinessLogo } from './BusinessLogo';

function getUsageTone(usedTokens: number, tokenLimit: number) {
  const ratio = tokenLimit > 0 ? usedTokens / tokenLimit : 0;
  if (ratio >= 1) return 'danger';
  if (ratio >= 0.72) return 'warning';
  return 'success';
}

function UsageMeter({ usedTokens, tokenLimit }: { usedTokens: number; tokenLimit: number }) {
  const ratio = tokenLimit > 0 ? Math.max(0, Math.min(1, usedTokens / tokenLimit)) : 0;
  const progress = Math.round(ratio * 100);
  const tone = getUsageTone(usedTokens, tokenLimit);
  const label = formatTokenRatioLabel(usedTokens, tokenLimit);

  const toneClass =
    tone === 'danger' ? 'ai-lab-meter-danger' : tone === 'warning' ? 'ai-lab-meter-warning' : 'ai-lab-meter-success';

  return (
    <div className="ai-lab-business-meter">
      <svg viewBox="0 0 120 84" className="ai-lab-business-meter-svg" aria-hidden="true">
        <path d="M18 58 A42 42 0 0 1 102 58" pathLength={100} className="ai-lab-business-meter-track" />
        <path
          d="M18 58 A42 42 0 0 1 102 58"
          pathLength={100}
          className={toneClass}
          style={{
            strokeDasharray: '100',
            strokeDashoffset: `${100 - progress}`,
          }}
        />
      </svg>

      <div className="ai-lab-business-meter-copy">
        <strong>{label}</strong>
        <span>{tone === 'danger' ? 'نیاز به تمدید' : tone === 'warning' ? 'نزدیک سقف' : 'آماده استفاده'}</span>
      </div>
    </div>
  );
}

export function BusinessCard({ business }: { business: Tenant }) {
  const usageTone = getUsageTone(business.usedTokens, business.tokenLimit);
  const packageLabel = formatPackageLabel(business.packageKey, business.billingCycle);
  const activityLabel = formatRelativeActivityLabel(business.lastActivity);
  const statusLabel = usageTone === 'danger' ? 'منقضی شده' : usageTone === 'warning' ? 'نزدیک سقف' : 'فعال';
  const statusIcon = usageTone === 'danger' ? (
    <ShieldAlert className="h-3.5 w-3.5" />
  ) : (
    <ShieldCheck className="h-3.5 w-3.5" />
  );

  return (
    <TaavCard variant="outlined" padding="none" radius="xl" wrapperClassName="ai-lab-business-card">
      <div className="ai-lab-business-card-grid" dir="rtl">
        <div className="ai-lab-business-card-main">
          <div className="ai-lab-business-card-head">
            <div className="ai-lab-business-card-headline">
              <div className="ai-lab-business-card-title-row">
                <h2>{business.name}</h2>
                <TaavBadge
                  tone={usageTone === 'danger' ? 'danger' : usageTone === 'warning' ? 'warning' : 'success'}
                  variant="soft"
                  iconStart={statusIcon}
                >
                  {statusLabel}
                </TaavBadge>
              </div>
              <p className="ai-lab-business-card-lede">tenant مستقل برای OCR، فایل‌ها و گزارش‌ها.</p>
            </div>

            <div className="ai-lab-business-card-avatar">
              <BusinessLogo business={business} />
            </div>
          </div>

          <div className="ai-lab-business-card-meta">
            <div className="ai-lab-business-card-meta-item">
              <span>نام بسته</span>
              <strong>{packageLabel}</strong>
            </div>
            <div className="ai-lab-business-card-meta-item">
              <span>شناسه نمایشی</span>
              <strong>{business.brandCode || business.slug || 'بدون شناسه'}</strong>
            </div>
            <div className="ai-lab-business-card-meta-item">
              <span>سقف توکن</span>
              <strong>{formatTokenCount(business.tokenLimit)}</strong>
            </div>
            <div className="ai-lab-business-card-meta-item">
              <span>OCR تست</span>
              <strong>{formatTokenCount(business.ocrTestsCount)}</strong>
            </div>
          </div>

          <div className="ai-lab-business-card-footnote">
            <span>آخرین فعالیت: {activityLabel}</span>
            <Link href={`/businesses/${business.id}`}>
              <TaavButton size="sm" variant="ghost" iconStart={<ArrowLeft className="h-4 w-4" />}>
                ورود
              </TaavButton>
            </Link>
          </div>
        </div>

        <div className="ai-lab-business-card-meter-shell">
          <UsageMeter usedTokens={business.usedTokens} tokenLimit={business.tokenLimit} />

          <div className="ai-lab-business-card-meter-actions">
            <TaavBadge tone="neutral" variant="soft" iconStart={<Coins className="h-3.5 w-3.5" />}>
              {formatTokenCount(business.usedTokens)} مصرف
            </TaavBadge>

            <Link href={`/businesses/${business.id}`} className="ai-lab-business-card-cta">
              <TaavButton
                size="sm"
                variant={usageTone === 'danger' ? 'danger' : 'secondary'}
                iconEnd={<ArrowRight className="h-4 w-4" />}
              >
                {usageTone === 'danger' ? 'تمدید' : 'ورود'}
              </TaavButton>
            </Link>
          </div>
        </div>
      </div>
    </TaavCard>
  );
}
