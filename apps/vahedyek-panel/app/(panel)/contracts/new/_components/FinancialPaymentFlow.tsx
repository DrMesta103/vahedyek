'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ListChecks, Pencil, Plus, Trash2 } from 'lucide-react';
import { Input } from '../../../../components/ui/input';
import type { FinancialCategoryData, FinancialDueItemData } from '../../../../types/contract';

function MoneyInput({ value, onChange }: { value: number; onChange: (value: string) => void }) {
  return (
    <div className="relative w-full max-w-sm">
      <Input
        value={value ? value.toLocaleString('en-US') : ''}
        onChange={(event) => onChange(event.target.value)}
        placeholder="مبلغ را وارد کنید"
        className="h-10 rounded-xl border-[#aeb9c3] bg-white/70 pr-4 pl-14 text-left text-[14px] font-semibold"
        inputMode="numeric"
      />
      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-xs font-semibold text-gray-400">تومان</span>
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
}) {
  const dueTotal = dueItems.reduce((sum, item) => sum + item.amount, 0);
  const remainingAmount = category.capAmount - dueTotal;
  const progressPercent = category.capAmount > 0 ? Math.min(Math.round((dueTotal / category.capAmount) * 100), 100) : 0;
  const [showDueItems, setShowDueItems] = useState(true);
  const regularDueItems = dueItems.filter((item) => item.title.includes('منظم') || item.title.includes('ماهانه') || item.title.includes('روزانه'));
  const irregularDueItems = dueItems.filter((item) => !regularDueItems.includes(item));

  return (
    <section className="border-t border-[#d9dde4] px-4 py-4 first:border-t-0 md:px-5">
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
          {dueTotal !== category.capAmount ? (
          <div className="mt-2 text-[13px] font-bold text-[#ff5d5d]">
              مبلغ سررسیدهای تعریف‌شده با مبلغ این ردیف برابر نیست.
            </div>
          ) : null}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenDueDialog(category.id)}
              className="h-9 rounded-full border border-[#14a7ad] bg-white/65 px-4 text-sm font-bold text-[#0e989d] transition hover:bg-[#dff4f3]"
            >
              نحوه پرداخت {category.name}
            </button>
            <MoneyInput value={category.capAmount} onChange={(value) => onAmountChange(category.id, formatInput(value))} />
          </div>
          <div className="mt-2 text-sm font-bold text-[#18a9c3]">{formatMoney(category.capAmount)}</div>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-[#c4e8ea]/70 px-3 py-2.5 text-[13px] text-[#4f545d]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-bold text-[#4b5159]">سررسیدهای ثبت‌شده</div>
          <button
            type="button"
            onClick={() => setShowDueItems((current) => !current)}
            disabled={!dueItems.length}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/65 px-3 py-1.5 text-xs font-bold text-[#0e989d] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showDueItems ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showDueItems ? 'مخفی کردن سررسیدها' : 'نمایش سررسیدها'}
          </button>
        </div>

        <div className="mt-2 grid gap-2 md:grid-cols-3">
          <div>{dueItems.length} مورد سررسید</div>
          <div>مبلغ ثبت‌شده: <strong>{formatMoney(dueTotal)}</strong></div>
          <div>
            {remainingAmount >= 0 ? 'مبلغ مانده: ' : 'مبلغ بیشتر از ردیف: '}
            <strong className={remainingAmount >= 0 ? 'text-[#0e989d]' : 'text-[#ff5252]'}>
              {formatMoney(Math.abs(remainingAmount))}
            </strong>
          </div>
        </div>

        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between text-xs text-[#5c6169]">
            <span>پوشش مبلغ ردیف</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/70">
            <div
              className={`h-full rounded-full ${remainingAmount < 0 ? 'bg-[#ff6b6b]' : 'bg-[#0e989d]'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {showDueItems && dueItems.length ? (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {dueItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-[#e3e7ec] bg-white/95 px-3 py-2.5 text-[13px]">
              <div>
                <div className="font-bold text-[#4b5058]">{item.title}</div>
                <div className="mt-1 text-xs text-gray-500">{item.dueDate}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0e989d]">{formatMoney(item.amount)}</span>
                <button type="button" onClick={() => onEditDueItem(item)} className="rounded-lg p-1 text-gray-500 hover:bg-gray-50">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => onDeleteDueItem(item.id)} className="rounded-lg p-1 text-rose-500 hover:bg-rose-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {category.id === 'installment' ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-[#c4e8f5]/80 p-3 text-[13px] text-[#267f9f]">
            <div>تعداد اقساط منظم</div>
            <div className="mt-1 text-[13px] font-bold">{regularDueItems.length} قسط</div>
            <div className="mt-2">مجموع اقساط منظم</div>
            <div className="mt-1 text-[13px] font-bold">{formatMoney(regularDueItems.reduce((sum, item) => sum + item.amount, 0))}</div>
          </div>
          <div className="rounded-xl bg-[#ffedc4]/80 p-3 text-[13px] text-[#df9a12]">
            <div>تعداد اقساط نامنظم</div>
            <div className="mt-1 text-[13px] font-bold">{irregularDueItems.length} قسط</div>
            <div className="mt-2">مجموع اقساط نامنظم</div>
            <div className="mt-1 text-[13px] font-bold">{formatMoney(irregularDueItems.reduce((sum, item) => sum + item.amount, 0))}</div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function FinancialPaymentFlow({
  categories,
  lockedCategoryIds,
  categoryDueItemsMap,
  dueAmount,
  onCategoryAmountChange,
  onOpenAddCategory,
  onOpenEditCategory,
  onDeleteCategory,
  onOpenDueDialog,
  onEditDueItem,
  onDeleteDueItem,
  formatInput,
  formatMoney,
}: {
  categories: FinancialCategoryData[];
  lockedCategoryIds: string[];
  categoryDueItemsMap: Record<string, FinancialDueItemData[]>;
  dueAmount: number;
  onCategoryAmountChange: (categoryId: string, value: string) => void;
  onOpenAddCategory: () => void;
  onOpenEditCategory: (category: FinancialCategoryData) => void;
  onDeleteCategory: (categoryId: string) => void;
  onOpenDueDialog: (categoryId: string) => void;
  onEditDueItem: (item: FinancialDueItemData) => void;
  onDeleteDueItem: (dueItemId: string) => void;
  formatInput: (value: string) => string;
  formatMoney: (value: number) => string;
}) {
  return (
    <section className="border-b border-[#d9dde4] pb-5">
      <div className="mb-3 text-[13px] font-bold text-[#4c5259]">
        پرداخت قرارداد
      </div>

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
        />
      ))}

      <div className="border-t border-[#d9dde4] py-4">
        <button
          type="button"
          onClick={onOpenAddCategory}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-[#14a7ad] bg-white/65 px-4 text-sm font-bold text-[#0e989d] transition hover:bg-[#dff4f3]"
        >
          <Plus className="h-4 w-4" />
          افزودن ردیف مالی
        </button>
      </div>

      <div className="border-t border-[#d9dde4] py-4 text-[13px] text-[#4f545d]">
        جمع سررسیدهای ثبت‌شده: <strong>{formatMoney(dueAmount)}</strong>
      </div>
    </section>
  );
}
