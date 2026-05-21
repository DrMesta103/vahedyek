export const PHYSICAL_PROGRESS_STAGE_LIBRARY = [
  'خاکبرداری',
  'فونداسیون',
  'اسکلت',
  'سفت‌کاری',
  'نازک‌کاری',
  'تأسیسات',
  'نما',
  'محوطه‌سازی',
  'آماده تحویل',
] as const;

export type PhysicalProgressScheduleStageInput = {
  title?: string;
  customTitle?: string;
  weight?: number | string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  description?: string;
  order?: number;
  isCompleted?: boolean;
  completedAt?: string | null;
  libraryTag?: string | null;
};

export type PhysicalProgressScheduleInput = {
  title?: string;
  blockIds?: string[];
  stages?: PhysicalProgressScheduleStageInput[];
};

export type PhysicalProgressScheduleStage = {
  id: string;
  title: string;
  weight: number;
  plannedStartDate: string;
  plannedEndDate: string;
  description: string;
  order: number;
  isCompleted: boolean;
  completedAt: string | null;
  libraryTag: string | null;
};

export type PhysicalProgressScheduleVersion = {
  id: string;
  scheduleKey: string;
  blockId: string;
  blockName: string;
  title: string;
  version: number;
  stages: PhysicalProgressScheduleStage[];
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  createdByName: string;
  sourceVersionId?: string | null;
  archivedAt?: string | null;
  archivedByUserId?: string | null;
  archivedByName?: string | null;
};

export type PhysicalProgressScheduleSummary = {
  scheduleKey: string;
  latestVersionId: string;
  blockId: string;
  blockName: string;
  title: string;
  version: number;
  stageCount: number;
  totalWeight: number;
  createdAt: string;
  updatedAt: string;
  createdByName: string;
  sourceVersionId?: string | null;
  stages: PhysicalProgressScheduleStage[];
};

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
}

function normalizeText(value: unknown, max = 120) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function normalizeNumber(value: unknown) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  if (typeof value !== 'string') return NaN;
  const text = normalizeDigits(value).replace(/,/g, '').trim();
  if (!text) return NaN;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function normalizeDate(value: unknown) {
  const text = normalizeDigits(normalizeText(value, 20));
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(text)) return '';
  return text;
}

function compareDateText(left: string, right: string) {
  return normalizeDigits(left).localeCompare(normalizeDigits(right), 'en');
}

function roundWeight(value: number) {
  return Math.round(value * 100) / 100;
}

function normalizeStage(raw: PhysicalProgressScheduleStageInput, index: number): PhysicalProgressScheduleStage | null {
  const title = normalizeText(raw.title, 80) || normalizeText(raw.customTitle, 80);
  if (!title) return null;

  const weight = roundWeight(normalizeNumber(raw.weight));
  const plannedStartDate = normalizeDate(raw.plannedStartDate);
  const plannedEndDate = normalizeDate(raw.plannedEndDate);
  const description = normalizeText(raw.description, 500);
  const libraryTag = normalizeText(raw.libraryTag, 80) || null;
  const isCompleted = raw.isCompleted === true;
  const completedAt = isCompleted ? normalizeText(raw.completedAt, 40) || new Date().toISOString() : null;

  return {
    id: crypto.randomUUID(),
    title,
    weight: Number.isFinite(weight) ? weight : 0,
    plannedStartDate,
    plannedEndDate,
    description,
    order: Number.isFinite(raw.order as number) ? Number(raw.order) : index,
    isCompleted,
    completedAt,
    libraryTag,
  };
}

function validateStages(stages: PhysicalProgressScheduleStage[]) {
  if (!stages.length) return 'حداقل یک مرحله باید ثبت شود.';

  const seenTitles = new Set<string>();
  let totalWeight = 0;

  for (const stage of stages) {
    if (!stage.title.trim()) return 'عنوان مرحله الزامی است.';
    if (!(stage.weight > 0 && stage.weight <= 100)) return `وزن مرحله "${stage.title}" معتبر نیست.`;
    if (!stage.plannedStartDate || !stage.plannedEndDate) return `تاریخ شروع و پایان مرحله "${stage.title}" الزامی است.`;
    if (compareDateText(stage.plannedEndDate, stage.plannedStartDate) <= 0) {
      return `تاریخ پایان مرحله "${stage.title}" باید بعد از تاریخ شروع باشد.`;
    }

    const titleKey = stage.title.trim().toLocaleLowerCase('fa-IR');
    if (seenTitles.has(titleKey)) return `عنوان مرحله "${stage.title}" تکراری است.`;
    seenTitles.add(titleKey);
    totalWeight += stage.weight;
  }

  if (Math.abs(roundWeight(totalWeight) - 100) > 0.001) {
    return 'جمع وزن مراحل باید دقیقاً ۱۰۰٪ باشد.';
  }

  return null;
}

export function buildNormalizedStages(input: PhysicalProgressScheduleStageInput[]) {
  const stages = input
    .map((stage, index) => normalizeStage(stage, index))
    .filter((item): item is PhysicalProgressScheduleStage => Boolean(item))
    .sort((left, right) => left.order - right.order)
    .map((stage, index) => ({ ...stage, order: index }));

  const validationError = validateStages(stages);
  return { stages, validationError };
}

export function buildScheduleSummaries(versions: PhysicalProgressScheduleVersion[]): PhysicalProgressScheduleSummary[] {
  const latestByKey = new Map<string, PhysicalProgressScheduleVersion>();

  for (const version of versions) {
    if (version.archivedAt) continue;
    const current = latestByKey.get(version.scheduleKey);
    if (!current || version.version > current.version) {
      latestByKey.set(version.scheduleKey, version);
    }
  }

  return Array.from(latestByKey.values())
    .map((version) => ({
      scheduleKey: version.scheduleKey,
      latestVersionId: version.id,
      blockId: version.blockId,
      blockName: version.blockName,
      title: version.title,
      version: version.version,
      stageCount: version.stages.length,
      totalWeight: roundWeight(version.stages.reduce((sum, stage) => sum + stage.weight, 0)),
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
      createdByName: version.createdByName,
      sourceVersionId: version.sourceVersionId ?? null,
      stages: [...version.stages].sort((left, right) => left.order - right.order),
    }))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function buildCreatedScheduleVersions(args: {
  blockIds: string[];
  blockNameMap: Map<string, string>;
  title: string;
  stages: PhysicalProgressScheduleStage[];
  actorUserId: string;
  actorName: string;
  sourceVersionId?: string | null;
}) {
  const now = new Date().toISOString();
  return args.blockIds.map((blockId) => {
    const blockName = args.blockNameMap.get(blockId);
    if (!blockName) {
      throw new Error('بلوک انتخاب‌شده معتبر نیست.');
    }

    return {
      id: crypto.randomUUID(),
      scheduleKey: crypto.randomUUID(),
      blockId,
      blockName,
      title: args.title,
      version: 1,
      stages: args.stages.map((stage, index) => ({
        ...stage,
        id: crypto.randomUUID(),
        order: index,
      })),
      createdAt: now,
      updatedAt: now,
      createdByUserId: args.actorUserId,
      createdByName: args.actorName,
      sourceVersionId: args.sourceVersionId ?? null,
      archivedAt: null,
      archivedByUserId: null,
      archivedByName: null,
    } satisfies PhysicalProgressScheduleVersion;
  });
}

export function validateScheduleInput(input: PhysicalProgressScheduleInput) {
  const title = normalizeText(input.title, 120);
  const blockIds = Array.isArray(input.blockIds)
    ? Array.from(new Set(input.blockIds.map((item) => normalizeText(item, 80)).filter(Boolean)))
    : [];
  const { stages, validationError } = buildNormalizedStages(Array.isArray(input.stages) ? input.stages : []);

  if (!title) {
    return { error: 'عنوان برنامه الزامی است.' };
  }

  if (!blockIds.length) {
    return { error: 'حداقل یک بلوک باید انتخاب شود.' };
  }

  if (validationError) {
    return { error: validationError };
  }

  return { title, blockIds, stages };
}

export function normalizePersistedScheduleVersion(input: unknown): PhysicalProgressScheduleVersion | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as Record<string, unknown>;
  const stagesRaw = Array.isArray(raw.stages) ? raw.stages : [];
  const stages = stagesRaw
    .map((item, index) => normalizeStage(item as PhysicalProgressScheduleStageInput, index))
    .filter((item): item is PhysicalProgressScheduleStage => Boolean(item))
    .sort((left, right) => left.order - right.order);

  const id = normalizeText(raw.id, 80) || crypto.randomUUID();
  const scheduleKey = normalizeText(raw.scheduleKey, 80) || crypto.randomUUID();
  const blockId = normalizeText(raw.blockId, 80);
  const blockName = normalizeText(raw.blockName, 120);
  const title = normalizeText(raw.title, 120);
  const createdAt = normalizeText(raw.createdAt, 40) || new Date().toISOString();
  const updatedAt = normalizeText(raw.updatedAt, 40) || createdAt;
  const createdByUserId = normalizeText(raw.createdByUserId, 80);
  const createdByName = normalizeText(raw.createdByName, 120) || 'کاربر ناشناس';
  const version = Math.max(1, Math.floor(normalizeNumber(raw.version) || 1));

  if (!blockId || !blockName || !title || !createdByUserId || !stages.length) return null;

  return {
    id,
    scheduleKey,
    blockId,
    blockName,
    title,
    version,
    stages,
    createdAt,
    updatedAt,
    createdByUserId,
    createdByName,
    sourceVersionId: normalizeText(raw.sourceVersionId, 80) || null,
    archivedAt: normalizeText(raw.archivedAt, 40) || null,
    archivedByUserId: normalizeText(raw.archivedByUserId, 80) || null,
    archivedByName: normalizeText(raw.archivedByName, 120) || null,
  };
}
