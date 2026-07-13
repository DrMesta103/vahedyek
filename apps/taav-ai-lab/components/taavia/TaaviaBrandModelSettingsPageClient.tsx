'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  Coins,
  Database,
  Eye,
  ScanText,
  Settings2,
} from 'lucide-react';
import { TaavBadge, TaavButton } from '@repo/ui/taav/primitives';
import type {
  BrandModelSettingsPayload,
  BrandToolModelOption,
  BrandToolModelPreferences,
  BrandToolModelResolvedState,
  BrandToolModelSection,
  BrandToolModelType,
} from '@/app/lib/data';
import type { AiProviderModelBrandTag } from '@/app/lib/types/ai-provider-models';

const SECTION_ICONS: Record<string, typeof Bot> = {
  CHAT: Bot,
  OCR: ScanText,
  VISION: Eye,
  EMBEDDING: Database,
};

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: '#10a37f',
  DeepSeek: '#4d6bfe',
  'Google Gemini': '#4285f4',
  Grok: '#f5f5f5',
  'Azure OpenAI': '#0078d4',
  OpenRouter: '#6366f1',
};

function brandTagTone(tag: AiProviderModelBrandTag): 'info' | 'success' | 'warning' {
  switch (tag) {
    case 'RECOMMENDED':
      return 'info';
    case 'ECONOMICAL':
      return 'success';
    case 'PREMIUM':
      return 'warning';
    default:
      return 'info';
  }
}

function ModelBrandTagBadge({ model }: { model: BrandToolModelOption }) {
  if (!model.brandTag || !model.brandTagLabel) return null;

  return (
    <TaavBadge
      tone={brandTagTone(model.brandTag)}
      variant="soft"
      size="sm"
      unsafeClassName={`taavia-model-settings__brand-tag taavia-model-settings__brand-tag--${model.brandTag.toLowerCase()}`}
    >
      {model.brandTagLabel}
    </TaavBadge>
  );
}

function typeLead(type: BrandToolModelType) {
  switch (type) {
    case 'CHAT':
      return 'مدل گفت‌وگوی اصلی برای پاسخ‌گویی به سوالات و مکالمات.';
    case 'OCR':
      return 'مدل استخراج متن و داده از سند و تصویر برای جریان‌های OCR.';
    case 'VISION':
      return 'مدل تحلیل تصویر و ورودی‌های بصری برند.';
    case 'EMBEDDING':
      return 'مدل ساخت بردارهای معنایی و بازیابی دانش.';
    default:
      return 'مدل فعال برای این ابزار از پنل تاو ادمین خوانده می‌شود.';
  }
}

function resolveEffectiveModel(
  section: BrandToolModelSection,
  currentValue: string,
): BrandToolModelOption | null {
  if (currentValue) {
    return section.models.find((model) => model.id === currentValue) ?? null;
  }
  return section.defaultModel ?? null;
}

function resolveSelectionState(
  section: BrandToolModelSection,
  currentValue: string,
): BrandToolModelResolvedState | null {
  if (currentValue) {
    const selected = section.models.find((model) => model.id === currentValue);
    return selected ? 'override' : 'invalid-selection';
  }
  return section.defaultModel ? 'fallback-default' : null;
}

function formatCardPriceLines(model: BrandToolModelOption) {
  const usdParts = model.priceSummaryUsd.split(' / ').map((part) => {
    const spaceIndex = part.indexOf(' ');
    if (spaceIndex === -1) return { label: part, value: '' };
    return { label: part.slice(0, spaceIndex), value: part.slice(spaceIndex + 1) };
  });
  const tomanParts = model.priceSummaryToman.split(' / ').map((part) => {
    const spaceIndex = part.indexOf(' ');
    if (spaceIndex === -1) return { label: part, value: '' };
    return { label: part.slice(0, spaceIndex), value: part.slice(spaceIndex + 1) };
  });

  return {
    usd: usdParts,
    toman: tomanParts,
  };
}

type Props = {
  tenantId: string;
  brandId: string;
  initialData: BrandModelSettingsPayload;
};

export function TaaviaBrandModelSettingsPageClient({ tenantId, brandId, initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [preferences, setPreferences] = useState<BrandToolModelPreferences>(initialData.modelPreferences);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const queuedPreferencesRef = useRef<BrandToolModelPreferences | null>(null);
  const inflightPreferencesRef = useRef<BrandToolModelPreferences | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(preferences) !== JSON.stringify(data.modelPreferences),
    [data.modelPreferences, preferences],
  );

  const selectedOverridesCount = useMemo(
    () => Object.keys(preferences).length,
    [preferences],
  );

  const persistPreferences = async (nextPreferences: BrandToolModelPreferences) => {
    if (saving) {
      queuedPreferencesRef.current = nextPreferences;
      return;
    }

    inflightPreferencesRef.current = nextPreferences;
    setSaving(true);
    setError(null);
    setFeedback('در حال ذخیره تغییرات...');

    try {
      const response = await fetch(`/api/businesses/${tenantId}/taavia/brands/${brandId}/model-settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelPreferences: nextPreferences }),
      });

      const payload = (await response.json().catch(() => null)) as
        | BrandModelSettingsPayload
        | { message?: string }
        | null;

      if (!response.ok || !payload || !('sections' in payload)) {
        throw new Error((payload as { message?: string } | null)?.message ?? 'ذخیره تنظیمات مدل انجام نشد.');
      }

      setData(payload);
      setPreferences(payload.modelPreferences);
      setFeedback('تغییرات مدل برند ذخیره شد.');
    } catch (saveError) {
      setPreferences(data.modelPreferences);
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات مدل انجام نشد.');
      setFeedback(null);
    } finally {
      const queuedPreferences = queuedPreferencesRef.current;
      const inflightPreferences = inflightPreferencesRef.current;
      queuedPreferencesRef.current = null;
      inflightPreferencesRef.current = null;

      if (
        queuedPreferences &&
        JSON.stringify(queuedPreferences) !== JSON.stringify(inflightPreferences)
      ) {
        setSaving(false);
        void persistPreferences(queuedPreferences);
        return;
      }

      setSaving(false);
    }
  };

  const handleSelect = (type: BrandToolModelType, value: string) => {
    setError(null);
    setFeedback(null);
    setPreferences((current) => {
      const next = { ...current };
      if (value) {
        next[type] = value;
      } else {
        delete next[type];
      }
      void persistPreferences(next);
      return next;
    });
  };

  return (
    <div className="taavia-model-settings" dir="rtl" lang="fa">
      <div className="taavia-model-settings__shell">
        <header className="taavia-model-settings__page-header">
          <div className="taavia-model-settings__page-intro">
            <h1 className="taavia-model-settings__page-title">
              مدل‌های ابزار برند {data.brand.name}
            </h1>
            <p className="taavia-model-settings__page-subtitle">
              برای هر ابزار، مدل مورد نظر را از بین مدل‌های فعال تاو ادمین انتخاب کنید. اگر override برای برندی
              تعریف نشود، مدل پیش‌فرض ادمین برای همان ابزار اعمال خواهد شد.
            </p>
          </div>

          <div className="taavia-model-settings__page-meta">
            <InfoChip
              icon={Settings2}
              title="وضعیت override"
              value={selectedOverridesCount > 0 ? 'فعال' : 'ندارد'}
              active={selectedOverridesCount > 0}
            />
            <InfoChip
              icon={Coins}
              title="نرخ دلار"
              value={`${new Intl.NumberFormat('fa-IR').format(data.usdToToman)} تومان`}
            />
            <InfoChip
              icon={Settings2}
              title="وضعیت ثبت"
              value={saving ? 'در حال ثبت' : dirty ? 'در انتظار ثبت' : 'همگام'}
              active={saving || dirty}
            />
          </div>

          <div className="taavia-model-settings__page-actions">
            <Link href={`/businesses/${tenantId}/products/taavia/brands/${brandId}`}>
              <TaavButton variant="secondary" unsafeClassName="taavia-model-settings__back-btn" iconStart={<ArrowLeft className="h-4 w-4" />}>
                بازگشت
              </TaavButton>
            </Link>
          </div>
        </header>

        {(error || feedback) ? (
          <div className="taavia-model-settings__alerts">
            {error ? <div className="taavia-model-settings__alert taavia-model-settings__alert--error">{error}</div> : null}
            {feedback ? <div className="taavia-model-settings__alert taavia-model-settings__alert--success">{feedback}</div> : null}
          </div>
        ) : null}

        <div className="taavia-model-settings__sections">
          {data.sections.map((section) => {
            const Icon = SECTION_ICONS[section.type] ?? BrainCircuit;
            const currentValue = preferences[section.type] ?? '';
            const effectiveModel = resolveEffectiveModel(section, currentValue);
            const selectionState = resolveSelectionState(section, currentValue);
            const hasInvalidSelection = selectionState === 'invalid-selection' && Boolean(currentValue);

            return (
              <section key={section.type} className="taavia-model-settings__section">
                <div className="taavia-model-settings__section-top">
                  <div className="taavia-model-settings__section-info">
                    <div className="taavia-model-settings__section-icon">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="taavia-model-settings__section-copy">
                      <div className="taavia-model-settings__section-title-row">
                        <h2 className="taavia-model-settings__section-title">{section.typeLabel}</h2>
                        {selectionState === 'override' ? <TaavBadge tone="info" variant="soft">override</TaavBadge> : null}
                        {selectionState === 'fallback-default' ? <TaavBadge tone="neutral" variant="soft">fallback ادمین</TaavBadge> : null}
                        {selectionState === 'invalid-selection' ? <TaavBadge tone="danger" variant="soft">نامعتبر</TaavBadge> : null}
                      </div>
                      <p className="taavia-model-settings__section-desc">{typeLead(section.type)}</p>
                    </div>
                  </div>

                  <SelectedModelPanel
                    model={effectiveModel}
                    selectionState={selectionState}
                    onReset={currentValue ? () => handleSelect(section.type, '') : undefined}
                  />
                </div>

                <ModelPickerRail
                  models={section.models}
                  currentValue={currentValue}
                  effectiveModelId={effectiveModel?.id ?? null}
                  selectionState={selectionState}
                  onSelect={(modelId) => handleSelect(section.type, modelId)}
                />

                {hasInvalidSelection ? (
                  <div className="taavia-model-settings__invalid-note">
                    مدل ذخیره‌شده قبلی دیگر معتبر نیست. تا زمان انتخاب مدل جدید، fallback ادمین برای این ابزار استفاده می‌شود.
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>

        <footer className="taavia-model-settings__footer">
          قیمت‌ها بر اساس نرخ دلار فعلی محاسبه شده‌اند و ممکن است تغییر کنند. مدل‌هایی که به عنوان default ادمین
          marked شده‌اند، برای همه برندها fallback خواهند بود.
        </footer>
      </div>
    </div>
  );
}

function InfoChip({
  icon: Icon,
  title,
  value,
  active = false,
}: {
  icon: typeof Settings2;
  title: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div className="taavia-model-settings__chip">
      <div className="taavia-model-settings__chip-body">
        <span className="taavia-model-settings__chip-label">{title}</span>
        <strong className="taavia-model-settings__chip-value">
          {active ? <span className="taavia-model-settings__chip-dot" aria-hidden="true" /> : null}
          {value}
        </strong>
      </div>
      <div className="taavia-model-settings__chip-icon">
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );
}

function SelectedModelPanel({
  model,
  selectionState,
  onReset,
}: {
  model: BrandToolModelOption | null;
  selectionState: BrandToolModelResolvedState | null;
  onReset?: () => void;
}) {
  const statusLabel =
    selectionState === 'override'
      ? 'فعال'
      : selectionState === 'fallback-default'
        ? 'fallback'
        : selectionState === 'invalid-selection'
          ? 'نامعتبر'
          : '—';

  return (
    <div className="taavia-model-settings__selected-panel">
      <div className="taavia-model-settings__selected-panel-head">
        <span className="taavia-model-settings__selected-panel-label">مدل انتخاب شده</span>
        {onReset ? (
          <button type="button" className="taavia-model-settings__selected-panel-reset" onClick={onReset}>
            پیش‌فرض ادمین
          </button>
        ) : null}
      </div>

      {model ? (
        <div className="taavia-model-settings__selected-panel-body">
          <div className="taavia-model-settings__selected-panel-copy">
            <div className="taavia-model-settings__selected-panel-name-row">
              <strong className="taavia-model-settings__selected-panel-name">{model.displayName}</strong>
              <ModelBrandTagBadge model={model} />
            </div>
            <span className="taavia-model-settings__selected-panel-provider">{model.providerLabel}</span>
          </div>
          <ProviderAvatar label={model.providerLabel} />
          <span className={`taavia-model-settings__pill taavia-model-settings__pill--${selectionState === 'fallback-default' ? 'neutral' : 'brand'}`}>
            {statusLabel}
          </span>
        </div>
      ) : (
        <div className="taavia-model-settings__selected-panel-empty">مدل موثری برای این ابزار پیدا نشد.</div>
      )}
    </div>
  );
}

function ProviderAvatar({ label }: { label: string }) {
  const color = PROVIDER_COLORS[label] ?? '#64748b';
  const initial = label.trim().charAt(0).toUpperCase() || '?';

  return (
    <span
      className="taavia-model-settings__provider-avatar"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

function ModelPickerRail({
  models,
  currentValue,
  effectiveModelId,
  selectionState,
  onSelect,
}: {
  models: BrandToolModelOption[];
  currentValue: string;
  effectiveModelId: string | null;
  selectionState: BrandToolModelResolvedState | null;
  onSelect: (modelId: string) => void;
}) {
  return (
    <div className="taavia-model-settings__rail">
      {models.map((model) => {
        const selected = currentValue === model.id;
        const effective = effectiveModelId === model.id;

        return (
          <ModelPickerCard
            key={model.id}
            model={model}
            selected={selected}
            effective={effective}
            selectionState={selectionState}
            onSelect={() => onSelect(model.id)}
          />
        );
      })}
    </div>
  );
}

function ModelPickerCard({
  model,
  selected,
  effective,
  selectionState,
  onSelect,
}: {
  model: BrandToolModelOption;
  selected: boolean;
  effective: boolean;
  selectionState: BrandToolModelResolvedState | null;
  onSelect: () => void;
}) {
  const prices = formatCardPriceLines(model);
  const showStatus = selected || effective;
  const statusLabel =
    selected
      ? 'فعال'
      : selectionState === 'fallback-default' && effective
        ? 'fallback'
        : effective
          ? 'فعال'
          : '';

  const cardClass = [
    'taavia-model-settings__picker-card',
    selected ? 'taavia-model-settings__picker-card--selected' : '',
    effective && !selected ? 'taavia-model-settings__picker-card--effective' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" onClick={onSelect} className={cardClass}>
      <div className="taavia-model-settings__picker-card-head">
        <span className={`taavia-model-settings__picker-radio ${selected ? 'taavia-model-settings__picker-radio--on' : ''}`} />
        <div className="taavia-model-settings__picker-card-copy">
          <div className="taavia-model-settings__picker-card-name-row">
            <span className="taavia-model-settings__picker-card-name">{model.displayName}</span>
            <ModelBrandTagBadge model={model} />
          </div>
          <span className="taavia-model-settings__picker-card-provider">{model.providerLabel}</span>
        </div>
        <ProviderAvatar label={model.providerLabel} />
      </div>

      <div className="taavia-model-settings__picker-card-prices">
        {prices.usd.map((part) => (
          <div key={`usd-${part.label}`} className="taavia-model-settings__picker-price-row">
            <span className="taavia-model-settings__picker-price-label">{part.label}</span>
            <span className="taavia-model-settings__picker-price-value" dir="ltr">{part.value}</span>
          </div>
        ))}
        {prices.toman.map((part) => (
          <div key={`toman-${part.label}`} className="taavia-model-settings__picker-price-row">
            <span className="taavia-model-settings__picker-price-label">{part.label}</span>
            <span className="taavia-model-settings__picker-price-value" dir="ltr">{part.value}</span>
          </div>
        ))}
      </div>

      {showStatus && statusLabel ? (
        <span className={`taavia-model-settings__pill taavia-model-settings__pill--${statusLabel === 'fallback' ? 'neutral' : 'brand'}`}>
          {statusLabel}
        </span>
      ) : null}
    </button>
  );
}
