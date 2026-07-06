'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, Coins, History, TrendingUp, Wallet } from 'lucide-react';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogTitle,
} from '@repo/ui/taav';
import type { AdminBusinessRow } from '@/app/lib/data';
import { formatOwnerDisplayName, getRemainingTokens } from '@/app/lib/admin-business-utils';
import { formatTokenCount } from '@/app/lib/business-utils';
import { useAdminGate } from '@/components/settings/AdminGateProvider';

const QUICK_INCREASE_OPTIONS = [10_000, 50_000, 100_000] as const;

function parseTokenAmount(value: string) {
  const normalized = value
    .replace(/[,\u066C\u060C\s]/g, '')
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)));
  if (!normalized) return 0;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

type IncreaseTokenDialogProps = {
  business: AdminBusinessRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (business: AdminBusinessRow) => void;
};

export function IncreaseTokenDialog({ business, open, onOpenChange, onUpdated }: IncreaseTokenDialogProps) {
  const { requireUnlock } = useAdminGate();
  const [increaseAmount, setIncreaseAmount] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setIncreaseAmount('');
      setError('');
      setSubmitting(false);
    }
  }, [open, business?.id]);

  const parsedIncrease = useMemo(() => parseTokenAmount(increaseAmount), [increaseAmount]);
  const currentLimit = business?.tokenLimit ?? 0;
  const usedTokens = business?.usedTokens ?? 0;
  const remainingTokens = business ? getRemainingTokens(business.usedTokens, business.tokenLimit) : 0;
  const newLimit = currentLimit > 0 ? currentLimit + parsedIncrease : parsedIncrease;

  const submitIncrease = async () => {
    if (!business) return;

    if (parsedIncrease <= 0) {
      setError('مقدار افزایش توکن باید بیشتر از صفر باشد.');
      return;
    }

    if (newLimit < usedTokens) {
      setError('سقف جدید نمی‌تواند کمتر از میزان مصرف‌شده باشد.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/settings/businesses/${business.id}/token-limit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenLimit: newLimit }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string; business?: AdminBusinessRow } | null;

      if (!response.ok || !payload?.business) {
        setError(payload?.message ?? 'ثبت افزایش توکن انجام نشد.');
        return;
      }

      onUpdated(payload.business);
      onOpenChange(false);
    } catch {
      setError('خطا در ارتباط با سرور.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = () => {
    requireUnlock(() => {
      void submitIncrease();
    });
  };

  if (!business) return null;

  const ownerName = formatOwnerDisplayName(business);

  return (
    <TaavDialog open={open} onOpenChange={onOpenChange}>
      <TaavDialogContent size="lg" contentClassName="ai-lab-dialog ai-lab-increase-token-dialog">
        <header className="ai-lab-increase-token-header">
          <div className="ai-lab-increase-token-header-icon" aria-hidden="true">
            <Coins className="h-6 w-6" strokeWidth={1.7} />
          </div>
          <TaavDialogTitle className="ai-lab-increase-token-title">افزایش سقف توکن</TaavDialogTitle>
          <TaavDialogDescription className="ai-lab-increase-token-subtitle">
            سقف توکن کسب‌وکار را افزایش دهید
          </TaavDialogDescription>
        </header>

        <section className="ai-lab-increase-token-summary">
          <div className="ai-lab-increase-token-business">
            <div className="ai-lab-increase-token-business-copy">
              <strong>{business.name}</strong>
              <span>{ownerName}</span>
            </div>
            <div className="ai-lab-increase-token-business-logo">
              {business.logoUrl ? (
                <img src={business.logoUrl} alt="" className="object-cover" />
              ) : (
                <div className="ai-lab-increase-token-business-logo-fallback" aria-hidden="true">
                  <Building2 className="h-5 w-5" strokeWidth={1.6} />
                </div>
              )}
            </div>
          </div>

          <div className="ai-lab-increase-token-stats">
            <article>
              <span className="ai-lab-increase-token-stat-icon">
                <Wallet className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="ai-lab-increase-token-stat-label">سقف فعلی</span>
              <strong>{currentLimit > 0 ? formatTokenCount(currentLimit) : 'بدون سقف'}</strong>
            </article>
            <article>
              <span className="ai-lab-increase-token-stat-icon">
                <TrendingUp className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="ai-lab-increase-token-stat-label">مصرف‌شده</span>
              <strong>{formatTokenCount(usedTokens)}</strong>
            </article>
            <article>
              <span className="ai-lab-increase-token-stat-icon">
                <History className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="ai-lab-increase-token-stat-label">باقیمانده</span>
              <strong>{currentLimit > 0 ? formatTokenCount(remainingTokens) : '—'}</strong>
            </article>
          </div>
        </section>

        <div className="ai-lab-increase-token-form">
          <label className="ai-lab-increase-token-label" htmlFor="increase-token-amount">
            مقدار افزایش توکن
          </label>

          <div className="ai-lab-increase-token-input-field">
            <input
              id="increase-token-amount"
              type="text"
              inputMode="numeric"
              value={increaseAmount}
              onChange={(event) => {
                setIncreaseAmount(event.target.value);
                setError('');
              }}
              placeholder="مثلاً ۵۰,۰۰۰"
              disabled={submitting}
              className="ai-lab-increase-token-input"
            />
            <span className="ai-lab-increase-token-input-suffix">توکن</span>
          </div>

          <div className="ai-lab-increase-token-quick-add">
            {QUICK_INCREASE_OPTIONS.map((amount) => (
              <button
                key={amount}
                type="button"
                className="ai-lab-increase-token-quick-btn"
                disabled={submitting}
                onClick={() => {
                  const nextAmount = parsedIncrease + amount;
                  setIncreaseAmount(String(nextAmount));
                  setError('');
                }}
              >
                +{formatTokenCount(amount)}
              </button>
            ))}
          </div>

          <p className="ai-lab-increase-token-preview">
            سقف جدید: <strong>{formatTokenCount(newLimit)}</strong> توکن
          </p>

          {error ? <p className="ai-lab-increase-token-error">{error}</p> : null}
        </div>

        <footer className="ai-lab-increase-token-footer">
          <button
            type="button"
            className="ai-lab-increase-token-cancel"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            انصراف
          </button>
          <button type="button" className="ai-lab-increase-token-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'در حال ثبت...' : 'ثبت افزایش'}
          </button>
        </footer>
      </TaavDialogContent>
    </TaavDialog>
  );
}
