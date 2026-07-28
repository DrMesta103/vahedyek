'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  FileText,
  FolderTree,
  Info,
  LayoutDashboard,
  Library,
  PencilLine,
  Search,
} from 'lucide-react';
import {
  TaavBadge,
  TaavButton,
  TaavCard,
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
  TaavTooltip,
  TaavTooltipProvider,
} from '@repo/ui/taav';
import type { KnowledgeBaseCategoryDetailsPageData } from '@/app/lib/types/taavia-knowledge-base-category-details';
import { InitialKnowledgeBuildPanel } from '@/components/taavia/knowledge-base/InitialKnowledgeBuildPanel';
import { KnowledgeBaseBuildActions } from '@/components/taavia/knowledge-base/KnowledgeBaseBuildActions';
import { KnowledgeBaseManualEditor } from '@/components/taavia/knowledge-base/manual-edit';

type Category = KnowledgeBaseCategoryDetailsPageData['categories'][number];

export function TaaviaKnowledgeBaseCategoriesDetailsClient({ data }: { data: KnowledgeBaseCategoryDetailsPageData }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(data.categories[0]?.id ?? null);
  const [expanded, setExpanded] = useState(() => new Set(data.categories.filter((category) => category.level === 1).map((category) => category.id)));
  const [resourcesCategory, setResourcesCategory] = useState<Category | null>(null);
  const [pendingCategoryEdits, setPendingCategoryEdits] = useState(false);

  const normalizedQuery = query.trim().toLocaleLowerCase('fa');
  const selected = data.categories.find((category) => category.id === selectedId) ?? data.categories[0] ?? null;
  const childrenFor = (parentId: string) =>
    data.categories
      .filter((category) => category.parentCategoryId === parentId)
      .filter((category) => !normalizedQuery || category.title.toLocaleLowerCase('fa').includes(normalizedQuery));
  const parents = useMemo(
    () =>
      data.categories
        .filter((category) => category.level === 1)
        .filter(
          (category) =>
            !normalizedQuery ||
            category.title.toLocaleLowerCase('fa').includes(normalizedQuery) ||
            childrenFor(category.id).length > 0,
        ),
    [data.categories, normalizedQuery],
  );
  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const brandDashboardHref = `/businesses/${data.businessId}/products/taavia/brands/${data.brandId}`;
  const overviewHref = data.knowledgeBaseId
    ? `/businesses/${data.businessId}/products/taavia/brands/${data.brandId}/knowledge-base/${data.knowledgeBaseId}`
    : `/businesses/${data.businessId}/products/taavia/brands/${data.brandId}/knowledge-base`;
  const buildInProgress = Boolean(data.activeBuild);
  const manualEditEnabled = Boolean(data.knowledgeBaseId && data.isActive && !buildInProgress);

  const Row = ({ category, nested = false }: { category: Category; nested?: boolean }) => {
    const isSelected = selected?.id === category.id;
    return (
      <div
        className={`group relative flex min-h-12 items-center gap-1 border-b border-[var(--taav-border-subtle)]/70 px-2 transition ${
          isSelected ? 'bg-sky-500/[0.12]' : 'hover:bg-white/[0.035]'
        } ${nested ? 'pr-4' : ''}`}
      >
        {isSelected ? <span className="absolute inset-y-2 right-0 w-0.5 rounded-full bg-sky-400" aria-hidden /> : null}
        {!nested && category.childrenCount > 0 ? (
          <button
            type="button"
            onClick={() => toggle(category.id)}
            aria-label={expanded.has(category.id) ? 'بستن زیردسته‌ها' : 'باز کردن زیردسته‌ها'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[var(--taav-text-muted)] transition hover:bg-white/5 hover:text-[var(--taav-text-strong)]"
          >
            {expanded.has(category.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        ) : (
          <span className={`grid h-8 w-8 shrink-0 place-items-center ${nested ? 'text-[var(--taav-text-muted)]' : ''}`}>
            {nested ? <span className="h-1.5 w-1.5 rounded-full bg-white/25" aria-hidden /> : null}
          </span>
        )}
        <button
          type="button"
          onClick={() => setSelectedId(category.id)}
          className={`min-w-0 flex-1 truncate py-3 text-right text-sm ${isSelected ? 'font-bold text-[var(--taav-text-strong)]' : 'font-medium text-[var(--taav-text-body)]'}`}
        >
          {category.title}
        </button>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
            isSelected ? 'bg-sky-400/20 text-sky-200' : 'bg-white/[0.06] text-[var(--taav-text-muted)]'
          }`}
          title="تعداد منابع"
        >
          {category.sourceCount.toLocaleString('fa-IR')}
        </span>
        <button
          type="button"
          title="مشاهده منابع"
          aria-label={`منابع ${category.title}`}
          onClick={() => setResourcesCategory(category)}
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-md transition ${
            isSelected
              ? 'bg-sky-400/15 text-sky-200 hover:bg-sky-400/25'
              : 'text-[var(--taav-text-muted)] opacity-70 hover:bg-white/5 hover:text-[var(--taav-brand-strong)] hover:opacity-100 group-hover:opacity-100'
          }`}
        >
          <BookOpen className="h-4 w-4" />
        </button>
      </div>
    );
  };

  return (
    <TaavTooltipProvider>
      <main dir="rtl" className="mx-auto grid max-w-[1440px] gap-4 pb-8 text-right">
        <header className="rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-3 shadow-[var(--taav-shadow-sm)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="m-0 text-[clamp(1rem,1.5vw,1.2rem)] font-black text-[var(--taav-text-strong)]">
                  دسته‌بندی‌های دانشنامه برند {data.brandName}
                </h1>
                <bdi className="rounded-md bg-sky-500/15 px-2 py-1 text-sm font-bold text-sky-300">{data.versionLabel}</bdi>
                <TaavBadge tone={data.isActive ? 'success' : 'neutral'} variant="soft">
                  {data.isActive ? 'فعال' : 'غیرفعال'}
                </TaavBadge>
                {manualEditEnabled ? (
                  <TaavTooltip content="دسته‌ها به‌صورت پیش‌فرض قفل‌اند. برای ویرایش، قفل هر دسته را باز کنید.">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/15 px-2.5 py-1 text-[11px] font-bold text-cyan-100">
                      <PencilLine className="h-3.5 w-3.5" />
                      حالت ویرایش دستی
                    </span>
                  </TaavTooltip>
                ) : null}
              </div>
              <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-[var(--taav-text-muted)]">
                <div>
                  <dt className="inline">آخرین به‌روزرسانی: </dt>
                  <dd className="inline">{data.updatedAt}</dd>
                </div>
                <div>
                  <dt className="inline">تعداد دسته‌بندی‌ها: </dt>
                  <dd className="inline tabular-nums">{data.totalCategories.toLocaleString('fa-IR')}</dd>
                </div>
                <div>
                  <dt className="inline">ایجاد شده توسط: </dt>
                  <dd className="inline">{data.createdBy ?? '—'}</dd>
                </div>
              </dl>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {data.knowledgeBaseId ? (
                <KnowledgeBaseBuildActions
                  businessId={data.businessId}
                  brandId={data.brandId}
                  knowledgeBaseId={data.knowledgeBaseId}
                  update={data.update}
                  isActive={data.isActive}
                  buildInProgress={buildInProgress}
                  pendingCategoryEdits={pendingCategoryEdits}
                />
              ) : null}
              <Link href={brandDashboardHref}>
                <TaavButton size="sm" variant="secondary" iconStart={<LayoutDashboard className="h-4 w-4" />}>
                  داشبورد برند
                </TaavButton>
              </Link>
              <Link href={overviewHref}>
                <TaavButton size="sm" variant="secondary" iconStart={<Library className="h-4 w-4" />}>
                  داشبورد نالج‌بیس
                </TaavButton>
              </Link>
            </div>
          </div>
        </header>

        {data.activeBuild ? (
          <InitialKnowledgeBuildPanel businessId={data.businessId} brandId={data.brandId} build={data.activeBuild} />
        ) : data.lastBuild ? (
          <aside className="rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] px-4 py-3 text-right shadow-[var(--taav-shadow-sm)]">
            <p className="m-0 text-xs font-bold text-[var(--taav-text-muted)]">آخرین بیلد این نالج‌بیس</p>
            <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-[var(--taav-text-body)]">
              <div>
                <dt className="inline text-[var(--taav-text-muted)]">نوع: </dt>
                <dd className="inline font-semibold">{data.lastBuild.buildType}</dd>
              </div>
              <div>
                <dt className="inline text-[var(--taav-text-muted)]">وضعیت: </dt>
                <dd className="inline font-semibold">{data.lastBuild.status}</dd>
              </div>
              <div>
                <dt className="inline text-[var(--taav-text-muted)]">شروع: </dt>
                <dd className="inline" dir="ltr">
                  {data.lastBuild.startedAt}
                </dd>
              </div>
              <div>
                <dt className="inline text-[var(--taav-text-muted)]">پایان: </dt>
                <dd className="inline" dir="ltr">
                  {data.lastBuild.finishedAt ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="inline text-[var(--taav-text-muted)]">منابع: </dt>
                <dd className="inline tabular-nums font-semibold">{data.lastBuild.sourceCount.toLocaleString('fa-IR')}</dd>
              </div>
            </dl>
          </aside>
        ) : null}

        {buildInProgress ? (
          <p
            role="status"
            className="rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-sm leading-7 text-amber-100"
          >
            در حال ساخت نالج‌بیس هستیم؛ دسته‌بندی‌ها تا پایان بیلد غیرفعال‌اند.
          </p>
        ) : null}

        {manualEditEnabled ? (
          <KnowledgeBaseManualEditor data={data} onPendingEditsChange={setPendingCategoryEdits} />
        ) : (
          <section
            className={`relative grid gap-4 lg:grid-cols-[minmax(360px,0.9fr)_minmax(0,1.2fr)] ${
              buildInProgress ? 'pointer-events-none opacity-45' : ''
            }`}
          >
            <TaavCard variant="outlined" padding="none" radius="xl" wrapperClassName="min-w-0 overflow-hidden">
              <div className="border-b border-[var(--taav-border-subtle)] px-4 pb-3.5 pt-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="m-0 flex items-center gap-2 text-sm font-black text-[var(--taav-text-strong)]">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--taav-brand-soft)] text-[var(--taav-brand-strong)]">
                      <FolderTree className="h-4 w-4" />
                    </span>
                    دسته‌بندی‌ها
                  </h2>
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] font-bold tabular-nums text-[var(--taav-text-muted)]">
                    {data.totalCategories.toLocaleString('fa-IR')}
                  </span>
                </div>
                <label className="relative mt-3.5 block">
                  <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--taav-text-muted)]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="جستجو در دسته‌بندی‌ها..."
                    className="h-10 w-full rounded-xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] py-2 pr-10 pl-3 text-sm text-[var(--taav-text-strong)] outline-none transition placeholder:text-[var(--taav-text-muted)] focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
                  />
                </label>
              </div>
              <div className="max-h-[590px] overflow-y-auto">
                {parents.map((parent) => (
                  <div key={parent.id} className={expanded.has(parent.id) && childrenFor(parent.id).length ? 'border-b border-[var(--taav-border-subtle)]/40' : ''}>
                    <Row category={parent} />
                    {expanded.has(parent.id) ? (
                      <div className="mr-5 border-r border-sky-400/15 bg-black/[0.12]">
                        {childrenFor(parent.id).map((child) => (
                          <Row key={child.id} category={child} nested />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
                {!parents.length ? <p className="p-10 text-center text-sm text-[var(--taav-text-muted)]">دسته‌بندی مطابق جستجو پیدا نشد.</p> : null}
              </div>
            </TaavCard>

            <TaavCard variant="outlined" padding="md" radius="xl" wrapperClassName="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--taav-border-subtle)] pb-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--taav-surface-soft)] text-[var(--taav-brand-strong)]">
                    <FileText className="h-4 w-4" />
                  </span>
                  <h2 className="m-0 truncate text-base font-black text-[var(--taav-text-strong)]">
                    {selected?.title ?? 'دسته‌بندی انتخاب نشده'}
                  </h2>
                </div>
                {selected ? (
                  <TaavButton size="sm" variant="secondary" iconStart={<BookOpen className="h-4 w-4" />} onClick={() => setResourcesCategory(selected)}>
                    منابع ({selected.sourceCount.toLocaleString('fa-IR')})
                  </TaavButton>
                ) : null}
              </div>

              {selected ? (
                <article className="pt-4 whitespace-pre-wrap text-sm leading-8 text-[var(--taav-text-body)]">
                  {selected.content || 'برای این دسته‌بندی محتوای متنی ثبت نشده است.'}
                </article>
              ) : (
                <div className="py-16 text-center text-sm text-[var(--taav-text-muted)]">دسته‌بندی‌ای برای نمایش وجود ندارد.</div>
              )}
            </TaavCard>
          </section>
        )}

        <TaavDialog open={resourcesCategory !== null} onOpenChange={(open) => { if (!open) setResourcesCategory(null); }}>
          <TaavDialogContent size="xl" contentClassName="ai-lab-dialog max-h-[min(88vh,920px)] w-[min(96vw,1100px)] max-w-none" dir="rtl">
            <TaavDialogHeader>
              <TaavDialogTitle className="text-right text-lg font-black">منابع دسته‌بندی</TaavDialogTitle>
              <TaavDialogDescription className="mt-1.5 text-right text-xs">
                دسته‌بندی: {resourcesCategory?.title} | سطح: {resourcesCategory?.level}
              </TaavDialogDescription>
            </TaavDialogHeader>

            {resourcesCategory?.resources.length ? (
              <div className="mt-2 grid max-h-[min(58vh,560px)] gap-3 overflow-y-auto p-0.5 sm:grid-cols-2 xl:grid-cols-3">
                {resourcesCategory.resources.map((resource) => (
                  <article
                    key={resource.snapshotId}
                    className="flex min-h-[120px] flex-col justify-between gap-2 rounded-[var(--taav-radius-lg)] border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] p-3 text-right"
                  >
                    <div className="grid gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="m-0 text-sm font-black text-[var(--taav-text-strong)]">{resource.title}</h3>
                        <TaavBadge tone="neutral" variant="soft">{resource.sourceTypeLabel}</TaavBadge>
                      </div>
                      <dl className="grid gap-2 text-xs text-[var(--taav-text-muted)]">
                        <div className="flex items-center justify-between gap-2">
                          <dt>تاریخ اسنپ‌شات</dt>
                          <dd dir="ltr">{resource.snapshotDate}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <dt>نسخه دانشنامه</dt>
                          <dd>
                            <bdi>{resource.versionLabel}</bdi>
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <Link
                      href={
                        data.knowledgeBaseId
                          ? `/businesses/${data.businessId}/products/taavia/brands/${data.brandId}/knowledge-base/${data.knowledgeBaseId}/sources`
                          : overviewHref
                      }
                      className="mt-auto"
                    >
                      <TaavButton size="sm" variant="secondary" unsafeClassName="w-full" iconStart={<ExternalLink className="h-3.5 w-3.5" />}>
                        مشاهده منبع
                      </TaavButton>
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-6 py-10 text-center text-sm text-[var(--taav-text-muted)]">منبعی برای این دسته‌بندی ثبت نشده است.</p>
            )}

            <p className="mt-2 flex items-center gap-2 rounded-md border border-sky-400/25 bg-sky-500/[0.08] px-3 py-2 text-xs leading-6 text-sky-200">
              <Info className="h-4 w-4 shrink-0" />
              منابع به‌صورت اسنپ‌شات از محتوای دانشنامه در زمان مشخص نگهداری می‌شوند.
            </p>

            <TaavDialogFooter>
              <TaavButton size="sm" variant="secondary" onClick={() => setResourcesCategory(null)}>
                بستن
              </TaavButton>
            </TaavDialogFooter>
          </TaavDialogContent>
        </TaavDialog>
      </main>
    </TaavTooltipProvider>
  );
}
