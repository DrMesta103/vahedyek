"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Archive, ArrowLeft, BookOpenText, Check, MoreVertical, PencilLine, Plus, RotateCcw, Search, Settings2, XCircle } from "lucide-react";
import { TaavBadge, TaavButton, TaavCard, TaavDropdown, TaavDropdownContent, TaavDropdownItem, TaavDropdownTrigger } from "@repo/ui/taav";
import { TaavEmptyState } from "@repo/ui/taav/data-display";
import type { TaaviaBrand } from "@/app/lib/types/domain";
import { CreateBrandDialog } from "@/components/taavia/CreateBrandDialog";

const statusLabels = { ACTIVE: "فعال", INACTIVE: "غیرفعال", ARCHIVED: "آرشیوشده" } as const;
const setupLabels = { NOT_SELECTED: "راه‌اندازی نشده", MANUAL: "دستی", AI_ASSISTED: "با کمک AI" } as const;

export function TaaviaBrandsClient({ tenantId, initialBrands }: { tenantId: string; initialBrands: TaaviaBrand[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TaaviaBrand | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | TaaviaBrand["status"]>("ALL");
  const [brands, setBrands] = useState(initialBrands);
  const [busyId, setBusyId] = useState<string | null>(null);
  const router = useRouter();

  const filtered = useMemo(() => brands.filter((brand) => (status === "ALL" || brand.status === status) && `${brand.name} ${brand.description ?? ""}`.toLocaleLowerCase().includes(search.toLocaleLowerCase())), [brands, search, status]);
  const mutateStatus = async (brand: TaaviaBrand, nextStatus: TaaviaBrand["status"]) => {
    if (nextStatus === "ARCHIVED" && !window.confirm(`برند «${brand.name}» آرشیو می‌شود و دیگر برای عملیات جدید قابل استفاده نخواهد بود.`)) return;
    setBusyId(brand.id);
    try {
      const response = await fetch(`/api/businesses/${tenantId}/taavia/brands/${brand.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      const payload = (await response.json().catch(() => null)) as { brand?: TaaviaBrand } | null;
      if (response.ok && payload?.brand) setBrands((current) => current.map((item) => (item.id === brand.id ? payload.brand! : item)));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div dir="rtl" className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm text-[var(--taav-text-muted)]">مدیریت هویت‌های تاویا</div>
          <h2 className="mt-1 text-2xl font-black text-[var(--taav-text-strong)]">
            برندها <span className="text-base font-medium text-[var(--taav-text-muted)]">({brands.length})</span>
          </h2>
          <p className="mt-2 text-sm text-[var(--taav-text-muted)]">پروفایل برند، وضعیت راه‌اندازی و تنظیمات مدل‌های هوش مصنوعی را مدیریت کنید.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/businesses/${tenantId}/products/taavia`}>
            <TaavButton variant="secondary" iconStart={<ArrowLeft className="h-4 w-4" />}>
              بازگشت
            </TaavButton>
          </Link>
          <TaavButton
            iconStart={<Plus className="h-4 w-4" />}
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            ایجاد برند
          </TaavButton>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 rounded-2xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-3">
        <label className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--taav-text-muted)]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جست‌وجوی نام یا توضیح برند" className="min-h-11 w-full rounded-xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface-soft)] pr-10 pl-3 text-sm text-[var(--taav-text-strong)] outline-none focus:ring-2 focus:ring-[var(--taav-brand)]" />
        </label>
        <div className="flex flex-wrap gap-2">
          {(["ALL", "ACTIVE", "INACTIVE", "ARCHIVED"] as const).map((item) => (
            <button key={item} type="button" onClick={() => setStatus(item)} className={`min-h-11 rounded-xl px-4 text-sm transition ${status === item ? "bg-[var(--taav-brand)] text-white" : "bg-[var(--taav-surface-soft)] text-[var(--taav-text-muted)] hover:text-[var(--taav-text-strong)]"}`}>
              {item === "ALL" ? "همه" : statusLabels[item]}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <TaavCard variant="outlined" padding="lg" radius="xl">
          <TaavEmptyState
            title={brands.length === 0 ? "هنوز برندی ساخته نشده است." : "نتیجه‌ای پیدا نشد."}
            description={brands.length === 0 ? "برای شروع، اولین برند تاویا را ایجاد کنید." : "فیلتر یا عبارت جست‌وجو را تغییر دهید."}
            primaryAction={
              brands.length === 0 ? (
                <TaavButton
                  onClick={() => {
                    setEditing(null);
                    setDialogOpen(true);
                  }}
                  iconStart={<Plus className="h-4 w-4" />}
                >
                  ایجاد برند
                </TaavButton>
              ) : undefined
            }
          />
        </TaavCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((brand) => (
            <article key={brand.id} className="group rounded-3xl border border-[var(--taav-border-subtle)] bg-[var(--taav-surface)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--taav-brand)]">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/businesses/${tenantId}/products/taavia/brands/${brand.id}/entry`} className="flex min-w-0 items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--taav-brand-soft)] text-lg font-black text-[var(--taav-brand-strong)]">{brand.icon?.previewData ? <img src={brand.icon.previewData} alt="" className="h-full w-full object-cover" /> : brand.name.slice(0, 2)}</div>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-[var(--taav-text-strong)]">{brand.name}</h3>
                    <p className="mt-1 truncate text-xs text-[var(--taav-text-muted)]">{brand.description || "بدون توضیح"}</p>
                  </div>
                </Link>
                <TaavDropdown>
                  <TaavDropdownTrigger asChild>
                    <button type="button" className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--taav-text-muted)] hover:bg-[var(--taav-surface-soft)]" aria-label={`عملیات ${brand.name}`}>
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </TaavDropdownTrigger>
                  <TaavDropdownContent align="end">
                    <TaavDropdownItem iconStart={<BookOpenText className="h-4 w-4" />} onClick={() => router.push(`/businesses/${tenantId}/products/taavia/brands/${brand.id}/test`)}>
                      مدیریت نالج‌بیس
                    </TaavDropdownItem>
                    <TaavDropdownItem iconStart={<Settings2 className="h-4 w-4" />} onClick={() => router.push(`/businesses/${tenantId}/products/taavia/brands/${brand.id}/model-settings`)}>
                      تنظیمات مدل
                    </TaavDropdownItem>
                    <TaavDropdownItem
                      iconStart={<PencilLine className="h-4 w-4" />}
                      onClick={() => {
                        setEditing(brand);
                        setDialogOpen(true);
                      }}
                    >
                      ویرایش
                    </TaavDropdownItem>
                    {brand.status === "ACTIVE" ? (
                      <TaavDropdownItem iconStart={<XCircle className="h-4 w-4" />} onClick={() => void mutateStatus(brand, "INACTIVE")}>
                        غیرفعال‌سازی
                      </TaavDropdownItem>
                    ) : brand.status === "INACTIVE" ? (
                      <TaavDropdownItem iconStart={<Check className="h-4 w-4" />} onClick={() => void mutateStatus(brand, "ACTIVE")}>
                        فعال‌سازی
                      </TaavDropdownItem>
                    ) : (
                      <TaavDropdownItem iconStart={<RotateCcw className="h-4 w-4" />} onClick={() => void mutateStatus(brand, "ACTIVE")}>
                        بازگردانی
                      </TaavDropdownItem>
                    )} {brand.status !== "ARCHIVED" ? (
                      <TaavDropdownItem
                        tone="danger"
                        iconStart={<Archive className="h-4 w-4" />}
                        onSelect={(event) => {
                          event.preventDefault();
                          void mutateStatus(brand, "ARCHIVED");
                        }}
                      >
                        آرشیو برند
                      </TaavDropdownItem>
                    ) : null}
                  </TaavDropdownContent>
                </TaavDropdown>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <TaavBadge tone={brand.status === "ACTIVE" ? "success" : brand.status === "ARCHIVED" ? "neutral" : "warning"} variant="soft">
                  {statusLabels[brand.status]}
                </TaavBadge>
                <span className="rounded-full bg-[var(--taav-surface-soft)] px-2.5 py-1 text-xs text-[var(--taav-text-muted)]">{setupLabels[brand.setupMode]}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--taav-border-subtle)] pt-4 text-xs text-[var(--taav-text-muted)]">
                <span>ایجاد: {new Date(brand.createdAt).toLocaleDateString("fa-IR")}</span>
                <span>ویرایش: {new Date(brand.updatedAt).toLocaleDateString("fa-IR")}</span>
              </div>
              {busyId === brand.id ? <div className="mt-3 text-xs text-[var(--taav-brand-strong)]">در حال به‌روزرسانی…</div> : null}
            </article>
          ))}
        </div>
      )}
      <CreateBrandDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tenantId={tenantId}
        mode={editing ? "edit" : "create"}
        initialBrand={editing}
        onSaved={(brandId) => {
          setDialogOpen(false);
          if (!editing) router.push(`/businesses/${tenantId}/products/taavia/brands/${brandId}/entry`);
          else router.refresh();
        }}
      />
    </div>
  );
}
