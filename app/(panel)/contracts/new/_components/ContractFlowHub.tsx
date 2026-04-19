'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  BadgePercent,
  CalendarDays,
  Eye,
  FileCheck2,
  Landmark,
  WalletCards,
  X,
  XCircle,
} from 'lucide-react';
import { useContractFlowBasePath } from './useContractFlowBasePath';

const CONTRACT_CREATE_ITEMS = [
  {
    id: 'subject',
    title: 'اطلاعات پایه',
    description: 'منعقد کننده قرارداد، نوع قرارداد، تاریخ، شماره قرارداد و انتخاب واحد را در این بخش تنظیم کنید.',
    icon: CalendarDays,
    completed: true,
    enabled: true,
  },
  {
    id: 'parties',
    title: 'طرفین',
    description: 'مدیریت طرف اول و طرف دوم در یک صفحه انجام می‌شود. فعلاً تب و منطق طرف اول فعال است.',
    icon: Landmark,
    completed: true,
    enabled: true,
  },
  {
    id: 'financial',
    title: 'اطلاعات مالی قرارداد',
    description: 'مبلغ کل قرارداد، پیش پرداخت، سررسیدها و جمع مبالغ مالی در این بخش مدیریت می‌شود.',
    icon: WalletCards,
    completed: false,
    enabled: true,
  },
  {
    id: 'penalties',
    title: 'جرایم',
    description: 'تنظیمات انواع جریمه‌ها، هزینه دیرکرد، قواعد گرد کردن و روش محاسبه هر آیتم در این بخش مدیریت می‌شود.',
    icon: AlertTriangle,
    completed: false,
    enabled: false,
  },
  {
    id: 'discounts',
    title: 'تخفیف‌ها',
    description: 'تنظیم تخفیف روی اصل قرارداد، تخفیف‌های موردی و مشوق‌های پرداخت زودتر از موعد در این بخش انجام می‌شود.',
    icon: BadgePercent,
    completed: false,
    enabled: false,
  },
  {
    id: 'termination',
    title: 'شرایط فسخ',
    description: 'بندهای فسخ، جریمه‌ها، مهلت‌ها و شروط مهم قراردادی در این بخش قرار می‌گیرد.',
    icon: XCircle,
    completed: false,
    enabled: false,
  },
  {
    id: 'review',
    title: 'نمایش کلی جزئیات',
    description: 'مرور جمع بندی همه اطلاعات ثبت شده پیش از تایید نهایی در این صفحه انجام می‌شود.',
    icon: Eye,
    completed: false,
    enabled: false,
  },
  {
    id: 'final',
    title: 'تایید نهایی قرارداد',
    description: 'پس از تکمیل همه مراحل، قرارداد در این بخش برای تایید نهایی و ثبت بررسی می‌شود.',
    icon: FileCheck2,
    completed: false,
    enabled: false,
  },
] as const;

function UnderDevelopmentDialog({
  open,
  onClose,
  stepTitle,
}: {
  open: boolean;
  onClose: () => void;
  stepTitle: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 p-5">
          <div>
            <h3 className="text-base font-bold text-gray-800">در حال توسعه</h3>
            <p className="mt-1 text-sm text-gray-500">امکان ورود به بخش «{stepTitle}» هنوز پیاده‌سازی نشده است.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 text-sm leading-6 text-gray-600">این بخش فعلاً غیرفعال است و بعداً تکمیل می‌شود.</div>
        <div className="flex justify-end border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
}

function StepCard({ item, basePath, onDisabledClick }: {
  item: (typeof CONTRACT_CREATE_ITEMS)[number];
  basePath: string;
  onDisabledClick: (title: string) => void;
}) {
  const content = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg border ${
            item.enabled ? 'bg-gray-100 text-blue-600' : 'bg-gray-100 text-amber-600'
          }`}
        >
          <item.icon className="h-5 w-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-base font-bold text-gray-800">{item.title}</div>
            {item.enabled ? (
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
                  item.completed
                    ? 'border-green-300 bg-green-100 text-green-800'
                    : 'border-yellow-300 bg-yellow-100 text-yellow-800'
                }`}
              >
                {item.completed ? 'تکمیل شده' : 'تکمیل نشده'}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                در حال توسعه
              </span>
            )}
          </div>
          <div className="mt-1 text-sm leading-6 text-gray-600">{item.description}</div>
        </div>
      </div>
      <div className={item.enabled ? 'text-gray-400' : 'text-amber-500'}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </div>
    </div>
  );

  if (item.enabled) {
    return (
      <Link
        href={`${basePath}/${item.id}`}
        className="block w-full rounded-lg border bg-white p-4 text-right shadow-sm transition-all hover:border-blue-400 hover:bg-gray-50"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onDisabledClick(item.title)}
      className="block w-full rounded-lg border bg-white p-4 text-right shadow-sm transition-all hover:border-amber-400 hover:bg-amber-50/40"
    >
      {content}
    </button>
  );
}

export function ContractFlowHub() {
  const basePath = useContractFlowBasePath();
  const [pendingStepTitle, setPendingStepTitle] = useState('');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">ثبت قرارداد جدید</h1>
        <p className="mt-1 text-gray-500">هر بخش قرارداد در یک صفحه مستقل باز می‌شود. برای شروع، یکی از مراحل زیر را انتخاب کنید.</p>
      </div>

      <div className="space-y-3">
        {CONTRACT_CREATE_ITEMS.map((item) => (
          <StepCard
            key={item.id}
            item={item}
            basePath={basePath}
            onDisabledClick={setPendingStepTitle}
          />
        ))}
      </div>

      <UnderDevelopmentDialog
        open={Boolean(pendingStepTitle)}
        onClose={() => setPendingStepTitle('')}
        stepTitle={pendingStepTitle}
      />
    </div>
  );
}
