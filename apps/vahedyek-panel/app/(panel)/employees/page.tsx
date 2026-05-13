import Link from 'next/link';
import PanelLayout from '../../components/PanelLayout';
import { EmployeeList } from './_components/EmployeeList';
import { prisma } from '../../lib/prisma';
import { getSessionContext } from '../../lib/auth';
import { getEmployeeUserId } from '../../lib/employeeIdentity';
import './employees.css';

async function getEmployees() {
  const session = await getSessionContext();
  if (!session?.tenantId) return [];

  const employees = await prisma.employee.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { firstName: 'asc' },
  });

  const users = await prisma.appUser.findMany({
    where: {
      id: {
        in: employees.map((item) => getEmployeeUserId(item.id, session.tenantId)),
      },
    },
    select: {
      id: true,
      email: true,
      mobile: true,
    },
  });
  const usersById = new Map(users.map((item) => [item.id, item]));

  return employees.map((emp) => {
    const user = usersById.get(getEmployeeUserId(emp.id, session.tenantId));
    return {
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      nationalCode: emp.nationalCode ?? '',
      mobile: user?.mobile ? `+98${user.mobile}` : '',
      email: user?.email ?? '',
      isActive: emp.isActive,
    };
  });
}

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <PanelLayout>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">مدیریت کارمندان</h1>
            <p className="page-description">مدیریت پرسنل، جستجو و کنترل دسترسی</p>
          </div>
          <Link href="/employees/new" className="btn-primary">
            افزودن کارمند
          </Link>
        </div>

        {employees.length === 0 ? (
          <div className="empty-state-card">
            <h3>کارمندی ثبت نشده</h3>
            <p>برای شروع، اولین کارمند خود را اضافه کنید</p>
            <Link href="/employees/new" className="btn-primary">
              ثبت کارمند
            </Link>
          </div>
        ) : (
          <EmployeeList employees={employees} />
        )}
      </div>
    </PanelLayout>
  );
}
