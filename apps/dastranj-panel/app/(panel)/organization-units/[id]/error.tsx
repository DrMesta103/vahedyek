'use client';
export default function OrganizationUnitProfileError({reset}:{error:Error;reset:()=>void}){return <main className="org-section-empty" dir="rtl" lang="fa"><h1>دریافت پروفایل واحد انجام نشد</h1><p>اتصال را بررسی کنید و دوباره تلاش کنید.</p><button onClick={reset}>تلاش دوباره</button></main>}
