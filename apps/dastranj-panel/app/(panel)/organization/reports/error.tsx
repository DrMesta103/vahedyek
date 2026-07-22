'use client';
export default function ErrorState({reset}:{reset:()=>void}){return <section className="org-section-empty" dir="rtl"><h1>دریافت گزارش‌های سازمانی انجام نشد</h1><p>لطفاً فیلترها و اتصال را بررسی کرده و دوباره تلاش کنید.</p><button onClick={reset}>تلاش دوباره</button></section>}
