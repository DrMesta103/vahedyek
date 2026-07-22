'use client';

export default function OrganizationTemplatesError({ reset }: { reset: () => void }) {
  return <section className="org-empty-state" dir="rtl" role="alert"><h2>دریافت قالب‌های ساختار سازمانی انجام نشد.</h2><button onClick={reset}>تلاش دوباره</button></section>;
}
