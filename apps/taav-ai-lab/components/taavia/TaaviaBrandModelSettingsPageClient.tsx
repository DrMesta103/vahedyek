'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, Cpu, History, Loader2, Save } from 'lucide-react';
import { TaavBadge, TaavButton } from '@repo/ui/taav/primitives';
import { getPurposeCompatibility, TAAVIA_PURPOSE_LABELS, type TaaviaBrandAiModelPurpose } from '@/app/lib/taavia-ai-models';

type Model = { id: string; name: string; providerModelId: string; modelType: string; isActive: boolean; capabilities: string[]; pricing: Array<{ metric: string; unit: string; unitQuantity: number; priceUsd: number }> };
type Account = { id: string; name: string; providerType: string; isActive: boolean; models: Model[] };
type Assignment = { id: string; purpose: string; aiProviderAccountId: string; aiProviderModelId: string; effectiveFrom: string; effectiveTo: string | null; assignedBy: string; endedBy: string | null; account: { name: string; providerType: string; isActive: boolean }; model: Model };
type SettingsData = { brand: { id: string; tenantId: string; name: string; description: string | null; status: string; setupMode: string; icon: { previewData?: string | null } | null }; purposes: Array<{ code: TaaviaBrandAiModelPurpose; label: string; description: string }>; assignments: Assignment[]; accounts: Account[]; lastAssignmentChange: string | null };

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('fa-IR') : '—';
}

export function TaaviaBrandModelSettingsPageClient({ tenantId, brandId, initialData }: { tenantId: string; brandId: string; initialData: SettingsData }) {
  const [data, setData] = useState(initialData);
  const [selectedAccount, setSelectedAccount] = useState<Record<string, string>>({});
  const [selectedModel, setSelectedModel] = useState<Record<string, string>>({});
  const [savingPurpose, setSavingPurpose] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyPurpose, setHistoryPurpose] = useState<string | null>(null);
  const [history, setHistory] = useState<Assignment[]>([]);

  const assignments = useMemo(() => new Map(data.assignments.map((assignment) => [assignment.purpose, assignment])), [data.assignments]);

  const openHistory = async (purpose: string) => {
    setHistoryPurpose(purpose);
    const response = await fetch(`/api/businesses/${tenantId}/taavia/brands/${brandId}/model-assignments/history?purpose=${purpose}`);
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
      const response = await fetch(`/api/businesses/${tenantId}/taavia/brands/${brandId}/model-assignments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ purpose, aiProviderAccountId: accountId, aiProviderModelId: modelId }) });
      const payload = (await response.json().catch(() => null)) as { assignment?: Assignment; message?: string } | null;
      if (!response.ok || !payload?.assignment) throw new Error(payload?.message ?? 'ذخیره تخصیص انجام نشد.');
      setData((currentData) => ({ ...currentData, assignments: [...currentData.assignments.filter((item) => item.purpose !== purpose), payload.assignment!], lastAssignmentChange: payload.assignment!.effectiveFrom }));
      setFeedback('تخصیص مدل با موفقیت ذخیره شد.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'ذخیره تخصیص انجام نشد.');
    } finally {
      setSavingPurpose(null);
    }
  };

  return (
    <div dir="rtl" className="mx-auto grid max-w-7xl gap-6 pb-10">
      <header className="rounded-3xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-5 shadow-[var(--taav-shadow-sm)] md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[var(--taav-brand-soft)] text-lg font-black text-[var(--taav-brand-strong)]">
              {data.brand.icon?.previewData ? <img src={data.brand.icon.previewData} alt="" className="h-full w-full object-cover" /> : data.brand.name.slice(0, 2)}
            </div>
            <div>
              <div className="mb-1 text-sm text-[var(--taav-text-muted)]">تنظیمات هوش مصنوعی برند</div>
              <h1 className="m-0 text-2xl font-black text-[var(--taav-text-strong)]">{data.brand.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--taav-text-muted)]">برای هر نوع مدل فنی، حساب ارائه‌دهنده و مدل مستقل انتخاب کنید. هر تغییر به‌صورت تاریخی ثبت می‌شود.</p>
            </div>
          </div>
          <Link href={`/businesses/${tenantId}/products/taavia/brands/${brandId}`}>
            <TaavButton variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
              بازگشت به داشبورد برند
            </TaavButton>
          </Link>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <TaavBadge tone={data.brand.status === 'ACTIVE' ? 'success' : 'warning'} variant="soft">{data.brand.status === 'ACTIVE' ? 'فعال' : data.brand.status}</TaavBadge>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--taav-surface-soft)] px-3 py-2 text-[var(--taav-text-muted)]"><CheckCircle2 className="h-4 w-4" />{data.assignments.length} نوع مدل تنظیم‌شده</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--taav-surface-soft)] px-3 py-2 text-[var(--taav-text-muted)]"><Clock3 className="h-4 w-4" />آخرین تغییر: {formatDate(data.lastAssignmentChange)}</span>
        </div>
      </header>

      {error ? <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}
      {feedback ? <div role="status" className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">{feedback}</div> : null}

      <div className="grid gap-4">
        {data.purposes.map((purpose) => {
          const current = assignments.get(purpose.code);
          const accountId = selectedAccount[purpose.code] ?? current?.aiProviderAccountId ?? '';
          const account = data.accounts.find((item) => item.id === accountId);
          const modelId = selectedModel[purpose.code] ?? current?.aiProviderModelId ?? '';
          const compatibleModels = account?.models.filter((model) => model.isActive && getPurposeCompatibility(purpose.code, model).compatible) ?? [];
          const saving = savingPurpose === purpose.code;
          return (
            <section key={purpose.code} className="rounded-3xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-5 md:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--taav-brand-soft)] font-black text-[var(--taav-brand-strong)]"><Cpu className="h-5 w-5" /></div>
                  <div><h2 className="m-0 text-lg font-bold text-[var(--taav-text-strong)]">{purpose.label}</h2><p className="mt-1 text-sm text-[var(--taav-text-muted)]">{purpose.description}</p></div>
                </div>
                <button type="button" onClick={() => void openHistory(purpose.code)} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm text-[var(--taav-brand-strong)] transition hover:bg-[var(--taav-brand-soft)]"><History className="h-4 w-4" />مشاهده تاریخچه</button>
              </div>
              <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_1fr_1.15fr]">
                <div className="rounded-2xl bg-[var(--taav-surface-soft)] p-4"><div className="mb-2 text-xs text-[var(--taav-text-muted)]">تخصیص فعال</div>{current ? <><div className="font-bold text-[var(--taav-text-strong)]">{current.model.name}</div><div className="mt-1 text-sm text-[var(--taav-text-muted)]">{current.account.name} · از {formatDate(current.effectiveFrom)}</div></> : <div className="text-sm text-[var(--taav-text-muted)]">برای این نوع مدل هنوز تخصیصی انتخاب نشده است.</div>}</div>
                <label className="grid gap-2 text-sm font-medium text-[var(--taav-text-strong)]">حساب ارائه‌دهنده<select value={accountId} onChange={(event) => { setSelectedAccount((value) => ({ ...value, [purpose.code]: event.target.value })); setSelectedModel((value) => ({ ...value, [purpose.code]: '' })); }} className="min-h-12 rounded-xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 text-[var(--taav-text-strong)]"><option value="">انتخاب حساب</option>{data.accounts.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.providerType}</option>)}</select></label>
                <label className="grid gap-2 text-sm font-medium text-[var(--taav-text-strong)]">مدل سازگار<select value={modelId} disabled={!accountId} onChange={(event) => setSelectedModel((value) => ({ ...value, [purpose.code]: event.target.value }))} className="min-h-12 rounded-xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 text-[var(--taav-text-strong)]"><option value="">انتخاب مدل</option>{compatibleModels.map((model) => <option key={model.id} value={model.id}>{model.name} · {model.modelType}</option>)}</select></label>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><div className="text-xs text-[var(--taav-text-muted)]">فقط مدل‌هایی با همین نوع فنی از حساب انتخاب‌شده نمایش داده می‌شوند.</div><TaavButton disabled={!accountId || !modelId || saving} onClick={() => void save(purpose.code)} iconStart={saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}>{saving ? 'در حال ذخیره…' : 'ذخیره تخصیص'}</TaavButton></div>
            </section>
          );
        })}
      </div>

      {historyPurpose ? <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 md:items-center" role="dialog" aria-modal="true"><div className="max-h-[85vh] w-full max-w-2xl overflow-auto rounded-3xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-5"><div className="flex items-center justify-between"><h2 className="text-lg font-bold">تاریخچه {TAAVIA_PURPOSE_LABELS[historyPurpose as TaaviaBrandAiModelPurpose]}</h2><button type="button" className="min-h-11 rounded-xl px-3 text-sm text-[var(--taav-text-muted)] hover:bg-[var(--taav-surface-soft)]" onClick={() => setHistoryPurpose(null)}>بستن</button></div><div className="mt-4 grid gap-3">{history.length ? history.map((item) => <div key={item.id} className="rounded-2xl bg-[var(--taav-surface-soft)] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{item.model.name}</strong><TaavBadge tone={item.effectiveTo ? 'neutral' : 'success'} variant="soft">{item.effectiveTo ? 'پایان‌یافته' : 'فعال'}</TaavBadge></div><div className="mt-2 text-sm text-[var(--taav-text-muted)]">{item.account.name} · {formatDate(item.effectiveFrom)} تا {formatDate(item.effectiveTo)} · تخصیص‌دهنده: {item.assignedBy}</div></div>) : <div className="rounded-2xl bg-[var(--taav-surface-soft)] p-5 text-sm text-[var(--taav-text-muted)]">تاریخچه‌ای ثبت نشده است.</div>}</div></div></div> : null}
    </div>
  );
}
