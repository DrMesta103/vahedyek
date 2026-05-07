'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Lock, ShieldCheck, X } from 'lucide-react';
import { postContractApprovalAction } from '../../../../lib/contractDraftClient';
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

  const goPreview = () => {
    if (!draftId) return;
    onOpenPreviewDialog();
  };

  const onApprovalClick = async () => {
    if (loading || !draftId || approvalNavBusy) return;
    if (!approvalSubmissionReady) {
      setBlockersOpen(true);
      return;
    }
    setApprovalNavError('');
    try {
      setApprovalNavBusy(true);
      await postContractApprovalAction(draftId, { action: 'clearReturnPending' });
      setApprovalSubmitted(true);
      router.push('/contracts?tab=pending_approval');
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
              disabled={loading || !draftId || approvalNavBusy || approvalSubmitted}
              className={`contract-flow-sidebar-action contract-flow-sidebar-action--primary${!approvalSubmissionReady ? ' contract-flow-sidebar-action--needs-work' : ''}`}
              title={!approvalSubmissionReady ? 'ابتدا همه مراحل را تکمیل و ذخیره کنید — برای فهرست موارد ناقص کلیک کنید' : undefined}
            >
              <ShieldCheck className="h-4 w-4 shrink-0 opacity-95" aria-hidden />
              {approvalNavBusy ? 'در حال آماده‌سازی…' : approvalSubmitted ? 'در انتظار تایید' : 'رفتن به فرایند تایید'}
            </button>
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
