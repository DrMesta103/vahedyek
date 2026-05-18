'use client';

import { ArrowLeft, MapPin, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { saveLocationFromQuickSetupAction } from '../../../lib/actions';
import type { LocationSummaryItem } from './quick-setup.types';

type Step1LocationProps = {
  isCompleted: boolean;
  initialLocation: LocationSummaryItem | null;
  onBack: () => void;
  onComplete: (value: LocationSummaryItem) => void;
};

export default function Step1Location({ isCompleted, initialLocation, onBack, onComplete }: Step1LocationProps) {
  const [title, setTitle] = useState(initialLocation?.title ?? 'کارگاه');
  const [radius, setRadius] = useState(initialLocation?.radius ?? 50);
  const [search, setSearch] = useState('');
  const [lat, setLat] = useState<number | null>(35.6997);
  const [lng, setLng] = useState<number | null>(51.338);
  const [saving, setSaving] = useState(false);

  const selectedLocationLabel = useMemo(() => {
    if (lat == null || lng == null) return 'هنوز نقطه ای روی نقشه انتخاب نشده است';
    return `نقطه انتخابی: ${lat.toFixed(4)} , ${lng.toFixed(4)}`;
  }, [lat, lng]);

  const pickMap = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setLat(Number((35.86 - y * (35.86 - 35.58)).toFixed(6)));
    setLng(Number((51.21 + x * (51.62 - 51.21)).toFixed(6)));
  };

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set('title', title.trim());
      formData.set('radius', String(radius || 50));
      formData.set('address', search.trim() || selectedLocationLabel);
      formData.set('description', 'توضیحات ثبت نشده است');
      if (lat != null) formData.set('latitude', String(lat));
      if (lng != null) formData.set('longitude', String(lng));
      const saved = await saveLocationFromQuickSetupAction(formData);
      onComplete(saved);
    } catch (error) {
      throw error;
    } finally {
      setSaving(false);
    }
  };

  if (isCompleted && initialLocation) {
    return (
      <section className="rounded-2xl border border-white/10 bg-slate-800/65 p-3.5 sm:p-4">
        <div className="rounded-xl border border-white/10 bg-slate-950/45 p-4 sm:p-5">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full rounded-xl border border-white/10 bg-slate-900/70 p-4 text-right lg:max-w-[260px]">
              <div className="text-lg font-bold text-white">عنوان: {initialLocation.title}</div>
              <div className="mt-3 text-sm text-slate-300">توضیحات: {initialLocation.description || 'توضیحات ثبت نشده است'}</div>
              <div className="mt-2 text-sm text-slate-300">شعاع مجاز: {initialLocation.radius} متر</div>
            </div>
          </div>
          <a href="/locations" className="mt-5 flex w-full items-center justify-center rounded-lg bg-indigo-600 px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500">
            برای مدیریت کامل محل های کار، کلیک کنید تا به فهرست محل های کار بروید.
          </a>
        </div>
        <div className="mt-5 flex">
          <button type="button" onClick={onBack} className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white transition-colors hover:bg-indigo-500">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-800/65 p-3.5 sm:p-4">
      <div className="rounded-xl border border-white/10 bg-slate-950/45 p-4 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
          <div className="order-2 rounded-xl bg-stone-200 p-2.5 lg:order-1">
            <div className="relative h-full min-h-[280px] overflow-hidden rounded-xl border border-slate-300 bg-[linear-gradient(180deg,#f6f5f3,#dddddd)]">
              <div className="absolute left-3 right-3 top-3 z-10 flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2.5 text-white shadow-lg">
                <Search className="h-4 w-4 text-slate-300" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجو" className="w-full bg-transparent text-right text-sm text-white outline-none placeholder:text-slate-400" />
              </div>
              <button type="button" onClick={pickMap} className="relative h-full w-full">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(99,102,241,0.10),transparent_15%),linear-gradient(45deg,transparent_48%,rgba(148,163,184,0.18)_49%,transparent_50%),linear-gradient(-45deg,transparent_48%,rgba(148,163,184,0.12)_49%,transparent_50%)] bg-[length:100%_100%,48px_48px,48px_48px]" />
                <MapPin className="absolute left-1/2 top-[45%] h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-indigo-600" />
                <div className="absolute bottom-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg"><Plus className="h-4 w-4" /></div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg"><Search className="h-4 w-4" /></div>
                </div>
              </button>
            </div>
          </div>

          <div className="order-1 space-y-4 lg:order-2">
            <label className="block space-y-2 text-right">
              <span className="text-xs font-semibold text-white">عنوان <span className="text-rose-400">*</span></span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-indigo-400" />
            </label>
            <label className="block space-y-2 text-right">
              <span className="text-xs font-semibold text-white">شعاع خطا <span className="text-rose-400">*</span></span>
              <div className="rounded-lg border border-slate-600 bg-slate-900/60 px-3 py-2 transition-colors focus-within:border-indigo-400">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pointer-events-none text-xs text-slate-400">متر</span>
                  <input value={radius} onChange={(event) => setRadius(Number(event.target.value) || 0)} className="min-w-[88px] flex-1 bg-transparent px-1 py-1 text-right text-sm text-white outline-none" />
                </div>
              </div>
            </label>
          </div>
        </div>
        <div className="mt-4 text-right text-xs text-slate-400">{selectedLocationLabel}</div>
        <div className="mt-5 flex justify-start">
          <button type="button" onClick={save} disabled={!title.trim() || saving} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? 'در حال ثبت...' : 'مرحله بعد'}
          </button>
        </div>
      </div>
    </section>
  );
}
