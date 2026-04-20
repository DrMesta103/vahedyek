import { ContractType, ContractorType } from '@prisma/client';

export function parseContractorType(value: string) {
  switch (value) {
    case 'employee':
      return ContractorType.employee;
    case 'former-employee':
      return ContractorType.former_employee;
    default:
      return ContractorType.self;
  }
}

export function parseContractType(value: string) {
  return value === 'sale' ? ContractType.sale : ContractType.pre_sale;
}

export function serializeContractType(value: ContractType) {
  return value === ContractType.sale ? 'sale' : 'pre-sale';
}

export function serializeContractorType(value: ContractorType) {
  switch (value) {
    case ContractorType.employee:
      return 'employee';
    case ContractorType.former_employee:
      return 'former-employee';
    default:
      return 'self';
  }
}
