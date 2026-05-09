'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, Layers3, MoreVertical, Plus, Settings2, ShieldCheck, Trash2, UsersRound } from 'lucide-react';
import type { ApprovalUsageKey } from '../../../../lib/contractApprovalAccess';
import { approvalUsageOptions } from '../../_components/approvalProcessConfig';
import { SectionCard } from '../../../contracts/new/_components/ContractFormPrimitives';
import {
  deleteApprovalWorkflowAction,
  listApprovalWorkflowsAction,
} from '../../../../actions/workflowActions';

function usageLabel(key: string) {
  return approvalUsageOptions.find((x) => x.id === key)?.shortTitle ?? key;
}

export function WorkflowListClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState<
    Array<{
      id: string;
      title: string;
      usageTypes: ApprovalUsageKey[];
      finalApproverUserId: string | null;
      buyerShouldApprove: boolean;
      steps: unknown[];
      updatedAt: string;
    }>
  >([]);
  const [error, setError] = useState('');
  const [openMenuId, setOpenMenuId] = useState('');

  const refresh = useCallback(() => {
    startTransition(async () => {
      const res = await listApprovalWorkflowsAction();
      if (!res.ok) {
        setError(res.message ?? 'خطا در دریافت فهرست.');
        return;
      }
      setError('');
      setItems(res.items as any);
    });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const empty = items.length === 0;

  const usedUsageKeys = useMemo(() => {
    const set = new Set<string>();
    for (const w of items) {
      for (const k of w.usageTypes ?? []) set.add(String(k));
    }
    return set;
  }, [items]);

  const firstUnusedUsageKey = useMemo(() => {
    return (approvalUsageOptions.map((x) => x.id).find((k) => !usedUsageKeys.has(k)) ?? null) as ApprovalUsageKey | null;
  }, [usedUsageKeys]);

  const createNew = () => {
    setError('');
    if (!firstUnusedUsageKey) {
      setError('برای همهٔ انواع کاربری، فرایند تعریف شده است. برای ساخت فرایند جدید ابتدا یک فرایند موجود را حذف کنید.');
      return;
    }
    router.push('/business-settings/approval-process/new');
  };

  const deleteOne = (id: string) => {
    if (!window.confirm('این فرایند حذف شود؟')) return;
    startTransition(async () => {
      const res = await deleteApprovalWorkflowAction(id);
      if (!res.ok) {
        setError('message' in res ? res.message : 'حذف نشد.');
        return;
      }
      setError('');
      void refresh();
    });
  };

  const cards = useMemo(
    () =>
      items.map((w) => ({
        ...w,
        usageText: (w.usageTypes ?? []).map((k) => usageLabel(k)).join('، ') || '—',
        stepCount: Array.isArray(w.steps) ? w.steps.length : 0,
        processingText: Array.isArray(w.steps) && (w.steps as any[])[0]?.type === 'SEQUENTIAL' ? 'سری' : 'موازی',
        approverCount: Array.isArray(w.steps)
          ? (w.steps as any[]).reduce((sum, step) => sum + (Array.isArray(step?.approvers) ? step.approvers.length : 0), 0)
          : 0,
        buyerText: w.buyerShouldApprove ? 'با تأیید خریدار' : 'بدون تأیید خریدار',
        finalText: w.finalApproverUserId ? 'نهایی کل دارد' : 'نهایی کل ندارد',
        updatedText: new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(new Date(w.updatedAt)),
      })),
    [items],
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 lg:px-8" dir="rtl" lang="fa">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-right">
          <h1 className="text-2xl font-black text-[var(--text-strong)]">فرایندهای تأیید</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
            برای هر نوع کاربری واحد، یک مسیر تأیید تعریف کنید. ساخت فرایند تا زمان ذخیره نهایی در صفحه مدیریت انجام نمی‌شود.
          </p>
        </div>
        <button
          type="button"
          onClick={createNew}
          disabled={isPending || !firstUnusedUsageKey}
          className="app-button app-button-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          فرایند جدید
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-right text-[13px] font-bold text-rose-800">
          {error}
        </div>
      ) : null}

      {empty ? (
        <SectionCard className="p-10 text-center">
          <p className="text-[14px] font-semibold text-[var(--text-muted)]">هنوز هیچ فرایندی تعریف نشده است.</p>
          <button
            type="button"
            onClick={createNew}
            disabled={isPending || !firstUnusedUsageKey}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--dark-teal)] px-5 py-2.5 text-[13px] font-extrabold text-white disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            ساخت اولین فرایند
          </button>
        </SectionCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((w) => (
            <SectionCard key={w.id} className="group overflow-visible border-slate-200 bg-white shadow-sm transition hover:border-teal-200 hover:shadow-md">
              <div className="h-1 bg-gradient-to-l from-[var(--dark-teal)] via-teal-300 to-transparent" />
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-[var(--dark-teal)]">
                    <Layers3 className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1 text-right">
                    <h2 className="truncate text-[14px] font-black text-[var(--text-strong)]">{w.title}</h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-600">{w.usageText}</span>
                      <span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">
                        {w.stepCount} مرحله
                      </span>
                    </div>
                  </div>
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                      aria-label={`گزینه‌های ${w.title}`}
                      onClick={() => setOpenMenuId((current) => (current === w.id ? '' : w.id))}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openMenuId === w.id ? (
                      <div className="absolute left-0 top-10 z-30 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 text-right shadow-lg">
                        <button
                          type="button"
                          onClick={() => router.push(`/business-settings/approval-process/${w.id}`)}
                          disabled={isPending}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                        >
                          <Settings2 className="h-4 w-4" />
                          مدیریت
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteOne(w.id)}
                          disabled={isPending}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                          حذف
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-[11px] font-bold text-slate-600">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                    <UsersRound className="h-4 w-4 text-slate-400" aria-hidden />
                    <span>{w.approverCount} تأییدکننده، پردازش {w.processingText}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                    <ShieldCheck className="h-4 w-4 text-slate-400" aria-hidden />
                    <span>{w.buyerText}، {w.finalText}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                    <CalendarClock className="h-4 w-4 text-slate-400" aria-hidden />
                    <span>آخرین تغییر: {w.updatedText}</span>
                  </div>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}

