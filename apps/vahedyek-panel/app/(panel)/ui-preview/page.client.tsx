'use client';

import { useMemo, useState } from 'react';
import {
  BusinessSwitch,
  ChoicePillsField,
  DataTable,
  EmptyState,
  ExpandableTagGroup,
  Input,
  PageIntro,
  PersianDatePicker,
  PrimaryLink,
  RuleAmountInput,
  RuleFieldLabel,
  RuleTabButton,
  SegmentedToggle,
  StatGrid,
} from '@repo/ui';
import { BadgePercent, CircleDollarSign, SlidersHorizontal, UserRoundCog } from 'lucide-react';

export default function UiPreviewPageClient() {
  const [toggle, setToggle] = useState(false);
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('forms');
  const [activeTab, setActiveTab] = useState<'percent' | 'fixed' | 'combined' | 'sales'>('percent');
  const [percent, setPercent] = useState('');
  const [amount, setAmount] = useState('');
  const [combinedPercent, setCombinedPercent] = useState('');
  const [combinedAmount, setCombinedAmount] = useState('');
  const [salesEnabled, setSalesEnabled] = useState(false);
  const [tagSample, setTagSample] = useState<'opt-1' | 'opt-2' | 'opt-3'>('opt-2');
  const [expandableTagSelected, setExpandableTagSelected] = useState('2');

  const catalog = useMemo(
    () => [
      {
        id: 'forms',
        title: 'Form Controls',
        items: [
          { id: 'input', title: 'Input' },
          { id: 'segmented-toggle', title: 'SegmentedToggle' },
          { id: 'date', title: 'PersianDatePicker' },
          { id: 'rule-amount', title: 'RuleAmountInput (تومان / %)' },
          { id: 'business-switch', title: 'BusinessSwitch' },
          { id: 'choice-pills', title: 'ChoicePillsField (Label + Tag selection)' },
        ],
      },
      {
        id: 'navigation',
        title: 'Navigation',
        items: [{ id: 'rule-tabs', title: 'RuleTabButton (Tabs)' }],
      },
      {
        id: 'layout',
        title: 'Layout / Tables',
        items: [
          { id: 'page-intro', title: 'PageIntro' },
          { id: 'stat-grid', title: 'StatGrid' },
          { id: 'empty-state', title: 'EmptyState' },
          { id: 'data-table', title: 'DataTable' },
        ],
      },
      {
        id: 'screens',
        title: 'Screens',
        items: [{ id: 'prepayment', title: 'Prepayment (sample)' }],
      },
    ],
    [],
  );

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((it) => it.title.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [catalog, query]);

  const visibleCategories = filteredCatalog;
  const effectiveCategoryId = visibleCategories.some((c) => c.id === activeCategory) ? activeCategory : visibleCategories[0]?.id ?? 'forms';

  return (
    <div className="min-h-screen bg-[color:var(--bg-body)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 p-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:p-6">
        <aside className="sticky top-4 h-fit rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--surface)] p-4">
          <div className="mb-3">
            <div className="text-sm font-black text-[color:var(--text-strong)]">UI Catalog</div>
            <div className="mt-1 text-xs text-[color:var(--text-muted)]">
              preview `@repo/ui`
            </div>
          </div>
          <div className="mb-3">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجو..." />
          </div>
          <nav className="space-y-1">
            {visibleCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                  effectiveCategoryId === cat.id
                    ? 'bg-[color:var(--theme-accent-softer)] text-[color:var(--text-strong)]'
                    : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface-soft)] hover:text-[color:var(--text-strong)]'
                }`}
              >
                <span className="font-bold">{cat.title}</span>
                <span className="text-xs opacity-70">{cat.items.length}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="space-y-6">
          <div className="rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--surface)] p-5">
            <h1 className="text-lg font-black text-[color:var(--text-strong)]">UI Preview</h1>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">
              اینجا همه کامپوننت‌ها دسته‌بندی شده و قابل preview هستند.
            </p>
          </div>

          {effectiveCategoryId === 'forms' ? (
            <section className="space-y-5 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--surface)] p-5">
              <div className="text-sm font-black text-[color:var(--text-strong)]">Form Controls</div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[color:var(--text-muted)]">Input</div>
                  <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="متن نمونه..." />
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[color:var(--text-muted)]">SegmentedToggle</div>
                  <div className="flex items-center gap-4">
                    <SegmentedToggle checked={toggle} onChange={setToggle} activeLabel="فعال" inactiveLabel="غیرفعال" />
                    <span className="text-sm text-[color:var(--text-muted)]">{toggle ? 'فعال' : 'غیرفعال'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[color:var(--text-muted)]">PersianDatePicker</div>
                  <PersianDatePicker value={date} onChange={setDate} placeholder="YYYY/MM/DD" containerClassName="w-full" />
                </div>
                <div className="space-y-2">
                  <RuleFieldLabel label="RuleAmountInput" required rightSlot={<span className="text-xs text-[color:var(--text-muted)]">تومان</span>} />
                  <RuleAmountInput value={amount} onChange={setAmount} suffix="تومان" />
                  <div className="mt-3">
                    <RuleFieldLabel label="RuleAmountInput" rightSlot={<span className="text-xs text-[color:var(--text-muted)]">%</span>} />
                    <RuleAmountInput value={percent} onChange={setPercent} suffix="%" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[color:var(--text-muted)]">BusinessSwitch</div>
                  <BusinessSwitch checked={salesEnabled} onChange={setSalesEnabled} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="text-xs font-semibold text-[color:var(--text-muted)]">ChoicePillsField</div>
                  <ChoicePillsField
                    label="نمونه تگ‌ها"
                    options={[
                      { value: 'opt-1', label: 'گزینه تست ۱' },
                      { value: 'opt-2', label: 'گزینه تست ۲' },
                      { value: 'opt-3', label: 'گزینه تست ۳' },
                    ]}
                    value={tagSample}
                    onChange={setTagSample}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="text-xs font-semibold text-[color:var(--text-muted)]">ExpandableTagGroup (Search + More/Less)</div>
                  <ExpandableTagGroup
                    label="دسته‌بندی‌ها"
                    required
                    items={[
                      { id: '1', name: 'آیتم ۱', sub: 'زیرعنوان' },
                      { id: '2', name: 'آیتم ۲' },
                      { id: '3', name: 'آیتم ۳' },
                      { id: '4', name: 'آیتم ۴' },
                      { id: '5', name: 'آیتم ۵' },
                      { id: '6', name: 'آیتم ۶' },
                      { id: '7', name: 'آیتم ۷' },
                      { id: '8', name: 'آیتم ۸' },
                      { id: '9', name: 'آیتم ۹' },
                      { id: '10', name: 'آیتم ۱۰' },
                    ]}
                    selectedId={expandableTagSelected}
                    onSelect={setExpandableTagSelected}
                    emptyText="موردی وجود ندارد"
                    itemsPerRow={8}
                  />
                </div>
              </div>
            </section>
          ) : null}

          {effectiveCategoryId === 'navigation' ? (
            <section className="space-y-5 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--surface)] p-5">
              <div className="text-sm font-black text-[color:var(--text-strong)]">Tabs</div>
              <div className="grid gap-3 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-3 lg:grid-cols-4">
                <RuleTabButton title="درصدی" icon={BadgePercent} active={activeTab === 'percent'} onClick={() => setActiveTab('percent')} />
                <RuleTabButton title="مبلغ ثابت" icon={CircleDollarSign} active={activeTab === 'fixed'} onClick={() => setActiveTab('fixed')} />
                <RuleTabButton title="ترکیبی" icon={SlidersHorizontal} active={activeTab === 'combined'} onClick={() => setActiveTab('combined')} />
                <RuleTabButton title="مدیر فروش" icon={UserRoundCog} active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} />
              </div>
            </section>
          ) : null}

          {effectiveCategoryId === 'layout' ? (
            <section className="space-y-5 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--surface)] p-5">
              <div className="text-sm font-black text-[color:var(--text-strong)]">Layout / Tables</div>
              <div className="rounded-xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-4">
                <PageIntro title="نمونه PageIntro" description="این بخش از primitives دسترنج داخل @repo/ui آمده است." action={<PrimaryLink href="#">اکشن</PrimaryLink>} />
              </div>
              <StatGrid items={[{ label: 'کارمند', value: 12 }, { label: 'سیاست', value: 3 }, { label: 'تقویم', value: 2 }]} />
              <div className="grid gap-4 md:grid-cols-2">
                <EmptyState title="EmptyState" description="اگر داده‌ای نباشد این کامپوننت نمایش داده می‌شود." action={<PrimaryLink href="#">ایجاد</PrimaryLink>} />
                <DataTable
                  columns={['نام', 'وضعیت']}
                  rows={[
                    ['نمونه ۱', <span key="a" className="text-emerald-700">فعال</span>],
                    ['نمونه ۲', <span key="b" className="text-slate-500">غیرفعال</span>],
                  ]}
                />
              </div>
            </section>
          ) : null}

          {effectiveCategoryId === 'screens' ? (
            <section className="space-y-5 rounded-2xl border border-[color:var(--border-color)] bg-[color:var(--surface)] p-5">
              <div className="text-sm font-black text-[color:var(--text-strong)]">Prepayment (sample)</div>
              <div className="grid gap-3 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-soft)] p-3 lg:grid-cols-4">
                <RuleTabButton title="درصدی" icon={BadgePercent} active={activeTab === 'percent'} onClick={() => setActiveTab('percent')} />
                <RuleTabButton title="مبلغ ثابت" icon={CircleDollarSign} active={activeTab === 'fixed'} onClick={() => setActiveTab('fixed')} />
                <RuleTabButton title="ترکیبی" icon={SlidersHorizontal} active={activeTab === 'combined'} onClick={() => setActiveTab('combined')} />
                <RuleTabButton title="مدیر فروش" icon={UserRoundCog} active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} />
              </div>

              {activeTab === 'percent' ? (
                <div className="space-y-4">
                  <RuleFieldLabel label="درصدی از مبلغ کل قرارداد" required />
                  <RuleAmountInput value={percent} onChange={setPercent} suffix="%" />
                </div>
              ) : null}

              {activeTab === 'fixed' ? (
                <div className="space-y-4">
                  <RuleFieldLabel label="مبلغ ثابت" required />
                  <RuleAmountInput value={amount} onChange={setAmount} suffix="تومان" />
                </div>
              ) : null}

              {activeTab === 'combined' ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <RuleFieldLabel label="درصدی از مبلغ کل قرارداد" required />
                    <RuleAmountInput value={combinedPercent} onChange={setCombinedPercent} suffix="%" />
                  </div>
                  <div className="space-y-4">
                    <RuleFieldLabel label="مبلغ ثابت" required />
                    <RuleAmountInput value={combinedAmount} onChange={setCombinedAmount} suffix="تومان" />
                  </div>
                </div>
              ) : null}

              {activeTab === 'sales' ? (
                <div className="flex flex-col gap-4 border-t border-[color:var(--border-soft)] pt-6 lg:flex-row">
                  <h4 className="flex-1 text-right text-[17px] font-black leading-8 text-[color:var(--text-strong)]">
                    امکان ثبت پیش‌پرداخت با توجه به سیاست مدیر فروش
                  </h4>
                  <BusinessSwitch checked={salesEnabled} onChange={setSalesEnabled} />
                </div>
              ) : null}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

