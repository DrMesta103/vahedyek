export default function OrganizationUnitsLoading() {
  return <div className="module-page organization-structure-page" dir="rtl" lang="fa" aria-busy="true" aria-label="در حال دریافت اطلاعات واحدهای سازمانی">
    <div className="org-skeleton is-header" /><div className="org-summary-grid">{Array.from({ length: 8 }, (_, index) => <div className="org-skeleton is-stat" key={index} />)}</div><div className="org-skeleton is-controls" />{Array.from({ length: 4 }, (_, index) => <div className="org-skeleton is-row" key={index} />)}
  </div>;
}
