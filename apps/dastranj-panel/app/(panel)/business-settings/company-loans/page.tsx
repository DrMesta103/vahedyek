import { ModulePageHeader } from '../../../components/module-page/ModulePageHeader';
import { listCompanyLoans } from '../../../lib/employee-requests';
import { CompanyLoansClient } from './_components/CompanyLoansClient';

export default async function CompanyLoansPage() {
  const loans = await listCompanyLoans();

  return (
    <div className="page-stack module-page company-loans-page" dir="rtl" lang="fa">
      <ModulePageHeader
        title="وام‌های سازمانی"
        subtitle="تعریف و مدیریت وام‌هایی که در درخواست وام کارمندان قابل انتخاب هستند."
      />
      <CompanyLoansClient loans={loans} />
    </div>
  );
}
