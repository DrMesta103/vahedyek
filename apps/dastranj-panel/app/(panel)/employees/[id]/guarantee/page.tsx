import { notFound } from 'next/navigation';
import { getEmployee } from '../../../../lib/data';
import { parseGuarantees } from '../../../../lib/employee-records';
import { EmployeeGuaranteeManager } from '../../_components/EmployeeGuaranteeManager';

export default async function EmployeeGuaranteePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = await getEmployee(id);

  if (!employee) notFound();

  return (
    <div className="page-stack module-page employee-detail-page" dir="rtl" lang="fa">
      <EmployeeGuaranteeManager employeeId={employee.id} initialGuarantees={parseGuarantees(employee.guarantees)} />
    </div>
  );
}
