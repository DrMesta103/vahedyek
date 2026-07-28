"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, LayoutDashboard, RefreshCw } from "lucide-react";
import { TaavButton, TaavCard } from "@repo/ui/taav/primitives";
import type { InitialBuildReadModel } from "@/app/lib/services/taavia-knowledge-base-read-service";
import { simulateBuildAction } from "@/app/businesses/[businessId]/products/taavia/brands/[brandId]/knowledge-base/actions";

type SimulatedAction = "advance" | "fail" | "retry" | "completeAll" | "cancel" | "reset";

export function InitialKnowledgeBuildPanel({ businessId, brandId, build }: { businessId: string; brandId: string; build: InitialBuildReadModel }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const status = build.steps.find((step) => step.status === "IN_PROGRESS");
  const brandBase = `/businesses/${businessId}/products/taavia/brands/${brandId}`;

  const action = (kind: SimulatedAction) => start(async () => {
    await simulateBuildAction({ businessId, brandId, buildId: build.id, action: kind });
    router.refresh();
  });

  return (
    <TaavCard variant="outlined" padding="md" radius="xl" wrapperClassName="border-[var(--taav-brand)]/50">
      <div dir="rtl" className="grid gap-4 text-right">
        <div>
          <h2 className="m-0 text-xl font-black">در حال ساخت <bdi dir="ltr">Knowledge Base</bdi></h2>
          <p className="mt-1 text-sm text-[var(--taav-text-muted)]">ساخت اولیه · {build.status} · شروع: <bdi dir="ltr">{build.startedAt}</bdi> · {build.sourceCount} منبع</p>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[var(--taav-surface-soft)]">
          <div className="h-full bg-[var(--taav-brand)]" style={{ width: `${build.progress}%` }} />
        </div>
        <div className="grid gap-2 md:grid-cols-6">
          {build.steps.map((step) => (
            <div key={step.key} className={`rounded-lg border p-2 text-xs ${step.status === "COMPLETED" ? "border-emerald-500/60 text-emerald-500" : step.status === "IN_PROGRESS" ? "border-[var(--taav-brand)] text-[var(--taav-brand-strong)]" : step.status === "FAILED" ? "border-red-500/70 text-red-500" : "border-[var(--taav-border-subtle)] text-[var(--taav-text-muted)]"}`}>
              <strong>{step.label}</strong><br />{step.status}
            </div>
          ))}
        </div>
        <p className="m-0 text-sm">مرحله فعلی: {status?.label ?? "—"}{build.failureMessage ? ` — ${build.failureMessage}` : ""}</p>

        <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--taav-border-subtle)] pt-3" aria-label="ادامه مسیر ساخت دانشنامه">
          <TaavButton size="sm" variant="secondary" disabled={pending} onClick={() => router.refresh()} iconStart={<RefreshCw className="h-4 w-4" />}>
            تازه‌سازی وضعیت ساخت
          </TaavButton>
          <Link href={`${brandBase}/sources`}>
            <TaavButton size="sm" variant="secondary" iconStart={<FolderOpen className="h-4 w-4" />}>
              مدیریت منابع برند
            </TaavButton>
          </Link>
          <Link href={brandBase}>
            <TaavButton size="sm" iconStart={<LayoutDashboard className="h-4 w-4" />}>
              ادامه در فضای کاری برند
            </TaavButton>
          </Link>
        </div>

        {process.env.NODE_ENV !== "production" ? (
          <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--taav-border-subtle)] pt-3">
            <TaavButton disabled={pending || build.status !== "PROCESSING"} size="sm" onClick={() => action("advance")}>تکمیل مرحله فعلی</TaavButton>
            <TaavButton disabled={pending || build.status !== "PROCESSING"} size="sm" onClick={() => action("completeAll")}>تکمیل کل Build</TaavButton>
            <TaavButton disabled={pending || build.status !== "PROCESSING"} size="sm" variant="secondary" onClick={() => action("fail")}>شکست مرحله فعلی</TaavButton>
            <TaavButton disabled={pending || build.status !== "FAILED"} size="sm" variant="secondary" onClick={() => action("retry")}>تلاش مجدد</TaavButton>
            <TaavButton disabled={pending || !["PROCESSING", "FAILED"].includes(build.status)} size="sm" variant="secondary" onClick={() => action("cancel")}>لغو Build</TaavButton>
            <TaavButton disabled={pending || build.status === "COMPLETED"} size="sm" variant="secondary" onClick={() => action("reset")}>بازنشانی شبیه‌سازی</TaavButton>
          </div>
        ) : null}
      </div>
    </TaavCard>
  );
}
