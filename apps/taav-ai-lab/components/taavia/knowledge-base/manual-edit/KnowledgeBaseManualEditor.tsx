'use client';

import { useEffect, useMemo, useState } from 'react';
import { TaavCard } from '@repo/ui/taav';
import type { KnowledgeBaseCategoryDetailsPageData } from '@/app/lib/types/taavia-knowledge-base-category-details';
import type { CategoryEditNode, CategoryEditToast } from '@/app/lib/types/taavia-knowledge-base-manual-draft';
import {
  commitCategoryNodesAsBaseline,
  createCategoryEditNodes,
  createCategoryNode,
  getEditChildren,
  hasPendingCategoryEdits,
  markCategoryNodeDeleted,
  reorderCategorySiblings,
  resetCategoryNodesToBaseline,
  restoreCategoryNode,
  unlockCategoryNode,
  updateCategoryNodeFields,
} from '@/app/lib/taavia-knowledge-base-manual-draft';
import { CategoryAiSyncActionBar } from './CategoryAiSyncActionBar';
import { CategoryResourcesDialog } from './CategoryResourcesDialog';
import { CreateCategoryDialog } from './CreateCategoryDialog';
import { DeleteCategoryDialog } from './DeleteCategoryDialog';
import { KnowledgeCategoryTree, type TreeMenuAction } from './KnowledgeCategoryTree';
import { KnowledgeNodeEditor } from './KnowledgeNodeEditor';
import { RenameCategoryDialog } from './RenameCategoryDialog';
import { ResetCategoriesDialog } from './ResetCategoriesDialog';
import { UnlockCategoryEditDialog } from './UnlockCategoryEditDialog';

type UnlockIntent =
  | { kind: 'unlock'; id: string }
  | { kind: 'rename'; id: string }
  | { kind: 'create-root' }
  | { kind: 'add-child'; parentId: string }
  | { kind: 'delete'; id: string }
  | { kind: 'drag'; id: string; resume: () => void }
  | null;

type CreateDialogState = { parentId: string | null } | null;

export function KnowledgeBaseManualEditor({
  data,
  onPendingEditsChange,
}: {
  data: KnowledgeBaseCategoryDetailsPageData;
  onPendingEditsChange?: (pending: boolean) => void;
}) {
  const [nodes, setNodes] = useState<CategoryEditNode[]>(() => createCategoryEditNodes(data.categories));
  const [selectedId, setSelectedId] = useState<string | null>(() => nodes[0]?.id ?? null);
  const [query, setQuery] = useState('');
  const [unlockIntent, setUnlockIntent] = useState<UnlockIntent>(null);
  const [createDialog, setCreateDialog] = useState<CreateDialogState>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [resourcesId, setResourcesId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<CategoryEditToast | null>(null);

  const selected = nodes.find((node) => node.id === selectedId) ?? null;
  const pending = hasPendingCategoryEdits(nodes);
  const editedCount = useMemo(() => nodes.filter((node) => node.isEdited || node.isPendingDeletion).length, [nodes]);
  const sourcesHref = `/businesses/${data.businessId}/products/taavia/brands/${data.brandId}/sources`;

  useEffect(() => {
    onPendingEditsChange?.(pending);
  }, [pending, onPendingEditsChange]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string, tone: CategoryEditToast['tone'] = 'success') => {
    setToast({ id: crypto.randomUUID(), message, tone });
  };

  const openCreateDialog = (parentId: string | null) => {
    setCreateDialog({ parentId });
  };

  const requestUnlock = (intent: UnlockIntent) => {
    if (!intent) return;
    if (intent.kind === 'unlock' || intent.kind === 'drag' || intent.kind === 'rename') {
      const node = nodes.find((item) => item.id === intent.id);
      if (node?.unlocked) {
        if (intent.kind === 'drag') intent.resume();
        if (intent.kind === 'rename') {
          setSelectedId(intent.id);
          setRenameId(intent.id);
        }
        return;
      }
    }
    if (intent.kind === 'add-child') {
      const parent = nodes.find((item) => item.id === intent.parentId);
      if (parent?.unlocked) {
        openCreateDialog(intent.parentId);
        return;
      }
    }
    setUnlockIntent(intent);
  };

  const confirmUnlock = () => {
    const intent = unlockIntent;
    setUnlockIntent(null);
    if (!intent) return;

    if (intent.kind === 'unlock') {
      setNodes((current) => unlockCategoryNode(current, intent.id));
      setSelectedId(intent.id);
      return;
    }

    if (intent.kind === 'rename') {
      setNodes((current) => unlockCategoryNode(current, intent.id));
      setSelectedId(intent.id);
      setRenameId(intent.id);
      return;
    }

    if (intent.kind === 'drag') {
      setNodes((current) => unlockCategoryNode(current, intent.id));
      intent.resume();
      return;
    }

    if (intent.kind === 'create-root') {
      openCreateDialog(null);
      return;
    }

    if (intent.kind === 'add-child') {
      setNodes((current) => unlockCategoryNode(current, intent.parentId));
      openCreateDialog(intent.parentId);
      return;
    }

    if (intent.kind === 'delete') {
      setNodes((current) => unlockCategoryNode(current, intent.id));
      setDeleteId(intent.id);
    }
  };

  const submitCreate = (title: string) => {
    if (!createDialog) return;
    const parentId = createDialog.parentId;
    setCreateDialog(null);
    setNodes((current) => {
      const base = parentId ? unlockCategoryNode(current, parentId) : current;
      const result = createCategoryNode({ nodes: base, title, parentId });
      setSelectedId(result.id);
      return result.nodes;
    });
    showToast(parentId ? 'زیر‌دسته افزوده شد.' : 'دسته‌بندی جدید افزوده شد.');
  };

  const handleMenuAction = (id: string, action: TreeMenuAction) => {
    const node = nodes.find((item) => item.id === id);
    if (!node) return;

    if (action === 'unlock') {
      requestUnlock({ kind: 'unlock', id });
      return;
    }
    if (action === 'restore') {
      setNodes((current) => restoreCategoryNode(current, id));
      showToast('دسته‌بندی بازگردانی شد.');
      return;
    }
    if (action === 'rename') {
      requestUnlock({ kind: 'rename', id });
      return;
    }
    if (action === 'sources') {
      setSelectedId(id);
      setResourcesId(id);
      return;
    }
    if (action === 'add-child') {
      requestUnlock({ kind: 'add-child', parentId: id });
      return;
    }
    if (action === 'delete') {
      if (!node.unlocked) {
        requestUnlock({ kind: 'delete', id });
        return;
      }
      setDeleteId(id);
    }
  };

  const deleteTarget = deleteId ? nodes.find((node) => node.id === deleteId) : null;
  const renameTarget = renameId ? nodes.find((node) => node.id === renameId) : null;
  const resourcesTarget = resourcesId ? nodes.find((node) => node.id === resourcesId) : null;

  const sendToAi = () => {
    setSending(true);
    window.setTimeout(() => {
      setNodes((current) => commitCategoryNodesAsBaseline(current));
      setSending(false);
      showToast('دسته‌بندی‌ها برای به‌روزرسانی به AI ارسال شد.');
    }, 1200);
  };

  return (
    <div className="grid gap-4">
      {toast ? (
        <p
          role="status"
          className={`rounded-xl border px-3 py-2 text-xs font-bold ${
            toast.tone === 'success'
              ? 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100'
              : toast.tone === 'warning'
                ? 'border-amber-400/35 bg-amber-500/10 text-amber-100'
                : toast.tone === 'danger'
                  ? 'border-rose-400/35 bg-rose-500/10 text-rose-100'
                  : 'border-sky-400/35 bg-sky-500/10 text-sky-100'
          }`}
        >
          {toast.message}
        </p>
      ) : null}

      <section className="relative grid items-start gap-4 lg:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.2fr)]">
        <TaavCard variant="outlined" padding="none" radius="xl" wrapperClassName="min-w-0 overflow-visible">
          <KnowledgeCategoryTree
            nodes={nodes}
            selectedId={selectedId}
            query={query}
            onQueryChange={setQuery}
            onSelect={setSelectedId}
            onCreateRoot={() => requestUnlock({ kind: 'create-root' })}
            onMenuAction={handleMenuAction}
            onRename={(id, title) => {
              const node = nodes.find((item) => item.id === id);
              if (!node?.unlocked) {
                requestUnlock({ kind: 'unlock', id });
                return;
              }
              setNodes((current) => updateCategoryNodeFields(current, id, { title }));
            }}
            onReorder={(orderedIds, parentId) => {
              setNodes((current) => reorderCategorySiblings(current, orderedIds, parentId));
            }}
            onRequestUnlockForDrag={(id, resume) => requestUnlock({ kind: 'drag', id, resume })}
            totalLabel={nodes.filter((node) => !node.isPendingDeletion).length.toLocaleString('fa-IR')}
          />
        </TaavCard>

        <TaavCard variant="outlined" padding="md" radius="xl" wrapperClassName="min-w-0">
          {selected ? (
            <KnowledgeNodeEditor
              node={selected}
              onRequestUnlock={() => requestUnlock({ kind: 'unlock', id: selected.id })}
              onContentChange={(content) => setNodes((current) => updateCategoryNodeFields(current, selected.id, { content }))}
            />
          ) : (
            <div className="py-16 text-center text-sm text-[var(--taav-text-muted)]">دسته‌بندی‌ای برای نمایش انتخاب نشده است.</div>
          )}
        </TaavCard>
      </section>

      {pending ? (
        <CategoryAiSyncActionBar
          editedCount={editedCount}
          sending={sending}
          onSendToAi={sendToAi}
          onReset={() => setResetOpen(true)}
        />
      ) : null}

      <UnlockCategoryEditDialog
        open={unlockIntent !== null}
        sourcesHref={sourcesHref}
        onOpenChange={(open) => {
          if (!open) setUnlockIntent(null);
        }}
        onConfirm={confirmUnlock}
      />

      <CreateCategoryDialog
        open={createDialog !== null}
        mode={createDialog?.parentId ? 'child' : 'root'}
        onOpenChange={(open) => {
          if (!open) setCreateDialog(null);
        }}
        onSubmit={submitCreate}
      />

      <RenameCategoryDialog
        open={Boolean(renameTarget)}
        initialTitle={renameTarget?.title ?? ''}
        onOpenChange={(open) => {
          if (!open) setRenameId(null);
        }}
        onSubmit={(title) => {
          if (!renameId) return;
          setNodes((current) => updateCategoryNodeFields(current, renameId, { title }));
          setRenameId(null);
          showToast('عنوان به‌روزرسانی شد.');
        }}
      />

      <CategoryResourcesDialog
        open={Boolean(resourcesTarget)}
        node={resourcesTarget}
        onOpenChange={(open) => {
          if (!open) setResourcesId(null);
        }}
      />

      <DeleteCategoryDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.title ?? ''}
        childCount={deleteTarget ? getEditChildren(nodes, deleteTarget.id).length : 0}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        onConfirm={() => {
          if (!deleteId) return;
          setNodes((current) => markCategoryNodeDeleted(current, deleteId));
          setDeleteId(null);
          showToast('حذف ثبت شد؛ تا ارسال به AI اعمال نهایی نمی‌شود.');
        }}
      />

      <ResetCategoriesDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        onConfirm={() => {
          setNodes((current) => resetCategoryNodesToBaseline(current));
          setResetOpen(false);
          showToast('تغییرات دسته‌بندی‌ها حذف شد و به اصل بازگشت.');
        }}
      />
    </div>
  );
}
