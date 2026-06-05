import type { LucideIcon } from 'lucide-react';
import { CalendarDays, MapPin, ShieldCheck, Users, Workflow } from 'lucide-react';

export type QuickSetupStepKey = 'location' | 'calendar' | 'policy' | 'employee' | 'work-group';

export type QuickSetupStep = {
  key: QuickSetupStepKey;
  title: string;
  subtitle: string;
  done: boolean;
  href: string;
  manageHref: string;
  count: number;
};

export type LocationSummaryItem = {
  id: string;
  title: string;
  address: string;
  description: string | null;
  radius: number;
  allowedRadiusMeters: number;
  latitude: string | null;
  longitude: string | null;
  isPrimaryOnboarding: boolean;
};

export type CalendarSummary = {
  id: string;
  title: string;
  description: string;
  yearLabel: string;
  year: string;
  shiftTitle: string;
  shiftTypeLabel: string;
  holidayCount: number;
};

export type CompletedCalendarItem = {
  id: string;
  title: string;
  yearLabel: string;
  description?: string | null;
  shiftTitle?: string;
  shiftTypeLabel?: string;
  holidayCount?: number;
};

export type DefaultCalendarTemplate = CompletedCalendarItem & {
  startDate: string;
  endDate: string;
  weekends: string[];
  singleHolidays: Array<{ id: string; title: string; date: string }>;
  shiftConfig: Record<string, unknown>;
  totalShiftDays: number;
  totalEventDays: number;
};

export type QuickPolicySummary = {
  id: string;
  title: string;
  description: string;
  calendarId: string;
  calendarTitle: string;
  isDefault?: boolean;
  templateId: string;
  templateTitle: string;
  selectedCalendarId?: string;
  selectedPolicyTemplateId?: string;
  generatedPolicyTitle?: string;
  generatedPolicyDescription?: string;
  year: string;
};

export type QuickEmployeeStatus =
  | 'registered'
  | 'invite_sent'
  | 'pending_completion'
  | 'completed'
  | 'active'
  | 'failed_send'
  | 'error';

export type QuickEmployeeAddMethod =
  | 'single'
  | 'excel'
  | 'invitation_link'
  | 'email_invite'
  | 'sms_invite';

export type QuickEmployeeSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string | null;
  status: QuickEmployeeStatus;
  addMethod: QuickEmployeeAddMethod;
  invitationStatus?: 'sent' | 'failed' | null;
  lastActionAt: string | null;
  avatarUrl?: string;
};

export type QuickWorkGroupSummary = {
  id: string;
  title: string;
};

export type QuickWorkGroupDraft = {
  title: string;
  logoUrl: string;
  selectedLocationId: string;
  selectedEmployees: Array<{ id: string; name: string; selectedRole: 'employee' | 'lead' | 'manager' }>;
  employeeSearch: string;
  selectedPolicyIds: string[];
};

export type QuickEmployeeImportJobType = 'excel_add' | 'excel_add_and_invite';

export type QuickEmployeeImportJobStatus = 'queued' | 'processing' | 'completed' | 'completed_with_errors' | 'failed';

export type QuickEmployeeImportJobRowStatus =
  | 'created'
  | 'existing_employee'
  | 'duplicate_in_file'
  | 'invalid'
  | 'failed'
  | 'mock_invited'
  | 'mock_invite_failed';

export type QuickEmployeeImportJobMockInvitationStatus = 'none' | 'mock_sent' | 'mock_failed' | 'not_required';

export type QuickEmployeeImportJobInvitationChannel = 'sms' | 'email';

export type QuickEmployeeImportJobSummary = {
  id: string;
  type: QuickEmployeeImportJobType;
  fileName: string;
  status: QuickEmployeeImportJobStatus;
  totalCount: number;
  processedCount: number;
  createdCount: number;
  existingCount: number;
  duplicateCount: number;
  invalidCount: number;
  failedCount: number;
  mockInvitedCount: number;
  createdAt: string;
  updatedAt: string;
};

export type QuickEmployeeImportJobRowSummary = {
  id: string;
  rowNumber: number;
  firstName: string;
  lastName: string;
  email: string | null;
  mobile: string | null;
  employeeId: string | null;
  status: QuickEmployeeImportJobRowStatus;
  message: string | null;
  mockInvitationStatus: QuickEmployeeImportJobMockInvitationStatus;
  invitationChannel: QuickEmployeeImportJobInvitationChannel | null;
  processedAt: string | null;
};

export type QuickEmployeeImportJobDetails = QuickEmployeeImportJobSummary & {
  rows: QuickEmployeeImportJobRowSummary[];
};

export const STEP_META: Record<
  QuickSetupStepKey,
  { icon: LucideIcon; details: string[] }
> = {
  location: {
    icon: MapPin,
    details: ['عنوان محل کار را ثبت کنید', 'شعاع مجاز حضور را مشخص کنید', 'بعد از ثبت، موقعیت در کل سیستم قابل استفاده می‌شود'],
  },
  calendar: {
    icon: CalendarDays,
    details: ['تقویم پایه سال کاری را تعیین کنید', 'تعطیلات سازمانی را وارد کنید', 'شیفت پیش‌فرض این تقویم را نهایی کنید'],
  },
  policy: {
    icon: ShieldCheck,
    details: ['سیاست حضور و غیاب را تعریف کنید', 'تقویم مرتبط را به سیاست وصل کنید', 'پارامترهای تاخیر، اضافه‌کاری و مرخصی را کامل کنید'],
  },
  employee: {
    icon: Users,
    details: ['اولین کارکنان را وارد کنید', 'اطلاعات پرسنلی و واحدها را ثبت کنید', 'آماده تخصیص به گروه‌های کاری شوید'],
  },
  'work-group': {
    icon: Workflow,
    details: ['گروه اجرایی را بسازید', 'افراد، محل کار و سیاست را متصل کنید', 'فاز راه‌اندازی سریع را نهایی کنید'],
  },
};
