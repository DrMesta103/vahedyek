import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FolderLock } from 'lucide-react';
import { getEmployee } from '../../../../lib/data';
import { DOCUMENT_CATEGORIES, listEmployeeDocuments, syncEmployeeDocumentReferences } from '../../../../lib/employee-documents';
import { EmployeeDocumentCenterClient } from './_components/EmployeeDocumentCenterClient';

export default async function EmployeeDocumentsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const query = await searchParams;
  const value = (key: string) => typeof query[key] === 'string' ? query[key] as string : '';
  const employee = await getEmployee(id);
  if (!employee) notFound();
  let result = await listEmployeeDocuments(id, { query: value('q'), category: value('category'), status: value('status'), sourceModule: value('sourceModule'), dateFrom: value('dateFrom'), dateTo: value('dateTo'), creator: value('creator') });
  if (result.access.canManage) {
    await syncEmployeeDocumentReferences(id);
    result = await listEmployeeDocuments(id, { query: value('q'), category: value('category'), status: value('status'), sourceModule: value('sourceModule'), dateFrom: value('dateFrom'), dateTo: value('dateTo'), creator: value('creator') });
  }
  const documents = result.documents.map((document) => ({
    ...document,
    createdAt: document.createdAt.toISOString(), updatedAt: document.updatedAt.toISOString(),
    archivedAt: document.archivedAt?.toISOString() ?? null,
  }));
  return <main className="page-stack" dir="rtl" lang="fa">
    <nav className="text-sm text-slate-500"><Link href={`/employees/${id}`}>پرونده {employee.firstName} {employee.lastName}</Link> / مرکز اسناد</nav>
    <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-bold text-slate-900">مرکز اسناد کارمند</h1><p className="mt-2 text-sm text-slate-600">مشاهده، جستجو و مدیریت تمام مدارک و مستندات مرتبط با کارمند</p></div><span className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 text-sm text-sky-800"><FolderLock className="h-4 w-4"/>فایل‌های حساس با دسترسی سمت سرور محافظت می‌شوند</span></header>
    <EmployeeDocumentCenterClient employeeId={id} documents={documents} categories={DOCUMENT_CATEGORIES} permissions={{ canUpload: result.access.canUpload, canEdit: result.access.canEdit, canArchive: result.access.canArchive, canDownload: result.access.canDownload }}/>
  </main>;
}
