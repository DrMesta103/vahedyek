import { getActiveTenantStorageId } from './payroll-business-settings';

export type NamingPatternUsageType =
  | 'contract_number'
  | 'draft_template_name'
  | 'employee_number';

export type NamingPatternPartType =
  | 'year'
  | 'year_2digit'
  | 'month'
  | 'month_2digit'
  | 'day'
  | 'day_2digit'
  | 'text'
  | 'static_text'
  | 'separator'
  | 'space'
  | 'sequence'
  | 'letter_series'
  | 'employee_name'
  | 'employee_code'
  | 'national_code'
  | 'job_title'
  | 'business_name'
  | 'business_code'
  | 'contract_type'
  | 'template_type';

export type NamingPatternResetPolicy = 'never' | 'yearly' | 'monthly' | 'daily';
export type NamingPatternAlphabetType = 'english' | 'persian';

export type NamingPatternPartConfig = {
  mode?: 'fixed' | 'placeholder';
  text?: string;
  value?: string;
  customValue?: string;
  placeholderKey?: string | null;
  label?: string;
  startFrom?: number;
  currentValue?: number;
  step?: number;
  paddingLength?: number;
  resetPolicy?: NamingPatternResetPolicy;
  alphabetType?: NamingPatternAlphabetType;
  startLetter?: string;
  currentLetter?: string;
  incrementWhenSequenceReachesMax?: boolean;
  sequenceMax?: number;
  resetSequenceOnLetterChange?: boolean;
};

export type NamingPatternPart = {
  id: string;
  type: NamingPatternPartType;
  order: number;
  config: NamingPatternPartConfig;
};

export type NamingPatternSequenceState = {
  currentValue: number;
  currentLetter: string | null;
  lastGeneratedAt: string | null;
  resetPolicy: NamingPatternResetPolicy;
};

export type NamingPattern = {
  id: string;
  tenantId?: string | null;
  name: string;
  usageType: NamingPatternUsageType;
  isDefault: boolean;
  isActive: boolean;
  direction?: 'rtl' | 'ltr';
  parts: NamingPatternPart[];
  sequenceState?: NamingPatternSequenceState | null;
  createdAt: string;
  updatedAt: string;
};

export type NamingPatternContext = {
  date?: string | Date | null;
  employee?: {
    name?: string | null;
    code?: string | null;
    nationalCode?: string | null;
    jobTitle?: string | null;
  } | null;
  business?: {
    name?: string | null;
    code?: string | null;
  } | null;
  contract?: {
    type?: string | null;
  } | null;
  template?: {
    type?: string | null;
  } | null;
  placeholders?: Record<string, string | null | undefined>;
};

export type GenerateNamingPatternInput = {
  pattern: NamingPattern;
  context?: NamingPatternContext;
  mode?: 'preview' | 'commit';
  sequenceOffset?: number;
};

export const NAMING_PATTERNS_STORAGE_KEY = 'dastranj-naming-patterns-v1';

export const NAMING_PATTERN_USAGE_OPTIONS: Array<{ value: NamingPatternUsageType; label: string }> = [
  { value: 'draft_template_name', label: 'نام قالب پیش‌نویس قرارداد' },
  { value: 'contract_number', label: 'شماره قرارداد' },
  { value: 'employee_number', label: 'شماره پرسنلی' },
];

export const NAMING_PATTERN_PART_OPTIONS: Array<{ value: NamingPatternPartType; label: string; group: string }> = [
  { value: 'year', label: 'سال', group: 'تاریخ' },
  { value: 'year_2digit', label: 'سال دو رقمی', group: 'تاریخ' },
  { value: 'month', label: 'ماه', group: 'تاریخ' },
  { value: 'month_2digit', label: 'ماه دو رقمی', group: 'تاریخ' },
  { value: 'day', label: 'روز', group: 'تاریخ' },
  { value: 'day_2digit', label: 'روز دو رقمی', group: 'تاریخ' },
  { value: 'text', label: 'متن', group: 'متن' },
  { value: 'separator', label: 'کاراکتر / جداکننده', group: 'متن' },
  { value: 'space', label: 'فاصله', group: 'متن' },
  { value: 'sequence', label: 'شماره افزایشی', group: 'شمارنده' },
  { value: 'letter_series', label: 'سری حروفی', group: 'شمارنده' },
];

export const NAMING_PATTERN_SEPARATOR_OPTIONS = [
  { value: '-', label: 'خط تیره -' },
  { value: '/', label: 'اسلش /' },
  { value: '.', label: 'نقطه .' },
  { value: '_', label: 'زیرخط _' },
  { value: ':', label: 'دونقطه :' },
  { value: 'custom', label: 'کاراکتر دلخواه' },
] as const;

export const NAMING_PATTERN_RESET_OPTIONS: Array<{ value: NamingPatternResetPolicy; label: string }> = [
  { value: 'never', label: 'بدون ریست' },
  { value: 'yearly', label: 'سالانه' },
  { value: 'monthly', label: 'ماهانه' },
  { value: 'daily', label: 'روزانه' },
];

const LEGACY_VARIABLE_PART_LABELS: Partial<Record<NamingPatternPartType, string>> = {
  employee_name: 'نام کارمند',
  employee_code: 'کد پرسنلی',
  national_code: 'کد ملی',
  job_title: 'عنوان شغلی',
  business_name: 'نام شرکت',
  business_code: 'کد کسب‌وکار',
  contract_type: 'نوع قرارداد',
  template_type: 'نوع قالب',
};

const LEGACY_USAGE_TYPE_MAP: Record<string, NamingPatternUsageType> = {
  contract_name: 'draft_template_name',
  draft_contract_number: 'contract_number',
  contract_internal_code: 'employee_number',
  custom: 'draft_template_name',
};

const SUPPORTED_PART_TYPES = new Set<NamingPatternPartType>([
  ...NAMING_PATTERN_PART_OPTIONS.map((item) => item.value),
  'static_text',
  ...Object.keys(LEGACY_VARIABLE_PART_LABELS) as NamingPatternPartType[],
]);

const PERSIAN_ALPHABET = ['الف', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی'];
const ENGLISH_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function getBrowserLocalStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function scopeStorageKey(key: string, tenantId?: string | null) {
  const scope = tenantId ?? getActiveTenantStorageId();
  return scope ? `${key}:${scope}` : key;
}

export function getNamingPatternsStorageKey(tenantId?: string | null) {
  return scopeStorageKey(NAMING_PATTERNS_STORAGE_KEY, tenantId);
}

export function createNamingPatternId() {
  return `naming-pattern-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createNamingPatternPartId() {
  return `naming-part-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getNamingPatternUsageLabel(value: NamingPatternUsageType) {
  return NAMING_PATTERN_USAGE_OPTIONS.find((item) => item.value === value)?.label ?? 'سایر';
}

export function getNamingPatternPartLabel(value: NamingPatternPartType) {
  return NAMING_PATTERN_PART_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

function toEnglishDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (char) => String(char.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (char) => String(char.charCodeAt(0) - 1632));
}

function toPositiveNumber(value: unknown, fallback: number) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function getSequenceConfig(part: NamingPatternPart) {
  return {
    startFrom: toPositiveNumber(part.config.startFrom, 1),
    currentValue: toPositiveNumber(part.config.currentValue, toPositiveNumber(part.config.startFrom, 1)),
    step: toPositiveNumber(part.config.step, 1),
    paddingLength: Math.min(Math.max(Math.trunc(toPositiveNumber(part.config.paddingLength, 3)), 1), 10),
    resetPolicy: part.config.resetPolicy ?? 'never',
  };
}

function getLetterConfig(part: NamingPatternPart) {
  const alphabetType = part.config.alphabetType === 'persian' ? 'persian' : 'english';
  const alphabet = alphabetType === 'persian' ? PERSIAN_ALPHABET : ENGLISH_ALPHABET;
  const startLetter = part.config.startLetter && alphabet.includes(part.config.startLetter) ? part.config.startLetter : alphabet[0];
  const currentLetter = part.config.currentLetter && alphabet.includes(part.config.currentLetter) ? part.config.currentLetter : startLetter;
  return {
    alphabetType,
    alphabet,
    startLetter,
    currentLetter,
    incrementWhenSequenceReachesMax: part.config.incrementWhenSequenceReachesMax ?? true,
    sequenceMax: toPositiveNumber(part.config.sequenceMax, 999),
    resetSequenceOnLetterChange: part.config.resetSequenceOnLetterChange ?? true,
  };
}

function getPersianDateParts(value: string | Date | null | undefined) {
  const date = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const parts = formatter.formatToParts(safeDate);
  const read = (type: Intl.DateTimeFormatPartTypes) => toEnglishDigits(parts.find((part) => part.type === type)?.value ?? '');
  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
  };
}

function getSeparatorValue(part: NamingPatternPart) {
  if (part.config.value === 'custom') return part.config.customValue ?? '';
  if (typeof part.config.value === 'string') return part.config.value;
  return '-';
}

function getTextPlaceholderKey(part: NamingPatternPart) {
  const label = part.config.label?.trim() || 'متن قابل تکمیل';
  return part.config.placeholderKey?.trim() || label.replace(/\s+/g, '_').toLowerCase();
}

function renderTextPart(part: NamingPatternPart, context: NamingPatternContext) {
  const mode = part.config.mode ?? 'fixed';
  if (mode === 'placeholder') {
    const label = part.config.label?.trim() || 'متن قابل تکمیل';
    const key = getTextPlaceholderKey(part);
    return context.placeholders?.[key]?.trim() || `{${label}}`;
  }
  return part.config.value ?? part.config.text ?? '';
}

function placeholder(label: string) {
  return `{${label}}`;
}

function renderVariable(part: NamingPatternPart, context: NamingPatternContext) {
  switch (part.type) {
    case 'employee_name':
      return context.employee?.name?.trim() || placeholder('نام کارمند');
    case 'employee_code':
      return context.employee?.code?.trim() || placeholder('کد پرسنلی');
    case 'national_code':
      return context.employee?.nationalCode?.trim() || placeholder('کد ملی');
    case 'job_title':
      return context.employee?.jobTitle?.trim() || placeholder('عنوان شغلی');
    case 'business_name':
      return context.business?.name?.trim() || placeholder('نام شرکت');
    case 'business_code':
      return context.business?.code?.trim() || placeholder('کد کسب‌وکار');
    case 'contract_type':
      return context.contract?.type?.trim() || placeholder('نوع قرارداد');
    case 'template_type':
      return context.template?.type?.trim() || placeholder('نوع قالب');
    default:
      return '';
  }
}

function renderPart(part: NamingPatternPart, context: NamingPatternContext, sequenceOffset: number) {
  const dateParts = getPersianDateParts(context.date);
  switch (part.type) {
    case 'year':
      return dateParts.year;
    case 'year_2digit':
      return dateParts.year.slice(-2);
    case 'month':
      return String(Number(dateParts.month));
    case 'month_2digit':
      return dateParts.month.padStart(2, '0');
    case 'day':
      return String(Number(dateParts.day));
    case 'day_2digit':
      return dateParts.day.padStart(2, '0');
    case 'text':
    case 'static_text':
      return renderTextPart(part, context);
    case 'separator':
      return getSeparatorValue(part);
    case 'space':
      return ' ';
    case 'sequence': {
      const config = getSequenceConfig(part);
      const value = config.currentValue + config.step * sequenceOffset;
      return String(value).padStart(config.paddingLength, '0');
    }
    case 'letter_series':
      return getLetterConfig(part).currentLetter;
    default:
      return renderVariable(part, context);
  }
}

function sortParts(parts: NamingPatternPart[]) {
  return [...parts].sort((left, right) => left.order - right.order);
}

function getResetBucket(dateValue: string | Date | null | undefined, policy: NamingPatternResetPolicy) {
  if (policy === 'never') return '';
  const parts = getPersianDateParts(dateValue);
  if (policy === 'yearly') return parts.year;
  if (policy === 'monthly') return `${parts.year}-${parts.month.padStart(2, '0')}`;
  return `${parts.year}-${parts.month.padStart(2, '0')}-${parts.day.padStart(2, '0')}`;
}

function resetNamingPatternSequenceIfNeeded(pattern: NamingPattern, dateValue: string | Date | null | undefined) {
  const parts = sortParts(pattern.parts);
  const sequencePart = parts.find((part) => part.type === 'sequence');
  if (!sequencePart) return pattern;
  const sequenceConfig = getSequenceConfig(sequencePart);
  const policy = sequenceConfig.resetPolicy;
  if (policy === 'never' || !pattern.sequenceState?.lastGeneratedAt) return pattern;
  if (getResetBucket(pattern.sequenceState.lastGeneratedAt, policy) === getResetBucket(dateValue, policy)) return pattern;
  const letterPart = parts.find((part) => part.type === 'letter_series');
  const resetLetter = letterPart ? getLetterConfig(letterPart).startLetter : null;

  return {
    ...pattern,
    parts: parts.map((part) => {
      if (part.id === sequencePart.id) return { ...part, config: { ...part.config, currentValue: sequenceConfig.startFrom } };
      if (part.type === 'letter_series') {
        const letterConfig = getLetterConfig(part);
        return { ...part, config: { ...part.config, currentLetter: letterConfig.startLetter } };
      }
      return part;
    }),
    sequenceState: {
      currentValue: sequenceConfig.startFrom,
      currentLetter: resetLetter,
      lastGeneratedAt: pattern.sequenceState.lastGeneratedAt,
      resetPolicy: policy,
    },
  };
}

export function generateNamingPattern({ pattern, context = {}, mode = 'preview', sequenceOffset = 0 }: GenerateNamingPatternInput) {
  const output = sortParts(pattern.parts).map((part) => renderPart(part, context, sequenceOffset)).join('');
  return {
    output,
    pattern: mode === 'commit' ? advanceNamingPatternSequence(pattern) : pattern,
  };
}

export function getNamingPatternPreview(pattern: NamingPattern, context: NamingPatternContext = {}) {
  return {
    current: generateNamingPattern({ pattern, context, mode: 'preview' }).output,
    afterIncrement: generateNamingPattern({ pattern, context, mode: 'preview', sequenceOffset: 1 }).output,
  };
}

export function advanceNamingPatternSequence(pattern: NamingPattern): NamingPattern {
  const parts = sortParts(pattern.parts);
  const sequenceIndex = parts.findIndex((part) => part.type === 'sequence');
  if (sequenceIndex < 0) {
    return {
      ...pattern,
      updatedAt: new Date().toISOString(),
      sequenceState: {
        currentValue: pattern.sequenceState?.currentValue ?? 0,
        currentLetter: pattern.sequenceState?.currentLetter ?? null,
        lastGeneratedAt: new Date().toISOString(),
        resetPolicy: pattern.sequenceState?.resetPolicy ?? 'never',
      },
    };
  }

  const letterIndex = parts.findIndex((part) => part.type === 'letter_series');
  const sequencePart = parts[sequenceIndex];
  const sequenceConfig = getSequenceConfig(sequencePart);
  const letterPart = letterIndex >= 0 ? parts[letterIndex] : null;
  const letterConfig = letterPart ? getLetterConfig(letterPart) : null;
  let nextValue = sequenceConfig.currentValue + sequenceConfig.step;
  let nextLetter = letterConfig?.currentLetter ?? null;

  if (letterPart && letterConfig?.incrementWhenSequenceReachesMax && sequenceConfig.currentValue >= letterConfig.sequenceMax) {
    const currentIndex = letterConfig.alphabet.indexOf(letterConfig.currentLetter);
    nextLetter = letterConfig.alphabet[Math.min(currentIndex + 1, letterConfig.alphabet.length - 1)] ?? letterConfig.currentLetter;
    if (letterConfig.resetSequenceOnLetterChange) {
      nextValue = sequenceConfig.startFrom;
    }
  }

  const nextParts = parts.map((part) => {
    if (part.id === sequencePart.id) {
      return { ...part, config: { ...part.config, currentValue: nextValue } };
    }
    if (letterPart && part.id === letterPart.id) {
      return { ...part, config: { ...part.config, currentLetter: nextLetter ?? undefined } };
    }
    return part;
  });

  return {
    ...pattern,
    parts: nextParts,
    updatedAt: new Date().toISOString(),
    sequenceState: {
      currentValue: nextValue,
      currentLetter: nextLetter,
      lastGeneratedAt: new Date().toISOString(),
      resetPolicy: sequenceConfig.resetPolicy,
    },
  };
}

export function generateUniqueNamingPattern({
  pattern,
  context = {},
  existingOutputs = [],
  maxAttempts = 100,
}: {
  pattern: NamingPattern;
  context?: NamingPatternContext;
  existingOutputs?: string[];
  maxAttempts?: number;
}) {
  const existing = new Set(existingOutputs.map((item) => item.trim()).filter(Boolean));
  let candidate = resetNamingPatternSequenceIfNeeded(pattern, context.date);
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const output = generateNamingPattern({ pattern: candidate, context, mode: 'preview' }).output;
    if (!existing.has(output)) {
      return {
        output,
        pattern: advanceNamingPatternSequence(candidate),
        attempts: attempt + 1,
      };
    }
    candidate = advanceNamingPatternSequence(candidate);
  }
  return {
    output: '',
    pattern,
    attempts: maxAttempts,
    conflict: 'خروجی یکتا پیدا نشد',
  };
}

export function createEmptyNamingPattern(tenantId?: string | null): NamingPattern {
  const now = new Date().toISOString();
  return {
    id: createNamingPatternId(),
    tenantId: tenantId ?? getActiveTenantStorageId(),
    name: '',
    usageType: 'contract_number',
    isDefault: true,
    isActive: true,
    direction: 'rtl',
    parts: [],
    sequenceState: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function createNamingPatternPart(type: NamingPatternPartType, order: number): NamingPatternPart {
  const base: NamingPatternPart = {
    id: createNamingPatternPartId(),
    type,
    order,
    config: {},
  };
  if (type === 'text' || type === 'static_text') return { ...base, type: 'text', config: { mode: 'fixed', value: 'CNT', label: 'متن ثابت' } };
  if (type === 'separator') return { ...base, config: { value: '-' } };
  if (type === 'space') return { ...base, config: { value: ' ' } };
  if (type === 'sequence') return { ...base, config: { startFrom: 1, currentValue: 1, step: 1, paddingLength: 3, resetPolicy: 'never' } };
  if (type === 'letter_series') {
    return {
      ...base,
      config: {
        alphabetType: 'english',
        startLetter: 'A',
        currentLetter: 'A',
        incrementWhenSequenceReachesMax: true,
        sequenceMax: 999,
        resetSequenceOnLetterChange: true,
      },
    };
  }
  return base;
}

function normalizePart(value: unknown, index: number): NamingPatternPart | null {
  if (!value || typeof value !== 'object') return null;
  const source = value as Partial<NamingPatternPart>;
  if (!source.type || !SUPPORTED_PART_TYPES.has(source.type)) return null;
  const normalizedType = source.type === 'static_text' || LEGACY_VARIABLE_PART_LABELS[source.type] ? 'text' : source.type;
  const part = createNamingPatternPart(normalizedType, Number.isFinite(source.order) ? Number(source.order) : index);
  const legacyText = LEGACY_VARIABLE_PART_LABELS[source.type];
  return {
    ...part,
    id: typeof source.id === 'string' && source.id.trim() ? source.id : part.id,
    config: {
      ...part.config,
      ...(source.config && typeof source.config === 'object' ? source.config : {}),
      ...(source.type === 'static_text' ? { mode: 'fixed', value: source.config?.value ?? source.config?.text ?? '' } : {}),
      ...(legacyText ? { mode: 'fixed', value: legacyText, label: 'متن ثابت' } : {}),
    },
  };
}

export function normalizeNamingPattern(value: unknown): NamingPattern | null {
  if (!value || typeof value !== 'object') return null;
  const source = value as Partial<NamingPattern>;
  if (!source.id || !source.name || !source.usageType) return null;
  const usageType = NAMING_PATTERN_USAGE_OPTIONS.some((item) => item.value === source.usageType)
    ? source.usageType
    : LEGACY_USAGE_TYPE_MAP[String(source.usageType)];
  if (!usageType) return null;
  const now = new Date().toISOString();
  return {
    id: source.id,
    tenantId: source.tenantId ?? null,
    name: source.name,
    usageType,
    isDefault: true,
    isActive: source.isActive ?? true,
    direction: source.direction === 'ltr' ? 'ltr' : 'rtl',
    parts: Array.isArray(source.parts) ? source.parts.map(normalizePart).filter(Boolean).map((part, index) => ({ ...part, order: index })) as NamingPatternPart[] : [],
    sequenceState: source.sequenceState ?? null,
    createdAt: source.createdAt ?? now,
    updatedAt: source.updatedAt ?? source.createdAt ?? now,
  };
}

export function validateNamingPattern(pattern: NamingPattern) {
  const errors: string[] = [];
  if (!pattern.name.trim()) errors.push('نام الگو الزامی است');
  if (!pattern.usageType) errors.push('کاربرد الگو را انتخاب کنید');
  if (!pattern.parts.length) errors.push('حداقل یک بخش برای الگو تعریف کنید');

  pattern.parts.forEach((part) => {
    if ((part.type === 'text' || part.type === 'static_text') && (part.config.mode ?? 'fixed') === 'fixed' && !(part.config.value ?? part.config.text)?.trim()) errors.push('متن ثابت نمی‌تواند خالی باشد');
    if ((part.type === 'text' || part.type === 'static_text') && part.config.mode === 'placeholder' && !part.config.label?.trim()) errors.push('عنوان جایگاه متن قابل تکمیل الزامی است');
    if (part.type === 'separator' && part.config.value === 'custom' && (part.config.customValue?.length ?? 0) > 12) errors.push('جداکننده دلخواه بیش از حد طولانی است');
    if (part.type === 'sequence') {
      if (toPositiveNumber(part.config.startFrom, 0) <= 0) errors.push('مقدار شروع شماره باید عددی مثبت باشد');
      if (toPositiveNumber(part.config.step, 0) <= 0) errors.push('مقدار افزایش باید عددی مثبت باشد');
      const padding = Number(part.config.paddingLength);
      if (!Number.isFinite(padding) || padding < 1 || padding > 10) errors.push('طول شماره معتبر نیست');
    }
    if (part.type === 'letter_series') {
      const config = getLetterConfig(part);
      if (!config.alphabet.includes(config.startLetter)) errors.push('حروف شروع معتبر نیست');
    }
  });

  return errors;
}

export function readNamingPatterns(tenantId?: string | null) {
  const storage = getBrowserLocalStorage();
  if (!storage) return [] as NamingPattern[];
  const raw = storage.getItem(getNamingPatternsStorageKey(tenantId));
  if (!raw) return [] as NamingPattern[];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(normalizeNamingPattern).filter(Boolean) as NamingPattern[] : [];
  } catch {
    storage.removeItem(getNamingPatternsStorageKey(tenantId));
    return [] as NamingPattern[];
  }
}

export function persistNamingPatterns(patterns: NamingPattern[], tenantId?: string | null) {
  const storage = getBrowserLocalStorage();
  if (!storage) return;
  storage.setItem(getNamingPatternsStorageKey(tenantId), JSON.stringify(patterns));
}

export function findDefaultNamingPattern(patterns: NamingPattern[], usageType: NamingPatternUsageType) {
  return patterns.find((pattern) => pattern.usageType === usageType && pattern.isActive) ?? null;
}

export function commitDefaultNamingPattern({
  usageType,
  context,
  existingOutputs,
  tenantId,
}: {
  usageType: NamingPatternUsageType;
  context?: NamingPatternContext;
  existingOutputs?: string[];
  tenantId?: string | null;
}) {
  const patterns = readNamingPatterns(tenantId);
  const pattern = findDefaultNamingPattern(patterns, usageType);
  if (!pattern) return null;
  const generated = generateUniqueNamingPattern({ pattern, context, existingOutputs });
  if (!generated.output || generated.conflict) return null;
  persistNamingPatterns(patterns.map((item) => (item.id === pattern.id ? generated.pattern : item)), tenantId);
  return generated.output;
}

export function getNamingPatternSequenceLabel(pattern: NamingPattern) {
  const sequencePart = pattern.parts.find((part) => part.type === 'sequence');
  const letterPart = pattern.parts.find((part) => part.type === 'letter_series');
  if (!sequencePart && !letterPart) return 'ندارد';
  const sequence = sequencePart ? getSequenceConfig(sequencePart).currentValue : null;
  const letter = letterPart ? getLetterConfig(letterPart).currentLetter : null;
  return [letter, sequence !== null ? String(sequence) : null].filter(Boolean).join('-');
}

export function getNamingPatternPlaceholderParts(pattern: NamingPattern) {
  return sortParts(pattern.parts)
    .filter((part) => (part.type === 'text' || part.type === 'static_text') && part.config.mode === 'placeholder')
    .map((part) => ({
      id: part.id,
      key: getTextPlaceholderKey(part),
      label: part.config.label?.trim() || 'متن قابل تکمیل',
    }));
}

export const NAMING_PATTERN_SAMPLE_CONTEXT: NamingPatternContext = {
  date: new Date().toISOString().slice(0, 10),
  employee: {
    name: 'ایمان فخار',
    code: 'EMP-001',
    nationalCode: '0012345678',
    jobTitle: 'کارشناس عملیات',
  },
  business: {
    name: 'شرکت تاو سیستم',
    code: 'BIZ-001',
  },
  contract: {
    type: 'قرارداد کار',
  },
  template: {
    type: 'نیروهای شیفتی',
  },
};
