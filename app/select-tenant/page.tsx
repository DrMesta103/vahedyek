'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Tenant = {
  id: string;
  name: string;
  slug: string;
  brandCode: string;
  role: string;
};

type NewTenantForm = { name: string; slug: string; brandCode: string };

export default function SelectTenantPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/contracts';

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState<NewTenantForm>({ name: '', slug: '', brandCode: '' });

  useEffect(() => {
    fetch('/api/auth/tenants')
      .then((r) => {
        if (r.status === 401) { router.replace('/login'); return null; }
        return r.json();
      })
      .then((data) => data && setTenants(data.tenants ?? []))
      .catch(() => setTenants([]))
      .finally(() => setLoading(false));
  }, [router]);

  const selectTenant = async (tenantId: string) => {
    setSelecting(tenantId);
    try {
      const res = await fetch('/api/auth/select-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });
      if (!res.ok) throw new Error();
      router.push(next);
      router.refresh();
    } catch {
      setSelecting(null);
    }
  };

  const createTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      const res = await fetch('/api/auth/create-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'خطا در ساخت کسب‌وکار');
      router.push(next);
      router.refresh();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'خطا در ساخت کسب‌وکار');
      setCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#d8fff4,transparent_35%),linear-gradient(135deg,#f7fbfa,#eef6f4)] px-4">
      <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)] backdrop-blur">
        {!showCreate ? (
          <>
            <div className="mb-6 text-right

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#d8fff4,transparent_35%),linear-gradient(135deg,#f7fbfa,#eef6f4)] px-4">
      <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)] backdrop-blur">
        {!showCreate ? (
          <>
            <div className="mb-6 text-right">
              <h1 className="text-2xl font-bold text-slate-900">انتخاب کسب‌وکار</h1>
              <p className="mt-1 text-sm text-slate-500">کسب‌وکاری که می‌خواهید وارد شوید را انتخاب کنید.</p>
            </div>

            {loading ? (
              <div className="py-8 text-center text-sm text-slate-400">در حال بارگذاری...</div>
            ) : (
              <div className="space-y-3">
                {tenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() => selectTenant(tenant.id)}
                    disabled={selecting === tenant.id}
                    className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right transition hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-60"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-xs font-bold text-white">
                      {tenant.brandCode}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">{tenant.name}</div>
                      <div className="text-xs text-slate-400">{tenant.slug}</div>
                    </div>
                    {selecting === tenant.id ? (
                      <span className="text-xs text-emerald-600">در حال ورود...</span>
                    ) : (
                      <i className="fa fa-chevron-left text-slate-300" />
                    )}
                  </button>
                ))}

                {tenants.length === 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 py-6 text-center text-sm text-slate-400">
                    هنوز عضو هیچ کسب‌وکاری نیستید.
                  </div>
                )}

                <button
                  onClick={() => setShowCreate(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-100"
                >
                  <i className="fa fa-plus" />
                  افزودن کسب‌وکار جدید
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-6 text-right">
              <button
                onClick={() => { setShowCreate(false); setCreateError(''); }}
                className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
              >
                <i className="fa fa-arrow-right" />
                بازگشت
              </button>
              <h1 className="text-2xl font-bold text-slate-900">کسب‌وکار جدید</h1>
              <p className="mt-1 text-sm text-slate-500">اطلاعات کسب‌وکار خود را وارد کنید.</p>
            </div>

            <form onSubmit={createTenant} className="space-y-4 text-right">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">نام کسب‌وکار</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="مثال: شرکت لیند"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">شناسه (slug)</span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  required
                  placeholder="مثال: lind"
                  dir="ltr"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left outline-none transition focus:border-emerald-500"
                />
                <span className="mt-1 block text-xs text-slate-400">فقط حروف انگلیسی، اعداد و خط تیره</span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">کد برند (اختیاری)</span>
                <input
                  value={form.brandCode}
                  onChange={(e) => setForm((f) => ({ ...f, brandCode: e.target.value }))}
                  placeholder="مثال: LN"
                  maxLength={5}
                  dir="ltr"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-left outline-none transition focus:border-emerald-500"
                />
              </label>

              {createError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{createError}</div>
              ) : null}

              <button
                type="submit"
                disabled={creating}
                className="h-12 w-full rounded-2xl bg-emerald-600 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {creating ? 'در حال ساخت...' : 'ساخت و ورود'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
