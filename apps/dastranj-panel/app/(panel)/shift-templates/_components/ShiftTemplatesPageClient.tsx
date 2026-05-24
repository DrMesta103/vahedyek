'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock3, GitBranch, Hourglass, RefreshCw, Search, Timer } from 'lucide-react';
import { ModuleAddTile } from '../../../components/module-page/ModuleAddTile';
import { ModulePageHeader } from '../../../components/module-page/ModulePageHeader';
import { panelBreadcrumbs } from '../../../components/module-page/module-breadcrumbs';
import {
  SHIFT_TEMPLATE_CATEGORIES,
  templateTypeToCalendarShiftType,
  type ShiftTemplateCategory,
} from '../../../lib/shift-template-map';
import { CreateShiftTemplateDialog } from './CreateShiftTemplateDialog';
import { ShiftTemplateCard, type ShiftTemplateListItem } from './ShiftTemplateCard';

const CATEGORY_ICONS = {
  fixed: Clock3,
  'float-day': Hourglass,
  'float-abs': Timer,
  split: GitBranch,
  rotate: RefreshCw,
} as const;

type ShiftTemplatesPageClientProps = {
  items: Array<{
    id: string;
    title: string;
    description: string | null;
    type: string;
    weekDays: unknown;
    isActive: boolean;
  }>;
};

function normalizeItems(items: ShiftTemplatesPageClientProps['items']): ShiftTemplateListItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    shiftType: templateTypeToCalendarShiftType(item.type as never),
    weekDays: Array.isArray(item.weekDays) ? item.weekDays.filter((day): day is string => typeof day === 'string') : [],
    isActive: item.isActive,
  }));
}

function ShiftTemplatesPageClientInner({ items }: ShiftTemplatesPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<ShiftTemplateCategory>('fixed');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedItems = useMemo(() => normalizeItems(items), [items]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim();
    return normalizedItems.filter((item) => {
      if (item.shiftType !== activeCategory) return false;
      if (!query) return true;
      return item.title.includes(query) || (item.description ?? '').includes(query);
    });
  }, [activeCategory, normalizedItems, searchQuery]);

  const openCreateDialog = () => setCreateDialogOpen(true);

  const closeCreateDialog = () => {
    setCreateDialogOpen(false);
    if (searchParams.get('create') === '1') {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('create');
      const query = params.toString();
      router.replace(query ? `/shift-templates?${query}` : '/shift-templates');
    }
  };

  const handleSaved = () => {
    closeCreateDialog();
    router.refresh();
  };

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setCreateDialogOpen(true);
    }

    const typeParam = searchParams.get('type');
    if (typeParam && SHIFT_TEMPLATE_CATEGORIES.some((item) => item.id === typeParam)) {
      setActiveCategory(typeParam as ShiftTemplateCategory);
    }
  }, [searchParams]);

  return (
    <>
      <ModulePageHeader
        breadcrumbs={panelBreadcrumbs('قالب شیفت')}
        title="قالب‌های شیفت"
        subtitle="الگوهای شیفت برای استفاده در تقویم و سیاست‌های کاری."
        addLabel="افزودن"
        onAddClick={openCreateDialog}
      />

      <div className="shift-templates-toolbar">
        <label className="shift-templates-search" aria-label="جستجو در قالب‌های شیفت">
          <Search className="h-4 w-4" aria-hidden />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="جستجو..."
          />
        </label>
      </div>

      <div className="shift-template-categories" role="tablist" aria-label="نوع قالب شیفت">
        {SHIFT_TEMPLATE_CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.id];
          const isActive = category.id === activeCategory;

          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`shift-template-category-card is-${category.tone}${isActive ? ' is-active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className={`shift-template-category-card-icon is-${category.tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="shift-template-category-card-copy">
                <strong>{category.label}</strong>
                <span>{category.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="module-page-grid shift-templates-grid">
        {filteredItems.map((item) => (
          <ShiftTemplateCard key={item.id} item={item} />
        ))}
        <ModuleAddTile onClick={openCreateDialog} label="برای افزودن قالب شیفت جدید کلیک کنید." />
      </div>

      <CreateShiftTemplateDialog
        open={createDialogOpen}
        shiftType={activeCategory}
        onClose={closeCreateDialog}
        onSaved={handleSaved}
      />
    </>
  );
}

export function ShiftTemplatesPageClient(props: ShiftTemplatesPageClientProps) {
  return (
    <Suspense fallback={null}>
      <ShiftTemplatesPageClientInner {...props} />
    </Suspense>
  );
}
