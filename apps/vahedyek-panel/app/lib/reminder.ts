export const REMINDER_TARGET_MOBILE = '09177012406';

export type ReminderSettings = {
  includeLastVisitedPage: boolean;
  includeRecentlyDeveloped: boolean;
  includeNeedsTesting: boolean;
  includeCompletedDiscussions: boolean;
  notificationEmail: string | null;
};

export type ReminderRecipient = {
  userId: string;
  fullName: string;
  email: string | null;
  mobile: string | null;
};

export type ReminderCustomNotice = {
  id: string;
  title: string;
  message: string;
  actorName: string;
  createdAt: string;
  emailStatus: 'sent' | 'missing' | 'config_missing' | 'failed';
  pushStatus: 'queued';
  targetEmail: string | null;
};

export type ReminderPresentation = 'tooltip' | 'tour';

export type ReminderAuditItem = {
  label: string;
  href: string | null;
};

export type ReminderDigest = {
  enabled: boolean;
  title: string;
  lastVisitedPage: string | null;
  lastVisitedPageTitle: string | null;
  lastVisitedPageReviewed: boolean;
  didWorkOnPage: boolean;
  activitySummary: string;
  auditItems: ReminderAuditItem[];
  threadItems: string[];
  customNotice: ReminderCustomNotice | null;
  generatedAt: string;
  presentation: ReminderPresentation;
};

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  includeLastVisitedPage: true,
  includeRecentlyDeveloped: true,
  includeNeedsTesting: true,
  includeCompletedDiscussions: true,
  notificationEmail: null,
};

export function normalizeReminderSettings(input: unknown): ReminderSettings {
  const source = input && typeof input === 'object' ? (input as Partial<Record<keyof ReminderSettings, unknown>>) : {};

  return {
    includeLastVisitedPage:
      typeof source.includeLastVisitedPage === 'boolean'
        ? source.includeLastVisitedPage
        : DEFAULT_REMINDER_SETTINGS.includeLastVisitedPage,
    includeRecentlyDeveloped:
      typeof source.includeRecentlyDeveloped === 'boolean'
        ? source.includeRecentlyDeveloped
        : DEFAULT_REMINDER_SETTINGS.includeRecentlyDeveloped,
    includeNeedsTesting:
      typeof source.includeNeedsTesting === 'boolean'
        ? source.includeNeedsTesting
        : DEFAULT_REMINDER_SETTINGS.includeNeedsTesting,
    includeCompletedDiscussions:
      typeof source.includeCompletedDiscussions === 'boolean'
        ? source.includeCompletedDiscussions
        : DEFAULT_REMINDER_SETTINGS.includeCompletedDiscussions,
    notificationEmail:
      typeof source.notificationEmail === 'string'
        ? normalizeReminderEmail(source.notificationEmail)
        : DEFAULT_REMINDER_SETTINGS.notificationEmail,
  };
}

export function normalizeReminderEmail(input: unknown) {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;
  return trimmed.length > 190 ? trimmed.slice(0, 190) : trimmed;
}

export function normalizePagePathForReminder(input: unknown) {
  if (typeof input !== 'string') return '/';
  const trimmed = input.trim();
  if (!trimmed || !trimmed.startsWith('/')) return '/';
  return trimmed.length > 420 ? trimmed.slice(0, 420) : trimmed;
}

export function normalizePageTitleForReminder(input: unknown) {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) return null;
  return trimmed.length > 120 ? trimmed.slice(0, 120) : trimmed;
}

export function normalizeActionSummaryForReminder(input: unknown) {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim().replace(/\s+/g, ' ');
  if (!trimmed) return null;
  return trimmed.length > 180 ? trimmed.slice(0, 180) : trimmed;
}

export function isReminderTrackablePagePath(input: unknown) {
  const path = normalizePagePathForReminder(input);
  if (path === '/') return true;
  return !(
    path.startsWith('/settings') ||
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/select-tenant')
  );
}

export function isReminderTargetUser(user: { mobile?: string | null } | null | undefined) {
  return normalizeMobileForReminder(user?.mobile) === normalizeMobileForReminder(REMINDER_TARGET_MOBILE);
}

export function normalizeMobileForReminder(input: unknown) {
  if (typeof input !== 'string') return '';
  const digits = input
    .trim()
    .replace(/[۰-۹]/g, (char) => String(char.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (char) => String(char.charCodeAt(0) - 1632))
    .replace(/[^\d]/g, '');

  if (digits.startsWith('0098')) return `0${digits.slice(4)}`;
  if (digits.startsWith('98')) return `0${digits.slice(2)}`;
  if (digits.startsWith('9') && digits.length === 10) return `0${digits}`;
  return digits;
}

export function chooseReminderPresentation(input: {
  previousActivityExists: boolean;
  hadPageReload: boolean;
  lastInputAt: Date | null;
  now?: Date;
}): ReminderPresentation {
  const now = input.now ?? new Date();
  const lastInputAgeMs = input.lastInputAt ? now.getTime() - input.lastInputAt.getTime() : Number.POSITIVE_INFINITY;
  const staleForOneDay = lastInputAgeMs >= 24 * 60 * 60 * 1000;

  if (!input.previousActivityExists || input.hadPageReload || staleForOneDay) {
    return 'tour';
  }

  return 'tooltip';
}

export function formatReminderDateTime(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
