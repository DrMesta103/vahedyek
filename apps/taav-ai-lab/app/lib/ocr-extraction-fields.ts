import type {
  OcrTemplateFieldSchema,
  OcrTemplateFieldType,
  OcrTemplateInputSchema,
  OcrTemplateOutputField,
} from './ocr-simulator-data';

export type OcrExtractionFieldType = 'string' | 'date' | 'number' | 'boolean';

export type OcrExtractionFieldDraft = {
  id: string;
  label: string;
  key: string;
  type: OcrExtractionFieldType;
  required: boolean;
  regex?: string;
  minLength?: number;
  maxLength?: number;
};

export type OcrExtractionFieldValidationResult = {
  fields: OcrExtractionFieldDraft[];
  errors: string[];
};

const FIELD_TYPE_TO_GRPC: Record<OcrExtractionFieldType, string> = {
  string: 'FIELD_TYPE_STRING',
  date: 'FIELD_TYPE_DATE',
  number: 'FIELD_TYPE_NUMBER',
  boolean: 'FIELD_TYPE_BOOLEAN',
};

const PERSIAN_WORD_KEY_MAP: Record<string, string> = {
  شماره: 'number',
  قرارداد: 'contract',
  تاریخ: 'date',
  مبلغ: 'amount',
  نام: 'name',
  خانوادگی: 'lastName',
  ملی: 'national',
  کد: 'code',
  شناسه: 'id',
  وضعیت: 'status',
  توضیحات: 'description',
  آدرس: 'address',
  تلفن: 'phone',
  موبایل: 'mobile',
  پدر: 'father',
  سند: 'document',
};

const PERSIAN_PHRASE_KEY_MAP: Record<string, string> = {
  'شماره قرارداد': 'contractNumber',
  'تاریخ قرارداد': 'contractDate',
  'مبلغ قرارداد': 'contractAmount',
  'کد ملی': 'nationalCode',
  'نام پدر': 'fatherName',
  'نام خانوادگی': 'lastName',
};

export function createDefaultExtractionFields(): OcrExtractionFieldDraft[] {
  return [createExtractionFieldDraft('شماره قرارداد', 1, { type: 'string', required: true })];
}

export function createExtractionFieldDraft(
  label: string,
  index: number,
  overrides: Partial<OcrExtractionFieldDraft> = {},
): OcrExtractionFieldDraft {
  const key = overrides.key?.trim() || slugifyExtractionKey(label, index);

  return {
    id: overrides.id || `field-${index}`,
    label,
    key,
    type: overrides.type ?? 'string',
    required: overrides.required ?? true,
    regex: overrides.regex,
    minLength: overrides.minLength,
    maxLength: overrides.maxLength,
  };
}

export function slugifyExtractionKey(label: string, index = 1) {
  const normalized = label.trim();
  if (!normalized) return `field_${index}`;
  if (PERSIAN_PHRASE_KEY_MAP[normalized]) return PERSIAN_PHRASE_KEY_MAP[normalized];

  const englishParts = normalized
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .match(/[A-Za-z0-9]+/g);

  if (englishParts?.length) {
    return toCamelCase(englishParts);
  }

  const persianParts = normalized
    .split(/[\s_\-،,؛:]+/)
    .map((part) => PERSIAN_WORD_KEY_MAP[part])
    .filter((part): part is string => Boolean(part));

  if (persianParts.length) {
    return toCamelCase(persianParts);
  }

  return `field_${index}`;
}

export function normalizeExtractionFields(fields: OcrExtractionFieldDraft[]) {
  const used = new Map<string, number>();

  return fields.map((field, index) => {
    const baseKey = sanitizeKey(field.key || slugifyExtractionKey(field.label, index + 1), index + 1);
    const seen = used.get(baseKey) ?? 0;
    used.set(baseKey, seen + 1);
    const key = seen === 0 ? baseKey : `${baseKey}${seen + 1}`;

    return {
      ...field,
      label: field.label.trim(),
      key,
      regex: cleanOptionalString(field.regex),
      minLength: cleanOptionalNumber(field.minLength),
      maxLength: cleanOptionalNumber(field.maxLength),
    };
  });
}

export function validateExtractionFields(fields: OcrExtractionFieldDraft[]): OcrExtractionFieldValidationResult {
  const normalized = normalizeExtractionFields(fields);
  const errors: string[] = [];

  if (normalized.length === 0) {
    errors.push('حداقل یک فیلد برای استخراج تعریف کنید.');
  }

  for (const [index, field] of normalized.entries()) {
    if (!field.label) {
      errors.push(`عنوان فیلد ${index + 1} الزامی است.`);
    }
    if (!field.key) {
      errors.push(`کلید فیلد ${index + 1} ساخته نشد؛ عنوان واضح‌تری وارد کنید.`);
    }
    if (field.regex) {
      try {
        new RegExp(field.regex);
      } catch {
        errors.push(`regex فیلد «${field.label || index + 1}» معتبر نیست.`);
      }
    }
    if (
      typeof field.minLength === 'number' &&
      typeof field.maxLength === 'number' &&
      field.minLength > field.maxLength
    ) {
      errors.push(`حداقل طول فیلد «${field.label}» نباید از حداکثر طول بیشتر باشد.`);
    }
  }

  return { fields: normalized, errors };
}

export function toRestExtractionFields(fields: OcrExtractionFieldDraft[]) {
  return normalizeExtractionFields(fields).map((field) => ({
    key: field.key,
    label: field.label,
    type: field.type,
    required: field.required,
    validation: buildRestValidation(field),
  }));
}

export function toGrpcExtractionFields(fields: OcrExtractionFieldDraft[]) {
  return normalizeExtractionFields(fields).map((field) => ({
    key: field.key,
    label: field.label,
    type: FIELD_TYPE_TO_GRPC[field.type],
    required: field.required,
    validation: buildGrpcValidation(field),
  }));
}

export function toTemplateSchema(fields: OcrExtractionFieldDraft[]): OcrTemplateInputSchema {
  return {
    fields: normalizeExtractionFields(fields).map<OcrTemplateFieldSchema>((field) => ({
      key: field.key,
      label: field.label,
      description: `فیلد داینامیک ${field.label}`,
      type: field.type as OcrTemplateFieldType,
      required: field.required,
      validation: {
        ...(field.regex ? { regex: field.regex } : {}),
        ...(typeof field.minLength === 'number' ? { min_length: field.minLength } : {}),
        ...(typeof field.maxLength === 'number' ? { max_length: field.maxLength } : {}),
      },
      normalization: field.type === 'string' ? { trim: true, collapse_spaces: true } : undefined,
    })),
  };
}

export function buildDemoOutputField(field: OcrExtractionFieldDraft): OcrTemplateOutputField {
  const value = getDemoValueForField(field);

  return {
    key: field.key,
    value,
    normalized_value: value,
    confidence: field.required ? 0.92 : 0.86,
    validation_status: 'valid',
    review_status: field.required ? 'accepted' : 'needs_review',
    warnings: field.required ? [] : ['optional_field_review_suggested'],
  };
}

export function getDemoValueForField(field: OcrExtractionFieldDraft) {
  if (field.type === 'date') return '1403/01/15';
  if (field.type === 'number') return '12345';
  if (field.type === 'boolean') return 'true';
  if (field.regex?.includes('\\d') || field.regex?.includes('[0-9')) return '123456';
  return `${field.label} نمونه`;
}

function buildRestValidation(field: OcrExtractionFieldDraft) {
  const validation = {
    ...(field.regex ? { regex: field.regex } : {}),
    ...(typeof field.minLength === 'number' ? { minLength: field.minLength } : {}),
    ...(typeof field.maxLength === 'number' ? { maxLength: field.maxLength } : {}),
    ...(field.type === 'date' ? { calendar: 'jalali', acceptedFormats: ['yyyy/MM/dd', 'yyyy-MM-dd'] } : {}),
  };

  return Object.keys(validation).length > 0 ? validation : {};
}

function buildGrpcValidation(field: OcrExtractionFieldDraft) {
  const validation = {
    ...(field.regex ? { regex: field.regex } : {}),
    ...(typeof field.minLength === 'number' ? { min_length: field.minLength } : {}),
    ...(typeof field.maxLength === 'number' ? { max_length: field.maxLength } : {}),
    ...(field.type === 'date' ? { calendar: 'jalali', accepted_formats: ['yyyy/MM/dd', 'yyyy-MM-dd'] } : {}),
  };

  return Object.keys(validation).length > 0 ? validation : {};
}

function toCamelCase(parts: string[]) {
  return parts
    .map((part, index) => {
      const clean = part.replace(/[^A-Za-z0-9]/g, '');
      if (!clean) return '';
      const lower = clean.charAt(0).toLowerCase() + clean.slice(1);
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

function sanitizeKey(key: string, index: number) {
  const trimmed = key.trim();
  if (!trimmed) return `field_${index}`;
  const clean = trimmed.replace(/[^A-Za-z0-9_]/g, '');
  if (!clean) return `field_${index}`;
  return /^[A-Za-z_]/.test(clean) ? clean : `field_${clean}`;
}

function cleanOptionalString(value?: string) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function cleanOptionalNumber(value?: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
}
