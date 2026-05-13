import { validateShares } from './contractValidation';
import {
  createInitialFinancialCategories,
  buildFinancialLineCategories,
  createFinancialLineId,
  FINANCIAL_SUB_CATEGORY_IDS,
  mergeWithSystemCategories,
  orderFinancialCategories,
} from './financialLineShared';
import {
  isFinancialLineHeaderCategoryId,
  isFinancialLineSubtreeCategoryId,
  isLegacyCustomRootCategoryId,
  normalizeFinancialCategories,
  normalizeFinancialDueItems,
  sortFinancialCategoriesForPersistence,
} from './financialUtils';
import type {
  AppendixAdjustmentPayload,
  AppendixContractBaseCostsPayload,
  AppendixDeliveryDatePayload,
  AppendixPartiesPayload,
  AppendixSideCostsPayload,
  AppendixTagKey,
  Contract,
  ContractAppendix,
  ContractFinancialData,
  FinancialCategoryData,
  FinancialDueItemData,
  ShareMode,
  SupportedAppendixTagKey,
} from '../types/contract';
import { isSupportedAppendixTag } from './appendixTagSupport';

export const APPENDIX_ADJUSTMENT_LINE_ID = createFinancialLineId('appendix-adjustment');
export const APPENDIX_ADJUSTMENT_TITLE = 'تعدیل';
export const APPENDIX_CONTRACT_BASE_TITLE = 'مبلغ اصل قرارداد';

export type SupportedAppendixPayload =
  | AppendixDeliveryDatePayload
  | AppendixPartiesPayload
  | AppendixAdjustmentPayload
  | AppendixContractBaseCostsPayload
  | AppendixSideCostsPayload;

type FinancialAppendixPayload =
  | AppendixAdjustmentPayload
  | AppendixContractBaseCostsPayload
  | AppendixSideCostsPayload;

const PRIMARY_CATEGORY_IDS = ['principal', ...FINANCIAL_SUB_CATEGORY_IDS] as const;
const PRIMARY_CATEGORY_ID_SET = new Set<string>(PRIMARY_CATEGORY_IDS);

function getDefaultFinancialActiveTab(categories: FinancialCategoryData[]) {
  return (
    categories.find((item) => item.requiresDue)?.id ??
    categories.find((item) => item.id !== 'principal')?.id ??
    categories[0]?.id ??
    ''
  );
}

function createEmptyFinancialPayload(categories: FinancialCategoryData[]): FinancialAppendixPayload {
  return {
    activeTab: getDefaultFinancialActiveTab(categories),
    categories,
    dueItems: [],
  };
}

function getFinancialData(contract: Contract | null | undefined) {
  return contract?.data?.financial ?? null;
}

function pickFinancialCategories(categories: FinancialCategoryData[], predicate: (category: FinancialCategoryData) => boolean) {
  return categories.filter(predicate).map((item) => ({
    ...item,
    capAmount: Number(item.capAmount ?? 0),
    dueAmount: Number(item.dueAmount ?? 0),
    noDueAmount: Number(item.noDueAmount ?? 0),
  }));
}

function normalizeFixedLineCategories(input: unknown, lineId: string, title: string) {
  const source = Array.isArray(input) ? (input as FinancialCategoryData[]) : [];
  const merged = mergeWithSystemCategories(source);
  const lineCategories = merged.filter((item) => item.id === lineId || item.id.startsWith(`${lineId}:`));
  if (!lineCategories.length) {
    return buildFinancialLineCategories({ lineId, title });
  }

  return buildFinancialLineCategories({
    lineId,
    title,
    capAmount: Number(lineCategories.find((item) => item.id === lineId)?.capAmount ?? 0),
  }).map((item) => {
    const existing = lineCategories.find((entry) => entry.id === item.id);
    if (!existing) return item;
    return {
      ...item,
      capAmount: Number(existing.capAmount ?? item.capAmount),
      dueAmount: Number(existing.dueAmount ?? item.dueAmount),
      noDueAmount: Number(existing.noDueAmount ?? item.noDueAmount),
    };
  });
}

function normalizePrimaryContractCategories(input: unknown) {
  const source = normalizeFinancialCategories(Array.isArray(input) ? input : []);
  const merged = mergeWithSystemCategories(source as FinancialCategoryData[]);
  const primary = pickFinancialCategories(merged as FinancialCategoryData[], (category) => PRIMARY_CATEGORY_ID_SET.has(category.id));
  return orderFinancialCategories(primary);
}

function normalizeSideCostCategories(input: unknown) {
  const source = normalizeFinancialCategories(Array.isArray(input) ? input : []) as FinancialCategoryData[];
  const headers = new Set<string>();

  for (const item of source) {
    if (isFinancialLineHeaderCategoryId(item.id)) headers.add(item.id);
    if (isFinancialLineSubtreeCategoryId(item.id)) headers.add(item.id.slice(0, item.id.lastIndexOf(':')));
  }

  const byId = new Map(source.map((item) => [item.id, item]));
  const normalizedLines: FinancialCategoryData[] = [];

  for (const headerId of headers) {
    const header = byId.get(headerId);
    const built = buildFinancialLineCategories({
      lineId: headerId,
      title: String(header?.name ?? 'ردیف مالی'),
      capAmount: Number(header?.capAmount ?? 0),
    }).map((item) => {
      const existing = byId.get(item.id);
      if (!existing) return item;
      return {
        ...item,
        name: item.id === headerId ? String(existing.name ?? item.name) : item.name,
        capAmount: Number(existing.capAmount ?? item.capAmount),
        dueAmount: Number(existing.dueAmount ?? item.dueAmount),
        noDueAmount: Number(existing.noDueAmount ?? item.noDueAmount),
      };
    });
    normalizedLines.push(...built);
  }

  const legacyRoots = source.filter(
    (item) =>
      item.id !== 'principal' &&
      !PRIMARY_CATEGORY_ID_SET.has(item.id) &&
      !isFinancialLineHeaderCategoryId(item.id) &&
      !isFinancialLineSubtreeCategoryId(item.id),
  );

  return sortFinancialCategoriesForPersistence([...normalizedLines, ...legacyRoots]);
}

function normalizeFinancialDueItemsForCategories(input: unknown, categories: FinancialCategoryData[]) {
  return normalizeFinancialDueItems(Array.isArray(input) ? input : [], new Set(categories.map((item) => item.id))) as FinancialDueItemData[];
}

function normalizeFinancialPayload(
  row: Record<string, unknown>,
  categories: FinancialCategoryData[],
): FinancialAppendixPayload {
  const dueItems = normalizeFinancialDueItemsForCategories(row.dueItems, categories);
  const activeTabRaw = String(row.activeTab ?? '');
  const activeTab = categories.some((item) => item.id === activeTabRaw) ? activeTabRaw : getDefaultFinancialActiveTab(categories);

  return {
    activeTab,
    categories,
    dueItems,
  };
}

function normalizeDeliveryDatePayload(input: unknown): AppendixDeliveryDatePayload {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  return {
    previousDate: String(row.previousDate ?? ''),
    nextDate: String(row.nextDate ?? ''),
    reason: String(row.reason ?? ''),
  };
}

function normalizePartiesPayload(input: unknown): AppendixPartiesPayload {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  return {
    shareMode: ((row.shareMode ?? 'dang') as ShareMode) === 'percent' ? 'percent' : 'dang',
    parties: Array.isArray(row.parties) ? row.parties : [],
  };
}

function normalizeAdjustmentPayload(input: unknown): AppendixAdjustmentPayload {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  return normalizeFinancialPayload(row, normalizeFixedLineCategories(row.categories, APPENDIX_ADJUSTMENT_LINE_ID, APPENDIX_ADJUSTMENT_TITLE));
}

function normalizeContractBaseCostsPayload(input: unknown): AppendixContractBaseCostsPayload {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  return normalizeFinancialPayload(row, normalizePrimaryContractCategories(row.categories));
}

function normalizeSideCostsPayload(input: unknown): AppendixSideCostsPayload {
  const row = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  return normalizeFinancialPayload(row, normalizeSideCostCategories(row.categories));
}

function extractContractBaseCategories(financial: ContractFinancialData | null) {
  if (!financial) return createInitialFinancialCategories();
  const source = Array.isArray(financial.categories) ? financial.categories : [];
  const normalized = normalizePrimaryContractCategories(source);
  return normalized.length ? normalized : createInitialFinancialCategories();
}

function extractContractBaseDueItems(financial: ContractFinancialData | null, categories: FinancialCategoryData[]) {
  if (!financial) return [];
  return normalizeFinancialDueItemsForCategories(financial.dueItems, categories);
}

function extractSideCostCategories(financial: ContractFinancialData | null) {
  if (!financial) return [];
  return normalizeSideCostCategories(financial.categories);
}

function extractSideCostDueItems(financial: ContractFinancialData | null, categories: FinancialCategoryData[]) {
  if (!financial) return [];
  return normalizeFinancialDueItemsForCategories(financial.dueItems, categories);
}

function buildContractBasePayload(financial: ContractFinancialData | null): AppendixContractBaseCostsPayload {
  const categories = extractContractBaseCategories(financial);
  return {
    activeTab: getDefaultFinancialActiveTab(categories),
    categories,
    dueItems: extractContractBaseDueItems(financial, categories),
  };
}

function buildSideCostsPayload(financial: ContractFinancialData | null): AppendixSideCostsPayload {
  const categories = extractSideCostCategories(financial);
  return {
    activeTab: getDefaultFinancialActiveTab(categories),
    categories,
    dueItems: extractSideCostDueItems(financial, categories),
  };
}

function validateCommonFinancialPayload(payload: FinancialAppendixPayload) {
  const validCategoryIds = new Set(payload.categories.map((item) => item.id));
  const invalidDueItem = payload.dueItems.find(
    (item) => !validCategoryIds.has(item.categoryId) || !String(item.title ?? '').trim() || !String(item.dueDate ?? '').trim() || Number(item.amount ?? 0) <= 0,
  );
  return invalidDueItem ? 'اطلاعات سررسیدهای مالی معتبر نیست.' : '';
}

function validateFixedLinePayload(payload: FinancialAppendixPayload, lineId: string, title: string) {
  const header = payload.categories.find((item) => item.id === lineId);
  if (!header) return `ردیف مالی ${title} ثبت نشده است.`;
  if (String(header.name).trim() !== title) return `نام ردیف مالی ${title} قابل تغییر نیست.`;

  const expectedCategoryIds = new Set(buildFinancialLineCategories({ lineId, title }).map((item) => item.id));
  for (const category of payload.categories) {
    if (!expectedCategoryIds.has(category.id)) {
      return `ساختار ردیف مالی ${title} معتبر نیست.`;
    }
  }

  return validateCommonFinancialPayload(payload);
}

function validateContractBaseCostsPayload(payload: AppendixContractBaseCostsPayload) {
  const principal = payload.categories.find((item) => item.id === 'principal');
  if (!principal) return 'ردیف مالی اصل قرارداد ثبت نشده است.';
  if (String(principal.name).trim() !== APPENDIX_CONTRACT_BASE_TITLE) return 'نام ردیف مالی اصل قرارداد قابل تغییر نیست.';

  for (const category of payload.categories) {
    if (!PRIMARY_CATEGORY_ID_SET.has(category.id)) {
      return 'ساختار ردیف مالی اصل قرارداد معتبر نیست.';
    }
  }

  return validateCommonFinancialPayload(payload);
}

function validateSideCostsPayload(payload: AppendixSideCostsPayload) {
  const invalidCategory = payload.categories.find((category) => {
    if (category.id === 'principal' || PRIMARY_CATEGORY_ID_SET.has(category.id)) return true;
    return !isFinancialLineHeaderCategoryId(category.id) && !isFinancialLineSubtreeCategoryId(category.id) && !isLegacyCustomRootCategoryId(category.id);
  });
  if (invalidCategory) return 'ساختار هزینه های جانبی معتبر نیست.';
  return validateCommonFinancialPayload(payload);
}

export function createInitialAppendixPayload(tag: SupportedAppendixTagKey): SupportedAppendixPayload {
  switch (tag) {
    case 'unit-delivery-date':
      return { previousDate: '', nextDate: '', reason: '' };
    case 'first-party':
    case 'second-party':
      return { shareMode: 'dang', parties: [] };
    case 'adjustment':
      return createEmptyFinancialPayload(buildFinancialLineCategories({ lineId: APPENDIX_ADJUSTMENT_LINE_ID, title: APPENDIX_ADJUSTMENT_TITLE }));
    case 'contract-base-costs':
      return createEmptyFinancialPayload(createInitialFinancialCategories());
    case 'side-costs':
      return createEmptyFinancialPayload([]);
  }
}

export function normalizeAppendixPayload(tag: SupportedAppendixTagKey, input: unknown): SupportedAppendixPayload {
  switch (tag) {
    case 'unit-delivery-date':
      return normalizeDeliveryDatePayload(input);
    case 'first-party':
    case 'second-party':
      return normalizePartiesPayload(input);
    case 'adjustment':
      return normalizeAdjustmentPayload(input);
    case 'contract-base-costs':
      return normalizeContractBaseCostsPayload(input);
    case 'side-costs':
      return normalizeSideCostsPayload(input);
  }
}

export function isSupportedAppendixPayloadTag(tag: AppendixTagKey): tag is SupportedAppendixTagKey {
  return isSupportedAppendixTag(tag);
}

export function getContractBaselinePayload(tag: SupportedAppendixTagKey, contract: Contract): SupportedAppendixPayload {
  if (tag === 'unit-delivery-date') {
    return {
      previousDate: String(contract.data.subject?.deliveryDate ?? ''),
      nextDate: '',
      reason: '',
    };
  }

  if (tag === 'first-party' || tag === 'second-party') {
    return {
      shareMode: tag === 'first-party' ? contract.data.parties?.partyOneMode ?? 'dang' : contract.data.parties?.partyTwoMode ?? 'dang',
      parties: tag === 'first-party' ? contract.data.parties?.partyOne ?? [] : contract.data.parties?.partyTwo ?? [],
    };
  }

  if (tag === 'adjustment') {
    return createInitialAppendixPayload('adjustment');
  }

  if (tag === 'contract-base-costs') {
    return buildContractBasePayload(getFinancialData(contract));
  }

  return buildSideCostsPayload(getFinancialData(contract));
}

export function getAppendixBaselinePayload(tag: SupportedAppendixTagKey, appendix: ContractAppendix): SupportedAppendixPayload | null {
  const item = appendix.items.find((entry) => entry.tagKey === tag);
  if (!item) return null;
  return normalizeAppendixPayload(tag, item.payload);
}

export function validateAdjustmentPayload(payload: AppendixAdjustmentPayload): string {
  return validateFixedLinePayload(payload, APPENDIX_ADJUSTMENT_LINE_ID, APPENDIX_ADJUSTMENT_TITLE);
}

export function validateAppendixPayload(tag: SupportedAppendixTagKey, payload: SupportedAppendixPayload): string {
  if (tag === 'unit-delivery-date') {
    const row = payload as AppendixDeliveryDatePayload;
    if (!row.previousDate.trim() || !row.nextDate.trim()) {
      return 'برای تاریخ تحویل واحد، تاریخ قبلی و تاریخ جدید را کامل کنید.';
    }
    return '';
  }

  if (tag === 'first-party' || tag === 'second-party') {
    const row = payload as AppendixPartiesPayload;
    if (!row.parties.length || !validateShares(row.parties, row.shareMode).valid) {
      return 'اطلاعات طرفین متمم کامل یا معتبر نیست.';
    }
    return '';
  }

  if (tag === 'adjustment') {
    return validateAdjustmentPayload(payload as AppendixAdjustmentPayload);
  }

  if (tag === 'contract-base-costs') {
    return validateContractBaseCostsPayload(payload as AppendixContractBaseCostsPayload);
  }

  return validateSideCostsPayload(payload as AppendixSideCostsPayload);
}
