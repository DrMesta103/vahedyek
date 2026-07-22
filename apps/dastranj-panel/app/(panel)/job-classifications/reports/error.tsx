'use client';
export default function ErrorState({ reset }: { reset: () => void }) { return <main className="module-page"><div className="module-empty-state"><h1>تولید گزارش ناموفق بود</h1><button onClick={reset}>تلاش دوباره</button></div></main>; }
