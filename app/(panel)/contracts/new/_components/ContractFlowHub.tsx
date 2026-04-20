'use client';

import { useEffect, useMemo, useState, type ComponentType } from 'react';
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
import { getActiveDraftId, getStepData } from '../../../../lib/contractDraftClient';
import { validateFinancialStep, validateStep1, validateStep2 } from '../../../../lib/contractValidation';
import type { ContractFinancialData, ContractPartiesData, ContractSubjectData } from '../../../../types/contract';
import { useContractFlowBasePath } from './useContractFlowBasePath';

type FlowItem = {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  enabled: boolean;
};

type StatusTone = 'green' | 'amber' | 'slate' | 'blue';

type StepStatus = {
  label: string;
  detail: string;
  tone: StatusTone;
};

const CONTRACT_CREATE_ITEMS: FlowItem[] = [
  {
    id: 'subject',
    title: 'اطلاعات پایه',
    description: 'منعقد کننده قرارداد، نوع قرارداد، تاریخ، شماره قرارداد و انتخاب واحد را در این بخش تنظیم کنید.',
    icon: CalendarDays,
    enabled: true,
  },
  {
    id: 'parties',
    title: 'طرفین',
    description: 'مدیریت طرف اول و طرف دوم، تعیین سهم هر کدام و انتخاب طرف اصلی در این بخش انجام می‌شود.',
    icon: Landmark,
    enabled: true,
  },
  {
    id: 'financial',
    title: 'اطلاعات مالی قرارداد',
    description: 'مدل قیمت‌گذاری، دسته‌بندی‌های مالی و سررسیدهای قرارداد در این بخش ثبت می‌شود.',
    icon: WalletCards,
    enabled: true,
  },
  {
    id: 'penalties',
    title: 'جرایم',
    description: 'تنظیمات جریمه‌های تاخیر، هزینه دیرکرد و قواعد محاسبه هر مورد در این بخش انجام می‌شود.',
    icon: AlertTriangle,
    enabled: true,
  },
  {
    id: 'discounts',
    title: 'تخفیف‌ها',
    description: 'تخفیف روی اصل قرارداد، تخفیف‌های موردی و مشوق‌های پرداخت زودتر از موعد از اینجا مدیریت می‌شود.',
    icon: BadgePercent,
    enabled: true,
  },
  {
    id: 'termination',
    title: 'شرایط فسخ',
    description: 'بندهای فسخ، جرایم، مهلت‌ها و شروط مهم قراردادی در این بخش قرار می‌گیرد.',
    icon: XCircle,
    enabled: false,
  },
  {
    id: 'review',
    title: 'نمایش کلی جزئیات',
    description: 'جمع‌بندی همه اطلاعات ثبت‌شده پیش از تایید نهایی در این صفحه مرور می‌شود.',
    icon: Eye,
    enabled: false,
  },
  {
    id: 'final',
    title: 'تایید نهایی قرارداد',
    description: 'پس از تکمیل همه مراحل، قرارداد در این بخش برای تایید نهایی و ثبت بررسی می‌شود.',
    icon: FileCheck2,
    enabled: false,
  },
];

function hasSubjectData(data: ContractSubjectData | null) {
  if (!data) return false;
  return Boolean(
    data.contractDate ||
      data.contractNumber ||
      data.deliveryDate ||
      data.blockId ||
      data.unitId ||
      data.contractor?.employeeId ||
      data.contractor?.formerFirstName ||
      data.contractor?.formerLastName,
  );
}

function hasPartiesData(data: ContractPartiesData | null) {
  if (!data) return false;
  return Boolean((data.partyOne?.length ?? 0) || (data.partyTwo?.length ?? 0));
}

function hasFinancialData(data: ContractFinancialData | null) {
  if (!data) return false;
  return Boolean(
    data.fixedTotalAmount ||
      data.totalArea ||
      data.pricePerMeter ||
      (data.categories?.length ?? 0) ||
      (data.dueItems?.length ?? 0),
  );
}

function getToneClasses(tone: StatusTone) {
  switch (tone) {
    case 'green':
      return 'border-emerald-300 bg-emerald-100 text-emerald-800';
    case 'amber':
      return 'border-amber-300 bg-amber-100 text-amber-800';
    case 'blue':
      return 'border-blue-300 bg-blue-100 text-blue-800';
    default:
      return 'border-slate-300 bg-slate-100 text-slate-700';
  }
}

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

function StepCard({
  item,
  basePath,
  status,
  onDisabledClick,
}: {
  item: FlowItem;
  basePath: string;
  status: StepStatus;
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
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getToneClasses(status.tone)}`}>
              {status.label}
            </span>
          </div>
          <div className="mt-1 text-sm leading-6 text-gray-600">{item.description}</div>
          <div className="mt-2 text-xs font-medium text-gray-500">{status.detail}</div>
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
  const [loading, setLoading] = useState(true);
  const [subjectData, setSubjectData] = useState<ContractSubjectData | null>(null);
  const [partiesData, setPartiesData] = useState<ContractPartiesData | null>(null);
  const [financialData, setFinancialData] = useState<ContractFinancialData | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (mounted) {
        setLoading(true);
      }

      const draftId = getActiveDraftId();
      if (!draftId) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const [subject, parties, financial] = await Promise.all([
          getStepData<ContractSubjectData>(draftId, 'subject'),
          getStepData<ContractPartiesData>(draftId, 'parties'),
          getStepData<ContractFinancialData>(draftId, 'financial'),
        ]);

        if (!mounted) return;
        setSubjectData(subject);
        setPartiesData(parties);
        setFinancialData(financial);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void load();
      }
    };

    window.addEventListener('focus', load);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mounted = false;
      window.removeEventListener('focus', load);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const subjectComplete = Boolean(subjectData && validateStep1(subjectData).valid);
  const partiesComplete = Boolean(partiesData && validateStep2(partiesData).valid);
  const financialComplete = Boolean(financialData && validateFinancialStep(financialData).valid);

  const statusMap = useMemo<Record<string, StepStatus>>(
    () => ({
      subject: loading
        ? { label: 'در حال بررسی', detail: 'وضعیت این مرحله در حال بارگذاری است.', tone: 'slate' }
        : subjectComplete
          ? { label: 'تکمیل شده', detail: 'اطلاعات پایه این قرارداد کامل ثبت شده است.', tone: 'green' }
          : hasSubjectData(subjectData)
            ? { label: 'ناقص', detail: 'بخشی از اطلاعات پایه ثبت شده و هنوز کامل نیست.', tone: 'amber' }
            : { label: 'شروع نشده', detail: 'هنوز اطلاعات پایه‌ای برای این قرارداد ثبت نشده است.', tone: 'slate' },
      parties: loading
        ? { label: 'در حال بررسی', detail: 'وضعیت این مرحله در حال بارگذاری است.', tone: 'slate' }
        : partiesComplete
          ? { label: 'تکمیل شده', detail: 'طرفین، سهم‌ها و طرف اصلی ثبت شده‌اند.', tone: 'green' }
          : hasPartiesData(partiesData)
            ? { label: 'ناقص', detail: 'بخشی از اطلاعات طرفین ثبت شده و نیاز به تکمیل دارد.', tone: 'amber' }
            : { label: 'شروع نشده', detail: 'هنوز طرفی برای این قرارداد ثبت نشده است.', tone: 'slate' },
      financial: loading
        ? { label: 'در حال بررسی', detail: 'وضعیت این مرحله در حال بارگذاری است.', tone: 'slate' }
        : financialComplete
          ? { label: 'تکمیل شده', detail: 'قیمت‌گذاری، دسته‌بندی‌ها و سررسیدها آماده است.', tone: 'green' }
          : hasFinancialData(financialData)
            ? { label: 'ناقص', detail: 'بخشی از اطلاعات مالی ثبت شده و نیاز به تکمیل دارد.', tone: 'amber' }
            : { label: 'شروع نشده', detail: 'هنوز داده مالی برای این قرارداد ثبت نشده است.', tone: 'slate' },
      penalties: financialComplete
        ? { label: 'آماده تنظیم', detail: 'پیش‌نیازهای مالی تکمیل شده و می‌توانید جرایم را تنظیم کنید.', tone: 'blue' }
        : { label: 'در انتظار مالی', detail: 'بهتر است ابتدا اطلاعات مالی قرارداد تکمیل شود.', tone: 'amber' },
      discounts: financialComplete
        ? { label: 'آماده تنظیم', detail: 'پس از تکمیل بخش مالی، ثبت تخفیف‌ها آماده است.', tone: 'blue' }
        : { label: 'در انتظار مالی', detail: 'این بخش به اطلاعات مالی قرارداد وابسته است.', tone: 'amber' },
      termination: { label: 'در حال توسعه', detail: 'این بخش هنوز در دست پیاده‌سازی است.', tone: 'amber' },
      review: { label: 'در حال توسعه', detail: 'مرور نهایی قرارداد هنوز فعال نشده است.', tone: 'amber' },
      final: { label: 'در حال توسعه', detail: 'ثبت نهایی قرارداد هنوز فعال نشده است.', tone: 'amber' },
    }),
    [financialComplete, financialData, loading, partiesComplete, partiesData, subjectComplete, subjectData],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">ثبت قرارداد جدید</h1>
        <p className="mt-1 text-gray-500">هر بخش قرارداد در یک صفحه مستقل باز می‌شود. وضعیت هر مرحله را از همینجا می‌توانید ببینید.</p>
      </div>

      <div className="space-y-3">
        {CONTRACT_CREATE_ITEMS.map((item) => (
          <StepCard
            key={item.id}
            item={item}
            basePath={basePath}
            status={statusMap[item.id]}
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
