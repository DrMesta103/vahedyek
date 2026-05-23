import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, CreditCard, User } from 'lucide-react';
import { ModulePageHeader } from '../../../components/module-page/ModulePageHeader';
import { maritalStatusLabels } from '../../../lib/constants';
import { getEmployee } from '../../../lib/data';
import { formatPersianDate } from '../../../lib/format-date';

function displayValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '-';
}

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = await getEmployee(id);

  if (!employee) notFound();

  const breadcrumbs = [
    { label: 'دسترنج', href: '/' },
    { label: 'تنظیمات کسب و کار', href: '/business-settings' },
    { label: 'کارمندان', href: '/employees' },
    { label: 'جزییات کارمند' },
  ];

  const detailRows = [
    { label: 'First Name', value: employee.firstName },
    { label: 'Last Name', value: employee.lastName },
    { label: 'Email', value: displayValue(employee.email) },
    { label: 'Mobile Phone 1', value: displayValue(employee.mobile1) },
    { label: 'Mobile Phone 2', value: displayValue(employee.mobile2) },
    { label: 'Personnel Code', value: displayValue(employee.personnelCode) },
    { label: 'Marital Status', value: maritalStatusLabels[employee.maritalStatus] ?? '-' },
    { label: 'Children Count', value: String(employee.childrenCount) },
    { label: 'Created At', value: formatPersianDate(employee.createdAt) },
    { label: 'Can Edit Identity Photo', value: employee.canEditIdentityPhoto ? 'Yes' : 'No' },
  ];

  return (
    <div className="page-stack module-page employee-detail-page" dir="rtl" lang="fa">
      <ModulePageHeader breadcrumbs={breadcrumbs} title="جزییات کارمند" titleHref="/employees" />

      <article className="employee-detail-card">
        <div className="employee-detail-photos">
          <div className="employee-detail-photo-box">
            <span className="employee-detail-photo-label">Identity Verification Photo</span>
            <div className="employee-detail-photo-frame">
              {employee.identityPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={employee.identityPhotoUrl} alt="" />
              ) : (
                <CreditCard className="h-9 w-9" strokeWidth={1.8} />
              )}
            </div>
          </div>
          <div className="employee-detail-photo-box">
            <span className="employee-detail-photo-label">Avatar</span>
            <div className="employee-detail-photo-frame">
              {employee.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={employee.avatarUrl} alt="" />
              ) : (
                <User className="h-9 w-9" strokeWidth={1.8} />
              )}
            </div>
          </div>
        </div>

        <div className="employee-detail-rows">
          {detailRows.map((row) => (
            <div key={row.label} className="employee-detail-row">
              <span className="employee-detail-label">{row.label}</span>
              <span className="employee-detail-value">{row.value}</span>
            </div>
          ))}
        </div>
      </article>

      <div className="employee-detail-sections">
        <Link href={`/employees/${id}/bank-accounts`} className="employee-detail-section-link">
          <span>حساب‌های بانکی</span>
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Link>
        <Link href={`/employees/${id}/guarantee`} className="employee-detail-section-link">
          <span>ضمانت</span>
          <ChevronLeft className="h-5 w-5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
