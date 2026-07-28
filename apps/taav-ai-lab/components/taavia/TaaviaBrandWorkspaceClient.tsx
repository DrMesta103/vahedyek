'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import {
  ArrowLeft,
  Award,
  CalendarDays,
  Check,
  Copy,
  Cpu,
  Database,
  Eye,
  FileText,
  FolderOpen,
  Hammer,
  Layers3,
  PackageOpen,
  Sparkles,
} from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import {
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';
import { TaavEmptyState } from '@repo/ui/taav/data-display';
import type { TaaviaBrand } from '@/app/lib/types/domain';
import type {
  TaaviaBrandBuildListItem,
  TaaviaBrandDetailsOverview,
  TaaviaBrandKnowledgeBaseListItem,
} from '@/app/lib/types/taavia-brand-details-dashboard';
import type { InitialBuildReadModel } from '@/app/lib/services/taavia-knowledge-base-read-service';
import { startKnowledgeBaseUpdateAction } from '@/app/businesses/[businessId]/products/taavia/brands/[brandId]/knowledge-base/actions';
import { InitialKnowledgeBuildAction } from '@/components/taavia/knowledge-base/InitialKnowledgeBuildAction';

type Props = {
  tenantId: string;
  brand: TaaviaBrand;
  overview: TaaviaBrandDetailsOverview;
  initialBuild: InitialBuildReadModel | null;
};

function OverviewMetric({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="flex min-h-14 min-w-0 items-center justify-between gap-2 rounded-xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] px-3 py-2 text-right shadow-[var(--taav-shadow-sm)]">
      <div className="min-w-0">
        <p className="m-0 text-[11px] text-[var(--taav-text-muted)]">{label}</p>
        <strong className="mt-1 block truncate text-sm tabular-nums text-[var(--taav-text-strong)]">{value}</strong>
      </div>
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300">{icon}</span>
    </div>
  );
}

function truncateId(id: string) {
  if (id.length <= 12) return id;
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

function formatBrandDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function SourceStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] px-2.5 py-2 text-center">
      <strong className="block text-sm tabular-nums text-[var(--taav-text-strong)]">{value.toLocaleString('fa-IR')}</strong>
      <span className="mt-0.5 block text-[10px] text-[var(--taav-text-muted)]">{label}</span>
    </div>
  );
}

function KnowledgeBaseRow({
  item,
  href,
  accent,
}: {
  item: TaaviaBrandKnowledgeBaseListItem;
  href: string;
  accent?: 'current' | 'previous' | null;
}) {
  return (
    <article
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-right transition ${
        item.isActive
          ? 'border-emerald-400/40 bg-emerald-500/[0.07]'
          : 'border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] hover:border-cyan-400/30'
      }`}
    >
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${item.isActive ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/5 text-cyan-300'}`}>
        <Layers3 className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="m-0 truncate text-sm font-black text-[var(--taav-text-strong)]">{item.versionLabel}</h3>
          <TaavBadge tone={item.isActive ? 'success' : 'neutral'} variant="soft" size="sm">
            {item.isActive ? 'فعال' : 'غیرفعال'}
          </TaavBadge>
          <span className="text-[11px] text-[var(--taav-text-muted)]">
            {accent === 'current' ? 'نسخه فعلی' : accent === 'previous' ? 'نسخه قبلی' : item.buildType}
          </span>
        </div>
        <p className="mt-0.5 text-[11px] text-[var(--taav-text-muted)]">
          <span dir="ltr">{item.createdAt}</span>
          {' · '}
          {item.categoryCount.toLocaleString('fa-IR')} دسته
          {' · '}
          {item.sourceSnapshotCount.toLocaleString('fa-IR')} منبع
        </p>
      </div>
      <Link href={href} className="shrink-0">
        <TaavButton size="sm" variant="secondary" iconStart={<Eye className="h-3.5 w-3.5" />}>
          جزئیات
        </TaavButton>
      </Link>
    </article>
  );
}

function BuildRow({ item, href }: { item: TaaviaBrandBuildListItem; href: string }) {
  return (
    <article
      className={`grid gap-2 rounded-xl border px-3 py-2.5 text-right transition ${
        item.isInProgress
          ? 'border-amber-400/45 bg-amber-500/[0.06]'
          : item.statusTone === 'danger'
            ? 'border-rose-400/35 bg-rose-500/[0.05]'
            : 'border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] hover:border-cyan-400/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-400/10 text-cyan-300">
          <Hammer className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="m-0 truncate text-sm font-black text-[var(--taav-text-strong)]">{item.buildType}</h3>
            <TaavBadge tone={item.statusTone} variant="soft" size="sm">
              {item.status}
            </TaavBadge>
            {item.versionLabel ? (
              <TaavBadge tone="info" variant="soft" size="sm">
                <bdi dir="ltr">{item.versionLabel}</bdi>
              </TaavBadge>
            ) : null}
          </div>
          <p className="mt-0.5 text-[11px] text-[var(--taav-text-muted)]">
            <span dir="ltr">{item.isInProgress || !item.finishedAt ? item.startedAt : item.finishedAt}</span>
            {item.sourceCount > 0 ? ` · ${item.sourceCount.toLocaleString('fa-IR')} منبع` : null}
          </p>
        </div>
        <Link href={href} className="shrink-0">
          <TaavButton size="sm" variant="secondary" iconStart={<Eye className="h-3.5 w-3.5" />}>
            مشاهده
          </TaavButton>
        </Link>
      </div>

      {item.isInProgress ? (
        <div className="grid gap-1 pr-11">
          <div className="flex items-center justify-between text-[11px] text-[var(--taav-text-muted)]">
            <span>پیشرفت ساخت</span>
            <span className="tabular-nums font-semibold text-[var(--taav-text-body)]">{item.progress.toLocaleString('fa-IR')}٪</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
            <div
              className="h-full rounded-full bg-[var(--taav-brand)] transition-[width]"
              style={{ width: `${Math.max(0, Math.min(100, item.progress))}%` }}
            />
          </div>
        </div>
      ) : null}

      {item.failureMessage ? (
        <p className="m-0 truncate pr-11 text-[11px] text-rose-300" title={item.failureMessage}>
          {item.failureMessage}
        </p>
      ) : null}
    </article>
  );
}

export function TaaviaBrandWorkspaceClient({ tenantId, brand, overview, initialBuild }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [smartBuildOpen, setSmartBuildOpen] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updatePending, startUpdate] = useTransition();
  const base = `/businesses/${tenantId}/products/taavia/brands/${brand.id}`;
  const kb = `${base}/knowledge-base`;
  const active = overview.knowledgeBases.find((item) => item.isActive) ?? null;
  const previousActive = overview.knowledgeBases.find((item) => !item.isActive) ?? null;
  const initials = brand.name.trim().slice(0, 2) || 'تا';
  const activeSourcesTotal = useMemo(
    () => Object.values(overview.currentSources).reduce((sum, value) => sum + value, 0),
    [overview.currentSources],
  );
  const activeBuildId = initialBuild?.id ?? overview.builds.find((item) => item.isInProgress)?.buildId ?? null;
  const buildInProgress = Boolean(activeBuildId || (initialBuild && ['PENDING', 'PROCESSING', 'RUNNING'].includes(initialBuild.status)));
  const activeBuildHref = activeBuildId ? `${kb}/builds/${activeBuildId}` : kb;
  const canCreateKb = overview.knowledgeBases.length < 5;

  const copyBrandId = async () => {
    try {
      await navigator.clipboard.writeText(brand.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const startUpdateBuild = () => {
    if (!active) return;
    setUpdateError(null);
    startUpdate(async () => {
      try {
        const buildId = await startKnowledgeBaseUpdateAction({
          businessId: tenantId,
          brandId: brand.id,
          knowledgeBaseId: active.knowledgeBaseId,
        });
        router.push(`${kb}/builds/${buildId}`);
        router.refresh();
      } catch (error) {
        setUpdateError(error instanceof Error ? error.message : 'شروع بروزرسانی ناموفق بود.');
      }
    });
  };

  return (
    <main dir="rtl" className="mx-auto grid max-w-7xl gap-3 pb-6 text-right">
      <TaavCard variant="outlined" padding="md" radius="xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-cyan-400/15 text-lg font-black text-cyan-200 ring-1 ring-cyan-400/20">
              {brand.icon?.previewData ? <img src={brand.icon.previewData} alt="" className="h-full w-full object-cover" /> : initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="m-0 text-[clamp(1rem,1.5vw,1.2rem)] font-black text-[var(--taav-text-strong)]">{brand.name}</h1>
                <TaavBadge tone={brand.status === 'ACTIVE' ? 'success' : 'neutral'} variant="soft" size="sm">
                  {brand.status === 'ACTIVE' ? 'فعال' : brand.status === 'ARCHIVED' ? 'آرشیو' : 'غیرفعال'}
                </TaavBadge>
              </div>
              <p className="mt-1.5 max-w-2xl text-xs leading-6 text-[var(--taav-text-muted)]">
                {brand.description?.trim() || 'مرکز مدیریت برند و دانش سازمانی آن'}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void copyBrandId()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-2.5 py-1.5 text-[11px] text-[var(--taav-text-muted)] transition hover:border-cyan-400/40 hover:text-cyan-300"
                  title={`کپی شناسه: ${brand.id}`}
                  aria-label="کپی شناسه برند"
                >
                  <span>شناسه</span>
                  <bdi className="font-semibold tabular-nums text-[var(--taav-text-body)]" dir="ltr">
                    {truncateId(brand.id)}
                  </bdi>
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-2.5 py-1.5 text-[11px] text-[var(--taav-text-muted)]">
                  <CalendarDays className="h-3.5 w-3.5 text-cyan-300" aria-hidden />
                  <span>آخرین تغییر</span>
                  <bdi className="font-semibold tabular-nums text-[var(--taav-text-body)]" dir="ltr">
                    {formatBrandDate(brand.updatedAt)}
                  </bdi>
                </span>
                {copied ? <span className="text-[11px] text-cyan-300">کپی شد</span> : null}
              </div>
            </div>
          </div>

          <Link href={`/businesses/${tenantId}/products/taavia/brands`}>
            <TaavButton size="sm" variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
              بازگشت به فهرست برندها
            </TaavButton>
          </Link>
        </div>
      </TaavCard>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="خلاصه وضعیت برند">
        <OverviewMetric label="منابع فعال" value={activeSourcesTotal.toLocaleString('fa-IR')} icon={<FolderOpen className="h-5 w-5" />} />
        <OverviewMetric label="Knowledge Base ها" value={overview.knowledgeBases.length.toLocaleString('fa-IR')} icon={<Layers3 className="h-5 w-5" />} />
        <OverviewMetric label="نسخه فعال" value={active?.versionLabel || '—'} icon={<Award className="h-5 w-5" />} />
        <OverviewMetric label="آخرین Build" value={active?.createdAt || '—'} icon={<CalendarDays className="h-5 w-5" />} />
      </section>

      {/* RTL: first column appears on the right */}
      <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <TaavCard variant="outlined" padding="md" radius="xl">
          <div>
            <h2 className="m-0 text-base font-black text-[var(--taav-text-strong)]">منابع فعلی برند</h2>
            <p className="mt-1 text-xs leading-6 text-[var(--taav-text-muted)]">منابع در دسترس این برند برای ساخت و بروزرسانی Knowledge Base</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <SourceStat label="دانش‌ها" value={overview.currentSources.brandInfo} />
            <SourceStat label="محصولات" value={overview.currentSources.productsServices} />
            <SourceStat label="سوالات پرتکرار" value={overview.currentSources.faqs} />
            <SourceStat label="مستندات" value={overview.currentSources.filesDocuments} />
          </div>
          <Link href={`${base}/sources`} className="mt-4 block">
            <TaavButton size="sm" variant="secondary" unsafeClassName="w-full" iconStart={<FileText className="h-4 w-4" />}>
              مدیریت منابع برند
            </TaavButton>
          </Link>
        </TaavCard>

        <TaavCard variant="outlined" padding="md" radius="xl">
          <div>
            <h2 className="m-0 text-base font-black text-[var(--taav-text-strong)]">مدل‌های Knowledge Base</h2>
            <p className="mt-1 text-xs leading-6 text-[var(--taav-text-muted)]">
              تخصیص مدل‌های هوش مصنوعی برند برای OCR و چت تحلیل
            </p>
          </div>
          <div className="mt-4 grid gap-2">
            {overview.modelSlots.map((slot) => (
              <div
                key={slot.purpose}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="m-0 text-[11px] text-[var(--taav-text-muted)]">{slot.label}</p>
                  <strong className="mt-0.5 block truncate text-sm text-[var(--taav-text-strong)]">
                    {slot.modelName ?? 'تنظیم نشده'}
                  </strong>
                  {slot.accountName ? (
                    <p className="mt-0.5 truncate text-[11px] text-[var(--taav-text-muted)]">{slot.accountName}</p>
                  ) : null}
                </div>
                <TaavBadge tone={slot.assigned ? 'success' : 'warning'} variant="soft" size="sm">
                  {slot.assigned ? 'فعال' : 'خالی'}
                </TaavBadge>
              </div>
            ))}
          </div>
          <Link href={`${base}/model-settings`} className="mt-4 block">
            <TaavButton size="sm" variant="secondary" unsafeClassName="w-full" iconStart={<Cpu className="h-4 w-4" />}>
              مدیریت مدل‌های برند
            </TaavButton>
          </Link>
        </TaavCard>

        <TaavCard variant="outlined" padding="md" radius="xl">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 text-base font-black text-[var(--taav-text-strong)]">Knowledge Base فعال</h2>
            {active ? (
              <TaavBadge tone="success" variant="soft" size="sm">
                فعال
              </TaavBadge>
            ) : null}
          </div>

          {active ? (
            <>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl bg-[var(--taav-surface-soft)] px-3 py-3">
                  <p className="m-0 text-[11px] text-[var(--taav-text-muted)]">نسخه</p>
                  <strong className="mt-1 block text-sm text-[var(--taav-text-strong)]">{active.versionLabel}</strong>
                  <p className="mt-1 text-[11px] text-[var(--taav-text-muted)]">
                    {active.buildType}
                    <br />
                    <span dir="ltr">{active.createdAt}</span>
                  </p>
                </div>
                <div className="rounded-xl bg-[var(--taav-surface-soft)] px-3 py-3">
                  <p className="m-0 text-[11px] text-[var(--taav-text-muted)]">منابع Snapshot</p>
                  <strong className="mt-1 block text-sm tabular-nums text-[var(--taav-text-strong)]">
                    {active.sourceSnapshotCount.toLocaleString('fa-IR')}
                  </strong>
                </div>
                <div className="rounded-xl bg-[var(--taav-surface-soft)] px-3 py-3">
                  <p className="m-0 text-[11px] text-[var(--taav-text-muted)]">دسته‌بندی‌ها</p>
                  <strong className="mt-1 block text-sm tabular-nums text-[var(--taav-text-strong)]">
                    {active.categoryCount.toLocaleString('fa-IR')}
                  </strong>
                </div>
              </div>
              <div className="mt-4">
                <Link href={`${kb}/${active.knowledgeBaseId}/categories`}>
                  <TaavButton size="sm" unsafeClassName="w-full" iconStart={<Database className="h-4 w-4" />}>
                    مدیریت Knowledge Base
                  </TaavButton>
                </Link>
              </div>
            </>
          ) : (
            <div className="mt-4 grid gap-3">
              <p className="m-0 text-sm text-[var(--taav-text-muted)]">هنوز Knowledge Base فعالی برای این برند وجود ندارد.</p>
              <InitialKnowledgeBuildAction
                businessId={tenantId}
                brandId={brand.id}
                activeSources={activeSourcesTotal}
                activeBuild={buildInProgress}
                activeBuildId={activeBuildId}
              />
            </div>
          )}
        </TaavCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {/* RTL: first column = right = Knowledge Bases */}
        <div className="flex min-h-[280px] flex-col rounded-2xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="m-0 text-sm font-black text-[var(--taav-text-strong)]">فهرست Knowledge Base ها</h2>
              <p className="mt-1 text-[11px] text-[var(--taav-text-muted)]">نسخه‌های دانشنامه این برند</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSmartBuildOpen(true)}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/15 px-4 text-sm font-bold text-sky-100 transition hover:bg-sky-500/25"
              >
                <Sparkles className="h-4 w-4" />
                ساخت هوشمند با AI
              </button>
              {overview.knowledgeBases.length === 0 ? (
                <InitialKnowledgeBuildAction
                  businessId={tenantId}
                  brandId={brand.id}
                  activeSources={activeSourcesTotal}
                  activeBuild={buildInProgress}
                  activeBuildId={activeBuildId}
                />
              ) : buildInProgress ? (
                <Link href={activeBuildHref}>
                  <TaavButton size="sm" iconStart={<Database className="h-4 w-4" />}>
                    مشاهده روند ساخت
                  </TaavButton>
                </Link>
              ) : null}
            </div>
          </div>

          {updateError ? (
            <p role="alert" className="mt-2 text-xs text-rose-300">
              {updateError}
            </p>
          ) : null}

          {overview.knowledgeBases.length ? (
            <div className="mt-3 grid flex-1 content-start gap-2">
              {overview.knowledgeBases.map((item) => (
                <KnowledgeBaseRow
                  key={item.knowledgeBaseId}
                  item={item}
                  href={`${kb}/${item.knowledgeBaseId}`}
                  accent={
                    item.knowledgeBaseId === active?.knowledgeBaseId
                      ? 'current'
                      : item.knowledgeBaseId === previousActive?.knowledgeBaseId
                        ? 'previous'
                        : null
                  }
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-1 items-center justify-center">
              <TaavEmptyState
                size="md"
                title="هنوز نسخه‌ای ساخته نشده است"
                description="با ساخت اولین Knowledge Base، نسخه اینجا نمایش داده می‌شود."
                primaryAction={
                  <InitialKnowledgeBuildAction
                    businessId={tenantId}
                    brandId={brand.id}
                    activeSources={activeSourcesTotal}
                    activeBuild={buildInProgress}
                    activeBuildId={activeBuildId}
                  />
                }
              />
            </div>
          )}
        </div>

        <div className="flex min-h-[280px] flex-col rounded-2xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="m-0 text-sm font-black text-[var(--taav-text-strong)]">فهرست بیلدها</h2>
              <p className="mt-1 text-[11px] text-[var(--taav-text-muted)]">وضعیت ساخت و بروزرسانی دانشنامه</p>
            </div>
            <div className="flex items-center gap-2">
              <TaavBadge tone="neutral" variant="soft" size="sm">
                {overview.builds.length.toLocaleString('fa-IR')} مورد
              </TaavBadge>
              {buildInProgress ? (
                <Link href={activeBuildHref}>
                  <TaavButton size="sm" variant="secondary">
                    مشاهده روند ساخت
                  </TaavButton>
                </Link>
              ) : null}
            </div>
          </div>

          {overview.builds.length ? (
            <div className="mt-3 grid flex-1 content-start gap-2">
              {overview.builds.map((item) => (
                <BuildRow key={item.buildId} item={item} href={`${kb}/builds/${item.buildId}`} />
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-1 items-center justify-center">
              <TaavEmptyState
                size="md"
                title="هنوز بیلدی ثبت نشده است"
                description="با شروع ساخت Knowledge Base، وضعیت بیلد اینجا ظاهر می‌شود."
                primaryAction={
                  overview.knowledgeBases.length === 0 ? (
                    <InitialKnowledgeBuildAction
                      businessId={tenantId}
                      brandId={brand.id}
                      activeSources={activeSourcesTotal}
                      activeBuild={buildInProgress}
                      activeBuildId={activeBuildId}
                    />
                  ) : (
                    <TaavButton
                      size="sm"
                      disabled={!canCreateKb || !active || updatePending}
                      iconStart={<PackageOpen className="h-4 w-4" />}
                      onClick={startUpdateBuild}
                    >
                      شروع بیلد جدید
                    </TaavButton>
                  )
                }
              />
            </div>
          )}
        </div>
      </section>

      <TaavDialog open={smartBuildOpen} onOpenChange={setSmartBuildOpen}>
        <TaavDialogContent size="sm" contentClassName="ai-lab-dialog" dir="rtl">
          <TaavDialogHeader>
            <TaavDialogTitle className="text-right text-lg font-black">ساخت هوشمند با AI</TaavDialogTitle>
            <TaavDialogDescription className="mt-2 text-right text-sm leading-7">
              به‌زودی این قابلیت اضافه می‌شود. با ساخت هوشمند، AI می‌تواند به‌صورت خودکار Knowledge Base را از منابع برند بسازد.
            </TaavDialogDescription>
          </TaavDialogHeader>
          <TaavDialogFooter>
            <TaavButton size="sm" onClick={() => setSmartBuildOpen(false)}>
              متوجه شدم
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
    </main>
  );
}
