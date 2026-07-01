'use client';

import type { ReactNode } from 'react';
import { EllipsisVertical, Info, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormBox } from './FormBox';
import type { FinancialCategoryData, FinancialDueItemData } from '../../../../types/contract';

export function FinancialCategoriesBox({
  categories,
  activeTab,
  openMenuId,
  openInfoId,
  lockedCategoryIds,
  categoryDueItemsMap,
  visibleDueItems,
  chart,
  onActiveTabChange,
  onOpenMenuIdChange,
  onOpenInfoIdChange,
  onOpenAddCategory,
  onOpenEditCategory,
  onDeleteCategory,
  onOpenDueDialog,
  onDeleteDueItem,
  formatMoney,
}: {
  categories: FinancialCategoryData[];
  activeTab: string;
  openMenuId: string | null;
  openInfoId: string | null;
  lockedCategoryIds: string[];
  categoryDueItemsMap: Record<string, FinancialDueItemData[]>;
  visibleDueItems: FinancialDueItemData[];
  chart: ReactNode;
  onActiveTabChange: (id: string) => void;
  onOpenMenuIdChange: (id: string | null) => void;
  onOpenInfoIdChange: (id: string | null) => void;
  onOpenAddCategory: () => void;
  onOpenEditCategory: (category: FinancialCategoryData) => void;
  onDeleteCategory: (id: string) => void;
  onOpenDueDialog: () => void;
  onDeleteDueItem: (id: string) => void;
  formatMoney: (value: number) => string;
}) {
  return (
    <FormBox title="????????????? ????" description="???? ?? ????????? ????????? ??? ???? ? ???????? ?? ?????? ????.">
      <div className="mb-4 space-y-3">
        {chart}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => {
            const isLocked = lockedCategoryIds.includes(category.id);
            const categoryDueItems = categoryDueItemsMap[category.id] ?? [];

            return (
              <div
                key={category.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  onActiveTabChange(category.id);
                  onOpenMenuIdChange(null);
                }}
                onKeyDown={(event) => event.key === 'Enter' && onActiveTabChange(category.id)}
                className={`relative cursor-pointer rounded-[8px] border p-3.5 text-right transition-all ${
                  activeTab === category.id ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">{category.name}</span>
                      {isLocked ? <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-400">??????</span> : null}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{formatMoney(category.capAmount)}</p>
                  </div>

                  <div className="relative flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenMenuIdChange(null);
                        onOpenInfoIdChange(openInfoId === category.id ? null : category.id);
                      }}
                      className="rounded-[8px] p-1 text-sky-500 hover:bg-sky-50"
                      title="?????? ???? ????"
                    >
                      <Info className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenInfoIdChange(null);
                        onOpenMenuIdChange(openMenuId === category.id ? null : category.id);
                      }}
                      className="rounded-[8px] p-1 text-gray-400 hover:bg-gray-100"
                    >
                      <EllipsisVertical className="h-4 w-4" />
                    </button>

                    {openInfoId === category.id ? (
                      <div className="absolute left-0 top-8 z-20 w-72 rounded-[8px] border border-sky-100 bg-white p-3 shadow-lg" onClick={(event) => event.stopPropagation()}>
                        <div className="border-b border-gray-100 pb-2">
                          <div className="text-sm font-bold text-gray-800">?????? ???? ????</div>
                          <div className="mt-1 text-xs text-gray-500">{category.name}</div>
                        </div>
                        <div className="space-y-2 pt-3 text-xs text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>??? ????</span>
                            <span className="font-semibold text-gray-800">{formatMoney(category.capAmount)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>????? ????</span>
                            <span className="font-semibold text-gray-800">{isLocked ? '??????' : '???? ??????'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>????? ????????? ?????</span>
                            <span className="font-semibold text-gray-800">{categoryDueItems.length}</span>
                          </div>
                          <div className="border-t border-gray-100 pt-2">
                            <div className="mb-2 text-[11px] font-semibold text-gray-500">????????? ?????</div>
                            {categoryDueItems.length ? (
                              <div className="space-y-1.5">
                                {categoryDueItems.map((item) => (
                                  <div key={item.id} className="rounded-[8px] bg-gray-50 px-2.5 py-2">
                                    <div className="mb-1 text-[11px] font-semibold text-gray-700">{item.title}</div>
                                    <div className="flex items-center justify-between gap-3">
                                      <span>{item.dueDate}</span>
                                      <span className="font-semibold text-teal-700">{formatMoney(item.amount)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="rounded-[8px] border border-dashed border-gray-200 px-2.5 py-3 text-center text-[11px] text-gray-400">
                                ???? ??? ???? ???? ??????? ??? ???? ???.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {openMenuId === category.id ? (
                      <div className="absolute left-0 top-8 z-20 min-w-[132px] rounded-[8px] border border-gray-200 bg-white p-1.5 shadow-lg" onClick={(event) => event.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onOpenEditCategory(category)}
                          className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-right text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil className="h-4 w-4" />
                          ??????
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCategory(category.id)}
                          disabled={isLocked}
                          className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-right text-sm text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 className="h-4 w-4" />
                          ???
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button type="button" onClick={onOpenAddCategory} className="inline-flex h-10 items-center gap-2 rounded-[8px] border border-teal-300 bg-teal-50 px-4 text-sm font-medium text-teal-700 hover:bg-teal-100">
            <Plus className="h-4 w-4" />
            ?????? ???? ????
          </button>
        </div>
      </div>

      <div className="rounded-[8px] border border-gray-200 bg-gray-50 p-4">
        <div className="mb-4 flex flex-col gap-3 border-b border-gray-200 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-gray-800">{`????????? ${categories.find((item) => item.id === activeTab)?.name ?? ''}`}</p>
            <p className="mt-0.5 text-xs text-gray-500">????? ???????? ???? ????????? ???? ?? ??? ??? ????? ???? ??????.</p>
          </div>
          <button type="button" onClick={onOpenDueDialog} className="inline-flex h-9 items-center gap-2 rounded-[8px] border border-teal-300 bg-teal-50 px-4 text-sm font-medium text-teal-700 hover:bg-teal-100">
            <Plus className="h-4 w-4" />
            ??? ??????
          </button>
        </div>

        <div className="space-y-3">
          {visibleDueItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-[8px] border border-teal-100 bg-white p-3.5">
              <div>
                <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">?????: {item.dueDate}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-teal-700">{formatMoney(item.amount)}</span>
                <button type="button" onClick={() => onDeleteDueItem(item.id)} className="rounded-[8px] p-1 text-rose-500 hover:bg-rose-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {!visibleDueItems.length ? (
            <div className="rounded-[8px] border-2 border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
              ???? ??? ??? ??????? ??? ???? ???.
            </div>
          ) : null}
        </div>
      </div>
    </FormBox>
  );
}

