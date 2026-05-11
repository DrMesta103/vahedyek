'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, MoreVertical, Plus, Settings2, ShieldCheck, Trash2, UsersRound } from 'lucide-react';
import type { ApprovalUsageKey } from '../../../../lib/contractApprovalAccess';
import type { WorkflowStepDefinition } from '../../../../lib/workflowTypes';
import { approvalUsageOptions } from '../../_components/approvalProcessConfig';
import { SectionCard } from '../../../contracts/new/_components/ContractFormPrimitives';
import {
  deleteApprovalWorkflowAction,
  listApprovalWorkflowsAction,
  listTenantMembersForApproversAction,
} from '../../../../actions/workflowActions';

type UserOpt = { id: string; label: string };

function uniqueLabels(ids: string[], users: UserOpt[]) {
  const labels = ids.map((id) => users.find((u) => u.id === id)?.label ?? id);
  return Array.from(new Set(labels));
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
      steps: WorkflowStepDefinition[];
      updatedAt: string;
    }>
  >([]);
  const [users, setUsers] = useState<UserOpt[]>([]);
  const [error, setError] = useState('');
  const [openMenuId, setOpenMenuId] = useState('');

  const refresh = useCallback(() => {
    startTransition(async () => {
      const [res, usersRes] = await Promise.all([listApprovalWorkflowsAction(), listTenantMembersForApproversAction()]);
      if (!res.ok) {
        setError(res.message ?? 'خطا در دریافت فهرست.');
        return;
      }
      if (usersRes.ok) setUsers(usersRes.users as UserOpt[]);
      setError('');
      setItems(res.items as any);
    });
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
      approvalUsageOptions.flatMap((usage) => {
        const usageKey = usage.id as ApprovalUsageKey;
        const w = items.find((item) => (item.usageTypes ?? []).includes(usageKey));
        if (!w) return [];

        const steps = Array.isArray(w.steps) ? w.steps : [];
        const allApproverIds = steps.flatMap((step) => (Array.isArray(step.approvers) ? step.approvers : []));
        const approverNames = uniqueLabels(allApproverIds, users);
        const finalStepNames = uniqueLabels(
          steps.map((step) => step.finalApproverId).filter(Boolean) as string[],
          users,
        );
        const finalProcessName = w.finalApproverUserId ? users.find((u) => u.id === w.finalApproverUserId)?.label ?? w.finalApproverUserId : '';
        return [{
          isConfigured: true as const,
          ...w,
          usageKey,
          usageText: usage.shortTitle,
          stepCount: steps.length,
          processingText: steps[0]?.type === 'SEQUENTIAL' ? 'مرحله‌به‌مرحله' : 'بدون ترتیب',
          processingHint: steps[0]?.type === 'SEQUENTIAL' ? 'ترتیب مراحل رعایت می‌شود' : 'مراحل مستقل از ترتیب رأی می‌گیرند',
          approverCount: allApproverIds.length,
          approverNames,
          approverPreview: approverNames.slice(0, 4),
          hasMoreApprovers: approverNames.length > 4,
          incompleteStepCount: steps.filter((step) => !step.approvers?.length).length,
          finalStepApproverCount: steps.filter((step) => Boolean(step.finalApproverId)).length,
          finalStepNames,
          minimumLogicCount: steps.filter((step) => step.logic?.mode === 'MINIMUM_COUNT').length,
          allMustApproveCount: steps.filter((step) => step.logic?.mode !== 'MINIMUM_COUNT').length,
          stepPreview: steps.length
            ? steps
                .slice(0, 3)
                .map((step, index) => step.title?.trim() || `مرحله ${index + 1}`)
                .join('، ')
            : 'بدون مرحله',
          hasMoreSteps: steps.length > 3,
          buyerText: w.buyerShouldApprove ? 'خریدار هم رأی می‌دهد' : 'بدون رأی خریدار',
          finalText: finalProcessName ? `نهایی کل: ${finalProcessName}` : 'بدون نهایی کل',
          updatedText: new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(new Date(w.updatedAt)),
        }];
      }),
    [items, users],
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

      <div className="space-y-4">
        {cards.map((w) => {
          return (
            <SectionCard key={w.id} className="group overflow-visible border-slate-200 bg-white shadow-sm transition hover:border-teal-200 hover:shadow-md">
              <div className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 text-right">
                    <h2 className="text-[15px] font-black leading-6 text-[var(--text-strong)]">{w.title}</h2>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-700">{w.usageText}</span>
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-normal text-slate-500">{w.processingText}</span>
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-normal text-slate-500">{w.buyerText}</span>
                      <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-normal text-slate-500">
                        <b className="text-[var(--text-strong)]">{w.stepCount}</b> مرحله
                      </span>
                      <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-normal text-slate-500">
                        <b className="text-[var(--text-strong)]">{w.approverCount}</b> رأی‌دهنده
                      </span>
                      <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-normal text-slate-500">
                        <b className="text-[var(--text-strong)]">{w.finalStepApproverCount}</b> نهایی
                      </span>
                    </div>
                  </div>
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
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

                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="grid gap-2 text-right text-[11px] font-normal text-slate-600">
                  <div className="rounded-xl border border-slate-100 px-3 py-1.5">
                    <span className="block text-[10px] font-bold text-slate-400">مراحل</span>
                    <span className="mt-0.5 block truncate leading-5 text-slate-700">
                      {w.stepPreview}
                      {w.hasMoreSteps ? ' و مراحل دیگر' : ''}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-100 px-3 py-1.5">
                    <span className="block text-[10px] font-bold text-slate-400">تأییدکنندگان</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {w.approverPreview.length ? (
                        w.approverPreview.map((name) => (
                          <span key={name} className="max-w-full truncate rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-normal text-slate-600">
                            {name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400">ثبت نشده</span>
                      )}
                      {w.hasMoreApprovers ? <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-500">+{w.approverNames.length - 4}</span> : null}
                    </div>
                  </div>
                  </div>
                  <div className="grid gap-2 text-right text-[11px] font-normal text-slate-600">
                  <div className="rounded-xl bg-slate-50/80 px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <UsersRound className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      <span className="truncate">{w.processingHint}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      <span className="truncate">{w.finalText}</span>
                    </div>
                    {w.finalStepNames.length ? (
                      <div className="mt-1.5 truncate text-[10px] leading-5 text-slate-500">
                        نهایی مرحله: {w.finalStepNames.slice(0, 2).join('، ')}
                        {w.finalStepNames.length > 2 ? ' و دیگران' : ''}
                      </div>
                    ) : null}
                    <div className="mt-1.5 truncate text-[10px] leading-5 text-slate-500">
                      {w.allMustApproveCount} تأیید کامل، {w.minimumLogicCount} حد نصاب
                      {w.incompleteStepCount ? `، ${w.incompleteStepCount} ناقص` : ''}
                    </div>
                  </div>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-1.5 text-[10px] font-normal text-slate-400">
                      <CalendarClock className="h-3.5 w-3.5" aria-hidden />
                      <span>آخرین تغییر: {w.updatedText}</span>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}

