'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ClipboardList,
  GitPullRequest,
  Loader2,
  RefreshCw,
  Send,
  Shield,
  ShieldOff,
  XCircle,
  X,
} from 'lucide-react';
import {
  getContractApprovalStateAction,
  revokeContractApprovalDecisionAction,
  recordContractApprovalDecisionAction,
  submitContractApprovalWorkflowAction,
} from '../../actions/contractApprovalActions';
import type { ContractStatus } from '../../types/contract';

const REASON_MIN = 0;

type BannerProps = {
  contractId: string;
  contractStatus: ContractStatus;
};

export function ContractApprovalFlowBanner({ contractId, contractStatus }: BannerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stateRes, setStateRes] = useState<Awaited<ReturnType<typeof getContractApprovalStateAction>> | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<'submit' | 'approve' | 'revision' | 'reject' | 'revoke' | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsStepId, setDetailsStepId] = useState<string>('');

  const [revisionOpen, setRevisionOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const r = await getContractApprovalStateAction(contractId);
      setStateRes(r);
      if (!r.ok) setError(r.message ?? 'وضعیت فرایند تأیید دریافت نشد.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطا در بارگذاری فرایند تأیید.');
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!detailsOpen) return;
    if (!stateRes?.ok || !stateRes.state) return;
    if (stateRes.state.mode !== 'instance') return;
    const s = stateRes.state;
    const preferred = s.currentStep?.id ?? s.steps[s.currentStepIndex]?.id ?? s.steps[0]?.id ?? '';
    setDetailsStepId((prev) => prev || preferred);
  }, [detailsOpen, stateRes]);

  const visible = useMemo(() => {
    if (!stateRes?.ok || !stateRes.state) return false;
    const s = stateRes.state;
    if (s.mode === 'no_instance') {
      return contractStatus === 'pending_approval';
    }
    if (s.status === 'APPROVED') return false;
    return s.status === 'IN_REVIEW' || s.status === 'REVISION_REQUESTED' || s.status === 'REJECTED_TO_DRAFT';
  }, [stateRes, contractStatus]);

  const detailsMeta = useMemo(() => {
    const s = stateRes?.ok ? stateRes.state : null;
    if (!s || s.mode !== 'instance' || !s.currentStep) return null;
    const stepId = s.currentStep.id;
    const step = s.steps.find((x) => x.id === stepId) ?? null;
    if (!step) return null;

    const decisionsThisStep = s.decisions.filter((d) => d.stepId === stepId);
    const decidedUserIds = new Set(decisionsThisStep.map((d) => d.approverUserId));
    const pendingApprovers = step.approvers.filter((uid) => !decidedUserIds.has(uid));

    return { step, decisionsThisStep, pendingApprovers };
  }, [stateRes]);

  const reasonTrim = reason.trim();
  const reasonOk = true;

  const handleSubmit = async () => {
    setError('');
    try {
      setBusy('submit');
      const r = await submitContractApprovalWorkflowAction(contractId);
      if (!r.ok) {
        setError(r.message);
        return;
      }
      await reload();
      router.refresh();
      window.dispatchEvent(new Event('contract-approval-updated'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ارسال انجام نشد.');
    } finally {
      setBusy(null);
    }
  };

  const handleApprove = async () => {
    setError('');
    try {
      setBusy('approve');
      const r = await recordContractApprovalDecisionAction(contractId, { decision: 'APPROVE' });
      if (!r.ok) {
        setError(r.message);
        return;
      }
      await reload();
      router.refresh();
      window.dispatchEvent(new Event('contract-approval-updated'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ثبت تأیید انجام نشد.');
    } finally {
      setBusy(null);
    }
  };

  const handleRevision = async () => {
    setError('');
    try {
      setBusy('revision');
      const r = await recordContractApprovalDecisionAction(contractId, {
        decision: 'REQUEST_REVISION',
        reason: reasonTrim,
      });
      if (!r.ok) {
        setError(r.message);
        return;
      }
      setRevisionOpen(false);
      setReason('');
      await reload();
      router.refresh();
      window.dispatchEvent(new Event('contract-approval-updated'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ثبت درخواست اصلاح انجام نشد.');
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async () => {
    setError('');
    try {
      setBusy('reject');
      const r = await recordContractApprovalDecisionAction(contractId, {
        decision: 'REJECT_TO_DRAFT',
        reason: reasonTrim,
      });
      if (!r.ok) {
        setError(r.message);
        return;
      }
      setRejectOpen(false);
      setReason('');
      await reload();
      router.refresh();
      window.dispatchEvent(new Event('contract-approval-updated'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ثبت رد انجام نشد.');
    } finally {
      setBusy(null);
    }
  };

  const handleRevokeDecision = async () => {
    setError('');
    try {
      setBusy('revoke');
      const r = await revokeContractApprovalDecisionAction(contractId);
      if (!r.ok) {
        setError(r.message);
        return;
      }
      await reload();
      router.refresh();
      window.dispatchEvent(new Event('contract-approval-updated'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'حذف رأی انجام نشد.');
    } finally {
      setBusy(null);
    }
  };

  if (!loading && !visible) return null;

  if (loading && !stateRes) {
    return (
      <section dir="rtl" className="contract-details-approval-banner mb-6 rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] px-5 py-4 shadow-sm">
        <div className="flex items-center justify-end gap-2 text-[13px] font-bold text-[var(--text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          در حال بارگذاری فرایند تأیید…
        </div>
      </section>
    );
  }

  if (!stateRes?.ok || !stateRes.state) {
    return error ? (
      <section dir="rtl" className="contract-details-approval-banner mb-6 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-right text-[13px] font-bold text-rose-800">
        {error}
      </section>
    ) : null;
  }

  const st = stateRes.state;

  const readOnlyBlock = (text: React.ReactNode, actions?: React.ReactNode) => (
    <section
      dir="rtl"
      className="contract-details-approval-banner mb-6 overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--theme-info-border)_55%,transparent)] bg-[color-mix(in_srgb,var(--theme-info-bg)_28%,var(--surface))] shadow-[0_10px_36px_-24px_rgba(15,23,42,0.22)]"
    >
      <div className="border-b border-[color-mix(in_srgb,var(--theme-info-border)_40%,transparent)] bg-[color-mix(in_srgb,var(--theme-info-bg)_42%,transparent)] px-5 py-3.5">
        <div className="flex min-w-0 flex-row-reverse items-center gap-2.5 text-right">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--theme-info-border)_50%,transparent)] bg-[var(--surface)] text-[var(--theme-info-text)] shadow-sm">
            <ClipboardList className="h-[18px] w-[18px]" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-wide text-[var(--theme-info-text)]">فرایند رسمی تأیید</p>
            <h2 className="mt-0.5 text-[15px] font-black text-[var(--text-strong)]">این پیش‌نویس در مسیر تأیید سازمان قرار دارد</h2>
          </div>
        </div>
      </div>
      <div className="space-y-4 px-5 py-5">
        <div className="flex flex-col gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)]/85 p-4 sm:flex-row-reverse sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3 text-right sm:items-center">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--surface-soft)] text-[var(--theme-info-text)] ring-1 ring-[var(--border-color)]">
              <ShieldOff className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 whitespace-pre-line text-[13px] font-semibold leading-7 text-[var(--text-body)]">
              {text}
            </div>
          </div>
          {actions ? <div className="flex shrink-0 flex-row-reverse flex-wrap items-center justify-end gap-2">{actions}</div> : null}
        </div>
      </div>
    </section>
  );

  const detailsDialog =
    detailsOpen && st.mode === 'instance' ? (
      <div
        className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/40 px-4 py-8"
        role="dialog"
        aria-modal="true"
        onClick={() => setDetailsOpen(false)}
      >
        <div
          dir="rtl"
          className="w-full max-w-2xl rounded-3xl border border-[var(--border-color)] bg-[var(--surface)] p-5 text-right shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4 flex flex-row-reverse items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-wide text-[var(--text-muted)]">جزئیات فرایند تأیید</div>
              <h3 className="mt-1 text-[16px] font-black text-[var(--text-strong)]">{st.workflowTitle}</h3>
              <div className="mt-1 text-[12px] font-semibold text-[var(--text-muted)]">
                مرحلهٔ جاری: {st.currentStep?.title ?? '—'} ({st.currentStep?.type === 'SEQUENTIAL' ? 'سری' : 'موازی'})
              </div>
              {st.workflowFinalApproverUserId ? (
                <div className="mt-1 text-[12px] font-semibold text-[var(--text-muted)]">
                  تأییدکننده نهایی کل فرایند:{' '}
                  <span className="font-extrabold text-[var(--text-strong)]">
                    {st.userMap?.[st.workflowFinalApproverUserId] ?? '—'}
                  </span>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setDetailsOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
              aria-label="بستن"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-soft)]/35 p-4">
              <div className="mb-2 text-[12px] font-black text-[var(--text-strong)]">مراحل فرایند</div>
              <div className="flex flex-row-reverse flex-wrap gap-2">
                {st.steps.map((step, idx) => {
                  const selected = detailsStepId ? detailsStepId === step.id : idx === st.currentStepIndex;
                  const isCurrent = idx === st.currentStepIndex;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setDetailsStepId(step.id)}
                      className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-[11px] font-extrabold transition-colors ${
                        selected
                          ? 'border-[var(--dark-teal)] bg-[color-mix(in_srgb,var(--dark-teal)_12%,white)] text-[var(--dark-teal)]'
                          : 'border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-body)] hover:bg-[var(--surface-soft)]'
                      }`}
                    >
                      {idx + 1}. {step.title}
                      {isCurrent ? <span className="mr-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-900">جاری</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {(() => {
              const selectedStep =
                st.steps.find((x) => x.id === detailsStepId) ??
                st.steps[st.currentStepIndex] ??
                st.steps[0] ??
                null;
              if (!selectedStep) return null;

              const decisionsThisStep = st.decisions.filter((d) => d.stepId === selectedStep.id);
              const decidedUserIds = new Set(decisionsThisStep.map((d) => d.approverUserId));
              const pendingApprovers = selectedStep.approvers.filter((uid) => !decidedUserIds.has(uid));

              return (
                <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--surface-soft)]/35 p-4">
                  <div className="mb-2 flex flex-row-reverse flex-wrap items-center justify-between gap-2">
                    <div className="text-[12px] font-black text-[var(--text-strong)]">
                      مرحله: {selectedStep.title}{' '}
                      <span className="text-[11px] font-bold text-[var(--text-muted)]">
                        ({selectedStep.type === 'SEQUENTIAL' ? 'سری' : 'موازی'})
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-[var(--text-muted)]">
                      {selectedStep.logic.mode === 'ALL_MUST_APPROVE'
                        ? 'همه باید تأیید کنند'
                        : `حداقل ${selectedStep.logic.mode === 'MINIMUM_COUNT' ? selectedStep.logic.count : 1} تأیید`}
                    </div>
                  </div>

                  <div className="mb-3 flex flex-row-reverse flex-wrap gap-2 text-[11px]">
                    <span className="font-bold text-[var(--text-muted)]">تأییدکنندگان:</span>
                    {selectedStep.approvers.length ? (
                      selectedStep.approvers.map((uid) => (
                        <span
                          key={uid}
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                            decidedUserIds.has(uid)
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                              : 'border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-body)]'
                          }`}
                        >
                          {st.userMap?.[uid] ?? `${uid.slice(0, 8)}…`}
                        </span>
                      ))
                    ) : (
                      <span className="text-[var(--text-muted)]">—</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-3">
                      <div className="mb-2 text-[11px] font-black text-[var(--text-muted)]">رأی داده‌اند</div>
                      {decisionsThisStep.length ? (
                        <ul className="space-y-2 text-[11px] font-semibold text-[var(--text-body)]">
                          {decisionsThisStep.map((d) => (
                            <li key={d.id} className="rounded-lg border border-[var(--border-color)]/70 bg-[var(--surface)]/70 px-2.5 py-2">
                              <div className="flex flex-row-reverse flex-wrap items-center justify-between gap-2">
                                <span className="text-[11px] font-extrabold text-[var(--text-strong)]">
                                  {st.userMap?.[d.approverUserId] ?? `${d.approverUserId.slice(0, 8)}…`}
                                </span>
                                <span className="font-bold">
                                  {d.decision === 'APPROVE'
                                    ? 'تأیید'
                                    : d.decision === 'REQUEST_REVISION'
                                      ? 'اصلاحیه'
                                      : d.decision === 'REJECT_TO_DRAFT'
                                        ? 'رد کامل'
                                        : d.decision}
                                </span>
                              </div>
                              {d.reason ? (
                                <div className="mt-1 text-right text-[11px] font-semibold leading-6 text-[var(--text-muted)]">
                                  {d.reason}
                                </div>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-[11px] font-semibold text-[var(--text-muted)]">هنوز رأیی ثبت نشده است.</div>
                      )}
                    </div>

                    <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-3">
                      <div className="mb-2 text-[11px] font-black text-[var(--text-muted)]">هنوز رأی نداده‌اند</div>
                      {pendingApprovers.length ? (
                        <ul className="flex flex-row-reverse flex-wrap gap-2">
                          {pendingApprovers.map((uid) => (
                            <li
                              key={uid}
                              className="rounded-full border border-[color-mix(in_srgb,var(--theme-warning-border)_55%,transparent)] bg-[color-mix(in_srgb,var(--theme-warning-bg)_18%,transparent)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-body)]"
                            >
                              {st.userMap?.[uid] ?? `${uid.slice(0, 8)}…`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-[11px] font-semibold text-[var(--text-muted)]">همه رأی داده‌اند.</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    ) : null;

  /** پیش از شروع فرایند: فقط کسانی که مجاز به ارسال‌اند دکمه می‌بینند */
  if (st.mode === 'no_instance') {
    if (!st.canSubmitWorkflow) {
      return readOnlyBlock(
        'ثبت ارسال به فرایند تأیید برای مالک کسب‌وکار یا کاربرانی با دسترسی ویرایش قرارداد مجاز است. پس از ارسال، تأییدکنندگان تعریف‌شده در فرایند می‌توانند رأی دهند.',
      );
    }
    return (
      <section
        dir="rtl"
        className="contract-details-approval-banner mb-6 overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] shadow-[0_8px_30px_-18px_rgba(15,23,42,0.12)]"
      >
        <div className="border-b border-[var(--border-color)] bg-[var(--surface-soft)]/80 px-5 py-3.5">
          <div className="flex min-w-0 flex-row-reverse flex-wrap items-center justify-between gap-3 text-right">
            <div className="flex min-w-0 flex-row-reverse items-center gap-2.5">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--dark-teal)_22%,transparent)] bg-white text-[var(--dark-teal)]">
                <Send className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">شروع فرایند</p>
                <h2 className="truncate text-[15px] font-black text-[var(--text-strong)]">ارسال پیش‌نویس به فرایند تأیید</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void reload()}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-bold text-[var(--text-muted)] hover:bg-[var(--surface-soft)] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden />
              بروزرسانی وضعیت
            </button>
          </div>
        </div>
        <div className="space-y-3 px-5 py-4 text-right">
          {error ? (
            <div className="rounded-xl border border-rose-200/80 bg-rose-50/90 px-3 py-2 text-right text-[12px] font-bold text-rose-800">{error}</div>
          ) : null}
          <p className="text-right text-[13px] font-semibold leading-6 text-[var(--text-body)]">
            با ارسال، مسیر چندمرحله‌ای تعریف‌شده در <span className="font-extrabold">تنظیمات فرایند تأیید</span> برای این نوع کاربری اجرا
            می‌شود. پس از شروع، تأییدکنندگان در همین صفحه رأی خود را ثبت می‌کنند.
          </p>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={busy !== null}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--dark-teal)] px-5 text-[13px] font-extrabold text-white shadow-sm transition-[filter] hover:brightness-[1.06] disabled:opacity-55"
          >
            {busy === 'submit' ? <Loader2 className="h-4 w-4 animate-spin opacity-95" aria-hidden /> : <Send className="h-4 w-4 opacity-95" aria-hidden />}
            ارسال به فرایند تأیید
          </button>
        </div>
      </section>
    );
  }

  const { capabilities } = st;
  // Allow revision to current step too (so action 2 works even on the first step).
  const revisionTargets = st.steps.slice(0, st.currentStepIndex + 1);

  if (st.status === 'REVISION_REQUESTED' || st.status === 'REJECTED_TO_DRAFT') {
    if (!capabilities.canSubmitWorkflow) {
      return readOnlyBlock(
        st.status === 'REVISION_REQUESTED'
          ? 'این پیش‌نویس برای اصلاح به ویراستار بازگردانده شده است. پس از اصلاح، کاربر مجاز می‌تواند دوباره آن را به فرایند تأیید بفرستد.'
          : 'این پیش‌نویس رد شده و به پیش‌نویس برگشته است. پس از اصلاح، ارسال مجدد به فرایند تأیید توسط کاربر مجاز انجام می‌شود.',
        st.mode === 'instance' ? (
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            disabled={busy !== null}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 text-[12px] font-extrabold text-[var(--text-body)] hover:bg-[var(--surface-soft)] disabled:opacity-55"
          >
            جزئیات فرایند
          </button>
        ) : null,
      );
    }
    return (
      <>
        {detailsDialog}
        <section
          dir="rtl"
          className="contract-details-approval-banner mb-6 overflow-hidden rounded-2xl border border-amber-200/90 bg-[color-mix(in_srgb,var(--theme-warning-bg)_22%,var(--surface))] shadow-sm"
        >
          <div className="border-b border-amber-200/70 bg-[color-mix(in_srgb,var(--theme-warning-bg)_35%,transparent)] px-5 py-3.5">
            <div className="flex min-w-0 flex-row-reverse items-center gap-2.5 text-right">
              <GitPullRequest className="h-5 w-5 text-[var(--theme-warning-text)]" aria-hidden />
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wide text-[var(--theme-warning-text)]">
                  {st.status === 'REVISION_REQUESTED' ? 'نیاز به اصلاح' : 'رد شده — بازگشت به پیش‌نویس'}
                </p>
                <h2 className="text-[15px] font-black text-[var(--text-strong)]">فرایند تأیید: {st.workflowTitle}</h2>
              </div>
            </div>
          </div>
          <div className="space-y-3 px-5 py-4 text-right">
            {error ? (
              <div className="rounded-xl border border-rose-200/80 bg-rose-50/90 px-3 py-2 text-right text-[12px] font-bold text-rose-800">{error}</div>
            ) : null}
            <p className="text-right text-[13px] font-semibold text-[var(--text-body)]">
              این وضعیت تا زمانی نمایش داده می‌شود که یک فرایند جدید برای همین قرارداد شروع شود (ارسال مجدد به فرایند تأیید).
            </p>
            <div className="flex flex-col items-end gap-2 sm:flex-row-reverse sm:flex-wrap sm:justify-start">
              <button
                type="button"
                onClick={() => setDetailsOpen(true)}
                disabled={busy !== null}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-5 text-[13px] font-extrabold text-[var(--text-body)] hover:bg-[var(--surface-soft)] disabled:opacity-55"
              >
                جزئیات فرایند
              </button>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={busy !== null}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--dark-teal)] px-5 text-[13px] font-extrabold text-white shadow-sm disabled:opacity-55"
              >
                {busy === 'submit' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <RefreshCw className="h-4 w-4" aria-hidden />}
                ارسال مجدد به فرایند تأیید
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  // IN_REVIEW
  const canShowRevision = capabilities.canRequestRevision;
  const hasAnyAction = capabilities.canApprove || canShowRevision || capabilities.canRejectToDraft;

  if (!hasAnyAction) {
    const stepTitle = st.currentStep?.title ?? '—';
    const stepType = st.currentStep?.type === 'SEQUENTIAL' ? 'سری' : 'موازی';
    return (
      <>
        {detailsDialog}
        {readOnlyBlock(
          st.viewerHasDecidedCurrentStep
            ? `مرحلهٔ جاری: ${stepTitle} (${stepType})\nرأی شما در این مرحله ثبت شده است. برای تغییر رأی، ابتدا رأی خود را حذف کنید و سپس دوباره رأی دهید.`
            : `مرحلهٔ جاری: ${stepTitle} (${stepType})\nاین قرارداد در مرحلهٔ تأیید است. شما در مرحلهٔ جاری تأییدکننده نیستید؛ پس از ثبت رأی سایر نفرات، فرایند ادامه پیدا می‌کند.`,
          st.mode === 'instance' ? (
            <>
              <button
                type="button"
                onClick={() => setDetailsOpen(true)}
                disabled={busy !== null}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 text-[12px] font-extrabold text-[var(--text-body)] hover:bg-[var(--surface-soft)] disabled:opacity-55"
              >
                جزئیات فرایند
              </button>
              {st.viewerHasDecidedCurrentStep ? (
                <>
                  <button
                    type="button"
                    onClick={() => void handleRevokeDecision()}
                    disabled={busy !== null}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 text-[12px] font-extrabold text-[var(--text-body)] hover:bg-[var(--surface-soft)] disabled:opacity-55"
                  >
                    حذف رأی من
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRevokeDecision()}
                    disabled={busy !== null}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--dark-teal)] px-4 text-[12px] font-extrabold text-white shadow-sm disabled:opacity-55"
                  >
                    ویرایش رأی (ثبت مجدد)
                  </button>
                </>
              ) : null}
            </>
          ) : null,
        )}
      </>
    );
  }

  return (
    <>
      {detailsDialog}
      <section
        dir="rtl"
        className="contract-details-approval-banner mb-6 overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] shadow-[0_8px_30px_-18px_rgba(15,23,42,0.12)]"
      >
      <div className="border-b border-[var(--border-color)] bg-[var(--surface-soft)]/80 px-5 py-3.5">
        <div className="flex min-w-0 flex-row-reverse flex-wrap items-center justify-between gap-3 text-right">
          <div className="flex min-w-0 flex-row-reverse items-center gap-2.5">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--dark-teal)_22%,transparent)] bg-white text-[var(--dark-teal)]">
              <Shield className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">{st.workflowTitle}</p>
              <h2 className="text-[15px] font-black text-[var(--text-strong)]">
                مرحلهٔ جاری: {st.currentStep?.title ?? '—'}{' '}
                <span className="text-[12px] font-bold text-[var(--text-muted)]">
                  ({st.currentStep?.type === 'SEQUENTIAL' ? 'سری' : 'موازی'})
                </span>
              </h2>
              {st.isViewerWorkflowFinalApprover ? (
                <div className="mt-1 text-[11px] font-extrabold text-[var(--dark-teal)]">
                  شما تأییدکنندهٔ نهایی کل فرایند هستید (با رأی شما فرایند فوراً تمام می‌شود).
                </div>
              ) : st.isViewerCurrentStepFinalApprover ? (
                <div className="mt-1 text-[11px] font-extrabold text-[var(--theme-warning-text)]">
                  شما تأییدکنندهٔ نهایی مرحلهٔ جاری هستید (در نبود نهاییِ کل، فقط شما می‌توانید رد کامل کنید).
                </div>
              ) : st.isViewerCurrentStepApprover ? (
                <div className="mt-1 text-[11px] font-semibold text-[var(--text-muted)]">شما تأییدکنندهٔ مرحلهٔ جاری هستید.</div>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => void reload()}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-bold text-[var(--text-muted)] hover:bg-[var(--surface-soft)] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden />
            بروزرسانی
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        {error ? (
          <div className="rounded-xl border border-rose-200/80 bg-rose-50/90 px-3 py-2 text-right text-[12px] font-bold text-rose-800">{error}</div>
        ) : null}

        <ol className="space-y-2 text-right text-[12px] font-semibold text-[var(--text-body)]">
          {st.steps.map((step, idx) => {
            const isCurrent = idx === st.currentStepIndex;
            const decisionsThisStep = st.decisions.filter((d) => d.stepId === step.id);
            const approvedCount = decisionsThisStep.filter((d) => d.decision === 'APPROVE').length;
            const revisionCount = decisionsThisStep.filter((d) => d.decision === 'REQUEST_REVISION').length;
            const rejectCount = decisionsThisStep.filter((d) => d.decision === 'REJECT_TO_DRAFT').length;
            const approversTotal = step.approvers.length;
            return (
              <li
                key={step.id}
                className={`flex flex-col gap-2 rounded-lg border px-3 py-2 ${
                  isCurrent
                    ? 'border-[var(--dark-teal)] bg-[color-mix(in_srgb,var(--dark-teal)_8%,transparent)]'
                    : 'border-[var(--border-color)] bg-[var(--surface-soft)]/40'
                }`}
              >
                <div className="flex flex-row-reverse flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-row-reverse flex-wrap items-center gap-2">
                    <span className="font-black text-[var(--text-strong)]">
                      {idx + 1}. {step.title}
                    </span>
                    {isCurrent ? (
                      <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-900">جاری</span>
                    ) : null}
                    {step.isFinal ? (
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-900">نهایی</span>
                    ) : null}
                  </div>
                  <div className="flex flex-row-reverse flex-wrap items-center gap-2 text-[10px] font-black">
                    <span className="rounded-full border border-[var(--border-color)] bg-[var(--surface)] px-2 py-0.5 text-[var(--text-muted)]">
                      تأییدکننده: {approversTotal}
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-900">
                      تأیید: {approvedCount}
                    </span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-950">
                      اصلاحیه: {revisionCount}
                    </span>
                    <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-rose-900">
                      رد: {rejectCount}
                    </span>
                  </div>
                </div>
                <div className="flex flex-row-reverse flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
                  <span>
                    {step.type === 'SEQUENTIAL' ? 'سری' : 'موازی'} —{' '}
                    {step.logic.mode === 'ALL_MUST_APPROVE'
                      ? 'همه باید تأیید کنند'
                      : `حداقل ${step.logic.mode === 'MINIMUM_COUNT' ? step.logic.count : 1} تأیید`}
                  </span>
                  <span>
                    ثبت‌شده: {decisionsThisStep.length} / {approversTotal}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-col items-end gap-2 sm:flex-row-reverse sm:flex-wrap sm:justify-start">
          <button
            type="button"
            onClick={() => setDetailsOpen(true)}
            disabled={busy !== null}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-5 text-[13px] font-extrabold text-[var(--text-body)] hover:bg-[var(--surface-soft)] disabled:opacity-55"
          >
            جزئیات فرایند
          </button>
          {capabilities.canApprove ? (
            <button
              type="button"
              onClick={() => void handleApprove()}
              disabled={busy !== null}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--dark-teal)] px-5 text-[13px] font-extrabold text-white shadow-sm disabled:opacity-55"
            >
              {busy === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CheckCircle2 className="h-4 w-4" aria-hidden />}
              تأیید مرحله
            </button>
          ) : null}

          {canShowRevision ? (
            <button
              type="button"
              onClick={() => {
                setRevisionOpen((v) => !v);
                setRejectOpen(false);
                setError('');
              }}
              disabled={busy !== null}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-[13px] font-extrabold transition-colors disabled:opacity-55 ${
                revisionOpen ? 'border-amber-400 bg-amber-50 text-amber-950' : 'border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-body)]'
              }`}
            >
              ثبت اصلاحیه و رد
            </button>
          ) : null}

          {capabilities.canRejectToDraft ? (
            <button
              type="button"
              onClick={() => {
                setRejectOpen((v) => !v);
                setRevisionOpen(false);
                setError('');
              }}
              disabled={busy !== null}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-[13px] font-extrabold transition-colors disabled:opacity-55 ${
                rejectOpen ? 'border-rose-400 bg-rose-50 text-rose-950' : 'border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-body)]'
              }`}
            >
              <XCircle className="h-4 w-4" aria-hidden />
              رد و بازگشت به پیش‌نویس
            </button>
          ) : null}
        </div>

        {revisionOpen && canShowRevision ? (
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-soft)]/50 p-4">
            <label htmlFor="wf-revision-reason" className="mb-2 block text-right text-[12px] font-extrabold text-[var(--text-strong)]">
              توضیح اصلاحیه <span className="text-rose-700">*</span>
            </label>
            <textarea
              id="wf-revision-reason"
              dir="rtl"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={busy !== null}
              className="w-full resize-y rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-right text-[13px] outline-none"
            />
            <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
              <span className="text-[11px] text-[var(--text-muted)]">{reasonTrim.length}</span>
              <button
                type="button"
                onClick={() => void handleRevision()}
                disabled={busy !== null}
                className="rounded-xl bg-amber-600 px-4 py-2 text-[12px] font-extrabold text-white disabled:opacity-45"
              >
                {busy === 'revision' ? 'در حال ثبت…' : 'ثبت درخواست اصلاح'}
              </button>
            </div>
          </div>
        ) : null}

        {rejectOpen && capabilities.canRejectToDraft ? (
          <div className="rounded-xl border border-rose-200/80 bg-rose-50/40 p-4">
            <label htmlFor="wf-reject-reason" className="mb-2 block text-right text-[12px] font-extrabold text-[var(--text-strong)]">
              علت رد کامل <span className="text-rose-700">*</span>
            </label>
            <textarea
              id="wf-reject-reason"
              dir="rtl"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={busy !== null}
              className="w-full resize-y rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2 text-right text-[13px] outline-none"
            />
            <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
              <span className="text-[11px] text-[var(--text-muted)]">{reasonTrim.length}</span>
              <button
                type="button"
                onClick={() => void handleReject()}
                disabled={busy !== null}
                className="rounded-xl bg-rose-600 px-4 py-2 text-[12px] font-extrabold text-white disabled:opacity-45"
              >
                {busy === 'reject' ? 'در حال ثبت…' : 'ثبت رد'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
      </section>
    </>
  );
}
