'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { ArrowLeft, Coins, LoaderCircle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { TaavBadge, TaavCard } from '@repo/ui/taav/primitives';
import {
  formatPackageLabel,
  formatRelativeActivityLabel,
  formatTokenCount,
  formatTokenRatioLabel,
} from '@/app/lib/business-utils';
import type { Tenant } from '@/app/lib/data';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabSectionLabel, AiLabTooltipIcon } from '@/components/AiLabTooltip';
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
  const router = useRouter();
  const [entering, setEntering] = useState(false);

  const usageTone = getUsageTone(business.usedTokens, business.tokenLimit);
  const packageLabel = formatPackageLabel(business.packageKey, business.billingCycle);
  const activityLabel = formatRelativeActivityLabel(business.lastActivity);
  const statusLabel = usageTone === 'danger' ? 'منقضی شده' : usageTone === 'warning' ? 'نزدیک سقف' : 'فعال';
  const statusTooltip =
    usageTone === 'danger'
      ? AI_LAB_TOOLTIPS.businesses.statusExpired
      : usageTone === 'warning'
        ? AI_LAB_TOOLTIPS.businesses.statusWarning
        : AI_LAB_TOOLTIPS.businesses.statusActive;
  const statusIcon = usageTone === 'danger' ? (
    <ShieldAlert className="h-3.5 w-3.5" />
  ) : (
    <ShieldCheck className="h-3.5 w-3.5" />
  );

  const enterBusiness = useCallback(async () => {
    if (entering) return;
    setEntering(true);

    try {
      const response = await fetch('/api/auth/select-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: business.id }),
      });

      if (!response.ok) {
        throw new Error('select-failed');
      }

      router.push(`/businesses/${business.id}`);
      router.refresh();
    } catch {
      setEntering(false);
    }
  }, [business.id, entering, router]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      void enterBusiness();
    }
  };

  return (
    <TaavCard
      variant="outlined"
      padding="none"
      radius="xl"
      wrapperClassName={['ai-lab-business-card', entering ? 'is-entering' : ''].filter(Boolean).join(' ')}
    >
      <div
        className="ai-lab-business-card-grid ai-lab-business-card-interactive"
        dir="rtl"
        role="button"
        tabIndex={0}
        aria-label={`ورود به ${business.name}`}
        aria-busy={entering}
        onClick={() => void enterBusiness()}
        onKeyDown={handleKeyDown}
      >
        <div className="ai-lab-business-card-main">
          <div className="ai-lab-business-card-head">
            <div className="ai-lab-business-card-avatar">
              <BusinessLogo business={business} />
            </div>

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
                <AiLabTooltipIcon content={statusTooltip} label={`راهنمای وضعیت ${statusLabel}`} />
              </div>
              <p className="ai-lab-business-card-lede">فضای کاری OCR، فایل‌ها و گزارش‌های هوش مصنوعی</p>
            </div>
          </div>

          <div className="ai-lab-business-card-meta">
            <div className="ai-lab-business-card-meta-item">
              <AiLabSectionLabel label="نام بسته" tooltip={AI_LAB_TOOLTIPS.businesses.packageName} />
              <strong>{packageLabel}</strong>
            </div>
            <div className="ai-lab-business-card-meta-item">
              <AiLabSectionLabel label="سقف توکن" tooltip={AI_LAB_TOOLTIPS.businesses.tokenLimit} />
              <strong>{formatTokenCount(business.tokenLimit)}</strong>
            </div>
            <div className="ai-lab-business-card-meta-item">
              <AiLabSectionLabel label="OCR تست" tooltip={AI_LAB_TOOLTIPS.businesses.ocrTests} />
              <strong>{formatTokenCount(business.ocrTestsCount)}</strong>
            </div>
          </div>

          <div className="ai-lab-business-card-footnote">
            <span className="inline-flex items-center gap-1">
              آخرین فعالیت: {activityLabel}
              <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.businesses.lastActivity} label="راهنمای آخرین فعالیت" />
            </span>
            <span className="ai-lab-business-card-enter-hint">
              {entering ? (
                <>
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  در حال ورود...
                </>
              ) : (
                <>
                  ورود به فضای کاری
                  <ArrowLeft className="h-3.5 w-3.5" />
                </>
              )}
            </span>
          </div>
        </div>

        <div className="ai-lab-business-card-meter-shell">
          <div className="inline-flex w-full items-start justify-end">
            <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.businesses.usageMeter} label="راهنمای نمودار مصرف" />
          </div>
          <UsageMeter usedTokens={business.usedTokens} tokenLimit={business.tokenLimit} />

          <TaavBadge tone="neutral" variant="soft" iconStart={<Coins className="h-3.5 w-3.5" />}>
            {formatTokenCount(business.usedTokens)} مصرف
          </TaavBadge>
        </div>

        {entering ? <div className="ai-lab-business-card-loading" aria-hidden="true" /> : null}
      </div>
    </TaavCard>
  );
}
