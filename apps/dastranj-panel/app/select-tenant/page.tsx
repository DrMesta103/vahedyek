'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Plus } from 'lucide-react';

type Tenant = { id: string; name: string; slug: string; brandCode: string; role: string };
type Form = { name: string; slug: string; brandCode: string };

function SelectTenantContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [form, setForm] = useState<Form>({ name: '', slug: '', brandCode: '' });

  useEffect(() => {
    fetch('/api/auth/tenants')
      .then((r) => { if (r.status === 401) { router.replace('/login'); return null; } return r.json(); })
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
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        {!showCreate ? (
          <>
            <div className="auth-header">
              <div className="auth-badge">دسترنج</div>
              <h1>انتخاب کسب‌وکار</h1>
              <p>کسب‌وکاری که می‌خواهید وارد شوید را انتخاب کنید.</p>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0', fontSize: 14 }}>در حال بارگذاری...</div>
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {tenants.map((tenant) => (
                  <button
                    key={tenant.id}
                    onClick={() => selectTenant(tenant.id)}
                    disabled={selecting === tenant.id}
                    className="tenant-card"
                  >
                    <div className="tenant-avatar">{tenant.brandCode}</div>
                    <div style={{ flex: 1, textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 15 }}>{tenant.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{tenant.slug}</div>
                    </div>
                    {selecting === tenant.id ? (
                      <span style={{ fontSize: 12, color: '#7063ff' }}>در حال ورود...</span>
                    ) : null}
                  </button>
                ))}

                {tenants.length === 0 ? (
                  <div style={{ border: '1px solid var(--line)', borderRadius: 14, padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                    هنوز عضو هیچ کسب‌وکاری نیستید.
                  </div>
                ) : null}

                <button onClick={() => setShowCreate(true)} className="tenant-create-btn">
                  <Plus size={16} />
                  افزودن کسب‌وکار جدید
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="auth-header">
              <button onClick={() => { setShowCreate(false); setCreateError(''); }} className="auth-back-btn">← بازگشت</button>
              <h1>کسب‌وکار جدید</h1>
              <p>اطلاعات کسب‌وکار خود را وارد کنید.</p>
            </div>

            <form onSubmit={createTenant} className="auth-form">
              <label className="auth-field">
                <span>نام کسب‌وکار</span>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required placeholder="مثال: شرکت دسترنج" />
              </label>
              <label className="auth-field">
                <span>شناسه (slug)</span>
                <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required placeholder="مثال: dastranj" dir="ltr" />
                <small style={{ color: 'var(--muted)', fontSize: 11 }}>فقط حروف انگلیسی، اعداد و خط تیره</small>
              </label>
              <label className="auth-field">
                <span>کد برند (اختیاری)</span>
                <input value={form.brandCode} onChange={(e) => setForm((f) => ({ ...f, brandCode: e.target.value }))} placeholder="مثال: DS" maxLength={5} dir="ltr" />
              </label>

              {createError ? <div className="auth-alert auth-alert-error">{createError}</div> : null}

              <button type="submit" disabled={creating} className="auth-btn">
                {creating ? 'در حال ساخت...' : 'ساخت و ورود'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function SelectTenantPage() {
  return (
    <Suspense fallback={<div className="auth-page" />}>
      <SelectTenantContent />
    </Suspense>
  );
}
