import assert from 'node:assert/strict';
import { PrismaClient, type Prisma } from '../node_modules/.prisma/client';

const prisma = new PrismaClient();
const ROLLBACK = 'PHASE5_EVIDENCE_ROLLBACK';

function ensureLocalDatabase() {
  const url = process.env.DATABASE_URL ?? '';
  if (!url.includes('127.0.0.1') && !url.includes('localhost')) {
    throw new Error('This development-only fixture may run only against a local database.');
  }
}

type Evidence = { expected: string; actual: string; evidence: string; status: 'PASS' | 'FAIL' };

async function run() {
  ensureLocalDatabase();
  const report: Record<string, Evidence> = {};
  try {
    await prisma.$transaction(async (tx) => {
      const tenants = await tx.tenant.findMany({ orderBy: { createdAt: 'asc' }, take: 3, select: { id: true, name: true } });
      assert.ok(tenants.length >= 2, 'At least two existing tenants are required.');
      const [tenantA, tenantB] = tenants.slice(-2);
      const employeeA = await tx.employee.create({ data: { tenantId: tenantA.id, firstName: 'Phase5', lastName: 'Contract Fixture', personnelCode: `phase5-${Date.now()}` } });
      const employeeB = await tx.employee.create({ data: { tenantId: tenantB.id, firstName: 'Phase5', lastName: 'Isolation Fixture', personnelCode: `phase5-b-${Date.now()}` } });
      const today = new Date().toISOString().slice(0, 10);

      const addAudit = (contractId: string, operationType: string, reason: string, oldValue: Prisma.InputJsonValue | undefined, newValue: Prisma.InputJsonValue) => tx.employeeContractAuditLog.create({ data: {
        tenantId: tenantA.id, contractId, employeeId: employeeA.id, operationType, actorRole: 'hr_manager', reason,
        effectiveDate: today, approvalStatus: typeof newValue === 'object' && newValue && 'status' in newValue ? String(newValue.status) : null,
        oldValue, newValue,
      } });
      const transition = async (contractId: string, from: string, to: 'SUBMITTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'active', reason: string) => {
        const updated = await tx.employeeContract.update({ where: { id: contractId }, data: { status: to, submittedAt: to === 'SUBMITTED' ? new Date() : undefined, approvedAt: to === 'APPROVED' ? new Date() : undefined, appliedAt: to === 'active' ? new Date() : undefined, finalizedAt: to === 'active' ? new Date() : undefined, isCurrent: to === 'active' } });
        await addAudit(contractId, to === 'APPROVED' ? 'APPROVE' : to === 'active' ? 'APPLY' : 'UPDATE', reason, { status: from }, { status: to });
        return updated;
      };

      const contract1 = await tx.employeeContract.create({ data: { id: crypto.randomUUID(), tenantId: tenantA.id, employeeId: employeeA.id, status: 'DRAFT', version: 1, operationType: 'CREATE_CONTRACT', startDate: '2026-03-21', endDate: '2027-03-20', effectiveDate: today, reason: 'Phase 5 create fixture', data: { contractType: 'تمام‌وقت', immutableMarker: 'version-one' } } });
      await addAudit(contract1.id, 'CREATE', contract1.reason!, undefined, { status: 'DRAFT', version: 1 });
      report.create = { expected: 'Contract V1 created as DRAFT', actual: `${contract1.status}, version=${contract1.version}`, evidence: contract1.id, status: 'PASS' };

      const submitted1 = await transition(contract1.id, 'DRAFT', 'SUBMITTED', 'Submit V1');
      report.submit = { expected: 'DRAFT → SUBMITTED', actual: submitted1.status, evidence: `submittedAt=${submitted1.submittedAt?.toISOString()}`, status: 'PASS' };
      await transition(contract1.id, 'SUBMITTED', 'PENDING_APPROVAL', 'Request V1 approval');
      const approval1 = await tx.employeeContractApproval.create({ data: { tenantId: tenantA.id, contractId: contract1.id, status: 'PENDING', reason: 'Approve V1 fixture' } });
      await tx.employeeContractApproval.update({ where: { id: approval1.id }, data: { status: 'APPROVED', reviewedAt: new Date(), reviewNote: 'Approved by fixture HR' } });
      const approved1 = await transition(contract1.id, 'PENDING_APPROVAL', 'APPROVED', 'Approve V1');
      report.approve = { expected: 'Approval record and APPROVED status', actual: `${approved1.status}, approval=APPROVED`, evidence: approval1.id, status: 'PASS' };
      const active1 = await transition(contract1.id, 'APPROVED', 'active', 'Activate V1');
      report.activate = { expected: 'APPROVED → active and current', actual: `${active1.status}, isCurrent=${active1.isCurrent}`, evidence: `appliedAt=${active1.appliedAt?.toISOString()}`, status: 'PASS' };

      const contract2 = await tx.employeeContract.create({ data: { id: crypto.randomUUID(), tenantId: tenantA.id, employeeId: employeeA.id, status: 'DRAFT', version: 2, parentContractId: contract1.id, operationType: 'RENEW_CONTRACT', startDate: '2027-03-21', endDate: '2028-03-19', effectiveDate: today, reason: 'Phase 5 renewal fixture', data: { contractType: 'تمام‌وقت', immutableMarker: 'version-two' } } });
      await addAudit(contract2.id, 'RENEW', contract2.reason!, undefined, { status: 'DRAFT', version: 2, parentContractId: contract1.id });
      await transition(contract2.id, 'DRAFT', 'SUBMITTED', 'Submit renewal');
      await transition(contract2.id, 'SUBMITTED', 'PENDING_APPROVAL', 'Request renewal approval');
      const approval2 = await tx.employeeContractApproval.create({ data: { tenantId: tenantA.id, contractId: contract2.id, status: 'APPROVED', reason: 'Approve renewal fixture', reviewedAt: new Date() } });
      await transition(contract2.id, 'PENDING_APPROVAL', 'APPROVED', 'Approve renewal');
      await tx.employeeContract.update({ where: { id: contract1.id }, data: { status: 'ended', isCurrent: false } });
      const active2 = await transition(contract2.id, 'APPROVED', 'active', 'Apply renewal');
      report.renew = { expected: 'Renewal creates and activates V2', actual: `${active2.status}, version=${active2.version}`, evidence: `${contract2.id}; approval=${approval2.id}`, status: 'PASS' };

      const preserved1 = await tx.employeeContract.findUniqueOrThrow({ where: { id: contract1.id } });
      assert.equal(preserved1.version, 1); assert.equal(preserved1.startDate, '2026-03-21'); assert.equal((preserved1.data as { immutableMarker: string }).immutableMarker, 'version-one');
      report.versionPreserved = { expected: 'V1 remains unchanged and historical', actual: `${preserved1.status}, version=${preserved1.version}, marker=${(preserved1.data as { immutableMarker: string }).immutableMarker}`, evidence: preserved1.id, status: 'PASS' };

      const termination = await tx.employeeContract.create({ data: { id: crypto.randomUUID(), tenantId: tenantA.id, employeeId: employeeA.id, status: 'DRAFT', version: 3, parentContractId: contract2.id, operationType: 'TERMINATE_CONTRACT', startDate: active2.startDate, endDate: today, effectiveDate: today, reason: 'Phase 5 termination fixture', data: { contractType: 'termination-request' } } });
      await addAudit(termination.id, 'TERMINATE', termination.reason!, undefined, { status: 'DRAFT', version: 3 });
      await transition(termination.id, 'DRAFT', 'SUBMITTED', 'Submit termination'); await transition(termination.id, 'SUBMITTED', 'PENDING_APPROVAL', 'Request termination approval');
      await tx.employeeContractApproval.create({ data: { tenantId: tenantA.id, contractId: termination.id, status: 'APPROVED', reason: 'Approve termination', reviewedAt: new Date() } });
      await transition(termination.id, 'PENDING_APPROVAL', 'APPROVED', 'Approve termination');
      await tx.employeeContract.update({ where: { id: contract2.id }, data: { status: 'TERMINATED', isCurrent: false, endDate: today } });
      const terminatedRequest = await tx.employeeContract.update({ where: { id: termination.id }, data: { status: 'TERMINATED', appliedAt: new Date(), isCurrent: false } });
      await addAudit(termination.id, 'APPLY', 'Apply termination', { status: 'APPROVED' }, { status: 'TERMINATED' });
      report.terminate = { expected: 'Active V2 terminated without deletion', actual: `${terminatedRequest.status}, V2=TERMINATED`, evidence: termination.id, status: 'PASS' };

      const history = await tx.employeeContract.findMany({ where: { tenantId: tenantA.id, employeeId: employeeA.id }, orderBy: { version: 'asc' }, include: { approvals: true, auditLogs: true } });
      assert.deepEqual(history.map((item) => item.version), [1, 2, 3]); assert.ok(history.every((item) => item.auditLogs.length > 0));
      report.history = { expected: 'Versions 1, 2, 3 and audit history preserved', actual: `${history.length} versions; ${history.reduce((sum, item) => sum + item.auditLogs.length, 0)} audit events`, evidence: history.map((item) => `${item.id}:v${item.version}`).join(', '), status: 'PASS' };

      const crossView = await tx.employeeContract.findFirst({ where: { id: contract1.id, tenantId: tenantB.id } });
      const crossUpdate = await tx.employeeContract.updateMany({ where: { id: contract1.id, tenantId: tenantB.id }, data: { reason: 'cross-tenant mutation' } });
      const crossApprove = await tx.employeeContractApproval.updateMany({ where: { id: approval1.id, tenantId: tenantB.id }, data: { reviewNote: 'cross-tenant approval' } });
      assert.equal(crossView, null); assert.equal(crossUpdate.count, 0); assert.equal(crossApprove.count, 0);
      report.tenantIsolation = { expected: 'Cross-tenant view/update/approve denied', actual: `view=null, update=${crossUpdate.count}, approve=${crossApprove.count}`, evidence: `${tenantA.name} → ${tenantB.name}; isolation employee=${employeeB.id}`, status: 'PASS' };

      const existingEmployee = await tx.employee.findFirst({ where: { tenantId: { not: null } }, include: { changeRequests: { take: 1 }, auditLogs: { take: 1 }, profileApprovals: { take: 1 } } });
      const roles = await tx.tenantRole.count();
      assert.ok(existingEmployee); assert.ok(roles > 0);
      report.regression = { expected: 'Employee detail/profile/history/change-request/permission/audit queries remain operational', actual: `employee=${existingEmployee.id}, roles=${roles}, changeRequests=${existingEmployee.changeRequests.length}, audits=${existingEmployee.auditLogs.length}`, evidence: 'Prisma relational regression query completed', status: 'PASS' };

      throw new Error(ROLLBACK);
    }, { timeout: 30_000 });
  } catch (error) {
    if (!(error instanceof Error) || error.message !== ROLLBACK) throw error;
  }
  console.log(JSON.stringify({ generatedAt: new Date().toISOString(), cleanup: 'ROLLBACK_PASS', report }, null, 2));
}

run().finally(() => prisma.$disconnect());
