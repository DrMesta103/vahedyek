'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  Archive,
  Eye,
  FolderPlus,
  GripVertical,
  History,
  Layers,
  MoreHorizontal,
  PackageOpen,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TaavButton,
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';
import { TaavBadge } from '@repo/ui/taav/primitives';
import type { BrandSourceFamily, BrandSourceListItem, BrandSourcesPageData } from '@/app/lib/services/taavia-brand-sources-read-service';
import {
  changeBrandSourceStatus,
  getBrandSourceDetails,
  getBrandSourceUsageHistory,
  reorderBrandKnowledgeSources,
} from '@/app/businesses/[businessId]/products/taavia/brands/[brandId]/sources/actions';
import {
  startInitialBuildAction,
  startKnowledgeBaseNewVersionAction,
  startKnowledgeBaseRebuildAction,
} from '@/app/businesses/[businessId]/products/taavia/brands/[brandId]/knowledge-base/actions';
import { AddBrandIntroductionDialog } from '@/components/taavia/AddBrandIntroductionDialog';
import { BrandInfoEditDialog } from '@/components/taavia/BrandInfoEditDialog';

type Tab = 'knowledge' | 'product' | 'faq';
type Detail = Awaited<ReturnType<typeof getBrandSourceDetails>>;
type HistoryRow = Awaited<ReturnType<typeof getBrandSourceUsageHistory>>[number];
type ConfirmBuildKind = 'initial' | 'newVersion' | 'rebuild' | null;

const VERSION_RETENTION_NOTE =
  'سیستم بیشتر از ۵ نسخه نگه نمی‌دارد و نسخه‌های قدیمی‌تر را حذف می‌کند.';

const tabs: { id: Tab; label: string }[] = [
  { id: 'knowledge', label: 'دانش‌ها' },
  { id: 'product', label: 'محصولات' },
  { id: 'faq', label: 'سوالات پرتکرار' },
];

const sourceLabel: Record<BrandSourceFamily, string> = {
  brand_info: 'دانش‌ها',
  knowledge: 'دانش‌ها',
  product: 'محصول',
  faq: 'سوال پرتکرار',
};

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/75 p-4" role="dialog" aria-modal="true" dir="rtl">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <h2 className="m-0 text-lg font-black text-white">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-xl text-slate-300 hover:bg-white/10" aria-label="بستن">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function TaaviaBrandSourcesClient({ data }: { data: BrandSourcesPageData }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('knowledge');
  const [status, setStatus] = useState('all');
  const [usage, setUsage] = useState('all');
  const [search, setSearch] = useState('');
  const [menu, setMenu] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [history, setHistory] = useState<HistoryRow[] | null>(null);
  const [historyTitle, setHistoryTitle] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [dragged, setDragged] = useState<string | null>(null);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const [updatePending, startUpdate] = useTransition();
  const [confirmBuild, setConfirmBuild] = useState<ConfirmBuildKind>(null);

  const baseRows = useMemo(
    () =>
      data.sources.filter((item) =>
        tab === 'knowledge' ? item.sourceType === 'brand_info' || item.sourceType === 'knowledge' : item.sourceType === tab,
      ),
    [data.sources, tab],
  );

  const rows = useMemo(() => {
    const filtered = baseRows.filter(
      (x) =>
        (status === 'all' || x.status === status) &&
        (usage === 'all' ||
          (usage === 'active' && x.usedInActiveKnowledgeBase) ||
          (usage === 'changed' && x.changedSinceActiveKnowledgeBase) ||
          (usage === 'previous' && x.usageStatus === 'USED_IN_PREVIOUS_KB_ONLY') ||
          (usage === 'never' && x.usageStatus === 'NEVER_USED')) &&
        `${x.title} ${x.summary}`.toLocaleLowerCase('fa').includes(search.toLocaleLowerCase('fa')),
    );
    if (tab !== 'knowledge' || !orderedIds.length) return filtered;
    const index = new Map(orderedIds.map((id, i) => [id, i]));
    return [...filtered].sort((a, b) => (index.get(a.sourceId) ?? 99999) - (index.get(b.sourceId) ?? 99999));
  }, [baseRows, status, usage, search, tab, orderedIds]);

  const buildInProgress = Boolean(data.activeBuildId);
  const canReorder =
    tab === 'knowledge' && status === 'all' && usage === 'all' && !search.trim() && !pending && !buildInProgress;
  const count = (id: Tab) => (id === 'knowledge' ? data.typeCounts.brand_info + data.typeCounts.knowledge : data.typeCounts[id]);
  const refresh = () => router.refresh();
  const kbBase = `/businesses/${data.businessId}/products/taavia/brands/${data.brandId}/knowledge-base`;
  const categoriesHref = `${kbBase}/categories`;

  function goToCategoriesProgress() {
    router.push(categoriesHref);
    router.refresh();
  }

  function runConfirmedBuild(kind: Exclude<ConfirmBuildKind, null>) {
    setNotice(null);
    setConfirmBuild(null);
    startUpdate(async () => {
      try {
        if (kind === 'initial') {
          await startInitialBuildAction({
            businessId: data.businessId,
            brandId: data.brandId,
          });
        } else if (!data.activeKnowledgeBaseId) {
          throw new Error('نسخهٔ فعال Knowledge Base پیدا نشد.');
        } else if (kind === 'rebuild') {
          await startKnowledgeBaseRebuildAction({
            businessId: data.businessId,
            brandId: data.brandId,
            knowledgeBaseId: data.activeKnowledgeBaseId,
          });
        } else {
          await startKnowledgeBaseNewVersionAction({
            businessId: data.businessId,
            brandId: data.brandId,
            knowledgeBaseId: data.activeKnowledgeBaseId,
          });
        }
        goToCategoriesProgress();
      } catch (e) {
        setNotice(e instanceof Error ? e.message : 'شروع ساخت Knowledge Base ناموفق بود.');
        router.refresh();
      }
    });
  }

  function changeStatus(item: BrandSourceListItem) {
    const next = item.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    if (
      next === 'ARCHIVED' &&
      !window.confirm('این منبع آرشیو می‌شود و در Buildهای بعدی استفاده نخواهد شد. نسخه‌های قبلی Knowledge Base تغییری نمی‌کنند.')
    ) {
      return;
    }
    startTransition(async () => {
      const result = await changeBrandSourceStatus({
        businessId: data.businessId,
        brandId: data.brandId,
        sourceId: item.sourceId,
        sourceType: item.sourceType,
        revision: item.revision,
        nextStatus: next,
      });
      setNotice(result.ok ? 'وضعیت منبع ذخیره شد.' : result.message);
      if (result.ok) refresh();
    });
  }

  async function view(item: BrandSourceListItem) {
    setMenu(null);
    try {
      setDetail(await getBrandSourceDetails({ businessId: data.businessId, brandId: data.brandId, sourceId: item.sourceId }));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'بارگذاری جزئیات انجام نشد.');
    }
  }

  async function usageHistory(item: BrandSourceListItem) {
    setMenu(null);
    try {
      setHistoryTitle(item.title);
      setHistory(await getBrandSourceUsageHistory({ businessId: data.businessId, brandId: data.brandId, sourceId: item.sourceId }));
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'بارگذاری تاریخچه انجام نشد.');
    }
  }

  function drop(target: string) {
    if (!dragged || dragged === target) return;
    const ids = orderedIds.length ? orderedIds : baseRows.filter((x) => x.sourceType === 'brand_info').map((x) => x.sourceId);
    const next = ids.filter((id) => id !== dragged);
    next.splice(Math.max(0, next.indexOf(target)), 0, dragged);
    setOrderedIds(next);
    setDragged(null);
    startTransition(async () => {
      const result = await reorderBrandKnowledgeSources({ businessId: data.businessId, brandId: data.brandId, ids: next });
      if (!result.ok) {
        setNotice(result.message);
        setOrderedIds([]);
      } else {
        setNotice('ترتیب منابع ذخیره شد.');
        refresh();
      }
    });
  }

  const hasActiveSources = data.summary.active > 0;
  const needsFirstKb = !data.hasKnowledgeBase;
  const canStartBuild = !buildInProgress && !updatePending;

  return (
    <main dir="rtl" className="mx-auto w-full max-w-7xl space-y-3 pb-6 text-right">
      <header className="rounded-xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] px-4 py-3">
        <h1 className="m-0 text-base font-black text-[var(--taav-text-strong)]">مدیریت منابع برند</h1>
        <p className="mt-1 text-xs text-[var(--taav-text-muted)]">منابع فعلی برند؛ مستقل از Snapshotهای تاریخی Knowledge Base.</p>
        {notice ? (
          <p role="status" className="mt-2 text-xs text-rose-300">
            {notice}
          </p>
        ) : null}
      </header>

      <div className="flex flex-wrap items-center justify-start gap-2">
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          disabled={buildInProgress}
          title={buildInProgress ? 'تا پایان یا خطای بیلد فعال، افزودن منبع مجاز نیست.' : undefined}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FolderPlus className="h-4 w-4" />
          افزودن منبع دانش
        </button>

        {buildInProgress ? (
          <Link href={categoriesHref}>
            <TaavButton size="sm" iconStart={<RefreshCw className="h-4 w-4" />}>
              مشاهده روند ساخت
            </TaavButton>
          </Link>
        ) : needsFirstKb ? (
          <button
            type="button"
            onClick={() => setConfirmBuild('initial')}
            disabled={!hasActiveSources || updatePending}
            title={!hasActiveSources ? 'ابتدا حداقل یک منبع فعال اضافه کنید' : undefined}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Sparkles className="h-4 w-4" />
            {updatePending ? 'در حال شروع…' : 'ساخت اولین نالج‌بیس'}
          </button>
        ) : data.activeKnowledgeBaseId ? (
          <>
            <button
              type="button"
              onClick={() => setConfirmBuild('rebuild')}
              disabled={!canStartBuild}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-rose-400/45 bg-rose-500/10 px-4 text-sm font-bold text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RefreshCw className="h-4 w-4" />
              ریبلد
            </button>
            <button
              type="button"
              onClick={() => setConfirmBuild('newVersion')}
              disabled={!canStartBuild}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Layers className="h-4 w-4" />
              بیلد نسخهٔ جدید
            </button>
          </>
        ) : (
          <Link href={kbBase}>
            <TaavButton size="sm" iconStart={<PackageOpen className="h-4 w-4" />}>
              مدیریت Knowledge Base
            </TaavButton>
          </Link>
        )}
      </div>

      <section className="rounded-2xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-4">
        <div className="flex flex-wrap gap-2 border-b border-[var(--taav-border-subtle)] pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-2 text-sm ${tab === t.id ? 'bg-cyan-400/15 text-cyan-300' : 'text-[var(--taav-text-muted)]'}`}
            >
              {t.label} <bdi>({count(t.id)})</bdi>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <label className="relative min-w-[220px] flex-1">
            <Search className="absolute right-3 top-3 h-4 w-4 text-[var(--taav-text-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جست‌وجو در عنوان و محتوا…"
              className="w-full rounded-lg border border-[var(--taav-border-subtle)] bg-transparent py-2 pr-9 pl-3 text-sm"
            />
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 text-sm"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="ACTIVE">فعال</option>
            <option value="ARCHIVED">آرشیوشده</option>
          </select>
          <select
            value={usage}
            onChange={(e) => setUsage(e.target.value)}
            className="rounded-lg border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 text-sm"
          >
            <option value="all">همه وضعیت‌های استفاده</option>
            <option value="active">استفاده‌شده در Knowledge Base فعال</option>
            <option value="changed">تغییرکرده بعد از آخرین Build</option>
            <option value="previous">فقط نسخه‌های قبلی</option>
            <option value="never">استفاده‌نشده</option>
          </select>
        </div>

        {buildInProgress ? (
          <p
            role="status"
            className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs leading-6 text-amber-100"
          >
            بیلد فعال است؛ تا اتمام یا خطا، تغییر منابع ممکن نیست.{' '}
            <Link href={categoriesHref} className="font-bold text-cyan-300 underline-offset-2 hover:underline">
              مشاهده روند ساخت در دسته‌بندی‌ها
            </Link>
          </p>
        ) : null}

        {tab === 'knowledge' && !canReorder && !buildInProgress ? (
          <p className="mt-3 text-xs text-amber-200">برای تغییر ترتیب، جست‌وجو و فیلترها را پاک کنید.</p>
        ) : null}

        <div className="mt-3 grid gap-2">
          {rows.map((item) => {
            const reorderable = canReorder && item.sourceType === 'brand_info';
            const canMutateSource = !buildInProgress;
            const kbTone =
              item.usageStatus === 'USED_IN_ACTIVE_KB_CHANGED'
                ? 'warning'
                : item.usageStatus === 'USED_IN_ACTIVE_KB_UNCHANGED'
                  ? 'success'
                  : item.usageStatus === 'NEVER_USED' || item.usageStatus === 'NO_ACTIVE_KNOWLEDGE_BASE'
                    ? 'neutral'
                    : 'info';
            return (
              <article
                key={`${item.sourceType}:${item.sourceId}`}
                draggable={reorderable}
                onDragStart={() => setDragged(item.sourceId)}
                onDragOver={(e) => {
                  if (reorderable) e.preventDefault();
                }}
                onDrop={() => drop(item.sourceId)}
                className={`w-full rounded-xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] p-3 text-right transition ${
                  dragged === item.sourceId ? 'opacity-60' : 'hover:border-cyan-400/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)]">
                    {item.sourceType === 'brand_info' ? (
                      <GripVertical
                        className={`h-4 w-4 ${reorderable ? 'cursor-grab text-slate-400' : 'text-slate-600'}`}
                        aria-label="جابجایی منبع"
                      />
                    ) : (
                      <span className="text-[11px] text-[var(--taav-text-muted)]">—</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="m-0 text-[11px] text-[var(--taav-text-muted)]">عنوان</p>
                        <h2 className="m-0 mt-0.5 truncate text-sm font-black text-[var(--taav-text-strong)]">{item.title}</h2>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        <TaavBadge tone={item.status === 'ACTIVE' ? 'success' : 'neutral'} variant="soft" size="sm">
                          {item.status === 'ACTIVE' ? 'فعال' : 'آرشیوشده'}
                        </TaavBadge>
                        <TaavBadge tone="info" variant="soft" size="sm">
                          {sourceLabel[item.sourceType]}
                        </TaavBadge>
                        <TaavBadge tone={kbTone} variant="soft" size="sm">
                          {item.usageStatusLabel}
                        </TaavBadge>
                      </div>
                    </div>

                    <dl className="mt-3 grid gap-2 border-t border-[var(--taav-border-subtle)] pt-2.5 text-[11px] sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-lg bg-black/20 px-2.5 py-2">
                        <dt className="text-[var(--taav-text-muted)]">ثبت‌شده توسط</dt>
                        <dd className="mt-0.5 truncate font-semibold text-[var(--taav-text-body)]">
                          {item.createdByDisplayName || '—'}
                        </dd>
                      </div>
                      <div className="rounded-lg bg-black/20 px-2.5 py-2">
                        <dt className="text-[var(--taav-text-muted)]">تاریخ ثبت</dt>
                        <dd className="mt-0.5 font-semibold tabular-nums text-[var(--taav-text-body)]" dir="ltr">
                          {item.createdAt}
                        </dd>
                      </div>
                      <div className="rounded-lg bg-black/20 px-2.5 py-2">
                        <dt className="text-[var(--taav-text-muted)]">ویرایش‌شده توسط</dt>
                        <dd className="mt-0.5 truncate font-semibold text-[var(--taav-text-body)]">
                          {item.updatedByDisplayName || '—'}
                        </dd>
                      </div>
                      <div className="rounded-lg bg-black/20 px-2.5 py-2">
                        <dt className="text-[var(--taav-text-muted)]">آخرین ویرایش</dt>
                        <dd className="mt-0.5 font-semibold tabular-nums text-[var(--taav-text-body)]" dir="ltr">
                          {item.updatedAt}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setMenu(menu === item.sourceId ? null : item.sourceId)}
                      className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] text-[var(--taav-text-muted)] hover:text-[var(--taav-text-strong)]"
                      aria-label="عملیات منبع"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {menu === item.sourceId ? (
                      <div className="absolute left-0 top-11 z-20 min-w-48 rounded-xl border border-white/10 bg-slate-900 p-1 shadow-xl">
                        <button
                          type="button"
                          onClick={() => void view(item)}
                          className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-right hover:bg-white/10"
                        >
                          <Eye className="h-4 w-4" />
                          مشاهده جزئیات
                        </button>
                        <button
                          type="button"
                          onClick={() => void usageHistory(item)}
                          className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-right hover:bg-white/10"
                        >
                          <History className="h-4 w-4" />
                          تاریخچه استفاده
                        </button>
                        {canMutateSource && item.sourceType === 'brand_info' && item.status === 'ACTIVE' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setEditId(item.sourceId);
                              setMenu(null);
                            }}
                            className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-right hover:bg-white/10"
                          >
                            <Pencil className="h-4 w-4" />
                            ویرایش
                          </button>
                        ) : null}
                        {canMutateSource ? (
                          <button
                            type="button"
                            onClick={() => changeStatus(item)}
                            className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-right hover:bg-white/10"
                          >
                            {item.status === 'ACTIVE' ? (
                              <Archive className="h-4 w-4 text-rose-300" />
                            ) : (
                              <RotateCcw className="h-4 w-4 text-cyan-300" />
                            )}
                            {item.status === 'ACTIVE' ? 'آرشیو' : 'فعال‌سازی مجدد'}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {!rows.length ? (
          <p className="py-12 text-center text-sm text-[var(--taav-text-muted)]">منبعی مطابق فیلترهای انتخاب‌شده پیدا نشد.</p>
        ) : null}
      </section>

      <AddBrandIntroductionDialog businessId={data.businessId} brandId={data.brandId} open={addOpen} onClose={() => setAddOpen(false)} />
      {editId ? (
        <BrandInfoEditDialog
          businessId={data.businessId}
          brandId={data.brandId}
          sourceId={editId}
          onClose={() => setEditId(null)}
          onSaved={() => {
            setEditId(null);
            refresh();
          }}
        />
      ) : null}
      {detail ? (
        <Modal title="جزئیات منبع" onClose={() => setDetail(null)}>
          <dl className="mt-5 grid gap-3 text-sm">
            <div>
              <dt className="text-slate-400">عنوان</dt>
              <dd className="mt-1 text-white">{detail.title}</dd>
            </div>
            <div>
              <dt className="text-slate-400">نوع محتوا</dt>
              <dd className="mt-1 text-white">{detail.type}</dd>
            </div>
            {detail.textContent ? (
              <div>
                <dt className="text-slate-400">متن</dt>
                <dd className="mt-1 whitespace-pre-wrap text-white">{detail.textContent}</dd>
              </div>
            ) : null}
            {detail.media ? (
              <div>
                <dt className="text-slate-400">رسانه</dt>
                <dd className="mt-2 text-white">
                  <bdi dir="ltr">
                    {detail.media.name ?? detail.media.extension} · {detail.media.mimeType ?? ''} · {detail.media.size} B
                  </bdi>
                  {detail.type === 'IMAGE' ? (
                    <img src={detail.media.previewUrl} alt={detail.title ?? 'تصویر منبع'} className="mt-3 max-h-64 rounded-xl" />
                  ) : detail.type === 'VOICE' ? (
                    <audio controls src={detail.media.previewUrl} className="mt-3 w-full" />
                  ) : detail.type === 'VIDEO' ? (
                    <video controls src={detail.media.previewUrl} className="mt-3 max-h-64 rounded-xl" />
                  ) : null}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-slate-400">وضعیت</dt>
              <dd className="mt-1 text-white">{detail.status === 'ACTIVE' ? 'فعال' : 'آرشیوشده'}</dd>
            </div>
            <div>
              <dt className="text-slate-400">ایجاد / آخرین ویرایش</dt>
              <dd className="mt-1 text-white">
                <bdi>{detail.createdAt}</bdi> / <bdi>{detail.updatedAt}</bdi>
              </dd>
            </div>
          </dl>
        </Modal>
      ) : null}
      {history ? (
        <Modal title={`تاریخچه استفاده: ${historyTitle}`} onClose={() => setHistory(null)}>
          <div className="mt-5 grid gap-3">
            {history.length ? (
              history.map((h) => (
                <article key={h.snapshotId} className="rounded-xl border border-white/10 p-3 text-sm text-slate-200">
                  <bdi dir="ltr">{h.versionLabel}</bdi> · {h.active ? 'فعال' : 'غیرفعال'} · {h.buildType}
                  <br />
                  <span className="text-slate-400">
                    Snapshot: <bdi>{h.snapshotCreatedAt}</bdi> · {h.contentType} ·{' '}
                    {h.changed ? 'محتوای فعلی تغییر کرده است' : 'بدون تغییر'}
                  </span>
                  <a
                    href={`/businesses/${data.businessId}/products/taavia/brands/${data.brandId}/knowledge-base/sources/${h.snapshotId}`}
                    className="mt-2 block text-cyan-300"
                  >
                    مشاهده Snapshot
                  </a>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-300">این منبع هنوز در هیچ Knowledge Base استفاده نشده است.</p>
            )}
          </div>
        </Modal>
      ) : null}

      <TaavDialog
        open={confirmBuild === 'initial'}
        onOpenChange={(open) => {
          if (!open && !updatePending) setConfirmBuild(null);
        }}
      >
        <TaavDialogContent size="sm" contentClassName="ai-lab-dialog" dir="rtl">
          <TaavDialogHeader>
            <TaavDialogTitle className="text-right text-lg font-black">ساخت اولین نالج‌بیس</TaavDialogTitle>
            <TaavDialogDescription className="mt-2 text-right text-sm leading-7">
              مطمئن هستید که می‌خواهید با منابع فعال فعلی، اولین نسخهٔ Knowledge Base را بسازید؟
              پیشرفت ساخت را در صفحهٔ مدیریت دسته‌بندی‌ها می‌بینید.
            </TaavDialogDescription>
          </TaavDialogHeader>
          <TaavDialogFooter>
            <TaavButton size="sm" variant="secondary" disabled={updatePending} onClick={() => setConfirmBuild(null)}>
              انصراف
            </TaavButton>
            <TaavButton
              size="sm"
              disabled={updatePending}
              onClick={() => runConfirmedBuild('initial')}
              iconStart={<Sparkles className="h-4 w-4" />}
            >
              {updatePending ? 'در حال شروع…' : 'بله، بساز'}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>

      <TaavDialog
        open={confirmBuild === 'rebuild'}
        onOpenChange={(open) => {
          if (!open && !updatePending) setConfirmBuild(null);
        }}
      >
        <TaavDialogContent size="sm" contentClassName="ai-lab-dialog" dir="rtl">
          <TaavDialogHeader>
            <TaavDialogTitle className="text-right text-lg font-black">ریبلد همین نسخه</TaavDialogTitle>
            <TaavDialogDescription className="mt-2 text-right text-sm leading-7">
              مطمئن هستید؟ با ریبلد، محتوای نسخهٔ فعلی با منابع کنونی دوباره ساخته می‌شود و شمارهٔ نسخه عوض نمی‌شود.
              این کار قابل بازگشت نیست.
              <br />
              <span className="mt-2 block text-[var(--taav-text-muted)]">{VERSION_RETENTION_NOTE}</span>
            </TaavDialogDescription>
          </TaavDialogHeader>
          <TaavDialogFooter>
            <TaavButton size="sm" variant="secondary" disabled={updatePending} onClick={() => setConfirmBuild(null)}>
              انصراف
            </TaavButton>
            <TaavButton
              size="sm"
              tone="danger"
              disabled={updatePending}
              onClick={() => runConfirmedBuild('rebuild')}
              iconStart={<RefreshCw className="h-4 w-4" />}
            >
              {updatePending ? 'در حال شروع…' : 'ریبلد همین نسخه'}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>

      <TaavDialog
        open={confirmBuild === 'newVersion'}
        onOpenChange={(open) => {
          if (!open && !updatePending) setConfirmBuild(null);
        }}
      >
        <TaavDialogContent size="sm" contentClassName="ai-lab-dialog" dir="rtl">
          <TaavDialogHeader>
            <TaavDialogTitle className="text-right text-lg font-black">ساخت نسخهٔ جدید</TaavDialogTitle>
            <TaavDialogDescription className="mt-2 text-right text-sm leading-7">
              مطمئن هستید که می‌خواهید با منابع فعلی یک نسخهٔ جدید بسازید؟ نسخهٔ قبلی به‌صورت غیرفعال می‌ماند.
              پیشرفت ساخت را در صفحهٔ مدیریت دسته‌بندی‌ها می‌بینید.
              <br />
              <span className="mt-2 block text-[var(--taav-text-muted)]">{VERSION_RETENTION_NOTE}</span>
            </TaavDialogDescription>
          </TaavDialogHeader>
          <TaavDialogFooter>
            <TaavButton size="sm" variant="secondary" disabled={updatePending} onClick={() => setConfirmBuild(null)}>
              انصراف
            </TaavButton>
            <TaavButton
              size="sm"
              disabled={updatePending}
              onClick={() => runConfirmedBuild('newVersion')}
              iconStart={<Layers className="h-4 w-4" />}
            >
              {updatePending ? 'در حال شروع…' : 'ساخت نسخهٔ جدید'}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
    </main>
  );
}
