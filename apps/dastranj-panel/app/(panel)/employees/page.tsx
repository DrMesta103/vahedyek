import { ModulePageHeader } from '../../components/module-page/ModulePageHeader';
import { businessSettingsBreadcrumbs } from '../../components/module-page/module-breadcrumbs';
import { listEmployees } from '../../lib/data';
import { EmployeeCard } from './_components/EmployeeCard';

export default async function EmployeesPage() {
  const items = await listEmployees();

  return (
    <div className="page-stack module-page employees-page" dir="rtl" lang="fa">
      <ModulePageHeader
        breadcrumbs={businessSettingsBreadcrumbs('کارمندان')}
        title="کارمندان"
        subtitle="مدیریت اطلاعات کارمندان و دسترسی سریع به عملیات مربوط به اعضای تیم."
        addHref="/employees/new"
        addLabel="افزودن کارمند"
      />

      <div className="employees-list">
        {items.map((item) => (
          <EmployeeCard
            key={item.id}
            employee={{
              id: item.id,
              firstName: item.firstName,
              lastName: item.lastName,
              email: item.email,
              mobile1: item.mobile1,
              mobile2: item.mobile2,
              avatarUrl: item.avatarUrl,
              isActive: item.isActive,
              createdAt: item.createdAt.toISOString(),
            }}
          />
        ))}
      </div>
    </div>
  );
}
