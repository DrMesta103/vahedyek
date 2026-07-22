export type EmployeeChangeOperation = 'DIRECT_EDIT' | 'ADD_RECORD' | 'STATUS_CHANGE' | 'CHANGE_REQUEST';

export type EmployeeEditPolicy = {
  fieldKey: string;
  category: string;
  operationType: EmployeeChangeOperation;
  requiresApproval: boolean;
  requiresReason: boolean;
  requiresAttachment: boolean;
  requiresEffectiveDate: boolean;
  sensitive: boolean;
  payrollImpact: boolean;
  contractImpact: boolean;
  historyRequired: boolean;
  allowedRoles: Array<'employee' | 'manager' | 'hr_manager' | 'owner' | 'admin'>;
  requireOtp: boolean;
};

const direct = (fieldKey: string, category: string): EmployeeEditPolicy => ({
  fieldKey, category, operationType: 'DIRECT_EDIT', requiresApproval: false, requiresReason: false,
  requiresAttachment: false, requiresEffectiveDate: false, sensitive: false, payrollImpact: false, contractImpact: false,
  historyRequired: true, allowedRoles: ['employee', 'manager', 'hr_manager', 'owner', 'admin'], requireOtp: false,
});

const request = (fieldKey: string, category: string, options: Partial<EmployeeEditPolicy> = {}): EmployeeEditPolicy => ({
  fieldKey, category, operationType: 'CHANGE_REQUEST', requiresApproval: true, requiresReason: true,
  requiresAttachment: false, requiresEffectiveDate: false, sensitive: true, payrollImpact: false, contractImpact: false,
  historyRequired: true, allowedRoles: ['hr_manager', 'owner', 'admin'], requireOtp: false,
  ...options,
});

export const EMPLOYEE_EDIT_POLICIES: Record<string, EmployeeEditPolicy> = {
  avatarUrl: direct('avatarUrl', 'PERSONAL'),
  firstName: direct('firstName', 'PERSONAL'),
  lastName: direct('lastName', 'PERSONAL'),
  personnelCode: request('personnelCode', 'ORGANIZATION'),
  nationalId: request('nationalId', 'IDENTITY', { requiresAttachment: true }),
  identityPhotoUrl: request('identityPhotoUrl', 'IDENTITY', { requiresAttachment: true }),
  birthDate: request('birthDate', 'IDENTITY', { requiresAttachment: true }),
  gender: request('gender', 'IDENTITY', { requiresAttachment: true }),
  mobile1: request('mobile1', 'CONTACT'),
  mobile2: request('mobile2', 'CONTACT'),
  email: request('email', 'CONTACT'),
  maritalStatus: request('maritalStatus', 'FAMILY', { requiresEffectiveDate: true, payrollImpact: true }),
  childrenCount: request('childrenCount', 'FAMILY', { requiresEffectiveDate: true, payrollImpact: true }),
  bankAccounts: request('bankAccounts', 'BANKING', { requiresAttachment: true, payrollImpact: true }),
  education: { ...direct('education', 'EDUCATION'), operationType: 'ADD_RECORD' },
  workHistory: { ...direct('workHistory', 'WORK_HISTORY'), operationType: 'ADD_RECORD' },
  skills: { ...direct('skills', 'SKILLS'), operationType: 'ADD_RECORD' },
  documents: { ...direct('documents', 'DOCUMENTS'), operationType: 'ADD_RECORD' },
  training: { ...direct('training', 'TRAINING'), operationType: 'ADD_RECORD' },
  workGroup: request('workGroup', 'ORGANIZATION', { operationType: 'STATUS_CHANGE', requiresEffectiveDate: true, contractImpact: true }),
  employmentStatus: request('employmentStatus', 'EMPLOYMENT', { operationType: 'STATUS_CHANGE', requiresEffectiveDate: true, payrollImpact: true, contractImpact: true }),
};

export function getEmployeeEditPolicy(fieldKey: string) {
  return EMPLOYEE_EDIT_POLICIES[fieldKey] ?? direct(fieldKey, 'PERSONAL');
}

export const EMPLOYEE_CHANGE_REASON_CODES = ['INITIAL_DATA_CORRECTION', 'LEGAL_CHANGE', 'NEW_DOCUMENT', 'EMPLOYEE_REQUEST', 'HR_ORDER', 'OTHER'] as const;
