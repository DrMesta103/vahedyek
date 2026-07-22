'use client';
export default function ErrorState({reset}:{reset:()=>void}){return <section className="org-section-empty" dir="rtl"><h1>دریافت داشبورد سازمانی انجام نشد</h1><p>لطفاً دوباره تلاش کنید.</p><button onClick={reset}>تلاش دوباره</button></section>}
