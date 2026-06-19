'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TaavFieldBlock, TaavInput } from '@repo/ui/taav/forms';
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
    <div className="auth-page auth-page-refresh">
      <div className="auth-shell">
        <section className="auth-hero-card">
          <div className="auth-hero-kicker">ساخت حساب جدید</div>
          <h1>حساب را بسازید و tenant خودتان را در چند قدم فعال کنید</h1>
          <p>پس از ثبت‌نام، مسیر انتخاب پکیج، ساخت کسب‌وکار و ورود به پنل اصلی در همان flow ادامه پیدا می‌کند.</p>
          <div className="auth-hero-points">
            <span>ثبت‌نام سریع</span>
            <span>مالک tenant روی همین حساب</span>
            <span>مناسب تیم‌های ایرانی</span>
          </div>
        </section>

        <div className="auth-card auth-card-refresh">
          <div className="auth-header">
            <div className="auth-badge">شروع با دسترنج</div>
            <h1>ثبت‌نام</h1>
            <p>حساب جدید بسازید تا بعد از آن کسب‌وکار خودتان را ایجاد کنیم.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-grid-two">
              <TaavFieldBlock label="نام" required htmlFor="register-first-name">
                <TaavInput
                  id="register-first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </TaavFieldBlock>
              <TaavFieldBlock label="نام خانوادگی" required htmlFor="register-last-name">
                <TaavInput
                  id="register-last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </TaavFieldBlock>
            </div>

            <TaavFieldBlock label="ایمیل یا شماره موبایل" required htmlFor="register-identifier">
              <TaavInput
                id="register-identifier"
                type={identifierType === 'email' ? 'email' : 'text'}
                value={identifier}
                onChange={(e) => handleIdentifierChange(e.target.value)}
                required
                dir="ltr"
                inputMode={identifierType === 'email' ? 'email' : 'numeric'}
                maxLength={identifierType === 'email' ? undefined : 10}
                placeholder={identifierType === 'email' ? 'example@email.com' : '9352720114'}
                prefix={showIranPrefix ? 'IR +98' : undefined}
              />
            </TaavFieldBlock>

            {needsSeparateMobile ? (
              <TaavFieldBlock label="شماره موبایل" required htmlFor="register-mobile">
                <TaavInput
                  id="register-mobile"
                  value={mobile}
                  onChange={(e) => setMobile(sanitizeIranMobileInput(e.target.value))}
                  required
                  dir="ltr"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9352720114"
                  prefix="IR +98"
                />
              </TaavFieldBlock>
            ) : null}

            <TaavFieldBlock label="رمز عبور" required htmlFor="register-password">
              <TaavInput
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="حداقل ۶ کاراکتر"
              />
            </TaavFieldBlock>

            {error ? <div className="auth-alert auth-alert-error">{error}</div> : null}

            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
            </button>
          </form>

          <p className="auth-footer">
            حساب دارید؟{' '}
            <Link href="/login">وارد شوید</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
