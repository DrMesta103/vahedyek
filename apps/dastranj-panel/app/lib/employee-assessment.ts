import { prisma } from './prisma';
import { getEmployeeAssessmentAccess } from './organization-unit-access';

export async function getEmployeeAssessmentCenter(employeeId: string) {
  const access = await getEmployeeAssessmentAccess(employeeId);
  if (!access.tenantId || !access.canView) return { access, employee: null, assessments: [], summary: null };
  const employee = await prisma.employee.findFirst({ where: { id: employeeId, tenantId: access.tenantId }, select: { id: true, firstName: true, lastName: true, personnelCode: true } });
  if (!employee) return { access, employee: null, assessments: [], summary: null };
  const rows = await prisma.employeeAssessment.findMany({ where: { tenantId: access.tenantId, employeeId }, orderBy: { assessmentDate: 'desc' }, include: { criteria: { include: { score: true } }, actions: true } });
  const assessments = access.isSelf ? rows.filter((item) => item.status === 'FINALIZED') : rows;
  const safe = assessments.map((item) => ({ ...item, managerNotes: access.canViewSensitive ? item.managerNotes : null, hrRecommendation: access.canViewSensitive ? item.hrRecommendation : null, nonRenewalRecommendation: access.canViewSensitive ? item.nonRenewalRecommendation : null, complaintData: access.canViewSensitive ? item.complaintData : null }));
  const finalized = safe.filter((item) => item.status === 'FINALIZED');
  const latest = finalized[0] ?? null;
  const openActions = safe.flatMap((item) => item.actions).filter((action) => action.status === 'OPEN');
  const strengths = latest?.criteria.filter((criterion) => Number(criterion.score?.score ?? 0) >= 80).map((criterion) => criterion.title) ?? [];
  const improvements = latest?.criteria.filter((criterion) => Number(criterion.score?.score ?? 0) < 60).map((criterion) => criterion.title) ?? [];
  return { access, employee, assessments: safe, summary: { latest, finalizedCount: finalized.length, pendingCount: safe.filter((item) => item.status === 'WAITING_APPROVAL').length, openActions, strengths, improvements } };
}
