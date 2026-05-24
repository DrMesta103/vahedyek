'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
    <div className="auth-page auth-page-login">
      <div className="auth-card auth-card-refresh auth-login-card">
        <div className="auth-header">
          <h1>ورود</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {registered ? <div className="auth-alert auth-alert-success">ثبت‌نام انجام شد. حالا با همان اطلاعات وارد شوید.</div> : null}

          <label className="auth-field">
            <span>ایمیل یا شماره موبایل</span>
            <div className="auth-input-shell">
              {showIranPrefix ? (
                <span className="auth-prefix" dir="ltr">
                  IR +98
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
              />
            </div>
          </label>

          <label className="auth-field">
            <span>رمز عبور</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          {error ? <div className="auth-alert auth-alert-error">{error}</div> : null}

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'در حال ورود...' : 'ورود'}
          </button>
        </form>

        <p className="auth-footer">
          حساب ندارید؟ <Link href="/register">ثبت‌نام کنید</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-page auth-page-login" />}>
      <LoginPageContent />
    </Suspense>
  );
}
