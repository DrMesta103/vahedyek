'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { ChevronLeft, LoaderCircle } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { formatTokenCount } from '@/app/lib/business-utils';
import type { Tenant } from '@/app/lib/data';
import { BusinessLogo } from './BusinessLogo';

function getUsageTone(usedTokens: number, tokenLimit: number) {
  const ratio = tokenLimit > 0 ? usedTokens / tokenLimit : 0;
  if (ratio >= 1) return 'danger';
  if (ratio >= 0.72) return 'warning';
  return 'success';
}

function UsageRing({ usedTokens, tokenLimit }: { usedTokens: number; tokenLimit: number }) {
  const ratio = tokenLimit > 0 ? Math.max(0, Math.min(1, usedTokens / tokenLimit)) : 0;
  const progress = Math.round(ratio * 100);
  const tone = getUsageTone(usedTokens, tokenLimit);
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const toneClass =
    tone === 'danger' ? 'ai-lab-ring-danger' : tone === 'warning' ? 'ai-lab-ring-warning' : 'ai-lab-ring-success';

  return (
    <div className="ai-lab-business-ring" aria-hidden="true">
      <svg viewBox="0 0 56 56" className="ai-lab-business-ring-svg">
        <circle cx="28" cy="28" r={radius} className="ai-lab-business-ring-track" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          className={toneClass}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 28 28)"
        />
      </svg>
      <span className="ai-lab-business-ring-label">
        {new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(progress)}٪
      </span>
    </div>
  );
}

export function BusinessCard({ business }: { business: Tenant }) {
  const router = useRouter();
  const [entering, setEntering] = useState(false);

  const usageTone = getUsageTone(business.usedTokens, business.tokenLimit);
  const statusLabel = usageTone === 'danger' ? 'منقضی‌شده' : 'فعال';
  const statusTone = usageTone === 'danger' ? 'danger' : 'success';

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

  return (
    <TaavCard
      variant="outlined"
      padding="none"
      radius="xl"
      wrapperClassName={['ai-lab-business-card', entering ? 'is-entering' : ''].filter(Boolean).join(' ')}
    >
      <div className="ai-lab-business-card-body" dir="rtl">
        <div className="ai-lab-business-card-identity">
          <div className="ai-lab-business-card-avatar">
            <BusinessLogo business={business} />
          </div>

          <div className="ai-lab-business-card-info">
            <h2>{business.name}</h2>
            <p className="ai-lab-business-card-usage-label">توکن مصرف‌شده</p>
            <p className="ai-lab-business-card-usage-value" dir="ltr">
              <span>{formatTokenCount(business.usedTokens)}</span>
              <span className="ai-lab-business-card-usage-sep">/</span>
              <span>{formatTokenCount(business.tokenLimit)}</span>
            </p>
          </div>
        </div>

        <UsageRing usedTokens={business.usedTokens} tokenLimit={business.tokenLimit} />

        <div className="ai-lab-business-card-actions">
          <TaavBadge tone={statusTone} variant="soft" unsafeClassName="ai-lab-business-status-badge">
            <span className={`ai-lab-business-status-dot ai-lab-business-status-dot--${statusTone}`} aria-hidden="true" />
            {statusLabel}
          </TaavBadge>

          <TaavButton
            type="button"
            variant="secondary"
            tone="neutral"
            size="sm"
            unsafeClassName="ai-lab-business-enter-btn"
            iconEnd={entering ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            onClick={() => void enterBusiness()}
            disabled={entering}
            aria-busy={entering}
          >
            {entering ? 'در حال ورود...' : 'ورود به فضای کاری'}
          </TaavButton>
        </div>

        {entering ? <div className="ai-lab-business-card-loading" aria-hidden="true" /> : null}
      </div>
    </TaavCard>
  );
}
