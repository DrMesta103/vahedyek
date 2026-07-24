"use client";
export default function ErrorState({ reset }: { reset: () => void }) {
  return (
    <div dir="rtl" className="mx-auto max-w-xl rounded-2xl border border-rose-400/30 bg-rose-400/10 p-6 text-right">
      <h2 className="m-0 font-bold">بارگذاری منابع برند انجام نشد</h2>
      <p className="mt-2 text-sm">لطفاً دوباره تلاش کنید.</p>
      <button onClick={reset} className="rounded-lg border border-rose-300/40 px-3 py-2 text-sm">
        تلاش دوباره
      </button>
    </div>
  );
}
