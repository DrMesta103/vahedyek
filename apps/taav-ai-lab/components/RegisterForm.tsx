'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FlaskConical, LockKeyhole, Mail, Smartphone, UserRound } from 'lucide-react';
import { TaavBadge, TaavButton, TaavCard } from '@repo/ui/taav/primitives';
import { TaavFieldBlock, TaavInput } from '@repo/ui/taav/forms';
import { parseAuthIdentifier, sanitizeIranMobileInput } from '@/app/lib/contact';
import { AI_LAB_TOOLTIPS } from '@/app/lib/tooltips';
import { AiLabLabelWithTooltip, AiLabTooltipIcon } from '@/components/AiLabTooltip';

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

export function RegisterForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
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

      const payload = await readJsonResponse(response);
      if (!response.ok) {
        throw new Error(payload.message || 'ثبت‌نام انجام نشد.');
      }

      const nextIdentifier = payload.user?.email ?? payload.user?.mobile ?? identifier;
      router.replace(`/login?registered=1&identifier=${encodeURIComponent(nextIdentifier ?? '')}`);
      router.refresh();
    } catch (registerError) {
      setError(registerError instanceof Error ? registerError.message : 'ثبت‌نام انجام نشد.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ai-lab-auth-screen px-4 py-6 text-right sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center justify-center">
        <TaavCard
          variant="outlined"
          padding="lg"
          radius="xl"
          wrapperClassName="ai-lab-auth-card-shell w-full backdrop-blur-xl"
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="ai-lab-auth-hero grid gap-4 rounded-3xl p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-200">
                <FlaskConical className="h-7 w-7" />
              </div>
              <div className="grid gap-3">
                <TaavBadge tone="brand" variant="soft" unsafeClassName="w-fit">
                  <span className="inline-flex items-center gap-1">
                    ساخت حساب جدید
                    <AiLabTooltipIcon content={AI_LAB_TOOLTIPS.shell.phaseBadge} label="راهنمای ثبت‌نام" />
                  </span>
                </TaavBadge>
                <h1 className="m-0 text-3xl font-black text-white">ثبت‌نام در آزمایشگاه هوش مصنوعی تاو</h1>
                <p className="m-0 text-sm leading-8 text-slate-300">
                  بعد از ثبت‌نام، شما به صفحه‌ی ورود برمی‌گردید تا tenant خودتان را انتخاب کنید یا بسازید.
                </p>
              </div>
            </div>

            <TaavCard variant="soft" padding="lg" radius="xl" wrapperClassName="ai-lab-auth-panel">
              <div className="grid gap-2">
                <TaavBadge tone="brand" variant="soft" unsafeClassName="w-fit">
                  ثبت‌نام
                </TaavBadge>
                <h2 className="m-0 text-2xl font-black text-[var(--taav-text-strong)]">حساب جدید بسازید</h2>
                <p className="m-0 text-sm leading-7 text-[var(--taav-text-muted)]">
                  این فرم مانند DastRanj با نام، نام خانوادگی، شناسه و رمز عبور کار می‌کند.
                </p>
              </div>

              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TaavFieldBlock
                    label={<AiLabLabelWithTooltip label="نام" tooltip={AI_LAB_TOOLTIPS.auth.firstName} required />}
                    required
                    htmlFor="register-first-name"
                  >
                    <TaavInput
                      id="register-first-name"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      required
                      iconStart={<UserRound className="h-4 w-4" />}
                    />
                  </TaavFieldBlock>
                  <TaavFieldBlock
                    label={<AiLabLabelWithTooltip label="نام خانوادگی" tooltip={AI_LAB_TOOLTIPS.auth.lastName} required />}
                    required
                    htmlFor="register-last-name"
                  >
                    <TaavInput
                      id="register-last-name"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      required
                      iconStart={<UserRound className="h-4 w-4" />}
                    />
                  </TaavFieldBlock>
                </div>

                <TaavFieldBlock
                  label={<AiLabLabelWithTooltip label="ایمیل یا شماره موبایل" tooltip={AI_LAB_TOOLTIPS.auth.identifier} required />}
                  required
                  htmlFor="register-identifier"
                >
                  <TaavInput
                    id="register-identifier"
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

                {needsSeparateMobile ? (
                  <TaavFieldBlock
                    label={<AiLabLabelWithTooltip label="شماره موبایل" tooltip={AI_LAB_TOOLTIPS.auth.mobile} required />}
                    required
                    htmlFor="register-mobile"
                  >
                    <TaavInput
                      id="register-mobile"
                      value={mobile}
                      onChange={(event) => setMobile(sanitizeIranMobileInput(event.target.value))}
                      required
                      dir="ltr"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="9352720114"
                      prefix="IR +98"
                      iconStart={<Smartphone className="h-4 w-4" />}
                    />
                  </TaavFieldBlock>
                ) : null}

                <TaavFieldBlock
                  label={<AiLabLabelWithTooltip label="رمز عبور" tooltip={AI_LAB_TOOLTIPS.auth.password} required />}
                  required
                  htmlFor="register-password"
                >
                  <TaavInput
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                    iconStart={<LockKeyhole className="h-4 w-4" />}
                    placeholder="حداقل ۶ کاراکتر"
                  />
                </TaavFieldBlock>

                {error ? <div className="ai-lab-error-box">{error}</div> : null}

                <TaavButton type="submit" loading={submitting} width="full">
                  ثبت‌نام
                </TaavButton>

                <p className="m-0 text-center text-sm text-[var(--taav-text-muted)]">
                  حساب دارید؟{' '}
                  <Link href="/login" className="font-bold text-[var(--taav-brand-strong)] hover:underline">
                    وارد شوید
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
