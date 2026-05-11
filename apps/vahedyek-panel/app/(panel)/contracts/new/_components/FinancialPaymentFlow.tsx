'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ListChecks, Pencil, Plus, Trash2 } from 'lucide-react';
import { Input } from '@repo/ui';
import { persianMoneyWords } from '../../../../lib/persianNumberWords';
import { isFinancialLineHeaderCategoryId, isFinancialLineSubtreeCategoryId } from '../../../../lib/financialUtils';
import type { FinancialCategoryData, FinancialDueItemData } from '../../../../types/contract';

const PRINCIPAL_SUB_CATEGORY_IDS = ['advance', 'installment', 'loan', 'handover', 'document'] as const;

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

function CollapsedLineSummary({
  totalLabel,
  lineTotal,
  dueRegistered,
  formatMoney,
}: {
  totalLabel: string;
  lineTotal: number;
  dueRegistered: number;
  formatMoney: (value: number) => string;
}) {
  return (
    <div className="mt-2 rounded-xl border border-[#e3e7ec] bg-[#f4f9fa]/90 px-3 py-2.5 text-[12px] leading-6 text-[#4b5159]">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <span>
          <span className="text-[#6b7078]">{totalLabel} </span>
          <span className="font-bold text-[#0e989d]">{formatMoney(lineTotal)}</span>
        </span>
        <span>
          <span className="text-[#6b7078]">مبلغ سررسید ثبت‌شده: </span>
          <span className="font-bold text-[#2d3740]">{formatMoney(dueRegistered)}</span>
        </span>
      </div>
    </div>
  );
}

function sumRegisteredDuesForCategories(
  categoryDueItemsMap: Record<string, FinancialDueItemData[]>,
  categoryIds: string[],
): number {
  let sum = 0;
  for (const id of categoryIds) {
    for (const item of categoryDueItemsMap[id] ?? []) {
      sum += item.amount;
    }
  }
  return sum;
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
  expanded,
  onToggle,
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
  expanded: boolean;
  onToggle?: (categoryId: string) => void;
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
        {onToggle ? (
          <button
            type="button"
            onClick={() => onToggle(category.id)}
            className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl px-2 py-2 text-right transition hover:bg-white/70"
            aria-expanded={expanded}
          >
            <span className="flex min-w-0 items-center gap-2 text-[13px] font-bold text-[#52575f]">
              <ListChecks className="h-5 w-5 shrink-0 text-[#59606a]" />
              <span className="truncate">{category.name}</span>
            </span>
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-[#0e989d] shadow-sm transition">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-[13px] font-bold text-[#52575f]">
            <ListChecks className="h-5 w-5 text-[#59606a]" />
            <span>{category.name}</span>
          </div>
        )}
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

      {onToggle && !expanded ? (
        <CollapsedLineSummary
          totalLabel="مبلغ کل این ردیف مالی:"
          lineTotal={category.capAmount}
          dueRegistered={dueItems.reduce((s, item) => s + item.amount, 0)}
          formatMoney={formatMoney}
        />
      ) : null}

      <div className={`grid transition-all duration-500 ease-out ${expanded ? 'mt-2 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
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
        </div>
      </div>
    </section>
  );
}

export function FinancialPaymentFlow({
  categories,
  lockedCategoryIds,
  categoryDueItemsMap,
  principalAmount,
  principalExpanded,
  onTogglePrincipal,
  expandedCustomCategoryId,
  onToggleCustomCategory,
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
  principalAmount: number;
  principalExpanded: boolean;
  onTogglePrincipal: () => void;
  expandedCustomCategoryId: string | null;
  onToggleCustomCategory: (categoryId: string) => void;
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
  const principal = categories.find((c) => c.id === 'principal') ?? null;
  const subCategoryOrder = PRINCIPAL_SUB_CATEGORY_IDS;
  const visibleCategories = subCategoryOrder
    .map((id) => categories.find((c) => c.id === id))
    .filter(Boolean) as FinancialCategoryData[];
  const financialLineRoots = categories.filter((c) => isFinancialLineHeaderCategoryId(c.id));
  const legacySingleCustomCategories = categories.filter(
    (c) =>
      c.id !== 'principal' &&
      !subCategoryOrder.includes(c.id as (typeof subCategoryOrder)[number]) &&
      !isFinancialLineHeaderCategoryId(c.id) &&
      !isFinancialLineSubtreeCategoryId(c.id),
  );

  const principalDueRegisteredTotal = useMemo(
    () => sumRegisteredDuesForCategories(categoryDueItemsMap, [...PRINCIPAL_SUB_CATEGORY_IDS]),
    [categoryDueItemsMap],
  );

  return (
    <section className="border-b border-[#d9dde4] pb-5">
      <div className="mb-3 text-[13px] font-bold text-[#4c5259]">پرداخت قرارداد</div>

      <section className="border-t border-[#d9dde4] px-4 py-4 first:border-t-0 md:px-5">
        <button
          type="button"
          onClick={onTogglePrincipal}
          className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-2 text-right transition hover:bg-white/70"
          aria-expanded={principalExpanded}
        >
          <span className="flex items-center gap-2 text-[13px] font-bold text-[#52575f]">
            <ListChecks className="h-5 w-5 text-[#59606a]" />
            <span>{principal?.name ?? 'مبلغ اصل قرارداد'}</span>
          </span>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-[#0e989d] shadow-sm transition">
            {principalExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </button>

        {!principalExpanded ? (
          <CollapsedLineSummary
            totalLabel="مبلغ کل قرارداد:"
            lineTotal={principalAmount}
            dueRegistered={principalDueRegisteredTotal}
            formatMoney={formatMoney}
          />
        ) : null}

        <div className={`grid transition-all duration-500 ease-out ${principalExpanded ? 'mt-2 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`}>
          <div className="overflow-hidden">
            <div className="grid gap-3 lg:grid-cols-[1fr_minmax(280px,420px)] lg:items-start">
              <div>
                <p className="text-[13px] leading-7 text-[#666b73]">
                  مبلغ کل قرارداد از بخش قیمت‌گذاری (بالای همین صفحه) خوانده می‌شود و قابل ویرایش مستقیم نیست.
                </p>
              </div>
              <div className="opacity-70">
                <MoneyInput value={principalAmount} onChange={() => {}} />
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-[#d9dde4] bg-white/70">
              {visibleCategories.map((category) => (
                <PaymentSection
                  key={category.id}
                  category={category}
                  locked={lockedCategoryIds.includes(category.id)}
                  dueItems={categoryDueItemsMap[category.id] ?? []}
                  expanded={true}
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
            </div>
          </div>
        </div>
      </section>

      {financialLineRoots.map((lineHeader) => {
        const lineSubs = subCategoryOrder
          .map((subId) => categories.find((c) => c.id === `${lineHeader.id}:${subId}`))
          .filter(Boolean) as FinancialCategoryData[];
        const lineExpanded = expandedCustomCategoryId === lineHeader.id;

        return (
          <section key={lineHeader.id} className="border-t border-[#d9dde4] px-4 py-4 first:border-t-0 md:px-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleCustomCategory(lineHeader.id)}
                className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-xl px-2 py-2 text-right transition hover:bg-white/70"
                aria-expanded={lineExpanded}
              >
                <span className="flex items-center gap-2 text-[13px] font-bold text-[#52575f]">
                  <ListChecks className="h-5 w-5 shrink-0 text-[#59606a]" />
                  <span className="truncate">{lineHeader.name}</span>
                </span>
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70 text-[#0e989d] shadow-sm transition">
                  {lineExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
              </button>
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onOpenEditCategory(lineHeader)}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-white"
                  aria-label={`ویرایش ${lineHeader.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteCategory(lineHeader.id)}
                  className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
                  aria-label={`حذف ${lineHeader.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!lineExpanded ? (
              <CollapsedLineSummary
                totalLabel="مبلغ کل این ردیف مالی:"
                lineTotal={lineHeader.capAmount}
                dueRegistered={sumRegisteredDuesForCategories(
                  categoryDueItemsMap,
                  lineSubs.map((c) => c.id),
                )}
                formatMoney={formatMoney}
              />
            ) : null}

            <div className={`grid transition-all duration-500 ease-out ${lineExpanded ? 'mt-2 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="grid gap-3 lg:grid-cols-[1fr_minmax(280px,420px)] lg:items-start">
                  <div>
                    <p className="text-[13px] leading-7 text-[#666b73]">
                      سقف کل این ردیف مالی را مشخص کنید؛ پرداخت‌ها در پنج بخش زیر جزئی‌تر ثبت می‌شوند (مثل «مبلغ اصل قرارداد»).
                    </p>
                  </div>
                  <div>
                    <MoneyInput value={lineHeader.capAmount} onChange={(value) => onCategoryAmountChange(lineHeader.id, value)} />
                  </div>
                </div>

                <div className="mt-3 rounded-2xl border border-[#d9dde4] bg-white/70">
                  {lineSubs.map((category) => (
                    <PaymentSection
                      key={category.id}
                      category={category}
                      locked={lockedCategoryIds.includes(category.id)}
                      dueItems={categoryDueItemsMap[category.id] ?? []}
                      expanded={true}
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
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {legacySingleCustomCategories.length ? (
        <section className="mt-3 rounded-2xl border border-[#d9dde4] bg-white/70">
          {legacySingleCustomCategories.map((category) => (
            <PaymentSection
              key={category.id}
              category={category}
              locked={lockedCategoryIds.includes(category.id)}
              dueItems={categoryDueItemsMap[category.id] ?? []}
              expanded={expandedCustomCategoryId === category.id}
              onToggle={onToggleCustomCategory}
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
        </section>
      ) : null}

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
