import { notFound } from 'next/navigation';
import { ModulePageHeader } from '../../../../components/module-page/ModulePageHeader';
import { getEmployeeWorkReportPageData } from '../../../../lib/employee-work-report';
import { EmployeeWorkReportClient } from './_components/EmployeeWorkReportClient';

function parseMonthParam(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const parsed = Number.parseInt(raw.replace(/[^\d]/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export default async function EmployeeWorkReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: { year?: string; month?: string; jy?: string; jm?: string };
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ?? {};
  const year = parseMonthParam(resolvedSearchParams.year ?? resolvedSearchParams.jy);
  const month = parseMonthParam(resolvedSearchParams.month ?? resolvedSearchParams.jm);
  const report = await getEmployeeWorkReportPageData(id, {
    year: year ?? undefined,
    month: month ?? undefined,
  });

  if (!report) notFound();

  return (
    <div className="page-stack module-page employee-work-report-page" dir="rtl" lang="fa">
      <ModulePageHeader
        title="گزارش کارکرد"
        subtitle="گزارش ماهانه حضور، مرخصی، مأموریت، اضافه‌کاری و وضعیت تردد"
        titleHref={`/employees/${id}`}
      />
      <EmployeeWorkReportClient employeeId={id} report={report} />
    </div>
  );
}
