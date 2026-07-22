'use client';
export default function ErrorState({ reset }: { reset: () => void }) { return <main className="employee-reports-page" dir="rtl"><div className="employee-report-state is-error"><strong>اطلاعات گزارش از ماژول مرجع دریافت نشد.</strong><p>اتصال یا دسترسی را بررسی کرده و دوباره تلاش کنید.</p><button onClick={reset}>تلاش دوباره</button></div></main>; }
