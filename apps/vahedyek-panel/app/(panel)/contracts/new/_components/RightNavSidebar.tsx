'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Lock, Plus, ShieldCheck, X } from 'lucide-react';
import { submitContractApprovalWorkflowAction } from '../../../../actions/contractApprovalActions';
import { listApprovalWorkflowsAction } from '../../../../actions/workflowActions';
import type { ContractFlowSectionId } from './contractFlowSignals';

const SAVEABLE_SECTIONS: ContractFlowSectionId[] = ['subject', 'parties', 'financial', 'penalties', 'discounts', 'termination'];

type SectionItem = {
  id: ContractFlowSectionId;
  title: string;
};

export type ApprovalSubmissionBlocker = { title: string; detail: string };

interface RightNavSidebarProps {
  sections: SectionItem[];
  activeSection: ContractFlowSectionId;
  dirtyMap: Partial<Record<ContractFlowSectionId, boolean>>;
  savingMap: Partial<Record<ContractFlowSectionId, boolean>>;
  lastUpdatedMap: Partial<Record<ContractFlowSectionId, number>>;
  accessMap: Record<ContractFlowSectionId, { locked: boolean; info: string }>;
  onScrollTo: (sectionId: ContractFlowSectionId) => void;
  onSave: (sectionId: ContractFlowSectionId) => void;
  onLockedClick: (sectionId: ContractFlowSectionId) => void;
  draftId: string | null;
  loading: boolean;
  approvalSubmissionReady: boolean;
  approvalSubmissionBlockers: ApprovalSubmissionBlocker[];
  onOpenPreviewDialog: () => void;
}

function formatAbsoluteTime(timestamp?: number) {
  if (!timestamp) return 'وارد نشده';
  return new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  }).format(timestamp);
}

export function RightNavSidebar({
  sections,
  activeSection,
  dirtyMap,
  savingMap,
  lastUpdatedMap,
  accessMap,
  onScrollTo,
  onSave,
  onLockedClick,
  draftId,
  loading,
  approvalSubmissionReady,
  approvalSubmissionBlockers,
  onOpenPreviewDialog,
}: RightNavSidebarProps) {
  const router = useRouter();
  const [blockersOpen, setBlockersOpen] = useState(false);
  const [approvalNavBusy, setApprovalNavBusy] = useState(false);
  const [approvalNavError, setApprovalNavError] = useState('');
  const [approvalSubmitted, setApprovalSubmitted] = useState(false);
  const [workflowReady, setWorkflowReady] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await listApprovalWorkflowsAction();
        if (!mounted) return;
        if (!res.ok) {
          setWorkflowReady(false);
          return;
        }
        const hasActive = (res.items ?? []).some((w: any) => Boolean(w?.active));
        setWorkflowReady(hasActive);
      } catch {
        if (!mounted) return;
        setWorkflowReady(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const isApprovalWorkflowMissing = workflowReady === false;
  const isApprovalWorkflowLoading = workflowReady === null;
  const canAttemptApproval = useMemo(() => {
    if (isApprovalWorkflowLoading) return false;
    if (isApprovalWorkflowMissing) return false;
    return true;
  }, [isApprovalWorkflowLoading, isApprovalWorkflowMissing]);

  const goPreview = () => {
    if (!draftId) return;
    onOpenPreviewDialog();
  };

  const onApprovalClick = async () => {
    if (loading || !draftId || approvalNavBusy) return;
    if (!canAttemptApproval) return;
    if (!approvalSubmissionReady) {
      setBlockersOpen(true);
      return;
    }
    setApprovalNavError('');
    try {
      setApprovalNavBusy(true);
      const res = await submitContractApprovalWorkflowAction(draftId);
      if (!res.ok) throw new Error(res.message);
      setApprovalSubmitted(true);
      router.push(`/contracts/${encodeURIComponent(draftId)}`);
    } catch (e) {
      setApprovalNavError(e instanceof Error ? e.message : 'امکان ادامهٔ فرایند تأیید نبود.');
    } finally {
      setApprovalNavBusy(false);
    }
  };

  return (
    <aside className="contract-flow-sidebar shrink-0">
      <div className="contract-flow-sidebar-panel">
        <div className="contract-flow-sidebar-header">
          <h1 className="text-lg font-bold text-gray-900">مواد قرارداد</h1>
        </div>

        <div className="contract-flow-sidebar-body">
          <div className="contract-flow-nav-list flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {sections.map((section, index) => {
              const isActive = activeSection === section.id;
              const isDirty = Boolean(dirtyMap[section.id]);
              const isSaving = Boolean(savingMap[section.id]);
              const canSave = SAVEABLE_SECTIONS.includes(section.id) && isDirty;
              const access = accessMap[section.id];
              const isLocked = access.locked;

              return (
                <div
                  key={section.id}
                  className={`contract-flow-nav-item min-w-max text-right transition-colors lg:w-full ${isActive ? 'is-active' : ''} ${isLocked ? 'is-locked' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => (isLocked ? onLockedClick(section.id) : onScrollTo(section.id))}
                    className="contract-flow-nav-main"
                  >
                    <span className="contract-flow-nav-content">
                      <span className="contract-flow-nav-title-wrap">
                        <span className="contract-flow-nav-title">{section.title}</span>
                        <span className="contract-flow-nav-updated">
                          {formatAbsoluteTime(lastUpdatedMap[section.id])}
                        </span>
                      </span>
                      <span className="contract-flow-nav-number">
                        {isLocked ? <Lock className="h-3.5 w-3.5" /> : new Intl.NumberFormat('fa-IR').format(index + 1)}
                      </span>
                    </span>
                  </button>

                  {canSave ? (
                    <div className="contract-flow-nav-save-slot">
                      <button
                        type="button"
                        onClick={() => onSave(section.id)}
                        disabled={isSaving}
                        className="contract-flow-nav-save"
                      >
                        {isSaving ? '...' : 'ذخیره'}
                      </button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="contract-flow-sidebar-footer flex flex-col gap-2" dir="rtl">
          {approvalNavError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-right text-[11px] font-bold leading-relaxed text-rose-900">
              {approvalNavError}
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={goPreview}
              disabled={loading || !draftId || approvalNavBusy}
              className="contract-flow-sidebar-action contract-flow-sidebar-action--secondary"
            >
              <Eye className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              پیش‌نمایش
            </button>
            <button
              type="button"
              onClick={() => void onApprovalClick()}
              disabled={loading || !draftId || approvalNavBusy || approvalSubmitted || !canAttemptApproval}
              className={`contract-flow-sidebar-action contract-flow-sidebar-action--primary${
                !approvalSubmissionReady || !canAttemptApproval ? ' contract-flow-sidebar-action--needs-work' : ''
              }`}
              title={
                isApprovalWorkflowMissing
                  ? 'ابتدا در تنظیمات، فرایند تایید را تعریف کنید.'
                  : !approvalSubmissionReady
                    ? 'ابتدا همه مراحل را تکمیل و ذخیره کنید — برای فهرست موارد ناقص کلیک کنید'
                    : undefined
              }
            >
              <ShieldCheck className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
              {approvalNavBusy
                ? 'در حال آماده‌سازی…'
                : approvalSubmitted
                  ? 'در انتظار تایید'
                  : isApprovalWorkflowLoading
                    ? 'بررسی تنظیمات تایید…'
                    : 'رفتن به فرایند تایید'}
            </button>
            {isApprovalWorkflowMissing ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-right">
                <div className="text-[11px] font-extrabold leading-relaxed text-amber-900">
                  برای ارسال قرارداد به فرایند تایید، ابتدا باید «فرایند تایید» را در تنظیمات ثبت کنید.
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/business-settings/approval-process')}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-amber-900 transition hover:bg-amber-100/50"
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden />
                  ساخت فرایند تایید
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {blockersOpen ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          dir="rtl"
          onClick={() => setBlockersOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--surface)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border-color)] bg-[var(--surface-soft)] px-5 py-4">
              <div>
                <h3 className="text-base font-extrabold text-[var(--text-strong)]">تکمیل مراحل قبل از فرایند تایید</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--text-muted)]">برای ادامه، بخش‌های زیر باید کامل و ذخیره‌شده باشند.</p>
              </div>
              <button
                type="button"
                onClick={() => setBlockersOpen(false)}
                className="rounded-lg p-1 text-[var(--text-faint)] transition-colors hover:bg-[var(--surface-soft)]"
                aria-label="بستن"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="max-h-[min(52vh,420px)] space-y-2 overflow-y-auto px-5 py-4">
              {approvalSubmissionBlockers.map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-[var(--theme-warning-border)] bg-[var(--theme-warning-bg)] px-4 py-3 text-right"
                >
                  <div className="text-sm font-extrabold text-[var(--theme-warning-text)]">{item.title}</div>
                  <div className="mt-1 text-xs font-semibold leading-relaxed text-[var(--text-body)]">{item.detail}</div>
                </li>
              ))}
            </ul>
            <div className="flex justify-end border-t border-[var(--border-color)] px-5 py-4">
              <button
                type="button"
                onClick={() => setBlockersOpen(false)}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--surface)] px-4 py-2 text-xs font-extrabold text-[var(--text-body)] transition-colors hover:bg-[var(--surface-soft)]"
              >
                متوجه شدم
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
