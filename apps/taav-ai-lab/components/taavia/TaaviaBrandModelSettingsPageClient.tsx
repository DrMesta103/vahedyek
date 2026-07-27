'use client';

import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  History,
  Info,
  Loader2,
  MessageSquareText,
  Mic,
  Pencil,
  Save,
  ScanText,
  Sparkles,
  Star,
  Volume2,
} from 'lucide-react';
import { TaavBadge, TaavButton } from '@repo/ui/taav/primitives';
import { AiLabTooltipWrap } from '@/components/AiLabTooltip';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import {
  getPurposeCompatibility,
  TAAVIA_PURPOSE_GUIDES,
  TAAVIA_PURPOSE_LABELS,
  type TaaviaBrandAiModelPurpose,
} from '@/app/lib/taavia-ai-models';
import {
  AI_PROVIDER_LABELS_V2,
  type AiProviderTypeV2,
} from '@/app/lib/types/ai-provider-v2';

type Model = {
  id: string;
  name: string;
  providerModelId: string;
  modelType: string;
  isActive: boolean;
  recommendedForPurposes: string[];
  capabilities: string[];
  pricing: Array<{ metric: string; unit: string; unitQuantity: number; priceUsd: number }>;
};
type Account = {
  id: string;
  name: string;
  providerType: string;
  isActive: boolean;
  isRecommended: boolean;
  models: Model[];
};
type Assignment = {
  id: string;
  purpose: string;
  aiProviderAccountId: string;
  aiProviderModelId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  assignedBy: string;
  endedBy: string | null;
  account: { name: string; providerType: string; isActive: boolean };
  model: Model;
};
type PurposeItem = {
  code: TaaviaBrandAiModelPurpose;
  label: string;
  description: string;
  tip?: string;
  example?: string;
  whenToUse?: string;
};
type SettingsData = {
  brand: {
    id: string;
    tenantId: string;
    name: string;
    description: string | null;
    status: string;
    setupMode: string;
    icon: { previewData?: string | null } | null;
  };
  purposes: PurposeItem[];
  assignments: Assignment[];
  accounts: Account[];
  lastAssignmentChange: string | null;
};

const PROVIDER_SHORT_LABELS: Record<string, string> = {
  OPENAI: 'OpenAI',
  OpenAi: 'OpenAI',
  AZURE_OPENAI: 'Azure',
  AzureOpenAi: 'Azure',
  GEMINI: 'Gemini',
  GoogleGemini: 'Gemini',
  DEEPSEEK: 'DeepSeek',
  DeepSeek: 'DeepSeek',
  GROK: 'Grok',
  Grok: 'Grok',
  OPENROUTER: 'OpenRouter',
  OpenRouter: 'OpenRouter',
};

const PURPOSE_ICONS: Record<TaaviaBrandAiModelPurpose, ReactNode> = {
  TEXT_GENERATION: <MessageSquareText className="h-5 w-5" />,
  SPEECH_TO_TEXT: <Mic className="h-5 w-5" />,
  TEXT_TO_SPEECH: <Volume2 className="h-5 w-5" />,
  DOCUMENT_EXTRACTION: <ScanText className="h-5 w-5" />,
};

const PURPOSE_TOOLTIPS = {
  TEXT_GENERATION: AI_LAB_TOOLTIPS.taavia.purposeTextGeneration,
  SPEECH_TO_TEXT: AI_LAB_TOOLTIPS.taavia.purposeSpeechToText,
  TEXT_TO_SPEECH: AI_LAB_TOOLTIPS.taavia.purposeTextToSpeech,
  DOCUMENT_EXTRACTION: AI_LAB_TOOLTIPS.taavia.purposeDocumentExtraction,
} as const;

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('fa-IR') : '—';
}

function formatFaNumber(value: number) {
  return new Intl.NumberFormat('fa-IR').format(value);
}

function providerLabel(providerType: string) {
  if (PROVIDER_SHORT_LABELS[providerType]) return PROVIDER_SHORT_LABELS[providerType];
  const typed = providerType as AiProviderTypeV2;
  return AI_PROVIDER_LABELS_V2[typed] ?? providerType;
}

function HelpTip({ content, label }: { content: { text: string; example?: string }; label: string }) {
  return (
    <AiLabTooltipWrap content={content} className="inline-flex">
      <button
        type="button"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] text-[var(--taav-brand-strong)] transition hover:border-[color:var(--taav-brand)]/40 hover:bg-[var(--taav-brand-soft)]"
        aria-label={label}
      >
        <CircleHelp className="h-3.5 w-3.5" />
      </button>
    </AiLabTooltipWrap>
  );
}

function SelectionChip({
  selected,
  recommended,
  showStar,
  label,
  onClick,
  disabled,
}: {
  selected: boolean;
  recommended?: boolean;
  showStar?: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={[
        'group relative flex min-h-[3.25rem] min-w-[8.75rem] flex-col items-stretch justify-center gap-1 rounded-2xl border px-3.5 py-2.5 text-right transition',
        selected
          ? 'border-[color:var(--taav-brand)] bg-[var(--taav-brand)] text-[var(--taav-text-on-brand)] shadow-[0_0_0_1px_var(--taav-brand)]'
          : 'border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] text-[var(--taav-text-strong)] hover:border-[color:var(--taav-brand)]/50',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      ].join(' ')}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5">
          {showStar && recommended ? (
            <Star
              className={[
                'h-3.5 w-3.5 shrink-0',
                selected ? 'fill-amber-300 text-amber-300' : 'fill-amber-400 text-amber-400',
              ].join(' ')}
            />
          ) : null}
          {showStar && recommended ? (
            <Sparkles
              className={[
                'h-3.5 w-3.5 shrink-0',
                selected ? 'text-current' : 'text-[var(--taav-brand-strong)]',
              ].join(' ')}
            />
          ) : null}
          <span className="truncate text-sm font-bold" dir="auto">
            {label}
          </span>
        </span>
        <span
          className={[
            'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
            selected
              ? 'border-transparent bg-[var(--taav-text-on-brand)]/15 text-current'
              : 'border-[color:var(--taav-border-subtle)] text-transparent',
          ].join(' ')}
          aria-hidden
        >
          {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
        </span>
      </span>
      {recommended ? (
        <span
          className={[
            'inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-bold',
            selected
              ? 'bg-[var(--taav-text-on-brand)]/15 text-current'
              : 'bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]',
          ].join(' ')}
        >
          پیشنهادی
        </span>
      ) : null}
    </button>
  );
}

export function TaaviaBrandModelSettingsPageClient({
  tenantId,
  brandId,
  initialData,
}: {
  tenantId: string;
  brandId: string;
  initialData: SettingsData;
}) {
  const [data, setData] = useState(initialData);
  const [selectedAccount, setSelectedAccount] = useState<Record<string, string>>({});
  const [selectedModel, setSelectedModel] = useState<Record<string, string>>({});
  const [savingPurpose, setSavingPurpose] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyPurpose, setHistoryPurpose] = useState<string | null>(null);
  const [history, setHistory] = useState<Assignment[]>([]);

  const assignments = useMemo(
    () => new Map(data.assignments.map((assignment) => [assignment.purpose, assignment])),
    [data.assignments],
  );

  const activeAccounts = useMemo(
    () => data.accounts.filter((account) => account.isActive),
    [data.accounts],
  );

  const configuredCount = data.purposes.filter((purpose) => assignments.has(purpose.code)).length;

  const recommendedAccountFor = (purpose: TaaviaBrandAiModelPurpose) =>
    activeAccounts.find(
      (account) =>
        account.isRecommended &&
        account.models.some(
          (model) =>
            model.recommendedForPurposes.includes(purpose) &&
            getPurposeCompatibility(purpose, model).compatible,
        ),
    ) ??
    activeAccounts.find(
      (account) =>
        account.isRecommended &&
        account.models.some((model) => getPurposeCompatibility(purpose, model).compatible),
    ) ??
    activeAccounts.find((account) =>
      account.models.some(
        (model) =>
          model.recommendedForPurposes.includes(purpose) &&
          getPurposeCompatibility(purpose, model).compatible,
      ),
    );

  const openHistory = async (purpose: string) => {
    setHistoryPurpose(purpose);
    const response = await fetch(
      `/api/businesses/${tenantId}/taavia/brands/${brandId}/model-assignments/history?purpose=${purpose}`,
    );
    const payload = (await response.json().catch(() => null)) as { assignments?: Assignment[] } | null;
    setHistory(payload?.assignments ?? []);
  };

  const save = async (purpose: TaaviaBrandAiModelPurpose) => {
    const accountId = selectedAccount[purpose];
    const modelId = selectedModel[purpose];
    if (!accountId || !modelId) return;
    const current = assignments.get(purpose);
    if (current?.aiProviderAccountId === accountId && current.aiProviderModelId === modelId) {
      setFeedback('این تخصیص هم‌اکنون فعال است.');
      return;
    }
    if (current && !window.confirm('تخصیص قبلی بسته می‌شود و تاریخچه آن حفظ خواهد شد. ادامه می‌دهید؟')) return;
    setSavingPurpose(purpose);
    setFeedback(null);
    setError(null);
    try {
      const response = await fetch(
        `/api/businesses/${tenantId}/taavia/brands/${brandId}/model-assignments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ purpose, aiProviderAccountId: accountId, aiProviderModelId: modelId }),
        },
      );
      const payload = (await response.json().catch(() => null)) as {
        assignment?: Assignment;
        message?: string;
      } | null;
      if (!response.ok || !payload?.assignment) throw new Error(payload?.message ?? 'ذخیره تخصیص انجام نشد.');
      setData((currentData) => ({
        ...currentData,
        assignments: [
          ...currentData.assignments.filter((item) => item.purpose !== purpose),
          payload.assignment!,
        ],
        lastAssignmentChange: payload.assignment!.effectiveFrom,
      }));
      setFeedback(`تخصیص «${TAAVIA_PURPOSE_LABELS[purpose]}» با موفقیت ذخیره شد.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تخصیص انجام نشد.');
    } finally {
      setSavingPurpose(null);
    }
  };

  return (
    <div dir="rtl" className="mx-auto grid max-w-6xl gap-5 pb-10">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link href={`/businesses/${tenantId}/products/taavia/brands/${brandId}`}>
          <TaavButton variant="secondary" size="sm" iconStart={<ArrowLeft className="h-4 w-4" />}>
            بازگشت به داشبورد برند
          </TaavButton>
        </Link>
      </div>

      <header className="rounded-[1.25rem] border border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface)] p-5 shadow-[var(--taav-shadow-sm)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-[var(--taav-text-muted)]">
              <span>تنظیمات هوش مصنوعی برند</span>
              <HelpTip content={AI_LAB_TOOLTIPS.taavia.modelSettingsPage} label="راهنمای تنظیمات مدل" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <h1 className="m-0 text-2xl font-black text-[var(--taav-text-strong)] md:text-[1.75rem]">
                {data.brand.name}
              </h1>
              <Link
                href={`/businesses/${tenantId}/products/taavia/brands/${brandId}/edit`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--taav-brand)]/40 bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)] transition hover:bg-[var(--taav-brand)] hover:text-[var(--taav-text-on-brand)]"
                aria-label="ویرایش برند"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Link>
              <TaavBadge tone={data.brand.status === 'ACTIVE' ? 'success' : 'warning'} variant="soft">
                {data.brand.status === 'ACTIVE' ? 'فعال' : data.brand.status}
              </TaavBadge>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--taav-text-muted)]">
              برای هر کاربرد برند (چت، صدا و خواندن سند) یک ارائه‌دهنده و یک مدل انتخاب کنید. لازم نیست فنی باشید؛
              کنار هر بخش علامت سؤال راهنما دارد.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3.5 py-2 text-[var(--taav-text-muted)]">
            <CheckCircle2 className="h-4 w-4 text-[var(--taav-brand-strong)]" />
            {formatFaNumber(configuredCount)} از {formatFaNumber(data.purposes.length)} کاربرد تنظیم‌شده
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3.5 py-2 text-[var(--taav-text-muted)]">
            <Clock3 className="h-4 w-4 text-[var(--taav-brand-strong)]" />
            آخرین تغییر: {formatDate(data.lastAssignmentChange)}
          </span>
        </div>
      </header>

      {error ? (
        <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}
      {feedback ? (
        <div
          role="status"
          className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300"
        >
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-4">
        {data.purposes.map((purpose) => {
          const guide = TAAVIA_PURPOSE_GUIDES[purpose.code];
          const tip = purpose.tip ?? guide.tip;
          const example = purpose.example ?? guide.example;
          const whenToUse = purpose.whenToUse ?? guide.whenToUse;
          const current = assignments.get(purpose.code);
          const accountId =
            selectedAccount[purpose.code] ??
            current?.aiProviderAccountId ??
            recommendedAccountFor(purpose.code)?.id ??
            '';
          const account = activeAccounts.find((item) => item.id === accountId);
          const compatibleModels =
            account?.models.filter(
              (model) => model.isActive && getPurposeCompatibility(purpose.code, model).compatible,
            ) ?? [];
          const recommendedModel =
            compatibleModels.find((model) => model.recommendedForPurposes.includes(purpose.code)) ??
            compatibleModels[0];
          const modelId =
            selectedModel[purpose.code] ?? current?.aiProviderModelId ?? recommendedModel?.id ?? '';
          const saving = savingPurpose === purpose.code;
          const accountsForPurpose = activeAccounts.filter((item) =>
            item.models.some((model) => getPurposeCompatibility(purpose.code, model).compatible),
          );

          return (
            <section
              key={purpose.code}
              className="rounded-[1.25rem] border border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface)] p-5 md:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[color:var(--taav-brand)]/35 bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]">
                    {PURPOSE_ICONS[purpose.code]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="m-0 text-lg font-black text-[var(--taav-text-strong)]">
                        {purpose.label}
                      </h2>
                      <HelpTip
                        content={PURPOSE_TOOLTIPS[purpose.code]}
                        label={`راهنمای ${purpose.label}`}
                      />
                      {current ? (
                        <TaavBadge tone="success" variant="soft" size="sm">
                          تنظیم‌شده
                        </TaavBadge>
                      ) : (
                        <TaavBadge tone="warning" variant="soft" size="sm">
                          هنوز انتخاب نشده
                        </TaavBadge>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[var(--taav-text-muted)]">
                      {purpose.description}
                    </p>
                    <p className="mt-2 text-xs leading-6 text-[var(--taav-text-muted)]">
                      <span className="font-bold text-[var(--taav-text-strong)]">کاربرد:</span> {whenToUse}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void openHistory(purpose.code)}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[var(--taav-brand-strong)] transition hover:bg-[var(--taav-brand-soft)]"
                >
                  <History className="h-4 w-4" />
                  مشاهده تاریخچه
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-dashed border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-4 py-3 text-xs leading-6 text-[var(--taav-text-muted)]">
                <span className="font-bold text-[var(--taav-text-strong)]">مثال:</span> {example}
              </div>

              <div className="mt-5 grid gap-5">
                <div>
                  <div className="mb-2.5 flex items-center gap-2 text-xs font-bold text-[var(--taav-text-muted)]">
                    <span>ارائه‌دهنده</span>
                    <HelpTip content={AI_LAB_TOOLTIPS.taavia.modelProvider} label="راهنمای ارائه‌دهنده" />
                  </div>
                  <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={`ارائه‌دهنده ${purpose.label}`}>
                    {accountsForPurpose.length ? (
                      accountsForPurpose.map((item) => (
                        <SelectionChip
                          key={item.id}
                          selected={accountId === item.id}
                          recommended={item.isRecommended}
                          label={providerLabel(item.providerType)}
                          onClick={() => {
                            setSelectedAccount((value) => ({ ...value, [purpose.code]: item.id }));
                            setSelectedModel((value) => ({ ...value, [purpose.code]: '' }));
                          }}
                        />
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-4 py-3 text-sm text-[var(--taav-text-muted)]">
                        هنوز حساب سازگاری برای این کاربرد تعریف نشده است. از تنظیمات اکانت‌های AI یک مدل مناسب اضافه کنید.
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="mb-2.5 flex items-center gap-2 text-xs font-bold text-[var(--taav-text-muted)]">
                    <span>
                      مدل{' '}
                      {compatibleModels.some((model) => model.recommendedForPurposes.includes(purpose.code))
                        ? '(پیشنهادی)'
                        : ''}
                    </span>
                    <HelpTip content={AI_LAB_TOOLTIPS.taavia.modelChoice} label="راهنمای انتخاب مدل" />
                  </div>
                  <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={`مدل ${purpose.label}`}>
                    {compatibleModels.length ? (
                      compatibleModels.map((model) => {
                        const recommended = model.recommendedForPurposes.includes(purpose.code);
                        return (
                          <SelectionChip
                            key={model.id}
                            selected={modelId === model.id}
                            recommended={recommended}
                            showStar={recommended}
                            label={model.name}
                            disabled={!accountId}
                            onClick={() =>
                              setSelectedModel((value) => ({ ...value, [purpose.code]: model.id }))
                            }
                          />
                        );
                      })
                    ) : (
                      <div className="rounded-2xl border border-dashed border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-4 py-3 text-sm text-[var(--taav-text-muted)]">
                        {accountId
                          ? 'برای این ارائه‌دهنده مدلی سازگار با این کاربرد وجود ندارد.'
                          : 'ابتدا ارائه‌دهنده را انتخاب کنید.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-xl text-xs leading-6 text-[var(--taav-text-muted)]">{tip}</p>
                <TaavButton
                  disabled={!accountId || !modelId || saving}
                  onClick={() => void save(purpose.code)}
                  iconStart={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                >
                  {saving ? 'در حال ذخیره…' : 'ذخیره تخصیص'}
                </TaavButton>
              </div>
            </section>
          );
        })}
      </div>

      <p className="flex items-start gap-2 text-xs leading-6 text-[var(--taav-text-muted)]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--taav-brand-strong)]" />
        گزینه‌های پیشنهادی با برچسب «پیشنهادی» مشخص شده‌اند. فقط مدل‌های سازگار با هر کاربرد نمایش داده می‌شوند.
      </p>

      {historyPurpose ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-3xl border border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface)] p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="m-0 text-lg font-bold text-[var(--taav-text-strong)]">
                تاریخچه {TAAVIA_PURPOSE_LABELS[historyPurpose as TaaviaBrandAiModelPurpose]}
              </h2>
              <button
                type="button"
                className="min-h-11 rounded-xl px-3 text-sm text-[var(--taav-text-muted)] hover:bg-[var(--taav-surface-soft)]"
                onClick={() => setHistoryPurpose(null)}
              >
                بستن
              </button>
            </div>
            <div className="mt-4 grid gap-3">
              {history.length ? (
                history.map((item) => (
                  <div key={item.id} className="rounded-2xl bg-[var(--taav-surface-soft)] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="text-[var(--taav-text-strong)]">{item.model.name}</strong>
                      <TaavBadge tone={item.effectiveTo ? 'neutral' : 'success'} variant="soft">
                        {item.effectiveTo ? 'پایان‌یافته' : 'فعال'}
                      </TaavBadge>
                    </div>
                    <div className="mt-2 text-sm text-[var(--taav-text-muted)]">
                      {item.account.name} · {formatDate(item.effectiveFrom)} تا {formatDate(item.effectiveTo)} ·
                      تخصیص‌دهنده: {item.assignedBy}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-[var(--taav-surface-soft)] p-5 text-sm text-[var(--taav-text-muted)]">
                  تاریخچه‌ای ثبت نشده است.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
