import { prisma } from '../app/lib/prisma';
const tenantSlug = 'phase3-runtime';
const disabledEmployeeId = 'phase3-runtime-disabled';
const historicalEmployeeId = 'phase3-runtime-historical';

function assertLocalDatabase() {
  const databaseUrl = process.env.DATABASE_URL ?? '';
  if (!/(127\.0\.0\.1|localhost|host\.docker\.internal)/i.test(databaseUrl)) {
    throw new Error('This development-only fixture may run only against a local database.');
  }
}

async function ensureAudit(tenantId: string, employeeId: string, action: string, fieldKey: string) {
  const existing = await prisma.employeeAuditLog.findFirst({ where: { tenantId, employeeId, action, fieldKey } });
  if (!existing) {
    await prisma.employeeAuditLog.create({ data: { tenantId, employeeId, action, fieldKey, source: 'phase3_runtime_fixture' } });
  }
}

async function main() {
  assertLocalDatabase();
  const tenant = await prisma.tenant.findFirst({ where: { slug: tenantSlug }, select: { id: true } });
  if (!tenant) throw new Error(`Local tenant "${tenantSlug}" was not found.`);

  await prisma.employee.upsert({
    where: { id: disabledEmployeeId },
    create: {
      id: disabledEmployeeId,
      tenantId: tenant.id,
      personnelCode: disabledEmployeeId,
      firstName: 'Disabled',
      lastName: 'Profile',
      mobile1: '09120000001',
      email: 'phase3.disabled@local.test',
      isActive: false,
    },
    update: { isActive: false },
  });
  await ensureAudit(tenant.id, disabledEmployeeId, 'employee_disabled', 'isActive');
  await ensureAudit(tenant.id, disabledEmployeeId, 'profile_fixture_retained', 'profile');

  await prisma.employee.upsert({
    where: { id: historicalEmployeeId },
    create: {
      id: historicalEmployeeId,
      tenantId: tenant.id,
      personnelCode: historicalEmployeeId,
      firstName: 'Historical',
      lastName: 'Contract',
      mobile1: '09120000002',
      email: 'phase3.historical@local.test',
      isActive: true,
    },
    update: {},
  });
  await prisma.employeeContract.upsert({
    where: { id: 'phase3-runtime-historical-contract-ended' },
    create: {
      id: 'phase3-runtime-historical-contract-ended',
      tenantId: tenant.id,
      employeeId: historicalEmployeeId,
      status: 'ended',
      isCurrent: false,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      contractNumber: 'PHASE3-HIST-001',
      finalizedAt: new Date('2025-12-31T12:00:00.000Z'),
    },
    update: {},
  });
  await ensureAudit(tenant.id, historicalEmployeeId, 'contract_ended', 'contract');

  console.log(JSON.stringify({ disabledEmployeeId, historicalEmployeeId }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
