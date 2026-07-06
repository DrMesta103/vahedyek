'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Copy, Eye, EyeOff, Pencil, Plus } from 'lucide-react';
import { TaavDialog, TaavDialogContent, TaavDialogDescription, TaavDialogFooter, TaavDialogHeader, TaavDialogTitle } from '@repo/ui/taav';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavFieldBlock, TaavInput, TaavSelect } from '@repo/ui/taav/forms';
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
  type ModelCategory,
  type PricingModel,
  type Provider,
} from '@/app/lib/global-settings-mock';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabLabelWithTooltip, AiLabSectionLabel, AiLabTooltipIcon } from '@/components/AiLabTooltip';

type TokenPricingSettingsClientProps = {
  initialData?: GlobalSettingsData;
};

const DEFAULT_TOKEN_COUNT = 100;
const PROVIDER_OPTIONS: { label: string; value: Provider }[] = [
  { label: PROVIDER_LABELS.openai, value: 'openai' },
  { label: PROVIDER_LABELS.google, value: 'google' },
  { label: PROVIDER_LABELS.xai, value: 'xai' },
  { label: PROVIDER_LABELS.deepseek, value: 'deepseek' },
];
const CATEGORY_OPTIONS: { label: string; value: ModelCategory }[] = [
  { label: MODEL_CATEGORY_LABELS.chat, value: 'chat' },
  { label: MODEL_CATEGORY_LABELS.embedding, value: 'embedding' },
  { label: MODEL_CATEGORY_LABELS.ocr, value: 'ocr' },
];

function formatTokenCount(value: number) {
  return new Intl.NumberFormat('fa-IR').format(Math.round(value));
}

function parsePositiveInteger(value: string) {
  const parsed = Number.parseInt(value.replace(/,/g, ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeRelatedIds(ids: string[]) {
  return Array.from(new Set(ids.filter(Boolean)));
}

export function TokenPricingSettingsClient({ initialData = GLOBAL_SETTINGS_MOCK }: TokenPricingSettingsClientProps) {
  const [data, setData] = useState(initialData);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editTokenCount, setEditTokenCount] = useState(String(DEFAULT_TOKEN_COUNT));
  const [previewTokenCount, setPreviewTokenCount] = useState('1000');
  const [modelTokenCounts, setModelTokenCounts] = useState<Record<string, number>>(
    () => Object.fromEntries(initialData.models.map((model) => [model.id, DEFAULT_TOKEN_COUNT])) as Record<string, number>,
  );
  const [relatedDialogModelId, setRelatedDialogModelId] = useState<string | null>(null);
  const [relatedDraftIds, setRelatedDraftIds] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    provider: 'openai' as Provider,
    name: '',
    category: 'chat' as ModelCategory,
    pricePer100TokensUsd: '',
    relatedModelIds: [] as string[],
  });
  const [revealedKeyIds, setRevealedKeyIds] = useState<Set<string>>(new Set());

  const previewTokenAmount = useMemo(() => parsePositiveInteger(previewTokenCount) ?? 1000, [previewTokenCount]);
  const modelLookup = useMemo(() => new Map(data.models.map((model) => [model.id, model])), [data.models]);

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

  const providers = useMemo(() => Array.from(new Set(data.models.map((model) => model.provider))), [data.models]);

  const startEditPrice = (model: PricingModel) => {
    setEditingModelId(model.id);
    setEditPrice(String(model.pricePer100TokensUsd));
    setEditTokenCount(String(modelTokenCounts[model.id] ?? DEFAULT_TOKEN_COUNT));
  };

  const saveEditPrice = async (modelId: string) => {
    const tokenCount = parsePositiveInteger(editTokenCount);
    const priceForTokenCount = Number.parseFloat(editPrice);
    if (!tokenCount || !Number.isFinite(priceForTokenCount) || priceForTokenCount < 0) return;

    const pricePer100TokensUsd = (priceForTokenCount / tokenCount) * 100;
    const response = await fetch(`/api/settings/global/models/${modelId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricePer100TokensUsd }),
    });
    if (!response.ok) return;

    setData((current) => ({
      ...current,
      models: current.models.map((model) => (model.id === modelId ? { ...model, pricePer100TokensUsd } : model)),
    }));
    setModelTokenCounts((current) => ({ ...current, [modelId]: tokenCount }));
    setEditingModelId(null);
    setEditPrice('');
    setEditTokenCount(String(DEFAULT_TOKEN_COUNT));
  };

  const openRelatedDialog = (model: PricingModel) => {
    setRelatedDialogModelId(model.id);
    setRelatedDraftIds(model.relatedModelIds ?? []);
  };

  const saveRelatedModels = async () => {
    if (!relatedDialogModelId) return;
    const response = await fetch(`/api/settings/global/models/${relatedDialogModelId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relatedModelIds: normalizeRelatedIds(relatedDraftIds) }),
    });
    if (!response.ok) return;

    setData((current) => ({
      ...current,
      models: current.models.map((model) =>
        model.id === relatedDialogModelId ? { ...model, relatedModelIds: normalizeRelatedIds(relatedDraftIds) } : model,
      ),
    }));
    setRelatedDialogModelId(null);
    setRelatedDraftIds([]);
  };

  const createModel = async () => {
    const name = createForm.name.trim();
    const price = Number.parseFloat(createForm.pricePer100TokensUsd);
    if (!name) {
      setCreateError('نام مدل الزامی است.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setCreateError('قیمت مدل معتبر نیست.');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);
    try {
      const response = await fetch('/api/settings/global/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: createForm.provider,
          name,
          category: createForm.category,
          pricePer100TokensUsd: price,
          relatedModelIds: normalizeRelatedIds(createForm.relatedModelIds),
        }),
      });
      const payload = (await response.json().catch(() => null)) as
        | {
            model?: PricingModel;
            message?: string;
          }
        | null;

      if (!response.ok || !payload?.model) {
        setCreateError(payload?.message ?? 'ایجاد مدل انجام نشد.');
        setCreateLoading(false);
        return;
      }

      setData((current) => ({
        ...current,
        models: [payload.model, ...current.models],
      }));
      setCreateOpen(false);
      setCreateForm({
        provider: 'openai',
        name: '',
        category: 'chat',
        pricePer100TokensUsd: '',
        relatedModelIds: [],
      });
    } catch {
      setCreateError('خطا در ارتباط با سرور.');
      setCreateLoading(false);
    }
  };

  const toggleRevealKey = (keyId: string) => {
    setRevealedKeyIds((current) => {
      const next = new Set(current);
      if (next.has(keyId)) next.delete(keyId);
      else next.add(keyId);
      return next;
    });
  };

  const copyKey = (key: ApiKeyEntry) => {
    void navigator.clipboard.writeText(key.fullKey);
  };

  const relatedDialogModel = relatedDialogModelId ? modelLookup.get(relatedDialogModelId) ?? null : null;
  const relatedCandidates = relatedDialogModel ? data.models.filter((model) => model.id !== relatedDialogModel.id) : [];

  return (
    <div className="business-settings-page-shell" dir="rtl" lang="fa">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">تنظیمات سراسری</span>
          <h1 className="m-0 inline-flex items-center gap-2 text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">
            قیمت‌گذاری توکن‌ها
            <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.settings.tokenPricing} label="راهنمای قیمت‌گذاری" />
          </h1>
          <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
            نرخ فعلی دلار: {formatToman(data.usdToToman)} تومان —{' '}
            <Link href="/settings/usd-rate" className="text-[var(--taav-info-strong)] underline-offset-2 hover:underline">
              ویرایش نرخ
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TaavButton variant="secondary" iconStart={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
            افزودن مدل
          </TaavButton>
          <Link href="/settings">
            <TaavButton variant="secondary" iconStart={<ArrowRight className="h-4 w-4" />}>
              بازگشت
            </TaavButton>
          </Link>
        </div>
      </div>

      <div className="ai-lab-stat-grid">
        <TaavCard variant="outlined" padding="md" radius="lg">
          <div className="grid gap-1">
            <AiLabSectionLabel label="تعداد مدل‌ها" tooltip={AI_LAB_TOOLTIPS.settings.modelCount} />
            <strong className="text-[length:var(--taav-text-lg)]">{data.models.length}</strong>
          </div>
        </TaavCard>
        <TaavCard variant="outlined" padding="md" radius="lg">
          <div className="grid gap-1">
            <AiLabSectionLabel label="API keyها" tooltip={AI_LAB_TOOLTIPS.settings.apiKeyCount} />
            <strong className="text-[length:var(--taav-text-lg)]">{data.apiKeys.length}</strong>
          </div>
        </TaavCard>
        <TaavCard variant="outlined" padding="md" radius="lg">
          <div className="grid gap-1">
            <AiLabSectionLabel label="ارائه‌دهندگان" tooltip={AI_LAB_TOOLTIPS.settings.providerCount} />
            <strong className="text-[length:var(--taav-text-lg)]">{providers.length}</strong>
          </div>
        </TaavCard>
      </div>

      <TaavCard variant="outlined" padding="md" radius="lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="grid gap-1">
            <strong className="text-[length:var(--taav-text-md)] text-[var(--taav-text-strong)]">محاسبه‌گر تعداد توکن</strong>
            <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
              عدد دلخواه را وارد کن تا ستون محاسبه بر همان اساس نمایش داده شود.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TaavInput
              type="number"
              min="1"
              step="1"
              value={previewTokenCount}
              onChange={(event) => setPreviewTokenCount(event.target.value)}
              inputClassName="w-28"
            />
            <span className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">توکن</span>
          </div>
        </div>
      </TaavCard>

      <TaavCard
        variant="outlined"
        padding="lg"
        radius="xl"
        header={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="grid gap-1">
              <strong className="text-[length:var(--taav-text-md)] text-[var(--taav-text-strong)]">مدل‌های من</strong>
              <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                اینجا همه مدل‌هایی را که اضافه کرده‌ای می‌بینی و می‌توانی سریع ویرایششان کنی.
              </span>
            </div>
            <TaavBadge tone="neutral" variant="soft">
              {data.models.length} مدل
            </TaavBadge>
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.models.map((model) => {
            const tokenCount = modelTokenCounts[model.id] ?? DEFAULT_TOKEN_COUNT;
            const amountForTokenCount = tokensToUsd(tokenCount, model.pricePer100TokensUsd);
            const relatedCount = model.relatedModelIds?.length ?? 0;

            return (
              <button
                key={model.id}
                type="button"
                onClick={() => startEditPrice(model)}
                className="grid gap-3 rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-4 text-right transition-colors hover:border-[var(--taav-border-strong)] hover:bg-[var(--taav-surface-subtle)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <TaavBadge tone="brand" variant="soft">
                    {PROVIDER_LABELS[model.provider]}
                  </TaavBadge>
                  <TaavBadge tone="neutral" variant="soft">
                    {MODEL_CATEGORY_LABELS[model.category]}
                  </TaavBadge>
                </div>
                <div className="grid gap-1">
                  <strong className="text-[length:var(--taav-text-base)] text-[var(--taav-text-strong)]">{model.name}</strong>
                  <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                    {formatTokenCount(tokenCount)} توکن • {formatUsd(amountForTokenCount)} • {relatedCount} مدل مرتبط
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </TaavCard>

      {providers.map((provider) => {
        const models = modelsByProvider.get(provider) ?? [];
        const keys = keysByProvider.get(provider) ?? [];
        const sampleModel = models[0] ?? null;

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
                      <th>مدل‌های مرتبط</th>
                      <th>مقدار توکن</th>
                      <th>مبلغ برای این مقدار</th>
                      <th>قیمت / ۱۰۰ توکن</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((model) => {
                      const tokenCount = modelTokenCounts[model.id] ?? DEFAULT_TOKEN_COUNT;
                      const amountForTokenCount = tokensToUsd(tokenCount, model.pricePer100TokensUsd);
                      const isEditing = editingModelId === model.id;
                      const relatedLabels = (model.relatedModelIds ?? [])
                        .map((relatedId) => modelLookup.get(relatedId)?.name ?? relatedId)
                        .filter(Boolean);

                      return (
                        <tr key={model.id}>
                          <td>{model.name}</td>
                          <td>
                            <TaavBadge tone="brand" variant="soft">
                              {MODEL_CATEGORY_LABELS[model.category]}
                            </TaavBadge>
                          </td>
                          <td>
                            {relatedLabels.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {relatedLabels.map((label) => (
                                  <TaavBadge key={label} tone="neutral" variant="soft">
                                    {label}
                                  </TaavBadge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">ندارد</span>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <TaavInput
                                type="number"
                                min="1"
                                step="1"
                                value={editTokenCount}
                                onChange={(event) => setEditTokenCount(event.target.value)}
                                inputClassName="max-w-[120px]"
                              />
                            ) : (
                              <span className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                                {formatTokenCount(tokenCount)} توکن
                              </span>
                            )}
                          </td>
                          <td className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                            {isEditing ? (
                              <TaavInput
                                type="number"
                                min="0"
                                step="0.01"
                                value={editPrice}
                                onChange={(event) => setEditPrice(event.target.value)}
                                inputClassName="max-w-[140px]"
                              />
                            ) : (
                              <div className="grid gap-1">
                                <strong className="text-[var(--taav-text-strong)]">{formatUsd(amountForTokenCount)}</strong>
                                <span className="text-[length:var(--taav-text-xs)]">
                                  بر اساس {formatTokenCount(tokenCount)} توکن
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                            {formatUsd(model.pricePer100TokensUsd)}
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-2">
                              {isEditing ? (
                                <>
                                  <TaavButton size="sm" onClick={() => saveEditPrice(model.id)}>
                                    ذخیره
                                  </TaavButton>
                                  <TaavButton
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                      setEditingModelId(null);
                                      setEditPrice('');
                                      setEditTokenCount(String(DEFAULT_TOKEN_COUNT));
                                    }}
                                  >
                                    انصراف
                                  </TaavButton>
                                </>
                              ) : (
                                <TaavButton
                                  size="sm"
                                  variant="ghost"
                                  iconStart={<Pencil className="h-3.5 w-3.5" />}
                                  onClick={() => startEditPrice(model)}
                                >
                                  ویرایش قیمت
                                </TaavButton>
                              )}
                              <TaavButton size="sm" variant="secondary" onClick={() => openRelatedDialog(model)}>
                                مدل‌های مرتبط
                              </TaavButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3">
                <span className="inline-flex items-center gap-1.5 text-[length:var(--taav-text-sm)] font-semibold text-[var(--taav-text-strong)]">
                  API keyها
                  <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.settings.apiKeyReveal} label="راهنمای API key" />
                </span>
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
                {keys.length === 0 ? (
                  <div className="rounded-[var(--taav-radius-lg)] border border-dashed border-[var(--taav-border-subtle)] px-4 py-3 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    برای این ارائه‌دهنده هنوز API key ثبت نشده است.
                  </div>
                ) : null}
              </div>

              {sampleModel ? (
                <div className="rounded-[var(--taav-radius-lg)] border border-dashed border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] px-4 py-3 text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
                  با وارد کردن تعداد توکن دلخواه، هزینه نمونه به‌صورت داینامیک محاسبه می‌شود. برای نمونه:
                  <span className="font-semibold text-[var(--taav-text-strong)]">
                    {' '}
                    {formatTokenCount(previewTokenAmount)} توکن ≈ {formatUsd(tokensToUsd(previewTokenAmount, sampleModel.pricePer100TokensUsd))} دلار ≈{' '}
                    {formatToman(tokensToToman(previewTokenAmount, sampleModel.pricePer100TokensUsd, data.usdToToman))} تومان
                  </span>
                </div>
              ) : null}
            </div>
          </TaavCard>
        );
      })}

      <TaavDialog open={createOpen} onOpenChange={(open) => (open ? setCreateOpen(true) : setCreateOpen(false))}>
        <TaavDialogContent size="md" contentClassName="ai-lab-dialog">
          <TaavDialogHeader>
            <TaavDialogTitle>افزودن مدل جدید</TaavDialogTitle>
            <TaavDialogDescription>مدل، دسته و قیمت پایه را وارد کن و در صورت نیاز مدل‌های مرتبط را هم به آن اضافه کن.</TaavDialogDescription>
          </TaavDialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <TaavFieldBlock label={<AiLabLabelWithTooltip label="ارائه‌دهنده" tooltip={AI_LAB_TOOLTIPS.forms.brandName} required />} required htmlFor="pricing-provider">
                <TaavSelect
                  id="pricing-provider"
                  value={createForm.provider}
                  onChange={(event) => setCreateForm((current) => ({ ...current, provider: event.target.value as Provider }))}
                  options={PROVIDER_OPTIONS}
                />
              </TaavFieldBlock>
              <TaavFieldBlock label={<AiLabLabelWithTooltip label="دسته" tooltip={AI_LAB_TOOLTIPS.forms.brandName} required />} required htmlFor="pricing-category">
                <TaavSelect
                  id="pricing-category"
                  value={createForm.category}
                  onChange={(event) => setCreateForm((current) => ({ ...current, category: event.target.value as ModelCategory }))}
                  options={CATEGORY_OPTIONS}
                />
              </TaavFieldBlock>
            </div>

            <TaavFieldBlock label={<AiLabLabelWithTooltip label="نام مدل" tooltip={AI_LAB_TOOLTIPS.forms.brandName} required />} required htmlFor="pricing-model-name">
              <TaavInput
                id="pricing-model-name"
                value={createForm.name}
                onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="مثلاً GPT-4.1"
              />
            </TaavFieldBlock>

            <TaavFieldBlock label={<AiLabLabelWithTooltip label="قیمت / ۱۰۰ توکن (دلار)" tooltip={AI_LAB_TOOLTIPS.forms.usdRate} required />} required htmlFor="pricing-model-price">
              <TaavInput
                id="pricing-model-price"
                type="number"
                min="0"
                step="0.01"
                value={createForm.pricePer100TokensUsd}
                onChange={(event) => setCreateForm((current) => ({ ...current, pricePer100TokensUsd: event.target.value }))}
                placeholder="مثلاً 2.5"
              />
            </TaavFieldBlock>

            <div className="grid gap-2">
              <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">مدل‌های مرتبط</strong>
              <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                می‌توانی از بین مدل‌های موجود، چند مدل را برای ارتباط با این مدل انتخاب کنی.
              </span>
              <div className="grid gap-2 rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-subtle)] p-3">
                {data.models.length > 0 ? (
                  data.models.map((model) => {
                    const checked = createForm.relatedModelIds.includes(model.id);
                    return (
                      <label key={model.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--taav-radius-md)] px-2 py-2 hover:bg-[var(--taav-surface)]">
                        <span className="grid">
                          <span className="text-[length:var(--taav-text-sm)] font-semibold text-[var(--taav-text-strong)]">{model.name}</span>
                          <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">{PROVIDER_LABELS[model.provider]}</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            setCreateForm((current) => ({
                              ...current,
                              relatedModelIds: event.target.checked
                                ? normalizeRelatedIds([...current.relatedModelIds, model.id])
                                : current.relatedModelIds.filter((id) => id !== model.id),
                            }));
                          }}
                        />
                      </label>
                    );
                  })
                ) : (
                  <span className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">هنوز مدلی ثبت نشده است.</span>
                )}
              </div>
            </div>

            {createError ? <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">{createError}</p> : null}
          </div>

          <TaavDialogFooter>
            <TaavButton
              variant="secondary"
              tone="neutral"
              onClick={() => {
                setCreateOpen(false);
                setCreateError(null);
              }}
              disabled={createLoading}
            >
              انصراف
            </TaavButton>
            <TaavButton
              onClick={() => void createModel()}
              disabled={createLoading || !createForm.name.trim()}
            >
              {createLoading ? 'در حال ایجاد...' : 'ایجاد مدل'}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>

      <TaavDialog open={Boolean(relatedDialogModelId)} onOpenChange={(open) => !open && setRelatedDialogModelId(null)}>
        <TaavDialogContent size="md" contentClassName="ai-lab-dialog">
          <TaavDialogHeader>
            <TaavDialogTitle>مدل‌های مرتبط</TaavDialogTitle>
            <TaavDialogDescription>
              برای مدل <strong>{relatedDialogModel?.name ?? ''}</strong> مدل‌های مرتبط را انتخاب کن.
            </TaavDialogDescription>
          </TaavDialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid gap-2 rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-subtle)] p-3">
              {relatedCandidates.length > 0 ? (
                relatedCandidates.map((model) => {
                  const checked = relatedDraftIds.includes(model.id);
                  return (
                    <label key={model.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-[var(--taav-radius-md)] px-2 py-2 hover:bg-[var(--taav-surface)]">
                      <span className="grid">
                        <span className="text-[length:var(--taav-text-sm)] font-semibold text-[var(--taav-text-strong)]">{model.name}</span>
                        <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">{PROVIDER_LABELS[model.provider]}</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => {
                          setRelatedDraftIds((current) =>
                            event.target.checked ? normalizeRelatedIds([...current, model.id]) : current.filter((id) => id !== model.id),
                          );
                        }}
                      />
                    </label>
                  );
                })
              ) : (
                <span className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">مدل دیگری برای انتخاب وجود ندارد.</span>
              )}
            </div>
          </div>

          <TaavDialogFooter>
            <TaavButton variant="secondary" tone="neutral" onClick={() => setRelatedDialogModelId(null)}>
              انصراف
            </TaavButton>
            <TaavButton onClick={() => void saveRelatedModels()}>ذخیره</TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
    </div>
  );
}
