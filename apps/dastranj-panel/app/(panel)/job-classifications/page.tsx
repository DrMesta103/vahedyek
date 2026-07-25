import { prisma } from "../../lib/prisma";
import { getJobClassificationAccess, getJobEvaluationAccess } from "../../lib/organization-unit-access";
import { JobClassificationsClient } from "./_components/JobClassificationsClient";
import { GradeRankManager } from "./_components/GradeRankManager";

export default async function JobClassificationsPage() {
  const access = await getJobClassificationAccess();
  const evaluationAccess = await getJobEvaluationAccess();
  if (!access.tenantId || !access.canView)
    return (
      <main className="module-page">
        <div className="module-empty-state">
          <h1>دسترسی ندارید</h1>
          <p>مجوز مشاهده طبقه‌بندی شغلی را ندارید.</p>
        </div>
      </main>
    );
  const [families, levels, profiles, classifications, criteria, evaluations, grades, ranks] = await Promise.all([prisma.jobFamily.findMany({ where: { tenantId: access.tenantId }, include: { categories: { orderBy: { name: "asc" } } }, orderBy: { name: "asc" } }), prisma.jobLevel.findMany({ where: { tenantId: access.tenantId }, orderBy: { sortOrder: "asc" } }), prisma.jobProfile.findMany({ where: { tenantId: access.tenantId, status: "ACTIVE" }, select: { id: true, title: true, code: true }, orderBy: { title: "asc" } }), prisma.jobClassification.findMany({ where: { tenantId: access.tenantId }, include: { jobProfile: { select: { id: true, title: true, code: true, positions: { select: { id: true } } } }, family: { include: { categories: true } }, category: { select: { id: true, name: true } }, level: true }, orderBy: [{ jobProfile: { title: "asc" } }, { version: "desc" }] }), prisma.jobEvaluationCriterion.findMany({ where: { tenantId: access.tenantId }, orderBy: { title: "asc" } }), prisma.jobEvaluation.findMany({ where: { tenantId: access.tenantId, status: "ACTIVE" }, include: { jobProfile: { select: { id: true, title: true, code: true } } }, orderBy: { createdAt: "desc" } }), prisma.jobGrade.findMany({ where: { tenantId: access.tenantId }, include: { ranks: { orderBy: { sortOrder: "asc" } } }, orderBy: { sortOrder: "asc" } }), prisma.jobRank.findMany({ where: { tenantId: access.tenantId }, orderBy: { sortOrder: "asc" } })]);
  const cards = classifications.map((item) => ({ ...item, effectiveDate: item.effectiveDate.toISOString(), usageCount: item.jobProfile.positions.length, jobProfile: { id: item.jobProfile.id, title: item.jobProfile.title, code: item.jobProfile.code }, family: { ...item.family, categories: item.family.categories.map((category) => ({ id: category.id, name: category.name, code: category.code, status: category.status })) } }));
  return (
    <>
      <JobClassificationsClient families={families} levels={levels} profiles={profiles} classifications={cards} criteria={criteria} evaluations={evaluations.map((item) => ({ id: item.id, totalScore: item.totalScore?.toString() ?? null, evaluationLevel: item.evaluationLevel, jobProfile: item.jobProfile }))} grades={grades} ranks={ranks} access={{ ...access, canManageEvaluation: evaluationAccess.canManageEvaluation }} />
      <GradeRankManager grades={grades} access={access} />
    </>
  );
}
