export default function EmployeesLoading() {
  return (
    <div className="page-stack module-page employees-page" dir="rtl" lang="fa" aria-busy="true" aria-live="polite">
      <div className="employees-loading-state">
        <div className="employees-loading-bar" />
        <p>در حال دریافت فهرست کارکنان...</p>
      </div>
    </div>
  );
}
