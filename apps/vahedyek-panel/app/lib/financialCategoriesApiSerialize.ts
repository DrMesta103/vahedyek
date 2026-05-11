import { sortFinancialCategoriesForPersistence } from './financialUtils';
import { unwrapFinancialScopedId } from './financialScopedIds';

type CatRow = {
  id: string;
  name: string;
  capAmount: unknown;
  dueAmount: unknown;
  noDueAmount: unknown;
  system: boolean;
  requiresDue: boolean;
};

type DueRow = {
  id: string;
  categoryId: string;
  title: string;
  amount: unknown;
  dueDate: string;
};

/** دسته‌ها را مثل مسیر GET مالی پیش‌نویس به شناسهٔ منطقی (principal، advance، fin-line-…) برمی‌گرداند و مرتب می‌کند. */
export function mapFinancialCategoriesForClientApi(financialId: string, categories: readonly CatRow[]) {
  return sortFinancialCategoriesForPersistence(
    categories.map((item) => ({
      id: unwrapFinancialScopedId(financialId, item.id),
      name: item.name,
      capAmount: Number(item.capAmount),
      dueAmount: Number(item.dueAmount),
      noDueAmount: Number(item.noDueAmount),
      system: item.system,
      requiresDue: item.requiresDue,
    })),
  );
}

export function mapFinancialDueItemsForClientApi(financialId: string, dueItems: readonly DueRow[]) {
  return dueItems.map((item) => ({
    id: unwrapFinancialScopedId(financialId, item.id),
    categoryId: unwrapFinancialScopedId(financialId, item.categoryId),
    title: item.title,
    amount: Number(item.amount),
    dueDate: item.dueDate,
  }));
}

export function mapFinancialDueItemsForClientApiFiltered(
  financialId: string,
  dueItems: readonly DueRow[],
  validLogicalCategoryIds: Set<string>,
) {
  return mapFinancialDueItemsForClientApi(financialId, dueItems).filter((d) => validLogicalCategoryIds.has(d.categoryId));
}

/** activeTab ذخیره‌شده در DB گاه با پیشوند financialId است؛ برای کلاینت منطقی می‌شود اگر دسته موجود باشد */
export function resolveFinancialActiveTabForClientApi(
  financialId: string,
  storedActiveTab: string | null | undefined,
  categoryLogicalIds: Set<string>,
  fallbackLogicalId?: string,
): string {
  if (!storedActiveTab?.trim()) return fallbackLogicalId ?? '';
  const logical = unwrapFinancialScopedId(financialId, storedActiveTab);
  if (logical && categoryLogicalIds.has(logical)) return logical;
  return fallbackLogicalId ?? '';
}
