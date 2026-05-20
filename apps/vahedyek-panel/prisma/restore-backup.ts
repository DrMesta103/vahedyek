import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '../node_modules/.prisma/client';

const prisma = new PrismaClient();

const backupDir =
  process.argv[2]
  || path.resolve(process.cwd(), 'prisma', 'backups', 'local-before-prod-sync-2026-05-20T05-00-41-139Z');

const dateKeys = new Set([
  'createdAt',
  'updatedAt',
  'expiresAt',
  'approvalLastRejectedAt',
]);

const loadOrder = [
  ['Tenant', 'tenant'],
  ['AppUser', 'appUser'],
  ['TenantBusinessProfileSettings', 'tenantBusinessProfileSettings'],
  ['TenantContractRuleSettings', 'tenantContractRuleSettings'],
  ['Employee', 'employee'],
  ['FormerEmployee', 'formerEmployee'],
  ['Block', 'block'],
  ['ProjectPlate', 'projectPlate'],
  ['DirectoryPerson', 'directoryPerson'],
  ['ApprovalWorkflow', 'approvalWorkflow'],
  ['UserTenantMembership', 'userTenantMembership'],
  ['TenantRole', 'tenantRole'],
  ['TenantRolePermission', 'tenantRolePermission'],
  ['TenantRoleMenuPermission', 'tenantRoleMenuPermission'],
  ['UserTenantMembershipRole', 'userTenantMembershipRole'],
  ['BlockFloor', 'blockFloor'],
  ['Unit', 'unit'],
  ['ContractDraft', 'contractDraft'],
  ['Session', 'session'],
  ['AuditLog', 'auditLog'],
  ['DirectoryRepresentative', 'directoryRepresentative'],
  ['ContractApprovalInstance', 'contractApprovalInstance'],
  ['ContractApprovalDecision', 'contractApprovalDecision'],
  ['ContractSubject', 'contractSubject'],
  ['ContractParties', 'contractParties'],
  ['ContractPartyMember', 'contractPartyMember'],
  ['ContractFinancial', 'contractFinancial'],
  ['FinancialCategory', 'financialCategory'],
  ['FinancialDueItem', 'financialDueItem'],
  ['ContractPenalties', 'contractPenalties'],
  ['ContractPenaltyType', 'contractPenaltyType'],
  ['ContractPenaltyRule', 'contractPenaltyRule'],
  ['ContractExtraCosts', 'contractExtraCosts'],
  ['ContractTechnicalSpecs', 'contractTechnicalSpecs'],
  ['ContractAttachments', 'contractAttachments'],
  ['TerminationRules', 'terminationRules'],
  ['ContractReceipt', 'contractReceipt'],
  ['ContractCustomerWalletLedger', 'contractCustomerWalletLedger'],
  ['ContractAppendix', 'contractAppendix'],
  ['ContractAppendixItem', 'contractAppendixItem'],
  ['ContractAppendixApprovalInstance', 'contractAppendixApprovalInstance'],
  ['ContractAppendixApprovalDecision', 'contractAppendixApprovalDecision'],
  ['DevPageThread', 'devPageThread'],
  ['DevPageMessage', 'devPageMessage'],
  ['DevPageDocument', 'devPageDocument'],
  ['DevPageDocumentEvent', 'devPageDocumentEvent'],
  ['DevPageDocumentReadState', 'devPageDocumentReadState'],
] as const;

function normalizeRecord(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeRecord);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(input)) {
    if (typeof entry === 'string' && dateKeys.has(key) && entry) {
      output[key] = new Date(entry);
      continue;
    }

    output[key] = normalizeRecord(entry);
  }

  return output;
}

async function readRows(fileName: string) {
  const filePath = path.join(backupDir, `${fileName}.json`);
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw) as unknown[];
  return parsed.map((row) => normalizeRecord(row));
}

async function truncateAllTables() {
  const tableNames = loadOrder.map(([tableName]) => `"${tableName}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`);
}

async function insertInChunks(delegateName: string, rows: unknown[]) {
  const delegate = (prisma as Record<string, any>)[delegateName];
  const chunkSize = 200;

  for (let index = 0; index < rows.length; index += chunkSize) {
    const chunk = rows.slice(index, index + chunkSize);
    await delegate.createMany({ data: chunk });
  }
}

async function main() {
  console.log(`Restoring backup from ${backupDir}`);
  await truncateAllTables();

  for (const [fileName, delegateName] of loadOrder) {
    const rows = await readRows(fileName);
    if (rows.length === 0) {
      console.log(`${fileName}: skipped (0 rows)`);
      continue;
    }

    await insertInChunks(delegateName, rows);
    console.log(`${fileName}: restored ${rows.length} rows`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Backup restore failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
