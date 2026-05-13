import { FINANCIAL_LINE_PREFIX, isFinancialLineHeaderCategoryId, isFinancialLineSubtreeCategoryId } from './financialUtils';
import type { FinancialCategoryData } from '../types/contract';

export type FinancialLineCategory = FinancialCategoryData;

export const SYSTEM_FINANCIAL_CATEGORIES = [
  { id: 'principal', name: 'مبلغ اصل قرارداد', requiresDue: false },
  { id: 'advance', name: 'پیش پرداخت', requiresDue: true },
  { id: 'installment', name: 'اقساط ثابت', requiresDue: true },
  { id: 'loan', name: 'وام بانکی', requiresDue: false },
  { id: 'handover', name: 'تحویل واحد', requiresDue: false },
  { id: 'document', name: 'تحویل سند', requiresDue: false },
] as const;

export const LOCKED_CATEGORY_IDS = SYSTEM_FINANCIAL_CATEGORIES.map((item) => item.id);
export const FINANCIAL_SUB_CATEGORY_IDS = ['advance', 'installment', 'loan', 'handover', 'document'] as const;
export const DUE_TAG_OPTIONS = SYSTEM_FINANCIAL_CATEGORIES.map((item) => item.name);
export const REGULAR_DUE_CATEGORY_ID = 'installment';
export const PRIMARY_FINANCIAL_CATEGORY_IDS = ['principal', ...FINANCIAL_SUB_CATEGORY_IDS] as const;

export function isPrimaryFinancialCategoryId(categoryId: string) {
  return (PRIMARY_FINANCIAL_CATEGORY_IDS as readonly string[]).includes(categoryId);
}

export function structuralFinancialSubSuffix(categoryId: string): string | undefined {
  if ((FINANCIAL_SUB_CATEGORY_IDS as readonly string[]).includes(categoryId)) return categoryId;
  const sep = categoryId.lastIndexOf(':');
  if (sep < 0) return undefined;
  const suffix = categoryId.slice(sep + 1);
  return (FINANCIAL_SUB_CATEGORY_IDS as readonly string[]).includes(suffix) ? suffix : undefined;
}

export function getCategoryRequiresDue(categoryId: string): boolean {
  if (categoryId === 'principal') return false;
  const suffix = structuralFinancialSubSuffix(categoryId);
  if (suffix) return SYSTEM_FINANCIAL_CATEGORIES.find((item) => item.id === suffix)?.requiresDue ?? true;
  return SYSTEM_FINANCIAL_CATEGORIES.find((item) => item.id === categoryId)?.requiresDue ?? true;
}

export function normalizeFinancialCategory(item: FinancialLineCategory): FinancialLineCategory {
  const requiresDue = item.system ? getCategoryRequiresDue(item.id) : (item.requiresDue ?? true);
  return {
    ...item,
    requiresDue,
    dueAmount: requiresDue ? item.capAmount : 0,
    noDueAmount: requiresDue ? 0 : item.capAmount,
  };
}

export function createInitialFinancialCategories() {
  return SYSTEM_FINANCIAL_CATEGORIES.map((item) =>
    normalizeFinancialCategory({
      id: item.id,
      name: item.name,
      capAmount: 0,
      dueAmount: 0,
      noDueAmount: 0,
      system: true,
      requiresDue: item.requiresDue,
    }),
  );
}

export function orderFinancialCategories(items: FinancialLineCategory[]): FinancialLineCategory[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const ordered: FinancialLineCategory[] = [];

  for (const tpl of SYSTEM_FINANCIAL_CATEGORIES) {
    const row = byId.get(tpl.id);
    ordered.push(
      row ??
        normalizeFinancialCategory({
          id: tpl.id,
          name: tpl.name,
          capAmount: 0,
          dueAmount: 0,
          noDueAmount: 0,
          system: true,
          requiresDue: tpl.requiresDue,
        }),
    );
  }

  const emitted = new Set(ordered.map((row) => row.id));
  const headerIds: string[] = [];
  for (const item of items) {
    if (isFinancialLineHeaderCategoryId(item.id) && !headerIds.includes(item.id)) headerIds.push(item.id);
  }

  for (const headerId of headerIds) {
    const header = byId.get(headerId);
    if (!header) continue;
    if (!emitted.has(headerId)) {
      ordered.push(normalizeFinancialCategory(header));
      emitted.add(headerId);
    }

    for (const subKey of FINANCIAL_SUB_CATEGORY_IDS) {
      const subId = `${headerId}:${subKey}`;
      if (emitted.has(subId)) continue;
      const template = SYSTEM_FINANCIAL_CATEGORIES.find((item) => item.id === subKey)!;
      const existing = byId.get(subId);
      ordered.push(
        existing ??
          normalizeFinancialCategory({
            id: subId,
            name: template.name,
            capAmount: 0,
            dueAmount: 0,
            noDueAmount: 0,
            system: true,
            requiresDue: template.requiresDue,
          }),
      );
      emitted.add(subId);
    }
  }

  for (const item of items) {
    if (emitted.has(item.id)) continue;
    if (isFinancialLineSubtreeCategoryId(item.id)) continue;
    ordered.push(normalizeFinancialCategory(item));
    emitted.add(item.id);
  }

  return ordered;
}

export function mergeWithSystemCategories(categories: FinancialLineCategory[]) {
  const normalizedCategories = categories.map(normalizeFinancialCategory);
  const coreIds = new Set<string>(SYSTEM_FINANCIAL_CATEGORIES.map((item) => item.id));
  const extras = normalizedCategories.filter((item) => !coreIds.has(item.id));
  const coreRows = SYSTEM_FINANCIAL_CATEGORIES.map((template) => {
    const existing = normalizedCategories.find((item) => item.id === template.id);
    return (
      existing ??
      normalizeFinancialCategory({
        id: template.id,
        name: template.name,
        capAmount: 0,
        dueAmount: 0,
        noDueAmount: 0,
        system: true,
        requiresDue: template.requiresDue,
      })
    );
  });

  return orderFinancialCategories([...coreRows, ...extras]);
}

export function splitTaggedTitle(title: string) {
  const normalizedTitle = title.trim();
  const matchedTag = DUE_TAG_OPTIONS.find((tag) => normalizedTitle.startsWith(`${tag} `));
  if (!matchedTag) return { dueTag: '', dueTitle: normalizedTitle };
  return {
    dueTag: matchedTag,
    dueTitle: normalizedTitle.slice(matchedTag.length).trim(),
  };
}

export function buildDueTitle(category: FinancialLineCategory | null, title: string, dueTag: string) {
  const trimmedTitle = title.trim();
  if (!trimmedTitle) return '';
  const isCustomCategory = category ? !category.system : false;
  if (!isCustomCategory || !dueTag.trim()) return trimmedTitle;
  return `${dueTag.trim()} ${trimmedTitle}`;
}

export function parseMoneyInput(value: string) {
  return Number(value.replace(/,/g, '')) || 0;
}

export function formatMoneyInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('en-US');
}

export function formatMoneyLabel(value: number) {
  return `${Math.round(value).toLocaleString('en-US')} تومان`;
}

export function buildFinancialLineCategories(params: { lineId: string; title: string; capAmount?: number }) {
  const { lineId, title, capAmount = 0 } = params;

  const header = normalizeFinancialCategory({
    id: lineId,
    name: title,
    capAmount,
    dueAmount: 0,
    noDueAmount: capAmount,
    system: false,
    requiresDue: false,
  });

  const subRows = FINANCIAL_SUB_CATEGORY_IDS.map((subKey) => {
    const template = SYSTEM_FINANCIAL_CATEGORIES.find((item) => item.id === subKey)!;
    return normalizeFinancialCategory({
      id: `${lineId}:${subKey}`,
      name: template.name,
      capAmount: 0,
      dueAmount: 0,
      noDueAmount: 0,
      system: true,
      requiresDue: template.requiresDue,
    });
  });

  return orderFinancialCategories([header, ...subRows]);
}

export function createFinancialLineId(suffix: string) {
  return `${FINANCIAL_LINE_PREFIX}${suffix}`;
}
