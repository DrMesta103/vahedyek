'use client';

import { useEffect, useMemo, useState } from 'react';
import { AudioLines, Bot, Database, FileAudio, ImageIcon, Loader2, ScanText, Sparkles } from 'lucide-react';
import {
  TaavButton,
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';
import type { TaaviaBrand, TaaviaBrandModelServiceKey } from '@/app/lib/data';

type ModelOption = {
  id: string;
  name: string;
  providerLabel: string;
  category: 'chat' | 'embedding' | 'ocr';
};

type ModelPreferences = Partial<Record<TaaviaBrandModelServiceKey, string>>;

type ServiceDefinition = {
  key: TaaviaBrandModelServiceKey;
  title: string;
  description: string;
  categories: Array<ModelOption['category']>;
  icon: typeof Bot;
};

const SERVICE_DEFINITIONS: ServiceDefinition[] = [
  {
    key: 'adminAgent',
    title: 'ایجنت مدیریت برند',
    description: 'مدل اصلی گفت‌وگو برای هدایت، تنظیم و مدیریت برند در تاویا',
    categories: ['chat'],
    icon: Bot,
  },
  {
    key: 'knowledgeBase',
    title: 'ساخت Knowledge Base',
    description: 'برای تبدیل داده‌های برند، محصول و FAQ به ساختار دانش',
    categories: ['chat'],
    icon: Sparkles,
  },
  {
    key: 'faqAssistant',
    title: 'پاسخ به FAQ',
    description: 'برای تولید و تکمیل پاسخ‌های پیشنهادی به سوالات پرتکرار',
    categories: ['chat'],
    icon: AudioLines,
  },
  {
    key: 'ocr',
    title: 'OCR',
    description: 'برای استخراج متن و داده از تصویر و اسناد',
    categories: ['ocr'],
    icon: ScanText,
  },
  {
    key: 'embeddings',
    title: 'جست‌وجو و امبدینگ',
    description: 'برای بازیابی دانش، سرچ معنایی و اتصال بخش‌های دانش',
    categories: ['embedding'],
    icon: Database,
  },
  {
    key: 'vision',
    title: 'تحلیل تصویر',
    description: 'برای درک تصاویر برند، اسناد تصویری و ورودی‌های بصری',
    categories: ['ocr', 'chat'],
    icon: ImageIcon,
  },
  {
    key: 'speechToText',
    title: 'ویس به متن',
    description: 'برای دریافت فایل صوتی و تبدیل آن به متن قابل پردازش',
    categories: ['chat', 'ocr'],
    icon: FileAudio,
  },
  {
    key: 'textToSpeech',
    title: 'متن به ویس',
    description: 'برای تولید خروجی صوتی از پاسخ‌های تاویا',
    categories: ['chat'],
    icon: FileAudio,
  },
];

type TaaviaBrandModelSettingsDialogProps = {
  tenantId: string;
  brand: TaaviaBrand | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

export function TaaviaBrandModelSettingsDialog({
  tenantId,
  brand,
  open,
  onOpenChange,
  onSaved,
}: TaaviaBrandModelSettingsDialogProps) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [preferences, setPreferences] = useState<ModelPreferences>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !brand) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [settingsRes, prefsRes] = await Promise.all([
          fetch('/api/settings/global', { cache: 'no-store' }),
          fetch(`/api/businesses/${tenantId}/taavia/brands/${brand.id}/model-settings`, { cache: 'no-store' }),
        ]);

        const settingsPayload = (await settingsRes.json().catch(() => null)) as
          | { settings?: { models?: ModelOption[] }; message?: string }
          | null;
        const prefsPayload = (await prefsRes.json().catch(() => null)) as
          | { modelPreferences?: ModelPreferences; message?: string }
          | null;

        if (!settingsRes.ok) {
          throw new Error(settingsPayload?.message ?? 'دریافت مدل‌های سیستم انجام نشد.');
        }
        if (!prefsRes.ok) {
          throw new Error(prefsPayload?.message ?? 'دریافت تنظیمات مدل برند انجام نشد.');
        }

        if (cancelled) return;
        setModels(settingsPayload?.settings?.models ?? []);
        setPreferences(prefsPayload?.modelPreferences ?? brand.modelPreferences ?? {});
      } catch (fetchError) {
        if (cancelled) return;
        setError(fetchError instanceof Error ? fetchError.message : 'بارگذاری تنظیمات مدل انجام نشد.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, brand, tenantId]);

  const modelsByCategory = useMemo(() => {
    return models.reduce<Record<string, ModelOption[]>>((accumulator, model) => {
      const current = accumulator[model.category] ?? [];
      current.push(model);
      accumulator[model.category] = current;
      return accumulator;
    }, {});
  }, [models]);

  const resolveModelOptions = (service: ServiceDefinition) => {
    const seen = new Set<string>();
    return service.categories.flatMap((category) =>
      (modelsByCategory[category] ?? []).filter((model) => {
        if (seen.has(model.id)) return false;
        seen.add(model.id);
        return true;
      }),
    );
  };

  const handleSave = async () => {
    if (!brand) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/businesses/${tenantId}/taavia/brands/${brand.id}/model-settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelPreferences: preferences }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(payload?.message ?? 'ذخیره تنظیمات مدل انجام نشد.');
      }

      onSaved?.();
      onOpenChange(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تنظیمات مدل انجام نشد.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <TaavDialog open={open} onOpenChange={(nextOpen) => (!saving ? onOpenChange(nextOpen) : undefined)}>
      <TaavDialogContent size="lg" contentClassName="ai-lab-dialog">
        <TaavDialogHeader>
          <TaavDialogTitle className="text-right text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">
            تنظیمات مدل برند
          </TaavDialogTitle>
          <TaavDialogDescription className="text-right text-[length:var(--taav-text-sm)] leading-7 text-[var(--taav-text-muted)]">
            برای برند {brand?.name ?? 'انتخاب‌شده'} مشخص کن هر سرویس AI تاویا با کدام مدل کار کند.
          </TaavDialogDescription>
        </TaavDialogHeader>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--taav-brand-strong)]" />
          </div>
        ) : (
          <div className="grid gap-3">
            {SERVICE_DEFINITIONS.map((service) => {
              const Icon = service.icon;
              const options = resolveModelOptions(service);

              return (
                <div
                  key={service.key}
                  className="grid gap-3 rounded-[20px] border border-white/10 bg-[rgba(8,16,31,0.55)] p-4 text-right"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-black text-white">{service.title}</div>
                      <div className="mt-1 text-[12px] leading-6 text-[rgba(217,229,255,0.62)]">
                        {service.description}
                      </div>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(66,237,211,0.12)] text-[rgb(150,246,231)]">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  <select
                    value={preferences[service.key] ?? ''}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        [service.key]: event.target.value,
                      }))
                    }
                    className="w-full rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-[13px] text-white outline-none"
                  >
                    <option value="">مدل پیش‌فرض سیستم</option>
                    {options.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.providerLabel} - {model.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}

            {error ? (
              <div className="rounded-[14px] border border-[rgba(248,113,113,0.22)] bg-[rgba(248,113,113,0.08)] px-3 py-2 text-right text-[12px] font-semibold text-[rgb(254,202,202)]">
                {error}
              </div>
            ) : null}
          </div>
        )}

        <TaavDialogFooter>
          <TaavButton variant="secondary" tone="neutral" onClick={() => onOpenChange(false)} disabled={saving}>
            انصراف
          </TaavButton>
          <TaavButton onClick={() => void handleSave()} disabled={loading || saving}>
            {saving ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال ذخیره...
              </span>
            ) : (
              'ذخیره تنظیمات مدل'
            )}
          </TaavButton>
        </TaavDialogFooter>
      </TaavDialogContent>
    </TaavDialog>
  );
}
