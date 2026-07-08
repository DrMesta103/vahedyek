'use client';

import { useState } from 'react';
import { ChevronDown, FileText, FolderTree } from 'lucide-react';
import type { TestKnowledgeBaseTab } from '@/app/lib/types/taavia-test-workspace';

type TestKnowledgeBaseCategoriesPreviewProps = {
  tabs: TestKnowledgeBaseTab[];
  isBuilt: boolean;
  activeTabId?: string | null;
  activeSubTabId?: string | null;
  isNavigationActive?: boolean;
  onNavigate: (tabId: string, subTabId?: string) => void;
};

export function TestKnowledgeBaseCategoriesPreview({
  tabs,
  isBuilt,
  activeTabId,
  activeSubTabId,
  isNavigationActive = false,
  onNavigate,
}: TestKnowledgeBaseCategoriesPreviewProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedTabIds, setCollapsedTabIds] = useState<string[]>([]);

  const toggleCollapse = (tabId: string) => {
    setCollapsedTabIds((current) =>
      current.includes(tabId) ? current.filter((id) => id !== tabId) : [...current, tabId],
    );
  };

  const panelBody = (
    <div className="grid gap-2">
      <div className="border-b border-white/8 pb-2 text-right">
        <h2 className="m-0 text-[12px] font-black text-white">دسته‌بندی‌های Knowledge Base</h2>
        <p className="mt-1 mb-0 text-[10px] leading-5 text-[rgba(217,229,255,0.48)]">
          {isBuilt ? 'برای ورود به بخش، روی آیتم کلیک کن' : 'پیش‌نمایش — پس از ساخت KB قابل ورود است'}
        </p>
      </div>

      {tabs.length > 0 ? (
        <div className="grid max-h-[calc(100vh-14rem)] gap-1 overflow-y-auto">
          {tabs.map((tab) => {
            const hasChildren = tab.subTabs.length > 0;
            const collapsed = collapsedTabIds.includes(tab.id);
            const isTabActive =
              isNavigationActive && activeTabId === tab.id && (!hasChildren || !activeSubTabId);

            return (
              <div key={tab.id} className="grid gap-1">
                <div
                  className={`flex items-center gap-2 rounded-full px-2.5 py-2 transition ${
                    isTabActive
                      ? 'bg-[rgba(66,237,211,0.18)] text-[rgb(214,255,248)]'
                      : 'text-[rgba(217,229,255,0.78)] hover:bg-white/8'
                  }`}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (hasChildren) toggleCollapse(tab.id);
                    }}
                    className={`inline-flex h-5 w-5 shrink-0 items-center justify-center ${
                      hasChildren ? 'text-[rgba(217,229,255,0.65)]' : 'text-[rgba(217,229,255,0.25)]'
                    }`}
                  >
                    <ChevronDown className={`h-3.5 w-3.5 transition ${hasChildren && collapsed ? '-rotate-90' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (hasChildren) {
                        toggleCollapse(tab.id);
                        onNavigate(tab.id, tab.subTabs[0]?.id);
                        return;
                      }
                      onNavigate(tab.id);
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2 text-right"
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0 text-[rgb(150,246,231)]" />
                    <span className="min-w-0 flex-1 truncate text-[11px] font-bold">{tab.title}</span>
                  </button>
                </div>

                {hasChildren && !collapsed
                  ? tab.subTabs.map((subTab) => {
                      const isSubActive =
                        isNavigationActive && activeTabId === tab.id && activeSubTabId === subTab.id;

                      return (
                        <button
                          key={subTab.id}
                          type="button"
                          onClick={() => onNavigate(tab.id, subTab.id)}
                          className={`mr-5 flex w-full items-center gap-2 rounded-full px-2.5 py-1.5 text-right transition ${
                            isSubActive
                              ? 'bg-[rgba(66,237,211,0.18)] text-[rgb(214,255,248)]'
                              : 'text-[rgba(217,229,255,0.68)] hover:bg-white/8'
                          }`}
                        >
                          <FileText className="h-3 w-3 shrink-0 text-[rgb(150,246,231)]" />
                          <span className="min-w-0 flex-1 truncate text-[10px] font-semibold">{subTab.title}</span>
                        </button>
                      );
                    })
                  : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[12px] border border-dashed border-white/12 bg-white/5 px-3 py-4 text-right">
          <p className="m-0 text-[10px] leading-6 text-[rgba(217,229,255,0.55)]">
            هنوز دسته‌بندی در Knowledge Base وجود ندارد. با وارد کردن داده، پیش‌نمایش اینجا به‌روز می‌شود.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside className="hidden h-full max-h-full w-full overflow-y-auto rounded-[14px] bg-[linear-gradient(180deg,rgba(18,30,56,0.94)_0%,rgba(10,19,38,0.94)_100%)] p-2.5 lg:block">
        {panelBody}
      </aside>

      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="flex w-full items-center justify-between rounded-[14px] border border-white/10 bg-white/5 px-3 py-2.5 text-[12px] font-bold text-white"
        >
          <ChevronDown className={`h-4 w-4 transition ${mobileOpen ? 'rotate-180' : ''}`} />
          <span className="inline-flex items-center gap-2">
            <FolderTree className="h-3.5 w-3.5" />
            دسته‌بندی‌های KB
          </span>
        </button>
        {mobileOpen ? (
          <div className="mt-2 rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.94)_0%,rgba(10,19,38,0.94)_100%)] p-3">
            {panelBody}
          </div>
        ) : null}
      </div>
    </>
  );
}
