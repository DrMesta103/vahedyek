'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ListChecks, Pencil, Plus, Trash2 } from 'lucide-react';
import { Input } from '@repo/ui';
import { persianMoneyWords } from '../../../../lib/persianNumberWords';
import type { FinancialCategoryData, FinancialDueItemData } from '../../../../types/contract';

function MoneyInput({ value, onChange }: { value: number; onChange: (value: string) => void }) {
  const words = persianMoneyWords(value);

  return (
    <div className="w-full max-w-sm">
      <div className="relative">
        <Input
          value={value ? value.toLocaleString('en-US') : ''}
          onChange={(event) => onChange(event.target.value)}
          placeholder="مبلغ را وارد کنید"
          className="h-10 rounded-xl border-[#aeb9c3] bg-white/70 pr-4 pl-14 text-left text-[14px] font-semibold"
          inputMode="numeric"
        />
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-xs font-semibold text-gray-400">تومان</span>
      </div>
      {words ? <div className="mt-1.5 text-[11px] font-bold leading-5 text-[#18a9c3]">{words}</div> : null}
    </div>
  );
}

function DueProgressGauge({ percent, overLimit }: { percent: number; overLimit: boolean }) {
  const safePercent = Math.max(0, Math.min(percent, 100));

  return (
    <div className="relative h-[74px] w-[132px] shrink-0">
      <svg viewBox="0 0 120 70" className="h-full w-full overflow-visible">
        <path d="M14 58 A46 46 0 0 1 106 58" fill="none" stroke="rgba(255,255,255,0.82)" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M14 58 A46 46 0 0 1 106 58"
          fill="none"
          stroke={overLimit ? '#ff6b6b' : '#0e989d'}
          strokeWidth="10"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - safePercent}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-1 text-center text-[18px] font-bold text-[#4b5159]">{safePercent}%</div>
    </div>
  );
}

function PaymentSection({
  category,
  locked,
  dueItems,
  onAmountChange,
  onEdit,
  onDelete,
  onOpenDueDialog,
  onEditDueItem,
  onDeleteDueItem,
  formatInput,
  formatMoney,
  invalid = false,
}: {
  category: FinancialCategoryData;
  locked: boolean;
  dueItems: FinancialDueItemData[];
  onAmountChange: (categoryId: string, value: string) => void;
  onEdit: (category: FinancialCategoryData) => void;
  onDelete: (categoryId: string) => void;
  onOpenDueDialog: (categoryId: string) => void;
  onEditDueItem: (item: FinancialDueItemData) => void;
  onDeleteDueItem: (dueItemId: string) => void;
  formatInput: (value: string) => string;
  formatMoney: (value: number) => string;
  invalid?: boolean;
}) {
  const requiresDue = category.requiresDue;
  const dueTotal = dueItems.reduce((sum, item) => sum + item.amount, 0);
  const remainingAmount = category.capAmount - dueTotal;
  const progressPercent = category.capAmount > 0 ? Math.min(Math.round((dueTotal / category.capAmount) * 100), 100) : 0;
  const [showDueItems, setShowDueItems] = useState(requiresDue);

  return (
    <section className={`border-t px-4 py-4 first:border-t-0 md:px-5 ${invalid ? 'border-rose-300 bg-rose-50/30' : 'border-[#d9dde4]'}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px] font-bold text-[#52575f]">
          <ListChecks className="h-5 w-5 text-[#59606a]" />
          <span>{category.name}</span>
        </div>
        {!locked ? (
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => onEdit(category)} className="rounded-lg p-2 text-gray-500 transition hover:bg-white">
              <Pencil className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => onDelete(category.id)} className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_minmax(280px,420px)] lg:items-start">
        <div>
          <p className="text-[13px] leading-7 text-[#666b73]">
            مبلغ و زمان‌بندی پرداخت این ردیف را مشخص کنید. مبلغ این بخش در نمودار قرارداد و جمع پرداخت‌های تعریف‌شده لحاظ می‌شود.
          </p>
          {requiresDue ? (
            <button
              type="button"
              onClick={() => onOpenDueDialog(category.id)}
              className="mt-2 h-8 rounded-lg border border-[#14a7ad] bg-white/65 px-3 text-xs font-bold text-[#0e989d] transition hover:bg-[#dff4f3]"
            >
              ثبت سررسید برای {category.name}
            </button>
          ) : (
            <div className="mt-2 text-[12px] font-bold text-[#6b7078]">این ردیف مالی نیازی به ثبت سررسید ندارد.</div>
          )}
          {requiresDue && dueTotal !== category.capAmount ? (
            <div className="mt-2 text-[13px] font-bold text-[#ff5d5d]">مبلغ سررسیدهای تعریف‌شده با مبلغ این ردیف برابر نیست.</div>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <MoneyInput value={category.capAmount} onChange={(value) => onAmountChange(category.id, formatInput(value))} />
          </div>
        </div>
      </div>

      {requiresDue ? (
        <>
          <div className="mt-3 rounded-xl bg-[#c4e8ea]/55 px-3 py-3 text-[13px] text-[#4f545d] transition-all duration-300 ease-out hover:bg-[#c4e8ea]/70">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <DueProgressGauge percent={progressPercent} overLimit={remainingAmount < 0} />
                <div className="grid min-w-0 flex-1 gap-2 md:grid-cols-3">
                  <div>
                    <div className="text-[11px] text-[#6b7078]">سررسید</div>
                    <div className="mt-0.5 font-bold text-[#4b5159]">{dueItems.length} مورد</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6b7078]">ثبت‌شده</div>
                    <div className="mt-0.5 font-bold text-[#0e989d]">{formatMoney(dueTotal)}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#6b7078]">{remainingAmount >= 0 ? 'مانده' : 'مازاد'}</div>
                    <div className={`mt-0.5 font-bold ${remainingAmount >= 0 ? 'text-[#4b5159]' : 'text-[#ff5252]'}`}>
                      {formatMoney(Math.abs(remainingAmount))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDueItems((current) => !current)}
                disabled={!dueItems.length}
                aria-label={showDueItems ? 'مخفی کردن سررسیدها' : 'نمایش سررسیدها'}
                title={showDueItems ? 'مخفی کردن سررسیدها' : 'نمایش سررسیدها'}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-[#0e989d] shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                {showDueItems ? <ChevronUp className="h-4 w-4 transition-transform duration-300" /> : <ChevronDown className="h-4 w-4 transition-transform duration-300" />}
              </button>
            </div>
          </div>

          <div className={`grid transition-all duration-500 ease-out ${showDueItems && dueItems.length ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
              <div className="grid gap-2 md:grid-cols-2">
                {dueItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#e3e7ec] bg-white/85 px-3 py-2.5 text-[13px] transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                    <div>
                      <div className="font-bold text-[#4b5058]">{item.title}</div>
                      <div className="mt-1 text-xs text-gray-500">{item.dueDate}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0e989d]">{formatMoney(item.amount)}</span>
                      <button type="button" onClick={() => onEditDueItem(item)} className="rounded-lg p-1 text-gray-500 transition hover:bg-gray-50">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => onDeleteDueItem(item.id)} className="rounded-lg p-1 text-rose-500 transition hover:bg-rose-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}

export function FinancialPaymentFlow({
  categories,
  lockedCategoryIds,
  categoryDueItemsMap,
  onCategoryAmountChange,
  onOpenAddCategory,
  onOpenEditCategory,
  onDeleteCategory,
  onOpenDueDialog,
  onEditDueItem,
  onDeleteDueItem,
  formatInput,
  formatMoney,
  invalidCategoryIds = [],
}: {
  categories: FinancialCategoryData[];
  lockedCategoryIds: string[];
  categoryDueItemsMap: Record<string, FinancialDueItemData[]>;
  onCategoryAmountChange: (categoryId: string, value: string) => void;
  onOpenAddCategory: () => void;
  onOpenEditCategory: (category: FinancialCategoryData) => void;
  onDeleteCategory: (categoryId: string) => void;
  onOpenDueDialog: (categoryId: string) => void;
  onEditDueItem: (item: FinancialDueItemData) => void;
  onDeleteDueItem: (dueItemId: string) => void;
  formatInput: (value: string) => string;
  formatMoney: (value: number) => string;
  invalidCategoryIds?: string[];
}) {
  return (
    <section className="border-b border-[#d9dde4] pb-5">
      <div className="mb-3 text-[13px] font-bold text-[#4c5259]">پرداخت قرارداد</div>

      {categories.map((category) => (
        <PaymentSection
          key={category.id}
          category={category}
          locked={lockedCategoryIds.includes(category.id)}
          dueItems={categoryDueItemsMap[category.id] ?? []}
          onAmountChange={onCategoryAmountChange}
          onEdit={onOpenEditCategory}
          onDelete={onDeleteCategory}
          onOpenDueDialog={onOpenDueDialog}
          onEditDueItem={onEditDueItem}
          onDeleteDueItem={onDeleteDueItem}
          formatInput={formatInput}
          formatMoney={formatMoney}
          invalid={invalidCategoryIds.includes(category.id)}
        />
      ))}

      <div className="border-t border-[#d9dde4] py-4">
        <button
          type="button"
          onClick={onOpenAddCategory}
          className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#14a7ad] bg-white/65 px-3 text-xs font-bold text-[#0e989d] transition hover:bg-[#dff4f3]"
        >
          <Plus className="h-4 w-4" />
          افزودن ردیف مالی
        </button>
      </div>
    </section>
  );
}
