'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FlaskConical, LockKeyhole, Mail, Smartphone } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavFieldBlock, TaavInput } from '@repo/ui/taav/forms';
import { parseAuthIdentifier, sanitizeIranMobileInput } from '@/app/lib/contact';

async function readJsonResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  const raw = await response.text();

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw) as { message?: string; user?: { id?: string } };
    } catch {
      return { message: 'پاسخ JSON سرور نامعتبر است.' };
    }
  }

  return { message: raw || 'پاسخ نامعتبر از سرور دریافت شد.' };
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const identifierType = useMemo(() => parseAuthIdentifier(identifier).type, [identifier]);
  const showIranPrefix = identifierType !== 'email';
  const registered = searchParams.get('registered') === '1';

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
    setSubmitting(true);
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

      const rawNext = searchParams.get('next') || '/businesses';
      const next =
        rawNext === '/' || rawNext.startsWith('/select-tenant') ? '/businesses' : rawNext;
      router.replace(next);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'ورود انجام نشد.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#10253a,transparent_36%),linear-gradient(135deg,#07121f,#0d1726_60%,#07101a)] px-4 py-6 text-right text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-4xl items-center justify-center">
        <TaavCard
          variant="outlined"
          padding="lg"
          radius="xl"
          wrapperClassName="w-full border-white/10 bg-[rgba(8,14,25,0.78)] shadow-[0_24px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-4 rounded-3xl border border-white/6 bg-white/4 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-200">
                <FlaskConical className="h-7 w-7" />
              </div>
              <div className="grid gap-3">
                <TaavBadge tone="brand" variant="soft" unsafeClassName="w-fit">
                  فاز ۱ · محیط شبیه‌ساز
                </TaavBadge>
                <h1 className="m-0 text-3xl font-black text-white">ورود به آزمایشگاه هوش مصنوعی تاو</h1>
                <p className="m-0 text-sm leading-8 text-slate-300">
                  این مسیر ورود فعلا برای شبیه‌ساز داخلی فعال است و بعد از آن شما را مستقیم به فهرست کسب‌وکارها هدایت می‌کند.
                </p>
              </div>
            </div>

            <TaavCard variant="soft" padding="lg" radius="xl" wrapperClassName="ai-lab-auth-panel">
              <div className="grid gap-2">
                <TaavBadge tone="brand" variant="soft" unsafeClassName="w-fit">
                  ورود
                </TaavBadge>
                <h2 className="m-0 text-2xl font-black text-[var(--taav-text-strong)]">با ایمیل یا موبایل وارد شوید</h2>
                <p className="m-0 text-sm leading-7 text-[var(--taav-text-muted)]">
                  بعد از ورود، مستقیم وارد فهرست کسب‌وکارها می‌شوید.
                </p>
              </div>

              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                {registered ? (
                  <div className="ai-lab-success-box">
                    ثبت‌نام انجام شد. حالا با همان اطلاعات وارد شوید.
                  </div>
                ) : null}

                <TaavFieldBlock label="ایمیل یا شماره موبایل" required htmlFor="login-identifier">
                  <TaavInput
                    id="login-identifier"
                    type={identifierType === 'email' ? 'email' : 'text'}
                    value={identifier}
                    onChange={(event) => handleIdentifierChange(event.target.value)}
                    required
                    dir="ltr"
                    inputMode={identifierType === 'email' ? 'email' : 'numeric'}
                    maxLength={identifierType === 'email' ? undefined : 10}
                    placeholder={identifierType === 'email' ? 'example@email.com' : '9352720114'}
                    prefix={showIranPrefix ? 'IR +98' : undefined}
                    iconStart={identifierType === 'email' ? <Mail className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                  />
                </TaavFieldBlock>

                <TaavFieldBlock label="رمز عبور" required htmlFor="login-password">
                  <TaavInput
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    iconStart={<LockKeyhole className="h-4 w-4" />}
                  />
                </TaavFieldBlock>

                {error ? <div className="ai-lab-error-box">{error}</div> : null}

                <TaavButton type="submit" loading={submitting} width="full">
                  ورود
                </TaavButton>

                <p className="m-0 text-center text-sm text-[var(--taav-text-muted)]">
                  حساب ندارید؟{' '}
                  <Link href="/register" className="font-bold text-[var(--taav-brand-strong)] hover:underline">
                    ثبت‌نام
                  </Link>
                </p>
              </form>
            </TaavCard>
          </div>
        </TaavCard>
      </div>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[radial-gradient(circle_at_top,#10253a,transparent_36%),linear-gradient(135deg,#07121f,#0d1726_60%,#07101a)]" />}>
      <LoginFormContent />
    </Suspense>
  );
}
