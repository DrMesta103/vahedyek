'use client';

import { Lock } from 'lucide-react';
import type { ContractFlowSectionId } from './contractFlowSignals';

const SAVEABLE_SECTIONS: ContractFlowSectionId[] = ['subject', 'parties', 'financial', 'penalties', 'discounts', 'termination'];

type SectionItem = {
  id: ContractFlowSectionId;
  title: string;
};

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
}: RightNavSidebarProps) {
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
      </div>
    </aside>
  );
}
