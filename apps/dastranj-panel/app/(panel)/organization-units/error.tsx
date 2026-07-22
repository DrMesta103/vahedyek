'use client';

import { CircleAlert } from 'lucide-react';

export default function OrganizationUnitsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <section className="org-empty-state" dir="rtl" lang="fa"><CircleAlert/><h2>اطلاعات واحدهای سازمانی دریافت نشد.</h2><p>اتصال یا سطح دسترسی خود را بررسی کنید و دوباره تلاش کنید.</p><button onClick={reset}>تلاش مجدد</button></section>;
}
