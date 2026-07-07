'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import type { TestFaqItem, TestFaqPriority } from '@/app/lib/types/taavia-test-workspace';

function createEmptyFaq(): TestFaqItem {
  return {
    id: `faq-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    question: '',
    answer: '',
    category: '',
    tags: [],
    priority: 'medium',
    isActive: true,
    supplementaryNote: '',
  };
}

type TestFaqEditorProps = {
  items: TestFaqItem[];
  onChange: (items: TestFaqItem[]) => void;
};

export function TestFaqEditor({ items, onChange }: TestFaqEditorProps) {
  const [search, setSearch] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query),
    );
  }, [items, search]);

  const updateItem = (itemId: string, patch: Partial<TestFaqItem>) => {
    onChange(items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    setValidationError(null);
    onChange([...items, createEmptyFaq()]);
  };

  const deleteItem = (itemId: string) => {
    onChange(items.filter((item) => item.id !== itemId));
  };

  const validateItem = (item: TestFaqItem) => {
    if ((item.question.trim() || item.answer.trim()) && (!item.question.trim() || !item.answer.trim())) {
      setValidationError('برای هر FAQ، هم سوال و هم جواب باید پر شود.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(130,158,255,0.28)] bg-[rgba(130,158,255,0.12)] px-4 py-2.5 text-[13px] font-black text-[rgb(199,210,254)]"
        >
          <Plus className="h-4 w-4" />
          افزودن سوال
        </button>
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(217,229,255,0.45)]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جستجو در سوالات..."
            className="w-full rounded-full border border-white/10 bg-[rgba(5,12,25,0.72)] py-2.5 pl-4 pr-10 text-[length:var(--taav-text-sm)] text-white outline-none"
          />
        </div>
      </div>

      {validationError ? (
        <div className="rounded-[16px] border border-[rgba(248,113,113,0.22)] bg-[rgba(248,113,113,0.08)] px-4 py-3 text-[12px] font-semibold text-[rgb(254,202,202)]">
          {validationError}
        </div>
      ) : null}

      {filteredItems.length > 0 ? (
        <div className="grid gap-4">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,30,56,0.78)_0%,rgba(10,19,38,0.78)_100%)] p-5"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 text-[12px] text-[rgba(217,229,255,0.72)]">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(event) => updateItem(item.id, { isActive: event.target.checked })}
                    />
                    فعال
                  </label>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(248,113,113,0.24)] bg-[rgba(248,113,113,0.10)] text-[rgb(254,202,202)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-bold text-[rgba(217,229,255,0.72)]">
                  FAQ {index + 1}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-[12px] font-bold text-[rgba(217,229,255,0.72)]">سوال</label>
                  <input
                    value={item.question}
                    onChange={(event) => updateItem(item.id, { question: event.target.value })}
                    onBlur={() => validateItem(item)}
                    placeholder="سوال پرتکرار را بنویس"
                    className="w-full rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-[length:var(--taav-text-sm)] text-white outline-none"
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-[12px] font-bold text-[rgba(217,229,255,0.72)]">جواب</label>
                  <textarea
                    value={item.answer}
                    onChange={(event) => updateItem(item.id, { answer: event.target.value })}
                    onBlur={() => validateItem(item)}
                    placeholder="پاسخ استاندارد"
                    rows={4}
                    className="w-full resize-y rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-[length:var(--taav-text-sm)] leading-7 text-white outline-none"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-[12px] font-bold text-[rgba(217,229,255,0.72)]">دسته‌بندی</label>
                  <input
                    value={item.category ?? ''}
                    onChange={(event) => updateItem(item.id, { category: event.target.value })}
                    placeholder="مثلاً: پشتیبانی، محصول"
                    className="w-full rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-[length:var(--taav-text-sm)] text-white outline-none"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-[12px] font-bold text-[rgba(217,229,255,0.72)]">اولویت</label>
                  <select
                    value={item.priority ?? 'medium'}
                    onChange={(event) => updateItem(item.id, { priority: event.target.value as TestFaqPriority })}
                    className="w-full rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-[length:var(--taav-text-sm)] text-white outline-none"
                  >
                    <option value="low">کم</option>
                    <option value="medium">متوسط</option>
                    <option value="high">زیاد</option>
                  </select>
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-[12px] font-bold text-[rgba(217,229,255,0.72)]">برچسب‌ها (با ویرگول جدا کن)</label>
                  <input
                    value={item.tags?.join('، ') ?? ''}
                    onChange={(event) =>
                      updateItem(item.id, {
                        tags: event.target.value
                          .split(/[,،]/)
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="پشتیبانی، قیمت، محصول"
                    className="w-full rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-[length:var(--taav-text-sm)] text-white outline-none"
                  />
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <label className="text-[12px] font-bold text-[rgba(217,229,255,0.72)]">توضیح تکمیلی</label>
                  <textarea
                    value={item.supplementaryNote ?? ''}
                    onChange={(event) => updateItem(item.id, { supplementaryNote: event.target.value })}
                    rows={2}
                    className="w-full resize-y rounded-[14px] border border-white/10 bg-[rgba(5,12,25,0.72)] px-3 py-2.5 text-[length:var(--taav-text-sm)] text-white outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-white/14 bg-white/5 px-6 py-14 text-center">
          <p className="m-0 text-[length:var(--taav-text-sm)] text-[rgba(217,229,255,0.62)]">
            {items.length === 0
              ? 'هنوز سوالی ثبت نشده. با دکمه «افزودن سوال» شروع کن.'
              : 'نتیجه‌ای برای جستجو پیدا نشد.'}
          </p>
        </div>
      )}
    </div>
  );
}
