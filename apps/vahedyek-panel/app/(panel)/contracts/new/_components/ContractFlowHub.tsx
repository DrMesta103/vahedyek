'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2, Info, Lock, X } from 'lucide-react';
import { getActiveDraftId, getFrontendStepDraft, getStepData } from '../../../../lib/contractDraftClient';
import { computeContractTotalRialFromFinancial } from '../../../../lib/contractFinancialPricing';
import { isFinancialLineHeaderCategoryId, isFinancialLineSubtreeCategoryId, isLegacyCustomRootCategoryId } from '../../../../lib/financialUtils';
import { getDraftApprovalBlockers } from '../../../../lib/draftReadiness';
import { validateDiscountsStep, validateFinancialStep, validatePenaltiesStep, validateStep1, validateStep2, validateTerminationStep } from '../../../../lib/contractValidation';
import type { ContractDiscountsData, ContractFinancialData, ContractPartiesData, ContractPenaltiesData, ContractSubjectData, ContractTerminationData } from '../../../../types/contract';
import { DiscountsStep } from './DiscountsStep';
import { FinancialStep } from './FinancialStep';
import { LeftReportSidebar } from './LeftReportSidebar';
import { PartiesStep } from './PartiesStep';
import { PenaltiesStep } from './PenaltiesStep';
import { ContractRuleDraftStep } from './ContractRuleDraftStep';
import { ContractDraftPreviewDialog } from '../../../../components/contracts/ContractDraftPreviewDialog';
import { RightNavSidebar } from './RightNavSidebar';
import { SubjectStep } from './SubjectStep';
import { TerminationStep } from './TerminationStep';
import { ExtraCostsStep } from './ExtraCostsStep';
import { TechnicalSpecsStep } from './TechnicalSpecsGroupedStep';
import { ContractAttachmentsStep } from './ContractAttachmentsStep';
import { getContractAttachments, getContractExtraCosts, getContractTechnicalSpecs } from '../../../../actions/contractSteps789';
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

const SAVEABLE_SECTIONS: ContractFlowSectionId[] = [
  'subject',
  'parties',
  'financial',
  'penalties',
  'discounts',
  'interest',
  'forgiveness',
  'termination',
  'extraCosts',
  'technicalSpecs',
  'contractAttachments',
];
const SECTION_ORDER: ContractFlowSectionId[] = [
  'subject',
  'parties',
  'financial',
  'penalties',
  'discounts',
  'interest',
  'forgiveness',
  'termination',
  'extraCosts',
  'technicalSpecs',
  'contractAttachments',
];
const SECTION_PREREQUISITES: Record<ContractFlowSectionId, ContractFlowSectionId[]> = {
  subject: [],
  parties: ['subject'],
  financial: ['subject', 'parties'],
  penalties: ['subject', 'parties', 'financial'],
  discounts: ['subject', 'parties', 'financial', 'penalties'],
  interest: ['subject', 'parties', 'financial', 'penalties', 'discounts'],
  forgiveness: ['subject', 'parties', 'financial', 'penalties', 'discounts', 'interest'],
  termination: ['subject', 'parties', 'financial', 'penalties', 'discounts', 'interest', 'forgiveness'],
  extraCosts: ['termination'],
  technicalSpecs: ['extraCosts'],
  contractAttachments: ['technicalSpecs'],
};
const SECTION_TITLES: Record<ContractFlowSectionId, string> = {
  subject: 'اطلاعات پایه',
  parties: 'طرفین',
  financial: 'اطلاعات مالی',
  penalties: 'جرایم',
  discounts: 'تخفیف‌ها',
  termination: 'شرایط فسخ',
  extraCosts: 'سایر هزینه‌های قرارداد',
  technicalSpecs: 'مشخصات فنی پروژه',
  contractAttachments: 'پیوست و اسناد قرارداد',
  interest: 'سود دریافتی',
  forgiveness: 'بخشودگی',
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
      data.storagePricePerMeter ||
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
  return computeContractTotalRialFromFinancial(data);
}

function getFinancialSlices(data: ContractFinancialData | null) {
  if (!data?.categories?.length) return [];
  let otherColorIndex = 0;

  return data.categories
    .filter((item) => {
      if (item.capAmount <= 0) return false;
      if (item.id === 'principal') return false;
      if (isFinancialLineHeaderCategoryId(item.id)) return false;
      if (isFinancialLineSubtreeCategoryId(item.id)) return false;
      return true;
    })
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

function getAdditionalFinancialTotal(data: ContractFinancialData | null) {
  if (!data?.categories?.length) return 0;

  return data.categories.reduce((sum, item) => {
    if (!isFinancialLineHeaderCategoryId(item.id) && !isLegacyCustomRootCategoryId(item.id)) return sum;
    return sum + Math.max(0, Number(item.capAmount) || 0);
  }, 0);
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const leavingRef = useRef(false);
  /** Count of pushState \"trap\" layers we added on top of the real history stack (multiple entries can share the same URL). */
  const leaveTrapPushCountRef = useRef(0);
  const didAutoScrollRef = useRef(false);
  const dirtyMapRef = useRef<Partial<Record<ContractFlowSectionId, boolean>>>({});
  const [activeSection, setActiveSection] = useState<SectionItem['id']>('subject');
  const [loading, setLoading] = useState(true);
  const [subjectData, setSubjectData] = useState<ContractSubjectData | null>(null);
  const [partiesData, setPartiesData] = useState<ContractPartiesData | null>(null);
  const [financialData, setFinancialData] = useState<ContractFinancialData | null>(null);
  const [financialLiveData, setFinancialLiveData] = useState<ContractFinancialData | null>(null);
  const [penaltiesData, setPenaltiesData] = useState<ContractPenaltiesData | null>(null);
  const [discountsData, setDiscountsData] = useState<ContractDiscountsData | null>(null);
  const [terminationData, setTerminationData] = useState<ContractTerminationData | null>(null);
  const [extraCostsExists, setExtraCostsExists] = useState(false);
  const [technicalSpecsExists, setTechnicalSpecsExists] = useState(false);
  const [attachmentsExists, setAttachmentsExists] = useState(false);
  const [dirtyMap, setDirtyMap] = useState<Partial<Record<ContractFlowSectionId, boolean>>>({});
  const [savingMap, setSavingMap] = useState<Partial<Record<ContractFlowSectionId, boolean>>>({});
  const [lastUpdatedMap, setLastUpdatedMap] = useState<Partial<Record<ContractFlowSectionId, number>>>({});
  const [lockedDialogSection, setLockedDialogSection] = useState<ContractFlowSectionId | null>(null);
  const [pendingScrollSection, setPendingScrollSection] = useState<ContractFlowSectionId | null>(null);
  const [pendingLeave, setPendingLeave] = useState<{ mode: 'route' | 'back'; href?: string } | null>(null);
  const [leaveSaving, setLeaveSaving] = useState(false);
  const [leaveSaveError, setLeaveSaveError] = useState<string>('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

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
        didAutoScrollRef.current = false;
        const [subject, parties, financial, penalties, extraCosts, technicalSpecs, attachments] = await Promise.all([
          getStepData<ContractSubjectData>(draftId, 'subject'),
          getStepData<ContractPartiesData>(draftId, 'parties'),
          getStepData<ContractFinancialData>(draftId, 'financial'),
          getStepData<ContractPenaltiesData>(draftId, 'penalties'),
          getContractExtraCosts(draftId).catch(() => ({ ok: false as const, message: 'خطا' })),
          getContractTechnicalSpecs(draftId).catch(() => ({ ok: false as const, message: 'خطا' })),
          getContractAttachments(draftId).catch(() => ({ ok: false as const, message: 'خطا' })),
        ]);
        const financialFrontendDraft = getFrontendStepDraft<ContractFinancialData>(draftId, 'financial');
        const penaltiesFrontendDraft = getFrontendStepDraft<ContractPenaltiesData>(draftId, 'penalties');
        const discountsFrontendDraft = getFrontendStepDraft<ContractDiscountsData>(draftId, 'discounts');
        const terminationFrontendDraft = getFrontendStepDraft<ContractTerminationData>(draftId, 'termination');

        if (!mounted) return;
        setSubjectData(subject);
        setPartiesData(parties);
        setFinancialData(financial);
        setFinancialLiveData(financialFrontendDraft ?? financial);
        setPenaltiesData(penaltiesFrontendDraft ?? penalties);
        setDiscountsData(discountsFrontendDraft);
        setTerminationData(terminationFrontendDraft);
        setExtraCostsExists(Boolean(extraCosts.ok && extraCosts.exists));
        setTechnicalSpecsExists(Boolean(technicalSpecs.ok && technicalSpecs.exists));
        setAttachmentsExists(Boolean(attachments.ok && attachments.exists));
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
    setLastUpdatedMap(getStoredLastUpdated(getActiveDraftId()));

    const handleDirty = (event: Event) => {
      const customEvent = event as CustomEvent<{ sectionId: ContractFlowSectionId; dirty: boolean }>;
      setDirtyMap((current) => ({ ...current, [customEvent.detail.sectionId]: customEvent.detail.dirty }));
      if (!customEvent.detail.dirty) {
        setSavingMap((current) => ({ ...current, [customEvent.detail.sectionId]: false }));
      }
    };

    const handleSaved = async (event: Event) => {
      const customEvent = event as CustomEvent<{ sectionId: ContractFlowSectionId; savedAt: number; payload?: unknown }>;
      const savedSectionId = customEvent.detail.sectionId;
      const inlinePayload = customEvent.detail.payload;
      setDirtyMap((current) => ({ ...current, [customEvent.detail.sectionId]: false }));
      setSavingMap((current) => ({ ...current, [customEvent.detail.sectionId]: false }));
      setLastUpdatedMap((current) => ({ ...current, [customEvent.detail.sectionId]: customEvent.detail.savedAt }));

      const draftId = getActiveDraftId();
      if (!draftId) return;

      if (savedSectionId === 'subject') {
        const subject =
          inlinePayload !== undefined
            ? (inlinePayload as ContractSubjectData)
            : await getStepData<ContractSubjectData>(draftId, 'subject');
        setSubjectData(subject);
        if (subject && validateStep1(subject).valid) setPendingScrollSection('parties');
      } else if (savedSectionId === 'parties') {
        const parties =
          inlinePayload !== undefined
            ? (inlinePayload as ContractPartiesData)
            : await getStepData<ContractPartiesData>(draftId, 'parties');
        setPartiesData(parties);
        if (parties && validateStep2(parties).valid) setPendingScrollSection('financial');
      } else if (savedSectionId === 'financial') {
        const financial =
          inlinePayload !== undefined
            ? (inlinePayload as ContractFinancialData)
            : await getStepData<ContractFinancialData>(draftId, 'financial');
        setFinancialData(financial);
        setFinancialLiveData(financial);
        if (financial && validateFinancialStep(financial).valid) setPendingScrollSection('penalties');
      } else if (savedSectionId === 'penalties') {
        const penalties =
          inlinePayload !== undefined
            ? (inlinePayload as ContractPenaltiesData)
            : await getStepData<ContractPenaltiesData>(draftId, 'penalties');
        setPenaltiesData(penalties);
        if (penalties && validatePenaltiesStep(penalties).valid) setPendingScrollSection('discounts');
      } else if (savedSectionId === 'discounts') {
        const discounts =
          inlinePayload !== undefined
            ? (inlinePayload as ContractDiscountsData)
            : getFrontendStepDraft<ContractDiscountsData>(draftId, 'discounts');
        setDiscountsData(discounts);
        if (discounts && validateDiscountsStep(discounts).valid) setPendingScrollSection('interest');
      } else if (savedSectionId === 'interest') {
        setPendingScrollSection('forgiveness');
      } else if (savedSectionId === 'forgiveness') {
        setPendingScrollSection('termination');
      } else if (savedSectionId === 'termination') {
        const termination =
          inlinePayload !== undefined
            ? (inlinePayload as ContractTerminationData)
            : getFrontendStepDraft<ContractTerminationData>(draftId, 'termination');
        setTerminationData(termination);
      } else if (savedSectionId === 'extraCosts') {
        setExtraCostsExists(true);
      } else if (savedSectionId === 'technicalSpecs') {
        setTechnicalSpecsExists(true);
      } else if (savedSectionId === 'contractAttachments') {
        setAttachmentsExists(true);
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

  useEffect(() => {
    dirtyMapRef.current = dirtyMap;
  }, [dirtyMap]);

  const subjectComplete = Boolean(subjectData && validateStep1(subjectData).valid);
  const partiesComplete = Boolean(partiesData && validateStep2(partiesData).valid);
  const financialComplete = Boolean(financialData && validateFinancialStep(financialData).valid);
  const penaltiesComplete = Boolean(penaltiesData && validatePenaltiesStep(penaltiesData).valid);
  const discountsComplete = !discountsData || validateDiscountsStep(discountsData).valid;
  const interestComplete = true;
  const forgivenessComplete = true;
  const terminationComplete = Boolean(terminationData && validateTerminationStep(terminationData).valid);
  const extraCostsComplete = true;
  const technicalSpecsComplete = technicalSpecsExists;
  const attachmentsComplete = attachmentsExists;
  const extraCostsApplicable = extraCostsExists;
  const sectionPrerequisites = useMemo<Record<ContractFlowSectionId, ContractFlowSectionId[]>>(
    () => ({
      ...SECTION_PREREQUISITES,
      technicalSpecs: extraCostsApplicable ? ['extraCosts'] : ['termination'],
    }),
    [extraCostsApplicable],
  );
  const completionMap: Record<ContractFlowSectionId, boolean> = {
    subject: subjectComplete,
    parties: partiesComplete,
    financial: financialComplete,
    penalties: penaltiesComplete,
    discounts: discountsComplete,
    interest: interestComplete,
    forgiveness: forgivenessComplete,
    termination: terminationComplete,
    extraCosts: extraCostsComplete,
    technicalSpecs: technicalSpecsComplete,
    contractAttachments: attachmentsComplete,
  };

  const approvalSubmissionBlockers = useMemo(() => {
    const validationBlockers = new Map(
      getDraftApprovalBlockers({
        subject: subjectData,
        parties: partiesData,
        financial: financialLiveData,
        penalties: penaltiesData,
        discounts: discountsData,
        terminationRules: terminationData,
        extraCosts: extraCostsExists ? {} : null,
        technicalSpecs: technicalSpecsExists ? {} : null,
        attachments: attachmentsExists ? {} : null,
      }).map((item) => [item.sectionId, item]),
    );

    const out: { title: string; detail: string }[] = [];
    for (const sectionId of SECTION_ORDER) {
      if (sectionId === 'extraCosts' && !extraCostsApplicable) continue;
      const dirty = Boolean(dirtyMap[sectionId]);
      const saved = Boolean(lastUpdatedMap[sectionId]);
      const contentOk = Boolean(completionMap[sectionId]);
      if (contentOk && saved && !dirty) continue;

      const blocker = validationBlockers.get(sectionId);
      let detail = blocker?.detail ?? 'این مرحله باید کامل و ذخیره شود.';
      if (dirty) detail = 'تغییرات ذخیره نشده است؛ ابتدا دکمهٔ «ذخیره» این مرحله را بزنید.';
      else if (!contentOk) detail = blocker?.detail ?? 'اطلاعات این بخش هنوز طبق قواعد سیستم کامل نیست.';
      else if (!saved) detail = 'این بخش هنوز حداقل یک‌بار ذخیره نشده است.';

      out.push({ title: SECTION_TITLES[sectionId], detail });
    }
    return out;
  }, [attachmentsExists, completionMap, discountsData, dirtyMap, extraCostsApplicable, extraCostsExists, financialLiveData, lastUpdatedMap, partiesData, penaltiesData, subjectData, technicalSpecsExists, terminationData]);

  const approvalSubmissionReady = approvalSubmissionBlockers.length === 0 && !loading;

  const accessMap = useMemo<Record<ContractFlowSectionId, SectionAccess>>(() => {
    const result = {} as Record<ContractFlowSectionId, SectionAccess>;

    SECTION_ORDER.forEach((sectionId) => {
      if (sectionId === 'extraCosts' && !extraCostsApplicable) {
        result[sectionId] = {
          locked: true,
          requirements: [],
          info: 'این بخش تا زمانی که «سایر هزینه‌های قرارداد» ثبت نشود، نمایش داده نمی‌شود.',
        };
        return;
      }

      const requirements = sectionPrerequisites[sectionId].map((requiredId) => {
        const dirty = Boolean(dirtyMap[requiredId]);
        const saved = Boolean(lastUpdatedMap[requiredId]);
        const complete = Boolean(completionMap[requiredId]) && saved && !dirty;
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
  }, [completionMap, dirtyMap, extraCostsApplicable, lastUpdatedMap, sectionPrerequisites]);

  useEffect(() => {
    if (loading) return;
    if (didAutoScrollRef.current) return;

    const draftId = getActiveDraftId();
    if (!draftId) return;

    const requestedSection = searchParams.get('section') as ContractFlowSectionId | null;
    const queryTarget = requestedSection && SECTION_ORDER.includes(requestedSection) ? requestedSection : null;
    const firstIncomplete = SECTION_ORDER.find((sectionId) => {
      if (accessMap[sectionId]?.locked) return false;
      const dirty = Boolean(dirtyMap[sectionId]);
      const saved = Boolean(lastUpdatedMap[sectionId]);
      const complete = Boolean(completionMap[sectionId]) && saved && !dirty;
      return !complete;
    });

    const fallback = SECTION_ORDER.find((sectionId) => !accessMap[sectionId]?.locked) ?? 'subject';
    const target = (queryTarget && !accessMap[queryTarget]?.locked ? queryTarget : firstIncomplete ?? fallback) as ContractFlowSectionId;

    didAutoScrollRef.current = true;
    setPendingScrollSection(target);
    setActiveSection(target);
  }, [accessMap, completionMap, dirtyMap, lastUpdatedMap, loading, searchParams]);

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
      discounts: !financialComplete
        ? { label: 'در انتظار مالی', detail: 'این بخش به اطلاعات مالی قرارداد وابسته است.', tone: 'amber' }
        : discountsComplete
          ? { label: 'تکمیل شده', detail: 'سناریوهای تخفیف قرارداد ثبت و ذخیره شده‌اند.', tone: 'green' }
          : discountsData
            ? { label: 'ناقص', detail: 'بخشی از تنظیمات تخفیف ثبت شده و هنوز کامل نیست.', tone: 'amber' }
            : { label: 'آماده تنظیم', detail: 'پس از تکمیل بخش مالی، ثبت تخفیف‌ها آماده است.', tone: 'blue' },
      interest: !discountsComplete
        ? { label: 'در انتظار تخفیف‌ها', detail: 'ابتدا بخش تخفیف‌ها را تکمیل و ذخیره کنید.', tone: 'amber' }
        : lastUpdatedMap.interest
          ? { label: 'تکمیل شده', detail: 'تنظیمات سود دریافتی برای این پیش‌نویس ذخیره شده است.', tone: 'green' }
          : { label: 'آماده تنظیم', detail: 'تنظیمات سود از تنظیمات کسب‌وکار خوانده شده و برای این پیش‌نویس قابل تغییر است.', tone: 'blue' },
      forgiveness: !lastUpdatedMap.interest
        ? { label: 'در انتظار سود', detail: 'ابتدا بخش سود دریافتی را ذخیره کنید.', tone: 'amber' }
        : lastUpdatedMap.forgiveness
          ? { label: 'تکمیل شده', detail: 'تنظیمات بخشودگی برای این پیش‌نویس ذخیره شده است.', tone: 'green' }
          : { label: 'آماده تنظیم', detail: 'تنظیمات بخشودگی از تنظیمات کسب‌وکار خوانده شده و برای این پیش‌نویس قابل تغییر است.', tone: 'blue' },
      termination: !discountsComplete
        ? { label: 'Waiting', detail: 'Complete penalties and discounts before finalizing termination clauses.', tone: 'amber' }
        : terminationComplete
          ? { label: 'Completed', detail: 'Balanced termination rights for both parties have been saved.', tone: 'green' }
          : terminationData
            ? { label: 'Incomplete', detail: 'Termination clauses were reviewed but are not confirmed yet.', tone: 'amber' }
            : { label: 'Ready', detail: 'Balanced termination clauses are ready for review.', tone: 'blue' },
      extraCosts: terminationComplete
        ? extraCostsComplete
          ? { label: 'تکمیل شده', detail: 'هزینه‌های مرتبط با قرارداد ذخیره شده است.', tone: 'green' }
          : { label: 'آماده تنظیم', detail: 'هزینه‌ها و مسئول پرداخت را مشخص و ذخیره کنید.', tone: 'blue' }
        : { label: 'قفل', detail: 'برای دسترسی ابتدا مرحله «شرایط فسخ» را تکمیل کنید.', tone: 'amber' },
      technicalSpecs: terminationComplete
        ? technicalSpecsComplete
          ? { label: 'تکمیل شده', detail: 'مشخصات فنی پروژه ذخیره شده است.', tone: 'green' }
          : { label: 'آماده تنظیم', detail: 'مشخصات فنی پروژه را ثبت و ذخیره کنید.', tone: 'blue' }
        : { label: 'قفل', detail: 'برای دسترسی ابتدا مرحله «شرایط فسخ» را تکمیل کنید.', tone: 'amber' },
      contractAttachments: terminationComplete
        ? attachmentsComplete
          ? { label: 'تکمیل شده', detail: 'پیوست‌ها و اسناد قرارداد ذخیره شده است.', tone: 'green' }
          : { label: 'آماده تنظیم', detail: 'اسناد موردنیاز را بارگذاری و ذخیره کنید.', tone: 'blue' }
        : { label: 'قفل', detail: 'برای دسترسی ابتدا مرحله «شرایط فسخ» را تکمیل کنید.', tone: 'amber' },
    }),
    [
      attachmentsComplete,
      discountsComplete,
      discountsData,
      extraCostsComplete,
      financialComplete,
      financialData,
      lastUpdatedMap.forgiveness,
      lastUpdatedMap.interest,
      loading,
      partiesComplete,
      partiesData,
      subjectComplete,
      subjectData,
      technicalSpecsComplete,
      terminationComplete,
      terminationData,
    ],
  );

  const sections: SectionItem[] = [
    {
      id: 'subject',
      title: 'اطلاعات پایه',
      navLabel: 'اطلاعات پایه',
      render: () => <SubjectStep stepId="subject" title="اطلاعات پایه" embedded />,
    },
    {
      id: 'parties',
      title: 'طرفین',
      navLabel: 'طرفین',
      render: () => <PartiesStep stepId="parties" title="طرفین" embedded />,
    },
    {
      id: 'financial',
      title: 'اطلاعات مالی',
      navLabel: 'اطلاعات مالی',
      render: () => <FinancialStep stepId="financial" title="اطلاعات مالی قرارداد" embedded />,
    },
    {
      id: 'penalties',
      title: 'جرایم',
      navLabel: 'جرایم',
      render: () => <PenaltiesStep stepId="penalties" title="جرایم" embedded />,
    },
    {
      id: 'discounts',
      title: 'تخفیف‌ها',
      navLabel: 'تخفیف‌ها',
      render: () => <DiscountsStep stepId="discounts" title="تخفیف‌ها" embedded />,
    },
    {
      id: 'interest',
      title: 'سود دریافتی',
      navLabel: 'سود دریافتی',
      render: () => <ContractRuleDraftStep stepId="interest" ruleId="interest" title="سود دریافتی" embedded />,
    },
    {
      id: 'forgiveness',
      title: 'بخشودگی',
      navLabel: 'بخشودگی',
      render: () => <ContractRuleDraftStep stepId="forgiveness" ruleId="forgiveness" title="بخشودگی" embedded />,
    },
    {
      id: 'termination',
      title: 'شرایط فسخ',
      navLabel: 'شرایط فسخ',
      render: () => <TerminationStep stepId="termination" title="شرایط فسخ" embedded />,
    },
    ...(extraCostsApplicable
      ? [
          {
            id: 'extraCosts',
            title: 'سایر هزینه‌های قرارداد',
            navLabel: 'هزینه‌های اضافی',
            render: () => <ExtraCostsStep title="سایر هزینه‌های قرارداد" />,
          } as SectionItem,
        ]
      : []),
    {
      id: 'technicalSpecs',
      title: 'مشخصات فنی پروژه',
      navLabel: 'مشخصات فنی',
      render: () => <TechnicalSpecsStep title="مشخصات فنی پروژه" />,
    },
    {
      id: 'contractAttachments',
      title: 'پیوست و اسناد قرارداد',
      navLabel: 'پیوست‌ها',
      render: () => <ContractAttachmentsStep title="پیوست و اسناد قرارداد" />,
    },
  ];

  const visibleSections = sections.filter((section) => !accessMap[section.id]?.locked);

  const reportData = financialLiveData ?? financialData;
  const contractTotal = getContractTotal(reportData);
  const additionalFinancialTotal = getAdditionalFinancialTotal(reportData);
  const paidSlices = getFinancialSlices(reportData);
  const allocatedAmount = paidSlices.reduce((sum, item) => sum + item.value, 0);
  const reportContractTotal = contractTotal + additionalFinancialTotal;
  const dueAmount = reportData?.dueItems?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
  const remainder = reportContractTotal - allocatedAmount;
  const leaveIssues = useMemo<LeaveIssue[]>(() => {
    const issues: LeaveIssue[] = [];
    (['subject', 'parties', 'financial', 'penalties', 'discounts', 'interest', 'forgiveness', 'termination', 'extraCosts', 'technicalSpecs', 'contractAttachments'] as const).forEach(
      (sectionId) => {
        if (!dirtyMap[sectionId]) return;
        issues.push({
          id: sectionId,
          title: SECTION_TITLES[sectionId],
          status: 'تغییر کرده و ذخیره نشده است',
        });
      },
    );
    return issues;
  }, [
    dirtyMap.contractAttachments,
    dirtyMap.discounts,
    dirtyMap.extraCosts,
    dirtyMap.financial,
    dirtyMap.forgiveness,
    dirtyMap.interest,
    dirtyMap.parties,
    dirtyMap.penalties,
    dirtyMap.subject,
    dirtyMap.technicalSpecs,
    dirtyMap.termination,
  ]);
  const shouldBlockContractLeave = !loading && leaveIssues.length > 0;

  const requestSectionSave = (sectionId: ContractFlowSectionId) => {
    const saveButton = document.querySelector<HTMLButtonElement>(`[data-contract-save-button="${sectionId}"]`);
    if (!saveButton || saveButton.disabled) return;

    setSavingMap((current) => ({ ...current, [sectionId]: true }));
    saveButton.click();
  };

  const waitForNavigation = (fromHref: string, timeoutMs = 1200) => {
    return new Promise<boolean>((resolve) => {
      const startedAt = Date.now();
      const tick = () => {
        if (window.location.href !== fromHref) return resolve(true);
        if (Date.now() - startedAt >= timeoutMs) return resolve(false);
        window.setTimeout(tick, 60);
      };
      tick();
    });
  };

  /** Hub یا هر زیرمسیر فلو قرارداد جدید (مثلاً `/contracts/new/parties`). */
  const isContractsNewFlowPath = (pathname: string) =>
    pathname === '/contracts/new' || pathname.startsWith('/contracts/new/');

  /** وقتی تاریخچهٔ طبیعی برنمی‌گرداند، به همان منبع معنادار می‌رویم (جزئیات قرارداد برای فلو معمول، فهرست الگو برای draft-templates). */
  const getLeaveFallbackAfterBlockedBack = () => {
    if (pathname?.startsWith('/draft-templates')) return '/draft-templates';
    const draftId = getActiveDraftId();
    if (draftId) return `/contracts/${encodeURIComponent(draftId)}`;
    return '/contracts';
  };

  const waitForPathLeaveDraft = (timeoutMs = 900) => {
    return new Promise<boolean>((resolve) => {
      const startedAt = Date.now();
      const tick = () => {
        if (!isContractsNewFlowPath(window.location.pathname)) return resolve(true);
        if (Date.now() - startedAt >= timeoutMs) return resolve(false);
        window.setTimeout(tick, 60);
      };
      tick();
    });
  };

  const navigateBackThroughLeaveTraps = async () => {
    const depth = Math.max(1, leaveTrapPushCountRef.current);
    window.history.go(-depth);
    const left = await waitForPathLeaveDraft(1100);
    if (left) {
      leaveTrapPushCountRef.current = 0;
      return;
    }
    if (isContractsNewFlowPath(window.location.pathname)) {
      router.push(getLeaveFallbackAfterBlockedBack());
      await waitForPathLeaveDraft(1200);
    }
    leaveTrapPushCountRef.current = 0;
  };

  const waitForSectionSaved = (sectionId: ContractFlowSectionId, timeoutMs = 15000) => {
    return new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        cleanup();
        reject(new Error('timeout'));
      }, timeoutMs);

      const onSaved = (event: Event) => {
        const customEvent = event as CustomEvent<{ sectionId: ContractFlowSectionId }>;
        if (customEvent.detail.sectionId !== sectionId) return;
        cleanup();
        resolve();
      };

      const cleanup = () => {
        window.clearTimeout(timer);
        window.removeEventListener(CONTRACT_FLOW_SAVED_EVENT, onSaved as EventListener);
      };

      window.addEventListener(CONTRACT_FLOW_SAVED_EVENT, onSaved as EventListener);
    });
  };

  const saveDirtyThenLeave = async () => {
    if (!pendingLeave || leaveSaving) return;

    setLeaveSaveError('');
    setLeaveSaving(true);

    const target = pendingLeave;
    const fromHref = window.location.href;

    try {
      const dirtySections = SAVEABLE_SECTIONS.filter((id) => Boolean(dirtyMapRef.current[id]));
      for (const sectionId of dirtySections) {
        requestSectionSave(sectionId);
        await waitForSectionSaved(sectionId);
      }

      leavingRef.current = true;

      if (target.mode === 'back') {
        await navigateBackThroughLeaveTraps();
      } else {
        if (!target.href) throw new Error('missing-target');
        const nextUrl = new URL(target.href, window.location.href);
        const nextHref = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;

        if (nextUrl.origin === window.location.origin) {
          router.push(nextHref);
        } else {
          window.location.assign(nextUrl.href);
        }
      }

      const navigated = await waitForNavigation(fromHref);
      if (!navigated) {
        throw new Error('navigation-failed');
      }

      setPendingLeave(null);
    } catch {
      setLeaveSaveError('ذخیره تغییرات با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
      leavingRef.current = false;
    } finally {
      setLeaveSaving(false);
    }
  };

  const performLeave = async (target: { mode: 'route' | 'back'; href?: string }) => {
    if (target.mode === 'back') {
      await navigateBackThroughLeaveTraps();
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

    void performLeave(target);
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
      leaveTrapPushCountRef.current += 1;
      window.history.pushState(null, '', window.location.href);
      setPendingLeave({ mode: 'back' });
    };

    leaveTrapPushCountRef.current += 1;
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
        draftId={getActiveDraftId()}
        loading={loading}
        approvalSubmissionReady={approvalSubmissionReady}
        approvalSubmissionBlockers={approvalSubmissionBlockers}
        onOpenPreviewDialog={() => setPreviewDialogOpen(true)}
      />

      <LeftReportSidebar
        reportData={reportData}
        contractTotal={reportContractTotal}
        paidSlices={paidSlices}
        allocatedAmount={allocatedAmount}
        dueAmount={dueAmount}
        remainder={remainder}
        contractNumber={subjectData?.contractNumber}
        contractStatus="draft"
      />

      <div className="contract-flow-content min-w-0 flex-1 space-y-6">
        {visibleSections.map((section) => {
          const status = statusMap[section.id];
          const isSubjectSection = section.id === 'subject';
          const isTerminationSection = section.id === 'termination';
          const lockedAccess = accessMap[section.id];
          const isLockedSection = Boolean(lockedAccess?.locked);
          return (
            <Fragment key={section.id}>
              <section
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
                    {isTerminationSection ? (
                      <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getToneClasses(status.tone)}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-gray-500">{status.detail}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className={isSubjectSection ? 'px-4 pb-4 md:px-5 md:pb-5' : ''}>
                  {isLockedSection ? (
                    <div className="rounded-2xl border border-[var(--theme-warning-border)] bg-[var(--theme-warning-bg)] px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 text-sm font-extrabold text-[var(--theme-warning-text)]">
                        <span>{SECTION_TITLES[section.id]} هنوز قفل است</span>
                        <Lock className="h-4 w-4" />
                      </div>
                      <p className="mt-2 text-sm leading-7 text-[var(--text-body)]">{lockedAccess.info}</p>
                      <button
                        type="button"
                        onClick={() => setLockedDialogSection(section.id)}
                        className="mt-3 rounded-xl border border-[var(--theme-warning-border)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--theme-warning-text)] transition hover:bg-[var(--surface-soft)]"
                      >
                        مشاهده پیش‌نیازها
                      </button>
                    </div>
                  ) : (
                    section.render()
                  )}
                </div>
              </section>
              {section.id === 'financial' ? <div id="contract-financial-line-sections-root" className="space-y-6" /> : null}
            </Fragment>
          );
        })}
      </div>

      {pendingLeave ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm" onClick={() => setPendingLeave(null)}>
          <div
            className="w-full max-w-xl overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--surface)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-color)] bg-[var(--surface-soft)] px-5 py-4">
              <div>
                <div className="flex items-center gap-2 text-[var(--text-strong)]">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[var(--theme-warning-border)] bg-[var(--theme-warning-bg)] text-[var(--theme-warning-text)]">
                    <AlertCircle className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-extrabold">خروج از صفحه قرارداد</h3>
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
              {leaveSaveError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{leaveSaveError}</div>
              ) : null}

              <div className="rounded-2xl border border-[var(--theme-warning-border)] bg-[var(--theme-warning-bg)] px-4 py-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-sm font-extrabold text-[var(--theme-warning-text)]">تغییرات ذخیره‌نشده</div>
                  {leaveSaving ? <div className="text-xs font-bold text-[var(--theme-warning-text)]">در حال ذخیره…</div> : null}
                </div>
                <div className="grid gap-2">
                  {leaveIssues.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--surface)] px-3 py-2 text-sm">
                      <span className="flex items-center gap-2 font-bold text-[var(--text-body)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--theme-warning-text)]" />
                        {item.title}
                      </span>
                      <span className="rounded-full border border-[var(--theme-warning-border)] bg-[var(--theme-warning-bg)] px-2.5 py-1 text-xs font-bold text-[var(--theme-warning-text)]">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-nowrap justify-end gap-2 border-t border-[var(--border-color)] px-5 py-4">
              <button
                type="button"
                onClick={() => setPendingLeave(null)}
                disabled={leaveSaving}
                className="whitespace-nowrap rounded-lg border border-[var(--border-color)] px-3 py-2 text-xs font-bold text-[var(--text-body)] transition-colors hover:bg-[var(--surface-soft)]"
              >
                ماندن در صفحه
              </button>
              {leaveIssues.length ? (
                <button
                  type="button"
                  onClick={saveDirtyThenLeave}
                  disabled={leaveSaving}
                  className="whitespace-nowrap rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-60"
                >
                  {leaveSaving ? (
                    <span className="ml-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-700/25 border-t-emerald-700" />
                  ) : null}
                  خروج و ذخیره تغییرات
                </button>
              ) : null}
              <button
                type="button"
                onClick={continueContractLeave}
                disabled={leaveSaving}
                className="whitespace-nowrap rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100"
              >
                خروج بدون ذخیره تغییرات
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

      <ContractDraftPreviewDialog
        open={previewDialogOpen}
        draftId={getActiveDraftId()}
        onClose={() => setPreviewDialogOpen(false)}
      />
    </div>
  );
}
