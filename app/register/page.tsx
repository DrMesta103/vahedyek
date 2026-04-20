'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'خطا در ثبت‌نام');

      router.push(`/login?registered=1&email=${encodeURIComponent(data.user.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت‌نام');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#d8fff4,transparent_35%),linear-gradient(135deg,#f7fbfa,#eef6f4)] px-4">
      <div className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/90 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)] backdrop-blur">
        <div className="mb-8 text-right">
          <div className="mb-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            ورود به سامانه قرارداد
          </div>
          <h1 className="text-3xl font-bold text-slate-900">ثبت‌نام</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">حساب کاربری جدید بسازید.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">نام و نام خانوادگی</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="مثال: علی محمدی"
              className="app-control app-auth-control w-full transition focus:border-emerald-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">ایمیل</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              dir="ltr"
              className="app-control app-auth-control w-full text-left transition focus:border-emerald-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">رمز عبور</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="حداقل ۶ کاراکتر"
              className="app-control app-auth-control w-full transition focus:border-emerald-500"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="app-button app-auth-button transition hover:bg-emerald-700"
          >
            {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          حساب دارید؟{' '}
          <Link href="/login" className="font-semibold text-emerald-600 hover:underline">
            وارد شوید
          </Link>
        </p>
      </div>
    </div>
  );
}
