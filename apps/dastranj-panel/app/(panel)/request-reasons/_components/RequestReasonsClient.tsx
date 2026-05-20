'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
  type WheelEvent,
} from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { requestReasonCategories, requestReasonTabLabels } from '../../../lib/constants';
import {
  deleteRequestReasonAction,
  reorderRequestReasonsAction,
  toggleRequestReasonActiveAction,
} from '../../../lib/actions';

export type RequestReasonListItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  isActive: boolean;
  displayOrder: number;
};

type RequestReasonsClientProps = {
  items: RequestReasonListItem[];
  activeCategory: keyof typeof requestReasonTabLabels;
};

function RequestReasonRowShell({
  item,
  category,
  onToggle,
  toggling,
  dragHandle,
  articleRef,
  articleStyle,
  articleClassName,
}: {
  item: RequestReasonListItem;
  category: string;
  onToggle: (id: string, next: boolean) => void;
  toggling: boolean;
  dragHandle: ReactNode;
  articleRef?: (node: HTMLElement | null) => void;
  articleStyle?: React.CSSProperties;
  articleClassName?: string;
}) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const description = item.description?.trim() ? item.description : 'توضیحات ثبت نشده است';

  return (
    <article ref={articleRef} style={articleStyle} className={articleClassName ?? 'request-reason-row'}>
      {dragHandle}

      <label className="request-reason-toggle">
        <input
          type="checkbox"
          checked={item.isActive}
          disabled={toggling}
          onChange={(event) => onToggle(item.id, event.target.checked)}
        />
        <span className="request-reason-toggle-track" aria-hidden />
      </label>

      <div className="request-reason-row-copy">
        <h3>
          <span className="request-reason-label">عنوان :</span> {item.title}
        </h3>
        <p>
          <span className="request-reason-label">توضیحات :</span> {description}
        </p>
      </div>

      <div className="request-reason-row-actions">
        <Link href={`/request-reasons/${item.id}/edit`} className="request-reason-icon-btn" aria-label={`ویرایش ${item.title}`}>
          <Pencil className="h-4 w-4" strokeWidth={2.2} />
        </Link>
        <button type="button" className="request-reason-icon-btn is-danger" aria-label={`حذف ${item.title}`} onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" strokeWidth={2.2} />
        </button>
        <form ref={deleteFormRef} action={deleteRequestReasonAction} hidden>
          <input type="hidden" name="id" value={item.id} />
          <input type="hidden" name="category" value={category} />
        </form>
        <ConfirmDialog
          open={deleteOpen}
          title="حذف علت درخواست"
          description={`آیا از حذف «${item.title}» مطمئن هستید؟`}
          confirmLabel="بله، حذف شود"
          cancelLabel="انصراف"
          tone="danger"
          onCancel={() => setDeleteOpen(false)}
          onConfirm={() => {
            deleteFormRef.current?.requestSubmit();
            setDeleteOpen(false);
          }}
        />
      </div>
    </article>
  );
}

function SortableRequestReasonRow({
  item,
  category,
  onToggle,
  toggling,
}: {
  item: RequestReasonListItem;
  category: string;
  onToggle: (id: string, next: boolean) => void;
  toggling: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.82 : 1,
  };

  return (
    <RequestReasonRowShell
      item={item}
      category={category}
      onToggle={onToggle}
      toggling={toggling}
      articleRef={setNodeRef}
      articleStyle={style}
      articleClassName={`request-reason-row${isDragging ? ' is-dragging' : ''}`}
      dragHandle={
        <button type="button" className="request-reason-drag-btn" aria-label="جابجایی" {...attributes} {...listeners}>
          <GripVertical className="h-5 w-5" strokeWidth={2.2} />
        </button>
      }
    />
  );
}

function StaticRequestReasonRow({
  item,
  category,
  onToggle,
  toggling,
}: {
  item: RequestReasonListItem;
  category: string;
  onToggle: (id: string, next: boolean) => void;
  toggling: boolean;
}) {
  return (
    <RequestReasonRowShell
      item={item}
      category={category}
      onToggle={onToggle}
      toggling={toggling}
      dragHandle={
        <button type="button" className="request-reason-drag-btn" aria-label="جابجایی" disabled>
          <GripVertical className="h-5 w-5" strokeWidth={2.2} />
        </button>
      }
    />
  );
}

export function RequestReasonsClient({ items, activeCategory }: RequestReasonsClientProps) {
  const router = useRouter();
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const [dndReady, setDndReady] = useState(false);
  const [pending, startTransition] = useTransition();
  const categoryItems = useMemo(
    () => items.filter((item) => item.category === activeCategory).sort((a, b) => a.displayOrder - b.displayOrder),
    [items, activeCategory],
  );
  const [orderedItems, setOrderedItems] = useState(categoryItems);

  useEffect(() => {
    setOrderedItems(categoryItems);
  }, [categoryItems]);

  useEffect(() => {
    setDndReady(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleCategoryChange = (category: keyof typeof requestReasonTabLabels) => {
    router.push(`/request-reasons?category=${category}`);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
    const newIndex = orderedItems.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const nextItems = arrayMove(orderedItems, oldIndex, newIndex);
    setOrderedItems(nextItems);

    const formData = new FormData();
    formData.set('category', activeCategory);
    formData.set('orderedIds', JSON.stringify(nextItems.map((item) => item.id)));

    startTransition(() => {
      void reorderRequestReasonsAction(formData);
    });
  };

  const handleToggle = (id: string, next: boolean) => {
    setOrderedItems((prev) => prev.map((item) => (item.id === id ? { ...item, isActive: next } : item)));

    const formData = new FormData();
    formData.set('id', id);
    formData.set('isActive', String(next));

    startTransition(() => {
      void toggleRequestReasonActiveAction(formData);
    });
  };

  const addHref = `/request-reasons/new?category=${activeCategory}`;

  const handleCategoriesWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    const el = categoriesScrollRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      el.scrollBy({ left: event.deltaY, behavior: 'auto' });
    }
  }, []);

  const listContent = dndReady ? (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={orderedItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className="request-reason-list">
          {orderedItems.map((item) => (
            <SortableRequestReasonRow key={item.id} item={item} category={activeCategory} onToggle={handleToggle} toggling={pending} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  ) : (
    <div className="request-reason-list">
      {orderedItems.map((item) => (
        <StaticRequestReasonRow key={item.id} item={item} category={activeCategory} onToggle={handleToggle} toggling={pending} />
      ))}
    </div>
  );

  return (
    <>
      <div className="request-reason-categories-clip">
        <div
          ref={categoriesScrollRef}
          className="request-reason-categories-scroll"
          onWheel={handleCategoriesWheel}
        >
          <div className="request-reason-categories" role="tablist" aria-label="دسته‌بندی دلایل درخواست">
          {requestReasonCategories.map((category) => {
            const isActive = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`request-reason-category-chip${isActive ? ' is-active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {requestReasonTabLabels[category]}
              </button>
            );
          })}
          </div>
        </div>
      </div>

      {listContent}

      <div className="request-reasons-footer">
        <Link href={addHref} className="module-page-add-btn request-reasons-add-btn">
          <span aria-hidden>+</span>
          افزودن علت درخواست
        </Link>
      </div>
    </>
  );
}
