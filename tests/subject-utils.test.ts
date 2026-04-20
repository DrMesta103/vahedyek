import test from 'node:test';
import assert from 'node:assert/strict';
import { ContractType, ContractorType } from '@prisma/client';
import { validateStep1 } from '../app/lib/contractValidation';
import { parseContractorType, parseContractType, serializeContractorType, serializeContractType } from '../app/lib/subjectUtils';
import type { ContractSubjectData } from '../app/types/contract';

function makeValidSubjectData(overrides: Partial<ContractSubjectData> = {}): ContractSubjectData {
  return {
    contractor: { type: 'self' },
    contractType: 'sale',
    contractDate: '1405/01/20',
    contractNumber: 'SALE-1001',
    deliveryDate: '1405/02/20',
    blockId: 'block-001',
    unitId: 'unit-001',
    ...overrides,
  };
}

test('validateStep1 accepts complete subject data for sale contracts', () => {
  const result = validateStep1(makeValidSubjectData());

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
});

test('validateStep1 rejects incomplete former employee contractor data', () => {
  const result = validateStep1(
    makeValidSubjectData({
      contractor: {
        type: 'former-employee',
        formerFirstName: 'رضا',
        formerLastName: '',
      },
    }),
  );

  assert.equal(result.valid, false);
  assert.equal(result.errors['contractor.formerLastName'], 'این فیلد الزامی است');
});

test('validateStep1 rejects incomplete employee contractor data', () => {
  const result = validateStep1(
    makeValidSubjectData({
      contractor: {
        type: 'employee',
        employeeId: '',
      },
    }),
  );

  assert.equal(result.valid, false);
  assert.equal(result.errors['contractor.employeeId'], 'این فیلد الزامی است');
});

test('parseContractType handles both sale and pre-sale', () => {
  assert.equal(parseContractType('sale'), ContractType.sale);
  assert.equal(parseContractType('pre-sale'), ContractType.pre_sale);
});

test('serializeContractType handles both sale and pre-sale', () => {
  assert.equal(serializeContractType(ContractType.sale), 'sale');
  assert.equal(serializeContractType(ContractType.pre_sale), 'pre-sale');
});

test('parseContractorType handles all supported contractor types', () => {
  assert.equal(parseContractorType('self'), ContractorType.self);
  assert.equal(parseContractorType('employee'), ContractorType.employee);
  assert.equal(parseContractorType('former-employee'), ContractorType.former_employee);
});

test('serializeContractorType handles all supported contractor types', () => {
  assert.equal(serializeContractorType(ContractorType.self), 'self');
  assert.equal(serializeContractorType(ContractorType.employee), 'employee');
  assert.equal(serializeContractorType(ContractorType.former_employee), 'former-employee');
});
