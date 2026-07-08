'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleCheck, MoreVertical, Pencil, Plus, Power, Shield, Trash2 } from 'lucide-react';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';
import { TaavEmptyState } from '@repo/ui/taav/data-display';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import {
  TaavDropdown,
  TaavDropdownContent,
  TaavDropdownItem,
  TaavDropdownSeparator,
  TaavDropdownTrigger,
} from '@repo/ui/taav';
import {
  TaavCheckbox,
  TaavChoiceChipGroup,
  TaavFieldBlock,
  TaavInput,
  TaavTextarea,
} from '@repo/ui/taav/forms';
import { formatUsd } from '@/app/lib/global-settings-mock';
import { formatCostUsd, usdToTomanCost } from '@/app/lib/ai-usage-cost';
import { formatCostToman } from '@/app/lib/ocr-ai-pricing';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import {
  AI_PROVIDER_MODEL_TYPE_LABELS,
  AI_PROVIDER_MODEL_TYPES,
  AI_PROVIDER_PRICING_UNIT_LABELS,
  AI_PROVIDER_PRICING_UNITS,
  type AiProviderAccountDetail,
  type AiProviderModelPublic,
  type AiProviderModelType,
  type AiProviderPricingUnit,
} from '@/app/lib/types/ai-provider-models';
import { AiLabLabelWithTooltip, AiLabTooltipIcon } from '@/components/AiLabTooltip';

type AiAccountModelsClientProps = {
  accountId: string;
  initialDetail: AiProviderAccountDetail;
  usdToToman: number;
};

type ModelFormState = {
  displayName: string;
  providerModelName: string;
  modelType: AiProviderModelType;
  pricingUnit: AiProviderPricingUnit;
  inputTokenPriceUsd: string;
  outputTokenPriceUsd: string;
  requestPriceUsd: string;
  pagePriceUsd: string;
  imagePriceUsd: string;
  minutePriceUsd: string;
  supportsPersian: boolean;
  supportsEnglish: boolean;
  supportsVision: boolean;
  supportsPdf: boolean;
  supportsImage: boolean;
  supportsStructuredExtraction: boolean;
  supportsEmbedding: boolean;
  supportsFunctionCalling: boolean;
  maxInputTokens: string;
  maxOutputTokens: string;
  isDefaultForChat: boolean;
  isDefaultForOcr: boolean;
  isDefaultForEmbedding: boolean;
  isDefaultForVision: boolean;
  notes: string;
  isActive: boolean;
};

const EMPTY_FORM: ModelFormState = {
  displayName: '',
  providerModelName: '',
  modelType: 'CHAT',
  pricingUnit: 'TOKEN',
  inputTokenPriceUsd: '0',
  outputTokenPriceUsd: '0',
  requestPriceUsd: '0',
  pagePriceUsd: '0',
  imagePriceUsd: '0',
  minutePriceUsd: '0',
  supportsPersian: true,
  supportsEnglish: true,
  supportsVision: false,
  supportsPdf: false,
  supportsImage: false,
  supportsStructuredExtraction: false,
  supportsEmbedding: false,
  supportsFunctionCalling: false,
  maxInputTokens: '',
  maxOutputTokens: '',
  isDefaultForChat: false,
  isDefaultForOcr: false,
  isDefaultForEmbedding: false,
  isDefaultForVision: false,
  notes: '',
  isActive: true,
};

const MODEL_TYPE_OPTIONS = AI_PROVIDER_MODEL_TYPES.map((value) => ({
  label: AI_PROVIDER_MODEL_TYPE_LABELS[value],
  value,
}));

const PRICING_UNIT_OPTIONS = AI_PROVIDER_PRICING_UNITS.map((value) => ({
  label: AI_PROVIDER_PRICING_UNIT_LABELS[value],
  value,
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

function formatPrice(value: number) {
  return value > 0 ? formatUsd(value) : '—';
}

function formatTokenPriceCell(value: number, usdToToman: number) {
  if (value <= 0) return '—';

  return (
    <div className="ai-lab-model-price-cell">
      <span dir="ltr">{formatUsd(value)}</span>
      <span className="ai-lab-settings-price-toman">{formatCostToman(usdToTomanCost(value, usdToToman))}</span>
    </div>
  );
}

function formatMaybeUsd(value: number) {
  return value > 0 ? formatUsd(value) : '—';
}

function toFormState(model: AiProviderModelPublic): ModelFormState {
  return {
    displayName: model.displayName,
    providerModelName: model.providerModelName,
    modelType: model.modelType,
    pricingUnit: model.pricingUnit,
    inputTokenPriceUsd: String(model.inputTokenPriceUsd),
    outputTokenPriceUsd: String(model.outputTokenPriceUsd),
    requestPriceUsd: String(model.requestPriceUsd),
    pagePriceUsd: String(model.pagePriceUsd),
    imagePriceUsd: String(model.imagePriceUsd),
    minutePriceUsd: String(model.minutePriceUsd),
    supportsPersian: model.supportsPersian,
    supportsEnglish: model.supportsEnglish,
    supportsVision: model.supportsVision,
    supportsPdf: model.supportsPdf,
    supportsImage: model.supportsImage,
    supportsStructuredExtraction: model.supportsStructuredExtraction,
    supportsEmbedding: model.supportsEmbedding,
    supportsFunctionCalling: model.supportsFunctionCalling,
    maxInputTokens: model.maxInputTokens ? String(model.maxInputTokens) : '',
    maxOutputTokens: model.maxOutputTokens ? String(model.maxOutputTokens) : '',
    isDefaultForChat: model.isDefaultForChat,
    isDefaultForOcr: model.isDefaultForOcr,
    isDefaultForEmbedding: model.isDefaultForEmbedding,
    isDefaultForVision: model.isDefaultForVision,
    notes: model.notes ?? '',
    isActive: model.isActive,
  };
}

function buildCapabilities(model: AiProviderModelPublic) {
  const items: string[] = [];
  if (model.supportsPersian) items.push('فارسی');
  if (model.supportsEnglish) items.push('انگلیسی');
  if (model.supportsVision) items.push('بینایی');
  if (model.supportsPdf) items.push('PDF');
  if (model.supportsImage) items.push('تصویر');
  if (model.supportsStructuredExtraction) items.push('استخراج');
  if (model.supportsEmbedding) items.push('امبدینگ');
  if (model.supportsFunctionCalling) items.push('Function');
  return items;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="m-0 border-b border-[color:rgba(148,163,184,0.14)] pb-2 text-[length:var(--taav-text-sm)] font-black text-[var(--taav-text-strong)]">
      {children}
    </h3>
  );
}

export function AiAccountModelsClient({ accountId, initialDetail, usdToToman }: AiAccountModelsClientProps) {
  const [detail, setDetail] = useState(initialDetail);
  const [listError, setListError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AiProviderModelPublic | null>(null);
  const [form, setForm] = useState<ModelFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const formInputPerToken = Number(form.inputTokenPriceUsd) || 0;
  const formOutputPerToken = Number(form.outputTokenPriceUsd) || 0;
  const previewInputCostUsd = formInputPerToken * 1000;
  const previewOutputCostUsd = formOutputPerToken * 1000;

  const summaryCards = useMemo(
    () => [
      { label: 'نام اکانت', value: detail.account.name },
      { label: 'Provider', value: detail.account.providerLabel },
      { label: 'وضعیت', value: detail.account.isActive ? 'فعال' : 'غیرفعال' },
      { label: 'API Key', value: detail.account.apiKeyMasked, mono: true },
      { label: 'اعتبار خریداری‌شده', value: formatUsd(detail.account.purchasedCreditUsd) },
      { label: 'مصرف‌شده', value: formatUsd(detail.account.usedCreditUsd) },
      { label: 'باقی‌مانده', value: formatUsd(detail.account.remainingCreditUsd) },
      { label: 'مدل‌های فعال', value: formatFaNumber(detail.account.activeModelCount) },
      { label: 'کل مدل‌ها', value: formatFaNumber(detail.account.totalModelCount) },
    ],
    [detail.account],
  );

  const refreshDetail = async () => {
    setListError(null);
    const response = await fetch(`/api/settings/ai-accounts/${accountId}/models`);
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
      models?: AiProviderModelPublic[];
    } | null;

    if (!response.ok || !payload?.models) {
      setListError(payload?.message ?? 'بارگذاری مدل‌ها انجام نشد.');
      return;
    }

    const activeModelCount = payload.models.filter((model) => model.isActive).length;
    setDetail((current) => ({
      ...current,
      models: payload.models!,
      account: {
        ...current.account,
        totalModelCount: payload.models!.length,
        activeModelCount,
      },
    }));
  };

  const openCreateDialog = () => {
    setEditingModel(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (model: AiProviderModelPublic) => {
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
      displayName: form.displayName.trim(),
      providerModelName: form.providerModelName.trim(),
      modelType: form.modelType,
      pricingUnit: form.pricingUnit,
      inputTokenPriceUsd: Number(form.inputTokenPriceUsd),
      outputTokenPriceUsd: Number(form.outputTokenPriceUsd),
      requestPriceUsd: Number(form.requestPriceUsd),
      pagePriceUsd: Number(form.pagePriceUsd),
      imagePriceUsd: Number(form.imagePriceUsd),
      minutePriceUsd: Number(form.minutePriceUsd),
      supportsPersian: form.supportsPersian,
      supportsEnglish: form.supportsEnglish,
      supportsVision: form.supportsVision,
      supportsPdf: form.supportsPdf,
      supportsImage: form.supportsImage,
      supportsStructuredExtraction: form.supportsStructuredExtraction,
      supportsEmbedding: form.supportsEmbedding,
      supportsFunctionCalling: form.supportsFunctionCalling,
      maxInputTokens: form.maxInputTokens.trim() ? Number(form.maxInputTokens) : null,
      maxOutputTokens: form.maxOutputTokens.trim() ? Number(form.maxOutputTokens) : null,
      isDefaultForChat: form.isDefaultForChat,
      isDefaultForOcr: form.isDefaultForOcr,
      isDefaultForEmbedding: form.isDefaultForEmbedding,
      isDefaultForVision: form.isDefaultForVision,
      notes: form.notes.trim() || null,
      isActive: form.isActive,
    };

    if (!payload.displayName || !payload.providerModelName) {
      setFormError('نام نمایشی و نام مدل در Provider الزامی است.');
      setFormLoading(false);
      return;
    }

    try {
      const response = await fetch(
        editingModel
          ? `/api/settings/ai-accounts/${accountId}/models/${editingModel.id}`
          : `/api/settings/ai-accounts/${accountId}/models`,
        {
          method: editingModel ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setFormError(result?.message ?? 'ذخیره مدل انجام نشد.');
        return;
      }

      setActionFeedback(editingModel ? 'مدل با موفقیت به‌روزرسانی شد.' : 'مدل جدید با موفقیت ایجاد شد.');
      closeDialog();
      await refreshDetail();
    } catch {
      setFormError('ذخیره مدل انجام نشد.');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleStatus = async (model: AiProviderModelPublic) => {
    setActionFeedback(null);
    const response = await fetch(
      `/api/settings/ai-accounts/${accountId}/models/${model.id}/toggle-status`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !model.isActive }),
      },
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setListError(payload?.message ?? 'تغییر وضعیت انجام نشد.');
      return;
    }

    setActionFeedback(model.isActive ? 'مدل غیرفعال شد.' : 'مدل فعال شد.');
    await refreshDetail();
  };

  const deleteModel = async (model: AiProviderModelPublic) => {
    if (model.isSystem) return;

    const confirmed = window.confirm(`آیا مطمئن هستید که می‌خواهید مدل «${model.displayName}» را حذف کنید؟`);
    if (!confirmed) return;

    setActionFeedback(null);
    const response = await fetch(`/api/settings/ai-accounts/${accountId}/models/${model.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setListError(payload?.message ?? 'حذف مدل انجام نشد.');
      return;
    }

    setActionFeedback('مدل حذف شد.');
    await refreshDetail();
  };

  return (
    <div className="business-settings-page-shell" dir="rtl" lang="fa">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
            {detail.account.name}
            {detail.account.isSystem ? ' · اکانت سیستمی' : ''}
          </span>
          <h1 className="m-0 inline-flex items-center gap-2 text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">
            مدل‌ها و قیمت‌گذاری
            <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.settings.aiAccountModelsPage} label="راهنمای مدل‌ها" />
          </h1>
          <p className="m-0 max-w-3xl text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
            مدیریت مدل‌های قابل استفاده، قابلیت‌ها و تعرفه مصرف برای این اکانت هوش مصنوعی.
          </p>
        </div>
        <Link href="/settings/ai-accounts">
          <TaavButton variant="secondary" iconStart={<ArrowRight className="h-4 w-4" />}>
            بازگشت به اکانت‌ها
          </TaavButton>
        </Link>
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
              مدل‌هایی که برای این Provider قابل استفاده هستند را تعریف کنید. این اطلاعات بعداً برای انتخاب Provider، کنترل هزینه و گزارش مصرف استفاده می‌شود.
            </p>
            <p className="m-0 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
              انتخاب Provider و مدل در سطح backend داخلی است و مصرف‌کنندگان بیرونی مستقیماً استراتژی داخلی را نمی‌بینند.
            </p>
          </div>
          <TaavButton iconStart={<Plus className="h-4 w-4" />} onClick={openCreateDialog}>
            افزودن مدل
          </TaavButton>
        </div>

        {detail.models.length === 0 ? (
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
            {detail.models.map((model) => {
              const capabilities = buildCapabilities(model);
              return (
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
                          {model.displayName}
                        </h3>
                        {model.isSystem ? (
                          <TaavBadge tone="info" variant="soft" size="sm">
                            <span className="ai-lab-system-badge">
                              <Shield className="h-3 w-3" />
                              سیستمی
                            </span>
                          </TaavBadge>
                        ) : null}
                        {model.isDefaultForChat ? <TaavBadge tone="info" variant="soft" size="sm">پیش‌فرض Chat</TaavBadge> : null}
                        {model.isDefaultForOcr ? <TaavBadge tone="info" variant="soft" size="sm">پیش‌فرض OCR</TaavBadge> : null}
                        {model.isDefaultForEmbedding ? <TaavBadge tone="info" variant="soft" size="sm">پیش‌فرض Embedding</TaavBadge> : null}
                        {model.isDefaultForVision ? <TaavBadge tone="info" variant="soft" size="sm">پیش‌فرض Vision</TaavBadge> : null}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                        <span className="font-mono" dir="ltr">
                          {model.providerModelName}
                        </span>
                        <span>•</span>
                        <TaavBadge tone="brand" variant="soft" size="sm">
                          {model.modelTypeLabel}
                        </TaavBadge>
                        <TaavBadge tone="neutral" variant="soft" size="sm">
                          {model.pricingUnitLabel}
                        </TaavBadge>
                        <TaavBadge tone={model.isActive ? 'success' : 'neutral'} variant="soft" size="sm">
                          <span className="inline-flex items-center gap-1">
                            <CircleCheck className="h-3.5 w-3.5" />
                            {model.isActive ? 'فعال' : 'غیرفعال'}
                          </span>
                        </TaavBadge>
                      </div>
                    </div>

                    <TaavDropdown>
                      <TaavDropdownTrigger asChild>
                        <button type="button" className="ai-lab-admin-user-menu" aria-label={`اکشن‌های مدل ${model.displayName}`}>
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </TaavDropdownTrigger>
                      <TaavDropdownContent align="end">
                        <TaavDropdownItem iconStart={<Pencil className="h-4 w-4" />} onSelect={() => openEditDialog(model)}>
                          ویرایش
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

                  <div className="mt-4 grid gap-3">
                    <div className="grid grid-cols-2 gap-3 rounded-[14px] border border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface-raised)] p-3">
                      <div className="grid gap-1">
                        <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">قیمت ورودی (هر توکن)</span>
                        <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">
                          {formatTokenPriceCell(model.inputTokenPriceUsd, usdToToman)}
                        </strong>
                      </div>
                      <div className="grid gap-1">
                        <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">قیمت خروجی (هر توکن)</span>
                        <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">
                          {formatTokenPriceCell(model.outputTokenPriceUsd, usdToToman)}
                        </strong>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                      <div className="grid gap-1">
                        <span>درخواست</span>
                        <span className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]" dir="ltr">
                          {formatMaybeUsd(model.requestPriceUsd)}
                        </span>
                      </div>
                      <div className="grid gap-1">
                        <span>صفحه</span>
                        <span className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]" dir="ltr">
                          {formatMaybeUsd(model.pagePriceUsd)}
                        </span>
                      </div>
                      <div className="grid gap-1">
                        <span>تصویر/دقیقه</span>
                        <span className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]" dir="ltr">
                          {formatMaybeUsd(model.imagePriceUsd) !== '—' ? formatMaybeUsd(model.imagePriceUsd) : formatMaybeUsd(model.minutePriceUsd)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {capabilities.length > 0 ? (
                        capabilities.map((item) => (
                          <TaavBadge key={item} tone="neutral" variant="soft" size="sm">
                            {item}
                          </TaavBadge>
                        ))
                      ) : (
                        <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">بدون قابلیت خاص</span>
                      )}
                    </div>

                    <div className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                      آخرین بروزرسانی: {formatFaDateTime(model.updatedAt)}
                    </div>
                  </div>
                </TaavCard>
              );
            })}
          </div>
        )}
      </TaavCard>

      <TaavDialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <TaavDialogContent size="lg" contentClassName="ai-lab-dialog ai-lab-dialog--scroll">
          <TaavDialogHeader>
            <TaavDialogTitle>{editingModel ? 'ویرایش مدل' : 'افزودن مدل'}</TaavDialogTitle>
            <TaavDialogDescription>
              قیمت‌ها به ازای هر ۱ توکن وارد می‌شوند. هزینه واقعی مصرف دقیقاً بر اساس تعداد توکن ورودی و خروجی محاسبه می‌شود.
            </TaavDialogDescription>
          </TaavDialogHeader>

          <div className="ai-lab-dialog-scroll grid gap-5">
            <section className="grid gap-4">
              <SectionTitle>اطلاعات مدل</SectionTitle>
              <TaavFieldBlock label={<AiLabLabelWithTooltip label="نام نمایشی مدل" tooltip={AI_LAB_TOOLTIPS.settings.aiModelDisplayName} required />} required htmlFor="model-display-name">
                <TaavInput id="model-display-name" value={form.displayName} onChange={(e) => setForm((c) => ({ ...c, displayName: e.target.value }))} placeholder="GPT-4.1 Mini" />
              </TaavFieldBlock>
              <TaavFieldBlock label={<AiLabLabelWithTooltip label="نام مدل در Provider" tooltip={AI_LAB_TOOLTIPS.settings.aiModelProviderName} required />} required htmlFor="model-provider-name">
                <TaavInput id="model-provider-name" value={form.providerModelName} onChange={(e) => setForm((c) => ({ ...c, providerModelName: e.target.value }))} placeholder="gpt-4.1-mini" dir="ltr" />
              </TaavFieldBlock>
              <TaavFieldBlock label={<AiLabLabelWithTooltip label="نوع مدل" tooltip={AI_LAB_TOOLTIPS.settings.aiModelType} required />} required>
                <TaavChoiceChipGroup ariaLabel="نوع مدل" options={MODEL_TYPE_OPTIONS} value={form.modelType} onValueChange={(value) => { const next = Array.isArray(value) ? value[0] : value; if (next) setForm((c) => ({ ...c, modelType: next as AiProviderModelType })); }} size="sm" tone="brand" gap="sm" wrap />
              </TaavFieldBlock>
              <TaavFieldBlock label={<AiLabLabelWithTooltip label="واحد قیمت‌گذاری" tooltip={AI_LAB_TOOLTIPS.settings.aiModelPricingUnit} required />} required>
                <TaavChoiceChipGroup ariaLabel="واحد قیمت‌گذاری" options={PRICING_UNIT_OPTIONS} value={form.pricingUnit} onValueChange={(value) => { const next = Array.isArray(value) ? value[0] : value; if (next) setForm((c) => ({ ...c, pricingUnit: next as AiProviderPricingUnit })); }} size="sm" tone="brand" gap="sm" wrap />
              </TaavFieldBlock>
            </section>

            <section className="grid gap-4">
              <SectionTitle>قیمت‌گذاری</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <TaavFieldBlock label={<AiLabLabelWithTooltip label="قیمت هر ۱ توکن ورودی (USD)" tooltip={AI_LAB_TOOLTIPS.settings.aiModelInputPrice} />} htmlFor="model-input-price">
                  <TaavInput id="model-input-price" type="number" min="0" step="0.000000001" value={form.inputTokenPriceUsd} onChange={(e) => setForm((c) => ({ ...c, inputTokenPriceUsd: e.target.value }))} dir="ltr" />
                </TaavFieldBlock>
                <TaavFieldBlock label={<AiLabLabelWithTooltip label="قیمت هر ۱ توکن خروجی (USD)" tooltip={AI_LAB_TOOLTIPS.settings.aiModelOutputPrice} />} htmlFor="model-output-price">
                  <TaavInput id="model-output-price" type="number" min="0" step="0.000000001" value={form.outputTokenPriceUsd} onChange={(e) => setForm((c) => ({ ...c, outputTokenPriceUsd: e.target.value }))} dir="ltr" />
                </TaavFieldBlock>
                <TaavFieldBlock label="قیمت هر درخواست" htmlFor="model-request-price">
                  <TaavInput id="model-request-price" type="number" min="0" step="0.000001" value={form.requestPriceUsd} onChange={(e) => setForm((c) => ({ ...c, requestPriceUsd: e.target.value }))} dir="ltr" />
                </TaavFieldBlock>
                <TaavFieldBlock label="قیمت هر صفحه" htmlFor="model-page-price">
                  <TaavInput id="model-page-price" type="number" min="0" step="0.000001" value={form.pagePriceUsd} onChange={(e) => setForm((c) => ({ ...c, pagePriceUsd: e.target.value }))} dir="ltr" />
                </TaavFieldBlock>
                <TaavFieldBlock label="قیمت هر تصویر" htmlFor="model-image-price">
                  <TaavInput id="model-image-price" type="number" min="0" step="0.000001" value={form.imagePriceUsd} onChange={(e) => setForm((c) => ({ ...c, imagePriceUsd: e.target.value }))} dir="ltr" />
                </TaavFieldBlock>
                <TaavFieldBlock label="قیمت هر دقیقه" htmlFor="model-minute-price">
                  <TaavInput id="model-minute-price" type="number" min="0" step="0.000001" value={form.minutePriceUsd} onChange={(e) => setForm((c) => ({ ...c, minutePriceUsd: e.target.value }))} dir="ltr" />
                </TaavFieldBlock>
              </div>
              <div className="rounded-[14px] border border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface-raised)] p-4">
                <p className="m-0 mb-2 text-[length:var(--taav-text-sm)] font-bold text-[var(--taav-text-strong)]">پیش‌نمایش هزینه (۱۰۰۰ توکن)</p>
                <div className="grid gap-2 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                  <p className="m-0">
                    ورودی: <strong className="text-[var(--taav-text-strong)]" dir="ltr">{formatCostUsd(previewInputCostUsd)}</strong>
                    {' · '}
                    <strong className="text-[var(--taav-text-strong)]">{formatCostToman(usdToTomanCost(previewInputCostUsd, usdToToman))}</strong>
                  </p>
                  <p className="m-0">
                    خروجی: <strong className="text-[var(--taav-text-strong)]" dir="ltr">{formatCostUsd(previewOutputCostUsd)}</strong>
                    {' · '}
                    <strong className="text-[var(--taav-text-strong)]">{formatCostToman(usdToTomanCost(previewOutputCostUsd, usdToToman))}</strong>
                  </p>
                </div>
              </div>
            </section>

            <section className="grid gap-3">
              <SectionTitle>قابلیت‌ها</SectionTitle>
              <div className="grid gap-2 sm:grid-cols-2">
                <TaavCheckbox label="پشتیبانی از فارسی" checked={form.supportsPersian} onChange={(e) => setForm((c) => ({ ...c, supportsPersian: e.target.checked }))} />
                <TaavCheckbox label="پشتیبانی از انگلیسی" checked={form.supportsEnglish} onChange={(e) => setForm((c) => ({ ...c, supportsEnglish: e.target.checked }))} />
                <TaavCheckbox label="پشتیبانی از تصویر" checked={form.supportsVision} onChange={(e) => setForm((c) => ({ ...c, supportsVision: e.target.checked }))} />
                <TaavCheckbox label="پشتیبانی از PDF" checked={form.supportsPdf} onChange={(e) => setForm((c) => ({ ...c, supportsPdf: e.target.checked }))} />
                <TaavCheckbox label="پشتیبانی از فایل تصویری" checked={form.supportsImage} onChange={(e) => setForm((c) => ({ ...c, supportsImage: e.target.checked }))} />
                <TaavCheckbox label="استخراج ساخت‌یافته" checked={form.supportsStructuredExtraction} onChange={(e) => setForm((c) => ({ ...c, supportsStructuredExtraction: e.target.checked }))} />
                <TaavCheckbox label="امبدینگ" checked={form.supportsEmbedding} onChange={(e) => setForm((c) => ({ ...c, supportsEmbedding: e.target.checked }))} />
                <TaavCheckbox label="Function Calling" checked={form.supportsFunctionCalling} onChange={(e) => setForm((c) => ({ ...c, supportsFunctionCalling: e.target.checked }))} />
              </div>
            </section>

            <section className="grid gap-4">
              <SectionTitle>محدودیت‌ها و پیش‌فرض‌ها</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <TaavFieldBlock label="حداکثر توکن ورودی" htmlFor="model-max-input">
                  <TaavInput id="model-max-input" type="number" min="0" value={form.maxInputTokens} onChange={(e) => setForm((c) => ({ ...c, maxInputTokens: e.target.value }))} dir="ltr" />
                </TaavFieldBlock>
                <TaavFieldBlock label="حداکثر توکن خروجی" htmlFor="model-max-output">
                  <TaavInput id="model-max-output" type="number" min="0" value={form.maxOutputTokens} onChange={(e) => setForm((c) => ({ ...c, maxOutputTokens: e.target.value }))} dir="ltr" />
                </TaavFieldBlock>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <TaavCheckbox label="مدل پیش‌فرض برای Chat" checked={form.isDefaultForChat} onChange={(e) => setForm((c) => ({ ...c, isDefaultForChat: e.target.checked }))} />
                <TaavCheckbox label="مدل پیش‌فرض برای OCR" checked={form.isDefaultForOcr} onChange={(e) => setForm((c) => ({ ...c, isDefaultForOcr: e.target.checked }))} />
                <TaavCheckbox label="مدل پیش‌فرض برای Embedding" checked={form.isDefaultForEmbedding} onChange={(e) => setForm((c) => ({ ...c, isDefaultForEmbedding: e.target.checked }))} />
                <TaavCheckbox label="مدل پیش‌فرض برای Vision" checked={form.isDefaultForVision} onChange={(e) => setForm((c) => ({ ...c, isDefaultForVision: e.target.checked }))} />
              </div>
              <TaavFieldBlock label="توضیحات" htmlFor="model-notes">
                <TaavTextarea id="model-notes" rows={3} value={form.notes} onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))} />
              </TaavFieldBlock>
              <TaavFieldBlock label="وضعیت" required>
                <TaavChoiceChipGroup ariaLabel="وضعیت مدل" options={STATUS_OPTIONS} value={form.isActive ? 'active' : 'inactive'} onValueChange={(value) => { const next = Array.isArray(value) ? value[0] : value; if (next) setForm((c) => ({ ...c, isActive: next === 'active' })); }} size="sm" tone="brand" gap="sm" wrap={false} />
              </TaavFieldBlock>
            </section>

            {formError ? <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">{formError}</p> : null}
          </div>

          <TaavDialogFooter>
            <TaavButton variant="secondary" onClick={closeDialog} disabled={formLoading}>انصراف</TaavButton>
            <TaavButton onClick={submitForm} disabled={formLoading}>
              {formLoading ? 'در حال ذخیره...' : editingModel ? 'ذخیره تغییرات' : 'ایجاد مدل'}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
    </div>
  );
}
