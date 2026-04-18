'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, CircleAlert, CircleDot, FilePlus2, Search, UserRound } from 'lucide-react';
import PanelLayout from '../../components/PanelLayout';

const tabs = [
  { label: 'تکمیل شده', count: '۱' },
  { label: 'پیش نویس', count: '۳' },
  { label: 'در انتظار تایید', count: '۰' },
  { label: 'استخراج شده', count: '۰' },
];

const filterTags = [
  { label: 'فرصت فروش', color: 'bg-rose-500' },
  { label: 'تعدیل', color: 'bg-pink-500' },
  { label: 'تفاهم نامه', color: 'bg-fuchsia-600' },
  { label: 'جا به جایی', color: 'bg-indigo-500' },
  { label: 'بررسی مالی', color: 'bg-stone-500' },
];

const ContractsListPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  return (
    <PanelLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">فهرست قراردادها</h1>
            <p className="text-gray-500 mt-1">قراردادهای خود را مدیریت کرده و قراردادهای جدید ایجاد کنید.</p>
          </div>
          <Link
            href="/contracts/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 text-sm font-bold text-white shadow transition-all hover:bg-teal-700"
          >
            <FilePlus2 className="h-4 w-4" />
            <span>ثبت قرارداد جدید</span>
          </Link>
        </div>

        {/* Search and Tabs */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="جستجو در شماره قرارداد، نام خریدار و..."
              className="h-10 w-full rounded-lg border border-gray-300 bg-white pr-10 pl-4 text-sm text-gray-700 outline-none transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <div className="flex items-center rounded-lg border border-gray-200 bg-white p-1 gap-1">
            {tabs.map((tab, i) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => setActiveTab(i)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                  activeTab === i ? 'bg-teal-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                <span className={`mr-1.5 inline-block rounded-full px-1.5 py-0.5 text-xs font-bold ${activeTab === i ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2">
          {filterTags.map((tag) => (
            <div
              key={tag.label}
              className="flex items-center gap-2 cursor-pointer rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 transition hover:bg-gray-50 hover:border-gray-300"
            >
              <span className={`h-2 w-2 rounded-full ${tag.color}`} />
              <span>{tag.label}</span>
            </div>
          ))}
        </div>

        {/* Contract Card */}
        <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-teal-400 hover:shadow-md">
          <div className="flex">
            <div className="flex w-9 items-center justify-center bg-green-500 px-2 py-6 text-center text-xs font-bold text-white [writing-mode:vertical-rl] [transform:rotate(180deg)]">
              تحویل شده
            </div>

            <div className="flex-1 p-5 text-gray-700">
              <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    شمالی
                  </span>
                  <span>بلوک <b className="text-gray-800 font-bold">۱</b></span>
                  <span>طبقه <b className="text-gray-800 font-bold">۱</b></span>
                  <span>واحد <b className="text-gray-800 font-bold">۱، مسکونی</b></span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 border border-rose-200">
                    <CircleAlert className="h-3.5 w-3.5" />
                    بدهکار
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <span>پیش خریدار: رضا زارع</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 border border-amber-200">
                      <UserRound className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-5 lg:grid-cols-3">
                <div className="space-y-3">
                  <RowItem label="شماره قرارداد:" value="۱۲۳۴" />
                  <RowItem label="مبلغ قرارداد:" value="۱,۵۵۰,۰۰۰,۰۰۰ ریال" />
                </div>
                <div className="space-y-3">
                  <RowItem label="انعقاد قرارداد:" value="۱۴۰۴/۰۵/۳۰" />
                  <RowItem label="ثبت در سامانه:" value="۱۴۰۴/۰۸/۰۲" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-sm font-semibold text-gray-800">احمدرضا زارع</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 border border-amber-200"><UserRound className="h-4 w-4" /></span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-sm font-semibold text-gray-800">رضا زارع</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 border border-amber-200"><UserRound className="h-4 w-4" /></span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <button type="button" className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 border border-gray-200 hover:bg-gray-200">
                  <CircleDot className="h-3.5 w-3.5" />
                  وام
                </button>
                <button type="button" className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 border border-teal-200 hover:bg-teal-100">
                  پیش فروش
                </button>
                <button type="button" className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200 hover:bg-green-100">
                  متمم خورده
                </button>
              </div>
            </div>

            <div className="flex w-9 items-center justify-center bg-green-500 px-2 py-6 text-center text-xs font-bold text-white [writing-mode:vertical-rl]">
              نهایی شده
            </div>
          </div>
        </article>
      </div>
    </PanelLayout>
  );
};

function RowItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-bold text-gray-800">{value}</span>
    </div>
  );
}

export default ContractsListPage;
