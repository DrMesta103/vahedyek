import { PartySide } from '@/lib/prisma-client';
import type {
  ContractDiscountsData,
  ContractFinancialData,
  ContractPartiesData,
  ContractPenaltiesData,
  ContractSubjectData,
  ContractTerminationData,
} from '../types/contract';
import {
  validateDiscountsStep,
  validateFinancialStep,
  validatePenaltiesStep,
  validateStep1,
  validateStep2,
  validateTerminationStep,
} from './contractValidation';

export type DraftApprovalSectionId =
  | 'subject'
  | 'parties'
  | 'financial'
  | 'penalties'
  | 'discounts'
  | 'interest'
  | 'forgiveness'
  | 'termination'
  | 'extraCosts'
  | 'technicalSpecs'
  | 'contractAttachments';

export type DraftApprovalBlocker = {
  sectionId: DraftApprovalSectionId;
  title: string;
  detail: string;
};

type DraftReadinessInput = {
  subject?: unknown;
  parties?: unknown;
  financial?: unknown;
  penalties?: unknown;
  discounts?: unknown;
  terminationRules?: unknown;
  extraCosts?: unknown;
  technicalSpecs?: unknown;
  attachments?: unknown;
};

const SECTION_TITLES: Record<DraftApprovalSectionId, string> = {
  subject: 'موضوع قرارداد',
  parties: 'طرفین',
  financial: 'اطلاعات مالی',
  penalties: 'جریمه‌ها',
  discounts: 'تخفیف‌ها',
  interest: 'سود دریافتنی',
  forgiveness: 'بخشودگی',
  termination: 'فسخ خریدار',
  extraCosts: 'هزینه‌های جانبی قرارداد',
  technicalSpecs: 'مشخصات فنی پروژه',
  contractAttachments: 'پیوست‌های قرارداد',
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function summarizeValidationErrors(errors: Record<string, string>, fieldLabels: Record<string, string>, fallbackMessage: string) {
  const missingRequiredLabels = unique(
    Object.entries(errors)
      .filter(([, message]) => message === 'این فیلد الزامی است.')
      .map(([field]) => fieldLabels[field])
      .filter(Boolean),
  );

  const otherMessages = unique(
    Object.entries(errors)
      .filter(([, message]) => message !== 'این فیلد الزامی است.')
      .map(([, message]) => message),
  );

  const chunks: string[] = [];
  if (missingRequiredLabels.length === 1) {
    chunks.push(`تکمیل فیلد «${missingRequiredLabels[0]}» الزامی است.`);
  } else if (missingRequiredLabels.length > 1) {
    chunks.push(`چند فیلد الزامی تکمیل نشده‌اند: ${missingRequiredLabels.map((label) => `«${label}»`).join('، ')}.`);
  }

  if (otherMessages.length > 0) {
    chunks.push(otherMessages[0]);
  }

  return chunks.join(' ') || fallbackMessage;
}

function buildBlocker(sectionId: DraftApprovalSectionId, detail: string): DraftApprovalBlocker {
  return { sectionId, title: SECTION_TITLES[sectionId], detail };
}

const SUBJECT_FIELD_LABELS: Record<string, string> = {
  contractType: 'نوع قرارداد',
  contractDate: 'تاریخ قرارداد',
  contractNumber: 'شماره قرارداد',
  deliveryDate: 'تاریخ تحویل',
  blockId: 'بلوک',
  unitId: 'واحد',
  'contractor.employeeId': 'شناسه کارمند',
  'contractor.formerFirstName': 'نام همکار سابق',
  'contractor.formerLastName': 'نام خانوادگی همکار سابق',
};

const PARTIES_FIELD_LABELS: Record<string, string> = {
  partyOne: 'طرف اول',
  partyTwo: 'طرف دوم',
  partyTwoShares: 'سهم طرف دوم',
  shares: 'سهم‌ها',
};

const FINANCIAL_FIELD_LABELS: Record<string, string> = {
  totalArea: 'متراژ کل',
  pricePerMeter: 'قیمت هر متر',
  parkingPricePerMeter: 'قیمت هر متر پارکینگ',
  storagePricePerMeter: 'قیمت هر متر انبار',
  fixedTotalAmount: 'مبلغ کل',
  parkingFixedAmount: 'مبلغ پارکینگ',
  storageFixedAmount: 'مبلغ انبار',
  categories: 'دسته‌های مالی',
  dueItems: 'آیتم‌های سررسید',
};

const TERMINATION_FIELD_LABELS: Record<string, string> = {
  'termination.partyEngagement': 'درگیری طرفین',
};

function getSubjectBlocker(subject?: unknown) {
  const validation = validateStep1(subject ?? ({} as Partial<ContractSubjectData>));
  if (validation.valid) return null;
  return buildBlocker(
    'subject',
    summarizeValidationErrors(validation.errors, SUBJECT_FIELD_LABELS, 'بخش موضوع قرارداد هنوز کامل نشده است.'),
  );
}

function getPartiesBlocker(parties?: unknown) {
  if (!parties) {
    return buildBlocker('parties', 'بخش طرفین هنوز کامل نشده است.');
  }

  if (typeof parties === 'object' && parties !== null && ('partyOne' in parties || 'partyTwo' in parties)) {
    const validation = validateStep2(parties as Partial<ContractPartiesData>);
    if (validation.valid) return null;
    return buildBlocker('parties', summarizeValidationErrors(validation.errors, PARTIES_FIELD_LABELS, 'بخش طرفین هنوز کامل نشده است.'));
  }

  const membersSource =
    typeof parties === 'object' && parties !== null
      ? (parties as { members?: Array<{ side: PartySide }> }).members
      : undefined;
  const members = Array.isArray(membersSource)
    ? (membersSource ?? [])
    : [];
  const hasPartyOne = members.some((member) => member.side === PartySide.party_one);
  const hasPartyTwo = members.some((member) => member.side === PartySide.party_two);
  if (hasPartyOne && hasPartyTwo) return null;
  const missing = [!hasPartyOne ? 'طرف اول' : null, !hasPartyTwo ? 'طرف دوم' : null].filter(Boolean).join(' و ');
  return buildBlocker('parties', `بخش ${missing} هنوز تکمیل نشده است.`);
}

function getFinancialBlocker(financial?: unknown) {
  const validation = validateFinancialStep(financial ?? ({} as Partial<ContractFinancialData>));
  if (validation.valid) return null;
  return buildBlocker('financial', summarizeValidationErrors(validation.errors, FINANCIAL_FIELD_LABELS, 'بخش مالی هنوز کامل نشده است.'));
}

function getPenaltiesBlocker(penalties?: unknown) {
  if (!penalties) {
    return buildBlocker('penalties', 'بخش جریمه‌ها هنوز کامل نشده است.');
  }
  const validation = validatePenaltiesStep(penalties);
  if (validation.valid) return null;
  return buildBlocker('penalties', summarizeValidationErrors(validation.errors, {}, 'بخش جریمه‌ها هنوز کامل نشده است.'));
}

function getDiscountsBlocker(discounts?: unknown) {
  if (!discounts) {
    return null;
  }
  const validation = validateDiscountsStep(discounts as Partial<ContractDiscountsData>);
  if (validation.valid) return null;
  return buildBlocker('discounts', summarizeValidationErrors(validation.errors, {}, 'بخش تخفیف‌ها هنوز کامل نشده است.'));
}

function getTerminationBlocker(terminationRules?: unknown) {
  if (!terminationRules) {
    return buildBlocker('termination', 'بخش فسخ خریدار هنوز کامل نشده است.');
  }
  const validation = validateTerminationStep(terminationRules ?? ({} as Partial<ContractTerminationData>));
  if (validation.valid) return null;
  return buildBlocker(
    'termination',
    summarizeValidationErrors(validation.errors, TERMINATION_FIELD_LABELS, 'بخش فسخ خریدار هنوز کامل نشده است.'),
  );
}

function getOptionalSectionBlocker(sectionId: DraftApprovalSectionId, present: unknown, detail: string) {
  return present ? null : buildBlocker(sectionId, detail);
}

export function getDraftApprovalBlockers(draft: DraftReadinessInput): DraftApprovalBlocker[] {
  const blockers: Array<DraftApprovalBlocker | null> = [
    getSubjectBlocker(draft.subject),
    getPartiesBlocker(draft.parties),
    getFinancialBlocker(draft.financial),
    getPenaltiesBlocker(draft.penalties),
    getDiscountsBlocker(draft.discounts),
    getTerminationBlocker(draft.terminationRules),
    getOptionalSectionBlocker('technicalSpecs', draft.technicalSpecs, 'بخش مشخصات فنی پروژه هنوز تکمیل نشده است.'),
    getOptionalSectionBlocker('contractAttachments', draft.attachments, 'بخش پیوست‌های قرارداد هنوز تکمیل نشده است.'),
  ];

  return blockers.filter((item): item is DraftApprovalBlocker => Boolean(item));
}

/** بررسی می‌کند آیا پیش‌نویس برای عبور از گیت تأیید آماده است یا نه. */
export function isDraftReadyForApprovalGate(draft: DraftReadinessInput): boolean {
  return getDraftApprovalBlockers(draft).length === 0;
}
