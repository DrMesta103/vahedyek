'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Layers3, Tags } from 'lucide-react';
import {
  DISCOUNT_GROUPS,
  ITEMIZED_DISCOUNT_ENTRIES,
  WHOLE_DISCOUNT_ENTRY,
  getDiscountGroup,
  type DiscountScope,
} from './discountsConfig';
import { useContractFlowBasePath } from './useContractFlowBasePath';

function ConfirmModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="space-y-4 p-6 text-right">
          <h3 className="text-3xl font-bold text-gray-900">تغییر بخش و غیرفعال‌سازی</h3>
          <p className="text-sm leading-7 text-gray-600">
            با تایید این عملیات، تنظیمات بخش فعلی غیرفعال شده و تب بعدی به‌عنوان حالت فعال در نظر گرفته می‌شود.
          </p>
        </div>
        <div className="flex items-center justify-end gap-6 border-t border-gray-100 px-6 py-5">
          <button type="button" onClick={onClose} className="text-base font-semibold text-gray-400">
            لغو
          </button>
          <button type="button" onClick={onConfirm} className="text-base font-semibold text-rose-500">
            تایید
          </button>
        </div>
      </div>
    </div>
  );
}

function ScopeTab({
  title,
  description,
  icon,
  active,
  inactive,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  inactive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[132px] flex-col items-center justify-center gap-4 px-4 py-6 text-center transition ${
        active ? 'bg-cyan-50 text-cyan-700' : 'bg-white text-gray-500 hover:bg-gray-50'
      }`}
    >
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-full border ${
          active ? 'border-cyan-200 bg-white text-cyan-700' : 'border-gray-300 text-gray-500'
        }`}
      >
        {icon}
      </span>
      <div className="space-y-1">
        <div className="text-sm font-bold">{title}</div>
        <div className="text-xs leading-6 text-gray-500">{description}</div>
        <div className={`text-xs font-semibold ${active ? 'text-cyan-700' : inactive ? 'text-gray-400' : 'text-gray-500'}`}>
          {active ? 'فعال' : inactive ? 'غیرفعال' : 'آماده تنظیم'}
        </div>
      </div>
    </button>
  );
}

export function DiscountFlowStep({ discountId }: { discountId: string }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const discountGroup = getDiscountGroup(discountId);
  const [activeScope, setActiveScope] = useState<DiscountScope>('whole');
  const [pendingScope, setPendingScope] = useState<DiscountScope | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const items = useMemo(
    () => (activeScope === 'whole' ? [WHOLE_DISCOUNT_ENTRY] : ITEMIZED_DISCOUNT_ENTRIES),
    [activeScope],
  );

  const handleScopeClick = (scope: DiscountScope) => {
    if (scope === activeScope) return;
    setPendingScope(scope);
    setConfirmOpen(true);
  };

  const confirmScopeChange = () => {
    if (pendingScope) {
      setActiveScope(pendingScope);
    }
    setPendingScope(null);
    setConfirmOpen(false);
  };

  if (!discountGroup) {
    return (
      <div className="rounded-[8px] border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">
        آیتم تخفیف موردنظر پیدا نشد.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => router.push(`${basePath}/discounts`)}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
              بازگشت به لیست تخفیف‌ها
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{discountGroup.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-600">{discountGroup.description}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[8px] border border-gray-200 bg-white text-right shadow-sm">
          <div className="grid gap-px bg-gray-200 md:grid-cols-2" dir="rtl">
            <ScopeTab
              title="تخفیف روی کل قرارداد"
              description="اعمال تنظیمات تخفیف روی تمامی سررسیدها و پرداخت‌های قرارداد."
              icon={<Tags className="h-7 w-7" />}
              active={activeScope === 'whole'}
              inactive={activeScope !== 'whole'}
              onClick={() => handleScopeClick('whole')}
            />
            <ScopeTab
              title="تخفیف موردی قرارداد"
              description="تنظیم تخفیف برای موارد جزئی قرارداد به‌صورت مستقل."
              icon={<Layers3 className="h-7 w-7" />}
              active={activeScope === 'itemized'}
              inactive={activeScope !== 'itemized'}
              onClick={() => handleScopeClick('itemized')}
            />
          </div>

          <div className="space-y-4 p-6 md:p-8">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`${basePath}/discounts/${discountId}/${activeScope}/${item.id}`}
                className="group block rounded-[8px] border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-cyan-300 hover:bg-cyan-50/30 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-gray-900">{item.title}</div>
                    <div className="text-sm leading-6 text-gray-600">{item.description}</div>
                  </div>
                  <ChevronLeft className="mt-1 h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:-translate-x-1 group-hover:text-cyan-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setPendingScope(null);
        }}
        onConfirm={confirmScopeChange}
      />
    </>
  );
}


