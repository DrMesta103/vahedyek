'use client';

import { useEffect, useMemo, useState } from 'react';
import { getActiveDraftId, getStepData } from '../../../../lib/contractDraftClient';
import { validateFinancialStep, validateStep1, validateStep2 } from '../../../../lib/contractValidation';
import type { ContractFinancialData, ContractPartiesData, ContractSubjectData } from '../../../../types/contract';
import { DiscountsStep } from './DiscountsStep';
import { FinancialStep } from './FinancialStep';
import { LeftReportSidebar } from './LeftReportSidebar';
import { PartiesStep } from './PartiesStep';
import { PenaltiesStep } from './PenaltiesStep';
import { PlaceholderStep } from './PlaceholderStep';
import { RightNavSidebar } from './RightNavSidebar';
import { SubjectStep } from './SubjectStep';
import {
  CONTRACT_FLOW_DIRTY_EVENT,
  CONTRACT_FLOW_FINANCIAL_SNAPSHOT_EVENT,
  CONTRACT_FLOW_SAVED_EVENT,
  getStoredLastUpdated,
  type ContractFlowSectionId,
} from './contractFlowSignals';

type StatusTone = 'green' | 'amber' | 'slate' | 'blue';

type StepStatus = {
  label: string;
  detail: string;
  tone: StatusTone;
};

type SectionItem = {
  id: ContractFlowSectionId;
  title: string;
  navLabel: string;
  render: () => JSX.Element;
};

const SAVEABLE_SECTIONS: ContractFlowSectionId[] = ['subject', 'parties', 'financial'];

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

function getContractTotal(data: ContractFinancialData | null) {
  if (!data) return 0;
  if (data.pricingType === 'metered') {
    return Number(data.totalArea || 0) * Number(data.pricePerMeter || 0);
  }
  return Number(data.fixedTotalAmount || 0);
}

function getFinancialSlices(data: ContractFinancialData | null) {
  if (!data?.categories?.length) return [];
  return data.categories
    .filter((item) => item.capAmount > 0)
    .map((item, index) => ({
      id: item.id,
      name: item.name,
      value: item.capAmount,
      color: ['#0f766e', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#0ea5e9'][index % 6],
    }));
}

function FinancialDonut({ slices }: { slices: Array<{ id: string; name: string; value: number; color: string }> }) {
  const total = slices.reduce((sum, item) => sum + item.value, 0);
  if (!total) {
    return <div className="contract-flow-report-chart-empty">هنوز داده مالی کافی ثبت نشده است</div>;
  }

  let offset = 0;
  const gradient = slices
    .map((item) => {
      const start = Math.round((offset / total) * 100);
      offset += item.value;
      const end = Math.round((offset / total) * 100);
      return `${item.color} ${start}% ${end}%`;
    })
    .join(', ');

  return (
    <div className="contract-flow-report-chart-wrap">
      <div className="contract-flow-report-chart" style={{ backgroundImage: `conic-gradient(${gradient})` }}>
        <div className="contract-flow-report-chart-center">
          <strong>{new Intl.NumberFormat('fa-IR').format(slices.length)}</strong>
          <span>دسته</span>
        </div>
      </div>
    </div>
  );
}

export function ContractFlowHub() {
  const [activeSection, setActiveSection] = useState<SectionItem['id']>('subject');
  const [loading, setLoading] = useState(true);
  const [subjectData, setSubjectData] = useState<ContractSubjectData | null>(null);
  const [partiesData, setPartiesData] = useState<ContractPartiesData | null>(null);
  const [financialData, setFinancialData] = useState<ContractFinancialData | null>(null);
  const [financialLiveData, setFinancialLiveData] = useState<ContractFinancialData | null>(null);
  const [dirtyMap, setDirtyMap] = useState<Partial<Record<ContractFlowSectionId, boolean>>>({});
  const [savingMap, setSavingMap] = useState<Partial<Record<ContractFlowSectionId, boolean>>>({});
  const [lastUpdatedMap, setLastUpdatedMap] = useState<Partial<Record<ContractFlowSectionId, number>>>({});

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (mounted) setLoading(true);

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
        setFinancialLiveData(financial);
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

  useEffect(() => {
    setLastUpdatedMap(getStoredLastUpdated());

    const handleDirty = (event: Event) => {
      const customEvent = event as CustomEvent<{ sectionId: ContractFlowSectionId; dirty: boolean }>;
      setDirtyMap((current) => ({ ...current, [customEvent.detail.sectionId]: customEvent.detail.dirty }));
      if (!customEvent.detail.dirty) {
        setSavingMap((current) => ({ ...current, [customEvent.detail.sectionId]: false }));
      }
    };

    const handleSaved = (event: Event) => {
      const customEvent = event as CustomEvent<{ sectionId: ContractFlowSectionId; savedAt: number }>;
      setDirtyMap((current) => ({ ...current, [customEvent.detail.sectionId]: false }));
      setSavingMap((current) => ({ ...current, [customEvent.detail.sectionId]: false }));
      setLastUpdatedMap((current) => ({ ...current, [customEvent.detail.sectionId]: customEvent.detail.savedAt }));
    };

    const handleFinancialSnapshot = (event: Event) => {
      const customEvent = event as CustomEvent<{ payload: ContractFinancialData | null }>;
      setFinancialLiveData(customEvent.detail.payload);
    };

    window.addEventListener(CONTRACT_FLOW_DIRTY_EVENT, handleDirty as EventListener);
    window.addEventListener(CONTRACT_FLOW_SAVED_EVENT, handleSaved as EventListener);
    window.addEventListener(CONTRACT_FLOW_FINANCIAL_SNAPSHOT_EVENT, handleFinancialSnapshot as EventListener);

    return () => {
      window.removeEventListener(CONTRACT_FLOW_DIRTY_EVENT, handleDirty as EventListener);
      window.removeEventListener(CONTRACT_FLOW_SAVED_EVENT, handleSaved as EventListener);
      window.removeEventListener(CONTRACT_FLOW_FINANCIAL_SNAPSHOT_EVENT, handleFinancialSnapshot as EventListener);
    };
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-contract-section]'));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleEntries.length) return;

        const nextId = visibleEntries[0].target.getAttribute('id') as SectionItem['id'] | null;
        if (nextId) setActiveSection(nextId);
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.7],
        rootMargin: '-80px 0px -35% 0px',
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const subjectComplete = Boolean(subjectData && validateStep1(subjectData).valid);
  const partiesComplete = Boolean(partiesData && validateStep2(partiesData).valid);
  const financialComplete = Boolean(financialData && validateFinancialStep(financialData).valid);

  const statusMap = useMemo<Record<SectionItem['id'], StepStatus>>(
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
    }),
    [financialComplete, financialData, loading, partiesComplete, partiesData, subjectComplete, subjectData],
  );

  const sections: SectionItem[] = [
    {
      id: 'subject',
      title: 'اطلاعات پایه',
      navLabel: 'Basic Info',
      render: () => <SubjectStep stepId="subject" title="اطلاعات پایه" embedded />,
    },
    {
      id: 'parties',
      title: 'طرفین',
      navLabel: 'Parties',
      render: () => <PartiesStep stepId="parties" title="طرفین" embedded />,
    },
    {
      id: 'financial',
      title: 'اطلاعات مالی',
      navLabel: 'Financial Info',
      render: () => <FinancialStep stepId="financial" title="اطلاعات مالی قرارداد" embedded />,
    },
    {
      id: 'penalties',
      title: 'جرایم',
      navLabel: 'Penalties',
      render: () => <PenaltiesStep stepId="penalties" title="جرایم" embedded />,
    },
    {
      id: 'discounts',
      title: 'تخفیف‌ها',
      navLabel: 'Discounts',
      render: () => <DiscountsStep stepId="discounts" title="تخفیف‌ها" embedded />,
    },
    {
      id: 'termination',
      title: 'شرایط فسخ',
      navLabel: 'Termination Terms',
      render: () => <PlaceholderStep stepId="termination" title="شرایط فسخ" embedded />,
    },
  ];

  const reportData = financialLiveData ?? financialData;
  const contractTotal = getContractTotal(reportData);
  const paidSlices = getFinancialSlices(reportData);
  const allocatedAmount = paidSlices.reduce((sum, item) => sum + item.value, 0);
  const dueAmount = reportData?.dueItems?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const remainder = Math.max(contractTotal - allocatedAmount, 0);

  const requestSectionSave = (sectionId: ContractFlowSectionId) => {
    const trigger = document.querySelector<HTMLButtonElement>(`[data-contract-save-trigger="${sectionId}"]`);
    if (!trigger || trigger.disabled) return;

    setSavingMap((current) => ({ ...current, [sectionId]: true }));
    trigger.click();
  };

  const scrollToSection = (sectionId: SectionItem['id']) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    setActiveSection(sectionId);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="contract-flow-layout lg:flex lg:flex-row lg:items-stretch lg:gap-0">
      <RightNavSidebar
        sections={sections}
        activeSection={activeSection}
        dirtyMap={dirtyMap}
        savingMap={savingMap}
        lastUpdatedMap={lastUpdatedMap}
        onScrollTo={scrollToSection}
        onSave={requestSectionSave}
      />

      <LeftReportSidebar
        reportData={reportData}
        contractTotal={contractTotal}
        paidSlices={paidSlices}
        allocatedAmount={allocatedAmount}
        dueAmount={dueAmount}
        remainder={remainder}
      />

      <div className="contract-flow-content min-w-0 flex-1 space-y-6">
        {sections.map((section) => {
          const status = statusMap[section.id];
          const isSubjectSection = section.id === 'subject';
          return (
            <section
              key={section.id}
              id={section.id}
              data-contract-section
              className={`scroll-mt-24 rounded-3xl border border-gray-200/80 bg-white/50 shadow-[0_10px_35px_rgba(15,23,42,0.04)] ${
                isSubjectSection ? 'p-0' : 'p-4 md:p-5'
              }`}
            >
              <div className={`flex flex-col gap-3 border-b border-gray-200/80 sm:flex-row sm:items-start sm:justify-between ${
                isSubjectSection ? 'px-4 pb-4 pt-4 md:px-5 md:pt-5' : 'mb-5 pb-4'
              }`}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getToneClasses(status.tone)}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-500">{status.detail}</p>
                </div>
              </div>

              <div className={isSubjectSection ? 'px-4 pb-4 md:px-5 md:pb-5' : ''}>{section.render()}</div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
