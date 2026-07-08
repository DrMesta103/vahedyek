'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Layers, Pencil, Plus, Power, Shield, Trash2 } from 'lucide-react';
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
import { TaavFieldBlock, TaavInput, TaavTextarea, TaavChoiceChipGroup } from '@repo/ui/taav/forms';
import {
  AI_PROVIDER_LABELS,
  AI_PROVIDER_TYPES,
  type AiProviderAccountPublic,
  type AiProviderAccountSummary,
  type AiProviderType,
} from '@/app/lib/types/ai-accounts';
import { formatUsd } from '@/app/lib/global-settings-mock';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabLabelWithTooltip, AiLabTooltipIcon } from '@/components/AiLabTooltip';

type AiAccountsSettingsClientProps = {
  initialAccounts: AiProviderAccountPublic[];
  initialSummary: AiProviderAccountSummary;
  usdToToman: number;
};

type AccountFormState = {
  name: string;
  provider: AiProviderType;
  apiKey: string;
  purchaseEmail: string;
  purchasedCreditUsd: string;
  notes: string;
  isActive: boolean;
};

const EMPTY_FORM: AccountFormState = {
  name: '',
  provider: 'OPENAI',
  apiKey: '',
  purchaseEmail: '',
  purchasedCreditUsd: '0',
  notes: '',
  isActive: true,
};

const PROVIDER_OPTIONS = AI_PROVIDER_TYPES.map((provider) => ({
  label: AI_PROVIDER_LABELS[provider],
  value: provider,
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

function parseNonNegativeDecimalInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function toFormState(account: AiProviderAccountPublic): AccountFormState {
  return {
    name: account.name,
    provider: account.provider,
    apiKey: '',
    purchaseEmail: account.purchaseEmail ?? '',
    purchasedCreditUsd: String(account.purchasedCreditUsd),
    notes: account.notes ?? '',
    isActive: account.isActive,
  };
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 rounded-[14px] border border-[color:var(--taav-border-subtle)] bg-[var(--taav-surface-raised)] p-4">
      <h3 className="m-0 text-[length:var(--taav-text-sm)] font-bold text-[var(--taav-text-strong)]">{title}</h3>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

export function AiAccountsSettingsClient({
  initialAccounts,
  initialSummary,
}: AiAccountsSettingsClientProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [summary, setSummary] = useState(initialSummary);
  const [listError, setListError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AiProviderAccountPublic | null>(null);
  const [form, setForm] = useState<AccountFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const statCards = useMemo(
    () => [
      { label: 'تعداد اکانت‌ها', value: formatFaNumber(summary.totalAccounts) },
      { label: 'اکانت‌های فعال', value: formatFaNumber(summary.activeAccounts) },
      { label: 'کل اعتبار خریداری‌شده', value: formatUsd(summary.totalPurchasedCreditUsd) },
      { label: 'اعتبار مصرف‌شده', value: formatUsd(summary.totalUsedCreditUsd) },
      { label: 'اعتبار باقی‌مانده', value: formatUsd(summary.totalRemainingCreditUsd) },
    ],
    [summary],
  );

  const refreshAccounts = async () => {
    setRefreshing(true);
    setListError(null);

    try {
      const response = await fetch('/api/settings/ai-accounts');
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        accounts?: AiProviderAccountPublic[];
        summary?: AiProviderAccountSummary;
      } | null;

      if (!response.ok || !payload?.accounts || !payload.summary) {
        setListError(payload?.message ?? 'بارگذاری اکانت‌ها انجام نشد.');
        return;
      }

      setAccounts(payload.accounts);
      setSummary(payload.summary);
    } catch {
      setListError('بارگذاری اکانت‌ها انجام نشد.');
    } finally {
      setRefreshing(false);
    }
  };

  const openCreateDialog = () => {
    setEditingAccount(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (account: AiProviderAccountPublic) => {
    setEditingAccount(account);
    setForm(toFormState(account));
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (formLoading) return;
    setDialogOpen(false);
    setEditingAccount(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const submitForm = async () => {
    setFormError(null);
    setFormLoading(true);

    const purchasedCreditUsd = parseNonNegativeDecimalInput(form.purchasedCreditUsd);

    const payload = {
      name: form.name.trim(),
      provider: form.provider,
      apiKey: form.apiKey.trim() || undefined,
      purchaseEmail: form.purchaseEmail.trim() || null,
      purchasedCreditUsd,
      notes: form.notes.trim() || null,
      isActive: form.isActive,
    };

    if (!payload.name) {
      setFormError('نام اکانت الزامی است.');
      setFormLoading(false);
      return;
    }

    if (!editingAccount && !form.apiKey.trim()) {
      setFormError('API Key الزامی است.');
      setFormLoading(false);
      return;
    }

    if (purchasedCreditUsd === null) {
      setFormError('اعتبار خریداری‌شده باید صفر یا بیشتر باشد.');
      setFormLoading(false);
      return;
    }

    try {
      const response = await fetch(
        editingAccount ? `/api/settings/ai-accounts/${editingAccount.id}` : '/api/settings/ai-accounts',
        {
          method: editingAccount ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );

      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setFormError(result?.message ?? 'ذخیره اکانت انجام نشد.');
        return;
      }

      setActionFeedback(editingAccount ? 'اکانت با موفقیت به‌روزرسانی شد.' : 'اکانت جدید با موفقیت ایجاد شد.');
      closeDialog();
      await refreshAccounts();
    } catch {
      setFormError('ذخیره اکانت انجام نشد.');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleStatus = async (account: AiProviderAccountPublic) => {
    setActionFeedback(null);
    const response = await fetch(`/api/settings/ai-accounts/${account.id}/toggle-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !account.isActive }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setListError(payload?.message ?? 'تغییر وضعیت انجام نشد.');
      return;
    }

    setActionFeedback(account.isActive ? 'اکانت غیرفعال شد.' : 'اکانت فعال شد.');
    await refreshAccounts();
  };

  const deleteAccount = async (account: AiProviderAccountPublic) => {
    if (account.isSystem) return;

    const confirmed = window.confirm(`آیا مطمئن هستید که می‌خواهید اکانت «${account.name}» را حذف کنید؟`);
    if (!confirmed) return;

    setActionFeedback(null);
    const response = await fetch(`/api/settings/ai-accounts/${account.id}`, { method: 'DELETE' });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setListError(payload?.message ?? 'حذف اکانت انجام نشد.');
      return;
    }

    setActionFeedback('اکانت حذف شد.');
    await refreshAccounts();
  };

  const isProviderLocked = Boolean(editingAccount?.isSystem);

  return (
    <div className="business-settings-page-shell" dir="rtl" lang="fa">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">پنل تاو ادمین</span>
          <h1 className="m-0 inline-flex items-center gap-2 text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">
            اکانت‌های هوش مصنوعی
            <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.settings.aiAccounts} label="راهنمای اکانت‌های AI" />
          </h1>
          <p className="m-0 max-w-3xl text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
            مدیریت اکانت‌ها، API Keyها، Providerها و اعتبار. قیمت‌گذاری توکن در سطح مدل‌های هر Provider انجام می‌شود.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TaavButton iconStart={<Plus className="h-4 w-4" />} onClick={openCreateDialog}>
            افزودن اکانت
          </TaavButton>
          <Link href="/settings">
            <TaavButton variant="secondary" iconStart={<ArrowRight className="h-4 w-4" />}>
              بازگشت
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

      <div className="ai-lab-stat-grid">
        {statCards.map((card) => (
          <TaavCard key={card.label} variant="outlined" padding="lg" radius="xl">
            <div className="grid gap-1">
              <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">{card.label}</span>
              <strong className="text-[length:var(--taav-text-lg)] text-[var(--taav-text-strong)]">{card.value}</strong>
            </div>
          </TaavCard>
        ))}
      </div>

      <TaavCard variant="outlined" padding="lg" radius="xl">
        {refreshing ? (
          <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">در حال به‌روزرسانی فهرست...</p>
        ) : accounts.length === 0 ? (
          <TaavEmptyState
            variant="default"
            title="هنوز اکانتی برای هوش مصنوعی تعریف نشده است."
            description="برای شروع، اولین اکانت Provider را اضافه کنید."
            primaryAction={
              <TaavButton iconStart={<Plus className="h-4 w-4" />} onClick={openCreateDialog}>
                افزودن اکانت
              </TaavButton>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="ai-lab-settings-table">
              <thead>
                <tr>
                  <th>نام اکانت</th>
                  <th>Provider</th>
                  <th>اعتبار خریداری‌شده</th>
                  <th>مصرف‌شده</th>
                  <th>باقی‌مانده</th>
                  <th>مدل‌ها</th>
                  <th>وضعیت</th>
                  <th>آخرین بروزرسانی</th>
                  <th className="sticky left-0 bg-[var(--taav-surface-base)]">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account.id}>
                    <td>
                      <div className="grid gap-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <strong className="text-[var(--taav-text-strong)]">{account.name}</strong>
                          {account.isSystem ? (
                            <TaavBadge tone="info" variant="soft" size="sm">
                              <span className="ai-lab-system-badge">
                                <Shield className="h-3 w-3" />
                                سیستمی
                              </span>
                            </TaavBadge>
                          ) : null}
                        </div>
                        <span className="font-mono text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]" dir="ltr">
                          {account.apiKeyMasked}
                        </span>
                      </div>
                    </td>
                    <td>
                      <TaavBadge tone="brand" variant="soft">
                        {account.providerLabel}
                      </TaavBadge>
                    </td>
                    <td>{formatUsd(account.purchasedCreditUsd)}</td>
                    <td>{formatUsd(account.usedCreditUsd)}</td>
                    <td>{formatUsd(account.remainingCreditUsd)}</td>
                    <td>
                      <span className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">
                        {formatFaNumber(account.activeModelCount)} / {formatFaNumber(account.totalModelCount)}
                      </span>
                      <span className="block text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">فعال / کل</span>
                    </td>
                    <td>
                      <TaavBadge tone={account.isActive ? 'success' : 'neutral'} variant="soft">
                        {account.isActive ? 'فعال' : 'غیرفعال'}
                      </TaavBadge>
                    </td>
                    <td>{formatFaDateTime(account.updatedAt)}</td>
                    <td className="sticky left-0 bg-[var(--taav-surface-base)]">
                      <div className="flex flex-wrap gap-1">
                        <TaavButton
                          size="sm"
                          variant="secondary"
                          iconStart={<Layers className="h-3.5 w-3.5" />}
                          onClick={() => router.push(`/settings/ai-accounts/${account.id}`)}
                        >
                          مدل‌ها
                        </TaavButton>
                        <TaavButton
                          size="sm"
                          variant="secondary"
                          iconStart={<Pencil className="h-3.5 w-3.5" />}
                          onClick={() => openEditDialog(account)}
                        >
                          ویرایش
                        </TaavButton>
                        <TaavButton
                          size="sm"
                          variant="secondary"
                          iconStart={<Power className="h-3.5 w-3.5" />}
                          onClick={() => toggleStatus(account)}
                        >
                          {account.isActive ? 'غیرفعال' : 'فعال'}
                        </TaavButton>
                        {!account.isSystem ? (
                          <TaavButton
                            size="sm"
                            variant="ghost"
                            iconStart={<Trash2 className="h-3.5 w-3.5" />}
                            onClick={() => deleteAccount(account)}
                          >
                            حذف
                          </TaavButton>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </TaavCard>

      <TaavDialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <TaavDialogContent size="md" contentClassName="ai-lab-dialog max-h-[min(90vh,640px)] overflow-y-auto">
          <TaavDialogHeader>
            <TaavDialogTitle>{editingAccount ? 'ویرایش اکانت' : 'افزودن اکانت'}</TaavDialogTitle>
            <TaavDialogDescription>
              {editingAccount
                ? 'برای جایگزینی API Key مقدار جدید وارد کنید؛ در غیر این صورت خالی بگذارید. قیمت توکن از مدل‌های این اکانت خوانده می‌شود.'
                : 'اطلاعات اکانت Provider و اعتبار را وارد کنید. پس از ایجاد، مدل‌ها و قیمت‌گذاری را از بخش «مدل‌ها» تنظیم کنید.'}
            </TaavDialogDescription>
          </TaavDialogHeader>

          <div className="grid gap-4">
            <FormSection title="اطلاعات اکانت">
              <TaavFieldBlock
                label={<AiLabLabelWithTooltip label="نام اکانت" tooltip={AI_LAB_TOOLTIPS.settings.aiAccountName} required />}
                required
                htmlFor="ai-account-name"
              >
                <TaavInput
                  id="ai-account-name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="OpenAI Main Account"
                />
              </TaavFieldBlock>
            </FormSection>

            <FormSection title="دسترسی و Provider">
              <TaavFieldBlock
                label={<AiLabLabelWithTooltip label="ارائه‌دهنده" tooltip={AI_LAB_TOOLTIPS.settings.aiAccountProvider} required />}
                required
              >
                {isProviderLocked ? (
                  <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    Provider اکانت سیستمی قابل تغییر نیست:{' '}
                    <strong className="text-[var(--taav-text-strong)]">{AI_PROVIDER_LABELS[form.provider]}</strong>
                  </p>
                ) : (
                  <TaavChoiceChipGroup
                    ariaLabel="ارائه‌دهنده"
                    options={PROVIDER_OPTIONS}
                    value={form.provider}
                    onValueChange={(value) => {
                      const next = Array.isArray(value) ? value[0] : value;
                      if (!next) return;
                      setForm((current) => ({ ...current, provider: next as AiProviderType }));
                    }}
                    size="sm"
                    tone="brand"
                    gap="sm"
                    wrap
                  />
                )}
              </TaavFieldBlock>

              <TaavFieldBlock
                label={
                  <AiLabLabelWithTooltip label="API Key" tooltip={AI_LAB_TOOLTIPS.settings.aiAccountApiKey} required={!editingAccount} />
                }
                required={!editingAccount}
                htmlFor="ai-account-api-key"
              >
                {editingAccount ? (
                  <p className="m-0 mb-2 font-mono text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]" dir="ltr">
                    {editingAccount.apiKeyMasked}
                  </p>
                ) : null}
                <TaavInput
                  id="ai-account-api-key"
                  type="password"
                  autoComplete="off"
                  value={form.apiKey}
                  onChange={(event) => setForm((current) => ({ ...current, apiKey: event.target.value }))}
                  placeholder={editingAccount ? 'برای جایگزینی API Key جدید وارد کنید' : 'sk-...'}
                  dir="ltr"
                />
              </TaavFieldBlock>

              <TaavFieldBlock
                label={<AiLabLabelWithTooltip label="ایمیل خریداری" tooltip={AI_LAB_TOOLTIPS.settings.aiAccountPurchaseEmail} />}
                htmlFor="ai-account-purchase-email"
              >
                <TaavInput
                  id="ai-account-purchase-email"
                  type="email"
                  autoComplete="email"
                  value={form.purchaseEmail}
                  onChange={(event) => setForm((current) => ({ ...current, purchaseEmail: event.target.value }))}
                  placeholder="billing@example.com"
                  dir="ltr"
                />
              </TaavFieldBlock>
            </FormSection>

            <FormSection title="اعتبار">
              <p className="m-0 text-[length:var(--taav-text-xs)] leading-relaxed text-[var(--taav-text-muted)]">
                هزینه مصرف از روی قیمت مدل‌های فعال محاسبه می‌شود. اعتبار خریداری‌شده سقف مصرف دلاری این اکانت است.
              </p>

              <TaavFieldBlock
                label={
                  <AiLabLabelWithTooltip label="اعتبار خریداری‌شده دلاری" tooltip={AI_LAB_TOOLTIPS.settings.aiAccountCredit} required />
                }
                required
                htmlFor="ai-account-credit"
              >
                <TaavInput
                  id="ai-account-credit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.purchasedCreditUsd}
                  onChange={(event) => setForm((current) => ({ ...current, purchasedCreditUsd: event.target.value }))}
                  placeholder="100"
                  dir="ltr"
                />
              </TaavFieldBlock>
            </FormSection>

            <FormSection title="وضعیت و توضیحات">
              <TaavFieldBlock label={<AiLabLabelWithTooltip label="وضعیت" tooltip={AI_LAB_TOOLTIPS.settings.aiAccountStatus} required />} required>
                <TaavChoiceChipGroup
                  ariaLabel="وضعیت"
                  options={STATUS_OPTIONS}
                  value={form.isActive ? 'active' : 'inactive'}
                  onValueChange={(value) => {
                    const next = Array.isArray(value) ? value[0] : value;
                    if (!next) return;
                    setForm((current) => ({ ...current, isActive: next === 'active' }));
                  }}
                  size="sm"
                  tone="brand"
                  gap="sm"
                  wrap={false}
                />
              </TaavFieldBlock>

              <TaavFieldBlock label={<AiLabLabelWithTooltip label="توضیحات" tooltip={AI_LAB_TOOLTIPS.settings.aiAccountNotes} />} htmlFor="ai-account-notes">
                <TaavTextarea
                  id="ai-account-notes"
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={3}
                />
              </TaavFieldBlock>
            </FormSection>

            {formError ? (
              <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">{formError}</p>
            ) : null}
          </div>

          <TaavDialogFooter>
            <TaavButton variant="secondary" onClick={closeDialog} disabled={formLoading}>
              انصراف
            </TaavButton>
            <TaavButton onClick={submitForm} disabled={formLoading}>
              {formLoading ? 'در حال ذخیره...' : editingAccount ? 'ذخیره تغییرات' : 'ایجاد اکانت'}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
    </div>
  );
}
