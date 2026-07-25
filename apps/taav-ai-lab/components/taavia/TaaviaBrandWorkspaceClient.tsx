"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Bot, Boxes, CalendarDays, Database, ExternalLink, FileText, FolderTree, Layers3, Link2, MessageCircle, MoreHorizontal, PackageOpen, Tags } from "lucide-react";
import { TaavBadge, TaavButton, TaavCard } from "@repo/ui/taav/primitives";
import { TaavEmptyState, TaavTableActions, TaavTableBody, TaavTableCell, TaavTableHead, TaavTableHeader, TaavTableRow, TaavTableShell } from "@repo/ui/taav/data-display";
import type { TaaviaBrand } from "@/app/lib/types/domain";
import type { TaaviaBrandDetailsOverview, TaaviaBrandKnowledgeBaseListItem } from "@/app/lib/types/taavia-brand-details-dashboard";
type Props = { tenantId: string; brand: TaaviaBrand; overview: TaaviaBrandDetailsOverview };
const RowBadge = ({ active }: { active: boolean }) => (
  <TaavBadge tone={active ? "success" : "neutral"} variant="soft">
    {active ? "فعال" : "غیرفعال"}
  </TaavBadge>
);
export function TaaviaBrandWorkspaceClient({ tenantId, brand, overview }: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const base = `/businesses/${tenantId}/products/taavia/brands/${brand.id}`;
  const kb = `${base}/knowledge-base`;
  const active = overview.knowledgeBases.find((x) => x.isActive) ?? null;
  const initials = brand.name.slice(0, 2) || "TA";
  const stat = (label: string, value: string | number, icon: React.ReactNode) => (
    <div className="flex min-w-[150px] flex-1 items-center justify-between gap-3 border-l border-[var(--taav-border-subtle)] px-4 last:border-0">
      <div className="text-right">
        <p className="m-0 text-xs text-[var(--taav-text-muted)]">{label}</p>
        <strong className="mt-2 block text-xl text-[var(--taav-text-strong)]">{value}</strong>
      </div>
      <span className="text-[var(--taav-brand-strong)]">{icon}</span>
    </div>
  );
  return (
    <main dir="rtl" className="mx-auto grid max-w-7xl gap-4 pb-10">
      <header className="grid gap-3">
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-[var(--taav-text-muted)]">
            <Link href={`/businesses/${tenantId}/products/taavia/brands`}>برندها</Link>
            <span>←</span>
            <strong className="text-[var(--taav-text-body)]">{brand.name}</strong>
          </nav>
          <Link href={`/businesses/${tenantId}/products/taavia/brands`}>
            <TaavButton size="sm" variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
              بازگشت به فهرست برندها
            </TaavButton>
          </Link>
        </div>
        <TaavCard variant="outlined" padding="md" radius="xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4 text-right">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[var(--taav-radius-xl)] border border-[var(--taav-border-subtle)] bg-[var(--taav-brand-soft)] text-3xl font-black text-[var(--taav-brand-strong)]">{brand.icon?.previewData ? <img src={brand.icon.previewData} alt="" className="h-full w-full object-cover" /> : initials}</div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="m-0 text-2xl font-black text-[var(--taav-text-strong)]">{brand.name}</h1>
                  <TaavBadge tone={brand.status === "ACTIVE" ? "success" : "neutral"} variant="soft">
                    {brand.status === "ACTIVE" ? "فعال" : "غیرفعال"}
                  </TaavBadge>
                </div>
                <p className="mt-2 max-w-xl text-sm leading-7 text-[var(--taav-text-muted)]">{brand.description || "مرکز مدیریت برند و دانش سازمانی آن"}</p>
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-3">
                  <span>
                    شناسه برند: <b dir="ltr">{brand.id}</b>
                  </span>
                  <span>
                    ایجاد: <b dir="ltr">{brand.createdAt}</b>
                  </span>
                  <a href={overview.website} className="text-[var(--taav-brand-strong)]">
                    وب‌سایت <ExternalLink className="mr-1 inline h-3 w-3" />
                  </a>
                  <span>کشور: {overview.country}</span>
                  <span>صنعت: {overview.industry}</span>
                  <span>
                    آخرین تغییر: <b dir="ltr">{brand.updatedAt}</b>
                  </span>
                </dl>
              </div>
            </div>
          </div>
        </TaavCard>
      </header>
      {feedback ? (
        <div role="status" className="rounded-xl border border-[var(--taav-info)]/30 bg-[var(--taav-info)]/10 p-3 text-right text-sm">
          {feedback}
        </div>
      ) : null}
      <TaavCard variant="outlined" padding="md" radius="xl">
        <div className="flex flex-wrap">
          {stat("آخرین Build", active?.createdAt || "—", <CalendarDays className="h-5 w-5" />)}
          {stat("دسته‌بندی‌های KB فعال", active?.categoryCount || 0, <FolderTree className="h-5 w-5" />)}
          {stat("منابع Snapshot", active?.sourceSnapshotCount || 0, <FileText className="h-5 w-5" />)}
          {stat("تعداد Knowledge Baseها", overview.knowledgeBases.length, <Layers3 className="h-5 w-5" />)}
        </div>
      </TaavCard>
      <section dir="ltr" className="grid gap-4 xl:grid-cols-3">
        <div dir="rtl">
          <TaavCard variant="outlined" padding="md" radius="xl">
            <h2 className="m-0 text-right font-black">منابع برند (فعلی)</h2>
            <p className="mt-1 text-right text-xs text-[var(--taav-text-muted)]">منابع زنده و قابل ویرایش؛ جدا از Snapshotهای Knowledge Base</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {[
                ["معرفی برند", overview.currentSources.brandInfo],
                ["محصولات و خدمات", overview.currentSources.productsServices],
                ["سوالات متداول", overview.currentSources.faqs],
                ["فایل‌ها و مستندات", overview.currentSources.filesDocuments],
                ["لینک‌ها", overview.currentSources.links],
              ].map(([l, v]) => (
                <div key={String(l)} className="rounded-lg bg-[var(--taav-surface-soft)] p-3">
                  <span className="text-xs text-[var(--taav-text-muted)]">{l}</span>
                  <b className="mt-1 block text-[var(--taav-text-strong)]">{v}</b>
                </div>
              ))}
            </div>
            <Link href={`${base}/sources`} className="mt-4 grid">
              <TaavButton size="sm" variant="secondary" iconStart={<PackageOpen className="h-4 w-4" />}>
                مشاهده و مدیریت منابع برند
              </TaavButton>
            </Link>
          </TaavCard>
        </div>
        <div dir="rtl">
          <TaavCard variant="outlined" padding="md" radius="xl">
            <h2 className="m-0 text-right font-black">تست چت‌بات برند</h2>
            <p className="mt-1 text-right text-xs text-[var(--taav-text-muted)]">پاسخ‌های چت‌بات با Knowledge Base فعال این برند آزمایش می‌شوند.</p>
            <div className="mt-4 rounded-xl bg-violet-500/10 p-4 text-right">
              <p className="m-0 text-sm">
                Knowledge Base فعال: <b className="text-violet-300">{active?.versionLabel || "—"}</b>
              </p>
              <p className="mt-3 text-sm">
                وضعیت چت‌بات: <b className="text-[var(--taav-success-strong)]">{overview.chatbot.ready ? "آماده" : "غیرفعال"}</b>
              </p>
              <p className="mt-3 text-xs text-[var(--taav-text-muted)]">
                آخرین بروزرسانی دانش: <span dir="ltr">{overview.chatbot.lastKnowledgeUpdatedAt}</span>
              </p>
            </div>
            {active ? (
              <Link href={`${base}/test`} className="mt-4 grid">
                <TaavButton size="sm" iconStart={<MessageCircle className="h-4 w-4" />}>
                  شروع تست چت‌بات
                </TaavButton>
              </Link>
            ) : (
              <TaavButton size="sm" disabled>
                ابتدا یک Knowledge Base فعال ایجاد کنید.
              </TaavButton>
            )}
          </TaavCard>
        </div>
        <div dir="rtl">
          <TaavCard variant="outlined" padding="md" radius="xl">
            <h2 className="m-0 text-right font-black">Knowledge Base فعال برند</h2>
            {active ? (
              <>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--taav-brand)]/30 bg-[var(--taav-brand-soft)] p-4">
                  <div>
                    <b className="text-lg">{active.versionLabel}</b>
                    <p className="mt-1 text-xs">
                      {active.buildType} · <span dir="ltr">{active.createdAt}</span>
                    </p>
                  </div>
                  <RowBadge active />
                </div>
                <div className="mt-3 flex justify-between text-sm">
                  <span>دسته‌ها: {active.categoryCount}</span>
                  <span>Snapshotها: {active.sourceSnapshotCount}</span>
                </div>
                <Link href={kb} className="mt-4 grid">
                  <TaavButton size="sm" iconStart={<Database className="h-4 w-4" />}>
                    مدیریت Knowledge Base فعال
                  </TaavButton>
                </Link>
              </>
            ) : (
              <TaavEmptyState variant="default" size="sm" title="Knowledge Base فعالی وجود ندارد" />
            )}
          </TaavCard>
        </div>
      </section>
      <section dir="ltr" className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div dir="rtl">
          <TaavCard variant="outlined" padding="md" radius="xl">
            <div className="flex items-center justify-between">
              <h2 className="m-0 font-black">خلاصه نسخه‌های Knowledge Base</h2>
              <Link href={`${kb}/versions`}>
                <TaavButton size="sm" variant="secondary">
                  مشاهده همه نسخه‌ها
                </TaavButton>
              </Link>
            </div>
            <div className="mt-3 space-y-2">
              {overview.knowledgeBases.map((item) => (
                <div key={item.knowledgeBaseId} className="flex items-center justify-between rounded-lg bg-[var(--taav-surface-soft)] p-3 text-sm">
                  <div>
                    <b>{item.versionLabel}</b>
                    <span className="mr-3 text-xs text-[var(--taav-text-muted)]">
                      {item.buildType} · {item.createdAt}
                    </span>
                  </div>
                  <RowBadge active={item.isActive} />
                </div>
              ))}
            </div>
          </TaavCard>
        </div>
        <div dir="rtl">
          <TaavCard variant="outlined" padding="md" radius="xl">
            <div className="flex items-center justify-between">
              <h2 className="m-0 font-black">همه Knowledge Baseهای برند</h2>
              <TaavButton size="sm" variant="secondary" disabled={overview.knowledgeBases.length >= 5} iconStart={<Database className="h-4 w-4" />}>
                Knowledge Base جدید
              </TaavButton>
            </div>
            {overview.knowledgeBases.length >= 5 ? <p className="mt-2 text-xs text-[var(--taav-warning-strong)]">برای ساخت نسخه جدید ابتدا یکی از نسخه‌های غیرفعال را حذف کنید.</p> : null}
            <div className="mt-4 overflow-x-auto">
              <TaavTableShell variant="bordered" density="compact">
                <TaavTableHeader>
                  <TaavTableRow>
                    <TaavTableHead>وضعیت</TaavTableHead>
                    <TaavTableHead>نسخه</TaavTableHead>
                    <TaavTableHead>نوع Build</TaavTableHead>
                    <TaavTableHead>تاریخ ساخت</TaavTableHead>
                    <TaavTableHead>دسته‌ها</TaavTableHead>
                    <TaavTableHead>Snapshotها</TaavTableHead>
                    <TaavTableHead>توضیحات</TaavTableHead>
                    <TaavTableActions>عملیات</TaavTableActions>
                  </TaavTableRow>
                </TaavTableHeader>
                <TaavTableBody>
                  {overview.knowledgeBases.map((item: TaaviaBrandKnowledgeBaseListItem) => (
                    <TaavTableRow key={item.knowledgeBaseId}>
                      <TaavTableCell>
                        <RowBadge active={item.isActive} />
                      </TaavTableCell>
                      <TaavTableCell>
                        <b>{item.versionLabel}</b>
                      </TaavTableCell>
                      <TaavTableCell>{item.buildType}</TaavTableCell>
                      <TaavTableCell dir="ltr">{item.createdAt}</TaavTableCell>
                      <TaavTableCell>{item.categoryCount}</TaavTableCell>
                      <TaavTableCell>{item.sourceSnapshotCount}</TaavTableCell>
                      <TaavTableCell>{item.description}</TaavTableCell>
                      <TaavTableActions>
                        <Link href={item.isActive ? kb : "#"}>
                          <TaavButton size="sm" variant="secondary">
                            مشاهده جزئیات
                          </TaavButton>
                        </Link>
                        <MoreHorizontal className="mr-2 inline h-4 w-4 text-[var(--taav-text-muted)]" />
                      </TaavTableActions>
                    </TaavTableRow>
                  ))}
                </TaavTableBody>
              </TaavTableShell>
            </div>
          </TaavCard>
        </div>
      </section>
    </main>
  );
}
