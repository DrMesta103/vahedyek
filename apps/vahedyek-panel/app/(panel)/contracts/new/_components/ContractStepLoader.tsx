'use client';

export function ContractStepLoader({
  title,
  description = 'در حال بارگذاری اطلاعات قرارداد...',
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-sm">
      <div className="animate-pulse space-y-5">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded-lg bg-slate-200" />
          <div className="h-4 w-80 max-w-full rounded-lg bg-slate-100" />
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="h-5 w-40 rounded-lg bg-slate-200" />
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="h-11 rounded-xl bg-white" />
              <div className="h-11 rounded-xl bg-white" />
              <div className="h-11 rounded-xl bg-white" />
              <div className="h-11 rounded-xl bg-white" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="h-5 w-32 rounded-lg bg-slate-200" />
            <div className="mt-4 grid gap-3">
              <div className="h-11 rounded-xl bg-white" />
              <div className="h-11 rounded-xl bg-white" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-teal-500" />
          <span>{description || title}</span>
        </div>
      </div>
    </div>
  );
}
