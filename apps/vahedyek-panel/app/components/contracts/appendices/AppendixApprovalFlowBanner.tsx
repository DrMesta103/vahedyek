'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, Send, XCircle } from 'lucide-react';
import {
  getAppendixApprovalStateAction,
  recordAppendixApprovalDecisionAction,
  revokeAppendixApprovalDecisionAction,
  submitAppendixApprovalWorkflowAction,
} from '../../../actions/appendixApprovalActions';
import type { AppendixStatus } from '../../../types/contract';

export function AppendixApprovalFlowBanner({ appendixId, appendixStatus }: { appendixId: string; appendixStatus: AppendixStatus }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [stateRes, setStateRes] = useState<Awaited<ReturnType<typeof getAppendixApprovalStateAction>> | null>(null);
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState<'revision' | 'reject' | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAppendixApprovalStateAction(appendixId);
      setStateRes(res);
      if (!res.ok) setError(res.message ?? 'وضعیت فرایند تایید متمم دریافت نشد.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در بارگذاری فرایند تایید متمم.');
    } finally {
      setLoading(false);
    }
  }, [appendixId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const state = stateRes?.ok ? stateRes.state : null;
  const visible = useMemo(() => {
    if (!state) return appendixStatus !== 'completed';
    if (state.mode === 'no_instance') return true;
    return state.status !== 'APPROVED';
  }, [appendixStatus, state]);

  const doSubmit = async () => {
    setBusy('submit');
    setError('');
    const res = await submitAppendixApprovalWorkflowAction(appendixId);
    if (!res.ok) setError(res.message);
    await reload();
    setBusy(null);
  };

  const doDecision = async (decision: 'APPROVE' | 'REQUEST_REVISION' | 'REJECT_TO_DRAFT') => {
    setBusy(decision);
    setError('');
    const res = await recordAppendixApprovalDecisionAction(appendixId, { decision, reason: reason.trim() || undefined });
    if (!res.ok) setError(res.message);
    setMode(null);
    setReason('');
    await reload();
    setBusy(null);
  };

  const doRevoke = async () => {
    setBusy('revoke');
    setError('');
    const res = await revokeAppendixApprovalDecisionAction(appendixId);
    if (!res.ok) setError(res.message);
    await reload();
    setBusy(null);
  };

  if (!visible) return null;

  return (
    <section dir="rtl" className="mb-5 overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => void reload()}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            بروزرسانی
          </button>
          <div className="text-right">
            <div className="text-[11px] font-black text-slate-500">فرایند تایید متمم</div>
            <div className="text-[15px] font-black text-slate-900">
              {state?.mode === 'instance' ? state.workflowTitle : 'متمم در وضعیت پیش‌نویس است'}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4 text-right">
        {error ? <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-bold text-rose-800">{error}</div> : null}

        {state?.mode === 'no_instance' ? (
          <div className="space-y-3">
            <p className="text-[13px] font-semibold leading-7 text-slate-600">
              این متمم هنوز وارد فرایند تایید نشده است. می‌توانید آن را در پیش‌نویس نگه دارید یا به مسیر تایید سازمانی ارسال کنید.
            </p>
            <button
              type="button"
              onClick={() => void doSubmit()}
              disabled={busy !== null}
              className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[color-mix(in_srgb,var(--dark-teal)_92%,black)] px-5 text-[13px] font-extrabold text-white disabled:opacity-55"
            >
              {busy === 'submit' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              ارسال به فرایند تایید
            </button>
          </div>
        ) : null}

        {state?.mode === 'instance' ? (
          <div className="space-y-4">
            <div className="rounded-[8px] border border-slate-200 bg-slate-50/50 p-4">
              <div className="text-[13px] font-black text-slate-800">مرحله جاری: {state.currentStep?.title ?? '—'}</div>
              <div className="mt-1 text-[12px] font-semibold text-slate-500">
                وضعیت: {state.status === 'IN_REVIEW' ? 'در انتظار تصمیم' : state.status === 'REVISION_REQUESTED' ? 'نیاز به اصلاح' : 'رد شده'}
              </div>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                {state.steps.map((step, index) => (
                  <span
                    key={step.id}
                    className={`rounded-full border px-3 py-1 text-[11px] font-black ${
                      index === state.currentStepIndex
                        ? 'border-cyan-300 bg-cyan-50 text-cyan-900'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {index + 1}. {step.title}
                  </span>
                ))}
              </div>
            </div>

            {state.viewerHasDecidedCurrentStep ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void doRevoke()}
                  disabled={busy !== null}
                  className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 text-[12px] font-extrabold text-slate-700 disabled:opacity-55"
                >
                  حذف رأی من
                </button>
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-2">
              {state.capabilities.canApprove ? (
                <button
                  type="button"
                  onClick={() => void doDecision('APPROVE')}
                  disabled={busy !== null}
                  className="inline-flex h-11 items-center gap-2 rounded-[8px] bg-[color-mix(in_srgb,var(--dark-teal)_92%,black)] px-5 text-[13px] font-extrabold text-white disabled:opacity-55"
                >
                  {busy === 'APPROVE' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  تایید مرحله
                </button>
              ) : null}
              {state.capabilities.canRequestRevision ? (
                <button
                  type="button"
                  onClick={() => setMode(mode === 'revision' ? null : 'revision')}
                  disabled={busy !== null}
                  className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-amber-300 bg-amber-50 px-5 text-[13px] font-extrabold text-amber-900 disabled:opacity-55"
                >
                  درخواست اصلاح
                </button>
              ) : null}
              {state.capabilities.canRejectToDraft ? (
                <button
                  type="button"
                  onClick={() => setMode(mode === 'reject' ? null : 'reject')}
                  disabled={busy !== null}
                  className="inline-flex h-11 items-center gap-2 rounded-[8px] border border-rose-300 bg-rose-50 px-5 text-[13px] font-extrabold text-rose-900 disabled:opacity-55"
                >
                  <XCircle className="h-4 w-4" />
                  رد و بازگشت به پیش‌نویس
                </button>
              ) : null}
            </div>

            {mode ? (
              <div className="rounded-[8px] border border-slate-200 bg-white p-4">
                <label className="mb-2 block text-[12px] font-extrabold text-slate-800">
                  {mode === 'revision' ? 'توضیح اصلاحیه' : 'علت رد کامل'}
                </label>
                <textarea value={reason} onChange={(event) => setReason(event.target.value)} className="app-textarea min-h-[120px]" />
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void doDecision(mode === 'revision' ? 'REQUEST_REVISION' : 'REJECT_TO_DRAFT')}
                    disabled={busy !== null}
                    className="rounded-[8px] bg-slate-900 px-4 py-2 text-[12px] font-extrabold text-white disabled:opacity-55"
                  >
                    {busy === 'REQUEST_REVISION' || busy === 'REJECT_TO_DRAFT' ? 'در حال ثبت...' : 'ثبت تصمیم'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}


