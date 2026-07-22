import { maritalStatusLabels } from './constants';
import { formatPersianJalaliDate } from './format-fa';
import type { EmployeeSupplementalProfile } from './employee-contract-drafts';

export type EmployeePartyFieldSource = 'supplemental' | 'employee';

type SupplementalScalarKey = Exclude<
  keyof EmployeeSupplementalProfile,
  'educationRecords' | 'jobRecords' | 'educationField' | 'educationDegree' | 'jobTitle' | 'firstContractDate'
>;

export type EmployeePartyField = {
  label: string;
  key: SupplementalScalarKey | 'nationalId' | 'maritalStatus' | 'childrenCount';
  source?: EmployeePartyFieldSource;
  format?: 'gender' | 'maritalStatus' | 'childrenCount' | 'date';
};

export type EmployeePartyFieldGroup =
  | {
      title: string;
      kind: 'fields';
      fields: EmployeePartyField[];
    }
  | {
      title: string;
      kind: 'educationRecords';
    }
  | {
      title: string;
      kind: 'jobRecords';
    };

export const EMPLOYEE_PARTY_FIELD_GROUPS: EmployeePartyFieldGroup[] = [
  {
    title: 'اطلاعات شخصی',
    kind: 'fields',
    fields: [
      { label: 'نام پدر', key: 'fatherName' },
      { label: 'کدملی', key: 'nationalId', source: 'employee' },
      { label: 'تاریخ تولد', key: 'birthDate', format: 'date' },
      { label: 'محل صدور شناسنامه', key: 'issuePlace' },
      { label: 'جنسیت', key: 'gender', format: 'gender' },
      { label: 'وضعیت تأهل', key: 'maritalStatus', source: 'employee', format: 'maritalStatus' },
      { label: 'تعداد فرزندان', key: 'childrenCount', source: 'employee', format: 'childrenCount' },
    ],
  },
  {
    title: 'اطلاعات تحصیلی',
    kind: 'educationRecords',
  },
  {
    title: 'اطلاعات شغلی',
    kind: 'jobRecords',
  },
  {
    title: 'اطلاعات نظام وظیفه',
    kind: 'fields',
    fields: [{ label: 'وضعیت نظام وظیفه', key: 'militaryStatus' }],
  },
  {
    title: 'اطلاعات آدرس',
    kind: 'fields',
    fields: [
      { label: 'کشور', key: 'country' },
      { label: 'استان', key: 'province' },
      { label: 'شهر', key: 'city' },
      { label: 'خیابان', key: 'street' },
      { label: 'کوچه', key: 'alley' },
      { label: 'نام ساختمان', key: 'buildingName' },
      { label: 'پلاک', key: 'plaque' },
      { label: 'طبقه', key: 'floor' },
      { label: 'واحد', key: 'unit' },
      { label: 'کد پستی سکونت', key: 'postalCode' },
    ],
  },
];

export type EmployeePartyDataSource = {
  nationalId?: string | null;
  maritalStatus?: string;
  childrenCount?: number;
};

export type EmployeeCompletionRequirementType = 'INITIAL_REQUIRED' | 'STAGED_REQUIRED' | 'OPTIONAL';
export type EmployeeCompletionStatus = 'COMPLETE' | 'INCOMPLETE' | 'NEEDS_REVIEW' | 'PENDING_APPROVAL' | 'REJECTED' | 'OPTIONAL_INCOMPLETE' | 'DUE_SOON' | 'EXPIRED';
export type EmployeeCompletionRule = {
  categoryKey: string; fieldKey: string; label: string; level: 1 | 2 | 3 | 4;
  requirementType: EmployeeCompletionRequirementType; weight: number; status: EmployeeCompletionStatus;
  deadline?: string; permissionKey?: string; requiresOtp: boolean; requiresApproval: boolean;
  lastReviewedAt?: string; actionHref: string;
};

/** Central, data-backed baseline rules. Optional records never affect the score. */
export const EMPLOYEE_PROFILE_COMPLETION_RULES: Omit<EmployeeCompletionRule, 'status'>[] = [
  { categoryKey: 'personal', fieldKey: 'firstName', label: 'نام', level: 1, requirementType: 'INITIAL_REQUIRED', weight: 1, requiresOtp: false, requiresApproval: false, actionHref: '/employees' },
  { categoryKey: 'personal', fieldKey: 'lastName', label: 'نام خانوادگی', level: 1, requirementType: 'INITIAL_REQUIRED', weight: 1, requiresOtp: false, requiresApproval: false, actionHref: '/employees' },
  { categoryKey: 'contact', fieldKey: 'mobile1', label: 'موبایل', level: 1, requirementType: 'INITIAL_REQUIRED', weight: 1, permissionKey: 'employees.sensitive.update', requiresOtp: false, requiresApproval: false, actionHref: '/employees' },
  { categoryKey: 'personal', fieldKey: 'nationalId', label: 'کد ملی', level: 1, requirementType: 'INITIAL_REQUIRED', weight: 1, permissionKey: 'employees.sensitive.update', requiresOtp: false, requiresApproval: false, actionHref: '/employees' },
  { categoryKey: 'address', fieldKey: 'city', label: 'شهر محل سکونت', level: 2, requirementType: 'STAGED_REQUIRED', weight: 1, requiresOtp: false, requiresApproval: false, actionHref: '/profile' },
  { categoryKey: 'education', fieldKey: 'educationRecords', label: 'تحصیلات', level: 3, requirementType: 'STAGED_REQUIRED', weight: 1, requiresOtp: false, requiresApproval: false, actionHref: '/profile' },
  { categoryKey: 'preferences', fieldKey: 'preferences', label: 'ترجیحات کاری', level: 3, requirementType: 'OPTIONAL', weight: 0, requiresOtp: false, requiresApproval: false, actionHref: '/profile' },
  { categoryKey: 'health', fieldKey: 'health', label: 'سلامت و رفاه', level: 4, requirementType: 'OPTIONAL', weight: 0, permissionKey: 'employees.health.update', requiresOtp: false, requiresApproval: false, actionHref: '/profile' },
];

/** Extension point for a future OTP provider. No verification is implied until one is connected. */
export function requiresOtpVerification(rule: Pick<EmployeeCompletionRule, 'requiresOtp'>) {
  return rule.requiresOtp;
}

function displayStatValue(value: string) {
  return value.trim() ? value : 'ثبت نشده';
}

function formatGender(value: string) {
  if (value === 'male') return 'مرد';
  if (value === 'female') return 'زن';
  if (value === 'other') return 'سایر';
  return '';
}

function formatMaritalStatus(value: string) {
  return maritalStatusLabels[value as keyof typeof maritalStatusLabels] ?? value;
}

function formatChildrenCount(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 'ثبت نشده';
  return `${value.toLocaleString('fa-IR')} فرزند`;
}

function formatDateValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 'ثبت نشده';
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return formatPersianJalaliDate(parsed);
}

export function resolveEmployeePartyFieldValue(
  field: EmployeePartyField,
  supplemental: EmployeeSupplementalProfile,
  employee: EmployeePartyDataSource,
) {
  const source = field.source ?? 'supplemental';
  const raw =
    source === 'employee'
      ? field.key === 'nationalId'
        ? employee.nationalId
        : field.key === 'maritalStatus'
          ? employee.maritalStatus
          : field.key === 'childrenCount'
            ? employee.childrenCount
            : ''
      : supplemental[field.key as SupplementalScalarKey];

  if (field.format === 'gender') return displayStatValue(formatGender(String(raw ?? '')));
  if (field.format === 'maritalStatus') return displayStatValue(formatMaritalStatus(String(raw ?? '')));
  if (field.format === 'childrenCount') return formatChildrenCount(Number(raw ?? 0));
  if (field.format === 'date') return formatDateValue(String(raw ?? ''));

  return displayStatValue(String(raw ?? ''));
}

function collectCompletenessValues(supplemental: EmployeeSupplementalProfile, employee: EmployeePartyDataSource) {
  const values: string[] = [];

  EMPLOYEE_PARTY_FIELD_GROUPS.forEach((group) => {
    if (group.kind === 'fields') {
      group.fields.forEach((field) => {
        values.push(resolveEmployeePartyFieldValue(field, supplemental, employee));
      });
      return;
    }

    if (group.kind === 'educationRecords') {
      supplemental.educationRecords.forEach((record) => {
        values.push(displayStatValue(record.field));
        values.push(displayStatValue(record.degree));
      });
      return;
    }

    supplemental.jobRecords.forEach((record) => {
      values.push(displayStatValue(record.title));
      values.push(formatDateValue(record.startDate));
    });
  });

  return values;
}

export function computeSupplementalCompleteness(
  supplemental: EmployeeSupplementalProfile,
  employee: EmployeePartyDataSource,
) {
  const values = collectCompletenessValues(supplemental, employee);
  const filled = values.filter((value) => value !== 'ثبت نشده').length;
  return values.length ? Math.round((filled / values.length) * 100) : 0;
}

export function getEmployeeCompletionRules(supplemental: EmployeeSupplementalProfile, employee: EmployeePartyDataSource & { firstName?: string; lastName?: string; mobile1?: string | null }) {
  return EMPLOYEE_PROFILE_COMPLETION_RULES.map((rule) => {
    const raw = rule.fieldKey === 'firstName' ? employee.firstName : rule.fieldKey === 'lastName' ? employee.lastName : rule.fieldKey === 'mobile1' ? employee.mobile1 : rule.fieldKey === 'nationalId' ? employee.nationalId : rule.fieldKey === 'city' ? supplemental.city : rule.fieldKey === 'educationRecords' ? supplemental.educationRecords.length : null;
    const complete = typeof raw === 'number' ? raw > 0 : Boolean(String(raw ?? '').trim());
    return { ...rule, status: complete ? 'COMPLETE' as const : rule.requirementType === 'OPTIONAL' ? 'OPTIONAL_INCOMPLETE' as const : 'INCOMPLETE' as const };
  });
}

export type EmployeeCategoryKey = 'PERSONAL'|'CONTACT'|'FAMILY'|'EDUCATION'|'WORK_HISTORY'|'SKILLS'|'ORGANIZATION'|'MILITARY'|'ADDRESS'|'INTERESTS'|'WORK_PREFERENCES'|'HEALTH'|'DOCUMENTS'|'BANKING'|'TRAINING'|'ACCESS'|'HISTORY';
export type EmployeeCategoryResult = { categoryKey: EmployeeCategoryKey; title: string; source: string; level: 1|2|3|4; availability: 'FUNCTIONAL'|'COMING_SOON'|'HIDDEN'|'NO_ACCESS'; status: EmployeeCompletionStatus|'COMING_SOON'|'NO_ACCESS'; completionPercent: number; completedFields: number; totalRequiredFields: number; missingFields: string[]; deadlineAt?: string; actionHref?: string; actionLabel?: string; };
const CATEGORY_META: Array<Omit<EmployeeCategoryResult, 'availability'|'status'|'completionPercent'|'completedFields'|'totalRequiredFields'|'missingFields'>> = [
['PERSONAL','اطلاعات شخصی','Employee',1,'/profile#personal'],['CONTACT','اطلاعات تماس','Employee',1,'/profile#contact'],['FAMILY','اطلاعات خانوادگی','Supplemental profile',2,'/profile#family'],['EDUCATION','اطلاعات تحصیلی','Supplemental profile',3,'/profile#education'],['WORK_HISTORY','سوابق شغلی','Supplemental profile',3,'/profile#work-history'],['SKILLS','مهارت‌ها','EmployeeSkill',3,'/profile#skills'],['ORGANIZATION','اطلاعات سازمانی','Assignment/WorkGroup',2,'/profile#organization'],['MILITARY','نظام وظیفه','Supplemental profile',2,'/profile#military'],['ADDRESS','آدرس','Supplemental profile',2,'/profile#address'],['INTERESTS','علایق','EmployeeInterest',4,'/profile#interests'],['WORK_PREFERENCES','ترجیحات کاری','EmployeeWorkPreference',3,'/profile#preferences'],['HEALTH','سلامت و رفاه','EmployeeHealthProfile',4,'/profile#health'],['DOCUMENTS','مدارک','No document module',2,''],['BANKING','اطلاعات بانکی','Employee.bankAccounts',2,'/bank-accounts'],['TRAINING','آموزش','No training module',3,''],['ACCESS','دسترسی‌ها','UserTenantMembership',2,'/profile#access'],['HISTORY','تاریخچه','EmployeeAuditLog',2,'/history'],
].map(([categoryKey,title,source,level,actionHref]) => ({ categoryKey: categoryKey as EmployeeCategoryKey, title: title as string, source: source as string, level: level as 1|2|3|4, actionHref: actionHref as string, actionLabel: actionHref ? 'مشاهده و تکمیل' : undefined }));

export function buildEmployeeCategoryMatrix(input: { supplemental: EmployeeSupplementalProfile; employee: { firstName: string; lastName: string; nationalId?: string|null; mobile1?: string|null; hasOrganization?: boolean; hasBank?: boolean; hasAccess?: boolean; employmentStartDate?: string|null }; skills: number; interests: number; hasPreferences: boolean; hasHealthAccess: boolean; hasHealth: boolean; healthApprovalStatus?: 'NOT_STARTED'|'SUBMITTED'|'PENDING_APPROVAL'|'APPROVED'|'REJECTED'|null; historyCount: number; }) {
  const checks: Partial<Record<EmployeeCategoryKey, Array<[string, boolean, boolean]>>> = {
    PERSONAL: [['نام',!!input.employee.firstName,true],['نام خانوادگی',!!input.employee.lastName,true],['کد ملی',!!input.employee.nationalId,true]],
    CONTACT: [['موبایل',!!input.employee.mobile1,true]], FAMILY: [['نام پدر',!!input.supplemental.fatherName,false]], EDUCATION: [['رکورد تحصیلی',input.supplemental.educationRecords.length>0,true]], WORK_HISTORY: [['سابقه شغلی',input.supplemental.jobRecords.length>0,false]], SKILLS: [['مهارت',input.skills>0,true]], ORGANIZATION: [['انتساب سازمانی',!!input.employee.hasOrganization,true]], MILITARY: [['وضعیت نظام وظیفه',!!input.supplemental.militaryStatus,false]], ADDRESS: [['شهر',!!input.supplemental.city,true]], INTERESTS: [['علاقه‌مندی',input.interests>0,false]], WORK_PREFERENCES: [['ترجیحات',input.hasPreferences,false]], BANKING: [['حساب بانکی',!!input.employee.hasBank,true]], ACCESS: [['عضویت کاربر',!!input.employee.hasAccess,false]], HISTORY: [['رویداد',input.historyCount>0,false]],
  };
  return CATEGORY_META.map((meta) => {
    if (meta.categoryKey === 'DOCUMENTS' || meta.categoryKey === 'TRAINING') return { ...meta, availability: 'COMING_SOON' as const, status: 'COMING_SOON' as const, completionPercent: 0, completedFields: 0, totalRequiredFields: 0, missingFields: [] };
    if (meta.categoryKey === 'HEALTH' && !input.hasHealthAccess) return { ...meta, availability: 'HIDDEN' as const, status: 'NO_ACCESS' as const, completionPercent: 0, completedFields: 0, totalRequiredFields: 0, missingFields: [] };
    const fields = meta.categoryKey === 'HEALTH' ? [['سلامت و رفاه', input.hasHealth, false] as [string,boolean,boolean]] : (checks[meta.categoryKey] ?? []);
    const required = fields.filter(([, , required]) => required); const completed = fields.filter(([, value]) => value); const missing = required.filter(([ , value]) => !value).map(([label]) => label);
    const optional = required.length === 0;
    const healthStatus = meta.categoryKey === 'HEALTH' ? input.healthApprovalStatus : null;
    const approvalStatus = healthStatus === 'SUBMITTED' || healthStatus === 'PENDING_APPROVAL' ? 'PENDING_APPROVAL' as const : healthStatus === 'REJECTED' ? 'REJECTED' as const : healthStatus === 'APPROVED' ? 'COMPLETE' as const : undefined;
    const deadlineAt = meta.categoryKey === 'BANKING' && input.employee.employmentStartDate ? (() => { const date = new Date(input.employee.employmentStartDate); return Number.isNaN(date.getTime()) ? undefined : new Date(date.setDate(date.getDate() + 7)).toISOString(); })() : undefined;
    const deadlineStatus = !missing.length || !deadlineAt ? undefined : (() => { const remainingDays = Math.ceil((new Date(deadlineAt).getTime() - Date.now()) / 86_400_000); return remainingDays < 0 ? 'EXPIRED' as const : remainingDays <= 3 ? 'DUE_SOON' as const : undefined; })();
    return { ...meta, availability: 'FUNCTIONAL' as const, status: approvalStatus ?? deadlineStatus ?? (missing.length ? 'INCOMPLETE' as const : optional && !completed.length ? 'OPTIONAL_INCOMPLETE' as const : 'COMPLETE' as const), completionPercent: required.length ? Math.round((required.length - missing.length) * 100 / required.length) : completed.length ? 100 : 0, completedFields: completed.length, totalRequiredFields: required.length, missingFields: missing, deadlineAt };
  });
}

export function isSupplementalProfileComplete(
  supplemental: EmployeeSupplementalProfile,
  employee: EmployeePartyDataSource,
) {
  return computeSupplementalCompleteness(supplemental, employee) >= 70;
}
