'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Info, Lock, X } from 'lucide-react';
import { getActiveDraftId, getFrontendStepDraft, getStepData } from '../../../../lib/contractDraftClient';
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

type SectionRequirementStatus = {
  id: ContractFlowSectionId;
  title: string;
  complete: boolean;
  dirty: boolean;
  statusText: string;
};

type SectionAccess = {
  locked: boolean;
  info: string;
  requirements: SectionRequirementStatus[];
};

type LeaveIssue = {
  id: ContractFlowSectionId;
  title: string;
  status: string;
};

type SectionItem = {
  id: ContractFlowSectionId;
  title: string;
  navLabel: string;
  render: () => JSX.Element;
};

const SAVEABLE_SECTIONS: ContractFlowSectionId[] = ['subject', 'parties', 'financial'];
const SECTION_ORDER: ContractFlowSectionId[] = ['subject', 'parties', 'financial', 'penalties', 'discounts', 'termination'];
const SECTION_PREREQUISITES: Record<ContractFlowSectionId, ContractFlowSectionId[]> = {
  subject: [],
  parties: ['subject'],
  financial: ['subject', 'parties'],
  penalties: ['subject', 'parties', 'financial'],
  discounts: ['subject', 'parties', 'financial'],
  termination: ['subject', 'parties', 'financial'],
};
const SECTION_TITLES: Record<ContractFlowSectionId, string> = {
  subject: 'اطلاعات پایه',
  parties: 'طرفین',
  financial: 'اطلاعات مالی',
  penalties: 'جرایم',
  discounts: 'تخفیف‌ها',
  termination: 'شرایط فسخ',
};

const FIXED_FINANCIAL_COLORS = {
  advance: '#f2c94c',
  installment: '#1e3a8a',
  loan: '#f97316',
  document: '#6cabdd',
  handover: '#8b5cf6',
} as const;

const OTHER_FINANCIAL_COLORS = ['#0f766e', '#e11d48', '#0891b2', '#65a30d', '#db2777', '#475569', '#14b8a6', '#dc2626'];

function getFinancialSliceKind(item: { id: string; name: string }) {
  if (item.id === 'advance' || item.name.includes('پیش پرداخت') || item.name.includes('پیش‌پرداخت')) return 'advance';
  if (item.id === 'installment' || item.name.includes('اقساط')) return 'installment';
  if (item.id === 'document' || item.name.includes('تحویل سند')) return 'document';
  if (item.id === 'handover' || item.name.includes('تحویل واحد')) return 'handover';
  if (item.id.includes('loan') || item.name.includes('وام')) return 'loan';
  return 'other';
}

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
      data.parkingPricePerMeter ||
      (data.categories?.length ?? 0) ||
      (data.dueItems?.length ?? 0),
  );
}

function getToneClasses(tone: StatusTone) {
  switch (tone) {
    case 'green':
      return 'border-[var(--theme-action-border)] bg-[var(--theme-action-bg)] text-[var(--theme-action-text)]';
    case 'amber':
      return 'border-[var(--theme-warning-border)] bg-[var(--theme-warning-bg)] text-[var(--theme-warning-text)]';
    case 'blue':
      return 'border-[var(--theme-info-border)] bg-[var(--theme-info-bg)] text-[var(--theme-info-text)]';
    default:
      return 'border-[var(--theme-neutral-border)] bg-[var(--theme-neutral-bg)] text-[var(--theme-neutral-text)]';
  }
}

function getContractTotal(data: ContractFinancialData | null) {
  if (!data) return 0;
  if (data.pricingType === 'metered') {
    const parkingArea = Number(data.parkingArea || 0);
    const unitArea = Number(data.unitArea || Math.max(Number(data.totalArea || 0) - parkingArea, 0));
    return unitArea * Number(data.pricePerMeter || 0) + parkingArea * Number(data.parkingPricePerMeter || 0);
  }
  return Number(data.fixedTotalAmount || 0);
}

function getFinancialSlices(data: ContractFinancialData | null) {
  if (!data?.categories?.length) return [];
  let otherColorIndex = 0;

  return data.categories
    .filter((item) => item.capAmount > 0)
    .map((item) => {
      const kind = getFinancialSliceKind(item);
      const color =
        kind === 'other'
          ? OTHER_FINANCIAL_COLORS[otherColorIndex++ % OTHER_FINANCIAL_COLORS.length]
          : FIXED_FINANCIAL_COLORS[kind];

      return {
        id: item.id,
        name: item.name,
        value: item.capAmount,
        color,
      };
    });
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
  const router = useRouter();
  const leavingRef = useRef(false);
  const [activeSection, setActiveSection] = useState<SectionItem['id']>('subject');
  const [loading, setLoading] = useState(true);
  const [subjectData, setSubjectData] = useState<ContractSubjectData | null>(null);
  const [partiesData, setPartiesData] = useState<ContractPartiesData | null>(null);
  const [financialData, setFinancialData] = useState<ContractFinancialData | null>(null);
  const [financialLiveData, setFinancialLiveData] = useState<ContractFinancialData | null>(null);
  const [dirtyMap, setDirtyMap] = useState<Partial<Record<ContractFlowSectionId, boolean>>>({});
  const [savingMap, setSavingMap] = useState<Partial<Record<ContractFlowSectionId, boolean>>>({});
  const [lastUpdatedMap, setLastUpdatedMap] = useState<Partial<Record<ContractFlowSectionId, number>>>({});
  const [lockedDialogSection, setLockedDialogSection] = useState<ContractFlowSectionId | null>(null);
  const [pendingScrollSection, setPendingScrollSection] = useState<ContractFlowSectionId | null>(null);
  const [pendingLeave, setPendingLeave] = useState<{ mode: 'route' | 'back'; href?: string } | null>(null);

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
        const financialFrontendDraft = getFrontendStepDraft<ContractFinancialData>(draftId, 'financial');

        if (!mounted) return;
        setSubjectData(subject);
        setPartiesData(parties);
        setFinancialData(financial);
        setFinancialLiveData(financialFrontendDraft ?? financial);
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

    const handleSaved = async (event: Event) => {
      const customEvent = event as CustomEvent<{ sectionId: ContractFlowSectionId; savedAt: number }>;
      const savedSectionId = customEvent.detail.sectionId;
      setDirtyMap((current) => ({ ...current, [customEvent.detail.sectionId]: false }));
      setSavingMap((current) => ({ ...current, [customEvent.detail.sectionId]: false }));
      setLastUpdatedMap((current) => ({ ...current, [customEvent.detail.sectionId]: customEvent.detail.savedAt }));

      const draftId = getActiveDraftId();
      if (!draftId) return;

      if (savedSectionId === 'subject') {
        const subject = await getStepData<ContractSubjectData>(draftId, 'subject');
        setSubjectData(subject);
        if (subject && validateStep1(subject).valid) setPendingScrollSection('parties');
      } else if (savedSectionId === 'parties') {
        const parties = await getStepData<ContractPartiesData>(draftId, 'parties');
        setPartiesData(parties);
        if (parties && validateStep2(parties).valid) setPendingScrollSection('financial');
      } else if (savedSectionId === 'financial') {
        const financial = await getStepData<ContractFinancialData>(draftId, 'financial');
        setFinancialData(financial);
        setFinancialLiveData(financial);
        if (financial && validateFinancialStep(financial).valid) setPendingScrollSection('penalties');
      }
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

  const subjectComplete = Boolean(subjectData && validateStep1(subjectData).valid);
  const partiesComplete = Boolean(partiesData && validateStep2(partiesData).valid);
  const financialComplete = Boolean(financialData && validateFinancialStep(financialData).valid);
  const completionMap: Record<ContractFlowSectionId, boolean> = {
    subject: subjectComplete,
    parties: partiesComplete,
    financial: financialComplete,
    penalties: false,
    discounts: false,
    termination: false,
  };

  const accessMap = useMemo<Record<ContractFlowSectionId, SectionAccess>>(() => {
    const result = {} as Record<ContractFlowSectionId, SectionAccess>;

    SECTION_ORDER.forEach((sectionId) => {
      const requirements = SECTION_PREREQUISITES[sectionId].map((requiredId) => {
        const dirty = Boolean(dirtyMap[requiredId]);
        const complete = Boolean(completionMap[requiredId]) && !dirty;
        return {
          id: requiredId,
          title: SECTION_TITLES[requiredId],
          complete,
          dirty,
          statusText: dirty ? 'تغییر کرده و باید ذخیره شود' : complete ? 'تکمیل شده' : 'نیاز به تکمیل',
        };
      });
      const locked = requirements.some((item) => !item.complete);
      const missingTitles = requirements.filter((item) => !item.complete).map((item) => item.title);
      result[sectionId] = {
        locked,
        requirements,
        info: locked
          ? `برای باز شدن این بخش باید ${missingTitles.join('، ')} تکمیل و ذخیره شود.`
          : 'این بخش در دسترس است.',
      };
    });

    result.subject = {
      locked: false,
      requirements: [],
      info: 'اولین بخش قرارداد است و همیشه در دسترس است.',
    };

    return result;
  }, [dirtyMap, financialComplete, partiesComplete, subjectComplete]);

  useEffect(() => {
    const renderedSections = Array.from(document.querySelectorAll<HTMLElement>('[data-contract-section]'));
    if (!renderedSections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleEntries.length) return;

        const nextId = visibleEntries[0].target.getAttribute('id') as SectionItem['id'] | null;
        if (nextId && !accessMap[nextId]?.locked) setActiveSection(nextId);
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.7],
        rootMargin: '-80px 0px -35% 0px',
      },
    );

    renderedSections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [accessMap]);

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
  const leaveIssues = useMemo<LeaveIssue[]>(() => {
    const issues: LeaveIssue[] = [];
    const financialLiveComplete = Boolean(reportData && validateFinancialStep(reportData).valid);

    if (!subjectComplete || dirtyMap.subject) {
      issues.push({
        id: 'subject',
        title: SECTION_TITLES.subject,
        status: dirtyMap.subject ? 'تغییر کرده و ذخیره نشده است' : 'تکمیل نشده است',
      });
    }

    if (!partiesComplete || dirtyMap.parties) {
      issues.push({
        id: 'parties',
        title: SECTION_TITLES.parties,
        status: dirtyMap.parties ? 'تغییر کرده و ذخیره نشده است' : 'تکمیل نشده است',
      });
    }

    if (!financialLiveComplete || dirtyMap.financial) {
      issues.push({
        id: 'financial',
        title: SECTION_TITLES.financial,
        status: dirtyMap.financial ? 'تغییر کرده و ذخیره نشده است' : 'تکمیل نشده است',
      });
    }

    return issues;
  }, [dirtyMap.financial, dirtyMap.parties, dirtyMap.subject, partiesComplete, reportData, subjectComplete]);
  const shouldBlockContractLeave = !loading && leaveIssues.length > 0;

  const requestSectionSave = (sectionId: ContractFlowSectionId) => {
    const trigger = document.querySelector<HTMLButtonElement>(`[data-contract-save-trigger="${sectionId}"]`);
    if (!trigger || trigger.disabled) return;

    setSavingMap((current) => ({ ...current, [sectionId]: true }));
    trigger.click();
  };

  const scrollToSection = (sectionId: SectionItem['id']) => {
    if (accessMap[sectionId]?.locked) {
      setLockedDialogSection(sectionId);
      return;
    }
    const section = document.getElementById(sectionId);
    if (!section) return;
    setActiveSection(sectionId);
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const continueContractLeave = () => {
    if (!pendingLeave) return;

    leavingRef.current = true;
    const target = pendingLeave;
    setPendingLeave(null);

    if (target.mode === 'back') {
      router.back();
      return;
    }

    if (!target.href) return;
    const nextUrl = new URL(target.href, window.location.href);
    const nextHref = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;

    if (nextUrl.origin === window.location.origin) {
      router.push(nextHref);
      return;
    }

    window.location.assign(nextUrl.href);
  };

  useEffect(() => {
    if (!pendingScrollSection || accessMap[pendingScrollSection]?.locked) return;
    const timer = window.setTimeout(() => {
      scrollToSection(pendingScrollSection);
      setPendingScrollSection(null);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [accessMap, pendingScrollSection]);

  useEffect(() => {
    if (!accessMap[activeSection]?.locked) return;
    const fallback = SECTION_ORDER.find((sectionId) => !accessMap[sectionId].locked) ?? 'subject';
    setActiveSection(fallback);
  }, [accessMap, activeSection]);

  useEffect(() => {
    if (!shouldBlockContractLeave) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (leavingRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [shouldBlockContractLeave]);

  useEffect(() => {
    if (!shouldBlockContractLeave) return;

    const handlePopState = () => {
      if (leavingRef.current) return;
      window.history.pushState(null, '', window.location.href);
      setPendingLeave({ mode: 'back' });
    };

    window.history.pushState(null, '', window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [shouldBlockContractLeave]);

  useEffect(() => {
    if (!shouldBlockContractLeave) return;

    const handleDocumentClick = (event: MouseEvent) => {
      if (leavingRef.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      const nextHref = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      const currentHref = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;

      if (nextUrl.origin === currentUrl.origin && nextHref === currentHref) return;

      event.preventDefault();
      setPendingLeave({ mode: 'route', href: nextUrl.href });
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, [shouldBlockContractLeave]);

  useEffect(() => {
    if (!shouldBlockContractLeave) return;

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    const interceptHistoryChange = (url?: string | URL | null) => {
      if (leavingRef.current || !url) return false;

      const nextUrl = new URL(String(url), window.location.href);
      const currentUrl = new URL(window.location.href);
      const nextHref = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      const currentHref = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;

      if (nextUrl.origin !== currentUrl.origin || nextHref === currentHref) return false;

      setPendingLeave({ mode: 'route', href: nextHref });
      return true;
    };

    window.history.pushState = function pushState(data, unused, url) {
      if (interceptHistoryChange(url)) return;
      originalPushState.call(window.history, data, unused, url);
    };

    window.history.replaceState = function replaceState(data, unused, url) {
      if (interceptHistoryChange(url)) return;
      originalReplaceState.call(window.history, data, unused, url);
    };

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [shouldBlockContractLeave]);

  return (
    <div className="contract-flow-layout lg:flex lg:flex-row lg:items-stretch lg:gap-0">
      <RightNavSidebar
        sections={sections}
        activeSection={activeSection}
        dirtyMap={dirtyMap}
        savingMap={savingMap}
        lastUpdatedMap={lastUpdatedMap}
        accessMap={accessMap}
        onScrollTo={scrollToSection}
        onSave={requestSectionSave}
        onLockedClick={setLockedDialogSection}
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
        {sections.filter((section) => !accessMap[section.id].locked).map((section) => {
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

      {pendingLeave ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={() => setPendingLeave(null)}>
          <div
            className="w-full max-w-xl rounded-3xl border border-[var(--border-color)] bg-[var(--surface)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-color)] px-5 py-4">
              <div>
                <div className="flex items-center gap-2 text-[var(--text-strong)]">
                  <AlertCircle className="h-5 w-5 text-[var(--theme-warning-text)]" />
                  <h3 className="text-base font-bold">خروج از صفحه قرارداد</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  قبل از خروج، وضعیت بخش‌های ناقص یا ذخیره‌نشده را بررسی کنید.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPendingLeave(null)}
                className="rounded-lg p-1 text-[var(--text-faint)] transition-colors hover:bg-[var(--surface-soft)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 px-5 py-4">
              <div className="rounded-2xl border border-[var(--theme-warning-border)] bg-[var(--theme-warning-bg)] px-4 py-3">
                <div className="mb-3 text-sm font-bold text-[var(--theme-warning-text)]">بخش‌های نیازمند تکمیل</div>
                <div className="grid gap-2">
                  {leaveIssues.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface)] px-3 py-2 text-sm">
                      <span className="font-bold text-[var(--text-body)]">{item.title}</span>
                      <span className="rounded-full border border-[var(--theme-warning-border)] bg-[var(--theme-warning-bg)] px-2.5 py-1 text-xs font-bold text-[var(--theme-warning-text)]">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-[var(--border-color)] px-5 py-4">
              <button
                type="button"
                onClick={() => setPendingLeave(null)}
                className="rounded-lg border border-[var(--border-color)] px-4 py-2 text-sm font-bold text-[var(--text-body)] transition-colors hover:bg-[var(--surface-soft)]"
              >
                ماندن در صفحه
              </button>
              <button
                type="button"
                onClick={continueContractLeave}
                className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100"
              >
                خروج بدون تکمیل
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {lockedDialogSection ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4" onClick={() => setLockedDialogSection(null)}>
          <div
            className="w-full max-w-2xl rounded-3xl border border-[var(--border-color)] bg-[var(--surface)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-color)] px-5 py-4">
              <div>
                <div className="flex items-center gap-2 text-[var(--text-strong)]">
                  <Lock className="h-4 w-4 text-[var(--theme-warning-text)]" />
                  <h3 className="text-base font-bold">این بخش هنوز قفل است</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                  {accessMap[lockedDialogSection].info}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLockedDialogSection(null)}
                className="rounded-lg p-1 text-[var(--text-faint)] transition-colors hover:bg-[var(--surface-soft)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 px-5 py-4">
              <div className="rounded-2xl border border-[var(--theme-warning-border)] bg-[var(--theme-warning-bg)] px-4 py-3">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[var(--theme-warning-text)]">
                  <AlertCircle className="h-4 w-4" />
                  پیش‌نیازهای لازم
                </div>
                <div className="grid gap-2">
                  {accessMap[lockedDialogSection].requirements.map((item) => {
                    const status = statusMap[item.id];
                    return (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface)] px-3 py-2 text-sm">
                        <span className="flex items-center gap-2 font-bold text-[var(--text-body)]">
                          {item.complete ? (
                            <CheckCircle2 className="h-4 w-4 text-[var(--theme-action-text)]" />
                          ) : (
                            <Lock className="h-4 w-4 text-[var(--theme-warning-text)]" />
                          )}
                          {item.title}
                          <span className="group relative inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-muted)]">
                            <Info className="h-3.5 w-3.5" />
                            <span className="pointer-events-none absolute left-0 top-8 z-10 hidden w-64 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] p-3 text-right text-xs leading-6 text-[var(--text-muted)] shadow-lg group-hover:block">
                              برای باز شدن {SECTION_TITLES[lockedDialogSection]} باید بخش {item.title} تکمیل و ذخیره شده باشد.
                            </span>
                          </span>
                        </span>
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getToneClasses(status.tone)}`}>
                          {item.statusText}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
