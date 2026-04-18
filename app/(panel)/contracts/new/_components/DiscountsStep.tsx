'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Settings2, Tags } from 'lucide-react';
import { FormBox } from './FormBox';
import { DISCOUNT_GROUPS } from './discountsConfig';
import { useContractFlowBasePath } from './useContractFlowBasePath';

export function DiscountsStep({ title }: { stepId: string; title: string }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-gray-500">مدیریت تخفیف‌های قراردادی و مشوق‌های پرداخت زودتر از موعد در این بخش انجام می‌شود.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push(basePath)}
          className="rounded-md border border-gray-300 px-3.5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
        >
          بازگشت به مراحل
        </button>
      </div>

      <FormBox
        title="تعریف تخفیف‌های قرارداد"
        description="برای هر نوع تخفیف، می‌توانید تنظیمات مربوط به کل قرارداد یا موارد جزئی را به‌صورت مجزا ثبت و مدیریت کنید."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {DISCOUNT_GROUPS.map((item) => (
            <Link
              key={item.id}
              href={`${basePath}/discounts/${item.id}`}
              className="group rounded-2xl border border-gray-200 bg-white p-5 text-gray-900 shadow-sm transition-all hover:border-cyan-300 hover:bg-cyan-50/40 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{item.title}</h2>
                    {item.configured && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs text-cyan-700">
                        <Settings2 className="h-3.5 w-3.5" />
                        تنظیمات انجام‌شده
                      </span>
                    )}
                  </div>
                  <p className="max-w-xl text-sm leading-6 text-gray-600">{item.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-100 bg-cyan-50 text-cyan-600">
                    <Tags className="h-5 w-5" />
                  </span>
                  <ChevronLeft className="mt-1 h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:-translate-x-1 group-hover:text-cyan-600" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </FormBox>
    </div>
  );
}
