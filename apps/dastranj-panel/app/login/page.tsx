'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const registered = searchParams.get('registered') === '1';

  useEffect(() => {
    const e = searchParams.get('email');
    if (e) setEmail(e);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ورود انجام نشد.');
      const next = searchParams.get('next') || '/';
      router.push(`/select-tenant?next=${encodeURIComponent(next)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ورود به سامانه');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">دسترنج</div>
          <h1>ورود</h1>
          <p>با ایمیل و رمز عبور خود وارد شوید.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {registered ? (
            <div className="auth-alert auth-alert-success">ثبت‌نام انجام شد. برای ورود، ایمیل و رمز عبور خود را وارد کنید.</div>
          ) : null}

          <label className="auth-field">
            <span>ایمیل</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@email.com" dir="ltr" />
          </label>

          <label className="auth-field">
            <span>رمز عبور</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="حداقل ۶ کاراکتر" />
          </label>

          {error ? <div className="auth-alert auth-alert-error">{error}</div> : null}

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>

        <p className="auth-footer">
          حساب ندارید؟{' '}
          <Link href="/register">ثبت‌نام کنید</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-page" />}>
      <LoginContent />
    </Suspense>
  );
}
