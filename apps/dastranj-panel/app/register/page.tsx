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

  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">دسترنج</div>
          <h1>ثبت‌نام</h1>
          <p>حساب کاربری جدید بسازید.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-field">
            <span>نام و نام خانوادگی</span>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="مثال: علی محمدی" />
          </label>

          <label className="auth-field">
            <span>ایمیل</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@email.com" dir="ltr" />
          </label>

          <label className="auth-field">
            <span>رمز عبور</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="حداقل ۶ کاراکتر" />
          </label>

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
  );
}
