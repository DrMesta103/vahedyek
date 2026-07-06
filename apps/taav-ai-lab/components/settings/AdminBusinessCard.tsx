'use client';

import { Building2, Coins, MoreVertical } from 'lucide-react';
import {
  TaavDropdown,
  TaavDropdownContent,
  TaavDropdownItem,
  TaavDropdownTrigger,
} from '@repo/ui/taav';
import { TaavBadge } from '@repo/ui/taav/primitives';
import type { AdminBusinessRow } from '@/app/lib/data';
import {
  ADMIN_BUSINESS_STATUS_LABELS,
  formatOwnerDisplayName,
  getAdminBusinessUsageStatus,
  getRemainingTokens,
  getUsagePercentage,
} from '@/app/lib/admin-business-utils';
import { formatTokenCount } from '@/app/lib/business-utils';

function UsageRing({
  percentage,
  tone,
}: {
  percentage: number;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}) {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const toneClass =
    tone === 'danger'
      ? 'ai-lab-admin-ring-danger'
      : tone === 'warning'
        ? 'ai-lab-admin-ring-warning'
        : tone === 'neutral'
          ? 'ai-lab-admin-ring-neutral'
          : 'ai-lab-admin-ring-success';

  return (
    <div className="ai-lab-admin-business-ring" aria-hidden="true">
      <svg viewBox="0 0 72 72" className="ai-lab-admin-business-ring-svg">
        <circle cx="36" cy="36" r={radius} className="ai-lab-admin-business-ring-track" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          className={toneClass}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 36 36)"
        />
      </svg>
      <span className="ai-lab-admin-business-ring-label">
        {new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(percentage)}٪
      </span>
    </div>
  );
}

function statusTone(status: ReturnType<typeof getAdminBusinessUsageStatus>) {
  if (status === 'exceeded' || status === 'inactive') return 'danger' as const;
  if (status === 'near_limit') return 'warning' as const;
  return 'success' as const;
}

function ringTone(status: ReturnType<typeof getAdminBusinessUsageStatus>) {
  if (status === 'exceeded' || status === 'inactive') return 'danger' as const;
  if (status === 'near_limit') return 'warning' as const;
  if (status === 'active') return 'success' as const;
  return 'neutral' as const;
}

export function AdminBusinessCard({
  business,
  onIncreaseTokens,
}: {
  business: AdminBusinessRow;
  onIncreaseTokens?: (business: AdminBusinessRow) => void;
}) {
  const usageStatus = getAdminBusinessUsageStatus(business.isActive, business.usedTokens, business.tokenLimit);
  const usagePercentage = getUsagePercentage(business.usedTokens, business.tokenLimit);
  const remainingTokens = getRemainingTokens(business.usedTokens, business.tokenLimit);
  const ownerName = formatOwnerDisplayName(business);
  const hasTokenLimit = business.tokenLimit > 0;
  const progressTone = ringTone(usageStatus);

  return (
    <article className="ai-lab-admin-business-card">
      <div className="ai-lab-admin-business-card-inner">
        <div className="ai-lab-admin-business-card-head">
          <TaavBadge tone={statusTone(usageStatus)} variant="soft" unsafeClassName="ai-lab-admin-business-status">
            <span className={`ai-lab-admin-status-dot ai-lab-admin-status-dot--${statusTone(usageStatus)}`} aria-hidden="true" />
            {ADMIN_BUSINESS_STATUS_LABELS[usageStatus]}
          </TaavBadge>

          <div className="ai-lab-admin-business-identity">
            <h3>{business.name}</h3>
            <p>{ownerName}</p>
          </div>

          <div className="ai-lab-admin-business-logo">
            {business.logoUrl ? (
              <img src={business.logoUrl} alt={`لوگوی ${business.name}`} className="object-cover" />
            ) : (
              <div className="ai-lab-admin-business-logo-fallback" aria-hidden="true">
                <Building2 className="h-5 w-5" strokeWidth={1.6} />
              </div>
            )}
          </div>

          <TaavDropdown>
            <TaavDropdownTrigger asChild>
              <button type="button" className="ai-lab-admin-business-menu" aria-label="گزینه‌های بیشتر">
                <MoreVertical className="h-4 w-4" />
              </button>
            </TaavDropdownTrigger>
            <TaavDropdownContent align="end">
              <TaavDropdownItem iconStart={<Coins className="h-4 w-4" />} onSelect={() => onIncreaseTokens?.(business)}>
                افزایش سقف توکن
              </TaavDropdownItem>
            </TaavDropdownContent>
          </TaavDropdown>
        </div>

        <div className="ai-lab-admin-business-card-body">
          <UsageRing percentage={usagePercentage} tone={progressTone} />

          <div className="ai-lab-admin-business-stats">
            <div className="ai-lab-admin-business-stat">
              <span>کل توکن</span>
              <strong>{hasTokenLimit ? formatTokenCount(business.tokenLimit) : 'بدون سقف'}</strong>
            </div>
            <div className="ai-lab-admin-business-stat">
              <span>مصرف‌شده</span>
              <strong>{formatTokenCount(business.usedTokens)}</strong>
            </div>
          </div>
        </div>

        <p className="ai-lab-admin-business-remaining">
          {hasTokenLimit ? (
            <>
              باقیمانده: <strong>{formatTokenCount(remainingTokens)}</strong> توکن
            </>
          ) : (
            <span className="ai-lab-admin-business-remaining-muted">بدون سقف فعال</span>
          )}
        </p>
      </div>

      <div className="ai-lab-admin-business-progress" aria-hidden="true">
        <span
          className={`ai-lab-admin-business-progress-fill ai-lab-admin-business-progress-fill--${progressTone}`}
          style={{ width: `${hasTokenLimit ? usagePercentage : 0}%` }}
        />
      </div>
    </article>
  );
}
