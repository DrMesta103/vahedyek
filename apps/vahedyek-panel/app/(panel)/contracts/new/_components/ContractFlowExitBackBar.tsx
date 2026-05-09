'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { getActiveDraftId } from '../../../../lib/contractDraftClient';

/** مسیر خروج از فلو ثبت/ویرایش قرارداد (بدون رفرش). */
export function getContractFlowExitPath(pathname: string | null): string {
  const base = pathname ?? '';
  if (base.startsWith('/draft-templates')) return '/draft-templates';
  const draftId = getActiveDraftId();
  if (draftId) return `/contracts/${encodeURIComponent(draftId)}`;
  return '/contracts';
}

type ContractFlowExitBackBarProps = {
  /** flow: ستون مرکزی هاب با padding قرارداد جدید؛ page: مسیر تک‌صفحه مثل `/contracts/new/parties` */
  layout?: 'flow' | 'page';
  /** اگر ست شود از آن برای خروج استفاده می‌شود (مثلاً هشدار قبل از ترک با تغییرات ذخیره‌نشده). */
  onNavigate?: () => void;
};

/** خروج از فلو قرارداد: اولویت با جزئیات همان پیش‌نویس، بعد فهرست قراردادها / قالب. */
export function ContractFlowExitBackBar({ layout = 'flow', onNavigate }: ContractFlowExitBackBarProps) {
  const router = useRouter();
  const pathname = usePathname() ?? '';

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
      return;
    }
    router.push(getContractFlowExitPath(pathname));
  };

  const shellClass =
    layout === 'flow'
      ? 'sticky top-0 z-20 -mx-6 mb-4 border-b border-gray-200/80 bg-[var(--surface)]/98 px-6 py-3 backdrop-blur-sm'
      : 'mb-5 border-b border-slate-200/80 pb-4';

  return (
    <div className={shellClass} dir="rtl">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-sm transition hover:border-[color-mix(in_srgb,var(--dark-teal)_35%,transparent)] hover:bg-slate-50"
      >
        بازگشت
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
