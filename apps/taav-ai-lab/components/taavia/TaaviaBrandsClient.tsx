'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Archive, Check, Cpu, Database, FolderOpen, MessageSquareText, MoreHorizontal, Plus, Power, RotateCcw, Search, Trash2, X } from 'lucide-react';
import { TaavButton, TaavCard, TaavDialog, TaavDialogContent, TaavDialogDescription, TaavDialogFooter, TaavDialogHeader, TaavDialogTitle } from '@repo/ui/taav';
import { TaavEmptyState } from '@repo/ui/taav/data-display';
import type { TaaviaBrandListItem } from '@/app/lib/types/domain';
import { CreateBrandDialog } from '@/components/taavia/CreateBrandDialog';

const statusLabels = { ACTIVE: 'فعال', INACTIVE: 'غیرفعال', ARCHIVED: 'آرشیوشده' } as const;

const actionClass =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-cyan-400/55 bg-transparent px-2 text-xs font-bold text-cyan-300 transition hover:bg-cyan-400/10';
const actionMutedClass =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-cyan-400/35 bg-transparent px-2 text-xs font-bold text-cyan-300/80 transition hover:bg-cyan-400/10';

export function TaaviaBrandsClient({
  tenantId,
  initialBrands,
}: {
  tenantId: string;
  initialBrands: TaaviaBrandListItem[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [brands, setBrands] = useState(initialBrands);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaaviaBrandListItem | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const router = useRouter();

  const updateStatus = async (brand: TaaviaBrandListItem, status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') => {
    setPendingId(brand.id); setActionError(null); setMenuId(null);
    try {
      const response = await fetch(`/api/businesses/${tenantId}/taavia/brands/${brand.id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? 'تغییر وضعیت برند انجام نشد.');
      setBrands((current) => current.map((item) => item.id === brand.id ? { ...item, status } : item));
      router.refresh();
    } catch (error) { setActionError(error instanceof Error ? error.message : 'تغییر وضعیت برند انجام نشد.'); }
    finally { setPendingId(null); }
  };

  const deleteBrand = async () => {
    if (!deleteTarget) return;
    setPendingId(deleteTarget.id); setActionError(null);
    try {
      const response = await fetch(`/api/businesses/${tenantId}/taavia/brands/${deleteTarget.id}`, { method: 'DELETE' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? 'حذف برند انجام نشد.');
      setBrands((current) => current.map((item) => item.id === deleteTarget.id ? { ...item, status: 'ARCHIVED' } : item));
      setDeleteTarget(null); router.refresh();
    } catch (error) { setActionError(error instanceof Error ? error.message : 'حذف برند انجام نشد.'); }
    finally { setPendingId(null); }
  };

  const filtered = useMemo(
    () =>
      brands.filter((brand) =>
        `${brand.name} ${brand.description ?? ''}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
      ),
    [brands, search],
  );

  const countLabel = `${brands.length.toLocaleString('fa-IR')} برند`;

  return (
    <main dir="rtl" className="mx-auto grid max-w-7xl gap-5 pb-8 text-right">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="m-0 text-[clamp(1.35rem,2vw,1.75rem)] font-black text-[var(--taav-text-strong)]">برندها</h1>
          <p className="mt-1 text-sm text-[var(--taav-text-muted)]">{countLabel}</p>
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 sm:max-w-xl">
          <label className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--taav-text-muted)]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="جستجوی برند..."
              className="min-h-10 w-full rounded-xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] pr-10 pl-3 text-sm text-[var(--taav-text-strong)] outline-none placeholder:text-[var(--taav-text-muted)] focus:ring-2 focus:ring-cyan-400/40"
            />
          </label>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
          >
            <Plus className="h-4 w-4" />
            ایجاد برند
          </button>
        </div>
      </header>

      {filtered.length === 0 ? (
        <TaavCard variant="outlined" padding="md" radius="xl">
          <TaavEmptyState
            title={brands.length === 0 ? 'هنوز برندی ساخته نشده است.' : 'نتیجه‌ای پیدا نشد.'}
            description={brands.length === 0 ? 'برای شروع، اولین برند تاویا را ایجاد کنید.' : 'عبارت جستجو را تغییر دهید.'}
            primaryAction={
              brands.length === 0 ? (
                <TaavButton size="sm" onClick={() => setDialogOpen(true)} iconStart={<Plus className="h-4 w-4" />}>
                  ایجاد برند
                </TaavButton>
              ) : undefined
            }
          />
        </TaavCard>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((brand) => {
            const base = `/businesses/${tenantId}/products/taavia/brands/${brand.id}`;
            const sourcesHref = `${base}/sources`;
            const kbHref = brand.activeKnowledgeBaseId
              ? `${base}/knowledge-base/${brand.activeKnowledgeBaseId}`
              : `${base}/knowledge-base`;
            const hasKb = brand.knowledgeBaseVersionCount > 0;
            const hasSources = brand.sourceCount > 0;
            const canOpenDashboard = hasSources && hasKb;
            const statusTone =
              brand.status === 'ACTIVE'
                ? 'border-emerald-400/45 bg-emerald-500/10 text-emerald-300'
                : brand.status === 'ARCHIVED'
                  ? 'border-slate-500/40 bg-slate-500/10 text-slate-300'
                  : 'border-amber-400/45 bg-amber-500/10 text-amber-300';

            return (
              <article
                key={brand.id}
                className="relative flex h-full flex-col gap-4 rounded-2xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-4 text-right shadow-[var(--taav-shadow-sm)] transition hover:border-cyan-400/40 hover:bg-[var(--taav-surface-soft)]"
              >
                {canOpenDashboard ? (
                  <Link href={base} className="absolute inset-0 z-0 rounded-2xl" aria-label={`باز کردن داشبورد برند ${brand.name}`} />
                ) : null}

                <div className="relative z-[1] flex items-start justify-between gap-3 pointer-events-none">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--taav-surface-soft)] text-sm font-black text-cyan-200 ring-1 ring-[var(--taav-border-subtle)]">
                      {brand.icon?.previewData ? (
                        <img src={brand.icon.previewData} alt="" className="h-full w-full object-cover" />
                      ) : (
                        brand.name.slice(0, 2)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h2 className="m-0 truncate text-base font-black text-[var(--taav-text-strong)]">{brand.name}</h2>
                      <p className="mt-0.5 text-xs text-[var(--taav-text-muted)]">اسم برند</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-start gap-1 pointer-events-auto">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusTone}`}><span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />{statusLabels[brand.status]}</span>
                    <div className="relative">
                      <button type="button" onClick={() => setMenuId((current) => current === brand.id ? null : brand.id)} aria-label={`عملیات برند ${brand.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-[var(--taav-text-muted)] transition hover:bg-white/5 hover:text-[var(--taav-text-strong)]"><MoreHorizontal className="h-4 w-4" /></button>
                      {menuId === brand.id ? <div className="absolute left-0 top-9 z-30 min-w-48 rounded-xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-1.5 text-right shadow-2xl">
                        <button type="button" disabled={pendingId === brand.id} onClick={() => void updateStatus(brand, brand.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-sm text-[var(--taav-text-body)] hover:bg-[var(--taav-surface-soft)]">{brand.status === 'ACTIVE' ? <Power className="h-4 w-4 text-amber-300" /> : <RotateCcw className="h-4 w-4 text-emerald-300" />}{brand.status === 'ACTIVE' ? 'غیرفعال کردن' : 'فعال‌سازی'}</button>
                        {brand.status !== 'ARCHIVED' ? <button type="button" disabled={pendingId === brand.id} onClick={() => void updateStatus(brand, 'ARCHIVED')} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-sm text-[var(--taav-text-body)] hover:bg-[var(--taav-surface-soft)]"><Archive className="h-4 w-4 text-slate-300" />آرشیو کردن</button> : null}
                        <div className="my-1 border-t border-[var(--taav-border-subtle)]" />
                        <button type="button" disabled={pendingId === brand.id} onClick={() => { setMenuId(null); setActionError(null); setDeleteTarget(brand); }} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-sm text-rose-300 hover:bg-rose-500/10"><Trash2 className="h-4 w-4" />حذف برند</button>
                      </div> : null}
                    </div>
                  </div>
                </div>

                <div className="relative z-[1] grid gap-2.5 border-t border-[var(--taav-border-subtle)] pt-3 text-sm pointer-events-none">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 text-[var(--taav-text-muted)]">
                      {hasKb ? <Check className="h-4 w-4 text-emerald-400" aria-hidden /> : null}
                      وضعیت
                    </span>
                    <span className="font-semibold text-[var(--taav-text-strong)]" dir="ltr">
                      {hasKb ? 'Knowledge Base' : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--taav-text-muted)]">تعداد منابع</span>
                    <span className="font-bold tabular-nums text-[var(--taav-text-strong)]">
                      {brand.sourceCount.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--taav-text-muted)]">تعداد نسخه‌ها</span>
                    <span className="font-bold tabular-nums text-[var(--taav-text-strong)]">
                      {brand.knowledgeBaseVersionCount.toLocaleString('fa-IR')}
                    </span>
                  </div>
                </div>

                <div
                  className={`relative z-10 mt-auto grid gap-2 ${
                    !hasSources ? 'grid-cols-2' : canOpenDashboard ? 'grid-cols-2' : 'grid-cols-3'
                  }`}
                >
                  <Link href={sourcesHref} className={actionClass}>
                    <FolderOpen className="h-4 w-4" />
                    منابع
                  </Link>
                  <Link href={`${base}/model-settings`} className={actionClass}>
                    <Cpu className="h-4 w-4" />
                    مدیریت مدل‌ها
                  </Link>
                  {hasSources ? (
                    brand.activeKnowledgeBaseId ? (
                      <Link href={kbHref} className={actionClass}>
                        <Database className="h-4 w-4" />
                        مدیریت KB فعال
                      </Link>
                    ) : (
                      <Link href={`${base}/knowledge-base`} className={actionMutedClass}>
                        <Database className="h-4 w-4" />
                        مدیریت KB
                      </Link>
                    )
                  ) : null}
                  {canOpenDashboard ? (
                    <Link href={`${base}/test`} className={actionClass}>
                      <MessageSquareText className="h-4 w-4" />
                      تست چتبات
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      )}

      <CreateBrandDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tenantId={tenantId}
        mode="create"
        initialBrand={null}
        onSaved={(brandId) => {
          setDialogOpen(false);
          router.push(`/businesses/${tenantId}/products/taavia/brands/${brandId}/sources`);
        }}
      />
      <TaavDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open && !pendingId) { setDeleteTarget(null); setActionError(null); } }}>
        <TaavDialogContent size="sm" contentClassName="ai-lab-dialog" dir="rtl">
          <TaavDialogHeader><div className="flex items-start justify-between gap-3"><div><TaavDialogTitle className="text-right text-lg font-black">حذف برند</TaavDialogTitle><TaavDialogDescription className="mt-2 text-right text-sm leading-7">برند «{deleteTarget?.name}» آرشیو می‌شود و دیگر در چرخهٔ فعال استفاده نخواهد شد. داده‌های نسخه‌ها و منابع آن حذف نمی‌شوند.</TaavDialogDescription></div><button type="button" onClick={() => setDeleteTarget(null)} disabled={Boolean(pendingId)} aria-label="بستن" className="grid h-9 w-9 place-items-center rounded-lg text-[var(--taav-text-muted)] hover:bg-white/5"><X className="h-4 w-4" /></button></div></TaavDialogHeader>
          {actionError ? <p role="alert" className="mt-3 text-sm text-rose-300">{actionError}</p> : null}
          <TaavDialogFooter><TaavButton size="sm" variant="secondary" disabled={Boolean(pendingId)} onClick={() => setDeleteTarget(null)}>انصراف</TaavButton><TaavButton size="sm" tone="danger" disabled={Boolean(pendingId)} onClick={() => void deleteBrand()} iconStart={<Trash2 className="h-4 w-4" />}>{pendingId ? 'در حال حذف…' : 'حذف و آرشیو برند'}</TaavButton></TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
      {actionError && !deleteTarget ? <p role="alert" className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{actionError}</p> : null}
    </main>
  );
}
