import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildContractSubjectAuditDiff,
  formatBlockForAudit,
  formatContractorTypeForAudit,
  formatEmployeeForAudit,
  formatUnitForAudit,
  shortId,
  type ContractSubjectAuditLookup,
} from '../app/lib/audit-log-presenters';

const lookup: ContractSubjectAuditLookup = {
  tenantName: 'شرکت سازنده نمونه',
  employeesById: new Map([
    ['emp-1', { id: 'emp-1', firstName: 'علیرضا', lastName: 'محمدی', nationalCode: '0012345678' }],
    ['emp-2', { id: 'emp-2', firstName: 'رضا', lastName: 'حسینی', nationalCode: null }],
  ]),
  blocksById: new Map([['block-1', { id: 'block-1', name: 'A', mainPlate: '12', subPlate: '3' }]]),
  unitsById: new Map([['unit-1', { id: 'unit-1', name: '12', floorName: '2', blockId: 'block-1' }]]),
};

test('shortId keeps long identifiers traceable but compact', () => {
  assert.equal(shortId('cm0vp39h01aroy6adgmvyfcg'), 'cm0vp3…yfcg');
});

test('formatContractorTypeForAudit resolves self to tenant name', () => {
  assert.deepEqual(formatContractorTypeForAudit({ contractorType: 'self' }, lookup), {
    value: 'سازنده اصلی: شرکت سازنده نمونه',
    meta: undefined,
  });
});

test('formatEmployeeForAudit resolves employee names and keeps short technical id', () => {
  assert.deepEqual(formatEmployeeForAudit(lookup.employeesById.get('emp-1') ?? null, 'emp-1'), {
    value: 'علیرضا محمدی، کد ملی 0012345678',
    meta: 'شناسه کارمند: emp-1',
  });
});

test('formatUnitForAudit resolves unit, floor and block', () => {
  assert.deepEqual(formatUnitForAudit(lookup.unitsById.get('unit-1') ?? null, lookup, 'unit-1'), {
    value: 'واحد 12، طبقه 2، بلوک A',
    meta: 'شناسه واحد: unit-1',
  });
});

test('buildContractSubjectAuditDiff produces human-readable contractor and unit diffs', () => {
  const result = buildContractSubjectAuditDiff(
    { contractorType: 'self', contractorEmployeeId: null, unitId: null },
    { contractorType: 'employee', contractorEmployeeId: 'emp-2', unitId: 'unit-1' },
    lookup,
  );

  assert.deepEqual(result, [
    {
      field: 'contractorType',
      label: 'نوع سازنده',
      before: 'سازنده اصلی: شرکت سازنده نمونه',
      after: 'کارمند سازنده: رضا حسینی',
      beforeMeta: undefined,
      afterMeta: 'شناسه کارمند: emp-2',
    },
    {
      field: 'contractorEmployeeId',
      label: 'کارمند سازنده',
      before: 'خالی',
      after: 'رضا حسینی',
      beforeMeta: undefined,
      afterMeta: 'شناسه کارمند: emp-2',
    },
    {
      field: 'unitId',
      label: 'واحد',
      before: 'خالی',
      after: 'واحد 12، طبقه 2، بلوک A',
      beforeMeta: undefined,
      afterMeta: 'شناسه واحد: unit-1',
    },
  ]);
});

test('formatBlockForAudit reports unknown ids clearly', () => {
  assert.deepEqual(formatBlockForAudit(null, 'missing-block-id'), {
    value: 'بلوک ناشناس: missin…k-id',
    meta: 'رکورد بلوک برای این شناسه پیدا نشد: missing-block-id',
  });
});
