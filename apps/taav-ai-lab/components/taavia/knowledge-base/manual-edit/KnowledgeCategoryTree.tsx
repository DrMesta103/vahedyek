'use client';

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode, type Ref } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ChevronDown,
  ChevronLeft,
  FolderTree,
  GripVertical,
  Lock,
  LockOpen,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
} from 'lucide-react';
import { TaavButton, TaavPopover, TaavPopoverContent, TaavPopoverTrigger } from '@repo/ui/taav';
import type { CategoryEditNode } from '@/app/lib/types/taavia-knowledge-base-manual-draft';
import { getEditChildren, getEditRoots } from '@/app/lib/taavia-knowledge-base-manual-draft';

export type TreeMenuAction = 'add-child' | 'delete' | 'restore' | 'unlock' | 'rename' | 'sources';

type RowCallbacks = {
  selected: boolean;
  nested: boolean;
  childCount: number;
  expanded: boolean;
  menuOpen: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onMenuOpenChange: (open: boolean) => void;
  onMenuAction: (action: TreeMenuAction) => void;
  onRename: (title: string) => void;
  onRequestUnlock: () => void;
};

export function KnowledgeCategoryTree({
  nodes,
  selectedId,
  query,
  onQueryChange,
  onSelect,
  onCreateRoot,
  onMenuAction,
  onRename,
  onReorder,
  onRequestUnlockForDrag,
  totalLabel,
}: {
  nodes: CategoryEditNode[];
  selectedId: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (id: string) => void;
  onCreateRoot: () => void;
  onMenuAction: (id: string, action: TreeMenuAction) => void;
  onRename: (id: string, title: string) => void;
  onReorder: (orderedIds: string[], parentId: string | null) => void;
  onRequestUnlockForDrag: (id: string, resume: () => void) => void;
  totalLabel: string;
}) {
  const normalized = query.trim().toLocaleLowerCase('fa');
  const roots = useMemo(
    () =>
      getEditRoots(nodes).filter((root) => {
        if (!normalized) return true;
        const children = getEditChildren(nodes, root.id);
        return (
          root.title.toLocaleLowerCase('fa').includes(normalized) ||
          children.some((child) => child.title.toLocaleLowerCase('fa').includes(normalized))
        );
      }),
    [nodes, normalized],
  );

  const [expanded, setExpanded] = useState(() => new Set(roots.map((root) => root.id)));
  const [menuId, setMenuId] = useState<string | null>(null);
  const [dndReady, setDndReady] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    setDndReady(true);
  }, []);

  useEffect(() => {
    setExpanded((current) => {
      const next = new Set(current);
      for (const root of roots) next.add(root.id);
      return next;
    });
  }, [nodes.length]);

  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleRootDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = roots.map((root) => root.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const activeNode = roots[oldIndex];
    if (!activeNode?.unlocked) {
      onRequestUnlockForDrag(activeNode.id, () => onReorder(arrayMove(ids, oldIndex, newIndex), null));
      return;
    }
    onReorder(arrayMove(ids, oldIndex, newIndex), null);
  };

  const renderRootBlock = (root: CategoryEditNode, sortable: boolean) => {
    const children = getEditChildren(nodes, root.id).filter(
      (child) =>
        !normalized ||
        child.title.toLocaleLowerCase('fa').includes(normalized) ||
        root.title.toLocaleLowerCase('fa').includes(normalized),
    );
    const rowProps: RowCallbacks = {
      selected: selectedId === root.id,
      nested: false,
      childCount: children.length,
      expanded: expanded.has(root.id),
      menuOpen: menuId === root.id,
      onToggle: () => toggle(root.id),
      onSelect: () => onSelect(root.id),
      onMenuOpenChange: (open) => setMenuId(open ? root.id : null),
      onMenuAction: (action) => {
        setMenuId(null);
        onMenuAction(root.id, action);
      },
      onRename: (title) => onRename(root.id, title),
      onRequestUnlock: () => onMenuAction(root.id, 'unlock'),
    };

    return (
      <div key={root.id} className={expanded.has(root.id) && children.length ? 'border-b border-[var(--taav-border-subtle)]/40' : ''}>
        {sortable ? <SortableTreeRow node={root} {...rowProps} /> : <StaticTreeRow node={root} {...rowProps} />}
        {expanded.has(root.id) ? (
          <ChildList
            parentId={root.id}
            childrenNodes={children}
            selectedId={selectedId}
            menuId={menuId}
            setMenuId={setMenuId}
            onSelect={onSelect}
            onMenuAction={onMenuAction}
            onRename={onRename}
            onReorder={onReorder}
            onRequestUnlockForDrag={onRequestUnlockForDrag}
            dndReady={dndReady}
          />
        ) : null}
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-col">
      <div className="border-b border-[var(--taav-border-subtle)] px-4 pb-3.5 pt-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="m-0 flex items-center gap-2 text-sm font-black text-[var(--taav-text-strong)]">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]">
              <FolderTree className="h-4 w-4" />
            </span>
            دسته‌بندی‌ها
          </h2>
          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-bold tabular-nums text-[var(--taav-text-muted)]">
            {totalLabel}
          </span>
        </div>
        <div className="mt-3.5 flex flex-col gap-2">
          <label className="relative block">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--taav-text-muted)]" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="جستجو در دسته‌بندی‌ها..."
              className="h-10 w-full rounded-xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] py-2 pr-10 pl-3 text-sm text-[var(--taav-text-strong)] outline-none transition placeholder:text-[var(--taav-text-muted)] focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
            />
          </label>
          <TaavButton size="sm" onClick={onCreateRoot} iconStart={<Plus className="h-4 w-4" />} unsafeClassName="w-full justify-center">
            دسته‌بندی جدید
          </TaavButton>
        </div>
      </div>

      <div>
        {dndReady ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleRootDragEnd}>
            <SortableContext items={roots.map((root) => root.id)} strategy={verticalListSortingStrategy}>
              {roots.map((root) => renderRootBlock(root, true))}
            </SortableContext>
          </DndContext>
        ) : (
          roots.map((root) => renderRootBlock(root, false))
        )}
        {!roots.length ? <p className="p-10 text-center text-sm text-[var(--taav-text-muted)]">دسته‌بندی مطابق جستجو پیدا نشد.</p> : null}
      </div>
    </div>
  );
}

function ChildList({
  parentId,
  childrenNodes,
  selectedId,
  menuId,
  setMenuId,
  onSelect,
  onMenuAction,
  onRename,
  onReorder,
  onRequestUnlockForDrag,
  dndReady,
}: {
  parentId: string;
  childrenNodes: CategoryEditNode[];
  selectedId: string | null;
  menuId: string | null;
  setMenuId: (id: string | null) => void;
  onSelect: (id: string) => void;
  onMenuAction: (id: string, action: TreeMenuAction) => void;
  onRename: (id: string, title: string) => void;
  onReorder: (orderedIds: string[], parentId: string | null) => void;
  onRequestUnlockForDrag: (id: string, resume: () => void) => void;
  dndReady: boolean;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = childrenNodes.map((child) => child.id);
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const activeNode = childrenNodes[oldIndex];
    if (!activeNode?.unlocked) {
      onRequestUnlockForDrag(activeNode.id, () => onReorder(arrayMove(ids, oldIndex, newIndex), parentId));
      return;
    }
    onReorder(arrayMove(ids, oldIndex, newIndex), parentId);
  };

  const renderChild = (child: CategoryEditNode, sortable: boolean) => {
    const rowProps: RowCallbacks = {
      selected: selectedId === child.id,
      nested: true,
      childCount: 0,
      expanded: false,
      menuOpen: menuId === child.id,
      onToggle: () => undefined,
      onSelect: () => onSelect(child.id),
      onMenuOpenChange: (open) => setMenuId(open ? child.id : null),
      onMenuAction: (action) => {
        setMenuId(null);
        onMenuAction(child.id, action);
      },
      onRename: (title) => onRename(child.id, title),
      onRequestUnlock: () => onMenuAction(child.id, 'unlock'),
    };
    return sortable ? (
      <SortableTreeRow key={child.id} node={child} {...rowProps} />
    ) : (
      <StaticTreeRow key={child.id} node={child} {...rowProps} />
    );
  };

  return (
    <div className="mr-5 border-r border-sky-400/15 bg-black/[0.12]">
      {dndReady ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={childrenNodes.map((child) => child.id)} strategy={verticalListSortingStrategy}>
            {childrenNodes.map((child) => renderChild(child, true))}
          </SortableContext>
        </DndContext>
      ) : (
        childrenNodes.map((child) => renderChild(child, false))
      )}
    </div>
  );
}

function StaticTreeRow({ node, ...callbacks }: { node: CategoryEditNode } & RowCallbacks) {
  return (
    <TreeRowShell
      node={node}
      {...callbacks}
      dragHandle={
        <button
          type="button"
          className="grid h-8 w-5 shrink-0 place-items-center text-[var(--taav-text-muted)] opacity-50"
          aria-label="جابه‌جایی"
          disabled
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      }
    />
  );
}

function SortableTreeRow({ node, ...callbacks }: { node: CategoryEditNode } & RowCallbacks) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id });

  return (
    <TreeRowShell
      node={node}
      {...callbacks}
      rowRef={setNodeRef}
      rowStyle={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.75 : 1 }}
      dragHandle={
        <button
          type="button"
          className="grid h-8 w-5 shrink-0 place-items-center text-[var(--taav-text-muted)] opacity-50 transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
          aria-label="جابه‌جایی"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      }
    />
  );
}

function TreeRowShell({
  node,
  selected,
  nested,
  childCount,
  expanded,
  menuOpen,
  onToggle,
  onSelect,
  onMenuOpenChange,
  onMenuAction,
  onRename,
  onRequestUnlock,
  dragHandle,
  rowRef,
  rowStyle,
}: { node: CategoryEditNode } & RowCallbacks & {
  dragHandle: ReactNode;
  rowRef?: Ref<HTMLDivElement>;
  rowStyle?: CSSProperties;
}) {
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(node.title);

  useEffect(() => {
    setDraftTitle(node.title);
  }, [node.title]);

  const commitRename = () => {
    setEditing(false);
    const next = draftTitle.trim();
    if (!next || next === node.title) {
      setDraftTitle(node.title);
      return;
    }
    onRename(next);
  };

  const runMenuAction = (action: TreeMenuAction) => {
    onMenuOpenChange(false);
    onMenuAction(action);
  };

  return (
    <div
      ref={rowRef}
      style={rowStyle}
      className={`group relative flex min-h-12 items-center gap-1 border-b border-[var(--taav-border-subtle)]/70 px-2 transition ${
        selected ? 'bg-sky-500/[0.12]' : 'hover:bg-white/[0.035]'
      } ${nested ? 'pr-4' : ''} ${node.isPendingDeletion ? 'opacity-55' : ''}`}
    >
      {selected ? <span className="absolute inset-y-2 right-0 w-0.5 rounded-full bg-sky-400" aria-hidden /> : null}
      {dragHandle}
      {!nested && childCount > 0 ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label={expanded ? 'بستن زیردسته‌ها' : 'باز کردن زیردسته‌ها'}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[var(--taav-text-muted)] transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
        >
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      ) : (
        <span className="grid h-8 w-8 shrink-0 place-items-center">
          {nested ? <span className="h-1.5 w-1.5 rounded-full bg-white/25" aria-hidden /> : null}
        </span>
      )}

      {editing && node.unlocked && !node.isPendingDeletion ? (
        <input
          autoFocus
          value={draftTitle}
          onChange={(event) => setDraftTitle(event.target.value)}
          onBlur={commitRename}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commitRename();
            if (event.key === 'Escape') {
              setDraftTitle(node.title);
              setEditing(false);
            }
          }}
          className="min-w-0 flex-1 rounded-md border border-sky-400/40 bg-black/20 px-2 py-1.5 text-right text-sm text-[var(--taav-text-strong)] outline-none focus:ring-2 focus:ring-sky-400/30"
        />
      ) : (
        <button
          type="button"
          onClick={onSelect}
          onDoubleClick={() => {
            if (!node.unlocked) {
              onRequestUnlock();
              return;
            }
            setEditing(true);
          }}
          className={`min-w-0 flex-1 truncate py-3 text-right text-sm focus-visible:outline-none ${
            selected ? 'font-bold text-[var(--taav-text-strong)]' : 'font-medium text-[var(--taav-text-body)]'
          } ${node.isPendingDeletion ? 'line-through' : ''}`}
        >
          {node.title}
        </button>
      )}

      {node.isEdited ? (
        <span className="shrink-0 rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-100">
          در انتظار ارسال
        </span>
      ) : null}
      {!node.isEdited && node.isManualVsAi ? (
        <span
          className="shrink-0 max-w-[9.5rem] truncate rounded-full border border-violet-400/40 bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-100"
          title="این دسته نسبت به خروجی ساخت AI به‌صورت دستی ویرایش شده است"
        >
          ویرایش دستی نسبت به AI
        </span>
      ) : null}

      {!nested ? (
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] tabular-nums ${selected ? 'bg-sky-400/20 text-sky-200' : 'bg-white/[0.06] text-[var(--taav-text-muted)]'}`}>
          {childCount.toLocaleString('fa-IR')}
        </span>
      ) : null}

      <button
        type="button"
        onClick={onRequestUnlock}
        aria-label={node.unlocked ? 'قفل باز است' : 'باز کردن قفل'}
        className="grid h-8 w-8 place-items-center rounded-md text-[var(--taav-text-muted)] transition hover:bg-white/5 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
      >
        {node.unlocked ? <LockOpen className="h-3.5 w-3.5 text-sky-300" /> : <Lock className="h-3.5 w-3.5" />}
      </button>

      {node.isPendingDeletion ? (
        <button
          type="button"
          onClick={() => onMenuAction('restore')}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-sky-200 transition hover:bg-sky-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
        >
          <RotateCcw className="h-3 w-3" />
          بازگردانی
        </button>
      ) : (
        <TaavPopover open={menuOpen} onOpenChange={onMenuOpenChange}>
          <TaavPopoverTrigger asChild>
            <button
              type="button"
              aria-label="منوی اقدامات"
              className="grid h-8 w-8 place-items-center rounded-md text-[var(--taav-text-muted)] transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </TaavPopoverTrigger>
          <TaavPopoverContent
            side="bottom"
            align="start"
            size="sm"
            contentClassName="z-[80] min-w-[11rem] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-elevated)] p-1 shadow-xl"
          >
            <div role="menu" className="grid gap-0.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => runMenuAction('rename')}
                className="flex w-full rounded-lg px-3 py-2 text-right text-xs font-semibold text-[var(--taav-text-body)] transition hover:bg-white/5"
              >
                تغییر عنوان
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => runMenuAction('sources')}
                className="flex w-full rounded-lg px-3 py-2 text-right text-xs font-semibold text-[var(--taav-text-body)] transition hover:bg-white/5"
              >
                منابع
              </button>
              {!nested ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => runMenuAction('add-child')}
                  className="flex w-full rounded-lg px-3 py-2 text-right text-xs font-semibold text-[var(--taav-text-body)] transition hover:bg-white/5"
                >
                  افزودن زیر‌دسته
                </button>
              ) : null}
              <button
                type="button"
                role="menuitem"
                onClick={() => runMenuAction('delete')}
                className="flex w-full rounded-lg px-3 py-2 text-right text-xs font-semibold text-rose-300 transition hover:bg-white/5"
              >
                حذف
              </button>
            </div>
          </TaavPopoverContent>
        </TaavPopover>
      )}
    </div>
  );
}
