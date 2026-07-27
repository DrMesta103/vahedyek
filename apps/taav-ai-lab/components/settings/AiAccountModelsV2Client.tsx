'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleCheck, MoreVertical, Pencil, Plus, Power, Shield, Trash2, Wallet } from 'lucide-react';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
  TaavDropdown,
  TaavDropdownContent,
  TaavDropdownItem,
  TaavDropdownSeparator,
  TaavDropdownTrigger,
} from '@repo/ui/taav';
import { TaavEmptyState } from '@repo/ui/taav/data-display';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavChoiceChipGroup, TaavFieldBlock, TaavInput, TaavTextarea, TaavCheckbox } from '@repo/ui/taav/forms';
import {
  AI_PROVIDER_MODEL_CAPABILITY_LABELS_V2,
  AI_PROVIDER_MODEL_CAPABILITY_TYPES_V2,
  AI_PROVIDER_MODEL_TYPE_LABELS_V2,
  AI_PROVIDER_MODEL_TYPES_V2,
  AI_PROVIDER_USAGE_METRIC_LABELS_V2,
  AI_PROVIDER_USAGE_METRIC_TYPES_V2,
  AI_PROVIDER_USAGE_UNIT_LABELS_V2,
  AI_PROVIDER_USAGE_UNIT_TYPES_V2,
  type AiProviderAccountV2Public,
  type AiProviderModelCapabilityTypeV2,
  type AiProviderModelTypeV2,
  type AiProviderModelV2Public,
  type AiProviderUsageMetricTypeV2,
  type AiProviderUsageUnitTypeV2,
} from '@/app/lib/types/ai-provider-v2';
import { formatUsd } from '@/app/lib/global-settings-mock';
import { TAAVIA_BRAND_AI_MODEL_PURPOSES, TAAVIA_PURPOSE_LABELS, type TaaviaBrandAiModelPurpose } from '@/app/lib/taavia-ai-models';

type Props = {
  account: AiProviderAccountV2Public;
  initialModels: AiProviderModelV2Public[];
};

type TransactionFormState = {
  transactionType: 'PURCHASE' | 'MANUAL_ADJUSTMENT';
  amountUsd: string;
  amountToman: string;
  transactionAt: string;
  description: string;
};

const EMPTY_TX_FORM: TransactionFormState = {
  transactionType: 'PURCHASE',
  amountUsd: '',
  amountToman: '',
  transactionAt: '',
  description: '',
};

type PricingItemForm = {
  usageMetricType: AiProviderUsageMetricTypeV2;
  usageUnitType: AiProviderUsageUnitTypeV2;
  unitQuantity: string;
  priceUsd: string;
};

type PricingFormState = {
  effectiveFrom: string;
  items: PricingItemForm[];
};

type ModelFormState = {
  name: string;
  providerModelId: string;
  modelType: AiProviderModelTypeV2;
  isActive: boolean;
  capabilities: Record<AiProviderModelCapabilityTypeV2, boolean>;
  recommendedForPurposes: Record<TaaviaBrandAiModelPurpose, boolean>;
  notes: string;
};

const EMPTY_CAPS = Object.fromEntries(
  (AI_PROVIDER_MODEL_CAPABILITY_TYPES_V2 as readonly AiProviderModelCapabilityTypeV2[]).map((c) => [c, false]),
) as Record<AiProviderModelCapabilityTypeV2, boolean>;

const EMPTY_FORM: ModelFormState = {
  name: '',
  providerModelId: '',
  modelType: 'TEXT_GENERATION',
  isActive: true,
  capabilities: { ...EMPTY_CAPS },
  recommendedForPurposes: Object.fromEntries(TAAVIA_BRAND_AI_MODEL_PURPOSES.map((purpose) => [purpose, false])) as Record<TaaviaBrandAiModelPurpose, boolean>,
  notes: '',
};

const DEFAULT_PRICING_ITEMS: PricingItemForm[] = [
  { usageMetricType: 'INPUT_TOKEN', usageUnitType: 'TOKEN', unitQuantity: '1000000', priceUsd: '' },
  { usageMetricType: 'OUTPUT_TOKEN', usageUnitType: 'TOKEN', unitQuantity: '1000000', priceUsd: '' },
  { usageMetricType: 'CACHED_INPUT_TOKEN', usageUnitType: 'TOKEN', unitQuantity: '1000000', priceUsd: '' },
  { usageMetricType: 'IMAGE', usageUnitType: 'ITEM', unitQuantity: '1', priceUsd: '' },
  { usageMetricType: 'AUDIO', usageUnitType: 'MINUTE', unitQuantity: '1', priceUsd: '' },
  { usageMetricType: 'VIDEO', usageUnitType: 'ITEM', unitQuantity: '1', priceUsd: '' },
  { usageMetricType: 'DOCUMENT_PAGE', usageUnitType: 'PAGE', unitQuantity: '1', priceUsd: '' },
  { usageMetricType: 'REQUEST', usageUnitType: 'REQUEST', unitQuantity: '1', priceUsd: '' },
  { usageMetricType: 'CHARACTER', usageUnitType: 'CHARACTER', unitQuantity: '1000', priceUsd: '' },
];

const PRIMARY_PRICING_METRICS: AiProviderUsageMetricTypeV2[] = ['INPUT_TOKEN', 'OUTPUT_TOKEN', 'CACHED_INPUT_TOKEN'];

const MODEL_TYPE_OPTIONS = (AI_PROVIDER_MODEL_TYPES_V2 as readonly AiProviderModelTypeV2[]).map((t) => ({
  label: AI_PROVIDER_MODEL_TYPE_LABELS_V2[t],
  value: t,
}));

const STATUS_OPTIONS = [
  { label: 'فعال', value: 'active' },
  { label: 'غیرفعال', value: 'inactive' },
];

function formatFaNumber(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value);
}

function formatFaDateTime(value: string) {
  return new Date(value).toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeMetricType(value: string): AiProviderUsageMetricTypeV2 | null {
  const normalized = value
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toUpperCase();
  return (AI_PROVIDER_USAGE_METRIC_TYPES_V2 as readonly string[]).includes(normalized)
    ? (normalized as AiProviderUsageMetricTypeV2)
    : null;
}

function normalizeUnitType(value: string): AiProviderUsageUnitTypeV2 | null {
  const normalized = value
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toUpperCase();
  return (AI_PROVIDER_USAGE_UNIT_TYPES_V2 as readonly string[]).includes(normalized)
    ? (normalized as AiProviderUsageUnitTypeV2)
    : null;
}

function metricLabel(value: string) {
  const metric = normalizeMetricType(value);
  return metric ? AI_PROVIDER_USAGE_METRIC_LABELS_V2[metric] : value;
}

function unitLabel(value: string) {
  const unit = normalizeUnitType(value);
  return unit ? AI_PROVIDER_USAGE_UNIT_LABELS_V2[unit] : value;
}

function formatPricingItemSummary(item: {
  usageMetricType: string;
  usageUnitType: string;
  unitQuantity: number | string;
  priceUsd: number | string;
}) {
  const quantity = formatFaNumber(Number(item.unitQuantity));
  const price = formatUsd(Number(item.priceUsd));
  return `${price} برای هر ${quantity} ${unitLabel(item.usageUnitType)}`;
}

function formatLocalDateTimePreview(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return formatFaDateTime(parsed.toISOString());
}

function extractCapabilities(state: Record<AiProviderModelCapabilityTypeV2, boolean>) {
  return Object.entries(state)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key as AiProviderModelCapabilityTypeV2);
}

function toFormState(model: AiProviderModelV2Public): ModelFormState {
  const caps = { ...EMPTY_CAPS };
  for (const cap of model.capabilities) {
    caps[cap] = true;
  }
  const recommendedForPurposes = Object.fromEntries(
    TAAVIA_BRAND_AI_MODEL_PURPOSES.map((purpose) => [purpose, model.recommendedForPurposes.includes(purpose)]),
  ) as Record<TaaviaBrandAiModelPurpose, boolean>;
  return {
    name: model.name,
    providerModelId: model.providerModelId,
    modelType: model.modelType,
    isActive: model.isActive,
    capabilities: caps,
    recommendedForPurposes,
    notes: '',
  };
}

export function AiAccountModelsV2Client({ account, initialModels }: Props) {
  const [models, setModels] = useState(initialModels);
  const [listError, setListError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AiProviderModelV2Public | null>(null);
  const [form, setForm] = useState<ModelFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txFormOpen, setTxFormOpen] = useState(false);
  const [txForm, setTxForm] = useState<TransactionFormState>(EMPTY_TX_FORM);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSaving, setTxSaving] = useState(false);

  const [pricingOpen, setPricingOpen] = useState(false);
  const [pricingModel, setPricingModel] = useState<AiProviderModelV2Public | null>(null);
  const [pricings, setPricings] = useState<any[]>([]);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [pricingForm, setPricingForm] = useState<PricingFormState>({ effectiveFrom: '', items: DEFAULT_PRICING_ITEMS });
  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingEndSaving, setPricingEndSaving] = useState(false);
  const [showAdvancedPricingMetrics, setShowAdvancedPricingMetrics] = useState(false);

  const summaryCards = useMemo(
    () => [
      { label: 'نام اکانت', value: account.name },
      { label: 'Provider', value: account.providerLabel },
      { label: 'وضعیت', value: account.isActive ? 'فعال' : 'غیرفعال' },
      { label: 'API Key', value: account.apiKeyMasked, mono: true },
    ],
    [account],
  );

  const refreshModels = async () => {
    setListError(null);
    const res = await fetch(`/api/settings/ai-accounts-v2/${account.id}/models`);
    const payload = (await res.json().catch(() => null)) as { message?: string; models?: AiProviderModelV2Public[] } | null;
    if (!res.ok || !payload?.models) {
      setListError(payload?.message ?? 'بارگذاری مدل‌ها انجام نشد.');
      return;
    }
    setModels(payload.models);
  };

  const loadTransactions = async () => {
    setTxLoading(true);
    setTxError(null);
    try {
      const res = await fetch(`/api/settings/ai-accounts-v2/${account.id}/transactions`);
      const payload = (await res.json().catch(() => null)) as { message?: string; transactions?: any[] } | null;
      if (!res.ok || !payload?.transactions) {
        setTxError(payload?.message ?? 'بارگذاری تراکنش‌ها انجام نشد.');
        return;
      }
      setTransactions(payload.transactions);
    } catch {
      setTxError('بارگذاری تراکنش‌ها انجام نشد.');
    } finally {
      setTxLoading(false);
    }
  };

  const openTransactions = async () => {
    setTransactionsOpen(true);
    await loadTransactions();
  };

  const openCreateTransaction = () => {
    setTxForm(EMPTY_TX_FORM);
    setTxError(null);
    setTxFormOpen(true);
  };

  const closeCreateTransaction = () => {
    if (txSaving) return;
    setTxFormOpen(false);
    setTxForm(EMPTY_TX_FORM);
    setTxError(null);
  };

  const submitTransaction = async () => {
    setTxError(null);
    setTxSaving(true);
    const amountUsd = Number(txForm.amountUsd);
    const amountToman = Number(txForm.amountToman);
    if (!txForm.transactionAt) {
      setTxError('تاریخ تراکنش الزامی است.');
      setTxSaving(false);
      return;
    }
    if (!Number.isFinite(amountUsd) || amountUsd === 0) {
      setTxError('مبلغ دلار باید عددی غیر صفر باشد.');
      setTxSaving(false);
      return;
    }
    if (!Number.isFinite(amountToman) || !Number.isInteger(amountToman) || amountToman === 0) {
      setTxError('مبلغ تومان باید عدد صحیح غیر صفر باشد.');
      setTxSaving(false);
      return;
    }
    if (txForm.transactionType === 'MANUAL_ADJUSTMENT' && !txForm.description.trim()) {
      setTxError('برای اصلاح دستی، توضیحات اجباری است.');
      setTxSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/settings/ai-accounts-v2/${account.id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionType: txForm.transactionType,
          amountUsd,
          amountToman,
          transactionAt: new Date(txForm.transactionAt).toISOString(),
          description: txForm.description.trim() || null,
        }),
      });
      const payload = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setTxError(payload?.message ?? 'ثبت تراکنش انجام نشد.');
        return;
      }
      setActionFeedback('تراکنش ثبت شد.');
      closeCreateTransaction();
      await loadTransactions();
    } catch {
      setTxError('ثبت تراکنش انجام نشد.');
    } finally {
      setTxSaving(false);
    }
  };

  const openPricing = async (model: AiProviderModelV2Public) => {
    setPricingModel(model);
    setPricingError(null);
    setPricings([]);
    setPricingForm({ effectiveFrom: '', items: DEFAULT_PRICING_ITEMS.map((item) => ({ ...item })) });
    setShowAdvancedPricingMetrics(false);
    setPricingOpen(true);
    setPricingLoading(true);
    try {
      const res = await fetch(`/api/settings/ai-accounts-v2/models/${model.id}/pricings`);
      const payload = (await res.json().catch(() => null)) as { message?: string; pricings?: any[] } | null;
      if (!res.ok || !payload?.pricings) {
        setPricingError(payload?.message ?? 'بارگذاری دوره‌های قیمت‌گذاری انجام نشد.');
        return;
      }
      setPricings(payload.pricings);
    } catch {
      setPricingError('بارگذاری دوره‌های قیمت‌گذاری انجام نشد.');
    } finally {
      setPricingLoading(false);
    }
  };

  const createPricing = async () => {
    if (!pricingModel) return;
    setPricingError(null);
    setPricingSaving(true);
    if (!pricingForm.effectiveFrom) {
      setPricingError('تاریخ شروع دوره الزامی است.');
      setPricingSaving(false);
      return;
    }

    const priceItems = pricingForm.items
      .map((it) => ({
        usageMetricType: it.usageMetricType,
        usageUnitType: it.usageUnitType,
        unitQuantity: Number(it.unitQuantity),
        priceUsd: Number(it.priceUsd),
      }))
      .filter((it) => Number.isFinite(it.priceUsd) && it.priceUsd > 0);

    if (priceItems.length === 0) {
      setPricingError('حداقل یک قیمت بزرگ‌تر از صفر وارد کنید.');
      setPricingSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/settings/ai-accounts-v2/models/${pricingModel.id}/pricings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ effectiveFrom: new Date(pricingForm.effectiveFrom).toISOString(), priceItems }),
      });
      const payload = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setPricingError(payload?.message ?? 'ثبت دوره قیمت‌گذاری انجام نشد.');
        return;
      }
      setActionFeedback('دوره قیمت‌گذاری ثبت شد.');
      await openPricing(pricingModel);
    } catch {
      setPricingError('ثبت دوره قیمت‌گذاری انجام نشد.');
    } finally {
      setPricingSaving(false);
    }
  };

  const endCurrentPricing = async () => {
    if (!pricingModel) return;
    const current = pricings.find((p) => p.effectiveTo == null && p.isDeleted === false);
    if (!current) {
      setPricingError('دوره فعالی برای بستن وجود ندارد.');
      return;
    }

    const effectiveTo = prompt('تاریخ پایان (ISO) را وارد کنید. مثال: 2026-07-13T12:00:00Z');
    if (!effectiveTo) return;

    setPricingEndSaving(true);
    setPricingError(null);
    try {
      const res = await fetch(`/api/settings/ai-accounts-v2/models/${pricingModel.id}/pricings/${current.id}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ effectiveTo }),
      });
      const payload = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setPricingError(payload?.message ?? 'بستن دوره انجام نشد.');
        return;
      }
      setActionFeedback('دوره قیمت‌گذاری بسته شد.');
      await openPricing(pricingModel);
    } catch {
      setPricingError('بستن دوره انجام نشد.');
    } finally {
      setPricingEndSaving(false);
    }
  };

  const openCreateDialog = () => {
    setEditingModel(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (model: AiProviderModelV2Public) => {
    setEditingModel(model);
    setForm(toFormState(model));
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (formLoading) return;
    setDialogOpen(false);
    setEditingModel(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const submitForm = async () => {
    setFormError(null);
    setFormLoading(true);

    const payload = {
      name: form.name.trim(),
      providerModelId: form.providerModelId.trim(),
      modelType: form.modelType,
      isActive: form.isActive,
      capabilities: extractCapabilities(form.capabilities),
      recommendedForPurposes: TAAVIA_BRAND_AI_MODEL_PURPOSES.filter((purpose) => form.recommendedForPurposes[purpose]),
    };

    if (!payload.name || !payload.providerModelId) {
      setFormError('نام مدل و شناسه مدل در Provider الزامی است.');
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch(
        editingModel
          ? `/api/settings/ai-accounts-v2/${account.id}/models/${editingModel.id}`
          : `/api/settings/ai-accounts-v2/${account.id}/models`,
        {
          method: editingModel ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const result = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setFormError(result?.message ?? 'ذخیره مدل انجام نشد.');
        return;
      }
      setActionFeedback(editingModel ? 'مدل به‌روزرسانی شد.' : 'مدل ایجاد شد.');
      closeDialog();
      await refreshModels();
    } catch {
      setFormError('ذخیره مدل انجام نشد.');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleStatus = async (model: AiProviderModelV2Public) => {
    setActionFeedback(null);
    const res = await fetch(`/api/settings/ai-accounts-v2/${account.id}/models/${model.id}/toggle-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !model.isActive }),
    });
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { message?: string } | null;
      setListError(payload?.message ?? 'تغییر وضعیت انجام نشد.');
      return;
    }
    setActionFeedback(model.isActive ? 'مدل غیرفعال شد.' : 'مدل فعال شد.');
    await refreshModels();
  };

  const deleteModel = async (model: AiProviderModelV2Public) => {
    if (model.isSystem) return;
    const confirmed = window.confirm(`آیا مطمئن هستید که می‌خواهید مدل «${model.name}» را حذف کنید؟`);
    if (!confirmed) return;
    setActionFeedback(null);
    const res = await fetch(`/api/settings/ai-accounts-v2/${account.id}/models/${model.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { message?: string } | null;
      setListError(payload?.message ?? 'حذف مدل انجام نشد.');
      return;
    }
    setActionFeedback('مدل حذف شد.');
    await refreshModels();
  };

  return (
    <div className="business-settings-page-shell" dir="rtl" lang="fa">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
            {account.name}
            {account.isSystem ? ' · اکانت سیستمی' : ''}
          </span>
          <h1 className="m-0 inline-flex items-center gap-2 text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">
            مدل‌ها و قیمت‌گذاری
          </h1>
          <p className="m-0 max-w-3xl text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
            مدل‌ها، قابلیت‌ها و دوره‌های قیمت‌گذاری را مدیریت کنید. تراکنش‌های اعتبار هم در همین صفحه ثبت می‌شوند.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/settings/ai-accounts">
            <TaavButton variant="secondary" iconStart={<ArrowRight className="h-4 w-4" />}>
              بازگشت به اکانت‌ها
            </TaavButton>
          </Link>
        </div>
      </div>

      {actionFeedback ? (
        <p className="m-0 rounded-[14px] border border-[color:var(--taav-success-border)] bg-[var(--taav-success-soft)] px-3 py-2 text-[length:var(--taav-text-sm)] text-[var(--taav-success-strong)]">
          {actionFeedback}
        </p>
      ) : null}
      {listError ? (
        <p className="m-0 rounded-[14px] border border-[color:var(--taav-danger-border)] bg-[var(--taav-danger-soft)] px-3 py-2 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">
          {listError}
        </p>
      ) : null}

      <TaavCard variant="outlined" padding="lg" radius="xl">
        <div className="ai-lab-stat-grid">
          {summaryCards.map((card) => (
            <div key={card.label} className="grid gap-1">
              <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">{card.label}</span>
              <strong
                className={`text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)] ${card.mono ? 'font-mono' : ''}`}
                dir={card.mono ? 'ltr' : undefined}
              >
                {card.value}
              </strong>
            </div>
          ))}
        </div>
      </TaavCard>

      <TaavCard variant="outlined" padding="lg" radius="xl">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1">
            <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">مدل‌های اکانت</h2>
            <p className="m-0 max-w-3xl text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
              مدل‌های قابل استفاده برای این Provider را تعریف کنید.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <TaavButton variant="secondary" iconStart={<Wallet className="h-4 w-4" />} onClick={() => void openTransactions()}>
              تراکنش‌های اعتبار
            </TaavButton>
            <TaavButton iconStart={<Plus className="h-4 w-4" />} onClick={openCreateDialog}>
              افزودن مدل
            </TaavButton>
          </div>
        </div>

        {models.length === 0 ? (
          <TaavEmptyState
            variant="default"
            title="هنوز مدلی برای این اکانت تعریف نشده است."
            description="برای شروع، اولین مدل را اضافه کنید."
            primaryAction={
              <TaavButton iconStart={<Plus className="h-4 w-4" />} onClick={openCreateDialog}>
                افزودن مدل
              </TaavButton>
            }
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {models.map((model) => (
              <TaavCard
                key={model.id}
                variant="outlined"
                padding="lg"
                radius="xl"
                contentClassName={model.isActive ? undefined : 'opacity-80'}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="m-0 truncate text-[length:var(--taav-text-md)] font-black text-[var(--taav-text-strong)]">
                        {model.name}
                      </h3>
                      {model.isSystem ? (
                        <TaavBadge tone="info" variant="soft" size="sm">
                          <span className="ai-lab-system-badge">
                            <Shield className="h-3 w-3" />
                            سیستمی
                          </span>
                        </TaavBadge>
                      ) : null}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                      <span className="font-mono" dir="ltr">
                        {model.providerModelId}
                      </span>
                      <span>•</span>
                      <TaavBadge tone="brand" variant="soft" size="sm">
                        {AI_PROVIDER_MODEL_TYPE_LABELS_V2[model.modelType]}
                      </TaavBadge>
                      <TaavBadge tone={model.isActive ? 'success' : 'neutral'} variant="soft" size="sm">
                        <span className="inline-flex items-center gap-1">
                          <CircleCheck className="h-3.5 w-3.5" />
                          {model.isActive ? 'فعال' : 'غیرفعال'}
                        </span>
                      </TaavBadge>
                      {model.recommendedForPurposes.map((purpose) => <TaavBadge key={purpose} tone="brand" variant="soft" size="sm">پیشنهادی برای {TAAVIA_PURPOSE_LABELS[purpose as TaaviaBrandAiModelPurpose]}</TaavBadge>)}
                    </div>
                  </div>

                  <TaavDropdown>
                    <TaavDropdownTrigger asChild>
                      <button type="button" className="ai-lab-admin-user-menu" aria-label={`اکشن‌های مدل ${model.name}`}>
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </TaavDropdownTrigger>
                    <TaavDropdownContent align="end">
                      <TaavDropdownItem iconStart={<Pencil className="h-4 w-4" />} onSelect={() => openEditDialog(model)}>
                        ویرایش
                      </TaavDropdownItem>
                      <TaavDropdownItem iconStart={<Wallet className="h-4 w-4" />} onSelect={() => void openPricing(model)}>
                        قیمت‌گذاری
                      </TaavDropdownItem>
                      <TaavDropdownItem
                        iconStart={<Power className="h-4 w-4" />}
                        tone={model.isActive ? 'warning' : 'success'}
                        onSelect={() => void toggleStatus(model)}
                      >
                        {model.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
                      </TaavDropdownItem>
                      {!model.isSystem ? (
                        <>
                          <TaavDropdownSeparator />
                          <TaavDropdownItem
                            tone="danger"
                            iconStart={<Trash2 className="h-4 w-4" />}
                            description="غیرقابل بازگشت"
                            onSelect={(event) => {
                              event.preventDefault();
                              void deleteModel(model);
                            }}
                          >
                            حذف
                          </TaavDropdownItem>
                        </>
                      ) : null}
                    </TaavDropdownContent>
                  </TaavDropdown>
                </div>

                <div className="mt-4 grid gap-2 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                  <div>
                    قابلیت‌ها:{' '}
                    <span className="text-[var(--taav-text-strong)]">
                      {model.capabilities.length
                        ? model.capabilities.map((cap) => AI_PROVIDER_MODEL_CAPABILITY_LABELS_V2[cap]).join('، ')
                        : '—'}
                    </span>
                  </div>
                  <div>آخرین بروزرسانی: {formatFaDateTime(model.updatedAt)}</div>
                  <div className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                    قیمت‌گذاری: <span className="text-[var(--taav-text-strong)]">{formatUsd(0)}</span> (از منوی «قیمت‌گذاری» مدیریت می‌شود)
                  </div>
                </div>
              </TaavCard>
            ))}
          </div>
        )}
      </TaavCard>

      <TaavDialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <TaavDialogContent size="lg" contentClassName="ai-lab-dialog ai-lab-dialog--scroll">
          <TaavDialogHeader>
            <TaavDialogTitle>{editingModel ? 'ویرایش مدل' : 'افزودن مدل'}</TaavDialogTitle>
            <TaavDialogDescription>قابلیت‌ها و نوع مدل را تنظیم کنید. قیمت‌گذاری به صورت دوره‌ای اضافه می‌شود.</TaavDialogDescription>
          </TaavDialogHeader>

          <div className="ai-lab-dialog-scroll grid gap-5">
            <section className="grid gap-4">
              <TaavFieldBlock label="نام مدل" required htmlFor="v2-model-name">
                <TaavInput id="v2-model-name" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} />
              </TaavFieldBlock>
              <TaavFieldBlock label="شناسه مدل در Provider" required htmlFor="v2-model-provider-id">
                <TaavInput
                  id="v2-model-provider-id"
                  value={form.providerModelId}
                  onChange={(e) => setForm((c) => ({ ...c, providerModelId: e.target.value }))}
                  dir="ltr"
                />
              </TaavFieldBlock>
              <TaavFieldBlock label="نوع مدل" required>
                <TaavChoiceChipGroup
                  ariaLabel="نوع مدل"
                  options={MODEL_TYPE_OPTIONS}
                  value={form.modelType}
                  onValueChange={(value) => {
                    const next = Array.isArray(value) ? value[0] : value;
                    if (!next) return;
                    setForm((c) => ({ ...c, modelType: next as AiProviderModelTypeV2 }));
                  }}
                  size="sm"
                  tone="brand"
                  gap="sm"
                  wrap
                />
              </TaavFieldBlock>
              <TaavFieldBlock label="وضعیت" required>
                <TaavChoiceChipGroup
                  ariaLabel="وضعیت مدل"
                  options={STATUS_OPTIONS}
                  value={form.isActive ? 'active' : 'inactive'}
                  onValueChange={(value) => {
                    const next = Array.isArray(value) ? value[0] : value;
                    if (!next) return;
                    setForm((c) => ({ ...c, isActive: next === 'active' }));
                  }}
                  size="sm"
                  tone="brand"
                  gap="sm"
                  wrap={false}
                />
              </TaavFieldBlock>
            </section>

            <section className="grid gap-3">
              <h3 className="m-0 text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]">قابلیت‌ها</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {(AI_PROVIDER_MODEL_CAPABILITY_TYPES_V2 as readonly AiProviderModelCapabilityTypeV2[]).map((cap) => (
                  <TaavCheckbox
                    key={cap}
                    checked={form.capabilities[cap]}
                    onChange={(event) =>
                      setForm((c) => ({ ...c, capabilities: { ...c.capabilities, [cap]: event.target.checked } }))
                    }
                    label={AI_PROVIDER_MODEL_CAPABILITY_LABELS_V2[cap]}
                  />
                ))}
              </div>
            </section>

            <section className="grid gap-3 rounded-[14px] border border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] p-4">
              <div>
                <h3 className="m-0 text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]">پیشنهاد برای کاربرد برند</h3>
                <p className="mt-1 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">مدل را برای هر کاربردی که باید در تنظیمات برند پیشنهاد شود، انتخاب کنید.</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {TAAVIA_BRAND_AI_MODEL_PURPOSES.map((purpose) => (
                  <TaavCheckbox
                    key={purpose}
                    checked={form.recommendedForPurposes[purpose]}
                    onChange={(event) => setForm((current) => ({ ...current, recommendedForPurposes: { ...current.recommendedForPurposes, [purpose]: event.target.checked } }))}
                    label={`پیشنهادی برای ${TAAVIA_PURPOSE_LABELS[purpose]}`}
                  />
                ))}
              </div>
            </section>

            <section className="grid gap-3">
              <TaavFieldBlock label="توضیحات" htmlFor="v2-model-notes">
                <TaavTextarea id="v2-model-notes" rows={3} value={form.notes} onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))} />
              </TaavFieldBlock>
            </section>

            {formError ? <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">{formError}</p> : null}
          </div>

          <TaavDialogFooter>
            <TaavButton variant="secondary" onClick={closeDialog} disabled={formLoading}>
              انصراف
            </TaavButton>
            <TaavButton onClick={submitForm} disabled={formLoading}>
              {formLoading ? 'در حال ذخیره...' : editingModel ? 'ذخیره تغییرات' : 'ایجاد مدل'}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>

      <TaavDialog open={transactionsOpen} onOpenChange={(open) => setTransactionsOpen(open)}>
        <TaavDialogContent size="lg" contentClassName="ai-lab-dialog max-h-[min(90vh,680px)] overflow-y-auto">
          <TaavDialogHeader>
            <TaavDialogTitle>تراکنش‌های اعتبار</TaavDialogTitle>
            <TaavDialogDescription>خرید اعتبار و اصلاح دستی را ثبت کنید. رکوردها ویرایش‌پذیر نیستند.</TaavDialogDescription>
          </TaavDialogHeader>

          <div className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <TaavButton iconStart={<Plus className="h-4 w-4" />} onClick={openCreateTransaction}>
                ثبت تراکنش
              </TaavButton>
              <TaavButton variant="secondary" onClick={() => void loadTransactions()} disabled={txLoading}>
                {txLoading ? 'در حال بارگذاری...' : 'به‌روزرسانی'}
              </TaavButton>
            </div>

            {txError ? <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">{txError}</p> : null}

            <div className="overflow-x-auto">
              <table className="ai-lab-settings-table">
                <thead>
                  <tr>
                    <th>نوع</th>
                    <th>USD</th>
                    <th>تومان</th>
                    <th>تاریخ</th>
                    <th>توضیحات</th>
                    <th>وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td>{t.transactionType}</td>
                      <td dir="ltr">{formatUsd(t.amountUsd)}</td>
                      <td>{formatFaNumber(t.amountToman)}</td>
                      <td>{formatFaDateTime(t.transactionAt)}</td>
                      <td>{t.description ?? '—'}</td>
                      <td>
                        <TaavBadge tone={t.isDeleted ? 'neutral' : 'success'} variant="soft" size="sm">
                          {t.isDeleted ? 'حذف‌شده' : 'فعال'}
                        </TaavBadge>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                        {txLoading ? '...' : 'تراکنشی ثبت نشده است.'}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </TaavDialogContent>
      </TaavDialog>

      <TaavDialog open={txFormOpen} onOpenChange={(open) => (open ? setTxFormOpen(true) : closeCreateTransaction())}>
        <TaavDialogContent size="md" contentClassName="ai-lab-dialog max-h-[min(90vh,620px)] overflow-y-auto">
          <TaavDialogHeader>
            <TaavDialogTitle>ثبت تراکنش</TaavDialogTitle>
            <TaavDialogDescription>برای اصلاح دستی، توضیحات اجباری است.</TaavDialogDescription>
          </TaavDialogHeader>

          <div className="grid gap-3">
            <TaavFieldBlock label="نوع تراکنش" required>
              <TaavChoiceChipGroup
                ariaLabel="نوع تراکنش"
                options={[
                  { label: 'خرید', value: 'PURCHASE' },
                  { label: 'اصلاح دستی', value: 'MANUAL_ADJUSTMENT' },
                ]}
                value={txForm.transactionType}
                onValueChange={(value) => {
                  const next = Array.isArray(value) ? value[0] : value;
                  if (!next) return;
                  setTxForm((c) => ({ ...c, transactionType: next as any }));
                }}
                size="sm"
                tone="brand"
                gap="sm"
                wrap={false}
              />
            </TaavFieldBlock>
            <div className="grid gap-3 sm:grid-cols-2">
              <TaavFieldBlock label="مبلغ دلار" required htmlFor="tx-usd">
                <TaavInput id="tx-usd" type="number" step="0.000001" value={txForm.amountUsd} onChange={(e) => setTxForm((c) => ({ ...c, amountUsd: e.target.value }))} dir="ltr" />
              </TaavFieldBlock>
              <TaavFieldBlock label="مبلغ تومان" required htmlFor="tx-toman">
                <TaavInput id="tx-toman" type="number" step="1" value={txForm.amountToman} onChange={(e) => setTxForm((c) => ({ ...c, amountToman: e.target.value }))} dir="ltr" />
              </TaavFieldBlock>
            </div>
            <TaavFieldBlock label="تاریخ تراکنش" required htmlFor="tx-at">
              <TaavInput id="tx-at" type="datetime-local" value={txForm.transactionAt} onChange={(e) => setTxForm((c) => ({ ...c, transactionAt: e.target.value }))} dir="ltr" />
            </TaavFieldBlock>
            <TaavFieldBlock label="توضیحات" required={txForm.transactionType === 'MANUAL_ADJUSTMENT'} htmlFor="tx-desc">
              <TaavTextarea id="tx-desc" rows={3} value={txForm.description} onChange={(e) => setTxForm((c) => ({ ...c, description: e.target.value }))} />
            </TaavFieldBlock>
            {txError ? <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">{txError}</p> : null}
          </div>

          <TaavDialogFooter>
            <TaavButton variant="secondary" onClick={closeCreateTransaction} disabled={txSaving}>
              انصراف
            </TaavButton>
            <TaavButton onClick={submitTransaction} disabled={txSaving}>
              {txSaving ? 'در حال ثبت...' : 'ثبت'}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>

      <TaavDialog open={pricingOpen} onOpenChange={(open) => setPricingOpen(open)}>
        <TaavDialogContent size="lg" contentClassName="ai-lab-dialog ai-lab-dialog--scroll ai-lab-pricing-dialog">
          <TaavDialogHeader>
            <TaavDialogTitle>قیمت‌گذاری مدل</TaavDialogTitle>
            <TaavDialogDescription>
              {pricingModel ? (
                <>
                  {pricingModel.name} <span className="font-mono text-[var(--taav-text-muted)]">({pricingModel.providerModelId})</span>
                </>
              ) : null}
            </TaavDialogDescription>
          </TaavDialogHeader>

          <div className="ai-lab-dialog-scroll ai-lab-pricing-dialog-body">
            {pricingError ? (
              <p className="m-0 rounded-[12px] border border-[color:var(--taav-danger-border)] bg-[var(--taav-danger-soft)] px-3 py-2 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">
                {pricingError}
              </p>
            ) : null}

            <section className="ai-lab-pricing-section">
              <div className="ai-lab-pricing-section-header">
                <div className="grid gap-1">
                  <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">تاریخچه دوره‌ها</strong>
                  <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                    دوره‌های قبلی و دوره فعال مدل
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <TaavButton size="sm" variant="secondary" onClick={() => pricingModel && void openPricing(pricingModel)} disabled={pricingLoading}>
                    {pricingLoading ? '...' : 'به‌روزرسانی'}
                  </TaavButton>
                  <TaavButton size="sm" variant="secondary" onClick={endCurrentPricing} disabled={pricingEndSaving}>
                    {pricingEndSaving ? '...' : 'بستن دوره فعال'}
                  </TaavButton>
                </div>
              </div>

              {pricingLoading ? (
                <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">در حال بارگذاری دوره‌ها...</p>
              ) : pricings.length === 0 ? (
                <p className="m-0 rounded-[12px] border border-dashed border-[color:var(--taav-border-subtle)] px-3 py-4 text-center text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                  هنوز دوره قیمت‌گذاری ثبت نشده است.
                </p>
              ) : (
                <div className="ai-lab-pricing-history-list">
                  {pricings.map((period) => {
                    const activeItems = (period.priceItems ?? []).filter((item: any) => !item.isDeleted);
                    const isActive = period.effectiveTo == null && period.isDeleted === false;

                    return (
                      <article key={period.id} className={`ai-lab-pricing-history-item${isActive ? ' is-active' : ''}`}>
                        <div className="ai-lab-pricing-history-item-header">
                          <div className="grid gap-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">
                                {isActive ? 'دوره فعال' : 'دوره بسته‌شده'}
                              </strong>
                              {isActive ? (
                                <TaavBadge tone="success" variant="soft" size="sm">
                                  فعال
                                </TaavBadge>
                              ) : null}
                            </div>
                            <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                              از {formatFaDateTime(period.effectiveFrom)}
                              {period.effectiveTo ? ` تا ${formatFaDateTime(period.effectiveTo)}` : ' · بدون پایان'}
                            </span>
                          </div>
                        </div>
                        {activeItems.length > 0 ? (
                          <ul className="ai-lab-pricing-price-rows">
                            {activeItems.map((item: any) => (
                              <li key={item.id} className="ai-lab-pricing-price-row">
                                <span className="ai-lab-pricing-price-row-label">{metricLabel(item.usageMetricType)}</span>
                                <span className="ai-lab-pricing-price-row-value">{formatPricingItemSummary(item)}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">بدون آیتم قیمت</span>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="ai-lab-pricing-section">
              <div className="grid gap-1">
                <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">ثبت دوره جدید</strong>
                <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                  فقط آیتم‌هایی با قیمت بزرگ‌تر از صفر ذخیره می‌شوند.
                </span>
              </div>

              <TaavFieldBlock label="شروع اعتبار از" required htmlFor="pricing-from" hint="تقویم مرورگر میلادی است؛ پس از انتخاب، تاریخ شمسی زیر نمایش داده می‌شود.">
                <TaavInput
                  id="pricing-from"
                  type="datetime-local"
                  value={pricingForm.effectiveFrom}
                  onChange={(e) => setPricingForm((current) => ({ ...current, effectiveFrom: e.target.value }))}
                  dir="ltr"
                  inputClassName="ai-lab-pricing-datetime-input"
                />
                {formatLocalDateTimePreview(pricingForm.effectiveFrom) ? (
                  <p className="ai-lab-pricing-datetime-preview">
                    شروع دوره: {formatLocalDateTimePreview(pricingForm.effectiveFrom)}
                  </p>
                ) : null}
              </TaavFieldBlock>

              <div className="ai-lab-pricing-form-table-wrap">
                <table className="ai-lab-pricing-form-table">
                  <thead>
                    <tr>
                      <th>معیار مصرف</th>
                      <th>مقدار واحد</th>
                      <th>قیمت (دلار)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pricingForm.items
                      .map((item, idx) => ({ item, idx }))
                      .filter(({ item }) => showAdvancedPricingMetrics || PRIMARY_PRICING_METRICS.includes(item.usageMetricType))
                      .map(({ item, idx }) => (
                        <tr key={item.usageMetricType}>
                          <td>
                            <div className="ai-lab-pricing-form-metric">
                              <span>{AI_PROVIDER_USAGE_METRIC_LABELS_V2[item.usageMetricType]}</span>
                              <small>{AI_PROVIDER_USAGE_UNIT_LABELS_V2[item.usageUnitType]}</small>
                            </div>
                          </td>
                          <td>
                            <TaavInput
                              id={`uq-${idx}`}
                              type="number"
                              min="0"
                              step="0.000001"
                              value={item.unitQuantity}
                              onChange={(e) =>
                                setPricingForm((current) => {
                                  const items = [...current.items];
                                  items[idx] = { ...items[idx], unitQuantity: e.target.value };
                                  return { ...current, items };
                                })
                              }
                              dir="ltr"
                              inputClassName="ai-lab-pricing-form-input"
                            />
                          </td>
                          <td>
                            <TaavInput
                              id={`p-${idx}`}
                              type="number"
                              min="0"
                              step="0.000001"
                              value={item.priceUsd}
                              onChange={(e) =>
                                setPricingForm((current) => {
                                  const items = [...current.items];
                                  items[idx] = { ...items[idx], priceUsd: e.target.value };
                                  return { ...current, items };
                                })
                              }
                              dir="ltr"
                              placeholder="0"
                              inputClassName="ai-lab-pricing-form-input"
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                className="ai-lab-pricing-metric-toggle"
                onClick={() => setShowAdvancedPricingMetrics((current) => !current)}
              >
                {showAdvancedPricingMetrics ? 'پنهان کردن معیارهای پیشرفته' : 'نمایش معیارهای پیشرفته (تصویر، صوت، صفحه و ...)'}
              </button>
            </section>
          </div>

          <TaavDialogFooter className="ai-lab-pricing-dialog-footer">
            <TaavButton onClick={createPricing} disabled={pricingSaving}>
              {pricingSaving ? 'در حال ثبت...' : 'ثبت دوره جدید'}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
    </div>
  );
}

