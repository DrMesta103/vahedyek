'use client';

export function RotateShiftComingSoonModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black/65" onClick={onClose}>
      <div
        className="fixed left-1/2 top-1/2 z-[111] w-[min(100%-2rem,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-slate-900 p-5 text-right text-slate-100 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="text-lg font-black text-white">شیفت چرخشی</div>
        <p className="mt-3 text-sm leading-7 text-slate-300">این قابلیت به‌زودی اضافه می‌شود.</p>
        <p className="mt-2 text-xs leading-6 text-slate-400">
          زیرساخت این بخش آماده است، اما تعریف و مدیریت شیفت‌های چرخشی در نسخه‌های بعدی فعال خواهد شد.
        </p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-400"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
}
