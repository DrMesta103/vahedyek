'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Copy, Eye, EyeOff, Pencil } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavInput } from '@repo/ui/taav/forms';
import {
  GLOBAL_SETTINGS_MOCK,
  MODEL_CATEGORY_LABELS,
  PROVIDER_LABELS,
  formatToman,
  formatUsd,
  tokensToToman,
  tokensToUsd,
  type ApiKeyEntry,
  type GlobalSettingsData,
  type PricingModel,
  type Provider,
} from '@/app/lib/global-settings-mock';
import { useAdminGate } from './AdminGateProvider';

type TokenPricingSettingsClientProps = {
  initialData?: GlobalSettingsData;
};

export function TokenPricingSettingsClient({ initialData = GLOBAL_SETTINGS_MOCK }: TokenPricingSettingsClientProps) {
  const { requireUnlock } = useAdminGate();
  const [data, setData] = useState(initialData);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [revealedKeyIds, setRevealedKeyIds] = useState<Set<string>>(new Set());

  const modelsByProvider = useMemo(() => {
    const groups = new Map<Provider, PricingModel[]>();
    for (const model of data.models) {
      const list = groups.get(model.provider) ?? [];
      list.push(model);
      groups.set(model.provider, list);
    }
    return groups;
  }, [data.models]);

  const keysByProvider = useMemo(() => {
    const groups = new Map<Provider, ApiKeyEntry[]>();
    for (const key of data.apiKeys) {
      const list = groups.get(key.provider) ?? [];
      list.push(key);
      groups.set(key.provider, list);
    }
    return groups;
  }, [data.apiKeys]);

  const providers = useMemo(
    () => Array.from(new Set(data.models.map((model) => model.provider))),
    [data.models],
  );

  const startEditPrice = (model: PricingModel) => {
    requireUnlock(() => {
      setEditingModelId(model.id);
      setEditPrice(String(model.pricePer100TokensUsd));
    });
  };

  const saveEditPrice = async (modelId: string) => {
    const parsed = Number.parseFloat(editPrice);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    const response = await fetch(`/api/settings/global/models/${modelId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricePer100TokensUsd: parsed }),
    });
    if (!response.ok) return;
    setData((current) => ({
      ...current,
      models: current.models.map((model) =>
        model.id === modelId ? { ...model, pricePer100TokensUsd: parsed } : model,
      ),
    }));
    setEditingModelId(null);
    setEditPrice('');
  };

  const toggleRevealKey = (keyId: string) => {
    requireUnlock(() => {
      setRevealedKeyIds((current) => {
        const next = new Set(current);
        if (next.has(keyId)) next.delete(keyId);
        else next.add(keyId);
        return next;
      });
    });
  };

  const copyKey = (key: ApiKeyEntry) => {
    requireUnlock(async () => {
      await navigator.clipboard.writeText(key.fullKey);
    });
  };

  return (
    <div className="business-settings-page-shell" dir="rtl" lang="fa">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">تنظیمات سراسری</span>
          <h1 className="m-0 text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">
            قیمت‌گذاری توکن‌ها
          </h1>
          <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
            نرخ فعلی دلار: {formatToman(data.usdToToman)} تومان —{' '}
            <Link href="/settings/usd-rate" className="text-[var(--taav-info-strong)] underline-offset-2 hover:underline">
              ویرایش نرخ
            </Link>
          </p>
        </div>
        <Link href="/settings">
          <TaavButton variant="secondary" iconStart={<ArrowRight className="h-4 w-4" />}>
            بازگشت
          </TaavButton>
        </Link>
      </div>

      <div className="ai-lab-stat-grid">
        <TaavCard variant="outlined" padding="md" radius="lg">
          <div className="grid gap-1">
            <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">تعداد مدل‌ها</span>
            <strong className="text-[length:var(--taav-text-lg)]">{data.models.length}</strong>
          </div>
        </TaavCard>
        <TaavCard variant="outlined" padding="md" radius="lg">
          <div className="grid gap-1">
            <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">API keyها</span>
            <strong className="text-[length:var(--taav-text-lg)]">{data.apiKeys.length}</strong>
          </div>
        </TaavCard>
        <TaavCard variant="outlined" padding="md" radius="lg">
          <div className="grid gap-1">
            <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">ارائه‌دهندگان</span>
            <strong className="text-[length:var(--taav-text-lg)]">{providers.length}</strong>
          </div>
        </TaavCard>
      </div>

      {providers.map((provider) => {
        const models = modelsByProvider.get(provider) ?? [];
        const keys = keysByProvider.get(provider) ?? [];

        return (
          <TaavCard
            key={provider}
            variant="outlined"
            padding="lg"
            radius="xl"
            header={
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-[length:var(--taav-text-md)]">{PROVIDER_LABELS[provider]}</strong>
                <TaavBadge tone="neutral" variant="soft">
                  {models.length} مدل
                </TaavBadge>
                <TaavBadge tone="info" variant="outline">
                  {keys.length} API key
                </TaavBadge>
              </div>
            }
          >
            <div className="grid gap-6">
              <div className="overflow-x-auto">
                <table className="ai-lab-settings-table">
                  <thead>
                    <tr>
                      <th>مدل</th>
                      <th>دسته</th>
                      <th>قیمت / ۱۰۰ توکن</th>
                      <th>شبیه‌سازی ۱۰۰۰ توکن</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((model) => {
                      const usd1000 = tokensToUsd(1000, model.pricePer100TokensUsd);
                      const toman1000 = tokensToToman(1000, model.pricePer100TokensUsd, data.usdToToman);
                      const isEditing = editingModelId === model.id;

                      return (
                        <tr key={model.id}>
                          <td>{model.name}</td>
                          <td>
                            <TaavBadge tone="brand" variant="soft">
                              {MODEL_CATEGORY_LABELS[model.category]}
                            </TaavBadge>
                          </td>
                          <td>
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <TaavInput
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={editPrice}
                                  onChange={(event) => setEditPrice(event.target.value)}
                                  inputClassName="max-w-[120px]"
                                />
                                <TaavButton size="sm" onClick={() => saveEditPrice(model.id)}>
                                  ذخیره
                                </TaavButton>
                                <TaavButton
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => {
                                    setEditingModelId(null);
                                    setEditPrice('');
                                  }}
                                >
                                  انصراف
                                </TaavButton>
                              </div>
                            ) : (
                              formatUsd(model.pricePer100TokensUsd)
                            )}
                          </td>
                          <td className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                            {formatUsd(usd1000)} ≈ {formatToman(toman1000)} تومان
                          </td>
                          <td>
                            {!isEditing ? (
                              <TaavButton
                                size="sm"
                                variant="ghost"
                                iconStart={<Pencil className="h-3.5 w-3.5" />}
                                onClick={() => startEditPrice(model)}
                              >
                                ویرایش
                              </TaavButton>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3">
                <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">API keyها</strong>
                {keys.map((key) => {
                  const linkedModels = data.models.filter((model) => key.modelIds.includes(model.id));
                  const revealed = revealedKeyIds.has(key.id);

                  return (
                    <div key={key.id} className="ai-lab-api-key-row">
                      <div className="grid gap-1">
                        <span className="font-semibold text-[var(--taav-text-strong)]">{key.label}</span>
                        <code className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                          {revealed ? key.fullKey : key.maskedKey}
                        </code>
                        <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                          {linkedModels.length} مدل: {linkedModels.map((model) => model.name).join('، ')}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <TaavButton
                          size="sm"
                          variant="secondary"
                          iconStart={revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          onClick={() => toggleRevealKey(key.id)}
                        >
                          {revealed ? 'مخفی' : 'نمایش'}
                        </TaavButton>
                        <TaavButton
                          size="sm"
                          variant="secondary"
                          iconStart={<Copy className="h-3.5 w-3.5" />}
                          onClick={() => copyKey(key)}
                        >
                          کپی
                        </TaavButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TaavCard>
        );
      })}
    </div>
  );
}
