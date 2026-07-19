'use client';

export default function PoliciesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="page-stack module-page" dir="rtl" lang="fa"><div className="module-empty-state"><h2>بارگذاری سیاست‌های کاری انجام نشد.</h2><p>دوباره تلاش کنید یا وضعیت اتصال به سرور را بررسی کنید.</p><button type="button" onClick={reset}>تلاش دوباره</button></div></div>;
}
