import { notFound } from 'next/navigation';
import { getEmployee } from '../../../../lib/data';
import { parseBankAccounts } from '../../../../lib/employee-records';
import { EmployeeBankAccountsManager } from '../../_components/EmployeeBankAccountsManager';

export default async function EmployeeBankAccountsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = await getEmployee(id);

  if (!employee) notFound();

  return (
    <div className="page-stack module-page employee-detail-page" dir="rtl" lang="fa">
      <EmployeeBankAccountsManager
        employeeId={employee.id}
        employeeName={`${employee.firstName} ${employee.lastName}`.trim()}
        initialAccounts={parseBankAccounts(employee.bankAccounts)}
      />
    </div>
  );
}
