
'use client';

import { useRouter } from 'next/navigation';

export function PlaceholderStep({ stepId, title }: { stepId: string, title: string }) {
  const router = useRouter();
  const handleBack = () => router.push('/contracts/new');

  return (
    <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold">{title}</h1>
                <p className="mt-1 text-gray-500">این بخش از قرارداد در حال حاضر در دست توسعه است.</p>
            </div>
            <button type="button" onClick={handleBack} className="rounded-md border px-3.5 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50">
                بازگشت به مراحل
            </button>
        </div>

        <div className="rounded-lg border-2 border-dashed border-gray-200 bg-white p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-700">در حال توسعه</h3>
            <p className="mt-2 text-sm text-gray-500">
                فرم و فیلدهای مربوط به مرحله "{title}" به زودی پیاده‌سازی خواهند شد.
            </p>
        </div>
    </div>
  );
}
