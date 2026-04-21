import { Sidebar } from './components/Sidebar';

const stats = [
  { label: 'درخواست‌های امروز', value: '۱۲' },
  { label: 'در انتظار بررسی', value: '۵' },
  { label: 'پرداخت آماده', value: '۳' },
];

export default function HomePage() {
  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <header className="page-header">
          <div>
            <h1>داشبورد دسترنج</h1>
            <p>این اپ مستقل است و دیتابیس، env، route و build خودش را دارد.</p>
          </div>
          <span>APP_ID=dastranj</span>
        </header>

        <section className="stats">
          {stats.map((item) => (
            <article key={item.label} className="stat-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>

        <section className="workspace">
          <h2>صفحه نمونه</h2>
          <p>این صفحه از اپ واحدیک import نمی‌کند. فقط dependencyهای مشترک از node_modules و packageهای workspace قابل استفاده‌اند.</p>
          <button type="button">ثبت درخواست نمونه</button>
        </section>
      </main>
    </div>
  );
}
