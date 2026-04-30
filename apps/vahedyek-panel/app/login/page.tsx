'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { parseAuthIdentifier, sanitizeIranMobileInput } from '../lib/contact';

async function readJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  const raw = await response.text();

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw) as { message?: string; user?: { id: string } };
    } catch {
      return { message: 'پاسخ JSON سرور نامعتبر است.' };
    }
  }

  return { message: raw || 'پاسخ نامعتبر از سرور دریافت شد.' };
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const registered = searchParams.get('registered') === '1';
  const identifierType = parseAuthIdentifier(identifier).type;
  const showIranPrefix = identifierType !== 'email';

  useEffect(() => {
    const initialIdentifier = searchParams.get('identifier');
    if (initialIdentifier) {
      setIdentifier(initialIdentifier);
    }
  }, [searchParams]);

  const handleIdentifierChange = (value: string) => {
    if (value.includes('@')) {
      setIdentifier(value.trim());
      return;
    }

    setIdentifier(sanitizeIranMobileInput(value));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const payload = await readJsonResponse(response);
      if (!response.ok) {
        throw new Error(payload.message || 'ورود انجام نشد.');
      }

      const next = searchParams.get('next') || '/';
      router.push(`/select-tenant?userId=${payload.user?.id ?? ''}&next=${encodeURIComponent(next)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ورود به سامانه');
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
          <h1 className="text-3xl font-bold text-slate-900">ورود</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">با ایمیل یا شماره موبایل ۱۰ رقمی و رمز عبور وارد شوید.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          {registered ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              ثبت‌نام انجام شد. حالا با ایمیل یا شماره موبایل و رمز عبور وارد شوید.
            </div>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">ایمیل یا شماره موبایل</span>
            <div className="flex items-center gap-2 rounded-[14px] border border-slate-200 bg-slate-50 px-3 focus-within:border-emerald-500">
              {showIranPrefix ? (
                <span className="shrink-0 text-sm font-semibold text-slate-500" dir="ltr">
                  🇮🇷 +98
                </span>
              ) : null}
              <input
                type={identifierType === 'email' ? 'email' : 'text'}
                value={identifier}
                onChange={(e) => handleIdentifierChange(e.target.value)}
                required
                dir="ltr"
                inputMode={identifierType === 'email' ? 'email' : 'numeric'}
                maxLength={identifierType === 'email' ? undefined : 10}
                placeholder={identifierType === 'email' ? 'example@email.com' : '9352720114'}
                className="h-12 w-full border-0 bg-transparent px-0 text-left text-[13px] text-slate-800 outline-none"
              />
            </div>
            {showIranPrefix ? <span className="mt-1 block text-xs text-slate-400">فقط ۱۰ رقم و بدون `0` یا `+98`</span> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">رمز عبور</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="app-control app-auth-control w-full transition focus:border-emerald-500"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="app-button app-auth-button transition hover:bg-emerald-700 disabled:cursor-not-allowed"
          >
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          حساب ندارید؟{' '}
          <Link href="/register" className="font-semibold text-emerald-600 hover:underline">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[radial-gradient(circle_at_top,#d8fff4,transparent_35%),linear-gradient(135deg,#f7fbfa,#eef6f4)]" />}>
      <LoginPageContent />
    </Suspense>
  );
}
