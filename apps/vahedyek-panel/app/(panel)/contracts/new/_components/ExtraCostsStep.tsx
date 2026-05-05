export function ExtraCostsStep({ title }: { title: string }) {
  return (
    <div className="space-y-5" dir="rtl">
      <div className="text-right">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>
      <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/40 px-6 py-16 text-center">
        <p className="text-sm font-bold text-slate-700">در حال توسعه</p>
      </div>
    </div>
  );
}
