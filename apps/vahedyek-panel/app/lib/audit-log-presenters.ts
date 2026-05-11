import type { AuditDiff } from './audit-log';

type EmployeeLike = {
  id: string;
  firstName: string;
  lastName: string;
  nationalCode?: string | null;
} | null;

type BlockLike = {
  id: string;
  name: string;
  mainPlate?: string | null;
  subPlate?: string | null;
} | null;

type UnitLike = {
  id: string;
  name: string;
  floorName: string;
  blockId: string;
  block?: BlockLike;
} | null;

type SubjectLike = {
  contractorType?: unknown;
  contractorEmployeeId?: string | null;
  contractorFormerName?: string | null;
  contractType?: unknown;
  contractDate?: string | null;
  contractNumber?: string | null;
  deliveryDate?: string | null;
  blockId?: string | null;
  unitId?: string | null;
} | null;

export type ContractSubjectAuditLookup = {
  tenantName: string;
  employeesById: Map<string, EmployeeLike>;
  blocksById: Map<string, BlockLike>;
  unitsById: Map<string, UnitLike>;
};

const CONTRACTOR_TYPE_LABELS: Record<string, string> = {
  self: 'سازنده اصلی',
  employee: 'کارمند سازنده',
  former_employee: 'کارمند سابق',
  'former-employee': 'کارمند سابق',
};

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  sale: 'فروش',
  pre_sale: 'پیش‌فروش',
  'pre-sale': 'پیش‌فروش',
};

const SUBJECT_FIELD_LABELS: Record<keyof NonNullable<SubjectLike>, string> = {
  contractorType: 'نوع سازنده',
  contractorEmployeeId: 'کارمند سازنده',
  contractorFormerName: 'نام کارمند سابق',
  contractType: 'نوع قرارداد',
  contractDate: 'تاریخ قرارداد',
  contractNumber: 'شماره قرارداد',
  deliveryDate: 'تاریخ تحویل',
  blockId: 'بلوک',
  unitId: 'واحد',
};

export function shortId(value: unknown) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text) return '';
  if (text.length <= 12) return text;
  return `${text.slice(0, 6)}…${text.slice(-4)}`;
}

function normalizeValue(value: unknown) {
  if (value === null || value === undefined || value === '') return 'خالی';
  return String(value);
}

function rawComparable(value: unknown) {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function formatEmployeeForAudit(employee: EmployeeLike, id?: string | null) {
  if (employee) {
    const fullName = `${employee.firstName} ${employee.lastName}`.trim() || 'کارمند بدون نام';
    const nationalCode = employee.nationalCode ? `، کد ملی ${employee.nationalCode}` : '';
    return {
      value: `${fullName}${nationalCode}`,
      meta: `شناسه کارمند: ${shortId(employee.id)}`,
    };
  }

  if (id) {
    return {
      value: `شناسه ناشناس: ${shortId(id)}`,
      meta: `رکورد کارمند برای این شناسه پیدا نشد: ${id}`,
    };
  }

  return { value: 'خالی', meta: undefined };
}

export function formatBlockForAudit(block: BlockLike, id?: string | null) {
  if (block) {
    const plate = [block.mainPlate, block.subPlate].filter(Boolean).join('/');
    return {
      value: `بلوک ${block.name}${plate ? `، پلاک ${plate}` : ''}`,
      meta: `شناسه بلوک: ${shortId(block.id)}`,
    };
  }

  if (id) {
    return {
      value: `بلوک ناشناس: ${shortId(id)}`,
      meta: `رکورد بلوک برای این شناسه پیدا نشد: ${id}`,
    };
  }

  return { value: 'خالی', meta: undefined };
}

export function formatUnitForAudit(unit: UnitLike, lookup?: Pick<ContractSubjectAuditLookup, 'blocksById'>, id?: string | null) {
  if (unit) {
    const block = unit.block ?? lookup?.blocksById.get(unit.blockId) ?? null;
    const blockName = block?.name ? `، بلوک ${block.name}` : '';
    return {
      value: `واحد ${unit.name}، طبقه ${unit.floorName}${blockName}`,
      meta: `شناسه واحد: ${shortId(unit.id)}`,
    };
  }

  if (id) {
    return {
      value: `واحد ناشناس: ${shortId(id)}`,
      meta: `رکورد واحد برای این شناسه پیدا نشد: ${id}`,
    };
  }

  return { value: 'خالی', meta: undefined };
}

export function formatContractTypeForAudit(value: unknown) {
  const key = normalizeValue(value);
  return CONTRACT_TYPE_LABELS[key] ?? key;
}

export function formatContractorTypeForAudit(subject: SubjectLike, lookup: Pick<ContractSubjectAuditLookup, 'tenantName' | 'employeesById'>) {
  const type = normalizeValue(subject?.contractorType);
  if (type === 'self') {
    return {
      value: `سازنده اصلی: ${lookup.tenantName}`,
      meta: undefined,
    };
  }

  if (type === 'employee') {
    const employee = formatEmployeeForAudit(
      subject?.contractorEmployeeId ? lookup.employeesById.get(subject.contractorEmployeeId) ?? null : null,
      subject?.contractorEmployeeId,
    );
    return {
      value: employee.value === 'خالی' ? 'کارمند سازنده' : `کارمند سازنده: ${employee.value}`,
      meta: employee.meta,
    };
  }

  if (type === 'former_employee' || type === 'former-employee') {
    return {
      value: subject?.contractorFormerName ? `کارمند سابق: ${subject.contractorFormerName}` : 'کارمند سابق',
      meta: undefined,
    };
  }

  return { value: CONTRACTOR_TYPE_LABELS[type] ?? type, meta: undefined };
}

function formatSubjectField(field: keyof NonNullable<SubjectLike>, subject: SubjectLike, lookup: ContractSubjectAuditLookup) {
  switch (field) {
    case 'contractorType':
      return formatContractorTypeForAudit(subject, lookup);
    case 'contractorEmployeeId':
      return formatEmployeeForAudit(subject?.contractorEmployeeId ? lookup.employeesById.get(subject.contractorEmployeeId) ?? null : null, subject?.contractorEmployeeId);
    case 'contractType':
      return { value: formatContractTypeForAudit(subject?.contractType), meta: undefined };
    case 'blockId':
      return formatBlockForAudit(subject?.blockId ? lookup.blocksById.get(subject.blockId) ?? null : null, subject?.blockId);
    case 'unitId':
      return formatUnitForAudit(subject?.unitId ? lookup.unitsById.get(subject.unitId) ?? null : null, lookup, subject?.unitId);
    default:
      return { value: normalizeValue(subject?.[field]), meta: undefined };
  }
}

export function buildContractSubjectAuditDiff(before: SubjectLike, after: SubjectLike, lookup: ContractSubjectAuditLookup) {
  const fields = Object.keys(SUBJECT_FIELD_LABELS) as Array<keyof NonNullable<SubjectLike>>;
  return fields.reduce<AuditDiff[]>((items, field) => {
    if (rawComparable(before?.[field]) === rawComparable(after?.[field])) return items;
    const beforeValue = formatSubjectField(field, before, lookup);
    const afterValue = formatSubjectField(field, after, lookup);
    items.push({
      field,
      label: SUBJECT_FIELD_LABELS[field],
      before: beforeValue.value,
      after: afterValue.value,
      beforeMeta: beforeValue.meta,
      afterMeta: afterValue.meta,
    });
    return items;
  }, []);
}

function looksLikeRawId(value: string) {
  return /^[a-z0-9_-]{16,}$/i.test(value) || /^[0-9a-f]{8}-[0-9a-f-]{20,}$/i.test(value);
}

function coerceSubjectFieldForLegacy(field: string, value: string, lookup: ContractSubjectAuditLookup) {
  if (field === 'contractorType') {
    return formatContractorTypeForAudit({ contractorType: value }, lookup);
  }
  if (field === 'contractorEmployeeId') {
    return formatEmployeeForAudit(lookup.employeesById.get(value) ?? null, value === 'خالی' ? null : value);
  }
  if (field === 'contractType') {
    return { value: formatContractTypeForAudit(value), meta: undefined };
  }
  if (field === 'blockId') {
    return formatBlockForAudit(lookup.blocksById.get(value) ?? null, value === 'خالی' ? null : value);
  }
  if (field === 'unitId') {
    return formatUnitForAudit(lookup.unitsById.get(value) ?? null, lookup, value === 'خالی' ? null : value);
  }
  return { value, meta: undefined };
}

export function enrichLegacyContractSubjectDiff(diff: unknown, lookup: ContractSubjectAuditLookup) {
  if (!Array.isArray(diff)) return diff;
  const byField = new Map(
    diff
      .filter((item): item is AuditDiff => Boolean(item) && typeof item === 'object' && typeof (item as AuditDiff).field === 'string')
      .map((item) => [item.field, item]),
  );

  return diff.map((item) => {
    if (!item || typeof item !== 'object') return item;
    const current = item as AuditDiff;
    const beforeText = String(current.before ?? '');
    const afterText = String(current.after ?? '');
    const shouldEnrich =
      current.field === 'contractorType' ||
      current.field === 'contractorEmployeeId' ||
      current.field === 'contractType' ||
      current.field === 'blockId' ||
      current.field === 'unitId' ||
      looksLikeRawId(beforeText) ||
      looksLikeRawId(afterText);

    if (!shouldEnrich) return current;

    const employeeDiff = byField.get('contractorEmployeeId');
    const formerNameDiff = byField.get('contractorFormerName');
    const before =
      current.field === 'contractorType'
        ? formatContractorTypeForAudit(
            {
              contractorType: beforeText,
              contractorEmployeeId: employeeDiff?.before,
              contractorFormerName: formerNameDiff?.before,
            },
            lookup,
          )
        : coerceSubjectFieldForLegacy(current.field, beforeText, lookup);
    const after =
      current.field === 'contractorType'
        ? formatContractorTypeForAudit(
            {
              contractorType: afterText,
              contractorEmployeeId: employeeDiff?.after,
              contractorFormerName: formerNameDiff?.after,
            },
            lookup,
          )
        : coerceSubjectFieldForLegacy(current.field, afterText, lookup);
    return {
      ...current,
      before: before.value,
      after: after.value,
      beforeMeta: current.beforeMeta ?? before.meta,
      afterMeta: current.afterMeta ?? after.meta,
    };
  });
}
