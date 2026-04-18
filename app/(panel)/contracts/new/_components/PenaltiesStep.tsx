'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Settings2 } from 'lucide-react';
import { FormBox } from './FormBox';
import { PENALTY_ITEMS } from './penaltiesConfig';

export function PenaltiesStep({ title }: { stepId: string; title: string }) {
  const router = useRouter();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-gray-500">برای هر نوع جریمه، روش محاسبه، دوره زمانی و هزینه دیرکرد را به‌صورت مستقل تنظیم کنید.</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/contracts/new')}
          className="rounded-md border border-gray-300 px-3.5 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
        >
          بازگشت به مراحل
        </button>
      </div>

      <FormBox
        title="تعریف جرایم قرارداد"
        description="آیتم‌های زیر مشابه نمونه ارسالی طراحی شده‌اند و هر مورد صفحه تنظیمات اختصاصی با تب‌های محاسباتی یکسان دارد."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {PENALTY_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={`/contracts/new/penalties/${item.id}`}
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
                <ChevronLeft className="mt-1 h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:-translate-x-1 group-hover:text-cyan-600" />
              </div>
            </Link>
          ))}
        </div>
      </FormBox>
    </div>
  );
}
