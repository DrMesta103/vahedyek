'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  ChevronDown,
  FileText,
  Loader2,
  MoreVertical,
  Paperclip,
  Plus,
  Save,
} from 'lucide-react';
import type { TestKnowledgeBaseDocument, TestKnowledgeBaseTab } from '@/app/lib/types/taavia-test-workspace';
import {
  createEmptyKnowledgeBaseSubTab,
  createEmptyKnowledgeBaseTab,
} from '@/app/lib/taavia-test-knowledge-migrate';
import { getContentKindLabel } from '@/app/lib/taavia-workspace-knowledge';
import {
  TaavButton,
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';

function formatUpdatedAt(value: string) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function formatDocumentDate(value: string) {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

type DialogState =
  | { type: 'edit-tab-title'; tabId: string; draft: string }
  | { type: 'edit-subtab-title'; tabId: string; subTabId: string; draft: string }
  | { type: 'add-tab'; draft: string }
  | { type: 'add-subtab'; tabId: string; draft: string }
  | { type: 'delete-tab'; tabId: string; title: string }
  | { type: 'delete-subtab'; tabId: string; subTabId: string; title: string }
  | null;

type TestKnowledgeBaseEditorProps = {
  document: TestKnowledgeBaseDocument;
  onChange: (document: TestKnowledgeBaseDocument) => void;
  onSave: () => void;
  onBackToInput?: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
  selectedTabId?: string;
  selectedSubTabId?: string | null;
  onSelectTab?: (tabId: string, subTabId: string | null) => void;
};

export function TestKnowledgeBaseEditor({
  document,
  onChange,
  onSave,
  onBackToInput,
  isSaving = false,
  isDirty = false,
  selectedTabId,
  selectedSubTabId,
  onSelectTab,
}: TestKnowledgeBaseEditorProps) {
  const [internalTabId, setInternalTabId] = useState(document.tabs[0]?.id ?? '');
  const [internalSubTabId, setInternalSubTabId] = useState<string | null>(null);
  const isSelectionControlled = selectedTabId !== undefined;

  const activeTabId = isSelectionControlled ? selectedTabId : internalTabId;
  const activeSubTabId = isSelectionControlled ? (selectedSubTabId ?? null) : internalSubTabId;

  const setSelection = (tabId: string, subTabId: string | null) => {
    if (onSelectTab) {
      onSelectTab(tabId, subTabId);
      return;
    }
    setInternalTabId(tabId);
    setInternalSubTabId(subTabId);
  };
  const [collapsedTabIds, setCollapsedTabIds] = useState<string[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const activeTab = useMemo(
    () => document.tabs.find((tab) => tab.id === activeTabId) ?? document.tabs[0],
    [document.tabs, activeTabId],
  );

  const activeSubTab = useMemo(() => {
    if (!activeTab || activeTab.subTabs.length === 0) return null;
    return activeTab.subTabs.find((sub) => sub.id === activeSubTabId) ?? activeTab.subTabs[0] ?? null;
  }, [activeTab, activeSubTabId]);

  useEffect(() => {
    if (!activeTab && document.tabs[0]) {
      setSelection(document.tabs[0].id, document.tabs[0].subTabs[0]?.id ?? null);
    }
  }, [activeTab, document.tabs]);

  useEffect(() => {
    if (!activeTab || isSelectionControlled) return;
    if (activeTab.subTabs.length > 0) {
      setInternalSubTabId((current) =>
        current && activeTab.subTabs.some((sub) => sub.id === current) ? current : activeTab.subTabs[0]?.id ?? null,
      );
    } else {
      setInternalSubTabId(null);
    }
  }, [activeTab, isSelectionControlled]);

  useEffect(() => {
    const handlePointerDown = () => setOpenMenu(null);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const updateDocument = useCallback(
    (updater: (tabs: TestKnowledgeBaseTab[]) => TestKnowledgeBaseTab[]) => {
      onChange({ ...document, tabs: updater(document.tabs) });
    },
    [document, onChange],
  );

  const touchTimestamp = () => new Date().toISOString();

  const updateActiveBody = (body: string) => {
    if (!activeTab) return;
    const stamp = touchTimestamp();

    if (activeTab.subTabs.length > 0 && activeSubTab) {
      updateDocument((tabs) =>
        tabs.map((tab) =>
          tab.id !== activeTab.id
            ? tab
            : {
                ...tab,
                subTabs: tab.subTabs.map((sub) =>
                  sub.id === activeSubTab.id ? { ...sub, body, updatedAt: stamp } : sub,
                ),
              },
        ),
      );
      return;
    }

    updateDocument((tabs) =>
      tabs.map((tab) => (tab.id === activeTab.id ? { ...tab, body, updatedAt: stamp } : tab)),
    );
  };

  const editorTitle = activeSubTab?.title ?? activeTab?.title ?? '';
  const editorBody = activeTab?.subTabs.length ? (activeSubTab?.body ?? '') : (activeTab?.body ?? '');
  const editorUpdatedAt = activeSubTab?.updatedAt ?? activeTab?.updatedAt ?? document.builtAt;
  const editorAttachments = activeTab?.subTabs.length
    ? (activeSubTab?.attachments ?? [])
    : (activeTab?.attachments ?? []);

  const isTabCollapsed = (tabId: string) => collapsedTabIds.includes(tabId);

  const toggleTabCollapse = (tabId: string) => {
    setCollapsedTabIds((current) =>
      current.includes(tabId) ? current.filter((id) => id !== tabId) : [...current, tabId],
    );
  };

  const selectTab = (tab: TestKnowledgeBaseTab) => {
    if (tab.subTabs.length > 0) {
      setCollapsedTabIds((current) => current.filter((id) => id !== tab.id));
      setSelection(tab.id, tab.subTabs[0]?.id ?? null);
      return;
    }
    setSelection(tab.id, null);
  };

  const selectSubTab = (tab: TestKnowledgeBaseTab, subTabId: string) => {
    setCollapsedTabIds((current) => current.filter((id) => id !== tab.id));
    setSelection(tab.id, subTabId);
  };

  const closeDialog = () => {
    setDialog(null);
    setDialogError(null);
  };

  const confirmDialog = () => {
    if (!dialog) return;
    const stamp = touchTimestamp();

    if (dialog.type === 'delete-tab') {
      const nextTabs = document.tabs.filter((tab) => tab.id !== dialog.tabId);
      if (nextTabs.length === 0) {
        setDialogError('حداقل یک تب باید در Knowledge Base باقی بماند.');
        return;
      }
      onChange({ ...document, tabs: nextTabs });
      if (activeTabId === dialog.tabId) {
        setSelection(nextTabs[0]?.id ?? '', nextTabs[0]?.subTabs[0]?.id ?? null);
      }
      closeDialog();
      return;
    }

    if (dialog.type === 'delete-subtab') {
      updateDocument((tabs) =>
        tabs.map((tab) =>
          tab.id !== dialog.tabId
            ? tab
            : { ...tab, subTabs: tab.subTabs.filter((sub) => sub.id !== dialog.subTabId), updatedAt: stamp },
        ),
      );
      closeDialog();
      return;
    }

    const title = dialog.draft.trim();
    if (!title) {
      setDialogError('عنوان نمی‌تواند خالی باشد.');
      return;
    }

    if (dialog.type === 'add-tab') {
      const tab = createEmptyKnowledgeBaseTab(title);
      onChange({ ...document, tabs: [...document.tabs, tab] });
      setSelection(tab.id, null);
      closeDialog();
      return;
    }

    if (dialog.type === 'add-subtab') {
      const subTab = createEmptyKnowledgeBaseSubTab(title);
      updateDocument((tabs) =>
        tabs.map((tab) =>
          tab.id !== dialog.tabId
            ? tab
            : { ...tab, subTabs: [...tab.subTabs, subTab], updatedAt: stamp },
        ),
      );
      setSelection(dialog.tabId, subTab.id);
      setCollapsedTabIds((current) => current.filter((id) => id !== dialog.tabId));
      closeDialog();
      return;
    }

    if (dialog.type === 'edit-tab-title') {
      updateDocument((tabs) =>
        tabs.map((tab) => (tab.id !== dialog.tabId ? tab : { ...tab, title, updatedAt: stamp })),
      );
      closeDialog();
      return;
    }

    if (dialog.type === 'edit-subtab-title') {
      updateDocument((tabs) =>
        tabs.map((tab) =>
          tab.id !== dialog.tabId
            ? tab
            : {
                ...tab,
                subTabs: tab.subTabs.map((sub) =>
                  sub.id !== dialog.subTabId ? sub : { ...sub, title, updatedAt: stamp },
                ),
              },
        ),
      );
      closeDialog();
    }
  };

  const renderTabRow = (tab: TestKnowledgeBaseTab): ReactNode => {
    const hasChildren = tab.subTabs.length > 0;
    const isTabActive = tab.id === activeTabId && !activeSubTabId;

    return (
      <div key={tab.id} className="grid gap-1">
        <div
          className={`relative flex items-center gap-1.5 rounded-full px-2 py-2 transition ${
            isTabActive
              ? 'bg-[rgba(66,237,211,0.18)] text-[rgb(214,255,248)]'
              : 'text-[rgba(217,229,255,0.70)] hover:bg-white/8 hover:text-white'
          }`}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              if (hasChildren) toggleTabCollapse(tab.id);
            }}
            className={`inline-flex h-6 w-6 items-center justify-center rounded-full transition ${
              hasChildren ? 'text-[rgba(217,229,255,0.70)] hover:bg-white/10' : 'cursor-default text-[rgba(217,229,255,0.34)]'
            }`}
          >
            <ChevronDown
              className={`h-4 w-4 transition ${hasChildren && isTabCollapsed(tab.id) ? '-rotate-90' : 'rotate-0'}`}
            />
          </button>

          <button
            type="button"
            onClick={() => (hasChildren ? toggleTabCollapse(tab.id) : selectTab(tab))}
            className="flex min-w-0 flex-1 items-center gap-2 text-right"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[rgb(150,246,231)]">
              <FileText className="h-4 w-4" />
            </span>
            <span className="grid min-w-0 flex-1 text-left">
              <span className="truncate text-[15px] font-semibold">{tab.title}</span>
              <span className="truncate text-[11px] font-medium text-[rgba(217,229,255,0.52)]">
                آخرین بروزرسانی: {formatUpdatedAt(tab.updatedAt)}
              </span>
            </span>
          </button>

          <div className="relative" onPointerDown={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === `tab-${tab.id}` ? null : `tab-${tab.id}`)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[rgba(217,229,255,0.65)] transition hover:bg-white/10 hover:text-white"
              aria-label="منوی تب"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {openMenu === `tab-${tab.id}` ? (
              <div className="absolute left-0 top-9 z-20 grid min-w-[156px] gap-1 rounded-[18px] border border-white/10 bg-[rgb(15,23,42)] p-2 text-right shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
                <button
                  type="button"
                  className="rounded-[12px] px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-white/10"
                  onClick={() => {
                    setDialog({ type: 'edit-tab-title', tabId: tab.id, draft: tab.title });
                    setDialogError(null);
                    setOpenMenu(null);
                  }}
                >
                  ویرایش عنوان
                </button>
                <button
                  type="button"
                  className="rounded-[12px] px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-white/10"
                  onClick={() => {
                    setDialog({ type: 'add-subtab', tabId: tab.id, draft: '' });
                    setDialogError(null);
                    setOpenMenu(null);
                  }}
                >
                  افزودن زیرتب
                </button>
                <button
                  type="button"
                  className="rounded-[12px] px-3 py-2 text-[12px] font-semibold text-[rgb(248,113,113)] transition hover:bg-[rgba(248,113,113,0.10)]"
                  onClick={() => {
                    setDialog({ type: 'delete-tab', tabId: tab.id, title: tab.title });
                    setDialogError(null);
                    setOpenMenu(null);
                  }}
                >
                  حذف تب
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {hasChildren && !isTabCollapsed(tab.id)
          ? tab.subTabs.map((subTab) => {
              const isSubActive = activeSubTabId === subTab.id && activeTabId === tab.id;
              return (
                <div
                  key={subTab.id}
                  className={`relative flex items-center gap-1.5 rounded-full px-2 py-1.5 transition ${
                    isSubActive
                      ? 'bg-[rgba(66,237,211,0.18)] text-[rgb(214,255,248)]'
                      : 'text-[rgba(217,229,255,0.70)] hover:bg-white/8 hover:text-white'
                  }`}
                  style={{ marginLeft: '22px' }}
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center text-[rgba(217,229,255,0.34)]">
                    <ChevronDown className="h-4 w-4" />
                  </span>

                  <button
                    type="button"
                    onClick={() => selectSubTab(tab, subTab.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-right"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[rgb(150,246,231)]">
                      <FileText className="h-4 w-4" />
                    </span>
                    <span className="grid min-w-0 flex-1 text-left">
                      <span className="truncate text-[15px] font-semibold">{subTab.title}</span>
                      <span className="truncate text-[11px] font-medium text-[rgba(217,229,255,0.52)]">
                        آخرین بروزرسانی: {formatUpdatedAt(subTab.updatedAt)}
                      </span>
                    </span>
                  </button>

                  <div className="relative" onPointerDown={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setOpenMenu(openMenu === `sub-${subTab.id}` ? null : `sub-${subTab.id}`)}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[rgba(217,229,255,0.65)] transition hover:bg-white/10 hover:text-white"
                      aria-label="منوی زیرتب"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openMenu === `sub-${subTab.id}` ? (
                      <div className="absolute left-0 top-9 z-20 grid min-w-[156px] gap-1 rounded-[18px] border border-white/10 bg-[rgb(15,23,42)] p-2 text-right shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
                        <button
                          type="button"
                          className="rounded-[12px] px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-white/10"
                          onClick={() => {
                            setDialog({
                              type: 'edit-subtab-title',
                              tabId: tab.id,
                              subTabId: subTab.id,
                              draft: subTab.title,
                            });
                            setDialogError(null);
                            setOpenMenu(null);
                          }}
                        >
                          ویرایش عنوان
                        </button>
                        <button
                          type="button"
                          className="rounded-[12px] px-3 py-2 text-[12px] font-semibold text-[rgb(248,113,113)] transition hover:bg-[rgba(248,113,113,0.10)]"
                          onClick={() => {
                            setDialog({
                              type: 'delete-subtab',
                              tabId: tab.id,
                              subTabId: subTab.id,
                              title: subTab.title,
                            });
                            setDialogError(null);
                            setOpenMenu(null);
                          }}
                        >
                          حذف زیرتب
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          : null}
      </div>
    );
  };

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/8 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {onBackToInput ? (
            <button
              type="button"
              onClick={onBackToInput}
              className="inline-flex items-center gap-1.5 px-1 py-1 text-[11px] font-bold text-[rgba(217,229,255,0.82)] transition hover:text-white"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              بازگشت به ورود اطلاعات
            </button>
          ) : null}
        </div>
        <div className="text-right">
          <div className="text-[12px] font-black text-white">{document.title}</div>
          <div className="text-[10px] text-[rgba(217,229,255,0.52)]">
            {document.lastSavedAt
              ? `ذخیره: ${formatDocumentDate(document.lastSavedAt)}`
              : isDirty
                ? 'تغییرات ذخیره نشده'
                : `ساخته‌شده: ${formatDocumentDate(document.builtAt)}`}
          </div>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(130,158,255,0.14)] px-3 py-1.5 text-[11px] font-bold text-[rgb(199,210,254)] disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          ذخیره
        </button>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.92)_0%,rgba(10,19,38,0.92)_100%)]">
        <div className="grid xl:grid-cols-[minmax(260px,300px)_minmax(0,1fr)]">
          <aside className="border-l border-white/8 p-3 xl:max-h-[calc(100vh-14rem)] xl:overflow-y-auto">
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setDialog({ type: 'add-tab', draft: '' });
                  setDialogError(null);
                }}
                aria-label="افزودن تب"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(66,237,211,0.12)] text-[rgb(150,246,231)] transition hover:bg-[rgba(66,237,211,0.18)]"
              >
                <Plus className="h-4 w-4" />
              </button>
              <div className="text-right">
                <div className="text-[14px] font-semibold text-white">دسته‌بندی‌ها</div>
                <div className="text-[10px] text-[rgba(217,229,255,0.52)]">هر دسته فقط زیرتب‌های خودش را دارد</div>
              </div>
            </div>

            {document.tabs.length > 0 ? (
              <div className="grid gap-1">{document.tabs.map(renderTabRow)}</div>
            ) : (
              <div className="rounded-[12px] bg-white/5 p-3 text-right">
                <div className="text-[12px] font-semibold text-white">هنوز دسته‌بندی وجود ندارد</div>
              </div>
            )}
          </aside>

          <div className="flex min-h-[480px] min-w-0 flex-col">
            <div className="border-b border-white/8 px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] text-[rgba(217,229,255,0.58)]">
                  {editorAttachments.length > 0 ? `${editorAttachments.length} پیوست` : 'بدون پیوست'}
                </span>
                <div className="text-right">
                  <strong className="block text-[13px] text-white">{editorTitle || 'یک بخش انتخاب کن'}</strong>
                  <span className="text-[10px] text-[rgba(217,229,255,0.52)]">
                    آخرین بروزرسانی: {formatUpdatedAt(editorUpdatedAt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {activeTab ? (
                <div className="grid gap-3">
                  <textarea
                    value={editorBody}
                    onChange={(event) => updateActiveBody(event.target.value)}
                    placeholder="محتوای این بخش را بنویس یا ویرایش کن..."
                    rows={18}
                    className="w-full resize-y rounded-[12px] border-0 bg-[rgba(5,12,25,0.45)] px-3 py-3 text-[14px] leading-7 text-white outline-none ring-1 ring-white/10 placeholder:text-[rgba(217,229,255,0.38)] focus:ring-[rgba(66,237,211,0.28)]"
                  />

                  {editorAttachments.length > 0 ? (
                    <div className="grid gap-2">
                      <div className="text-[11px] font-bold text-[rgba(217,229,255,0.72)]">پیوست‌ها</div>
                      {editorAttachments.map((attachment) => (
                        <div key={attachment.id} className="rounded-[10px] bg-white/5 p-2">
                          <div className="mb-1 flex items-center gap-2 text-[11px] font-bold text-[rgba(217,229,255,0.72)]">
                            <Paperclip className="h-3.5 w-3.5" />
                            {getContentKindLabel(attachment.kind)} · {attachment.label}
                          </div>
                          {attachment.kind === 'image' && attachment.objectUrl ? (
                            <img src={attachment.objectUrl} alt="" className="max-h-40 rounded-[8px] object-cover" />
                          ) : null}
                          {attachment.kind === 'audio' && attachment.objectUrl ? (
                            <audio src={attachment.objectUrl} controls className="w-full" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="grid min-h-[280px] place-items-center p-4 text-center">
                  <p className="m-0 text-[12px] text-[rgba(217,229,255,0.62)]">از پنل دسته‌بندی‌ها یک بخش انتخاب کن.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TaavDialog open={dialog !== null} onOpenChange={(open) => (!open ? closeDialog() : undefined)}>
        <TaavDialogContent size="sm" contentClassName="ai-lab-dialog">
          <TaavDialogHeader>
            <TaavDialogTitle className="text-right text-[length:var(--taav-text-lg)] font-black">
              {dialog?.type === 'delete-tab' || dialog?.type === 'delete-subtab'
                ? 'تأیید حذف'
                : dialog?.type === 'edit-tab-title' || dialog?.type === 'edit-subtab-title'
                  ? 'ویرایش عنوان'
                  : dialog?.type === 'add-subtab'
                    ? 'افزودن زیرتب'
                    : 'افزودن تب'}
            </TaavDialogTitle>
            <TaavDialogDescription className="text-right">
              {dialog?.type === 'delete-tab'
                ? `آیا از حذف تب «${dialog.title}» و تمام زیرتب‌های آن مطمئن هستید؟`
                : dialog?.type === 'delete-subtab'
                  ? `آیا از حذف زیرتب «${dialog.title}» مطمئن هستید؟`
                  : 'عنوان را وارد کن.'}
            </TaavDialogDescription>
          </TaavDialogHeader>

          {dialog && dialog.type !== 'delete-tab' && dialog.type !== 'delete-subtab' ? (
            <input
              value={dialog.draft}
              onChange={(event) => {
                const draft = event.target.value;
                setDialog((current) => (current ? { ...current, draft } : current));
              }}
              className="w-full rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-white outline-none"
              placeholder="عنوان"
            />
          ) : null}

          {dialogError ? (
            <div className="text-[12px] font-semibold text-[rgb(254,202,202)]">{dialogError}</div>
          ) : null}

          <TaavDialogFooter>
            <TaavButton variant="secondary" tone="neutral" onClick={closeDialog}>
              انصراف
            </TaavButton>
            <TaavButton onClick={confirmDialog}>
              {dialog?.type === 'delete-tab' || dialog?.type === 'delete-subtab' ? 'حذف' : 'تأیید'}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
    </div>
  );
}
