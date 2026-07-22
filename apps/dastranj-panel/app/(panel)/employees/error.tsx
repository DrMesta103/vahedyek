'use client';

export default function EmployeesError({ reset }: { reset: () => void }) {
  return (
    <div className="page-stack module-page employees-page" dir="rtl" lang="fa" role="alert">
      <div className="employees-empty-state employees-error-state">
        <h2>امکان دریافت لیست کارکنان وجود ندارد.</h2>
        <p>دوباره تلاش کنید.</p>
        <button type="button" className="employees-empty-link is-primary" onClick={reset}>تلاش دوباره</button>
      </div>
    </div>
  );
}
