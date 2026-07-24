"use client";

import { useMemo, useState, useTransition } from "react";
import { Archive, Database, MoreHorizontal, RotateCcw, Search } from "lucide-react";
import type { BrandSourceFamily, BrandSourcesPageData } from "@/app/lib/services/taavia-brand-sources-read-service";
import { changeBrandSourceStatus } from "@/app/businesses/[businessId]/products/taavia/brands/[brandId]/sources/actions";
import { AddBrandIntroductionDialog } from "@/components/taavia/AddBrandIntroductionDialog";

const tabs: Array<{ id: "all" | BrandSourceFamily; label: string }> = [
  { id: "all", label: "همه" },
  { id: "brand_info", label: "معرفی برند" },
  { id: "knowledge", label: "دانش‌ها" },
  { id: "product", label: "محصولات" },
  { id: "faq", label: "سوالات پرتکرار" },
];
const typeLabels: Record<BrandSourceFamily, string> = { brand_info: "معرفی برند", knowledge: "دانش", product: "محصول", faq: "سوال پرتکرار" };

export function TaaviaBrandSourcesClient({ data }: { data: BrandSourcesPageData }) {
  const [tab, setTab] = useState<"all" | BrandSourceFamily>("brand_info");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [status, setStatus] = useState("all");
  const [usage, setUsage] = useState("all");
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);
  const rows = useMemo(() => data.sources.filter((item) => (tab === "all" || item.sourceType === tab) && (status === "all" || item.status === status) && (usage === "all" || (usage === "active" && item.usedInActiveKnowledgeBase) || (usage === "changed" && item.changedSinceActiveKnowledgeBase) || (usage === "previous" && item.usageStatus === "USED_IN_PREVIOUS_KB_ONLY") || (usage === "never" && item.usageStatus === "NEVER_USED") || (usage === "none" && item.usageStatus === "NO_ACTIVE_KNOWLEDGE_BASE")) && `${item.title} ${item.summary}`.toLocaleLowerCase("fa").includes(search.toLocaleLowerCase("fa"))), [data.sources, tab, status, usage, search]);
  const clear = () => {
    setTab("brand_info");
    setStatus("all");
    setUsage("all");
    setSearch("");
  };
  const mutate = (sourceId: string, sourceType: BrandSourceFamily, revision: string, nextStatus: "ACTIVE" | "ARCHIVED") => {
    if (nextStatus === "ARCHIVED" && !window.confirm("این منبع آرشیو می‌شود و در Buildهای بعدی استفاده نخواهد شد. نسخه‌های قبلی Knowledge Base تغییری نمی‌کنند.")) return;
    startTransition(async () => {
      const result = await changeBrandSourceStatus({ businessId: data.businessId, brandId: data.brandId, sourceId, sourceType, revision, nextStatus });
      if (result.ok) setNotice("وضعیت منبع ذخیره شد.");
      else setNotice("message" in result ? result.message : "ذخیرهٔ تغییر وضعیت انجام نشد.");
    });
  };
  return (
    <main dir="rtl" className="mx-auto w-full max-w-[1500px] space-y-4 pb-8 text-right">
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] px-5 py-4">
        <div>
          <h1 className="m-0 text-xl font-black text-[var(--taav-text-strong)]">مدیریت منابع برند</h1>
          <p className="mt-1 text-sm text-[var(--taav-text-muted)]">منابع فعلی و قابل ویرایش برند؛ مستقل از Snapshotهای تاریخی Knowledge Base.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setDialogOpen(true)} className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300">
            افزودن منبع معرفی برند
          </button>
          <Database className="h-9 w-9 text-violet-400" aria-hidden />
        </div>
      </header>
      {!data.activeVersionLabel ? <p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">هنوز Knowledge Base فعالی وجود ندارد؛ وضعیت استفاده برای منابع ثبت نشده است.</p> : null}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {[
          ["کل منابع", data.summary.total],
          ["منابع فعال", data.summary.active],
          ["منابع آرشیوشده", data.summary.archived],
          ["استفاده‌شده در KB فعال", data.summary.usedInActive],
          ["تغییرکرده پس از Build", data.summary.changedAfterBuild],
          ["استفاده‌نشده در هیچ KB", data.summary.neverUsed],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-4">
            <p className="m-0 text-xs text-[var(--taav-text-muted)]">{label}</p>
            <b className="mt-2 block text-2xl text-[var(--taav-text-strong)]">
              <bdi>{value}</bdi>
            </b>
          </div>
        ))}
      </section>
      <section className="rounded-2xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--taav-border-subtle)] pb-3">
          {tabs
            .filter((item) => item.id !== "all")
            .map((item) => (
              <button key={item.id} onClick={() => setTab(item.id)} className={`rounded-lg px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${tab === item.id ? "bg-cyan-400/15 text-cyan-300" : "text-[var(--taav-text-muted)]"}`}>
                {item.label}
                {item.id !== "all" ? <span className="mr-1 text-xs">({data.typeCounts[item.id]})</span> : null}
              </button>
            ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="relative min-w-[220px] flex-1">
            <Search className="absolute right-3 top-3 h-4 w-4 text-[var(--taav-text-muted)]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجو در عنوان و محتوا…" className="w-full rounded-lg border border-[var(--taav-border-subtle)] bg-transparent py-2 pr-9 pl-3 text-sm outline-none focus:border-cyan-400" />
          </label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 text-sm">
            <option value="all">همه وضعیت‌ها</option>
            <option value="ACTIVE">فعال</option>
            <option value="ARCHIVED">آرشیوشده</option>
          </select>
          <select value={usage} onChange={(event) => setUsage(event.target.value)} className="rounded-lg border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] px-3 text-sm">
            <option value="all">همه وضعیت‌های استفاده</option>
            <option value="active">استفاده‌شده در KB فعال</option>
            <option value="changed">تغییرکرده بعد از KB فعال</option>
            <option value="previous">نسخه‌های قبلی</option>
            <option value="never">استفاده‌نشده</option>
            <option value="none">بدون KB فعال</option>
          </select>
          <button onClick={clear} className="rounded-lg border border-[var(--taav-border-subtle)] px-3 text-sm">
            پاک کردن فیلترها
          </button>
        </div>
        {notice ? (
          <p className="mt-3 text-sm text-cyan-300" role="status">
            {notice}
          </p>
        ) : null}
        <p className="mt-3 text-xs text-[var(--taav-text-muted)]">
          نمایش <bdi>{rows.length}</bdi> منبع
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[940px] text-sm">
            <thead className="border-y border-[var(--taav-border-subtle)] text-xs text-[var(--taav-text-muted)]">
              <tr>
                <th className="p-3 text-right">عنوان منبع</th>
                <th className="p-3 text-right">نوع منبع</th>
                <th className="p-3 text-right">وضعیت</th>
                <th className="p-3 text-right">وضعیت نسبت به KB فعال</th>
                <th className="p-3 text-right">آخرین ویرایش</th>
                <th className="p-3 text-right">استفاده در KBها</th>
                <th className="p-3 text-right">آخرین نسخه</th>
                <th className="p-3 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={`${item.sourceType}:${item.sourceId}`} className="border-b border-[var(--taav-border-subtle)]">
                  <td className="max-w-64 p-3">
                    <b className="block text-[var(--taav-text-strong)]">{item.title}</b>
                    <span className="line-clamp-1 text-xs text-[var(--taav-text-muted)]">{item.summary}</span>
                  </td>
                  <td className="p-3">{typeLabels[item.sourceType]}</td>
                  <td className="p-3">
                    <span className={item.status === "ACTIVE" ? "rounded bg-emerald-400/15 px-2 py-1 text-emerald-300" : "rounded bg-slate-400/15 px-2 py-1 text-slate-300"}>{item.status === "ACTIVE" ? "فعال" : "آرشیوشده"}</span>
                  </td>
                  <td className="p-3">
                    <span className="rounded bg-blue-400/10 px-2 py-1 text-xs text-blue-200">{item.usageStatusLabel}</span>
                  </td>
                  <td className="p-3">
                    <bdi>{item.updatedAt}</bdi>
                  </td>
                  <td className="p-3">
                    <bdi>{item.knowledgeBaseUsageCount}</bdi> نسخه
                  </td>
                  <td className="p-3">
                    <bdi>{item.latestUsedVersionLabel ?? "—"}</bdi>
                  </td>
                  <td className="p-3 text-left">
                    <button disabled={pending} onClick={() => mutate(item.sourceId, item.sourceType, item.revision, item.status === "ACTIVE" ? "ARCHIVED" : "ACTIVE")} aria-label={item.status === "ACTIVE" ? `آرشیو ${item.title}` : `فعال‌سازی مجدد ${item.title}`} className="rounded-lg border border-[var(--taav-border-subtle)] p-2 disabled:opacity-50">
                      {item.status === "ACTIVE" ? <Archive className="h-4 w-4 text-rose-300" /> : <RotateCcw className="h-4 w-4 text-cyan-300" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? <div className="py-12 text-center text-sm text-[var(--taav-text-muted)]">{data.sources.length === 0 ? "هنوز منبعی برای این برند ثبت نشده است." : "منبعی مطابق جستجو و فیلترهای انتخاب‌شده پیدا نشد."}</div> : null}
      </section>
      <AddBrandIntroductionDialog businessId={data.businessId} brandId={data.brandId} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </main>
  );
}
