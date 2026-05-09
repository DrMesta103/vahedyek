'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Settings2, Trash2 } from 'lucide-react';
import type { ApprovalUsageKey } from '../../../../lib/contractApprovalAccess';
import type { WorkflowStepDefinition } from '../../../../lib/workflowTypes';
import { approvalUsageOptions } from '../../_components/approvalProcessConfig';
import { SectionCard, SectionHeader } from '../../../contracts/new/_components/ContractFormPrimitives';
import {
  createApprovalWorkflowAction,
  deleteApprovalWorkflowAction,
  listApprovalWorkflowsAction,
} from '../../../../actions/workflowActions';

function newStepId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `step-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

function defaultStep(): WorkflowStepDefinition {
  return {
    id: newStepId(),
    title: 'مرحله جدید',
    approvers: [],
    logic: { mode: 'ALL_MUST_APPROVE' },
    type: 'PARALLEL',
    permissions: { rejectToDraftApproverIds: 'ALL_APPROVERS', requestRevisionApproverIds: 'ALL_APPROVERS' },
    isFinal: false,
  };
}

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
      active: boolean;
      updatedAt: string;
    }>
  >([]);
  const [error, setError] = useState('');

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
    startTransition(async () => {
      setError('');
      if (!firstUnusedUsageKey) {
        setError('برای همهٔ انواع کاربری، فرایند تعریف شده است. برای ساخت فرایند جدید ابتدا یک فرایند موجود را حذف/غیرفعال کنید.');
        return;
      }
      const res = await createApprovalWorkflowAction({
        title: 'فرایند جدید',
        usageTypes: [firstUnusedUsageKey],
        steps: [defaultStep()],
        buyerShouldApprove: true,
        active: true,
      });
      if (!res.ok) {
        setError('message' in res ? res.message : 'ایجاد نشد.');
        return;
      }
      if ('id' in res && res.id) router.push(`/business-settings/approval-process/${res.id}`);
    });
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
      })),
    [items],
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 lg:px-8" dir="rtl" lang="fa">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row-reverse sm:items-center sm:justify-between">
        <div className="text-right">
          <h1 className="text-2xl font-black text-[var(--text-strong)]">فرایندهای تأیید</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
            برای هر نوع کاربری واحد، یک فرایند فعال تعریف کنید. مدیریت هر فرایند در صفحهٔ جداگانه انجام می‌شود.
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
            <SectionCard key={w.id} className="p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 text-right">
                  <div className="flex flex-row-reverse flex-wrap items-center justify-end gap-2">
                    <h2 className="truncate text-[14px] font-black text-[var(--text-strong)]">{w.title}</h2>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                        w.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {w.active ? 'فعال' : 'غیرفعال'}
                    </span>
                  </div>
                  <div className="mt-2 text-[12px] font-semibold text-[var(--text-muted)]">{w.usageText}</div>
                </div>
              </div>

              <div className="mt-4 flex flex-row-reverse flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => router.push(`/business-settings/approval-process/${w.id}`)}
                  disabled={isPending}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-[12px] font-extrabold text-[var(--text-strong)] hover:brightness-[0.98] disabled:opacity-60"
                >
                  <Settings2 className="h-4 w-4" />
                  مدیریت
                </button>
                <button
                  type="button"
                  onClick={() => deleteOne(w.id)}
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2 text-[12px] font-extrabold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                  aria-label="حذف فرایند"
                  title="حذف"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </button>
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}

