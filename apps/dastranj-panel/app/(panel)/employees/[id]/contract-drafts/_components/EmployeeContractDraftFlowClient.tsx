'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  CircleAlert,
  Edit3,
  Eye,
  FileText,
  Gift,
  Info,
  Scale,
  Layers3,
  LockKeyhole,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserRound,
  Wallet,
  X,
} from 'lucide-react';
import { PersianDatePicker } from '@repo/ui';
import { CardMenu } from '../../../../../components/CardMenu';
import { ConfirmDialog } from '../../../../../components/ConfirmDialog';
import { AttachmentManager } from '../../../../../components/AttachmentManager';
import { DraftShowcaseField, DraftShowcaseFieldBadge, DraftShowcaseFields } from '../../../../../components/DraftShowcaseField';
import { MinimalScroll } from '../../../../../components/MinimalScroll';
import { CalculationRulesBadges, CalcRulesDiffBadge, CalcRulesEditButton, CalculationRulesDialog } from '../../../../../components/CalculationRulesChips';
import { PanelToggleRow } from '../../../../../components/PanelToggleRow';
import { PanelFormModal, PanelFormModalActions } from '../../../../../components/PanelFormModal';
import { VariableAmountTitlePicker } from '../../../../../components/VariableAmountTitlePicker';
import { UnsavedChangesDialog, useUnsavedLeaveGuard } from '../../../../../components/UnsavedChangesGuard';
import { formatPersianYmd, getPersianPartsFromDate, parsePersianYmd, persianToDate } from '../../../../../lib/calendar-dates';
import { normalizePersianDateInput } from '../../../../../lib/calendar-events';
import { formatFaNumber, formatPersianJalaliDate, toPersianDigits } from '../../../../../lib/format-fa';
import { formatPersianDate } from '../../../../../lib/format-date';
import { CONTRACT_DRAFT_TEMPLATES_STORAGE_KEY, normalizeContractDraftTemplate, type ContractDraftTemplate } from '../../../../../lib/contract-draft-templates';
import {
  DEFAULT_PAYROLL_SETTINGS,
  DEFAULT_FIXED_BENEFIT_RULES,
  DEFAULT_OPTIONAL_ADDITION_RULES,
  DEFAULT_OPTIONAL_DEDUCTION_RULES,
  getActiveTenantStorageId,
  getPayrollSettingsStorageKey,
  normalizePayrollSettings,
  calculatePayrollValues,
  calculateVariableAmount,
  compareValues,
  validatePayrollStep,
  VARIABLE_TITLES,
  type CalculationRules,
  type PayrollSettings,
} from '../../../../../lib/payroll-business-settings';
import {
  BusinessOwnershipProfileEditor,
  createOwnershipEditorDefaults,
} from '../../../../account/_components/BusinessOwnershipProfileEditor';
import { DEFAULT_PROFILE_META, createDefaultProfileStore, type ProfileMeta, type ProfileStore } from '../../../../account/profile.types';
import { fetchProfilePayload, persistProfilePayload } from '../../../../account/profileStorage';
import { EmployeeSupplementalProfileEditor } from '../../_components/EmployeeSupplementalProfileEditor';
import { EmployeeSupplementalProfileView } from '../../_components/EmployeeSupplementalProfileView';
import { EmployeeContractSubjectStep } from './EmployeeContractSubjectStep';
import { EmployeeContractFinancialStep } from './EmployeeContractFinancialStep';
import {
  buildEmployeeDraftCompensationDefaults,
  getDraftCompensationFingerprint,
  mergeEmployeeDraftPaymentType,
  resolveEmployeeDraftCompensation,
  syncNightWorkTimesFromTenant,
} from '../../../../../lib/employee-contract-compensation';
import {
  EmployeeContractAttachmentsStep,
  EmployeeContractCommitmentsStep,
  EmployeeContractLeaveStep,
  EmployeeContractMissionStep,
  EmployeeContractWorkTimePayStep,
  EmployeeMissionRuleDialog,
} from './employee-contract-steps';
import { formatDurationMinutes, formatMoneyRial } from '../../../../../lib/contract-financial-calculations';
import { formatSubjectResponsibilities, parseSubjectResponsibilities } from '../../../../../lib/contract-subject-options';
import { computeSupplementalCompleteness } from '../../../../../lib/employee-supplemental-fields';
import {
  buildTemplateSnapshot,
  createInitialEmployeeContractDraft,
  EMPLOYEE_BENEFIT_KEYS,
  EMPLOYEE_CONTRACT_BENEFIT_DESCRIPTIONS,
  EMPLOYEE_CONTRACT_BENEFIT_LABELS,
  getEmployeeDraftSteps,
  getEmployeeDraftsByEmployeeId,
  getEmployeeDraftStorageKey,
  getEmployeeSupplementalStorageKey,
  getDefaultEmployeeSupplementalProfile,
  normalizeEmployeeSupplementalProfile,
  readBaseSettingsByTemplate,
  readEmployeeDrafts,
  readEmployeeSupplementalProfiles,
  persistEmployeeDrafts,
  persistEmployeeSupplementalProfiles,
  type EmployeeBenefitPaymentPeriod,
  type EmployeeContractDraft,
  type EmployeeContractDraftStepId,
  type EmployeeContractDraftTemplateChoice,
  type EmployeeContractDraftUsageType,
  type EmployeeSupplementalProfile,
  type EmployeePaymentCycle,
  type EmployeeMissionRule,
} from '../../../../../lib/employee-contract-drafts';
import type { VariableTemplateItem } from '../../../../../lib/contract-draft-templates';
type EmployeeDraftEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string | null;
  mobile1: string | null;
  mobile2: string | null;
  email: string | null;
  personnelCode: string | null;
  avatarUrl: string | null;
  identityPhotoUrl: string | null;
  maritalStatus: string;
  childrenCount: number;
  canEditIdentityPhoto: boolean;
  createdAt: string;
  organizationUnits?: Array<{ id: string; title: string }>;
  workGroups?: Array<{ id: string; title: string }>;
  bankAccountsCount?: number;
  guaranteeCount?: number;
};

type BusinessProfile = {
  ownershipKind?: 'legal' | 'natural';
  companyName?: string | null;
  brandName?: string | null;
  legalName?: string | null;
  registrationNumber?: string | null;
  nationalId?: string | null;
  taxFileNumber?: string | null;
  economicCode?: string | null;
  ownerName?: string | null;
  contactEmail?: string | null;
  phone?: string | null;
  address?: string | null;
};

type AccountProfileApiResponse = {
  store?: {
    ownership?: {
      ownershipKind?: 'legal' | 'natural';
      companyName?: string;
      brandName?: string;
      legalName?: string;
      registrationNumber?: string;
      nationalId?: string;
      taxFileNumber?: string;
      economicCode?: string;
    };
  };
  meta?: {
    owner?: {
      fullName?: string;
      mobile?: string | null;
      email?: string | null;
    };
  };
};

function normalizeDisplay(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '';
}

function buildBusinessProfileFromPayload(store: ProfileStore, meta: ProfileMeta): BusinessProfile {
  const ownership = store.ownership;
  const owner = meta.owner;

  return {
    ownershipKind: ownership.ownershipKind,
    companyName: ownership.companyName || null,
    brandName: ownership.brandName || null,
    legalName: ownership.legalName || null,
    registrationNumber: ownership.registrationNumber || null,
    nationalId: ownership.nationalId || null,
    taxFileNumber: ownership.taxFileNumber || null,
    economicCode: ownership.economicCode || null,
    ownerName: owner.fullName || null,
    contactEmail: owner.email || null,
    phone: owner.mobile || null,
    address: null,
  };
}

function buildBusinessProfileFromApi(payload: AccountProfileApiResponse | null | undefined): BusinessProfile | null {
  const ownership = payload?.store?.ownership;
  const owner = payload?.meta?.owner;
  if (!ownership && !owner) return null;

  const store = createDefaultProfileStore();
  if (ownership) {
    store.ownership = {
      ...store.ownership,
      ownershipKind: ownership.ownershipKind === 'natural' ? 'natural' : 'legal',
      companyName: ownership.companyName ?? store.ownership.companyName,
      brandName: ownership.brandName ?? store.ownership.brandName,
      legalName: ownership.legalName ?? store.ownership.legalName,
      registrationNumber: ownership.registrationNumber ?? store.ownership.registrationNumber,
      nationalId: ownership.nationalId ?? store.ownership.nationalId,
      taxFileNumber: ownership.taxFileNumber ?? store.ownership.taxFileNumber,
      economicCode: ownership.economicCode ?? store.ownership.economicCode,
    };
  }

  const meta: ProfileMeta = {
    ...DEFAULT_PROFILE_META,
    owner: {
      fullName: owner?.fullName ?? DEFAULT_PROFILE_META.owner.fullName,
      mobile: owner?.mobile ?? DEFAULT_PROFILE_META.owner.mobile,
      email: owner?.email ?? DEFAULT_PROFILE_META.owner.email,
    },
  };

  return buildBusinessProfileFromPayload(store, meta);
}

function displayStatValue(value: string) {
  return value || 'ثبت نشده';
}

type ContractPartyStat = {
  label: string;
  value: string;
};

type ContractPartyDisplay = {
  kind: 'legal' | 'natural';
  hint: string;
  identityLabel: string;
  identityTitle: string;
  identitySubtitle?: string;
  stats: ContractPartyStat[];
  statsSecondary?: ContractPartyStat[];
  missing: boolean;
};

function buildBusinessPartyFirstDisplay(profile: BusinessProfile | null | undefined): ContractPartyDisplay | null {
  if (!profile) return null;

  const ownershipKind = profile.ownershipKind ?? 'legal';
  const ownerName = normalizeDisplay(profile.ownerName);
  const phoneOrEmail = normalizeDisplay(profile.phone) || normalizeDisplay(profile.contactEmail);

  if (ownershipKind === 'natural') {
    return {
      kind: 'natural',
      hint: 'طرف اول قرارداد، مالک کسب‌وکار (شخص حقیقی) است که قرارداد را امضا می‌کند.',
      identityLabel: 'نام و نام خانوادگی',
      identityTitle: ownerName || 'مالک کسب‌وکار ثبت نشده',
      identitySubtitle: 'شخص حقیقی',
      stats: [
        { label: 'نام و نام خانوادگی', value: displayStatValue(ownerName) },
        { label: 'راه ارتباطی', value: displayStatValue(phoneOrEmail) },
        { label: 'نوع مالکیت', value: 'شخص حقیقی' },
      ],
      missing: !ownerName || !phoneOrEmail,
    };
  }

  const brandName = normalizeDisplay(profile.brandName);
  const companyName =
    normalizeDisplay(profile.companyName) || normalizeDisplay(profile.legalName) || 'شرکت ثبت نشده';
  const nationalId = normalizeDisplay(profile.nationalId);
  const economicCode = normalizeDisplay(profile.economicCode);

  return {
    kind: 'legal',
    hint: 'طرف اول قرارداد، سازمان یا شرکت کارفرما است که قرارداد را امضا می‌کند.',
    identityLabel: 'نام تجاری شرکت',
    identityTitle: brandName || companyName,
    stats: [
      { label: 'شناسه ملی', value: displayStatValue(nationalId) },
      { label: 'کد اقتصادی', value: displayStatValue(economicCode) },
      { label: 'نماینده قانونی', value: displayStatValue(ownerName) },
    ],
    missing: !nationalId || !economicCode || !ownerName,
  };
}

function ContractFirstPartyCard({
  profile,
  onEdit,
}: {
  profile: BusinessProfile | null | undefined;
  onEdit?: () => void;
}) {
  const display = buildBusinessPartyFirstDisplay(profile);
  const IdentityIcon = display?.kind === 'natural' ? UserRound : Building2;
  const showEdit = Boolean(display?.missing && onEdit);

  return (
    <div className="business-payroll-subcard contract-party-card">
      <div className="contract-party-card-toolbar">
        <div className="business-draft-section-title">
          <h3>طرف اول قرارداد</h3>
          <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">کارفرما</span>
        </div>
        {showEdit ? (
          <button type="button" className="contract-party-card-edit" aria-label="ویرایش اطلاعات کارفرما" onClick={onEdit}>
            <Pencil className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>

      {display ? (
        <>
          <p className="contract-party-card-hint">
            <Info className="h-3.5 w-3.5" aria-hidden />
            <span>{display.hint}</span>
          </p>

          <div className="contract-party-card-identity">
            <span className="contract-party-card-avatar" aria-hidden>
              <IdentityIcon className="h-5 w-5" />
            </span>
            <div className="contract-party-card-identity-copy">
              <div className="contract-party-card-identity-line">
                <span className="contract-party-stat-label">{display.identityLabel}:</span>
                <strong>{display.identityTitle}</strong>
              </div>
              {display.identitySubtitle ? <span>{display.identitySubtitle}</span> : null}
            </div>
          </div>

          <div className="contract-party-card-stats">
            {display.stats.map((stat) => (
              <div key={stat.label} className="contract-party-stat">
                <span className="contract-party-stat-label">{stat.label}</span>
                <strong className="contract-party-stat-value">{stat.value}</strong>
              </div>
            ))}
          </div>

          {display.statsSecondary?.length ? (
            <div className="contract-party-card-stats is-secondary">
              {display.statsSecondary.map((stat) => (
                <div key={stat.label} className="contract-party-stat">
                  <span className="contract-party-stat-label">{stat.label}</span>
                  <strong className="contract-party-stat-value">{stat.value}</strong>
                </div>
              ))}
            </div>
          ) : null}

          {display.missing ? (
            <div className="contract-party-card-footer">{fieldBadge('اطلاعات کارفرما ناقص است', 'warning')}</div>
          ) : null}
        </>
      ) : (
        <div className="contract-party-card-footer">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {fieldBadge('اطلاعات کارفرما ناقص است', 'warning')}
            {fieldBadge('پروفایل کسب و کار یافت نشد', 'warning')}
          </div>
        </div>
      )}
    </div>
  );
}

function normalizeDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632));
}

function parseNumber(value: string) {
  const normalized = normalizeDigits(value).replace(/,/g, '').replace(/[^\d.]/g, '');
  return normalized ? Number(normalized) : Number.NaN;
}

function money(value: number) {
  return `${formatFaNumber(Math.round(value))} ریال`;
}

function moneyInput(value: number) {
  return Number.isFinite(value) ? formatFaNumber(Math.round(value)) : '';
}

function daysBetween(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return Number.NaN;
  return Math.round((endDate.getTime() - startDate.getTime()) / 86400000);
}

function durationMonthsBetween(start: string, end: string) {
  const days = daysBetween(start, end);
  if (!Number.isFinite(days) || days <= 0) return 0;
  return Math.max(1, Math.round(days / 30));
}

function addMonths(isoDate: string, months: number) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function formatDateInput(value: string) {
  return value ? value.slice(0, 10) : '';
}

function isoDateToPickerValue(iso: string) {
  const trimmed = iso.trim().slice(0, 10);
  if (!trimmed) return '';
  const parsed = new Date(`${trimmed}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return '';
  return formatPersianYmd(getPersianPartsFromDate(parsed));
}

function pickerValueToIsoDate(persian: string) {
  const parts = parsePersianYmd(normalizePersianDateInput(persian));
  if (!parts) return '';
  try {
    return persianToDate(parts).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function formatRegistrationNumberDisplay(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '—';
  return trimmed.replace(/\d/g, (digit) => toPersianDigits(digit));
}

function getContractNumberSortIndex(value: string) {
  const match = value.match(/(\d+)\s*$/);
  return match ? Number(match[1]) : 0;
}

function getRegistrationNumberPlaceholder(drafts: EmployeeContractDraft[], currentDraftId: string) {
  const numbers = [
    ...new Set(
      drafts
        .filter((draft) => draft.id !== currentDraftId)
        .flatMap((draft) => [draft.timing.registrationNumber.trim(), draft.contractNumber.trim()])
        .filter(Boolean),
    ),
  ];

  if (numbers.length === 0) {
    return {
      placeholder: toPersianDigits('1'),
      hint: 'این اولین قرارداد است؛ شماره پیشنهادی ۱',
    };
  }

  const previous = [...numbers].sort((left, right) => getContractNumberSortIndex(left) - getContractNumberSortIndex(right)).at(-1)!;
  const previousDisplay = formatRegistrationNumberDisplay(previous);

  return {
    placeholder: `شماره قرارداد قبلی: ${previousDisplay}`,
    hint: 'شماره قرارداد قبلی',
  };
}

function displayValue(value: string | number | null | undefined) {
  if (typeof value === 'number') return value.toLocaleString('fa-IR');
  const trimmed = String(value ?? '').trim();
  return trimmed ? trimmed : 'ثبت نشده';
}

function usageLabel(value: EmployeeContractDraftUsageType) {
  return value === 'attendance_only' ? 'فقط تردد' : 'تردد و حقوق و دستمزد';
}

function draftStatusLabel(status: EmployeeContractDraft['status']) {
  if (status === 'completed') return 'تکمیل شده';
  if (status === 'in_progress') return 'در حال تکمیل';
  return 'پیش‌نویس';
}

function fieldBadge(text: string, tone: 'success' | 'warning' | 'muted' = 'muted') {
  const styles =
    tone === 'success'
      ? { border: '1px solid rgba(34,197,94,0.32)', background: 'rgba(34,197,94,0.12)', color: '#dcfce7' }
      : tone === 'warning'
        ? { border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.12)', color: '#fecdd3' }
        : { border: '1px solid rgba(148,163,184,0.28)', background: 'rgba(148,163,184,0.12)', color: '#dbeafe' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        padding: '4px 10px',
        fontSize: 10,
        fontWeight: 900,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...styles,
      }}
    >
      {text}
    </span>
  );
}

function differenceBadge(text: string, tooltip: string, tone: 'diff' | 'warning' | 'success' = 'diff') {
  if (tone === 'diff') {
    return (
      <span className="business-payroll-difference-badge" title={tooltip}>
        <ShieldCheck className="h-3.5 w-3.5" />
        {text}
      </span>
    );
  }
  return fieldBadge(text, tone === 'warning' ? 'warning' : 'success');
}

function readTemplates(): ContractDraftTemplate[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(CONTRACT_DRAFT_TEMPLATES_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown[];
    return Array.isArray(parsed) ? parsed.map(normalizeContractDraftTemplate).filter(Boolean) as ContractDraftTemplate[] : [];
  } catch {
    window.localStorage.removeItem(CONTRACT_DRAFT_TEMPLATES_STORAGE_KEY);
    return [];
  }
}

function readSettingsForTemplate(template: ContractDraftTemplate | null | undefined) {
  if (!template || typeof window === 'undefined') return DEFAULT_PAYROLL_SETTINGS;
  const raw = window.localStorage.getItem(getPayrollSettingsStorageKey(template.baseSettingsYear, getActiveTenantStorageId()));
  if (!raw) return DEFAULT_PAYROLL_SETTINGS;
  try {
    return normalizePayrollSettings(JSON.parse(raw));
  } catch {
    return DEFAULT_PAYROLL_SETTINGS;
  }
}

function groupByUsage(templates: ContractDraftTemplate[], usageType: EmployeeContractDraftUsageType) {
  return templates.filter((template) => template.usageType === usageType);
}

function templateChoices(templates: ContractDraftTemplate[]): EmployeeContractDraftTemplateChoice[] {
  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    usageType: template.usageType,
    baseSettingsYear: template.baseSettingsYear,
  }));
}

function computeEmployeeCompleteness(employee: EmployeeDraftEmployee, supplemental: EmployeeSupplementalProfile) {
  return computeSupplementalCompleteness(supplemental, {
    nationalId: employee.nationalId,
    maritalStatus: employee.maritalStatus,
    childrenCount: employee.childrenCount,
  });
}

function countDifferences(draft: EmployeeContractDraft, baseSettings: PayrollSettings, template: ContractDraftTemplate | null) {
  const resolved = resolveEmployeeDraftCompensation(draft, baseSettings, template);
  const snapshot = resolved.templateSnapshot;
  if (!snapshot) return 0;
  let count = 0;
  if (snapshot.classification.contractType && snapshot.classification.contractType !== draft.subject.contractType) count += 1;
  if (snapshot.classification.locationGroup && snapshot.classification.locationGroup !== draft.subject.locationGroup) count += 1;
  if (snapshot.financial.dailyRequiredMinutes !== draft.financial.dailyRequiredMinutes) count += 1;
  if (snapshot.financial.dailyBaseSalary !== draft.financial.dailyBaseSalary) count += 1;
  if (snapshot.insuranceTax.insuranceEnabled !== draft.insuranceTax.insuranceEnabled) count += 1;
  if (snapshot.insuranceTax.taxEnabled !== draft.insuranceTax.taxEnabled) count += 1;
  if (snapshot.insuranceTax.taxPayer !== draft.insuranceTax.taxPayer) count += 1;
  count += EMPLOYEE_BENEFIT_KEYS.filter((key) => {
    const current = draft.benefits[key];
    const templateEnabled = snapshot.benefits[key] > 0;
    return templateEnabled !== current.enabled || (current.enabled && snapshot.benefits[key] !== current.amount);
  }).length;
  count += draft.insuranceTax.taxBrackets.filter((bracket) => {
    const base = snapshot.insuranceTax.taxBrackets.find((item) => item.id === bracket.id);
    return !base || base.from !== bracket.from || base.to !== bracket.to || base.percent !== bracket.percent;
  }).length;
  const benefitsEndBase = snapshot.benefitsEnd ?? buildEmployeeDraftCompensationDefaults(snapshot, baseSettings).benefitsEnd;
  if (resolved.benefitsEnd.eidBonus.amount !== benefitsEndBase.eidBonus.amount) count += 1;
  if (resolved.benefitsEnd.eidBonus.period !== benefitsEndBase.eidBonus.period) count += 1;
  if (resolved.benefitsEnd.endOfService.enabled !== benefitsEndBase.endOfService.enabled) count += 1;
  if (resolved.benefitsEnd.endOfService.severancePaymentMethod !== benefitsEndBase.endOfService.severancePaymentMethod) count += 1;
  if (resolved.benefitsEnd.endOfService.finalSettlementEnabled !== benefitsEndBase.endOfService.finalSettlementEnabled) count += 1;
  if (JSON.stringify(resolved.paymentSchedule) !== JSON.stringify(snapshot.paymentSchedule ?? snapshot.paymentType)) count += 1;
  const variablePaymentsBase = snapshot.variablePayments ?? buildEmployeeDraftCompensationDefaults(snapshot, baseSettings).variablePayments;
  if (resolved.variablePayments.enabled !== variablePaymentsBase.enabled) count += 1;
  const compareVariableItem = (current: VariableTemplateItem, base: VariableTemplateItem | undefined) => {
    if (!base) return 1;
    let itemCount = 0;
    if (current.title !== base.title) itemCount += 1;
    if (current.type !== base.type) itemCount += 1;
    if (current.method !== base.method) itemCount += 1;
    if (current.method === 'fixed' && current.amount !== base.amount) itemCount += 1;
    if (current.method === 'percentage' && current.percent !== base.percent) itemCount += 1;
    if (current.method === 'percentage' && current.base !== base.base) itemCount += 1;
    if (JSON.stringify(current.calculationRules) !== JSON.stringify(base.calculationRules)) itemCount += 1;
    return itemCount;
  };
  count += resolved.variablePayments.additions.reduce((acc, item) => {
    const baseItem = variablePaymentsBase.additions.find((entry) => entry.id === item.id);
    return acc + compareVariableItem(item, baseItem);
  }, 0);
  count += resolved.variablePayments.deductions.reduce((acc, item) => {
    const baseItem = variablePaymentsBase.deductions.find((entry) => entry.id === item.id);
    return acc + compareVariableItem(item, baseItem);
  }, 0);
  count += variablePaymentsBase.additions.filter((baseItem) => !resolved.variablePayments.additions.some((item) => item.id === baseItem.id)).length;
  count += variablePaymentsBase.deductions.filter((baseItem) => !resolved.variablePayments.deductions.some((item) => item.id === baseItem.id)).length;
  if (snapshot.workTimePayRules) {
    const templateRules = syncNightWorkTimesFromTenant(snapshot.workTimePayRules, baseSettings);
    const currentRules = syncNightWorkTimesFromTenant(resolved.workTimePayRules, baseSettings);
    if (JSON.stringify(currentRules) !== JSON.stringify(templateRules)) count += 1;
  }
  if (snapshot.leave && JSON.stringify(resolved.leave) !== JSON.stringify(snapshot.leave)) count += 1;
  const missionBase = snapshot.mission ?? buildEmployeeDraftCompensationDefaults(snapshot, baseSettings).mission;
  if (resolved.mission.enabled !== missionBase.enabled) count += 1;
  count += resolved.mission.rules.filter((rule) => {
    const baseRule = missionBase.rules.find((item) => item.id === rule.id);
    return !baseRule || JSON.stringify(baseRule) !== JSON.stringify(rule);
  }).length;
  count += missionBase.rules.filter((baseRule) => !resolved.mission.rules.some((rule) => rule.id === baseRule.id)).length;
  const commitmentsBase = snapshot.specialCommitments ?? { selected: [], attachments: [] };
  const currentCommitments = resolved.specialCommitments;
  if (JSON.stringify([...currentCommitments.selected].sort()) !== JSON.stringify([...commitmentsBase.selected].sort())) count += 1;
  if (currentCommitments.attachments.length !== commitmentsBase.attachments.length) count += 1;
  const attachmentsBase = snapshot.attachments ?? { requiredDocuments: {}, files: [] };
  const currentAttachments = resolved.attachments;
  if (JSON.stringify(currentAttachments.requiredDocuments) !== JSON.stringify(attachmentsBase.requiredDocuments)) count += 1;
  if (currentAttachments.files.length !== attachmentsBase.files.length) count += 1;
  return count;
}

const DEFAULT_EMPLOYEE_PAYMENT_TYPE = 'پرداخت بر اساس دوره‌های زمانی';

const EMPLOYEE_BENEFIT_END_PAYMENT_PERIODS: Array<{ value: EmployeeBenefitPaymentPeriod; label: string }> = [
  { value: 'monthly', label: 'ماهیانه' },
  { value: 'quarterly', label: 'سه‌ماهه' },
  { value: 'semiAnnual', label: 'شش‌ماهه' },
  { value: 'annual', label: 'سالانه' },
  { value: 'none', label: 'بدون عیدی' },
];

const EMPLOYEE_PAYMENT_MAIN_OPTIONS = [
  { value: DEFAULT_EMPLOYEE_PAYMENT_TYPE, label: DEFAULT_EMPLOYEE_PAYMENT_TYPE, enabled: true },
  { value: 'پرداخت بر اساس نوع شغل و فعالیت', label: 'پرداخت بر اساس نوع شغل و فعالیت', enabled: false },
  { value: 'پرداخت ترکیبی و روش‌های خاص', label: 'پرداخت ترکیبی و روش‌های خاص', enabled: false },
] as const;

const EMPLOYEE_PAYMENT_CYCLE_OPTIONS: Array<{ value: EmployeePaymentCycle; label: string }> = [
  { value: 'monthly', label: 'پرداخت ماهانه' },
  { value: 'weekly', label: 'پرداخت هفتگی' },
  { value: 'biweekly', label: 'پرداخت دو هفته یکبار' },
  { value: 'daily', label: 'پرداخت روزانه' },
  { value: 'project', label: 'پرداخت پروژه‌ای' },
  { value: 'seasonal', label: 'پرداخت فصلی' },
];

function createEmployeeVariablePaymentItem(type: 'addition' | 'deduction'): VariableTemplateItem {
  return {
    id: `${type}-${Date.now()}`,
    title: VARIABLE_TITLES[type][0],
    type,
    method: 'fixed',
    amount: 0,
    percent: 0,
    base: 'baseSalary',
    calculationRules: type === 'addition' ? { ...DEFAULT_OPTIONAL_ADDITION_RULES } : { ...DEFAULT_OPTIONAL_DEDUCTION_RULES },
  };
}

function calculateEmployeeVariableAmount(item: VariableTemplateItem, monthlyBaseSalary: number, grossPay: number) {
  return calculateVariableAmount(
    {
      id: item.id,
      title: item.title,
      type: item.type,
      calculationMethod: item.method,
      amount: item.amount,
      percent: item.percent,
      calculationBase: item.base,
      calculationRules: item.calculationRules,
    } as Parameters<typeof calculateVariableAmount>[0],
    monthlyBaseSalary,
    grossPay,
  );
}

function buildSectionTone(filled: boolean) {
  return filled ? 'success' : 'warning';
}

function getProgressTotal(draft: EmployeeContractDraft) {
  return getEmployeeDraftSteps(draft.usageType).length;
}

function getProgressCompleted(draft: EmployeeContractDraft) {
  return getEmployeeDraftSteps(draft.usageType).filter((step) => draft.progress[step.id]?.completed).length;
}

function getSectionTitle(stepId: EmployeeContractDraftStepId, usageType: EmployeeContractDraftUsageType) {
  return getEmployeeDraftSteps(usageType).find((step) => step.id === stepId)?.title ?? '';
}

function getCurrentStepId(draft: EmployeeContractDraft) {
  const steps = getEmployeeDraftSteps(draft.usageType).map((step) => step.id);
  const current = steps.find((step) => draft.progress[step]?.opened && !draft.progress[step]?.completed);
  return current ?? steps[0];
}

function isEligibleForChildAllowance(employee: EmployeeDraftEmployee) {
  return (employee.childrenCount ?? 0) > 0;
}

function isEligibleForMarriageAllowance(employee: EmployeeDraftEmployee, supplemental: EmployeeSupplementalProfile) {
  return employee.maritalStatus === 'married' || supplemental.militaryStatus.includes('متاهل');
}

function isEligibleForSeniorityAllowance(employee: EmployeeDraftEmployee, supplemental: EmployeeSupplementalProfile) {
  const reference = supplemental.firstContractDate || employee.createdAt;
  const firstDate = new Date(reference);
  if (Number.isNaN(firstDate.getTime())) return true;
  const diffYears = (Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return diffYears >= 1;
}

function StepShell({
  title,
  tag,
  description,
  icon,
  titleIcon,
  descriptionInfo,
  children,
}: {
  title: string;
  tag?: string;
  description: string;
  icon?: React.ReactNode;
  titleIcon?: React.ReactNode;
  descriptionInfo?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="business-payroll-subcard">
      <div className="business-draft-section-title contract-timing-step-title-row">
        <h3 className="contract-timing-step-main-title">
          {titleIcon ? <span className="contract-timing-step-title-icon">{titleIcon}</span> : null}
          {title}
        </h3>
        {tag ? (
          <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">
            {icon}
            {tag}
          </span>
        ) : null}
      </div>
      {description ? (
        <p className={`contract-timing-step-lead${descriptionInfo ? ' has-info' : ''}`}>
          {descriptionInfo ? <Info className="h-3.5 w-3.5 contract-timing-step-lead-icon" aria-hidden /> : null}
          <span>{description}</span>
        </p>
      ) : null}
      {children}
    </section>
  );
}

function ContractTimingLegalBadge() {
  return (
    <span className="contract-timing-legal-badge">
      <Scale className="h-3.5 w-3.5" aria-hidden />
      آیین‌نامه حقوقی
    </span>
  );
}

function ContractTimingRegistrationField({
  label,
  value,
  placeholder,
  hint,
  error,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  hint: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="contract-timing-date-field">
      <span className="contract-timing-date-label">
        {label} <em aria-hidden>*</em>
      </span>
      <div className={`contract-timing-date-input contract-timing-text-input${error ? ' has-error' : ''}`}>
        <input
          type="text"
          className="contract-timing-text-control"
          value={value}
          placeholder={placeholder}
          dir="ltr"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <p className="contract-timing-registration-hint">{hint}</p>
      {error ? <em className="contract-timing-field-error">{error}</em> : null}
    </div>
  );
}

function ContractTimingDateField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const pickerValue = isoDateToPickerValue(value);

  return (
    <div className="contract-timing-date-field">
      <span className="contract-timing-date-label">
        {label} <em aria-hidden>*</em>
      </span>
      <div className={`contract-timing-date-input${error ? ' has-error' : ''}`}>
        <PersianDatePicker
          value={pickerValue}
          onChange={(next) => onChange(pickerValueToIsoDate(next))}
          placeholder="۱۴۰۴/۰۱/۰۱"
          className="contract-timing-date-picker-control"
          containerClassName="contract-timing-date-picker"
          calendarIconAriaLabel={`باز کردن تقویم ${label}`}
        />
      </div>
      {error ? <em className="contract-timing-field-error">{error}</em> : null}
    </div>
  );
}

function useDraftStorage(employeeId: string) {
  const [drafts, setDrafts] = useState<EmployeeContractDraft[]>([]);
  const [templates, setTemplates] = useState<ContractDraftTemplate[]>([]);
  const [supplementalProfiles, setSupplementalProfiles] = useState<Record<string, EmployeeSupplementalProfile>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const nextDrafts = getEmployeeDraftsByEmployeeId(readEmployeeDrafts(), employeeId);
    setDrafts(nextDrafts);
    setTemplates(readTemplates());
    setSupplementalProfiles(readEmployeeSupplementalProfiles());
    setLoaded(true);
  }, [employeeId]);

  const persist = (nextDrafts: EmployeeContractDraft[]) => {
    const otherDrafts = readEmployeeDrafts().filter((draft) => draft.employeeId !== employeeId);
    const mergedDrafts = [...otherDrafts, ...nextDrafts];
    setDrafts(getEmployeeDraftsByEmployeeId(mergedDrafts, employeeId));
    persistEmployeeDrafts(mergedDrafts);
  };

  const persistSupp = (profiles: Record<string, EmployeeSupplementalProfile>) => {
    setSupplementalProfiles(profiles);
    persistEmployeeSupplementalProfiles(profiles);
  };

  return { drafts, templates, supplementalProfiles, loaded, persist, persistSupp, setDrafts };
}

function DraftCreationDialog({
  open,
  employee,
  businessProfile,
  drafts,
  templates,
  onClose,
  onCreated,
}: {
  open: boolean;
  employee: EmployeeDraftEmployee;
  businessProfile: BusinessProfile | null;
  drafts: EmployeeContractDraft[];
  templates: ContractDraftTemplate[];
  onClose: () => void;
  onCreated: (draft: EmployeeContractDraft) => void;
}) {
  const [usageType, setUsageType] = useState<EmployeeContractDraftUsageType>('payroll_attendance');
  const [useTemplate, setUseTemplate] = useState(false);
  const [templateId, setTemplateId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setUsageType('payroll_attendance');
    setUseTemplate(false);
    setTemplateId('');
    setError('');
  }, [open]);

  const filteredTemplates = useMemo(() => groupByUsage(templates, usageType), [templates, usageType]);

  useEffect(() => {
    if (!useTemplate) {
      setTemplateId('');
      return;
    }
    if (filteredTemplates.length === 1) {
      setTemplateId(filteredTemplates[0].id);
      return;
    }
    setTemplateId((current) => (filteredTemplates.some((item) => item.id === current) ? current : ''));
  }, [filteredTemplates, useTemplate]);

  const submit = () => {
    const selectedTemplate = useTemplate ? filteredTemplates.find((item) => item.id === templateId) ?? null : null;
    if (useTemplate && !selectedTemplate) {
      setError('قالب پیش‌نویس را انتخاب کنید');
      return;
    }

    const baseSettings = readSettingsForTemplate(selectedTemplate);
    const allDrafts = readEmployeeDrafts();
    const supplemental = readEmployeeSupplementalProfiles()[employee.id] ?? getDefaultEmployeeSupplementalProfile();
    const nextDraft = createInitialEmployeeContractDraft({
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
      usageType,
      drafts: allDrafts,
      businessProfile,
      template: selectedTemplate,
      baseSettings,
      supplemental,
    });
    onCreated(nextDraft);
  };

  return (
    <PanelFormModal
      open={open}
      title="افزودن پیش‌نویس قرارداد"
      lead="حوزه تنظیمات پیش‌نویس را مشخص کنید و در صورت نیاز از یک قالب آماده شروع کنید."
      error={error}
      onClose={onClose}
      footer={<PanelFormModalActions submitLabel="ایجاد پیش‌نویس" onSubmit={submit} onCancel={onClose} />}
    >
      <div className="business-draft-dialog business-draft-template-dialog business-draft-create-dialog">
        <div className="business-draft-dialog-card">
          <div className="business-draft-dialog-card-head">
            <div>
              <span className="business-draft-dialog-kicker">
                <Layers3 className="h-4 w-4" />
                حوزه تنظیمات
              </span>
              <h3>این پیش‌نویس برای چه سیستمی است؟</h3>
              <p>بر اساس انتخاب، مراحل و فیلدهای پیش‌نویس متفاوت می‌شوند.</p>
            </div>
          </div>
          <div className="business-draft-dialog-options business-draft-dialog-options-grid">
            <button
              type="button"
              className={usageType === 'attendance_only' ? 'is-selected' : ''}
              onClick={() => setUsageType('attendance_only')}
            >
              <span className="business-draft-option-pill">
                <ShieldCheck className="h-4 w-4" />
                فقط تردد
              </span>
              <strong>مناسب برای سیستم تردد</strong>
              <small>حضور و غیاب، مرخصی، اضافه‌کاری و قوانین تردد.</small>
            </button>
            <button
              type="button"
              className={usageType === 'payroll_attendance' ? 'is-selected' : ''}
              onClick={() => setUsageType('payroll_attendance')}
            >
              <span className="business-draft-option-pill">
                <Layers3 className="h-4 w-4" />
                تردد و حقوق
              </span>
              <strong>مناسب برای تردد و حقوق و دستمزد</strong>
              <small>حقوق پایه، مزایا، بیمه، مالیات و محاسبات دستمزد.</small>
            </button>
          </div>
        </div>

        <div className="business-draft-dialog-card business-draft-template-card">
          <div className="business-draft-dialog-card-head">
            <div>
              <span className="business-draft-dialog-kicker">
                <FileText className="h-4 w-4" />
                قالب پیش‌نویس
              </span>
              <h3>نحوه شروع پیش‌نویس</h3>
              <p>
                {useTemplate
                  ? 'یک قالب انتخاب کنید تا مقادیر اولیه از آن پر شود.'
                  : 'پیش‌نویس با مقادیر پیش‌فرض خالی شروع می‌شود.'}
              </p>
            </div>
          </div>

          <div className="business-draft-template-mode-row" role="radiogroup" aria-label="نحوه شروع پیش‌نویس">
            <button
              type="button"
              role="radio"
              aria-checked={!useTemplate}
              className={!useTemplate ? 'is-selected' : ''}
              onClick={() => setUseTemplate(false)}
            >
              بدون قالب
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={useTemplate}
              className={useTemplate ? 'is-selected' : ''}
              onClick={() => setUseTemplate(true)}
            >
              از قالب آماده
            </button>
          </div>

          {useTemplate ? (
            filteredTemplates.length ? (
              <div className="business-draft-template-picker" role="radiogroup" aria-label="انتخاب قالب پیش‌نویس">
                {filteredTemplates.map((template) => {
                  const selected = templateId === template.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className={`business-draft-template-option${selected ? ' is-selected' : ''}`}
                      onClick={() => setTemplateId(template.id)}
                    >
                      <span className="business-draft-template-option-copy">
                        <strong>{template.name}</strong>
                        <small>
                          مبنای {formatFaNumber(template.baseSettingsYear, { useGrouping: false })} · {usageLabel(template.usageType)}
                        </small>
                      </span>
                      {selected ? <Check className="h-4 w-4 business-draft-template-option-check" aria-hidden /> : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="business-draft-field-note business-draft-template-empty-note">
                هنوز قالب سازگار با «{usageLabel(usageType)}» ثبت نشده است. می‌توانید بدون قالب ادامه دهید.
              </p>
            )
          ) : null}
        </div>
      </div>
    </PanelFormModal>
  );
}

function DraftDetailSection({
  label,
  category,
  subHint,
  value,
}: {
  label: string;
  category: string;
  subHint?: string;
  value?: string;
}) {
  return (
    <section className="draft-template-detail-section">
      <span className="draft-template-detail-label">{label}</span>
      <span className="draft-template-detail-chip">{category}</span>
      {subHint ? (
        <p className="draft-template-detail-hint">
          <Info className="h-3.5 w-3.5" aria-hidden />
          <span>{subHint}</span>
        </p>
      ) : null}
      {value ? <span className="draft-template-detail-chip is-sub">{value}</span> : null}
    </section>
  );
}

function DraftShowcaseCard({
  draft,
  onOpen,
  onDelete,
}: {
  draft: EmployeeContractDraft;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const steps = getEmployeeDraftSteps(draft.usageType);
  const completedSteps = steps.filter((step) => draft.progress[step.id]?.completed);
  const completed = completedSteps.length;
  const { subject } = draft;
  const contractCategory = displayValue(subject.contractType);
  const contractSubType = subject.contractSubType.trim();
  const locationCategory = displayValue(subject.locationGroup);
  const locationSubType = subject.locationType.trim();
  const jobCategory = displayValue(subject.jobGroup);
  const jobSubType = formatSubjectResponsibilities(parseSubjectResponsibilities(subject));
  const templateMeta = draft.templateName
    ? draft.templateName
    : 'بدون قالب مبنا';
  const templateBaseYear = draft.templateSnapshot
    ? formatFaNumber(draft.templateSnapshot.baseSettingsYear, { useGrouping: false })
    : null;
  const differenceCount = countDifferences(draft, DEFAULT_PAYROLL_SETTINGS, null);

  const showDetails = () => {
    setExpanded(true);
    requestAnimationFrame(() => detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  };

  return (
    <article className="draft-template-card draft-template-showcase-card">
      <header className="draft-template-showcase-head">
        <div className="draft-template-showcase-info">
          <DraftShowcaseFields>
            <DraftShowcaseField label="شماره قرارداد" value={draft.contractNumber} prominent />
            <DraftShowcaseField label="حوزه تنظیمات" value={usageLabel(draft.usageType)} />
            <DraftShowcaseField label="قالب مبنا" value={templateMeta} />
            {templateBaseYear ? <DraftShowcaseField label="مبنای سال قالب" value={templateBaseYear} /> : null}
          </DraftShowcaseFields>
          <DraftShowcaseFields className="is-compact">
            <DraftShowcaseField label="تاریخ ثبت" value={<time dateTime={draft.createdAt}>{formatPersianJalaliDate(draft.createdAt)}</time>} />
            <DraftShowcaseField label="آخرین به‌روزرسانی" value={<time dateTime={draft.updatedAt}>{formatPersianJalaliDate(draft.updatedAt)}</time>} />
            <DraftShowcaseFieldBadge
              label="پیشرفت مراحل"
              value={`${formatFaNumber(completed, { useGrouping: false })} / ${formatFaNumber(steps.length, { useGrouping: false })} مرحله`}
            />
            <DraftShowcaseFieldBadge label="وضعیت" value={draftStatusLabel(draft.status)} />
          </DraftShowcaseFields>
        </div>
        <div className="draft-template-showcase-actions">
          <button type="button" className="draft-template-use-btn" onClick={onOpen}>
            ادامه تنظیم پیش‌نویس
          </button>
        </div>
        <div className="draft-template-showcase-menu-wrap">
          <CardMenu
            items={[
              {
                kind: 'action',
                label: 'جزئیات',
                icon: <Eye className="h-4 w-4" aria-hidden />,
                onClick: showDetails,
              },
              {
                kind: 'action',
                label: 'ویرایش',
                icon: <Pencil className="h-4 w-4" aria-hidden />,
                onClick: onOpen,
              },
              {
                kind: 'action',
                label: 'حذف',
                icon: <Trash2 className="h-4 w-4" aria-hidden />,
                tone: 'danger',
                onClick: () => setDeleteOpen(true),
              },
            ]}
          />
        </div>
      </header>

      <section className="draft-template-workgroups">
        <span className="draft-template-workgroups-label">مراحل تکمیل‌شده در این پیش‌نویس</span>
        {completedSteps.length ? (
          <div className="draft-template-workgroup-chips">
            {completedSteps.map((step) => (
              <span key={step.id} className="draft-template-workgroup-chip">
                {step.title}
              </span>
            ))}
          </div>
        ) : (
          <p className="draft-template-workgroups-empty">هنوز مرحله‌ای در این پیش‌نویس تکمیل نشده است.</p>
        )}
      </section>

      {expanded ? (
        <div className="draft-template-detail-stack" ref={detailsRef}>
          <DraftDetailSection
            label="نوع قرارداد"
            category={contractCategory}
            subHint={subject.contractType.trim() ? `زیر مجموعه قراردادهای «${subject.contractType.trim()}»` : undefined}
            value={contractSubType || undefined}
          />
          <DraftDetailSection
            label="نوع شغل و مسئولیت"
            category={jobCategory}
            subHint={subject.jobGroup.trim() ? `زیر مجموعه «${subject.jobGroup.trim()}»` : undefined}
            value={jobSubType || undefined}
          />
          <DraftDetailSection label="نوع پرداخت حقوق و مزایا" category={usageLabel(draft.usageType)} />
          <DraftDetailSection
            label="نوع محل انجام کار"
            category={locationCategory}
            subHint={subject.locationGroup.trim() ? `زیر مجموعه «${subject.locationGroup.trim()}»` : undefined}
            value={locationSubType || undefined}
          />
          {draft.templateSnapshot ? (
            <DraftDetailSection
              label="تفاوت با قالب مبنا"
              category={`${formatFaNumber(differenceCount, { useGrouping: false })} مورد تفاوت`}
              subHint={differenceCount ? 'برخی مقادیر نسبت به قالب مبنا تغییر کرده‌اند.' : 'همه مقادیر با قالب مبنا یکسان است.'}
            />
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        className="draft-template-expand-toggle"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
      >
        {expanded ? (
          <>
            جزئیات کمتر
            <ChevronUp className="h-4 w-4" aria-hidden />
          </>
        ) : (
          <>
            جزئیات بیشتر
            <ChevronDown className="h-4 w-4" aria-hidden />
          </>
        )}
      </button>

      <ConfirmDialog
        open={deleteOpen}
        title="حذف پیش‌نویس قرارداد"
        description={`آیا از حذف «${draft.contractNumber}» مطمئن هستید؟ این عمل قابل بازگشت نیست.`}
        confirmLabel="حذف"
        cancelLabel="انصراف"
        tone="danger"
        onConfirm={() => {
          onDelete();
          setDeleteOpen(false);
        }}
        onCancel={() => setDeleteOpen(false)}
      />
    </article>
  );
}

export function EmployeeContractDraftsClient({
  employee,
  businessProfile,
}: {
  employee: EmployeeDraftEmployee;
  businessProfile: BusinessProfile | null;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const [accountProfile, setAccountProfile] = useState<BusinessProfile | null>(businessProfile);
  const { drafts, templates, loaded, persist } = useDraftStorage(employee.id);
  const employeeDrafts = useMemo(() => getEmployeeDraftsByEmployeeId(drafts, employee.id), [drafts, employee.id]);
  const employeeName = `${employee.firstName} ${employee.lastName}`.trim();

  useEffect(() => {
    let ignore = false;

    const loadAccountProfile = async () => {
      try {
        const response = await fetch('/api/account/profile', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as AccountProfileApiResponse;
        if (ignore) return;
        const resolved = buildBusinessProfileFromApi(payload);
        if (resolved) setAccountProfile(resolved);
      } catch {
        // Keep the server-provided profile when the API request fails.
      }
    };

    void loadAccountProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const resolvedBusinessProfile = accountProfile ?? businessProfile;

  const visibleDrafts = useMemo(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return employeeDrafts;
    return employeeDrafts.filter((draft) => {
      const haystack = [
        draft.contractNumber,
        draft.templateName,
        draft.subject.contractType,
        draft.subject.contractSubType,
        draft.subject.jobGroup,
        ...parseSubjectResponsibilities(draft.subject),
        draft.subject.responsibility,
        draft.subject.locationGroup,
        draft.subject.locationType,
        usageLabel(draft.usageType),
      ]
        .filter(Boolean)
        .join(' ');
      return haystack.includes(normalizedQuery);
    });
  }, [employeeDrafts, query]);

  const createDraft = (draft: EmployeeContractDraft) => {
    const next = [draft, ...drafts.filter((item) => item.id !== draft.id)];
    persist(next);
    setCreating(false);
    router.push(`/employees/${employee.id}/contract-drafts/${draft.id}`);
  };

  const deleteDraft = (draftId: string) => {
    persist(drafts.filter((item) => item.id !== draftId));
  };

  if (!loaded) return null;

  return (
    <div className="page-stack module-page draft-templates-page business-draft-list-page draft-templates-showcase-page" dir="rtl" lang="fa">
      <header className="business-draft-list-header draft-templates-showcase-header">
        <div>
          <p>کارمند: {employeeName}</p>
          <h1>پیش‌نویس‌های قرارداد</h1>
          <span>
            پیش‌نویس‌های قرارداد {employeeName} را بر اساس قالب‌های مبنا تنظیم کنید؛ هر پیش‌نویس را می‌توانید جداگانه ادامه دهید.
          </span>
        </div>
      </header>

      <div className="draft-templates-showcase-toolbar" aria-label="ابزارهای فهرست پیش‌نویس‌ها">
        <label className="draft-templates-showcase-search">
          <Search className="h-4 w-4" aria-hidden />
          <input
            type="search"
            value={query}
            placeholder="جستجو"
            aria-label="جستجوی پیش‌نویس"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button type="button" aria-label="پاک کردن جستجو" onClick={() => setQuery('')}>
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
        <button type="button" className="draft-templates-showcase-add" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" aria-hidden />
          افزودن پیش‌نویس جدید
        </button>
      </div>

      {visibleDrafts.length ? (
        <div className="draft-template-list draft-templates-showcase-list">
          {visibleDrafts.map((draft) => (
            <DraftShowcaseCard
              key={draft.id}
              draft={draft}
              onOpen={() => router.push(`/employees/${employee.id}/contract-drafts/${draft.id}`)}
              onDelete={() => deleteDraft(draft.id)}
            />
          ))}
        </div>
      ) : (
        <div className="draft-template-empty draft-templates-showcase-empty">
          <FileText className="h-8 w-8" />
          <p>{query.trim() ? 'پیش‌نویسی با این عبارت پیدا نشد.' : 'هنوز پیش‌نویسی برای این کارمند ثبت نشده است.'}</p>
          {!query.trim() ? (
            <button type="button" className="draft-templates-showcase-add" onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              افزودن پیش‌نویس جدید
            </button>
          ) : null}
        </div>
      )}

      <DraftCreationDialog
        open={creating}
        employee={employee}
        businessProfile={businessProfile}
        drafts={drafts}
        templates={templates}
        onClose={() => setCreating(false)}
        onCreated={createDraft}
      />
    </div>
  );
}

function EmployeeSummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="business-payroll-subcard">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}

function EmployeeVariablePaymentEditorDialog({
  open,
  initialType,
  initialItem,
  baseItem,
  monthlyBaseSalary,
  grossPay,
  onClose,
  onSubmit,
}: {
  open: boolean;
  initialType: 'addition' | 'deduction';
  initialItem: VariableTemplateItem | null;
  baseItem?: VariableTemplateItem | null;
  monthlyBaseSalary: number;
  grossPay: number;
  onClose: () => void;
  onSubmit: (item: VariableTemplateItem) => void;
}) {
  const [item, setItem] = useState<VariableTemplateItem>(initialItem ?? createEmployeeVariablePaymentItem(initialType));
  const [error, setError] = useState('');
  const [rulesDialog, setRulesDialog] = useState<VariableTemplateItem | null>(null);
  const editingType = initialItem?.type ?? initialType;
  const isEditing = Boolean(initialItem);
  const rules = item.calculationRules ?? (editingType === 'addition' ? DEFAULT_OPTIONAL_ADDITION_RULES : DEFAULT_OPTIONAL_DEDUCTION_RULES);
  const baseRules = baseItem?.calculationRules ?? null;
  const calculatedAmount = calculateEmployeeVariableAmount(item, monthlyBaseSalary, grossPay);

  useEffect(() => {
    if (!open) {
      setRulesDialog(null);
      return;
    }
    setItem(initialItem ?? createEmployeeVariablePaymentItem(initialType));
    setError('');
    setRulesDialog(null);
  }, [initialItem, initialType, open]);

  const submit = () => {
    if (!item.title.trim()) return setError('عنوان الزامی است.');
    if (item.method === 'fixed' && (!Number.isFinite(item.amount) || item.amount < 0)) {
      return setError('مبلغ وارد شده معتبر نیست.');
    }
    if (item.method === 'percentage' && (!Number.isFinite(item.percent) || item.percent <= 0 || item.percent > 100)) {
      return setError('درصد باید بزرگتر از صفر و حداکثر ۱۰۰ باشد.');
    }
    onSubmit({ ...item, type: editingType });
  };

  const amountDifference =
    baseItem && item.method === 'fixed' && baseItem.method === 'fixed'
      ? compareValues(baseItem.amount, item.amount, {
          changed: 'متفاوت با قالب',
          tooltip: `مبلغ قالب انتخاب‌شده ${money(baseItem.amount)} است.`,
          higher: (diff) => `${money(diff)} بیشتر از قالب`,
          lower: (diff) => `${money(diff)} کمتر از قالب`,
        })
      : null;
  const percentDifference =
    baseItem && item.method === 'percentage' && baseItem.method === 'percentage'
      ? compareValues(baseItem.percent, item.percent, {
          changed: 'متفاوت با قالب',
          tooltip: `درصد قالب انتخاب‌شده ${formatFaNumber(baseItem.percent)}٪ است.`,
          higher: (diff) => `${formatFaNumber(diff)}٪ بیشتر از قالب`,
          lower: (diff) => `${formatFaNumber(diff)}٪ کمتر از قالب`,
        })
      : null;
  const baseDifference = baseItem && item.method === 'percentage' && baseItem.method === 'percentage' && baseItem.base !== item.base;

  return (
    <>
      <PanelFormModal
        open={open}
        title={isEditing ? 'ویرایش آیتم پرداخت متغیر' : editingType === 'addition' ? 'افزودن اضافه اختیاری' : 'افزودن کسور اختیاری'}
        lead={
          editingType === 'addition'
            ? 'این آیتم به پرداخت‌های این قرارداد اضافه می‌شود.'
            : 'این آیتم از پرداخت‌های این قرارداد کسر می‌شود.'
        }
        error={error}
        onClose={onClose}
        footer={<PanelFormModalActions submitLabel="ثبت" onSubmit={submit} onCancel={onClose} />}
      >
        <div className="payroll-variable-amount-dialog-form business-payroll-editor variable">
          <VariableAmountTitlePicker
            type={editingType}
            title={item.title}
            onTitleChange={(nextTitle) => setItem((value) => ({ ...value, title: nextTitle }))}
          />

          <div className="business-payroll-toggle">
            <button type="button" className={item.method === 'fixed' ? 'is-selected' : ''} onClick={() => setItem((value) => ({ ...value, method: 'fixed' }))}>
              مبلغ ثابت
            </button>
            <button type="button" className={item.method === 'percentage' ? 'is-selected' : ''} onClick={() => setItem((value) => ({ ...value, method: 'percentage' }))}>
              ضریب محاسبه
            </button>
          </div>

          {item.method === 'fixed' ? (
            <label className="business-payroll-field">
              <span className="business-payroll-field-label">مبلغ</span>
              <span className="business-payroll-input">
                <input value={moneyInput(item.amount)} onChange={(event) => setItem((value) => ({ ...value, amount: parseNumber(event.target.value) }))} />
                <b>ریال</b>
              </span>
            </label>
          ) : (
            <div className="business-payroll-fields two">
              <label className="business-payroll-field">
                <span className="business-payroll-field-label">درصد محاسبه</span>
                <span className="business-payroll-input">
                  <input value={moneyInput(item.percent)} onChange={(event) => setItem((value) => ({ ...value, percent: parseNumber(event.target.value) }))} />
                  <b>%</b>
                </span>
              </label>
              <label className="business-payroll-field">
                <span className="business-payroll-field-label">مبنای پرداخت</span>
                <select value={item.base} onChange={(event) => setItem((value) => ({ ...value, base: event.target.value as VariableTemplateItem['base'] }))}>
                  <option value="baseSalary">درصدی از حقوق پایه ماهانه</option>
                  <option value="grossPay">درصدی از جمع حقوق دریافتی</option>
                </select>
              </label>
            </div>
          )}

          {baseItem ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {amountDifference ? differenceBadge(amountDifference.message, amountDifference.tooltip) : null}
              {percentDifference ? differenceBadge(percentDifference.message, percentDifference.tooltip) : null}
              {baseDifference ? differenceBadge('متفاوت با قالب', 'مبنای محاسبه این آیتم با قالب انتخاب‌شده متفاوت است.') : null}
            </div>
          ) : null}

          <div className="calc-badges-row">
            <CalculationRulesBadges rules={rules} />
            {baseRules ? <CalcRulesDiffBadge baseRules={baseRules} currentRules={rules} baseLabel="قالب انتخاب‌شده" differenceLabel="متفاوت با قواعد قالب" /> : null}
            <CalcRulesEditButton onClick={() => setRulesDialog(item)} />
          </div>

          {Number.isFinite(calculatedAmount) ? <div className="business-payroll-formula">مبلغ نهایی محاسبه‌شده: {money(calculatedAmount)}</div> : null}
        </div>
      </PanelFormModal>

      {rulesDialog ? (
        <CalculationRulesDialog
          open={Boolean(rulesDialog)}
          itemTitle={rulesDialog.title}
          rules={rulesDialog.calculationRules ?? (rulesDialog.type === 'addition' ? DEFAULT_OPTIONAL_ADDITION_RULES : DEFAULT_OPTIONAL_DEDUCTION_RULES)}
          baseRules={baseRules}
          baseLabel="قالب انتخاب‌شده"
          differenceLabel="متفاوت با قواعد قالب"
          effectContext={rulesDialog.type === 'addition' ? 'benefit_or_addition' : 'deduction'}
          onClose={() => setRulesDialog(null)}
          onSubmit={(next) => {
            setItem((value) => ({ ...value, calculationRules: next }));
            setRulesDialog(null);
          }}
        />
      ) : null}
    </>
  );
}

function valueOrEmpty(value: string | number | null | undefined) {
  if (typeof value === 'number') return Number.isFinite(value) ? value.toLocaleString('fa-IR') : 'ثبت نشده';
  const trimmed = String(value ?? '').trim();
  return trimmed ? trimmed : 'ثبت نشده';
}

function useEmployeeDraftContext(employee: EmployeeDraftEmployee, draftId: string) {
  const [drafts, setDrafts] = useState<EmployeeContractDraft[]>([]);
  const [templates, setTemplates] = useState<ContractDraftTemplate[]>([]);
  const [supplementalProfiles, setSupplementalProfiles] = useState<Record<string, EmployeeSupplementalProfile>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const nextDrafts = readEmployeeDrafts();
    setDrafts(nextDrafts);
    setTemplates(readTemplates());
    setSupplementalProfiles(readEmployeeSupplementalProfiles());
    setLoaded(true);
  }, [draftId, employee.id]);

  const persist = useCallback((nextDrafts: EmployeeContractDraft[]) => {
    setDrafts(nextDrafts);
    persistEmployeeDrafts(nextDrafts);
  }, []);

  const persistSupp = (profiles: Record<string, EmployeeSupplementalProfile>) => {
    setSupplementalProfiles(profiles);
    persistEmployeeSupplementalProfiles(profiles);
  };

  const activeDraft = useMemo(
    () => drafts.find((item) => item.id === draftId && item.employeeId === employee.id) ?? null,
    [draftId, drafts, employee.id],
  );

  return { drafts, templates, supplementalProfiles, loaded, persist, persistSupp, activeDraft, setDrafts };
}

function CurrentStepBadge({ step, active, state }: { step: string; active: boolean; state?: { opened: boolean; completed: boolean; dirty: boolean; saved: boolean } }) {
  if (!state?.opened) {
    return (
      <span className="business-payroll-step-badge is-locked">
        <LockKeyhole className="h-3 w-3" />
      </span>
    );
  }
  if (active) return <span className="business-payroll-step-badge is-current">در حال انجام</span>;
  if (state.dirty) return <span className="business-payroll-step-badge is-opened">باز شده</span>;
  if (state.saved) return <span className="business-payroll-step-badge is-saved">ذخیره شده</span>;
  return <span className="business-payroll-step-badge is-opened">{step}</span>;
}

function EmployeeDraftStepperSidebar({
  draft,
  activeStep,
  onNavigate,
  onSaveStep,
}: {
  draft: EmployeeContractDraft;
  activeStep: EmployeeContractDraftStepId;
  onNavigate: (step: EmployeeContractDraftStepId) => void;
  onSaveStep: (step: EmployeeContractDraftStepId) => void;
}) {
  const steps = getEmployeeDraftSteps(draft.usageType);
  return (
    <aside className="draft-template-flow-sidebar draft-template-flow-sidebar-right" aria-label="مراحل">
      <div className="draft-template-flow-sidebar-panel">
        <header className="draft-template-flow-sidebar-header">
          <h2>مراحل پیش‌نویس</h2>
          <p>پیش‌نویس کارمند با همین ترتیب تکمیل می‌شود.</p>
        </header>
        <MinimalScroll className="draft-template-flow-nav-list">
          {steps.map((step, index) => {
            const state = draft.progress[step.id];
            const isCurrent = activeStep === step.id;
            return (
              <div key={step.id} className={`draft-template-flow-nav-item ${isCurrent ? 'is-active' : ''} ${state?.opened ? 'is-opened' : 'is-locked'} ${state?.dirty ? 'is-dirty' : ''}`}>
                <button type="button" className="draft-template-flow-nav-main" disabled={!state?.opened} onClick={() => onNavigate(step.id)}>
                  <span className="draft-template-flow-nav-number">{formatFaNumber(index + 1, { useGrouping: false })}</span>
                  <span className="draft-template-flow-nav-copy">
                    <strong>{step.title}</strong>
                    <small>{step.detail}</small>
                    <span className="business-payroll-step-badges">
                      <CurrentStepBadge step={step.title} active={isCurrent} state={state} />
                    </span>
                  </span>
                </button>
                {state?.opened && state.dirty ? (
                  <button type="button" className="business-payroll-step-save-tag" onClick={() => onSaveStep(step.id)}>
                    ذخیره
                  </button>
                ) : null}
              </div>
            );
          })}
        </MinimalScroll>
      </div>
    </aside>
  );
}

function SectionPlaceholder() {
  return (
    <section className="business-payroll-subcard">
      <div className="business-payroll-coming-soon">
        <span>در ادامه تکمیل می‌شود</span>
        <h3>این بخش در مرحله بعدی تکمیل می‌شود</h3>
        <p>در حال حاضر فقط زیرساخت و مسیر این مرحله آماده شده است.</p>
      </div>
    </section>
  );
}

export function EmployeeContractDraftBuilderClient({
  employee,
  businessProfile,
  draftId,
}: {
  employee: EmployeeDraftEmployee;
  businessProfile: BusinessProfile | null;
  draftId: string;
}) {
  const router = useRouter();
  const { drafts, templates, supplementalProfiles, loaded, persist, persistSupp, activeDraft } = useEmployeeDraftContext(employee, draftId);
  const [accountProfile, setAccountProfile] = useState<BusinessProfile | null>(businessProfile);
  const [accountProfilePayload, setAccountProfilePayload] = useState(() => {
    const defaults = createOwnershipEditorDefaults();
    return {
      store: defaults.store,
      meta: defaults.meta,
    };
  });
  const [activeStep, setActiveStep] = useState<EmployeeContractDraftStepId>('parties');
  const [supplementalOpen, setSupplementalOpen] = useState(false);
  const [ownershipEditorOpen, setOwnershipEditorOpen] = useState(false);
  const [employeeInfoEditor, setEmployeeInfoEditor] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [currentDraft, setCurrentDraft] = useState<EmployeeContractDraft | null>(null);
  const [benefitRulesDialog, setBenefitRulesDialog] = useState<keyof EmployeeContractDraft['benefits'] | null>(null);
  const [variablePaymentEditor, setVariablePaymentEditor] = useState<{ type: 'addition' | 'deduction'; item: VariableTemplateItem | null } | null>(null);
  const [variablePaymentRulesDialog, setVariablePaymentRulesDialog] = useState<VariableTemplateItem | null>(null);
  const [deletingVariablePayment, setDeletingVariablePayment] = useState<VariableTemplateItem | null>(null);
  const [missionEditor, setMissionEditor] = useState<EmployeeMissionRule | null>(null);
  const [deletingMissionRule, setDeletingMissionRule] = useState<EmployeeMissionRule | null>(null);
  const [finalizeConfirmOpen, setFinalizeConfirmOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [paymentTypeComingSoonLabel, setPaymentTypeComingSoonLabel] = useState<string | null>(null);
  const compensationHydratedRef = useRef<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadAccountProfile = async () => {
      try {
        const payload = await fetchProfilePayload();
        if (ignore) return;
        setAccountProfilePayload(payload);
        setAccountProfile(buildBusinessProfileFromPayload(payload.store, payload.meta));
      } catch {
        // keep the prop value when the API request fails
      }
    };

    void loadAccountProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const resolvedBusinessProfile = accountProfile ?? businessProfile;

  const saveOwnershipProfile = async ({ store, meta }: { store: ProfileStore; meta: ProfileMeta }) => {
    try {
      const saved = await persistProfilePayload(store, meta.owner);
      setAccountProfilePayload(saved);
      setAccountProfile(buildBusinessProfileFromPayload(saved.store, saved.meta));
      setOwnershipEditorOpen(false);
      setNotice('اطلاعات کارفرما با موفقیت ذخیره شد.');
    } catch {
      setNotice('ثبت اطلاعات کارفرما با خطا مواجه شد.');
    }
  };

  useEffect(() => {
    if (!loaded || !activeDraft) {
      setCurrentDraft(null);
      return;
    }
    const template = activeDraft.templateId ? templates.find((item) => item.id === activeDraft.templateId) ?? null : null;
    const resolved = resolveEmployeeDraftCompensation(
      activeDraft,
      readSettingsForTemplate(template),
      template,
    );
    const draft = resolved.draft;
    const hydratedKey = `${draft.id}:${draft.updatedAt}`;
    const needsPersist =
      getDraftCompensationFingerprint(draft) !== getDraftCompensationFingerprint(activeDraft);

    if (needsPersist) {
      persist(drafts.map((item) => (item.id === draft.id ? draft : item)));
    }

    setCurrentDraft(draft);

    if (compensationHydratedRef.current !== hydratedKey) {
      compensationHydratedRef.current = hydratedKey;
      setActiveStep(getCurrentStepId(draft));
    }
  }, [activeDraft, drafts, loaded, persist, templates]);

  const supplemental = supplementalProfiles[employee.id] ?? getDefaultEmployeeSupplementalProfile();
  const currentTemplate = currentDraft?.templateId ? templates.find((item) => item.id === currentDraft.templateId) ?? null : null;
  const baseSettings = currentTemplate ? readSettingsForTemplate(currentTemplate) : DEFAULT_PAYROLL_SETTINGS;
  const derived = useMemo(
    () =>
      calculatePayrollValues({
        ...baseSettings,
        financial: currentDraft?.financial ?? baseSettings.financial,
      }),
    [baseSettings, currentDraft?.financial],
  );
  const steps = currentDraft ? getEmployeeDraftSteps(currentDraft.usageType) : [];
  const hasUnsavedChanges = useMemo(
    () => Boolean(currentDraft) && steps.some(({ id }) => currentDraft.progress[id]?.dirty),
    [currentDraft, steps],
  );

  const updateDraft = (
    updater: (draft: EmployeeContractDraft) => EmployeeContractDraft,
    options?: { silent?: boolean; dirtyStep?: EmployeeContractDraftStepId },
  ) => {
    if (!currentDraft) return;
    const nextDraft = options?.silent ? updater(currentDraft) : { ...updater(currentDraft), updatedAt: new Date().toISOString() };
    const stepToMark = options?.dirtyStep ?? activeStep;
    const normalizedDraft =
      options?.silent || !stepToMark
        ? nextDraft
        : {
            ...nextDraft,
            progress: {
              ...nextDraft.progress,
              [stepToMark]: {
                ...nextDraft.progress[stepToMark],
                opened: true,
                dirty: true,
                saved: false,
              },
            },
          };
    const nextDrafts = drafts.map((item) => (item.id === normalizedDraft.id ? normalizedDraft : item));
    setCurrentDraft(normalizedDraft);
    persist(nextDrafts);
    setErrors({});
  };

  const persistStep = (step: EmployeeContractDraftStepId) => {
    const registrationNumber = currentDraft?.timing.registrationNumber.trim() ?? '';
    const duplicateRegistration =
      step === 'timing' &&
      registrationNumber &&
      drafts.some(
        (item) =>
          item.id !== currentDraft?.id &&
          item.timing.registrationNumber.trim() === registrationNumber,
      );
    if (duplicateRegistration) {
      setErrors({ timing_registrationNumber: 'این شماره قرارداد قبلاً استفاده شده است' });
      setActiveStep(step);
      requestAnimationFrame(() => document.getElementById(`employee-draft-${step}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      return false;
    }
    const validation = validateStep(step, currentDraft, employee, supplemental, baseSettings);
    if (Object.keys(validation).length) {
      setErrors(validation);
      setActiveStep(step);
      requestAnimationFrame(() => document.getElementById(`employee-draft-${step}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      return false;
    }
    const currentIndex = steps.findIndex((item) => item.id === step);
    const next = steps[currentIndex + 1];
    updateDraft(
      (draft) => ({
        ...draft,
        status: step === steps[steps.length - 1]?.id ? 'completed' : 'in_progress',
        updatedAt: new Date().toISOString(),
        progress: {
          ...draft.progress,
          [step]: { ...draft.progress[step], completed: true, dirty: false, saved: true, opened: true },
          ...(next ? { [next.id]: { ...draft.progress[next.id], opened: true } } : {}),
        },
      }),
      { silent: true },
    );
    setNotice('تغییرات این مرحله ذخیره شد.');
    if (next) {
      setActiveStep(next.id);
      requestAnimationFrame(() => document.getElementById(`employee-draft-${next.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
    return true;
  };

  const createOrUpdateSupplemental = (value: EmployeeSupplementalProfile) => {
    const normalized = normalizeEmployeeSupplementalProfile(value);
    const profiles = { ...supplementalProfiles, [employee.id]: normalized };
    persistSupp(profiles);
    updateDraft((draft) => ({
      ...draft,
      employeeSupplemental: normalized,
    }));
    setSupplementalOpen(false);
  };

  const registrationPlaceholder = useMemo(
    () => (currentDraft ? getRegistrationNumberPlaceholder(drafts, currentDraft.id) : null),
    [currentDraft, drafts],
  );

  const scrollToStep = (step: EmployeeContractDraftStepId) => {
    setActiveStep(step);
    requestAnimationFrame(() => document.getElementById(`employee-draft-${step}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const updateTimingField = (field: 'contractDate' | 'startDate' | 'endDate', value: string) => {
    updateDraft((draft) => {
      const timing = { ...draft.timing, [field]: value };
      return {
        ...draft,
        timing: {
          ...timing,
          durationMonths: durationMonthsBetween(timing.startDate, timing.endDate),
        },
      };
    });
  };

  const onMainContinue = (step: EmployeeContractDraftStepId) => {
    if (!currentDraft) return;
    persistStep(step);
  };

  const saveDirtyStepsAndLeave = () => {
    if (!currentDraft) return true;

    const dirtySteps = steps.filter(({ id }) => currentDraft.progress[id]?.dirty).map(({ id }) => id);
    for (const step of dirtySteps) {
      const registrationNumber = currentDraft.timing.registrationNumber.trim();
      const duplicateRegistration =
        step === 'timing' &&
        registrationNumber &&
        drafts.some(
          (item) =>
            item.id !== currentDraft.id &&
            item.timing.registrationNumber.trim() === registrationNumber,
        );
      if (duplicateRegistration) {
        setErrors({ timing_registrationNumber: 'Ø§ÛŒÙ† Ø´Ù…Ø§Ø±Ù‡ Ù‚Ø±Ø§Ø±Ø¯Ø§Ø¯ Ù‚Ø¨Ù„Ø§Ù‹ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø´Ø¯Ù‡ Ø§Ø³Øª' });
        setActiveStep(step);
        requestAnimationFrame(() => document.getElementById(`employee-draft-${step}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        return false;
      }

      const validation = validateStep(step, currentDraft, employee, supplemental, baseSettings);
      if (Object.keys(validation).length) {
        setErrors(validation);
        setActiveStep(step);
        requestAnimationFrame(() => document.getElementById(`employee-draft-${step}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
        return false;
      }
    }

    if (!dirtySteps.length) return true;

    const nextProgress = { ...currentDraft.progress };
    for (const step of dirtySteps) {
      nextProgress[step] = {
        ...nextProgress[step],
        completed: true,
        dirty: false,
        saved: true,
        opened: true,
      };
    }

    const allCompleted = steps.every(({ id }) => nextProgress[id]?.completed || nextProgress[id]?.saved);
    const nextDraft: EmployeeContractDraft = {
      ...currentDraft,
      updatedAt: new Date().toISOString(),
      status: allCompleted ? 'completed' : 'in_progress',
      progress: nextProgress,
    };
    const nextDrafts = drafts.map((item) => (item.id === nextDraft.id ? nextDraft : item));
    setCurrentDraft(nextDraft);
    persist(nextDrafts);
    setErrors({});
    setNotice('تغییرات ذخیره شد.');
    return true;
  };

  const unsavedLeaveGuard = useUnsavedLeaveGuard({
    hasUnsavedChanges,
    onSaveAndLeave: saveDirtyStepsAndLeave,
    onBrowserBack: () => router.push(`/employees/${employee.id}/contract-drafts`),
  });

  const completedCount = currentDraft ? getProgressCompleted(currentDraft) : 0;
  const diffCount = currentDraft ? countDifferences(currentDraft, baseSettings, currentTemplate) : 0;
  const employeeCompletion = computeEmployeeCompleteness(employee, supplemental);
  const contractStep = currentDraft?.progress.timing;
  const templateName = currentDraft?.templateName;

  if (!loaded) return null;
  if (!currentDraft) {
    return (
      <div className="business-draft-list-page" dir="rtl" lang="fa">
        <div className="draft-template-empty">
          <FileText className="h-8 w-8" />
          <p>این پیش‌نویس پیدا نشد.</p>
          <button type="button" className="draft-template-flow-action is-primary" onClick={() => router.push(`/employees/${employee.id}/contract-drafts`)}>
            بازگشت به فهرست پیش‌نویس‌ها
          </button>
        </div>
      </div>
    );
  }

  const stepsToRender = steps;
  const compensation = currentDraft ? resolveEmployeeDraftCompensation(currentDraft, baseSettings, currentTemplate) : null;

  const renderStepFooter = (step: EmployeeContractDraftStepId) => {
    const index = stepsToRender.findIndex((item) => item.id === step);
    const isLast = index === stepsToRender.length - 1;
    return (
      <footer className="business-payroll-step-footer">
        <button
          type="button"
          className="draft-template-flow-action is-primary"
          onClick={() => onMainContinue(step)}
        >
          {isLast ? <Save className="h-4 w-4" /> : null}
          {isLast ? 'ذخیره تغییرات' : currentDraft.progress[step].dirty ? 'ذخیره و ادامه' : 'مرحله بعد'}
        </button>
      </footer>
    );
  };

  const benefitSection = (key: keyof EmployeeContractDraft['benefits']) => {
    const item = currentDraft.benefits[key];
    const label = EMPLOYEE_CONTRACT_BENEFIT_LABELS[key];
    const description = EMPLOYEE_CONTRACT_BENEFIT_DESCRIPTIONS[key];
    const eligibilityWarning =
      key === 'childAllowance' && !isEligibleForChildAllowance(employee)
        ? 'این کارمند شرایط دریافت حق اولاد را ندارد'
        : key === 'marriageAllowance' && !isEligibleForMarriageAllowance(employee, supplemental)
          ? 'این کارمند شرایط دریافت حق تأهل را ندارد'
          : key === 'seniorityAllowance' && !isEligibleForSeniorityAllowance(employee, supplemental)
            ? 'این کارمند شرایط دریافت مزد پایه سنوات را ندارد'
            : '';
    const templateAmount = currentDraft.templateSnapshot?.benefits[key];
    const compareBadge =
      currentDraft.templateSnapshot && templateAmount !== undefined
        ? item.enabled
          ? item.amount === templateAmount
            ? fieldBadge('همسان با قالب', 'success')
            : differenceBadge('متفاوت با قالب', `مقدار این فیلد در قالب انتخاب‌شده ${money(templateAmount)} است.`)
          : templateAmount
            ? differenceBadge('غیرفعال نسبت به قالب', 'در قالب انتخاب‌شده این مورد فعال بود.')
            : fieldBadge('همسان با قالب', 'success')
        : null;
    const currentRules = item.calculationRules ?? DEFAULT_FIXED_BENEFIT_RULES;
    const templateRules = currentDraft.templateSnapshot?.benefitRules?.[key] ?? baseSettings.benefitRules?.[key] ?? DEFAULT_FIXED_BENEFIT_RULES;
    return (
      <article className="business-payroll-transfer-rule" key={key}>
        <div className="business-payroll-transfer-rule-head">
          <div>
            <strong>{label}</strong>
            <p className="contract-benefit-section-lead">{description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {compareBadge}
              {eligibilityWarning ? fieldBadge(eligibilityWarning, 'warning') : null}
            </div>
          </div>
          <div className="business-payroll-toggle">
            <button
              type="button"
              className={item.enabled ? 'is-selected' : ''}
              onClick={() =>
                updateDraft((draft) => ({
                  ...draft,
                  benefits: { ...draft.benefits, [key]: { ...draft.benefits[key], enabled: true } },
                }))
              }
            >
              فعال
            </button>
            <button
              type="button"
              className={!item.enabled ? 'is-selected' : ''}
              onClick={() =>
                updateDraft((draft) => ({
                  ...draft,
                  benefits: { ...draft.benefits, [key]: { ...draft.benefits[key], enabled: false } },
                }))
              }
            >
              غیرفعال
            </button>
          </div>
        </div>
        {item.enabled ? (
          <label className="business-payroll-field">
            <span className="business-payroll-field-label">مبلغ</span>
            <span className="business-payroll-input">
              <input
                value={moneyInput(item.amount)}
                onChange={(event) =>
                  updateDraft((draft) => ({
                    ...draft,
                    benefits: {
                      ...draft.benefits,
                      [key]: { ...draft.benefits[key], amount: parseNumber(event.target.value) },
                    },
                  }))
                }
              />
              <b>ریال</b>
            </span>
          </label>
        ) : null}
        <div className="calc-badges-row">
          <CalculationRulesBadges rules={currentRules} />
          <CalcRulesDiffBadge baseRules={templateRules} currentRules={currentRules} baseLabel="قالب انتخاب‌شده" differenceLabel="متفاوت با قواعد قالب" />
          <CalcRulesEditButton onClick={() => setBenefitRulesDialog(key)} />
        </div>
      </article>
    );
  };

  const renderBenefitsEndSection = () => {
    const value = compensation?.benefitsEnd;
    const snapshot = compensation?.templateSnapshot;
    if (!value) return <SectionPlaceholder />;

    const periodLabels: Record<EmployeeBenefitPaymentPeriod, string> = {
      monthly: 'ماهیانه',
      quarterly: 'سه‌ماهه',
      semiAnnual: 'شش‌ماهه',
      annual: 'سالانه',
      none: 'بدون عیدی',
    };
    const templateEidBonusAmount = snapshot?.benefitsEnd?.eidBonus.amount;
    const templateEidBonusPeriod = snapshot?.benefitsEnd?.eidBonus.period ?? (templateEidBonusAmount && templateEidBonusAmount > 0 ? 'annual' : 'none');
    const amountDifference = snapshot
      ? compareValues(templateEidBonusAmount ?? 0, value.eidBonus.amount, {
          changed: 'متفاوت با قالب',
          tooltip: `مبلغ عیدی در قالب انتخاب‌شده ${money(templateEidBonusAmount ?? 0)} است.`,
          higher: (diff) => `${money(diff)} بیشتر از قالب`,
          lower: (diff) => `${money(diff)} کمتر از قالب`,
        })
      : null;
    const periodDifference =
      snapshot && templateEidBonusPeriod === value.eidBonus.period
        ? null
        : snapshot
          ? differenceBadge('متفاوت با قالب', `دوره پرداخت عیدی در قالب انتخاب‌شده ${periodLabels[templateEidBonusPeriod ?? 'annual'] ?? 'سالانه'} بود.`)
          : null;
    const templateEndOfService = snapshot?.benefitsEnd?.endOfService ?? null;
    const endOfServiceStatus =
      snapshot && templateEndOfService
        ? templateEndOfService.enabled === value.endOfService.enabled
          ? fieldBadge('همسان با قالب', 'success')
          : differenceBadge(
              value.endOfService.enabled ? 'فعال شده نسبت به قالب' : 'غیرفعال نسبت به قالب',
              `وضعیت مزایای پایان کار در قالب انتخاب‌شده ${templateEndOfService.enabled ? 'فعال' : 'غیرفعال'} بود.`,
            )
        : null;
    const endOfServiceMethod =
      snapshot && templateEndOfService
        ? templateEndOfService.severancePaymentMethod === value.endOfService.severancePaymentMethod
          ? fieldBadge('همسان با قالب', 'success')
          : differenceBadge('متفاوت با قالب', `روش پرداخت حق سنوات در قالب انتخاب‌شده ${templateEndOfService.severancePaymentMethod === 'end_of_work' ? 'پرداخت در پایان همکاری' : 'پرداخت دوره‌ای'} بود.`)
        : null;
    const finalSettlementDifference =
      snapshot && templateEndOfService
        ? templateEndOfService.finalSettlementEnabled === value.endOfService.finalSettlementEnabled
          ? fieldBadge('همسان با قالب', 'success')
          : differenceBadge(
              value.endOfService.finalSettlementEnabled ? 'فعال شده نسبت به قالب' : 'غیرفعال نسبت به قالب',
              'وضعیت پرداخت حقوق و مزایای پرداخت‌نشده در زمان تسویه نهایی با قالب انتخاب‌شده متفاوت است.',
            )
        : null;

    return (
      <StepShell
        title="مزایای پایان سال و پایان کار"
        tag={snapshot ? 'قالب انتخاب‌شده' : 'بدون قالب'}
        description="عیدی و حق سنوات را بر اساس قالب انتخاب‌شده تنظیم کنید."
        icon={<Gift className="h-4 w-4" />}
      >
        <div className="business-payroll-fields two">
          <article className="business-payroll-transfer-rule">
            <div className="business-payroll-transfer-rule-head">
              <div>
                <strong>عیدی</strong>
                <p className="contract-benefit-section-lead">مبلغ و دوره پرداخت عیدی را مشخص کنید.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {snapshot ? (amountDifference ? differenceBadge(amountDifference.message, amountDifference.tooltip) : fieldBadge('همسان با قالب', 'success')) : null}
                  {snapshot ? periodDifference ?? fieldBadge('همسان با قالب', 'success') : null}
                </div>
              </div>
            </div>
            <div className="business-payroll-chips">
              {(Object.keys(periodLabels) as EmployeeBenefitPaymentPeriod[]).map((period) => (
                <button
                  key={period}
                  type="button"
                  className={value.eidBonus.period === period ? 'is-selected' : ''}
                  onClick={() =>
                    updateDraft((draft) => ({
                      ...draft,
                      benefitsEnd: {
                        ...(draft.benefitsEnd ?? value),
                        eidBonus: {
                          ...(draft.benefitsEnd?.eidBonus ?? value.eidBonus),
                          period,
                        },
                        endOfService: draft.benefitsEnd?.endOfService ?? value.endOfService,
                      },
                    }))
                  }
                >
                  {periodLabels[period]}
                </button>
              ))}
            </div>
            <label className="business-payroll-field">
              <span className="business-payroll-field-label">مبلغ</span>
              <span className="business-payroll-input">
                <input
                  value={moneyInput(value.eidBonus.amount)}
                  disabled={value.eidBonus.period === 'none'}
                  onChange={(event) =>
                    updateDraft((draft) => ({
                      ...draft,
                      benefitsEnd: {
                        ...(draft.benefitsEnd ?? value),
                        eidBonus: {
                          ...(draft.benefitsEnd?.eidBonus ?? value.eidBonus),
                          amount: parseNumber(event.target.value),
                        },
                        endOfService: draft.benefitsEnd?.endOfService ?? value.endOfService,
                      },
                    }))
                  }
                />
                <b>ریال</b>
              </span>
            </label>
            {errors.benefitsEnd_eidBonusAmount ? <em className="contract-timing-field-error">{errors.benefitsEnd_eidBonusAmount}</em> : null}
          </article>

          <article className="business-payroll-transfer-rule">
            <div className="business-payroll-transfer-rule-head">
              <div>
                <strong>مزایای پایان کار</strong>
                <p className="contract-benefit-section-lead">فعال‌سازی، روش پرداخت و تسویه نهایی را مشخص کنید.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {endOfServiceStatus}
                  {endOfServiceMethod}
                  {finalSettlementDifference}
                </div>
              </div>
            </div>
            <div className="business-payroll-toggle">
              <button
                type="button"
                className={value.endOfService.enabled ? 'is-selected' : ''}
                onClick={() =>
                  updateDraft((draft) => ({
                    ...draft,
                    benefitsEnd: {
                      ...(draft.benefitsEnd ?? value),
                      eidBonus: draft.benefitsEnd?.eidBonus ?? value.eidBonus,
                      endOfService: { ...(draft.benefitsEnd?.endOfService ?? value.endOfService), enabled: true },
                    },
                  }))
                }
              >
                فعال
              </button>
              <button
                type="button"
                className={!value.endOfService.enabled ? 'is-selected' : ''}
                onClick={() =>
                  updateDraft((draft) => ({
                    ...draft,
                    benefitsEnd: {
                      ...(draft.benefitsEnd ?? value),
                      eidBonus: draft.benefitsEnd?.eidBonus ?? value.eidBonus,
                      endOfService: { ...(draft.benefitsEnd?.endOfService ?? value.endOfService), enabled: false },
                    },
                  }))
                }
              >
                غیرفعال
              </button>
            </div>
            <div className="business-payroll-chips" style={{ marginTop: 12 }}>
              {[
                { value: 'end_of_work' as const, label: 'پرداخت در پایان همکاری' },
                { value: 'periodic' as const, label: 'پرداخت دوره‌ای' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={value.endOfService.severancePaymentMethod === option.value ? 'is-selected' : ''}
                  onClick={() =>
                    updateDraft((draft) => ({
                      ...draft,
                      benefitsEnd: {
                        ...(draft.benefitsEnd ?? value),
                        eidBonus: draft.benefitsEnd?.eidBonus ?? value.eidBonus,
                        endOfService: {
                          ...(draft.benefitsEnd?.endOfService ?? value.endOfService),
                          severancePaymentMethod: option.value,
                        },
                      },
                    }))
                  }
                  disabled={!value.endOfService.enabled}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <PanelToggleRow
              label="کلیه حقوق و مزایای پرداخت‌نشده، در زمان تسویه‌حساب نهایی پرداخت خواهد شد."
              checked={value.endOfService.finalSettlementEnabled}
              onChange={(finalSettlementEnabled) =>
                updateDraft((draft) => ({
                  ...draft,
                  benefitsEnd: {
                    ...(draft.benefitsEnd ?? value),
                    eidBonus: draft.benefitsEnd?.eidBonus ?? value.eidBonus,
                    endOfService: {
                      ...(draft.benefitsEnd?.endOfService ?? value.endOfService),
                      finalSettlementEnabled,
                    },
                  },
                }))
              }
            />
          </article>
        </div>
      </StepShell>
    );
  };

  const renderVariablePaymentsSection = () => {
    const value = compensation?.variablePayments;
    const snapshot = compensation?.templateSnapshot;
    if (!value) return <SectionPlaceholder />;

    const baseAdditions = snapshot?.variablePayments?.additions ?? [];
    const baseDeductions = snapshot?.variablePayments?.deductions ?? [];
    const additionCount = value.additions.length;
    const deductionCount = value.deductions.length;

    const sameVariableItem = (item: VariableTemplateItem, baseItem: VariableTemplateItem | undefined) =>
      Boolean(
        baseItem &&
          item.title === baseItem.title &&
          item.type === baseItem.type &&
          item.method === baseItem.method &&
          (item.method !== 'fixed' || item.amount === baseItem.amount) &&
          (item.method !== 'percentage' || item.percent === baseItem.percent) &&
          (item.method !== 'percentage' || item.base === baseItem.base) &&
          JSON.stringify(item.calculationRules) === JSON.stringify(baseItem.calculationRules),
      );

    const renderVariableItem = (item: VariableTemplateItem, baseItem: VariableTemplateItem | undefined) => {
      const amount = calculateEmployeeVariableAmount(item, derived.monthlyBaseSalary, derived.grossPay);
      const differenceBadgeNode = snapshot
        ? baseItem
          ? sameVariableItem(item, baseItem)
            ? fieldBadge('همسان با قالب', 'success')
            : differenceBadge('متفاوت با قالب', 'جزئیات این آیتم با قالب انتخاب‌شده متفاوت است.')
          : fieldBadge('اختصاصی این قرارداد', 'warning')
        : null;
      const rules = item.calculationRules ?? (item.type === 'addition' ? DEFAULT_OPTIONAL_ADDITION_RULES : DEFAULT_OPTIONAL_DEDUCTION_RULES);
      const baseRules = baseItem?.calculationRules ?? null;

      return (
        <article key={item.id} className="business-payroll-transfer-rule">
          <div className="business-payroll-transfer-rule-head">
            <div>
              <strong>{item.title}</strong>
              <p className="contract-benefit-section-lead">
                {item.type === 'addition' ? 'اضافه اختیاری' : 'کسورات اختیاری'} ·{' '}
                {item.method === 'fixed'
                  ? `مبلغ ثابت ${money(item.amount)}`
                  : `${formatFaNumber(item.percent)}٪ از ${item.base === 'baseSalary' ? 'حقوق پایه ماهانه' : 'جمع حقوق دریافتی'}`}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {differenceBadgeNode}
                {snapshot && baseRules ? (
                  <CalcRulesDiffBadge
                    baseRules={baseRules}
                    currentRules={rules}
                    baseLabel="قالب انتخاب‌شده"
                    differenceLabel="متفاوت با قواعد قالب"
                  />
                ) : null}
              </div>
            </div>
            <div className="business-payroll-item-actions">
              <button type="button" aria-label="ویرایش آیتم" onClick={() => setVariablePaymentEditor({ type: item.type, item })}>
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" aria-label="حذف آیتم" onClick={() => setDeletingVariablePayment(item)}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="business-payroll-fields two">
            <div className="business-payroll-formula">مبلغ محاسبه‌شده: {money(amount)}</div>
            <div className="calc-badges-row">
              <CalculationRulesBadges rules={rules} />
              <CalcRulesEditButton onClick={() => setVariablePaymentRulesDialog(item)} />
            </div>
          </div>
        </article>
      );
    };

    return (
      <StepShell
        title="پرداخت‌های متغیر"
        tag={snapshot ? 'قالب انتخاب‌شده' : 'بدون قالب'}
        description="اضافات و کسورات اختیاری را برای این قرارداد بر اساس قالب انتخاب‌شده تنظیم کنید."
        icon={<Wallet className="h-4 w-4" />}
      >
        <div className="business-payroll-subcard" style={{ marginTop: 10 }}>
          <div className="business-draft-section-title">
            <h3>اضافات اختیاری</h3>
            <button type="button" className="business-payroll-outline-button" onClick={() => setVariablePaymentEditor({ type: 'addition', item: createEmployeeVariablePaymentItem('addition') })}>
              <Plus className="h-4 w-4" /> افزودن اضافه
            </button>
          </div>
          <p className="contract-benefit-section-lead">اضافات اختیاری این قرارداد را با قالب انتخاب‌شده مقایسه کنید.</p>
          <div className="business-payroll-items" style={{ marginTop: 12 }}>
            {value.additions.length
              ? value.additions.map((item) => renderVariableItem(item, baseAdditions.find((baseItem) => baseItem.id === item.id)))
              : <p className="business-payroll-empty">هنوز اضافه اختیاری‌ای ثبت نشده است.</p>}
          </div>
          {snapshot && baseAdditions.some((baseItem) => !value.additions.some((item) => item.id === baseItem.id)) ? (
            <div className="business-payroll-removed-items" style={{ marginTop: 12 }}>
              {baseAdditions
                .filter((baseItem) => !value.additions.some((item) => item.id === baseItem.id))
                .map((baseItem) => (
                  <span key={`removed-addition-${baseItem.id}`}>
                    {fieldBadge(`غیرفعال نسبت به قالب: ${baseItem.title}`, 'warning')}
                  </span>
                ))}
            </div>
          ) : null}
        </div>

        <div className="business-payroll-subcard" style={{ marginTop: 12 }}>
          <div className="business-draft-section-title">
            <h3>کسورات اختیاری</h3>
            <button type="button" className="business-payroll-outline-button" onClick={() => setVariablePaymentEditor({ type: 'deduction', item: createEmployeeVariablePaymentItem('deduction') })}>
              <Plus className="h-4 w-4" /> افزودن کسور
            </button>
          </div>
          <p className="contract-benefit-section-lead">کسورات اختیاری این قرارداد را با قالب انتخاب‌شده مقایسه کنید.</p>
          <div className="business-payroll-items" style={{ marginTop: 12 }}>
            {value.deductions.length
              ? value.deductions.map((item) => renderVariableItem(item, baseDeductions.find((baseItem) => baseItem.id === item.id)))
              : <p className="business-payroll-empty">هنوز کسور اختیاری‌ای ثبت نشده است.</p>}
          </div>
          {snapshot && baseDeductions.some((baseItem) => !value.deductions.some((item) => item.id === baseItem.id)) ? (
            <div className="business-payroll-removed-items" style={{ marginTop: 12 }}>
              {baseDeductions
                .filter((baseItem) => !value.deductions.some((item) => item.id === baseItem.id))
                .map((baseItem) => (
                  <span key={`removed-deduction-${baseItem.id}`}>
                    {fieldBadge(`غیرفعال نسبت به قالب: ${baseItem.title}`, 'warning')}
                  </span>
                ))}
            </div>
          ) : null}
        </div>

        <div className="business-payroll-highlight subtle" style={{ marginTop: 12 }}>
          تعداد اضافه‌ها: {formatFaNumber(additionCount, { useGrouping: false })} · تعداد کسورات: {formatFaNumber(deductionCount, { useGrouping: false })}
        </div>
      </StepShell>
    );
  };

  const renderPaymentTypeSection = () => {
    const value = compensation?.paymentType;
    const snapshot = compensation?.templateSnapshot;
    if (!value) return <SectionPlaceholder />;

    const isMainTypeSelected = value.type === DEFAULT_EMPLOYEE_PAYMENT_TYPE;
    const templateType = snapshot?.paymentType?.type ?? DEFAULT_EMPLOYEE_PAYMENT_TYPE;
    const templatePeriod = snapshot?.paymentType?.period ?? 'monthly';
    const typeDifference = snapshot && (templateType !== value.type || templatePeriod !== value.period)
      ? differenceBadge('متفاوت با قالب', 'نوع یا دوره پرداخت حقوق و مزایا با قالب انتخاب‌شده متفاوت است.')
      : snapshot
        ? fieldBadge('همسان با قالب', 'success')
        : null;

    const updatePaymentType = (patch: Partial<{ type: string; period: EmployeePaymentCycle }>) => {
      updateDraft(
        (draft) => ({
          ...draft,
          paymentType: mergeEmployeeDraftPaymentType(draft, value, patch),
        }),
        { dirtyStep: 'paymentType' },
      );
    };

    return (
      <StepShell
        title="نوع پرداخت حقوق و مزایا"
        tag={snapshot ? 'قالب انتخاب‌شده' : 'بدون قالب'}
        description="نوع کلی پرداخت و در صورت انتخاب «دوره‌ای»، بازه پرداخت را مشخص کنید."
        icon={<Wallet className="h-4 w-4" />}
      >
        <section className="business-payroll-subcard">
          <div className="business-draft-section-title">
            <h3>نوع پرداخت</h3>
          </div>
          <div className="business-payroll-chips" role="radiogroup" aria-label="نوع پرداخت حقوق و مزایا">
            {EMPLOYEE_PAYMENT_MAIN_OPTIONS.map((option) => {
              const isDisabled = !option.enabled;
              const isSelected = !isDisabled && value.type === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-disabled={isDisabled}
                  className={[isSelected ? 'is-selected' : '', isDisabled ? 'is-disabled' : ''].filter(Boolean).join(' ')}
                  onClick={() => {
                    if (isDisabled) {
                      setPaymentTypeComingSoonLabel(option.label);
                      return;
                    }
                    updatePaymentType({ type: option.value, period: value.period ?? 'monthly' });
                  }}
                >
                  {option.label}
                  {isDisabled ? <small>در حال توسعه</small> : null}
                </button>
              );
            })}
          </div>
        </section>

        <div className="business-payroll-highlight subtle" style={{ marginTop: 12 }}>
          {typeDifference}
          {!typeDifference ? 'نوع پرداخت فعلی با قالب انتخاب‌شده هم‌راستا است.' : null}
        </div>

        {isMainTypeSelected ? (
          <section className="business-payroll-subcard" style={{ marginTop: 12 }}>
            <div className="business-draft-section-title">
              <h3>دوره پرداخت</h3>
              <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">پیش‌فرض: ماهانه</span>
            </div>
            <div className="business-payroll-chips" role="radiogroup" aria-label="دوره پرداخت حقوق">
              {EMPLOYEE_PAYMENT_CYCLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={value.period === option.value}
                  className={value.period === option.value ? 'is-selected' : ''}
                  onClick={() => updatePaymentType({ type: DEFAULT_EMPLOYEE_PAYMENT_TYPE, period: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </StepShell>
    );
  };

  const saveVariablePayment = (item: VariableTemplateItem) => {
    updateDraft((draft) => {
      const defaults = buildEmployeeDraftCompensationDefaults(draft.templateSnapshot, baseSettings);
      const current = draft.variablePayments ?? defaults.variablePayments;
      const key = item.type === 'addition' ? 'additions' : 'deductions';
      const items = current[key];
      const nextItems = items.some((entry) => entry.id === item.id)
        ? items.map((entry) => (entry.id === item.id ? item : entry))
        : [...items, item];
      return {
        ...draft,
        variablePayments: {
          ...current,
          enabled: true,
          [key]: nextItems,
        },
      };
    });
    setVariablePaymentEditor(null);
  };

  const saveVariablePaymentRules = (item: VariableTemplateItem, rules: CalculationRules) => {
    updateDraft((draft) => {
      const defaults = buildEmployeeDraftCompensationDefaults(draft.templateSnapshot, baseSettings);
      const current = draft.variablePayments ?? defaults.variablePayments;
      const key = item.type === 'addition' ? 'additions' : 'deductions';
      return {
        ...draft,
        variablePayments: {
          ...current,
          enabled: true,
          [key]: current[key].map((entry) => (entry.id === item.id ? { ...entry, calculationRules: rules } : entry)),
        },
      };
    });
    setVariablePaymentRulesDialog(null);
  };

  const deleteVariablePayment = () => {
    if (!deletingVariablePayment) return;
    updateDraft((draft) => {
      const defaults = buildEmployeeDraftCompensationDefaults(draft.templateSnapshot, baseSettings);
      const current = draft.variablePayments ?? defaults.variablePayments;
      const key = deletingVariablePayment.type === 'addition' ? 'additions' : 'deductions';
      const nextAdditions = key === 'additions' ? current.additions.filter((entry) => entry.id !== deletingVariablePayment.id) : current.additions;
      const nextDeductions = key === 'deductions' ? current.deductions.filter((entry) => entry.id !== deletingVariablePayment.id) : current.deductions;
      return {
        ...draft,
        variablePayments: {
          ...current,
          enabled: current.enabled || nextAdditions.length + nextDeductions.length > 0,
          additions: nextAdditions,
          deductions: nextDeductions,
        },
      };
    });
    setDeletingVariablePayment(null);
  };

  const saveMissionRule = (rule: EmployeeMissionRule) => {
    updateDraft((draft) => {
      const defaults = buildEmployeeDraftCompensationDefaults(draft.templateSnapshot, baseSettings);
      const current = draft.mission ?? defaults.mission;
      const exists = current.rules.some((item) => item.id === rule.id);
      return {
        ...draft,
        mission: {
          ...current,
          enabled: true,
          rules: exists ? current.rules.map((item) => (item.id === rule.id ? rule : item)) : [...current.rules, rule],
        },
      };
    });
    setMissionEditor(null);
  };

  const deleteMissionRule = () => {
    if (!deletingMissionRule) return;
    updateDraft((draft) => {
      const defaults = buildEmployeeDraftCompensationDefaults(draft.templateSnapshot, baseSettings);
      const current = draft.mission ?? defaults.mission;
      return {
        ...draft,
        mission: {
          ...current,
          rules: current.rules.filter((item) => item.id !== deletingMissionRule.id),
        },
      };
    });
    setDeletingMissionRule(null);
  };

  const saveContractDraftOnly = () => {
    if (!currentDraft) return;
    const now = new Date().toISOString();
    const nextDraft: EmployeeContractDraft = {
      ...currentDraft,
      status: 'draft',
      updatedAt: now,
      progress: {
        ...currentDraft.progress,
        attachments: { ...currentDraft.progress.attachments, opened: true, dirty: false, saved: true },
      },
    };
    setCurrentDraft(nextDraft);
    persist(drafts.map((item) => (item.id === nextDraft.id ? nextDraft : item)));
    setNotice('قرارداد به عنوان پیش‌نویس ذخیره شد.');
  };

  const finalizeContract = async () => {
    if (!currentDraft) return;
    const requiredErrors = validateStep('timing', currentDraft, employee, supplemental, baseSettings);
    if (Object.keys(requiredErrors).length) {
      setErrors(requiredErrors);
      setFinalizeConfirmOpen(false);
      scrollToStep('timing');
      return;
    }
    setFinalizing(true);
    try {
      const response = await fetch(`/api/employees/${employee.id}/contracts/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: currentDraft }),
      });
      if (!response.ok) throw new Error('finalize failed');
      const now = new Date().toISOString();
      const finalized: EmployeeContractDraft = {
        ...currentDraft,
        status: 'active',
        isCurrent: true,
        finalizedAt: now,
        updatedAt: now,
        progress: Object.fromEntries(
          getEmployeeDraftSteps(currentDraft.usageType).map((step) => [
            step.id,
            { ...currentDraft.progress[step.id], opened: true, completed: true, dirty: false, saved: true },
          ]),
        ) as EmployeeContractDraft['progress'],
      };
      const nextDrafts = drafts.map((item) => (item.id === finalized.id ? finalized : { ...item, isCurrent: item.employeeId === employee.id ? false : item.isCurrent }));
      setCurrentDraft(finalized);
      persist(nextDrafts);
      setFinalizeConfirmOpen(false);
      router.replace(`/employees/${employee.id}`);
    } catch {
      setNotice('ثبت نهایی قرارداد با خطا مواجه شد.');
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="draft-template-flow-page business-payroll-flow" dir="rtl" lang="fa">
      <EmployeeDraftStepperSidebar
        draft={currentDraft}
        activeStep={activeStep}
        onNavigate={(step) => {
          const state = currentDraft.progress[step];
          if (!state?.opened) return;
          scrollToStep(step);
        }}
        onSaveStep={persistStep}
      />

      <aside className="draft-template-flow-sidebar draft-template-flow-report-panel" aria-label="خلاصه">
        <div className="draft-template-flow-sidebar-panel">
          <header className="draft-template-flow-sidebar-header">
            <h2>خلاصه زنده</h2>
            <p>وضعیت این پیش‌نویس به‌صورت لحظه‌ای در این ستون نمایش داده می‌شود.</p>
          </header>
          <MinimalScroll className="draft-template-flow-nav-list" style={{ gap: 12 }}>
            <EmployeeSummaryCard title="اطلاعات کارمند">
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {fieldBadge(`${employee.firstName} ${employee.lastName}`.trim(), 'muted')}
                  {fieldBadge(`کد ملی: ${displayValue(employee.nationalId)}`, 'muted')}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {fieldBadge(`تکمیل اطلاعات: ${employeeCompletion}%`, employeeCompletion >= 70 ? 'success' : 'warning')}
                  {fieldBadge(`وضعیت پرونده: ${employeeCompletion >= 70 ? 'کامل' : 'ناقص'}`, employeeCompletion >= 70 ? 'success' : 'warning')}
                </div>
              </div>
            </EmployeeSummaryCard>

            <EmployeeSummaryCard title="پیشرفت پیش‌نویس">
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {fieldBadge(`مراحل تکمیل‌شده: ${completedCount}`, 'muted')}
                  {fieldBadge(`تفاوت با قالب: ${diffCount}`, currentDraft.templateSnapshot ? 'muted' : 'muted')}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {fieldBadge(`آخرین مرحله: ${getSectionTitle(activeStep, currentDraft.usageType)}`, 'muted')}
                  {fieldBadge(`قالب: ${templateName || 'بدون قالب'}`, 'muted')}
                </div>
              </div>
            </EmployeeSummaryCard>

            <EmployeeSummaryCard title="مشخصات قرارداد">
              <div style={{ display: 'grid', gap: 8, fontSize: 12, lineHeight: 1.9 }}>
                <div>شماره قرارداد: <strong>{currentDraft.contractNumber}</strong></div>
                <div>تاریخ عقد: <strong>{displayValue(currentDraft.timing.contractDate)}</strong></div>
                <div>تاریخ شروع: <strong>{displayValue(currentDraft.timing.startDate)}</strong></div>
                <div>تاریخ پایان: <strong>{displayValue(currentDraft.timing.endDate)}</strong></div>
              </div>
            </EmployeeSummaryCard>

            {currentDraft.usageType === 'payroll_attendance' ? (
              <EmployeeSummaryCard title="حقوق و مزایا">
                <div style={{ display: 'grid', gap: 8, fontSize: 12, lineHeight: 1.9 }}>
                  <div>
                    حقوق پایه روزانه: <strong>{formatMoneyRial(currentDraft.financial.dailyBaseSalary)}</strong>
                  </div>
                  <div>
                    دقایق موظفی روزانه: <strong>{formatDurationMinutes(currentDraft.financial.dailyRequiredMinutes)}</strong>
                  </div>
                  <div>بیمه/مالیات: <strong>{currentDraft.insuranceTax.insuranceEnabled ? 'بیمه فعال' : 'بیمه غیرفعال'} / {currentDraft.insuranceTax.taxEnabled ? 'مالیات فعال' : 'مالیات غیرفعال'}</strong></div>
                  <div>مزایای فعال: <strong>{EMPLOYEE_BENEFIT_KEYS.filter((key) => currentDraft.benefits[key].enabled).length}</strong></div>
                </div>
              </EmployeeSummaryCard>
            ) : (
              <EmployeeSummaryCard title="اطلاعات مالی تردد">
                <div style={{ display: 'grid', gap: 8, fontSize: 12, lineHeight: 1.9 }}>
                  <div>
                    دقایق موظفی روزانه: <strong>{formatDurationMinutes(currentDraft.financial.dailyRequiredMinutes)}</strong>
                  </div>
                  <div>تقسیم هفتگی: <strong>{formatFaNumber(currentDraft.financial.dailyRequiredMinutes * 6)} دقیقه در هفته</strong></div>
                </div>
              </EmployeeSummaryCard>
            )}

            {currentDraft.usageType === 'payroll_attendance' && compensation ? (
              <EmployeeSummaryCard title="مزایای پایان سال و پرداخت متغیر">
                <div style={{ display: 'grid', gap: 8, fontSize: 12, lineHeight: 1.9 }}>
                  <div>
                    عیدی / دوره: <strong>{formatMoneyRial(compensation.benefitsEnd.eidBonus.amount)} / {compensation.benefitsEnd.eidBonus.period === 'monthly' ? 'ماهیانه' : compensation.benefitsEnd.eidBonus.period === 'quarterly' ? 'سه‌ماهه' : compensation.benefitsEnd.eidBonus.period === 'semiAnnual' ? 'شش‌ماهه' : compensation.benefitsEnd.eidBonus.period === 'annual' ? 'سالانه' : 'بدون عیدی'}</strong>
                  </div>
                  <div>
                    سنوات / روش: <strong>{compensation.benefitsEnd.endOfService.enabled ? 'فعال' : 'غیرفعال'} / {compensation.benefitsEnd.endOfService.severancePaymentMethod === 'end_of_work' ? 'پرداخت در پایان همکاری' : 'پرداخت دوره‌ای'}</strong>
                  </div>
                  <div>
                    متغیرات: <strong>{formatFaNumber(compensation.variablePayments.additions.length, { useGrouping: false })} افزایش / {formatFaNumber(compensation.variablePayments.deductions.length, { useGrouping: false })} کاهش</strong>
                  </div>
                  <div>
                    نوع پرداخت: <strong>{compensation.paymentType.period === 'monthly' ? 'پرداخت ماهانه' : 'پرداخت در حال تنظیم'}</strong>
                  </div>
                </div>
              </EmployeeSummaryCard>
            ) : null}

            <EmployeeSummaryCard title="مدارک و تعهدات">
              <div style={{ display: 'grid', gap: 8, fontSize: 12, lineHeight: 1.9 }}>
                <div>این بخش در مراحل بعدی تکمیل می‌شود.</div>
              </div>
            </EmployeeSummaryCard>
          </MinimalScroll>
        </div>
      </aside>

      <main className="draft-template-flow-content business-payroll-content">
        <header className="draft-template-flow-page-header">
          <nav className="draft-template-flow-breadcrumb" aria-label="مسیر صفحه">
            <Link href="/">دسترنج</Link>
            <ChevronLeft className="h-3.5 w-3.5" />
            <button
              type="button"
              className="business-payroll-year-back"
              onClick={() => unsavedLeaveGuard.requestLeave(() => router.push(`/employees/${employee.id}/contract-drafts`))}
            >بازگشت به فهرست پیش‌نویس‌ها</button>
          </nav>
          <div className="business-payroll-title-row">
            <h1>پیش‌نویس قرارداد کارمند</h1>
            <span className="business-payroll-mode-badge">صاحب کسب و کار</span>
            <span>{`${employee.firstName} ${employee.lastName}`.trim()}</span>
            <span>{currentDraft.usageType === 'attendance_only' ? 'فقط تردد' : 'تردد و حقوق و دستمزد'}</span>
            {templateName ? <span>قالب مبنا: {templateName}</span> : null}
          </div>
          <p>تنظیم پیش‌نویس قرارداد برای کارمند انتخاب‌شده</p>
          <div className="business-payroll-header-badges">
            <button
              type="button"
              className="draft-template-flow-action is-secondary"
              onClick={() => unsavedLeaveGuard.requestLeave(() => router.push(`/employees/${employee.id}/contract-drafts`))}
            >
              <ArrowLeft className="h-4 w-4" /> بازگشت به فهرست پیش‌نویس‌ها
            </button>
            <button type="button" className="draft-template-flow-action is-secondary" onClick={() => setEmployeeInfoEditor(true)}>
              تکمیل اطلاعات کارمند
            </button>
            <button type="button" className="draft-template-flow-action is-secondary" onClick={() => setSupplementalOpen(true)}>
              <Edit3 className="h-4 w-4" /> ویرایش اطلاعات پایه
            </button>
          </div>
        </header>

        {notice ? <div className="business-payroll-notice">{notice}</div> : null}

        <div className="business-payroll-sections">
          {stepsToRender.map((step) => {
            const state = currentDraft.progress[step.id];
            if (!state?.opened) return null;
            return (
              <section
                key={step.id}
                id={`employee-draft-${step.id}`}
                tabIndex={-1}
                className={`draft-template-flow-section business-payroll-current-section ${activeStep === step.id ? 'is-current' : ''}`}
                onFocusCapture={() => setActiveStep(step.id)}
              >
                {step.id === 'parties' ? (
                  <StepShell
                    title="مشخصات طرفین قرارداد"
                    tag="آیین‌نامه حقوقی"
                    description="این بخش شامل اطلاعات سازمان و کارمند است که در این قرارداد حضور دارند. لطفاً تمام اطلاعات را با دقت وارد کنید."
                    icon={<ShieldCheck className="h-4 w-4" />}
                  >
                    <ContractFirstPartyCard
                      profile={resolvedBusinessProfile}
                      onEdit={() => setOwnershipEditorOpen(true)}
                    />

                    <EmployeeSupplementalProfileView
                      employeeName={`${employee.firstName} ${employee.lastName}`.trim()}
                      employee={{
                        nationalId: employee.nationalId,
                        maritalStatus: employee.maritalStatus,
                        childrenCount: employee.childrenCount,
                      }}
                      supplemental={supplemental}
                      onEdit={() => setSupplementalOpen(true)}
                    />
                    {renderStepFooter('parties')}
                  </StepShell>
                ) : step.id === 'timing' ? (
                  <StepShell
                    title="مشخصات زمانی و ثبت قرارداد"
                    description="این بخش شامل اطلاعات مربوط به تاریخ‌های قرارداد، شماره ثبت و وضعیت آن است. این اطلاعات برای پیگیری‌های رسمی، مالی و منابع انسانی استفاده می‌شود."
                    titleIcon={<FileText className="h-5 w-5" aria-hidden />}
                    descriptionInfo
                  >
                    <div className="contract-timing-step-stack">
                      <article className="contract-timing-card">
                        <div className="contract-timing-card-head">
                          <h4>تاریخ عقد قرارداد</h4>
                          <ContractTimingLegalBadge />
                        </div>
                        <p className="contract-timing-card-desc">
                          این تاریخ، روز رسمی توافق و عقد قرارداد بین کارفرما و کارگر است و ممکن است با تاریخ آغاز همکاری متفاوت باشد.
                        </p>
                        <ContractTimingDateField
                          label="تاریخ عقد قرارداد"
                          value={formatDateInput(currentDraft.timing.contractDate)}
                          error={errors.timing_contractDate}
                          onChange={(value) => updateTimingField('contractDate', value)}
                        />
                      </article>

                      <article className="contract-timing-card contract-timing-card--registration">
                        <div className="contract-timing-card-head">
                          <h4>شماره ثبت قرارداد</h4>
                        </div>
                        <p className="contract-timing-card-desc has-info">
                          <Info className="h-3.5 w-3.5" aria-hidden />
                          <span>
                            شماره یکتای قرارداد که برای پیگیری‌های اداری، مالی و حقوقی استفاده می‌شود. این شماره باید مطابق
                            با سیستم ثبت قراردادهای سازمان باشد.
                          </span>
                        </p>
                        <ContractTimingRegistrationField
                          label="شماره ثبت قرارداد"
                          value={currentDraft.timing.registrationNumber}
                          placeholder={registrationPlaceholder?.placeholder ?? toPersianDigits('1')}
                          hint={registrationPlaceholder?.hint ?? 'این اولین قرارداد است؛ شماره پیشنهادی ۱'}
                          error={errors.timing_registrationNumber}
                          onChange={(value) =>
                            updateDraft((draft) => ({
                              ...draft,
                              contractNumber: value,
                              timing: { ...draft.timing, registrationNumber: value },
                            }))
                          }
                        />
                      </article>

                      <article className="contract-timing-card">
                        <div className="contract-timing-card-head">
                          <h4>مدت همکاری و پایان قرارداد</h4>
                          <ContractTimingLegalBadge />
                        </div>
                        <p className="contract-timing-card-desc">
                          در این بخش بازه زمانی همکاری تعیین می‌شود؛ این بازه مبنای محاسبه حقوق، بیمه و تعهدات قراردادی است.
                        </p>
                        <div className="contract-timing-date-grid">
                          <ContractTimingDateField
                            label="تاریخ آغاز قرارداد"
                            value={formatDateInput(currentDraft.timing.startDate)}
                            error={errors.timing_startDate}
                            onChange={(value) => updateTimingField('startDate', value)}
                          />
                          <ContractTimingDateField
                            label="تاریخ پایان قرارداد"
                            value={formatDateInput(currentDraft.timing.endDate)}
                            error={errors.timing_endDate}
                            onChange={(value) => updateTimingField('endDate', value)}
                          />
                        </div>
                        {currentDraft.templateSnapshot ? (
                          <div className="contract-timing-template-diff">
                            {currentDraft.timing.durationMonths !== currentDraft.templateSnapshot.timing.durationMonths ? (
                              differenceBadge(
                                'متفاوت با مدت قالب',
                                `مدت پیشنهادی در قالب انتخاب‌شده ${currentDraft.templateSnapshot.timing.durationMonths} ماه است.`,
                              )
                            ) : (
                              fieldBadge('همسان با مدت قالب', 'success')
                            )}
                          </div>
                        ) : null}
                      </article>
                    </div>
                    {renderStepFooter('timing')}
                  </StepShell>
                ) : step.id === 'subject' ? (
                  <StepShell
                    title="موضوع قرارداد"
                    tag="آیین‌نامه داخلی"
                    description="نوع همکاری، حوزه فعالیت و محل انجام کار را برای متن قرارداد مشخص کنید."
                    icon={<FileText className="h-4 w-4" />}
                  >
                    <EmployeeContractSubjectStep
                      subject={currentDraft.subject}
                      onSubjectChange={(patch) => updateDraft((draft) => ({ ...draft, subject: { ...draft.subject, ...patch } }))}
                      templateDiff={{
                        contract:
                          currentDraft.templateSnapshot &&
                          currentDraft.subject.contractType &&
                          currentDraft.subject.contractType !== currentDraft.templateSnapshot.classification.contractType
                            ? differenceBadge(
                                'متفاوت با قالب',
                                `انتخاب این بخش در قالب انتخاب‌شده «${currentDraft.templateSnapshot.classification.contractType || 'ثبت نشده'}» بوده است.`,
                              )
                            : undefined,
                        location:
                          currentDraft.templateSnapshot &&
                          currentDraft.subject.locationGroup &&
                          currentDraft.subject.locationGroup !== currentDraft.templateSnapshot.classification.locationGroup
                            ? differenceBadge(
                                'متفاوت با قالب',
                                `انتخاب این بخش در قالب انتخاب‌شده «${currentDraft.templateSnapshot.classification.locationGroup || 'ثبت نشده'}» بوده است.`,
                              )
                            : undefined,
                      }}
                    />
                    {renderStepFooter('subject')}
                  </StepShell>
                ) : step.id === 'financial' ? (
                  <StepShell
                    title={currentDraft.usageType === 'attendance_only' ? 'اطلاعات مالی تردد' : 'اطلاعات مالی قرارداد'}
                    tag="حقوق و دستمزد"
                    description={currentDraft.usageType === 'attendance_only' ? 'برای قراردادهای تردد، دقایق موظفی روزانه را مشخص کنید.' : 'حقوق پایه روزانه و دقایق موظفی روزانه را مشخص کنید.'}
                    icon={<Wallet className="h-4 w-4" />}
                  >
                    <EmployeeContractFinancialStep
                      financial={currentDraft.financial}
                      templateSnapshot={currentDraft.templateSnapshot}
                      usageType={currentDraft.usageType}
                      errors={errors}
                      onFinancialChange={(patch) => updateDraft((draft) => ({ ...draft, financial: { ...draft.financial, ...patch } }))}
                    />
                    {renderStepFooter('financial')}
                  </StepShell>
                ) : step.id === 'insuranceTax' ? (
                  <StepShell
                    title="بیمه و مالیات"
                    tag="آیین‌نامه حقوقی"
                    description="تعیین نمایید که قرارداد مشمول بیمه و مالیات بوده و مطابق با قوانین مربوطه اعمال می‌گردد یا خیر."
                    icon={<ShieldAlert className="h-4 w-4" />}
                  >
                    <div className="business-payroll-subcard" style={{ marginTop: 10 }}>
                      <div className="business-draft-section-title">
                        <h3>وضعیت بیمه</h3>
                        <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">آیین‌نامه حقوقی</span>
                      </div>
                      <div className="business-payroll-toggle">
                        <button type="button" className={currentDraft.insuranceTax.insuranceEnabled ? 'is-selected' : ''} onClick={() => updateDraft((draft) => ({ ...draft, insuranceTax: { ...draft.insuranceTax, insuranceEnabled: true } }))}>
                          کارگر شامل بیمه می‌شود
                        </button>
                        <button type="button" className={!currentDraft.insuranceTax.insuranceEnabled ? 'is-selected' : ''} onClick={() => updateDraft((draft) => ({ ...draft, insuranceTax: { ...draft.insuranceTax, insuranceEnabled: false } }))}>
                          کارگر شامل بیمه نمی‌شود
                        </button>
                      </div>
                      {currentDraft.templateSnapshot && currentDraft.insuranceTax.insuranceEnabled !== currentDraft.templateSnapshot.insuranceTax.insuranceEnabled ? (
                        <div style={{ marginTop: 10 }}>
                          {differenceBadge(
                            currentDraft.insuranceTax.insuranceEnabled ? 'فعال شده نسبت به قالب' : 'غیرفعال نسبت به قالب',
                            currentDraft.templateSnapshot.insuranceTax.insuranceEnabled ? 'در قالب انتخاب‌شده بیمه فعال بود.' : 'در قالب انتخاب‌شده بیمه غیرفعال بود.',
                          )}
                        </div>
                      ) : null}
                      {currentDraft.insuranceTax.insuranceEnabled ? (
                        <div className="business-payroll-fields two" style={{ marginTop: 10 }}>
                          <label className="business-payroll-field">
                            <span className="business-payroll-field-label">سهم بیمه کارفرما %</span>
                            <span className="business-payroll-input">
                              <input value={moneyInput(currentDraft.insuranceTax.employerInsurancePercent)} onChange={(event) => updateDraft((draft) => ({ ...draft, insuranceTax: { ...draft.insuranceTax, employerInsurancePercent: parseNumber(event.target.value) } }))} />
                              <b>%</b>
                            </span>
                          </label>
                          <label className="business-payroll-field">
                            <span className="business-payroll-field-label">سهم بیمه کارگر %</span>
                            <span className="business-payroll-input">
                              <input value={moneyInput(currentDraft.insuranceTax.employeeInsurancePercent)} onChange={(event) => updateDraft((draft) => ({ ...draft, insuranceTax: { ...draft.insuranceTax, employeeInsurancePercent: parseNumber(event.target.value) } }))} />
                              <b>%</b>
                            </span>
                          </label>
                        </div>
                      ) : null}
                      {currentDraft.templateSnapshot && currentDraft.insuranceTax.insuranceEnabled ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                          {currentDraft.insuranceTax.employerInsurancePercent !== currentDraft.templateSnapshot.insuranceTax.employerInsurancePercent
                            ? differenceBadge('سهم کارفرما متفاوت با قالب', `سهم بیمه کارفرما در قالب انتخاب‌شده ${formatFaNumber(currentDraft.templateSnapshot.insuranceTax.employerInsurancePercent)}٪ است.`)
                            : null}
                          {currentDraft.insuranceTax.employeeInsurancePercent !== currentDraft.templateSnapshot.insuranceTax.employeeInsurancePercent
                            ? differenceBadge('سهم کارگر متفاوت با قالب', `سهم بیمه کارگر در قالب انتخاب‌شده ${formatFaNumber(currentDraft.templateSnapshot.insuranceTax.employeeInsurancePercent)}٪ است.`)
                            : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="business-payroll-subcard" style={{ marginTop: 10 }}>
                      <div className="business-draft-section-title">
                        <h3>وضعیت مالیات</h3>
                        <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">آیین‌نامه حقوقی</span>
                      </div>
                      <div className="business-payroll-toggle">
                        <button type="button" className={currentDraft.insuranceTax.taxEnabled ? 'is-selected' : ''} onClick={() => updateDraft((draft) => ({ ...draft, insuranceTax: { ...draft.insuranceTax, taxEnabled: true } }))}>
                          قرارداد مشمول مالیات می‌شود
                        </button>
                        <button type="button" className={!currentDraft.insuranceTax.taxEnabled ? 'is-selected' : ''} onClick={() => updateDraft((draft) => ({ ...draft, insuranceTax: { ...draft.insuranceTax, taxEnabled: false } }))}>
                          قرارداد مشمول مالیات نمی‌شود
                        </button>
                      </div>
                      {currentDraft.templateSnapshot && currentDraft.insuranceTax.taxEnabled !== currentDraft.templateSnapshot.insuranceTax.taxEnabled ? (
                        <div style={{ marginTop: 10 }}>
                          {differenceBadge(
                            currentDraft.insuranceTax.taxEnabled ? 'فعال شده نسبت به قالب' : 'غیرفعال نسبت به قالب',
                            currentDraft.templateSnapshot.insuranceTax.taxEnabled ? 'در قالب انتخاب‌شده مالیات فعال بود.' : 'در قالب انتخاب‌شده مالیات غیرفعال بود.',
                          )}
                        </div>
                      ) : null}
                      {currentDraft.insuranceTax.taxEnabled ? (
                        <>
                          <div className="business-payroll-toggle" style={{ marginTop: 10 }}>
                            <button type="button" className={currentDraft.insuranceTax.taxPayer === 'employee' ? 'is-selected' : ''} onClick={() => updateDraft((draft) => ({ ...draft, insuranceTax: { ...draft.insuranceTax, taxPayer: 'employee' } }))}>
                              مالیات به عهده کارگر می‌باشد
                            </button>
                            <button type="button" className={currentDraft.insuranceTax.taxPayer === 'employer' ? 'is-selected' : ''} onClick={() => updateDraft((draft) => ({ ...draft, insuranceTax: { ...draft.insuranceTax, taxPayer: 'employer' } }))}>
                              مالیات به عهده کارفرما می‌باشد
                            </button>
                          </div>
                          {currentDraft.templateSnapshot && currentDraft.insuranceTax.taxPayer !== currentDraft.templateSnapshot.insuranceTax.taxPayer ? (
                            <div style={{ marginTop: 10 }}>
                              {differenceBadge('متفاوت با قالب', currentDraft.templateSnapshot.insuranceTax.taxPayer === 'employee' ? 'در قالب انتخاب‌شده مالیات به عهده کارگر بود.' : 'در قالب انتخاب‌شده مالیات به عهده کارفرما بود.')}
                            </div>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                    {renderStepFooter('insuranceTax')}
                  </StepShell>
                ) : step.id === 'benefits' ? (
                  <StepShell
                    title="مزایای پایه و مستمر"
                    tag="آیین‌نامه حقوقی"
                    description="مزایای ثابت و قانونی را در این بخش تعریف کنید."
                    icon={<Wallet className="h-4 w-4" />}
                  >
                    <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                      {benefitSection('workerAllowance')}
                      {benefitSection('housingAllowance')}
                      {benefitSection('childAllowance')}
                      {benefitSection('marriageAllowance')}
                      {benefitSection('seniorityAllowance')}
                    </div>
                    {benefitRulesDialog ? (
                      <CalculationRulesDialog
                        open={Boolean(benefitRulesDialog)}
                        itemTitle={
                          benefitRulesDialog === 'workerAllowance' ? 'بن کارگری'
                          : benefitRulesDialog === 'housingAllowance' ? 'حق مسکن'
                          : benefitRulesDialog === 'childAllowance' ? 'حق اولاد'
                          : benefitRulesDialog === 'marriageAllowance' ? 'حق تأهل'
                          : 'مزد پایه سنوات'
                        }
                        rules={currentDraft.benefits[benefitRulesDialog].calculationRules ?? DEFAULT_FIXED_BENEFIT_RULES}
                        baseRules={currentDraft.templateSnapshot?.benefitRules?.[benefitRulesDialog] ?? baseSettings.benefitRules?.[benefitRulesDialog] ?? DEFAULT_FIXED_BENEFIT_RULES}
                        baseLabel="قالب انتخاب‌شده"
                        differenceLabel="متفاوت با قواعد قالب"
                        effectContext="benefit_or_addition"
                        onClose={() => setBenefitRulesDialog(null)}
                        onSubmit={(next) => {
                          updateDraft((draft) => ({
                            ...draft,
                            benefits: {
                              ...draft.benefits,
                              [benefitRulesDialog]: { ...draft.benefits[benefitRulesDialog], calculationRules: next },
                            },
                          }));
                          setBenefitRulesDialog(null);
                        }}
                      />
                    ) : null}
                    {renderStepFooter('benefits')}
                  </StepShell>
                ) : step.id === 'benefitsEnd' ? (
                  <>
                    {renderBenefitsEndSection()}
                    {renderStepFooter('benefitsEnd')}
                  </>
                ) : step.id === 'variablePayments' ? (
                  <>
                    {renderVariablePaymentsSection()}
                    {renderStepFooter('variablePayments')}
                  </>
                ) : step.id === 'paymentType' ? (
                  <>
                    {renderPaymentTypeSection()}
                    {renderStepFooter('paymentType')}
                  </>
                ) : step.id === 'workTimePayRules' ? (
                  <>
                    <EmployeeContractWorkTimePayStep
                      workTimePayRules={compensation?.workTimePayRules}
                      templateSnapshot={compensation?.templateSnapshot ?? null}
                      financial={currentDraft.financial}
                      tenantSettings={baseSettings}
                      currentTemplate={currentTemplate}
                      errors={errors}
                      onWorkTimePayRulesChange={(workTimePayRules) =>
                        updateDraft((draft) => ({ ...draft, workTimePayRules }), { dirtyStep: 'workTimePayRules' })
                      }
                    />
                    {renderStepFooter('workTimePayRules')}
                  </>
                ) : step.id === 'leave' ? (
                  <>
                    <EmployeeContractLeaveStep
                      leave={compensation?.leave}
                      templateSnapshot={compensation?.templateSnapshot ?? null}
                      financial={currentDraft.financial}
                      tenantSettings={baseSettings}
                      errors={errors}
                      onLeaveChange={(leave) => updateDraft((draft) => ({ ...draft, leave }), { dirtyStep: 'leave' })}
                    />
                    {renderStepFooter('leave')}
                  </>
                ) : step.id === 'mission' ? (
                  <>
                    <EmployeeContractMissionStep
                      mission={compensation?.mission}
                      templateSnapshot={compensation?.templateSnapshot ?? null}
                      derived={derived}
                      onMissionChange={(patch) =>
                        updateDraft(
                          (draft) => ({
                            ...draft,
                            mission: { ...(draft.mission ?? compensation!.mission!), ...patch },
                          }),
                          { dirtyStep: 'mission' },
                        )
                      }
                      onEditRule={setMissionEditor}
                      onDeleteRule={setDeletingMissionRule}
                      onAddRule={() =>
                        setMissionEditor({
                          id: `mission-${Date.now()}`,
                          title: 'ماموریت جدید',
                          coefficient: 1,
                          paymentBase: 'base_salary',
                          active: true,
                        })
                      }
                    />
                    {renderStepFooter('mission')}
                  </>
                ) : step.id === 'specialCommitments' ? (
                  <>
                    <EmployeeContractCommitmentsStep
                      specialCommitments={compensation?.specialCommitments}
                      templateSnapshot={compensation?.templateSnapshot ?? null}
                      draftId={currentDraft.id}
                      onCommitmentsChange={(specialCommitments) =>
                        updateDraft((draft) => ({ ...draft, specialCommitments }), { dirtyStep: 'specialCommitments' })
                      }
                    />
                    {renderStepFooter('specialCommitments')}
                  </>
                ) : step.id === 'attachments' ? (
                  <EmployeeContractAttachmentsStep
                    attachments={compensation?.attachments}
                    draftId={currentDraft.id}
                    onAttachmentsChange={(attachments) =>
                      updateDraft((draft) => ({ ...draft, attachments }), { dirtyStep: 'attachments' })
                    }
                    onSaveDraft={saveContractDraftOnly}
                    onFinalize={() => setFinalizeConfirmOpen(true)}
                  />
                ) : (
                  <StepShell
                    title={step.title}
                    tag="در ادامه"
                    description={step.detail}
                    icon={<CircleAlert className="h-4 w-4" />}
                  >
                    <SectionPlaceholder />
                    {renderStepFooter(step.id)}
                  </StepShell>
                )}
              </section>
            );
          })}
        </div>
      </main>

      <BusinessOwnershipProfileEditor
        open={ownershipEditorOpen}
        store={accountProfilePayload.store}
        meta={accountProfilePayload.meta}
        onCancel={() => setOwnershipEditorOpen(false)}
        onSubmit={saveOwnershipProfile}
      />

      <EmployeeSupplementalProfileEditor
        open={supplementalOpen}
        employeeName={`${employee.firstName} ${employee.lastName}`.trim()}
        value={supplemental}
        employeeMeta={{
          nationalId: employee.nationalId,
          maritalStatus: employee.maritalStatus,
          childrenCount: employee.childrenCount,
        }}
        onCancel={() => setSupplementalOpen(false)}
        onSubmit={createOrUpdateSupplemental}
      />
      <EmployeeSupplementalProfileEditor
        open={employeeInfoEditor}
        employeeName={`${employee.firstName} ${employee.lastName}`.trim()}
        value={supplemental}
        employeeMeta={{
          nationalId: employee.nationalId,
          maritalStatus: employee.maritalStatus,
          childrenCount: employee.childrenCount,
        }}
        onCancel={() => setEmployeeInfoEditor(false)}
        onSubmit={createOrUpdateSupplemental}
      />
      <EmployeeVariablePaymentEditorDialog
        open={Boolean(variablePaymentEditor)}
        initialType={variablePaymentEditor?.type ?? 'addition'}
        initialItem={variablePaymentEditor?.item ?? null}
        baseItem={
          variablePaymentEditor
            ? (
                compensation?.templateSnapshot?.variablePayments?.[variablePaymentEditor.type === 'addition' ? 'additions' : 'deductions'].find(
                  (item) => item.id === variablePaymentEditor.item?.id,
                ) ?? null
              )
            : null
        }
        monthlyBaseSalary={derived.monthlyBaseSalary}
        grossPay={derived.grossPay}
        onClose={() => {
          setVariablePaymentEditor(null);
        }}
        onSubmit={saveVariablePayment}
      />
      {variablePaymentRulesDialog ? (
        <CalculationRulesDialog
          open={Boolean(variablePaymentRulesDialog)}
          itemTitle={variablePaymentRulesDialog.title}
          rules={variablePaymentRulesDialog.calculationRules ?? (variablePaymentRulesDialog.type === 'addition' ? DEFAULT_OPTIONAL_ADDITION_RULES : DEFAULT_OPTIONAL_DEDUCTION_RULES)}
          baseRules={
            compensation?.templateSnapshot?.variablePayments?.[variablePaymentRulesDialog.type === 'addition' ? 'additions' : 'deductions'].find(
              (item) => item.id === variablePaymentRulesDialog.id,
            )?.calculationRules ?? null
          }
          baseLabel="قالب انتخاب‌شده"
          differenceLabel="متفاوت با قواعد قالب"
          effectContext={variablePaymentRulesDialog.type === 'addition' ? 'benefit_or_addition' : 'deduction'}
          onClose={() => setVariablePaymentRulesDialog(null)}
          onSubmit={(next) => saveVariablePaymentRules(variablePaymentRulesDialog, next)}
        />
      ) : null}
      <ConfirmDialog
        open={Boolean(deletingVariablePayment)}
        title="حذف آیتم پرداخت متغیر"
        description={deletingVariablePayment ? `آیا از حذف «${deletingVariablePayment.title}» مطمئن هستید؟` : ''}
        confirmLabel="حذف"
        cancelLabel="انصراف"
        tone="danger"
        onConfirm={deleteVariablePayment}
        onCancel={() => setDeletingVariablePayment(null)}
      />
      <EmployeeMissionRuleDialog
        open={Boolean(missionEditor)}
        initialRule={missionEditor}
        monthlyBaseSalary={derived.monthlyBaseSalary}
        grossPay={derived.grossPay}
        onClose={() => setMissionEditor(null)}
        onSubmit={saveMissionRule}
      />
      <ConfirmDialog
        open={Boolean(deletingMissionRule)}
        title="حذف قاعده ماموریت"
        description={deletingMissionRule ? `آیا از حذف «${deletingMissionRule.title}» مطمئن هستید؟` : ''}
        confirmLabel="حذف"
        cancelLabel="انصراف"
        tone="danger"
        onConfirm={deleteMissionRule}
        onCancel={() => setDeletingMissionRule(null)}
      />
      <ConfirmDialog
        open={Boolean(paymentTypeComingSoonLabel)}
        title="در حال توسعه"
        description={
          paymentTypeComingSoonLabel
            ? `گزینه «${paymentTypeComingSoonLabel}» هنوز فعال نشده و به‌زودی در دسترس قرار می‌گیرد.`
            : ''
        }
        confirmLabel="متوجه شدم"
        cancelLabel="بستن"
        onConfirm={() => setPaymentTypeComingSoonLabel(null)}
        onCancel={() => setPaymentTypeComingSoonLabel(null)}
      />
      <ConfirmDialog
        open={finalizeConfirmOpen}
        title="ثبت نهایی و شروع قرارداد"
        description="با ثبت نهایی، این قرارداد به عنوان قرارداد جاری کارمند فعال می‌شود و مبنای محاسبات درخواست‌ها، مرخصی، اضافه‌کاری و اطلاعات کارمند خواهد بود."
        confirmLabel={finalizing ? 'در حال ثبت...' : 'تأیید و شروع قرارداد'}
        cancelLabel="انصراف"
        onConfirm={finalizeContract}
        onCancel={() => setFinalizeConfirmOpen(false)}
      />
      <UnsavedChangesDialog
        open={unsavedLeaveGuard.dialogOpen}
        saving={unsavedLeaveGuard.saving}
        onSaveAndLeave={unsavedLeaveGuard.confirmSaveAndLeave}
        onDiscardAndLeave={unsavedLeaveGuard.confirmDiscardAndLeave}
        onCancel={unsavedLeaveGuard.closeDialog}
      />
    </div>
  );
}

function validateStep(
  step: EmployeeContractDraftStepId,
  draft: EmployeeContractDraft | null,
  employee: EmployeeDraftEmployee,
  supplemental: EmployeeSupplementalProfile,
  baseSettings: PayrollSettings,
) {
  const errors: Record<string, string> = {};
  void employee;
  void supplemental;
  void baseSettings;
  if (!draft) return errors;
  if (step === 'timing') {
    if (!draft.timing.contractDate) errors.timing_contractDate = 'تاریخ عقد قرارداد الزامی است';
    if (!draft.timing.registrationNumber) errors.timing_registrationNumber = 'شماره قرارداد الزامی است';
    if (!draft.timing.startDate) errors.timing_startDate = 'تاریخ آغاز قرارداد الزامی است';
    if (!draft.timing.endDate) errors.timing_endDate = 'تاریخ پایان قرارداد الزامی است';
    if (draft.timing.startDate && draft.timing.endDate && new Date(draft.timing.endDate) <= new Date(draft.timing.startDate)) {
      errors.timing_endDate = 'تاریخ پایان قرارداد باید بعد از تاریخ آغاز باشد';
    }
  }
  if (step === 'financial') {
    if (!Number.isFinite(draft.financial.dailyRequiredMinutes) || draft.financial.dailyRequiredMinutes <= 0) {
      errors.financial_dailyRequiredMinutes = 'مقدار باید بیشتر از صفر باشد';
    }
    if (draft.usageType === 'payroll_attendance') {
      if (!Number.isFinite(draft.financial.dailyBaseSalary) || draft.financial.dailyBaseSalary <= 0) {
        errors.financial_dailyBaseSalary = 'مقدار باید بیشتر از صفر باشد';
      }
    }
  }
  if (step === 'benefitsEnd') {
    if (draft.benefitsEnd?.eidBonus.period !== 'none') {
      if (!Number.isFinite(draft.benefitsEnd?.eidBonus.amount ?? Number.NaN) || (draft.benefitsEnd?.eidBonus.amount ?? 0) < 0) {
        errors.benefitsEnd_eidBonusAmount = 'مبلغ عیدی باید معتبر باشد';
      }
    }
  }
  if (step === 'workTimePayRules' || step === 'leave') {
    const resolved = resolveEmployeeDraftCompensation(draft, baseSettings, null);
    const payrollSettings: PayrollSettings = {
      ...baseSettings,
      financial: draft.financial,
      workTimePayRules: resolved.workTimePayRules,
      leave: resolved.leave,
    };
    Object.assign(errors, validatePayrollStep(step === 'workTimePayRules' ? 'overtime' : 'leave', payrollSettings));
  }
  if (step === 'mission') {
    const resolved = resolveEmployeeDraftCompensation(draft, baseSettings, null);
    if (!resolved.mission.rules.length) {
      errors.mission_rules = 'حداقل یک قاعده ماموریت باید ثبت شود.';
    }
  }
  return errors;
}
