'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { parseAuthIdentifier, sanitizeIranMobileInput } from '../lib/contact';

async function readJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  const raw = await response.text();

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw) as { message?: string; user?: { email?: string | null; mobile?: string | null } };
    } catch {
      return { message: 'پاسخ JSON سرور نامعتبر است.' };
    }
  }

  return { message: raw || 'پاسخ نامعتبر از سرور دریافت شد.' };
}

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const identifierType = useMemo(() => parseAuthIdentifier(identifier).type, [identifier]);
  const showIranPrefix = identifierType !== 'email';
  const needsSeparateMobile = identifierType === 'email';

  const handleIdentifierChange = (value: string) => {
    if (value.includes('@')) {
      setIdentifier(value.trim());
      return;
    }

    setIdentifier(sanitizeIranMobileInput(value));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          identifier,
          mobile: needsSeparateMobile ? mobile : undefined,
          password,
        }),
      });

      const data = await readJsonResponse(res);
      if (!res.ok) throw new Error(data.message || 'خطا در ثبت‌نام');

      const nextIdentifier = data.user?.email ?? data.user?.mobile ?? identifier;
      router.push(`/login?registered=1&identifier=${encodeURIComponent(nextIdentifier)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطا در ثبت‌نام');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#d8fff4,transparent_35%),linear-gradient(135deg,#f7fbfa,#eef6f4)] px-4">
      <div className="w-full max-w-md rounded-[8px] border border-white/70 bg-white/90 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)] backdrop-blur">
        <div className="mb-8 text-right">
          <div className="mb-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            ورود به سامانه قرارداد
          </div>
          <h1 className="text-3xl font-bold text-slate-900">ثبت‌نام</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">حساب جدید بسازید تا بعد از آن کسب‌وکار خودتان را ایجاد کنیم.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">نام</span>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="app-control app-auth-control w-full transition focus:border-emerald-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">نام خانوادگی</span>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="app-control app-auth-control w-full transition focus:border-emerald-500"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">ایمیل یا شماره موبایل</span>
            <div className="flex items-center gap-2 rounded-[8px] border border-slate-200 bg-slate-50 px-3 focus-within:border-emerald-500">
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
            {showIranPrefix ? <span className="mt-1 block text-xs text-slate-400">فرمت درست موبایل: `9352720114`</span> : null}
          </label>

          {needsSeparateMobile ? (
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">شماره موبایل</span>
              <div className="flex items-center gap-2 rounded-[8px] border border-slate-200 bg-slate-50 px-3 focus-within:border-emerald-500">
                <span className="shrink-0 text-sm font-semibold text-slate-500" dir="ltr">
                  🇮🇷 +98
                </span>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(sanitizeIranMobileInput(e.target.value))}
                  required
                  dir="ltr"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9352720114"
                  className="h-12 w-full border-0 bg-transparent px-0 text-left text-[13px] text-slate-800 outline-none"
                />
              </div>
              <span className="mt-1 block text-xs text-slate-400">برای مالک کسب‌وکار، موبایل از جدول کاربر خوانده می‌شود.</span>
            </label>
          ) : null}

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
            <div className="rounded-[8px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
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


