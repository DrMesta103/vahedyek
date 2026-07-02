
'use client';

import { useRouter } from 'next/navigation';
import { useContractFlowBasePath } from './useContractFlowBasePath';

export function PlaceholderStep({ stepId, title, embedded = false }: { stepId: string, title: string, embedded?: boolean }) {
  const router = useRouter();
  const basePath = useContractFlowBasePath();
  const handleBack = () => router.push(basePath);

  return (
    <div className="space-y-5">
        {!embedded ? <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="mt-1 text-gray-500">این بخش هنوز در حال تکمیل است و به‌زودی در دسترس قرار می‌گیرد.</p>
            </div>
            <button type="button" onClick={handleBack} className="rounded-[8px] border px-3.5 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                بازگشت به مرحله قبل
            </button>
        </div> : null}

        <div className="rounded-[8px] border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-700">مرحله در حال آماده‌سازی</h3>
            <p className="mt-2 text-sm text-gray-500">
                این بخش برای "{title}" هنوز کامل نشده است و به‌زودی تکمیل می‌شود.
            </p>
        </div>
    </div>
  );
}

