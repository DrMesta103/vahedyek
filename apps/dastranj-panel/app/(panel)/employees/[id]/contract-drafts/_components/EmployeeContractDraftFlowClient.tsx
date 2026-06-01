'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  Info,
  RotateCcw,
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
import { DraftShowcaseField, DraftShowcaseFieldBadge, DraftShowcaseFields } from '../../../../../components/DraftShowcaseField';
import { MinimalScroll } from '../../../../../components/MinimalScroll';
import { CalculationRulesBadges, CalcRulesDiffBadge, CalcRulesEditButton, CalculationRulesDialog } from '../../../../../components/CalculationRulesChips';
import { PanelFormModal, PanelFormModalActions } from '../../../../../components/PanelFormModal';
import { UnsavedChangesDialog, useUnsavedLeaveGuard } from '../../../../../components/UnsavedChangesGuard';
import { formatPersianYmd, getPersianPartsFromDate, parsePersianYmd, persianToDate } from '../../../../../lib/calendar-dates';
import { normalizePersianDateInput } from '../../../../../lib/calendar-events';
import { formatFaNumber, formatPersianJalaliDate, toPersianDigits } from '../../../../../lib/format-fa';
import { formatPersianDate } from '../../../../../lib/format-date';
import { CONTRACT_DRAFT_TEMPLATES_STORAGE_KEY, normalizeContractDraftTemplate, type ContractDraftTemplate } from '../../../../../lib/contract-draft-templates';
import {
  DEFAULT_PAYROLL_SETTINGS,
  DEFAULT_FIXED_BENEFIT_RULES,
  getActiveTenantStorageId,
  getPayrollSettingsStorageKey,
  normalizePayrollSettings,
  type CalculationRules,
  type PayrollSettings,
  type TaxBracket,
} from '../../../../../lib/payroll-business-settings';
import { EmployeeSupplementalProfileEditor } from '../../_components/EmployeeSupplementalProfileEditor';
import { EmployeeSupplementalProfileView } from '../../_components/EmployeeSupplementalProfileView';
import { computeSupplementalCompleteness } from '../../../../../lib/employee-supplemental-fields';
import {
  commitDefaultNamingPattern,
  type NamingPatternContext,
} from '../../../../../lib/naming-patterns';
import {
  createInitialEmployeeContractDraft,
  EMPLOYEE_BENEFIT_KEYS,
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
  type EmployeeContractDraft,
  type EmployeeContractDraftStepId,
  type EmployeeContractDraftTemplateChoice,
  type EmployeeContractDraftUsageType,
  type EmployeeSupplementalProfile,
} from '../../../../../lib/employee-contract-drafts';

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

function buildBusinessProfileFromApi(payload: AccountProfileApiResponse | null | undefined): BusinessProfile | null {
  const ownership = payload?.store?.ownership;
  const owner = payload?.meta?.owner;
  if (!ownership && !owner) return null;

  return {
    ownershipKind: ownership?.ownershipKind,
    companyName: ownership?.companyName ?? null,
    brandName: ownership?.brandName ?? null,
    legalName: ownership?.legalName ?? null,
    registrationNumber: ownership?.registrationNumber ?? null,
    nationalId: ownership?.nationalId ?? null,
    taxFileNumber: ownership?.taxFileNumber ?? null,
    economicCode: ownership?.economicCode ?? null,
    ownerName: owner?.fullName ?? null,
    contactEmail: owner?.email ?? null,
    phone: owner?.mobile ?? null,
    address: null,
  };
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

function ContractFirstPartyCard({ profile }: { profile: BusinessProfile | null | undefined }) {
  const display = buildBusinessPartyFirstDisplay(profile);
  const IdentityIcon = display?.kind === 'natural' ? UserRound : Building2;

  return (
    <div className="business-payroll-subcard contract-party-card">
      <div className="business-draft-section-title">
        <h3>طرف اول قرارداد</h3>
        <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">کارفرما</span>
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
            <div className="contract-party-card-footer">
              {fieldBadge('اطلاعات کارفرما ناقص است', 'warning')}
              <Link href="/business-settings/profile" className="draft-template-flow-action is-primary">
                تکمیل اطلاعات کسب و کار
              </Link>
            </div>
          ) : null}
        </>
      ) : (
        <div className="contract-party-card-footer">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {fieldBadge('اطلاعات کارفرما ناقص است', 'warning')}
            {fieldBadge('پروفایل کسب و کار یافت نشد', 'warning')}
          </div>
          <Link href="/business-settings/profile" className="draft-template-flow-action is-primary" style={{ width: 'fit-content' }}>
            تکمیل اطلاعات کسب و کار
          </Link>
        </div>
      )}
    </div>
  );
}

const CONTRACT_TYPE_GROUPS = [
  {
    title: 'قراردادهای رسمی و استخدام دائم',
    options: ['استخدام دائم تمام‌وقت', 'استخدام دائم پاره‌وقت', 'استخدام با دوره آزمایشی اولیه', 'استخدام با مزایای کامل', 'استخدام داخلی سازمان'],
  },
  {
    title: 'قراردادهای موقت و پروژه‌ای',
    options: ['قرارداد مدت‌معین', 'قرارداد پروژه‌ای', 'قرارداد فصلی', 'قرارداد جایگزینی موقت', 'قرارداد تا پایان مأموریت/پروژه'],
  },
  {
    title: 'قراردادهای نیمه‌وقت و منعطف',
    options: ['نیمه‌وقت ثابت', 'ساعتی', 'شیفتی منعطف', 'دورکاری منعطف', 'همکاری شناور'],
  },
  {
    title: 'قراردادهای آزمایشی و آموزشی',
    options: ['دوره آزمایشی استخدام', 'کارآموزی', 'آموزش حین کار', 'دوره مهارت‌آموزی', 'همکاری آموزشی بدون تعهد استخدام'],
  },
  {
    title: 'قراردادهای ویژه و خاص',
    options: ['قرارداد با شرایط خاص پرداخت', 'قرارداد محرمانه/حساس', 'قرارداد با دسترسی ویژه', 'قرارداد کوتاه‌مدت اضطراری', 'قرارداد ویژه مدیران یا افراد کلیدی'],
  },
  {
    title: 'قراردادهای مشاوره‌ای و تخصصی',
    options: ['مشاوره ساعتی', 'مشاوره پروژه‌ای', 'خدمات تخصصی', 'قرارداد فریلنسری', 'قرارداد پیمانکاری فردی'],
  },
] as const;

const JOB_GROUPS = [
  { title: 'مدیریتی و سرپرستی', options: ['مدیر واحد', 'سرپرست تیم', 'مدیر پروژه', 'مدیر عملیاتی', 'مسئول شیفت'] },
  { title: 'کارشناسی و فنی', options: ['کارشناس فنی', 'تکنسین', 'کارشناس کنترل کیفیت', 'کارشناس نگهداری و تعمیرات', 'کارشناس اجرایی'] },
  { title: 'پشتیبانی اداری', options: ['امور اداری', 'دفتر و دبیرخانه', 'پذیرش', 'خدمات عمومی', 'بایگانی و اسناد'] },
  { title: 'فروش و بازاریابی', options: ['فروش حضوری', 'فروش تلفنی', 'بازاریابی دیجیتال', 'پشتیبانی مشتری', 'مدیریت ارتباط با مشتری'] },
  { title: 'حسابداری و مالی', options: ['حسابداری', 'خزانه‌داری', 'حقوق و دستمزد', 'حسابرسی داخلی', 'امور مالیاتی'] },
  { title: 'منابع انسانی', options: ['جذب و استخدام', 'آموزش', 'امور پرسنلی', 'ارزیابی عملکرد', 'رفاه و مزایا'] },
  { title: 'فناوری اطلاعات', options: ['برنامه‌نویسی', 'پشتیبانی IT', 'شبکه و زیرساخت', 'امنیت اطلاعات', 'تحلیل سیستم'] },
  { title: 'حمل و نقل', options: ['راننده', 'پیک', 'لجستیک', 'توزیع', 'حمل بار'] },
  { title: 'تولید و عملیات', options: ['اپراتور تولید', 'کارگر خط تولید', 'کنترل تولید', 'انبارداری', 'بسته‌بندی'] },
] as const;

const LOCATION_MAIN_GROUPS = [
  'دسته‌بندی بر اساس نوع حضور فیزیکی',
  'دسته‌بندی بر اساس نوع محیط کاری',
  'دسته‌بندی بر اساس ارتباط با مشتری و ذینفعان',
  'دسته‌بندی بر اساس پویایی و جابجایی شغلی',
] as const;

const PHYSICAL_LOCATION_OPTIONS = [
  { label: 'ثابت', helper: 'محل کار تغییر نمی‌کند و همواره مشخص است.' },
  { label: 'دورکاری', helper: 'کار از خارج از محل سازمان انجام می‌شود.' },
  { label: 'ترکیبی / هیبریدی', helper: 'بخشی از کار حضوری و بخشی به‌صورت دورکاری انجام می‌شود.' },
  { label: 'حضوری شیفتی', helper: 'حضور فیزیکی بر اساس شیفت‌های کاری انجام می‌شود.' },
  { label: 'حضور موردی', helper: 'حضور در محل کار فقط در زمان‌های مشخص یا موردنیاز انجام می‌شود.' },
  { label: 'شناور', helper: 'زمان و محل حضور می‌تواند بر اساس توافق تغییر کند.' },
] as const;

const ENVIRONMENT_LOCATION_OPTIONS = ['دفتر اداری', 'کارخانه', 'کارگاه', 'فروشگاه / شعبه', 'انبار', 'سایت پروژه', 'مرکز تماس', 'محیط عملیاتی', 'محل مشتری'] as const;
const RELATION_LOCATION_OPTIONS = ['بدون ارتباط مستقیم با مشتری', 'ارتباط مستقیم با مشتری', 'ارتباط با تأمین‌کننده', 'ارتباط با پیمانکار', 'ارتباط با سازمان‌های بیرونی', 'نماینده سازمان نزد مشتری', 'کار در محل مشتری'] as const;
const DYNAMIC_LOCATION_OPTIONS = ['ثابت', 'چندبخشی', 'پروژه‌ای', 'مأموریتی', 'سفرهای بین‌المللی', 'بین شعب', 'میدانی', 'سیار'] as const;

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

function countDifferences(draft: EmployeeContractDraft) {
  const snapshot = draft.templateSnapshot;
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
  return count;
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

function validateTaxBrackets(brackets: TaxBracket[]) {
  for (const bracket of brackets) {
    if (!Number.isFinite(bracket.from) || !Number.isFinite(bracket.to) || !Number.isFinite(bracket.percent)) return 'همه فیلدهای جدول مالیاتی الزامی هستند.';
    if (bracket.from >= bracket.to) return 'مقدار «از» باید کمتر از «تا» باشد.';
    if (bracket.percent < 0 || bracket.percent > 100) return 'درصد باید بین ۰ تا ۱۰۰ باشد.';
  }
  const sorted = [...brackets].sort((a, b) => a.from - b.from);
  for (let index = 1; index < sorted.length; index += 1) {
    const prev = sorted[index - 1];
    const current = sorted[index];
    if (current.from < prev.to) return 'بازه مالیاتی با بازه دیگر تداخل دارد.';
  }
  return '';
}

function getTemplateBracketState(draft: EmployeeContractDraft, bracket: TaxBracket) {
  const base = draft.templateSnapshot?.insuranceTax.taxBrackets.find((item) => item.id === bracket.id);
  if (!base) {
    return differenceBadge('اختصاصی این پیش‌نویس', 'این بازه در قالب انتخاب‌شده وجود نداشت.');
  }
  if (base.from !== bracket.from || base.to !== bracket.to || base.percent !== bracket.percent) {
    return differenceBadge('متفاوت با جدول مالیات قالب', 'این بازه با قالب انتخاب‌شده تفاوت دارد.');
  }
  return fieldBadge('همسان با قالب', 'success');
}

function getBenefitStateLabel(
  draft: EmployeeContractDraft,
  key: keyof EmployeeContractDraft['benefits'],
  baseSettings: PayrollSettings,
) {
  const item = draft.benefits[key];
  const templateAmount = draft.templateSnapshot?.benefits[key];
  const legalAmount = baseSettings.benefits[key];
  if (templateAmount !== undefined) {
    if (!item.enabled && templateAmount) return differenceBadge('غیرفعال نسبت به قالب', 'در قالب انتخاب‌شده این مورد فعال بود.');
    if (item.enabled && !templateAmount) return differenceBadge('فعال شده نسبت به قالب', 'در قالب انتخاب‌شده این مورد غیرفعال بود.');
    if (item.enabled && item.amount !== templateAmount) return differenceBadge('متفاوت با قالب', `مقدار این فیلد در قالب انتخاب‌شده ${money(templateAmount)} است.`);
    if (!item.enabled && !templateAmount) return fieldBadge('همسان با قالب', 'success');
  }
  if (item.enabled && item.amount < legalAmount) return fieldBadge('کمتر از حداقل قانون کار', 'warning');
  if (item.enabled && item.amount === legalAmount) return fieldBadge('برابر با مبنای قانون کار', 'success');
  return null;
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

function createBlankTaxBracket(id = `tax-${Date.now()}`): TaxBracket {
  return { id, from: Number.NaN, to: Number.NaN, percent: Number.NaN };
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

function TaxBracketDialog({
  open,
  bracket,
  existing,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  bracket: TaxBracket | null;
  existing: TaxBracket[];
  onCancel: () => void;
  onSubmit: (bracket: TaxBracket) => void;
}) {
  const [draft, setDraft] = useState<TaxBracket>(bracket ?? createBlankTaxBracket());
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setDraft(bracket ?? createBlankTaxBracket());
    setError('');
  }, [bracket, open]);

  const submit = () => {
    const validation = validateTaxBrackets(existing.filter((item) => item.id !== draft.id).concat(draft));
    if (validation) {
      setError(validation);
      return;
    }
    onSubmit(draft);
  };

  return (
    <PanelFormModal
      open={open}
      title={bracket ? 'ویرایش بازه مالیاتی' : 'افزودن بازه مالیاتی'}
      lead="بازه‌های مالیاتی باید بدون همپوشانی و با ترتیب صحیح ثبت شوند."
      onClose={onCancel}
      error={error}
      footer={<PanelFormModalActions submitLabel="ثبت بازه" onSubmit={submit} onCancel={onCancel} />}
    >
      <div className="business-draft-dialog">
        <div className="business-draft-option-grid">
          <label className="business-draft-field">
            <span>از</span>
            <input value={Number.isFinite(draft.from) ? moneyInput(draft.from) : ''} onChange={(event) => setDraft((current) => ({ ...current, from: parseNumber(event.target.value) }))} />
          </label>
          <label className="business-draft-field">
            <span>تا</span>
            <input value={Number.isFinite(draft.to) ? moneyInput(draft.to) : ''} onChange={(event) => setDraft((current) => ({ ...current, to: parseNumber(event.target.value) }))} />
          </label>
          <label className="business-draft-field">
            <span>درصد</span>
            <input value={Number.isFinite(draft.percent) ? toPersianDigits(String(draft.percent)) : ''} onChange={(event) => setDraft((current) => ({ ...current, percent: parseNumber(event.target.value) }))} />
          </label>
        </div>
      </div>
    </PanelFormModal>
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
    const patternContext: NamingPatternContext = {
      date: new Date().toISOString().slice(0, 10),
      employee: {
        name: `${employee.firstName} ${employee.lastName}`.trim(),
        code: employee.personnelCode,
        nationalCode: employee.nationalId,
        jobTitle: supplemental.jobTitle,
      },
      business: {
        name: businessProfile?.brandName?.trim() || businessProfile?.legalName?.trim() || '',
      },
      contract: {
        type: selectedTemplate?.data.classification.contractType || usageLabel(usageType),
      },
      template: {
        type: selectedTemplate?.name ?? '',
      },
    };
    const existingNumbers = allDrafts.flatMap((draft) => [draft.contractNumber, draft.timing.registrationNumber]).filter(Boolean);
    const generatedNumber =
      commitDefaultNamingPattern({
        usageType: 'contract_number',
        context: patternContext,
        existingOutputs: existingNumbers,
      });
    const nextDraft = createInitialEmployeeContractDraft({
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
      usageType,
      drafts: allDrafts,
      businessProfile,
      template: selectedTemplate,
      baseSettings,
      supplemental,
      contractNumberOverride: generatedNumber,
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
  const jobSubType = subject.responsibility.trim();
  const templateMeta = draft.templateName
    ? draft.templateName
    : 'بدون قالب مبنا';
  const templateBaseYear = draft.templateSnapshot
    ? formatFaNumber(draft.templateSnapshot.baseSettingsYear, { useGrouping: false })
    : null;
  const differenceCount = countDifferences(draft);

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

  const persist = (nextDrafts: EmployeeContractDraft[]) => {
    setDrafts(nextDrafts);
    persistEmployeeDrafts(nextDrafts);
  };

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
  const [activeStep, setActiveStep] = useState<EmployeeContractDraftStepId>('parties');
  const [supplementalOpen, setSupplementalOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState(false);
  const [taxBracketEditor, setTaxBracketEditor] = useState<{ open: boolean; bracket: TaxBracket | null }>({ open: false, bracket: null });
  const [employeeInfoEditor, setEmployeeInfoEditor] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState('');
  const [currentDraft, setCurrentDraft] = useState<EmployeeContractDraft | null>(null);
  const [benefitRulesDialog, setBenefitRulesDialog] = useState<keyof EmployeeContractDraft['benefits'] | null>(null);

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
        // keep the prop value when the API request fails
      }
    };

    void loadAccountProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const resolvedBusinessProfile = accountProfile ?? businessProfile;

  useEffect(() => {
    if (!loaded || !activeDraft) return;
    const template = activeDraft.templateId ? templates.find((item) => item.id === activeDraft.templateId) ?? null : null;
    const snapshot = activeDraft.templateSnapshot ?? (template ? {
      ...createInitialEmployeeContractDraft({
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
        usageType: activeDraft.usageType,
        drafts,
        businessProfile,
        template,
        baseSettings: readSettingsForTemplate(template),
        supplemental: supplementalProfiles[employee.id] ?? getDefaultEmployeeSupplementalProfile(),
      }).templateSnapshot,
    } : null);
    const draft = snapshot && !activeDraft.templateSnapshot ? { ...activeDraft, templateSnapshot: snapshot } : activeDraft;
    if (draft !== activeDraft) {
      const next = drafts.map((item) => (item.id === draft.id ? draft : item));
      persist(next);
    }
    setCurrentDraft(draft);
    setActiveStep(getCurrentStepId(draft));
  }, [activeDraft, businessProfile, drafts, employee.firstName, employee.id, employee.lastName, loaded, persist, supplementalProfiles, templates]);

  const supplemental = supplementalProfiles[employee.id] ?? getDefaultEmployeeSupplementalProfile();
  const baseSettings = currentDraft?.templateId ? readSettingsForTemplate(templates.find((item) => item.id === currentDraft.templateId) ?? null) : DEFAULT_PAYROLL_SETTINGS;
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

  const regenerateRegistrationNumber = () => {
    if (!currentDraft) return;
    const patternContext: NamingPatternContext = {
      date: currentDraft.timing.contractDate || new Date().toISOString().slice(0, 10),
      employee: {
        name: currentDraft.employeeName,
        code: employee.personnelCode,
        nationalCode: employee.nationalId,
        jobTitle: supplemental.jobTitle,
      },
      business: {
        name: resolvedBusinessProfile?.brandName?.trim() || resolvedBusinessProfile?.legalName?.trim() || '',
      },
      contract: {
        type: currentDraft.subject.contractType || usageLabel(currentDraft.usageType),
      },
      template: {
        type: currentDraft.templateName ?? '',
      },
    };
    const existingNumbers = drafts
      .filter((draft) => draft.id !== currentDraft.id)
      .flatMap((draft) => [draft.contractNumber, draft.timing.registrationNumber])
      .filter(Boolean);
    const patternedNumber =
      commitDefaultNamingPattern({
        usageType: 'contract_number',
        context: patternContext,
        existingOutputs: existingNumbers,
      });
    if (patternedNumber) {
      updateDraft((draft) => ({
        ...draft,
        contractNumber: patternedNumber,
        timing: { ...draft.timing, registrationNumber: patternedNumber },
      }));
      return;
    }
    const prefix = `CN-${new Date().getFullYear()}-`;
    const nextIndex = drafts.filter((draft) => draft.contractNumber.startsWith(prefix)).length + 1;
    const nextNumber = `${prefix}${String(nextIndex).padStart(3, '0')}`;
    updateDraft((draft) => ({
      ...draft,
      contractNumber: nextNumber,
      timing: { ...draft.timing, registrationNumber: nextNumber },
    }));
  };

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
    setNotice('ØªØºÛŒÛŒØ±Ø§Øª Ø°Ø®ÛŒØ±Ù‡ Ø´Ø¯.');
    return true;
  };

  const unsavedLeaveGuard = useUnsavedLeaveGuard({
    hasUnsavedChanges,
    onSaveAndLeave: saveDirtyStepsAndLeave,
    onBrowserBack: () => router.push(`/employees/${employee.id}/contract-drafts`),
  });

  const completedCount = currentDraft ? getProgressCompleted(currentDraft) : 0;
  const diffCount = currentDraft ? countDifferences(currentDraft) : 0;
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
    const label = key === 'workerAllowance'
      ? 'بن کارگری'
      : key === 'housingAllowance'
        ? 'حق مسکن'
        : key === 'childAllowance'
          ? 'حق اولاد'
          : key === 'marriageAllowance'
            ? 'حق تأهل'
            : 'مزد پایه سنوات';
    const description =
      key === 'workerAllowance'
        ? 'مبلغ بن یا کمک هزینه معیشت ماهانه'
        : key === 'housingAllowance'
          ? 'کمک هزینه مسکن ماهانه'
          : key === 'childAllowance'
            ? 'مبلغ مرتبط با فرزند واجد شرایط'
            : key === 'marriageAllowance'
              ? 'مبلغ مرتبط با کارمند متأهل'
              : 'مزد پایه سنوات و سابقه کار';
    const eligibilityWarning =
      key === 'childAllowance' && !isEligibleForChildAllowance(employee)
        ? 'این کارمند شرایط دریافت حق اولاد را ندارد'
        : key === 'marriageAllowance' && !isEligibleForMarriageAllowance(employee, supplemental)
          ? 'این کارمند شرایط دریافت حق تأهل را ندارد'
          : key === 'seniorityAllowance' && !isEligibleForSeniorityAllowance(employee, supplemental)
            ? 'این کارمند شرایط دریافت مزد پایه سنوات را ندارد'
            : '';
    const legalAmount = baseSettings.benefits[key];
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
    const legalBadge =
      item.enabled && item.amount < legalAmount
        ? fieldBadge('کمتر از حداقل قانون کار', 'warning')
        : item.enabled && item.amount === legalAmount
          ? fieldBadge('برابر با مبنای قانون کار', 'success')
          : null;
    const currentRules = item.calculationRules ?? DEFAULT_FIXED_BENEFIT_RULES;
    const templateRules = currentDraft.templateSnapshot?.benefitRules?.[key] ?? baseSettings.benefitRules?.[key] ?? DEFAULT_FIXED_BENEFIT_RULES;
    return (
      <article className="business-payroll-transfer-rule" key={key}>
        <div className="business-payroll-transfer-rule-head">
          <div>
            <strong>{label}</strong>
            <small>{description}</small>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {currentDraft.templateSnapshot ? compareBadge : null}
              {legalBadge}
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
                  <div>حقوق پایه روزانه: <strong>{money(currentDraft.financial.dailyBaseSalary)}</strong></div>
                  <div>دقایق موظفی روزانه: <strong>{formatFaNumber(currentDraft.financial.dailyRequiredMinutes)} دقیقه</strong></div>
                  <div>بیمه/مالیات: <strong>{currentDraft.insuranceTax.insuranceEnabled ? 'بیمه فعال' : 'بیمه غیرفعال'} / {currentDraft.insuranceTax.taxEnabled ? 'مالیات فعال' : 'مالیات غیرفعال'}</strong></div>
                  <div>مزایای فعال: <strong>{EMPLOYEE_BENEFIT_KEYS.filter((key) => currentDraft.benefits[key].enabled).length}</strong></div>
                </div>
              </EmployeeSummaryCard>
            ) : (
              <EmployeeSummaryCard title="اطلاعات مالی تردد">
                <div style={{ display: 'grid', gap: 8, fontSize: 12, lineHeight: 1.9 }}>
                  <div>دقایق موظفی روزانه: <strong>{formatFaNumber(currentDraft.financial.dailyRequiredMinutes)} دقیقه</strong></div>
                  <div>تقسیم هفتگی: <strong>{formatFaNumber(currentDraft.financial.dailyRequiredMinutes * 6)} دقیقه در هفته</strong></div>
                </div>
              </EmployeeSummaryCard>
            )}

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
                    <ContractFirstPartyCard profile={resolvedBusinessProfile} />

                    <EmployeeSupplementalProfileView
                      employeeName={`${employee.firstName} ${employee.lastName}`.trim()}
                      employee={{
                        nationalId: employee.nationalId,
                        maritalStatus: employee.maritalStatus,
                        childrenCount: employee.childrenCount,
                      }}
                      supplemental={supplemental}
                      onEdit={() => setSupplementalOpen(true)}
                      showFooterLink
                      profileHref={`/employees/${employee.id}/profile`}
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
                        <div className="contract-timing-registration-line">
                          <div
                            className={`contract-timing-registration-field${editingRegistration ? ' is-editing' : ''}`}
                            onClick={() => {
                              if (!editingRegistration) setEditingRegistration(true);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                if (!editingRegistration) setEditingRegistration(true);
                              }
                            }}
                            role={editingRegistration ? undefined : 'button'}
                            tabIndex={editingRegistration ? undefined : 0}
                          >
                            <span className="contract-timing-registration-label">شماره ثبت قرارداد</span>
                            {editingRegistration ? (
                              <input
                                className="contract-timing-registration-value"
                                value={currentDraft.timing.registrationNumber}
                                autoFocus
                                dir="ltr"
                                onClick={(event) => event.stopPropagation()}
                                onChange={(event) =>
                                  updateDraft((draft) => ({
                                    ...draft,
                                    contractNumber: event.target.value,
                                    timing: { ...draft.timing, registrationNumber: event.target.value },
                                  }))
                                }
                              />
                            ) : (
                              <strong className="contract-timing-registration-value" dir="ltr">
                                {formatRegistrationNumberDisplay(currentDraft.timing.registrationNumber)}
                              </strong>
                            )}
                          </div>
                          <div className="contract-timing-registration-actions">
                            <button
                              type="button"
                              className="contract-timing-registration-action"
                              aria-label="تولید مجدد شماره ثبت"
                              onClick={regenerateRegistrationNumber}
                            >
                              <RotateCcw className="h-4 w-4" aria-hidden />
                            </button>
                            <button
                              type="button"
                              className="contract-timing-registration-action"
                              aria-label={editingRegistration ? 'قفل شماره ثبت' : 'ویرایش شماره ثبت'}
                              onClick={() => setEditingRegistration((value) => !value)}
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </button>
                          </div>
                        </div>
                        {errors.timing_registrationNumber ? (
                          <em className="contract-timing-field-error">{errors.timing_registrationNumber}</em>
                        ) : null}
                        <p className="contract-timing-registration-note">
                          این شماره ثبت به‌طور خودکار توسط سیستم ایجاد شده است. در صورت نیاز به تغییر، روی فیلد کلیک کنید.
                        </p>
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
                    <div className="business-payroll-subcard" style={{ marginTop: 10 }}>
                      <div className="business-draft-section-title">
                        <h3>نوع قرارداد</h3>
                        <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">آیین‌نامه داخلی</span>
                      </div>
                      <p className="business-payroll-transfer-rule-muted">نوع همکاری و شرایط کلی قرارداد را مشخص کنید.</p>
                      <div className="business-draft-option-grid">
                        {CONTRACT_TYPE_GROUPS.map((group) => (
                          <button
                            key={group.title}
                            type="button"
                            className={currentDraft.subject.contractType === group.title ? 'is-selected' : ''}
                            onClick={() =>
                              updateDraft((draft) => ({
                                ...draft,
                                subject: { ...draft.subject, contractType: group.title, contractSubType: group.options[0] ?? '' },
                              }))
                            }
                          >
                            {group.title}
                          </button>
                        ))}
                      </div>
                      {currentDraft.subject.contractType ? (
                        <div style={{ marginTop: 12 }}>
                          <div className="business-draft-option-grid">
                            {(CONTRACT_TYPE_GROUPS.find((group) => group.title === currentDraft.subject.contractType)?.options ?? []).map((option) => (
                              <button
                                key={option}
                                type="button"
                                className={currentDraft.subject.contractSubType === option ? 'is-selected' : ''}
                                onClick={() => {
                                  updateDraft((draft) => ({ ...draft, subject: { ...draft.subject, contractSubType: option } }));
                                }}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {currentDraft.templateSnapshot && currentDraft.subject.contractType && currentDraft.subject.contractType !== currentDraft.templateSnapshot.classification.contractType ? (
                        <div style={{ marginTop: 10 }}>{differenceBadge('متفاوت با قالب', `انتخاب این بخش در قالب انتخاب‌شده «${currentDraft.templateSnapshot.classification.contractType || 'ثبت نشده'}» بوده است.`)}</div>
                      ) : null}
                    </div>

                    <div className="business-payroll-subcard" style={{ marginTop: 10 }}>
                      <div className="business-draft-section-title">
                        <h3>نوع شغل و مسئولیت‌ها</h3>
                        <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">آیین‌نامه داخلی</span>
                      </div>
                      <p className="business-payroll-transfer-rule-muted">حوزه فعالیت و مسئولیت اصلی کارمند را مشخص کنید.</p>
                      <div className="business-draft-option-grid">
                        {JOB_GROUPS.map((group) => (
                          <button
                            key={group.title}
                            type="button"
                            className={currentDraft.subject.jobGroup === group.title ? 'is-selected' : ''}
                            onClick={() => updateDraft((draft) => ({ ...draft, subject: { ...draft.subject, jobGroup: group.title, responsibility: group.options[0] ?? '' } }))}
                          >
                            {group.title}
                          </button>
                        ))}
                      </div>
                      {currentDraft.subject.jobGroup ? (
                        <div style={{ marginTop: 12 }}>
                          <div className="business-draft-option-grid">
                            {(JOB_GROUPS.find((group) => group.title === currentDraft.subject.jobGroup)?.options ?? []).map((option) => (
                              <button
                                key={option}
                                type="button"
                                className={currentDraft.subject.responsibility === option ? 'is-selected' : ''}
                                onClick={() => updateDraft((draft) => ({ ...draft, subject: { ...draft.subject, responsibility: option } }))}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="business-payroll-subcard" style={{ marginTop: 10 }}>
                      <div className="business-draft-section-title">
                        <h3>محل انجام کار</h3>
                        <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">آیین‌نامه داخلی</span>
                      </div>
                      <p className="business-payroll-transfer-rule-muted">محل یا شیوه انجام کار را برای متن قرارداد مشخص کنید.</p>
                      <div className="business-draft-option-grid">
                        {LOCATION_MAIN_GROUPS.map((group) => (
                          <button
                            key={group}
                            type="button"
                            className={currentDraft.subject.locationGroup === group ? 'is-selected' : ''}
                            onClick={() => updateDraft((draft) => ({ ...draft, subject: { ...draft.subject, locationGroup: group, locationType: '' } }))}
                          >
                            {group}
                          </button>
                        ))}
                      </div>
                      {currentDraft.subject.locationGroup === 'دسته‌بندی بر اساس نوع حضور فیزیکی' ? (
                        <div style={{ marginTop: 12 }}>
                          <div className="business-draft-option-grid">
                            {PHYSICAL_LOCATION_OPTIONS.map((option) => (
                              <button
                                key={option.label}
                                type="button"
                                className={currentDraft.subject.locationType === option.label ? 'is-selected' : ''}
                                onClick={() => updateDraft((draft) => ({ ...draft, subject: { ...draft.subject, locationType: option.label } }))}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                          {currentDraft.subject.locationType ? (
                            <div className="business-payroll-transfer-rule-muted" style={{ marginTop: 10 }}>
                              {PHYSICAL_LOCATION_OPTIONS.find((item) => item.label === currentDraft.subject.locationType)?.helper}
                            </div>
                          ) : null}
                        </div>
                      ) : currentDraft.subject.locationGroup === 'دسته‌بندی بر اساس نوع محیط کاری' ? (
                        <div style={{ marginTop: 12 }}>
                          <div className="business-draft-option-grid">
                            {ENVIRONMENT_LOCATION_OPTIONS.map((option) => (
                              <button key={option} type="button" className={currentDraft.subject.locationType === option ? 'is-selected' : ''} onClick={() => updateDraft((draft) => ({ ...draft, subject: { ...draft.subject, locationType: option } }))}>
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : currentDraft.subject.locationGroup === 'دسته‌بندی بر اساس ارتباط با مشتری و ذینفعان' ? (
                        <div style={{ marginTop: 12 }}>
                          <div className="business-draft-option-grid">
                            {RELATION_LOCATION_OPTIONS.map((option) => (
                              <button key={option} type="button" className={currentDraft.subject.locationType === option ? 'is-selected' : ''} onClick={() => updateDraft((draft) => ({ ...draft, subject: { ...draft.subject, locationType: option } }))}>
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : currentDraft.subject.locationGroup === 'دسته‌بندی بر اساس پویایی و جابجایی شغلی' ? (
                        <div style={{ marginTop: 12 }}>
                          <div className="business-draft-option-grid">
                            {DYNAMIC_LOCATION_OPTIONS.map((option) => (
                              <button key={option} type="button" className={currentDraft.subject.locationType === option ? 'is-selected' : ''} onClick={() => updateDraft((draft) => ({ ...draft, subject: { ...draft.subject, locationType: option } }))}>
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {currentDraft.templateSnapshot && currentDraft.subject.locationGroup && currentDraft.subject.locationGroup !== currentDraft.templateSnapshot.classification.locationGroup ? (
                        <div style={{ marginTop: 10 }}>{differenceBadge('متفاوت با قالب', `انتخاب این بخش در قالب انتخاب‌شده «${currentDraft.templateSnapshot.classification.locationGroup || 'ثبت نشده'}» بوده است.`)}</div>
                      ) : null}
                    </div>
                    {renderStepFooter('subject')}
                  </StepShell>
                ) : step.id === 'financial' ? (
                  <StepShell
                    title={currentDraft.usageType === 'attendance_only' ? 'اطلاعات مالی تردد' : 'اطلاعات مالی قرارداد'}
                    tag="حقوق و دستمزد"
                    description={currentDraft.usageType === 'attendance_only' ? 'برای قراردادهای تردد، دقایق موظفی روزانه را مشخص کنید.' : 'حقوق پایه روزانه و دقایق موظفی روزانه را مشخص کنید.'}
                    icon={<Wallet className="h-4 w-4" />}
                  >
                    <div className="business-payroll-subcard" style={{ marginTop: 10 }}>
                      <div className="business-draft-section-title">
                        <h3>دقایق موظفی روزانه</h3>
                        <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">آیین‌نامه حقوقی</span>
                      </div>
                      <label className="business-payroll-field">
                        <span className="business-payroll-field-label">دقایق موظفی روزانه</span>
                        <span className="business-payroll-input">
                            <input
                              value={moneyInput(currentDraft.financial.dailyRequiredMinutes)}
                              onChange={(event) => {
                                updateDraft((draft) => ({ ...draft, financial: { ...draft.financial, dailyRequiredMinutes: parseNumber(event.target.value) } }));
                              }}
                            />
                          <b>دقیقه</b>
                        </span>
                        {errors.financial_dailyRequiredMinutes ? <em>{errors.financial_dailyRequiredMinutes}</em> : null}
                      </label>
                      <div className="business-payroll-calculation-grid" style={{ marginTop: 12 }}>
                        <div>
                          <span>به ازای یک روز</span>
                          <strong>{formatFaNumber(currentDraft.financial.dailyRequiredMinutes)} دقیقه</strong>
                        </div>
                        <div>
                          <span>به ازای یک هفته کاری</span>
                          <strong>{formatFaNumber(currentDraft.financial.dailyRequiredMinutes * 6)} دقیقه</strong>
                        </div>
                        <div>
                          <span>به ازای هر ماه ۳۰ روزه</span>
                          <strong>{formatFaNumber(currentDraft.financial.dailyRequiredMinutes * 30)} دقیقه</strong>
                        </div>
                        <div>
                          <span>به ازای ۱۲ ماه کاری</span>
                          <strong>{formatFaNumber(currentDraft.financial.dailyRequiredMinutes * 360)} دقیقه</strong>
                        </div>
                      </div>
                      {currentDraft.templateSnapshot ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                          {currentDraft.financial.dailyRequiredMinutes === currentDraft.templateSnapshot.financial.dailyRequiredMinutes ? fieldBadge('همسان با قالب', 'success') : differenceBadge(
                            currentDraft.financial.dailyRequiredMinutes < currentDraft.templateSnapshot.financial.dailyRequiredMinutes
                              ? `${formatFaNumber(currentDraft.templateSnapshot.financial.dailyRequiredMinutes - currentDraft.financial.dailyRequiredMinutes)} دقیقه کمتر از قالب`
                              : `${formatFaNumber(currentDraft.financial.dailyRequiredMinutes - currentDraft.templateSnapshot.financial.dailyRequiredMinutes)} دقیقه بیشتر از قالب`,
                            `دقایق موظفی روزانه در قالب انتخاب‌شده ${formatFaNumber(currentDraft.templateSnapshot.financial.dailyRequiredMinutes)} دقیقه است.`,
                          )}
                        </div>
                      ) : null}
                    </div>
                    {currentDraft.usageType === 'payroll_attendance' ? (
                      <div className="business-payroll-subcard" style={{ marginTop: 10 }}>
                        <div className="business-draft-section-title">
                          <h3>حقوق پایه به ازای روز</h3>
                          <span className="contract-draft-reg-badge contract-draft-reg-badge--internal">آیین‌نامه حقوقی</span>
                        </div>
                        <label className="business-payroll-field">
                          <span className="business-payroll-field-label">حقوق پایه به ازای روز</span>
                          <span className="business-payroll-input">
                            <input
                              value={moneyInput(currentDraft.financial.dailyBaseSalary)}
                              onChange={(event) => {
                                updateDraft((draft) => ({ ...draft, financial: { ...draft.financial, dailyBaseSalary: parseNumber(event.target.value) } }));
                              }}
                            />
                            <b>ریال</b>
                          </span>
                          {errors.financial_dailyBaseSalary ? <em>{errors.financial_dailyBaseSalary}</em> : null}
                        </label>
                        {currentDraft.templateSnapshot ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                            {currentDraft.financial.dailyBaseSalary === currentDraft.templateSnapshot.financial.dailyBaseSalary ? fieldBadge('همسان با قالب', 'success') : differenceBadge(
                              currentDraft.financial.dailyBaseSalary < currentDraft.templateSnapshot.financial.dailyBaseSalary
                                ? `${money(currentDraft.templateSnapshot.financial.dailyBaseSalary - currentDraft.financial.dailyBaseSalary)} کمتر از قالب`
                                : `${money(currentDraft.financial.dailyBaseSalary - currentDraft.templateSnapshot.financial.dailyBaseSalary)} بیشتر از قالب`,
                              `مقدار این فیلد در قالب انتخاب‌شده ${money(currentDraft.templateSnapshot.financial.dailyBaseSalary)} است.`,
                            )}
                          </div>
                        ) : null}
                        {currentDraft.financial.dailyBaseSalary < baseSettings.financial.dailyBaseSalary ? (
                          <div style={{ marginTop: 12 }}>{fieldBadge('کمتر از حداقل قانون کار', 'warning')}</div>
                        ) : currentDraft.financial.dailyBaseSalary === baseSettings.financial.dailyBaseSalary ? (
                          <div style={{ marginTop: 12 }}>{fieldBadge('برابر با مبنای قانون کار', 'success')}</div>
                        ) : null}
                      </div>
                    ) : null}
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
                          <div className="business-payroll-subcard" style={{ marginTop: 10 }}>
                            <div className="business-payroll-subcard-head">
                              <h3>جدول مالیات قرارداد</h3>
                              <button type="button" className="business-payroll-outline-button" onClick={() => setTaxBracketEditor({ open: true, bracket: null })}>
                                <Plus className="h-4 w-4" /> افزودن بازه مالیاتی
                              </button>
                            </div>
                            <div style={{ display: 'grid', gap: 8 }}>
                              {currentDraft.insuranceTax.taxBrackets.length ? (
                                <div className="business-payroll-table">
                                  {currentDraft.insuranceTax.taxBrackets.map((bracket) => (
                                    <div key={bracket.id} className="business-payroll-table-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.7fr auto', gap: 8, alignItems: 'center' }}>
                                      <span>{formatFaNumber(bracket.from)}</span>
                                      <span>{formatFaNumber(bracket.to)}</span>
                                      <span>{formatFaNumber(bracket.percent)}%</span>
                                      <span style={{ display: 'flex', gap: 6, justifyContent: 'flex-start' }}>
                                        <button type="button" className="draft-template-flow-action is-secondary" onClick={() => setTaxBracketEditor({ open: true, bracket })}>
                                          <Pencil className="h-4 w-4" /> ویرایش
                                        </button>
                                        <button type="button" className="draft-template-flow-action is-secondary" onClick={() => updateDraft((draft) => ({ ...draft, insuranceTax: { ...draft.insuranceTax, taxBrackets: draft.insuranceTax.taxBrackets.filter((item) => item.id !== bracket.id) } }))}>
                                          <Trash2 className="h-4 w-4" /> حذف
                                        </button>
                                      </span>
                                      <span style={{ gridColumn: '1 / -1' }}>
                                        {currentDraft.templateSnapshot ? getTemplateBracketState(currentDraft, bracket) : null}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="business-payroll-transfer-rule-muted">هنوز بازه مالیاتی ثبت نشده است.</div>
                              )}
                              {errors.taxBrackets ? <p className="business-payroll-warning"><CircleAlert className="h-4 w-4" aria-hidden /> {errors.taxBrackets}</p> : null}
                              {currentDraft.templateSnapshot ? (
                                <div style={{ display: 'grid', gap: 8 }}>
                                  {currentDraft.templateSnapshot.insuranceTax.taxBrackets.filter((baseBracket) => !currentDraft.insuranceTax.taxBrackets.some((item) => item.id === baseBracket.id)).length ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                      {fieldBadge('حذف شده نسبت به قالب', 'warning')}
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          </div>
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
      <TaxBracketDialog
        open={taxBracketEditor.open}
        bracket={taxBracketEditor.bracket}
        existing={currentDraft.insuranceTax.taxBrackets}
        onCancel={() => setTaxBracketEditor({ open: false, bracket: null })}
        onSubmit={(bracket) => {
          updateDraft((draft) => ({
            ...draft,
            insuranceTax: {
              ...draft.insuranceTax,
              taxBrackets: draft.insuranceTax.taxBrackets.some((item) => item.id === bracket.id)
                ? draft.insuranceTax.taxBrackets.map((item) => (item.id === bracket.id ? bracket : item))
                : [...draft.insuranceTax.taxBrackets, bracket].sort((left, right) => left.from - right.from),
            },
          }));
          setTaxBracketEditor({ open: false, bracket: null });
        }}
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
  if (step === 'insuranceTax') {
    const validation = validateTaxBrackets(draft.insuranceTax.taxBrackets);
    if (validation) errors.taxBrackets = validation;
  }
  return errors;
}
