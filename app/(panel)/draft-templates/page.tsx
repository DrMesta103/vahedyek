'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FilePlus2, Search, Tags } from 'lucide-react';
import PanelLayout from '../../components/PanelLayout';

const TEMPLATE_ITEMS = [
  {
    id: 'tpl-002',
    title: 'قالب پیش‌نویس پیش‌فروش با تسویه مرحله‌ای',
    category: 'پیش‌فروش',
    updatedAt: '۱۴۰۵/۰۱/۲۵',
    description: 'مناسب قراردادهای پیش‌فروش با تحویل مرحله‌ای، تعدیل و اقساط زمان‌بندی‌شده.',
  },
  {
    id: 'tpl-003',
    title: 'قالب پیش‌نویس قرارداد با تخفیف خوش‌حسابی',
    category: 'تخفیف‌دار',
    updatedAt: '۱۴۰۵/۰۱/۲۰',
    description: 'نسخه‌ای برای قراردادهایی که مشوق پرداخت زودتر از موعد و تخفیف‌های موردی دارند.',
  },
];

const DraftTemplatesPage = () => {
  const [searchValue, setSearchValue] = useState('');

  const filteredTemplates = useMemo(() => {
    const normalized = searchValue.trim();
    if (!normalized) return TEMPLATE_ITEMS;

    return TEMPLATE_ITEMS.filter(
      (item) =>
        item.title.includes(normalized) ||
        item.category.includes(normalized) ||
        item.description.includes(normalized),
    );
  }, [searchValue]);

  return (
    <PanelLayout>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">فهرست قالب‌های پیش‌نویس</h1>
            <p className="mt-1 text-gray-500">قالب‌های آماده را جستجو کنید یا با همان فلو ثبت قرارداد، یک قالب پیش‌نویس جدید بسازید.</p>
          </div>
          <Link
            href="/draft-templates/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 text-sm font-bold text-white shadow transition-all hover:bg-teal-700"
          >
            <FilePlus2 className="h-4 w-4" />
            <span>افزودن قالب پیش‌نویس</span>
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="جستجو در عنوان، نوع یا توضیحات قالب..."
              className="h-11 w-full rounded-lg border border-gray-300 bg-white pr-10 pl-4 text-sm text-gray-700 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredTemplates.map((item) => (
            <article key={item.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-teal-300 hover:shadow-md">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{item.title}</h2>
                    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs text-cyan-700">
                      <Tags className="h-3.5 w-3.5" />
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-gray-600">{item.description}</p>
                </div>
                <div className="text-sm text-gray-500">آخرین بروزرسانی: {item.updatedAt}</div>
              </div>
            </article>
          ))}

          {!filteredTemplates.length && (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
              قالبی با این عبارت پیدا نشد.
            </div>
          )}
        </div>
      </div>
    </PanelLayout>
  );
};

export default DraftTemplatesPage;
