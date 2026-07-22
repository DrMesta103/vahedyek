import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJobEvaluationAccess } from '../../../../lib/organization-unit-access';
import { prisma } from '../../../../lib/prisma';
import { EvaluationForm } from './EvaluationForm';

export default async function JobEvaluationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const access = await getJobEvaluationAccess(); if (!access.tenantId || !access.canManageEvaluation) return <main className="module-page"><div className="module-empty-state"><h1>دسترسی ندارید</h1><p>مجوز مدیریت ارزیابی مشاغل را ندارید.</p></div></main>;
  const [classification, criteria, levels, grades, ranks] = await Promise.all([prisma.jobClassification.findFirst({ where: { id, tenantId: access.tenantId, status: 'ACTIVE' }, include: { jobProfile: true } }), prisma.jobEvaluationCriterion.findMany({ where: { tenantId: access.tenantId, status: 'ACTIVE' }, orderBy: { title: 'asc' } }), prisma.jobLevel.findMany({ where: { tenantId: access.tenantId, status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } }), prisma.jobGrade.findMany({ where: { tenantId: access.tenantId, status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } }), prisma.jobRank.findMany({ where: { tenantId: access.tenantId, status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' } })]); if (!classification) notFound();
  return <main className="page-stack module-page" dir="rtl"><header className="module-page-header"><div><p className="module-page-eyebrow">اجرای ارزیابی</p><h1>{classification.jobProfile.title}</h1><p>امتیازدهی وزنی و تولید پیشنهاد سطح، گرید و رتبه</p></div><Link href={`/job-classifications/${id}`}>بازگشت به جزئیات</Link></header>{criteria.length ? <EvaluationForm classificationId={id} criteria={criteria} levels={levels} grades={grades} ranks={ranks} /> : <div className="module-empty-state"><h2>معیار فعالی وجود ندارد</h2><p>ابتدا معیارهای ارزیابی را در Workspace تعریف کنید.</p></div>}</main>;
}
