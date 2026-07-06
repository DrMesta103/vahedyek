'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TaavSettingsSection } from '@repo/ui/taav/layout';
import { TaavFieldBlock } from '@repo/ui/taav/forms';
import { TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavInput } from '@repo/ui/taav/forms';
import {
  GLOBAL_SETTINGS_MOCK,
  formatToman,
  formatUsd,
  tokensToToman,
  type GlobalSettingsData,
} from '@/app/lib/global-settings-mock';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabLabelWithTooltip, AiLabTooltipIcon } from '@/components/AiLabTooltip';

type UsdRateSettingsClientProps = {
  initialData?: GlobalSettingsData;
};

export function UsdRateSettingsClient({ initialData = GLOBAL_SETTINGS_MOCK }: UsdRateSettingsClientProps) {
  const [usdToToman, setUsdToToman] = useState(initialData.usdToToman);
  const [draftRate, setDraftRate] = useState(String(initialData.usdToToman));
  const [isEditing, setIsEditing] = useState(false);

  const sampleModel = useMemo(
    () => initialData.models.find((model) => model.id === 'gpt-4-5') ?? initialData.models[0],
    [initialData.models],
  );

  const sampleToman = sampleModel
    ? tokensToToman(100, sampleModel.pricePer100TokensUsd, usdToToman)
    : 0;

  const startEdit = () => {
    setDraftRate(String(usdToToman));
    setIsEditing(true);
  };

  const saveRate = async () => {
    const parsed = Number.parseInt(draftRate.replace(/,/g, ''), 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    const response = await fetch('/api/settings/global/usd-rate', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usdToToman: parsed }),
    });
    if (!response.ok) return;
    setUsdToToman(parsed);
    setIsEditing(false);
  };

  return (
    <div className="business-settings-page-shell" dir="rtl" lang="fa">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">تنظیمات سراسری</span>
          <h1 className="m-0 inline-flex items-center gap-2 text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">
            تنظیمات قیمت دلار
            <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.settings.usdRate} label="راهنمای نرخ دلار" />
          </h1>
          <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
            نرخ تبدیل دلار به تومان برای شبیه‌سازی هزینه توکن‌ها
          </p>
        </div>
        <Link href="/settings">
          <TaavButton variant="secondary" iconStart={<ArrowRight className="h-4 w-4" />}>
            بازگشت
          </TaavButton>
        </Link>
      </div>

      <TaavCard variant="outlined" padding="lg" radius="xl">
        <TaavSettingsSection
          variant="split"
          title="نرخ دلار به تومان"
          description="هر ۱ دلار آمریکا معادل چند تومان ایران است. این نرخ در محاسبه هزینه توکن‌ها استفاده می‌شود."
        >
          <div className="grid gap-4">
            <div className="ai-lab-usd-rate-display">
              <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">نرخ فعلی</span>
              <strong className="text-[length:var(--taav-text-2xl)] font-black text-[var(--taav-text-strong)]">
                {formatToman(usdToToman)} تومان
              </strong>
              <span className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">به ازای هر ۱ دلار</span>
            </div>

            {isEditing ? (
              <div className="grid gap-3">
                <TaavFieldBlock
                  label={<AiLabLabelWithTooltip label="نرخ جدید (تومان)" tooltip={AI_LAB_TOOLTIPS.forms.usdRate} required />}
                  required
                  htmlFor="usd-to-toman"
                >
                  <TaavInput
                    id="usd-to-toman"
                    type="number"
                    min="1"
                    value={draftRate}
                    onChange={(event) => setDraftRate(event.target.value)}
                  />
                </TaavFieldBlock>
                <div className="flex flex-wrap gap-2">
                  <TaavButton onClick={saveRate}>ذخیره</TaavButton>
                  <TaavButton variant="secondary" onClick={() => setIsEditing(false)}>
                    انصراف
                  </TaavButton>
                </div>
              </div>
            ) : (
              <TaavButton variant="secondary" onClick={startEdit}>
                ویرایش نرخ
              </TaavButton>
            )}
          </div>
        </TaavSettingsSection>
      </TaavCard>

      {sampleModel ? (
        <TaavCard variant="outlined" padding="lg" radius="xl">
          <div className="grid gap-2">
            <strong className="text-[length:var(--taav-text-sm)]">نمونه شبیه‌سازی</strong>
            <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
              ۱۰۰ توکن {sampleModel.name} با قیمت {formatUsd(sampleModel.pricePer100TokensUsd)} به ازای هر ۱۰۰ توکن ≈{' '}
              <strong className="text-[var(--taav-text-strong)]">{formatToman(sampleToman)} تومان</strong>
            </p>
            <Link
              href="/settings/token-pricing"
              className="text-[length:var(--taav-text-sm)] text-[var(--taav-info-strong)] underline-offset-2 hover:underline"
            >
              مشاهده همه مدل‌ها و قیمت‌ها
            </Link>
          </div>
        </TaavCard>
      ) : null}
    </div>
  );
}
