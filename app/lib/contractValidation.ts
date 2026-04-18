import type {
  ContractSubjectData,
  ContractPartiesData,
  ContractParty,
  ShareMode,
} from '../types/contract';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const REQUIRED_MSG = 'این فیلد الزامی است';

export function validateStep1(data: Partial<ContractSubjectData>): ValidationResult {
  const errors: Record<string, string> = {};

  const requiredFields: (keyof ContractSubjectData)[] = [
    'contractType',
    'contractDate',
    'contractNumber',
    'deliveryDate',
    'blockId',
    'unitId',
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      errors[field] = REQUIRED_MSG;
    }
  }

  const contractor = data.contractor;
  if (contractor?.type === 'employee') {
    if (!contractor.employeeId) {
      errors['contractor.employeeId'] = REQUIRED_MSG;
    }
  } else if (contractor?.type === 'former-employee') {
    if (!contractor.formerFirstName) {
      errors['contractor.formerFirstName'] = REQUIRED_MSG;
    }
    if (!contractor.formerLastName) {
      errors['contractor.formerLastName'] = REQUIRED_MSG;
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateShares(parties: ContractParty[], mode: ShareMode): ValidationResult {
  const errors: Record<string, string> = {};

  const total = parties.reduce((sum, p) => sum + (p.share?.value ?? 0), 0);

  if (mode === 'percent' && total > 100) {
    errors['shares'] = 'مجموع سهم‌ها نباید از ۱۰۰٪ تجاوز کند';
  } else if (mode === 'dang' && total > 6) {
    errors['shares'] = 'مجموع سهم‌ها نباید از ۶ دانگ تجاوز کند';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateStep2(data: Partial<ContractPartiesData>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.partyOne || data.partyOne.length === 0) {
    errors['partyOne'] = REQUIRED_MSG;
  }

  if (!data.partyTwo || data.partyTwo.length === 0) {
    errors['partyTwo'] = REQUIRED_MSG;
  }

  if (data.partyOne && data.partyOne.length > 0) {
    const mode = data.partyOne[0].share?.mode;
    if (mode) {
      const sharesResult = validateShares(data.partyOne, mode);
      Object.assign(errors, sharesResult.errors);
    }
  }

  if (data.partyTwo && data.partyTwo.length > 0) {
    const mode = data.partyTwo[0].share?.mode;
    if (mode) {
      const sharesResult = validateShares(data.partyTwo, mode);
      if (!sharesResult.valid) {
        errors['partyTwoShares'] = Object.values(sharesResult.errors)[0];
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
