'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ClipboardList, Loader2, Shield, ShieldOff, XCircle } from 'lucide-react';
import { postContractApprovalAction } from '../../lib/contractDraftClient';

const REASON_MIN = 15;

type ContractApprovalFlowBannerProps = {
  contractId: string;
  /** مالک tenant یا تأییدکننده تعریف‌شده در مسیر فرایند (هم‌ارز کارمندی با همان شناسهٔ کاربر) */
  canDecide: boolean;
};

export function ContractApprovalFlowBanner({ contractId, canDecide }: ContractApprovalFlowBannerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState('');

  if (searchParams.get('submitApproval') !== '1') return null;

  const dismissQuery = () => {
    router.replace(`/contracts/${encodeURIComponent(contractId)}`);
  };

  const reasonTrim = reason.trim();
  const reasonOk = reasonTrim.length >= REASON_MIN;

  const handleApprove = async () => {
    setError('');
    try {
      setBusy('approve');
      await postContractApprovalAction(contractId, { action: 'clearReturnPending' });
      router.push('/business-settings/approval-process');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ارسال برای فرایند تأیید انجام نشد.');
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async () => {
    if (!reasonOk) {
      setError(`برای ثبت عدم تأیید، حداقل ${REASON_MIN} نویسه توضیح لازم است.`);
      return;
    }
    setError('');
    try {
      setBusy('reject');
      await postContractApprovalAction(contractId, { action: 'returnForRevision', reason: reasonTrim });
      dismissQuery();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ثبت عدم تأیید انجام نشد.');
    } finally {
      setBusy(null);
    }
  };

  if (!canDecide) {
    return (
      <section
        dir="rtl"
        className="contract-details-approval-banner mb-6 overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--theme-info-border)_55%,transparent)] bg-[color-mix(in_srgb,var(--theme-info-bg)_28%,var(--surface))] shadow-[0_10px_36px_-24px_rgba(15,23,42,0.22)]"
      >
        <div className="border-b border-[color-mix(in_srgb,var(--theme-info-border)_40%,transparent)] bg-[color-mix(in_srgb,var(--theme-info-bg)_42%,transparent)] px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5 text-right">
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
              <div className="min-w-0 text-[13px] font-semibold leading-7 text-[var(--text-body)]">
                <p className="font-extrabold text-[var(--text-strong)]">دسترسی شما هم‌اکنون فقط مشاهده است.</p>
                <p className="mt-1">
                  ثبت{' '}
                  <span className="font-black text-[var(--dark-teal)]">تأیید نهایی</span> یا{' '}
                  <span className="font-black text-rose-700">عدم تأیید</span> طبق قواعد همین سامانه فقط برای{' '}
                  <span className="font-extrabold text-[var(--text-strong)]">مالک کسب‌وکار</span> یا افرادی که در مسیر تأیید
                  قرارداد (تنظیمات فرایند تأیید برای نوع کاربری واحد) تعیین شده‌اند، مجاز است.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:w-[240px] sm:items-start">
              <div className="rounded-xl border border-dashed border-[var(--theme-info-border)] bg-[color-mix(in_srgb,var(--theme-info-bg)_18%,transparent)] px-3 py-2 text-center text-[11px] font-bold leading-5 text-[var(--theme-info-text)] sm:text-right">
                پیش‌فرض: نقش تأیید نهایی همیشه در اختیار مالک tenant است؛ سایر مراحل همان طور که در تنظیمات پیاده شده‌اند.
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      dir="rtl"
      className="contract-details-approval-banner mb-6 overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--surface)] shadow-[0_8px_30px_-18px_rgba(15,23,42,0.12)]"
    >
      <div className="border-b border-[var(--border-color)] bg-[var(--surface-soft)]/80 px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5 text-right">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--dark-teal)_22%,transparent)] bg-white text-[var(--dark-teal)]">
            <Shield className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">گام نهایی پیش‌نویس</p>
            <h2 className="truncate text-[15px] font-black text-[var(--text-strong)]">تصمیم دربارهٔ ارسال به فرایند تأیید</h2>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        <p className="text-right text-[13px] font-semibold leading-6 text-[var(--text-body)]">
          با <span className="font-extrabold text-[var(--text-strong)]">تأیید و ارسال به فرایند</span>، پیش‌نویس طبق مسیر رسمی پیش
          می‌رود. با <span className="font-extrabold text-rose-700">عدم تأیید</span>، پیش‌نویس برای اصلاح به دست ویراستار برمی‌گردد و{' '}
          <span className="font-extrabold">ثبت علت</span>
          الزامی است تا بتوان پیگیری داخلی انجام داد (حقوقی، مدیر پروژه، فروش و …).
        </p>

        {error ? (
          <div className="rounded-xl border border-rose-200/80 bg-rose-50/90 px-3 py-2 text-right text-[12px] font-bold text-rose-800">{error}</div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row-reverse sm:flex-wrap sm:justify-start">
          <button
            type="button"
            onClick={() => void handleApprove()}
            disabled={busy !== null}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--dark-teal)] px-5 text-[13px] font-extrabold text-white shadow-sm transition-[filter] hover:brightness-[1.06] disabled:opacity-55"
          >
            {busy === 'approve' ? (
              <Loader2 className="h-4 w-4 animate-spin opacity-95" aria-hidden />
            ) : (
              <CheckCircle2 className="h-4 w-4 opacity-95" aria-hidden />
            )}
            تأیید و ارسال به فرایند
          </button>

          <button
            type="button"
            onClick={() => {
              setRejectOpen((v) => !v);
              setError('');
            }}
            disabled={busy !== null}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-[13px] font-extrabold transition-colors disabled:opacity-55 ${
              rejectOpen
                ? 'border-rose-300 bg-rose-50/80 text-rose-900'
                : 'border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-body)] hover:bg-[var(--surface-soft)]'
            }`}
          >
            <XCircle className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            عدم تأیید / بازگشت برای اصلاح
          </button>
        </div>

        {rejectOpen ? (
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--surface-soft)]/50 p-4">
            <label htmlFor="contract-approval-reject-reason" className="mb-2 block text-right text-[12px] font-extrabold text-[var(--text-strong)]">
              علت عدم تأیید <span className="font-semibold text-rose-700">*</span>
            </label>
            <textarea
              id="contract-approval-reject-reason"
              dir="rtl"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="به‌صورت شفاف بنویسید چه بخشی باید اصلاح شود؛ این متن برای مستندسازی داخلی نگه‌داری می‌شود."
              className="w-full resize-y rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-3 py-2.5 text-right text-[13px] font-semibold leading-6 text-[var(--text-body)] shadow-inner outline-none placeholder:text-[var(--text-faint)] focus:border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--dark-teal)_12%,transparent)]"
              disabled={busy !== null}
            />
            <div className="mt-2 flex flex-col gap-3 sm:flex-row-reverse sm:items-center sm:justify-between">
              <span className="text-[11px] font-bold text-[var(--text-muted)]">
                {reasonTrim.length} / حداقل {REASON_MIN} نویسه
              </span>
              <div className="flex flex-wrap gap-2 sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => void handleReject()}
                  disabled={busy !== null || !reasonOk}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-rose-600 px-4 text-[12px] font-extrabold text-white transition hover:bg-rose-700 disabled:opacity-45"
                >
                  {busy === 'reject' ? 'در حال ثبت…' : 'ثبت عدم تأیید'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectOpen(false);
                    setReason('');
                    setError('');
                  }}
                  disabled={busy !== null}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--border-color)] bg-transparent px-4 text-[12px] font-bold text-[var(--text-muted)] hover:bg-[var(--surface)]"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
