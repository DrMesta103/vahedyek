'use client';

import { useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, KeyRound, Layers, MoreVertical, Pencil, Plus, Power, Shield, Trash2 } from 'lucide-react';
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
import { TaavFieldBlock, TaavInput, TaavTextarea, TaavChoiceChipGroup } from '@repo/ui/taav/forms';
import {
  AI_PROVIDER_LABELS_V2,
  AI_PROVIDER_TYPES_V2,
  type AiProviderAccountV2ListItem,
  type AiProviderAccountV2ListResponse,
  type AiProviderTypeV2,
} from '@/app/lib/types/ai-provider-v2';
import { formatUsd } from '@/app/lib/global-settings-mock';

type Props = {
  initialData: AiProviderAccountV2ListResponse;
};

type AccountFormState = {
  name: string;
  providerType: AiProviderTypeV2;
  apiKey: string;
  endpoint: string;
  apiVersion: string;
  billingEmail: string;
  description: string;
  isActive: boolean;
};

const EMPTY_FORM: AccountFormState = {
  name: '',
  providerType: 'OPENAI',
  apiKey: '',
  endpoint: '',
  apiVersion: '',
  billingEmail: '',
  description: '',
  isActive: true,
};

const PROVIDER_OPTIONS = AI_PROVIDER_TYPES_V2.map((p) => ({ label: AI_PROVIDER_LABELS_V2[p], value: p }));
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

function toFormState(account: AiProviderAccountV2ListItem): AccountFormState {
  return {
    name: account.name,
    providerType: account.providerType,
    apiKey: '',
    endpoint: account.endpoint ?? '',
    apiVersion: account.apiVersion ?? '',
    billingEmail: account.billingEmail ?? '',
    description: account.description ?? '',
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

function AccountCardActions({
  account,
  onModels,
  onEdit,
  onApiKey,
  onToggleStatus,
  onDelete,
}: {
  account: AiProviderAccountV2ListItem;
  onModels: (account: AiProviderAccountV2ListItem) => void;
  onEdit: (account: AiProviderAccountV2ListItem) => void;
  onApiKey: (account: AiProviderAccountV2ListItem) => void;
  onToggleStatus: (account: AiProviderAccountV2ListItem) => void;
  onDelete: (account: AiProviderAccountV2ListItem) => void;
}) {
  return (
    <TaavDropdown>
      <TaavDropdownTrigger asChild>
        <button type="button" className="ai-lab-admin-user-menu" aria-label={`اکشن‌های اکانت ${account.name}`}>
          <MoreVertical className="h-4 w-4" />
        </button>
      </TaavDropdownTrigger>
      <TaavDropdownContent align="end">
        <TaavDropdownItem iconStart={<Layers className="h-4 w-4" />} onSelect={() => onModels(account)}>
          مدل‌ها و قیمت
        </TaavDropdownItem>
        <TaavDropdownItem iconStart={<Pencil className="h-4 w-4" />} onSelect={() => onEdit(account)}>
          ویرایش
        </TaavDropdownItem>
        <TaavDropdownItem iconStart={<KeyRound className="h-4 w-4" />} onSelect={() => onApiKey(account)}>
          تغییر API Key
        </TaavDropdownItem>
        <TaavDropdownItem
          iconStart={<Power className="h-4 w-4" />}
          tone={account.isActive ? 'warning' : 'success'}
          onSelect={() => void onToggleStatus(account)}
        >
          {account.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
        </TaavDropdownItem>
        {!account.isSystem ? (
          <>
            <TaavDropdownSeparator />
            <TaavDropdownItem
              tone="danger"
              iconStart={<Trash2 className="h-4 w-4" />}
              description="غیرقابل بازگشت"
              onSelect={(event) => {
                event.preventDefault();
                void onDelete(account);
              }}
            >
              حذف اکانت
            </TaavDropdownItem>
          </>
        ) : null}
      </TaavDropdownContent>
    </TaavDropdown>
  );
}

export function AiAccountsSettingsV2Client({ initialData }: Props) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [listError, setListError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AiProviderAccountV2ListItem | null>(null);
  const [form, setForm] = useState<AccountFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);

  const statCards = useMemo(
    () => [
      { label: 'تعداد اکانت‌ها', value: formatFaNumber(data.summary.totalAccounts) },
      { label: 'اکانت‌های فعال', value: formatFaNumber(data.summary.activeAccounts) },
      { label: 'کل اعتبار', value: formatUsd(data.summary.totalCreditUsd) },
      { label: 'مصرف‌شده', value: formatUsd(data.summary.totalUsedCreditUsd) },
      { label: 'باقی‌مانده', value: formatUsd(data.summary.totalRemainingCreditUsd) },
    ],
    [data.summary],
  );

  const refresh = async () => {
    setRefreshing(true);
    setListError(null);
    try {
      const res = await fetch('/api/settings/ai-accounts-v2');
      const payload = (await res.json().catch(() => null)) as AiProviderAccountV2ListResponse | null;
      if (!res.ok || !payload) {
        setListError((payload as any)?.message ?? 'بارگذاری اکانت‌ها انجام نشد.');
        return;
      }
      setData(payload);
    } catch {
      setListError('بارگذاری اکانت‌ها انجام نشد.');
    } finally {
      setRefreshing(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (account: AiProviderAccountV2ListItem) => {
    setEditing(account);
    setForm(toFormState(account));
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (formLoading) return;
    setDialogOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const submit = async () => {
    setFormError(null);
    setFormLoading(true);

    if (!form.name.trim()) {
      setFormError('نام اکانت الزامی است.');
      setFormLoading(false);
      return;
    }
    if (!editing && !form.apiKey.trim()) {
      setFormError('API Key الزامی است.');
      setFormLoading(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      providerType: form.providerType,
      apiKey: form.apiKey.trim() || undefined,
      endpoint: form.endpoint.trim() || null,
      apiVersion: form.apiVersion.trim() || null,
      billingEmail: form.billingEmail.trim() || null,
      description: form.description.trim() || null,
      isActive: form.isActive,
    };

    try {
      const res = await fetch(editing ? `/api/settings/ai-accounts-v2/${editing.id}` : '/api/settings/ai-accounts-v2', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setFormError(result?.message ?? 'ذخیره اکانت انجام نشد.');
        return;
      }
      setActionFeedback(editing ? 'اکانت به‌روزرسانی شد.' : 'اکانت ایجاد شد.');
      closeDialog();
      await refresh();
    } catch {
      setFormError('ذخیره اکانت انجام نشد.');
    } finally {
      setFormLoading(false);
    }
  };

  const toggleStatus = async (account: AiProviderAccountV2ListItem) => {
    setActionFeedback(null);
    const res = await fetch(`/api/settings/ai-accounts-v2/${account.id}/toggle-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !account.isActive }),
    });
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { message?: string } | null;
      setListError(payload?.message ?? 'تغییر وضعیت انجام نشد.');
      return;
    }
    setActionFeedback(account.isActive ? 'اکانت غیرفعال شد.' : 'اکانت فعال شد.');
    await refresh();
  };

  const deleteAccount = async (account: AiProviderAccountV2ListItem) => {
    if (account.isSystem) return;
    const confirmed = window.confirm(`آیا مطمئن هستید که می‌خواهید اکانت «${account.name}» را حذف کنید؟`);
    if (!confirmed) return;

    setActionFeedback(null);
    const res = await fetch(`/api/settings/ai-accounts-v2/${account.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { message?: string } | null;
      setListError(payload?.message ?? 'حذف اکانت انجام نشد.');
      return;
    }
    setActionFeedback('اکانت حذف شد.');
    await refresh();
  };

  const openApiKeyDialog = (account: AiProviderAccountV2ListItem) => {
    setEditing(account);
    setApiKeyValue('');
    setApiKeyError(null);
    setApiKeyDialogOpen(true);
  };

  const closeApiKeyDialog = () => {
    if (apiKeyLoading) return;
    setApiKeyDialogOpen(false);
    setApiKeyValue('');
    setApiKeyError(null);
  };

  const changeApiKey = async () => {
    if (!editing) return;
    setApiKeyError(null);
    setApiKeyLoading(true);
    const apiKey = apiKeyValue.trim();
    if (!apiKey) {
      setApiKeyError('API Key الزامی است.');
      setApiKeyLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/settings/ai-accounts-v2/${editing.id}/change-api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });
      const payload = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setApiKeyError(payload?.message ?? 'تغییر API Key انجام نشد.');
        return;
      }
      setActionFeedback('API Key به‌روزرسانی شد.');
      closeApiKeyDialog();
      await refresh();
    } catch {
      setApiKeyError('تغییر API Key انجام نشد.');
    } finally {
      setApiKeyLoading(false);
    }
  };

  return (
    <div className="business-settings-page-shell" dir="rtl" lang="fa">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-1">
          <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">پنل تاو ادمین</span>
          <h1 className="m-0 text-[length:var(--taav-text-xl)] font-black text-[var(--taav-text-strong)]">
            اکانت‌های Provider
          </h1>
          <p className="m-0 max-w-2xl text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
            مدیریت اتصال Providerها، اعتبار، مدل‌ها و قیمت‌گذاری.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TaavButton iconStart={<Plus className="h-4 w-4" />} onClick={openCreate}>
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

      <TaavCard variant="outlined" padding="lg" radius="xl">
        <div className="ai-lab-stat-grid">
          {statCards.map((card) => (
            <div key={card.label} className="grid gap-1">
              <span className="text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">{card.label}</span>
              <strong className="text-[length:var(--taav-text-sm)] text-[var(--taav-text-strong)]">{card.value}</strong>
            </div>
          ))}
        </div>
      </TaavCard>

      <TaavCard variant="outlined" padding="lg" radius="xl">
        <div className="mb-4 grid gap-1">
          <h2 className="m-0 text-[length:var(--taav-text-lg)] font-black text-[var(--taav-text-strong)]">لیست اکانت‌ها</h2>
          <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
            {refreshing ? 'در حال به‌روزرسانی...' : `${formatFaNumber(data.accounts.length)} اکانت ثبت‌شده`}
          </p>
        </div>

        {refreshing ? (
          <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">در حال به‌روزرسانی...</p>
        ) : data.accounts.length === 0 ? (
          <TaavEmptyState
            variant="default"
            title="هنوز اکانتی تعریف نشده است."
            description="برای شروع، اولین اکانت Provider را اضافه کنید."
            primaryAction={
              <TaavButton iconStart={<Plus className="h-4 w-4" />} onClick={openCreate}>
                افزودن اکانت
              </TaavButton>
            }
          />
        ) : (
          <div className="ai-provider-account-list">
            {data.accounts.map((account) => (
              <article key={account.id} className="ai-provider-account-card">
                <div className="ai-provider-account-card-header">
                  <AccountCardActions
                    account={account}
                    onModels={(item) => router.push(`/settings/ai-accounts/${item.id}`)}
                    onEdit={openEdit}
                    onApiKey={openApiKeyDialog}
                    onToggleStatus={toggleStatus}
                    onDelete={deleteAccount}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="m-0 truncate text-[length:var(--taav-text-md)] font-black text-[var(--taav-text-strong)]">
                        {account.name}
                      </h3>
                      {account.isSystem ? (
                        <TaavBadge tone="info" variant="soft" size="sm">
                          <span className="ai-lab-system-badge">
                            <Shield className="h-3 w-3" />
                            سیستمی
                          </span>
                        </TaavBadge>
                      ) : null}
                      <TaavBadge tone={account.isActive ? 'success' : 'neutral'} variant="soft" size="sm">
                        {account.isActive ? 'فعال' : 'غیرفعال'}
                      </TaavBadge>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]">
                      <TaavBadge tone="brand" variant="soft" size="sm">
                        {account.providerLabel}
                      </TaavBadge>
                      <span className="font-mono" dir="ltr">
                        {account.apiKeyMasked}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ai-provider-account-metrics">
                  <div className="ai-provider-account-metric">
                    <span>اعتبار کل</span>
                    <strong>{formatUsd(account.credit.totalCreditUsd)}</strong>
                  </div>
                  <div className="ai-provider-account-metric">
                    <span>مصرف‌شده</span>
                    <strong>{formatUsd(account.credit.usedCreditUsd)}</strong>
                  </div>
                  <div className="ai-provider-account-metric">
                    <span>باقی‌مانده</span>
                    <strong>{formatUsd(account.credit.remainingCreditUsd)}</strong>
                  </div>
                  <div className="ai-provider-account-metric">
                    <span>مدل‌ها</span>
                    <strong>
                      {formatFaNumber(account.activeModelCount)} / {formatFaNumber(account.totalModelCount)}
                    </strong>
                    <small>فعال / کل</small>
                  </div>
                </div>

                <p className="ai-provider-account-footer">آخرین بروزرسانی: {formatFaDateTime(account.updatedAt)}</p>
              </article>
            ))}
          </div>
        )}
      </TaavCard>

      <TaavDialog open={dialogOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDialog())}>
        <TaavDialogContent size="lg" contentClassName="ai-lab-dialog max-h-[min(90vh,680px)] overflow-y-auto">
          <TaavDialogHeader>
            <TaavDialogTitle>{editing ? 'ویرایش اکانت' : 'افزودن اکانت'}</TaavDialogTitle>
            <TaavDialogDescription>
              {editing ? 'اطلاعات اتصال و مدیریت را به‌روزرسانی کنید.' : 'اکانت Provider را ثبت کنید. تراکنش‌های اعتبار از صفحه اکانت مدیریت می‌شود.'}
            </TaavDialogDescription>
          </TaavDialogHeader>

          <div className="grid gap-4">
            <FormSection title="اطلاعات اکانت">
              <TaavFieldBlock label="نام اکانت" required htmlFor="v2-account-name">
                <TaavInput id="v2-account-name" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} />
              </TaavFieldBlock>

              <TaavFieldBlock label="ارائه‌دهنده" required>
                {editing?.isSystem ? (
                  <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-text-muted)]">
                    Provider اکانت سیستمی قابل تغییر نیست:{' '}
                    <strong className="text-[var(--taav-text-strong)]">{AI_PROVIDER_LABELS_V2[form.providerType]}</strong>
                  </p>
                ) : (
                  <TaavChoiceChipGroup
                    ariaLabel="ارائه‌دهنده"
                    options={PROVIDER_OPTIONS}
                    value={form.providerType}
                    onValueChange={(value) => {
                      const next = Array.isArray(value) ? value[0] : value;
                      if (!next) return;
                      setForm((c) => ({ ...c, providerType: next as AiProviderTypeV2 }));
                    }}
                    size="sm"
                    tone="brand"
                    gap="sm"
                    wrap
                  />
                )}
              </TaavFieldBlock>

              <TaavFieldBlock label="API Key" required={!editing} htmlFor="v2-account-api-key">
                {editing ? (
                  <p className="m-0 mb-2 font-mono text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]" dir="ltr">
                    {editing.apiKeyMasked}
                  </p>
                ) : null}
                <TaavInput
                  id="v2-account-api-key"
                  type="password"
                  autoComplete="off"
                  value={form.apiKey}
                  onChange={(e) => setForm((c) => ({ ...c, apiKey: e.target.value }))}
                  placeholder={editing ? 'برای تغییر، از اکشن API Key استفاده کنید' : 'sk-...'}
                  dir="ltr"
                  disabled={Boolean(editing)}
                />
              </TaavFieldBlock>
            </FormSection>

            <FormSection title="اتصال و مالی">
              <div className="grid gap-3 sm:grid-cols-2">
                <TaavFieldBlock label="Endpoint" htmlFor="v2-account-endpoint">
                  <TaavInput id="v2-account-endpoint" value={form.endpoint} onChange={(e) => setForm((c) => ({ ...c, endpoint: e.target.value }))} dir="ltr" />
                </TaavFieldBlock>
                <TaavFieldBlock label="API Version" htmlFor="v2-account-api-version">
                  <TaavInput id="v2-account-api-version" value={form.apiVersion} onChange={(e) => setForm((c) => ({ ...c, apiVersion: e.target.value }))} dir="ltr" />
                </TaavFieldBlock>
                <TaavFieldBlock label="Billing Email" htmlFor="v2-account-billing-email">
                  <TaavInput id="v2-account-billing-email" type="email" value={form.billingEmail} onChange={(e) => setForm((c) => ({ ...c, billingEmail: e.target.value }))} dir="ltr" />
                </TaavFieldBlock>
                <TaavFieldBlock label="وضعیت" required>
                  <TaavChoiceChipGroup
                    ariaLabel="وضعیت"
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
              </div>
            </FormSection>

            <FormSection title="توضیحات">
              <TaavFieldBlock label="توضیحات" htmlFor="v2-account-description">
                <TaavTextarea id="v2-account-description" rows={3} value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} />
              </TaavFieldBlock>
            </FormSection>

            {formError ? <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">{formError}</p> : null}
          </div>

          <TaavDialogFooter>
            <TaavButton variant="secondary" onClick={closeDialog} disabled={formLoading}>
              انصراف
            </TaavButton>
            <TaavButton onClick={submit} disabled={formLoading}>
              {formLoading ? 'در حال ذخیره...' : editing ? 'ذخیره تغییرات' : 'ایجاد اکانت'}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>

      <TaavDialog open={apiKeyDialogOpen} onOpenChange={(open) => (open ? setApiKeyDialogOpen(true) : closeApiKeyDialog())}>
        <TaavDialogContent size="md" contentClassName="ai-lab-dialog max-h-[min(90vh,520px)] overflow-y-auto">
          <TaavDialogHeader>
            <TaavDialogTitle>تغییر API Key</TaavDialogTitle>
            <TaavDialogDescription>
              کلید واقعی فقط ذخیره می‌شود و در خواندن‌ها برگردانده نمی‌شود. مقدار Mask شده همچنان قابل نمایش است.
            </TaavDialogDescription>
          </TaavDialogHeader>

          <div className="grid gap-3">
            {editing ? (
              <p className="m-0 font-mono text-[length:var(--taav-text-xs)] text-[var(--taav-text-muted)]" dir="ltr">
                {editing.apiKeyMasked}
              </p>
            ) : null}
            <TaavFieldBlock label="API Key جدید" required htmlFor="v2-account-new-api-key">
              <TaavInput id="v2-account-new-api-key" type="password" value={apiKeyValue} onChange={(e) => setApiKeyValue(e.target.value)} dir="ltr" />
            </TaavFieldBlock>
            {apiKeyError ? <p className="m-0 text-[length:var(--taav-text-sm)] text-[var(--taav-danger-strong)]">{apiKeyError}</p> : null}
          </div>

          <TaavDialogFooter>
            <TaavButton variant="secondary" onClick={closeApiKeyDialog} disabled={apiKeyLoading}>
              انصراف
            </TaavButton>
            <TaavButton onClick={changeApiKey} disabled={apiKeyLoading}>
              {apiKeyLoading ? 'در حال ذخیره...' : 'ذخیره'}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
    </div>
  );
}

