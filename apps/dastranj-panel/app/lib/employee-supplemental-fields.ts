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

export function isSupplementalProfileComplete(
  supplemental: EmployeeSupplementalProfile,
  employee: EmployeePartyDataSource,
) {
  return computeSupplementalCompleteness(supplemental, employee) >= 70;
}
