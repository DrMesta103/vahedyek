export default function Loading() {
  return (
    <div dir="rtl" className="mx-auto max-w-[1500px] animate-pulse space-y-4 p-6">
      <div className="h-24 rounded-2xl bg-slate-800/60" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-24 rounded-xl bg-slate-800/60" />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-slate-800/60" />
    </div>
  );
}
