'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Info, Layers, Loader2, RefreshCw } from 'lucide-react';
import {
  TaavButton,
  TaavDialog,
  TaavDialogContent,
  TaavDialogDescription,
  TaavDialogFooter,
  TaavDialogHeader,
  TaavDialogTitle,
} from '@repo/ui/taav';
import {
  startKnowledgeBaseNewVersionAction,
  startKnowledgeBaseRebuildAction,
} from '@/app/businesses/[businessId]/products/taavia/brands/[brandId]/knowledge-base/actions';
import type { KnowledgeBaseCategoryUpdateStatus } from '@/app/lib/types/taavia-knowledge-base-category-details';

const VERSION_RETENTION_NOTE =
  'سیستم بیشتر از ۵ نسخه نگه نمی‌دارد و نسخه‌های قدیمی‌تر را حذف می‌کند.';

type ConfirmKind = 'rebuild' | 'newVersion' | null;

export function KnowledgeBaseBuildActions({
  businessId,
  brandId,
  knowledgeBaseId,
  update,
  isActive = false,
  buildInProgress = false,
  activeBuildId = null,
  showStatusChip = true,
  pendingCategoryEdits = false,
}: {
  businessId: string;
  brandId: string;
  knowledgeBaseId: string;
  update: KnowledgeBaseCategoryUpdateStatus | null;
  isActive?: boolean;
  buildInProgress?: boolean;
  activeBuildId?: string | null;
  showStatusChip?: boolean;
  pendingCategoryEdits?: boolean;
}) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const [pendingEditsWarn, setPendingEditsWarn] = useState<ConfirmKind>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canAct = Boolean(update) && isActive && !buildInProgress && !pending;
  const needsUpdate = Boolean(update && !update.isSynchronized);
  const progressHref = `/businesses/${businessId}/products/taavia/brands/${brandId}/knowledge-base/categories`;

  function requestAction(kind: 'rebuild' | 'newVersion') {
    if (pendingCategoryEdits) {
      setPendingEditsWarn(kind);
      return;
    }
    setConfirm(kind);
  }

  function runAction(kind: 'rebuild' | 'newVersion') {
    setError(null);
    setConfirm(null);
    setPendingEditsWarn(null);
    startTransition(async () => {
      try {
        if (kind === 'rebuild') {
          await startKnowledgeBaseRebuildAction({ businessId, brandId, knowledgeBaseId });
        } else {
          await startKnowledgeBaseNewVersionAction({ businessId, brandId, knowledgeBaseId });
        }
        router.refresh();
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : 'شروع عملیات ناموفق بود.');
        router.refresh();
      }
    });
  }

  if (!update) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {showStatusChip ? (
          <div
            className={`inline-flex max-w-xs items-center gap-2 rounded-lg border px-3 py-2 text-xs leading-6 ${
              needsUpdate
                ? 'border-amber-400/40 bg-amber-500/10 text-amber-100'
                : update.isSynchronized
                  ? 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100'
                  : 'border-sky-400/30 bg-sky-500/[0.08] text-sky-200'
            }`}
          >
            {update.isSynchronized ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Info className="h-4 w-4 shrink-0" />}
            <span className="min-w-0">{update.reason}</span>
          </div>
        ) : null}

        {buildInProgress && activeBuildId ? (
          <Link
            href={progressHref}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-3 text-xs font-bold text-cyan-100 transition hover:bg-cyan-500/20"
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            مشاهده پیشرفت بیلد
          </Link>
        ) : null}

        {canAct ? (
          <>
            <button
              type="button"
              onClick={() => requestAction('rebuild')}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-rose-400/45 bg-rose-500/10 px-3 text-xs font-bold text-rose-200 transition hover:bg-rose-500/20"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              ریبلد
            </button>
            <button
              type="button"
              onClick={() => requestAction('newVersion')}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition ${
                needsUpdate
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              بیلد نسخهٔ جدید
            </button>
          </>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="m-0 text-xs text-rose-300">
          {error}
        </p>
      ) : null}

      <TaavDialog
        open={pendingEditsWarn !== null}
        onOpenChange={(open) => {
          if (!open && !pending) setPendingEditsWarn(null);
        }}
      >
        <TaavDialogContent size="sm" contentClassName="ai-lab-dialog" dir="rtl">
          <TaavDialogHeader>
            <TaavDialogTitle className="text-right text-lg font-black">تغییرات دسته‌بندی ارسال نشده</TaavDialogTitle>
            <TaavDialogDescription className="mt-2 text-right text-sm leading-7">
              در دسته‌بندی‌ها تغییراتی داده‌اید که هنوز با «ارسال دسته‌بندی‌ها به AI» اعمال نشده‌اند.
              اگر الان {pendingEditsWarn === 'rebuild' ? 'ریبلد' : 'بیلد نسخهٔ جدید'} را ادامه دهید، این تغییرات دستی در بیلد اعمال نمی‌شوند.
            </TaavDialogDescription>
          </TaavDialogHeader>
          <TaavDialogFooter>
            <TaavButton size="sm" variant="secondary" disabled={pending} onClick={() => setPendingEditsWarn(null)}>
              انصراف
            </TaavButton>
            <TaavButton
              size="sm"
              tone="danger"
              disabled={pending || !pendingEditsWarn}
              onClick={() => {
                if (!pendingEditsWarn) return;
                setConfirm(pendingEditsWarn);
                setPendingEditsWarn(null);
              }}
            >
              ادامه بدون اعمال
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>

      <TaavDialog open={confirm === 'rebuild'} onOpenChange={(open) => { if (!open && !pending) setConfirm(null); }}>
        <TaavDialogContent size="sm" contentClassName="ai-lab-dialog" dir="rtl">
          <TaavDialogHeader>
            <TaavDialogTitle className="text-right text-lg font-black">ریبلد همین نسخه</TaavDialogTitle>
            <TaavDialogDescription className="mt-2 text-right text-sm leading-7">
              با ریبلد، محتوای نسخهٔ فعلی با منابع کنونی دوباره ساخته می‌شود و شمارهٔ نسخه عوض نمی‌شود.
              این کار قابل بازگشت نیست و نسخهٔ فعلی با بیلد جدید جایگزین می‌شود.
              <br />
              <span className="mt-2 block text-[var(--taav-text-muted)]">{VERSION_RETENTION_NOTE}</span>
            </TaavDialogDescription>
          </TaavDialogHeader>
          <TaavDialogFooter>
            <TaavButton size="sm" variant="secondary" disabled={pending} onClick={() => setConfirm(null)}>
              انصراف
            </TaavButton>
            <TaavButton size="sm" tone="danger" disabled={pending} onClick={() => runAction('rebuild')} iconStart={<RefreshCw className="h-4 w-4" />}>
              {pending ? 'در حال شروع…' : 'ریبلد همین نسخه'}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>

      <TaavDialog open={confirm === 'newVersion'} onOpenChange={(open) => { if (!open && !pending) setConfirm(null); }}>
        <TaavDialogContent size="sm" contentClassName="ai-lab-dialog" dir="rtl">
          <TaavDialogHeader>
            <TaavDialogTitle className="text-right text-lg font-black">ساخت نسخهٔ جدید</TaavDialogTitle>
            <TaavDialogDescription className="mt-2 text-right text-sm leading-7">
              با منابع فعلی یک نسخهٔ جدید ساخته می‌شود و نسخهٔ قبلی به‌صورت غیرفعال در دسترس می‌ماند.
              <br />
              <span className="mt-2 block text-[var(--taav-text-muted)]">{VERSION_RETENTION_NOTE}</span>
            </TaavDialogDescription>
          </TaavDialogHeader>
          <TaavDialogFooter>
            <TaavButton size="sm" variant="secondary" disabled={pending} onClick={() => setConfirm(null)}>
              انصراف
            </TaavButton>
            <TaavButton size="sm" disabled={pending} onClick={() => runAction('newVersion')} iconStart={<Layers className="h-4 w-4" />}>
              {pending ? 'در حال شروع…' : 'ساخت نسخهٔ جدید'}
            </TaavButton>
          </TaavDialogFooter>
        </TaavDialogContent>
      </TaavDialog>
    </>
  );
}
